"use client";

import { Clock, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Settings } from "@/lib/types";
import { telefonMaskele, telefonSade } from "@/lib/format";
import { AltSayfa } from "./Shell";

export function Yardim({ ayarlar }: { ayarlar: Settings | null }) {
  const tel = telefonSade(ayarlar?.store_phone ?? "");
  const wa = telefonSade(ayarlar?.whatsapp || ayarlar?.store_phone || "");

  return (
    <AltSayfa baslik="Yardım & İletişim" aciklama="Bir sorun mu var? Bize ulaş.">
      <div className="space-y-2.5">
        {tel && (
          <a href={`tel:0${tel}`} className="flex items-center gap-3.5 rounded-[18px] bg-white p-4 shadow-soft transition hover:shadow-lift">
            <span className="flex size-11 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <Phone className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold text-ink-900">Telefon</p>
              <p className="text-[13.5px] text-ink-500">{telefonMaskele(tel)}</p>
            </div>
            <span className="rounded-full bg-brand-500 px-3.5 py-1.5 text-[13px] font-bold text-ink-900">Ara</span>
          </a>
        )}

        {wa && (
          <a
            href={`https://wa.me/90${wa}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3.5 rounded-[18px] bg-white p-4 shadow-soft transition hover:shadow-lift"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-ok-50 text-ok-700">
              <MessageCircle className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold text-ink-900">WhatsApp</p>
              <p className="text-[13.5px] text-ink-500">Hızlı yanıt</p>
            </div>
            <span className="rounded-full bg-ok-500 px-3.5 py-1.5 text-[13px] font-bold text-white">Yaz</span>
          </a>
        )}

        {ayarlar?.store_address && (
          <div className="flex items-start gap-3.5 rounded-[18px] bg-white p-4 shadow-soft">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <MapPin className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[15px] font-bold text-ink-900">Adres</p>
              <p className="mt-0.5 text-[13.5px] leading-snug text-ink-500">{ayarlar.store_address}</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3.5 rounded-[18px] bg-white p-4 shadow-soft">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Clock className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-ink-900">Sipariş durumu</p>
            <p className="mt-0.5 text-[13.5px] leading-snug text-ink-500">
              {ayarlar?.is_open === false ? "Şu an sipariş almıyoruz." : "Şu an sipariş alıyoruz."}
            </p>
          </div>
        </div>
      </div>
    </AltSayfa>
  );
}
