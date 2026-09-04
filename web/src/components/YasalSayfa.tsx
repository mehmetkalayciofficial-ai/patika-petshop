import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { SITE } from "@/lib/site";

export function YasalSayfa({ baslik, children }: { baslik: string; children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-page">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4 sm:px-6">
          <Image src="/brand/logo-128.png" alt="" width={34} height={34} className="size-[34px] rounded-full ring-1 ring-brand-200" />
          <span className="text-[15px] font-bold text-ink-900">{SITE.ad}</span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        <Link href="/giris" className="mb-4 inline-flex items-center gap-1 text-[14px] font-semibold text-ink-500 transition hover:text-ink-800">
          <ChevronLeft className="size-4" /> Geri
        </Link>
        <h1 className="text-[24px] font-bold tracking-tight text-ink-900">{baslik}</h1>
        <div className="mt-5 space-y-4 rounded-[18px] bg-white p-5 text-[14.5px] leading-relaxed text-ink-600 shadow-soft sm:p-7 [&_h2]:mt-6 [&_h2]:text-[16px] [&_h2]:font-bold [&_h2]:text-ink-900 [&_h2:first-child]:mt-0 [&_li]:mt-1.5 [&_ul]:list-disc [&_ul]:pl-5">
          {children}
        </div>
      </div>
    </main>
  );
}
