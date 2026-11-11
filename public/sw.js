/* Quebrando a Banca · Service Worker do Modo Academia (PWA)
 * Cacheia apenas recursos estáticos de interface (/claude-export/*, ícone, manifesto).
 * NUNCA armazena respostas de API nem documentos privados de contas no Cache Storage.
 */
const CACHE_NAME = "qb-static-axon-v3";
const PRECACHE_URLS = [
  "/manifest.webmanifest",
  "/qb-icon.svg",
  "/claude-export/ambient-poster.jpg",
  "/claude-export/glass-iris.css?v=1",
  "/claude-export/radial-dashboard.css?v=1",
  "/claude-export/radial-annulus.css?v=1",
  "/claude-export/training-radial.css?v=1",
  "/claude-export/area-radial.css?v=1",
  "/claude-export/axon-shell.css?v=1",
  "/claude-export/offline-sync.css?v=1",
  "/claude-export/omnistudy-ai.css?v=1",
  "/claude-export/omnistudy-cornell.css?v=1",
  "/claude-export/radial-axon-flow.js?v=1",
  "/claude-export/training-radial.js?v=2",
  "/claude-export/area-radial.js?v=1",
  "/claude-export/radial-dashboard.js?v=2",
  "/claude-export/axon-shell.js?v=1",
  "/claude-export/offline-sync.js?v=1",
  "/claude-export/omnistudy-cornell.js?v=1",
  "/claude-export/omnistudy-ai.js?v=2"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isSafeStaticAsset(url) {
  if (url.origin !== self.location.origin) return false;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_server")) return false;
  return (
    url.pathname.startsWith("/claude-export/") ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname === "/qb-icon.svg" ||
    /\.(?:css|js|svg|jpg|png|woff2?)$/i.test(url.pathname)
  );
}

self.addEventListener("fetch", event => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (!isSafeStaticAsset(url)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async cache => {
      try {
        // Revalidar recursos no servidor após cada publicação; manter fallback offline.
        const networkResponse = await fetch(request, { cache: "no-cache" });
        if (networkResponse && networkResponse.ok) {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch {
        const cached = await cache.match(request);
        if (cached) return cached;
        throw new Error("Recurso estático indisponível offline.");
      }
    })
  );
});
