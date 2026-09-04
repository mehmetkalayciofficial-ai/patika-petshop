"use client";

import { supabaseBrowser } from "@/lib/supabase/client";

const MAKS = 1200;
const KALITE = 0.8;

/** İstemcide yeniden boyutlandırıp WebP'e çevirir (Storage'a küçük dosya gider). */
export async function gorseliSikistir(dosya: File): Promise<Blob> {
  const bitmap = await createImageBitmap(dosya);
  const olcek = Math.min(1, MAKS / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * olcek);
  const h = Math.round(bitmap.height * olcek);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dosya;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", KALITE));
  return blob ?? dosya;
}

export async function gorselYukle(dosya: File): Promise<string> {
  const supabase = supabaseBrowser();
  const blob = await gorseliSikistir(dosya);
  const ad = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;

  const { error } = await supabase.storage.from("product-images").upload(ad, blob, {
    contentType: "image/webp",
    cacheControl: "31536000",
  });
  if (error) throw error;

  const { data } = supabase.storage.from("product-images").getPublicUrl(ad);
  return data.publicUrl;
}

/** Storage'daki dosyayı siler (URL'den yol çıkarılır). */
export async function gorselSil(url: string) {
  const parca = url.split("/product-images/")[1];
  if (!parca) return;
  await supabaseBrowser().storage.from("product-images").remove([decodeURIComponent(parca.split("?")[0])]);
}
