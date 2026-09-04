"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabaseBrowser } from "@/lib/supabase/client";
import type { CategoryWithProducts } from "@/lib/types";
import { slugify } from "@/lib/format";
import { Button, Field, Input, Select } from "@/components/ui";
import { Confirm, Sheet } from "@/components/Sheet";

const IKONLAR = ["🐱", "🐶", "🪣", "🦴", "🎾", "🎀", "🧴", "🐦", "🐠", "🐇", "💊", "🏠"];

export function KategoriSheet({
  open,
  onClose,
  kategori,
  tumu,
  onKaydedildi,
}: {
  open: boolean;
  onClose: () => void;
  kategori: CategoryWithProducts | null;
  tumu: CategoryWithProducts[];
  onKaydedildi: () => void;
}) {
  const [ad, setAd] = useState("");
  const [ikon, setIkon] = useState("");
  const [sira, setSira] = useState("0");
  const [aktif, setAktif] = useState(true);
  const [kaydediyor, setKaydediyor] = useState(false);
  const [silOnay, setSilOnay] = useState(false);
  const [tasinacak, setTasinacak] = useState("");
  const [hata, setHata] = useState("");

  useEffect(() => {
    if (!open) return;
    setHata("");
    setAd(kategori?.name ?? "");
    setIkon(kategori?.icon ?? "");
    setSira(String(kategori?.sort_order ?? tumu.length + 1));
    setAktif(kategori?.is_active ?? true);
    setTasinacak("");
  }, [open, kategori, tumu.length]);

  const urunSayisi = kategori?.products.length ?? 0;

  async function kaydet() {
    if (!ad.trim()) return setHata("Kategori adı gerekli.");
    setKaydediyor(true);

    const supabase = supabaseBrowser();
    const govde = {
      name: ad.trim(),
      slug: slugify(ad.trim()) || `kategori-${Date.now()}`,
      icon: ikon || null,
      sort_order: Number(sira) || 0,
      is_active: aktif,
    };

    const { error } = kategori
      ? await supabase.from("categories").update(govde).eq("id", kategori.id)
      : await supabase.from("categories").insert(govde);

    setKaydediyor(false);
    if (error) {
      setHata(error.message.includes("duplicate") ? "Bu adda bir kategori zaten var." : "Kategori kaydedilemedi.");
      return;
    }
    toast.success(kategori ? "Kategori güncellendi." : "Kategori eklendi.");
    onKaydedildi();
    onClose();
  }

  async function siraDegistir(yon: -1 | 1) {
    if (!kategori) return;
    const yeni = Math.max(0, Number(sira) + yon);
    setSira(String(yeni));
  }

  async function sil() {
    if (!kategori) return;
    setKaydediyor(true);
    const supabase = supabaseBrowser();

    if (urunSayisi > 0) {
      if (!tasinacak) {
        setKaydediyor(false);
        return toast.error("Ürünlerin taşınacağı kategoriyi seç.");
      }
      const { error: tasiHata } = await supabase
        .from("products")
        .update({ category_id: tasinacak })
        .eq("category_id", kategori.id);
      if (tasiHata) {
        setKaydediyor(false);
        return toast.error("Ürünler taşınamadı.");
      }
    }

    const { error } = await supabase.from("categories").delete().eq("id", kategori.id);
    setKaydediyor(false);
    setSilOnay(false);
    if (error) return toast.error("Kategori silinemedi.");
    toast.success("Kategori silindi.");
    onKaydedildi();
    onClose();
  }

  return (
    <>
      <Sheet
        open={open}
        onClose={onClose}
        title={kategori ? "Kategoriyi Düzenle" : "Yeni Kategori"}
        footer={
          <div className="space-y-2">
            <Button full size="lg" loading={kaydediyor} onClick={kaydet}>
              Kaydet
            </Button>
            {kategori && (
              <Button full tone="ghost" className="!text-bad-600" onClick={() => setSilOnay(true)}>
                <Trash2 className="size-4" /> Kategoriyi Sil
              </Button>
            )}
          </div>
        }
      >
        <div className="space-y-4 px-5 py-4">
          <Field label="Kategori adı *" hata={hata || undefined}>
            <Input value={ad} onChange={(e) => setAd(e.target.value)} placeholder="Kedi Maması" hatali={!!hata} />
          </Field>

          <div>
            <p className="mb-2 text-[13px] font-semibold text-ink-700">İkon</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setIkon("")}
                className={`flex h-11 items-center rounded-[13px] border px-3 text-[13px] font-semibold transition ${
                  ikon === "" ? "border-brand-500 bg-brand-50 text-ink-900" : "border-ink-200 bg-white text-ink-500"
                }`}
              >
                Yok
              </button>
              {IKONLAR.map((i) => (
                <button
                  key={i}
                  onClick={() => setIkon(i)}
                  className={`flex size-11 items-center justify-center rounded-[13px] border text-[19px] transition ${
                    ikon === i ? "border-brand-500 bg-brand-50" : "border-ink-200 bg-white hover:border-ink-300"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <Field label="Sıra" ipucu="Küçük olan üstte görünür">
            <div className="flex items-center gap-2">
              <button
                onClick={() => siraDegistir(-1)}
                className="flex size-12 shrink-0 items-center justify-center rounded-[14px] border border-ink-200 bg-white text-ink-700 transition hover:bg-ink-50"
                aria-label="Yukarı taşı"
              >
                <ArrowUp className="size-[18px]" />
              </button>
              <Input value={sira} onChange={(e) => setSira(e.target.value.replace(/\D/g, ""))} inputMode="numeric" className="text-center" />
              <button
                onClick={() => siraDegistir(1)}
                className="flex size-12 shrink-0 items-center justify-center rounded-[14px] border border-ink-200 bg-white text-ink-700 transition hover:bg-ink-50"
                aria-label="Aşağı taşı"
              >
                <ArrowDown className="size-[18px]" />
              </button>
            </div>
          </Field>

          <label className="flex cursor-pointer items-center justify-between rounded-[16px] bg-ink-50 p-3.5">
            <span>
              <span className="block text-[14px] font-semibold text-ink-900">Sitede görünsün</span>
              <span className="block text-[12.5px] text-ink-500">Kapalıysa kategori ve ürünleri gizlenir</span>
            </span>
            <input type="checkbox" checked={aktif} onChange={(e) => setAktif(e.target.checked)} className="size-5 accent-brand-500" />
          </label>

          {kategori && <p className="text-center text-[12.5px] text-ink-400">Bu kategoride {urunSayisi} ürün var.</p>}
        </div>
      </Sheet>

      <Confirm
        open={silOnay}
        onClose={() => setSilOnay(false)}
        onConfirm={sil}
        loading={kaydediyor}
        title="Kategori silinsin mi?"
        text={
          urunSayisi > 0
            ? `“${kategori?.name}” içinde ${urunSayisi} ürün var. Silmeden önce ürünleri başka kategoriye taşımalısın.`
            : `“${kategori?.name}” kalıcı olarak silinecek.`
        }
        confirmLabel="Sil"
      >
        {urunSayisi > 0 && (
          <Select value={tasinacak} onChange={(e) => setTasinacak(e.target.value)}>
            <option value="">Ürünleri şuraya taşı…</option>
            {tumu
              .filter((c) => c.id !== kategori?.id)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon ? `${c.icon} ` : ""}
                  {c.name}
                </option>
              ))}
          </Select>
        )}
      </Confirm>
    </>
  );
}
