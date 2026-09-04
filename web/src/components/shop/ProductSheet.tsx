"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Product } from "@/lib/types";
import { fiyat, gecerliFiyat, indirimYuzde } from "@/lib/format";
import { Sheet } from "@/components/Sheet";
import { Button } from "@/components/ui";
import { PawIcon } from "@/components/Paws";

export function ProductSheet({
  p,
  open,
  onClose,
  onAdd,
  mevcutAdet,
}: {
  p: Product | null;
  open: boolean;
  onClose: () => void;
  onAdd: (adet: number) => void;
  mevcutAdet: number;
}) {
  const [adet, setAdet] = useState(1);
  const [aktifGorsel, setAktifGorsel] = useState(0);

  useEffect(() => {
    if (open) {
      setAdet(1);
      setAktifGorsel(0);
    }
  }, [open, p?.id]);

  if (!p) return null;

  const gorseller = [p.image_url, ...(Array.isArray(p.images) ? p.images : [])].filter(Boolean) as string[];
  const tukendi = p.stock < 1;
  const tavan = Math.max(0, p.stock - mevcutAdet);
  const indirim = indirimYuzde(p);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      side="bottom"
      footer={
        <Button
          full
          size="lg"
          disabled={tukendi || tavan < 1}
          onClick={() => {
            onAdd(adet);
            onClose();
          }}
        >
          {tukendi ? "Tükendi" : tavan < 1 ? "Stok sınırına ulaştın" : `Sepete Ekle · ${fiyat(gecerliFiyat(p) * adet)}`}
        </Button>
      }
    >
      <div className="relative aspect-[4/3] w-full bg-ink-50">
        {gorseller.length ? (
          <>
            <Image
              key={gorseller[aktifGorsel]}
              src={gorseller[aktifGorsel]}
              alt={p.name}
              fill
              sizes="(max-width: 640px) 100vw, 480px"
              className={`object-cover ${tukendi ? "grayscale opacity-60" : ""}`}
            />
            {gorseller.length > 1 && (
              <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
                {gorseller.map((g, i) => (
                  <button
                    key={g}
                    onClick={() => setAktifGorsel(i)}
                    aria-label={`Görsel ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${i === aktifGorsel ? "w-5 bg-white" : "w-1.5 bg-white/60"}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex size-full items-center justify-center bg-brand-50">
            <PawIcon className="size-20 text-brand-200" />
          </div>
        )}
        {indirim > 0 && (
          <span className="absolute left-4 top-4 rounded-full bg-clay-500 px-2.5 py-1 text-[12px] font-bold text-white shadow-lift">
            %{indirim} indirim
          </span>
        )}
      </div>

      <div className="px-5 py-5">
        <h2 className="text-[20px] font-bold leading-tight text-ink-900">{p.name}</h2>
        {p.description && <p className="mt-2 text-[14px] leading-relaxed text-ink-500">{p.description}</p>}

        <div className="mt-4 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <span className="text-[24px] font-bold text-ink-900">{fiyat(gecerliFiyat(p))}</span>
          {indirim > 0 && <span className="text-[15px] text-ink-400 line-through">{fiyat(p.price)}</span>}
          <span className="text-[13px] text-ink-400">/ {p.unit_label}</span>
        </div>

        <div className="mt-3">
          {tukendi ? (
            <span className="rounded-full bg-ink-200 px-2.5 py-1 text-[12px] font-bold text-ink-600">Tükendi</span>
          ) : p.stock <= 3 ? (
            <span className="rounded-full bg-warn-50 px-2.5 py-1 text-[12px] font-bold text-warn-700">Son {p.stock} adet</span>
          ) : (
            <span className="rounded-full bg-ok-50 px-2.5 py-1 text-[12px] font-bold text-ok-700">Stokta var</span>
          )}
        </div>

        {!tukendi && tavan > 0 && (
          <div className="mt-5 flex items-center justify-between rounded-[16px] bg-ink-50 p-2.5">
            <span className="pl-2 text-[14px] font-semibold text-ink-700">Adet</span>
            <div className="flex items-center gap-1 rounded-full bg-white p-1 shadow-soft">
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => setAdet((a) => Math.max(1, a - 1))}
                disabled={adet <= 1}
                aria-label="Azalt"
                className="flex size-9 items-center justify-center rounded-full text-ink-800 transition hover:bg-brand-100 disabled:opacity-35"
              >
                −
              </motion.button>
              <span className="min-w-[26px] text-center text-[16px] font-bold tabular-nums">{adet}</span>
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => setAdet((a) => Math.min(tavan, a + 1))}
                disabled={adet >= tavan}
                aria-label="Artır"
                className="flex size-9 items-center justify-center rounded-full text-ink-800 transition hover:bg-brand-100 disabled:opacity-35"
              >
                +
              </motion.button>
            </div>
          </div>
        )}

        {mevcutAdet > 0 && (
          <p className="mt-3 text-center text-[13px] text-ink-500">
            Sepetinde zaten <b className="text-ink-800">{mevcutAdet}</b> {p.unit_label} var.
          </p>
        )}
      </div>
    </Sheet>
  );
}
