const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
module.exports=async function(browser,base){
 const expected=JSON.parse(fs.readFileSync('package.json','utf8')).version;
 const context=await browser.newContext({serviceWorkers:'block'}),p=await context.newPage();
 for(const file of ['index.html','tahoe.html','alaska.html']){
  await p.goto(base+'/'+file);await p.waitForFunction(()=>window.QuestCore);
  assert.equal((await p.locator('[data-release-version]').innerText()).toLowerCase(),'v'+expected,file);
  assert.equal(await p.evaluate(()=>QuestCore.VERSION),expected);assert.equal(await p.evaluate(()=>window.__QUEST_RELEASE__?.version||window.__TAHOE_RELEASE__?.version||window.__ADVENTURE_DEBUG__?.version),expected);
 }
 await context.close();
 // Simulate an installed old release, then deliver this worker through UPDATE READY.
 let repaired=false;const root=path.resolve('.');
 const oldHtml=`<!doctype html><body><span id="oldVersion">v3.0.0</span><script>window.__QUEST_SESSION__={isActive:()=>true,pause:()=>localStorage.setItem('repair-paused','yes'),save:()=>{if(localStorage.getItem('repair-allow-save')!=='yes')return false;localStorage.setItem('repair-saved','yes');return true}};</script><script src="js/pwa241.js"></script></body>`;
 const oldWorker=`const CACHE='repair-test-old';self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.put(new Request(self.location.origin+'/index.html'),new Response(${JSON.stringify(oldHtml)},{headers:{'Content-Type':'text/html'}})))));self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));self.addEventListener('fetch',e=>{if(new URL(e.request.url).pathname==='/index.html')e.respondWith(caches.open(CACHE).then(c=>c.match(e.request)));});`;
 const server=http.createServer((req,res)=>{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const name=pathname==='/'?'/index.html':pathname;res.setHeader('Cache-Control','no-store');if(!repaired&&(name==='/index.html'||name==='/service-worker.js')){res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':'text/html');res.end(name.endsWith('.js')?oldWorker:oldHtml);return;}const file=path.join(root,name);fs.readFile(file,(error,data)=>{res.statusCode=error?404:200;res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(error?'Not found':data);});});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url='http://127.0.0.1:'+server.address().port;
 const c=await browser.newContext(),page=await c.newPage();
 try{
  await page.goto(url+'/index.html');await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();
  await page.evaluate(()=>localStorage.setItem('3dudes1quest-save-109','owner-save-sentinel'));
  assert.equal(await page.locator('#oldVersion').innerText(),'v3.0.0');
  repaired=true;await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update()});
  await page.locator('#pwaUpdate').waitFor({timeout:60000});
  assert.equal(await page.locator('#oldVersion').innerText(),'v3.0.0','no interruption before approval');
  await page.locator('#pwaUpdate').click();assert.equal(await page.locator('#oldVersion').innerText(),'v3.0.0','failed save blocks activation');assert.equal(await page.evaluate(()=>localStorage.getItem('repair-saved')),null);await page.evaluate(()=>localStorage.setItem('repair-allow-save','yes'));await page.locator('#pwaUpdate').click();await page.locator('[data-release-version]').waitFor({timeout:60000});
  assert.deepEqual(await page.evaluate(()=>['repair-paused','repair-saved','3dudes1quest-save-109'].map(k=>localStorage.getItem(k))),['yes','yes','owner-save-sentinel']);
  assert.equal(await page.evaluate(()=>caches.has('repair-test-old')),true,'previous release cache retained');
  await c.setOffline(true);
  for(const file of ['index.html','tahoe.html','alaska.html']){await page.goto(url+'/'+file);assert.equal((await page.locator('[data-release-version]').innerText()).toLowerCase(),'v'+expected);assert.equal(await page.evaluate(()=>QuestCore.VERSION),expected)}
 }finally{await c.close();await new Promise(resolve=>server.close(resolve));}
 console.log('PASS release version in all adventures; old cached HTML updates only after pause/save approval, retains saves and caches, and repaired release works offline');
};
