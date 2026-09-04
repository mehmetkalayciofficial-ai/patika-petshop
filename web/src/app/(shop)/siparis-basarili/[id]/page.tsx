import type { Metadata } from "next";
import { SiparisBasarili } from "@/components/shop/OrderSuccess";

export const metadata: Metadata = { title: "Siparişin Alındı" };

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ no?: string }>;
}) {
  const { id } = await params;
  const { no } = await searchParams;
  return <SiparisBasarili id={id} no={no} />;
}
