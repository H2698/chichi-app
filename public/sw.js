const CACHE = "chichii-v1";
const CORE_ASSETS = [
  "/home",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/assets/bychichi-logo.png",
  "/assets/founder-photo.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Page navigations (and the underlying RSC/document fetches Next.js issues
  // for them) must never be served cache-first: the URL for a given screen
  // stays the same across deployments while its HTML/JS references change,
  // so a stale-while-revalidate strategy here can pin a visitor's browser to
  // a build that's already been fixed on the server (this is what silently
  // hid the print-preview fix from repeat visitors). Go network-first for
  // navigations, only falling back to the cache when actually offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Everything else (hashed build assets, icons, images) is safe to serve
  // stale-while-revalidate: their URLs are content-hashed or rarely change,
  // so a cached copy is never wrong for long, and this keeps the app usable
  // offline.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
