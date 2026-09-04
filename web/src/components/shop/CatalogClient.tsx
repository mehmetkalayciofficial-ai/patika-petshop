"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { CategoryWithProducts } from "@/lib/types";
import { useCart } from "@/lib/cart";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Catalog } from "./Catalog";
import { ARAMA_OLAYI } from "./ShopShell";

export function CatalogClient({ kategoriler }: { kategoriler: CategoryWithProducts[] }) {
  const { dogrula, hazir } = useCart();
  const aramaAc = useRef<(() => void) | null>(null);
  const dogrulandi = useRef(false);

  // üst çubuktaki arama ikonu
  useEffect(() => {
    const f = () => aramaAc.current?.();
    window.addEventListener(ARAMA_OLAYI, f);
    return () => window.removeEventListener(ARAMA_OLAYI, f);
  }, []);

  // sepeti güncel stok/fiyatla doğrula (bir kez)
  useEffect(() => {
    if (!hazir || dogrulandi.current) return;
    dogrulandi.current = true;
    const uyarilar = dogrula(kategoriler.flatMap((c) => c.products));
    uyarilar.slice(0, 3).forEach((u) => toast.warning(u));
  }, [hazir, dogrula, kategoriler]);

  // ürün/kategori değişimlerini canlı yansıt
  useEffect(() => {
    const supabase = supabaseBrowser();
    const kanal = supabase
      .channel("katalog")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        window.dispatchEvent(new Event("patika:katalog-guncel"));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(kanal);
    };
  }, []);

  return <Catalog kategoriler={kategoriler} aramaAcRef={aramaAc} />;
}
