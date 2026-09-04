/* Patika Pet Market — basit statik önbellek */
const SURUM = "patika-v1";
const ONBELLEK = [
  "/brand/logo-128.png",
  "/brand/logo-192.png",
  "/brand/logo-256.png",
  "/brand/hero-bg-mobile.webp",
  "/brand/paw-divider.png",
  "/ding.wav",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(SURUM).then((c) => c.addAll(ONBELLEK)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((adlar) => Promise.all(adlar.filter((a) => a !== SURUM).map((a) => caches.delete(a)))).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  // sadece statik marka dosyaları — sayfa/veri isteklerine dokunma
  if (!/^\/(brand|ding\.wav)/.test(url.pathname)) return;

  e.respondWith(
    caches.match(e.request).then(
      (v) =>
        v ??
        fetch(e.request).then((yanit) => {
          const kopya = yanit.clone();
          caches.open(SURUM).then((c) => c.put(e.request, kopya));
          return yanit;
        }),
    ),
  );
});
