const CACHE = "chichii-v2";
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

  // Network-first for everything same-origin, falling back to the cache
  // only when actually offline. This used to be cache-first for hashed
  // build assets (JS/CSS chunks, icons, images) on the assumption that
  // their URLs are content-hashed and therefore never wrong — that
  // assumption doesn't hold here: this build has repeatedly reused the
  // exact same /_next/static chunk filename across deployments with
  // genuinely different content (observed directly on the print-fix CSS
  // chunk), so a browser that had ever cached that URL kept being served
  // the old bytes forever, no matter how many times the underlying bug
  // was fixed on the server. That's the same staleness failure page
  // navigations were already fixed against — it just also applied one
  // layer down, to the assets those pages load.
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
});
