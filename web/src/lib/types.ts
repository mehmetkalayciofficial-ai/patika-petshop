/* Supabase tablo tipleri (elle yazıldı — şema: supabase/migrations/0001_init.sql) */

export type OrderStatus = "new" | "preparing" | "on_the_way" | "delivered" | "cancelled";
export type PaymentMethod = "cash" | "card_on_delivery";

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  stock: number;
  unit_label: string;
  image_url: string | null;
  images: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  role: "customer" | "admin";
  created_at: string;
  updated_at: string;
};

export type Address = {
  id: string;
  user_id: string;
  title: string;
  city: string;
  district: string;
  neighborhood: string | null;
  full_address: string;
  directions: string | null;
  is_default: boolean;
  created_at: string;
};

export type AddressSnapshot = {
  title: string;
  city: string;
  district: string;
  neighborhood: string | null;
  full_address: string;
  directions: string | null;
};

export type Order = {
  id: string;
  order_no: number;
  user_id: string | null;
  customer_name: string;
  phone: string;
  address_snapshot: AddressSnapshot;
  payment_method: PaymentMethod;
  note: string | null;
  status: OrderStatus;
  cancel_reason: string | null;
  subtotal: number;
  total: number;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  name_snapshot: string;
  image_snapshot: string | null;
  unit_price_snapshot: number;
  unit_label_snapshot: string | null;
  qty: number;
  line_total: number;
};

export type Settings = {
  id: number;
  store_phone: string;
  store_address: string;
  whatsapp: string;
  announcement: string | null;
  is_open: boolean;
  min_order: number;
  updated_at: string;
};

export type CategoryWithProducts = Category & { products: Product[] };
export type OrderWithItems = Order & { order_items: OrderItem[] };

/* Supabase generic — sadece tablo adları için ince bir iskelet */
export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      addresses: { Row: Address; Insert: Partial<Address>; Update: Partial<Address> };
      categories: { Row: Category; Insert: Partial<Category>; Update: Partial<Category> };
      products: { Row: Product; Insert: Partial<Product>; Update: Partial<Product> };
      orders: { Row: Order; Insert: Partial<Order>; Update: Partial<Order> };
      order_items: { Row: OrderItem; Insert: Partial<OrderItem>; Update: Partial<OrderItem> };
      settings: { Row: Settings; Insert: Partial<Settings>; Update: Partial<Settings> };
      admin_devices: {
        Row: { id: string; user_id: string; fcm_token: string; platform: string; created_at: string; last_seen_at: string };
        Insert: { user_id: string; fcm_token: string; platform?: string };
        Update: { last_seen_at?: string };
      };
    };
    Views: Record<string, never>;
    Functions: {
      place_order: {
        Args: {
          p_items: { product_id: string; qty: number }[];
          p_address_id: string;
          p_payment_method: PaymentMethod;
          p_note?: string | null;
          p_phone?: string | null;
        };
        Returns: { order_id: string; order_no: number }[];
      };
      set_order_status: { Args: { p_order_id: string; p_status: OrderStatus }; Returns: void };
      cancel_order: { Args: { p_order_id: string; p_reason: string }; Returns: void };
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
