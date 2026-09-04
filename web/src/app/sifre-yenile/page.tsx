import type { Metadata } from "next";
import { SifreYenile } from "@/components/auth/SifreYenile";

export const metadata: Metadata = { title: "Yeni Şifre Belirle" };

export default function Page() {
  return <SifreYenile />;
}
