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
 });assert.deepEqual(results[0],results[1]);assert.deepEqual(results[1],results[2]);assert.equal(results[0][0],120);
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
