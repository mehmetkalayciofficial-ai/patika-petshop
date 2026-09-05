"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { toast } from "sonner";

import type { CategoryWithProducts, Product } from "@/lib/types";
import { useCart } from "@/lib/cart";
import { slugify } from "@/lib/format";
import { PawDivider, PawEmpty } from "@/components/Paws";
import { ProductRow, ProductTile } from "./ProductCard";
import { ProductSheet } from "./ProductSheet";

/** Üst çubuk (56) + çip şeridi (~56) yüksekliği — smooth scroll offset'i. */
const YAPISKAN_OFFSET = 118;

export function Catalog({
  kategoriler,
  duzenleme = false,
  onEditProduct,
  onEditCategory,
  onQuickStock,
  onAddProduct,
  aramaAcRef,
  heroyaBin = true,
}: {
  kategoriler: CategoryWithProducts[];
  duzenleme?: boolean;
  onEditProduct?: (p: Product) => void;
  onEditCategory?: (id: string) => void;
  onQuickStock?: (p: Product) => void;
  onAddProduct?: (categoryId: string) => void;
  aramaAcRef?: React.MutableRefObject<(() => void) | null>;
  /** Arama kutusu hero'nun üstüne binsin mi (adminde araya düzenleme çubuğu giriyor) */
  heroyaBin?: boolean;
}) {
  const { ekle, azalt, miktar } = useCart();
  const [arama, setArama] = useState("");
  const [aktif, setAktif] = useState<string | null>(null);
  const [detay, setDetay] = useState<Product | null>(null);

  const aramaRef = useRef<HTMLInputElement>(null);
  const cipSeridi = useRef<HTMLDivElement>(null);
  const bolumler = useRef<Map<string, HTMLElement>>(new Map());
  const kilit = useRef(false);

  useEffect(() => {
    if (aramaAcRef) {
      aramaAcRef.current = () => {
        aramaRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
        setTimeout(() => aramaRef.current?.focus(), 320);
      };
    }
  }, [aramaAcRef]);

  /* --- filtre ------------------------------------------------------ */

  const q = arama.trim().toLocaleLowerCase("tr-TR");
  const gorunen = useMemo(() => {
    const temel = kategoriler.filter((c) => (duzenleme ? true : c.is_active));
    return temel
      .map((c) => ({
        ...c,
        products: c.products.filter((p) => {
          if (!duzenleme && !p.is_active) return false;
          if (!q) return true;
          return (
            p.name.toLocaleLowerCase("tr-TR").includes(q) ||
            (p.description ?? "").toLocaleLowerCase("tr-TR").includes(q)
          );
        }),
      }))
      .filter((c) => c.products.length > 0 || (duzenleme && !q));
  }, [kategoriler, q, duzenleme]);

  const hicSonuc = q.length > 0 && gorunen.length === 0;

  /* --- scroll-spy -------------------------------------------------- */

  useEffect(() => {
    if (q) return;
    const gozlemci = new IntersectionObserver(
      (girisler) => {
        if (kilit.current) return;
        const gorunurler = girisler
          .filter((g) => g.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (gorunurler[0]) setAktif(gorunurler[0].target.id.replace("kat-", ""));
      },
      { rootMargin: `-${YAPISKAN_OFFSET + 8}px 0px -62% 0px`, threshold: 0 },
    );
    bolumler.current.forEach((el) => gozlemci.observe(el));
    return () => gozlemci.disconnect();
  }, [gorunen.length, q]);

  // aktif çipi görünür alana kaydır
  useEffect(() => {
    if (!aktif) return;
    const cip = cipSeridi.current?.querySelector<HTMLElement>(`[data-cip="${aktif}"]`);
    cip?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [aktif]);

  const kaydir = useCallback((id: string) => {
    const el = bolumler.current.get(id);
    if (!el) return;
    kilit.current = true;
    setAktif(id);
    const y = el.getBoundingClientRect().top + window.scrollY - YAPISKAN_OFFSET;
    window.scrollTo({ top: y, behavior: "smooth" });
    setTimeout(() => (kilit.current = false), 700);
  }, []);

  const sepeteEkle = useCallback(
    (p: Product, adet = 1) => {
      if (p.stock < 1) return toast.error(`${p.name} tükendi.`);
      const mevcut = miktar(p.id);
      if (mevcut + adet > p.stock) return toast.error(`${p.name} için stokta ${p.stock} ${p.unit_label} var.`);
      ekle(p, adet);
    },
    [ekle, miktar],
  );

  /* --- render ------------------------------------------------------ */

  return (
    <>
      {/* Arama — hero'nun altına biner */}
      <div className={`relative z-30 mx-auto max-w-6xl px-4 sm:px-6 ${heroyaBin ? "-mt-6" : "mt-3"}`}>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-ink-400" />
          <input
            ref={aramaRef}
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            placeholder="Ürün ara…"
            aria-label="Ürün ara"
            className="h-12 w-full rounded-full border border-line bg-white pl-11 pr-11 text-[15px] text-ink-900 shadow-lift outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/12"
          />
          <AnimatePresence>
            {arama && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                onClick={() => setArama("")}
                aria-label="Aramayı temizle"
                className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-ink-100 text-ink-500 transition hover:bg-ink-200"
              >
                <X className="size-[15px]" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Kategori çipleri */}
      {!q && gorunen.length > 0 && (
        <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-40 mt-4 border-b border-line/60 bg-page/88 backdrop-blur-xl">
          <div ref={cipSeridi} className="no-scrollbar mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3 sm:px-6">
            {gorunen.map((c) => {
              const on = aktif === c.id;
              return (
                <button
                  key={c.id}
                  data-cip={c.id}
                  onClick={() => kaydir(c.id)}
                  className={`relative shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[13.5px] font-semibold transition-colors duration-200 ${
                    on ? "text-ink-900" : "border border-line bg-white text-ink-600 hover:border-brand-300 hover:text-ink-800"
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId="cip-pill"
                      className="absolute inset-0 rounded-full bg-brand-500 shadow-[0_2px_10px_rgba(240,180,41,.4)]"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative z-10">
                    {c.icon ? `${c.icon} ` : ""}
                    {c.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bölümler */}
      <div className="mx-auto max-w-6xl px-4 pb-32 pt-5 sm:px-6 sm:pb-24">
        {hicSonuc ? (
          <div className="flex flex-col items-center py-16 text-center">
            <PawEmpty className="w-32" />
            <h3 className="mt-4 text-[17px] font-bold text-ink-900">Aradığını bulamadık</h3>
            <p className="mt-1.5 max-w-[260px] text-[13.5px] leading-relaxed text-ink-500">
              “{arama}” için sonuç yok. Farklı bir kelime dene.
            </p>
          </div>
        ) : (
          gorunen.map((c, i) => (
            <section
              key={c.id}
              id={`kat-${c.id}`}
              ref={(el) => {
                if (el) bolumler.current.set(c.id, el);
                else bolumler.current.delete(c.id);
              }}
              className="scroll-mt-32"
            >
              {i > 0 && <PawDivider flip={i % 2 === 1} />}

              <header className="mb-3.5 flex items-center gap-2.5">
                <h2 className="text-[19px] font-bold tracking-tight text-ink-900 sm:text-[21px]">
                  {c.icon ? `${c.icon} ` : ""}
                  {c.name}
                </h2>
                <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[11.5px] font-bold text-ink-500">
                  {c.products.length}
                </span>
                {!c.is_active && (
                  <span className="rounded-full bg-ink-200 px-2 py-0.5 text-[11px] font-bold text-ink-600">Gizli</span>
                )}

                {duzenleme && (
                  <div className="ml-auto flex items-center gap-1.5">
                    <button
                      onClick={() => onEditCategory?.(c.id)}
                      className="flex size-8 items-center justify-center rounded-full bg-white text-ink-600 shadow-soft transition hover:text-ink-900"
                      aria-label={`${c.name} kategorisini düzenle`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className="size-[15px]">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onAddProduct?.(c.id)}
                      className="rounded-full bg-white px-3 py-1.5 text-[12.5px] font-bold text-ink-700 shadow-soft transition hover:text-brand-700"
                    >
                      + ürün
                    </button>
                  </div>
                )}
              </header>

              {c.products.length === 0 ? (
                <p className="rounded-[16px] border border-dashed border-ink-200 py-6 text-center text-[13.5px] text-ink-400">
                  Bu kategoride henüz ürün yok.
                </p>
              ) : (
                <>
                  {/* mobil: yatay satırlar */}
                  <motion.div layout className="space-y-2.5 sm:hidden">
                    {c.products.map((p) => (
                      <ProductRow
                        key={p.id}
                        p={p}
                        qty={miktar(p.id)}
                        onAdd={() => sepeteEkle(p)}
                        onSub={() => azalt(p.id)}
                        onOpen={() => setDetay(p)}
                        duzenleme={duzenleme}
                        onEdit={() => onEditProduct?.(p)}
                        onLongPress={() => onQuickStock?.(p)}
                      />
                    ))}
                  </motion.div>

                  {/* masaüstü: ızgara */}
                  <motion.div layout className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {c.products.map((p) => (
                      <ProductTile
                        key={p.id}
                        p={p}
                        qty={miktar(p.id)}
                        onAdd={() => sepeteEkle(p)}
                        onSub={() => azalt(p.id)}
                        onOpen={() => setDetay(p)}
                        duzenleme={duzenleme}
                        onEdit={() => onEditProduct?.(p)}
                        onLongPress={() => onQuickStock?.(p)}
                      />
                    ))}
                  </motion.div>
                </>
              )}
            </section>
          ))
        )}

        {gorunen.length === 0 && !q && (
          <div className="flex flex-col items-center py-16 text-center">
            <PawEmpty className="w-32" />
            <h3 className="mt-4 text-[17px] font-bold text-ink-900">Henüz ürün yok</h3>
            <p className="mt-1.5 text-[13.5px] text-ink-500">Çok yakında burada olacaklar.</p>
          </div>
        )}
      </div>

      <ProductSheet
        p={detay}
        open={!!detay}
        onClose={() => setDetay(null)}
        mevcutAdet={detay ? miktar(detay.id) : 0}
        onAdd={(adet) => detay && sepeteEkle(detay, adet)}
      />
    </>
  );
}
