// Real Chromium touch dispatch plus geometry checks; this is emulation, not device certification.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
module.exports = async function mobileLayouts(browser, base) {
  const shots = path.join(__dirname, '..', 'test-results', 'landscape');
  fs.mkdirSync(shots, {recursive:true});
  for (const adventure of ['socal', 'tahoe']) {
    const socal = adventure === 'socal';
    const context = await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,serviceWorkers:'block',userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1'});
    const page = await context.newPage(), errors=[];
    page.on('pageerror', e=>errors.push(e.message));
    await page.goto(base+(socal?'/index.html':'/tahoe.html?qa'));
    const start = socal?'#startBtn':'#beginTahoe';
    await page.waitForFunction(selector=>!document.querySelector(selector).disabled,start);
    if(socal)await page.waitForFunction(()=>document.querySelector('#bootSequence').classList.contains('isHidden'));
    // Title panels must scroll to the actual start action at every short size.
    for(const viewport of [{width:844,height:390},{width:852,height:393},{width:932,height:430},{width:740,height:280}]) {
      await page.setViewportSize(viewport);
      await page.locator(start).scrollIntoViewIfNeeded();
      await assertReachable(page,[start]);
    }
    await page.locator(start).click();
    await page.waitForTimeout(150);
    const cdp = await context.newCDPSession(page);
    for(const viewport of [{width:844,height:390},{width:852,height:393},{width:932,height:430},{width:740,height:280}]) {
      await page.setViewportSize(viewport);
      await dismissGate(page);
      await assertLayout(page,socal);
      // Press three physical touch contacts at once, then rotate without lifting.
      const points = await page.locator('[data-action="right"], [data-action="jump"], [data-action="power"]').evaluateAll(buttons=>buttons.map((b,i)=>{const r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,id:i+1}}));
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points});
      await page.waitForTimeout(80);
      assert.deepEqual(await inputState(page,socal),[true,true,true]);
      await page.setViewportSize({width:viewport.height,height:viewport.width});
      await page.locator('#viewportResume').waitFor({state:'visible'});
      assert.deepEqual(await inputState(page,socal),[false,false,false]);
      assert.equal(await page.evaluate(s=>s?__questGame.state.paused:__TAHOE_DEBUG__.state.paused,socal),true);
      const pos = await page.evaluate(s=>(s?__questGame:__TAHOE_DEBUG__.state).player.x,socal);
      await page.keyboard.press('Escape'); // May not bypass rotation recovery.
      await page.waitForTimeout(80);
      assert.equal(await page.evaluate(s=>(s?__questGame:__TAHOE_DEBUG__.state).player.x,socal),pos);
      assert.ok(await page.evaluate(()=>Object.keys(localStorage).some(k=>k.includes('quest')&&k!=='quest-controls')));
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      // Rotate back while gate is up; one Continue restores the original state.
      await page.setViewportSize(viewport);
      await dismissGate(page);
      assert.equal(await page.evaluate(s=>s?__questGame.state.paused:__TAHOE_DEBUG__.state.paused,socal),false);
      assert.deepEqual(await inputState(page,socal),[false,false,false]);
      const next = await page.locator('[data-action="right"]').boundingBox();
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:next.x+next.width/2,y:next.y+next.height/2,id:4}]});
      await page.waitForTimeout(90);
      assert.equal((await inputState(page,socal))[0],true);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      assert.deepEqual(await inputState(page,socal),[false,false,false]);
      if(viewport.width===844)await page.waitForTimeout(2600);
      await page.screenshot({path:path.join(shots,`${adventure}-${viewport.width}x${viewport.height}.png`)});
    }
    await page.evaluate(s=>{
      if(s){__questGame.state.triangle=100;__questGame.boss.active=true;document.querySelector('#triangleUltimateBtn').classList.remove('hidden');document.querySelector('#bossPhase').classList.remove('hidden');document.querySelector('#bossPhase').textContent='QUEEN OF BEIGE · PHASE 3'}
      else document.querySelector('#bossHud').classList.remove('hidden');
    },socal);
    if(socal)await assertReachable(page,['#triangleUltimateBtn']);
    const bossBounds=await page.locator(socal?'#bossPhase':'#bossHud').boundingBox();
    const objectiveBounds=await page.locator(socal?'#objectiveCard':'#objective').boundingBox();
    assert.ok(bossBounds.x>=objectiveBounds.x+objectiveBounds.width,'boss and objective must not overlap');
    await page.screenshot({path:path.join(shots,`${adventure}-boss.png`)});
    await page.locator('#pauseBtn').click();
    const menu=socal?'#journal':'#pauseMenu';
    await page.locator(menu).waitFor({state:'visible'});
    await page.getByLabel('Touch button size',{exact:true}).selectOption('large');
    await page.getByLabel('Movement side',{exact:true}).selectOption('left');
    await page.setViewportSize({width:393,height:852});
    await dismissGate(page);
    assert.equal(await page.evaluate(s=>s?__questGame.state.paused:__TAHOE_DEBUG__.state.paused,socal),true);
    await page.setViewportSize({width:852,height:320});
    await dismissGate(page);
    await page.screenshot({path:path.join(shots,`${adventure}-pause.png`)});
    const resume=socal?'#resumeBtn':'#resumeTahoe';
    await page.locator(resume).scrollIntoViewIfNeeded();await assertReachable(page,[resume]);await page.locator(resume).click();
    await assertLayout(page,socal);
    const groups=await page.locator('#touchControls .touchGroup').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().x));assert.ok(groups[0]>groups[1]);
    // Toolbar-only height change must not unexpectedly pause active play.
    await page.setViewportSize({width:852,height:280});await page.waitForTimeout(100);
    assert.equal(await page.locator('#viewportPause').isVisible(),false);
    await assertLayout(page,socal);
    // Simulated safe area reserves space without changing world aspect ratio.
    await page.addStyleTag({content:'.safeAreaProbe{padding:0px 44px 21px 44px!important}'});
    await page.evaluate(()=>dispatchEvent(new Event('resize')));await page.waitForTimeout(60);
    await assertLayout(page,socal);
    const appBox=await page.locator(socal?'#app':'#tahoeApp').boundingBox();assert.equal(appBox.x,44);assert.equal(appBox.width,764);
    // Verify short dialogue and completion panels, including their actions.
    await page.evaluate(s=>{
      if(s){__questGame.state.paused=true;document.querySelector('#dialogueBox').classList.remove('hidden');document.querySelector('#dialogueText').textContent='A long conversation about saving the forest. '.repeat(20)}
      else{__TAHOE_DEBUG__.state.paused=true;document.querySelector('#dialogue').classList.remove('hidden');document.querySelector('#dialogueText').textContent='A long conversation about saving the forest. '.repeat(20)}
    },socal);
    await page.locator('#dialogueNext').scrollIntoViewIfNeeded();await assertReachable(page,['#dialogueNext']);
    await page.setViewportSize({width:390,height:844});await dismissGate(page);
    assert.equal(await page.locator(socal?'#dialogueBox':'#dialogue').isVisible(),true);
    await page.setViewportSize({width:844,height:280});await dismissGate(page);
    await page.evaluate(s=>{
      document.querySelector(s?'#dialogueBox':'#dialogue').classList.add('hidden');
      if(s){document.querySelector('#gameScreen').classList.remove('active');document.querySelector('#completeScreen').classList.add('active')}
      else document.querySelector('#trailheadCard').classList.remove('hidden');
    },socal);
    const finish=socal?'#portalBtn':'#continueToPortal';await page.locator(finish).scrollIntoViewIfNeeded();await assertReachable(page,[finish]);
    await page.screenshot({path:path.join(shots,`${adventure}-completion.png`)});
    await page.reload();await page.waitForFunction(()=>document.documentElement.dataset.controlSize==='large');
    assert.equal(await page.evaluate(()=>document.documentElement.dataset.controlHand),'left');
    assert.deepEqual(errors,[]);await context.close();
    console.log(`PASS ${adventure}: rotation with 3 touches, paused/menu rotation, 4 landscape sizes, toolbar, safe areas, left-hand/size preferences, dialogue/completion`);
  }
  // Android-sized touch context, native orientation event and interrupted contacts.
  const context=await browser.newContext({viewport:{width:915,height:412},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36',serviceWorkers:'block'});
  const page=await context.newPage();await page.goto(base+'/tahoe.html?qa');await page.waitForFunction(()=>!document.querySelector('#beginTahoe').disabled);await page.locator('#beginTahoe').click();
  await page.evaluate(()=>dispatchEvent(new Event('orientationchange')));await dismissGate(page);await assertLayout(page,false);await context.close();
  console.log('PASS Android-sized touch layout and orientation event');
};
async function inputState(page,socal){return page.evaluate(s=>{const k=s?__questGame.input:__TAHOE_DEBUG__.state.keys;return [k.right,k.jump,k.power]},socal)}
async function dismissGate(page){await page.waitForTimeout(100);if(await page.locator('#viewportResume').isVisible())await page.locator('#viewportResume').click()}
async function assertReachable(page,selectors){
  const failures=await page.evaluate(selectors=>selectors.flatMap(selector=>{
    const b=document.querySelector(selector),r=b.getBoundingClientRect(),v=visualViewport;
    const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
    return r.x<0||r.y<0||r.right>v.width+.5||r.bottom>v.height+.5||!(hit===b||b.contains(hit))?[selector+': clipped or covered '+JSON.stringify({r:r.toJSON(),hit:hit?.id})]:[];
  }),selectors);assert.deepEqual(failures,[]);
}
async function assertLayout(page,socal){
  await page.waitForTimeout(70);
  const canvas=socal?'#gameCanvas':'#tahoeCanvas';
  const geometry=await page.locator(canvas).evaluate(c=>{const r=c.getBoundingClientRect();return {w:r.width,h:r.height,logical:[c.width,c.height]}});
  assert.deepEqual(geometry.logical,[1280,720]);assert.ok(Math.abs(geometry.w/geometry.h-16/9)<.01,JSON.stringify(geometry));
  const controls=['[data-action="left"]','[data-action="right"]','[data-action="jump"]','[data-action="power"]','#switchBtn','#pauseBtn'];
  await assertReachable(page,controls);
  const failures=await page.evaluate(({controls,canvas})=>{
    const world=document.querySelector(canvas).getBoundingClientRect();
    const nodes=controls.map(s=>[s,document.querySelector(s).getBoundingClientRect()]);
    const overlap=(a,b)=>a.left<b.right-.5&&a.right>b.left+.5&&a.top<b.bottom-.5&&a.bottom>b.top+.5;
    const out=[];
    for(let i=0;i<nodes.length;i++){const [name,r]=nodes[i];if(r.width<44||r.height<44)out.push(name+' small');if(overlap(r,world))out.push(name+' covers world');for(let j=i+1;j<nodes.length;j++)if(overlap(r,nodes[j][1]))out.push(name+' overlaps '+nodes[j][0]);}
    for(const selector of ['#hudHealth','#hudDude','#hudScore','#objectiveTitle']){const r=document.querySelector(selector).getBoundingClientRect();if(r.width===0||r.height===0||r.right>visualViewport.width||r.bottom>visualViewport.height)out.push(selector+' missing');if(overlap(r,world))out.push(selector+' covers world '+JSON.stringify({r:r.toJSON(),world:world.toJSON(),v:[innerWidth,innerHeight]}))}
    return out;
  },{controls,canvas});assert.deepEqual(failures,[]);
}
