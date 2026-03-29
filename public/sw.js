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

// --- WebPush Notification Support ---

self.addEventListener('push', (event) => {
  let data = { title: 'BinWatch Pro', body: 'System Alert', icon: '/favicon.png' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/favicon.png',
    badge: '/favicon.png',
    vibrate: [200, 100, 200],
    data: {
      url: self.registration.scope
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});
