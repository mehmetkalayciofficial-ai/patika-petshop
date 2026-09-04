import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth/AuthScreen";

export const metadata: Metadata = { title: "Giriş Yap" };

export default async function GirisPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const hedef = next && next.startsWith("/") && !next.startsWith("//") ? next : "/urunler";
  return <AuthScreen next={hedef} />;
}
