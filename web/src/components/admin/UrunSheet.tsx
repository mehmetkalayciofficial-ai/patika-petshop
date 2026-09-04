"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, ImagePlus, Loader2, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { supabaseBrowser } from "@/lib/supabase/client";
import type { Category, Product } from "@/lib/types";
import { gorselSil, gorselYukle } from "@/lib/gorsel";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { Confirm, Sheet } from "@/components/Sheet";

type Form = {
  name: string;
  description: string;
  category_id: string;
  price: string;
  discount_price: string;
  stock: string;
  unit_label: string;
  sort_order: string;
  is_active: boolean;
};

const BOS: Form = {
  name: "",
  description: "",
  category_id: "",
  price: "",
  discount_price: "",
  stock: "0",
  unit_label: "adet",
  sort_order: "0",
  is_active: true,
};

const BIRIMLER = ["adet", "paket", "kg", "gr", "litre", "kutu", "çuval"];

export function UrunSheet({
  open,
  onClose,
  urun,
  kategoriler,
  onKaydedildi,
  onSilindi,
  varsayilanKategori,
}: {
  open: boolean;
  onClose: () => void;
  urun: Product | null;
  kategoriler: Category[];
  onKaydedildi: () => void;
  onSilindi: () => void;
  varsayilanKategori?: string;
}) {
  const [f, setF] = useState<Form>(BOS);
  const [gorseller, setGorseller] = useState<string[]>([]);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [kaydediyor, setKaydediyor] = useState(false);
  const [silOnay, setSilOnay] = useState(false);
  const [hatalar, setHatalar] = useState<Partial<Record<keyof Form, string>>>({});
  const [degisti, setDegisti] = useState(false);
  const [cikisOnay, setCikisOnay] = useState(false);
  const dosyaRef = useRef<HTMLInputElement>(null);
  const kameraRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setHatalar({});
    setDegisti(false);
    if (urun) {
      setF({
        name: urun.name,
        description: urun.description ?? "",
        category_id: urun.category_id,
        price: String(urun.price),
        discount_price: urun.discount_price ? String(urun.discount_price) : "",
        stock: String(urun.stock),
        unit_label: urun.unit_label,
        sort_order: String(urun.sort_order),
        is_active: urun.is_active,
      });
      setGorseller([urun.image_url, ...(Array.isArray(urun.images) ? urun.images : [])].filter(Boolean) as string[]);
    } else {
      setF({ ...BOS, category_id: varsayilanKategori ?? "" });
      setGorseller([]);
    }
  }, [open, urun, varsayilanKategori]);

  const yaz = <K extends keyof Form>(k: K, v: Form[K]) => {
    setF((p) => ({ ...p, [k]: v }));
    setDegisti(true);
    setHatalar((h) => ({ ...h, [k]: undefined }));
  };

  async function dosyaSecildi(e: React.ChangeEvent<HTMLInputElement>) {
    const dosyalar = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!dosyalar.length) return;

    setYukleniyor(true);
    try {
      for (const d of dosyalar) {
        const url = await gorselYukle(d);
        setGorseller((p) => [...p, url]);
        setDegisti(true);
      }
    } catch {
      toast.error("Görsel yüklenemedi. Tekrar dene.");
    } finally {
      setYukleniyor(false);
    }
  }

  function dogrula() {
    const h: Partial<Record<keyof Form, string>> = {};
    if (!f.name.trim()) h.name = "Ürün adı gerekli.";
    if (!f.category_id) h.category_id = "Kategori seçmelisin.";
    const fiyat = Number(f.price.replace(",", "."));
    if (!f.price || Number.isNaN(fiyat) || fiyat < 0) h.price = "Geçerli bir fiyat yaz.";
    if (f.discount_price) {
      const ind = Number(f.discount_price.replace(",", "."));
      if (Number.isNaN(ind) || ind < 0) h.discount_price = "Geçerli bir indirimli fiyat yaz.";
      else if (ind >= fiyat) h.discount_price = "İndirimli fiyat, fiyattan küçük olmalı.";
    }
    const stok = Number(f.stock);
    if (f.stock === "" || Number.isNaN(stok) || stok < 0) h.stock = "Stok 0 ya da daha büyük olmalı.";
    setHatalar(h);
    return Object.keys(h).length === 0;
  }

  async function kaydet() {
    if (!dogrula()) return;
    setKaydediyor(true);

    const govde = {
      name: f.name.trim(),
      description: f.description.trim() || null,
      category_id: f.category_id,
      price: Number(f.price.replace(",", ".")),
      discount_price: f.discount_price ? Number(f.discount_price.replace(",", ".")) : null,
      stock: Number(f.stock),
      unit_label: f.unit_label,
      sort_order: Number(f.sort_order) || 0,
      is_active: f.is_active,
      image_url: gorseller[0] ?? null,
      images: gorseller.slice(1),
    };

    const supabase = supabaseBrowser();
    const { error } = urun
      ? await supabase.from("products").update(govde).eq("id", urun.id)
      : await supabase.from("products").insert(govde);

    setKaydediyor(false);
    if (error) return toast.error("Ürün kaydedilemedi.");
    toast.success(urun ? "Ürün güncellendi." : "Ürün eklendi.");
    setDegisti(false);
    onKaydedildi();
    onClose();
  }

  async function sil() {
    if (!urun) return;
    setKaydediyor(true);
    const { error } = await supabaseBrowser().from("products").delete().eq("id", urun.id);
    setKaydediyor(false);
    setSilOnay(false);
    if (error) return toast.error("Ürün silinemedi. Siparişlerde kullanılıyor olabilir.");
    for (const g of gorseller) void gorselSil(g);
    toast.success("Ürün silindi.");
    onSilindi();
    onClose();
  }

  const kapat = () => (degisti ? setCikisOnay(true) : onClose());

  return (
    <>
      <Sheet
        open={open}
        onClose={kapat}
        title={urun ? "Ürünü Düzenle" : "Yeni Ürün"}
        footer={
          <div className="space-y-2">
            <Button full size="lg" loading={kaydediyor} onClick={kaydet}>
              Kaydet
            </Button>
            {urun && (
              <Button full tone="ghost" className="!text-bad-600" onClick={() => setSilOnay(true)}>
                <Trash2 className="size-4" /> Ürünü Sil
              </Button>
            )}
          </div>
        }
      >
        <div className="space-y-4 px-5 py-4">
          {/* Görseller */}
          <div>
            <p className="mb-2 text-[13px] font-semibold text-ink-700">Görseller</p>
            <div className="flex flex-wrap gap-2.5">
              <AnimatePresence initial={false}>
                {gorseller.map((g, i) => (
                  <motion.div
                    key={g}
                    layout
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    className="relative size-[86px] overflow-hidden rounded-[14px] bg-ink-50 ring-1 ring-line"
                  >
                    <Image src={g} alt="" fill sizes="86px" className="object-cover" />
                    {i === 0 && (
                      <span className="absolute inset-x-0 bottom-0 bg-brand-500/95 py-0.5 text-center text-[10px] font-bold text-ink-900">
                        Ana görsel
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setGorseller((p) => p.filter((x) => x !== g));
                        setDegisti(true);
                      }}
                      aria-label="Görseli kaldır"
                      className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-ink-900/70 text-white"
                    >
                      <X className="size-3.5" />
                    </button>
                    {i > 0 && (
                      <button
                        onClick={() => {
                          setGorseller((p) => [g, ...p.filter((x) => x !== g)]);
                          setDegisti(true);
                        }}
                        aria-label="Ana görsel yap"
                        className="absolute left-1 top-1 flex size-6 items-center justify-center rounded-full bg-ink-900/70 text-white"
                      >
                        <Star className="size-3" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              <button
                onClick={() => dosyaRef.current?.click()}
                disabled={yukleniyor}
                className="flex size-[86px] flex-col items-center justify-center gap-1 rounded-[14px] border border-dashed border-ink-300 text-ink-400 transition hover:border-brand-400 hover:text-brand-600"
              >
                {yukleniyor ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
                <span className="text-[11px] font-semibold">Galeri</span>
              </button>

              <button
                onClick={() => kameraRef.current?.click()}
                disabled={yukleniyor}
                className="flex size-[86px] flex-col items-center justify-center gap-1 rounded-[14px] border border-dashed border-ink-300 text-ink-400 transition hover:border-brand-400 hover:text-brand-600"
              >
                <Camera className="size-5" />
                <span className="text-[11px] font-semibold">Kamera</span>
              </button>
            </div>
            <input ref={dosyaRef} type="file" accept="image/*" multiple hidden onChange={dosyaSecildi} />
            <input ref={kameraRef} type="file" accept="image/*" capture="environment" hidden onChange={dosyaSecildi} />
          </div>

          <Field label="Ürün adı *" hata={hatalar.name}>
            <Input value={f.name} onChange={(e) => yaz("name", e.target.value)} placeholder="Yetişkin Kedi Maması 1,5 kg" hatali={!!hatalar.name} />
          </Field>

          <Field label="Açıklama">
            <Textarea rows={2} value={f.description} onChange={(e) => yaz("description", e.target.value)} placeholder="Kısa tanıtım" maxLength={300} />
          </Field>

          <Field label="Kategori *" hata={hatalar.category_id}>
            <Select value={f.category_id} onChange={(e) => yaz("category_id", e.target.value)} hatali={!!hatalar.category_id}>
              <option value="">Kategori seç…</option>
              {kategoriler.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon ? `${c.icon} ` : ""}
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Fiyat (₺) *" hata={hatalar.price}>
              <Input value={f.price} onChange={(e) => yaz("price", e.target.value)} inputMode="decimal" placeholder="249,90" hatali={!!hatalar.price} />
            </Field>
            <Field label="İndirimli fiyat" hata={hatalar.discount_price}>
              <Input
                value={f.discount_price}
                onChange={(e) => yaz("discount_price", e.target.value)}
                inputMode="decimal"
                placeholder="—"
                hatali={!!hatalar.discount_price}
              />
            </Field>
          </div>

          <Field label="Stok *" hata={hatalar.stock}>
            <div className="flex items-center gap-2">
              <button
                onClick={() => yaz("stock", String(Math.max(0, Number(f.stock) - 1)))}
                className="flex size-12 shrink-0 items-center justify-center rounded-[14px] border border-ink-200 bg-white text-[19px] text-ink-700 transition hover:bg-ink-50"
              >
                −
              </button>
              <Input
                value={f.stock}
                onChange={(e) => yaz("stock", e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                className="text-center"
                hatali={!!hatalar.stock}
              />
              <button
                onClick={() => yaz("stock", String(Number(f.stock) + 1))}
                className="flex size-12 shrink-0 items-center justify-center rounded-[14px] border border-ink-200 bg-white text-[19px] text-ink-700 transition hover:bg-ink-50"
              >
                +
              </button>
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Birim">
              <Select value={f.unit_label} onChange={(e) => yaz("unit_label", e.target.value)}>
                {BIRIMLER.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Sıra" ipucu="Küçük olan üstte">
              <Input value={f.sort_order} onChange={(e) => yaz("sort_order", e.target.value.replace(/\D/g, ""))} inputMode="numeric" />
            </Field>
          </div>

          <label className="flex cursor-pointer items-center justify-between rounded-[16px] bg-ink-50 p-3.5">
            <span>
              <span className="block text-[14px] font-semibold text-ink-900">Sitede görünsün</span>
              <span className="block text-[12.5px] text-ink-500">Kapalıysa müşteriler göremez</span>
            </span>
            <input type="checkbox" checked={f.is_active} onChange={(e) => yaz("is_active", e.target.checked)} className="size-5 accent-brand-500" />
          </label>
        </div>
      </Sheet>

      <Confirm
        open={silOnay}
        onClose={() => setSilOnay(false)}
        onConfirm={sil}
        loading={kaydediyor}
        title="Ürün silinsin mi?"
        text={`“${urun?.name}” kalıcı olarak silinecek.`}
        confirmLabel="Sil"
      />

      <Confirm
        open={cikisOnay}
        onClose={() => setCikisOnay(false)}
        onConfirm={() => {
          setCikisOnay(false);
          setDegisti(false);
          onClose();
        }}
        title="Kaydedilmemiş değişiklikler var"
        text="Çıkarsan yaptığın değişiklikler kaybolur."
        confirmLabel="Yine de çık"
      />
    </>
  );
}
