"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabaseBrowser } from "@/lib/supabase/client";
import { adresleriGetir } from "@/lib/adres";
import type { Address } from "@/lib/types";
import { Button, Skeleton } from "@/components/ui";
import { Confirm, Sheet } from "@/components/Sheet";
import { AddressForm } from "@/components/shop/AddressForm";
import { PawEmpty } from "@/components/Paws";
import { AltSayfa } from "./Shell";

export function Adreslerim() {
  const [adresler, setAdresler] = useState<Address[] | null>(null);
  const [duzenlenen, setDuzenlenen] = useState<Address | null>(null);
  const [yeni, setYeni] = useState(false);
  const [silinecek, setSilinecek] = useState<Address | null>(null);
  const [siliniyor, setSiliniyor] = useState(false);

  useEffect(() => {
    adresleriGetir().then(setAdresler);
  }, []);

  async function varsayilanYap(a: Address) {
    const supabase = supabaseBrowser();
    const { error } = await supabase.from("addresses").update({ is_default: true }).eq("id", a.id);
    if (error) return toast.error("Güncellenemedi.");
    setAdresler((p) => (p ?? []).map((x) => ({ ...x, is_default: x.id === a.id })));
    toast.success("Varsayılan adres güncellendi.");
  }

  async function sil() {
    if (!silinecek) return;
    setSiliniyor(true);
    const supabase = supabaseBrowser();
    const { error } = await supabase.from("addresses").delete().eq("id", silinecek.id);
    setSiliniyor(false);
    if (error) return toast.error("Adres silinemedi.");
    setAdresler((p) => (p ?? []).filter((x) => x.id !== silinecek.id));
    setSilinecek(null);
    toast.success("Adres silindi.");
  }

  return (
    <AltSayfa baslik="Adreslerim" aciklama="Siparişlerinde kullanacağın teslimat adresleri.">
      {adresler === null ? (
        <div className="space-y-2.5">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : adresler.length === 0 ? (
        <div className="flex flex-col items-center rounded-[18px] bg-white px-6 py-12 text-center shadow-soft">
          <PawEmpty className="w-32" />
          <h3 className="mt-4 text-[16px] font-bold text-ink-900">Kayıtlı adresin yok</h3>
          <p className="mt-1.5 max-w-[240px] text-[13.5px] leading-relaxed text-ink-500">
            İlk adresini ekleyince sipariş vermek çok hızlı olacak.
          </p>
          <Button className="mt-5" onClick={() => setYeni(true)}>
            <Plus className="size-4" /> Adres ekle
          </Button>
        </div>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {adresler.map((a) => (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden rounded-[18px] bg-white p-4 shadow-soft"
              >
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <MapPin className="size-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[15px] font-bold text-ink-900">{a.title}</h3>
                      {a.is_default && (
                        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10.5px] font-bold text-brand-800">Varsayılan</span>
                      )}
                    </div>
                    <p className="mt-1 text-[13px] leading-snug text-ink-500">
                      {a.full_address}
                      {a.neighborhood ? `, ${a.neighborhood}` : ""}
                    </p>
                    <p className="text-[13px] text-ink-400">
                      {a.district} / {a.city}
                    </p>
                    {a.directions && <p className="mt-1 text-[12.5px] italic text-ink-400">“{a.directions}”</p>}
                  </div>
                </div>

                <div className="mt-3 flex gap-2 border-t border-line pt-3">
                  {!a.is_default && (
                    <button
                      onClick={() => varsayilanYap(a)}
                      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold text-ink-600 transition hover:bg-ink-100"
                    >
                      <Star className="size-[14px]" /> Varsayılan yap
                    </button>
                  )}
                  <button
                    onClick={() => setDuzenlenen(a)}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold text-ink-600 transition hover:bg-ink-100"
                  >
                    <Pencil className="size-[14px]" /> Düzenle
                  </button>
                  <button
                    onClick={() => setSilinecek(a)}
                    className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold text-bad-500 transition hover:bg-bad-50"
                  >
                    <Trash2 className="size-[14px]" /> Sil
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <button
            onClick={() => setYeni(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-[18px] border border-dashed border-ink-300 py-4 text-[14px] font-semibold text-ink-600 transition hover:border-brand-400 hover:text-brand-700"
          >
            <Plus className="size-4" /> Yeni adres ekle
          </button>
        </div>
      )}

      <Sheet open={yeni} onClose={() => setYeni(false)} title="Yeni adres">
        <div className="px-5 py-4">
          <AddressForm
            ilkAdres={(adresler?.length ?? 0) === 0}
            onKaydedildi={(a) => {
              setAdresler((p) => [a, ...(p ?? [])].map((x) => (a.is_default && x.id !== a.id ? { ...x, is_default: false } : x)));
              setYeni(false);
            }}
            onIptal={() => setYeni(false)}
          />
        </div>
      </Sheet>

      <Sheet open={!!duzenlenen} onClose={() => setDuzenlenen(null)} title="Adresi düzenle">
        <div className="px-5 py-4">
          {duzenlenen && (
            <AddressForm
              adres={duzenlenen}
              onKaydedildi={(a) => {
                setAdresler((p) =>
                  (p ?? []).map((x) => (x.id === a.id ? a : a.is_default ? { ...x, is_default: false } : x)),
                );
                setDuzenlenen(null);
              }}
              onIptal={() => setDuzenlenen(null)}
            />
          )}
        </div>
      </Sheet>

      <Confirm
        open={!!silinecek}
        onClose={() => setSilinecek(null)}
        onConfirm={sil}
        loading={siliniyor}
        title="Adres silinsin mi?"
        text={`“${silinecek?.title}” adresi kalıcı olarak silinecek. Geçmiş siparişlerin etkilenmez.`}
        confirmLabel="Sil"
      />
    </AltSayfa>
  );
}
