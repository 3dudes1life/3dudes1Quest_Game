/* This verifies only the partial artwork foundation, not six-boss completion. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
module.exports=async function(browser,base){
 const out=path.resolve('test-results/six-boss/art');fs.mkdirSync(out,{recursive:true});
 const manifest=JSON.parse(fs.readFileSync('assets/master-build/manifest.json','utf8'));
 assert.equal(manifest.actors.length,19);assert.equal(manifest.actors.filter(a=>a.usage==='active').length,12);
 assert.deepEqual(manifest.unverifiedStates,['attack','hurt-pose','phase-transformation','defeat']);
 const worker=fs.readFileSync('service-worker.js','utf8');for(const a of manifest.actors)assert.equal(worker.includes('./'+a.file),a.usage==='active');
 const c=await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:'block'}),p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 try{
  await c.addInitScript(()=>localStorage.setItem('3dudes1quest-origin-seen','1'));
  for(const world of ['socal','tahoe','alaska']){
   await p.goto(base+'/'+(world==='socal'?'index':world)+'.html?qa');await p.evaluate(()=>QuestMasterArt.ready);if(world==='socal')await p.waitForFunction(()=>document.querySelector('#bootSequence').classList.contains('isHidden'));
   await p.locator(world==='socal'?'#startBtn':world==='tahoe'?'#beginTahoe':'#beginAdventure').click();await p.waitForTimeout(300);if(world==='socal'){await p.evaluate(()=>document.querySelector('#goldMasterQaPanel')?.remove());}
   const status=await p.evaluate(()=>QuestMasterArt.status());assert.equal(status.loaded,true);assert.ok(status.draws>0,world+' active rendering');assert.ok(status.backgrounds>0);assert.deepEqual(status.failed,[]);
   await p.screenshot({path:out+'/'+world+'-desktop.png'});
   await p.setViewportSize({width:844,height:390});await p.waitForTimeout(300);await p.screenshot({path:out+'/'+world+'-landscape.png'});await p.setViewportSize({width:1280,height:800});
  }
  // Read actual compiled alpha and verify no frame crosses a boundary or foot pivot.
  const checks=await p.evaluate(async actors=>{const results=[];for(const a of actors){const im=new Image();im.src=a.file;await im.decode();const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const x=cv.getContext('2d',{willReadFrequently:true});x.drawImage(im,0,0);const d=x.getImageData(0,0,im.width,im.height).data;const frames=[];for(let f=0;f<4;f++){let n=0,minX=192,maxX=-1,minY=192,maxY=-1;for(let y=0;y<192;y++)for(let xx=0;xx<192;xx++)if(d[(y*768+f*192+xx)*4+3]){n++;minX=Math.min(minX,xx);maxX=Math.max(maxX,xx);minY=Math.min(minY,y);maxY=Math.max(maxY,y)}frames.push({n,minX,maxX,minY,maxY})}results.push({id:a.id,size:[im.width,im.height],frames})}return results},manifest.actors);
  for(const a of checks){assert.deepEqual(a.size,[768,192]);for(const f of a.frames){assert.ok(f.n>300,a.id);assert.ok(f.minX>=6&&f.maxX<=185,a.id+' side gutter');assert.ok(f.minY>=8&&f.maxY===187,a.id+' foot pivot')}}
  fs.writeFileSync(out+'/alpha-checks.json',JSON.stringify(checks,null,2));
  // Contact sheet uses exactly the runtime PNGs, all four validated poses.
  assert.deepEqual(errors,[]);await p.goto(base+'/docs/six-boss/contact-sheet.html');
  await p.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(im=>im.decode())));await p.screenshot({path:out+'/contact-sheet.png',fullPage:true});assert.deepEqual(errors,[]);
  const offline=await browser.newContext();await offline.addInitScript(()=>localStorage.setItem('3dudes1quest-origin-seen','1'));const op=await offline.newPage();try{await op.goto(base+'/index.html');await op.evaluate(()=>navigator.serviceWorker.ready);await op.reload();await op.waitForFunction(()=>navigator.serviceWorker.controller);await op.evaluate(()=>localStorage.setItem('master-art-save-sentinel','preserved'));await offline.setOffline(true);for(const file of ['index','tahoe','alaska']){await op.goto(base+'/'+file+'.html');await op.evaluate(()=>QuestMasterArt.ready);assert.equal(await op.evaluate(()=>QuestMasterArt.status().loaded),true);assert.equal(await op.evaluate(()=>localStorage.getItem('master-art-save-sentinel')),'preserved')}}finally{await offline.close()}
 console.log('PASS partial art: 19 four-frame alpha/pivot checks, 12 active actors, three live renderers, desktop/landscape captures and offline precache membership. Full action states and new bosses remain pending.');
 }finally{await c.close()}
};
