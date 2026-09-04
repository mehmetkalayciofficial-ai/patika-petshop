"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { Product } from "@/lib/types";
import { fiyat, gecerliFiyat, indirimYuzde } from "@/lib/format";
import { Stepper } from "./Stepper";
import { PawIcon } from "@/components/Paws";

/* ------------------------------------------------------------------ */
/*  Ortak parçalar                                                    */
/* ------------------------------------------------------------------ */

function Gorsel({ p, className = "" }: { p: Product; className?: string }) {
  const tukendi = p.stock < 1;
  return (
    <div className={`relative overflow-hidden rounded-[14px] bg-ink-50 ${className}`}>
      {p.image_url ? (
        <Image
          src={p.image_url}
          alt={p.name}
          fill
          sizes="(max-width: 640px) 96px, 300px"
          className={`object-cover transition duration-300 ${tukendi ? "grayscale opacity-55" : ""}`}
        />
      ) : (
        <div className="flex size-full items-center justify-center bg-brand-50">
          <PawIcon className="size-1/3 text-brand-300" />
        </div>
      )}
    </div>
  );
}

function Fiyat({ p, buyuk = false }: { p: Product; buyuk?: boolean }) {
  const indirim = indirimYuzde(p);
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className={`font-bold text-ink-900 ${buyuk ? "text-[20px]" : "text-[15px]"}`}>{fiyat(gecerliFiyat(p))}</span>
      {indirim > 0 && (
        <>
          <span className={`text-ink-400 line-through ${buyuk ? "text-[14px]" : "text-[12.5px]"}`}>{fiyat(p.price)}</span>
          <span className="rounded-md bg-clay-500 px-1.5 py-px text-[11px] font-bold text-white">%{indirim}</span>
        </>
      )}
    </div>
  );
}

function StokEtiketi({ p }: { p: Product }) {
  if (p.stock < 1) {
    return <span className="rounded-full bg-ink-200 px-2 py-0.5 text-[11px] font-bold text-ink-600">Tükendi</span>;
  }
  if (p.stock <= 3) {
    return <span className="rounded-full bg-warn-50 px-2 py-0.5 text-[11px] font-bold text-warn-700">Son {p.stock} adet</span>;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  Mobil — yatay satır (Yemeksepeti tarzı)                           */
/* ------------------------------------------------------------------ */

export function ProductRow({
  p,
  qty,
  onAdd,
  onSub,
  onOpen,
  duzenleme,
  onEdit,
  onLongPress,
}: {
  p: Product;
  qty: number;
  onAdd: () => void;
  onSub: () => void;
  onOpen: () => void;
  duzenleme?: boolean;
  onEdit?: () => void;
  onLongPress?: () => void;
}) {
  const tukendi = p.stock < 1;
  return (
    <motion.article
      layout
      onClick={duzenleme ? onEdit : onOpen}
      onContextMenu={
        duzenleme && onLongPress
          ? (e) => {
              e.preventDefault();
              onLongPress();
            }
          : undefined
      }
      className="group relative flex cursor-pointer items-center gap-3.5 rounded-[16px] bg-white p-3 shadow-soft transition-shadow duration-200 hover:shadow-lift"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="text-[15px] font-semibold leading-snug text-ink-900">{p.name}</h3>
          {!p.is_active && (
            <span className="rounded-full bg-ink-200 px-2 py-0.5 text-[10.5px] font-bold text-ink-600">Pasif</span>
          )}
        </div>
        {p.description && (
          <p className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-ink-500">{p.description}</p>
        )}
        <div className="mt-2 flex items-center gap-2">
          <Fiyat p={p} />
          <span className="text-[12px] text-ink-400">/ {p.unit_label}</span>
        </div>
        <div className="mt-1.5 empty:hidden">
          <StokEtiketi p={p} />
        </div>
      </div>

      <div className="relative shrink-0">
        <Gorsel p={p} className="size-[88px]" />
        {duzenleme && <DuzenleKatmani />}
        {!duzenleme && (
          <div className="absolute -bottom-1.5 -right-1.5">
            <Stepper qty={qty} stock={p.stock} onAdd={onAdd} onSub={onSub} />
          </div>
        )}
      </div>

      {tukendi && !duzenleme && <span className="pointer-events-none absolute inset-0 rounded-[16px] bg-white/45" />}
    </motion.article>
  );
}

/* ------------------------------------------------------------------ */
/*  Masaüstü — dikey kart                                             */
/* ------------------------------------------------------------------ */

export function ProductTile({
  p,
  qty,
  onAdd,
  onSub,
  onOpen,
  duzenleme,
  onEdit,
  onLongPress,
}: {
  p: Product;
  qty: number;
  onAdd: () => void;
  onSub: () => void;
  onOpen: () => void;
  duzenleme?: boolean;
  onEdit?: () => void;
  onLongPress?: () => void;
}) {
  const tukendi = p.stock < 1;
  return (
    <motion.article
      layout
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onClick={duzenleme ? onEdit : onOpen}
      onContextMenu={
        duzenleme && onLongPress
          ? (e) => {
              e.preventDefault();
              onLongPress();
            }
          : undefined
      }
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-[18px] bg-white p-3 shadow-soft transition-shadow duration-200 hover:shadow-lift"
    >
      <div className="relative">
        <Gorsel p={p} className="aspect-square w-full" />
        {duzenleme && <DuzenleKatmani />}
        <div className="absolute left-2 top-2 empty:hidden">
          <StokEtiketi p={p} />
        </div>
      </div>

      <div className="flex flex-1 flex-col pt-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="text-[15px] font-semibold leading-snug text-ink-900">{p.name}</h3>
          {!p.is_active && (
            <span className="rounded-full bg-ink-200 px-2 py-0.5 text-[10.5px] font-bold text-ink-600">Pasif</span>
          )}
        </div>
        {p.description && <p className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-ink-500">{p.description}</p>}

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            <Fiyat p={p} />
            <span className="text-[12px] text-ink-400">/ {p.unit_label}</span>
          </div>
          {!duzenleme && <Stepper qty={qty} stock={p.stock} onAdd={onAdd} onSub={onSub} />}
        </div>
      </div>

      {tukendi && !duzenleme && <span className="pointer-events-none absolute inset-0 rounded-[18px] bg-white/45" />}
    </motion.article>
  );
}

/* ------------------------------------------------------------------ */

function DuzenleKatmani() {
  return (
    <>
      <span className="pointer-events-none absolute inset-0 rounded-[14px] bg-ink-900/12" />
      <span className="absolute -right-1.5 -top-1.5 flex size-7 items-center justify-center rounded-full bg-white text-ink-700 shadow-lift ring-1 ring-ink-100">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className="size-[14px]">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </span>
    </>
  );
}
