import type { CategoryWithProducts, Settings } from "@/lib/types";

/**
 * Supabase anahtarları henüz girilmediyse site boş görünmesin diye
 * kullanılan geçici örnek katalog. Gerçek anahtarlar .env'e girildiği an
 * DEMO_MOD false olur ve bu dosya devre dışı kalır.
 */
export const DEMO_MOD =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("xxxxxxxx");

const now = new Date().toISOString();

let sayac = 0;
const urun = (
  categoryId: string,
  name: string,
  description: string,
  price: number,
  stock: number,
  unit = "adet",
  discount: number | null = null,
) => ({
  id: `demo-p-${++sayac}`,
  category_id: categoryId,
  name,
  description,
  price,
  discount_price: discount,
  stock,
  unit_label: unit,
  image_url: null,
  images: [] as string[],
  is_active: true,
  sort_order: sayac,
  created_at: now,
  updated_at: now,
});

const kat = (id: string, name: string, icon: string, sort: number) => ({
  id,
  name,
  slug: id,
  icon,
  sort_order: sort,
  is_active: true,
  created_at: now,
  updated_at: now,
});

export const DEMO_KATEGORILER: CategoryWithProducts[] = [
  {
    ...kat("kedi-mamasi", "Kedi Maması", "🐱", 1),
    products: [
      urun("kedi-mamasi", "Yetişkin Kedi Maması — Tavuklu 1,5 kg", "Tahılsız, yüksek proteinli günlük mama.", 289.9, 24, "paket", 249.9),
      urun("kedi-mamasi", "Yavru Kedi Maması — Somonlu 800 g", "2-12 ay arası yavrular için.", 219.5, 11, "paket"),
      urun("kedi-mamasi", "Konserve Kedi Maması — Ton Balıklı 85 g", "Yaş mama, tek öğünlük.", 39.9, 3, "adet"),
    ],
  },
  {
    ...kat("kopek-mamasi", "Köpek Maması", "🐶", 2),
    products: [
      urun("kopek-mamasi", "Yetişkin Köpek Maması — Kuzulu 3 kg", "Orta ve büyük ırklar için dengeli formül.", 549.0, 15, "paket", 479.0),
      urun("kopek-mamasi", "Yavru Köpek Maması — Tavuklu 1 kg", "Kemik gelişimi destekli.", 264.9, 8, "paket"),
    ],
  },
  {
    ...kat("kedi-kumu", "Kedi Kumu", "🪣", 3),
    products: [
      urun("kedi-kumu", "Topaklanan Bentonit Kum 10 L", "İnce taneli, kokusuz, düşük tozlu.", 199.0, 30, "paket"),
      urun("kedi-kumu", "Kristal Silika Kum 3,8 L", "Uzun ömürlü, hafif.", 179.9, 0, "paket"),
    ],
  },
  {
    ...kat("odul-atistirmalik", "Ödül & Atıştırmalık", "🦴", 4),
    products: [
      urun("odul-atistirmalik", "Köpek Ödül Çubuğu — Biftekli", "Eğitim için ideal, 10'lu.", 74.9, 42, "paket"),
      urun("odul-atistirmalik", "Kedi Malt Macunu 100 g", "Tüy yumağı oluşumuna karşı.", 119.0, 6, "adet"),
    ],
  },
  {
    ...kat("oyuncak", "Oyuncak", "🎾", 5),
    products: [
      urun("oyuncak", "Kauçuk Diş Kaşıyıcı Top", "Dayanıklı, sesli.", 89.9, 18, "adet"),
      urun("oyuncak", "Kedi Olta Oyuncağı", "Tüylü uçlu, çan sesli.", 59.9, 25, "adet"),
      urun("oyuncak", "İpli Çekiştirme Oyuncağı", "Pamuklu örgü halat.", 69.9, 2, "adet"),
    ],
  },
  {
    ...kat("bakim-hijyen", "Bakım & Hijyen", "🧴", 6),
    products: [
      urun("bakim-hijyen", "Tüy Açıcı Fırça", "Kendini temizleyen model.", 149.0, 12, "adet"),
      urun("bakim-hijyen", "Köpek Şampuanı 400 ml", "Hassas ciltler için.", 129.9, 9, "adet"),
      urun("bakim-hijyen", "Tırnak Makası", "Paslanmaz çelik.", 84.9, 14, "adet"),
    ],
  },
  {
    ...kat("aksesuar", "Aksesuar", "🎀", 7),
    products: [
      urun("aksesuar", "Ayarlanabilir Köpek Tasması", "Reflektörlü, orta boy.", 179.0, 7, "adet"),
      urun("aksesuar", "Çelik Mama Kabı 400 ml", "Kaymaz tabanlı.", 99.9, 20, "adet"),
    ],
  },
  {
    ...kat("kus-kemirgen", "Kuş & Kemirgen", "🐦", 8),
    products: [
      urun("kus-kemirgen", "Muhabbet Kuşu Yemi 500 g", "Vitamin destekli karışım.", 64.9, 16, "paket"),
      urun("kus-kemirgen", "Hamster Talaşı 5 L", "Tozsuz, kokusuz.", 89.0, 10, "paket"),
    ],
  },
];

export const DEMO_AYARLAR: Settings = {
  id: 1,
  store_phone: "0555 000 00 00",
  store_address: "Örnek Mah. Patika Cad. No:1",
  whatsapp: "0555 000 00 00",
  announcement: "Demo verisi — gerçek ürünler admin panelinden girilecek.",
  is_open: true,
  min_order: 0,
  updated_at: now,
};
