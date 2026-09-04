import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { SITE, MARKA } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.ad} — Online Sipariş`, template: `%s · ${SITE.ad}` },
  description: SITE.aciklama,
  applicationName: SITE.ad,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/brand/apple-touch-icon.png",
  },
  appleWebApp: { capable: true, title: SITE.kisaAd, statusBarStyle: "black-translucent" },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: SITE.ad,
    title: `${SITE.ad} — Online Sipariş`,
    description: SITE.aciklama,
    images: [{ url: "/brand/logo-512.png", width: 512, height: 512 }],
  },
};

export const viewport: Viewport = {
  themeColor: MARKA.ana,
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={inter.variable}>
      <body className="antialiased">
        {children}
        <Toaster
          position="top-center"
          duration={3200}
          toastOptions={{
            style: {
              borderRadius: "14px",
              border: "1px solid var(--color-line)",
              boxShadow: "var(--shadow-lift)",
              fontFamily: "var(--font-sans)",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
