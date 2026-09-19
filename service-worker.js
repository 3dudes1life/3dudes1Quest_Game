const VERSION='3.0.0';
const CACHE=`3dudes1quest-${VERSION}`;
const CORE=[
  "./css/stability300.css",
  "./",
  "./index.html",
  "./tahoe.html",
  "./alaska.html",
  "./manifest.webmanifest",
  "./favicon.ico",
  "./css/core250.css",
  "./css/tahoe.css",
  "./css/quality243.css",
  "./css/style.css",
  "./css/pwa241.css",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-16.png",
  "./icons/icon-192.png",
  "./icons/favicon-32.png",
  "./icons/icon-512.png",
  "./assets/npc_pride.png",
  "./assets/will.png",
  "./assets/hoa_queen.png",
  "./assets/share-card.jpg",
  "./assets/daniel.png",
  "./assets/caleb.png",
  "./assets/ui/hud_panel.png",
  "./assets/ui/journal_panel.png",
  "./assets/ui/ui_icons.png",
  "./assets/ui/objective_panel.png",
  "./assets/ui/dialogue_panel.png",
  "./assets/environments/home_base_hd.png",
  "./assets/environments/hillcrest_hd.png",
  "./assets/environments/los_angeles_fg.png",
  "./assets/environments/hoa_arena_fg.png",
  "./assets/environments/home_base_remastered.svg",
  "./assets/environments/pch_fg.png",
  "./assets/environments/pch_hd.png",
  "./assets/environments/home_base_fg.png",
  "./assets/environments/los_angeles_hd.png",
  "./assets/environments/hillcrest_fg.png",
  "./assets/environments/hoa_arena_hd.png",
  "./assets/sprites_hd/hoa_queen_idle.png",
  "./assets/sprites_hd/rigsby_walk.png",
  "./assets/sprites_hd/caleb_celebrate.png",
  "./assets/sprites_hd/caleb_attack.png",
  "./assets/sprites_hd/daniel_attack.png",
  "./assets/sprites_hd/will_idle.png",
  "./assets/sprites_hd/will_attack.png",
  "./assets/sprites_hd/zoey_walk.png",
  "./assets/sprites_hd/will_hurt.png",
  "./assets/sprites_hd/caleb_jump.png",
  "./assets/sprites_hd/caleb_idle.png",
  "./assets/sprites_hd/caleb_hurt.png",
  "./assets/sprites_hd/will_jump.png",
  "./assets/sprites_hd/daniel_walk.png",
  "./assets/sprites_hd/rigsby_rescue.png",
  "./assets/sprites_hd/will_celebrate.png",
  "./assets/sprites_hd/hoa_queen_defeat.png",
  "./assets/sprites_hd/daniel_idle.png",
  "./assets/sprites_hd/hoa_queen_rage.png",
  "./assets/sprites_hd/caleb_walk.png",
  "./assets/sprites_hd/daniel_hurt.png",
  "./assets/sprites_hd/daniel_celebrate.png",
  "./assets/sprites_hd/rigsby_idle.png",
  "./assets/sprites_hd/hoa_queen_attack.png",
  "./assets/sprites_hd/rigsby_bark.png",
  "./assets/sprites_hd/will_walk.png",
  "./assets/sprites_hd/daniel_jump.png",
  "./assets/portraits/hillcrest_local.png",
  "./assets/portraits/neighbor.png",
  "./assets/portraits/hillcrest local.png",
  "./assets/portraits/cafe_regular.png",
  "./assets/portraits/will.png",
  "./assets/portraits/coastal_local.png",
  "./assets/portraits/hoa queen.png",
  "./assets/portraits/la local.png",
  "./assets/portraits/coastal local.png",
  "./assets/portraits/hoa_queen.png",
  "./assets/portraits/la_local.png",
  "./assets/portraits/daniel.png",
  "./assets/portraits/caleb.png",
  "./assets/sprites/rigsby_walk.png",
  "./assets/sprites/hoa_queen_boss.png",
  "./assets/sprites/npc_cafe.png",
  "./assets/sprites/enemy_hoaDrone.png",
  "./assets/sprites/enemy_troll.png",
  "./assets/sprites/npc_neighbor.png",
  "./assets/sprites/enemy_scooter.png",
  "./assets/sprites/npc_la.png",
  "./assets/sprites/npc_hillcrest.png",
  "./assets/sprites/daniel_walk.png",
  "./assets/sprites/caleb_walk.png",
  "./assets/sprites/enemy_beigeBot.png",
  "./assets/sprites/npc_coastal.png",
  "./assets/sprites/will_walk.png",
  "./assets/effects/shield_bloom.png",
  "./assets/effects/prism_bloom.png",
  "./assets/effects/beige_bloom.png",
  "./assets/effects/cookie_bloom.png",
  "./assets/effects/rainbow_bloom.png",
  "./js/core/quest-runtime.js",
  "./js/core/quest-core.js",
  "./js/app109.js",
  "./js/tahoe253.js",
  "./js/remaster.js",
  "./js/gold-master-self-test.js",
  "./js/pwa241.js"
];
self.addEventListener('install',event=>{
  // A partial release must never replace the last complete offline version.
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));
});
self.addEventListener('activate',event=>{
  // Keep previous caches for tabs still using the preceding release.
  event.waitUntil(self.clients.claim());
});
self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
  if(event.data?.type==='GET_VERSION')event.source?.postMessage({type:'VERSION',version:VERSION});
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  event.respondWith(caches.open(CACHE).then(async cache=>{
    const cached=await cache.match(event.request,{ignoreSearch:true});
    if(cached)return cached;
    return fetch(event.request);
  }));
});
