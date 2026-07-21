"use strict";

(function boot(){
  const boot=document.getElementById('bootSequence');
  if(!boot)return;
  const fill=boot.querySelector('.bootProgressFill');
  const status=boot.querySelector('.bootStatus');
  const enter=document.getElementById('enterQuest');
  const steps=[[15,'LOADING HOME BASE...'],[32,'LIGHTING HILLCREST...'],[50,'OPENING THE PCH...'],[68,'ROLLING INTO HOLLYWOOD...'],[84,'SUMMONING THE QUEEN OF BEIGE...'],[100,'SOUTHERN CALIFORNIA READY']];
  let i=0;
  const dismiss=()=>{boot.classList.add('isHidden');boot.style.pointerEvents='none';setTimeout(()=>boot.remove(),550)};
  const next=()=>{const s=steps[i++];if(!s)return;fill.style.width=s[0]+'%';status.textContent=s[1];if(i<steps.length)setTimeout(next,170);else setTimeout(()=>{enter.classList.add('isReady');enter.style.display='block';setTimeout(dismiss,700)},180)};
  enter.addEventListener('click',dismiss,{once:true});
  setTimeout(next,100);setTimeout(dismiss,3000);
})();

window.addEventListener('error',e=>{
  console.error('3Dudes1Quest 1.0.8B:',e.error||e.message);
  document.getElementById('bootSequence')?.classList.add('isHidden');
});

const W=1280,H=720,FLOOR=620,WORLD=9200;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const overlap=(a,b)=>a.x+a.w>b.x&&a.x<b.x+b.w&&a.y+a.h>b.y&&a.y<b.y+b.h;
const DUDES=[
  {name:'Will',color:'#ff4fb8',accent:'#ffe66d',speed:6.2,jump:14,power:'Rainbow Toss'},
  {name:'Daniel',color:'#8d5cff',accent:'#3ce7d2',speed:5.7,jump:13.5,power:'Positive Shield'},
  {name:'Caleb',color:'#ff9a3c',accent:'#fff',speed:5.9,jump:13,power:'Cookie Chaos'}
];
const ZONES=[
  {id:'home',name:'HOME BASE',start:0,end:1450,color:'#ff9d78',objective:'Leave Home Base',detail:'Follow Rigsby and recover the first Gay Card.'},
  {id:'hillcrest',name:'HILLCREST',start:1450,end:3300,color:'#ff4fb8',objective:'Restore Hillcrest',detail:'Collect two Gay Cards and activate the neighborhood Prism Beacon.'},
  {id:'pch',name:'PCH',start:3300,end:5000,color:'#3ce7d2',objective:'Race the PCH',detail:'Cross the coast, avoid Beige Bots, and restore the ocean beacon.'},
  {id:'hollywood',name:'HOLLYWOOD',start:5000,end:6600,color:'#ffe66d',objective:'Take Back Hollywood',detail:'Climb the studio district and recover the final Gay Card.'},
  {id:'la',name:'LOS ANGELES',start:6600,end:9200,color:'#8d5cff',objective:'Defeat the Queen of Beige',detail:'Restore the final beacon, enter City Hall, and defeat the Queen.'}
];

function createUI(){
  const screens={title:qs('titleScreen'),help:qs('helpScreen'),game:qs('gameScreen'),complete:qs('completeScreen'),portal:qs('portalScreen')};
  const refs={dude:qs('hudDude'),health:qs('hudHealth'),cards:qs('hudCards'),beacons:qs('hudBeacons'),triangle:qs('hudTriangle'),routeFill:qs('routeProgressFill'),routeLabel:qs('routeLabel'),objectiveTitle:qs('objectiveTitle'),objectiveDetail:qs('objectiveDetail'),message:qs('message'),completeStats:qs('completeStats'),bossPhase:qs('bossPhase')};
  function show(name){Object.values(screens).forEach(s=>s.classList.remove('active'));screens[name].classList.add('active')}
  function flash(text){refs.message.textContent=text;refs.message.classList.add('show');clearTimeout(flash.t);flash.t=setTimeout(()=>refs.message.classList.remove('show'),1800)}
  function hud(game){const s=game.state,d=DUDES[s.dude],z=game.zone();refs.dude.textContent=d.name;refs.health.textContent=s.health;refs.cards.textContent=s.cards;refs.beacons.textContent=s.beacons;refs.triangle.textContent=Math.floor(s.triangle);refs.routeFill.style.width=(game.player.x/(WORLD-100)*100)+'%';refs.routeLabel.textContent=z.name;refs.objectiveTitle.textContent=s.objective.title;refs.objectiveDetail.textContent=s.objective.detail;refs.bossPhase.classList.toggle('hidden',!game.boss.active);if(game.boss.active)refs.bossPhase.textContent=`QUEEN OF BEIGE  ${Math.max(0,game.boss.hp)}/${game.boss.maxHp}`}
  return {show,flash,hud,refs,screens};
}
function qs(id){return document.getElementById(id)}
function createInput(switcher){
  const k={left:false,right:false,jump:false,power:false};
  const set=(key,v)=>{if(['ArrowLeft','a','A'].includes(key))k.left=v;if(['ArrowRight','d','D'].includes(key))k.right=v;if(['ArrowUp','w','W',' '].includes(key))k.jump=v;if(['x','X','f','F'].includes(key))k.power=v};
  addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp',' ','a','A','d','D','w','W','x','X','f','F'].includes(e.key))e.preventDefault();set(e.key,true);if(e.key==='1')switcher(0);if(e.key==='2')switcher(1);if(e.key==='3')switcher(2)},{passive:false});
  addEventListener('keyup',e=>set(e.key,false));addEventListener('blur',()=>k.left=k.right=k.jump=k.power=false);
  document.querySelectorAll('[data-action]').forEach(b=>{const a=b.dataset.action;const fn=v=>e=>{e.preventDefault();k[a]=v};b.addEventListener('pointerdown',fn(true),{passive:false});['pointerup','pointercancel','pointerleave'].forEach(ev=>b.addEventListener(ev,fn(false),{passive:false}))});
  return k;
}

class Adventure{
  constructor(canvas,ui,input,onComplete){
    this.canvas=canvas;this.ctx=canvas.getContext('2d');this.ui=ui;this.input=input;this.onComplete=onComplete;this.ctx.imageSmoothingEnabled=true;this.images={};this.loadAssets();this.reset();window.__questGame=this;
  }
  load(key,src){const im=new Image();im.src=src;this.images[key]=im}
  loadAssets(){this.load('home','assets/environments/home_base_remastered.svg');['will','daniel','caleb'].forEach(n=>['idle','walk','jump','attack','hurt','celebrate'].forEach(s=>this.load(`${n}_${s}`,`assets/sprites_hd/${n}_${s}.png`)));['idle','walk','bark'].forEach(s=>this.load(`rigsby_${s}`,`assets/sprites_hd/rigsby_${s}.png`))}
  reset(){
    this.state={health:4,cards:0,beacons:0,dude:0,triangle:0,paused:false,bossDefeated:false,objective:{title:ZONES[0].objective,detail:ZONES[0].detail}};
    this.player={x:150,y:FLOOR-72,w:44,h:72,vx:0,vy:0,onGround:true,facing:1,inv:0,anim:'idle',animUntil:0};this.camera=0;this.running=false;this.last=0;this.finished=false;this.zoneId='home';this.zoneIntro=performance.now()+1300;this.jumpHeld=false;this.powerHeld=false;this.rigsby={x:265,y:FLOOR-42,w:56,h:40};
    this.cards=[650,1720,2600,3730,4630,5750].map((x,i)=>({x,y:FLOOR-100-(i%2)*95,w:38,h:52,taken:false}));
    this.beacons=[{x:3020,y:FLOOR-105,w:54,h:92,on:false},{x:4870,y:FLOOR-105,w:54,h:92,on:false},{x:6980,y:FLOOR-105,w:54,h:92,on:false}];
    this.platforms=[
      {x:1800,y:500,w:220,h:24},{x:2160,y:435,w:210,h:24},{x:2560,y:520,w:240,h:24},
      {x:3480,y:520,w:200,h:24},{x:3860,y:450,w:230,h:24},{x:4300,y:510,w:260,h:24},
      {x:5180,y:520,w:190,h:24},{x:5480,y:445,w:220,h:24},{x:5800,y:375,w:240,h:24},{x:6200,y:500,w:260,h:24},
      {x:7050,y:500,w:220,h:24},{x:7450,y:435,w:230,h:24}
    ];
    this.enemies=[1900,2840,3580,4200,5400,6120,7200,7620].map((x,i)=>({x,y:FLOOR-54,w:52,h:54,vx:i%2?1.25:-1.25,min:x-110,max:x+110,alive:true}));
    this.boss={x:8150,y:FLOOR-150,w:120,h:150,hp:10,maxHp:10,active:false,alive:true,cool:0,dir:-1};
    this.portal={x:8840,y:FLOOR-170,w:150,h:165,open:false};this.particles=[];this.ui.hud(this);
  }
  start(save){this.reset();if(save)this.applySave(save);this.running=true;this.last=performance.now();this.ui.flash('Adventure 1 restored: Home to Los Angeles.');requestAnimationFrame(t=>this.loop(t))}
  stop(){this.running=false}
  zone(){return ZONES.find(z=>this.player.x>=z.start&&this.player.x<z.end)||ZONES.at(-1)}
  setZone(z){if(z.id===this.zoneId)return;this.zoneId=z.id;this.zoneIntro=performance.now()+1200;this.state.objective={title:z.objective,detail:z.detail};showScene(z.name);this.ui.flash(z.name)}
  loop(t){if(!this.running)return;const dt=clamp((t-this.last)/16.667||1,0,2);this.last=t;if(!this.state.paused)this.update(dt,t);this.draw(t);requestAnimationFrame(n=>this.loop(n))}
  update(dt,t){
    const d=DUDES[this.state.dude];if(this.input.left){this.player.vx-=.78*dt;this.player.facing=-1}if(this.input.right){this.player.vx+=.78*dt;this.player.facing=1}if(!this.input.left&&!this.input.right)this.player.vx*=Math.pow(.76,dt);this.player.vx=clamp(this.player.vx,-d.speed,d.speed);
    if(this.input.jump&&!this.jumpHeld&&this.player.onGround){this.player.vy=-d.jump;this.player.onGround=false;this.burst(this.player.x+22,FLOOR,'#ffe66d',10)}this.jumpHeld=this.input.jump;
    if(this.input.power&&!this.powerHeld)this.power(t);this.powerHeld=this.input.power;
    this.player.vy+=.72*dt;this.player.x+=this.player.vx*dt;this.player.y+=this.player.vy*dt;this.player.x=clamp(this.player.x,0,WORLD-this.player.w);this.player.onGround=false;
    if(this.player.y+this.player.h>=FLOOR){this.player.y=FLOOR-this.player.h;this.player.vy=0;this.player.onGround=true}
    for(const p of this.platforms){if(this.player.x+this.player.w>p.x&&this.player.x<p.x+p.w&&this.player.y+this.player.h>=p.y&&this.player.y+this.player.h<=p.y+30&&this.player.vy>=0){this.player.y=p.y-this.player.h;this.player.vy=0;this.player.onGround=true}}
    if(this.player.y>760){this.player.x=Math.max(100,this.zone().start+100);this.player.y=FLOOR-this.player.h;this.player.vx=this.player.vy=0}
    this.camera+=(this.player.x-350+this.player.facing*80-this.camera)*.075;this.camera=clamp(this.camera,0,WORLD-W);
    const z=this.zone();this.setZone(z);this.rigsby.x+=(clamp(this.player.x+125,240,7900)-this.rigsby.x)*.055*dt;this.rigsby.y=FLOOR-43;
    this.collect();this.updateEnemies(dt);this.updateBoss(dt,t);this.updateParticles(dt);if(this.player.inv>0)this.player.inv-=dt;this.state.triangle=clamp(this.state.triangle+.01*dt,0,100);this.ui.hud(this);
  }
  collect(){
    for(const c of this.cards){if(!c.taken&&overlap(this.player,c)){c.taken=true;this.state.cards++;this.state.triangle=clamp(this.state.triangle+12,0,100);this.burst(c.x,c.y,'#ffe66d',30);this.ui.flash(`Gay Card ${this.state.cards}/6 acquired!`);showCollect(`🌈 GAY CARD ${this.state.cards}/6`)}}
    for(const b of this.beacons){if(!b.on&&overlap(this.player,b)){b.on=true;this.state.beacons++;this.state.triangle=clamp(this.state.triangle+18,0,100);this.burst(b.x,b.y,'#3ce7d2',42);this.ui.flash(`Prism Beacon ${this.state.beacons}/3 restored!`);showAchievement(`Prism Beacon ${this.state.beacons}/3`,'🔺')}}
  }
  updateEnemies(dt){for(const e of this.enemies){if(!e.alive)continue;e.x+=e.vx*dt;if(e.x<e.min||e.x>e.max)e.vx*=-1;if(overlap(this.player,e)&&this.player.inv<=0)this.hurt(e.x)}}
  hurt(source){this.state.health--;this.player.inv=100;this.player.vx=source<this.player.x?7:-7;this.player.vy=-7;this.burst(this.player.x,this.player.y,'#ff6b8a',18);if(this.state.health<=0){this.state.health=4;const z=this.zone();this.player.x=z.start+100;this.player.y=FLOOR-this.player.h;this.camera=clamp(this.player.x-250,0,WORLD-W)}}
  power(t){
    this.player.anim='attack';this.player.animUntil=t+430;const dude=this.state.dude;const radius=dude===0?300:dude===2?250:0;
    if(dude===1){this.player.inv=150;this.state.health=clamp(this.state.health+1,0,4);this.burst(this.player.x,this.player.y,'#3ce7d2',30);this.ui.flash('Positive Shield!');return}
    let hitSomething=false;for(const e of this.enemies){if(e.alive&&Math.abs(e.x-this.player.x)<radius){e.alive=false;hitSomething=true;this.burst(e.x,e.y,dude===0?'#ff4fb8':'#ff9a3c',32)}}
    if(this.boss.active&&this.boss.alive&&Math.abs(this.boss.x-this.player.x)<360){this.boss.hp--;hitSomething=true;this.burst(this.boss.x+60,this.boss.y+55,dude===0?'#ff4fb8':'#ff9a3c',38);if(this.boss.hp<=0)this.defeatBoss()}
    this.ui.flash(hitSomething?`${DUDES[dude].power}! Direct hit.`:DUDES[dude].power+'!')
  }
  updateBoss(dt,t){
    const prereq=this.state.cards===6&&this.state.beacons===3;if(this.player.x>7900&&prereq&&this.boss.alive)this.boss.active=true;
    if(this.player.x>7900&&!prereq){this.player.x=7850;this.ui.flash(`Need ${6-this.state.cards} Gay Cards and ${3-this.state.beacons} Beacons.`)}
    if(!this.boss.active||!this.boss.alive)return;this.boss.x+=this.boss.dir*1.1*dt;if(this.boss.x<8050||this.boss.x>8480)this.boss.dir*=-1;this.boss.cool-=dt;if(this.boss.cool<=0){this.boss.cool=95;this.projectile={x:this.boss.x,y:this.boss.y+60,vx:-6,w:28,h:18}}
    if(this.projectile){this.projectile.x+=this.projectile.vx*dt;if(overlap(this.player,this.projectile)&&this.player.inv<=0){this.hurt(this.projectile.x);this.projectile=null}else if(this.projectile.x<this.camera-100)this.projectile=null}
    if(overlap(this.player,this.boss)&&this.player.inv<=0)this.hurt(this.boss.x)
  }
  defeatBoss(){this.boss.alive=false;this.boss.active=false;this.state.bossDefeated=true;this.portal.open=true;this.state.objective={title:'Enter the Lake Tahoe Portal',detail:'Southern California is restored. The next villain awaits in Adventure 2.'};this.burst(this.boss.x+60,this.boss.y+70,'#ffe66d',100);showAchievement('Queen of Beige Defeated','👑');this.ui.flash('The Queen of Beige has been defeated!')}
  checkPortal(){if(this.portal.open&&overlap(this.player,this.portal)&&!this.finished){this.finished=true;this.running=false;setTimeout(()=>this.onComplete(this.state),350)}}
  draw(t){const c=this.ctx;c.clearRect(0,0,W,H);this.drawSky(t);c.save();c.translate(-this.camera,0);this.drawWorld(t);this.drawCollectibles(t);this.drawEnemies(t);this.drawBoss(t);this.drawPortal(t);this.drawRigsby(t);this.drawPlayer(t);this.drawParticles();c.restore();this.drawVignette();if(t<this.zoneIntro)this.drawZoneTitle(t);if(this.state.paused){c.fillStyle='rgba(5,4,18,.78)';c.fillRect(0,0,W,H);this.text('PAUSED',W/2,H/2,62,'#fff','center')}this.checkPortal()}
  drawSky(t){const c=this.ctx,z=this.zone();const palettes={home:['#5b398d','#ff6e9f','#ffc476'],hillcrest:['#321761','#d93e92','#ffad69'],pch:['#086b9b','#4acbd3','#ffd08b'],hollywood:['#21143e','#7f3f9d','#ffb45e'],la:['#160f31','#4a205c','#e75f78']};const p=palettes[z.id],g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,p[0]);g.addColorStop(.58,p[1]);g.addColorStop(1,p[2]);c.fillStyle=g;c.fillRect(0,0,W,H);c.fillStyle='rgba(255,244,190,.72)';c.beginPath();c.arc(1080,135,58,0,Math.PI*2);c.fill();for(let i=0;i<4;i++){const x=((i*390+t*.012)-this.camera*.05)%1600-150;c.fillStyle='rgba(255,255,255,.36)';c.beginPath();c.ellipse(x,170+i*35,90,24,0,0,Math.PI*2);c.fill()}}
  drawWorld(t){for(const z of ZONES)this.drawZone(z,t);this.drawGround();for(const p of this.platforms){this.ctx.fillStyle=p.x<3300?'#71405f':p.x<5000?'#3c8890':p.x<6600?'#8b5b9d':'#4a3c6d';this.ctx.beginPath();this.ctx.roundRect(p.x,p.y,p.w,p.h,10);this.ctx.fill();this.ctx.fillStyle='rgba(255,255,255,.22)';this.ctx.fillRect(p.x+12,p.y+4,p.w-24,4)}}
  drawGround(){const c=this.ctx;for(const z of ZONES){const colors={home:['#a6603f','#61393a'],hillcrest:['#5d365f','#2f2444'],pch:['#b88959','#5f6d5e'],hollywood:['#76506c','#34283e'],la:['#4a405d','#211d32']}[z.id];const g=c.createLinearGradient(0,FLOOR,0,H);g.addColorStop(0,colors[0]);g.addColorStop(1,colors[1]);c.fillStyle=g;c.fillRect(z.start,FLOOR,z.end-z.start,100);c.strokeStyle='rgba(255,255,255,.12)';for(let x=z.start;x<z.end;x+=110){c.beginPath();c.moveTo(x,FLOOR);c.lineTo(x+55,H);c.stroke()}}}
  drawZone(z,t){const c=this.ctx;if(z.id==='home'){const im=this.images.home;if(im?.complete&&im.naturalWidth)c.drawImage(im,0,0,1450,720);else this.house(150)}else if(z.id==='hillcrest'){for(let x=z.start+80;x<z.end;x+=280)this.storefront(x,430,(x/280)%2?'#ff4fb8':'#3ce7d2');this.rainbowCrosswalk(2050)}else if(z.id==='pch'){c.fillStyle='#1aa8c7';c.fillRect(z.start,405,z.end-z.start,215);for(let x=z.start;x<z.end;x+=170){c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=5;c.beginPath();c.arc(x,470+Math.sin(t*.002+x)*18,90,3.5,5.9);c.stroke()}for(let x=z.start+180;x<z.end;x+=430)this.palm(x,520)}else if(z.id==='hollywood'){for(let x=z.start+100;x<z.end;x+=260){c.fillStyle=x%520?'#3b284d':'#53335e';c.fillRect(x,340,190,280);c.fillStyle='#ffe66d';for(let y=380;y<570;y+=45){c.fillRect(x+25,y,28,16);c.fillRect(x+100,y,28,16)}}this.text('HOLLYWOOD',5580,290,42,'rgba(255,255,255,.8)','center')}else{for(let x=z.start+50;x<z.end;x+=240){const h=220+(x%5)*28;c.fillStyle=x%480?'#2b2744':'#393151';c.fillRect(x,FLOOR-h,180,h);c.fillStyle='rgba(255,224,93,.48)';for(let y=FLOOR-h+35;y<FLOOR-25;y+=42){c.fillRect(x+30,y,26,14);c.fillRect(x+105,y,26,14)}}c.fillStyle='#d4c8b7';c.fillRect(7900,360,700,260);this.text('BEIGE CITY HALL',8250,400,30,'#574d4a','center')}}
  house(x){const c=this.ctx;c.fillStyle='#fff1dc';c.fillRect(x+90,330,560,290);c.fillStyle='#37263f';c.beginPath();c.moveTo(x,340);c.lineTo(x+370,120);c.lineTo(x+740,340);c.fill();c.fillStyle='#573344';c.fillRect(x+170,420,140,200);c.fillStyle='#54cbe0';c.fillRect(x+400,420,180,110)}
  storefront(x,y,color){const c=this.ctx;c.fillStyle='#302443';c.fillRect(x,y,220,FLOOR-y);c.fillStyle=color;c.fillRect(x,y,220,24);c.fillStyle='#75dbe3';c.fillRect(x+25,y+55,70,80);c.fillRect(x+120,y+55,70,80);c.fillStyle='#fff';c.font='900 15px system-ui';c.fillText(x%560?'CAFÉ':'PRIDE',x+65,y+190)}
  rainbowCrosswalk(x){const colors=['#ff4b4b','#ff9f43','#ffe66d','#49d17d','#45a3ff','#a55cff'];colors.forEach((co,i)=>{this.ctx.fillStyle=co;this.ctx.fillRect(x+i*45,FLOOR-18,38,18)})}
  palm(x,y){const c=this.ctx;c.strokeStyle='#70513f';c.lineWidth=13;c.beginPath();c.moveTo(x,y+100);c.quadraticCurveTo(x-10,y+20,x,y-70);c.stroke();c.fillStyle='#20734f';for(let i=0;i<7;i++){c.save();c.translate(x,y-70);c.rotate(i*Math.PI/3.5);c.beginPath();c.ellipse(0,-48,12,58,0,0,Math.PI*2);c.fill();c.restore()}}
  drawCollectibles(t){for(const c of this.cards){if(c.taken)continue;const y=c.y+Math.sin(t*.004+c.x)*7;this.ctx.save();this.ctx.shadowColor='#ffe66d';this.ctx.shadowBlur=20;this.ctx.fillStyle='#171128';this.ctx.beginPath();this.ctx.roundRect(c.x,y,c.w,c.h,7);this.ctx.fill();['#ff4b4b','#ff9f43','#ffe66d','#49d17d','#45a3ff','#a55cff'].forEach((co,i)=>{this.ctx.fillStyle=co;this.ctx.fillRect(c.x+7,y+8+i*5,c.w-14,5)});this.ctx.restore()}for(const b of this.beacons){const pulse=.8+.18*Math.sin(t*.006+b.x);this.ctx.save();this.ctx.translate(b.x+27,b.y+46);this.ctx.shadowColor=b.on?'#3ce7d2':'#7d708a';this.ctx.shadowBlur=b.on?35:10;this.ctx.fillStyle=b.on?'#3ce7d2':'#665a78';this.ctx.beginPath();this.ctx.moveTo(0,-45);this.ctx.lineTo(25,0);this.ctx.lineTo(0,45);this.ctx.lineTo(-25,0);this.ctx.closePath();this.ctx.fill();if(b.on){this.ctx.globalAlpha=.25;this.ctx.scale(1.5*pulse,1.5*pulse);this.ctx.fill()}this.ctx.restore()}}
  drawEnemies(t){for(const e of this.enemies){if(!e.alive)continue;const c=this.ctx;c.fillStyle='rgba(0,0,0,.2)';c.beginPath();c.ellipse(e.x+26,FLOOR-2,30,8,0,0,Math.PI*2);c.fill();c.fillStyle='#b9aa98';c.beginPath();c.roundRect(e.x,e.y,e.w,e.h,10);c.fill();this.text('HOA',e.x+26,e.y+38,11,'#655b54','center');c.fillStyle='#fff';c.fillRect(e.x+8,e.y+14,10,8);c.fillRect(e.x+34,e.y+14,10,8)}}
  drawBoss(t){if(!this.boss.alive)return;const c=this.ctx;const b=this.boss;c.save();c.shadowColor=this.boss.active?'#ffdf70':'transparent';c.shadowBlur=35;c.fillStyle='#c4b5a0';c.beginPath();c.roundRect(b.x,b.y,b.w,b.h,22);c.fill();c.fillStyle='#5c4b4b';c.beginPath();c.arc(b.x+60,b.y+38,35,0,Math.PI*2);c.fill();c.fillStyle='#e9d7c5';c.beginPath();c.moveTo(b.x+18,b.y);c.lineTo(b.x+60,b.y-42);c.lineTo(b.x+102,b.y);c.fill();this.text('QUEEN',b.x+60,b.y+90,17,'#5b4f4b','center');this.text('OF BEIGE',b.x+60,b.y+116,15,'#5b4f4b','center');c.restore();if(this.projectile){c.fillStyle='#d4c7b4';c.beginPath();c.roundRect(this.projectile.x,this.projectile.y,this.projectile.w,this.projectile.h,7);c.fill()}}
  drawPortal(t){const p=this.portal,c=this.ctx;c.save();c.translate(p.x+75,p.y+82);const pulse=1+Math.sin(t*.004)*.04;c.scale(pulse,pulse);c.strokeStyle=p.open?'#ff4fb8':'#625b6d';c.lineWidth=16;c.shadowColor=p.open?'#3ce7d2':'transparent';c.shadowBlur=p.open?42:0;c.beginPath();c.arc(0,0,68,0,Math.PI*2);c.stroke();c.strokeStyle=p.open?'#3ce7d2':'#48424f';c.lineWidth=9;c.beginPath();c.arc(0,0,45,0,Math.PI*2);c.stroke();c.fillStyle=p.open?'rgba(142,92,255,.34)':'rgba(30,28,35,.7)';c.beginPath();c.arc(0,0,37,0,Math.PI*2);c.fill();c.restore();this.text(p.open?'LAKE TAHOE':'LOCKED',p.x+75,p.y-14,18,p.open?'#fff':'#aaa','center')}
  drawRigsby(t){if(this.player.x>7900)return;const moving=Math.abs(this.rigsby.x-(this.player.x+125))>8;const im=this.images[`rigsby_${moving?'walk':'idle'}`];if(!this.sprite(im,this.rigsby.x-10,this.rigsby.y-28,Math.floor(t/(moving?90:150)),128,96,78,58,false)){this.ctx.fillStyle='#fff';this.ctx.beginPath();this.ctx.ellipse(this.rigsby.x+25,this.rigsby.y+20,28,17,0,0,Math.PI*2);this.ctx.fill();this.ctx.fillStyle='#85593c';this.ctx.beginPath();this.ctx.arc(this.rigsby.x+44,this.rigsby.y+10,13,0,Math.PI*2);this.ctx.fill()}}
  drawPlayer(t){const names=['will','daniel','caleb'],n=names[this.state.dude];let a='idle',frames=6,speed=150;if(this.player.animUntil>t)a=this.player.anim;else if(!this.player.onGround){a='jump';frames=4}else if(Math.abs(this.player.vx)>.35){a='walk';frames=8;speed=82}const im=this.images[`${n}_${a}`],alpha=this.player.inv>0&&Math.floor(this.player.inv/5)%2===0?.35:1;this.ctx.save();this.ctx.globalAlpha=alpha;this.ctx.fillStyle='rgba(0,0,0,.22)';this.ctx.beginPath();this.ctx.ellipse(this.player.x+22,FLOOR-2,31,8,0,0,Math.PI*2);this.ctx.fill();if(!this.sprite(im,this.player.x-20,this.player.y-50,Math.floor(t/speed)%frames,128,192,84,126,this.player.facing<0))this.fallbackHero();this.ctx.restore()}
  sprite(im,x,y,frame,fw,fh,w,h,flip){if(!im||!im.complete||!im.naturalWidth)return false;const count=Math.max(1,Math.floor(im.naturalWidth/fw));frame%=count;this.ctx.save();this.ctx.translate(x+(flip?w:0),y);this.ctx.scale(flip?-1:1,1);this.ctx.drawImage(im,frame*fw,0,fw,Math.min(fh,im.naturalHeight),0,0,w,h);this.ctx.restore();return true}
  fallbackHero(){const c=this.ctx,p=this.player,d=DUDES[this.state.dude];c.fillStyle='#b87855';c.beginPath();c.arc(p.x+22,p.y+15,15,0,Math.PI*2);c.fill();c.fillStyle=d.color;c.beginPath();c.roundRect(p.x+5,p.y+28,34,38,9);c.fill();c.fillStyle=d.accent;c.fillRect(p.x+18,p.y+31,7,30);c.fillStyle='#211a34';c.fillRect(p.x+8,p.y+63,11,17);c.fillRect(p.x+26,p.y+63,11,17)}
  burst(x,y,color,n){for(let i=0;i<n;i++)this.particles.push({x,y,vx:(Math.random()-.5)*8,vy:(Math.random()-.8)*8,life:40+Math.random()*55,color,s:2+Math.random()*5})}
  updateParticles(dt){for(const p of this.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=.18*dt;p.life-=dt}this.particles=this.particles.filter(p=>p.life>0)}
  drawParticles(){for(const p of this.particles){this.ctx.globalAlpha=clamp(p.life/50,0,1);this.ctx.fillStyle=p.color;this.ctx.beginPath();this.ctx.arc(p.x,p.y,p.s,0,Math.PI*2);this.ctx.fill()}this.ctx.globalAlpha=1}
  drawVignette(){const g=this.ctx.createRadialGradient(W/2,H*.45,260,W/2,H*.5,820);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(5,3,18,.25)');this.ctx.fillStyle=g;this.ctx.fillRect(0,0,W,H)}
  drawZoneTitle(t){const remain=this.zoneIntro-t,a=clamp(remain/380,0,1);this.ctx.save();this.ctx.globalAlpha=a;this.ctx.fillStyle='rgba(8,5,22,.76)';this.ctx.beginPath();this.ctx.roundRect(390,38,500,112,22);this.ctx.fill();this.text('ADVENTURE 1',640,78,15,'#3ce7d2','center');this.text(this.zone().name,640,121,39,'#fff','center');this.ctx.restore()}
  text(s,x,y,size,color,align='left'){this.ctx.font=`900 ${size}px system-ui,-apple-system,sans-serif`;this.ctx.textAlign=align;this.ctx.textBaseline='middle';this.ctx.fillStyle=color;this.ctx.fillText(s,x,y)}
  togglePause(){this.state.paused=!this.state.paused;this.ui.flash(this.state.paused?'Quest paused.':'Back to the quest.')}
  switchDude(i=null){this.state.dude=i===null?(this.state.dude+1)%3:i;this.ui.flash(`${DUDES[this.state.dude].name}: ${DUDES[this.state.dude].power}`)}
  save(){return {version:'1.0.8B',player:{x:this.player.x,y:this.player.y},state:this.state,cards:this.cards.map(c=>c.taken),beacons:this.beacons.map(b=>b.on),enemies:this.enemies.map(e=>e.alive),boss:{hp:this.boss.hp,alive:this.boss.alive},savedAt:new Date().toISOString()}}
  applySave(s){if(!s)return;this.player.x=clamp(s.player?.x||150,0,WORLD-50);this.player.y=s.player?.y||FLOOR-72;Object.assign(this.state,s.state||{},{paused:false});s.cards?.forEach((v,i)=>this.cards[i].taken=v);s.beacons?.forEach((v,i)=>this.beacons[i].on=v);s.enemies?.forEach((v,i)=>this.enemies[i].alive=v);if(s.boss){this.boss.hp=s.boss.hp;this.boss.alive=s.boss.alive;this.state.bossDefeated=!s.boss.alive;this.portal.open=!s.boss.alive}this.camera=clamp(this.player.x-350,0,WORLD-W)}
}

function showScene(title){const el=qs('sceneCurtain');if(!el)return;el.querySelector('.sceneCurtainTitle').textContent=title;el.classList.add('isActive');setTimeout(()=>el.classList.remove('isActive'),750)}
function showAchievement(title,icon='🏆'){const stack=qs('achievementStack');const card=document.createElement('div');card.className='achievementCard';card.innerHTML=`<div class="achievementIcon">${icon}</div><div><div class="achievementLabel">ACHIEVEMENT UNLOCKED</div><div class="achievementTitle">${title}</div></div>`;stack.appendChild(card);setTimeout(()=>card.remove(),4700)}
function showCollect(text){const t=qs('collectibleToast');t.textContent=text;t.classList.add('isVisible');clearTimeout(showCollect.t);showCollect.t=setTimeout(()=>t.classList.remove('isVisible'),2100)}
window.showAchievement=showAchievement;window.showCollectible=showCollect;

const canvas=qs('gameCanvas');canvas.width=W;canvas.height=H;const ui=createUI();let game;const input=createInput(i=>game?.switchDude(i));game=new Adventure(canvas,ui,input,state=>{ui.refs.completeStats.textContent=`All ${state.cards}/6 Gay Cards recovered, ${state.beacons}/3 Prism Beacons restored, and the Queen of Beige defeated.`;ui.show('complete')});window.__questGame=game;
const SAVE='3dudes1quest-save-108b';
function readSave(){try{return JSON.parse(localStorage.getItem(SAVE)||'null')}catch{return null}}
function refresh(){const s=readSave();qs('continueBtn').classList.toggle('hidden',!s);qs('saveStatus').textContent=s?`Adventure saved • ${new Date(s.savedAt).toLocaleString()}`:'No saved quest yet.'}
function begin(s=null){ui.show('game');game.start(s);requestAnimationFrame(()=>canvas.focus())}
qs('startBtn').onclick=()=>{localStorage.removeItem(SAVE);refresh();begin()};qs('continueBtn').onclick=()=>begin(readSave());qs('helpBtn').onclick=()=>ui.show('help');qs('backBtn').onclick=()=>ui.show('title');qs('pauseBtn').onclick=()=>game.togglePause();qs('journalBtn').onclick=()=>game.togglePause();qs('journalClose').onclick=()=>game.togglePause();qs('switchBtn').onclick=()=>game.switchDude();qs('restartBtn').onclick=()=>begin();qs('portalBtn').onclick=()=>ui.show('portal');qs('titleBtn').onclick=()=>ui.show('title');qs('saveBtn').onclick=()=>{localStorage.setItem(SAVE,JSON.stringify(game.save()));qs('saveToast').classList.add('show');setTimeout(()=>qs('saveToast').classList.remove('show'),1200);refresh()};
qs('cutsceneNext').onclick=()=>{qs('cutscene').classList.add('hidden');game.state.paused=false};qs('dialogueNext').onclick=()=>{qs('dialogueBox').classList.add('hidden');game.state.paused=false};
function resize(){canvas.width=W;canvas.height=H;let w=innerWidth,h=w/(16/9);if(h>innerHeight){h=innerHeight;w=h*(16/9)}canvas.style.width=Math.floor(w)+'px';canvas.style.height=Math.floor(h)+'px'}addEventListener('resize',resize,{passive:true});resize();refresh();setInterval(()=>{if(game.running&&!game.state.paused)localStorage.setItem(SAVE,JSON.stringify(game.save()))},30000);
