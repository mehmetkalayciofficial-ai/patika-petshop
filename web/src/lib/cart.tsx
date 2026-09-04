"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/lib/types";
import { gecerliFiyat } from "@/lib/format";

const KEY = "patika.sepet.v1";

export type CartLine = {
  productId: string;
  name: string;
  price: number;      // eklendiği andaki geçerli fiyat
  image: string | null;
  unitLabel: string;
  qty: number;
};

type CartCtx = {
  lines: CartLine[];
  hazir: boolean;
  adet: number;         // toplam parça sayısı
  satirSayisi: number;
  toplam: number;
  miktar: (productId: string) => number;
  ekle: (p: Product, adet?: number) => void;
  azalt: (productId: string) => void;
  ayarla: (productId: string, adet: number) => void;
  sil: (productId: string) => void;
  temizle: () => void;
  /** DB'deki güncel ürünlerle sepeti karşılaştırır; değişenleri düzeltir ve uyarı döner. */
  dogrula: (products: Product[]) => string[];
  sonEklenen: string | null;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hazir, setHazir] = useState(false);
  const [sonEklenen, setSonEklenen] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      /* bozuk veri — yok say */
    }
    setHazir(true);
  }, []);

  useEffect(() => {
    if (!hazir) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      /* kota dolu olabilir */
    }
  }, [lines, hazir]);

  const isaretle = useCallback((id: string) => {
    setSonEklenen(id);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setSonEklenen(null), 600);
  }, []);

  const ekle = useCallback(
    (p: Product, adet = 1) => {
      setLines((prev) => {
        const i = prev.findIndex((l) => l.productId === p.id);
        const tavan = Math.max(0, p.stock);
        if (i >= 0) {
          const next = [...prev];
          next[i] = { ...next[i], qty: Math.min(tavan, next[i].qty + adet), price: gecerliFiyat(p) };
          return next.filter((l) => l.qty > 0);
        }
        if (tavan < 1) return prev;
        return [
          ...prev,
          {
            productId: p.id,
            name: p.name,
            price: gecerliFiyat(p),
            image: p.image_url,
            unitLabel: p.unit_label,
            qty: Math.min(tavan, adet),
          },
        ];
      });
      isaretle(p.id);
    },
    [isaretle],
  );

  const azalt = useCallback((productId: string) => {
    setLines((prev) =>
      prev.map((l) => (l.productId === productId ? { ...l, qty: l.qty - 1 } : l)).filter((l) => l.qty > 0),
    );
  }, []);

  const ayarla = useCallback((productId: string, adet: number) => {
    setLines((prev) =>
      prev.map((l) => (l.productId === productId ? { ...l, qty: Math.max(0, adet) } : l)).filter((l) => l.qty > 0),
    );
  }, []);

  const sil = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const temizle = useCallback(() => setLines([]), []);

  const dogrula = useCallback((products: Product[]) => {
    const harita = new Map(products.map((p) => [p.id, p]));
    const uyarilar: string[] = [];
    setLines((prev) => {
      const next: CartLine[] = [];
      for (const l of prev) {
        const p = harita.get(l.productId);
        if (!p || !p.is_active) {
          uyarilar.push(`${l.name} artık satışta değil, sepetten çıkardık.`);
          continue;
        }
        if (p.stock < 1) {
          uyarilar.push(`${p.name} tükendi, sepetten çıkardık.`);
          continue;
        }
        const guncelFiyat = gecerliFiyat(p);
        let qty = l.qty;
        if (qty > p.stock) {
          uyarilar.push(`${p.name} için stok ${p.stock} ${p.unit_label}, adedi güncelledik.`);
          qty = p.stock;
        }
        if (guncelFiyat !== l.price) uyarilar.push(`${p.name} fiyatı güncellendi.`);
        next.push({ ...l, qty, price: guncelFiyat, name: p.name, image: p.image_url, unitLabel: p.unit_label });
      }
      return next;
    });
    return uyarilar;
  }, []);

  const value = useMemo<CartCtx>(() => {
    const adet = lines.reduce((s, l) => s + l.qty, 0);
    const toplam = lines.reduce((s, l) => s + l.qty * l.price, 0);
    return {
      lines,
      hazir,
      adet,
      satirSayisi: lines.length,
      toplam,
      miktar: (id) => lines.find((l) => l.productId === id)?.qty ?? 0,
      ekle,
      azalt,
      ayarla,
      sil,
      temizle,
      dogrula,
      sonEklenen,
    };
  }, [lines, hazir, ekle, azalt, ayarla, sil, temizle, dogrula, sonEklenen]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart, CartProvider içinde kullanılmalı.");
  return c;
}
