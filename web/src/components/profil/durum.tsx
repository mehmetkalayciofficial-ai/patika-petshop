import type { OrderStatus } from "@/lib/types";

export const DURUM_SIRA: OrderStatus[] = ["new", "preparing", "on_the_way", "delivered"];

export const DURUM: Record<OrderStatus, { etiket: string; renk: string; nokta: string }> = {
  new: { etiket: "Alındı", renk: "bg-brand-100 text-brand-800", nokta: "bg-brand-500" },
  preparing: { etiket: "Hazırlanıyor", renk: "bg-warn-50 text-warn-700", nokta: "bg-warn-500" },
  on_the_way: { etiket: "Yolda", renk: "bg-clay-50 text-clay-700", nokta: "bg-clay-500" },
  delivered: { etiket: "Teslim Edildi", renk: "bg-ok-50 text-ok-700", nokta: "bg-ok-500" },
  cancelled: { etiket: "İptal Edildi", renk: "bg-bad-50 text-bad-700", nokta: "bg-bad-500" },
};

export function DurumCipi({ durum }: { durum: OrderStatus }) {
  const d = DURUM[durum];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold ${d.renk}`}>
      <span className={`size-1.5 rounded-full ${d.nokta}`} />
      {d.etiket}
    </span>
  );
}
