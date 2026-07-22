const VERSION = '2.4.3';
const CACHE = `3dudes1quest-${VERSION}`;
const CORE = [
  './','./index.html','./tahoe.html','./manifest.webmanifest','./favicon.ico',
  './icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png',
  './assets/share-card.jpg','./css/style.css','./css/tahoe.css','./js/pwa241.js',
  './js/tahoe243.js','./css/quality243.css','./assets/will.png','./assets/daniel.png','./assets/caleb.png',
  './assets/portraits/will.png','./assets/portraits/daniel.png','./assets/portraits/caleb.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('3dudes1quest-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data && event.data.type === 'GET_VERSION') event.source?.postMessage({type:'VERSION',version:VERSION});
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(res => { const copy=res.clone(); caches.open(CACHE).then(c=>c.put(event.request,copy)); return res; }).catch(()=>caches.match(event.request).then(r=>r||caches.match('./index.html'))));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => {
    const network = fetch(event.request).then(res => { if(res && res.ok){ const copy=res.clone(); caches.open(CACHE).then(c=>c.put(event.request,copy)); } return res; }).catch(()=>cached);
    return cached || network;
  }));
});
