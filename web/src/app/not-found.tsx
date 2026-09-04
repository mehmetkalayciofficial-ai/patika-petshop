import Link from "next/link";
import { PawEmpty } from "@/components/Paws";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <PawEmpty className="w-40" />
      <h1 className="mt-5 text-[22px] font-bold tracking-tight text-ink-900">Bu sayfa yok</h1>
      <p className="mt-2 max-w-[280px] text-[14px] leading-relaxed text-ink-500">
        Aradığın sayfa taşınmış ya da hiç var olmamış olabilir.
      </p>
      <Link
        href="/urunler"
        className="mt-6 rounded-[14px] bg-brand-500 px-5 py-3 text-[15px] font-bold text-ink-900 transition hover:bg-brand-400"
      >
        Ürünlere dön
      </Link>
    </main>
  );
}
