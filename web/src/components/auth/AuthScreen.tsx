"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

import { supabaseBrowser } from "@/lib/supabase/client";
import { SITE } from "@/lib/site";
import { telefonMaskele, telefonSade } from "@/lib/format";
import { Button, Field, Input, PasswordInput } from "@/components/ui";
import { AuthBackground } from "./AuthBackground";

/* ------------------------------------------------------------------ */
/*  Şemalar                                                           */
/* ------------------------------------------------------------------ */

const girisSema = z.object({
  email: z.string().min(1, "E-posta adresini yaz.").email("Geçerli bir e-posta yaz."),
  parola: z.string().min(1, "Şifreni yaz."),
});

const kayitSema = z
  .object({
    adSoyad: z.string().trim().min(3, "Ad ve soyadını yaz.").max(80, "Çok uzun."),
    telefon: z.string().refine((v) => telefonSade(v).length === 10, "Telefonu 05xx xxx xx xx olarak yaz."),
    email: z.string().min(1, "E-posta adresini yaz.").email("Geçerli bir e-posta yaz."),
    parola: z.string().min(8, "Şifre en az 8 karakter olmalı."),
    parola2: z.string().min(1, "Şifreyi tekrar yaz."),
    onay: z.literal(true, { message: "Devam etmek için onay kutusunu işaretle." }),
  })
  .refine((d) => d.parola === d.parola2, { path: ["parola2"], message: "Şifreler aynı değil." });

type GirisForm = z.infer<typeof girisSema>;
type KayitForm = z.infer<typeof kayitSema>;

/* ------------------------------------------------------------------ */
/*  Animasyon zamanlaması                                             */
/* ------------------------------------------------------------------ */

const EASE = [0.22, 1, 0.36, 1] as const;
const gir = (delay: number, y = 12) => ({
  initial: { opacity: 0, y, scale: y === 12 ? 0.96 : 1 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.6, delay, ease: EASE },
});

/* ------------------------------------------------------------------ */

export function AuthScreen({ next }: { next: string }) {
  const router = useRouter();
  const supabase = supabaseBrowser();
  const [sekme, setSekme] = useState<"giris" | "kayit">("giris");
  const [cikis, setCikis] = useState(false);

  const git = () => {
    setCikis(true);
    setTimeout(() => {
      router.replace(next);
      router.refresh();
    }, 260);
  };

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <AuthBackground />

      <AnimatePresence>
        {!cikis && (
          <motion.div
            exit={{ opacity: 0, y: -10, transition: { duration: 0.26, ease: EASE } }}
            className="flex w-full max-w-[420px] flex-col items-center"
          >
            {/* Logo */}
            <motion.div {...gir(0.3)} className="relative">
              <Image
                src="/brand/logo-256.png"
                alt={SITE.ad}
                width={96}
                height={96}
                priority
                className="size-[84px] rounded-full ring-[3px] ring-white/85 drop-shadow-[0_8px_24px_rgba(0,0,0,.45)] sm:size-24"
              />
            </motion.div>

            {/* Başlık */}
            <motion.div {...gir(0.45, 8)} className="mt-4 text-center">
              <h1 className="text-[22px] font-bold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,.5)]">
                {SITE.ad}
              </h1>
              <p className="mt-1 text-[13.5px] font-medium text-white/80 drop-shadow-[0_1px_6px_rgba(0,0,0,.5)]">
                Sipariş vermek için giriş yap
              </p>
            </motion.div>

            {/* Kart */}
            <motion.div
              {...gir(0.6, 24)}
              className="mt-5 w-full overflow-hidden rounded-[24px] bg-white/94 p-5 shadow-float backdrop-blur-xl sm:p-6"
            >
              <Sekmeler sekme={sekme} setSekme={setSekme} />

              <motion.div layout transition={{ type: "spring", stiffness: 320, damping: 34 }} className="mt-5">
                <AnimatePresence mode="wait" initial={false}>
                  {sekme === "giris" ? (
                    <FormKabuk key="giris">
                      <GirisFormu supabase={supabase} onOk={git} onKayit={() => setSekme("kayit")} />
                    </FormKabuk>
                  ) : (
                    <FormKabuk key="kayit">
                      <KayitFormu supabase={supabase} onOk={git} onGiris={() => setSekme("giris")} />
                    </FormKabuk>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>

            <motion.p {...gir(0.8, 8)} className="mt-5 max-w-[300px] text-center text-[11.5px] leading-relaxed text-white/60">
              Devam ederek{" "}
              <Link href="/kosullar" className="underline underline-offset-2 hover:text-white/85">
                kullanım koşullarını
              </Link>{" "}
              ve{" "}
              <Link href="/kvkk" className="underline underline-offset-2 hover:text-white/85">
                KVKK metnini
              </Link>{" "}
              kabul etmiş olursun.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

/* ------------------------------------------------------------------ */

function FormKabuk({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.2, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function Sekmeler({ sekme, setSekme }: { sekme: "giris" | "kayit"; setSekme: (s: "giris" | "kayit") => void }) {
  return (
    <div className="relative flex rounded-[14px] bg-ink-100 p-1">
      {(["giris", "kayit"] as const).map((s) => (
        <button
          key={s}
          onClick={() => setSekme(s)}
          className="relative flex-1 rounded-[11px] py-2.5 text-[14px] font-semibold transition-colors"
        >
          {sekme === s && (
            <motion.span
              layoutId="auth-pill"
              className="absolute inset-0 rounded-[11px] bg-white shadow-soft"
              transition={{ type: "spring", stiffness: 400, damping: 34 }}
            />
          )}
          <span className={`relative z-10 ${sekme === s ? "text-ink-900" : "text-ink-500"}`}>
            {s === "giris" ? "Giriş Yap" : "Kayıt Ol"}
          </span>
        </button>
      ))}
    </div>
  );
}

function Hata({ mesaj }: { mesaj: string | null }) {
  return (
    <AnimatePresence>
      {mesaj && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: "auto", marginBottom: 14 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          className="overflow-hidden"
        >
          <div className="flex items-start gap-2.5 rounded-[13px] border border-bad-500/25 bg-bad-50 p-3">
            <AlertCircle className="mt-px size-[17px] shrink-0 text-bad-500" />
            <p className="text-[13px] font-medium leading-snug text-bad-700">{mesaj}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Giriş                                                             */
/* ------------------------------------------------------------------ */

function GirisFormu({
  supabase,
  onOk,
  onKayit,
}: {
  supabase: ReturnType<typeof supabaseBrowser>;
  onOk: () => void;
  onKayit: () => void;
}) {
  const [hata, setHata] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GirisForm>({ resolver: zodResolver(girisSema), mode: "onSubmit" });

  const gonder = handleSubmit(async ({ email, parola }) => {
    setHata(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: parola });
    if (error) {
      const m = error.message.toLowerCase();
      setHata(
        m.includes("invalid login")
          ? "E-posta ya da şifre hatalı."
          : m.includes("rate") || m.includes("too many")
            ? "Çok fazla deneme yaptın. Birkaç dakika sonra tekrar dene."
            : m.includes("not confirmed")
              ? "E-postan doğrulanmamış. Gelen kutunu kontrol et."
              : "Giriş yapılamadı. İnternetini kontrol edip tekrar dene.",
      );
      return;
    }
    onOk();
  });

  return (
    <form onSubmit={gonder} noValidate className="space-y-3.5">
      <Hata mesaj={hata} />

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.02 }}>
        <Field label="E-posta" hata={errors.email?.message}>
          <Input
            {...register("email")}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="ornek@eposta.com"
            hatali={!!errors.email}
          />
        </Field>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <Field
          label="Şifre"
          hata={errors.parola?.message}
          sag={
            <Link href="/sifremi-unuttum" className="text-[12.5px] font-semibold text-brand-700 hover:underline">
              Şifremi unuttum
            </Link>
          }
        >
          <PasswordInput {...register("parola")} autoComplete="current-password" placeholder="Şifren" hatali={!!errors.parola} />
        </Field>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="pt-1">
        <Button type="submit" full size="lg" loading={isSubmitting}>
          Giriş Yap
        </Button>
      </motion.div>

      <p className="pt-0.5 text-center text-[13.5px] text-ink-500">
        Hesabın yok mu?{" "}
        <button type="button" onClick={onKayit} className="font-bold text-brand-700 hover:underline">
          Kayıt ol
        </button>
      </p>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  Kayıt                                                             */
/* ------------------------------------------------------------------ */

function KayitFormu({
  supabase,
  onOk,
  onGiris,
}: {
  supabase: ReturnType<typeof supabaseBrowser>;
  onOk: () => void;
  onGiris: () => void;
}) {
  const [hata, setHata] = useState<string | null>(null);
  const telRef = useRef<HTMLInputElement | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<KayitForm>({ resolver: zodResolver(kayitSema), mode: "onSubmit", defaultValues: { telefon: "" } });

  const tel = watch("telefon");
  useEffect(() => {
    const maskeli = telefonMaskele(tel ?? "");
    if (maskeli !== tel) setValue("telefon", maskeli, { shouldValidate: false });
  }, [tel, setValue]);

  const gonder = handleSubmit(async (d) => {
    setHata(null);
    const email = d.email.trim();
    const { error } = await supabase.auth.signUp({
      email,
      password: d.parola,
      options: { data: { full_name: d.adSoyad.trim(), phone: "0" + telefonSade(d.telefon) } },
    });

    if (error) {
      const m = error.message.toLowerCase();
      setHata(
        m.includes("already") || m.includes("registered")
          ? "Bu e-posta zaten kayıtlı. Giriş yapmayı dene."
          : m.includes("weak") || m.includes("password")
            ? "Şifre çok zayıf. En az 8 karakter kullan."
            : m.includes("rate") || m.includes("too many")
              ? "Çok fazla deneme yaptın. Birkaç dakika sonra tekrar dene."
              : "Kayıt tamamlanamadı. Bilgileri kontrol edip tekrar dene.",
      );
      return;
    }

    // E-posta doğrulaması kapalı → otomatik giriş
    const { error: girisHata } = await supabase.auth.signInWithPassword({ email, password: d.parola });
    if (girisHata) {
      toast.success("Kaydın alındı. Şimdi giriş yapabilirsin.");
      onGiris();
      return;
    }
    toast.success(`Hoş geldin, ${d.adSoyad.trim().split(" ")[0]}! 🐾`);
    onOk();
  });

  const alan = (i: number) => ({
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.02 + i * 0.06, duration: 0.28 },
  });

  return (
    <form onSubmit={gonder} noValidate className="space-y-3.5">
      <Hata mesaj={hata} />

      <motion.div {...alan(0)}>
        <Field label="Ad Soyad" hata={errors.adSoyad?.message}>
          <Input {...register("adSoyad")} autoComplete="name" placeholder="Ayşe Kaya" hatali={!!errors.adSoyad} />
        </Field>
      </motion.div>

      <motion.div {...alan(1)}>
        <Field label="Telefon" hata={errors.telefon?.message}>
          <Input
            {...register("telefon")}
            ref={(el) => {
              register("telefon").ref(el);
              telRef.current = el;
            }}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="0555 123 45 67"
            maxLength={14}
            hatali={!!errors.telefon}
          />
        </Field>
      </motion.div>

      <motion.div {...alan(2)}>
        <Field label="E-posta" hata={errors.email?.message}>
          <Input {...register("email")} type="email" inputMode="email" autoComplete="email" placeholder="ornek@eposta.com" hatali={!!errors.email} />
        </Field>
      </motion.div>

      <motion.div {...alan(3)}>
        <Field label="Şifre" hata={errors.parola?.message} ipucu="En az 8 karakter">
          <PasswordInput {...register("parola")} autoComplete="new-password" placeholder="Şifre oluştur" hatali={!!errors.parola} />
        </Field>
      </motion.div>

      <motion.div {...alan(4)}>
        <Field label="Şifre (tekrar)" hata={errors.parola2?.message}>
          <PasswordInput {...register("parola2")} autoComplete="new-password" placeholder="Şifreni tekrar yaz" hatali={!!errors.parola2} />
        </Field>
      </motion.div>

      <motion.div {...alan(5)}>
        <label className="flex cursor-pointer items-start gap-2.5 pt-0.5">
          <input
            type="checkbox"
            {...register("onay")}
            className="mt-0.5 size-[18px] shrink-0 accent-brand-500"
          />
          <span className="text-[12.5px] leading-snug text-ink-500">
            <Link href="/kosullar" className="font-semibold text-ink-700 underline underline-offset-2">
              Kullanım koşullarını
            </Link>{" "}
            ve{" "}
            <Link href="/kvkk" className="font-semibold text-ink-700 underline underline-offset-2">
              KVKK metnini
            </Link>{" "}
            kabul ediyorum.
          </span>
        </label>
        {errors.onay && <p className="mt-1.5 text-[12.5px] font-medium text-bad-500">{errors.onay.message}</p>}
      </motion.div>

      <motion.div {...alan(6)} className="pt-1">
        <Button type="submit" full size="lg" loading={isSubmitting}>
          Kayıt Ol
        </Button>
      </motion.div>

      <p className="pt-0.5 text-center text-[13.5px] text-ink-500">
        Zaten hesabın var mı?{" "}
        <button type="button" onClick={onGiris} className="font-bold text-brand-700 hover:underline">
          Giriş yap
        </button>
      </p>
    </form>
  );
}
