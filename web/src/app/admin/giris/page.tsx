import type { Metadata } from "next";
import { AdminGiris } from "@/components/admin/AdminGiris";

export const metadata: Metadata = { title: "Patika Admin — Giriş", robots: { index: false, follow: false } };

export default function Page() {
  return <AdminGiris />;
}
