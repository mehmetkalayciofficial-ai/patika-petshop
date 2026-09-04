/**
 * Admin APK ikon/splash/ses kaynaklarını üretir.
 * Çalıştır: node scripts/android-assets.mjs
 */
import sharp from "sharp";
import { mkdir, copyFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RES = resolve(ROOT, "admin-app/android/app/src/main/res");
const LOGO = resolve(ROOT, "web/public/brand/logo-circle.png");
const BRAND = "#F0B429";

const MIPMAP = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
const FG = { mdpi: 108, hdpi: 162, xhdpi: 216, xxhdpi: 324, xxxhdpi: 432 };

for (const [dpi, boy] of Object.entries(MIPMAP)) {
  const dir = resolve(RES, `mipmap-${dpi}`);
  await mkdir(dir, { recursive: true });

  // klasik (yuvarlak logo, marka zeminli kare)
  const kare = await sharp({ create: { width: boy, height: boy, channels: 4, background: BRAND } })
    .composite([{ input: await sharp(LOGO).resize(boy, boy).toBuffer() }])
    .png()
    .toBuffer();
  await writeFile(resolve(dir, "ic_launcher.png"), kare);
  await writeFile(resolve(dir, "ic_launcher_round.png"), await sharp(LOGO).resize(boy, boy).png().toBuffer());

  // adaptive foreground — %64 güvenli alan
  const fgBoy = FG[dpi];
  const ic = Math.round(fgBoy * 0.64);
  await sharp({ create: { width: fgBoy, height: fgBoy, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: await sharp(LOGO).resize(ic, ic).toBuffer(), gravity: "centre" }])
    .png()
    .toFile(resolve(dir, "ic_launcher_foreground.png"));
}

// adaptive icon zemin rengi
await writeFile(
  resolve(RES, "values/ic_launcher_background.xml"),
  `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${BRAND}</color>\n</resources>\n`,
);

/* ---- durum çubuğu ikonu: beyaz siluet pati (tek renk zorunlu) ---- */
const PATI_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="96" height="96">
  <g fill="#ffffff">
    <ellipse cx="7.2" cy="8.4" rx="2.15" ry="2.75" transform="rotate(-18 7.2 8.4)"/>
    <ellipse cx="12" cy="6.6" rx="2.25" ry="2.9"/>
    <ellipse cx="16.8" cy="8.4" rx="2.15" ry="2.75" transform="rotate(18 16.8 8.4)"/>
    <ellipse cx="19.9" cy="13.1" rx="1.95" ry="2.4" transform="rotate(34 19.9 13.1)"/>
    <path d="M12 11.4c2.7 0 5.4 1.9 5.4 4.4 0 2.2-1.9 3.5-3.6 3.9-1.2.3-2.4.3-3.6 0-1.7-.4-3.6-1.7-3.6-3.9 0-2.5 2.7-4.4 5.4-4.4Z"/>
    <ellipse cx="4.1" cy="13.1" rx="1.95" ry="2.4" transform="rotate(-34 4.1 13.1)"/>
  </g>
</svg>`;
const STAT = { mdpi: 24, hdpi: 36, xhdpi: 48, xxhdpi: 72, xxxhdpi: 96 };
for (const [dpi, boy] of Object.entries(STAT)) {
  const dir = resolve(RES, `drawable-${dpi}`);
  await mkdir(dir, { recursive: true });
  await sharp(Buffer.from(PATI_SVG)).resize(boy, boy).png().toFile(resolve(dir, "ic_stat_paw.png"));
}

/* ---- splash: marka zeminli, ortada logo ---- */
const SPLASH = {
  "drawable-port-mdpi": [320, 480], "drawable-port-hdpi": [480, 800], "drawable-port-xhdpi": [720, 1280],
  "drawable-port-xxhdpi": [960, 1600], "drawable-port-xxxhdpi": [1280, 1920],
  "drawable-land-mdpi": [480, 320], "drawable-land-hdpi": [800, 480], "drawable-land-xhdpi": [1280, 720],
  "drawable-land-xxhdpi": [1600, 960], "drawable-land-xxxhdpi": [1920, 1280],
  drawable: [480, 800],
};
for (const [dir, [w, h]] of Object.entries(SPLASH)) {
  const hedef = resolve(RES, dir);
  await mkdir(hedef, { recursive: true });
  const ic = Math.round(Math.min(w, h) * 0.38);
  await sharp({ create: { width: w, height: h, channels: 4, background: BRAND } })
    .composite([{ input: await sharp(LOGO).resize(ic, ic).toBuffer(), gravity: "centre" }])
    .png()
    .toFile(resolve(hedef, "splash.png"));
}

/* ---- bildirim sesi ---- */
await mkdir(resolve(RES, "raw"), { recursive: true });
await copyFile(resolve(ROOT, "web/public/ding.wav"), resolve(RES, "raw/ding.wav"));

console.log("✓ Android ikon / splash / ses kaynakları üretildi");
