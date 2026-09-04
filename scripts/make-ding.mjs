/**
 * Telifsiz "ding" bildirim sesi üretir (saf sinüs + üstel sönüm).
 * Çıktı: web/public/ding.wav  (admin uygulaması da bunu kullanır)
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RATE = 44100;
const SURE = 0.9;
const N = Math.floor(RATE * SURE);

// İki notalı, hoş bir bildirim: C6 → G6 (marimba benzeri sönüm)
const NOTALAR = [
  { f: 1046.5, t0: 0.0, sure: 0.75, kazanc: 0.55 },
  { f: 1567.98, t0: 0.11, sure: 0.72, kazanc: 0.42 },
  { f: 2093.0, t0: 0.11, sure: 0.35, kazanc: 0.12 }, // hafif parlaklık
];

const ornek = new Float32Array(N);
for (let i = 0; i < N; i++) {
  const t = i / RATE;
  let v = 0;
  for (const n of NOTALAR) {
    const dt = t - n.t0;
    if (dt < 0 || dt > n.sure) continue;
    const atak = Math.min(1, dt / 0.004);          // çok kısa atak — "tık" olmasın
    const sonum = Math.exp(-dt * 5.2);             // üstel sönüm
    v += Math.sin(2 * Math.PI * n.f * dt) * n.kazanc * atak * sonum;
  }
  ornek[i] = Math.max(-1, Math.min(1, v));
}

// 16-bit PCM mono WAV
const veri = Buffer.alloc(N * 2);
for (let i = 0; i < N; i++) veri.writeInt16LE(Math.round(ornek[i] * 32767 * 0.9), i * 2);

const wav = Buffer.alloc(44 + veri.length);
wav.write("RIFF", 0);
wav.writeUInt32LE(36 + veri.length, 4);
wav.write("WAVE", 8);
wav.write("fmt ", 12);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);   // PCM
wav.writeUInt16LE(1, 22);   // mono
wav.writeUInt32LE(RATE, 24);
wav.writeUInt32LE(RATE * 2, 28);
wav.writeUInt16LE(2, 32);
wav.writeUInt16LE(16, 34);
wav.write("data", 36);
wav.writeUInt32LE(veri.length, 40);
veri.copy(wav, 44);

mkdirSync(resolve(ROOT, "web/public"), { recursive: true });
writeFileSync(resolve(ROOT, "web/public/ding.wav"), wav);
console.log(`✓ ding.wav (${(wav.length / 1024).toFixed(0)} KB, ${SURE}s)`);
