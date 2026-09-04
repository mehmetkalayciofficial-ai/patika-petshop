"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

/** Alt sayfa kabuğu — mobilde sağdan kayar, geri butonlu. */
export function AltSayfa({
  baslik,
  aciklama,
  children,
}: {
  baslik: string;
  aciklama?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-2xl px-4 pb-28 pt-4 sm:px-6 sm:pb-16"
    >
      <Link
        href="/profil"
        className="mb-3 inline-flex items-center gap-1 text-[14px] font-semibold text-ink-500 transition hover:text-ink-800"
      >
        <ChevronLeft className="size-4" /> Profil
      </Link>
      <h1 className="text-[22px] font-bold tracking-tight text-ink-900">{baslik}</h1>
      {aciklama && <p className="mt-1 text-[13.5px] text-ink-500">{aciklama}</p>}
      <div className="mt-5">{children}</div>
    </motion.div>
  );
}

/** Gruplu liste kartı (iOS Ayarlar hissi). */
export function Grup({ baslik, children }: { baslik?: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 first:mt-0">
      {baslik && <h2 className="mb-2 px-1 text-[12.5px] font-bold uppercase tracking-wide text-ink-400">{baslik}</h2>}
      <div className="overflow-hidden rounded-[18px] bg-white shadow-soft">{children}</div>
    </section>
  );
}

export function Satir({
  ikon,
  baslik,
  alt,
  href,
  onClick,
  sag,
  tehlike,
}: {
  ikon?: React.ReactNode;
  baslik: string;
  alt?: string;
  href?: string;
  onClick?: () => void;
  sag?: React.ReactNode;
  tehlike?: boolean;
}) {
  const icerik = (
    <div className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition active:bg-ink-50 sm:hover:bg-ink-50">
      {ikon && (
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${tehlike ? "bg-bad-50 text-bad-500" : "bg-brand-50 text-brand-600"}`}>
          {ikon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className={`block text-[15px] font-semibold ${tehlike ? "text-bad-600" : "text-ink-900"}`}>{baslik}</span>
        {alt && <span className="mt-0.5 block truncate text-[12.5px] text-ink-400">{alt}</span>}
      </span>
      {sag ?? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="size-[18px] shrink-0 text-ink-300">
          <path d="m9 18 6-6-6-6" />
        </svg>
      )}
    </div>
  );

  const cls = "block w-full border-b border-line last:border-b-0";
  if (href) return <Link href={href} className={cls}>{icerik}</Link>;
  return <button onClick={onClick} className={cls}>{icerik}</button>;
}
