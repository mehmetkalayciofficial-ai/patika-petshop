import type { Metadata } from "next";
import { getProfil } from "@/lib/queries";
import { SifreDegistir } from "@/components/profil/SifreDegistir";

export const metadata: Metadata = { title: "Şifre Değiştir" };

export default async function Page() {
  const profil = await getProfil();
  return <SifreDegistir email={profil?.email ?? ""} />;
}
