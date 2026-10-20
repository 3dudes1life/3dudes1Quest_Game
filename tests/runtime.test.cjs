const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function setup(){
 const callbacks=new Map(),data=new Map();let id=0;
 const context={window:{},console,localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)},requestAnimationFrame:cb=>{callbacks.set(++id,cb);return id},cancelAnimationFrame:id=>callbacks.delete(id)};
 vm.runInNewContext(fs.readFileSync('js/core/quest-runtime.js','utf8'),context);
 return {runtime:context.window.QuestRuntime,data,frame(now){const batch=[...callbacks.values()];callbacks.clear();batch.forEach(cb=>cb(now));},callbacks,context};
}
test('simulation produces identical movement at 30, 60 and 120 Hz',()=>{
 const results=[30,60,120].map(hz=>{
  const {runtime,frame}=setup();const p={x:0,y:428,w:44,h:72,vx:0,vy:0,on:true};let ticks=0;
  const loop=runtime.createLoop({active:()=>true,draw(){},update(){ticks++;runtime.movePlayer(p,{right:true,jump:true},{speed:6.2,jump:14},{ground:()=>500,world:10000,platforms:[],motion:{},jumpPressed:false})}});
  loop.start();frame(0);for(let i=1;i<=hz*2;i++)frame(i*1000/hz);
  return [ticks,p.x,p.y];
 });assert.deepEqual(results[0],results[1]);assert.deepEqual(results[1],results[2]);assert.equal(results[0][0],120);assert.ok(results[0][1]>700);
});
test('loop start is idempotent and pause/resume discards accumulated time',()=>{
 const {runtime,frame,callbacks}=setup();let active=true,ticks=0;
 const loop=runtime.createLoop({active:()=>active,update:()=>ticks++,draw(){}});
 loop.start();loop.start();assert.equal(callbacks.size,1);frame(0);frame(1000/60);assert.equal(ticks,1);
 active=false;frame(5000);active=true;loop.reset();frame(6000);assert.equal(ticks,1);frame(6000+1000/60);assert.equal(ticks,2);loop.stop();assert.equal(callbacks.size,0);
});
test('landing checks swept feet and does not snap upwards from below platforms',()=>{
 const {runtime}=setup();const p={x:20,y:20,w:44,h:72,vx:0,vy:35,on:false};
 const opts={ground:()=>500,platforms:[{x:0,y:120,w:200}],world:1000,motion:{},jumpPressed:false};
 runtime.movePlayer(p,{}, {speed:6,jump:14},opts);assert.equal(p.y,48);assert.equal(p.on,true);
 p.y=80;p.vy=5;p.on=p.onGround=false;runtime.movePlayer(p,{}, {speed:6,jump:14},opts);assert.ok(p.y>80);
});
test('buffered landing jumps and coyote jumps work',()=>{
 const {runtime}=setup();const p={x:20,y:420,w:44,h:72,vx:0,vy:9,on:false};
 const opts={ground:()=>500,platforms:[],world:1000,motion:{},jumpPressed:true};
 runtime.movePlayer(p,{jump:true},{speed:6,jump:14},opts);assert.equal(p.vy,-14);assert.equal(p.on,false);
 opts.motion={coyote:4};p.y=300;p.vy=1;runtime.movePlayer(p,{jump:true},{speed:6,jump:14},opts);assert.ok(p.vy<0);
});
test('corrupt primary save falls back to previous snapshot; restart clears both',()=>{
 const {runtime,data}=setup();runtime.writeSave('game',{score:100});runtime.writeSave('game',{score:200});data.set('game','{broken');assert.equal(runtime.readSave('game').score,100);runtime.clearSave('game');assert.equal(runtime.readSave('game'),null);
});
test('storage failures return false instead of claiming a successful save',()=>{
 const {runtime,context}=setup();context.localStorage.setItem=()=>{throw Error('quota')};assert.equal(runtime.writeSave('game',{score:1}),false);
});

test('all characters retain distinct jump heights and settle on the floor',()=>{
 const {runtime}=setup();const heights=[];
 for(const dude of [{speed:6.2,jump:14},{speed:5.7,jump:13.5},{speed:5.9,jump:13}]){
  const p={x:100,y:428,w:44,h:72,vx:0,vy:0,onGround:true},motion={};let apex=p.y;
  for(let i=0;i<120;i++){runtime.movePlayer(p,{right:true,jump:true},dude,{ground:()=>500,platforms:[],world:10000,motion,jumpPressed:i===0});apex=Math.min(apex,p.y)}
  heights.push(428-apex);assert.equal(p.y,428);assert.equal(p.vx,dude.speed);assert.equal(p.onGround,true);
 }assert.ok(heights[0]>heights[1]&&heights[1]>heights[2]);
});
test('quick reversals and stopping are bounded without overshooting world edges',()=>{
 const {runtime}=setup(),dude={speed:6.2,jump:14},p={x:100,y:428,w:44,h:72,vx:6.2,vy:0,on:true},motion={};
 const move=input=>runtime.movePlayer(p,input,dude,{ground:()=>500,platforms:[],world:400,motion,jumpPressed:false});
 for(let i=0;i<6;i++)move({left:true});assert.ok(p.vx<0,'reverse within six simulation ticks');
 for(let i=0;i<15;i++)move({});assert.equal(p.vx,0);
 for(let i=0;i<120;i++)move({left:true});assert.equal(p.x,0);
 for(let i=0;i<120;i++)move({right:true});assert.equal(p.x,356);
});
test('a short jump is lower than a held jump and one-way platforms ignore rising feet',()=>{
 const {runtime}=setup();const jump=hold=>{const p={x:100,y:428,w:44,h:72,vx:0,vy:0,on:true},motion={};let apex=p.y;for(let i=0;i<60;i++){runtime.movePlayer(p,{jump:i<hold},{speed:6.2,jump:14},{ground:()=>500,platforms:[],world:1000,motion,jumpPressed:i===0});apex=Math.min(apex,p.y)}return apex};assert.ok(jump(2)>jump(60));
 const p={x:100,y:340,w:44,h:72,vx:0,vy:-14,on:false};runtime.movePlayer(p,{jump:true},{speed:6.2,jump:14},{ground:()=>500,platforms:[{x:80,y:390,w:120}],world:1000,motion:{},jumpPressed:false});assert.ok(p.vy<0);assert.equal(p.on,false);
});
test('camera tracks smoothly, settles when stopped, and respects world bounds',()=>{
 const {runtime}=setup();let camera=0;const p={x:2000,vx:6.2};let previous=0;
 for(let i=0;i<120;i++){camera=runtime.followCamera(camera,p,1280,9200);assert.ok(camera>=previous&&camera<=9200-1280);previous=camera}
 p.vx=0;for(let i=0;i<120;i++)camera=runtime.followCamera(camera,p,1280,9200);
 assert.equal(camera,2000-1280*.36);
 p.x=20000;for(let i=0;i<120;i++)camera=runtime.followCamera(camera,p,1280,9200);assert.equal(camera,7920);
});

// Validate the authored score data and every statically named production sound hook.
test('original scores have complete phrases, valid pitches and distinct melodies',()=>{
 const context={window:{}};vm.runInNewContext(fs.readFileSync('js/core/quest-score.js','utf8'),context);
 const {songs,notes}=context.window.QuestScore;const melodies=new Set();
 for(const song of Object.values(songs)){assert.equal(song.melody.length%8,0);assert.equal(song.roots.length*8,song.melody.length);assert.ok(song.bpm>=90&&song.bpm<=180);melodies.add(song.melody.join(','));for(let i=0;i<song.melody.length;i++){assert.ok(song.melody[i]===0||(song.melody[i]>=48&&song.melody[i]<=96));for(const spec of notes(song,i)){assert.ok(spec[1]>0&&spec[2]>0&&spec[3]>0&&spec[5]<=.2)}}}
 assert.equal(melodies.size,11);
});
test('all named gameplay sounds resolve to short original effects',()=>{
 const context={window:{}};vm.runInNewContext(fs.readFileSync('js/core/quest-score.js','utf8'),context);const {effects}=context.window.QuestScore;
 for(const file of ['js/app109.js','js/tahoe253.js','js/core/quest-audio.js','js/core/quest-adventure.js']){const source=fs.readFileSync(file,'utf8');for(const match of source.matchAll(/(?:sound|effect)\(['"]([^'"]+)['"]\)/g))assert.ok(effects[match[1]],file+': '+match[1])}
 for(const specs of Object.values(effects)){assert.ok(specs.length<=4);for(const spec of specs)assert.ok(spec[3]+spec[4]<=1)}
});

test('Alaska route has reachable stepped platforms, separated shelters and three relays before the arena',()=>{
 const context={window:{}};vm.runInNewContext(fs.readFileSync('js/world-alaska.js','utf8'),context);const w=context.window.AlaskaWorld;
 assert.equal(w.relays.length,3);assert.equal(w.shards.length,12);assert.equal(w.checkpoints.length,3);
 for(const relay of w.relays)assert.ok(relay.x>0&&relay.x<6500);
 for(const p of w.platforms){assert.ok(p.y>=350&&p.y<=w.floor&&p.w>=180);const lower=w.platforms.some(q=>q!==p&&q.y>p.y&&q.y-p.y<=90&&Math.abs(q.x-p.x)<=350);assert.ok(w.floor-p.y<=90||lower)}
 assert.ok(w.bossX>6500&&w.bossX<w.length-400);assert.ok(w.checkpoints[2].x<6500);
});
test('3.4.1 visual upgrade preserves 3.4 character stats and every left/right projectile property',()=>{
 const baseline=JSON.parse(fs.readFileSync('tests/fixtures/power-contract-3.4.json','utf8'));
 const context={window:{},console};vm.runInNewContext(fs.readFileSync('js/core/quest-release.js','utf8'),context);vm.runInNewContext(fs.readFileSync('js/core/quest-core.js','utf8'),context);const q=context.window.QuestCore;
 const entities=[];for(let d=0;d<3;d++)for(const facing of [-1,1])entities.push(q.makePowerProjectile(d,{x:700,y:548,facing}).entity);
 assert.deepEqual(JSON.parse(JSON.stringify({stats:q.CAST.map(d=>({speed:d.speed,jump:d.jump,shot:d.shot})),powers:q.POWER_CONTRACT,entities})),baseline);
 assert.equal(q.CAST[0].power,'DJ Soundwave');
 assert.equal(q.resolveDudeAnimation({on:true,vx:1},0).animation,'walk');
 assert.equal(q.resolveDudeAnimation({on:true,vx:6},0).animation,'run');
 assert.equal(q.resolveDudeAnimation({on:false,vy:-2},0).animation,'jump');
 assert.equal(q.resolveDudeAnimation({on:false,vy:2},0).animation,'fall');
 const attack={on:true,anim:'attack',animStarted:1000,animUntil:1430};
 assert.equal(q.resolveDudeAnimation(attack,1000).frame,0);
 assert.equal(q.resolveDudeAnimation(attack,1200).frame,2);
 assert.equal(q.resolveDudeAnimation(attack,1400).frame,5);
});

test('release metadata, visible fallback badges and cache source stay aligned',()=>{
 const context={window:{}};vm.runInNewContext(fs.readFileSync('js/core/quest-release.js','utf8'),context);
 const version=context.window.QuestRelease.version;
 assert.equal(fs.readFileSync('VERSION.txt','utf8').trim(),version);
 assert.equal(JSON.parse(fs.readFileSync('package.json','utf8')).version,version);
 for(const file of ['index.html','tahoe.html','alaska.html']){
  const html=fs.readFileSync(file,'utf8');
  assert.ok(html.includes('data-release-version>v'+version+'</span>'),file+' visible fallback');
  assert.ok(html.indexOf('quest-release.js')<html.indexOf('quest-core.js'));
  assert.equal(/v?3\.0\.0|2\.5\.3/.test(html),false);
 }
 assert.ok(fs.readFileSync('service-worker.js','utf8').includes('self.QuestRelease.cacheRevision'));
});

test('additive encounters preserve legacy access without inventing new boss victories',()=>{
 const c={window:{}};vm.runInNewContext(fs.readFileSync('js/core/quest-encounters.js','utf8'),c);const q=c.window.QuestEncounters;
 const old={state:{bossDefeated:true,adventureComplete:true},bossDefeated:true,completed:true,checkpoint:6900,player:{x:8500}};
 const copy=JSON.stringify(old);for(const world of ['socal','tahoe','alaska']){const r=q.read(world,old);assert.equal(r.legacyAccess,true);assert.equal(r.pastMid,true);if(world==='socal'){assert.equal(r.queenComplete,true);assert.equal(r.finalComplete,false)}else if(world==='tahoe')assert.equal(r.bloom.complete,false);else assert.equal(r.pipeline.complete,false)}assert.equal(JSON.stringify(old),copy);
 for(const world of ['socal','tahoe','alaska']){const r=q.read(world);assert.equal(r.legacyAccess,false);assert.equal(r.pastMid,false);assert.equal(r.version,1)}
 const bloom=q.read('tahoe',{encounters:{version:1,bloom:{cores:[0,0,0],complete:false,contamination:Infinity}}});assert.equal(bloom.bloom.complete,false);assert.equal(bloom.bloom.cores[2],2);assert.equal(bloom.bloom.contamination,0);
 const pipe=q.read('alaska',{encounters:{version:1,pipeline:{valves:[0,0,0],stage:0,floodTicks:Infinity}}});assert.equal(pipe.pipeline.stage,2);assert.equal(pipe.pipeline.complete,false);assert.equal(pipe.pipeline.floodTicks,0);
 const court=q.read('socal',{encounters:{version:1,court:{active:true,phase:900,hp:[NaN,-20,2,1]}}});assert.equal(court.court.phase,3);assert.equal(court.court.hp[0],-1);assert.equal(court.court.hp[1],-1);assert.equal(court.court.hp[2],2);
});

function survivalSetup(){
 const data=new Map(),context={window:{},console,URLSearchParams,location:{hostname:'test.invalid',search:''},localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)},Date};
 vm.runInNewContext(fs.readFileSync('js/core/quest-survival.js','utf8'),context);
 const q=context.window.QuestSurvival,s={health:4,dude:0,score:0};let respawns=0,paused=false,now=0,emitted=[];
 q.attach({world:'socal',state:()=>s,snapshot:()=>({...s}),now:()=>now,playing:()=>!paused,replaying:()=>false,blocked:()=>false,freeze:()=>{paused=true},protect(){},release(){},respawn:()=>respawns++,emit:i=>emitted.push(i),interrupt(){}});
 return{q,s,data,context,get respawns(){return respawns},get emitted(){return emitted},resume:()=>{paused=false},advance:()=>now+=3000};
}
test('survival health is independent, KO irreversible, no checkpoint or switch healing',()=>{
 const t=survivalSetup(),{q,s}=t;assert.equal(q.enabled(),false);q.begin();q.damage();q.select(1);assert.equal(s.health,4);q.damage();q.damage();q.select(0);assert.equal(s.health,3);s.health=4;assert.equal(s.health,3);
 q.damage();q.damage();q.damage();assert.equal(q.state.characters[0].hp,0);assert.equal(q.state.active,1);assert.equal(t.respawns,1);assert.equal(q.select(0),false);q.recover('boss',4);assert.equal(q.state.characters[0].hp,0);assert.equal(s.health,4);
 q.complete('socal');assert.equal(q.state.achievements[0].badge,'DOUBLE TROUBLE');q.select(2);for(let i=0;i<4;i++)q.damage();q.select(1);for(let i=0;i<4;i++)q.damage();assert.equal(q.state.status,'ended');assert.equal(q.state.characters.every(c=>c.hp===0),true);assert.equal(q.state.achievements.length,1);
 q.begin();assert.equal(q.state.history.at(-1).status,'ended');
});
test('charge needs real unique HP loss, three contributions and consumes exactly once',()=>{
 const t=survivalSetup(),{q}=t;q.begin();q.hit('invulnerable',4,4,0);assert.equal(q.state.charge,0);
 for(let i=0;i<20;i++)q.hit('enemy'+i,1,0,0);assert.equal(q.state.charge,100);assert.equal(q.activate(),false);
 q.hit('daniel',1,0,1);q.hit('caleb',1,0,2);assert.equal(q.activate(),true);assert.deepEqual(Array.from(t.emitted),[0,0,1,1,2,2]);assert.equal(q.state.charge,0);assert.equal(q.activate(),false);q.hit('team',1,0,0);assert.equal(q.state.charge,0);t.advance();q.hit('enemy0',1,0,0);assert.equal(q.state.charge,0);
 q.objective('beacon');assert.equal(q.state.charge,15);q.objective('beacon');assert.equal(q.state.charge,15);
});
test('survival atomic envelope isolates legacy, quota retains previous complete generation and backup',()=>{
 const t=survivalSetup(),{q,s,data,context}=t;data.set('3dudes1quest-save-109','legacy bytes');q.begin();q.damage();s.score=123;q.commit();const primary='3dudes1quest-survival-v1',before=data.get(primary),old=JSON.parse(before);assert.equal(old.characters[0].hp,3);assert.equal(old.worlds['3dudes1quest-save-109'].health,3);assert.equal(old.worlds['3dudes1quest-save-109'].score,123);
 const write=context.localStorage.setItem;context.localStorage.setItem=(k,v)=>{if(k===primary)throw Error('quota');write(k,v)};q.damage();assert.equal(q.storageBlocked,true);assert.equal(data.get(primary),before);assert.equal(data.get('3dudes1quest-save-109'),'legacy bytes');assert.equal(JSON.parse(data.get(primary+':backup')).characters[0].hp,3);
 context.localStorage.setItem=write;assert.equal(q.commit(),true);assert.equal(JSON.parse(data.get(primary)).worlds['3dudes1quest-save-109'].health,2);
 data.set(primary,'{bad');vm.runInNewContext(fs.readFileSync('js/core/quest-survival.js','utf8'),context);assert.equal(context.window.QuestSurvival.state.characters[0].hp,2);assert.equal(context.window.QuestSurvival.valid({...old,characters:[{hp:0,available:true},...old.characters.slice(1)]}),false);
});
test('backup recovery retains a committed knockout; public tester query grants no protection',()=>{
 const {q,data,context}=survivalSetup();q.begin();for(let i=0;i<4;i++)q.damage();data.set('3dudes1quest-survival-v1','{interrupted');context.location.search='?tester=1';vm.runInNewContext(fs.readFileSync('js/core/quest-survival.js','utf8'),context);const recovered=context.window.QuestSurvival;assert.equal(recovered.testing,false);assert.equal(recovered.state.characters[0].hp,0);assert.equal(recovered.state.active,1);assert.equal(recovered.select(0),false);
});
