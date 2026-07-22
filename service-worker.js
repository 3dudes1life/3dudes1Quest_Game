const VERSION = '2.5.1';
const CACHE = `3dudes1quest-${VERSION}`;
const CORE = [
  './','./index.html','./tahoe.html','./manifest.webmanifest','./favicon.ico',
  './icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png',
  './assets/share-card.jpg','./css/style.css','./css/tahoe.css','./css/pwa241.css','./css/quality243.css','./css/core250.css',
  './js/core/quest-core.js','./js/app109.js','./js/remaster.js','./js/gold-master-self-test.js','./js/pwa241.js','./js/tahoe251.js',
  './assets/portraits/will.png','./assets/portraits/daniel.png','./assets/portraits/caleb.png',
  './assets/sprites_hd/will_idle.png','./assets/sprites_hd/will_walk.png','./assets/sprites_hd/will_jump.png','./assets/sprites_hd/will_attack.png','./assets/sprites_hd/will_hurt.png','./assets/sprites_hd/will_celebrate.png',
  './assets/sprites_hd/daniel_idle.png','./assets/sprites_hd/daniel_walk.png','./assets/sprites_hd/daniel_jump.png','./assets/sprites_hd/daniel_attack.png','./assets/sprites_hd/daniel_hurt.png','./assets/sprites_hd/daniel_celebrate.png',
  './assets/sprites_hd/caleb_idle.png','./assets/sprites_hd/caleb_walk.png','./assets/sprites_hd/caleb_jump.png','./assets/sprites_hd/caleb_attack.png','./assets/sprites_hd/caleb_hurt.png','./assets/sprites_hd/caleb_celebrate.png',
  './assets/sprites_hd/rigsby_idle.png','./assets/sprites_hd/rigsby_walk.png','./assets/sprites_hd/rigsby_bark.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(async cache => {
    await Promise.allSettled(CORE.map(path => cache.add(path)));
  }).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('3dudes1quest-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'GET_VERSION') event.source?.postMessage({type:'VERSION',version:VERSION});
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(response => {
      const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response;
    }).catch(()=>caches.match(event.request).then(match=>match||caches.match('./index.html'))));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => {
    const network=fetch(event.request).then(response=>{if(response?.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}return response;}).catch(()=>cached);
    return cached||network;
  }));
});
