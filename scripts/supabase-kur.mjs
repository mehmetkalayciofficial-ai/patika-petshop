/**
 * Patika Petshop — Supabase'i baştan sona kurar.
 *
 *   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/supabase-kur.mjs
 *
 * Yaptıkları:
 *   1. Frankfurt'ta "patika-petshop" projesini açar
 *   2. Proje hazır olana kadar bekler
 *   3. Şemayı (0001_init.sql) ve örnek veriyi (seed.sql) yükler
 *   4. E-posta doğrulamasını kapatır, site adreslerini ayarlar
 *   5. admin kullanıcısını oluşturur (admin@patikapetshop.app / admin.234)
 *   6. web/.env.local dosyasını yazar
 */
import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://api.supabase.com/v1";
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJE_ADI = process.env.PROJE_ADI ?? "patika-petshop";
const BOLGE = process.env.BOLGE ?? "eu-central-1";
const SITE = process.env.SITE_URL ?? "https://patikapetshopsiparis.vercel.app";
const ADMIN_EPOSTA = "admin@patikapetshop.app";
const ADMIN_SIFRE = "admin.234";

if (!TOKEN) {
  console.error("SUPABASE_ACCESS_TOKEN gerekli.");
  process.exit(1);
}

const bekle = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(yol, secenek = {}) {
  const y = await fetch(`${API}${yol}`, {
    ...secenek,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      ...(secenek.headers ?? {}),
    },
  });
  const metin = await y.text();
  let govde;
  try {
    govde = metin ? JSON.parse(metin) : null;
  } catch {
    govde = metin;
  }
  if (!y.ok) throw new Error(`${yol} → ${y.status}: ${typeof govde === "string" ? govde : JSON.stringify(govde)}`);
  return govde;
}

const sql = (ref, query) =>
  api(`/projects/${ref}/database/query`, { method: "POST", body: JSON.stringify({ query }) });

/* ------------------------------------------------------------------ */

console.log("→ Organizasyon aranıyor…");
const orglar = await api("/organizations");
if (!orglar.length) throw new Error("Hesapta organizasyon yok.");
const org = orglar[0];
console.log(`  ✓ ${org.name} (${org.id})`);

/* 1) Proje ---------------------------------------------------------- */

const mevcutlar = await api("/projects");
let proje = mevcutlar.find((p) => p.name === PROJE_ADI);
let dbSifre = null;

if (proje) {
  console.log(`→ "${PROJE_ADI}" zaten var (${proje.id}), onu kullanıyorum.`);
} else {
  dbSifre = "Patika" + randomBytes(15).toString("base64url").replace(/[^A-Za-z0-9]/g, "").slice(0, 20);
  console.log(`→ "${PROJE_ADI}" projesi açılıyor (${BOLGE})…`);
  proje = await api("/projects", {
    method: "POST",
    body: JSON.stringify({ name: PROJE_ADI, organization_id: org.id, region: BOLGE, db_pass: dbSifre }),
  });
  console.log(`  ✓ oluşturuldu: ${proje.id}`);
  await writeFile(resolve(ROOT, "supabase/db-sifresi.txt"), `${dbSifre}\n`, "utf8");
  console.log("  ✓ veritabanı şifresi → supabase/db-sifresi.txt (yedekle!)");
}

const REF = proje.id;

/* 2) Hazır olmasını bekle ------------------------------------------- */

process.stdout.write("→ Proje hazırlanıyor");
for (let i = 0; i < 90; i++) {
  const p = await api(`/projects/${REF}`);
  if (p.status === "ACTIVE_HEALTHY") {
    console.log(" ✓");
    break;
  }
  process.stdout.write(".");
  await bekle(10_000);
  if (i === 89) throw new Error("Proje 15 dakikada hazır olmadı.");
}

// Postgres bağlantısı birkaç saniye daha gecikebiliyor
for (let i = 0; i < 20; i++) {
  try {
    await sql(REF, "select 1");
    break;
  } catch {
    await bekle(5_000);
  }
}

/* 3) Şema + örnek veri ---------------------------------------------- */

console.log("→ Şema yükleniyor (tablolar, RLS, RPC, storage)…");
await sql(REF, await readFile(resolve(ROOT, "supabase/migrations/0001_init.sql"), "utf8"));
console.log("  ✓ şema hazır");

console.log("→ Örnek kategoriler ve ürünler yükleniyor…");
await sql(REF, await readFile(resolve(ROOT, "supabase/seed.sql"), "utf8"));
console.log("  ✓ örnek veri hazır");

/* 4) Anahtarlar ------------------------------------------------------ */

const anahtarlar = await api(`/projects/${REF}/api-keys?reveal=true`);
const bul = (ad) => anahtarlar.find((a) => a.name === ad)?.api_key;
const ANON = bul("anon");
const SERVICE = bul("service_role");
if (!ANON || !SERVICE) throw new Error("API anahtarları alınamadı.");
const URL = `https://${REF}.supabase.co`;

/* 5) Auth ayarları --------------------------------------------------- */

console.log("→ Giriş ayarları yapılıyor (e-posta doğrulaması kapalı)…");
await api(`/projects/${REF}/config/auth`, {
  method: "PATCH",
  body: JSON.stringify({
    site_url: SITE,
    uri_allow_list: [`${SITE}/**`, "http://localhost:3000/**", "http://localhost:3210/**"].join(","),
    mailer_autoconfirm: true,
    password_min_length: 8,
  }),
});
console.log("  ✓ ayarlandı");

/* 6) Admin kullanıcısı ----------------------------------------------- */

console.log("→ Admin kullanıcısı oluşturuluyor…");
const authBaslik = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

let adminId = null;
const olustur = await fetch(`${URL}/auth/v1/admin/users`, {
  method: "POST",
  headers: authBaslik,
  body: JSON.stringify({
    email: ADMIN_EPOSTA,
    password: ADMIN_SIFRE,
    email_confirm: true,
    user_metadata: { full_name: "Patika Yönetici" },
  }),
});
const olusturGovde = await olustur.json();

if (olustur.ok) {
  adminId = olusturGovde.id;
  console.log("  ✓ oluşturuldu");
} else {
  const liste = await fetch(`${URL}/auth/v1/admin/users?per_page=200`, { headers: authBaslik }).then((r) => r.json());
  adminId = liste.users?.find((u) => u.email === ADMIN_EPOSTA)?.id ?? null;
  if (!adminId) throw new Error(`Admin oluşturulamadı: ${JSON.stringify(olusturGovde)}`);
  await fetch(`${URL}/auth/v1/admin/users/${adminId}`, {
    method: "PUT",
    headers: authBaslik,
    body: JSON.stringify({ password: ADMIN_SIFRE, email_confirm: true }),
  });
  console.log("  ✓ zaten vardı, şifresi güncellendi");
}

await sql(
  REF,
  `insert into public.profiles (id, email, full_name, role)
   values ('${adminId}', '${ADMIN_EPOSTA}', 'Patika Yönetici', 'admin')
   on conflict (id) do update set role = 'admin', full_name = 'Patika Yönetici';`,
);
console.log("  ✓ yönetici yetkisi verildi");

/* 7) .env.local ------------------------------------------------------ */

await writeFile(
  resolve(ROOT, "web/.env.local"),
  `# Supabase — scripts/supabase-kur.mjs tarafından yazıldı\n` +
    `NEXT_PUBLIC_SUPABASE_URL=${URL}\n` +
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${ANON}\n` +
    `SUPABASE_SERVICE_ROLE_KEY=${SERVICE}\n`,
  "utf8",
);

console.log("\n────────────────────────────────────────");
console.log("KURULUM TAMAM");
console.log("────────────────────────────────────────");
console.log(`Proje      : ${PROJE_ADI} (${REF}) · ${BOLGE}`);
console.log(`URL        : ${URL}`);
console.log(`Admin      : kullanıcı adı "admin" · şifre "${ADMIN_SIFRE}"`);
if (dbSifre) console.log(`DB şifresi : supabase/db-sifresi.txt`);
console.log(`\nVercel için:`);
console.log(`  NEXT_PUBLIC_SUPABASE_URL=${URL}`);
console.log(`  NEXT_PUBLIC_SUPABASE_ANON_KEY=${ANON}`);
