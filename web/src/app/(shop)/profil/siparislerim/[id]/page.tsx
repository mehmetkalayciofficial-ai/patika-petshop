import type { Metadata } from "next";
import { SiparisDetay } from "@/components/profil/SiparisDetay";

export const metadata: Metadata = { title: "Sipariş Detayı" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SiparisDetay id={id} />;
}
