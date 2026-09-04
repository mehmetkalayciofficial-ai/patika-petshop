-- =====================================================================
--  PATİKA PETSHOP — ilk şema
--  Tablolar, RLS, RPC, trigger'lar, storage
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
--  Yardımcılar
-- ---------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------
--  profiles
-- ---------------------------------------------------------------------

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  email       text,
  role        text not null default 'customer' check (role in ('customer','admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
--  addresses
-- ---------------------------------------------------------------------

create table if not exists public.addresses (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null default 'Ev',
  city          text not null,
  district      text not null,
  neighborhood  text,
  full_address  text not null,
  directions    text,
  is_default    boolean not null default false,
  created_at    timestamptz not null default now()
);
create index if not exists addresses_user_idx on public.addresses(user_id);

-- tek varsayılan adres garantisi
create or replace function public.enforce_single_default_address()
returns trigger language plpgsql as $$
begin
  if new.is_default then
    update public.addresses set is_default = false
      where user_id = new.user_id and id <> new.id and is_default;
  end if;
  return new;
end $$;

drop trigger if exists addresses_single_default on public.addresses;
create trigger addresses_single_default
  after insert or update of is_default on public.addresses
  for each row when (new.is_default) execute function public.enforce_single_default_address();

-- ---------------------------------------------------------------------
--  categories / products
-- ---------------------------------------------------------------------

create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  icon        text,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.products (
  id              uuid primary key default gen_random_uuid(),
  category_id     uuid not null references public.categories(id) on delete restrict,
  name            text not null,
  description     text,
  price           numeric(10,2) not null check (price >= 0),
  discount_price  numeric(10,2) check (discount_price is null or discount_price >= 0),
  stock           int not null default 0 check (stock >= 0),
  unit_label      text not null default 'adet',
  image_url       text,
  images          jsonb not null default '[]'::jsonb,
  is_active       boolean not null default true,
  sort_order      int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint discount_lt_price check (discount_price is null or discount_price < price)
);
create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_active_idx on public.products(is_active);

-- ---------------------------------------------------------------------
--  orders / order_items
-- ---------------------------------------------------------------------

create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  order_no          serial unique,
  user_id           uuid references auth.users(id) on delete set null,
  customer_name     text not null,
  phone             text not null,
  address_snapshot  jsonb not null,
  payment_method    text not null check (payment_method in ('cash','card_on_delivery')),
  note              text,
  status            text not null default 'new'
                      check (status in ('new','preparing','on_the_way','delivered','cancelled')),
  cancel_reason     text,
  subtotal          numeric(10,2) not null default 0,
  total             numeric(10,2) not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders(user_id);
create index if not exists orders_created_idx on public.orders(created_at desc);

create table if not exists public.order_items (
  id                   uuid primary key default gen_random_uuid(),
  order_id             uuid not null references public.orders(id) on delete cascade,
  product_id           uuid references public.products(id) on delete set null,
  name_snapshot        text not null,
  image_snapshot       text,
  unit_price_snapshot  numeric(10,2) not null,
  unit_label_snapshot  text,
  qty                  int not null check (qty > 0),
  line_total           numeric(10,2) not null
);
create index if not exists order_items_order_idx on public.order_items(order_id);

-- ---------------------------------------------------------------------
--  admin_devices / settings
-- ---------------------------------------------------------------------

create table if not exists public.admin_devices (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  fcm_token     text not null unique,
  platform      text not null default 'android',
  created_at    timestamptz not null default now(),
  last_seen_at  timestamptz not null default now()
);

create table if not exists public.settings (
  id            int primary key default 1 check (id = 1),
  store_phone   text not null default '',
  store_address text not null default '',
  whatsapp      text not null default '',
  announcement  text,
  is_open       boolean not null default true,
  min_order     numeric(10,2) not null default 0,
  updated_at    timestamptz not null default now()
);
insert into public.settings (id) values (1) on conflict (id) do nothing;

-- updated_at trigger'ları
do $$
declare t text;
begin
  foreach t in array array['profiles','categories','products','orders','settings'] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I
                    for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
--  RPC — place_order (atomik, fiyat sunucudan)
-- ---------------------------------------------------------------------

create or replace function public.place_order(
  p_items          jsonb,          -- [{ product_id, qty }]
  p_address_id     uuid,
  p_payment_method text,
  p_note           text default null,
  p_phone          text default null
)
returns table (order_id uuid, order_no int)
language plpgsql security definer set search_path = public as $$
declare
  v_uid       uuid := auth.uid();
  v_profile   public.profiles%rowtype;
  v_addr      public.addresses%rowtype;
  v_open      boolean;
  v_item      jsonb;
  v_pid       uuid;
  v_qty       int;
  v_prod      public.products%rowtype;
  v_unit      numeric(10,2);
  v_subtotal  numeric(10,2) := 0;
  v_order_id  uuid;
  v_order_no  int;
  v_missing   text[] := '{}';
begin
  if v_uid is null then
    raise exception 'Giriş yapmalısın.' using errcode = '28000';
  end if;

  select is_open into v_open from public.settings where id = 1;
  if not coalesce(v_open, true) then
    raise exception 'Şu an sipariş alamıyoruz.' using errcode = 'P0001';
  end if;

  if p_payment_method not in ('cash','card_on_delivery') then
    raise exception 'Geçersiz ödeme yöntemi.' using errcode = 'P0001';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Sepetin boş.' using errcode = 'P0001';
  end if;

  select * into v_profile from public.profiles where id = v_uid;
  select * into v_addr from public.addresses where id = p_address_id and user_id = v_uid;
  if v_addr.id is null then
    raise exception 'Teslimat adresi bulunamadı.' using errcode = 'P0001';
  end if;

  -- 1) stok/aktiflik kontrolü (kilitli)
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_pid := (v_item->>'product_id')::uuid;
    v_qty := greatest(1, (v_item->>'qty')::int);

    select * into v_prod from public.products where id = v_pid for update;

    if v_prod.id is null or not v_prod.is_active then
      v_missing := v_missing || coalesce(v_prod.name, 'Bir ürün') || ' artık satışta değil';
    elsif v_prod.stock < v_qty then
      v_missing := v_missing ||
        (v_prod.name || ' — stokta ' || v_prod.stock::text || ' ' || v_prod.unit_label || ' kaldı');
    end if;
  end loop;

  if array_length(v_missing, 1) > 0 then
    raise exception '%', array_to_string(v_missing, ' · ') using errcode = 'P0001';
  end if;

  -- 2) sipariş kaydı
  insert into public.orders (user_id, customer_name, phone, address_snapshot, payment_method, note, subtotal, total)
  values (
    v_uid,
    coalesce(nullif(v_profile.full_name, ''), 'Müşteri'),
    coalesce(nullif(p_phone, ''), v_profile.phone, ''),
    jsonb_build_object(
      'title', v_addr.title, 'city', v_addr.city, 'district', v_addr.district,
      'neighborhood', v_addr.neighborhood, 'full_address', v_addr.full_address,
      'directions', v_addr.directions
    ),
    p_payment_method, nullif(p_note, ''), 0, 0
  )
  returning id, orders.order_no into v_order_id, v_order_no;

  -- 3) satırlar + stok düşümü
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_pid := (v_item->>'product_id')::uuid;
    v_qty := greatest(1, (v_item->>'qty')::int);

    select * into v_prod from public.products where id = v_pid;
    v_unit := coalesce(v_prod.discount_price, v_prod.price);

    insert into public.order_items
      (order_id, product_id, name_snapshot, image_snapshot, unit_price_snapshot, unit_label_snapshot, qty, line_total)
    values (v_order_id, v_prod.id, v_prod.name, v_prod.image_url, v_unit, v_prod.unit_label, v_qty, v_unit * v_qty);

    update public.products set stock = stock - v_qty where id = v_pid;
    v_subtotal := v_subtotal + v_unit * v_qty;
  end loop;

  update public.orders set subtotal = v_subtotal, total = v_subtotal where id = v_order_id;

  return query select v_order_id, v_order_no;
end $$;

grant execute on function public.place_order(jsonb, uuid, text, text, text) to authenticated;

-- ---------------------------------------------------------------------
--  RPC — sipariş durumu / iptal (admin)
-- ---------------------------------------------------------------------

create or replace function public.set_order_status(p_order_id uuid, p_status text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'Yetkisiz.' using errcode = '42501';
  end if;
  if p_status not in ('new','preparing','on_the_way','delivered') then
    raise exception 'Geçersiz durum.' using errcode = 'P0001';
  end if;
  update public.orders set status = p_status where id = p_order_id;
end $$;

create or replace function public.cancel_order(p_order_id uuid, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
declare r record;
begin
  if not public.is_admin() then
    raise exception 'Yetkisiz.' using errcode = '42501';
  end if;

  if (select status from public.orders where id = p_order_id) = 'cancelled' then
    return;
  end if;

  for r in select product_id, qty from public.order_items where order_id = p_order_id loop
    if r.product_id is not null then
      update public.products set stock = stock + r.qty where id = r.product_id;
    end if;
  end loop;

  update public.orders
     set status = 'cancelled', cancel_reason = nullif(p_reason, '')
   where id = p_order_id;
end $$;

grant execute on function public.set_order_status(uuid, text) to authenticated;
grant execute on function public.cancel_order(uuid, text) to authenticated;

-- ---------------------------------------------------------------------
--  RLS
-- ---------------------------------------------------------------------

alter table public.profiles      enable row level security;
alter table public.addresses     enable row level security;
alter table public.categories    enable row level security;
alter table public.products      enable row level security;
alter table public.orders        enable row level security;
alter table public.order_items   enable row level security;
alter table public.admin_devices enable row level security;
alter table public.settings      enable row level security;

-- profiles
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles p where p.id = auth.uid()));
drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert to authenticated
  with check (id = auth.uid());

-- addresses
drop policy if exists addresses_all on public.addresses;
create policy addresses_all on public.addresses for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- categories
drop policy if exists categories_select on public.categories;
create policy categories_select on public.categories for select to authenticated
  using (is_active or public.is_admin());
drop policy if exists categories_write on public.categories;
create policy categories_write on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- products
drop policy if exists products_select on public.products;
create policy products_select on public.products for select to authenticated
  using (is_active or public.is_admin());
drop policy if exists products_write on public.products;
create policy products_write on public.products for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- orders
drop policy if exists orders_select on public.orders;
create policy orders_select on public.orders for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
drop policy if exists orders_update on public.orders;
create policy orders_update on public.orders for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- order_items
drop policy if exists order_items_select on public.order_items;
create policy order_items_select on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));

-- admin_devices
drop policy if exists admin_devices_all on public.admin_devices;
create policy admin_devices_all on public.admin_devices for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- settings
drop policy if exists settings_select on public.settings;
create policy settings_select on public.settings for select to authenticated using (true);
drop policy if exists settings_write on public.settings;
create policy settings_write on public.settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
--  Realtime
-- ---------------------------------------------------------------------

alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_items;
alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.categories;
alter table public.orders replica identity full;

-- ---------------------------------------------------------------------
--  Storage — product-images
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists product_images_read on storage.objects;
create policy product_images_read on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists product_images_write on storage.objects;
create policy product_images_write on storage.objects for all to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());
