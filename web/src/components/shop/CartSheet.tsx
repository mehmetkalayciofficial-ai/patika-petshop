"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { fiyat } from "@/lib/format";
import { Sheet } from "@/components/Sheet";
import { Button, Textarea } from "@/components/ui";
import { PawEmpty, PawIcon } from "@/components/Paws";
import { Stepper } from "./Stepper";

export function CartSheet({
  open,
  onClose,
  not,
  setNot,
  kapali,
}: {
  open: boolean;
  onClose: () => void;
  not: string;
  setNot: (v: string) => void;
  kapali?: boolean;
}) {
  const { lines, toplam, adet, ayarla, sil } = useCart();

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={`Sepetim${adet ? ` · ${adet} ürün` : ""}`}
      footer={
        lines.length ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[14px] text-ink-500">
              <span>Ara toplam</span>
              <span className="font-semibold text-ink-700 tabular-nums">{fiyat(toplam)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-bold text-ink-900">Toplam</span>
              <motion.span key={toplam} className="animate-pop text-[20px] font-bold text-ink-900 tabular-nums">
                {fiyat(toplam)}
              </motion.span>
            </div>
            {kapali ? (
              <Button full size="lg" disabled>
                Şu an sipariş alamıyoruz
              </Button>
            ) : (
              <Link href="/siparis" onClick={onClose} className="block">
                <Button full size="lg">
                  Siparişi Tamamla
                </Button>
              </Link>
            )}
          </div>
        ) : null
      }
    >
      {lines.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <PawEmpty className="w-36" />
          <h3 className="mt-4 text-[17px] font-bold text-ink-900">Sepetin boş</h3>
          <p className="mt-1.5 max-w-[240px] text-[13.5px] leading-relaxed text-ink-500">
            Patili dostun için birkaç şey ekleyelim mi?
          </p>
          <Button tone="outline" className="mt-5" onClick={onClose}>
            Ürünlere göz at
          </Button>
        </div>
      ) : (
        <div className="px-4 py-3">
          <AnimatePresence initial={false}>
            {lines.map((l) => (
              <motion.div
                key={l.productId}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="mb-2 flex items-center gap-3 rounded-[16px] bg-white p-2.5 shadow-soft">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-[12px] bg-ink-50">
                    {l.image ? (
                      <Image src={l.image} alt={l.name} fill sizes="64px" className="object-cover" />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-brand-50">
                        <PawIcon className="size-6 text-brand-300" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="line-clamp-2 text-[14px] font-semibold leading-snug text-ink-900">{l.name}</h4>
                    <p className="mt-0.5 text-[12.5px] text-ink-400">
                      {fiyat(l.price)} / {l.unitLabel}
                    </p>
                    <p className="mt-1 text-[14px] font-bold text-ink-900 tabular-nums">{fiyat(l.price * l.qty)}</p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <button
                      onClick={() => sil(l.productId)}
                      aria-label={`${l.name} ürününü sil`}
                      className="flex size-7 items-center justify-center rounded-full text-ink-300 transition hover:bg-bad-50 hover:text-bad-500"
                    >
                      <Trash2 className="size-[15px]" />
                    </button>
                    <Stepper
                      qty={l.qty}
                      stock={999}
                      size="sm"
                      onAdd={() => ayarla(l.productId, l.qty + 1)}
                      onSub={() => ayarla(l.productId, l.qty - 1)}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="mt-3">
            <label className="mb-1.5 block text-[13px] font-semibold text-ink-700">Sipariş notu</label>
            <Textarea
              rows={2}
              value={not}
              onChange={(e) => setNot(e.target.value)}
              placeholder="Örn. kapıyı çalmayın, zili kullanın"
              maxLength={300}
            />
          </div>
        </div>
      )}
    </Sheet>
  );
}
