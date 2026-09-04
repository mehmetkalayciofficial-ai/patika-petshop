"use client";

/**
 * Yeni sipariş bildirimi.
 * - Web: ding sesi + tarayıcı bildirimi (izin verilmişse)
 * - Capacitor (admin APK): native yerel bildirim (kilit ekranına düşer, sesli)
 */

type CapPlugin = {
  LocalNotifications?: {
    schedule: (o: unknown) => Promise<unknown>;
    requestPermissions: () => Promise<{ display: string }>;
    checkPermissions: () => Promise<{ display: string }>;
    createChannel?: (o: unknown) => Promise<unknown>;
  };
  Haptics?: { impact: (o: unknown) => Promise<unknown> };
};

type CapGlobal = {
  Capacitor?: { isNativePlatform?: () => boolean; Plugins?: CapPlugin };
};

function cap(): CapPlugin | null {
  const w = window as unknown as CapGlobal;
  if (!w.Capacitor?.isNativePlatform?.()) return null;
  return w.Capacitor.Plugins ?? null;
}

export const nativeMi = () => typeof window !== "undefined" && !!cap();

let sesElemani: HTMLAudioElement | null = null;

/** Kullanıcı etkileşiminden sonra bir kez çağrılır — tarayıcı otomatik oynatmayı böyle açar. */
export function sesiHazirla() {
  if (typeof window === "undefined" || sesElemani) return;
  sesElemani = new Audio("/ding.wav");
  sesElemani.preload = "auto";
  sesElemani.volume = 0.9;
  // sessiz bir kez oynatıp "kullanıcı onaylı" hale getir
  const v = sesElemani.volume;
  sesElemani.volume = 0;
  sesElemani
    .play()
    .then(() => {
      sesElemani!.pause();
      sesElemani!.currentTime = 0;
      sesElemani!.volume = v;
    })
    .catch(() => {
      sesElemani!.volume = v;
    });
}

export function dingCal() {
  try {
    if (!sesElemani) sesElemani = new Audio("/ding.wav");
    sesElemani.currentTime = 0;
    void sesElemani.play();
  } catch {
    /* tarayıcı engelledi — sessiz geç */
  }
}

/** Android kanalını oluşturur ve izin ister (uygulama ilk açılışında). */
export async function bildirimIzniIste(): Promise<boolean> {
  const p = cap();
  if (p?.LocalNotifications) {
    try {
      await p.LocalNotifications.createChannel?.({
        id: "orders",
        name: "Siparişler",
        description: "Yeni sipariş bildirimleri",
        importance: 5,
        visibility: 1,
        sound: "ding.wav",
        vibration: true,
        lights: true,
        lightColor: "#F0B429",
      });
      const mevcut = await p.LocalNotifications.checkPermissions();
      if (mevcut.display === "granted") return true;
      const sonuc = await p.LocalNotifications.requestPermissions();
      return sonuc.display === "granted";
    } catch {
      return false;
    }
  }

  if (typeof Notification === "undefined") return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  return (await Notification.requestPermission()) === "granted";
}

export async function bildirimIzniVarMi(): Promise<boolean> {
  const p = cap();
  if (p?.LocalNotifications) {
    try {
      return (await p.LocalNotifications.checkPermissions()).display === "granted";
    } catch {
      return false;
    }
  }
  return typeof Notification !== "undefined" && Notification.permission === "granted";
}

let sayac = 1;

/** Yeni sipariş bildirimi gönderir (kilit ekranına düşer, ding çalar). */
export async function yeniSiparisBildir(baslik: string, govde: string, orderId: string) {
  dingCal();

  const p = cap();
  if (p?.LocalNotifications) {
    try {
      await p.Haptics?.impact({ style: "HEAVY" });
      await p.LocalNotifications.schedule({
        notifications: [
          {
            id: (sayac = (sayac + 1) % 2147483647),
            title: baslik,
            body: govde,
            channelId: "orders",
            sound: "ding.wav",
            smallIcon: "ic_stat_paw",
            iconColor: "#F0B429",
            extra: { orderId },
            schedule: { at: new Date(Date.now() + 120) },
          },
        ],
      });
      return;
    } catch {
      /* native başarısız — web bildirimine düş */
    }
  }

  try {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification(baslik, { body: govde, icon: "/brand/logo-192.png", tag: orderId });
    }
  } catch {
    /* yok say */
  }
}
