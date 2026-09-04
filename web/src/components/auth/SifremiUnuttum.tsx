"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronLeft } from "lucide-react";

import { supabaseBrowser } from "@/lib/supabase/client";
import { SITE } from "@/lib/site";
import { Button, Field, Input } from "@/components/ui";
import { AuthBackground } from "./AuthBackground";

export function SifremiUnuttum() {
  const [email, setEmail] = useState("");
  const [gonderildi, setGonderildi] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    setHata(null);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setHata("Geçerli bir e-posta yaz.");

    setYukleniyor(true);
    const { error } = await supabaseBrowser().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/sifre-yenile`,
    });
    setYukleniyor(false);
    if (error) return setHata("Bağlantı gönderilemedi. Biraz sonra tekrar dene.");
    setGonderildi(true);
  }

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <AuthBackground />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex w-full max-w-[400px] flex-col items-center"
      >
        <Image src="/brand/logo-256.png" alt={SITE.ad} width={84} height={84} priority className="size-[76px] rounded-full ring-[3px] ring-white/85 drop-shadow-[0_8px_24px_rgba(0,0,0,.45)]" />

        <div className="mt-5 w-full rounded-[24px] bg-white/94 p-5 shadow-float backdrop-blur-xl sm:p-6">
          {gonderildi ? (
            <div className="py-3 text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-ok-50 text-ok-700">
                <CheckCircle2 className="size-8" />
              </span>
              <h1 className="mt-4 text-[18px] font-bold text-ink-900">Bağlantıyı gönderdik</h1>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-500">
                <b className="text-ink-800">{email}</b> adresine şifre yenileme bağlantısı yolladık. Gelen kutunu (ve spam
                klasörünü) kontrol et.
              </p>
              <Link href="/giris" className="mt-5 inline-block">
                <Button tone="outline">Giriş ekranına dön</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={gonder} className="space-y-3.5">
              <h1 className="text-[18px] font-bold text-ink-900">Şifremi unuttum</h1>
              <p className="text-[13.5px] leading-relaxed text-ink-500">
                E-posta adresini yaz, şifre yenileme bağlantısını gönderelim.
              </p>

              <Field label="E-posta" hata={hata ?? undefined}>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="ornek@eposta.com"
                  hatali={!!hata}
                />
              </Field>

              <Button type="submit" full size="lg" loading={yukleniyor}>
                Bağlantı Gönder
              </Button>

              <Link href="/giris" className="flex items-center justify-center gap-1 pt-1 text-[13.5px] font-semibold text-ink-500 hover:text-ink-800">
                <ChevronLeft className="size-4" /> Giriş ekranına dön
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </main>
  );
}
