const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
module.exports=async function retroChecks(browser,base){
 const shots=path.join(__dirname,'..','test-results','retro');fs.mkdirSync(shots,{recursive:true});
 for(const socal of [true,false]){
  const name=socal?'socal':'tahoe',key=socal?'3dudes1quest-save-109':'3dudes1quest_tahoe_v250';
  const context=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true,serviceWorkers:'block'});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const url=base+(socal?'/index.html':'/tahoe.html?qa');await page.goto(url);
  await page.evaluate(({key,save})=>localStorage.setItem(key,save),{key,save:fs.readFileSync(path.join(__dirname,'fixtures',name+'-3.1.json'),'utf8')});
  await page.reload();await page.waitForFunction(s=>!document.querySelector(s?'#startBtn':'#beginTahoe').disabled,socal);
  if(socal)await page.waitForFunction(()=>document.querySelector('#bootSequence').classList.contains('isHidden'));
  await page.locator(socal?'#continueBtn':'#beginTahoe').click();
  const restored=await page.evaluate(s=>s?[__questGame.state.cards,__questGame.state.score,__questGame.state.dude]:[__TAHOE_DEBUG__.state.mem[0],__TAHOE_DEBUG__.state.crystals[0].got,__TAHOE_DEBUG__.state.checkpoint,__TAHOE_DEBUG__.state.nestsDestroyed,__TAHOE_DEBUG__.state.score,__TAHOE_DEBUG__.state.dude],socal);
  assert.deepEqual(restored,socal?[1,987,2]:[true,true,3360,1,2234,1]);
  await page.waitForTimeout(1100);
  // The displayed logical canvas must consist of exact 2×2 pixel blocks with original artwork colors.
  const pixels=await page.locator(socal?'#gameCanvas':'#tahoeCanvas').evaluate(c=>{
   const d=c.getContext('2d').getImageData(0,0,1280,720).data,colors=new Set();let aligned=true;
   const color=(x,y)=>{const i=(y*1280+x)*4;return (d[i]<<16)|(d[i+1]<<8)|d[i+2]};
   for(let y=0;y<720;y+=2)for(let x=0;x<1280;x+=2){const v=color(x,y);colors.add(v);if(v!==color(x+1,y+1))aligned=false;}
   return {colors:colors.size,aligned,smoothing:c.getContext('2d').imageSmoothingEnabled};
  });assert.equal(pixels.aligned,true);assert.ok(pixels.colors>40);assert.equal(pixels.smoothing,false);
  assert.deepEqual(await page.evaluate(()=>[QuestJourney.next('socal').id,QuestJourney.next('tahoe').id,QuestJourney.worlds.filter(w=>w.url).length]),['tahoe','alaska',3]);
  assert.equal(await page.locator('.journeyRoute').first().locator('a').count(),3);
  // Damage protection must reject multiple contacts in one damage window.
  assert.deepEqual(await page.evaluate(s=>{
   if(s){const g=__questGame;g.clock.stop();g.state.health=4;g.player.inv=0;g.hurt(g.player.x+50);g.hurt(g.player.x+50);return [g.state.health,g.player.anim]}
   const t=__TAHOE_TEST__,g=__TAHOE_DEBUG__.state;t.clock.stop();g.health=4;g.inv=0;t.hurt(g.player.x+50);t.hurt(g.player.x+50);return [g.health,g.player.anim];
  },socal),[3,'hurt']);
  // Render every established power through the real adventure renderer.
  for(let dude=0;dude<3;dude++){
   await page.evaluate(({s,dude})=>{
    if(s){const g=__questGame;g.start(null,dude);g.clock.stop();g.player.inv=10000;g.power(g.clock.time);for(let i=0;i<6;i++)g.update(1,g.clock.time+i*QuestRuntime.STEP);g.draw(g.clock.time)}
    else{const t=__TAHOE_TEST__,g=__TAHOE_DEBUG__.state;t.reset(true);t.clock.stop();g.inv=10000;__TAHOE_DEBUG__.setDude(dude);__TAHOE_DEBUG__.firePower();for(let i=0;i<6;i++)t.update(QuestRuntime.STEP);t.draw()}
   },{s:socal,dude});
   await page.screenshot({path:path.join(shots,`${name}-${['will','daniel','caleb'][dude]}.png`)});
  }
  if(socal){
   // Reward notifications must remain inside the view and clear of the player region.
   await page.evaluate(()=>__questGame.showPetMoment('Rigsby found a secret!','Home Base Paw Print','*'));
   const notifications=await page.locator('.achievementCard:visible, #petMoment:visible').evaluateAll(items=>items.map(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,height:r.height}}));
   assert.ok(notifications.length>0);for(const r of notifications){assert.ok(r.x>=0&&r.right<=844&&r.y>=76&&r.bottom<200);assert.ok(r.height<40)}
   // Real collectible intersections, then pause/save/reload persistence.
   assert.equal(await page.evaluate(()=>{const g=__questGame;g.start(null,0);g.clock.stop();g.enemies.forEach(e=>e.alive=false);g.player.inv=10000;const c=g.cards[0];g.player.x=c.x;g.player.y=c.y;g.update(1,100);g.pauseGameplay();return c.taken}),true);
   await page.reload();await page.waitForFunction(()=>!document.querySelector('#startBtn').disabled);await page.locator('#continueBtn').click();assert.equal(await page.evaluate(()=>__questGame.state.cards),1);
   // Enter the completed SoCal portal through the actual completion screen and link.
   await page.evaluate(()=>{const g=__questGame;g.clock.stop();g.state.bossDefeated=true;g.state.zoeyUnlocked=true;g.portal.open=true;g.finale.active=false;g.player.x=g.portal.x;g.player.y=g.portal.y;g.state.paused=true;g.checkPortal();if(g.finished)throw Error('Portal advanced while paused');g.state.paused=false;g.checkPortal()});
   await page.locator('#portalBtn').click();await page.locator('#enterTahoeBtn').click();await page.waitForURL('**/tahoe.html');
   assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('3dudes1quest_journey')).socal),true);
  }else{
   assert.deepEqual(await page.evaluate(()=>{const t=__TAHOE_TEST__,s=__TAHOE_DEBUG__.state;t.reset(true);t.clock.stop();s.bossStarted=true;s.player.x=8400;s.inv=10000;s.boss.attackTimer=0;t.update(QuestRuntime.STEP);const warning=s.boss.windup>0&&s.boss.vx===0;for(let i=0;i<10;i++)t.update(QuestRuntime.STEP);const stillWaiting=s.boss.vx===0;for(let i=0;i<15;i++)t.update(QuestRuntime.STEP);return [warning,stillWaiting,Math.abs(s.boss.vx)===5.5]}),[true,true,true]);
   // Cross a checkpoint and memory via the actual update loop, then read the save.
   assert.deepEqual(await page.evaluate(()=>{const t=__TAHOE_TEST__,s=__TAHOE_DEBUG__.state;t.reset(true);t.clock.stop();s.inv=10000;s.player.x=3450;t.update(QuestRuntime.STEP);s.player.x=s.discoveries[0].x;t.update(QuestRuntime.STEP);t.save();const saved=JSON.parse(localStorage.getItem('3dudes1quest_tahoe_v250'));return [saved.checkpoint,saved.mem[0]]}),[3360,true]);
  }
  assert.deepEqual(errors,[]);await context.close();console.log(`PASS ${name}: native 3.1 save, original-color pixel detail, damage immunity, all power visuals, collectibles/checkpoint and progression`);
 }
};
