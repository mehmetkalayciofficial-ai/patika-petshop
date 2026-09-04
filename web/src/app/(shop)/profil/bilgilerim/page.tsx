import type { Metadata } from "next";
import { getProfil } from "@/lib/queries";
import { Bilgilerim } from "@/components/profil/Bilgilerim";

export const metadata: Metadata = { title: "Hesap Bilgilerim" };

export default async function Page() {
  const profil = await getProfil();
  return <Bilgilerim profil={profil} />;
}
