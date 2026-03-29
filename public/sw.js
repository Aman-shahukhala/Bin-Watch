// "Zero-Cache" Service Worker for BinWatch Pro 
// This satisfies PWA install criteria without storing any local files.
const CACHE_NAME = 'binwatch-live-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Purge all existing caches to ensure a fresh state
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(names.map((name) => caches.delete(name)));
    }).then(() => self.clients.claim())
  );
});

// "Live-Stream" Strategy: 
// We include a fetch listener to satisfy PWA criteria, but we do NOT 
// intercept the requests. This allows the browser to handle them 
// directly via the standard network stack, avoiding CSP "connect-src" 
// issues and providing the best "Zero-Cache" performance.
self.addEventListener('fetch', (event) => {
  // Empty listener is sufficient for PWA "Installable" status 
  // in modern browsers. It defaults to normal browser fetch.
  return;
});
