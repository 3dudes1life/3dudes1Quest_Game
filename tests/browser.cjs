const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const file=path.join(root,pathname==='/'?'index.html':pathname);
 if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
 fs.readFile(file,(error,data)=>{res.writeHead(error?404:200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(error?'Not found':data)});
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${server.address().port}`;
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 try{
  for(const mobile of [false,true]){
   const context=await browser.newContext({viewport:mobile?{width:844,height:390}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile,serviceWorkers:'block'});
   const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/index.html');await page.waitForFunction(()=>!document.getElementById('startBtn').disabled&&document.getElementById('bootSequence').classList.contains('isHidden'));
   await page.waitForFunction(()=>window.__GOLD_MASTER_QA__);
   assert.equal(await page.evaluate(()=>window.__GOLD_MASTER_QA__.ok),true);
   await page.locator('#startBtn').click();await page.waitForFunction(()=>window.__questGame.running);
   await page.keyboard.down('ArrowRight');await page.waitForTimeout(250);await page.keyboard.up('ArrowRight');
   assert.ok(await page.evaluate(()=>window.__questGame.player.x>170));
   // Key aliases are independent: releasing A cannot cancel an arrow key still held.
   await page.keyboard.down('ArrowLeft');await page.keyboard.down('a');await page.keyboard.up('a');assert.equal(await page.evaluate(()=>window.__questGame.input.left),true);await page.keyboard.up('ArrowLeft');
   // A complete tap between simulation frames still produces an attack.
   assert.equal(await page.evaluate(()=>{const g=window.__questGame;g.clock.stop();const n=g.heroShots.length;dispatchEvent(new KeyboardEvent('keydown',{code:'Space'}));dispatchEvent(new KeyboardEvent('keyup',{code:'Space'}));g.update(1,g.clock.time);return g.heroShots.length===n+1}),true);
   // Multi-touch cancellation leaves other held controls intact.
   assert.equal(await page.evaluate(()=>{const right=document.querySelector('[data-action="right"]'),jump=document.querySelector('[data-action="jump"]');right.dispatchEvent(new PointerEvent('pointerdown',{pointerId:1,bubbles:true}));jump.dispatchEvent(new PointerEvent('pointerdown',{pointerId:2,bubbles:true}));jump.dispatchEvent(new PointerEvent('pointercancel',{pointerId:2,bubbles:true}));const held=__questGame.input.right&&!__questGame.input.jump;__questGame.input.releaseAll();return held}),true);
   await page.evaluate(()=>{__questGame.clock.start();__questGame.cards[0].taken=true;__questGame.state.cards=1;__questGame.pauseGameplay()});
   const pausedX=await page.evaluate(()=>__questGame.player.x);await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>__questGame.player.x),pausedX);
   await page.reload();await page.waitForFunction(()=>!document.getElementById('startBtn').disabled);await page.locator('#continueBtn').click();assert.equal(await page.evaluate(()=>__questGame.state.cards),1);
   assert.deepEqual(await page.evaluate(()=>[0,1,2].map(dude=>{
     const g=__questGame;g.start(null,dude);g.clock.stop();g.player.inv=99999;
     const enemy=g.enemies[0],targetX=dude===2?500:300;Object.assign(enemy,{x:targetX,y:566,vx:0,min:targetX,max:targetX});g.enemies=[enemy];
     g.power(g.clock.time);for(let i=0;i<190;i++)g.update(1,g.clock.time+i*QuestRuntime.STEP);
     return !enemy.alive;
   })),[true,true,true]);
   await page.evaluate(()=>{__questGame.state.health=1;__questGame.hurt(__questGame.player.x+50)});assert.equal(await page.evaluate(()=>__questGame.state.health),4);
   assert.equal(await page.evaluate(()=>{const g=__questGame;const s=g.save();s.cards=s.cards.map(()=>true);s.beacons=s.beacons.map(()=>true);s.boss={hp:0,alive:false,phase:3};s.finale={complete:true,portalReady:true};s.portal={open:true};g.applySave(s);return g.portal.open&&g.state.bossDefeated&&g.state.cards===6}),true);
   assert.equal(await page.evaluate(()=>{
     const g=__questGame;g.start(null,0);g.clock.stop();g.cards.forEach(c=>c.taken=true);g.beacons.forEach(b=>b.on=true);
     g.state.cards=6;g.state.beacons=3;g.enemies.forEach(e=>e.alive=false);g.boss.active=true;g.damageBoss(10,'Test victory');
     const saved=g.save();g.start(saved,0);g.clock.stop();
     for(let i=0;i<1200&&g.finale.active;i++)g.update(1,g.clock.time+i*QuestRuntime.STEP);
     return g.state.bossDefeated&&g.state.zoeyUnlocked&&g.portal.open&&!g.finale.active;
   }),true);
   await page.waitForTimeout(600);
   await page.screenshot({path:path.join(require('node:os').tmpdir(),`quest-socal-${mobile?'mobile':'desktop'}.png`)});
   await page.goto(base+'/tahoe.html?qa');await page.waitForFunction(()=>!document.getElementById('beginTahoe').disabled);await page.locator('#beginTahoe').click();
   await page.keyboard.down('ArrowRight');await page.waitForTimeout(250);await page.keyboard.up('ArrowRight');assert.ok(await page.evaluate(()=>__TAHOE_DEBUG__.state.player.x>270));
   await page.keyboard.press('2');assert.equal(await page.evaluate(()=>__TAHOE_DEBUG__.state.dude),1);
   await page.evaluate(()=>{const s=__TAHOE_DEBUG__.state;__TAHOE_TEST__.clock.stop();s.crystals[0].got=true;s.mem[0]=true;s.score=750;s.beetles.push({...s.beetles[0],x:2000,alive:false});__TAHOE_TEST__.save()});
   await page.reload();await page.waitForFunction(()=>!document.getElementById('beginTahoe').disabled);await page.locator('#beginTahoe').click();
   assert.deepEqual(await page.evaluate(()=>{const s=__TAHOE_DEBUG__.state;return [s.crystals[0].got,s.mem[0],s.beetles.length,s.score,s.dude]}),[true,true,19,750,1]);
   await page.evaluate(()=>{const s=__TAHOE_DEBUG__.state;s.health=1;s.inv=0;__TAHOE_TEST__.hurt(s.player.x+50)});assert.equal(await page.evaluate(()=>__TAHOE_DEBUG__.state.health),4);
   assert.deepEqual(await page.evaluate(()=>[0,1,2].map(dude=>{
     const t=__TAHOE_TEST__,s=__TAHOE_DEBUG__.state;t.reset(true);t.clock.stop();__TAHOE_DEBUG__.setDude(dude);s.inv=99999;
     const enemy=s.beetles[0],targetX=dude===2?650:400;Object.assign(enemy,{x:targetX,y:540,v:0,min:targetX,max:targetX});s.beetles=[enemy];
     __TAHOE_DEBUG__.firePower();for(let i=0;i<190;i++)t.update(QuestRuntime.STEP);
     return !enemy.alive;
   })),[true,true,true]);
   await page.evaluate(()=>{__TAHOE_TEST__.reset(true);__TAHOE_TEST__.clock.stop()});
   // Exercise boss gating and victory through actual game methods in a controlled scenario.
   assert.equal(await page.evaluate(()=>{const t=__TAHOE_TEST__,s=__TAHOE_DEBUG__.state;t.clock.stop();s.beetles.forEach(b=>b.alive=false);s.defeated=s.beetles.length;t.nests.forEach(n=>t.damageNest(n,10));s.player.x=8500;s.player.y=100;t.update(QuestRuntime.STEP);if(!s.bossStarted)return false;for(let i=0;i<18;i++){s.boss.inv=0;t.hitBoss(1)}return s.bossDefeated&&s.portal&&s.forestRestored}),true);
   await page.reload();await page.waitForFunction(()=>!document.getElementById('beginTahoe').disabled);await page.locator('#beginTahoe').click();assert.equal(await page.evaluate(()=>__TAHOE_DEBUG__.state.portal),true);
   await page.screenshot({path:path.join(require('node:os').tmpdir(),`quest-tahoe-${mobile?'mobile':'desktop'}.png`)});
   await page.evaluate(()=>{__TAHOE_TEST__.clock.stop();const s=__TAHOE_DEBUG__.state;s.player.x=9700;__TAHOE_TEST__.update(QuestRuntime.STEP)});await page.waitForURL('**/alaska.html');
   assert.deepEqual(errors,[]);await context.close();console.log(`PASS ${mobile?'mobile':'desktop'} movement, input, pause, saves, death, boss and portal scenarios`);
  }
  const context=await browser.newContext();const page=await context.newPage();await page.goto(base+'/index.html');
  await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await context.setOffline(true);await page.goto(base+'/tahoe.html');await page.waitForFunction(()=>!document.getElementById('beginTahoe').disabled);await page.locator('#beginTahoe').click();assert.equal(await page.evaluate(()=>__TAHOE_DEBUG__.state.started),true);console.log('PASS installed release launches Tahoe offline');await context.close();
 }finally{await browser.close();server.close()}
})().catch(error=>{console.error(error);server.close();process.exitCode=1});
