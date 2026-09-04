"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { supabaseBrowser } from "@/lib/supabase/client";
import { Button, Field, PasswordInput } from "@/components/ui";
import { AltSayfa } from "./Shell";

const sema = z
  .object({
    eski: z.string().min(1, "Mevcut şifreni yaz."),
    yeni: z
      .string()
      .min(8, "Yeni şifre en az 8 karakter olmalı.")
      .regex(/[A-Za-zÇĞİÖŞÜçğıöşü]/, "En az 1 harf içermeli.")
      .regex(/\d/, "En az 1 rakam içermeli."),
    yeni2: z.string().min(1, "Yeni şifreyi tekrar yaz."),
  })
  .refine((d) => d.yeni === d.yeni2, { path: ["yeni2"], message: "Yeni şifreler aynı değil." })
  .refine((d) => d.yeni !== d.eski, { path: ["yeni"], message: "Yeni şifre eskisiyle aynı olamaz." });

type Form = z.infer<typeof sema>;

/** 0-4 arası basit şifre gücü. */
function guc(s: string) {
  let p = 0;
  if (s.length >= 8) p++;
  if (s.length >= 12) p++;
  if (/[A-ZÇĞİÖŞÜ]/.test(s) && /[a-zçğıöşü]/.test(s)) p++;
  if (/\d/.test(s) && /[^A-Za-z0-9]/.test(s)) p++;
  return p;
}

const GUC_ETIKET = ["Çok zayıf", "Zayıf", "Orta", "İyi", "Güçlü"];
const GUC_RENK = ["bg-bad-500", "bg-bad-500", "bg-warn-500", "bg-ok-500", "bg-ok-500"];

export function SifreDegistir({ email }: { email: string }) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(sema) });

  const yeni = watch("yeni") ?? "";
  const seviye = guc(yeni);

  const kaydet = handleSubmit(async (d) => {
    const supabase = supabaseBrowser();

    // Eski şifreyi gerçekten doğrula
    const { error: reAuth } = await supabase.auth.signInWithPassword({ email, password: d.eski });
    if (reAuth) return toast.error("Mevcut şifren hatalı.");

    const { error } = await supabase.auth.updateUser({ password: d.yeni });
    if (error) {
      toast.error(error.message.toLowerCase().includes("should be different") ? "Yeni şifre eskisiyle aynı olamaz." : "Şifre değiştirilemedi.");
      return;
    }

    toast.success("Şifren güncellendi.");
    reset({ eski: "", yeni: "", yeni2: "" });
  });

  return (
    <AltSayfa baslik="Şifre Değiştir" aciklama="En az 8 karakter, 1 harf ve 1 rakam.">
      <form onSubmit={kaydet} className="space-y-3.5 rounded-[18px] bg-white p-4 shadow-soft sm:p-5">
        <Field label="Mevcut şifre" hata={errors.eski?.message}>
          <PasswordInput {...register("eski")} autoComplete="current-password" placeholder="Mevcut şifren" hatali={!!errors.eski} />
        </Field>

        <Field label="Yeni şifre" hata={errors.yeni?.message}>
          <PasswordInput {...register("yeni")} autoComplete="new-password" placeholder="Yeni şifre" hatali={!!errors.yeni} />
          {yeni.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex h-1.5 flex-1 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ opacity: i < seviye ? 1 : 0.25 }}
                    className={`h-full flex-1 rounded-full ${i < seviye ? GUC_RENK[seviye] : "bg-ink-200"}`}
                  />
                ))}
              </div>
              <span className="w-[62px] text-right text-[11.5px] font-semibold text-ink-500">{GUC_ETIKET[seviye]}</span>
            </div>
          )}
        </Field>

        <Field label="Yeni şifre (tekrar)" hata={errors.yeni2?.message}>
          <PasswordInput {...register("yeni2")} autoComplete="new-password" placeholder="Yeni şifreyi tekrar yaz" hatali={!!errors.yeni2} />
        </Field>

        <Button type="submit" full size="lg" loading={isSubmitting}>
          Şifreyi Güncelle
        </Button>
      </form>
    </AltSayfa>
  );
}
