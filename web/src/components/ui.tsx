"use client";

import { forwardRef, useId, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { motion, type HTMLMotionProps } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Buton                                                             */
/* ------------------------------------------------------------------ */

type Tone = "primary" | "ghost" | "outline" | "danger" | "clay";
const TONE: Record<Tone, string> = {
  primary:
    "bg-brand-500 text-ink-900 hover:bg-brand-400 active:bg-brand-600 shadow-[0_2px_10px_rgba(240,180,41,.35)] disabled:shadow-none",
  clay: "bg-clay-500 text-white hover:bg-clay-400 active:bg-clay-600",
  outline: "border border-ink-200 bg-white text-ink-800 hover:bg-ink-50 active:bg-ink-100",
  ghost: "text-ink-700 hover:bg-ink-100 active:bg-ink-200",
  danger: "bg-bad-500 text-white hover:brightness-105 active:brightness-95",
};

export const Button = forwardRef<
  HTMLButtonElement,
  Omit<HTMLMotionProps<"button">, "ref"> & {
    tone?: Tone;
    loading?: boolean;
    full?: boolean;
    size?: "sm" | "md" | "lg";
  }
>(function Button(
  { tone = "primary", loading, full, size = "md", className = "", children, disabled, ...rest },
  ref,
) {
  const pad = size === "sm" ? "h-9 px-3.5 text-[13px]" : size === "lg" ? "h-13 px-6 text-[16px]" : "h-11 px-4.5 text-[15px]";
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      disabled={disabled || loading}
      className={`inline-flex select-none items-center justify-center gap-2 rounded-[14px] font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-55 ${pad} ${TONE[tone]} ${full ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children as React.ReactNode}
    </motion.button>
  );
});

/* ------------------------------------------------------------------ */
/*  Alan / Input                                                      */
/* ------------------------------------------------------------------ */

export function Field({
  label,
  hata,
  ipucu,
  children,
  sag,
}: {
  label?: string;
  hata?: string;
  ipucu?: string;
  children: React.ReactNode;
  sag?: React.ReactNode;
}) {
  return (
    <div className="w-full">
      {(label || sag) && (
        <div className="mb-1.5 flex items-center justify-between gap-2">
          {label && <span className="text-[13px] font-semibold text-ink-700">{label}</span>}
          {sag}
        </div>
      )}
      {children}
      {hata ? (
        <motion.p
          initial={{ opacity: 0, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-[12.5px] font-medium text-bad-500"
        >
          {hata}
        </motion.p>
      ) : ipucu ? (
        <p className="mt-1.5 text-[12.5px] text-ink-400">{ipucu}</p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { hatali?: boolean; ikon?: React.ReactNode }>(
  function Input({ className = "", hatali, ikon, ...rest }, ref) {
    return (
      <div className="relative">
        {ikon && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">{ikon}</span>}
        <input
          ref={ref}
          className={`h-12 w-full rounded-[14px] border bg-white px-4 text-[15px] text-ink-900 outline-none transition placeholder:text-ink-400 focus:ring-4 disabled:bg-ink-50 disabled:text-ink-400 ${
            hatali
              ? "border-bad-500/60 focus:border-bad-500 focus:ring-bad-500/12"
              : "border-ink-200 focus:border-brand-500 focus:ring-brand-500/15"
          } ${ikon ? "pl-11" : ""} ${className}`}
          {...rest}
        />
      </div>
    );
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { hatali?: boolean }>(
  function Textarea({ className = "", hatali, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        className={`w-full resize-none rounded-[14px] border bg-white px-4 py-3 text-[15px] leading-relaxed text-ink-900 outline-none transition placeholder:text-ink-400 focus:ring-4 ${
          hatali ? "border-bad-500/60 focus:border-bad-500 focus:ring-bad-500/12" : "border-ink-200 focus:border-brand-500 focus:ring-brand-500/15"
        } ${className}`}
        {...rest}
      />
    );
  },
);

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { hatali?: boolean }>(
  function Select({ className = "", hatali, children, ...rest }, ref) {
    return (
      <select
        ref={ref}
        className={`h-12 w-full appearance-none rounded-[14px] border bg-white bg-[url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="%239B968A" stroke-width="2.2" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>')] bg-[right_0.9rem_center] bg-no-repeat px-4 pr-10 text-[15px] text-ink-900 outline-none transition focus:ring-4 ${
          hatali ? "border-bad-500/60 focus:border-bad-500 focus:ring-bad-500/12" : "border-ink-200 focus:border-brand-500 focus:ring-brand-500/15"
        } ${className}`}
        {...rest}
      >
        {children}
      </select>
    );
  },
);

/** Göz ikonlu şifre alanı. */
export const PasswordInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { hatali?: boolean }>(
  function PasswordInput({ hatali, className = "", ...rest }, ref) {
    const [gor, setGor] = useState(false);
    return (
      <div className="relative">
        <Input ref={ref} type={gor ? "text" : "password"} hatali={hatali} className={`pr-12 ${className}`} {...rest} />
        <button
          type="button"
          onClick={() => setGor((g) => !g)}
          tabIndex={-1}
          aria-label={gor ? "Şifreyi gizle" : "Şifreyi göster"}
          className="absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-ink-400 transition hover:bg-ink-100 hover:text-ink-600"
        >
          {gor ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
        </button>
      </div>
    );
  },
);

/* ------------------------------------------------------------------ */
/*  Segmented control (kayan pill)                                    */
/* ------------------------------------------------------------------ */

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className = "",
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; badge?: number }[];
  className?: string;
}) {
  const id = useId();
  return (
    <div className={`relative flex rounded-[14px] bg-ink-100 p-1 ${className}`} role="tablist">
      {options.map((o) => {
        const aktif = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={aktif}
            onClick={() => onChange(o.value)}
            className="relative flex-1 whitespace-nowrap rounded-[11px] px-3 py-2 text-[13.5px] font-semibold transition-colors duration-200"
          >
            {aktif && (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 rounded-[11px] bg-white shadow-soft"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className={`relative z-10 flex items-center justify-center gap-1.5 ${aktif ? "text-ink-900" : "text-ink-500"}`}>
              {o.label}
              {!!o.badge && (
                <span className="rounded-full bg-clay-500 px-1.5 py-px text-[10.5px] font-bold text-white">{o.badge}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Rozet / çip                                                       */
/* ------------------------------------------------------------------ */

export function Badge({
  tone = "ink",
  children,
  className = "",
}: {
  tone?: "ink" | "ok" | "warn" | "bad" | "brand" | "clay";
  children: React.ReactNode;
  className?: string;
}) {
  const map = {
    ink: "bg-ink-100 text-ink-600",
    ok: "bg-ok-50 text-ok-700",
    warn: "bg-warn-50 text-warn-700",
    bad: "bg-bad-50 text-bad-700",
    brand: "bg-brand-100 text-brand-800",
    clay: "bg-clay-50 text-clay-700",
  } as const;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-bold ${map[tone]} ${className}`}>
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                          */
/* ------------------------------------------------------------------ */

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}
