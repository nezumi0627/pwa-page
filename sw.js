// sw.js
const CACHE_NAME = 'pwa-cache-v1';
const urlsToCache = [
  '/',
  '/pwa-page/index.html',
  '/pwa-page/manifest.json',
  // 他に必要なリソースを追加
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.all(
        urlsToCache.map(url => 
          fetch(new Request(url, {cache: 'reload'}))
            .then(response => cache.put(url, response))
        )
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener('message', event => {
  if(event.data === 'update'){
    caches.open(CACHE_NAME)
      .then(cache => {
        return Promise.all(
          urlsToCache.map(url =>
            fetch(new Request(url, {cache: 'reload'}))
              .then(response => cache.put(url, response))
          )
        );
      })
      .then(() => {
        self.clients.matchAll().then(clients => {
          clients.forEach(client => client.postMessage('update-complete'));
        });
      });
  }
});
