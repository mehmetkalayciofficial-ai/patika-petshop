"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Banknote, ChevronLeft, CreditCard, MapPin, RotateCcw, StickyNote } from "lucide-react";
import { toast } from "sonner";

import { supabaseBrowser } from "@/lib/supabase/client";
import { useCart } from "@/lib/cart";
import type { Order, OrderWithItems, Product } from "@/lib/types";
import { ODEME_ETIKET, fiyat, tarih } from "@/lib/format";
import { Button, Skeleton } from "@/components/ui";
import { PawIcon } from "@/components/Paws";
import { DURUM, DURUM_SIRA, DurumCipi } from "./durum";

export function SiparisDetay({ id }: { id: string }) {
  const router = useRouter();
  const { ekle } = useCart();
  const [o, setO] = useState<OrderWithItems | null | false>(null);
  const [tekrar, setTekrar] = useState(false);

  useEffect(() => {
    const supabase = supabaseBrowser();

    async function yukle() {
      const { data } = await supabase.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle();
      setO((data as OrderWithItems | null) ?? false);
    }
    yukle();

    const kanal = supabase
      .channel(`siparis-${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` }, (payload: { new: Order }) => {
        setO((p) => (p ? { ...(p as OrderWithItems), ...(payload.new as Order) } : p));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(kanal);
    };
  }, [id]);

  async function tekrarSiparis() {
    if (!o) return;
    setTekrar(true);
    const supabase = supabaseBrowser();
    const idler = o.order_items.map((i) => i.product_id).filter(Boolean) as string[];
    const { data } = await supabase.from("products").select("*").in("id", idler);
    const urunler = (data as Product[]) ?? [];

    let eklendi = 0;
    const eksik: string[] = [];
    for (const it of o.order_items) {
      const p = urunler.find((x) => x.id === it.product_id);
      if (!p || !p.is_active || p.stock < 1) {
        eksik.push(it.name_snapshot);
        continue;
      }
      ekle(p, Math.min(it.qty, p.stock));
      eklendi++;
    }

    setTekrar(false);
    if (eklendi === 0) return toast.error("Bu siparişteki ürünlerin hiçbiri şu an stokta değil.");
    if (eksik.length) toast.warning(`${eksik.join(", ")} şu an stokta yok, eklenmedi.`);
    toast.success(`${eklendi} ürün sepete eklendi.`);
    router.push("/urunler#sepet");
  }

  if (o === null) {
    return (
      <div className="mx-auto max-w-2xl space-y-3 px-4 py-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-52 w-full" />
      </div>
    );
  }

  if (o === false) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-[18px] font-bold text-ink-900">Sipariş bulunamadı</h1>
        <Link href="/profil/siparislerim" className="mt-4 inline-block text-[14px] font-semibold text-brand-700 underline">
          Siparişlerime dön
        </Link>
      </div>
    );
  }

  const iptal = o.status === "cancelled";
  const aktifIndex = DURUM_SIRA.indexOf(o.status);
  const a = o.address_snapshot;

  return (
    <motion.div
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.26 }}
      className="mx-auto max-w-2xl px-4 pb-28 pt-4 sm:px-6 sm:pb-16"
    >
      <Link href="/profil/siparislerim" className="mb-3 inline-flex items-center gap-1 text-[14px] font-semibold text-ink-500 transition hover:text-ink-800">
        <ChevronLeft className="size-4" /> Siparişlerim
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-ink-900">Sipariş #{o.order_no}</h1>
          <p className="mt-0.5 text-[13px] text-ink-400">{tarih(o.created_at)}</p>
        </div>
        <DurumCipi durum={o.status} />
      </div>

      {/* Durum zaman çizelgesi */}
      <section className="mt-4 rounded-[18px] bg-white p-5 shadow-soft">
        {iptal ? (
          <div className="flex items-start gap-3">
            <span className="mt-1 size-3 shrink-0 rounded-full bg-bad-500" />
            <div>
              <p className="text-[14.5px] font-bold text-bad-600">Sipariş iptal edildi</p>
              {o.cancel_reason && <p className="mt-1 text-[13px] text-ink-500">{o.cancel_reason}</p>}
              <p className="mt-1 text-[12.5px] text-ink-400">{tarih(o.updated_at)}</p>
            </div>
          </div>
        ) : (
          <ol className="relative">
            {DURUM_SIRA.map((d, i) => {
              const gecti = i <= aktifIndex;
              const suan = i === aktifIndex;
              return (
                <li key={d} className="relative flex gap-3.5 pb-5 last:pb-0">
                  {i < DURUM_SIRA.length - 1 && (
                    <span className={`absolute left-[5.5px] top-4 h-full w-0.5 ${i < aktifIndex ? "bg-brand-400" : "bg-ink-150 bg-ink-100"}`} />
                  )}
                  <span className="relative z-10 mt-1 flex size-3 shrink-0 items-center justify-center">
                    <span className={`size-3 rounded-full ${gecti ? DURUM[d].nokta : "bg-ink-200"}`} />
                    {suan && <span className={`absolute size-3 rounded-full ${DURUM[d].nokta} animate-soft-pulse`} />}
                  </span>
                  <div className="-mt-0.5">
                    <p className={`text-[14.5px] font-semibold ${gecti ? "text-ink-900" : "text-ink-400"}`}>{DURUM[d].etiket}</p>
                    {suan && <p className="mt-0.5 text-[12.5px] text-ink-400">{tarih(o.updated_at)}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {/* Ürünler */}
      <section className="mt-4 rounded-[18px] bg-white p-4 shadow-soft sm:p-5">
        <h2 className="mb-3 text-[15px] font-bold text-ink-900">Ürünler</h2>
        <div className="space-y-3">
          {o.order_items.map((it) => (
            <div key={it.id} className="flex items-center gap-3">
              <div className="relative size-12 shrink-0 overflow-hidden rounded-[11px] bg-ink-50">
                {it.image_snapshot ? (
                  <Image src={it.image_snapshot} alt="" fill sizes="48px" className="object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center bg-brand-50">
                    <PawIcon className="size-5 text-brand-300" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold leading-snug text-ink-900">{it.name_snapshot}</p>
                <p className="mt-0.5 text-[12.5px] text-ink-400">
                  {it.qty} {it.unit_label_snapshot ?? "adet"} × {fiyat(it.unit_price_snapshot)}
                </p>
              </div>
              <span className="text-[14px] font-bold tabular-nums text-ink-900">{fiyat(it.line_total)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-line pt-3">
          <div className="flex items-center justify-between text-[13.5px] text-ink-500">
            <span>Ara toplam</span>
            <span className="font-semibold tabular-nums text-ink-700">{fiyat(o.subtotal)}</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-[15px] font-bold text-ink-900">Toplam</span>
            <span className="text-[19px] font-bold tabular-nums text-ink-900">{fiyat(o.total)}</span>
          </div>
        </div>
      </section>

      {/* Teslimat */}
      <section className="mt-4 space-y-3 rounded-[18px] bg-white p-4 shadow-soft sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <MapPin className="size-[17px]" />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-ink-900">{a?.title ?? "Teslimat adresi"}</p>
            <p className="mt-0.5 text-[13px] leading-snug text-ink-500">
              {a?.full_address}
              {a?.neighborhood ? `, ${a.neighborhood}` : ""} · {a?.district}/{a?.city}
            </p>
            {a?.directions && <p className="mt-0.5 text-[12.5px] italic text-ink-400">“{a.directions}”</p>}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            {o.payment_method === "cash" ? <Banknote className="size-[17px]" /> : <CreditCard className="size-[17px]" />}
          </span>
          <div>
            <p className="text-[13px] font-bold text-ink-900">Ödeme</p>
            <p className="mt-0.5 text-[13px] text-ink-500">{ODEME_ETIKET[o.payment_method]}</p>
          </div>
        </div>

        {o.note && (
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <StickyNote className="size-[17px]" />
            </span>
            <div>
              <p className="text-[13px] font-bold text-ink-900">Sipariş notu</p>
              <p className="mt-0.5 text-[13px] leading-snug text-ink-500">{o.note}</p>
            </div>
          </div>
        )}
      </section>

      <Button full size="lg" tone="outline" className="mt-4" loading={tekrar} onClick={tekrarSiparis}>
        <RotateCcw className="size-4" /> Tekrar Sipariş Ver
      </Button>
    </motion.div>
  );
}
