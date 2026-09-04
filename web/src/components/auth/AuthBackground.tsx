"use client";

import { motion } from "framer-motion";
import { LQIP } from "@/lib/lqip";

/**
 * Tam ekran arka plan: dikey (mobil) ve 90° döndürülmüş yatay (masaüstü/yatay ekran).
 * Önce bulanık LQIP, sonra net görsel fade-in.
 */
export function AuthBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-clay-700">
      {/* LQIP — anında görünür, bulanık */}
      <div
        className="absolute inset-0 bg-cover bg-center landscape:hidden"
        style={{ backgroundImage: `url(${LQIP.portrait})`, transform: "scale(1.06)" }}
        aria-hidden
      />
      <div
        className="absolute inset-0 hidden bg-cover bg-center landscape:block lg:block"
        style={{ backgroundImage: `url(${LQIP.landscape})`, transform: "scale(1.06)" }}
        aria-hidden
      />

      {/* Net görseller */}
      <motion.picture
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        <source media="(orientation: landscape)" srcSet="/brand/auth-bg-landscape.webp" />
        <img
          src="/brand/auth-bg-portrait.webp"
          alt=""
          aria-hidden
          className="size-full object-cover"
          fetchPriority="high"
        />
      </motion.picture>

      {/* Okunabilirlik gradyanı */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/45 to-black/25" aria-hidden />
    </div>
  );
}
