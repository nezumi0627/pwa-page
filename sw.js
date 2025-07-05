const CACHE_NAME = 'pwa-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // 必要に応じて追加
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.all(urlsToCache.map(url =>
        fetch(new Request(url, {cache: 'reload'}))
          .then(response => cache.put(url, response))
      )))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

// fetchはネットワーク優先でキャッシュに保存、失敗時キャッシュ返却
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

// メッセージ受信時にキャッシュを更新
self.addEventListener('message', event => {
  console.log('[SW] message received:', event.data);
  if (event.data === 'update') {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => {
          return Promise.all(
            urlsToCache.map(url =>
              fetch(new Request(url, {cache: 'reload'}))
                .then(response => cache.put(url, response))
            )
          );
        })
    );
  }
});
