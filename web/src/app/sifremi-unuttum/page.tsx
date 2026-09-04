import type { Metadata } from "next";
import { SifremiUnuttum } from "@/components/auth/SifremiUnuttum";

export const metadata: Metadata = { title: "Şifremi Unuttum" };

export default function Page() {
  return <SifremiUnuttum />;
}
