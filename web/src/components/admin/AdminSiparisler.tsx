"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Banknote,
  BellOff,
  CreditCard,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  StickyNote,
} from "lucide-react";
import { toast } from "sonner";

import { supabaseBrowser } from "@/lib/supabase/client";
import type { Order, OrderStatus, OrderWithItems } from "@/lib/types";
import { ODEME_ETIKET, fiyat, gecenSure, tarih, telefonMaskele, telefonSade } from "@/lib/format";
import { bildirimIzniIste, bildirimIzniVarMi } from "@/lib/bildirim";
import { Button, Segmented, Skeleton, Textarea } from "@/components/ui";
import { Confirm, Sheet } from "@/components/Sheet";
import { PawEmpty } from "@/components/Paws";
import { DURUM, DurumCipi } from "@/components/profil/durum";

type Filtre = "new" | "preparing" | "on_the_way" | "done" | "all";

const FILTRELER: { value: Filtre; label: string }[] = [
  { value: "new", label: "Yeni" },
  { value: "preparing", label: "Hazırlanıyor" },
  { value: "on_the_way", label: "Yolda" },
  { value: "done", label: "Tamamlanan" },
  { value: "all", label: "Tümü" },
];

const SONRAKI: Partial<Record<OrderStatus, { durum: OrderStatus; etiket: string }>> = {
  new: { durum: "preparing", etiket: "Onayla · Hazırlanıyor" },
  preparing: { durum: "on_the_way", etiket: "Yola Çıktı" },
  on_the_way: { durum: "delivered", etiket: "Teslim Edildi" },
};

export function AdminSiparisler({ acilacakSiparis }: { acilacakSiparis?: string }) {
  const [siparisler, setSiparisler] = useState<OrderWithItems[] | null>(null);
  const [filtre, setFiltre] = useState<Filtre>("new");
  const [secili, setSecili] = useState<OrderWithItems | null>(null);
  const [yenileniyor, setYenileniyor] = useState(false);
  const [izinUyari, setIzinUyari] = useState(false);
  const [yeniler, setYeniler] = useState<Set<string>>(new Set());

  const yukle = useCallback(async () => {
    const supabase = supabaseBrowser();
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })
      .limit(200);
    setSiparisler((data as OrderWithItems[]) ?? []);
  }, []);

  useEffect(() => {
    yukle();
  }, [yukle]);

  // bildirim izni — açılışta otomatik iste
  useEffect(() => {
    (async () => {
      if (await bildirimIzniVarMi()) return;
      const ok = await bildirimIzniIste();
      if (!ok) setIzinUyari(true);
    })();
  }, []);

  // canlı güncelleme
  useEffect(() => {
    const supabase = supabaseBrowser();
    const kanal = supabase
      .channel("admin-liste")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, async (payload: { new: Order; eventType: string }) => {
        if (payload.eventType === "INSERT") {
          setYeniler((s) => new Set(s).add(payload.new.id));
          setTimeout(() => setYeniler((s) => {
            const n = new Set(s);
            n.delete(payload.new.id);
            return n;
          }), 12000);
        }
        await yukle();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(kanal);
    };
  }, [yukle]);

  // bildirime tıklayınca gelen sipariş
  useEffect(() => {
    if (!acilacakSiparis || !siparisler) return;
    const o = siparisler.find((x) => x.id === acilacakSiparis);
    if (o) setSecili(o);
  }, [acilacakSiparis, siparisler]);

  // seçili sipariş listeden güncellenirse senkron tut
  useEffect(() => {
    if (!secili || !siparisler) return;
    const guncel = siparisler.find((o) => o.id === secili.id);
    if (guncel && guncel.status !== secili.status) setSecili(guncel);
  }, [siparisler, secili]);

  const liste = useMemo(() => {
    if (!siparisler) return null;
    if (filtre === "all") return siparisler;
    if (filtre === "done") return siparisler.filter((o) => o.status === "delivered" || o.status === "cancelled");
    return siparisler.filter((o) => o.status === filtre);
  }, [siparisler, filtre]);

  const sayilar = useMemo(() => {
    const s = siparisler ?? [];
    return {
      new: s.filter((o) => o.status === "new").length,
      preparing: s.filter((o) => o.status === "preparing").length,
      on_the_way: s.filter((o) => o.status === "on_the_way").length,
    };
  }, [siparisler]);

  async function yenile() {
    setYenileniyor(true);
    await yukle();
    setYenileniyor(false);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
      {izinUyari && (
        <div className="mb-3 flex items-start gap-2.5 rounded-[14px] border border-warn-500/25 bg-warn-50 p-3.5">
          <BellOff className="mt-px size-[18px] shrink-0 text-warn-700" />
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-semibold leading-snug text-warn-700">
              Bildirimler kapalı — yeni sipariş bildirimi alamazsın.
            </p>
            <button
              onClick={async () => {
                if (await bildirimIzniIste()) setIzinUyari(false);
                else toast.info("Telefon ayarlarından Patika Admin için bildirimlere izin ver.");
              }}
              className="mt-1 text-[13px] font-bold text-warn-700 underline"
            >
              İzin ver
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <h1 className="text-[20px] font-bold tracking-tight text-ink-900">Gelen Siparişler</h1>
        <button
          onClick={yenile}
          aria-label="Yenile"
          className="ml-auto flex size-9 items-center justify-center rounded-full text-ink-500 transition hover:bg-ink-100"
        >
          <RefreshCw className={`size-[17px] ${yenileniyor ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="no-scrollbar mt-3 overflow-x-auto">
        <Segmented
          className="min-w-[520px]"
          value={filtre}
          onChange={setFiltre}
          options={FILTRELER.map((f) => ({
            ...f,
            badge:
              f.value === "new" ? sayilar.new : f.value === "preparing" ? sayilar.preparing : f.value === "on_the_way" ? sayilar.on_the_way : 0,
          }))}
        />
      </div>

      <div className="mt-4 space-y-2.5">
        {liste === null ? (
          <>
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </>
        ) : liste.length === 0 ? (
          <div className="flex flex-col items-center rounded-[18px] bg-white px-6 py-14 text-center shadow-soft">
            <PawEmpty className="w-32" />
            <h3 className="mt-4 text-[16px] font-bold text-ink-900">
              {filtre === "new" ? "Yeni sipariş yok" : "Bu listede sipariş yok"}
            </h3>
            <p className="mt-1.5 text-[13.5px] text-ink-500">Yeni sipariş geldiğinde telefonun ötecek.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {liste.map((o) => (
              <motion.button
                key={o.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                onClick={() => setSecili(o)}
                className={`relative block w-full overflow-hidden rounded-[18px] bg-white p-4 text-left shadow-soft transition hover:shadow-lift ${
                  yeniler.has(o.id) ? "ring-2 ring-brand-400" : ""
                }`}
              >
                {o.status === "new" && (
                  <span className={`absolute inset-y-0 left-0 w-1 bg-brand-500 ${yeniler.has(o.id) ? "animate-soft-pulse" : ""}`} />
                )}

                <div className="flex items-start justify-between gap-3 pl-1.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[16px] font-bold text-ink-900">#{o.order_no}</span>
                      <span className="text-[12px] text-ink-400">{gecenSure(o.created_at)}</span>
                    </div>
                    <p className="mt-0.5 truncate text-[14px] font-semibold text-ink-700">{o.customer_name}</p>
                  </div>
                  <DurumCipi durum={o.status} />
                </div>

                <div className="mt-2.5 flex items-center justify-between border-t border-line pl-1.5 pt-2.5">
                  <span className="flex items-center gap-1.5 text-[12.5px] text-ink-400">
                    {o.payment_method === "cash" ? <Banknote className="size-[15px]" /> : <CreditCard className="size-[15px]" />}
                    {o.order_items.length} ürün · {ODEME_ETIKET[o.payment_method]}
                  </span>
                  <span className="text-[17px] font-bold tabular-nums text-ink-900">{fiyat(o.total)}</span>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        )}
      </div>

      <SiparisDetaySheet o={secili} onClose={() => setSecili(null)} onDegisti={yukle} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function SiparisDetaySheet({
  o,
  onClose,
  onDegisti,
}: {
  o: OrderWithItems | null;
  onClose: () => void;
  onDegisti: () => Promise<void>;
}) {
  const [isliyor, setIsliyor] = useState(false);
  const [iptalAcik, setIptalAcik] = useState(false);
  const [sebep, setSebep] = useState("");

  if (!o) return null;

  const a = o.address_snapshot;
  const tel = telefonSade(o.phone);
  const sonraki = SONRAKI[o.status];
  const bitti = o.status === "delivered" || o.status === "cancelled";
  const haritaSorgu = encodeURIComponent(
    [a?.full_address, a?.neighborhood, a?.district, a?.city].filter(Boolean).join(", "),
  );

  async function durumDegistir(durum: OrderStatus) {
    setIsliyor(true);
    const { error } = await supabaseBrowser().rpc("set_order_status", { p_order_id: o!.id, p_status: durum });
    setIsliyor(false);
    if (error) return toast.error("Durum güncellenemedi.");
    toast.success(`Sipariş “${DURUM[durum].etiket}” olarak işaretlendi.`);
    await onDegisti();
  }

  async function iptalEt() {
    setIsliyor(true);
    const { error } = await supabaseBrowser().rpc("cancel_order", { p_order_id: o!.id, p_reason: sebep.trim() });
    setIsliyor(false);
    setIptalAcik(false);
    if (error) return toast.error("Sipariş iptal edilemedi.");
    toast.success("Sipariş iptal edildi, stoklar geri yüklendi.");
    setSebep("");
    await onDegisti();
  }

  return (
    <>
      <Sheet
        open={!!o}
        onClose={onClose}
        title={`Sipariş #${o.order_no}`}
        footer={
          bitti ? (
            <p className="py-1 text-center text-[13.5px] font-semibold text-ink-400">
              {o.status === "delivered" ? "Bu sipariş teslim edildi." : "Bu sipariş iptal edildi."}
            </p>
          ) : (
            <div className="flex gap-2.5">
              <Button tone="outline" onClick={() => setIptalAcik(true)} disabled={isliyor}>
                İptal Et
              </Button>
              {sonraki && (
                <Button full size="lg" loading={isliyor} onClick={() => durumDegistir(sonraki.durum)}>
                  {sonraki.etiket}
                </Button>
              )}
            </div>
          )
        }
      >
        <div className="space-y-4 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[16px] font-bold text-ink-900">{o.customer_name}</p>
              <p className="text-[12.5px] text-ink-400">{tarih(o.created_at)}</p>
            </div>
            <DurumCipi durum={o.status} />
          </div>

          <div className="flex gap-2">
            <a
              href={`tel:0${tel}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-[14px] bg-brand-500 py-3 text-[14px] font-bold text-ink-900 transition hover:bg-brand-400"
            >
              <Phone className="size-[17px]" /> {telefonMaskele(tel)}
            </a>
            <a
              href={`https://wa.me/90${tel}`}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="flex size-12 items-center justify-center rounded-[14px] bg-ok-500 text-white transition hover:brightness-105"
            >
              <MessageCircle className="size-5" />
            </a>
          </div>

          <a
            href={`https://maps.google.com/?q=${haritaSorgu}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-start gap-3 rounded-[16px] bg-ink-50 p-3.5 transition hover:bg-ink-100"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-brand-600 shadow-soft">
              <MapPin className="size-[17px]" />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-bold text-ink-900">{a?.title ?? "Adres"}</span>
              <span className="mt-0.5 block text-[13px] leading-snug text-ink-600">
                {a?.full_address}
                {a?.neighborhood ? `, ${a.neighborhood}` : ""} · {a?.district}/{a?.city}
              </span>
              {a?.directions && <span className="mt-0.5 block text-[12.5px] italic text-ink-400">“{a.directions}”</span>}
              <span className="mt-1 block text-[12px] font-bold text-brand-700">Haritalarda aç →</span>
            </span>
          </a>

          <div className="flex items-center gap-3 rounded-[16px] bg-ink-50 p-3.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-brand-600 shadow-soft">
              {o.payment_method === "cash" ? <Banknote className="size-[17px]" /> : <CreditCard className="size-[17px]" />}
            </span>
            <div>
              <p className="text-[13px] font-bold text-ink-900">Ödeme</p>
              <p className="text-[13px] text-ink-600">{ODEME_ETIKET[o.payment_method]}</p>
            </div>
          </div>

          {o.note && (
            <div className="flex items-start gap-3 rounded-[16px] bg-warn-50 p-3.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-warn-700 shadow-soft">
                <StickyNote className="size-[17px]" />
              </span>
              <div>
                <p className="text-[13px] font-bold text-warn-700">Sipariş notu</p>
                <p className="mt-0.5 text-[13px] leading-snug text-ink-700">{o.note}</p>
              </div>
            </div>
          )}

          <div>
            <h3 className="mb-2 text-[14px] font-bold text-ink-900">Ürünler</h3>
            <div className="space-y-2">
              {o.order_items.map((it) => (
                <div key={it.id} className="flex items-center gap-3 rounded-[14px] bg-white p-2.5 shadow-soft">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[13px] font-bold text-brand-800">
                    {it.qty}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-semibold leading-snug text-ink-900">{it.name_snapshot}</p>
                    <p className="text-[12px] text-ink-400">
                      {it.qty} {it.unit_label_snapshot ?? "adet"} × {fiyat(it.unit_price_snapshot)}
                    </p>
                  </div>
                  <span className="text-[13.5px] font-bold tabular-nums text-ink-900">{fiyat(it.line_total)}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
              <span className="text-[15px] font-bold text-ink-900">Toplam</span>
              <span className="text-[20px] font-bold tabular-nums text-ink-900">{fiyat(o.total)}</span>
            </div>
          </div>

          {o.cancel_reason && (
            <p className="rounded-[14px] bg-bad-50 p-3 text-[13px] text-bad-700">
              <b>İptal sebebi:</b> {o.cancel_reason}
            </p>
          )}
        </div>
      </Sheet>

      <Confirm
        open={iptalAcik}
        onClose={() => setIptalAcik(false)}
        onConfirm={iptalEt}
        loading={isliyor}
        title="Sipariş iptal edilsin mi?"
        text="Ürünlerin stoğu geri yüklenir ve müşteri anında görür."
        confirmLabel="İptal Et"
      >
        <Textarea
          rows={2}
          value={sebep}
          onChange={(e) => setSebep(e.target.value)}
          placeholder="İptal sebebi (müşteri görecek)"
          maxLength={200}
        />
      </Confirm>
    </>
  );
}
