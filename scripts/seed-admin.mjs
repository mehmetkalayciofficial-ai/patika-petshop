/**
 * Admin kullanıcısını oluşturur / şifresini ayarlar ve role='admin' yapar.
 * Çalıştır:  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-admin.mjs
 */
import { createClient } from "@supabase/supabase-js";

const URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EPOSTA = process.env.ADMIN_EMAIL ?? "admin@patikapetshop.app";
const SIFRE = process.env.ADMIN_PASSWORD ?? "admin.234";

if (!URL || !KEY) {
  console.error("SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.");
  process.exit(1);
}

const db = createClient(URL, KEY, { auth: { persistSession: false } });

const { data: liste } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
const mevcut = liste?.users.find((u) => u.email === EPOSTA);

let id;
if (mevcut) {
  await db.auth.admin.updateUserById(mevcut.id, { password: SIFRE, email_confirm: true });
  id = mevcut.id;
  console.log("✓ Admin kullanıcısı güncellendi:", EPOSTA);
} else {
  const { data, error } = await db.auth.admin.createUser({
    email: EPOSTA,
    password: SIFRE,
    email_confirm: true,
    user_metadata: { full_name: "Patika Yönetici" },
  });
  if (error) {
    console.error("Admin oluşturulamadı:", error.message);
    process.exit(1);
  }
  id = data.user.id;
  console.log("✓ Admin kullanıcısı oluşturuldu:", EPOSTA);
}

const { error: rolHata } = await db
  .from("profiles")
  .upsert({ id, email: EPOSTA, full_name: "Patika Yönetici", role: "admin" }, { onConflict: "id" });

if (rolHata) {
  console.error("Rol atanamadı:", rolHata.message);
  process.exit(1);
}
console.log("✓ role = admin");
console.log(`\nUygulama girişi →  kullanıcı adı: admin   şifre: ${SIFRE}`);
