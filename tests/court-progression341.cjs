const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve('test-results/court-repair341');
async function fightCourt(p,label,{observeDrain=false}={}){
 fs.mkdirSync(out,{recursive:true});const phases=new Set(),counts=new Map();let warned=false,drained=false,recovered=false,scroll=false,blocked=false;
 const end=Date.now()+65000;let jumpEnd=0,powerAt=0;
 while(Date.now()<end){
  const s=await p.evaluate(()=>{const g=__questGame;return {x:g.player.x,on:g.player.onGround,hp:g.state.health,court:{...g.court},won:!g.court.active&&g.encounters.finalComplete,queen:g.boss.active,shots:g.enemyShots.map(q=>({x:q.x,type:q.type})),judges:g.enemies.filter(e=>e.type==='judge').map(e=>({id:e.id,alive:e.alive})),heroShots:g.heroShots.length}});
  if(s.won){assert.ok(!s.queen,'Queen waits for Court victory banner');assert.deepEqual([...phases],[1,2,3]);assert.deepEqual([...counts.values()],[1,3,9]);if(observeDrain)assert.ok(warned&&drained&&recovered&&scroll&&blocked,'real scroll, warning, drain, blocked attack, recovery');assert.match(await p.locator('#message').innerText(),/OVERRULED!/);await p.screenshot({path:path.join(out,label+'-overruled.png')});return;}
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
 // This route tests the returning-player campaign; origin-story.cjs owns first-run cinematic coverage.
 await p.addInitScript(()=>localStorage.setItem('3dudes1quest-origin-seen','1'));await p.goto(base+'/index.html');await p.locator('#startBtn').click();await p.waitForFunction(()=>__questGame.running&&!window.QuestStory?.active);for(const key of ['ArrowLeft','ArrowRight','ArrowUp','Space'])await p.keyboard.up(key);await p.keyboard.press('2');
 assert.equal(await p.evaluate(()=>__questGame.state.courtDefeated),false);assert.equal(await p.locator('#courtReplayBtn').isVisible(),false);
 let jumpEnd=0,powerAt=0,detour=null;const end=Date.now()+150000;
 while(Date.now()<end){
  for(const sel of ['#cutsceneNext','#dialogueNext'])if(await p.locator(sel).isVisible())await p.locator(sel).click();
  const s=await p.evaluate(()=>{const g=__questGame;return {x:g.player.x,y:g.player.y,feet:g.player.y+g.player.h,on:g.player.onGround,cards:g.cards.filter(c=>!c.taken),beacons:g.beacons.filter(c=>!c.on),captain:g.enemies.find(e=>e.type==='leadProtester'&&e.alive),court:g.court.active,queen:g.boss.active,queenDone:g.encounters.queenComplete,platforms:g.platforms}});
  if(s.queenDone&&s.x<5000&&!freshRoute.coastCaptured){await p.screenshot({path:path.join(out,'coast-restored-natural.png')});freshRoute.coastCaptured=true;}
  if(s.x>1800&&s.x<2200&&!freshRoute.hillcrestCaptured){fs.mkdirSync(out,{recursive:true});await p.screenshot({path:path.join(out,'hillcrest-sign-natural.png')});freshRoute.hillcrestCaptured=true;}
  if(s.queen){if(!freshRoute.queenCaptured){fs.mkdirSync(out,{recursive:true});await p.screenshot({path:path.join(out,'queen-midpoint.png')});freshRoute.queenCaptured=true;}assert.ok(s.x<5000,'Queen is in PCH');for(const k of ['ArrowLeft','ArrowRight','ArrowUp'])await p.keyboard.up(k);if(s.x>4300){await p.keyboard.down('ArrowLeft');await p.waitForTimeout(65);await p.keyboard.up('ArrowLeft')}else if(s.x<4275){await p.keyboard.down('ArrowRight');await p.waitForTimeout(65);await p.keyboard.up('ArrowRight')}await p.keyboard.down('ArrowRight');await p.waitForTimeout(15);await p.keyboard.up('ArrowRight');await p.keyboard.press('Space');await p.waitForTimeout(140);continue;}
  if(s.court){await p.keyboard.up('ArrowRight');await p.keyboard.up('ArrowLeft');await p.keyboard.up('ArrowUp');assert.equal(s.cards.length,0);assert.equal(s.beacons.length,0);assert.equal(await p.evaluate(()=>__questGame.encounters.queenComplete),true);return;}
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
  await freshRoute(p,base);await fightCourt(p,'fresh',{observeDrain:true});assert.equal(await p.evaluate(()=>__questGame.finale.active),true);await p.waitForFunction(()=>__questGame.state.zoeyUnlocked,{},{timeout:20000});
  // Historical checkpoint is an actual old fixture: new Court victory must never be inferred.
  const legacy=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','socal-3.4.1-grandfathered.json'),'utf8'));
  await p.evaluate(s=>{const g=__questGame;g.clock.stop();g.reset();g.applySave(s);g.running=true},legacy);
  assert.equal(await p.evaluate(()=>__questGame.encounters.finalComplete),false);
  const before=await p.evaluate(()=>__questGame.save());
  await p.evaluate(()=>{window.originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw new DOMException('Quota exceeded','QuotaExceededError')};__questGame.startCourtReplay()});assert.equal(await p.evaluate(()=>Boolean(__questGame.courtReplay)),false);await p.evaluate(()=>Storage.prototype.setItem=originalSetItem);
  await p.evaluate(()=>__questGame.startCourtReplay());await p.keyboard.down('ArrowRight');await p.setViewportSize({width:390,height:844});await p.locator('#viewportResume').waitFor();await p.keyboard.up('ArrowRight');assert.equal(await p.evaluate(()=>__questGame.input.right),false);await p.setViewportSize({width:844,height:390});await p.locator('#viewportResume').click();
  assert.deepEqual(await p.evaluate(()=>JSON.parse(localStorage.getItem('3dudes1quest-save-109')).cards),before.cards);
  await p.evaluate(()=>{__questGame.returnFromCourtReplay(false);__questGame.pauseGameplay()});assert.deepEqual(await p.evaluate(()=>[__questGame.state.score,__questGame.player.x,__questGame.boss.hp]),[before.state.score,before.player.x,before.boss.hp]);
  await p.evaluate(()=>__questGame.startCourtReplay());await p.keyboard.press('2');await fightCourt(p,'legacy-replay');await p.waitForFunction(()=>!__questGame.courtReplay);assert.deepEqual(await p.evaluate(()=>[__questGame.state.score,__questGame.cards.map(c=>c.taken),__questGame.beacons.map(b=>b.on)]),[before.state.score,before.cards,before.beacons]);assert.equal(await p.evaluate(()=>__questGame.encounters.finalComplete),true);
  assert.deepEqual(errors,[]);
 }finally{await c.close();}
 console.log('PASS normal keyboard Queen midpoint → Court 1/3/9 → Zoey rescue; legacy replay protects campaign, quota failure and rotation release');
};
module.exports.freshRoute=freshRoute;module.exports.fightCourt=fightCourt;
