/* Kendi çizdiğimiz basit pati SVG'leri — dekor ve boş durumlar için. */

export function PawIcon({ className = "", ...rest }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden {...rest}>
      <ellipse cx="7.2" cy="8.4" rx="2.15" ry="2.75" transform="rotate(-18 7.2 8.4)" />
      <ellipse cx="12" cy="6.6" rx="2.25" ry="2.9" />
      <ellipse cx="16.8" cy="8.4" rx="2.15" ry="2.75" transform="rotate(18 16.8 8.4)" />
      <ellipse cx="19.9" cy="13.1" rx="1.95" ry="2.4" transform="rotate(34 19.9 13.1)" />
      <path d="M12 11.4c2.7 0 5.4 1.9 5.4 4.4 0 2.2-1.9 3.5-3.6 3.9-1.2.3-2.4.3-3.6 0-1.7-.4-3.6-1.7-3.6-3.9 0-2.5 2.7-4.4 5.4-4.4Z" />
      <ellipse cx="4.1" cy="13.1" rx="1.95" ry="2.4" transform="rotate(-34 4.1 13.1)" />
    </svg>
  );
}

/** Çok soluk, dekoratif pati deseni — köşelere serpiştirilir. */
export function PawPattern({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden fill="currentColor">
      <g opacity="0.9">
        <g transform="translate(18 26) rotate(-14) scale(1.5)"><PawShape /></g>
        <g transform="translate(96 12) rotate(22) scale(1.1)"><PawShape /></g>
        <g transform="translate(146 74) rotate(-8) scale(1.7)"><PawShape /></g>
        <g transform="translate(44 104) rotate(30) scale(1.25)"><PawShape /></g>
        <g transform="translate(112 150) rotate(-24) scale(1.45)"><PawShape /></g>
        <g transform="translate(6 158) rotate(8) scale(1)"><PawShape /></g>
      </g>
    </svg>
  );
}

function PawShape() {
  return (
    <>
      <ellipse cx="6" cy="7" rx="2" ry="2.6" transform="rotate(-18 6 7)" />
      <ellipse cx="11" cy="5.4" rx="2.1" ry="2.7" />
      <ellipse cx="16" cy="7" rx="2" ry="2.6" transform="rotate(18 16 7)" />
      <path d="M11 10.2c2.6 0 5.1 1.8 5.1 4.2 0 2.1-1.8 3.3-3.4 3.7-1.1.3-2.3.3-3.4 0-1.6-.4-3.4-1.6-3.4-3.7 0-2.4 2.5-4.2 5.1-4.2Z" />
    </>
  );
}

/** Yükleme göstergesi — zıplayan üç pati. */
export function PawLoader({ className = "" }: { className?: string }) {
  return (
    <div className={`paw-bounce flex items-end gap-1.5 text-brand-500 ${className}`} role="status" aria-label="Yükleniyor">
      <PawIcon className="size-5" />
      <PawIcon className="size-5" />
      <PawIcon className="size-5" />
    </div>
  );
}

/** Boş durum illüstrasyonu — sepet / sipariş yok. */
export function PawEmpty({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 130" className={className} aria-hidden>
      <ellipse cx="80" cy="112" rx="52" ry="9" className="fill-ink-100" />
      <g className="fill-brand-100">
        <g transform="translate(24 20) scale(2.1)"><PawShape /></g>
      </g>
      <g className="fill-brand-200">
        <g transform="translate(84 8) rotate(16) scale(1.6)"><PawShape /></g>
      </g>
      <g className="fill-brand-300">
        <g transform="translate(66 52) rotate(-8) scale(2.6)"><PawShape /></g>
      </g>
      <g className="fill-brand-100">
        <g transform="translate(14 66) rotate(24) scale(1.3)"><PawShape /></g>
      </g>
    </svg>
  );
}

/** Pati izli bölüm ayırıcı — public/brand/paw-divider.png maskesiyle marka rengine boyanır. */
export function PawDivider({ flip = false, className = "" }: { flip?: boolean; className?: string }) {
  return (
    <div className={`flex justify-center py-7 sm:py-9 ${className}`} aria-hidden>
      <div
        className="paw-divider h-8 w-[min(320px,72vw)] bg-brand-400/45 sm:h-10 sm:w-[420px]"
        style={{
          ["--paw-src" as string]: "url(/brand/paw-divider.png)",
          transform: flip ? "scaleX(-1)" : undefined,
        }}
      />
    </div>
  );
}
