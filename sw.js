let APP_VERSION = 'v0'; // デフォルト（受信前）
let CACHE_NAME = 'pwa-cache-' + APP_VERSION;

const urlsToCache = [
  '/pwa-page/',
  '/pwa-page/index.html',
  '/pwa-page/manifest.json',
  '/pwa-page/version.js'
];

self.addEventListener('message', event => {
  if (event.data?.type === 'version') {
    APP_VERSION = event.data.version;
    CACHE_NAME = 'pwa-cache-' + APP_VERSION;
    console.log('[SW] 受信バージョン:', APP_VERSION);
  }
});

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(
        urlsToCache.map(url =>
          fetch(new Request(url, { cache: 'reload' }))
            .then(res => res.ok && cache.put(url, res))
        )
      )
    )
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(res => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
