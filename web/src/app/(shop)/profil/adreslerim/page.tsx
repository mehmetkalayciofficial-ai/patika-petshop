import type { Metadata } from "next";
import { Adreslerim } from "@/components/profil/Adreslerim";

export const metadata: Metadata = { title: "Adreslerim" };

export default function Page() {
  return <Adreslerim />;
}
