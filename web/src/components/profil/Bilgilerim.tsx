"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useEffect } from "react";

import { supabaseBrowser } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { telefonMaskele, telefonSade } from "@/lib/format";
import { Button, Field, Input } from "@/components/ui";
import { AltSayfa } from "./Shell";

const sema = z.object({
  ad: z.string().trim().min(2, "Adını yaz."),
  soyad: z.string().trim().min(2, "Soyadını yaz."),
  telefon: z.string().refine((v) => telefonSade(v).length === 10, "Telefonu 05xx xxx xx xx olarak yaz."),
  email: z.string().min(1, "E-posta yaz.").email("Geçerli bir e-posta yaz."),
});
type Form = z.infer<typeof sema>;

export function Bilgilerim({ profil }: { profil: Profile | null }) {
  const router = useRouter();
  const parcalar = (profil?.full_name ?? "").trim().split(/\s+/).filter(Boolean);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<Form>({
    resolver: zodResolver(sema),
    defaultValues: {
      ad: parcalar[0] ?? "",
      soyad: parcalar.slice(1).join(" "),
      telefon: telefonMaskele(profil?.phone ?? ""),
      email: profil?.email ?? "",
    },
  });

  const tel = watch("telefon");
  useEffect(() => {
    const m = telefonMaskele(tel ?? "");
    if (m !== tel) setValue("telefon", m, { shouldDirty: true });
  }, [tel, setValue]);

  const kaydet = handleSubmit(async (d) => {
    const supabase = supabaseBrowser();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return toast.error("Oturumun kapanmış. Tekrar giriş yap.");

    const tamAd = `${d.ad.trim()} ${d.soyad.trim()}`.trim();
    const telefon = "0" + telefonSade(d.telefon);

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: tamAd, phone: telefon })
      .eq("id", auth.user.id);
    if (error) return toast.error("Bilgiler kaydedilemedi.");

    if (d.email.trim() !== profil?.email) {
      const { error: mailHata } = await supabase.auth.updateUser({ email: d.email.trim() });
      if (mailHata) {
        toast.error("E-posta değiştirilemedi. Bu adres kullanılıyor olabilir.");
      } else {
        toast.info("Yeni e-postana doğrulama bağlantısı gönderdik.");
      }
    }

    toast.success("Bilgilerin güncellendi.");
    reset(d);
    router.refresh();
  });

  return (
    <AltSayfa baslik="Hesap Bilgilerim" aciklama="Siparişlerinde kullanılacak bilgiler.">
      <form onSubmit={kaydet} className="space-y-3.5 rounded-[18px] bg-white p-4 shadow-soft sm:p-5">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ad" hata={errors.ad?.message}>
            <Input {...register("ad")} autoComplete="given-name" hatali={!!errors.ad} />
          </Field>
          <Field label="Soyad" hata={errors.soyad?.message}>
            <Input {...register("soyad")} autoComplete="family-name" hatali={!!errors.soyad} />
          </Field>
        </div>

        <Field label="Telefon" hata={errors.telefon?.message}>
          <Input {...register("telefon")} type="tel" inputMode="numeric" maxLength={14} placeholder="0555 123 45 67" hatali={!!errors.telefon} />
        </Field>

        <Field label="E-posta" hata={errors.email?.message} ipucu="Değiştirirsen yeni adrese doğrulama bağlantısı göndeririz.">
          <Input {...register("email")} type="email" inputMode="email" autoComplete="email" hatali={!!errors.email} />
        </Field>

        <Button type="submit" full size="lg" loading={isSubmitting} disabled={!isDirty}>
          Kaydet
        </Button>
      </form>
    </AltSayfa>
  );
}
