"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Share, X } from "lucide-react";

const KEY = "patika.pwa-ipucu.v1";

type YuklePromptu = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/** Bir kez gösterilen küçük “Ana ekrana ekle” ipucu + service worker kaydı. */
export function PwaIpucu() {
  const [goster, setGoster] = useState(false);
  const [prompt, setPrompt] = useState<YuklePromptu | null>(null);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    let gorulduMu = true;
    try {
      gorulduMu = localStorage.getItem(KEY) === "1";
    } catch {
      /* yok say */
    }
    if (gorulduMu) return;

    // zaten uygulama olarak açılmışsa gösterme
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const nav = window.navigator as Navigator & { standalone?: boolean };
    const iosMu = /iphone|ipad|ipod/i.test(navigator.userAgent) && !nav.standalone;
    if (iosMu) {
      setIos(true);
      const t = setTimeout(() => setGoster(true), 6000);
      return () => clearTimeout(t);
    }

    const f = (e: Event) => {
      e.preventDefault();
      setPrompt(e as YuklePromptu);
      setTimeout(() => setGoster(true), 5000);
    };
    window.addEventListener("beforeinstallprompt", f);
    return () => window.removeEventListener("beforeinstallprompt", f);
  }, []);

  const gorulduIsaretle = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* yok say */
    }
  };

  // Bir kez göründüyse bir daha çıkmasın (kullanıcı kapatmasa bile)
  useEffect(() => {
    if (goster) gorulduIsaretle();
  }, [goster]);

  function kapat() {
    setGoster(false);
    gorulduIsaretle();
  }

  async function yukle() {
    if (!prompt) return;
    await prompt.prompt();
    kapat();
  }

  return (
    <AnimatePresence>
      {goster && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] px-4 pb-[calc(env(safe-area-inset-bottom)+4.5rem)] sm:pb-5"
        >
          <div className="pointer-events-auto mx-auto flex max-w-md items-center gap-3 rounded-[18px] bg-ink-900 p-3 shadow-float">
            <Image src="/brand/logo-128.png" alt="" width={40} height={40} className="size-10 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-bold text-white">Ana ekrana ekle</p>
              <p className="mt-0.5 text-[12px] leading-snug text-white/65">
                {ios ? (
                  <>
                    Paylaş <Share className="inline size-3" /> → “Ana Ekrana Ekle”
                  </>
                ) : (
                  "Uygulama gibi tek dokunuşla aç."
                )}
              </p>
            </div>
            {!ios && (
              <button onClick={yukle} className="shrink-0 rounded-full bg-brand-500 px-3.5 py-2 text-[13px] font-bold text-ink-900">
                Ekle
              </button>
            )}
            <button onClick={kapat} aria-label="Kapat" className="flex size-8 shrink-0 items-center justify-center rounded-full text-white/45 hover:bg-white/10">
              <X className="size-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
