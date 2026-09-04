import type { Metadata } from "next";
import { Siparislerim } from "@/components/profil/Siparislerim";

export const metadata: Metadata = { title: "Siparişlerim" };

export default function Page() {
  return <Siparislerim />;
}
