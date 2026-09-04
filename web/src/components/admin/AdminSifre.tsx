"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SifreDegistirForm } from "@/components/profil/SifreDegistirForm";

export function AdminSifre({ email }: { email: string }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-4 sm:px-6">
      <Link href="/admin" className="mb-3 inline-flex items-center gap-1 text-[14px] font-semibold text-ink-500 transition hover:text-ink-800">
        <ChevronLeft className="size-4" /> Siparişler
      </Link>
      <h1 className="text-[20px] font-bold tracking-tight text-ink-900">Şifre Değiştir</h1>
      <p className="mt-1 text-[13.5px] text-ink-500">En az 8 karakter, 1 harf ve 1 rakam.</p>
      <div className="mt-5">
        <SifreDegistirForm email={email} />
      </div>
    </div>
  );
}
