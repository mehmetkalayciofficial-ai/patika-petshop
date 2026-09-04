"use client";

import { supabaseBrowser } from "@/lib/supabase/client";
import type { Address } from "@/lib/types";

export async function adresleriGetir(): Promise<Address[]> {
  const supabase = supabaseBrowser();
  const { data } = await supabase
    .from("addresses")
    .select("*")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });
  return (data as Address[]) ?? [];
}

export const ADRES_BASLIKLARI = ["Ev", "İş", "Diğer"] as const;
