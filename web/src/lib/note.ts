"use client";

import { useEffect, useState } from "react";

const KEY = "patika.not.v1";

/** Sipariş notu — sepet ile sipariş ekranı arasında paylaşılır. */
export function useSiparisNotu() {
  const [not, setNot] = useState("");

  useEffect(() => {
    try {
      setNot(localStorage.getItem(KEY) ?? "");
    } catch {
      /* yok say */
    }
  }, []);

  const yaz = (v: string) => {
    setNot(v);
    try {
      localStorage.setItem(KEY, v);
    } catch {
      /* yok say */
    }
  };

  return [not, yaz] as const;
}

export function notuTemizle() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* yok say */
  }
}
