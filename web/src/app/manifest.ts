import type { MetadataRoute } from "next";
import { SITE, MARKA } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.ad,
    short_name: SITE.kisaAd,
    description: SITE.aciklama,
    start_url: "/urunler",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FBFAF7",
    theme_color: MARKA.ana,
    lang: "tr",
    icons: [
      { src: "/brand/logo-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/brand/logo-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/brand/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/brand/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
