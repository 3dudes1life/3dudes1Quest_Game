const assert=require('node:assert/strict');
module.exports=async function(browser,base){require('node:fs').mkdirSync('test-results/master-audit',{recursive:true});
 for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:mobile?{width:844,height:390}:{width:1280,height:800},hasTouch:mobile,isMobile:mobile,serviceWorkers:'block'}),p=await context.newPage();
  for(const [file,start,pause,resume,key] of [['index','#startBtn','#pauseBtn','#resumeBtn','3dudes1quest-save-109'],['tahoe','#beginTahoe','#pauseBtn','#resumeTahoe','3dudes1quest_tahoe_v250'],['alaska','#beginAdventure','#pauseBtn','#resumeAdventure','3dudes1quest_alaska_v340']]){
   await p.goto(base+'/'+file+'.html');await p.waitForFunction(s=>!document.querySelector(s).disabled,start);
   if(file!=='index')for(const sel of ['#tahoeHud','#touchControls','#pauseBtn'])assert.equal(await p.locator(sel).isVisible(),false,'opening has no inactive gameplay chrome');
   if(file==='tahoe')assert.equal(await p.locator(start).innerText(),'Start Tahoe');
   await p.screenshot({path:require('node:path').resolve('test-results/master-audit/'+file+'-after-opening-'+(mobile?'mobile':'desktop')+'.png')});
   await p.locator(start).click();await p.waitForFunction(()=>__QUEST_SESSION__.isActive());
   const contract=await p.evaluate(()=>[typeof __QUEST_SESSION__.pause,typeof __QUEST_SESSION__.save]);assert.deepEqual(contract,['function','function'],file+' actual PWA session contract');
   await p.evaluate(()=>__QUEST_SESSION__.pause());await p.locator(resume).waitFor();assert.equal(await p.evaluate(()=>__QUEST_SESSION__.save()),true);
   assert.ok(await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),key));
   assert.equal(await p.evaluate(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw new DOMException('full','QuotaExceededError')};try{return __QUEST_SESSION__.save()}finally{Storage.prototype.setItem=original}}),false,'save failure must block worker activation');
   await p.locator(resume).click();assert.ok(await p.locator('#touchControls .controlLabel').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize)>=10));assert.equal(await p.locator(pause).isVisible(),true);
   if(file==='tahoe'){await p.locator(pause).click();await p.reload();await p.waitForFunction(()=>!document.querySelector('#beginTahoe').disabled);assert.equal(await p.locator('#beginTahoe').innerText(),'Continue Tahoe');}
  }
  await context.close();
 }
 console.log('PASS master audit: actual PWA pause/save contracts in three worlds, quota failure, start/continue clarity and opening/gameplay chrome on desktop and mobile');
};
