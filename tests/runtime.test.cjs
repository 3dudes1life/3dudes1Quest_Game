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
 assert.equal(melodies.size,7);
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
