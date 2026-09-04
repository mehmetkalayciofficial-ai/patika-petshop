import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProfil } from "@/lib/queries";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "Patika Admin", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profil = await getProfil();
  if (!profil || profil.role !== "admin") notFound();
  return <AdminShell profil={profil}>{children}</AdminShell>;
}
