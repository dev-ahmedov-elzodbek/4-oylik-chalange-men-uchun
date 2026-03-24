const CACHE = 'goalflow-v2'
const BASE = '/4-oylik-chalange-men-uchun'

self.addEventListener('install', e => { self.skipWaiting() })
self.addEventListener('activate', e => { 
  e.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim() 
})
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)))
})
