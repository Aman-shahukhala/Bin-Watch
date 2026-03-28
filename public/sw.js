const CACHE_NAME = 'binwatch-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/logo.png',
  '/icon-512.png',
  '/favicon.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css',
  'https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css',
  'https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.css'
  // NOTE: JS scripts are intentionally NOT cached to preserve load order
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(err => {
         console.warn('[SW] Fetch failed; returning offline error.', err);
         // Optionally return a specific offline page here
      });
    })
  );
});
