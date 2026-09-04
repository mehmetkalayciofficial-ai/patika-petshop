"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FolderPlus, Pencil, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { supabaseBrowser } from "@/lib/supabase/client";
import type { CategoryWithProducts, Product, Settings } from "@/lib/types";
import { CartProvider } from "@/lib/cart";
import { Hero } from "@/components/shop/Hero";
import { Catalog } from "@/components/shop/Catalog";
import { Confirm } from "@/components/Sheet";
import { Button, Input } from "@/components/ui";
import { UrunSheet } from "./UrunSheet";
import { KategoriSheet } from "./KategoriSheet";

export function AdminUrunler({
  kategoriler,
  ayarlar,
}: {
  kategoriler: CategoryWithProducts[];
  ayarlar: Settings | null;
}) {
  const router = useRouter();
  const [duzenleme, setDuzenleme] = useState(false);
  const [urunSheet, setUrunSheet] = useState<{ acik: boolean; urun: Product | null; kategori?: string }>({
    acik: false,
    urun: null,
  });
  const [katSheet, setKatSheet] = useState<{ acik: boolean; kategori: CategoryWithProducts | null }>({
    acik: false,
    kategori: null,
  });
  const [hizliStok, setHizliStok] = useState<Product | null>(null);
  const aramaAc = useRef<(() => void) | null>(null);

  // ürün/kategori değişimlerini canlı yansıt
  useEffect(() => {
    const supabase = supabaseBrowser();
    const kanal = supabase
      .channel("admin-katalog")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => router.refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, () => router.refresh())
      .subscribe();
    return () => {
      supabase.removeChannel(kanal);
    };
  }, [router]);

  const yenile = () => router.refresh();

  const duzToggle = (v: boolean) => {
    setDuzenleme(v);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(12);
  };

  return (
    <CartProvider>
      <Hero duyuru={duzenleme ? null : ayarlar?.announcement} />

      {/* Düzenleme çubuğu */}
      <div className="sticky top-14 z-[45] border-b border-line/60 bg-page/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-2.5 sm:px-6">
          <AnimatePresence mode="wait" initial={false}>
            {duzenleme ? (
              <motion.div
                key="duz"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
                className="flex w-full flex-wrap items-center gap-2"
              >
                <button
                  onClick={() => duzToggle(false)}
                  className="flex items-center gap-1.5 rounded-full bg-ink-900 px-3.5 py-2 text-[13px] font-bold text-white transition hover:bg-ink-800"
                >
                  <X className="size-[15px]" /> Düzenlemeden Çık
                </button>
                <div className="ml-auto flex gap-2">
                  <button
                    onClick={() => setKatSheet({ acik: true, kategori: null })}
                    className="flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3.5 py-2 text-[13px] font-bold text-ink-700 transition hover:border-brand-400"
                  >
                    <FolderPlus className="size-[15px]" /> Kategori
                  </button>
                  <button
                    onClick={() => setUrunSheet({ acik: true, urun: null })}
                    className="flex items-center gap-1.5 rounded-full bg-brand-500 px-3.5 py-2 text-[13px] font-bold text-ink-900 transition hover:bg-brand-400"
                  >
                    <Plus className="size-[15px]" /> Ürün Ekle
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="gorunum"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
                className="flex w-full items-center"
              >
                <p className="text-[13px] font-semibold text-ink-500">Müşterinin gördüğü ekran</p>
                <button
                  onClick={() => duzToggle(true)}
                  className="ml-auto flex items-center gap-1.5 rounded-full bg-brand-500 px-4 py-2 text-[13.5px] font-bold text-ink-900 shadow-[0_2px_10px_rgba(240,180,41,.35)] transition hover:bg-brand-400"
                >
                  <Pencil className="size-[15px]" /> Düzenle
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Catalog
        kategoriler={kategoriler}
        duzenleme={duzenleme}
        aramaAcRef={aramaAc}
        onEditProduct={(p) => setUrunSheet({ acik: true, urun: p })}
        onEditCategory={(id) => setKatSheet({ acik: true, kategori: kategoriler.find((c) => c.id === id) ?? null })}
        onAddProduct={(catId) => setUrunSheet({ acik: true, urun: null, kategori: catId })}
        onQuickStock={(p) => setHizliStok(p)}
      />

      <UrunSheet
        open={urunSheet.acik}
        urun={urunSheet.urun}
        varsayilanKategori={urunSheet.kategori}
        kategoriler={kategoriler}
        onClose={() => setUrunSheet({ acik: false, urun: null })}
        onKaydedildi={yenile}
        onSilindi={yenile}
      />

      <KategoriSheet
        open={katSheet.acik}
        kategori={katSheet.kategori}
        tumu={kategoriler}
        onClose={() => setKatSheet({ acik: false, kategori: null })}
        onKaydedildi={yenile}
      />

      <HizliStok p={hizliStok} onClose={() => setHizliStok(null)} onKaydedildi={yenile} />
    </CartProvider>
  );
}

/* ------------------------------------------------------------------ */

function HizliStok({ p, onClose, onKaydedildi }: { p: Product | null; onClose: () => void; onKaydedildi: () => void }) {
  const [stok, setStok] = useState(0);
  const [kaydediyor, setKaydediyor] = useState(false);

  useEffect(() => {
    if (p) setStok(p.stock);
  }, [p]);

  async function kaydet() {
    if (!p) return;
    setKaydediyor(true);
    const { error } = await supabaseBrowser().from("products").update({ stock: stok }).eq("id", p.id);
    setKaydediyor(false);
    if (error) return toast.error("Stok güncellenemedi.");
    toast.success(`${p.name} stoğu ${stok} oldu.`);
    onKaydedildi();
    onClose();
  }

  return (
    <Confirm
      open={!!p}
      onClose={onClose}
      onConfirm={kaydet}
      loading={kaydediyor}
      tone="primary"
      title="Hızlı stok"
      text={p?.name}
      confirmLabel="Kaydet"
    >
      <div className="flex items-center gap-2">
        <button
          onClick={() => setStok((s) => Math.max(0, s - 1))}
          className="flex size-12 shrink-0 items-center justify-center rounded-[14px] border border-ink-200 bg-white text-[19px] text-ink-700 transition hover:bg-ink-50"
        >
          −
        </button>
        <Input
          value={String(stok)}
          onChange={(e) => setStok(Number(e.target.value.replace(/\D/g, "")) || 0)}
          inputMode="numeric"
          className="text-center text-[17px] font-bold"
        />
        <button
          onClick={() => setStok((s) => s + 1)}
          className="flex size-12 shrink-0 items-center justify-center rounded-[14px] border border-ink-200 bg-white text-[19px] text-ink-700 transition hover:bg-ink-50"
        >
          +
        </button>
      </div>
    </Confirm>
  );
}
