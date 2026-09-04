import { getAyarlar } from "@/lib/queries";
import { ShopShell } from "@/components/shop/ShopShell";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const ayarlar = await getAyarlar();
  return <ShopShell kapali={!(ayarlar?.is_open ?? true)}>{children}</ShopShell>;
}
