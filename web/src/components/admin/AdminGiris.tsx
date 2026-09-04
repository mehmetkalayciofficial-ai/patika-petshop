"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

import { supabaseBrowser } from "@/lib/supabase/client";
import { ADMIN_EPOSTA } from "@/lib/site";
import { bildirimIzniIste, sesiHazirla } from "@/lib/bildirim";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { Button, Field, Input, PasswordInput } from "@/components/ui";

const EASE = [0.22, 1, 0.36, 1] as const;
const gir = (delay: number, y = 12) => ({
  initial: { opacity: 0, y, scale: y === 12 ? 0.96 : 1 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.6, delay, ease: EASE },
});

export function AdminGiris() {
  const router = useRouter();
  const [kullanici, setKullanici] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [cikis, setCikis] = useState(false);

  // Uygulama ilk açılışta, giriş ekranından önce bildirim izni ister
  useEffect(() => {
    void bildirimIzniIste();
  }, []);

  async function girisYap(e: React.FormEvent) {
    e.preventDefault();
    if (yukleniyor) return;
    setHata(null);

    const kullaniciAdi = kullanici.trim().toLocaleLowerCase("tr-TR");
    if (!kullaniciAdi || !sifre) {
      setHata("Kullanıcı adı ve şifreni yaz.");
      return;
    }

    // "admin" gibi kullanıcı adları e-postaya eşlenir; e-posta da doğrudan kabul edilir
    const eposta = kullaniciAdi.includes("@") ? kullaniciAdi : ADMIN_EPOSTA;

    setYukleniyor(true);
    const supabase = supabaseBrowser();
    const { data, error } = await supabase.auth.signInWithPassword({ email: eposta, password: sifre });

    if (error) {
      setYukleniyor(false);
      setHata(
        error.message.toLowerCase().includes("invalid login")
          ? "Kullanıcı adı ya da şifre hatalı."
          : "Giriş yapılamadı. İnternetini kontrol et.",
      );
      return;
    }

    const { data: profil } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
    if (profil?.role !== "admin") {
      await supabase.auth.signOut();
      setYukleniyor(false);
      setHata("Bu hesabın yönetici yetkisi yok.");
      return;
    }

    sesiHazirla();
    setCikis(true);
    setTimeout(() => {
      router.replace("/admin");
      router.refresh();
    }, 240);
  }

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <AuthBackground />

      <AnimatePresence>
        {!cikis && (
          <motion.div
            exit={{ opacity: 0, y: -10, transition: { duration: 0.24, ease: EASE } }}
            className="flex w-full max-w-[400px] flex-col items-center"
          >
            <motion.div {...gir(0.3)}>
              <Image
                src="/brand/logo-256.png"
                alt=""
                width={96}
                height={96}
                priority
                className="size-[84px] rounded-full ring-[3px] ring-white/85 drop-shadow-[0_8px_24px_rgba(0,0,0,.45)] sm:size-24"
              />
            </motion.div>

            <motion.div {...gir(0.45, 8)} className="mt-4 text-center">
              <h1 className="text-[22px] font-bold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,.5)]">
                Patika Admin
              </h1>
              <p className="mt-1 text-[13.5px] font-medium text-white/80 drop-shadow-[0_1px_6px_rgba(0,0,0,.5)]">
                Sipariş ve ürün yönetimi
              </p>
            </motion.div>

            <motion.form
              {...gir(0.6, 24)}
              onSubmit={girisYap}
              className="mt-5 w-full space-y-3.5 rounded-[24px] bg-white/94 p-5 shadow-float backdrop-blur-xl sm:p-6"
            >
              <AnimatePresence>
                {hata && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-start gap-2.5 rounded-[13px] border border-bad-500/25 bg-bad-50 p-3">
                      <AlertCircle className="mt-px size-[17px] shrink-0 text-bad-500" />
                      <p className="text-[13px] font-medium leading-snug text-bad-700">{hata}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Field label="Kullanıcı adı">
                <Input
                  value={kullanici}
                  onChange={(e) => setKullanici(e.target.value)}
                  autoCapitalize="none"
                  autoComplete="username"
                  placeholder="admin"
                />
              </Field>

              <Field label="Şifre">
                <PasswordInput
                  value={sifre}
                  onChange={(e) => setSifre(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Şifren"
                />
              </Field>

              <Button type="submit" full size="lg" loading={yukleniyor}>
                Giriş Yap
              </Button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
