import { getAyarlar, getKatalog } from "@/lib/queries";
import { AdminUrunler } from "@/components/admin/AdminUrunler";

export const revalidate = 0;

export default async function Page() {
  const [{ kategoriler }, ayarlar] = await Promise.all([getKatalog(), getAyarlar()]);
  return <AdminUrunler kategoriler={kategoriler} ayarlar={ayarlar} />;
}
