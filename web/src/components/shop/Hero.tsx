import Image from "next/image";
import { SITE } from "@/lib/site";
import { PawPattern } from "@/components/Paws";

export function Hero({ duyuru, kapali }: { duyuru?: string | null; kapali?: boolean }) {
  return (
    <section className="relative">
      <div className="relative h-[210px] overflow-hidden sm:h-[300px] lg:h-[340px]">
        <picture>
          <source media="(min-width: 640px)" srcSet="/brand/hero-bg.webp" />
          <img
            src="/brand/hero-bg-mobile.webp"
            alt=""
            aria-hidden
            className="size-full object-cover"
            fetchPriority="high"
          />
        </picture>

        {/* aşağı doğru koyulaşan katman */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,.78) 0%, rgba(0,0,0,.62) 22%, rgba(0,0,0,.34) 52%, rgba(0,0,0,.18) 100%)",
          }}
          aria-hidden
        />

        {/* çok soluk pati deseni */}
        <PawPattern className="pointer-events-none absolute -right-6 -top-8 size-56 text-white/[.07] sm:size-72" />

        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto flex max-w-6xl items-end gap-3.5 px-4 pb-10 sm:px-6 sm:pb-12">
            <Image
              src="/brand/logo-192.png"
              alt=""
              width={72}
              height={72}
              priority
              className="size-[58px] shrink-0 rounded-full ring-[3px] ring-white/85 drop-shadow-[0_6px_18px_rgba(0,0,0,.45)] sm:size-[72px]"
            />
            <div className="min-w-0 pb-0.5">
              <h1 className="text-[21px] font-bold leading-tight tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,.55)] sm:text-[28px]">
                {SITE.ad}
              </h1>
              <p className="mt-1 line-clamp-2 text-[13px] font-medium leading-snug text-white/85 drop-shadow-[0_1px_8px_rgba(0,0,0,.6)] sm:text-[15px]">
                {SITE.tagline}
              </p>
            </div>
          </div>
        </div>
      </div>

      {kapali && (
        <div className="bg-bad-500 px-4 pb-9 pt-2.5 text-center text-[13px] font-semibold text-white">
          Şu an sipariş alamıyoruz — yakında tekrar açığız.
        </div>
      )}
      {!kapali && duyuru && (
        <div className="bg-brand-500 px-4 pb-9 pt-2.5 text-center text-[13px] font-semibold text-ink-900">{duyuru}</div>
      )}
    </section>
  );
}
