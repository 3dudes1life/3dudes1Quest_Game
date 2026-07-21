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
  console.error('3Dudes1Quest 1.0.8E:',e.error||e.message);
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
  const set=(key,v)=>{
    if(['ArrowLeft','a','A'].includes(key))k.left=v;
    if(['ArrowRight','d','D'].includes(key))k.right=v;
    if(['ArrowUp','w','W'].includes(key))k.jump=v;
    if([' ','Spacebar','x','X','f','F'].includes(key))k.power=v;
  };
  addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp',' ','Spacebar','a','A','d','D','w','W','x','X','f','F'].includes(e.key))e.preventDefault();set(e.key,true);if(e.key==='1')switcher(0);if(e.key==='2')switcher(1);if(e.key==='3')switcher(2)},{passive:false});
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
    this.cards=[650,1720,2600,3730,4630,7580].map((x,i)=>({x,y:FLOOR-100-(i%2)*95,w:38,h:52,taken:false}));
    this.beacons=[{x:3020,y:FLOOR-105,w:54,h:92,on:false},{x:4870,y:FLOOR-105,w:54,h:92,on:false},{x:6980,y:FLOOR-105,w:54,h:92,on:false}];
    this.platforms=[
      {x:1800,y:500,w:220,h:24},{x:2160,y:435,w:210,h:24},{x:2560,y:520,w:240,h:24},
      {x:3480,y:520,w:200,h:24},{x:3860,y:450,w:230,h:24},{x:4300,y:510,w:260,h:24},
      {x:5180,y:520,w:190,h:24},{x:5480,y:445,w:220,h:24},{x:5800,y:375,w:240,h:24},{x:6200,y:500,w:260,h:24},
      {x:7050,y:500,w:220,h:24},{x:7450,y:435,w:230,h:24}
    ];
    this.enemies=[1900,2840,3580,4200,5400,6120,7200,7620].map((x,i)=>({x,y:FLOOR-54,w:52,h:54,vx:i%2?1.25:-1.25,min:x-110,max:x+110,alive:true}));
    this.boss={x:8150,y:FLOOR-150,w:120,h:150,hp:10,maxHp:10,active:false,alive:true,cool:0,dir:-1};
    this.portal={x:8840,y:FLOOR-170,w:150,h:165,open:false};this.particles=[];
    this.heroShots=[];this.enemyShots=[];this.cookieBombs=[];this.shake=0;
    this.bossIntroShown=false;this.boss.phase=1;this.boss.summoned=false;
    this.zoneBanner={text:'HOME BASE',until:performance.now()+1500};
    this.bossEntranceUntil=0;
    this.ui.hud(this);
  }
  start(save){
    this.reset();
    if(save)this.applySave(save);
    this.running=true;
    this.last=performance.now();
    this.ui.flash('Space = Power • W or ↑ = Jump');
    requestAnimationFrame(t=>this.loop(t));
  }
  stop(){this.running=false}
  zone(){return ZONES.find(z=>this.player.x>=z.start&&this.player.x<z.end)||ZONES.at(-1)}
  setZone(z){
    if(z.id===this.zoneId)return;
    this.zoneId=z.id;
    this.zoneIntro=0;
    this.zoneBanner={text:z.name,until:performance.now()+1500};
    this.state.objective={title:z.objective,detail:z.detail};
    this.ui.flash(z.name);
  }
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
    this.collect();this.updateEnemies(dt);this.updateHeroShots(dt);this.updateEnemyShots(dt);
    this.updateCookieBombs(dt);this.updateBoss(dt,t);this.updateParticles(dt);
    if(this.player.inv>0)this.player.inv-=dt;if(this.shake>0)this.shake-=dt;
    this.updateObjective();this.state.triangle=clamp(this.state.triangle+.01*dt,0,100);this.ui.hud(this);
  }
  collect(){
    for(const c of this.cards){if(!c.taken&&overlap(this.player,c)){c.taken=true;this.state.cards++;this.state.triangle=clamp(this.state.triangle+12,0,100);this.burst(c.x,c.y,'#ffe66d',30);this.ui.flash(`Gay Card ${this.state.cards}/6 acquired!`);showCollect(`🌈 GAY CARD ${this.state.cards}/6`)}}
    for(const b of this.beacons){if(!b.on&&overlap(this.player,b)){b.on=true;this.state.beacons++;this.state.triangle=clamp(this.state.triangle+18,0,100);this.burst(b.x,b.y,'#3ce7d2',42);this.ui.flash(`Prism Beacon ${this.state.beacons}/3 restored!`);showAchievement(`Prism Beacon ${this.state.beacons}/3`,'🔺')}}
  }
  updateEnemies(dt){for(const e of this.enemies){if(!e.alive)continue;e.x+=e.vx*dt;if(e.x<e.min||e.x>e.max)e.vx*=-1;if(overlap(this.player,e)&&this.player.inv<=0)this.hurt(e.x)}}
  hurt(source){this.state.health--;this.player.inv=100;this.player.vx=source<this.player.x?7:-7;this.player.vy=-7;this.burst(this.player.x,this.player.y,'#ff6b8a',18);if(this.state.health<=0){this.state.health=4;const z=this.zone();this.player.x=z.start+100;this.player.y=FLOOR-this.player.h;this.camera=clamp(this.player.x-250,0,WORLD-W)}}
  power(t){
    this.player.anim='attack';this.player.animUntil=t+430;const dude=this.state.dude;
    if(dude===0){
      this.heroShots.push({x:this.player.x+(this.player.facing>0?48:-18),y:this.player.y+30,w:48,h:18,vx:this.player.facing*12,life:95,trail:[]});
      this.burst(this.player.x+22,this.player.y+32,'#ffe66d',12);this.ui.flash('Rainbow Blast!');return;
    }
    if(dude===1){
      this.player.inv=180;this.state.health=clamp(this.state.health+1,0,4);
      this.burst(this.player.x,this.player.y,'#3ce7d2',38);this.ui.flash('Positive Shield! Projectiles reflected.');return;
    }
    this.cookieBombs.push({x:this.player.x+(this.player.facing>0?48:-12),y:this.player.y+22,w:28,h:28,vx:this.player.facing*7,vy:-7,life:105});
    this.ui.flash('Cookie Bomb!');
  }

  updateHeroShots(dt){
    for(const s of this.heroShots){
      s.trail.push({x:s.x,y:s.y});if(s.trail.length>11)s.trail.shift();
      s.x+=s.vx*dt;s.life-=dt;
      for(const e of this.enemies)if(e.alive&&overlap(s,e)){
        e.alive=false;s.life=0;this.shake=8;this.burst(e.x+26,e.y+25,'#ff4fb8',44);this.ui.flash('HOA Bot rainbowed!');break;
      }
      if(this.boss.active&&this.boss.alive&&overlap(s,this.boss)){s.life=0;this.damageBoss(1,'Rainbow hit!')}
    }
    this.heroShots=this.heroShots.filter(s=>s.life>0&&s.x>-100&&s.x<WORLD+100);
  }

  updateCookieBombs(dt){
    for(const b of this.cookieBombs){
      b.x+=b.vx*dt;b.y+=b.vy*dt;b.vy+=.42*dt;b.life-=dt;
      let explode=b.y+b.h>=FLOOR;
      for(const e of this.enemies)if(e.alive&&overlap(b,e))explode=true;
      if(this.boss.active&&this.boss.alive&&overlap(b,this.boss))explode=true;
      if(explode){b.life=0;this.explodeCookie(b.x,b.y)}
    }
    this.cookieBombs=this.cookieBombs.filter(b=>b.life>0);
  }

  explodeCookie(x,y){
    this.shake=12;this.burst(x,y,'#ff9a3c',68);this.burst(x,y,'#ffe66d',32);
    for(const e of this.enemies)if(e.alive&&Math.hypot(e.x-x,e.y-y)<220){e.alive=false;this.burst(e.x,e.y,'#ff9a3c',32)}
    if(this.boss.active&&this.boss.alive&&Math.hypot(this.boss.x-x,this.boss.y-y)<280)this.damageBoss(2,'Cookie explosion!');
  }

  updateEnemyShots(dt){
    for(const s of this.enemyShots){
      s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;
      if(overlap(this.player,s)){
        if(this.state.dude===1&&this.player.inv>0){s.vx*=-1.4;s.vy*=.4;s.reflected=true;this.burst(s.x,s.y,'#3ce7d2',18)}
        else if(this.player.inv<=0){this.hurt(s.x);s.life=0}
      }
      if(s.reflected&&this.boss.active&&this.boss.alive&&overlap(s,this.boss)){s.life=0;this.damageBoss(1,'Shield reflection!')}
    }
    this.enemyShots=this.enemyShots.filter(s=>s.life>0&&s.x>-200&&s.x<WORLD+200);
  }

  damageBoss(amount,message){
    if(!this.boss.active||!this.boss.alive)return;
    this.boss.hp-=amount;this.shake=14;this.burst(this.boss.x+60,this.boss.y+65,'#ff4fb8',52);this.ui.flash(message);
    if(this.boss.hp<=7)this.boss.phase=Math.max(this.boss.phase,2);
    if(this.boss.hp<=4)this.boss.phase=Math.max(this.boss.phase,3);
    if(this.boss.hp<=0)this.defeatBoss();
  }

  updateObjective(){
    if(this.zone().id!=='la')return;
    const cards=6-this.state.cards,beacons=3-this.state.beacons;
    if(cards>0)this.state.objective={title:'Recover the Final Gay Card',detail:'The final card is glowing on the downtown LA approach.'};
    else if(beacons>0)this.state.objective={title:'Restore the Final Prism Beacon',detail:`${beacons} beacon remains before City Hall will open.`};
    else if(this.boss.alive&&!this.boss.active)this.state.objective={title:'Enter Beige City Hall',detail:'Move through the rainbow security gate to confront the Queen.'};
    else if(this.boss.active&&this.boss.alive)this.state.objective={title:`Defeat the Queen — Phase ${this.boss.phase}`,detail:'Will fires rainbow blasts. Daniel reflects fines. Caleb throws cookie bombs.'};
    else this.state.objective={title:'Enter the Lake Tahoe Portal',detail:'Southern California is restored. Adventure 2 awaits.'};
  }

  updateBoss(dt,t){
    const prereq=this.state.cards===6&&this.state.beacons===3,arenaX=7980;
    if(this.player.x>arenaX&&!prereq){
      this.player.x=arenaX-55;this.player.vx=-2;
      const cards=6-this.state.cards,beacons=3-this.state.beacons;
      this.ui.flash(`City Hall locked: ${cards} card${cards===1?'':'s'}, ${beacons} beacon${beacons===1?'':'s'} remaining.`);return;
    }
    if(this.player.x>arenaX&&prereq&&this.boss.alive){
      this.boss.active=true;
      if(!this.bossIntroShown){
        this.bossIntroShown=true;
        this.bossEntranceUntil=t+1900;
        this.zoneBanner={text:'FINAL BOSS — QUEEN OF BEIGE',until:t+1900};
        this.ui.flash('Welcome to MY neighborhood.');
        this.shake=10;
      }
    }
    if(!this.boss.active||!this.boss.alive)return;
    const phase=this.boss.phase,speed=phase===1?1.05:phase===2?1.45:1.85;
    this.boss.x+=this.boss.dir*speed*dt;if(this.boss.x<8080||this.boss.x>8500)this.boss.dir*=-1;
    this.boss.cool-=dt;
    if(this.boss.cool<=0){
      this.boss.cool=phase===1?85:phase===2?58:42;
      if(phase===1)this.enemyShots.push({x:this.boss.x,y:this.boss.y+55,w:42,h:24,vx:-6.5,vy:0,life:190,type:'fine',label:['$250','$500','$900'][Math.floor(Math.random()*3)]});
      else if(phase===2)for(const vy of [-2.4,0,2.4])this.enemyShots.push({x:this.boss.x,y:this.boss.y+55,w:34,h:20,vx:-7.2,vy,life:190,type:'beige'});
      else{
        this.enemyShots.push({x:this.boss.x,y:this.boss.y+45,w:52,h:22,vx:-8,vy:-1.3,life:200,type:'fine',label:'VIOLATION'});
        this.enemyShots.push({x:this.boss.x,y:this.boss.y+90,w:44,h:22,vx:-8,vy:1.3,life:200,type:'fine',label:'FINE'});
        if(!this.boss.summoned){
          this.boss.summoned=true;
          this.enemies.push({x:7950,y:FLOOR-54,w:52,h:54,vx:1.4,min:7880,max:8100,alive:true},{x:8580,y:FLOOR-54,w:52,h:54,vx:-1.4,min:8500,max:8720,alive:true});
          this.ui.flash('Phase 3: HOA reinforcements!');
        }
      }
    }
    if(overlap(this.player,this.boss)&&this.player.inv<=0)this.hurt(this.boss.x);
  }

  defeatBoss(){this.boss.alive=false;this.boss.active=false;this.state.bossDefeated=true;this.portal.open=true;this.shake=22;this.state.objective={title:'Enter the Lake Tahoe Portal',detail:'Southern California is restored. The next villain awaits in Adventure 2.'};this.burst(this.boss.x+60,this.boss.y+70,'#ffe66d',100);showAchievement('Queen of Beige Defeated','👑');this.ui.flash('The Queen of Beige has been defeated!')}
  checkPortal(){if(this.portal.open&&overlap(this.player,this.portal)&&!this.finished){this.finished=true;this.running=false;setTimeout(()=>this.onComplete(this.state),350)}}
  draw(t){const c=this.ctx;c.clearRect(0,0,W,H);c.save();if(this.shake>0)c.translate((Math.random()-.5)*this.shake,(Math.random()-.5)*this.shake);this.drawSky(t);c.save();c.translate(-this.camera,0);this.drawWorld(t);this.drawCollectibles(t);this.drawEnemies(t);this.drawHeroShots(t);this.drawCookieBombs(t);this.drawEnemyShots(t);this.drawBoss(t);this.drawPortal(t);this.drawRigsby(t);this.drawPlayer(t);this.drawParticles();c.restore();c.restore();this.drawVignette();this.drawZoneBanner(t);if(this.state.paused){c.fillStyle='rgba(5,4,18,.78)';c.fillRect(0,0,W,H);this.text('PAUSED',W/2,H/2,62,'#fff','center')}this.checkPortal()}
  drawSky(t){const c=this.ctx,z=this.zone();const palettes={home:['#5b398d','#ff6e9f','#ffc476'],hillcrest:['#321761','#d93e92','#ffad69'],pch:['#086b9b','#4acbd3','#ffd08b'],hollywood:['#21143e','#7f3f9d','#ffb45e'],la:['#160f31','#4a205c','#e75f78']};const p=palettes[z.id],g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,p[0]);g.addColorStop(.58,p[1]);g.addColorStop(1,p[2]);c.fillStyle=g;c.fillRect(0,0,W,H);c.fillStyle='rgba(255,244,190,.72)';c.beginPath();c.arc(1080,135,58,0,Math.PI*2);c.fill();for(let i=0;i<4;i++){const x=((i*390+t*.012)-this.camera*.05)%1600-150;c.fillStyle='rgba(255,255,255,.36)';c.beginPath();c.ellipse(x,170+i*35,90,24,0,0,Math.PI*2);c.fill()}}
  drawWorld(t){for(const z of ZONES)this.drawZone(z,t);this.drawGround();for(const p of this.platforms){this.ctx.fillStyle=p.x<3300?'#71405f':p.x<5000?'#3c8890':p.x<6600?'#8b5b9d':'#4a3c6d';this.ctx.beginPath();this.ctx.roundRect(p.x,p.y,p.w,p.h,10);this.ctx.fill();this.ctx.fillStyle='rgba(255,255,255,.22)';this.ctx.fillRect(p.x+12,p.y+4,p.w-24,4)}}
  drawGround(){const c=this.ctx;for(const z of ZONES){const colors={home:['#a6603f','#61393a'],hillcrest:['#5d365f','#2f2444'],pch:['#b88959','#5f6d5e'],hollywood:['#76506c','#34283e'],la:['#4a405d','#211d32']}[z.id];const g=c.createLinearGradient(0,FLOOR,0,H);g.addColorStop(0,colors[0]);g.addColorStop(1,colors[1]);c.fillStyle=g;c.fillRect(z.start,FLOOR,z.end-z.start,100);c.strokeStyle='rgba(255,255,255,.12)';for(let x=z.start;x<z.end;x+=110){c.beginPath();c.moveTo(x,FLOOR);c.lineTo(x+55,H);c.stroke()}}}
  drawZone(z,t){const c=this.ctx;if(z.id==='home'){const im=this.images.home;if(im?.complete&&im.naturalWidth)c.drawImage(im,0,0,1450,720);else this.house(150)}else if(z.id==='hillcrest'){for(let x=z.start+80;x<z.end;x+=280)this.storefront(x,430,(x/280)%2?'#ff4fb8':'#3ce7d2');this.rainbowCrosswalk(2050)}else if(z.id==='pch'){c.fillStyle='#1aa8c7';c.fillRect(z.start,405,z.end-z.start,215);for(let x=z.start;x<z.end;x+=170){c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=5;c.beginPath();c.arc(x,470+Math.sin(t*.002+x)*18,90,3.5,5.9);c.stroke()}for(let x=z.start+180;x<z.end;x+=430)this.palm(x,520)}else if(z.id==='hollywood'){for(let x=z.start+100;x<z.end;x+=260){c.fillStyle=x%520?'#3b284d':'#53335e';c.fillRect(x,340,190,280);c.fillStyle='#ffe66d';for(let y=380;y<570;y+=45){c.fillRect(x+25,y,28,16);c.fillRect(x+100,y,28,16)}}this.text('HOLLYWOOD',5580,290,42,'rgba(255,255,255,.8)','center')}else{this.drawLosAngeles(t,z)}}
  drawLosAngeles(t,z){
    const c=this.ctx;
    const skyline=[[6660,265,165,355],[6840,330,120,290],[6990,205,175,415],[7185,300,130,320],[7340,155,190,465],[7550,285,145,335],[7720,225,150,395],[8720,280,180,340],[8910,190,180,430]];
    for(const [x,y,w,h] of skyline){
      const g=c.createLinearGradient(x,y,x,y+h);g.addColorStop(0,'#30244e');g.addColorStop(1,'#15152e');c.fillStyle=g;c.fillRect(x,y,w,h);
      c.fillStyle='rgba(255,218,111,.60)';for(let wy=y+28;wy<y+h-25;wy+=38)for(let wx=x+22;wx<x+w-18;wx+=42)if((wx+wy)%3)c.fillRect(wx,wy,18,11);
    }
    c.fillStyle='#231c3e';c.fillRect(7340,112,190,55);c.beginPath();c.moveTo(7365,112);c.lineTo(7435,72);c.lineTo(7505,112);c.fill();
    c.fillStyle='#d9d4ca';c.fillRect(7970,285,185,335);c.fillStyle='#eee8dc';c.beginPath();c.moveTo(7995,285);c.lineTo(8062,205);c.lineTo(8130,285);c.fill();c.fillStyle='#887a70';c.fillRect(8022,330,82,290);
    c.fillStyle='#26243c';c.fillRect(6600,565,2600,55);c.fillStyle='#494765';c.fillRect(6600,590,2600,30);c.strokeStyle='rgba(255,255,255,.48)';c.lineWidth=5;c.setLineDash([55,35]);c.beginPath();c.moveTo(6600,604);c.lineTo(9200,604);c.stroke();c.setLineDash([]);
    const cars=['#ff4f72','#3ce7d2','#ffe66d','#8d5cff','#f7f7f7'];for(let i=0;i<9;i++){const x=6600+((i*390+t*(.12+i*.018))%2550),y=572+(i%2)*25;c.fillStyle=cars[i%cars.length];c.beginPath();c.roundRect(x,y,78,24,8);c.fill();c.fillStyle='rgba(255,255,255,.75)';c.fillRect(x+55,y+6,15,6)}
    for(let x=6720;x<7900;x+=310)this.palm(x,520);
    c.fillStyle='#16132b';c.beginPath();c.roundRect(6810,360,300,95,14);c.fill();const rainbow=['#ff4b4b','#ff9f43','#ffe66d','#49d17d','#45a3ff','#a55cff'];rainbow.forEach((co,i)=>{c.fillStyle=co;c.fillRect(6830,378+i*9,260,9)});this.text('LOS ANGELES',6960,440,18,'#fff','center');
    c.fillStyle='#f7f4ef';c.beginPath();c.roundRect(7440,330,270,100,12);c.fill();this.text('LA BLADE',7575,370,28,'#251c38','center');this.text('PRIDE LIVES HERE',7575,405,12,'#ff4fb8','center');
    c.fillStyle='rgba(18,13,35,.90)';c.beginPath();c.roundRect(7830,410,145,210,18);c.fill();rainbow.forEach((co,i)=>{c.fillStyle=co;c.fillRect(7850+i*18,438,14,142)});this.text(this.state.cards===6&&this.state.beacons===3?'CITY HALL OPEN':'RESTORE COLOR',7902,600,12,'#fff','center');
    const arena=c.createLinearGradient(7980,300,8700,620);arena.addColorStop(0,'#e8dfd1');arena.addColorStop(1,'#b8aa9a');c.fillStyle=arena;c.beginPath();c.roundRect(8000,300,700,320,24);c.fill();
    c.fillStyle='#f3eadc';c.beginPath();c.moveTo(8000,300);c.lineTo(8350,165);c.lineTo(8700,300);c.fill();c.fillStyle='#ded4c5';c.fillRect(8180,250,340,60);this.text('LOS ANGELES CITY HALL',8350,278,29,'#514644','center');
    for(let x=8060;x<=8620;x+=112){c.fillStyle='#f2ebe0';c.fillRect(x,330,44,250);c.fillStyle='#cabdad';c.fillRect(x-8,320,60,18);c.fillRect(x-8,575,60,18)}
  }

  drawHeroShots(t){
    const c=this.ctx;for(const s of this.heroShots){for(let i=0;i<s.trail.length;i++){const p=s.trail[i];c.globalAlpha=(i+1)/s.trail.length*.38;c.fillStyle=['#ff4fb8','#ffe66d','#3ce7d2','#8d5cff'][i%4];c.beginPath();c.arc(p.x,p.y+9,4+i*.35,0,Math.PI*2);c.fill()}c.globalAlpha=1;const g=c.createLinearGradient(s.x,s.y,s.x+s.w,s.y);g.addColorStop(0,'#ff4fb8');g.addColorStop(.34,'#ffe66d');g.addColorStop(.67,'#3ce7d2');g.addColorStop(1,'#8d5cff');c.shadowColor='#ff4fb8';c.shadowBlur=20;c.fillStyle=g;c.beginPath();c.roundRect(s.x,s.y,s.w,s.h,9);c.fill();c.shadowBlur=0}c.globalAlpha=1;
  }
  drawCookieBombs(t){const c=this.ctx;for(const b of this.cookieBombs){c.save();c.translate(b.x+14,b.y+14);c.rotate(t*.01+b.x);c.fillStyle='#b76a35';c.beginPath();c.arc(0,0,14,0,Math.PI*2);c.fill();c.fillStyle='#4b291e';for(const [x,y] of [[-5,-4],[5,-5],[-2,5],[7,4]]){c.beginPath();c.arc(x,y,2.4,0,Math.PI*2);c.fill()}c.restore()}}
  drawEnemyShots(t){const c=this.ctx;for(const s of this.enemyShots){c.save();c.shadowColor=s.reflected?'#3ce7d2':'#c7b7a2';c.shadowBlur=14;c.fillStyle=s.reflected?'#3ce7d2':'#d5c6b1';c.beginPath();c.roundRect(s.x,s.y,s.w,s.h,7);c.fill();if(s.type==='fine')this.text(s.label||'FINE',s.x+s.w/2,s.y+s.h/2,9,'#554843','center');c.restore()}}
  house(x){const c=this.ctx;c.fillStyle='#fff1dc';c.fillRect(x+90,330,560,290);c.fillStyle='#37263f';c.beginPath();c.moveTo(x,340);c.lineTo(x+370,120);c.lineTo(x+740,340);c.fill();c.fillStyle='#573344';c.fillRect(x+170,420,140,200);c.fillStyle='#54cbe0';c.fillRect(x+400,420,180,110)}
  storefront(x,y,color){const c=this.ctx;c.fillStyle='#302443';c.fillRect(x,y,220,FLOOR-y);c.fillStyle=color;c.fillRect(x,y,220,24);c.fillStyle='#75dbe3';c.fillRect(x+25,y+55,70,80);c.fillRect(x+120,y+55,70,80);c.fillStyle='#fff';c.font='900 15px system-ui';c.fillText(x%560?'CAFÉ':'PRIDE',x+65,y+190)}
  rainbowCrosswalk(x){const colors=['#ff4b4b','#ff9f43','#ffe66d','#49d17d','#45a3ff','#a55cff'];colors.forEach((co,i)=>{this.ctx.fillStyle=co;this.ctx.fillRect(x+i*45,FLOOR-18,38,18)})}
  palm(x,y){const c=this.ctx;c.strokeStyle='#70513f';c.lineWidth=13;c.beginPath();c.moveTo(x,y+100);c.quadraticCurveTo(x-10,y+20,x,y-70);c.stroke();c.fillStyle='#20734f';for(let i=0;i<7;i++){c.save();c.translate(x,y-70);c.rotate(i*Math.PI/3.5);c.beginPath();c.ellipse(0,-48,12,58,0,0,Math.PI*2);c.fill();c.restore()}}
  drawCollectibles(t){for(const c of this.cards){if(c.taken)continue;const y=c.y+Math.sin(t*.004+c.x)*7;this.ctx.save();this.ctx.shadowColor='#ffe66d';this.ctx.shadowBlur=20;this.ctx.fillStyle='#171128';this.ctx.beginPath();this.ctx.roundRect(c.x,y,c.w,c.h,7);this.ctx.fill();['#ff4b4b','#ff9f43','#ffe66d','#49d17d','#45a3ff','#a55cff'].forEach((co,i)=>{this.ctx.fillStyle=co;this.ctx.fillRect(c.x+7,y+8+i*5,c.w-14,5)});this.ctx.restore()}for(const b of this.beacons){const pulse=.8+.18*Math.sin(t*.006+b.x);this.ctx.save();this.ctx.translate(b.x+27,b.y+46);this.ctx.shadowColor=b.on?'#3ce7d2':'#7d708a';this.ctx.shadowBlur=b.on?35:10;this.ctx.fillStyle=b.on?'#3ce7d2':'#665a78';this.ctx.beginPath();this.ctx.moveTo(0,-45);this.ctx.lineTo(25,0);this.ctx.lineTo(0,45);this.ctx.lineTo(-25,0);this.ctx.closePath();this.ctx.fill();if(b.on){this.ctx.globalAlpha=.25;this.ctx.scale(1.5*pulse,1.5*pulse);this.ctx.fill()}this.ctx.restore()}}
  drawEnemies(t){for(const e of this.enemies){if(!e.alive)continue;const c=this.ctx;c.fillStyle='rgba(0,0,0,.2)';c.beginPath();c.ellipse(e.x+26,FLOOR-2,30,8,0,0,Math.PI*2);c.fill();c.fillStyle='#b9aa98';c.beginPath();c.roundRect(e.x,e.y,e.w,e.h,10);c.fill();this.text('HOA',e.x+26,e.y+38,11,'#655b54','center');c.fillStyle='#fff';c.fillRect(e.x+8,e.y+14,10,8);c.fillRect(e.x+34,e.y+14,10,8)}}
  drawBoss(t){
    if(!this.boss.alive)return;
    const c=this.ctx,b=this.boss,phase=this.boss.phase;
    const entrance=this.bossEntranceUntil>t;
    const entranceProgress=entrance?clamp(1-(this.bossEntranceUntil-t)/1900,0,1):1;
    const strut=Math.sin(t*.012)*3;
    const drawY=b.y+(1-entranceProgress)*95;

    c.save();
    c.translate(b.x,drawY);
    c.globalAlpha=entrance?clamp(entranceProgress*1.8,0,1):1;

    const aura=phase===1?'#d8c3a6':phase===2?'#ff4fb8':'#ffe66d';
    c.shadowColor=this.boss.active?aura:'transparent';
    c.shadowBlur=this.boss.active?44:0;

    // Dramatic violation-notice cape.
    c.fillStyle=phase===1?'#9d8b79':phase===2?'#8d5cff':'#ff4fb8';
    c.beginPath();
    c.moveTo(27,62);
    c.quadraticCurveTo(-28,105,-12,153);
    c.lineTo(132,153);
    c.quadraticCurveTo(148,105,94,62);
    c.closePath();
    c.fill();

    // Paper notices pinned to the cape.
    c.fillStyle='rgba(248,238,218,.86)';
    for(const [x,y,r] of [[5,93,-.12],[27,122,.06],[92,96,.11],[106,129,-.05]]){
      c.save();c.translate(x,y);c.rotate(r);c.fillRect(-11,-8,22,16);c.restore();
    }

    // Stiletto legs and shoes.
    c.strokeStyle='#c8b49e';
    c.lineWidth=11;
    c.beginPath();
    c.moveTo(44,126);c.lineTo(38+strut,164);
    c.moveTo(78,126);c.lineTo(84-strut,164);
    c.stroke();

    c.fillStyle=phase===3?'#ff284f':'#6b4b55';
    c.beginPath();c.roundRect(17+strut,157,34,11,5);c.fill();
    c.beginPath();c.roundRect(73-strut,157,34,11,5);c.fill();
    c.fillRect(45+strut,162,5,15);
    c.fillRect(101-strut,162,5,15);

    // Beige power suit with shoulder pads.
    const suit=c.createLinearGradient(18,46,104,133);
    suit.addColorStop(0,'#efe1cc');
    suit.addColorStop(.52,'#cbb79e');
    suit.addColorStop(1,'#9f8d79');
    c.fillStyle=suit;
    c.beginPath();
    c.moveTo(22,54);
    c.lineTo(5,69);
    c.lineTo(23,85);
    c.lineTo(30,132);
    c.lineTo(94,132);
    c.lineTo(101,85);
    c.lineTo(119,69);
    c.lineTo(101,54);
    c.lineTo(82,48);
    c.lineTo(42,48);
    c.closePath();
    c.fill();

    // Oversized shoulder pads.
    c.fillStyle='#eadac4';
    c.beginPath();c.ellipse(17,64,28,18,-.25,0,Math.PI*2);c.fill();
    c.beginPath();c.ellipse(107,64,28,18,.25,0,Math.PI*2);c.fill();

    // Suit lapels and belt.
    c.fillStyle='#7c6861';
    c.beginPath();c.moveTo(43,50);c.lineTo(61,82);c.lineTo(33,72);c.fill();
    c.beginPath();c.moveTo(81,50);c.lineTo(63,82);c.lineTo(91,72);c.fill();
    c.fillRect(29,105,67,10);

    // Rhinestone HOA badge.
    c.shadowColor='#ffe66d';c.shadowBlur=15;
    c.fillStyle='#ffe66d';
    c.beginPath();c.arc(83,76,13,0,Math.PI*2);c.fill();
    c.shadowBlur=0;
    c.fillStyle='#4a3d42';
    c.font='900 7px system-ui';
    c.textAlign='center';c.textBaseline='middle';
    c.fillText('HOA',83,76);

    // Neck and face.
    c.fillStyle='#b97959';c.fillRect(52,32,20,22);
    c.fillStyle='#c98767';
    c.beginPath();c.ellipse(62,28,29,31,0,0,Math.PI*2);c.fill();

    // Huge platinum drag wig.
    c.fillStyle='#f7efe6';
    const wigBumps=[[-25,-1,19],[-18,-19,21],[-2,-31,22],[18,-26,22],[28,-8,21],[20,7,18],[-18,9,18]];
    for(const [x,y,r] of wigBumps){c.beginPath();c.arc(62+x,22+y,r,0,Math.PI*2);c.fill();}
    c.fillStyle='#d7c8bd';
    c.beginPath();c.ellipse(62,4,29,12,0,0,Math.PI*2);c.fill();

    // Cat-eye sunglasses.
    c.fillStyle='#1d1730';
    c.beginPath();
    c.moveTo(35,20);c.lineTo(56,17);c.lineTo(53,31);c.lineTo(37,30);c.closePath();c.fill();
    c.beginPath();
    c.moveTo(68,17);c.lineTo(90,20);c.lineTo(87,30);c.lineTo(71,31);c.closePath();c.fill();
    c.fillRect(54,21,17,4);
    c.fillStyle=phase===3?'#ff284f':'#3ce7d2';
    c.fillRect(40,22,10,3);c.fillRect(75,22,10,3);

    // Lip and beauty mark.
    c.fillStyle='#b71958';
    c.beginPath();c.ellipse(62,40,11,4,0,0,Math.PI*2);c.fill();
    c.fillStyle='#4f3333';
    c.beginPath();c.arc(82,39,2,0,Math.PI*2);c.fill();

    // Clipboard of violations.
    c.save();
    c.translate(110,88);
    c.rotate(-.13);
    c.fillStyle='#6a4e42';c.beginPath();c.roundRect(-6,-18,39,55,5);c.fill();
    c.fillStyle='#f4eadb';c.fillRect(-2,-12,31,44);
    c.fillStyle='#ff4fb8';c.fillRect(5,-17,17,8);
    c.fillStyle='#766a64';
    for(let y=-4;y<26;y+=8)c.fillRect(3,y,22,2);
    c.restore();

    // Boss label.
    c.shadowColor='transparent';
    c.fillStyle='rgba(20,12,32,.76)';
    c.beginPath();c.roundRect(20,181,84,36,12);c.fill();
    this.text('QUEEN OF BEIGE',62,194,11,'#fff','center');
    this.text(`PHASE ${phase}`,62,208,9,aura,'center');

    c.restore();
  }
  drawPortal(t){const p=this.portal,c=this.ctx;c.save();c.translate(p.x+75,p.y+82);const pulse=1+Math.sin(t*.004)*.04;c.scale(pulse,pulse);c.strokeStyle=p.open?'#ff4fb8':'#625b6d';c.lineWidth=16;c.shadowColor=p.open?'#3ce7d2':'transparent';c.shadowBlur=p.open?42:0;c.beginPath();c.arc(0,0,68,0,Math.PI*2);c.stroke();c.strokeStyle=p.open?'#3ce7d2':'#48424f';c.lineWidth=9;c.beginPath();c.arc(0,0,45,0,Math.PI*2);c.stroke();c.fillStyle=p.open?'rgba(142,92,255,.34)':'rgba(30,28,35,.7)';c.beginPath();c.arc(0,0,37,0,Math.PI*2);c.fill();c.restore();this.text(p.open?'LAKE TAHOE':'LOCKED',p.x+75,p.y-14,18,p.open?'#fff':'#aaa','center')}
  drawRigsby(t){if(this.player.x>7900)return;const moving=Math.abs(this.rigsby.x-(this.player.x+125))>8;const im=this.images[`rigsby_${moving?'walk':'idle'}`];if(!this.sprite(im,this.rigsby.x-10,this.rigsby.y-28,Math.floor(t/(moving?90:150)),128,96,78,58,false)){this.ctx.fillStyle='#fff';this.ctx.beginPath();this.ctx.ellipse(this.rigsby.x+25,this.rigsby.y+20,28,17,0,0,Math.PI*2);this.ctx.fill();this.ctx.fillStyle='#85593c';this.ctx.beginPath();this.ctx.arc(this.rigsby.x+44,this.rigsby.y+10,13,0,Math.PI*2);this.ctx.fill()}}
  drawPlayer(t){const names=['will','daniel','caleb'],n=names[this.state.dude];let a='idle',frames=6,speed=150;if(this.player.animUntil>t)a=this.player.anim;else if(!this.player.onGround){a='jump';frames=4}else if(Math.abs(this.player.vx)>.35){a='walk';frames=8;speed=82}const im=this.images[`${n}_${a}`],alpha=this.player.inv>0&&Math.floor(this.player.inv/5)%2===0?.35:1;this.ctx.save();this.ctx.globalAlpha=alpha;this.ctx.fillStyle='rgba(0,0,0,.22)';this.ctx.beginPath();this.ctx.ellipse(this.player.x+22,FLOOR-2,31,8,0,0,Math.PI*2);this.ctx.fill();if(!this.sprite(im,this.player.x-20,this.player.y-50,Math.floor(t/speed)%frames,128,192,84,126,this.player.facing<0))this.fallbackHero();this.ctx.restore()}
  sprite(im,x,y,frame,fw,fh,w,h,flip){if(!im||!im.complete||!im.naturalWidth)return false;const count=Math.max(1,Math.floor(im.naturalWidth/fw));frame%=count;this.ctx.save();this.ctx.translate(x+(flip?w:0),y);this.ctx.scale(flip?-1:1,1);this.ctx.drawImage(im,frame*fw,0,fw,Math.min(fh,im.naturalHeight),0,0,w,h);this.ctx.restore();return true}
  fallbackHero(){const c=this.ctx,p=this.player,d=DUDES[this.state.dude];c.fillStyle='#b87855';c.beginPath();c.arc(p.x+22,p.y+15,15,0,Math.PI*2);c.fill();c.fillStyle=d.color;c.beginPath();c.roundRect(p.x+5,p.y+28,34,38,9);c.fill();c.fillStyle=d.accent;c.fillRect(p.x+18,p.y+31,7,30);c.fillStyle='#211a34';c.fillRect(p.x+8,p.y+63,11,17);c.fillRect(p.x+26,p.y+63,11,17)}
  burst(x,y,color,n){for(let i=0;i<n;i++)this.particles.push({x,y,vx:(Math.random()-.5)*8,vy:(Math.random()-.8)*8,life:40+Math.random()*55,color,s:2+Math.random()*5})}
  updateParticles(dt){for(const p of this.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=.18*dt;p.life-=dt}this.particles=this.particles.filter(p=>p.life>0)}
  drawParticles(){for(const p of this.particles){this.ctx.globalAlpha=clamp(p.life/50,0,1);this.ctx.fillStyle=p.color;this.ctx.beginPath();this.ctx.arc(p.x,p.y,p.s,0,Math.PI*2);this.ctx.fill()}this.ctx.globalAlpha=1}
  drawVignette(){const g=this.ctx.createRadialGradient(W/2,H*.45,260,W/2,H*.5,820);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(5,3,18,.25)');this.ctx.fillStyle=g;this.ctx.fillRect(0,0,W,H)}
  drawZoneBanner(t){
    if(!this.zoneBanner||t>this.zoneBanner.until)return;
    const c=this.ctx;
    const remaining=this.zoneBanner.until-t;
    const total=1500;
    const elapsed=total-remaining;
    let alpha=1;
    if(elapsed<230)alpha=elapsed/230;
    if(remaining<320)alpha=remaining/320;

    const slide=elapsed<260 ? -70+(elapsed/260)*70 : 0;
    c.save();
    c.globalAlpha=clamp(alpha,0,1);
    c.translate(slide,0);

    const width=Math.min(560,180+this.zoneBanner.text.length*17);
    const x=42,y=274;

    const g=c.createLinearGradient(x,y,x+width,y);
    g.addColorStop(0,'rgba(15,10,35,.93)');
    g.addColorStop(.72,'rgba(35,20,58,.83)');
    g.addColorStop(1,'rgba(35,20,58,0)');
    c.fillStyle=g;
    c.beginPath();
    c.roundRect(x,y,width,72,16);
    c.fill();

    c.fillStyle='#3ce7d2';
    c.fillRect(x+14,y+14,4,44);

    c.fillStyle='rgba(255,255,255,.62)';
    c.font='800 11px system-ui,-apple-system,sans-serif';
    c.textAlign='left';
    c.textBaseline='middle';
    c.fillText(this.zoneBanner.text.includes('FINAL BOSS')?'ADVENTURE 1 FINALE':'NOW ENTERING',x+34,y+23);

    c.fillStyle='#fff';
    c.font=`950 ${this.zoneBanner.text.includes('FINAL BOSS')?25:29}px system-ui,-apple-system,sans-serif`;
    c.fillText(this.zoneBanner.text,x+34,y+49);

    c.restore();
  }

  drawZoneTitle(t){const remain=this.zoneIntro-t,a=clamp(remain/380,0,1);this.ctx.save();this.ctx.globalAlpha=a;this.ctx.fillStyle='rgba(8,5,22,.76)';this.ctx.beginPath();this.ctx.roundRect(390,38,500,112,22);this.ctx.fill();this.text('ADVENTURE 1',640,78,15,'#3ce7d2','center');this.text(this.zone().name,640,121,39,'#fff','center');this.ctx.restore()}
  text(s,x,y,size,color,align='left'){this.ctx.font=`900 ${size}px system-ui,-apple-system,sans-serif`;this.ctx.textAlign=align;this.ctx.textBaseline='middle';this.ctx.fillStyle=color;this.ctx.fillText(s,x,y)}
  togglePause(){this.state.paused=!this.state.paused;this.ui.flash(this.state.paused?'Quest paused.':'Back to the quest.')}
  switchDude(i=null){this.state.dude=i===null?(this.state.dude+1)%3:i;this.ui.flash(`${DUDES[this.state.dude].name}: ${DUDES[this.state.dude].power}`)}
  save(){return {version:'1.0.8E',player:{x:this.player.x,y:this.player.y},state:this.state,cards:this.cards.map(c=>c.taken),beacons:this.beacons.map(b=>b.on),enemies:this.enemies.map(e=>e.alive),boss:{hp:this.boss.hp,alive:this.boss.alive,phase:this.boss.phase},savedAt:new Date().toISOString()}}
  applySave(s){if(!s)return;this.player.x=clamp(s.player?.x||150,0,WORLD-50);this.player.y=s.player?.y||FLOOR-72;Object.assign(this.state,s.state||{},{paused:false});s.cards?.forEach((v,i)=>this.cards[i].taken=v);s.beacons?.forEach((v,i)=>this.beacons[i].on=v);s.enemies?.forEach((v,i)=>this.enemies[i].alive=v);if(s.boss){this.boss.hp=s.boss.hp;this.boss.alive=s.boss.alive;this.boss.phase=s.boss.phase||1;this.state.bossDefeated=!s.boss.alive;this.portal.open=!s.boss.alive}this.camera=clamp(this.player.x-350,0,WORLD-W)}
}

function showBossIntro(){
  const game=window.__questGame;
  if(game)game.zoneBanner={text:'FINAL BOSS — QUEEN OF BEIGE',until:performance.now()+1900};
}
function showScene(title){
  const game=window.__questGame;
  if(game)game.zoneBanner={text:title,until:performance.now()+1500};
}
function showAchievement(title,icon='🏆'){const stack=qs('achievementStack');const card=document.createElement('div');card.className='achievementCard';card.innerHTML=`<div class="achievementIcon">${icon}</div><div><div class="achievementLabel">ACHIEVEMENT UNLOCKED</div><div class="achievementTitle">${title}</div></div>`;stack.appendChild(card);setTimeout(()=>card.remove(),4700)}
function showCollect(text){const t=qs('collectibleToast');t.textContent=text;t.classList.add('isVisible');clearTimeout(showCollect.t);showCollect.t=setTimeout(()=>t.classList.remove('isVisible'),2100)}
window.showAchievement=showAchievement;window.showCollectible=showCollect;

const canvas=qs('gameCanvas');canvas.width=W;canvas.height=H;const ui=createUI();let game;const input=createInput(i=>game?.switchDude(i));game=new Adventure(canvas,ui,input,state=>{ui.refs.completeStats.textContent=`All ${state.cards}/6 Gay Cards recovered, ${state.beacons}/3 Prism Beacons restored, and the Queen of Beige defeated.`;ui.show('complete')});window.__questGame=game;
const SAVE='3dudes1quest-save-108e';
function readSave(){try{return JSON.parse(localStorage.getItem(SAVE)||'null')}catch{return null}}
function refresh(){const s=readSave();qs('continueBtn').classList.toggle('hidden',!s);qs('saveStatus').textContent=s?`Adventure saved • ${new Date(s.savedAt).toLocaleString()}`:'No saved quest yet.'}
function begin(s=null){ui.show('game');game.start(s);requestAnimationFrame(()=>canvas.focus())}
qs('startBtn').onclick=()=>{localStorage.removeItem(SAVE);refresh();begin()};qs('continueBtn').onclick=()=>begin(readSave());qs('helpBtn').onclick=()=>ui.show('help');qs('backBtn').onclick=()=>ui.show('title');qs('pauseBtn').onclick=()=>game.togglePause();qs('journalBtn').onclick=()=>game.togglePause();qs('journalClose').onclick=()=>game.togglePause();qs('switchBtn').onclick=()=>game.switchDude();qs('restartBtn').onclick=()=>begin();qs('portalBtn').onclick=()=>ui.show('portal');qs('titleBtn').onclick=()=>ui.show('title');qs('saveBtn').onclick=()=>{localStorage.setItem(SAVE,JSON.stringify(game.save()));qs('saveToast').classList.add('show');setTimeout(()=>qs('saveToast').classList.remove('show'),1200);refresh()};
qs('cutsceneNext').onclick=()=>{qs('cutscene').classList.add('hidden');game.state.paused=false};qs('dialogueNext').onclick=()=>{qs('dialogueBox').classList.add('hidden');game.state.paused=false};
function resize(){canvas.width=W;canvas.height=H;let w=innerWidth,h=w/(16/9);if(h>innerHeight){h=innerHeight;w=h*(16/9)}canvas.style.width=Math.floor(w)+'px';canvas.style.height=Math.floor(h)+'px'}addEventListener('resize',resize,{passive:true});resize();refresh();setInterval(()=>{if(game.running&&!game.state.paused)localStorage.setItem(SAVE,JSON.stringify(game.save()))},30000);
