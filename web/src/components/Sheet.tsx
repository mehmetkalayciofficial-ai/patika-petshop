"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

/**
 * Mobilde alttan tam boy sheet (sürükleyerek kapanır),
 * masaüstünde sağdan drawer.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
  side = "auto",
  maxWidth = 480,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  side?: "auto" | "bottom";
  maxWidth?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", esc);
    };
  }, [open, onClose]);

  const drawer = side === "auto";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink-900/45 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 700) onClose();
            }}
            className={`absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col overflow-hidden rounded-t-[24px] bg-white shadow-float ${
              drawer ? "sm:hidden" : ""
            }`}
          >
            <div className="flex shrink-0 justify-center pt-2.5 pb-1">
              <div className="h-1 w-10 rounded-full bg-ink-200" />
            </div>
            {title && (
              <div className="flex shrink-0 items-center justify-between gap-3 px-5 pb-3 pt-1">
                <h2 className="text-[17px] font-bold text-ink-900">{title}</h2>
                <button onClick={onClose} aria-label="Kapat" className="flex size-9 items-center justify-center rounded-full bg-ink-100 text-ink-600 transition hover:bg-ink-200">
                  <X className="size-[18px]" />
                </button>
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
            {footer && <div className="shrink-0 border-t border-line bg-white px-5 pt-3.5 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</div>}
          </motion.div>

          {drawer && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ maxWidth }}
              className="absolute inset-y-0 right-0 hidden w-full flex-col overflow-hidden bg-white shadow-float sm:flex"
            >
              {title && (
                <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-6 py-4">
                  <h2 className="text-[17px] font-bold text-ink-900">{title}</h2>
                  <button onClick={onClose} aria-label="Kapat" className="flex size-9 items-center justify-center rounded-full bg-ink-100 text-ink-600 transition hover:bg-ink-200">
                    <X className="size-[18px]" />
                  </button>
                </div>
              )}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
              {footer && <div className="shrink-0 border-t border-line bg-white px-6 py-4">{footer}</div>}
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}

/** Küçük onay penceresi. */
export function Confirm({
  open,
  onClose,
  onConfirm,
  title,
  text,
  confirmLabel = "Evet",
  tone = "danger",
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  text?: string;
  confirmLabel?: string;
  tone?: "danger" | "primary";
  loading?: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-5">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink-900/45 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 4 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="relative w-full max-w-[360px] rounded-[22px] bg-white p-6 shadow-float"
          >
            <h3 className="text-[17px] font-bold text-ink-900">{title}</h3>
            {text && <p className="mt-2 text-[14px] leading-relaxed text-ink-500">{text}</p>}
            <div className="mt-5 flex gap-2.5">
              <button
                onClick={onClose}
                className="h-11 flex-1 rounded-[14px] border border-ink-200 text-[15px] font-semibold text-ink-700 transition hover:bg-ink-50"
              >
                Vazgeç
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`h-11 flex-1 rounded-[14px] text-[15px] font-semibold text-white transition disabled:opacity-60 ${
                  tone === "danger" ? "bg-bad-500 hover:brightness-105" : "bg-brand-500 !text-ink-900 hover:bg-brand-400"
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
