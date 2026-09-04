"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Address } from "@/lib/types";
import { Button, Field, Input, Textarea } from "@/components/ui";
import { ADRES_BASLIKLARI } from "@/lib/adres";

const sema = z.object({
  title: z.string().min(1, "Başlık seç."),
  city: z.string().trim().min(2, "İl yaz."),
  district: z.string().trim().min(2, "İlçe yaz."),
  neighborhood: z.string().trim().optional(),
  full_address: z.string().trim().min(10, "Açık adresi biraz daha ayrıntılı yaz."),
  directions: z.string().trim().optional(),
  is_default: z.boolean().optional(),
});

export type AdresForm = z.infer<typeof sema>;

export function AddressForm({
  adres,
  ilkAdres,
  onKaydedildi,
  onIptal,
}: {
  adres?: Address | null;
  ilkAdres?: boolean;
  onKaydedildi: (a: Address) => void;
  onIptal?: () => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AdresForm>({
    resolver: zodResolver(sema),
    defaultValues: {
      title: adres?.title ?? "Ev",
      city: adres?.city ?? "",
      district: adres?.district ?? "",
      neighborhood: adres?.neighborhood ?? "",
      full_address: adres?.full_address ?? "",
      directions: adres?.directions ?? "",
      is_default: adres?.is_default ?? !!ilkAdres,
    },
  });

  const baslik = watch("title");

  const gonder = handleSubmit(async (d) => {
    const supabase = supabaseBrowser();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return toast.error("Oturumun kapanmış. Tekrar giriş yap.");

    const govde = {
      user_id: auth.user.id,
      title: d.title,
      city: d.city.trim(),
      district: d.district.trim(),
      neighborhood: d.neighborhood?.trim() || null,
      full_address: d.full_address.trim(),
      directions: d.directions?.trim() || null,
      is_default: !!d.is_default || !!ilkAdres,
    };

    const { data, error } = adres
      ? await supabase.from("addresses").update(govde).eq("id", adres.id).select().single()
      : await supabase.from("addresses").insert(govde).select().single();

    if (error) return toast.error("Adres kaydedilemedi. Tekrar dene.");
    toast.success(adres ? "Adres güncellendi." : "Adres eklendi.");
    onKaydedildi(data as Address);
  });

  return (
    <form onSubmit={gonder} className="space-y-3.5">
      <Field label="Adres başlığı" hata={errors.title?.message}>
        <div className="flex gap-2">
          {ADRES_BASLIKLARI.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setValue("title", b, { shouldValidate: true })}
              className={`h-11 flex-1 rounded-[14px] text-[14px] font-semibold transition ${
                baslik === b ? "bg-brand-500 text-ink-900" : "border border-ink-200 bg-white text-ink-600 hover:bg-ink-50"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="İl" hata={errors.city?.message}>
          <Input {...register("city")} placeholder="İzmir" hatali={!!errors.city} autoComplete="address-level1" />
        </Field>
        <Field label="İlçe" hata={errors.district?.message}>
          <Input {...register("district")} placeholder="Karşıyaka" hatali={!!errors.district} autoComplete="address-level2" />
        </Field>
      </div>

      <Field label="Mahalle" hata={errors.neighborhood?.message}>
        <Input {...register("neighborhood")} placeholder="Bostanlı Mah." autoComplete="address-level3" />
      </Field>

      <Field label="Açık adres" hata={errors.full_address?.message}>
        <Textarea {...register("full_address")} rows={3} placeholder="Sokak, bina no, daire no" hatali={!!errors.full_address} />
      </Field>

      <Field label="Adres tarifi" ipucu="İsteğe bağlı — kuryeye yardımcı olur">
        <Input {...register("directions")} placeholder="Marketin yanındaki turuncu bina" />
      </Field>

      {!ilkAdres && (
        <label className="flex cursor-pointer items-center gap-2.5 pt-0.5">
          <input type="checkbox" {...register("is_default")} className="size-[18px] accent-brand-500" />
          <span className="text-[13.5px] text-ink-600">Varsayılan adresim olsun</span>
        </label>
      )}

      <div className="flex gap-2.5 pt-1">
        {onIptal && (
          <Button type="button" tone="outline" full onClick={onIptal}>
            Vazgeç
          </Button>
        )}
        <Button type="submit" full loading={isSubmitting}>
          {adres ? "Güncelle" : "Adresi Kaydet"}
        </Button>
      </div>
    </form>
  );
}
