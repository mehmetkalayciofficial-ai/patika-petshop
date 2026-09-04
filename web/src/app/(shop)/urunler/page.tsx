import type { Metadata } from "next";
import { getAyarlar, getKatalog } from "@/lib/queries";
import { Hero } from "@/components/shop/Hero";
import { CatalogClient } from "@/components/shop/CatalogClient";

export const metadata: Metadata = { title: "Ürünler" };
export const revalidate = 0;

export default async function UrunlerPage() {
  const [{ kategoriler }, ayarlar] = await Promise.all([getKatalog(), getAyarlar()]);

  return (
    <>
      <Hero duyuru={ayarlar?.announcement} kapali={!(ayarlar?.is_open ?? true)} />
      <CatalogClient kategoriler={kategoriler} />
    </>
  );
}
