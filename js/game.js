import {CONFIG,DUDES} from './config.js';
import {SOCAL_LEVEL} from './level.js';

export class Game{
  constructor(canvas,ui,input,onComplete){
    this.canvas=canvas;
    this.ctx=canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled=false;
    this.ui=ui;
    this.input=input;
    this.onComplete=onComplete;
    this.last=0;
    this.running=false;
    this.reset();
  }

  reset(){
    this.state={
      paused:false,health:4,cards:0,beacons:0,dude:0,
      projectiles:[],traps:[],particles:[],shieldUntil:0,magicReady:0,
      bossActive:false,bossDefeated:false,triangle:0,rigsby:true,storyFlags:{}
    };
    this.player={x:90,y:520,w:44,h:72,vx:0,vy:0,onGround:false,facing:1,invuln:0,checkpoint:90};
    this.cards=SOCAL_LEVEL.cards.map((p,i)=>({...p,id:i,collected:false}));
    this.beacons=SOCAL_LEVEL.beacons.map((p,i)=>({...p,id:i,active:false}));
    this.enemies=SOCAL_LEVEL.enemies.map((e,i)=>({...e,id:i,w:46,h:46,vx:i%2?1.15:-1.15,alive:true,frozen:0}));
    this.boss={...SOCAL_LEVEL.boss,maxHp:SOCAL_LEVEL.boss.hp,vx:-1.2,alive:true,frozen:0};
    this.cameraX=0;
    this.rigsby={x:35,y:565,w:38,h:30,vx:0};
    this.jumpLatch=false;
    this.powerLatch=false;
  }

  start(){
    this.reset();
    this.running=true;
    this.ui.flash('Adventure 1: Southern California');
    requestAnimationFrame(t=>this.loop(t));
  }

  stop(){this.running=false}
  togglePause(){this.state.paused=!this.state.paused;this.ui.flash(this.state.paused?'Quest paused. Hydrate, queen.':'Back to fabulous business.')}
  switchDude(index=null){
    this.state.dude=index===null?(this.state.dude+1)%3:index;
    this.ui.flash(DUDES[this.state.dude].line);
  }

  loop(t){
    if(!this.running)return;
    const dt=Math.min(2,(t-this.last)/16.67||1);this.last=t;
    if(!this.state.paused)this.update(dt,t);
    this.draw(t);
    requestAnimationFrame(n=>this.loop(n));
  }

  update(dt,t){
    const d=DUDES[this.state.dude];
    if(this.input.left){this.player.vx-=.8*dt;this.player.facing=-1}
    if(this.input.right){this.player.vx+=.8*dt;this.player.facing=1}
    if(!this.input.left&&!this.input.right)this.player.vx*=.78;
    this.player.vx=Math.max(-d.speed,Math.min(d.speed,this.player.vx));

    if(this.input.jump&&!this.jumpLatch&&this.player.onGround){
      this.player.vy=-d.jump;this.player.onGround=false;
      this.burst(this.player.x+22,this.player.y+70,d.color,8);
    }
    this.jumpLatch=this.input.jump;

    if(this.input.power&&!this.powerLatch)this.usePower(t);
    this.powerLatch=this.input.power;

    this.player.vy+=CONFIG.gravity*dt;
    this.player.x+=this.player.vx*dt;
    this.player.y+=this.player.vy*dt;
    this.player.onGround=false;

    for(const p of SOCAL_LEVEL.platforms){
      if(this.player.x+this.player.w>p.x&&this.player.x<p.x+p.w&&
         this.player.y+this.player.h>=p.y&&this.player.y+this.player.h<=p.y+26&&
         this.player.vy>=0){
        this.player.y=p.y-this.player.h;this.player.vy=0;this.player.onGround=true;
      }
    }

    if(this.player.y>760)this.hurt('That was homophobic.');
    this.player.x=Math.max(0,Math.min(CONFIG.worldWidth-this.player.w,this.player.x));
    this.cameraX+=(this.player.x-360-this.cameraX)*.08;
    this.cameraX=Math.max(0,Math.min(CONFIG.worldWidth-CONFIG.width,this.cameraX));

    this.updateProjectiles(dt,t);
    this.updateEnemies(dt,t);
    this.updateCollectibles();
    this.updateBoss(dt,t);
    this.updateRigsby(dt);
    this.updateStory();
    this.updateParticles(dt);
    if(this.player.invuln>0)this.player.invuln-=dt;
    this.state.triangle=Math.min(100,this.state.triangle+0.012*dt);
    this.ui.hud(this.state,DUDES[this.state.dude]);
  }

  usePower(t){
    const d=DUDES[this.state.dude];
    if(this.state.triangle>=100){
      this.state.triangle=0;
      for(const e of this.enemies){if(e.alive&&Math.abs(e.x-this.player.x)<650){e.alive=false;this.burst(e.x,e.y,'#ffe66d',20)}}
      if(this.state.bossActive&&this.boss.alive){this.boss.hp-=4}
      this.burst(this.player.x,this.player.y,'#ff4fb8',70);
      this.ui.flash('TRIANGLE OF SUPPORT!');
      return;
    }
    if(d.power==='rainbow'){
      this.state.projectiles.push({x:this.player.x+22,y:this.player.y+30,vx:this.player.facing*11,vy:0,w:34,h:18,type:'rainbow',life:100});
      this.ui.flash('Yaaass queen!');
    }else if(d.power==='magic'){
      if(t<this.state.magicReady){this.ui.flash('Magic is recharging!');return}
      this.state.shieldUntil=t+2200;this.state.magicReady=t+4300;
      for(const e of this.enemies)if(e.alive&&Math.abs(e.x-this.player.x)<360)e.frozen=t+2400;
      if(this.state.bossActive&&this.boss.alive&&Math.abs(this.boss.x-this.player.x)<430)this.boss.frozen=t+1400;
      this.burst(this.player.x+22,this.player.y+30,d.color,24);
      this.ui.flash('Spread positivity to clear the path!');
    }else{
      this.state.projectiles.push({x:this.player.x+22,y:this.player.y+22,vx:this.player.facing*8.4,vy:-3.7,w:30,h:30,type:'cookie',life:120});
      this.state.traps.push({x:this.player.x+(this.player.facing*46),y:this.player.y+58,w:38,h:14,life:500});
      this.ui.flash('Cookie chaos deployed!');
    }
  }

  updateProjectiles(dt,t){
    for(const p of this.state.projectiles){
      p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.type==='cookie'?.28:0)*dt;p.life-=dt;
      for(const e of this.enemies){
        if(e.alive&&this.rects(p,e)){e.alive=false;p.life=0;this.burst(e.x,e.y,'#ffe66d',14)}
      }
      if(this.state.bossActive&&this.boss.alive&&this.rects(p,this.boss)){
        this.boss.hp-=p.type==='rainbow'?2:1;p.life=0;this.burst(p.x,p.y,'#ff4fb8',12)
      }
    }
    this.state.projectiles=this.state.projectiles.filter(p=>p.life>0&&p.y<760);

    for(const tr of this.state.traps){
      tr.life-=dt;
      for(const e of this.enemies){
        if(e.alive&&this.rects(tr,e)){e.alive=false;tr.life=0;this.burst(e.x,e.y,'#ff9a3c',18)}
      }
      if(this.state.bossActive&&this.boss.alive&&this.rects(tr,this.boss)){this.boss.hp-=2;tr.life=0}
    }
    this.state.traps=this.state.traps.filter(t=>t.life>0);
  }

  updateEnemies(dt,t){
    for(const e of this.enemies){
      if(!e.alive||e.frozen>t)continue;
      e.x+=e.vx*dt;
      if(Math.abs(e.x-SOCAL_LEVEL.enemies[e.id].x)>90)e.vx*=-1;
      if(this.rects(this.player,e))this.hurt('The Shade Brigade is doing too much.');
    }
  }

  updateCollectibles(){
    for(const c of this.cards){
      if(!c.collected&&this.rects(this.player,{x:c.x,y:c.y,w:34,h:44})){
        c.collected=true;this.state.cards++;this.state.triangle=Math.min(100,this.state.triangle+18);this.burst(c.x,c.y,'#ffe66d',20);
        this.ui.flash(this.state.cards===CONFIG.requiredCards?'Gay Card collection complete!':'Gay Card secured!');
      }
    }
    for(const b of this.beacons){
      if(!b.active&&this.rects(this.player,{x:b.x,y:b.y,w:54,h:70})){
        b.active=true;this.state.beacons++;this.state.triangle=Math.min(100,this.state.triangle+25);this.player.checkpoint=b.x-80;this.burst(b.x,b.y,'#3ce7d2',28);
        this.ui.flash('Prism Beacon restored!');
      }
    }
    if(this.player.x>4510&&!this.state.bossActive){
      if(this.state.cards<CONFIG.requiredCards||this.state.beacons<CONFIG.requiredBeacons){
        this.player.x=4450;this.player.vx=-4;
        this.ui.flash(`Need ${CONFIG.requiredCards-this.state.cards} Gay Card(s) and ${CONFIG.requiredBeacons-this.state.beacons} beacon(s)!`);
      }else{
        this.state.bossActive=true;this.ui.flash('BOSS: The HOA Queen of Beige!');
      }
    }
  }

  updateBoss(dt,t){
    if(!this.state.bossActive||!this.boss.alive)return;
    if(this.boss.frozen>t)return;
    this.boss.x+=this.boss.vx*dt;
    if(this.boss.x<4540||this.boss.x>4780)this.boss.vx*=-1;
    if(this.rects(this.player,this.boss))this.hurt('She cited you for excessive fabulousness.');
    if(this.boss.hp<=0){
      this.boss.alive=false;this.state.bossDefeated=true;this.burst(this.boss.x,this.boss.y,'#ff4fb8',90);
      setTimeout(()=>{this.stop();this.onComplete(this.state)},900);
    }
  }

  hurt(message){
    if(this.player.invuln>0)return;
    const now=performance.now();
    if(this.state.shieldUntil>now){this.ui.flash('Positivity shield blocked the shade!');this.burst(this.player.x,this.player.y,'#3ce7d2',16);return}
    this.state.health--;this.player.invuln=90;
    this.player.x=this.player.checkpoint;this.player.y=500;this.player.vx=0;this.player.vy=0;
    this.ui.flash(message);
    if(this.state.health<=0){
      this.state.health=4;this.player.checkpoint=90;this.player.x=90;
      this.ui.flash('Gay Card temporarily suspended. Try again!');
    }
  }

  burst(x,y,color,count){
    for(let i=0;i<count;i++)this.state.particles.push({x,y,vx:(Math.random()-.5)*9,vy:(Math.random()-.7)*9,life:35+Math.random()*25,color});
  }

  updateParticles(dt){
    if(this.state.rigsby)this.drawRigsby();
    for(const p of this.state.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=.25*dt;p.life-=dt}
    this.state.particles=this.state.particles.filter(p=>p.life>0);
  }

  rects(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}


  updateRigsby(dt){
    if(!this.state.rigsby)return;
    const target=this.player.x-62*this.player.facing;
    this.rigsby.x+=(target-this.rigsby.x)*.08*dt;
    this.rigsby.y=this.player.y+42;
    if(this.player.x>1050)this.state.rigsby=false;
  }

  updateStory(){
    const f=this.state.storyFlags;
    const x=this.player.x;
    if(x>120&&!f.home){f.home=true;this.dispatchDialogue('Will','Okay, team—SoCal is losing color, and beige is absolutely not our season.')}
    if(x>520&&!f.rigsby){f.rigsby=true;this.dispatchDialogue('Rigsby','WOOF! (Translation: I found the first trail of Prism energy.)')}
    if(x>980&&!f.beach){f.beach=true;this.dispatchDialogue('Daniel','I can feel the Prism nearby. Spread positivity to clear the path!')}
    if(x>2250&&!f.neighborhood){f.neighborhood=true;this.dispatchDialogue('Caleb','Cookie traps are armed. This neighborhood is about to get crumbs everywhere.')}
    if(x>3150&&!f.freeway){f.freeway=true;this.dispatchDialogue('Will','The I-5? Lord Beige really is evil.')}
    if(x>4020&&!f.la){f.la=true;this.dispatchDialogue('Daniel','Los Angeles is almost completely drained. Stay together.')}
  }

  dispatchDialogue(name,text){
    window.dispatchEvent(new CustomEvent('quest-dialogue',{detail:{name,text}}));
  }

  draw(t){
    const c=this.ctx;c.clearRect(0,0,CONFIG.width,CONFIG.height);
    this.drawBackground(t);c.save();c.translate(-this.cameraX,0);this.drawWorld(t);this.drawPlayer(t);c.restore();
    if(this.state.bossActive&&this.boss.alive)this.drawBossHud();
    if(this.state.paused){c.fillStyle='rgba(8,5,24,.72)';c.fillRect(0,0,CONFIG.width,CONFIG.height);this.text('PAUSED',CONFIG.width/2,CONFIG.height/2,64,'#fff','center')}
  }

  drawBackground(t){
    const c=this.ctx,g=c.createLinearGradient(0,0,0,CONFIG.height);
    g.addColorStop(0,'#4a2f9f');g.addColorStop(.45,'#ff6f91');g.addColorStop(.7,'#ffb55a');g.addColorStop(1,'#22305f');
    c.fillStyle=g;c.fillRect(0,0,CONFIG.width,CONFIG.height);
    c.fillStyle='#ffe66d';c.beginPath();c.arc(970-this.cameraX*.05,150,86,0,Math.PI*2);c.fill();
    c.fillStyle='#257bc4';c.fillRect(0,470,CONFIG.width,250);
    for(let i=0;i<12;i++){c.fillStyle=i%2?'rgba(255,255,255,.18)':'rgba(60,231,210,.2)';const y=480+i*18;c.fillRect(((-this.cameraX*.2+i*120+(t*.02))%1500)-150,y,900,5)}
    c.fillStyle='#5f4b72';
    for(let i=0;i<7;i++){const x=i*240-(this.cameraX*.12%240);c.beginPath();c.moveTo(x,470);c.lineTo(x+120,290+(i%2)*45);c.lineTo(x+260,470);c.fill()}
    c.fillStyle='rgba(35,27,72,.7)';
    for(let i=0;i<18;i++){const x=i*90-(this.cameraX*.3%90),h=50+(i%5)*22;c.fillRect(x,470-h,62,h)}
  }

  drawWorld(t){
    this.drawSigns();this.drawPalms(t);this.drawPlatforms();this.drawDecor(t);
    for(const card of this.cards)if(!card.collected)this.drawCard(card.x,card.y,t);
    for(const beacon of this.beacons)this.drawBeacon(beacon,t);
    for(const e of this.enemies)if(e.alive)this.drawEnemy(e,t);
    for(const tr of this.state.traps)this.drawCookie(tr.x,tr.y,1.1);
    for(const p of this.state.projectiles)this.drawProjectile(p);
    if(this.state.bossActive&&this.boss.alive)this.drawBoss(this.boss,t);
    if(this.state.rigsby)this.drawRigsby();
    for(const p of this.state.particles){this.ctx.globalAlpha=p.life/60;this.ctx.fillStyle=p.color;this.ctx.fillRect(p.x,p.y,6,6);this.ctx.globalAlpha=1}
  }

  drawPlatforms(){
    const colors={sand:'#e4b86c',boardwalk:'#b97945',city:'#6b637d',suburb:'#7dbb67',freeway:'#5e6574',hills:'#66834a',pier:'#8d5d3c',neon:'#6d3dad',roof:'#4b4560',lawn:'#72b95d',sign:'#3f784f',rock:'#7f6f76'};
    for(const p of SOCAL_LEVEL.platforms){this.ctx.fillStyle=colors[p.type]||'#666';this.ctx.fillRect(p.x,p.y,p.w,p.h);this.ctx.fillStyle='rgba(255,255,255,.18)';this.ctx.fillRect(p.x,p.y,p.w,7)}
  }

  drawSigns(){
    const signs=[{x:1510,y:245,w:220,lines:['SAN DIEGO','BEACHES  →']},{x:3190,y:225,w:260,lines:['I-5 NORTH','FABULOUS ONLY']},{x:4030,y:260,w:250,lines:['LOS ANGELES','FINAL BOSS']}];
    for(const s of signs){this.ctx.fillStyle='#2b714b';this.ctx.fillRect(s.x,s.y,s.w,90);this.ctx.strokeStyle='#fff';this.ctx.lineWidth=5;this.ctx.strokeRect(s.x+5,s.y+5,s.w-10,80);s.lines.forEach((l,i)=>this.text(l,s.x+s.w/2,s.y+34+i*30,18,'#fff','center'));this.ctx.fillStyle='#5e6574';this.ctx.fillRect(s.x+25,s.y+90,12,220);this.ctx.fillRect(s.x+s.w-37,s.y+90,12,220)}
  }

  drawPalms(t){
    for(const x of [160,520,980,1390,2200,3090,3890,4320]){const y=620;this.ctx.fillStyle='#8b5a3c';this.ctx.fillRect(x,y-150,18,150);this.ctx.save();this.ctx.translate(x+9,y-150);this.ctx.rotate(Math.sin(t*.002+x)*.12);this.ctx.fillStyle='#226b4c';for(let i=0;i<7;i++){this.ctx.save();this.ctx.rotate(Math.PI*2/7*i);this.ctx.beginPath();this.ctx.ellipse(0,-34,12,42,0,0,Math.PI*2);this.ctx.fill();this.ctx.restore()}this.ctx.restore()}
  }

  drawDecor(t){
    this.ctx.fillStyle='#f8d15a';this.ctx.fillRect(2310,525,150,95);this.ctx.fillStyle='#ff4fb8';this.ctx.fillRect(2295,500,180,32);this.text('TACOS',2385,522,19,'#fff','center');
    for(const x of [900,2170,3070,3900]){this.ctx.fillStyle='#555';this.ctx.fillRect(x,480,6,140);['#ff4b4b','#ff9f43','#ffe66d','#49d17d','#45a3ff','#a55cff'].forEach((col,i)=>{this.ctx.fillStyle=col;this.ctx.fillRect(x+6,490+i*10,70,10)})}
    for(let i=0;i<5;i++){const x=3180+((i*170+t*.06)%700);this.ctx.fillStyle=['#ff4fb8','#3ce7d2','#ffe66d'][i%3];this.ctx.fillRect(x,555,70,26);this.ctx.fillStyle='#222';this.ctx.fillRect(x+8,578,16,12);this.ctx.fillRect(x+48,578,16,12)}
  }

  drawCard(x,y,t){
    const bob=Math.sin(t*.005+x)*6;this.ctx.save();this.ctx.translate(x,y+bob);this.ctx.fillStyle='#fff';this.ctx.fillRect(-18,-24,36,48);['#ff4b4b','#ff9f43','#ffe66d','#49d17d','#45a3ff','#a55cff'].forEach((col,i)=>{this.ctx.fillStyle=col;this.ctx.fillRect(-14,-20+i*6,28,6)});this.text('GAY',0,18,10,'#111','center');this.ctx.restore()
  }

  drawBeacon(b,t){
    this.ctx.save();this.ctx.translate(b.x,b.y);this.ctx.fillStyle=b.active?'#3ce7d2':'#837e91';this.ctx.fillRect(-24,10,48,60);this.ctx.fillStyle=b.active?'#fff':'#aaa';this.ctx.beginPath();this.ctx.moveTo(0,-25);this.ctx.lineTo(25,12);this.ctx.lineTo(0,30);this.ctx.lineTo(-25,12);this.ctx.closePath();this.ctx.fill();if(b.active){this.ctx.globalAlpha=.35+.25*Math.sin(t*.006);this.ctx.fillStyle='#3ce7d2';this.ctx.beginPath();this.ctx.arc(0,10,50,0,Math.PI*2);this.ctx.fill();this.ctx.globalAlpha=1}this.ctx.restore()
  }

  drawEnemy(e,t){
    this.ctx.save();this.ctx.translate(e.x,e.y);if(e.frozen>t){this.ctx.fillStyle='#9be7ff';this.ctx.fillRect(-6,-6,e.w+12,e.h+12)}const col={troll:'#7f68a8',scooter:'#ff5f6d',beigeBot:'#c7b59d',hoaDrone:'#8b7b6d'}[e.type];this.ctx.fillStyle=col;this.ctx.fillRect(0,0,e.w,e.h);this.ctx.fillStyle='#fff';this.ctx.fillRect(8,9,10,10);this.ctx.fillRect(28,9,10,10);this.ctx.fillStyle='#111';this.ctx.fillRect(12,12,4,4);this.ctx.fillRect(32,12,4,4);this.ctx.fillRect(11,31,24,5);if(e.type==='hoaDrone')this.text('HOA',23,-5,11,'#fff','center');this.ctx.restore()
  }

  drawProjectile(p){
    if(p.type==='rainbow'){['#ff4b4b','#ff9f43','#ffe66d','#49d17d','#45a3ff','#a55cff'].forEach((col,i)=>{this.ctx.fillStyle=col;this.ctx.fillRect(p.x,p.y+i*3,p.w,3)})}else this.drawCookie(p.x,p.y,1)
  }

  drawCookie(x,y,s){
    this.ctx.save();this.ctx.translate(x,y);this.ctx.scale(s,s);this.ctx.fillStyle='#d58a4b';this.ctx.beginPath();this.ctx.arc(0,0,15,0,Math.PI*2);this.ctx.fill();this.ctx.fillStyle='#4b2d21';[[5,-6],[-6,-3],[2,7],[-8,8]].forEach(q=>this.ctx.fillRect(q[0],q[1],4,4));this.ctx.restore()
  }

  drawPlayer(t){
    const d=DUDES[this.state.dude],c=this.ctx;
    c.save();c.translate(this.player.x,this.player.y);
    if(this.player.invuln>0&&Math.floor(this.player.invuln/5)%2===0)c.globalAlpha=.35;
    if(this.state.shieldUntil>t){c.strokeStyle='#3ce7d2';c.lineWidth=6;c.beginPath();c.arc(22,35,50,0,Math.PI*2);c.stroke()}
    const walk=Math.sin(performance.now()*.012*Math.abs(this.player.vx))*(Math.abs(this.player.vx)>.5?4:0);
    c.fillStyle='#242034';c.fillRect(7,55+walk,11,18);c.fillRect(28,55-walk,11,18);
    c.fillStyle=d.color;c.beginPath();c.roundRect(3,19,38,42,10);c.fill();
    c.fillStyle=d.accent;c.fillRect(5,39,34,7);
    c.fillStyle='#d8a57d';c.beginPath();c.roundRect(8,0,28,26,10);c.fill();
    c.fillStyle='#2b1a18';c.beginPath();c.roundRect(8,0,28,9,8);c.fill();
    c.fillStyle='#111';c.fillRect(this.player.facing>0?27:13,11,4,4);
    c.fillStyle='#fff';c.fillRect(11,28,8,5);c.fillRect(27,28,8,5);
    this.text(d.name[0],22,49,15,'#111','center');
    c.restore()
  }

  drawRigsby(){
    const c=this.ctx,r=this.rigsby;
    c.save();c.translate(r.x,r.y);
    c.fillStyle='#f4f1e8';c.beginPath();c.ellipse(18,12,24,14,0,0,Math.PI*2);c.fill();
    c.fillStyle='#7a4d32';c.beginPath();c.ellipse(7,7,9,12,-.3,0,Math.PI*2);c.fill();
    c.beginPath();c.ellipse(31,7,9,12,.3,0,Math.PI*2);c.fill();
    c.fillStyle='#111';c.fillRect(18,6,4,4);
    c.fillStyle='#f4f1e8';c.fillRect(4,20,6,10);c.fillRect(27,20,6,10);
    c.strokeStyle='#7a4d32';c.lineWidth=4;c.beginPath();c.moveTo(38,12);c.quadraticCurveTo(51,2,48,-6);c.stroke();
    c.restore()
  }

  drawBoss(b,t){
    this.ctx.save();this.ctx.translate(b.x,b.y);if(b.frozen>t){this.ctx.fillStyle='#9be7ff';this.ctx.fillRect(-10,-10,b.w+20,b.h+20)}this.ctx.fillStyle='#d5c4ae';this.ctx.fillRect(0,0,b.w,b.h);this.ctx.fillStyle='#9e8f7e';this.ctx.fillRect(12,10,96,20);this.ctx.fillStyle='#fff';this.ctx.fillRect(22,40,18,18);this.ctx.fillRect(78,40,18,18);this.ctx.fillStyle='#111';this.ctx.fillRect(28,46,6,6);this.ctx.fillRect(84,46,6,6);this.ctx.fillStyle='#8a1f3d';this.ctx.fillRect(28,80,65,10);this.text('HOA',60,25,15,'#fff','center');this.text('QUEEN',60,110,13,'#3d2f25','center');this.ctx.restore()
  }

  drawBossHud(){
    this.ctx.fillStyle='rgba(18,12,48,.9)';this.ctx.fillRect(370,18,540,34);this.ctx.fillStyle='#fff';this.ctx.fillRect(380,28,520,14);this.ctx.fillStyle='#ff4fb8';this.ctx.fillRect(380,28,520*(this.boss.hp/this.boss.maxHp),14);this.text('HOA QUEEN OF BEIGE',640,73,18,'#fff','center')
  }

  text(s,x,y,size,color,align='left'){this.ctx.font=`900 ${size}px system-ui`;this.ctx.fillStyle=color;this.ctx.textAlign=align;this.ctx.textBaseline='middle';this.ctx.fillText(s,x,y)}
}
