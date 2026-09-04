export const TRY = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 2,
});

export const fiyat = (n: number) => TRY.format(n ?? 0);

const DATE = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
export const tarih = (iso: string) => DATE.format(new Date(iso));

const DATE_SHORT = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});
export const tarihKisa = (iso: string) => DATE_SHORT.format(new Date(iso));

/** "3 dk önce" / "dün 14:20" gibi kısa göreli zaman. */
export function gecenSure(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const dk = Math.floor(diff / 60000);
  if (dk < 1) return "az önce";
  if (dk < 60) return `${dk} dk önce`;
  const sa = Math.floor(dk / 60);
  if (sa < 24) return `${sa} saat önce`;
  const gun = Math.floor(sa / 24);
  if (gun === 1) return "dün";
  if (gun < 7) return `${gun} gün önce`;
  return DATE_SHORT.format(new Date(iso));
}

/** 5551234567 → "0555 123 45 67" */
export function telefonMaskele(raw: string) {
  const d = (raw ?? "").replace(/\D/g, "").replace(/^90/, "").replace(/^0/, "").slice(0, 10);
  const p = ["0" + d.slice(0, 3), d.slice(3, 6), d.slice(6, 8), d.slice(8, 10)];
  return p.filter(Boolean).join(" ").trim();
}

export const telefonSade = (raw: string) => (raw ?? "").replace(/\D/g, "").replace(/^90/, "").replace(/^0/, "");

export function basHarfler(ad: string | null | undefined) {
  const p = (ad ?? "").trim().split(/\s+/).filter(Boolean);
  if (!p.length) return "P";
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toLocaleUpperCase("tr-TR");
}

export const gecerliFiyat = (p: { price: number; discount_price: number | null }) =>
  p.discount_price ?? p.price;

export const indirimYuzde = (p: { price: number; discount_price: number | null }) =>
  p.discount_price ? Math.round((1 - p.discount_price / p.price) * 100) : 0;

export const DURUM_ETIKET: Record<string, string> = {
  new: "Alındı",
  preparing: "Hazırlanıyor",
  on_the_way: "Yolda",
  delivered: "Teslim Edildi",
  cancelled: "İptal Edildi",
};

export const ODEME_ETIKET: Record<string, string> = {
  cash: "Kapıda Nakit",
  card_on_delivery: "Kapıda Kredi Kartı",
};

export function slugify(s: string) {
  const tr: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", İ: "i" };
  return s
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıöşüİ]/g, (c) => tr[c] ?? c)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
