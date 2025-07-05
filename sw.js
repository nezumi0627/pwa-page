// sw.js
const CACHE_NAME = 'pwa-cache-v1'
const urlsToCache = [
  '/',
  '/pwa-page/index.html',
  '/pwa-page/manifest.json',
  // 必要に応じて追加
]

let appVersion = null // クライアントから受け取ったアプリバージョン保持用（任意）

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache =>
        Promise.all(
          urlsToCache.map(url =>
            fetch(new Request(url, { cache: 'reload' }))
              .then(response => cache.put(url, response))
          )
        )
      )
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const responseClone = response.clone()
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone))
        return response
      })
      .catch(() => caches.match(event.request))
  )
})

self.addEventListener('message', event => {
  if (typeof event.data === 'object' && event.data.type === 'version') {
    appVersion = event.data.version
    console.log(`受信したアプリバージョン: ${appVersion}`)
  }

  if (event.data === 'update') {
    caches.open(CACHE_NAME)
      .then(cache =>
        Promise.all(
          urlsToCache.map(url =>
            fetch(new Request(url, { cache: 'reload' }))
              .then(response => cache.put(url, response))
          )
        )
      )
      .then(async () => {
        const clients = await self.clients.matchAll()
        clients.forEach(client => client.postMessage('update-complete'))
      })
      .catch(err => console.error('キャッシュ更新エラー:', err))
  }
})
