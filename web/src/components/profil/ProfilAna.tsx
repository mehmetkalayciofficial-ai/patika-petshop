"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  KeyRound,
  LifeBuoy,
  LogOut,
  MapPin,
  MessageCircle,
  Phone,
  Receipt,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { supabaseBrowser } from "@/lib/supabase/client";
import type { Profile, Settings } from "@/lib/types";
import { basHarfler, telefonMaskele, telefonSade } from "@/lib/format";
import { Confirm } from "@/components/Sheet";
import { PasswordInput } from "@/components/ui";
import { PawPattern } from "@/components/Paws";
import { Grup, Satir } from "./Shell";

export function ProfilAna({ profil, ayarlar }: { profil: Profile | null; ayarlar: Settings | null }) {
  const router = useRouter();
  const [cikisOnay, setCikisOnay] = useState(false);
  const [silOnay, setSilOnay] = useState(false);

  async function cikisYap() {
    await supabaseBrowser().auth.signOut();
    toast.success("Çıkış yapıldı.");
    router.replace("/giris");
    router.refresh();
  }

  const tel = telefonSade(ayarlar?.store_phone ?? "");
  const wa = telefonSade(ayarlar?.whatsapp || ayarlar?.store_phone || "");

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-4 sm:px-6 sm:pb-16">
      {/* Başlık kartı */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-[20px] bg-white p-5 shadow-soft"
      >
        <PawPattern className="pointer-events-none absolute -right-6 -top-6 size-40 text-brand-500/[.06]" />
        <div className="relative flex items-center gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-500 text-[19px] font-bold text-ink-900">
            {basHarfler(profil?.full_name)}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-[18px] font-bold tracking-tight text-ink-900">
              {profil?.full_name || "Merhaba 🐾"}
            </h1>
            <p className="mt-0.5 truncate text-[13px] text-ink-500">{profil?.email}</p>
            {profil?.phone && <p className="text-[13px] text-ink-400">{telefonMaskele(profil.phone)}</p>}
          </div>
        </div>
      </motion.div>

      <Grup baslik="Hesabım">
        <Satir ikon={<UserRound className="size-[18px]" />} baslik="Hesap Bilgilerim" alt="Ad, telefon, e-posta" href="/profil/bilgilerim" />
        <Satir ikon={<MapPin className="size-[18px]" />} baslik="Adreslerim" alt="Teslimat adreslerini yönet" href="/profil/adreslerim" />
        <Satir ikon={<Receipt className="size-[18px]" />} baslik="Siparişlerim" alt="Geçmiş ve güncel siparişler" href="/profil/siparislerim" />
        <Satir ikon={<KeyRound className="size-[18px]" />} baslik="Şifre Değiştir" href="/profil/sifre" />
      </Grup>

      <Grup baslik="Yardım">
        {tel && (
          <Satir
            ikon={<Phone className="size-[18px]" />}
            baslik="Bizi ara"
            alt={telefonMaskele(tel)}
            href={`tel:0${tel}`}
            sag={<span className="text-[13px] font-semibold text-brand-700">Ara</span>}
          />
        )}
        {wa && (
          <Satir
            ikon={<MessageCircle className="size-[18px]" />}
            baslik="WhatsApp'tan yaz"
            alt="Hızlı destek"
            href={`https://wa.me/90${wa}`}
            sag={<span className="text-[13px] font-semibold text-brand-700">Aç</span>}
          />
        )}
        <Satir ikon={<LifeBuoy className="size-[18px]" />} baslik="Yardım & İletişim" alt={ayarlar?.store_address || "Mağaza bilgileri"} href="/profil/yardim" />
      </Grup>

      <Grup>
        <Satir ikon={<LogOut className="size-[18px]" />} baslik="Çıkış Yap" onClick={() => setCikisOnay(true)} sag={<span />} />
        <Satir ikon={<Trash2 className="size-[18px]" />} baslik="Hesabımı Sil" tehlike onClick={() => setSilOnay(true)} sag={<span />} />
      </Grup>

      <p className="mt-6 text-center text-[12px] text-ink-300">Patika Pet Market · v1.0</p>

      <Confirm
        open={cikisOnay}
        onClose={() => setCikisOnay(false)}
        onConfirm={cikisYap}
        title="Çıkış yapılsın mı?"
        text="Tekrar sipariş vermek için yeniden giriş yapman gerekecek."
        confirmLabel="Çıkış Yap"
      />
      <HesapSil open={silOnay} onClose={() => setSilOnay(false)} email={profil?.email ?? ""} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function HesapSil({ open, onClose, email }: { open: boolean; onClose: () => void; email: string }) {
  const router = useRouter();
  const [sifre, setSifre] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  async function sil() {
    if (!sifre) return toast.error("Şifreni yaz.");
    setYukleniyor(true);
    const supabase = supabaseBrowser();

    const { error: authHata } = await supabase.auth.signInWithPassword({ email, password: sifre });
    if (authHata) {
      setYukleniyor(false);
      return toast.error("Şifren hatalı.");
    }

    const { error } = await supabase.functions.invoke("delete-account");
    setYukleniyor(false);
    if (error) return toast.error("Hesap silinemedi. Bizimle iletişime geç.");

    await supabase.auth.signOut();
    toast.success("Hesabın silindi.");
    router.replace("/giris");
  }

  return (
    <Confirm
      open={open}
      onClose={() => {
        setSifre("");
        onClose();
      }}
      onConfirm={sil}
      loading={yukleniyor}
      title="Hesabın kalıcı olarak silinsin mi?"
      text="Bu işlem geri alınamaz. Geçmiş siparişlerin anonim hale getirilir."
      confirmLabel="Hesabımı Sil"
    >
      <PasswordInput
        value={sifre}
        onChange={(e) => setSifre(e.target.value)}
        placeholder="Şifreni yaz"
        autoComplete="current-password"
      />
    </Confirm>
  );
}
