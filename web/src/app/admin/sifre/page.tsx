import { getProfil } from "@/lib/queries";
import { AdminSifre } from "@/components/admin/AdminSifre";

export default async function Page() {
  const profil = await getProfil();
  return <AdminSifre email={profil?.email ?? ""} />;
}
