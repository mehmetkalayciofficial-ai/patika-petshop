"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Search, ShoppingBag, User } from "lucide-react";
import { SITE } from "@/lib/site";
import { useCart } from "@/lib/cart";
import { PawIcon } from "@/components/Paws";

/* ------------------------------------------------------------------ */
/*  Üst çubuk                                                         */
/* ------------------------------------------------------------------ */

export function TopBar({ onSearch, onCart }: { onSearch?: () => void; onCart: () => void }) {
  const { adet } = useCart();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-page/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/urunler" className="flex min-w-0 items-center gap-2.5">
          <Image src="/brand/logo-128.png" alt="" width={36} height={36} className="size-9 shrink-0 rounded-full ring-1 ring-brand-200" />
          <span className="truncate text-[15px] font-bold tracking-tight text-ink-900">{SITE.ad}</span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 sm:flex">
          <NavLink href="/urunler" aktif={pathname.startsWith("/urunler")}>Ürünler</NavLink>
          <NavLink href="/profil" aktif={pathname.startsWith("/profil")}>Profil</NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          {onSearch && (
            <button
              onClick={onSearch}
              aria-label="Ürün ara"
              className="flex size-10 items-center justify-center rounded-full text-ink-600 transition hover:bg-ink-100"
            >
              <Search className="size-[19px]" />
            </button>
          )}
          <button
            onClick={onCart}
            aria-label="Sepet"
            className="relative flex size-10 items-center justify-center rounded-full text-ink-700 transition hover:bg-ink-100"
          >
            <ShoppingBag className="size-[20px]" />
            {adet > 0 && (
              <motion.span
                key={adet}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 600, damping: 18 }}
                className="absolute -right-0.5 -top-0.5 flex min-w-[19px] items-center justify-center rounded-full bg-clay-500 px-1 text-[11px] font-bold leading-[19px] text-white"
              >
                {adet}
              </motion.span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, aktif, children }: { href: string; aktif: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3.5 py-1.5 text-[14px] font-semibold transition ${
        aktif ? "bg-brand-100 text-brand-800" : "text-ink-600 hover:bg-ink-100"
      }`}
    >
      {children}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Alt sekmeler (mobil)                                              */
/* ------------------------------------------------------------------ */

export function TabBar() {
  const pathname = usePathname();
  const sekmeler = [
    { href: "/urunler", label: "Ürünler", icon: PawIcon },
    { href: "/profil", label: "Profil", icon: User },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl sm:hidden">
      <div className="flex">
        {sekmeler.map((s) => {
          const aktif = pathname.startsWith(s.href);
          const Icon = s.icon;
          return (
            <Link key={s.href} href={s.href} className="relative flex flex-1 flex-col items-center gap-0.5 py-2">
              <motion.span
                animate={{ scale: aktif ? 1.12 : 1, y: aktif ? -1 : 0 }}
                transition={{ type: "spring", stiffness: 480, damping: 26 }}
                className={aktif ? "text-brand-600" : "text-ink-400"}
              >
                <Icon className="size-[22px]" />
              </motion.span>
              <span className={`text-[11px] font-semibold ${aktif ? "text-brand-700" : "text-ink-400"}`}>{s.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
