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
    this.assets={};
    const files={
      will:'assets/sprites/will_walk.png',
      daniel:'assets/sprites/daniel_walk.png',
      caleb:'assets/sprites/caleb_walk.png',
      rigsby:'assets/sprites/rigsby_walk.png',
      boss:'assets/sprites/hoa_queen_boss.png',
      troll:'assets/sprites/enemy_troll.png',
      scooter:'assets/sprites/enemy_scooter.png',
      beigeBot:'assets/sprites/enemy_beigeBot.png',
      hoaDrone:'assets/sprites/enemy_hoaDrone.png',
      npc0:'assets/sprites/npc_neighbor.png',
      npc1:'assets/sprites/npc_hillcrest.png',
      npc2:'assets/sprites/npc_cafe.png',
      npc3:'assets/sprites/npc_coastal.png',
      npc4:'assets/sprites/npc_la.png'
    };
    for(const [key,url] of Object.entries(files)){const img=new Image();img.src=url;this.assets[key]=img}
    this.last=0;
    this.running=false;
    this.reset();
  }

  reset(){
    this.state={
      paused:false,health:4,cards:0,beacons:0,dude:0,
      projectiles:[],traps:[],particles:[],shieldUntil:0,magicReady:0,
      bossActive:false,bossDefeated:false,bossPhase:1,triangle:0,rigsby:true,storyFlags:{},playTime:0,memories:[],secrets:[],chaosUntil:0,playerX:90,zones:[],souvenirs:[],currentObjective:null,rigsbyRescue:true,victoryWave:0
    };
    this.player={x:90,y:520,w:44,h:72,vx:0,vy:0,onGround:false,facing:1,invuln:0,checkpoint:90};
    this.cards=SOCAL_LEVEL.cards.map((p,i)=>({...p,id:i,collected:false}));
    this.beacons=SOCAL_LEVEL.beacons.map((p,i)=>({...p,id:i,active:false}));
    this.enemies=SOCAL_LEVEL.enemies.map((e,i)=>({...e,id:i,w:46,h:46,vx:i%2?1.15:-1.15,alive:true,frozen:0}));
    this.boss={...SOCAL_LEVEL.boss,maxHp:SOCAL_LEVEL.boss.hp,vx:-1.2,alive:true,frozen:0,attackTimer:80};
    this.npcs=(SOCAL_LEVEL.npcs||[]).map((n,i)=>({...n,id:i,w:38,h:70,spoken:false}));
    this.hazards=[];
    this.zones=(SOCAL_LEVEL.zones||[]).map((z,i)=>({...z,index:i,complete:false}));
    this.souvenirs=(SOCAL_LEVEL.souvenirs||[]).map((v,i)=>({...v,id:i,collected:false}));
    this.state.zones=this.zones;
    this.state.currentObjective={title:this.zones[0]?.objective||'Begin the quest',detail:this.zones[0]?.detail||''};
    this.selfieSpots=(SOCAL_LEVEL.selfieSpots||[]).map((v,i)=>({...v,id:i,unlocked:false}));
    this.chaosBowls=(SOCAL_LEVEL.chaosBowls||[]).map((v,i)=>({...v,id:i,unlocked:false}));
    this.ambient={
      clouds:Array.from({length:7},(_,i)=>({x:i*760+Math.random()*180,y:70+Math.random()*150,s:.35+Math.random()*.45})),
      birds:Array.from({length:9},(_,i)=>({x:i*560+Math.random()*300,y:90+Math.random()*180,s:1+Math.random()*1.3})),
      butterflies:Array.from({length:10},(_,i)=>({x:i*470+Math.random()*180,y:430+Math.random()*150,p:Math.random()*6.28}))
    };
    this.cameraX=0;
    this.rigsby={x:35,y:565,w:38,h:30,vx:0};
    this.jumpLatch=false;
    this.powerLatch=false;
  }

  start(saved=null){
    this.reset();
    if(saved)this.applySave(saved);
    this.running=true;
    this.ui.flash(saved?'Welcome back to Southern California!':'Adventure 1: Southern California');
    requestAnimationFrame(t=>this.loop(t));
  }

  stop(){this.running=false}
  togglePause(){this.state.paused=!this.state.paused;this.ui.flash(this.state.paused?'Quest paused. Hydrate, queen.':'Back to fabulous business.')}
  switchDude(index=null){
    this.state.dude=index===null?(this.state.dude+1)%3:index;
    this.ui.flash(DUDES[this.state.dude].line);
  }

  getSaveData(){
    return {
      version:'1.0',
      player:{x:this.player.x,y:this.player.y,checkpoint:this.player.checkpoint},
      state:{
        health:this.state.health,cards:this.state.cards,beacons:this.state.beacons,
        dude:this.state.dude,triangle:this.state.triangle,storyFlags:this.state.storyFlags,
        rigsby:this.state.rigsby,playTime:this.state.playTime,memories:this.state.memories,secrets:this.state.secrets,rigsbyRescue:this.state.rigsbyRescue
      },
      cards:this.cards.map(c=>c.collected),
      beacons:this.beacons.map(b=>b.active),
      enemies:this.enemies.map(e=>e.alive),
      selfies:this.selfieSpots.map(v=>v.unlocked),
      chaos:this.chaosBowls.map(v=>v.unlocked),
      zones:this.zones.map(v=>v.complete),
      souvenirs:this.souvenirs.map(v=>v.collected),
      savedAt:new Date().toISOString()
    };
  }

  applySave(save){
    if(!save||!save.player||!save.state)return;
    Object.assign(this.state,save.state,{paused:false,bossActive:false,bossDefeated:false,bossPhase:1});
    this.player.x=save.player.x??90;
    this.player.y=save.player.y??500;
    this.player.checkpoint=save.player.checkpoint??90;
    (save.cards||[]).forEach((v,i)=>{if(this.cards[i])this.cards[i].collected=!!v});
    (save.beacons||[]).forEach((v,i)=>{if(this.beacons[i])this.beacons[i].active=!!v});
    (save.enemies||[]).forEach((v,i)=>{if(this.enemies[i])this.enemies[i].alive=!!v});
    (save.selfies||[]).forEach((v,i)=>{if(this.selfieSpots[i])this.selfieSpots[i].unlocked=!!v});
    (save.chaos||[]).forEach((v,i)=>{if(this.chaosBowls[i])this.chaosBowls[i].unlocked=!!v});
    (save.zones||[]).forEach((v,i)=>{if(this.zones[i])this.zones[i].complete=!!v});
    (save.souvenirs||[]).forEach((v,i)=>{if(this.souvenirs[i])this.souvenirs[i].collected=!!v});
    this.state.zones=this.zones;
    this.cameraX=Math.max(0,this.player.x-360);
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
      this.player.vy=-(t<this.state.chaosUntil?d.jump*1.55:d.jump);this.player.onGround=false;
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
    const lookAhead=this.player.facing*85+this.player.vx*9;
    this.cameraX+=(this.player.x-360+lookAhead-this.cameraX)*.065;
    this.cameraX=Math.max(0,Math.min(CONFIG.worldWidth-CONFIG.width,this.cameraX));

    this.state.playTime+=dt;
    this.updateProjectiles(dt,t);
    this.updateEnemies(dt,t);
    this.updateCollectibles();
    this.updateBoss(dt,t);
    this.updateRigsby(dt);
    this.updateStory();
    this.updateNPCs();
    this.updateHazards(dt);
    this.updateSoulSystems(dt,t);
    this.updateZones(t);
    this.updateAmbient(dt);
    this.updateParticles(dt);
    if(this.state.victoryWave>0)this.state.victoryWave+=dt;
    if(this.player.invuln>0)this.player.invuln-=dt;
    this.state.playerX=this.player.x;
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
      this.player.vx=this.player.facing*12;
      this.state.projectiles.push({x:this.player.x+22,y:this.player.y+30,vx:this.player.facing*12.5,vy:0,w:42,h:18,type:'rainbow',life:115,pierce:2});
      this.ui.flash('Yaaass queen!');
    }else if(d.power==='magic'){
      if(t<this.state.magicReady){this.ui.flash('Magic is recharging!');return}
      this.state.shieldUntil=t+2400;this.state.magicReady=t+4300;if(this.state.health<4)this.state.health++;
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
        if(e.alive&&this.rects(p,e)){e.alive=false;p.pierce=(p.pierce||1)-1;if(p.pierce<=0)p.life=0;this.burst(e.x,e.y,'#ffe66d',14)}
      }
      if(this.state.bossActive&&this.boss.alive&&this.rects(p,this.boss)){
        this.boss.hp-=p.type==='rainbow'?2:p.type==='cookie'?2:1;p.life=0;this.burst(p.x,p.y,'#ff4fb8',12)
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
      const origin=SOCAL_LEVEL.enemies[e.id].x;
      if(e.type==='hoaDrone'){
        e.x+=e.vx*1.25*dt;e.y=SOCAL_LEVEL.enemies[e.id].y+Math.sin(t*.004+e.id)*28;
      }else if(e.type==='scooter'){
        e.x+=e.vx*2.0*dt;
      }else if(e.type==='troll'&&Math.abs(this.player.x-e.x)<230){
        e.x+=Math.sign(this.player.x-e.x)*1.7*dt;
      }else{
        e.x+=e.vx*dt;
      }
      if(Math.abs(e.x-origin)>105)e.vx*=-1;
      if(this.rects(this.player,e))this.hurt(`${e.type==='hoaDrone'?'HOA drone scan!':e.type==='scooter'?'Scooter menace!':'The Shade Brigade is doing too much.'}`);
    }
  }

  updateCollectibles(){
    for(const c of this.cards){
      if(!c.collected&&this.rects(this.player,{x:c.x,y:c.y,w:34,h:44})){
        c.collected=true;this.state.cards++;this.state.triangle=Math.min(100,this.state.triangle+18);this.burst(c.x,c.y,'#ffe66d',20);
        const cardNames=[
          'Can correctly identify every IKEA couch.',
          'Automatically detects brunch within five miles.',
          'Knows the difference between teal and turquoise.',
          'Immune to one passive-aggressive HOA email.',
          'Receives +20% dramatic entrance energy.',
          '+100 Fabulous. Statistically useless. Spiritually essential.'
        ];
        this.ui.flash(this.state.cards===CONFIG.requiredCards?'Gay Card collection complete!':`Gay Card: ${cardNames[c.id]}`);
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
    const ratio=this.boss.hp/this.boss.maxHp;
    const nextPhase=ratio>.66?1:ratio>.33?2:3;
    if(nextPhase!==this.state.bossPhase){
      this.state.bossPhase=nextPhase;
      window.dispatchEvent(new CustomEvent('boss-phase',{detail:{phase:nextPhase}}));
      this.burst(this.boss.x+60,this.boss.y+50,nextPhase===2?'#d5c4ae':'#ff4fb8',36);
    }
    if(this.boss.frozen<=t){
      this.boss.vx=Math.sign(this.boss.vx)*(1.15+nextPhase*.32);
      this.boss.x+=this.boss.vx*dt;
      if(this.boss.x<4530||this.boss.x>4790)this.boss.vx*=-1;
      this.boss.attackTimer-=dt;
      if(this.boss.attackTimer<28&&!this.boss.telegraph){
        this.boss.telegraph=true;
        this.ui.flash(nextPhase===1?'INCOMING VIOLATION LETTER!':nextPhase===2?'BEIGE PAINT — MOVE!':'HOA DRONE DROP!');
      }
      if(this.boss.attackTimer<=0){
        this.spawnBossAttack(nextPhase);this.boss.telegraph=false;
        this.boss.attackTimer=nextPhase===1?105:nextPhase===2?75:48;
      }
    }
    if(this.rects(this.player,this.boss))this.hurt('She cited you for excessive fabulousness.');
    if(this.boss.hp<=0){
      this.boss.alive=false;this.state.bossDefeated=true;this.state.victoryWave=1;this.burst(this.boss.x,this.boss.y,'#ff4fb8',110);
      window.dispatchEvent(new CustomEvent('boss-defeated'));
      setTimeout(()=>{this.stop();this.onComplete(this.state)},1700);
    }
  }

  spawnBossAttack(phase){
    if(phase===1){
      this.hazards.push({x:this.boss.x-20,y:this.boss.y+38,w:34,h:22,vx:-7,vy:-1,type:'letter',life:180});
    }else if(phase===2){
      for(const vx of [-7,-5.2])this.hazards.push({x:this.boss.x,y:this.boss.y+30,w:30,h:30,vx,vy:-4.5,type:'paint',life:190});
    }else{
      this.hazards.push({x:this.player.x+Math.random()*180-90,y:-30,w:42,h:42,vx:0,vy:6.4,type:'drone',life:150});
      this.hazards.push({x:this.boss.x,y:this.boss.y+55,w:38,h:20,vx:-8.5,vy:0,type:'letter',life:170});
    }
  }

  updateHazards(dt){
    for(const h of this.hazards){
      h.x+=h.vx*dt;h.y+=h.vy*dt;
      if(h.type==='paint')h.vy+=.25*dt;
      h.life-=dt;
      if(this.rects(this.player,h)){h.life=0;this.hurt(h.type==='letter'?'Violation letter delivered. Rude.':h.type==='paint'?'Beige paint is not your color.':'HOA drone attack!')}
    }
    this.hazards=this.hazards.filter(h=>h.life>0&&h.y<760);
  }

  hurt(message){
    if(this.player.invuln>0)return;
    const now=performance.now();
    if(this.state.shieldUntil>now){this.ui.flash('Positivity shield blocked the shade!');this.burst(this.player.x,this.player.y,'#3ce7d2',16);return}
    if(this.state.rigsbyRescue&&this.state.rigsby){
      this.state.rigsbyRescue=false;this.player.invuln=100;
      this.player.x=this.player.checkpoint;this.player.y=500;this.player.vx=0;this.player.vy=0;
      this.ui.flash('Rigsby rescue! Good boy!');
      this.burst(this.player.x,this.player.y,'#ffffff',28);return;
    }
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
    for(const p of this.state.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=.25*dt;p.life-=dt}
    this.state.particles=this.state.particles.filter(p=>p.life>0);
  }

  rects(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}




  updateZones(t){
    const zone=this.zones.find(z=>this.player.x>=z.start&&this.player.x<z.end&&!z.complete);
    if(zone)this.state.currentObjective={title:zone.objective,detail:zone.detail};
    else if(this.state.bossActive)this.state.currentObjective={title:'Defeat the HOA Queen',detail:'Read her attacks, switch heroes, and unleash Triangle of Support.'};

    for(const z of this.zones){
      if(z.complete)continue;
      const enemiesClear=!this.enemies.some(e=>e.alive&&e.x>=z.start&&e.x<z.end);
      let condition=false;
      if(z.id==='home')condition=this.cards[0]?.collected&&this.beacons[0]?.active;
      if(z.id==='hillcrest')condition=enemiesClear&&this.beacons[1]?.active;
      if(z.id==='pch')condition=enemiesClear&&this.beacons[2]?.active;
      if(z.id==='la')condition=enemiesClear&&this.state.cards===CONFIG.requiredCards;
      if(condition){
        z.complete=true;
        this.player.checkpoint=z.checkpoint;
        this.state.health=4;
        this.state.triangle=Math.min(100,this.state.triangle+30);
        this.burst(z.checkpoint,520,'#3ce7d2',60);
        this.canvas.classList.add('zoneComplete');
        setTimeout(()=>this.canvas.classList.remove('zoneComplete'),750);
        this.ui.flash(`${z.name.toUpperCase()} RESTORED — CHECKPOINT!`);
        window.dispatchEvent(new CustomEvent('zone-restored',{detail:{name:z.name}}));
      }
    }

    for(const item of this.souvenirs){
      if(!item.collected&&Math.abs(this.player.x-item.x)<45&&Math.abs(this.player.y-item.y)<90){
        item.collected=true;
        this.state.souvenirs.push(item.title);
        this.state.secrets.push(item.title);
        this.burst(item.x,item.y,'#ffe66d',55);
        this.ui.flash(`SECRET SOUVENIR: ${item.title}`);
      }
    }
  }

  updateSoulSystems(dt,t){
    for(const spot of this.selfieSpots){
      if(!spot.unlocked&&Math.abs(this.player.x-spot.x)<48&&Math.abs(this.player.y-spot.y)<110){
        spot.unlocked=true;
        this.state.memories.push(spot.title);
        this.burst(spot.x,spot.y,'#ffffff',45);
        this.ui.flash(`SELFIE MEMORY: ${spot.title}`);
        this.canvas.classList.add('selfieFlash');
        setTimeout(()=>this.canvas.classList.remove('selfieFlash'),600);
      }
    }
    for(const bowl of this.chaosBowls){
      if(!bowl.unlocked&&Math.abs(this.player.x-bowl.x)<50&&Math.abs(this.player.y-bowl.y)<110){
        bowl.unlocked=true;
        this.state.secrets.push(bowl.title);
        this.state.chaosUntil=t+12000;
        this.burst(bowl.x,bowl.y,'#ff4fb8',65);
        this.ui.flash('CHAOS BOWL: SUPER JUMP FOR 12 SECONDS!');
      }
    }
    const f=this.state.storyFlags;
    const banter=[
      [1180,'banter1','Caleb','If brunch is still beige, I am filing a complaint.'],
      [1780,'banter2','Will','Hillcrest without color is deeply offensive.'],
      [2750,'banter3','Daniel','The ocean is returning. Keep moving together.'],
      [3350,'banter4','Caleb','Do coastal calories count if the seagulls approve?'],
      [3970,'banter5','Will','Los Angeles is next. Let’s make it dramatic.']
    ];
    for(const [x,key,name,line] of banter){
      if(this.player.x>x&&!f[key]){f[key]=true;this.dispatchDialogue(name,line)}
    }
  }

  updateAmbient(dt){
    for(const c of this.ambient.clouds){c.x+=c.s*dt;if(c.x>5100)c.x=-300}
    for(const b of this.ambient.birds){b.x+=b.s*dt;if(b.x>5100)b.x=-100}
    for(const b of this.ambient.butterflies){b.x+=.35*dt;b.p+=.07*dt;if(b.x>5000)b.x=0}
  }

  updateRigsby(dt){
    if(!this.state.rigsby)return;
    const target=this.player.x-62*this.player.facing;
    this.rigsby.x+=(target-this.rigsby.x)*.08*dt;
    this.rigsby.y=this.player.y+42;
    const nextCard=this.cards.find(c=>!c.collected&&Math.abs(c.x-this.player.x)<420);
    this.rigsby.sniff=!!nextCard;
    if(nextCard)this.rigsby.x+=(Math.sign(nextCard.x-this.rigsby.x)*.45*dt);
    if(this.player.x>1280)this.state.rigsby=false;
  }

  updateStory(){
    const f=this.state.storyFlags;
    const x=this.player.x;
    if(x>120&&!f.home){f.home=true;this.dispatchDialogue('Will','Okay, team—SoCal is losing color, and beige is absolutely not our season.')}
    if(x>520&&!f.rigsby){f.rigsby=true;this.dispatchDialogue('Rigsby','WOOF! (Translation: I found the first trail of Prism energy.)')}
    if(x>980&&!f.hillcrest){f.hillcrest=true;this.dispatchDialogue('Daniel','Hillcrest should never be beige. Spread positivity and bring the rainbow back!')}
    if(x>2250&&!f.pchStart){f.pchStart=true;this.dispatchDialogue('Caleb','Hillcrest restored. Cookie traps are packed. Next stop: the coast!')}
    if(x>3150&&!f.freeway){f.freeway=true;this.dispatchDialogue('Will','PCH traffic and beige energy? Lord Beige really is evil.')}
    if(x>4020&&!f.la){f.la=true;this.dispatchDialogue('Daniel','Los Angeles is almost completely drained. Stay together.')}
  }


  updateNPCs(){
    for(const n of this.npcs){
      if(!n.spoken&&Math.abs(this.player.x-n.x)<62&&Math.abs(this.player.y-n.y)<100){
        n.spoken=true;
        this.dispatchDialogue(n.name,n.line);
      }
    }
  }

  dispatchDialogue(name,text){
    window.dispatchEvent(new CustomEvent('quest-dialogue',{detail:{name,text}}));
  }

  draw(t){
    const c=this.ctx;c.clearRect(0,0,CONFIG.width,CONFIG.height);
    this.drawBackground(t);
    this.drawParallax(t);
    this.drawAmbient(t);c.save();c.translate(-this.cameraX,0);this.drawWorld(t);this.drawPlayer(t);c.restore();
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


  drawParallax(t){
    const c=this.ctx;
    c.save();
    // distant mountains
    c.translate(-this.cameraX*.16,0);
    c.fillStyle='rgba(92,106,140,.28)';
    for(let x=-300;x<5600;x+=420){
      c.beginPath();c.moveTo(x,470);c.lineTo(x+180,230+(x%3)*30);c.lineTo(x+390,470);c.closePath();c.fill();
    }
    c.restore();

    c.save();
    c.translate(-this.cameraX*.32,0);
    // city skyline builds toward LA
    c.fillStyle='rgba(70,65,95,.30)';
    for(let x=3300;x<5700;x+=90){
      const h=90+((x*17)%170);
      c.fillRect(x,515-h,65,h);
      c.fillStyle='rgba(255,235,150,.25)';
      for(let wy=535-h;wy<500;wy+=24)for(let wx=x+10;wx<x+55;wx+=18)c.fillRect(wx,wy,5,8);
      c.fillStyle='rgba(70,65,95,.30)';
    }
    c.restore();

    // ocean strip through PCH with animated wave crests
    c.save();c.translate(-this.cameraX,0);
    c.fillStyle='rgba(39,172,215,.36)';c.fillRect(2450,430,1440,190);
    c.strokeStyle='rgba(255,255,255,.65)';c.lineWidth=3;
    for(let x=2460;x<3890;x+=55){
      const y=465+Math.sin(t*.004+x*.02)*7;
      c.beginPath();c.arc(x,y,22,Math.PI,Math.PI*2);c.stroke();
    }
    c.restore();
  }

  drawWorld(t){
    this.drawZoneVeils();this.drawSigns();this.drawPalms(t);this.drawPlatforms();this.drawDecor(t);this.drawCheckpoints(t);
    for(const item of this.souvenirs)if(!item.collected)this.drawSouvenir(item,t);
    for(const card of this.cards)if(!card.collected)this.drawCard(card.x,card.y,t);
    for(const beacon of this.beacons)this.drawBeacon(beacon,t);
    for(const spot of this.selfieSpots)if(!spot.unlocked)this.drawSelfieSpot(spot,t);
    for(const bowl of this.chaosBowls)if(!bowl.unlocked)this.drawChaosBowl(bowl,t);
    for(const n of this.npcs)this.drawNPC(n,t);
    for(const e of this.enemies)if(e.alive)this.drawEnemy(e,t);
    for(const tr of this.state.traps)this.drawCookie(tr.x,tr.y,1.1);
    for(const p of this.state.projectiles)this.drawProjectile(p);
    for(const h of this.hazards)this.drawHazard(h);
    if(this.state.bossActive&&this.boss.alive){
      if(this.boss.attackTimer<28){this.ctx.fillStyle='rgba(255,60,90,.18)';this.ctx.fillRect(4510,0,490,620)}
      this.drawBoss(this.boss,t);
    }
    if(this.state.rigsby)this.drawRigsby();
    for(const p of this.state.particles){this.ctx.globalAlpha=p.life/60;this.ctx.fillStyle=p.color;this.ctx.fillRect(p.x,p.y,6,6);this.ctx.globalAlpha=1}
  }


  drawZoneVeils(){
    const c=this.ctx;
    for(const z of this.zones){
      if(z.complete)continue;
      c.fillStyle='rgba(183,165,139,.23)';
      c.fillRect(z.start,0,z.end-z.start,720);
      c.fillStyle='rgba(96,82,66,.12)';
      for(let x=z.start;x<z.end;x+=70)c.fillRect(x,0,28,720);
    }
    if(this.state.bossDefeated){
      c.fillStyle=`rgba(255,255,255,${Math.max(0,.8-this.state.victoryWave/120)})`;
      c.fillRect(0,0,5000,720);
    }
  }

  drawCheckpoints(t){
    for(const z of this.zones){
      const x=z.checkpoint;
      this.ctx.fillStyle=z.complete?'#3ce7d2':'#7d6b96';
      this.ctx.fillRect(x,520,8,100);
      this.ctx.beginPath();this.ctx.moveTo(x+8,520);this.ctx.lineTo(x+64,540);this.ctx.lineTo(x+8,560);this.ctx.fill();
      if(z.complete)this.text('✓',x+30,540,22,'#fff','center');
    }
  }

  drawSouvenir(item,t){
    const bob=Math.sin(t*.006+item.id)*5;
    this.ctx.save();this.ctx.translate(item.x,item.y+bob);
    this.ctx.fillStyle='#ff4fb8';this.ctx.beginPath();this.ctx.arc(0,0,24,0,Math.PI*2);this.ctx.fill();
    this.text(item.icon||'★',0,0,24,'#fff','center');
    this.ctx.restore();
  }

  drawPlatforms(){
    const colors={sand:'#e4b86c',boardwalk:'#b97945',city:'#6b637d',suburb:'#7dbb67',freeway:'#5e6574',hills:'#66834a',pier:'#8d5d3c',neon:'#6d3dad',roof:'#4b4560',lawn:'#72b95d',sign:'#3f784f',rock:'#7f6f76'};
    for(const p of SOCAL_LEVEL.platforms){this.ctx.fillStyle=colors[p.type]||'#666';this.ctx.fillRect(p.x,p.y,p.w,p.h);this.ctx.fillStyle='rgba(255,255,255,.18)';this.ctx.fillRect(p.x,p.y,p.w,7)}
  }

  drawSigns(){
    const signs=[{x:1510,y:245,w:220,lines:['HILLCREST','RAINBOW  →']},{x:3190,y:225,w:260,lines:['PCH NORTH','FABULOUS ONLY']},{x:4030,y:260,w:250,lines:['LOS ANGELES','FINAL BOSS']}];
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



  drawAmbient(t){
    const c=this.ctx;
    c.save();
    for(const cloud of this.ambient.clouds){
      c.globalAlpha=.5;c.fillStyle='#fff';
      c.beginPath();c.ellipse(cloud.x,cloud.y,55,18,0,0,Math.PI*2);c.ellipse(cloud.x+35,cloud.y-8,42,22,0,0,Math.PI*2);c.fill();
    }
    c.globalAlpha=.75;c.strokeStyle='#222';c.lineWidth=2;
    for(const b of this.ambient.birds){
      c.beginPath();c.arc(b.x,b.y,8,3.5,5.9);c.arc(b.x+15,b.y,8,3.5,5.9);c.stroke();
    }
    for(const b of this.ambient.butterflies){
      c.fillStyle='#ff4fb8';c.globalAlpha=.8;
      const y=b.y+Math.sin(b.p)*12;
      c.beginPath();c.ellipse(b.x-4,y,5,3,.4,0,Math.PI*2);c.ellipse(b.x+4,y,5,3,-.4,0,Math.PI*2);c.fill();
    }
    c.restore();
  }

  drawSelfieSpot(s,t){
    const c=this.ctx,bob=Math.sin(t*.005+s.id)*5;
    c.save();c.translate(s.x,s.y+bob);
    c.fillStyle='#fff';c.fillRect(-15,-45,60,42);
    c.fillStyle='#ff4fb8';c.fillRect(-8,-38,46,28);
    c.fillStyle='#fff';c.beginPath();c.arc(15,-24,8,0,Math.PI*2);c.fill();
    this.text('📸',15,-58,24,'#fff','center');
    c.restore();
  }

  drawChaosBowl(b,t){
    const c=this.ctx,glow=.55+.25*Math.sin(t*.01);
    c.save();c.translate(b.x,b.y);c.globalAlpha=glow;
    c.fillStyle='#ff4fb8';c.beginPath();c.ellipse(0,0,32,12,0,0,Math.PI*2);c.fill();
    c.fillStyle='#ffe66d';c.beginPath();c.arc(0,-8,10,0,Math.PI*2);c.fill();
    this.text('CHAOS',0,28,12,'#fff','center');c.restore();
  }


  drawSprite(img,x,y,frame,fw,fh,w=fw,h=fh,flip=false){
    const c=this.ctx;
    if(!img||!img.complete||!img.naturalWidth)return false;
    c.save();c.translate(x+(flip?w:0),y);c.scale(flip?-1:1,1);
    c.drawImage(img,frame*fw,0,fw,fh,0,0,w,h);c.restore();return true;
  }

  animationFrame(t,speed=130){
    return Math.floor(t/speed)%4;
  }

  drawNPC(n,t){
    const movingFrame=this.animationFrame(t,220);
    const bob=Math.sin(t*.003+n.id)*1.5;
    this.ctx.save();
    this.ctx.globalAlpha=n.spoken?.92:1;
    const ok=this.drawSprite(this.assets[`npc${n.id%5}`],n.x-5,n.y-2+bob,movingFrame,48,72,48,72,false);
    if(!ok){this.ctx.fillStyle='#3ce7d2';this.ctx.fillRect(n.x,n.y,38,70)}
    this.ctx.restore();
    if(!n.spoken){
      this.ctx.save();
      this.ctx.fillStyle='rgba(255,255,255,.95)';
      this.ctx.beginPath();this.ctx.arc(n.x+46,n.y-14,15,0,Math.PI*2);this.ctx.fill();
      this.text('!',n.x+46,n.y-14,17,'#ff4fb8','center');this.ctx.restore();
    }
  }

  drawHazard(h){
    const c=this.ctx;c.save();c.translate(h.x,h.y);
    if(h.type==='letter'){
      c.fillStyle='#fff';c.fillRect(0,0,h.w,h.h);c.strokeStyle='#b9a78f';c.strokeRect(0,0,h.w,h.h);
      c.fillStyle='#d33';c.fillRect(4,4,h.w-8,4);
    }else if(h.type==='paint'){
      c.fillStyle='#cbbba5';c.beginPath();c.arc(15,15,15,0,Math.PI*2);c.fill();
      c.fillStyle='#8f806d';c.fillRect(10,3,10,24);
    }else{
      c.fillStyle='#8b7b6d';c.fillRect(0,8,h.w,h.h-8);c.fillStyle='#fff';c.fillRect(8,16,8,8);c.fillRect(26,16,8,8);
      c.fillStyle='#111';this.text('HOA',21,34,10,'#111','center');
    }
    c.restore();
  }

  drawEnemy(e,t){
    const c=this.ctx,frame=this.animationFrame(t+e.id*70,120);
    c.save();
    if(e.frozen>t){
      c.globalAlpha=.55;c.fillStyle='#9be7ff';c.beginPath();c.roundRect(e.x-7,e.y-7,e.w+14,e.h+14,10);c.fill();c.globalAlpha=1;
    }
    const ok=this.drawSprite(this.assets[e.type],e.x,e.y,frame,48,48,e.w,e.h,e.vx<0);
    if(!ok){c.fillStyle='#b59e82';c.fillRect(e.x,e.y,e.w,e.h)}
    c.restore();
  }

  drawProjectile(p){
    if(p.type==='rainbow'){['#ff4b4b','#ff9f43','#ffe66d','#49d17d','#45a3ff','#a55cff'].forEach((col,i)=>{this.ctx.fillStyle=col;this.ctx.fillRect(p.x,p.y+i*3,p.w,3)})}else this.drawCookie(p.x,p.y,1)
  }

  drawCookie(x,y,s){
    this.ctx.save();this.ctx.translate(x,y);this.ctx.scale(s,s);this.ctx.fillStyle='#d58a4b';this.ctx.beginPath();this.ctx.arc(0,0,15,0,Math.PI*2);this.ctx.fill();this.ctx.fillStyle='#4b2d21';[[5,-6],[-6,-3],[2,7],[-8,8]].forEach(q=>this.ctx.fillRect(q[0],q[1],4,4));this.ctx.restore()
  }

  drawPlayer(t){
    const d=DUDES[this.state.dude],c=this.ctx;
    const keys=['will','daniel','caleb'];
    const moving=Math.abs(this.player.vx)>.45;
    const frame=moving?this.animationFrame(t,95):0;
    c.save();
    if(this.player.invuln>0&&Math.floor(this.player.invuln/5)%2===0)c.globalAlpha=.35;
    if(this.state.shieldUntil>t){
      c.strokeStyle='#3ce7d2';c.lineWidth=6;c.beginPath();c.arc(this.player.x+22,this.player.y+35,50,0,Math.PI*2);c.stroke();
      c.globalAlpha=.12;c.fillStyle='#3ce7d2';c.beginPath();c.arc(this.player.x+22,this.player.y+35,47,0,Math.PI*2);c.fill();c.globalAlpha=1;
    }
    // grounded contact shadow
    c.fillStyle='rgba(0,0,0,.22)';c.beginPath();c.ellipse(this.player.x+22,this.player.y+69,23,7,0,0,Math.PI*2);c.fill();
    const ok=this.drawSprite(this.assets[keys[this.state.dude]],this.player.x-2,this.player.y,frame,48,72,48,72,this.player.facing<0);
    if(!ok){c.fillStyle=d.color;c.fillRect(this.player.x,this.player.y,this.player.w,this.player.h)}
    if(moving&&this.player.onGround&&Math.floor(t/100)%2===0){
      c.fillStyle='rgba(230,220,200,.65)';c.beginPath();c.arc(this.player.x+(this.player.facing<0?42:3),this.player.y+67,5,0,Math.PI*2);c.fill();
    }
    c.restore();
  }

  drawRigsby(){
    const r=this.rigsby,c=this.ctx;
    const frame=Math.floor(performance.now()/110)%4;
    this.drawSprite(this.assets.rigsby,r.x-6,r.y-12,frame,64,48,64,48,this.player.facing<0);
    if(r.sniff){
      c.fillStyle='#fff';c.beginPath();c.arc(r.x+49,r.y-19,7,0,Math.PI*2);c.arc(r.x+60,r.y-30,5,0,Math.PI*2);c.fill();
      this.text('!',r.x+71,r.y-41,18,'#ff4fb8','center');
    }
  }

  drawBoss(b,t){
    const c=this.ctx;
    const frame=this.animationFrame(t,this.state.bossPhase===3?75:130);
    c.save();
    if(b.frozen>t){
      c.globalAlpha=.5;c.fillStyle='#9be7ff';c.beginPath();c.roundRect(b.x-12,b.y-12,b.w+24,b.h+24,16);c.fill();c.globalAlpha=1;
    }
    if(this.state.bossPhase===3){
      c.save();c.translate(b.x+60,b.y+58);c.scale(1.08,1.08);c.translate(-(b.x+60),-(b.y+58));
    }
    const ok=this.drawSprite(this.assets.boss,b.x-4,b.y-18,frame,128,144,128,144,b.vx<0);
    if(this.state.bossPhase===3)c.restore();
    if(!ok){c.fillStyle='#d5c4ae';c.fillRect(b.x,b.y,b.w,b.h)}
    c.restore();
  }

  drawBossHud(){
    this.ctx.fillStyle='rgba(18,12,48,.9)';this.ctx.fillRect(370,18,540,34);this.ctx.fillStyle='#fff';this.ctx.fillRect(380,28,520,14);this.ctx.fillStyle='#ff4fb8';this.ctx.fillRect(380,28,520*(this.boss.hp/this.boss.maxHp),14);this.text(`HOA QUEEN OF BEIGE — PHASE ${this.state.bossPhase}`,640,73,18,'#fff','center')
  }

  text(s,x,y,size,color,align='left'){this.ctx.font=`900 ${size}px system-ui`;this.ctx.fillStyle=color;this.ctx.textAlign=align;this.ctx.textBaseline='middle';this.ctx.fillText(s,x,y)}
}
