import { AdminSiparisler } from "@/components/admin/AdminSiparisler";

export const revalidate = 0;

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ siparis?: string }> }) {
  const { siparis } = await searchParams;
  return <AdminSiparisler acilacakSiparis={siparis} />;
}
