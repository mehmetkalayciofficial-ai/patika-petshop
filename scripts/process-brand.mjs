/**
 * Patika Petshop — marka görselleri işleme.
 * Kaynak: assets/raw/*  → Çıktı: web/public/brand/*
 * Çalıştır: node scripts/process-brand.mjs
 */
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = (f) => resolve(ROOT, "assets/raw", f);
const OUT = (f) => resolve(ROOT, "web/public/brand", f);

const BRAND = "#F0B429"; // bal
const ACCENT = "#C0492B"; // kiremit

await mkdir(resolve(ROOT, "web/public/brand"), { recursive: true });

/* ------------------------------------------------------------------ */
/* 1) LOGO — siyah zemini at, kare kırp, dairesel maske               */
/* ------------------------------------------------------------------ */

async function contentBox(file, threshold = 42) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      if (a < 16) continue;
      if (r <= threshold && g <= threshold && b <= threshold) continue; // siyah zemin
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return { left: 0, top: 0, width, height };
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

function circleMask(size) {
  // Kenarda yumuşak (anti-alias) geçiş için 2px'lik ince halka
  const r = size / 2;
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${r}" cy="${r}" r="${r - 1}" fill="#fff"/>
  </svg>`;
  return Buffer.from(svg);
}

async function buildLogo() {
  const src = RAW("logo-raw.jpg");
  const box = await contentBox(src);
  // kareye tamamla (merkezli)
  const side = Math.max(box.width, box.height);
  const meta = await sharp(src).metadata();
  let left = Math.round(box.left + box.width / 2 - side / 2);
  let top = Math.round(box.top + box.height / 2 - side / 2);
  left = Math.max(0, Math.min(left, meta.width - side));
  top = Math.max(0, Math.min(top, meta.height - side));

  const SIZE = 1024;
  const square = await sharp(src)
    .extract({ left, top, width: side, height: side })
    .resize(SIZE, SIZE, { fit: "cover" })
    .toBuffer();

  const circle = await sharp(square)
    .composite([{ input: circleMask(SIZE), blend: "dest-in" }])
    .png()
    .toBuffer();

  await writeFile(OUT("logo-circle.png"), circle);
  for (const s of [512, 256, 192, 128, 64]) {
    await sharp(circle).resize(s, s).png().toFile(OUT(`logo-${s}.png`));
  }

  // apple-touch-icon — şeffaflık sevmez, marka zemin
  await sharp({ create: { width: 180, height: 180, channels: 4, background: BRAND } })
    .composite([{ input: await sharp(circle).resize(180, 180).toBuffer() }])
    .png()
    .toFile(OUT("apple-touch-icon.png"));

  // PWA maskable — güvenli alan için %78 ölçek, marka zemin
  for (const s of [192, 512]) {
    const inner = Math.round(s * 0.78);
    await sharp({ create: { width: s, height: s, channels: 4, background: BRAND } })
      .composite([{ input: await sharp(circle).resize(inner, inner).toBuffer(), gravity: "centre" }])
      .png()
      .toFile(OUT(`maskable-${s}.png`));
  }

  // favicon (32 + 16 png; .ico yerine modern tarayıcılar png kabul eder)
  await sharp(circle).resize(32, 32).png().toFile(OUT("favicon-32.png"));
  await sharp(circle).resize(16, 16).png().toFile(OUT("favicon-16.png"));

  // Android adaptive icon: ön plan (logo, %66 güvenli alan) + arka plan düz renk
  await sharp({ create: { width: 432, height: 432, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: await sharp(circle).resize(286, 286).toBuffer(), gravity: "centre" }])
    .png()
    .toFile(OUT("android-foreground.png"));
  await sharp({ create: { width: 432, height: 432, channels: 4, background: BRAND } })
    .png()
    .toFile(OUT("android-background.png"));

  console.log(`✓ logo  (kırpma: ${side}×${side} @ ${left},${top})`);
}

/* ------------------------------------------------------------------ */
/* 2) AUTH arka planı — dikey + 90° döndürülmüş yatay                 */
/* ------------------------------------------------------------------ */

async function lqip(buf, name) {
  const b64 = (await sharp(buf).resize(24).blur(2).webp({ quality: 40 }).toBuffer()).toString("base64");
  return `data:image/webp;base64,${b64}`;
}

async function buildAuthBg() {
  const src = RAW("auth-bg-raw.png");
  const portrait = await sharp(src)
    .resize(1080, 1920, { fit: "cover", position: "attention" })
    .webp({ quality: 82 })
    .toBuffer();
  await writeFile(OUT("auth-bg-portrait.webp"), portrait);

  // 90° döndür (saat yönü) → nesneler sol/üst tarafta kalsın, boş kırmızı alan sağa gelsin
  const landscape = await sharp(src)
    .rotate(90)
    .resize(1920, 1080, { fit: "cover", position: "attention" })
    .webp({ quality: 82 })
    .toBuffer();
  await writeFile(OUT("auth-bg-landscape.webp"), landscape);

  const lq = {
    portrait: await lqip(portrait),
    landscape: await lqip(landscape),
  };
  return lq;
}

/* ------------------------------------------------------------------ */
/* 3) HERO                                                            */
/* ------------------------------------------------------------------ */

async function buildHero() {
  const src = RAW("hero-bg-raw.png");
  const desk = await sharp(src).resize(1920, 900, { fit: "cover", position: "attention" }).webp({ quality: 82 }).toBuffer();
  await writeFile(OUT("hero-bg.webp"), desk);
  const mob = await sharp(src).resize(1080, 720, { fit: "cover", position: "attention" }).webp({ quality: 80 }).toBuffer();
  await writeFile(OUT("hero-bg-mobile.webp"), mob);
  return { hero: await lqip(desk), heroMobile: await lqip(mob) };
}

/* ------------------------------------------------------------------ */
/* 4) PATİ AYIRICI — transparanlık korunur                            */
/* ------------------------------------------------------------------ */

async function buildPaw() {
  const src = RAW("paw-divider-raw.png");
  await sharp(src).trim({ threshold: 5 }).resize({ width: 1200 }).png({ compressionLevel: 9 }).toFile(OUT("paw-divider.png"));
  console.log("✓ pati ayırıcı");
}

/* ------------------------------------------------------------------ */

const authLqip = await buildAuthBg();
console.log("✓ auth arka planı (dikey + yatay)");
const heroLqip = await buildHero();
console.log("✓ hero");
await buildLogo();
await buildPaw();

await writeFile(
  resolve(ROOT, "web/src/lib/lqip.ts"),
  `// scripts/process-brand.mjs tarafından üretildi — elle düzenleme.\n` +
    `export const LQIP = ${JSON.stringify({ ...authLqip, ...heroLqip }, null, 2)} as const;\n`,
);
console.log("✓ LQIP yazıldı → web/src/lib/lqip.ts");
console.log(`\nMarka: ${BRAND} · Vurgu: ${ACCENT}`);
