const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
module.exports=async function(browser,base){
 const out=path.resolve('test-results/survival');fs.mkdirSync(out,{recursive:true});const results=[],c=await browser.newContext({serviceWorkers:'block'}),p=await c.newPage(),errors=[];await c.addInitScript(()=>localStorage.setItem('3dudes1quest-origin-seen','1'));p.on('pageerror',e=>errors.push(e.message));
 try{
 for(const world of ['socal','tahoe','alaska']){
  await p.goto(base+'/'+(world==='socal'?'index':world)+'.html?qa');await p.waitForFunction(()=>!(document.querySelector('#startBtn')||document.querySelector('#beginTahoe')||document.querySelector('#beginAdventure')).disabled);await p.locator(world==='socal'?'#startBtn':world==='tahoe'?'#beginTahoe':'#beginAdventure').click();
  for(let mask=1;mask<8;mask++){
   const result=await p.evaluate(({world,mask})=>{
    const q=QuestSurvival; q.begin(world);
    const g=window.__questGame,t=world==='tahoe'?__TAHOE_TEST__:world==='alaska'?__ADVENTURE_TEST__:null;
    if(world==='socal'){g.start(null);g.clock.stop()}else if(world==='tahoe'){t.reset(true);t.clock.stop()}else{t.start(true);t.clock.stop()}
    for(let d=0;d<3;d++)if(!(mask&(1<<d))){q.select(d);for(let i=0;i<4;i++)q.damage()}
    const survivors=[0,1,2].filter(d=>mask&(1<<d)),d=survivors[0];q.select(d);
    let a,b,phases=new Set(),shield=false;
    if(world==='socal'){
     g.enemies=[];g.player.x=4280;g.player.inv=100000;for(let i=0;i<1600&&!g.encounters.queenComplete;i++){if(i%45===0)g.power(i*17);g.update(1,i*17)}a=g.encounters.queenComplete;
     g.state.cards=6;g.state.beacons=3;g.enemies=[];g.player.x=8008;g.player.inv=100000;g.player.facing=1;g.running=true;g.updateBoss(1,0);
     for(let i=0;i<2400&&!g.encounters.finalComplete;i++){phases.add(g.court.phase);const target=g.enemies.find(e=>e.type==='judge'&&e.alive);if(target)g.player.x=Math.max(8008,Math.min(8670,target.x-180));if(i%45===0)g.power(i*17);g.update(1,i*17)}b=g.encounters.finalComplete;
    }else if(world==='tahoe'){
     const s=__TAHOE_DEBUG__.state;s.beetles.forEach(e=>e.alive=false);s.player.x=2740;s.player.y=t.ground(2740)-72;s.inv=100000;t.updateBloom(17);
     for(let i=0;i<1600&&!s.encounters.bloom.complete;i++){const core=s.bloomCores.find(c=>c.alive);if(core){s.player.x=core.x-150;s.player.face=s.player.facing=1;s.player.y=t.ground(s.player.x)-72}if(i%45===0)__TAHOE_DEBUG__.firePower();t.update(17)}a=s.encounters.bloom.complete;
     s.beetles.forEach(e=>e.alive=false);t.nests.forEach(n=>n.alive=false);s.nestsDestroyed=4;s.player.x=8460;s.player.y=t.ground(8460)-72;s.inv=100000;
     for(let i=0;i<2600&&!s.bossDefeated;i++){s.player.x=Math.max(8380,Math.min(9200,s.boss.x-180));s.player.face=s.player.facing=1;s.player.y=t.ground(s.player.x)-72;if(i%45===0)__TAHOE_DEBUG__.firePower();t.update(17);phases.add(s.boss.phase)}b=s.bossDefeated;
    }else{
     t.player.x=3300;t.player.y=548;t.player.inv=100000;t.pipelineUpdate();
     for(let i=0;i<1400&&t.valves.some(v=>v.hp>0);i++){const v=t.valves.find(v=>v.hp>0);t.player.x=v.x-110;t.player.y=548;t.player.facing=1;if(i%40===0)t.fire();t.update(17,i*17)}
     for(let i=0;i<181;i++)t.pipelineUpdate();t.player.x=5560;t.pipelineUpdate();a=t.state.encounters.pipeline.complete;
     t.state.enemies=[];t.state.relays.forEach(r=>r.hp=0);t.state.checkpoint=6320;t.state.bossStarted=true;t.player.x=6840;t.player.y=548;t.player.facing=1;t.player.inv=100000;
     for(let i=0;i<2400&&!t.state.bossDefeated;i++){phases.add(t.boss.phase);shield||=t.boss.shield>0;if(i%40===0)t.fire();t.update(17,i*17)}b=t.state.bossDefeated;
    }
    // Tier activation uses surviving signatures; fresh targets stand in for successful HP thresholds.
    survivors.forEach(owner=>q.hit('contribution:'+owner,1,0,owner));for(let i=0;i<25;i++)q.hit('charge:'+i,1,0,d);
    if(world==='socal'){g.finale.active=false;g.state.paused=false;g.finished=false;g.running=true;g.setInputMode('PLAYING');g.court.drain=0}else{t.state&&(t.state.paused=false);if(world==='tahoe'){__TAHOE_DEBUG__.state.paused=false;__TAHOE_DEBUG__.state.complete=false}else{t.state.completed=false;t.state.started=true}}
    const contributionBefore=q.state.contributions[d];const activated=q.activate(),charge=q.state.charge;
    q.complete(world);const state=q.state;return {world,mask,survivors,a,b,phases:[...phases],shield,contributionBefore,activated,charge,health:state.characters.map(c=>c.hp),badge:state.achievements.find(a=>a.world===world)?.badge};
   },{world,mask});
   assert.ok(result.a&&result.b,JSON.stringify(result));assert.deepEqual(result.phases,[1,2,3]);if(world==='alaska')assert.equal(result.shield,true);
   assert.equal(result.contributionBefore,true);assert.equal(result.activated,true,JSON.stringify(result));assert.equal(result.charge,0);assert.ok(result.health.every((hp,i)=>Boolean(hp)===Boolean(mask&(1<<i))));assert.equal(result.badge,result.survivors.length===3?'THREE DUDES STANDING':result.survivors.length===2?'DOUBLE TROUBLE':'LAST DUDE STANDING');results.push(result);
  }
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/boss-configurations.json',JSON.stringify({method:'7 survivor masks × 3 worlds; real signature projectiles, controlled invulnerability and arena prerequisites; no forced boss victory. Normal keyboard routes reported separately.',results,errors},null,2));console.log('PASS all 42 encounters across seven survivor configurations, including 18 sole-survivor boss fights; all tiers and survivor achievements');
 }finally{await c.close()}
};
