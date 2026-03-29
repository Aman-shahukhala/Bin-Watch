// "Zero-Cache" Service Worker for BinWatch Pro 
// This satisfies PWA install criteria without storing any local files.
const CACHE_NAME = 'binwatch-live-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(names.map((name) => caches.delete(name)));
    }).then(() => self.clients.claim())
  );
});

// "Live-Stream" Strategy: 
// Explicit fetch pass-through to satisfy PWA criteria while 
// ensuring all requests hit the network directly.
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
