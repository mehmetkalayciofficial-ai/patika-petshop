export const SITE = {
  ad: "Patika Pet Market",
  kisaAd: "Patika",
  tagline: "Patili dostların için taze stok, kapına kadar teslimat.",
  aciklama: "Mama, kum, oyuncak ve bakım ürünleri — sipariş ver, kapına gelsin.",
  url: "https://patikapetshopsiparis.vercel.app",
} as const;

export const MARKA = {
  ana: "#F0B429",
  vurgu: "#C0492B",
  koyu: "#3B2A14",
} as const;

/** Kategori seçimi olmayan ürünler için yedek ikon. */
export const KATEGORI_IKON: Record<string, string> = {
  "kedi-mamasi": "🐱",
  "kopek-mamasi": "🐶",
  "kedi-kumu": "🪣",
  "odul-atistirmalik": "🦴",
  oyuncak: "🎾",
  aksesuar: "🎀",
  "bakim-hijyen": "🧴",
  "kus-kemirgen": "🐦",
  akvaryum: "🐠",
};
