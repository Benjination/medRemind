const CACHE_NAME = 'medication-reminder-v1';
const urlsToCache = [
  '/',
  '/medRemind.html',
  '/app.js',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
  // Add any other assets your app uses
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          // You could return a custom offline page here
          return new Response('You are offline');
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('push', function(event) {
    const options = {
      body: event.data.text(),
      icon: '/icon-192x192.png'
    };
  
    event.waitUntil(
      self.registration.showNotification('Medication Reminder', options)
    );
  });