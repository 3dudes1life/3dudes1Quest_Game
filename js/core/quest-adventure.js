/* Reusable adventure controller: world data supplies the route; shared contracts own physics, input, cast, audio and saves. */
(() => {
 'use strict';
 function create(world){
  const $=id=>document.getElementById(id),canvas=$('adventureCanvas'),renderer=QuestRetro.createRenderer(canvas),ctx=renderer.ctx;
  const imgs=QuestCore.loadCastImages(),player={x:160,y:world.floor-72,w:44,h:72,vx:0,vy:0,facing:1,onGround:true,inv:0};
  const s={started:false,paused:false,dude:0,health:4,score:0,checkpoint:160,weather:'CALM',tick:0,camera:0,cooldown:0,cast:0,bossStarted:false,bossDefeated:false,completed:false,deaths:0,blizzard:0,icePatches:[],
   relays:world.relays.map(r=>({...r,hp:2,y:550,w:64,h:70,kind:'relay',inv:0})),shards:world.shards.map(r=>({...r,got:false})),caches:world.caches.map(r=>({...r,got:false})),enemies:[],shots:[],cookies:[],fields:[],hostile:[],particles:[]};
  let input,clock,motion={},dialogueCheckpoint=0,messageTimer,ready=false,gateWarned=false;
  const boss={x:world.bossX,y:world.floor-168,w:130,h:168,hp:12,inv:0,timer:100,windup:0,attack:0,phase:1,shield:0};
  function makeEnemies(){return world.enemies.map((e,i)=>({...e,id:i,origin:e.x,y:e.type==='owl'?470:590,w:e.type==='owl'?46:50,h:e.type==='owl'?40:30,vy:0,ground:e.y||world.floor,alive:true,hp:e.type==='owl'?2:1,dir:i%2?1:-1,timer:100+i*17,windup:0,flash:0}))}
  s.enemies=makeEnemies();
  function message(text){$('adventureMessage').textContent=text;clearTimeout(messageTimer);messageTimer=setTimeout(()=>$('adventureMessage').textContent='',3500)}
  function objective(){
   const left=s.relays.filter(r=>r.hp>0).length;
   $('objectiveTitle').textContent=s.bossDefeated?'Aurora restored · exit ahead':left?`${3-left}/3 relays · head right`:'Face the Frost Queen';
   $('objectiveText').textContent=left?'Hit each relay twice with your character power. Explore upper ledges for shards and supplies.':'Watch the yellow warning. Jump ice waves; break her ice shield using any power.';
  }
  function hud(){
   $('hudDude').textContent=QuestCore.CAST[s.dude].name;QuestCast.setPortrait($('hudPortrait'),QuestCore.CAST[s.dude].key);$('hudHealth').textContent=s.health;$('hudScore').textContent=s.score;
   $('hudRelays').textContent=s.relays.filter(r=>r.hp===0).length;$('hudShards').textContent=s.shards.filter(r=>r.got).length;$('hudWeather').textContent=s.weather;
   $('powerChargeFill').style.width=(100-s.cooldown/32*100)+'%';$('powerChargeLabel').textContent=s.cooldown?'CHARGING':'READY';
   $('bossHud').classList.toggle('hidden',!s.bossStarted||s.bossDefeated);$('bossHealthFill').style.width=(boss.hp/12*100)+'%';$('bossPhase').textContent=`PHASE ${boss.phase}${boss.shield?` · SHIELD ${boss.shield}`:s.blizzard?` · BLIZZARD`:``}`;
   objective();
  }
  function save(){
   const data={version:1,dude:s.dude,health:s.health,score:s.score,checkpoint:s.checkpoint,relays:s.relays.map(r=>r.hp),shards:s.shards.map(r=>r.got),caches:s.caches.map(r=>r.got),enemies:s.enemies.map(e=>!e.alive),bossDefeated:s.bossDefeated,completed:s.completed};
   return QuestRuntime.writeSave(world.saveKey,data);
  }
  function load(){
   const data=QuestRuntime.readSave(world.saveKey,d=>d&&d.version===1&&Number.isFinite(d.checkpoint)&&d.checkpoint>=0&&d.checkpoint<world.length&&Number.isFinite(d.score));
   if(!data)return false;
   s.dude=Number.isInteger(data.dude)&&data.dude>=0&&data.dude<3?data.dude:0;s.health=Math.max(1,Math.min(4,Number(data.health)||4));s.score=Math.max(0,data.score);s.checkpoint=data.checkpoint;
   s.relays.forEach((r,i)=>r.hp=[0,1,2].includes(data.relays?.[i])?data.relays[i]:2);s.shards.forEach((r,i)=>r.got=data.shards?.[i]===true);s.caches.forEach((r,i)=>r.got=data.caches?.[i]===true);s.enemies.forEach((e,i)=>e.alive=data.enemies?.[i]!==true);
   s.bossDefeated=data.bossDefeated===true;s.completed=data.completed===true;if(s.bossDefeated){boss.hp=0;s.enemies.forEach(e=>{e.normal=true;e.alive=true});QuestJourney.complete(world.id)}
   player.x=s.checkpoint;player.y=world.floor-player.h;return true;
  }
  function setDude(n){s.dude=(n+3)%3;player.anim='idle';player.animUntil=0;$('powerIcon').textContent=QuestCore.CAST[s.dude].powerIcon;QuestAudio.effect('switch');hud()}
  function reset(){
   input.releaseAll();Object.assign(s,{health:4,score:0,checkpoint:160,dude:0,tick:0,camera:0,cooldown:0,bossStarted:false,bossDefeated:false,completed:false,deaths:0,blizzard:0,icePatches:[]});
   s.relays.forEach(r=>{r.hp=2;r.inv=0});s.shards.forEach(r=>r.got=false);s.caches.forEach(r=>r.got=false);s.enemies=makeEnemies();s.shots=[];s.cookies=[];s.fields=[];s.hostile=[];Object.assign(boss,{hp:12,inv:0,timer:100,windup:0,attack:0,phase:1,shield:0});
   Object.assign(player,{x:160,y:world.floor-72,vx:0,vy:0,inv:0});motion={};dialogueCheckpoint=0;gateWarned=false;$('dialogue').classList.add('hidden');$('endingCard').classList.add('hidden');
  }
  function start(fresh){if(!ready)return;if(fresh){QuestRuntime.clearSave(world.saveKey);reset()}else{reset();load()}
   s.started=true;s.paused=false;$('openingCard').classList.add('hidden');$('pauseMenu').classList.add('hidden');setDude(s.dude);if(s.completed){s.paused=true;$('endingCard').classList.remove('hidden')}clock.reset();clock.start();input.focusCanvas();hud();message('Restore the relays · ↑/W jump · Space/POWER attack');QuestAudio.sync();
  }
  function pause(value){if(!s.started||s.completed)return;s.paused=value;input.releaseAll();$('pauseMenu').classList.toggle('hidden',!value);if(value)save();else{clock.reset();input.focusCanvas()}QuestAudio.sync()}
  function burst(x,y,color){for(let i=0;i<12;i++)s.particles.push({x,y,vx:Math.cos(i*Math.PI/6)*3,vy:Math.sin(i*Math.PI/6)*3,life:25,color});QuestRuntime.capEffects(s.particles,100)}
  function hurt(x){if(player.inv>0||!s.started||s.paused||s.completed)return false;s.health--;player.inv=90;player.vx=player.x<x?-5:5;player.vy=-5;player.anim='hurt';player.animUntil=clock.time+250;QuestAudio.effect('damage');burst(player.x,player.y,'#ff668a');
   if(s.health<=0){s.deaths++;QuestAudio.effect('gameOver');s.health=4;player.x=s.checkpoint;player.y=world.floor-72;player.vx=player.vy=0;player.inv=120;motion={};input.releaseAll();s.shots=[];s.cookies=[];s.fields=[];s.hostile=[];
    if(s.bossStarted&&!s.bossDefeated){s.bossStarted=false;Object.assign(boss,{hp:12,timer:100,windup:0,inv:0,attack:0,phase:1,shield:0});s.blizzard=0;s.icePatches=[];s.enemies=s.enemies.filter(e=>!e.summoned)}message('Back at the shelter. Relays and treasures are safe.');save();
   }hud();return true;
  }
  function fire(){if(s.cooldown||s.paused||s.completed)return;const power=QuestCore.makePowerProjectile(s.dude,player);if(power.kind==='cookieBomb')s.cookies.push(power.entity);else s.shots.push(power.entity);s.cooldown=32;s.cast=s.dude===1?18:0;player.anim='attack';player.animStarted=clock.time;player.animUntil=clock.time+240;QuestAudio.effect(power.sound);}
  const overlaps=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
  function targets(){return [...s.enemies.filter(e=>e.alive&&!e.normal),...s.relays.filter(r=>r.hp>0),...(s.bossStarted&&!s.bossDefeated?[boss]:[])]}
  function hit(target,damage=1){
   if(target===boss){if(boss.inv)return false;if(boss.shield>0){boss.shield=Math.max(0,boss.shield-damage);boss.inv=10;QuestAudio.effect('ice');burst(boss.x+60,boss.y+80,'#cffaff');hud();return true;}boss.hp=Math.max(0,boss.hp-damage);boss.inv=24;QuestAudio.effect('bossHit');burst(boss.x+60,boss.y+80,'#80ffe0');if(!boss.hp){s.bossDefeated=true;s.hostile=[];s.blizzard=0;s.icePatches=[];s.enemies.forEach(e=>{e.normal=true;e.alive=true;e.windup=0;e.vy=0});s.score+=3000;QuestAudio.effect('bossDefeat');QuestJourney.complete(world.id);save();message('The aurora returns! Head right to the trail marker.')}}
   else if(target.kind==='relay'){const r=target;if(r.inv)return false;r.hp=Math.max(0,r.hp-damage);r.inv=18;QuestAudio.effect(r.hp?'ice':'beacon');if(!r.hp){s.score+=500;save();message(r.name+' restored!')}}
   else{target.hp-=damage;target.flash=12;QuestAudio.effect('hit');if(target.hp<=0){target.alive=false;s.score+=150;QuestAudio.effect('defeat');burst(target.x,target.y,'#b7efff')}}hud();return true;
  }
  function splash(x,y,radius,damage){for(const t of targets())if(Math.hypot(t.x+t.w/2-x,t.y+t.h/2-y)<radius)hit(t,damage)}
  function powers(){
   for(const q of s.shots){q.life--;q.age=(q.age||0)+1;q.x+=q.vx;q.y+=q.vy;let collision=null;
    for(const t of targets())if(!(q.hitTargets||[]).includes(t)&&overlaps(q,t)){collision=t;break}
    if(q.type==='heart'&&(collision||q.age>=QuestCore.POWER_CONTRACT.heart.detonateAge)){s.fields.push({x:q.x,y:q.y,radius:98,life:62,age:0,detonated:false,hits:[]});q.life=0;QuestAudio.effect('heartPop')}
    else if(collision){hit(collision);q.hitTargets.push(collision);if(q.bounces>0){q.bounces--;const next=targets().find(t=>!q.hitTargets.includes(t)&&Math.abs(t.x-q.x)<430);if(next){const dx=next.x-q.x,dy=next.y+20-q.y,dist=Math.hypot(dx,dy)||1;q.vx=dx/dist*12.8;q.vy=dy/dist*12.8}QuestAudio.effect('ricochet')}else q.life=0}
    if(q.x<0||q.x>world.length||q.y>720)q.life=0;
   }s.shots=s.shots.filter(q=>q.life>0);
   for(const f of s.fields){f.life--;f.age++;for(const t of targets())if(!f.hits.includes(t)&&Math.hypot(t.x+t.w/2-f.x,t.y+t.h/2-f.y)<f.radius){hit(t);f.hits.push(t)}if(f.age===30){f.detonated=true;splash(f.x,f.y,98,1);QuestAudio.effect('heartPop')}}s.fields=s.fields.filter(f=>f.life>0);
   for(const q of s.cookies){q.life--;if(!q.stuck){q.vy+=q.gravity;q.x+=q.vx;q.y+=q.vy;const on=world.platforms.find(p=>q.vy>=0&&q.x+q.w>p.x&&q.x<p.x+p.w&&q.y+q.h>=p.y&&q.y+q.h-q.vy<=p.y);if(q.y+q.h>=world.floor||on||targets().some(t=>overlaps(q,t))){q.stuck=true;q.vx=q.vy=0;q.y=Math.min(q.y,(on?.y||world.floor)-q.h);QuestAudio.effect('ice')}}else if(--q.fuse<=0){splash(q.x,q.y,220,2);burst(q.x,q.y,'#ffe29a');QuestAudio.effect('cookie');q.life=0}}s.cookies=s.cookies.filter(q=>q.life>0);
  }
  function enemies(){for(const e of s.enemies){if(!e.alive||Math.abs(e.x-player.x)>1000)continue;if(e.flash)e.flash--;
   if(e.type==='salmon'){
    e.x+=e.dir*(e.large?1.6:1.1);if(Math.abs(e.x-e.origin)>85){e.x=Math.max(e.origin-85,Math.min(e.origin+85,e.x));e.dir*=-1}
    if(!e.normal&&Math.abs(e.x-player.x)<450){if(e.windup){if(--e.windup===0){e.vy=-7.5;QuestAudio.effect('salmon')}}else if(--e.timer<=0){e.windup=30;e.timer=180;QuestAudio.effect('warning')}}
    e.vy+=.27;e.y=Math.min(e.ground-e.h,e.y+e.vy);if(e.y>=e.ground-e.h)e.vy=0;
   }
   else{e.y=470+Math.sin(s.tick*.04+e.id)*16;if(Math.abs(e.x-player.x)<550){if(e.windup>0){if(--e.windup===0)s.hostile.push({x:e.x,y:e.y+30,w:20,h:20,vx:player.x<e.x?-3:3,vy:1.5,life:170})}else if(--e.timer<=0){e.windup=30;e.timer=180;QuestAudio.effect('warning')}}}
   if(!e.normal&&overlaps(player,e))hurt(e.x);
  }}
  function summonSalmon(large=false){s.enemies=s.enemies.filter(e=>!e.summoned||e.alive);if(s.enemies.filter(e=>e.alive&&!e.normal&&Math.abs(e.x-player.x)<1000).length>=12)return;const x=Math.max(6550,Math.min(7190,player.x+260));s.enemies.push({id:100+s.tick,x,origin:x,y:world.floor-(large?44:30),w:large?70:50,h:large?44:30,type:'salmon',hp:large?2:1,alive:true,dir:-1,timer:140,windup:30,flash:0,vy:0,ground:world.floor,summoned:true,large})}
  function bossUpdate(){if(!s.bossStarted||s.bossDefeated)return;if(boss.inv)boss.inv--;
   const phase=boss.hp>8?1:boss.hp>4?2:3;
   if(phase!==boss.phase){boss.phase=phase;if(phase===3)boss.shield=3;boss.timer=Math.max(boss.timer,70);message(phase===2?'THE LAST FRONTIER · blizzard incoming!':'RAINBOW THAW · break the ice shield with any power!');QuestAudio.effect('warning')}
   if(boss.windup){if(--boss.windup===0){
    if(phase===1||phase===3){for(let n=0;n<2;n++)s.hostile.push({x:boss.x-20,y:480+n*55,w:24,h:24,vx:-4-n*.25,vy:.35+n*.4,life:230});summonSalmon(phase===3)}
    if(phase>=2){s.blizzard=120;const x=Math.max(6550,Math.min(7200,player.x)),markers=boss.markers||[x-110,x+120];s.hostile.push({x:markers[0],y:80,w:18,h:48,vx:0,vy:5.5,life:110,icicle:true},{x:markers[1],y:80,w:18,h:48,vx:0,vy:5.5,life:110,icicle:true});s.icePatches.push({x:markers[1]-20,y:world.floor-10,w:70,h:10,life:150});QuestRuntime.capEffects(s.icePatches,3)}
    boss.attack++;boss.timer=phase===3?105:130;QuestAudio.effect('snow');
   }}else if(--boss.timer<=0){boss.windup=48;boss.markers=[Math.max(6550,player.x-110),Math.min(7210,player.x+120)];QuestAudio.effect('warning')}
   if(overlaps(player,boss))hurt(boss.x);
  }
  function update(dt,time){
   if(!s.started||s.paused||s.completed)return;s.tick++;if(player.inv>0)player.inv--;if(s.cooldown)s.cooldown--;if(s.cast)s.cast--;s.relays.forEach(r=>{if(r.inv)r.inv--});
   const move=QuestRuntime.movePlayer(player,input,QuestCore.CAST[s.dude],{ground:()=>world.floor,platforms:world.platforms,world:world.length,jumpPressed:input.consume('jump'),motion});
   if(move.jumped)QuestAudio.effect('jump');if(move.landed&&move.impact>3)QuestAudio.effect(world.ice.some(r=>player.x>r.x&&player.x<r.x+r.w)?'ice':'land');
   if(input.consume('power')||input.power)fire();
   const weather=s.tick%600;s.weather=s.bossDefeated||player.x<2400||player.x>6300?'CALM':weather>=420?'GUST':weather>=360?'GUST SOON':'SNOW';
   if(s.blizzard>0){s.blizzard--;s.weather='BLIZZARD';player.x=Math.max(6500,player.x+.35)}
   for(const ice of s.icePatches){ice.life--;if(overlaps(player,ice))hurt(ice.x)}s.icePatches=s.icePatches.filter(ice=>ice.life>0);
   if(s.weather==='GUST')player.x=Math.max(0,Math.min(world.length-player.w,player.x+.55));if(s.weather==='GUST SOON'&&weather===360)QuestAudio.effect('warning');
   if(world.ice.some(r=>player.x+player.w>r.x&&player.x<r.x+r.w)&&player.y+player.h>=world.floor-1)hurt(player.x+20);
   powers();enemies();
   for(const r of s.shards)if(!r.got&&Math.abs(player.x+22-r.x)<38&&Math.abs(player.y+30-r.y)<65){r.got=true;s.score+=100;QuestAudio.effect('shard');burst(r.x,r.y,'#a4ffdc');save()}
   for(const r of s.caches)if(!r.got&&Math.abs(player.x+22-r.x)<42&&Math.abs(player.y+30-r.y)<70){r.got=true;s.health=4;s.score+=250;QuestAudio.effect('secret');message('Zoey found trail supplies! Health restored.');save()}
   for(const cp of world.checkpoints)if(player.x>=cp.x&&s.checkpoint<cp.x){s.checkpoint=cp.x;s.health=4;const ok=save();QuestAudio.effect('checkpoint');message(cp.name+(ok?' · saved':' · storage unavailable'));if(cp.x>dialogueCheckpoint){dialogueCheckpoint=cp.x;$('dialogueText').textContent=cp.line;$('dialogue').classList.remove('hidden');s.paused=true;input.releaseAll();QuestAudio.sync()}}
   if(!s.relays.every(r=>r.hp===0)&&player.x>6460){player.x=6460;if(!gateWarned){message('Restore all three Aurora Relays before entering the arena.');gateWarned=true}}
   else if(!s.bossStarted&&!s.bossDefeated&&player.x>6500){s.bossStarted=true;boss.timer=100;QuestAudio.effect('bossAppear');message('Frost Queen: NO SARCASM IN THE LAST FRONTIER!');QuestAudio.sync()}
   if(s.bossStarted&&!s.bossDefeated)player.x=Math.min(player.x,7240);
   bossUpdate();
   for(const q of s.hostile){q.x+=q.vx;q.y+=q.vy;q.life--;if(overlaps(player,q)){hurt(q.x);q.life=0}if(s.shots.some(p=>overlaps(p,q))){q.life=0;QuestAudio.effect('ice')}}s.hostile=s.hostile.filter(q=>q.life>0&&q.x>player.x-1500&&q.y<720);
   for(const p of s.particles){p.x+=p.vx;p.y+=p.vy;p.life--}s.particles=s.particles.filter(p=>p.life>0);
   s.camera=QuestRuntime.followCamera(s.camera,player,1280,world.length);
   if(s.bossDefeated&&player.x>7350){s.completed=true;s.paused=true;input.releaseAll();save();QuestJourney.complete(world.id);$('endingCard').classList.remove('hidden');QuestAudio.effect('portal');QuestAudio.sync()}
   if(s.tick%6===0)hud();
  }
  function label(text,x,y,size=18,color='#fff'){ctx.font=`bold ${size}px monospace`;ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='#132a45';ctx.strokeText(text,x,y);ctx.fillStyle=color;ctx.fillText(text,x,y)}
  // Static painted backdrop is cached once; frames only shift parallax layers.
  const backdrop=document.createElement('canvas');backdrop.width=2560;backdrop.height=720;const bg=backdrop.getContext('2d');
  bg.fillStyle='#162d59';bg.fillRect(0,0,2560,720);for(let i=0;i<140;i++){bg.fillStyle=i%3?'#c2def0':'#8cc9e6';bg.fillRect((i*173)%2560,(i*67)%330,2,2)}
  for(let i=0;i<12;i++){const x=i*250;bg.fillStyle=i%2?'#5e7d9d':'#7896b3';bg.beginPath();bg.moveTo(x-100,560);bg.lineTo(x+100,180+(i%3)*50);bg.lineTo(x+320,560);bg.fill();bg.fillStyle='#dbeaf5';bg.beginPath();bg.moveTo(x+100,180+(i%3)*50);bg.lineTo(x+35,300+(i%3)*40);bg.lineTo(x+90,285+(i%3)*45);bg.lineTo(x+125,310+(i%3)*45);bg.lineTo(x+167,300+(i%3)*40);bg.fill()}
  function tree(x,y){ctx.fillStyle='#21384e';ctx.fillRect(x-5,y-95,12,95);for(let i=0;i<3;i++){const top=y-170+i*38;ctx.fillStyle=['#244d59','#2c6670','#438184'][i];ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x-40-i*6,top+68);ctx.lineTo(x+40+i*6,top+68);ctx.fill();ctx.fillStyle='#c6e6e8';ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x-15,top+24);ctx.lineTo(x+18,top+24);ctx.fill()}}
  function draw(time){
   ctx.clearRect(0,0,1280,720);ctx.drawImage(backdrop,-Math.round(s.camera*.14)%1280,0);ctx.drawImage(backdrop,1280-Math.round(s.camera*.14)%1280,0);
   if(s.bossDefeated||player.x>5800){for(let i=0;i<6;i++){ctx.globalAlpha=s.bossDefeated?.65:.28;ctx.fillStyle=(s.bossDefeated?['#ff5fa2','#ffae50','#ffe66d','#54e7b2','#76d3de','#977bde']:['#54e7b2','#76d3de','#977bde'])[s.bossDefeated?i:i%3];for(let x=0;x<1280;x+=12)ctx.fillRect(x,80+i*16+Math.round(Math.sin(x*.007+time*.0004+i)*25),12,12)}ctx.globalAlpha=1}
   ctx.save();ctx.translate(-Math.round(s.camera),0);
   // Distinct landmarks sit behind the collision surfaces and actors.
   ctx.fillStyle='#779fc0';ctx.beginPath();ctx.moveTo(4340,620);ctx.lineTo(4590,300);ctx.lineTo(4810,450);ctx.lineTo(5060,240);ctx.lineTo(5480,620);ctx.fill();
   ctx.fillStyle='#a5d5e5';ctx.beginPath();ctx.moveTo(4590,300);ctx.lineTo(4530,510);ctx.lineTo(4660,580);ctx.lineTo(4810,450);ctx.lineTo(5060,240);ctx.lineTo(4970,520);ctx.lineTo(5260,620);ctx.lineTo(4340,620);ctx.fill();
   ctx.strokeStyle='#4e86a5';ctx.lineWidth=5;for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(4560+i*120,420);ctx.lineTo(4500+i*120,520);ctx.lineTo(4570+i*120,595);ctx.stroke()}
   if(s.camera<600){ctx.fillStyle='#294252';ctx.fillRect(90,420,330,200);ctx.fillStyle='#8f6c65';ctx.fillRect(100,430,310,184);for(let y=440;y<605;y+=23){ctx.fillStyle='#5a4c52';ctx.fillRect(100,y,310,3)}ctx.fillStyle='#152d46';ctx.beginPath();ctx.moveTo(70,425);ctx.lineTo(255,325);ctx.lineTo(440,425);ctx.fill();ctx.fillStyle='#f1f6eb';ctx.beginPath();ctx.moveTo(85,411);ctx.lineTo(255,325);ctx.lineTo(425,411);ctx.lineTo(410,407);ctx.lineTo(255,347);ctx.lineTo(99,420);ctx.fill();ctx.fillStyle='#243b4e';ctx.fillRect(215,492,70,128);ctx.fillStyle='#fff0b3';ctx.fillRect(126,469,58,55);ctx.fillRect(320,469,58,55);ctx.fillStyle='#407084';ctx.fillRect(152,469,5,55);ctx.fillRect(126,493,58,5);ctx.fillRect(346,469,5,55);ctx.fillRect(320,493,58,5);label('TRAIL STATION',255,457,18,'#fff2c5')}
   for(let i=Math.floor(s.camera/160);i<Math.ceil((s.camera+1280)/160);i++)if(i*160+40<80||i*160+40>450)tree(i*160+40,620);
   ctx.fillStyle='#476479';ctx.fillRect(s.camera,world.floor,1280,100);ctx.fillStyle='#b8d6e1';ctx.fillRect(s.camera,world.floor,1280,16);ctx.fillStyle='#f0f8ff';ctx.fillRect(s.camera,world.floor,1280,6);
   for(const r of world.ice){ctx.fillStyle='#49abc6';ctx.fillRect(r.x,world.floor,r.w,35);ctx.fillStyle='#164961';for(let x=r.x+12;x<r.x+r.w;x+=38){ctx.fillRect(x,world.floor+5,20,3);ctx.fillRect(x+15,world.floor+8,3,10)}label('THIN ICE',r.x+r.w/2,world.floor-12,18,'#ffe887')}
   for(const p of world.platforms){ctx.fillStyle='#243e5d';ctx.fillRect(p.x-2,p.y,p.w+4,24);ctx.fillStyle='#7ec4d2';ctx.fillRect(p.x,p.y+4,p.w,14);ctx.fillStyle='#effbff';ctx.fillRect(p.x,p.y,p.w,6);ctx.fillStyle='#437f9e';for(let x=p.x+18;x<p.x+p.w;x+=32)ctx.fillRect(x,p.y+12,12,3)}
   for(const cp of world.checkpoints){ctx.fillStyle='#223d51';ctx.fillRect(cp.x,460,8,160);ctx.fillStyle=s.checkpoint>=cp.x?'#7cffc6':'#ffd384';ctx.fillRect(cp.x+8,466,64,35);label(cp.name,cp.x+40,450)}
   const section=world.sections.findLast(z=>player.x>=z.x);label(section.name,s.camera+640,45,24,'#d1f4ff');
   for(const r of s.relays){ctx.fillStyle='#16364d';ctx.fillRect(r.x,550,64,70);ctx.fillStyle=r.hp?'#a1dceb':'#5fefbd';ctx.fillRect(r.x+5,555,54,58);ctx.fillStyle='#f4feff';ctx.fillRect(r.x+9,560,4,42);ctx.fillStyle=r.hp?'#477b9e':'#276b57';ctx.fillRect(r.x+20,570,25,24);label(r.hp?`RELAY ${r.hp}/2`:'RESTORED',r.x+32,535,18,r.hp?'#fff0a5':'#8dffc8')}
   for(const r of s.shards)if(!r.got){const y=r.y+Math.round(Math.sin(time*.004+r.x)*3);ctx.fillStyle='#172e58';ctx.fillRect(r.x-12,y-16,24,32);ctx.fillStyle='#91ffe1';ctx.beginPath();ctx.moveTo(r.x,y-15);ctx.lineTo(r.x+10,y);ctx.lineTo(r.x,y+15);ctx.lineTo(r.x-10,y);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(r.x-3,y-8,4,8)}
   for(const r of s.caches)if(!r.got){ctx.fillStyle='#5c3a42';ctx.fillRect(r.x-18,r.y-15,36,30);ctx.fillStyle='#ffd290';ctx.fillRect(r.x-16,r.y-12,32,5);ctx.fillStyle='#fff1ce';ctx.fillRect(r.x-3,r.y,6,9)}
   for(const e of s.enemies)if(e.alive){ctx.save();if(e.flash&&s.tick%4<2)ctx.globalAlpha=.35;const x=Math.round(e.x),y=Math.round(e.y);
    if(e.type==='salmon'){const scale=e.large?1.4:1;ctx.translate(x+(e.dir<0?e.w:0),y);ctx.scale(e.dir<0?-scale:scale,scale);ctx.fillStyle='#142a42';ctx.fillRect(6,5,42,22);ctx.fillStyle=e.normal?'#e58888':'#94a9b5';ctx.fillRect(8,7,38,18);ctx.fillStyle=e.normal?'#ffb59e':'#c3ddd2';ctx.fillRect(11,9,30,6);ctx.fillStyle='#577b94';ctx.fillRect(0,3,10,8);ctx.fillRect(0,18,10,8);ctx.fillRect(20,0,13,6);ctx.fillRect(25,23,9,6);ctx.fillStyle=e.normal?'#18243c':'#caff68';ctx.fillRect(39,10,5,5);ctx.fillStyle='#283d57';ctx.fillRect(39,20,8,3)}
    else{ctx.fillStyle='#172d42';ctx.fillRect(x-2,y-2,e.w+4,e.h+4);ctx.fillStyle='#ac9dd9';ctx.fillRect(x,y,e.w,e.h);ctx.fillStyle='#f2f4ff';ctx.fillRect(x+6,y+5,e.w-12,16);ctx.fillStyle='#253451';ctx.fillRect(x+10,y+9,5,5);ctx.fillRect(x+e.w-15,y+9,5,5);ctx.fillStyle='#ffe09a';ctx.fillRect(x+18,y+18,10,7);ctx.fillStyle='#716ba5';ctx.fillRect(x-8,y+12,8,22);ctx.fillRect(x+e.w,y+12,8,22)}
    ctx.restore();if(e.windup)label('!',e.x+20,e.y-15,26,'#ffe785')}
   if(s.bossStarted&&!s.bossDefeated){ctx.save();if(boss.inv&&s.tick%6<3)ctx.globalAlpha=.4;const x=boss.x,y=boss.y;
    ctx.fillStyle='#14273c';ctx.fillRect(x+24,y+30,82,138);ctx.fillStyle='#5576ac';ctx.fillRect(x+28,y+70,74,94);ctx.fillStyle='#c8edff';ctx.fillRect(x+37,y+83,56,6);ctx.fillRect(x+33,y+142,64,14);ctx.fillStyle='#e6bda6';ctx.fillRect(x+43,y+22,44,45);ctx.fillStyle='#e1f7ff';ctx.fillRect(x+38,y+18,8,45);ctx.fillRect(x+87,y+18,8,45);ctx.fillStyle='#14273c';ctx.fillRect(x+50,y+35,6,5);ctx.fillRect(x+74,y+35,6,5);ctx.fillStyle='#ba528f';ctx.fillRect(x+58,y+53,14,4);
    ctx.fillStyle='#7cf1ef';ctx.fillRect(x+36,y+8,60,12);ctx.fillRect(x+36,y-5,9,18);ctx.fillRect(x+61,y-13,9,25);ctx.fillRect(x+87,y-5,9,18);ctx.fillStyle='#d7f8ff';ctx.fillRect(x+9,y+70,17,68);ctx.fillRect(x+106,y+70,17,68);ctx.fillStyle='#435b86';ctx.fillRect(x+123,y+30,7,122);ctx.fillStyle='#8cffff';ctx.fillRect(x+114,y+20,24,16);
    if(boss.shield){ctx.strokeStyle='#b3f6ff';ctx.lineWidth=7;ctx.strokeRect(x-12,y-20,154,195);label('ICE SHIELD '+boss.shield,x+65,y-42,20,'#ccf9ff')}
    ctx.restore();if(boss.windup){label(boss.phase===1?'SNOWBALLS + SALMON!':'BLIZZARD + ICICLES!',boss.x+60,boss.y-25,21,'#ffe887');if(boss.phase>=2)for(const x of boss.markers||[]){ctx.fillStyle='#ffe66d';ctx.fillRect(x,110,18,8);label('↓',x+9,95,24,'#ffe66d')}}
   }
   for(const ice of s.icePatches){ctx.fillStyle='#78dae9';ctx.fillRect(ice.x,ice.y,ice.w,ice.h);ctx.fillStyle='#eefaff';ctx.fillRect(ice.x,ice.y,ice.w,3)}
   QuestCore.drawPositiveFields(ctx,s.fields,time);QuestCore.drawHeroShots(ctx,s.shots,time);QuestCore.drawCookieBombs(ctx,s.cookies,time);
   for(const q of s.hostile){ctx.fillStyle='#152e53';ctx.fillRect(q.x-3,q.y-3,q.w+6,q.h+6);ctx.fillStyle=q.wave?'#8ae7fa':'#f1faff';ctx.fillRect(q.x,q.y,q.w,q.h);ctx.fillStyle='#70bfdc';ctx.fillRect(q.x+4,q.y+q.h-6,q.w-8,4)}
   for(const p of s.particles){ctx.globalAlpha=p.life/25;ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,4,4)}ctx.globalAlpha=1;
   QuestCore.drawBeagle(ctx,player.x-80,world.floor-40,time,'rigsby',player.facing<0);QuestCore.drawBeagle(ctx,player.x-140,world.floor-40,time,'zoey',player.facing<0);
   QuestCore.drawDude(ctx,{images:imgs,dudeIndex:s.dude,player,time,groundY:world.floor});QuestCore.drawDanielCast(ctx,player,s.cast);
   if(s.bossDefeated){ctx.fillStyle='#75ffbe';ctx.fillRect(7400,480,10,140);ctx.fillRect(7410,485,90,50);label('COSTA RICA',7400,460,20,'#b6ffe0')}
   ctx.restore();if(s.weather!=='CALM')for(let i=0;i<40;i++){ctx.fillStyle=i%2?'#d4edf6':'#fff';ctx.fillRect((i*83+s.tick*(s.weather==='GUST'?2:1))%1280,(i*51+s.tick*2)%720,3,3)}renderer.present();
  }
  input=QuestRuntime.createInput({active:()=>s.started&&!s.paused&&!s.completed,screenActive:()=>s.started,canvas,buttons:[...document.querySelectorAll('[data-action]')],switchDude:setDude,pause:()=>pause(!s.paused)});
  clock=QuestRuntime.createLoop({update,draw,active:()=>s.started&&!s.paused&&!s.completed,onError:e=>{console.error(e);pause(true);message('Quest paused after a runtime error. Reload to recover the saved checkpoint.')}});
  $('pauseBtn').addEventListener('click',()=>pause(!s.paused));
  $('beginAdventure').addEventListener('click',()=>start(true));$('continueAdventure').addEventListener('click',()=>start(false));$('resumeAdventure').addEventListener('click',()=>pause(false));$('restartAdventure').addEventListener('click',()=>start(true));$('replayAdventure').addEventListener('click',()=>start(true));$('switchBtn').addEventListener('click',()=>{if(input.isPlaying())setDude(s.dude+1)});
  $('saveAdventure').addEventListener('click',()=>{const ok=save();$('adventureSaveStatus').textContent=ok?'Checkpoint saved.':'Storage unavailable. Keep this tab open.';if(ok)QuestAudio.effect('save')});
  $('dialogueNext').addEventListener('click',()=>{$('dialogue').classList.add('hidden');s.paused=false;clock.reset();input.focusCanvas();QuestAudio.sync()});
  for(const type of ['blur','pagehide'])addEventListener(type,()=>{if(s.started&&!s.paused&&!s.completed)pause(true)});document.addEventListener('visibilitychange',()=>{if(document.hidden&&s.started&&!s.completed)pause(true)});
  window.__QUEST_SESSION__={isActive:()=>s.started&&!s.completed,suspendViewport(){const paused=s.paused;s.paused=true;input.releaseAll();save();QuestAudio.sync();return()=>{s.paused=paused;clock.reset();QuestAudio.sync()}}};
  QuestAudio.bind(()=>({track:!s.started?'title':s.bossDefeated?'victory':s.bossStarted?world.bossMusic:world.music,paused:s.paused}));
  QuestCore.preloadCastImages(imgs).then(report=>{ready=report.ready&&QuestCore.verifyCastRenderer(imgs).ready;$('beginAdventure').disabled=!ready;$('continueAdventure').disabled=!ready||!QuestRuntime.readSave(world.saveKey);if(!ready)message('Characters could not load. Reload when online.');draw(0)});
  const api={state:s,player,boss,input,clock,save,load,update,draw,start,hit,hurt,fire,setDude,world,renderer};
  window.__ADVENTURE_DEBUG__={state:s,player,version:window.QuestRelease.version};if(new URLSearchParams(location.search).has('qa'))window.__ADVENTURE_TEST__=api;
  clock.start();return api;
 }
 window.QuestAdventure=Object.freeze({create});
})();
