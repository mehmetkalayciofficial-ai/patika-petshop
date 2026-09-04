import type { Metadata } from "next";
import { getAyarlar, getProfil } from "@/lib/queries";
import { ProfilAna } from "@/components/profil/ProfilAna";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilPage() {
  const [profil, ayarlar] = await Promise.all([getProfil(), getAyarlar()]);
  return <ProfilAna profil={profil} ayarlar={ayarlar} />;
}
