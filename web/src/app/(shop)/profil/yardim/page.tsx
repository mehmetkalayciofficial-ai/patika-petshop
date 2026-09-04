import type { Metadata } from "next";
import { getAyarlar } from "@/lib/queries";
import { Yardim } from "@/components/profil/Yardim";

export const metadata: Metadata = { title: "Yardım & İletişim" };

export default async function Page() {
  const ayarlar = await getAyarlar();
  return <Yardim ayarlar={ayarlar} />;
}
