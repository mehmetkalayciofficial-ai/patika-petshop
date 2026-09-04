/**
 * Hesap silme — müşteri kendi hesabını siler.
 * Siparişler anonimleştirilir (user_id null), auth kullanıcısı silinir.
 *
 * Dağıtım:  supabase functions deploy delete-account
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const yetki = req.headers.get("Authorization");
  if (!yetki) {
    return new Response(JSON.stringify({ error: "Yetkisiz" }), { status: 401, headers: { ...CORS, "Content-Type": "application/json" } });
  }

  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // 1) Çağıran kullanıcıyı doğrula
  const kullaniciDb = createClient(url, anon, { global: { headers: { Authorization: yetki } } });
  const { data: auth, error: authHata } = await kullaniciDb.auth.getUser();
  if (authHata || !auth.user) {
    return new Response(JSON.stringify({ error: "Yetkisiz" }), { status: 401, headers: { ...CORS, "Content-Type": "application/json" } });
  }

  const uid = auth.user.id;
  const admin = createClient(url, service, { auth: { persistSession: false } });

  // 2) Siparişleri anonimleştir (silme — mağazanın kaydı kalsın)
  await admin.from("orders").update({ user_id: null, phone: "", customer_name: "Silinmiş hesap" }).eq("user_id", uid);

  // 3) Adresleri ve profili sil
  await admin.from("addresses").delete().eq("user_id", uid);
  await admin.from("profiles").delete().eq("id", uid);

  // 4) Auth kullanıcısını sil
  const { error: silHata } = await admin.auth.admin.deleteUser(uid);
  if (silHata) {
    return new Response(JSON.stringify({ error: silHata.message }), { status: 500, headers: { ...CORS, "Content-Type": "application/json" } });
  }

  return new Response(JSON.stringify({ ok: true }), { headers: { ...CORS, "Content-Type": "application/json" } });
});
