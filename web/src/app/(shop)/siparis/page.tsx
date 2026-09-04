import type { Metadata } from "next";
import { getAyarlar, getProfil } from "@/lib/queries";
import { Checkout } from "@/components/shop/Checkout";

export const metadata: Metadata = { title: "Siparişi Tamamla" };

export default async function SiparisPage() {
  const [profil, ayarlar] = await Promise.all([getProfil(), getAyarlar()]);
  return <Checkout profil={profil} kapali={!(ayarlar?.is_open ?? true)} />;
}
