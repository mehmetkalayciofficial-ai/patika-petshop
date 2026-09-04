"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui";
import { PawIcon } from "@/components/Paws";

const KONFETI = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  x: (i % 7) * 14 - 42 + (i % 3) * 5,
  delay: 0.25 + (i % 7) * 0.045,
  rot: (i * 47) % 360,
  scale: 0.5 + ((i * 13) % 7) / 12,
}));

export function SiparisBasarili({ id, no }: { id: string; no?: string }) {
  const [goster, setGoster] = useState(false);
  useEffect(() => setGoster(true), []);

  return (
    <div className="relative flex min-h-[72dvh] flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
      {/* pati konfetisi */}
      {goster &&
        KONFETI.map((k) => (
          <motion.span
            key={k.id}
            initial={{ opacity: 0, y: 0, x: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 1, 0], y: [-10, -120 - k.id * 4], x: k.x * 2.4, scale: k.scale, rotate: k.rot }}
            transition={{ duration: 1.7, delay: k.delay, ease: "easeOut" }}
            className="pointer-events-none absolute top-1/3 text-brand-400"
          >
            <PawIcon className="size-5" />
          </motion.span>
        ))}

      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="relative flex size-24 items-center justify-center rounded-full bg-brand-500 shadow-[0_10px_36px_rgba(240,180,41,.5)]"
      >
        <motion.span
          initial={{ scale: 0, rotate: -25 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.22, type: "spring", stiffness: 380, damping: 16 }}
        >
          <Check className="size-12 stroke-[3] text-ink-900" />
        </motion.span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 text-[24px] font-bold tracking-tight text-ink-900"
      >
        Siparişin alındı! 🐾
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38 }}
        className="mt-2 max-w-[300px] text-[14.5px] leading-relaxed text-ink-500"
      >
        {no ? (
          <>
            Sipariş numaran <b className="text-ink-800">#{no}</b>. Hazırlanmaya başladığında haber vereceğiz.
          </>
        ) : (
          <>Siparişin bize ulaştı. Hazırlanmaya başladığında haber vereceğiz.</>
        )}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.46 }}
        className="mt-7 flex w-full max-w-[320px] flex-col gap-2.5"
      >
        <Link href={`/profil/siparislerim/${id}`}>
          <Button full size="lg">
            Siparişimi Takip Et
          </Button>
        </Link>
        <Link href="/urunler">
          <Button full tone="outline" size="lg">
            Alışverişe Devam Et
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
