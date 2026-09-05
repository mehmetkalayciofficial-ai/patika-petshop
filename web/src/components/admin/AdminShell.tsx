"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { KeyRound, LogOut, MoreVertical, PackageSearch, Receipt } from "lucide-react";
import { toast } from "sonner";

import { supabaseBrowser } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { Confirm } from "@/components/Sheet";
import { YeniSiparisDinleyici } from "./YeniSiparisDinleyici";

export function AdminShell({ profil, children }: { profil: Profile; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [cikisOnay, setCikisOnay] = useState(false);
  const [yeniSayisi, setYeniSayisi] = useState(0);

  useEffect(() => {
    const supabase = supabaseBrowser();
    void (async () => {
      const { count } = await supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "new");
      setYeniSayisi(count ?? 0);
    })();
  }, [pathname]);

  const sekmeler = [
    { href: "/admin", label: "Gelen Siparişler", icon: Receipt, badge: yeniSayisi },
    { href: "/admin/urunler", label: "Ürünler", icon: PackageSearch, badge: 0 },
  ];

  async function cikis() {
    await supabaseBrowser().auth.signOut();
    toast.success("Çıkış yapıldı.");
    router.replace("/admin/giris");
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh flex-col bg-page">
      <header className="sticky top-0 z-50 border-b border-line bg-white/90 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Image src="/brand/logo-128.png" alt="" width={34} height={34} className="size-[34px] rounded-full ring-1 ring-brand-200" />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold leading-tight text-ink-900">Patika Admin</p>
            <p className="truncate text-[11.5px] leading-tight text-ink-400">{profil.email}</p>
          </div>

          <div className="relative ml-auto">
            <button
              onClick={() => setMenu((m) => !m)}
              aria-label="Menü"
              className="flex size-10 items-center justify-center rounded-full text-ink-600 transition hover:bg-ink-100"
            >
              <MoreVertical className="size-[19px]" />
            </button>
            {menu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-[16px] bg-white p-1 shadow-float ring-1 ring-line"
                >
                  <Link
                    href="/admin/sifre"
                    onClick={() => setMenu(false)}
                    className="flex items-center gap-2.5 rounded-[12px] px-3 py-2.5 text-[14px] font-semibold text-ink-700 transition hover:bg-ink-50"
                  >
                    <KeyRound className="size-[17px] text-ink-400" /> Şifre Değiştir
                  </Link>
                  <button
                    onClick={() => {
                      setMenu(false);
                      setCikisOnay(true);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-[12px] px-3 py-2.5 text-left text-[14px] font-semibold text-bad-600 transition hover:bg-bad-50"
                  >
                    <LogOut className="size-[17px]" /> Çıkış Yap
                  </button>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 pb-[calc(env(safe-area-inset-bottom)+4rem)]">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white/94 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-md">
          {sekmeler.map((s) => {
            const aktif = s.href === "/admin" ? pathname === "/admin" : pathname.startsWith(s.href);
            const Icon = s.icon;
            return (
              <Link key={s.href} href={s.href} className="relative flex flex-1 flex-col items-center gap-0.5 py-2.5">
                <span className="relative">
                  <motion.span
                    animate={{ scale: aktif ? 1.12 : 1, y: aktif ? -1 : 0 }}
                    transition={{ type: "spring", stiffness: 480, damping: 26 }}
                    className={`block ${aktif ? "text-brand-600" : "text-ink-400"}`}
                  >
                    <Icon className="size-[21px]" />
                  </motion.span>
                  {!!s.badge && (
                    <span className="absolute -right-2.5 -top-1.5 flex min-w-[18px] justify-center rounded-full bg-clay-500 px-1 text-[10.5px] font-bold leading-[18px] text-white">
                      {s.badge}
                    </span>
                  )}
                </span>
                <span className={`text-[11px] font-semibold ${aktif ? "text-brand-700" : "text-ink-400"}`}>{s.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <YeniSiparisDinleyici onSayi={setYeniSayisi} />

      <Confirm
        open={cikisOnay}
        onClose={() => setCikisOnay(false)}
        onConfirm={cikis}
        title="Çıkış yapılsın mı?"
        text="Yeni sipariş bildirimleri gelmemeye başlar."
        confirmLabel="Çıkış Yap"
      />
    </div>
  );
}
