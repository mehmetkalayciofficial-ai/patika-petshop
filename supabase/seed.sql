-- =====================================================================
--  PATİKA PETSHOP — örnek veri
--  Admin gerçek ürünleri girince bunları silecek.
--  Çalıştırma: supabase db push sonrası SQL Editor'da bu dosyayı çalıştır.
-- =====================================================================

-- Mağaza bilgileri
update public.settings
   set store_phone   = '0555 000 00 00',
       whatsapp      = '0555 000 00 00',
       store_address = 'Adresinizi admin panelinden güncelleyin',
       announcement  = null,
       is_open       = true
 where id = 1;

-- Kategoriler
insert into public.categories (name, slug, icon, sort_order) values
  ('Kedi Maması',           'kedi-mamasi',        '🐱', 1),
  ('Köpek Maması',          'kopek-mamasi',       '🐶', 2),
  ('Kedi Kumu',             'kedi-kumu',          '🪣', 3),
  ('Ödül & Atıştırmalık',   'odul-atistirmalik',  '🦴', 4),
  ('Oyuncak',               'oyuncak',            '🎾', 5),
  ('Aksesuar',              'aksesuar',           '🎀', 6),
  ('Bakım & Hijyen',        'bakim-hijyen',       '🧴', 7),
  ('Kuş & Kemirgen',        'kus-kemirgen',       '🐦', 8),
  ('Akvaryum',              'akvaryum',           '🐠', 9)
on conflict (slug) do nothing;

-- Örnek ürünler (marka adı yok — telif riski taşımaz)
insert into public.products (category_id, name, description, price, discount_price, stock, unit_label, sort_order)
select c.id, v.name, v.description, v.price, v.discount_price, v.stock, v.unit_label, v.sort_order
from (values
  ('kedi-mamasi',       'Yetişkin Kedi Maması — Tavuklu 1,5 kg', 'Tahılsız, yüksek proteinli günlük mama.',        289.90, 249.90, 24, 'paket', 1),
  ('kedi-mamasi',       'Yavru Kedi Maması — Somonlu 800 g',     '2-12 ay arası yavrular için.',                   219.50, null,   12, 'paket', 2),
  ('kedi-mamasi',       'Konserve Kedi Maması — Ton Balıklı',    'Yaş mama, tek öğünlük 85 g.',                     39.90, null,   40, 'adet',  3),
  ('kopek-mamasi',      'Yetişkin Köpek Maması — Kuzulu 3 kg',   'Orta ve büyük ırklar için dengeli formül.',      549.00, 479.00, 15, 'paket', 1),
  ('kopek-mamasi',      'Yavru Köpek Maması — Tavuklu 1 kg',     'Kemik gelişimi destekli.',                       264.90, null,    9, 'paket', 2),
  ('kedi-kumu',         'Topaklanan Bentonit Kum 10 L',          'İnce taneli, kokusuz, düşük tozlu.',             199.00, null,   30, 'paket', 1),
  ('kedi-kumu',         'Kristal Silika Kum 3,8 L',              'Uzun ömürlü, hafif.',                            179.90, null,    8, 'paket', 2),
  ('odul-atistirmalik', 'Köpek Ödül Çubuğu — Biftekli',          'Eğitim için ideal, 10 adet.',                     74.90, null,   42, 'paket', 1),
  ('odul-atistirmalik', 'Kedi Malt Macunu 100 g',                'Tüy yumağı oluşumuna karşı.',                    119.00, null,   16, 'adet',  2),
  ('oyuncak',           'Kauçuk Diş Kaşıyıcı Top',               'Dayanıklı, sesli.',                               89.90, null,   18, 'adet',  1),
  ('oyuncak',           'Kedi Olta Oyuncağı',                    'Tüylü uçlu, çan sesli.',                          59.90, null,   25, 'adet',  2),
  ('aksesuar',          'Ayarlanabilir Köpek Tasması',           'Reflektörlü, orta boy.',                         179.00, null,    7, 'adet',  1),
  ('aksesuar',          'Çelik Mama Kabı 400 ml',                'Kaymaz tabanlı.',                                 99.90, null,   20, 'adet',  2),
  ('bakim-hijyen',      'Tüy Açıcı Fırça',                       'Kendini temizleyen model.',                      149.00, null,   12, 'adet',  1),
  ('bakim-hijyen',      'Köpek Şampuanı 400 ml',                 'Hassas ciltler için.',                           129.90, null,   14, 'adet',  2),
  ('kus-kemirgen',      'Muhabbet Kuşu Yemi 500 g',              'Vitamin destekli karışım.',                       64.90, null,   16, 'paket', 1),
  ('kus-kemirgen',      'Hamster Talaşı 5 L',                    'Tozsuz, kokusuz.',                                89.00, null,   10, 'paket', 2),
  ('akvaryum',          'Balık Yemi Pul 100 ml',                 'Tropikal balıklar için.',                         54.90, null,   22, 'adet',  1)
) as v(slug, name, description, price, discount_price, stock, unit_label, sort_order)
join public.categories c on c.slug = v.slug
where not exists (select 1 from public.products p where p.name = v.name);
