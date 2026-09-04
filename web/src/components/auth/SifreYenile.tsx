"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { supabaseBrowser } from "@/lib/supabase/client";
import { SITE } from "@/lib/site";
import { Button, Field, PasswordInput } from "@/components/ui";
import { AuthBackground } from "./AuthBackground";

export function SifreYenile() {
  const router = useRouter();
  const [sifre, setSifre] = useState("");
  const [sifre2, setSifre2] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  async function kaydet(e: React.FormEvent) {
    e.preventDefault();
    setHata(null);
    if (sifre.length < 8) return setHata("Şifre en az 8 karakter olmalı.");
    if (!/[A-Za-zÇĞİÖŞÜçğıöşü]/.test(sifre) || !/\d/.test(sifre)) return setHata("En az 1 harf ve 1 rakam kullan.");
    if (sifre !== sifre2) return setHata("Şifreler aynı değil.");

    setYukleniyor(true);
    const { error } = await supabaseBrowser().auth.updateUser({ password: sifre });
    setYukleniyor(false);
    if (error) return setHata("Şifre güncellenemedi. Bağlantının süresi dolmuş olabilir.");

    toast.success("Şifren güncellendi.");
    router.replace("/urunler");
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

        <form onSubmit={kaydet} className="mt-5 w-full space-y-3.5 rounded-[24px] bg-white/94 p-5 shadow-float backdrop-blur-xl sm:p-6">
          <h1 className="text-[18px] font-bold text-ink-900">Yeni şifre belirle</h1>
          <Field label="Yeni şifre" hata={hata ?? undefined}>
            <PasswordInput value={sifre} onChange={(e) => setSifre(e.target.value)} autoComplete="new-password" placeholder="Yeni şifre" hatali={!!hata} />
          </Field>
          <Field label="Yeni şifre (tekrar)">
            <PasswordInput value={sifre2} onChange={(e) => setSifre2(e.target.value)} autoComplete="new-password" placeholder="Tekrar yaz" />
          </Field>
          <Button type="submit" full size="lg" loading={yukleniyor}>
            Şifreyi Kaydet
          </Button>
        </form>
      </motion.div>
    </main>
  );
}
