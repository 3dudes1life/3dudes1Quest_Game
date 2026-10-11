const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve('test-results/court-repair341');
async function fightCourt(p,label,{observeDrain=false}={}){
 const phases=new Set(),counts=new Map();let warned=false,drained=false,recovered=false,scroll=false,blocked=false;
 const end=Date.now()+65000;let jumpEnd=0,powerAt=0;
 while(Date.now()<end){
  const s=await p.evaluate(()=>{const g=__questGame;return {x:g.player.x,on:g.player.onGround,hp:g.state.health,court:{...g.court},won:!g.court.active&&g.state.courtVictoryRecorded,queen:g.boss.active,shots:g.enemyShots.map(q=>({x:q.x,type:q.type})),judges:g.enemies.filter(e=>e.type==='judge').map(e=>({id:e.id,alive:e.alive})),heroShots:g.heroShots.length}});
  if(s.won){assert.ok(!s.queen,'Queen waits for Court victory banner');assert.deepEqual([...phases],[1,2,3]);assert.deepEqual([...counts.values()],[1,3,5]);if(observeDrain)assert.ok(warned&&drained&&recovered&&scroll&&blocked,'real scroll, warning, drain, blocked attack, recovery');assert.match(await p.locator('#message').innerText(),/OVERRULED!/);await p.screenshot({path:path.join(out,label+'-overruled.png')});return;}
  assert.ok(s.court.active,'Court must stay active until defeated');assert.ok(!s.queen);
  if(!phases.has(s.court.phase)){phases.add(s.court.phase);counts.set(s.court.phase,s.judges.filter(e=>e.id.startsWith('court-'+s.court.phase+'-')).length);await p.screenshot({path:path.join(out,label+'-phase-'+s.court.phase+'.png')});}
  warned||=s.court.warning>0;drained||=s.court.drain>0;recovered||=drained&&s.court.drain===0;scroll||=s.shots.some(q=>q.type==='flamingScroll');
  if(s.on&&s.shots.some(q=>Math.abs(q.x-s.x)<160)){await p.keyboard.down('ArrowUp');jumpEnd=Date.now()+190;}if(Date.now()>jumpEnd)await p.keyboard.up('ArrowUp');
  if(s.x<8000){await p.keyboard.down('ArrowRight');await p.waitForTimeout(70);await p.keyboard.up('ArrowRight');}
  if(observeDrain&&s.court.drain>0&&!blocked){assert.equal(s.heroShots,0);await p.keyboard.press('Space');await p.waitForTimeout(45);assert.equal(await p.evaluate(()=>__questGame.heroShots.length),0);blocked=true;}
  if((!observeDrain||recovered)&&Date.now()>powerAt){await p.keyboard.press('Space');powerAt=Date.now()+180;}
  await p.waitForTimeout(65);
 }
 throw Error('Court keyboard fight timed out '+await p.evaluate(()=>JSON.stringify({court:__questGame.court,player:__questGame.player,health:__questGame.state.health})));
}
async function freshRoute(p,base){
 await p.goto(base+'/index.html');await p.locator('#startBtn').click();await p.keyboard.press('2');
 assert.equal(await p.evaluate(()=>__questGame.state.courtDefeated),false);assert.equal(await p.locator('#courtReplayBtn').isVisible(),false);
 let jumpEnd=0,powerAt=0,detour=null;const end=Date.now()+150000;
 while(Date.now()<end){
  for(const sel of ['#cutsceneNext','#dialogueNext'])if(await p.locator(sel).isVisible())await p.locator(sel).click();
  const s=await p.evaluate(()=>{const g=__questGame;return {x:g.player.x,y:g.player.y,feet:g.player.y+g.player.h,on:g.player.onGround,cards:g.cards.filter(c=>!c.taken),beacons:g.beacons.filter(c=>!c.on),captain:g.enemies.find(e=>e.type==='leadProtester'&&e.alive),court:g.court.active,queen:g.boss.active,platforms:g.platforms}});
  assert.equal(s.queen,false,'fresh Queen cannot activate before Court');
  if(s.court){await p.keyboard.up('ArrowRight');await p.keyboard.up('ArrowLeft');await p.keyboard.up('ArrowUp');assert.equal(s.cards.length,0);assert.equal(s.beacons.length,0);return;}
  const target=[...s.cards,...s.beacons].sort((a,b)=>a.x-b.x)[0];let goal=target?target.x-5:s.captain?7620:8008;
  if(detour){goal=detour.x;if(s.feet>=610){detour=null;goal=target.x-5;}}
  if(target&&!detour&&s.on&&s.feet<=target.y+2&&Math.abs(s.x-target.x)<170){const platform=s.platforms.find(a=>s.x+22>=a.x&&s.x+22<=a.x+a.w&&Math.abs(s.feet-a.y)<3);if(platform){detour={x:platform.x+platform.w+70};goal=detour.x;}}
  const direction=Math.abs(s.x-goal)<12?'':s.x<goal?'ArrowRight':'ArrowLeft';for(const key of ['ArrowLeft','ArrowRight'])if(key===direction)await p.keyboard.down(key);else await p.keyboard.up(key);
  if(target&&!detour&&s.on&&Math.abs(s.x-target.x)<105&&s.y>target.y+target.h-20){await p.keyboard.down('ArrowUp');jumpEnd=Date.now()+210;}if(Date.now()>jumpEnd)await p.keyboard.up('ArrowUp');
  if((target||s.captain)&&Date.now()>powerAt){if(!target&&s.captain){await p.keyboard.down('ArrowRight');await p.waitForTimeout(25);await p.keyboard.up('ArrowRight');}await p.keyboard.press('Space');powerAt=Date.now()+180;}await p.waitForTimeout(65);
 }
 throw Error('fresh SoCal route timed out '+await p.evaluate(()=>JSON.stringify(__questGame.save())));
}
module.exports=async function(browser,base){
 fs.mkdirSync(out,{recursive:true});const c=await browser.newContext({viewport:{width:1280,height:800},hasTouch:true,serviceWorkers:'block'}),p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 try{
  await freshRoute(p,base);await fightCourt(p,'fresh',{observeDrain:true});const native=await p.evaluate(()=>__questGame.save());fs.writeFileSync(path.join(out,'native-341-court-complete.json'),JSON.stringify(native));await p.waitForFunction(()=>__questGame.boss.active);assert.equal(await p.evaluate(()=>__questGame.state.courtVictoryRecorded),true);await p.screenshot({path:path.join(out,'fresh-queen-unlocked.png')});
  // Simulated legacy Queen-active checkpoint: derived from the actual fresh gameplay save.
  const legacy=structuredClone(native);legacy.version='3.3.0';delete legacy.state.courtDefeated;delete legacy.state.courtVictoryRecorded;legacy.boss.active=true;legacy.boss.hp=7;legacy.boss.phase=2;legacy.player.x=8008;
  await p.addInitScript(s=>{if(!sessionStorage.getItem('court-fixture-loaded')){localStorage.setItem('3dudes1quest-save-109',JSON.stringify(s));sessionStorage.setItem('court-fixture-loaded','yes')}},legacy);
  await p.reload();await p.locator('#continueBtn').click();assert.deepEqual(await p.evaluate(()=>[__questGame.state.courtDefeated,__questGame.state.courtVictoryRecorded,__questGame.court.active,__questGame.boss.active]),[true,false,false,true]);
  await p.locator('#pauseBtn').click();const before=await p.evaluate(()=>__questGame.save());
  await p.evaluate(()=>{window.originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw new DOMException('Quota exceeded','QuotaExceededError')}});await p.locator('#courtReplayBtn').click();assert.equal(await p.evaluate(()=>__questGame.court.active),false);await p.evaluate(()=>Storage.prototype.setItem=originalSetItem);
  await p.locator('#courtReplayBtn').click();assert.deepEqual(await p.evaluate(()=>{const s=__questGame.save();return [s.player,s.cards,s.beacons,s.boss,s.state.score]}),[before.player,before.cards,before.beacons,before.boss,before.state.score]);
  await p.keyboard.down('ArrowRight');await p.setViewportSize({width:390,height:844});await p.locator('#viewportResume').waitFor();await p.keyboard.up('ArrowRight');assert.equal(await p.evaluate(()=>__questGame.input.right),false);await p.setViewportSize({width:844,height:390});await p.locator('#viewportResume').click();assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('3dudes1quest-save-109')).player.x),before.player.x);
  // Death recovery is confined to the active arena; this check targets the hurt path, not completion.
  assert.equal(await p.evaluate(()=>{const g=__questGame;g.state.health=1;g.player.inv=0;g.hurt(g.player.x+50);return g.player.x}),8008);
  await p.locator('#pauseBtn').click();await p.locator('#courtReturnBtn').click();assert.deepEqual(await p.evaluate(()=>[__questGame.player.x,__questGame.state.score,__questGame.boss.hp]),[before.player.x,before.state.score,7]);
  await p.locator('#pauseBtn').click();await p.locator('#courtReplayBtn').click();await p.keyboard.press('2');await fightCourt(p,'legacy-replay');await p.waitForFunction(()=>!__questGame.courtReplay);const after=await p.evaluate(()=>__questGame.save());
  assert.deepEqual([after.cards,after.beacons,after.enemies,after.boss,after.player,after.state.score],[before.cards,before.beacons,before.enemies,before.boss,before.player,before.state.score]);assert.equal(after.state.courtVictoryRecorded,true);
  await p.locator('#pauseBtn').click();await p.locator('#saveBtn').click();await p.reload();await p.locator('#continueBtn').click();assert.equal(await p.evaluate(()=>__questGame.state.courtVictoryRecorded),true);
  // Current 3.4.1 saves with an unverified completion flag remain replayable, even after rescue.
  const existing341=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','socal-3.4.1-grandfathered.json'),'utf8'));assert.equal(existing341.version,'3.4.1');await p.evaluate(s=>{__questGame.reset();__questGame.applySave(s)},existing341);assert.equal(await p.evaluate(()=>__questGame.state.courtVictoryRecorded),false);
  const completed=structuredClone(existing341);completed.state.bossDefeated=true;completed.state.zoeyUnlocked=true;completed.state.adventureComplete=true;delete completed.state.courtVictoryRecorded;completed.boss={...completed.boss,hp:0,alive:false,active:false};completed.finale={active:false,stage:6,complete:true,portalReady:true};completed.portal={open:true};
  await p.evaluate(s=>{__questGame.reset();__questGame.applySave(s);__questGame.running=true;__questGame.clock.start()},completed);await p.locator('#pauseBtn').click();const completedBefore=await p.evaluate(()=>__questGame.save());await p.locator('#courtReplayBtn').click();await p.keyboard.press('2');await fightCourt(p,'completed-replay');await p.waitForFunction(()=>!__questGame.courtReplay);assert.deepEqual(await p.evaluate(()=>[__questGame.state.bossDefeated,__questGame.state.zoeyUnlocked,__questGame.portal.open,__questGame.state.score]),[true,true,true,completedBefore.state.score]);
  assert.deepEqual(errors,[]);
 }finally{await c.close();}
 console.log('PASS fresh normal-keyboard full SoCal route: collectibles, blockade, Court 1/3/5, real scrolls/drain/recovery, OVERRULED and Queen unlock; legacy/current saved-progress replay, death/cancel/save safety and completed rescue preservation');
};
module.exports.freshRoute=freshRoute;module.exports.fightCourt=fightCourt;
