"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { fiyat } from "@/lib/format";

/** Alttan kayan sepet çubuğu — alt tab bar'ın üstünde durur. */
export function CartBar({ onOpen, gizli }: { onOpen: () => void; gizli?: boolean }) {
  const { adet, toplam } = useCart();
  const gorunur = adet > 0 && !gizli;

  return (
    <AnimatePresence>
      {gorunur && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[55] px-4 pb-[calc(env(safe-area-inset-bottom)+4.25rem)] sm:pb-5"
        >
          <motion.button
            whileTap={{ scale: 0.985 }}
            onClick={onOpen}
            className="pointer-events-auto mx-auto flex h-14 w-full max-w-md items-center gap-3 rounded-full bg-brand-500 pl-5 pr-4 text-ink-900 shadow-[0_8px_28px_rgba(240,180,41,.45)] transition hover:bg-brand-400"
          >
            <span className="relative flex size-8 items-center justify-center rounded-full bg-ink-900/10">
              <ShoppingBag className="size-[18px]" />
            </span>
            <span className="flex-1 text-left">
              <span className="block text-[15px] font-bold leading-tight">Sepete git</span>
              <motion.span key={adet} className="animate-pop block text-[12px] font-semibold leading-tight opacity-70">
                {adet} ürün
              </motion.span>
            </span>
            <motion.span key={toplam} className="animate-pop text-[16px] font-bold tabular-nums">
              {fiyat(toplam)}
            </motion.span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
