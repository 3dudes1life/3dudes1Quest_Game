const assert=require('node:assert/strict'),fs=require('node:fs');
module.exports=async(browser,base)=>{
 const out='test-results/build45';fs.mkdirSync(out,{recursive:true});const results=[],errors=[];
 const c=await browser.newContext({serviceWorkers:'block'});await c.addInitScript(()=>localStorage.setItem('3dudes1quest-origin-seen','1'));
 const ready=p=>p.waitForFunction(()=>!(document.querySelector('#startBtn')||document.querySelector('#beginTahoe')||document.querySelector('#beginAdventure')).disabled&&(!document.getElementById('bootSequence')||getComputedStyle(document.getElementById('bootSequence')).visibility==='hidden'));
 try{
  const a=await c.newPage();a.on('pageerror',e=>errors.push(e.message));
  for(const file of['index','tahoe','alaska']){
   await a.goto(base+'/'+file+'.html');await ready(a);
   assert.equal(await a.evaluate(()=>QuestSurvival.state),null);assert.equal(await a.locator('#resumeSurvival').isVisible(),false);assert.equal(await a.locator('#legacySurvival').isVisible(),false);assert.equal(await a.locator('#startSurvival').isVisible(),true);results.push({file,freshHiddenButtons:true});
  }
  await a.goto(base+'/index.html?qa');await ready(a);await a.locator('#startSurvival').click();await a.locator('#pauseBtn').click();
  const b=await c.newPage();b.on('pageerror',e=>errors.push(e.message));await b.goto(base+'/tahoe.html?qa');await ready(b);
  assert.equal(await b.locator('#resumeSurvival').isVisible(),true);assert.equal(await b.locator('#legacySurvival').isVisible(),true);
  const before=await b.evaluate(()=>QuestSurvival.state.sequence);
  await a.evaluate(()=>{QuestSurvival.select(1);QuestSurvival.damage();QuestSurvival.objective('landing-test')});
  const committed=await a.evaluate(()=>QuestSurvival.state);
  await b.waitForFunction(seq=>QuestSurvival.state.sequence===seq,committed.sequence);assert.ok(committed.sequence>before);assert.deepEqual(await b.evaluate(()=>QuestSurvival.state),committed);assert.equal(await b.evaluate(()=>QuestSurvival.storageBlocked),false);await b.screenshot({path:out+'/landing-refreshed.png'});
  await b.locator('#beginTahoe').click();assert.equal(await b.evaluate(()=>QuestSurvival.state.active),committed.active);assert.deepEqual(await b.evaluate(()=>QuestSurvival.state.characters),committed.characters);assert.equal(await b.evaluate(()=>QuestSurvival.state.charge),committed.charge);
  // The previously playing writer must freeze, rather than silently adopting B's commit.
  await a.waitForFunction(()=>QuestSurvival.storageBlocked);assert.equal(await a.evaluate(()=>QuestSurvival.commit()),false);assert.deepEqual(await b.evaluate(()=>JSON.parse(localStorage.getItem('3dudes1quest-survival-v1'))),await b.evaluate(()=>QuestSurvival.state));
  await b.close();await a.reload();await ready(a);await a.locator('#continueBtn').click();await a.locator('#pauseBtn').click();await a.evaluate(()=>document.getElementById('titleBtn').click()); // Controlled return-to-title handler; portal button is hidden during play.

  const d=await c.newPage();await d.goto(base+'/tahoe.html');await ready(d);await d.locator('#legacySurvival').click();await a.waitForFunction(()=>QuestSurvival.storageBlocked);assert.equal(await a.evaluate(()=>QuestSurvival.commit()),false);assert.equal(await d.evaluate(()=>JSON.parse(localStorage.getItem('3dudes1quest-survival-v1')).enabled),false);
  results.push({untouchedLandingAdoptsWholeCommit:true,healthChargeAndRosterPreserved:true,activeWriterProtected:true,returnedTitleWriterProtected:true});assert.deepEqual(errors,[]);fs.writeFileSync(out+'/landing.json',JSON.stringify({results,errors},null,2));console.log('PASS Build45 hidden menu buttons, untouched landing refresh, retained team and active/returned-title stale-writer protection');
 }finally{await c.close()}
};
