const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
module.exports=async function(browser,base){const out=path.resolve('test-results/gameplay-polish');fs.mkdirSync(out,{recursive:true});const results=[],errors=[];let completedSave;
for(const mobile of[false,true]){const c=await browser.newContext({viewport:mobile?{width:844,height:390}:{width:1280,height:800},hasTouch:mobile,isMobile:mobile,serviceWorkers:'block'});await c.addInitScript(()=>localStorage.setItem('3dudes1quest-origin-seen','1'));const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));try{
 for(const world of['socal','tahoe','alaska']){await p.goto(base+'/'+(world==='socal'?'index':world)+'.html?qa');await p.waitForFunction(()=>!(document.querySelector('#startBtn')||document.querySelector('#beginTahoe')||document.querySelector('#beginAdventure')).disabled);await p.locator(world==='socal'?'#startBtn':world==='tahoe'?'#beginTahoe':'#beginAdventure').click();
 const pixels=await p.evaluate(async()=>{
  const checks=[],make=()=>{const c=document.createElement('canvas');c.width=280;c.height=240;return c};
  for(const id of QuestMasterArt.status().actors)for(const pose of[null,'attack'])for(const bg of[[36,55,79],[233,222,179]]){
   const im=new Image();im.src='assets/master-build/actors/'+id+(pose?'-actions':'')+'.webp';await im.decode();
   const actual=make(),raw=make(),a=actual.getContext('2d'),r=raw.getContext('2d');r.imageSmoothingEnabled=false;r.save();r.translate(100,200);
   if(pose)r.drawImage(im,384,0,384,256,Math.round(-80*144/192),Math.round(-80*244/192),160,80*256/192);
   else r.drawImage(im,0,0,192,192,-40,Math.round(-80*188/192),80,80);
   r.restore();a.fillStyle=`rgb(${bg})`;a.fillRect(0,0,280,240);QuestMasterArt.draw(a,id,100,200,0,80,{moving:false,grounded:false,pose});
   const rd=r.getImageData(0,0,280,240).data,ad=a.getImageData(0,0,280,240).data;let opaque=0,changedInside=0,outline=0,farPixels=0;
   for(let y=0;y<240;y++)for(let x=0;x<280;x++){
    const i=(y*280+x)*4;
    // The approved WebPs have slightly translucent interiors; allow only their alpha-compositing budget.
    if(rd[i+3]>=250){opaque++;const alpha=rd[i+3]/255;if(bg.some((v,k)=>Math.abs(Math.round(rd[i+k]*alpha+v*(1-alpha))-ad[i+k])>Math.ceil(255-rd[i+3])+1))changedInside++}
    if(rd[i+3]===0&&bg.some((v,k)=>ad[i+k]!==v)){
     outline++;let near=false;for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){const j=((y+dy)*280+x+dx)*4;if(x+dx>=0&&x+dx<280&&y+dy>=0&&y+dy<240&&rd[j+3]>0)near=true}if(!near)farPixels++;
    }
   }
   // Airborne draws have no contact mark; explicitly grounded draws gain a short, flat contact shadow.
   const airborne=[...a.getImageData(82,202,36,2).data];QuestMasterArt.draw(a,id,100,200,0,80,{moving:false,grounded:true,pose});
   const shadow=[...a.getImageData(82,202,36,2).data];const contact=shadow.some((v,i)=>i%4!==3&&v!==airborne[i]);
   checks.push({id,pose:pose||'idle',background:bg[0]===36?'dark':'light',opaque,changedInside,outline,farPixels,contact});
  }
  return checks;
 });
 for(const r of pixels){assert.ok(r.opaque>100,JSON.stringify(r));assert.equal(r.changedInside,0,JSON.stringify(r));assert.ok(r.outline>30,r.id+' contrasting edge');assert.equal(r.contact,true,r.id+' grounded contact mark');assert.equal(r.farPixels,0,JSON.stringify(r)+' no broad glow or border')}
 results.push({world,mobile,pixels});
 if(world==='tahoe'){
  const distribution=await p.evaluate(()=>{const t=__TAHOE_TEST__;t.clock.stop();return [[0,1300],[1300,3000],[3000,6000],[6000,8200],[8200,9800]].map(([a,b])=>{const trees=t.sceneryTrees.filter(q=>q.x>=a&&q.x<b),infected=trees.filter(q=>t.visualTreeStyle(q.x,q.rank)===1).length;return {a,b,total:trees.length,infected,ratio:infected/trees.length}})});
  for(const [i,[min,max]]of [[.04,.20],[.15,.4],[.45,.7],[.78,.99],[.90,1]].entries()){assert.ok(distribution[i].ratio>=min&&distribution[i].ratio<=max,JSON.stringify(distribution))}
  const victory=await p.evaluate(()=>{const t=__TAHOE_TEST__,s=__TAHOE_DEBUG__.state;t.reset(true);t.clock.stop();s.encounters.bloom.complete=true;s.beetles.forEach(b=>b.alive=false);t.nests.forEach(n=>n.alive=false);s.nestsDestroyed=4;s.player.x=8460;s.player.y=t.ground(8460)-72;s.inv=100000;__TAHOE_DEBUG__.setDude(1);for(let i=0;i<2600&&!s.bossDefeated;i++){s.player.x=Math.max(8380,Math.min(9200,s.boss.x-180));s.player.face=s.player.facing=1;s.player.y=t.ground(s.player.x)-72;if(i%45===0)__TAHOE_DEBUG__.firePower();t.update(17)}return s.bossDefeated&&s.forestBoost===0&&s.forest.every(t=>!t.alive)});assert.equal(victory,true,'actual projectiles defeat Queen and stop drain');
  await p.evaluate(()=>{document.querySelectorAll('#goldMasterQaPanel,#checkpointCard,#memoryCard').forEach(e=>e.remove());const s=__TAHOE_DEBUG__.state;s.floaters=[];s.particles=[];s.shake=s.flash=0});
  const stages=[];for(const elapsed of[0,1100,2600,10000]){stages.push(await p.evaluate(elapsed=>{const t=__TAHOE_TEST__,s=__TAHOE_DEBUG__.state;s.time=s.forestWaveStart+elapsed;s.player.x=8840;s.player.y=t.ground(8840)-72;s.camera=8420;s.inv=0;t.updateForest(17);t.draw();return {elapsed,styles:t.sceneryTrees.map(q=>t.visualTreeStyle(q.x,q.rank)),panel:QuestMasterArt.status().lastPanel,active:s.forest.some(t=>t.alive),boost:s.forestBoost}},elapsed));await p.screenshot({path:out+'/restoration-'+elapsed+'-'+(mobile?'mobile':'desktop')+'.png'})}
  assert.ok(stages[0].styles.includes(1));assert.ok(stages[1].styles.includes(2));assert.ok(stages[2].styles.includes(0)&&stages[2].styles.includes(1));assert.ok(stages[2].styles.filter(q=>q===0).length>stages[0].styles.filter(q=>q===0).length,'green wave expands beyond the initially healthy trees');assert.ok(stages[3].styles.every(q=>q===0));assert.ok(stages.every(q=>!q.active&&q.boost===0));assert.equal(stages[3].panel,5);
  await p.evaluate(()=>__TAHOE_TEST__.save());await p.reload();await p.waitForFunction(()=>!document.querySelector('#beginTahoe').disabled);await p.locator('#beginTahoe').click();assert.equal(await p.evaluate(()=>{const t=__TAHOE_TEST__,s=__TAHOE_DEBUG__.state;t.clock.stop();return s.bossDefeated&&s.forestRestored&&t.sceneryTrees.every(q=>t.visualTreeStyle(q.x,q.rank)===0)}),true);
  completedSave=await p.evaluate(()=>Object.fromEntries(Object.entries(localStorage)));
  const lake=await p.evaluate(()=>{const t=__TAHOE_TEST__,s=__TAHOE_DEBUG__.state;t.reset(true);t.clock.stop();s.player.x=3000;s.camera=2500;s.bloomActive=true;s.encounters.bloom.contamination=100;t.draw();const contaminated=QuestMasterArt.status().lastPanel;s.bloomActive=false;s.encounters.bloom.complete=true;t.draw();return [contaminated,QuestMasterArt.status().lastPanel]});assert.deepEqual(lake,[1,0],'Toxic Bloom lake storyline independent');results.push({mobile,distribution,stages,lake});
 }
 const cache=await p.evaluate(()=>QuestMasterArt.status());assert.ok(cache.contours<=96&&cache.contourBytes<16*1024*1024);
 }
 }finally{await c.close()}}
const offline=await browser.newContext({viewport:{width:852,height:393},hasTouch:true,isMobile:true});try{
 await offline.addInitScript(saved=>{for(const[k,v]of Object.entries(saved))localStorage.setItem(k,v)},completedSave);
 const p=await offline.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'/tahoe.html?qa');await p.waitForFunction(()=>!document.querySelector('#beginTahoe').disabled);await p.evaluate(()=>navigator.serviceWorker.ready);await p.reload();await p.waitForFunction(()=>!document.querySelector('#beginTahoe').disabled);await p.waitForFunction(()=>navigator.serviceWorker.controller);await offline.setOffline(true);await p.reload();await p.waitForFunction(()=>!document.querySelector('#beginTahoe').disabled);await p.locator('#beginTahoe').click();assert.equal(await p.evaluate(()=>{const t=__TAHOE_TEST__,s=__TAHOE_DEBUG__.state;t.clock.stop();return s.bossDefeated&&s.forestRestored&&t.sceneryTrees.every(q=>t.visualTreeStyle(q.x,q.rank)===0)}),true,'restored forest survives installed-worker offline reload');results.push({offlineRestoration:true});
}finally{await offline.close()}
assert.deepEqual(errors,[]);fs.writeFileSync(out+'/results.json',JSON.stringify({results,errors},null,2));console.log('PASS all19 actor interior pixels, crisp bounded outlines, deterministic forest gradient, real-power Queen restoration wave/reload and separate lake sequence, desktop/mobile');};
