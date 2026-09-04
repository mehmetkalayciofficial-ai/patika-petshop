"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CartProvider } from "@/lib/cart";
import { useSiparisNotu } from "@/lib/note";
import { TabBar, TopBar } from "./Chrome";
import { CartBar } from "./CartBar";
import { CartSheet } from "./CartSheet";
import { PwaIpucu } from "@/components/PwaIpucu";

export const ARAMA_OLAYI = "patika:arama";

export function ShopShell({ children, kapali }: { children: React.ReactNode; kapali?: boolean }) {
  return (
    <CartProvider>
      <Icerik kapali={kapali}>{children}</Icerik>
    </CartProvider>
  );
}

function Icerik({ children, kapali }: { children: React.ReactNode; kapali?: boolean }) {
  const pathname = usePathname();
  const [sepetAcik, setSepetAcik] = useState(false);
  const [not, setNot] = useSiparisNotu();

  const urunlerdeyiz = pathname.startsWith("/urunler");
  const siparisEkrani = pathname.startsWith("/siparis");

  // URL ile sepet açma (#sepet) — derin bağlantı
  useEffect(() => {
    const kontrol = () => setSepetAcik(window.location.hash === "#sepet");
    kontrol();
    window.addEventListener("hashchange", kontrol);
    return () => window.removeEventListener("hashchange", kontrol);
  }, []);

  const kapat = useCallback(() => {
    setSepetAcik(false);
    if (window.location.hash === "#sepet") history.replaceState(null, "", window.location.pathname);
  }, []);

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar
        onCart={() => setSepetAcik(true)}
        onSearch={urunlerdeyiz ? () => window.dispatchEvent(new Event(ARAMA_OLAYI)) : undefined}
      />

      <div className="flex-1 pb-[calc(env(safe-area-inset-bottom)+3.75rem)] sm:pb-0">{children}</div>

      <TabBar />
      <CartBar onOpen={() => setSepetAcik(true)} gizli={sepetAcik || siparisEkrani} />
      <CartSheet open={sepetAcik} onClose={kapat} not={not} setNot={setNot} kapali={kapali} />
      <PwaIpucu />
    </div>
  );
}
