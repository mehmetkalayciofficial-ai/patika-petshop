import "server-only";
import { supabaseServer } from "@/lib/supabase/server";
import type { Category, CategoryWithProducts, Product, Profile, Settings } from "@/lib/types";
import { DEMO_AYARLAR, DEMO_KATEGORILER, DEMO_MOD } from "@/lib/demo";

export async function getKatalog(): Promise<{ kategoriler: CategoryWithProducts[]; urunler: Product[] }> {
  if (DEMO_MOD) {
    return { kategoriler: DEMO_KATEGORILER, urunler: DEMO_KATEGORILER.flatMap((c) => c.products) };
  }
  const supabase = await supabaseServer();
  const [{ data: cats }, { data: prods }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order").order("name"),
    supabase.from("products").select("*").order("sort_order").order("name"),
  ]);

  const kategoriler = (cats ?? []) as Category[];
  const urunler = (prods ?? []) as Product[];

  return {
    kategoriler: kategoriler.map((c) => ({ ...c, products: urunler.filter((p) => p.category_id === c.id) })),
    urunler,
  };
}

export async function getAyarlar(): Promise<Settings | null> {
  if (DEMO_MOD) return DEMO_AYARLAR;
  const supabase = await supabaseServer();
  const { data } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
  return (data as Settings) ?? null;
}

export async function getProfil(): Promise<Profile | null> {
  if (DEMO_MOD) {
    return { id: "demo", full_name: "Demo Müşteri", phone: "05550000000", email: "demo@patika.app", role: "admin", created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  }
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", auth.user.id).maybeSingle();
  return (data as Profile) ?? null;
}
