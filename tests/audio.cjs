const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
module.exports=async function audioChecks(browser,base){
 const out=path.join(__dirname,'..','test-results','audio');fs.mkdirSync(out,{recursive:true});
 for(const socal of [true,false]){
  const context=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true,serviceWorkers:'block'});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const name=socal?'socal':'tahoe',url=base+(socal?'/index.html?audioqa':'/tahoe.html?qa');await page.goto(url);
  await page.waitForFunction(()=>window.QuestAudio);await page.waitForTimeout(250);
  assert.equal(await page.evaluate(()=>QuestAudio.status().initialized),false);
  await page.evaluate(()=>document.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})));
  assert.equal(await page.evaluate(()=>QuestAudio.status().initialized),false,'synthetic events must not bypass autoplay');
  await page.locator('.audioSettings summary').first().click();
  await page.waitForFunction(()=>QuestAudio.status().state==='running'&&QuestAudio.status().rms>.0001);
  assert.equal(await page.evaluate(()=>QuestAudio.status().track),'title');
  const title=page.locator('.audioSettings').first();
  await title.locator('[data-audio-setting=musicVolume]').focus();await page.keyboard.press('Home');for(let i=0;i<25;i++)await page.keyboard.press('ArrowRight');
  assert.equal(await page.evaluate(()=>QuestAudio.status().settings.musicVolume),.25);
  await title.locator('[data-audio-setting=sfxVolume]').focus();await page.keyboard.press('End');await page.keyboard.press('ArrowLeft');
  assert.equal(await page.evaluate(()=>QuestAudio.status().settings.sfxVolume),.99);
  await title.locator('[data-audio-setting=mute]').check();await page.waitForTimeout(450);
  assert.ok(await page.evaluate(()=>QuestAudio.status().rms)<.00001);assert.equal(await page.evaluate(()=>QuestAudio.status().voices),0);
  await page.screenshot({path:path.join(out,name+'-settings-title.png')});
  await page.reload();await page.waitForFunction(()=>QuestAudio);
  assert.deepEqual(await page.evaluate(()=>{const s=QuestAudio.status();return [s.initialized,s.settings.mute,s.settings.musicVolume,s.settings.sfxVolume]}),[false,true,.25,.99]);
  await page.locator('.audioSettings summary').first().click();await page.locator('.audioSettings').first().locator('[data-audio-setting=mute]').uncheck();
  await page.evaluate(()=>QuestAudio.configure({sfxVolume:.55}));
  const key=socal?'3dudes1quest-save-109':'3dudes1quest_tahoe_v250';
  await page.evaluate(({key,save})=>localStorage.setItem(key,save),{key,save:fs.readFileSync(path.join(__dirname,'fixtures',name+'-3.2.json'),'utf8')});
  await page.reload();await page.waitForFunction(s=>!document.querySelector(s?'#startBtn':'#beginTahoe').disabled,socal);
  if(socal)await page.waitForFunction(()=>document.querySelector('#bootSequence').classList.contains('isHidden'));
  await page.locator(socal?'#continueBtn':'#beginTahoe').click();
  assert.equal(await page.evaluate(s=>s?__questGame.state.score:__TAHOE_DEBUG__.state.score,socal),socal?3300:4400);
  await page.waitForFunction(track=>QuestAudio.status().track===track&&QuestAudio.status().rms>.0001,name);
  // Actual keyboard gameplay generates the corresponding audio hooks.
  await page.keyboard.down('ArrowUp');await page.keyboard.press('Space');await page.waitForTimeout(200);await page.keyboard.up('ArrowUp');await page.waitForTimeout(700);
  assert.ok(await page.evaluate(()=>QuestAudio.status().events.jump)>0);
  await page.waitForFunction(s=>s?__questGame.player.onGround:__TAHOE_DEBUG__.state.player.on,socal);
  const jumpCount=await page.evaluate(()=>QuestAudio.status().events.jump);await page.locator('[data-action=jump]').focus();await page.keyboard.press('Space',{delay:150});await page.waitForTimeout(80);assert.ok(await page.evaluate(()=>QuestAudio.status().events.jump)>jumpCount);
  await page.keyboard.press('Escape');await page.waitForTimeout(300);
  assert.equal(await page.evaluate(()=>QuestAudio.status().musicVoices),0);
  const pause=page.locator(socal?'#journal':'#pauseMenu');await pause.locator('.audioSettings summary').click();
  await pause.locator('[data-audio-setting=music]').uncheck();await pause.locator('[data-audio-setting=sfx]').uncheck();
  assert.equal(await page.evaluate(()=>QuestAudio.effect('jump')),false);
  await pause.locator('[data-audio-setting=sfx]').check();await pause.locator('[data-audio-setting=music]').check();
  await pause.locator('[data-audio-setting=sfxVolume]').scrollIntoViewIfNeeded();
  const slider=await pause.locator('[data-audio-setting=sfxVolume]').boundingBox();assert.ok(slider.y>=0&&slider.y+slider.height<=390);
  await page.screenshot({path:path.join(out,name+'-settings-pause.png')});
  // Save buttons and Resume accept Space, not just mouse/touch clicks.
  await page.locator(socal?'#saveBtn':'#saveTahoe').focus();await page.keyboard.press('Space');await page.waitForTimeout(80);
  assert.ok(await page.evaluate(()=>QuestAudio.status().events.save)>0);
  await page.locator(socal?'#resumeBtn':'#resumeTahoe').focus();await page.keyboard.press('Space');
  await page.waitForFunction(()=>QuestAudio.status().playing);
  await page.setViewportSize({width:390,height:844});await page.locator('#viewportResume').waitFor();await page.waitForTimeout(300);
  assert.equal(await page.evaluate(()=>QuestAudio.status().musicVoices),0);
  const scheduled=await page.evaluate(()=>QuestAudio.status().scheduled);await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>QuestAudio.status().scheduled),scheduled);
  await page.setViewportSize({width:844,height:390});await page.locator('#viewportResume').click();await page.waitForFunction(()=>QuestAudio.status().playing);
  // Deterministic focus-loss lifecycle injection. Physical app switching is a separate device check.
  await page.evaluate(()=>dispatchEvent(new Event('blur')));await page.waitForFunction(()=>QuestAudio.status().state==='suspended');
  assert.equal(await page.evaluate(()=>QuestAudio.status().schedulers),0);
  await page.evaluate(()=>dispatchEvent(new Event('focus')));await page.waitForTimeout(80);assert.equal(await page.evaluate(()=>QuestAudio.status().state),'suspended','focus alone must not restart music');
  await page.locator(socal?'#resumeBtn':'#resumeTahoe').click();await page.waitForFunction(()=>QuestAudio.status().state==='running'&&QuestAudio.status().playing);
  // Attack warnings leave real simulation time to react, without changing player physics.
  assert.equal(await page.evaluate(s=>{
   if(s){const g=__questGame;g.clock.stop();g.state.cards=6;g.state.beacons=3;g.player.x=8000;g.enemies.forEach(e=>e.alive=false);g.enemyShots=[];g.bossIntroShown=false;g.boss.cool=0;g.updateBoss(1,g.clock.time);if(g.enemyShots.length)return false;for(let i=0;i<27;i++)g.updateBoss(1,g.clock.time);return g.boss.warned&&g.enemyShots.length===0}
   const t=__TAHOE_TEST__,g=__TAHOE_DEBUG__.state;t.clock.stop();g.inv=9999;const b=g.beetles.find(b=>b.type==='charger'&&b.alive);g.player.x=b.x-150;g.player.y=100;g.hitStop=0;g.heroShots=[];g.cookieBombs=[];g.positiveFields=[];g.drops=[];g.beetles=[b];t.nests.forEach(n=>n.alive=false);b.stun=0;b.alert=1;b.chargeWindup=0;const x=b.x;for(let i=0;i<8;i++)t.update(QuestRuntime.STEP);if(b.x!==x)return false;for(let i=0;i<10;i++)t.update(QuestRuntime.STEP);if(b.x===x)return false;g.checkpoint=250;g.player.x=3450;g.hitStop=0;t.update(QuestRuntime.STEP);const card=document.querySelector('#checkpointCard'),r=card.getBoundingClientRect();return card.querySelector('strong').textContent==='Eagle Creek'&&r.x>=0&&r.right<=844&&r.y>=76&&r.bottom<160;
  },socal),true);
  // Controlled boss states validate soundtrack selection; combat progression is in browser.cjs.
  await page.evaluate(s=>{if(s){__questGame.clock.stop();__questGame.boss.active=true;__questGame.boss.alive=true}else{__TAHOE_TEST__.clock.stop();__TAHOE_DEBUG__.state.bossStarted=true}},socal);
  await page.waitForFunction(()=>QuestAudio.status().track==='boss');
  await page.evaluate(s=>{if(s)__questGame.state.bossDefeated=true;else __TAHOE_DEBUG__.state.bossDefeated=true},socal);
  await page.waitForFunction(()=>QuestAudio.status().track==='victory');
  // A stalled frame or many simultaneous events cannot create unlimited nodes or timers.
  await page.evaluate(()=>{for(let n=0;n<200;n++)for(const key of Object.keys(QuestScore.effects))QuestAudio.effect(key);for(let n=0;n<100;n++)QuestAudio.sync()});
  await page.waitForTimeout(50);
  let stats=await page.evaluate(()=>QuestAudio.status());assert.ok(stats.signalPeak<.95);assert.ok(stats.peakVoices<=40);assert.equal(stats.schedulers,1);assert.ok(stats.ahead<.5);
  await page.evaluate(()=>QuestAudio.configure({music:false,sfx:false}));await page.waitForTimeout(350);assert.equal(await page.evaluate(()=>QuestAudio.status().voices),0);
  assert.deepEqual(errors,[]);await context.close();console.log(`PASS ${name} audio: autoplay, real signal, settings, 3.2 saves, keyboard menus, rotation, focus loss, transitions and bounded nodes`);
 }
 // Render the actual synthesis graph with the browser's real OfflineAudioContext.
 // These waveform checks establish signal output, not human listening approval.
 const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage();await page.goto(base+'/index.html?audioqa');await page.waitForFunction(()=>window.__QUEST_AUDIO_TEST__);
 await page.waitForFunction(()=>document.querySelector('#bootSequence').classList.contains('isHidden'));await page.waitForTimeout(600);
 await page.locator('.audioSettings summary').first().click();await page.locator('.audioSettings').first().scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'desktop-settings.png')});
 const retired=await page.evaluate(()=>__QUEST_AUDIO_TEST__.renderRetired());
 assert.ok(retired.every(v=>Number.isFinite(v)&&Math.abs(v)<.00001),'retired future notes must remain silent');
 const names=await page.evaluate(()=>[...Object.keys(QuestScore.songs),...Object.keys(QuestScore.effects)]);
 const report={};
 for(const name of names){
  const song=await page.evaluate(n=>QuestScore.songs[n]||null,name),seconds=song?20:2;
  const pcm=await page.evaluate(({name,seconds})=>__QUEST_AUDIO_TEST__.render(name,seconds),{name,seconds});
  let peak=0,energy=0;for(const value of pcm){assert.ok(Number.isFinite(value));peak=Math.max(peak,Math.abs(value));energy+=value*value}
  const rms=Math.sqrt(energy/pcm.length);assert.ok(rms>.0001,`${name} is silent`);assert.ok(peak<.95,`${name} clips`);
  if(song&&!song.once){const boundary=64*30/song.bpm*44100;let seam=0;for(let i=Math.floor(boundary-2205);i<boundary+2205;i++)seam+=pcm[i]**2;assert.ok(seam>0.001,`${name} has a silent loop boundary`)}
  report[name]={peak,rms,seconds};
  if(song||name==='gameOver'){
   const wav=Buffer.alloc(44+pcm.length*2);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(44100,24);wav.writeUInt32LE(88200,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(pcm.length*2,40);pcm.forEach((value,i)=>wav.writeInt16LE(Math.round(Math.max(-1,Math.min(1,value))*32767),44+i*2));fs.writeFileSync(path.join(out,name+'.wav'),wav);
  }
 }
 fs.writeFileSync(path.join(out,'signal-report.json'),JSON.stringify(report,null,2));await context.close();console.log('PASS real Web Audio renders: five original scores and all effects produce finite, non-silent, unclipped output; loop boundaries contain signal');
};
