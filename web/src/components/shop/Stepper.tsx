"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";

/**
 * "+" butonu, sepete eklenince "− n +" adet kontrolüne dönüşür (morph).
 * Yemeksepeti'ndeki davranışın aynısı.
 */
export function Stepper({
  qty,
  stock,
  onAdd,
  onSub,
  size = "md",
  tone = "light",
}: {
  qty: number;
  stock: number;
  onAdd: () => void;
  onSub: () => void;
  size?: "sm" | "md";
  tone?: "light" | "solid";
}) {
  const h = size === "sm" ? "h-8" : "h-9";
  const btn = size === "sm" ? "size-8" : "size-9";
  const ic = size === "sm" ? "size-[15px]" : "size-[17px]";
  const tuketildi = qty >= stock;

  return (
    <div className="relative flex justify-end" onClick={(e) => e.stopPropagation()}>
      <AnimatePresence mode="popLayout" initial={false}>
        {qty === 0 ? (
          <motion.button
            key="add"
            layout
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            onClick={onAdd}
            disabled={stock < 1}
            aria-label="Sepete ekle"
            className={`${btn} flex items-center justify-center rounded-full border border-ink-200 bg-white text-ink-900 shadow-soft transition hover:border-brand-400 hover:bg-brand-50 disabled:opacity-40 disabled:hover:border-ink-200 disabled:hover:bg-white`}
          >
            <Plus className={`${ic} stroke-[2.6]`} />
          </motion.button>
        ) : (
          <motion.div
            key="step"
            layout
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.75 }}
            transition={{ type: "spring", stiffness: 450, damping: 32 }}
            className={`${h} flex items-center gap-0.5 rounded-full shadow-soft ${
              tone === "solid" ? "bg-brand-500" : "border border-brand-300 bg-white"
            }`}
          >
            <motion.button
              whileTap={{ scale: 0.86 }}
              onClick={onSub}
              aria-label="Azalt"
              className={`${btn} flex items-center justify-center rounded-full text-ink-800 transition hover:bg-brand-100/70`}
            >
              <Minus className={`${ic} stroke-[2.6]`} />
            </motion.button>

            <span className="min-w-[18px] text-center text-[14px] font-bold tabular-nums text-ink-900">{qty}</span>

            <motion.button
              whileTap={{ scale: 0.86 }}
              onClick={onAdd}
              disabled={tuketildi}
              aria-label="Artır"
              className={`${btn} flex items-center justify-center rounded-full text-ink-800 transition hover:bg-brand-100/70 disabled:opacity-35`}
            >
              <Plus className={`${ic} stroke-[2.6]`} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
