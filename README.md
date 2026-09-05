# Patika Pet Market — Sipariş Sitesi + Admin Uygulaması

Petshop için online sipariş sistemi. İki parça:

| Parça | Ne işe yarar | Nerede |
|---|---|---|
| **Web sitesi** | Müşteriler girer, kayıt olur, sepete ekler, sipariş verir | https://patikapetshopsiparis.vercel.app |
| **Admin uygulaması (APK)** | Dükkan sahibi siparişleri görür, ürünleri yönetir | `dist/PatikaAdmin-v1.0.0.apk` |

---

## Hızlı bakış

```
patika-petshop/
├── web/                  Next.js sitesi (müşteri + /admin paneli)
├── admin-app/            Capacitor Android kabuğu (APK)
├── supabase/             Şema, seed, edge function
├── scripts/              Görsel/ses/ikon üretim script'leri
├── assets/raw/           Orijinal marka görselleri
└── dist/                 Derlenmiş APK
```

**Renkler:** ana `#F0B429` (bal), vurgu `#C0492B` (kiremit) — logodan çıkarıldı.

---

## 1. Supabase — KURULU ✅

Proje zaten açıldı ve her şey yüklendi:

| | |
|---|---|
| Proje | `patika-petshop` · `lfbcdbowuskmogxmhwtm` |
| Bölge | Frankfurt (Central EU) |
| Panel | https://supabase.com/dashboard/project/lfbcdbowuskmogxmhwtm |
| Hesap | Patika için açılan ayrı Supabase hesabı |
| Admin girişi | kullanıcı adı `admin` · şifre `admin.234` |
| Veritabanı şifresi | `supabase/db-sifresi.txt` (repoya girmiyor — **yedekle**) |

Yüklenenler: şema + RLS + `place_order` RPC + storage kovası, 9 kategori / 18 örnek ürün,
e-posta doğrulaması kapalı, site adresleri ayarlı, admin kullanıcısı hazır.

Sıfırdan kurmak gerekirse (yeni hesap / yeni ortam):

```bash
SUPABASE_ACCESS_TOKEN=sbp_... node scripts/supabase-kur.mjs
```

Bu tek komut projeyi açar, şemayı ve örnek veriyi yükler, auth ayarlarını yapar,
admin kullanıcısını oluşturur ve `web/.env.local` dosyasını yazar.

<details>
<summary>Elle kurulum adımları (gerekirse)</summary>


1. [supabase.com](https://supabase.com) → yeni proje aç (bölge: **Frankfurt** ya da **Londra**).
2. **SQL Editor** → `supabase/migrations/0001_init.sql` içeriğini yapıştır → çalıştır.
3. **SQL Editor** → `supabase/seed.sql` (örnek kategoriler/ürünler; gerçek ürünleri girince silebilirsin).
4. **Authentication → Providers → Email** → “Confirm email” **kapalı** olsun (müşteri hemen sipariş verebilsin).
5. **Authentication → URL Configuration**
   - Site URL: `https://patikapetshopsiparis.vercel.app`
   - Redirect URLs: `https://patikapetshopsiparis.vercel.app/**`
6. Admin kullanıcısını oluştur:

```bash
cd web
SUPABASE_URL="https://xxxx.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="eyJ..." \
node ../scripts/seed-admin.mjs
```

Bu, `admin@patikapetshop.app` kullanıcısını `admin.234` şifresiyle oluşturur ve `role = 'admin'` yapar.
Uygulamada **kullanıcı adı: `admin`**, **şifre: `admin.234`**.
⚠️ Kurulumdan sonra uygulamadaki “Şifre Değiştir” ile şifreyi değiştirin.

</details>

**Hesap silme fonksiyonu** (isteğe bağlı, henüz kurulmadı):

```bash
npx supabase functions deploy delete-account --project-ref lfbcdbowuskmogxmhwtm
```

Kurulmadan “Hesabımı Sil” butonu hata verir; diğer her şey çalışır.

---

## 2. Web sitesi

```bash
cd web
cp .env.example .env.local     # Supabase URL + anon key gir
npm install
npm run dev                    # http://localhost:3000
```

**Ortam değişkenleri**

| Anahtar | Nerede bulunur |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | aynı sayfa → `anon public` |
| `SUPABASE_SERVICE_ROLE_KEY` | aynı sayfa → `service_role` (sadece script'ler için, siteye girmez) |

> Anahtarlar girilmediğinde site **demo modunda** açılır: örnek ürünlerle çalışır, giriş zorunlu değildir. Gerçek anahtarlar girildiğinde demo modu kendiliğinden kapanır.

**Deploy (Vercel)**

```bash
cd web
vercel deploy --prod
```

Vercel projesinde aynı iki `NEXT_PUBLIC_*` değişkenini tanımlamayı unutma.

---

## 3. Admin Android uygulaması (APK)

### Kurulum (telefona)

1. `dist/PatikaAdmin-v1.0.0.apk` dosyasını telefona at (WhatsApp, Drive, kablo — fark etmez).
2. Aç → “Bilinmeyen kaynaklara izin ver” çıkarsa izin ver.
3. Uygulama açılışta **bildirim izni** ister → **İzin Ver** de. (Bu olmazsa sipariş bildirimi düşmez.)
4. Giriş: kullanıcı adı `admin`, şifre `admin.234`.

### Bildirimler nasıl çalışıyor?

Uygulama Supabase'e **canlı bağlı** kalır. Yeni sipariş düştüğü an telefon **“ding”** der ve bildirim **kilit ekranında** görünür.
Arka planda da çalışabilmesi için uygulama sessiz, kalıcı bir “Patika Admin açık” bildirimi gösterir — bu normaldir, kapatma.

**Xiaomi / Huawei / Oppo / Samsung kullanıcıları:** bu markalar uygulamaları agresif şekilde kapatır. Bir kez şu ayarları yap:

- **Ayarlar → Uygulamalar → Patika Admin → Pil → Kısıtlama yok / Optimize etme**
- **Ayarlar → Uygulamalar → Patika Admin → Otomatik başlatma → Aç**
- Son uygulamalar ekranında uygulamayı **kilitle** (asma kilit simgesi)

### Yeniden derleme

```bash
cd admin-app
npx cap sync android
cd android
./gradlew assembleRelease
# çıktı: app/build/outputs/apk/release/app-release.apk
```

Ortam (bu makinede kurulu):

```bash
export JAVA_HOME=~/dev-tools/jdk-21.0.12.1+1/Contents/Home
export ANDROID_HOME=~/dev-tools/android-sdk
```

**İmza anahtarı** — `admin-app/android/keystore/patika-admin.jks`
alias: `patika` · store/key şifresi: `Patika2026Admin`
⚠️ Bu dosyayı **kaybetme**. Kaybolursa aynı uygulamaya güncelleme yayınlanamaz (kullanıcı uygulamayı silip yeniden kurmak zorunda kalır). Yedekle.

Uygulama, sitedeki `/admin` sayfasını açar. Yani **arayüz güncellemeleri için APK'yı yenilemene gerek yok** — siteyi deploy etmen yeter.

---

## 4. Sonradan Firebase (FCM) eklemek

Şu anki yapı bildirim için Firebase istemiyor. Uygulama tamamen kapalıyken bile (ör. kullanıcı uygulamayı son uygulamalardan kaydırdıysa) bildirim düşmesini istersen FCM ekle:

1. [console.firebase.google.com](https://console.firebase.google.com) → **Add project** → adı `patika-petshop`.
2. **Add app → Android** → paket adı: `com.patikapetshop.admin` → `google-services.json` indir.
3. Dosyayı `admin-app/android/app/google-services.json` içine koy.
4. **Project settings → Service accounts → Generate new private key** → inen JSON'u sakla.
5. Supabase → **Edge Functions** → secret olarak ekle (`FCM_SERVICE_ACCOUNT`), sonra `orders` tablosuna INSERT webhook'u bağla.

Adım 1–4 senin Google hesabınla yapılır; dosyaları verirsen kalanını bağlarız.

---

## 5. Günlük kullanım

**Ürün eklemek/düzenlemek:** Uygulama → **Ürünler** sekmesi → sağ üst **Düzenle** → karta dokun.
Kategori eklemek: Düzenle modunda **+ Kategori**. Hızlı stok değiştirmek: ürün kartına uzun bas.
Yaptığın her değişiklik sitede **anında** görünür.

**Sipariş yönetmek:** **Gelen Siparişler** sekmesi → siparişe dokun → `Onayla → Yola Çıktı → Teslim Edildi`.
İptal edersen ürünlerin stoğu otomatik geri yüklenir ve müşteri sebebi görür.

---

## 6. Bilinen notlar

- Ödeme sadece **kapıda nakit / kapıda kart**. Online ödeme yok.
- Örnek ürünlerde gerçek fotoğraf yok (telifsiz kalmak için) — admin panelinden kendi fotoğraflarını yükle.
- Ürün görselleri istemcide 1200 px / WebP'e sıkıştırılıp Supabase Storage'a yüklenir.
- Fiyat ve stok kontrolü **sunucuda** (`place_order` RPC) yapılır; istemciden gelen fiyata güvenilmez.
