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
