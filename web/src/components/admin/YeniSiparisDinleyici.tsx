"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BellRing, X } from "lucide-react";

import { supabaseBrowser } from "@/lib/supabase/client";
import type { Order } from "@/lib/types";
import { fiyat } from "@/lib/format";
import { bildirimTiklamasiniDinle, sesiHazirla, yeniSiparisBildir } from "@/lib/bildirim";

type Banner = { id: string; no: number; ad: string; tutar: number };

/**
 * Siparişleri canlı dinler. Yeni sipariş gelince:
 * ding sesi + üstten banner + (APK'da) kilit ekranına düşen bildirim.
 */
export function YeniSiparisDinleyici({ onSayi }: { onSayi?: (n: number) => void }) {
  const router = useRouter();
  const [banner, setBanner] = useState<Banner | null>(null);
  const zamanlayici = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ilk dokunuşta sesi hazırla (tarayıcı otomatik oynatma kilidi)
  useEffect(() => {
    const f = () => sesiHazirla();
    window.addEventListener("pointerdown", f, { once: true });
    return () => window.removeEventListener("pointerdown", f);
  }, []);

  // bildirime tıklayınca ilgili sipariş açılsın (APK)
  useEffect(() => {
    return bildirimTiklamasiniDinle((orderId) => router.push(`/admin?siparis=${orderId}`));
  }, [router]);

  useEffect(() => {
    const supabase = supabaseBrowser();

    async function yeniSayisi() {
      const { count } = await supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "new");
      onSayi?.(count ?? 0);
    }

    const kanal = supabase
      .channel("admin-siparisler")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, async (payload: { new: Order }) => {
        const o = payload.new;

        const { count } = await supabase
          .from("order_items")
          .select("id", { count: "exact", head: true })
          .eq("order_id", o.id);

        const govde = `${o.customer_name} · ${count ?? 0} ürün · ${fiyat(Number(o.total))}`;
        void yeniSiparisBildir(`🐾 Yeni Sipariş #${o.order_no}`, govde, o.id);

        setBanner({ id: o.id, no: o.order_no, ad: o.customer_name, tutar: Number(o.total) });
        if (zamanlayici.current) clearTimeout(zamanlayici.current);
        zamanlayici.current = setTimeout(() => setBanner(null), 9000);

        void yeniSayisi();
        router.refresh();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, () => {
        void yeniSayisi();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(kanal);
      if (zamanlayici.current) clearTimeout(zamanlayici.current);
    };
  }, [router, onSayi]);

  return (
    <AnimatePresence>
      {banner && (
        <motion.div
          initial={{ y: -90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -90, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="fixed inset-x-0 top-0 z-[90] px-3 pt-[max(0.75rem,env(safe-area-inset-top))]"
        >
          <button
            onClick={() => {
              router.push(`/admin?siparis=${banner.id}`);
              setBanner(null);
            }}
            className="mx-auto flex w-full max-w-md items-center gap-3 rounded-[18px] bg-ink-900 px-4 py-3 text-left shadow-float"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-ink-900">
              <BellRing className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-bold text-white">🐾 Yeni Sipariş #{banner.no}</span>
              <span className="block truncate text-[12.5px] text-white/70">
                {banner.ad} · {fiyat(banner.tutar)}
              </span>
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                setBanner(null);
              }}
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10"
            >
              <X className="size-4" />
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
