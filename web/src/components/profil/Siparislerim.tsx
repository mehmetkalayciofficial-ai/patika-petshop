"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Banknote, CreditCard } from "lucide-react";

import { supabaseBrowser } from "@/lib/supabase/client";
import type { Order, OrderWithItems } from "@/lib/types";
import { fiyat, gecenSure, tarih } from "@/lib/format";
import { Skeleton } from "@/components/ui";
import { PawEmpty } from "@/components/Paws";
import { AltSayfa } from "./Shell";
import { DurumCipi } from "./durum";

export function Siparislerim() {
  const [siparisler, setSiparisler] = useState<OrderWithItems[] | null>(null);

  useEffect(() => {
    const supabase = supabaseBrowser();

    async function yukle() {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });
      setSiparisler((data as OrderWithItems[]) ?? []);
    }
    yukle();

    // durum değişikliklerini canlı yansıt
    const kanal = supabase
      .channel("siparislerim")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, (payload: { new: Order }) => {
        const yeni = payload.new as Order;
        setSiparisler((p) => (p ?? []).map((o) => (o.id === yeni.id ? { ...o, ...yeni } : o)));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(kanal);
    };
  }, []);

  return (
    <AltSayfa baslik="Siparişlerim" aciklama="Yeniden eskiye tüm siparişlerin.">
      {siparisler === null ? (
        <div className="space-y-2.5">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : siparisler.length === 0 ? (
        <div className="flex flex-col items-center rounded-[18px] bg-white px-6 py-14 text-center shadow-soft">
          <PawEmpty className="w-32" />
          <h3 className="mt-4 text-[16px] font-bold text-ink-900">Henüz siparişin yok</h3>
          <p className="mt-1.5 max-w-[240px] text-[13.5px] leading-relaxed text-ink-500">
            İlk siparişini verdiğinde burada göreceksin.
          </p>
          <Link href="/urunler" className="mt-5 rounded-[14px] bg-brand-500 px-5 py-2.5 text-[14px] font-bold text-ink-900">
            Ürünlere göz at
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {siparisler.map((o, i) => (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.3) }}
            >
              <Link
                href={`/profil/siparislerim/${o.id}`}
                className="block rounded-[18px] bg-white p-4 shadow-soft transition hover:shadow-lift"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-bold text-ink-900">#{o.order_no}</span>
                      <span className="text-[12px] text-ink-400">{gecenSure(o.created_at)}</span>
                    </div>
                    <p className="mt-0.5 text-[12.5px] text-ink-400">{tarih(o.created_at)}</p>
                  </div>
                  <DurumCipi durum={o.status} />
                </div>

                <p className="mt-2.5 line-clamp-1 text-[13px] text-ink-500">
                  {o.order_items.map((it) => `${it.qty}× ${it.name_snapshot}`).join(" · ")}
                </p>

                <div className="mt-2.5 flex items-center justify-between border-t border-line pt-2.5">
                  <span className="flex items-center gap-1.5 text-[12.5px] text-ink-400">
                    {o.payment_method === "cash" ? <Banknote className="size-[15px]" /> : <CreditCard className="size-[15px]" />}
                    {o.order_items.length} ürün
                  </span>
                  <span className="text-[16px] font-bold tabular-nums text-ink-900">{fiyat(o.total)}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </AltSayfa>
  );
}
