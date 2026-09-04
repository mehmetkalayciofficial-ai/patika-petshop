"use client";

import { AltSayfa } from "./Shell";
import { SifreDegistirForm } from "./SifreDegistirForm";

export function SifreDegistir({ email }: { email: string }) {
  return (
    <AltSayfa baslik="Şifre Değiştir" aciklama="En az 8 karakter, 1 harf ve 1 rakam.">
      <SifreDegistirForm email={email} />
    </AltSayfa>
  );
}
