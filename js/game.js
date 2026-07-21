import {CONFIG,DUDES} from './config.js?v=1.0.4';
import {SOCAL_LEVEL} from './level.js?v=1.0.4';

export class Game{
  constructor(canvas,ui,input,onComplete){
    this.canvas=canvas;
    this.ctx=canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled=true;
    this.ctx.imageSmoothingQuality='high';
    this.ui=ui;
    this.input=input;
    this.onComplete=onComplete;
    this.assets={};
    const files={
      will_idle:'assets/sprites_hd/will_idle.png',
      will_walk:'assets/sprites_hd/will_walk.png',
      will_attack:'assets/sprites_hd/will_attack.png',
      will_hurt:'assets/sprites_hd/will_hurt.png',
      will_jump:'assets/sprites_hd/will_jump.png',
      will_celebrate:'assets/sprites_hd/will_celebrate.png',
      daniel_idle:'assets/sprites_hd/daniel_idle.png',
      daniel_walk:'assets/sprites_hd/daniel_walk.png',
      daniel_attack:'assets/sprites_hd/daniel_attack.png',
      daniel_hurt:'assets/sprites_hd/daniel_hurt.png',
      daniel_jump:'assets/sprites_hd/daniel_jump.png',
      daniel_celebrate:'assets/sprites_hd/daniel_celebrate.png',
      caleb_idle:'assets/sprites_hd/caleb_idle.png',
      caleb_walk:'assets/sprites_hd/caleb_walk.png',
      caleb_attack:'assets/sprites_hd/caleb_attack.png',
      caleb_hurt:'assets/sprites_hd/caleb_hurt.png',
      caleb_jump:'assets/sprites_hd/caleb_jump.png',
      caleb_celebrate:'assets/sprites_hd/caleb_celebrate.png',
      rigsby_idle:'assets/sprites_hd/rigsby_idle.png',
      rigsby_walk:'assets/sprites_hd/rigsby_walk.png',
      rigsby_bark:'assets/sprites_hd/rigsby_bark.png',
      rigsby_rescue:'assets/sprites_hd/rigsby_rescue.png',
      boss_idle:'assets/sprites_hd/hoa_queen_idle.png',
      boss_attack:'assets/sprites_hd/hoa_queen_attack.png',
      boss_rage:'assets/sprites_hd/hoa_queen_rage.png',
      boss_defeat:'assets/sprites_hd/hoa_queen_defeat.png',
      env_home:'assets/environments/home_base_hd.png',
      env_hillcrest:'assets/environments/hillcrest_hd.png',
      env_pch:'assets/environments/pch_hd.png',
      env_la:'assets/environments/los_angeles_hd.png',
      env_arena:'assets/environments/hoa_arena_hd.png',
      env_home_fg:'assets/environments/home_base_fg.png',
      env_hillcrest_fg:'assets/environments/hillcrest_fg.png',
      env_pch_fg:'assets/environments/pch_fg.png',
      env_la_fg:'assets/environments/los_angeles_fg.png',
      env_arena_fg:'assets/environments/hoa_arena_fg.png',
      fx_rainbow:'assets/effects/rainbow_bloom.png',
      fx_shield:'assets/effects/shield_bloom.png',
      fx_cookie:'assets/effects/cookie_bloom.png',
      fx_beige:'assets/effects/beige_bloom.png',
      fx_prism:'assets/effects/prism_bloom.png',
      ui_hud:'assets/ui/hud_panel.png',
      ui_objective:'assets/ui/objective_panel.png',
      ui_dialogue:'assets/ui/dialogue_panel.png',
      ui_journal:'assets/ui/journal_panel.png',
      ui_icons:'assets/ui/ui_icons.png',
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
    this.screenFx={
      shake:0,flash:0,flashColor:'rgba(255,255,255,.65)',
      vignette:0,slowUntil:0,ultimateUntil:0
    };
    this.remaster={
      lastZone:null,
      weatherSeed:Math.random()*1000,
      ambientNpcs:Array.from({length:14},(_,i)=>({
        x:460+i*310+Math.random()*120,
        y:610+(i%3)*14,
        speed:.10+Math.random()*.16,
        dir:i%2?1:-1,
        type:i%5
      })),
      ambientCars:Array.from({length:7},(_,i)=>({
        x:i*430+Math.random()*260,
        y:634+(i%2)*26,
        speed:.55+Math.random()*.45,
        dir:i%2?1:-1
      })),
      collectiblesSeen:new Set(),
      achievementFlags:new Set()
    };
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
    this.player={x:90,y:520,w:44,h:72,vx:0,vy:0,onGround:false,facing:1,invuln:0,checkpoint:90,
      animState:'idle',animUntil:0,lastPower:0};
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
      version:'1.0.4V',
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
    this.cameraX=Math.max(0,this.player.x-this.viewportWidth()*.38);
  }

  loop(t){
    if(!this.running)return;
    const dt=Math.min(2,(t-this.last)/16.67||1);this.last=t;
    if(!this.state.paused)this.update(dt,t);
    this.draw(t);
    requestAnimationFrame(n=>this.loop(n));
  }

  update(dt,t){
    this.updateRemasterSystems(t);
    if(this.screenFx.shake>0)this.screenFx.shake=Math.max(0,this.screenFx.shake-dt*.04);
    if(this.screenFx.flash>0)this.screenFx.flash=Math.max(0,this.screenFx.flash-dt*.0028);
    this.screenFx.vignette=Math.max(0,this.screenFx.vignette-dt*.0012);
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
    this.player.animState='attack';this.player.animUntil=t+520;this.player.lastPower=t;
    this.screenFx.shake=Math.max(this.screenFx.shake,4);
    this.screenFx.flash=.16;
    this.screenFx.flashColor=this.state.dude===0?'rgba(255,80,180,.45)':this.state.dude===1?'rgba(80,240,220,.42)':'rgba(255,196,80,.42)';
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
        c.collected=true;this.state.cards++;window.showCollectible?.('🌈 GAY CARD ACQUIRED');this.state.triangle=Math.min(100,this.state.triangle+18);this.burst(c.x,c.y,'#ffe66d',20);
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
      this.boss.alive=false;this.state.bossDefeated=true;this.state.victoryWave=1;this.boss.defeatAt=t;this.player.animState='celebrate';this.player.animUntil=t+1800;this.burst(this.boss.x,this.boss.y,'#ff4fb8',110);
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
    this.state.health--;this.player.invuln=90;this.player.animState='hurt';this.player.animUntil=performance.now()+520;
    this.screenFx.shake=11;this.screenFx.flash=.42;this.screenFx.flashColor='rgba(255,75,100,.75)';
    this.screenFx.vignette=.7;
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
    this.drawEnvironmentLayer(t);
    this.drawParallax(t);
    this.drawEnvironmentalAnimation(t);
    
    this.drawPrismAtmosphere(t);
    this.drawAmbient(t);c.save();c.translate(-this.cameraX,0);this.drawWorld(t);this.drawPlayer(t);c.restore();
    if(this.state.bossActive&&this.boss.alive)this.drawBossHud();
    if(this.state.paused){c.fillStyle='rgba(8,5,24,.72)';c.fillRect(0,0,CONFIG.width,CONFIG.height);this.text('PAUSED',CONFIG.width/2,CONFIG.height/2,64,'#fff','center')}
  }

  drawBackground(t){
    this.ctx.save();this.ctx.globalAlpha=.35;
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




  viewportWidth(){
    return this.canvas?.width || 960;
  }

  viewportHeight(){
    return this.canvas?.height || 540;
  }

  worldViewportWidth(){
    return this.viewportWidth();
  }


  zoneDisplayName(key){
    return {
      home:'HOME BASE',
      hillcrest:'HILLCREST',
      pch:'PACIFIC COAST HIGHWAY',
      la:'LOS ANGELES',
      arena:'HOA HEADQUARTERS'
    }[key]||'SOUTHERN CALIFORNIA';
  }

  updateRemasterSystems(t){
    const zone=this.currentEnvironment();
    if(this.remaster.lastZone!==zone){
      if(this.remaster.lastZone!==null&&window.showSceneCurtain){
        window.showSceneCurtain(this.zoneDisplayName(zone),900);
      }
      this.remaster.lastZone=zone;
    }

    if(this.state?.cards>=1&&!this.remaster.achievementFlags.has('first-card')){
      this.remaster.achievementFlags.add('first-card');
      window.showAchievement?.('Gay Card Acquired','🌈');
    }
    if(this.state?.beacons?.filter?.(Boolean).length>=1&&!this.remaster.achievementFlags.has('first-beacon')){
      this.remaster.achievementFlags.add('first-beacon');
      window.showAchievement?.('Color Restored','🔺');
    }
    if(this.state?.bossDefeated&&!this.remaster.achievementFlags.has('boss')){
      this.remaster.achievementFlags.add('boss');
      window.showAchievement?.('Beige Has Been Defeated','👑');
    }
  }

  drawLivingWorld(t){
    const c=this.ctx,key=this.currentEnvironment();
    c.save();

    if(key==='home'){
      // butterflies
      for(let i=0;i<7;i++){
        const x=((i*180+t*.018)%1200)-100;
        const y=360+Math.sin(t*.004+i*1.7)*70;
        c.save();c.translate(x,y);c.rotate(Math.sin(t*.01+i)*.25);
        c.fillStyle=i%2?'rgba(255,79,184,.82)':'rgba(255,224,93,.82)';
        c.beginPath();c.ellipse(-5,0,6,3,-.6,0,Math.PI*2);c.ellipse(5,0,6,3,.6,0,Math.PI*2);c.fill();
        c.restore();
      }
      // chickens pecking
      for(let i=0;i<4;i++){
        const x=470+i*120+Math.sin(t*.0009+i)*18;
        const y=618+(i%2)*10;
        c.fillStyle='rgba(248,245,231,.95)';
        c.beginPath();c.ellipse(x,y,13,9,0,0,Math.PI*2);c.fill();
        c.beginPath();c.arc(x+10,y-8+Math.sin(t*.008+i)*3,6,0,Math.PI*2);c.fill();
        c.fillStyle='#e0a441';c.beginPath();c.moveTo(x+16,y-8);c.lineTo(x+23,y-5);c.lineTo(x+16,y-2);c.fill();
      }
    }

    if(key==='hillcrest'){
      for(const n of this.remaster.ambientNpcs){
        let sx=(n.x-this.cameraX*n.speed)%1900;
        if(sx<-100)sx+=1900;
        const walk=Math.sin(t*.01+n.x)*3;
        const colors=['#ff4fb8','#3ce7d2','#ffe05d','#8e5cff','#ff9456'];
        c.fillStyle='rgba(20,15,30,.22)';
        c.beginPath();c.ellipse(sx,n.y+29,13,4,0,0,Math.PI*2);c.fill();
        c.fillStyle=colors[n.type];
        c.fillRect(sx-8,n.y-4+walk*.12,16,26);
        c.fillStyle='#e6b58d';
        c.beginPath();c.arc(sx,n.y-12+walk*.12,7,0,Math.PI*2);c.fill();
        c.strokeStyle='#2d2435';c.lineWidth=4;
        c.beginPath();c.moveTo(sx-5,n.y+22);c.lineTo(sx-7+walk,n.y+34);c.moveTo(sx+5,n.y+22);c.lineTo(sx+7-walk,n.y+34);c.stroke();
      }
    }

    if(key==='pch'){
      // ocean mist
      for(let i=0;i<6;i++){
        const x=(i*210+t*.015)%1200-100;
        const y=500+i*18;
        const g=c.createRadialGradient(x,y,2,x,y,75);
        g.addColorStop(0,'rgba(255,255,255,.12)');
        g.addColorStop(1,'rgba(255,255,255,0)');
        c.fillStyle=g;c.beginPath();c.arc(x,y,75,0,Math.PI*2);c.fill();
      }
    }

    if(key==='la'){
      for(const car of this.remaster.ambientCars){
        let x=(car.x+t*car.speed*car.dir)%1800;
        if(x<-180)x+=1800;
        c.fillStyle=car.dir>0?'#ff4f72':'#3ce7d2';
        c.beginPath();c.roundRect(x,car.y,82,26,8);c.fill();
        c.fillStyle='rgba(255,255,255,.82)';
        c.fillRect(x+(car.dir>0?64:6),car.y+7,12,5);
      }
    }

    c.restore();
  }

  drawDynamicWeather(t){
    const c=this.ctx,key=this.currentEnvironment();
    const vw=this.viewportWidth(),vh=this.viewportHeight();
    c.save();

    const cycle=(Math.sin(t*.00008+this.remaster.weatherSeed)+1)/2;
    if(key==='home'||key==='pch'){
      const warm=.025+.045*cycle;
      c.fillStyle=`rgba(255,180,105,${warm})`;
      c.fillRect(0,0,vw,vh);
    }
    if(key==='la'){
      const haze=.03+.035*Math.sin(t*.00015+2);
      c.fillStyle=`rgba(255,110,150,${Math.max(.02,haze)})`;
      c.fillRect(0,0,vw,vh);
    }
    if(key==='arena'&&!this.state.bossDefeated){
      c.fillStyle=`rgba(90,65,100,${.035+.025*Math.sin(t*.003)})`;
      c.fillRect(0,0,vw,vh);
    }
    c.restore();
  }

  currentEnvironment(){
    const x=this.player.x;
    if(x<1150)return 'home';
    if(x<2450)return 'hillcrest';
    if(x<3900)return 'pch';
    if(x<5150)return 'la';
    return 'arena';
  }

  drawEnvironmentLayer(t){
    const key=this.currentEnvironment();
    const map={home:'env_home',hillcrest:'env_hillcrest',pch:'env_pch',la:'env_la',arena:'env_arena'};
    const img=this.assets[map[key]];
    if(!img||!img.complete||!img.naturalWidth)return;

    const c=this.ctx;
    const vw=this.viewportWidth();
    const vh=this.viewportHeight();

    c.save();

    // Cover the entire canvas while preserving aspect ratio.
    const scale=Math.max(vw/img.naturalWidth, vh/img.naturalHeight);
    const drawW=img.naturalWidth*scale;
    const drawH=img.naturalHeight*scale;

    // Use light parallax without revealing neighboring environments.
    const maxOffset=Math.max(0,drawW-vw);
    const progress=Math.max(0,Math.min(1,(this.cameraX%1400)/1400));
    const offsetX=maxOffset*progress*.45;

    c.globalAlpha=1;
    c.drawImage(img,-offsetX,(vh-drawH)*.5,drawW,drawH);

    const grad=c.createLinearGradient(0,0,0,vh);
    if(key==='home'){grad.addColorStop(0,'rgba(255,205,155,.05)');grad.addColorStop(1,'rgba(255,255,255,0)')}
    if(key==='hillcrest'){grad.addColorStop(0,'rgba(255,72,170,.07)');grad.addColorStop(1,'rgba(80,220,210,.025)')}
    if(key==='pch'){grad.addColorStop(0,'rgba(80,190,255,.05)');grad.addColorStop(1,'rgba(255,210,120,.035)')}
    if(key==='la'){grad.addColorStop(0,'rgba(160,80,220,.055)');grad.addColorStop(1,'rgba(255,115,95,.04)')}
    if(key==='arena'){grad.addColorStop(0,'rgba(90,60,100,.085)');grad.addColorStop(1,'rgba(190,160,120,.055)')}
    c.fillStyle=grad;
    c.fillRect(0,0,vw,vh);

    c.restore();
  }

  drawForegroundEnvironment(){
    const key=this.currentEnvironment();
    const map={home:'env_home_fg',hillcrest:'env_hillcrest_fg',pch:'env_pch_fg',la:'env_la_fg',arena:'env_arena_fg'};
    const img=this.assets[map[key]];
    if(!img||!img.complete||!img.naturalWidth)return;

    const c=this.ctx;
    const vw=this.viewportWidth();
    const vh=this.viewportHeight();

    c.save();
    c.globalAlpha=key==='home'?.42:.58;

    const scale=Math.max(vw/img.naturalWidth, vh/img.naturalHeight);
    const drawW=img.naturalWidth*scale;
    const drawH=img.naturalHeight*scale;

    const maxOffset=Math.max(0,drawW-vw);
    const offsetX=maxOffset*.22;

    c.drawImage(img,-offsetX,(vh-drawH)*.5,drawW,drawH);
    c.restore();
  }

  drawEnvironmentalAnimation(t){
    const c=this.ctx,key=this.currentEnvironment();
    c.save();
    if(key==='home'){
      // pool shimmer and drifting plumeria petals
      for(let i=0;i<14;i++){
        const x=(i*97+t*.018)%960;
        const y=540+Math.sin(t*.004+i)*28;
        c.fillStyle='rgba(255,255,255,.25)';
        c.beginPath();c.ellipse(x,y,30,4,0,0,Math.PI*2);c.fill();
      }
    }
    if(key==='hillcrest'){
      // neon pulse and floating confetti
      c.shadowColor='#ff4fb8';c.shadowBlur=18;
      c.fillStyle=`rgba(255,79,184,${.18+.08*Math.sin(t*.006)})`;
      c.fillRect(90,190,170,12);
      c.shadowBlur=0;
      for(let i=0;i<18;i++){
        const x=(i*73+t*.025)%960;
        const y=(i*91+t*.017)%560;
        c.save();c.translate(x,y);c.rotate(t*.002+i);c.fillStyle=['#ff4fb8','#3ce7d2','#ffe05d'][i%3];c.fillRect(-3,-7,6,14);c.restore();
      }
    }
    if(key==='pch'){
      // sun glare and seabirds
      const rg=c.createRadialGradient(790,120,5,790,120,180);
      rg.addColorStop(0,'rgba(255,255,220,.32)');rg.addColorStop(1,'rgba(255,255,220,0)');
      c.fillStyle=rg;c.fillRect(600,0,360,340);
      c.strokeStyle='rgba(255,255,255,.9)';c.lineWidth=2;
      for(let i=0;i<5;i++){
        const x=(i*210+t*.035)%1100-80,y=120+i*34+Math.sin(t*.004+i)*14;
        c.beginPath();c.arc(x,y,12,Math.PI,Math.PI*2);c.arc(x+24,y,12,Math.PI,Math.PI*2);c.stroke();
      }
    }
    if(key==='la'){
      // moving headlight streaks
      for(let i=0;i<8;i++){
        const x=(i*170+t*.12)%1100-100;
        c.fillStyle=i%2?'rgba(255,80,90,.35)':'rgba(255,240,170,.38)';
        c.fillRect(x,635,90,4);
      }
    }
    if(key==='arena'){
      // beige dust and dramatic spot flicker
      for(let i=0;i<26;i++){
        const x=(i*83+t*.013)%960,y=180+(i*47+t*.01)%420;
        c.fillStyle='rgba(220,205,180,.15)';
        c.beginPath();c.arc(x,y,3+(i%3),0,Math.PI*2);c.fill();
      }
    }
    c.restore();
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
    c.save();
    const sx=this.screenFx.shake>0?(Math.random()-.5)*this.screenFx.shake:0;
    const sy=this.screenFx.shake>0?(Math.random()-.5)*this.screenFx.shake*.45:0;
    c.translate(-this.cameraX+sx,sy);
    c.fillStyle='rgba(39,172,215,.36)';c.fillRect(2450,430,1440,190);
    c.strokeStyle='rgba(255,255,255,.65)';c.lineWidth=3;
    for(let x=2460;x<3890;x+=55){
      const y=465+Math.sin(t*.004+x*.02)*7;
      c.beginPath();c.arc(x,y,22,Math.PI,Math.PI*2);c.stroke();
    }
    c.restore();
  }


  drawGlowSprite(img,x,y,w,h,alpha=1,blend='screen'){
    if(!img||!img.complete||!img.naturalWidth)return;
    const c=this.ctx;c.save();c.globalAlpha=alpha;c.globalCompositeOperation=blend;
    c.drawImage(img,x,y,w,h);c.restore();
  }

  drawAbilityLighting(t){
    const c=this.ctx,hero=this.state.dude;
    c.save();
    if(this.player.animUntil>t&&this.player.animState==='attack'){
      const pulse=.72+.2*Math.sin(t*.025);
      const img=hero===0?this.assets.fx_rainbow:hero===1?this.assets.fx_shield:this.assets.fx_cookie;
      this.drawGlowSprite(img,this.player.x-90,this.player.y-110,230,230,pulse);
      if(hero===0){
        for(let i=0;i<6;i++){
          const a=t*.012+i*Math.PI/3;
          c.strokeStyle=['#ff4fb8','#ff9d45','#ffe05d','#3ce7a8','#46a8ff','#a85aff'][i];
          c.lineWidth=4;c.globalAlpha=.65;
          c.beginPath();c.arc(this.player.x+22,this.player.y+34,35+i*8,a,a+1.2);c.stroke();
        }
      }else if(hero===1){
        const rg=c.createRadialGradient(this.player.x+22,this.player.y+34,5,this.player.x+22,this.player.y+34,90);
        rg.addColorStop(0,'rgba(255,255,255,.18)');rg.addColorStop(.6,'rgba(60,231,210,.16)');rg.addColorStop(1,'rgba(60,231,210,0)');
        c.fillStyle=rg;c.beginPath();c.arc(this.player.x+22,this.player.y+34,90,0,Math.PI*2);c.fill();
      }else{
        for(let i=0;i<16;i++){
          const a=t*.008+i*.8,r=30+(i%5)*11;
          c.fillStyle=i%2?'rgba(255,205,95,.82)':'rgba(115,65,35,.75)';
          c.beginPath();c.arc(this.player.x+22+Math.cos(a)*r,this.player.y+32+Math.sin(a)*r,3+(i%3),0,Math.PI*2);c.fill();
        }
      }
    }
    c.restore();
  }

  drawPrismAtmosphere(t){
    const c=this.ctx;
    if(!this.state.beacons)return;
    const active=this.state.beacons.filter?.(Boolean).length ?? 0;
    if(active<=0)return;
    c.save();c.globalCompositeOperation='screen';c.globalAlpha=.08+.03*active;
    const x=(t*.025)%1200-120;
    const grad=c.createLinearGradient(x,0,x+500,720);
    grad.addColorStop(0,'rgba(255,79,184,0)');
    grad.addColorStop(.3,'rgba(255,79,184,.55)');
    grad.addColorStop(.5,'rgba(60,231,210,.55)');
    grad.addColorStop(.7,'rgba(255,225,90,.55)');
    grad.addColorStop(1,'rgba(255,225,90,0)');
    c.fillStyle=grad;c.fillRect(0,0,this.viewportWidth(),this.viewportHeight());c.restore();
  }

  drawUltimateCinematic(t){
    if(this.screenFx.ultimateUntil<=t)return;
    const c=this.ctx,p=Math.max(0,(this.screenFx.ultimateUntil-t)/1500);
    c.save();
    c.fillStyle=`rgba(18,8,38,${.62*p})`;c.fillRect(0,0,this.viewportWidth(),this.viewportHeight());
    const cx=this.viewportWidth()/2,cy=this.viewportHeight()*.48,rad=115+(1-p)*220;
    const pts=[[-.5*Math.PI],[-.5*Math.PI+2*Math.PI/3],[-.5*Math.PI+4*Math.PI/3]].map(a=>[cx+Math.cos(a)*rad,cy+Math.sin(a)*rad]);
    c.lineWidth=10;c.lineJoin='round';c.shadowBlur=30;c.shadowColor='#fff';
    const g=c.createLinearGradient(pts[0][0],pts[0][1],pts[2][0],pts[2][1]);
    g.addColorStop(0,'#ff4fb8');g.addColorStop(.5,'#3ce7d2');g.addColorStop(1,'#ffe05d');
    c.strokeStyle=g;c.beginPath();c.moveTo(...pts[0]);c.lineTo(...pts[1]);c.lineTo(...pts[2]);c.closePath();c.stroke();
    this.drawGlowSprite(this.assets.fx_prism,cx-rad*1.4,cy-rad*1.4,rad*2.8,rad*2.8,.7*p);
    c.restore();
  }


  drawPremiumHudFrame(t){
    const c=this.ctx;
    const vw=this.viewportWidth();

    c.save();

    const leftW=Math.min(330,Math.max(260,vw*.33));
    const rightW=Math.min(330,Math.max(250,vw*.30));
    const rightX=vw-rightW-18;

    const grad=c.createLinearGradient(18,18,18+leftW,135);
    grad.addColorStop(0,'rgba(25,18,45,.94)');
    grad.addColorStop(1,'rgba(12,12,28,.82)');

    c.fillStyle=grad;
    c.beginPath();c.roundRect(18,18,leftW,112,18);c.fill();
    c.strokeStyle='rgba(255,255,255,.12)';c.lineWidth=1.25;c.stroke();

    const accent=this.state.dude===0?'#ff4fb8':this.state.dude===1?'#3ce7d2':'#ffe05d';
    c.strokeStyle=accent;c.lineWidth=3;
    c.beginPath();c.roundRect(25,25,leftW-14,98,15);c.stroke();

    const x=35+((t*.08)%Math.max(80,leftW-70));
    c.globalCompositeOperation='screen';
    const lg=c.createLinearGradient(x-45,0,x+45,0);
    lg.addColorStop(0,'rgba(255,255,255,0)');
    lg.addColorStop(.5,'rgba(255,255,255,.18)');
    lg.addColorStop(1,'rgba(255,255,255,0)');
    c.fillStyle=lg;c.fillRect(35,30,leftW-50,2);

    c.globalCompositeOperation='source-over';
    c.fillStyle='rgba(18,15,34,.84)';
    c.beginPath();c.roundRect(rightX,20,rightW,90,16);c.fill();
    c.strokeStyle='rgba(60,231,210,.22)';c.lineWidth=1.25;c.stroke();

    c.restore();
  }

  drawScreenLighting(t){
    const c=this.ctx,key=this.currentEnvironment();
    c.save();
    // cinematic vignette
    const vw=this.viewportWidth(),vh=this.viewportHeight();
    const vg=c.createRadialGradient(vw/2,vh*.46,Math.min(vw,vh)*.22,vw/2,vh*.48,Math.max(vw,vh)*.72);
    const base=key==='arena'?.34:key==='la'?.20:.13;
    vg.addColorStop(0,'rgba(0,0,0,0)');
    vg.addColorStop(1,`rgba(16,8,28,${base+this.screenFx.vignette*.35})`);
    c.fillStyle=vg;c.fillRect(0,0,this.viewportWidth(),this.viewportHeight());

    // moving sunlight shafts
    if(key==='home'||key==='pch'){
      c.globalCompositeOperation='screen';
      c.save();c.translate(780,0);c.rotate(.22+Math.sin(t*.0005)*.025);
      const g=c.createLinearGradient(0,0,0,720);
      g.addColorStop(0,'rgba(255,248,210,.16)');g.addColorStop(1,'rgba(255,248,210,0)');
      c.fillStyle=g;c.fillRect(-100,0,200,760);c.restore();
    }

    // boss phase red/beige pressure
    if(key==='arena'&&this.state.bossPhase>=2&&!this.state.bossDefeated){
      const a=.05+.035*Math.sin(t*.01);
      c.fillStyle=this.state.bossPhase===3?`rgba(255,45,110,${a})`:`rgba(210,190,160,${a})`;
      c.fillRect(0,0,this.viewportWidth(),this.viewportHeight());
    }

    if(this.screenFx.flash>0){
      c.fillStyle=this.screenFx.flashColor.replace(/[\d.]+\)$/,(this.screenFx.flash)+')');
      c.fillRect(0,0,this.viewportWidth(),this.viewportHeight());
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
    this.drawBossDefeat(t);
    this.drawAbilityLighting(t);
    
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

  animationFrame(t,speed=130,count=4){
    return Math.floor(t/speed)%count;
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
    const heroes=['will','daniel','caleb'];
    const hero=heroes[this.state.dude];
    let state='idle',count=6,speed=170;
    if(this.player.animUntil>t){state=this.player.animState}
    else if(!this.player.onGround){state='jump';count=4;speed=150}
    else if(Math.abs(this.player.vx)>.45){state='walk';count=8;speed=82}
    if(state==='attack'){count=6;speed=82}
    if(state==='hurt'){count=4;speed=105}
    if(state==='celebrate'){count=8;speed=100}
    const frame=this.animationFrame(t,speed,count);
    const rw=82,rh=123,dx=this.player.x-19,dy=this.player.y+this.player.h-rh+2;
    c.save();
    if(this.player.invuln>0&&Math.floor(this.player.invuln/5)%2===0)c.globalAlpha=.38;
    if(this.state.shieldUntil>t){
      const pulse=1+Math.sin(t*.012)*.05;
      c.save();c.translate(this.player.x+22,this.player.y+34);c.scale(pulse,pulse);
      const grad=c.createRadialGradient(0,0,18,0,0,62);
      grad.addColorStop(0,'rgba(255,255,255,.08)');grad.addColorStop(.72,'rgba(60,231,210,.15)');grad.addColorStop(1,'rgba(60,231,210,.02)');
      c.fillStyle=grad;c.beginPath();c.arc(0,0,62,0,Math.PI*2);c.fill();
      c.strokeStyle='rgba(175,255,245,.9)';c.lineWidth=4;c.stroke();c.restore();
    }
    c.shadowColor='rgba(20,10,40,.30)';c.shadowBlur=10;c.shadowOffsetY=5;
    const ok=this.drawSprite(this.assets[`${hero}_${state}`],dx,dy,frame,128,192,rw,rh,this.player.facing<0);
    c.shadowColor='transparent';
    if(!ok){c.fillStyle=d.color;c.fillRect(this.player.x,this.player.y,this.player.w,this.player.h)}
    if(state==='walk'&&this.player.onGround&&Math.floor(t/80)%2===0){
      c.fillStyle='rgba(244,232,213,.6)';c.beginPath();c.ellipse(this.player.x+(this.player.facing<0?42:2),this.player.y+70,8,4,0,0,Math.PI*2);c.fill();
    }
    c.restore();
  }

  drawRigsby(){
    const r=this.rigsby,c=this.ctx,t=performance.now();
    let state='idle',count=6,speed=155;
    if(r.sniff){state='bark';count=5;speed=120}
    else if(Math.abs(r.vx)>.25){state='walk';count=8;speed=90}
    if(!this.state.rigsbyRescue){state='rescue';count=8;speed=95}
    const frame=this.animationFrame(t,speed,count);
    c.save();c.shadowColor='rgba(15,10,30,.28)';c.shadowBlur=8;c.shadowOffsetY=4;
    this.drawSprite(this.assets[`rigsby_${state}`],r.x-20,r.y-34,frame,128,96,72,54,this.player.facing<0);
    c.restore();
    if(r.sniff){
      c.fillStyle='#fff';c.beginPath();c.arc(r.x+49,r.y-24,7,0,Math.PI*2);c.arc(r.x+62,r.y-38,5,0,Math.PI*2);c.fill();
      this.text('!',r.x+74,r.y-51,20,'#ff4fb8','center');
    }
  }

  drawBoss(b,t){
    const c=this.ctx;
    let state='idle',count=6,speed=145;
    if(b.attackTimer<32){state='attack';count=6;speed=85}
    if(this.state.bossPhase===3){state='rage';count=8;speed=75}
    const frame=this.animationFrame(t,speed,count);
    c.save();
    if(b.frozen>t){
      c.globalAlpha=.66;c.filter='hue-rotate(145deg) saturate(1.5)';
    }
    const scale=this.state.bossPhase===3?1.12:1;
    const rw=138*scale,rh=164*scale;
    c.shadowColor='rgba(15,8,25,.36)';c.shadowBlur=18;c.shadowOffsetY=8;
    const ok=this.drawSprite(this.assets[`boss_${state}`],b.x+60-rw/2,b.y+b.h-rh,frame,220,260,rw,rh,b.vx<0);
    c.filter='none';c.shadowColor='transparent';
    if(!ok){c.fillStyle='#d5c4ae';c.fillRect(b.x,b.y,b.w,b.h)}
    c.restore();
  }

  drawBossDefeat(t){
    if(!this.state.bossDefeated||!this.boss.defeatAt)return;
    const elapsed=t-this.boss.defeatAt;
    if(elapsed>1650)return;
    const frame=this.animationFrame(elapsed,95,8);
    const fade=Math.max(0,1-elapsed/1750);
    this.ctx.save();this.ctx.globalAlpha=fade;
    this.drawSprite(this.assets.boss_defeat,this.boss.x-15,this.boss.y-95,frame,220,260,176,208,false);
    this.ctx.restore();
  }

  drawBossHud(){
    this.ctx.fillStyle='rgba(18,12,48,.9)';this.ctx.fillRect(370,18,540,34);this.ctx.fillStyle='#fff';this.ctx.fillRect(380,28,520,14);this.ctx.fillStyle='#ff4fb8';this.ctx.fillRect(380,28,520*(this.boss.hp/this.boss.maxHp),14);this.text(`HOA QUEEN OF BEIGE — PHASE ${this.state.bossPhase}`,640,73,18,'#fff','center')
  }

  text(s,x,y,size,color,align='left'){this.ctx.font=`900 ${size}px system-ui`;this.ctx.fillStyle=color;this.ctx.textAlign=align;this.ctx.textBaseline='middle';this.ctx.fillText(s,x,y)}
}
