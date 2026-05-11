const CACHE_NAME = 'jogjamap-v2-cache';
const ASSETS = [
  '/',
  '/index.html',
  '/css/main.css',
  '/css/sidebar.css',
  '/css/detail-panel.css',
  '/css/pages.css',
  '/css/welcome.css',
  '/css/components.css',
  '/js/main.js',
  '/js/state.js',
  '/js/map.js',
  '/js/markers.js',
  '/js/layers.js',
  '/js/utils/helpers.js',
  '/js/utils/loader.js',
  '/js/utils/router.js',
  '/js/utils/worker.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;

  // Cache GeoJSON heavily
  if (event.request.url.includes('.geojson') || event.request.url.includes('.json')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) return response;
        return fetch(event.request).then(netRes => {
          const resClone = netRes.clone();
          caches.open('jogjamap-data').then(cache => {
            cache.put(event.request, resClone);
          });
          return netRes;
        });
      })
    );
    return;
  }

  // Network first for logic, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const resClone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
