// sw.js
self.addEventListener('install', (event) => {
    console.log('Service Worker installed');
    self.skipWaiting();
  });
  
  self.addEventListener('activate', (event) => {
    console.log('Service Worker activated');
  });
  
  self.addEventListener('fetch', (event) => {
    // 通常はキャッシュ戦略をここに書く
    event.respondWith(fetch(event.request));
  });
  