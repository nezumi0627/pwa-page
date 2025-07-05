let APP_VERSION = 'v0'; // デフォルト（受信前）
let CACHE_NAME = 'pwa-cache-' + APP_VERSION;

const urlsToCache = [
  '/pwa-page/',
  '/pwa-page/index.html',
  '/pwa-page/manifest.json',
  '/pwa-page/version.js'
];

// バージョンや強制更新などのメッセージ受信処理
self.addEventListener('message', async event => {
  const data = event.data;

  if (data?.type === 'version') {
    APP_VERSION = data.version;
    CACHE_NAME = 'pwa-cache-' + APP_VERSION;
    console.log('[SW] 受信バージョン:', APP_VERSION);
  }

  if (data?.type === 'force-update') {
    console.log('[SW] 強制キャッシュ更新開始:', CACHE_NAME);
    try {
      const cache = await caches.open(CACHE_NAME);
      await Promise.all(
        urlsToCache.map(url =>
          fetch(new Request(url, { cache: 'reload' }))
            .then(response => {
              if (response.ok) return cache.put(url, response);
              console.warn(`[SW] キャッシュ失敗: ${url} -> ${response.status}`);
            })
            .catch(err => {
              console.error(`[SW] fetch失敗: ${url}`, err);
            })
        )
      );

      console.log('[SW] キャッシュ更新完了');
      const clients = await self.clients.matchAll();
      clients.forEach(client => client.postMessage('update-complete'));

    } catch (err) {
      console.error('[SW] キャッシュ更新中エラー:', err);
    }
  }
});

// SW インストール処理
self.addEventListener('install', event => {
  console.log('[SW] install: ' + CACHE_NAME);
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(
        urlsToCache.map(url =>
          fetch(new Request(url, { cache: 'reload' }))
            .then(response => {
              if (response.ok) return cache.put(url, response);
            })
            .catch(err => {
              console.error('[SW] installキャッシュ失敗:', err);
            })
        )
      )
    )
  );
});

// SW アクティベート時に古いキャッシュ削除
self.addEventListener('activate', event => {
  console.log('[SW] activate: ' + CACHE_NAME);
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// 通常の fetch 処理
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const resClone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
