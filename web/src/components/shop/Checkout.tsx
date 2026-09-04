"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Banknote, ChevronLeft, CreditCard, MapPin, Plus } from "lucide-react";
import { toast } from "sonner";

import { supabaseBrowser } from "@/lib/supabase/client";
import { useCart } from "@/lib/cart";
import { notuTemizle, useSiparisNotu } from "@/lib/note";
import { fiyat, telefonMaskele, telefonSade } from "@/lib/format";
import type { Address, PaymentMethod, Profile } from "@/lib/types";
import { adresleriGetir } from "@/lib/adres";
import { Button, Field, Input, Skeleton, Textarea } from "@/components/ui";
import { Sheet } from "@/components/Sheet";
import { AddressForm } from "./AddressForm";
import { PawEmpty, PawIcon } from "@/components/Paws";

export function Checkout({ profil, kapali }: { profil: Profile | null; kapali: boolean }) {
  const router = useRouter();
  const { lines, toplam, temizle, hazir } = useCart();
  const [not, setNot] = useSiparisNotu();

  const [adresler, setAdresler] = useState<Address[] | null>(null);
  const [seciliAdres, setSeciliAdres] = useState<string | null>(null);
  const [yeniAdres, setYeniAdres] = useState(false);
  const [telefon, setTelefon] = useState(telefonMaskele(profil?.phone ?? ""));
  const [odeme, setOdeme] = useState<PaymentMethod>("cash");
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  useEffect(() => {
    adresleriGetir().then((a) => {
      setAdresler(a);
      setSeciliAdres(a.find((x) => x.is_default)?.id ?? a[0]?.id ?? null);
      if (a.length === 0) setYeniAdres(true);
    });
  }, []);

  useEffect(() => {
    if (hazir && lines.length === 0 && !gonderiliyor) router.replace("/urunler");
  }, [hazir, lines.length, gonderiliyor, router]);

  async function siparisVer() {
    if (gonderiliyor) return;
    setHata(null);

    if (kapali) return setHata("Şu an sipariş alamıyoruz.");
    if (!seciliAdres) return setHata("Teslimat adresi seç.");
    if (telefonSade(telefon).length !== 10) return setHata("Telefonu 05xx xxx xx xx olarak yaz.");

    setGonderiliyor(true);
    const supabase = supabaseBrowser();
    const { data, error } = await supabase.rpc("place_order", {
      p_items: lines.map((l) => ({ product_id: l.productId, qty: l.qty })),
      p_address_id: seciliAdres,
      p_payment_method: odeme,
      p_note: not || null,
      p_phone: "0" + telefonSade(telefon),
    });

    if (error) {
      setGonderiliyor(false);
      setHata(error.message || "Sipariş oluşturulamadı. Tekrar dene.");
      return;
    }

    const sonuc = Array.isArray(data) ? data[0] : data;
    temizle();
    notuTemizle();
    router.replace(`/siparis-basarili/${sonuc.order_id}?no=${sonuc.order_no}`);
  }

  if (!hazir) {
    return (
      <div className="mx-auto max-w-2xl space-y-3 px-4 py-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-20 text-center">
        <PawEmpty className="w-36" />
        <h1 className="mt-4 text-[18px] font-bold text-ink-900">Sepetin boş</h1>
        <Link href="/urunler" className="mt-4">
          <Button tone="outline">Ürünlere dön</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-40 pt-4 sm:px-6 sm:pb-28">
      <Link href="/urunler" className="mb-4 inline-flex items-center gap-1 text-[14px] font-semibold text-ink-500 transition hover:text-ink-800">
        <ChevronLeft className="size-4" /> Alışverişe dön
      </Link>

      <h1 className="text-[22px] font-bold tracking-tight text-ink-900">Siparişi Tamamla</h1>

      <AnimatePresence>
        {hata && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 flex items-start gap-2.5 rounded-[14px] border border-bad-500/25 bg-bad-50 p-3.5">
              <AlertCircle className="mt-px size-[18px] shrink-0 text-bad-500" />
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-semibold leading-snug text-bad-700">{hata}</p>
                <Link href="/urunler#sepet" className="mt-1.5 inline-block text-[13px] font-bold text-bad-700 underline">
                  Sepeti güncelle
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Adres */}
      <Bolum baslik="Teslimat adresi" ikon={<MapPin className="size-[17px]" />}>
        {adresler === null ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : adresler.length === 0 ? (
          <p className="text-[13.5px] text-ink-500">Henüz kayıtlı adresin yok. Aşağıdan ekleyebilirsin.</p>
        ) : (
          <div className="space-y-2">
            {adresler.map((a) => (
              <button
                key={a.id}
                onClick={() => setSeciliAdres(a.id)}
                className={`flex w-full items-start gap-3 rounded-[14px] border p-3.5 text-left transition ${
                  seciliAdres === a.id ? "border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/20" : "border-ink-200 bg-white hover:border-ink-300"
                }`}
              >
                <span
                  className={`mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
                    seciliAdres === a.id ? "border-brand-500" : "border-ink-300"
                  }`}
                >
                  {seciliAdres === a.id && <span className="size-2 rounded-full bg-brand-500" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-ink-900">{a.title}</span>
                    {a.is_default && (
                      <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10.5px] font-bold text-ink-500">Varsayılan</span>
                    )}
                  </span>
                  <span className="mt-1 block text-[13px] leading-snug text-ink-500">
                    {a.full_address}
                    {a.neighborhood ? `, ${a.neighborhood}` : ""} · {a.district}/{a.city}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => setYeniAdres(true)}
          className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-[14px] border border-dashed border-ink-300 py-3 text-[14px] font-semibold text-ink-600 transition hover:border-brand-400 hover:text-brand-700"
        >
          <Plus className="size-4" /> Yeni adres ekle
        </button>
      </Bolum>

      {/* Telefon */}
      <Bolum baslik="Telefon">
        <Field ipucu="Kurye bu numaradan arayacak">
          <Input
            value={telefon}
            onChange={(e) => setTelefon(telefonMaskele(e.target.value))}
            type="tel"
            inputMode="numeric"
            maxLength={14}
            placeholder="0555 123 45 67"
          />
        </Field>
      </Bolum>

      {/* Ödeme */}
      <Bolum baslik="Ödeme yöntemi">
        <div className="grid grid-cols-2 gap-2.5">
          <OdemeSecenek
            secili={odeme === "cash"}
            onClick={() => setOdeme("cash")}
            ikon={<Banknote className="size-5" />}
            baslik="Kapıda Nakit"
          />
          <OdemeSecenek
            secili={odeme === "card_on_delivery"}
            onClick={() => setOdeme("card_on_delivery")}
            ikon={<CreditCard className="size-5" />}
            baslik="Kapıda Kart"
          />
        </div>
      </Bolum>

      {/* Not */}
      <Bolum baslik="Sipariş notu">
        <Textarea rows={2} value={not} onChange={(e) => setNot(e.target.value)} placeholder="Örn. zili çalmayın" maxLength={300} />
      </Bolum>

      {/* Özet */}
      <Bolum baslik="Özet">
        <div className="space-y-2.5">
          {lines.map((l) => (
            <div key={l.productId} className="flex items-center gap-3">
              <div className="relative size-11 shrink-0 overflow-hidden rounded-[10px] bg-ink-50">
                {l.image ? (
                  <Image src={l.image} alt="" fill sizes="44px" className="object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center bg-brand-50">
                    <PawIcon className="size-4 text-brand-300" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-semibold text-ink-800">{l.name}</p>
                <p className="text-[12.5px] text-ink-400">
                  {l.qty} × {fiyat(l.price)}
                </p>
              </div>
              <span className="text-[13.5px] font-bold tabular-nums text-ink-900">{fiyat(l.qty * l.price)}</span>
            </div>
          ))}
          <div className="border-t border-line pt-3">
            <div className="flex items-center justify-between text-[13.5px] text-ink-500">
              <span>Ara toplam</span>
              <span className="font-semibold tabular-nums text-ink-700">{fiyat(toplam)}</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-[15px] font-bold text-ink-900">Toplam</span>
              <span className="text-[19px] font-bold tabular-nums text-ink-900">{fiyat(toplam)}</span>
            </div>
          </div>
        </div>
      </Bolum>

      {/* Sabit alt buton */}
      <div className="fixed inset-x-0 bottom-0 z-[55] border-t border-line bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+4.25rem)] pt-3 backdrop-blur-xl sm:pb-4">
        <div className="mx-auto max-w-2xl">
          <Button full size="lg" loading={gonderiliyor} disabled={kapali || !seciliAdres} onClick={siparisVer}>
            {kapali ? "Şu an sipariş alamıyoruz" : `Siparişi Onayla · ${fiyat(toplam)}`}
          </Button>
        </div>
      </div>

      <Sheet open={yeniAdres} onClose={() => setYeniAdres(false)} title="Yeni adres">
        <div className="px-5 py-4">
          <AddressForm
            ilkAdres={(adresler?.length ?? 0) === 0}
            onKaydedildi={(a) => {
              setAdresler((prev) => [a, ...(prev ?? [])]);
              setSeciliAdres(a.id);
              setYeniAdres(false);
            }}
            onIptal={(adresler?.length ?? 0) > 0 ? () => setYeniAdres(false) : undefined}
          />
        </div>
      </Sheet>
    </div>
  );
}

function Bolum({ baslik, ikon, children }: { baslik: string; ikon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mt-4 rounded-[18px] bg-white p-4 shadow-soft sm:p-5">
      <h2 className="mb-3 flex items-center gap-2 text-[15px] font-bold text-ink-900">
        {ikon && <span className="text-brand-600">{ikon}</span>}
        {baslik}
      </h2>
      {children}
    </section>
  );
}

function OdemeSecenek({
  secili,
  onClick,
  ikon,
  baslik,
}: {
  secili: boolean;
  onClick: () => void;
  ikon: React.ReactNode;
  baslik: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-[14px] border p-4 transition ${
        secili ? "border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/20" : "border-ink-200 bg-white hover:border-ink-300"
      }`}
    >
      <span className={secili ? "text-brand-600" : "text-ink-400"}>{ikon}</span>
      <span className={`text-[13.5px] font-semibold ${secili ? "text-ink-900" : "text-ink-600"}`}>{baslik}</span>
    </button>
  );
}
