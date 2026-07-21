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
  console.error('3Dudes1Quest 1.0.8V:',e.error||e.message);
  document.getElementById('bootSequence')?.classList.add('isHidden');
});

const W=1280,H=720,FLOOR=620,WORLD=9200;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const overlap=(a,b)=>a.x+a.w>b.x&&a.x<b.x+b.w&&a.y+a.h>b.y&&a.y<b.y+b.h;
const DUDES=[
  {name:'Will',color:'#ff4fb8',accent:'#ffe66d',speed:6.2,jump:14,power:'Rainbow Ricochet',shortPower:'BOUNCE',powerIcon:'🌈'},
  {name:'Daniel',color:'#8d5cff',accent:'#3ce7d2',speed:5.7,jump:13.5,power:'Heartfield Burst',shortPower:'HEARTS',powerIcon:'💖'},
  {name:'Caleb',color:'#ff9a3c',accent:'#fff',speed:5.9,jump:13,power:'Sticky Cookie Chaos',shortPower:'STICKY',powerIcon:'🍪'}
];
const ZONES=[
  {id:'home',name:'HOME BASE',start:0,end:1450,color:'#ff9d78',objective:'Find Zoey',detail:'Follow Rigsby and recover the first Gay Card. Zoey has been taken by the Queen of Beige.'},
  {id:'hillcrest',name:'HILLCREST',start:1450,end:3300,color:'#ff4fb8',objective:'Restore Hillcrest',detail:'Collect two Gay Cards and activate the neighborhood Prism Beacon.'},
  {id:'pch',name:'PCH',start:3300,end:5000,color:'#3ce7d2',objective:'Race the PCH',detail:'Cross the coast, avoid Beige Bots, and restore the ocean beacon.'},
  {id:'hollywood',name:'HOLLYWOOD',start:5000,end:6600,color:'#ffe66d',objective:'Take Back Hollywood',detail:'Climb the studio district and recover the final Gay Card.'},
  {id:'la',name:'LOS ANGELES',start:6600,end:9200,color:'#8d5cff',objective:'Rescue Zoey',detail:'Restore the final beacon, defeat the Queen of Beige, and free Zoey from the HOA cage.'}
];


function createLivingTitleWorld(){
  const canvas=qs('titleWorldCanvas');
  if(!canvas)return {setHero(){}};
  const c=canvas.getContext('2d');
  const heroImages=['will','daniel','caleb'].map(name=>{const im=new Image();im.src=`assets/sprites_hd/${name}_idle.png`;return im});
  const rigsby=new Image();rigsby.src='assets/sprites_hd/rigsby_walk.png';
  const queen=new Image();queen.src='assets/sprites_hd/hoa_queen_idle.png';
  let selected=0,targetFocus=0,focus=0,last=performance.now(),running=true;
  const heroX=[300,485,670];
  const heroColors=['#ff4fb8','#8d5cff','#ff9a3c'];
  const particles=Array.from({length:34},(_,i)=>({x:(i*173)%1280,y:(i*97)%650,s:2+(i%4),v:.12+(i%5)*.025,h:i%6}));

  function sprite(im,x,y,frame,fw,fh,w,h,flip=false){
    if(!im.complete||!im.naturalWidth)return false;
    const frames=Math.max(1,Math.floor(im.naturalWidth/fw));
    frame%=frames;
    c.save();c.translate(x+(flip?w:0),y);c.scale(flip?-1:1,1);
    c.drawImage(im,frame*fw,0,fw,Math.min(fh,im.naturalHeight),0,0,w,h);c.restore();return true;
  }
  function palm(x,y,scale,sway){
    c.save();c.translate(x,y);c.scale(scale,scale);c.rotate(sway);
    c.strokeStyle='#6c4337';c.lineWidth=14;c.beginPath();c.moveTo(0,120);c.quadraticCurveTo(-12,30,0,-75);c.stroke();
    c.fillStyle='#1b7754';for(let i=0;i<8;i++){c.save();c.translate(0,-75);c.rotate(i*Math.PI/4+sway*2);c.beginPath();c.ellipse(0,-48,11,60,0,0,Math.PI*2);c.fill();c.restore()}c.restore();
  }
  function draw(t){
    if(!running)return;
    const dt=Math.min(32,t-last);last=t;focus+=(targetFocus-focus)*.045;
    const accent=heroColors[selected];
    c.clearRect(0,0,1280,720);
    const sky=c.createLinearGradient(0,0,0,720);sky.addColorStop(0,'#17113d');sky.addColorStop(.42,'#8d3f8f');sky.addColorStop(.73,'#ff8e79');sky.addColorStop(1,'#ffc178');c.fillStyle=sky;c.fillRect(0,0,1280,720);
    // Sun and moving clouds
    c.fillStyle='rgba(255,235,176,.85)';c.shadowColor='#ffe6a0';c.shadowBlur=55;c.beginPath();c.arc(1035,150,63,0,Math.PI*2);c.fill();c.shadowBlur=0;
    for(let i=0;i<5;i++){let x=((i*330+t*.012)%1750)-220;c.fillStyle='rgba(255,255,255,.24)';c.beginPath();c.ellipse(x,105+i*43,108,25,0,0,Math.PI*2);c.fill()}
    // Distant hills parallax
    c.fillStyle='#59345f';c.beginPath();c.moveTo(0,470);for(let x=0;x<=1280;x+=80)c.lineTo(x,390+Math.sin(x*.012+t*.00015)*38);c.lineTo(1280,720);c.lineTo(0,720);c.fill();
    // Skyline
    const skyline=[70,120,88,160,105,195,84,138,170,100,145,95,185,125];
    c.fillStyle='#241d45';skyline.forEach((h,i)=>{const x=i*100-(t*.008%100);c.fillRect(x,510-h,78,h+130);c.fillStyle='rgba(255,225,136,.38)';for(let yy=525-h;yy<500;yy+=28)c.fillRect(x+16,yy,12,7);c.fillStyle='#241d45'});
    // Ocean shimmer
    const ocean=c.createLinearGradient(0,510,0,720);ocean.addColorStop(0,'#147da1');ocean.addColorStop(1,'#16416f');c.fillStyle=ocean;c.fillRect(0,510,1280,210);
    c.strokeStyle='rgba(255,255,255,.42)';c.lineWidth=3;for(let i=0;i<8;i++){c.beginPath();for(let x=0;x<=1280;x+=30)c.lineTo(x,545+i*22+Math.sin(x*.018+t*.002+i)*5);c.stroke()}
    // Highway and moving traffic
    c.fillStyle='#28273d';c.fillRect(0,585,1280,135);c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=4;c.setLineDash([55,35]);c.beginPath();c.moveTo(0,655);c.lineTo(1280,655);c.stroke();c.setLineDash([]);
    const cars=['#ff4fb8','#3ce7d2','#ffe66d','#8d5cff','#f2f2f2'];for(let i=0;i<7;i++){const x=((i*260+t*(.06+i*.008))%1650)-160;c.fillStyle=cars[i%cars.length];c.beginPath();c.roundRect(x,615+(i%2)*53,92,27,9);c.fill()}
    // Foreground palms
    palm(85,500,1.06,Math.sin(t*.0013)*.015);palm(1180,515,.92,Math.sin(t*.0011+2)*.018);palm(1040,540,.58,Math.sin(t*.0015+1)*.022);
    // Birds
    c.strokeStyle='rgba(35,25,58,.7)';c.lineWidth=3;for(let i=0;i<4;i++){const x=((t*.035+i*280)%1500)-120,y=180+i*38;c.beginPath();c.arc(x,y,12,3.4,6);c.arc(x+24,y,12,3.3,5.9);c.stroke()}
    // Hero platform and selected spotlight
    const spotX=heroX[0]+(heroX[2]-heroX[0])*(focus/2);
    const glow=c.createRadialGradient(spotX,470,10,spotX,470,210);glow.addColorStop(0,accent+'77');glow.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=glow;c.fillRect(spotX-230,250,460,390);
    c.fillStyle='rgba(13,10,35,.72)';c.beginPath();c.roundRect(190,565,610,76,32);c.fill();
    // Three heroes, always equal in scene
    heroImages.forEach((im,i)=>{const is=i===selected,bob=Math.sin(t*.003+i)*3;const frame=Math.floor(t/170+i)%6;c.save();c.globalAlpha=is?1:.76;c.shadowColor=is?heroColors[i]:'transparent';c.shadowBlur=is?34:0;const scale=is?1.12:1;sprite(im,heroX[i]-54,405+bob-(is?15:0),frame,128,192,108*scale,162*scale,false);c.restore();c.fillStyle=is?'#fff':'rgba(255,255,255,.65)';c.font=`900 ${is?19:15}px system-ui`;c.textAlign='center';c.fillText(['WILL','DANIEL','CALEB'][i],heroX[i],600)});
    // Rigsby wanders between heroes
    const dogX=275+((Math.sin(t*.0007)+1)/2)*430;sprite(rigsby,dogX,525,Math.floor(t/105),128,96,82,61,Math.cos(t*.0007)<0);
    // Queen spying from rooftop
    c.fillStyle='#1b1833';c.fillRect(860,315,145,205);c.fillStyle='#2e274a';c.fillRect(840,300,185,28);sprite(queen,900,235,Math.floor(t/240),160,220,88,121,false);c.fillStyle='rgba(255,255,255,.82)';c.font='800 11px system-ui';c.textAlign='center';c.fillText('SUSPICIOUS HOA ACTIVITY',932,292);
    // Rainbow particles
    const rainbow=['#ff4b7d','#ff9a3c','#ffe66d','#49d17d','#3ce7d2','#8d5cff'];particles.forEach(p=>{p.y-=p.v*dt;if(p.y<-20){p.y=730;p.x=Math.random()*1280}p.x+=Math.sin(t*.001+p.y)*.08*dt;c.globalAlpha=.28+.25*Math.sin(t*.002+p.x);c.fillStyle=rainbow[p.h];c.beginPath();c.arc(p.x,p.y,p.s,0,Math.PI*2);c.fill()});c.globalAlpha=1;
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
  return {setHero(i){selected=Number(i)||0;targetFocus=selected},stop(){running=false}};
}

function createUI(){
  const screens={title:qs('titleScreen'),help:qs('helpScreen'),game:qs('gameScreen'),complete:qs('completeScreen'),portal:qs('portalScreen')};
  const refs={dude:qs('hudDude'),health:qs('hudHealth'),cards:qs('hudCards'),beacons:qs('hudBeacons'),triangle:qs('hudTriangle'),routeFill:qs('routeProgressFill'),routeLabel:qs('routeLabel'),objectiveTitle:qs('objectiveTitle'),objectiveDetail:qs('objectiveDetail'),message:qs('message'),completeStats:qs('completeStats'),bossPhase:qs('bossPhase')};
  function show(name){Object.values(screens).forEach(s=>s.classList.remove('active'));screens[name].classList.add('active')}
  function flash(text){refs.message.textContent=text;refs.message.classList.add('show');clearTimeout(flash.t);flash.t=setTimeout(()=>refs.message.classList.remove('show'),1800)}
  function hud(game){const s=game.state,d=DUDES[s.dude],z=game.zone();refs.dude.textContent=d.name;refs.health.textContent=s.health;refs.cards.textContent=s.cards;refs.beacons.textContent=s.beacons;refs.triangle.textContent=Math.floor(s.triangle);refs.routeFill.style.width=(game.player.x/(WORLD-100)*100)+'%';refs.routeLabel.textContent=z.name;refs.objectiveTitle.textContent=s.objective.title;refs.objectiveDetail.textContent=s.objective.detail;refs.bossPhase.classList.toggle('hidden',!game.boss.active);if(game.boss.active){const hp=Math.max(0,game.boss.hp);refs.bossPhase.textContent=`QUEEN OF BEIGE  ${hp}/${game.boss.maxHp}`;refs.bossPhase.style.setProperty('--boss-health',`${hp/game.boss.maxHp*100}%`);refs.bossPhase.dataset.phase=String(game.boss.phase)}}
  return {show,flash,hud,refs,screens};
}
function qs(id){return document.getElementById(id)}
function createInput(switcher){
  const k={left:false,right:false,jump:false,power:false,ultimate:false};
  const activePointers=new Map();
  const game=()=>window.__questGame;
  const gameScreen=()=>document.getElementById('gameScreen');
  const gameActive=()=>Boolean(gameScreen()?.classList.contains('active'));
  const isPlaying=()=>gameActive()&&game()?.inputMode==='PLAYING'&&!game()?.state.paused;

  const releaseAll=()=>{
    k.left=k.right=k.jump=k.power=k.ultimate=false;
    activePointers.clear();
    document.querySelectorAll('#touchControls button.isPressed').forEach(button=>button.classList.remove('isPressed'));
  };

  const focusCanvas=()=>{
    document.activeElement?.blur?.();
    const canvas=document.getElementById('gameCanvas');
    requestAnimationFrame(()=>canvas?.focus({preventScroll:true}));
  };

  const consume=event=>{
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  };

  // Capture-phase authority: Space belongs only to Power while the game screen is active.
  addEventListener('keydown',event=>{
    const code=event.code;

    if(gameActive()&&code==='Space'){
      consume(event);
      if(isPlaying()&&!event.repeat)k.power=true;
      return;
    }

    if(gameActive()&&(code==='Escape'||code==='KeyP')){
      consume(event);
      if(game()?.inputMode==='PAUSED')game().resumeGameplay();
      else if(isPlaying())game().pauseGameplay();
      return;
    }

    const gameplayCode=['ArrowLeft','ArrowRight','ArrowUp','KeyA','KeyD','KeyW','KeyX','KeyF','KeyQ','Digit1','Digit2','Digit3'].includes(code);
    if(gameplayCode&&gameActive()){
      consume(event);
      if(!isPlaying()){releaseAll();return}
    }
    if(!isPlaying())return;

    if(code==='ArrowLeft'||code==='KeyA')k.left=true;
    if(code==='ArrowRight'||code==='KeyD')k.right=true;
    if(code==='ArrowUp'||code==='KeyW')k.jump=true;
    if(code==='KeyX'||code==='KeyF')k.power=true;
    if(code==='KeyQ'&&!event.repeat)k.ultimate=true;
    if(code==='Digit1')switcher(0);
    if(code==='Digit2')switcher(1);
    if(code==='Digit3')switcher(2);
  },{capture:true,passive:false});

  addEventListener('keyup',event=>{
    const code=event.code;
    if(gameActive()&&code==='Space'){
      consume(event);
      k.power=false;
      return;
    }
    const gameplayCode=['ArrowLeft','ArrowRight','ArrowUp','KeyA','KeyD','KeyW','KeyX','KeyF','KeyQ','Digit1','Digit2','Digit3'].includes(code);
    if(gameplayCode&&gameActive())consume(event);
    if(code==='ArrowLeft'||code==='KeyA')k.left=false;
    if(code==='ArrowRight'||code==='KeyD')k.right=false;
    if(code==='ArrowUp'||code==='KeyW')k.jump=false;
    if(code==='KeyX'||code==='KeyF')k.power=false;
    if(code==='KeyQ')k.ultimate=false;
  },{capture:true,passive:false});

  addEventListener('blur',releaseAll);
  addEventListener('pagehide',releaseAll);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseAll()});

  document.querySelectorAll('[data-action]').forEach(button=>{
    const action=button.dataset.action;
    const press=event=>{
      consume(event);
      if(!isPlaying())return;
      activePointers.set(event.pointerId,action);
      k[action]=true;
      try{button.setPointerCapture(event.pointerId)}catch(_){}
      button.classList.add('isPressed');
    };
    const release=event=>{
      consume(event);
      const held=activePointers.get(event.pointerId)||action;
      if(held in k)k[held]=false;
      activePointers.delete(event.pointerId);
      button.classList.remove('isPressed');
      try{if(button.hasPointerCapture(event.pointerId))button.releasePointerCapture(event.pointerId)}catch(_){}
    };
    button.addEventListener('pointerdown',press,{passive:false});
    button.addEventListener('pointerup',release,{passive:false});
    button.addEventListener('pointercancel',release,{passive:false});
    button.addEventListener('lostpointercapture',release);
    button.addEventListener('click',consume,{passive:false});
  });

  return Object.assign(k,{releaseAll,focusCanvas,isPlaying});
}
class Adventure{
  constructor(canvas,ui,input,onComplete){
    this.canvas=canvas;this.ctx=canvas.getContext('2d');this.ui=ui;this.input=input;this.onComplete=onComplete;this.ctx.imageSmoothingEnabled=true;this.images={};this.loadAssets();this.reset();window.__questGame=this;
  }
  load(key,src){const im=new Image();im.src=src;this.images[key]=im}
  loadAssets(){this.load('home','assets/environments/home_base_remastered.svg');['will','daniel','caleb'].forEach(n=>['idle','walk','jump','attack','hurt','celebrate'].forEach(s=>this.load(`${n}_${s}`,`assets/sprites_hd/${n}_${s}.png`)));['idle','walk','bark'].forEach(s=>this.load(`rigsby_${s}`,`assets/sprites_hd/rigsby_${s}.png`))}
  reset(startingDude=0){
    this.state={health:4,cards:0,beacons:0,dude:clamp(startingDude,0,2),triangle:0,paused:false,bossDefeated:false,zoeyUnlocked:false,objective:{title:ZONES[0].objective,detail:ZONES[0].detail}};
    this.player={x:150,y:FLOOR-72,w:44,h:72,vx:0,vy:0,onGround:true,facing:1,inv:0,anim:'idle',animUntil:0};this.camera=0;this.running=false;this.last=0;this.finished=false;this.zoneId='home';this.zoneIntro=performance.now()+1300;this.jumpHeld=false;this.powerHeld=false;this.rigsby={x:265,y:FLOOR-42,w:56,h:40};
    this.cards=[650,1720,2600,3730,4630,7580].map((x,i)=>({x,y:FLOOR-100-(i%2)*95,w:38,h:52,taken:false}));
    this.beacons=[{x:3020,y:FLOOR-105,w:54,h:92,on:false},{x:4870,y:FLOOR-105,w:54,h:92,on:false},{x:6980,y:FLOOR-105,w:54,h:92,on:false}];
    this.platforms=[
      {x:1800,y:500,w:220,h:24},{x:2160,y:435,w:210,h:24},{x:2560,y:520,w:240,h:24},
      {x:3480,y:520,w:200,h:24},{x:3860,y:450,w:230,h:24},{x:4300,y:510,w:260,h:24},
      {x:5180,y:520,w:190,h:24},{x:5480,y:445,w:220,h:24},{x:5800,y:375,w:240,h:24},{x:6200,y:500,w:260,h:24},
      {x:7050,y:500,w:220,h:24},{x:7450,y:435,w:230,h:24}
    ];
    const hoaPositions=[1450,1750,2240,2580,2840,3310,3580,3890,4200,4740,5120,5400,5900,6220];
    this.enemies=hoaPositions.map((x,i)=>({
      x,y:FLOOR-54,w:52,h:54,vx:i%2?1.25:-1.25,min:x-110,max:x+110,
      alive:true,type:'hoa',hp:1,maxHp:1,cool:60+Math.random()*80
    }));
    const protestWave=[
      {x:6500,sign:['QUEER','IS A SIN'],shirt:'#66535f'},
      {x:6840,sign:['NO PRIDE','ALLOWED'],shirt:'#7a5e4f'},
      {x:7130,sign:['LOVE NEEDS','A PERMIT'],shirt:'#5e5a73'},
      {x:7420,sign:['KEEP CITY','HALL BEIGE'],shirt:'#6b6254'},
      {x:7660,sign:['FUN IS','ILLEGAL'],shirt:'#68536b'}
    ];
    protestWave.forEach((entry,i)=>this.enemies.push({
      ...entry,y:FLOOR-84,w:62,h:84,vx:i%2?.72:-.72,min:entry.x-90,max:entry.x+90,
      alive:true,type:'protester',hp:1,maxHp:1,signHp:1,signUp:true,cool:55+i*14
    }));
    this.enemies.push({
      x:7860,y:FLOOR-102,w:78,h:102,vx:-.62,min:7780,max:7920,alive:true,
      type:'leadProtester',hp:3,maxHp:3,signHp:2,signUp:true,cool:45,
      sign:['HATE SIGN','CAPTAIN'],shirt:'#8a405a'
    });
    this.enemies.forEach((enemy,index)=>{enemy.id=`enemy-${index}`;enemy.hitFlash=0;enemy.stun=0;enemy.knock=0;enemy.status='';});
    this.boss={x:8150,y:FLOOR-150,w:120,h:150,hp:10,maxHp:10,active:false,alive:true,cool:0,dir:-1};
    this.portal={x:8840,y:FLOOR-170,w:150,h:165,open:false};this.particles=[];
    this.heroShots=[];this.enemyShots=[];this.cookieBombs=[];this.positiveFields=[];this.heartCombo=0;this.shake=0;
    this.defeatEchoes=[];this.hitNumbers=[];this.switchCombo={heroes:[this.state.dude],expires:0};
    this.comboPulse=0;this.audioCtx=null;
    this.bossIntroShown=false;this.boss.phase=1;this.boss.summoned=false;
    this.zoneBanner={text:'HOME BASE',until:performance.now()+1500};
    this.bossEntranceUntil=0;
    this.cameraTarget=0;
    this.cameraZoom=1;
    this.cameraZoomTarget=1;
    this.coyoteFrames=8;
    this.jumpBufferFrames=0;
    this.wasGrounded=true;
    this.landImpact=0;
    this.motionTrail=[];
    this.powerFlash=0;
    this.tauntCooldown=0;
    this.lastBossPhase=1;this.bossHitFlash=0;this.arenaPulse=0;this.protestWaveAnnounced=false;this.protestersDefeated=0;this.combatFlash=0;
    this.heroTheme=DUDES[this.state.dude].color;
    this.worldPulse=0;
    this.weatherMode=['sunny','softClouds','golden'][Math.floor(Math.random()*3)];
    this.ambientSparkles=[];
    this.lastRestorationLevel=0;
    this.finale={active:false,stage:0,timer:0,complete:false,portalReady:false};
    this.cityHallDamage=0;
    this.cityHallBreakBurst=0;
    this.cityHallDebris=[];
    this.cityHallDamageStage=0;
    this.cityHallRepair=0;
    this.cityHallDust=[];
    this.ultimateHeld=false;
    this.ultimateFlash=0;
    this.celebrationNPCs=[];
    this.zoey={x:8665,y:FLOOR-40,w:54,h:38,active:false,cooldown:0,heart:0};
    this.petDuoTimer=420+Math.random()*300;
    this.secretSites=[
      {x:1180,y:FLOOR-46,found:false,label:'Home Base Paw Print'},
      {x:2940,y:FLOOR-46,found:false,label:'Hillcrest Back Alley'},
      {x:4560,y:FLOOR-46,found:false,label:'PCH Lookout'},
      {x:6360,y:FLOOR-46,found:false,label:'Studio Backlot'},
      {x:7860,y:FLOOR-46,found:false,label:'City Hall Side Door'}
    ];
    this.secretsFound=0;
    this.switchBurst=0;
    this.switchFrom=0;
    this.photoMode=false;
    this.cinematicActiveUntil=0;
    this.bossDialogueStage=0;
    this.zoneSeen=new Set(['home']);
    this.inputMode='PLAYING';
    this.ui.hud(this);
    this.updatePowerButton();
    qs('triangleUltimateBtn')?.classList.add('hidden');
  }
  start(save,startingDude=0){
    this.reset(startingDude);
    if(save)this.applySave(save);
    this.running=true;
    this.last=performance.now();
    const dude=DUDES[this.state.dude];
    this.updatePowerButton();
    this.ui.flash(`${dude.name} ready • ${dude.shortPower}`);
    setTimeout(()=>this.showCinematicZone(ZONES[0],'THE QUEST BEGINS'),180);
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
    if(!this.zoneSeen.has(z.id)){
      this.zoneSeen.add(z.id);
      const subtitles={
        hillcrest:'RESTORE THE NEIGHBORHOOD',
        pch:'CHASE COLOR DOWN THE COAST',
        hollywood:'LIGHTS. CAMERA. RAINBOW.',
        la:'CITY HALL SHOWDOWN'
      };
      this.showCinematicZone(z,subtitles[z.id]||'THE QUEST CONTINUES');
    }
  }
  loop(t){if(!this.running)return;const dt=clamp((t-this.last)/16.667||1,0,2);this.last=t;if(!this.state.paused)this.update(dt,t);this.draw(t);requestAnimationFrame(n=>this.loop(n))}
  update(dt,t){
    if(this.finale.active){
      this.updateFinale(dt,t);
      this.updateParticles(dt);
    for(const d of this.cityHallDebris){d.x+=d.vx*dt;d.y+=d.vy*dt;d.vy+=.16*dt;d.r+=d.spin*dt;d.life-=dt}
    this.cityHallDebris=this.cityHallDebris.filter(d=>d.life>0);
    if(this.cityHallBreakBurst>0)this.cityHallBreakBurst-=dt;
      if(this.worldPulse>0)this.worldPulse-=dt;
      if(this.ultimateFlash>0)this.ultimateFlash-=dt;
      this.ui.hud(this);
      return;
    }
    const d=DUDES[this.state.dude];
    if(this.input.left){this.player.vx-=.82*dt;this.player.facing=-1}
    if(this.input.right){this.player.vx+=.82*dt;this.player.facing=1}
    if(!this.input.left&&!this.input.right)this.player.vx*=Math.pow(.58,dt);if(Math.abs(this.player.vx)<.08)this.player.vx=0;
    this.player.vx=clamp(this.player.vx,-d.speed,d.speed);

    if(this.input.jump&&!this.jumpHeld)this.jumpBufferFrames=9;
    this.jumpHeld=this.input.jump;
    if(this.jumpBufferFrames>0)this.jumpBufferFrames-=dt;
    if(this.player.onGround)this.coyoteFrames=8;
    else this.coyoteFrames=Math.max(0,this.coyoteFrames-dt);

    if(this.jumpBufferFrames>0&&this.coyoteFrames>0){
      this.player.vy=-d.jump;
      this.player.onGround=false;
      this.coyoteFrames=0;
      this.jumpBufferFrames=0;
      this.landImpact=0;
      this.burst(this.player.x+22,this.player.y+this.player.h,'#ffe66d',16);
    }

    if(this.input.power&&!this.powerHeld){
      this.power(t);
      this.powerFlash=12;
    }
    this.powerHeld=this.input.power;

    if(this.input.ultimate&&!this.ultimateHeld)this.useTriangleUltimate();
    this.ultimateHeld=this.input.ultimate;

    const previouslyGrounded=this.player.onGround;
    const previousVy=this.player.vy;
    this.player.vy+=.72*dt;
    this.player.x+=this.player.vx*dt;
    this.player.y+=this.player.vy*dt;
    this.player.x=clamp(this.player.x,0,WORLD-this.player.w);
    this.player.onGround=false;

    if(this.player.y+this.player.h>=FLOOR){
      this.player.y=FLOOR-this.player.h;
      this.player.vy=0;
      this.player.onGround=true;
    }
    for(const p of this.platforms){
      if(this.player.x+this.player.w>p.x&&this.player.x<p.x+p.w&&this.player.y+this.player.h>=p.y&&this.player.y+this.player.h<=p.y+30&&this.player.vy>=0){
        this.player.y=p.y-this.player.h;
        this.player.vy=0;
        this.player.onGround=true;
      }
    }

    if(!previouslyGrounded&&this.player.onGround&&previousVy>5.5){
      this.landImpact=clamp(previousVy/14,0,1);
      this.shake=Math.max(this.shake,4+this.landImpact*7);
      this.burst(this.player.x+22,this.player.y+this.player.h,'#e9d7c1',18+Math.floor(this.landImpact*22));
    }

    if(Math.abs(this.player.vx)>3.5&&this.player.onGround&&Math.random()<.28*dt){
      this.particles.push({x:this.player.x+22-this.player.facing*16,y:this.player.y+this.player.h-5,vx:-this.player.vx*.25+(Math.random()-.5)*2,vy:-1-Math.random()*2,life:22+Math.random()*18,color:'rgba(255,255,255,.55)',s:2+Math.random()*3});
    }

    if(this.player.y>760){
      this.player.x=Math.max(100,this.zone().start+100);
      this.player.y=FLOOR-this.player.h;
      this.player.vx=this.player.vy=0;
    }

    const speedRatio=Math.abs(this.player.vx)/Math.max(1,d.speed);
    const lookAhead=this.player.facing*(56+speedRatio*38);
    this.cameraTarget=this.player.x-350+lookAhead;
    this.camera+=(clamp(this.cameraTarget,0,WORLD-W)-this.camera)*.11;
    this.camera=clamp(this.camera,0,WORLD-W);
    this.cameraZoomTarget=1;
    this.cameraZoom+=(1-this.cameraZoom)*.18;

    const z=this.zone();
    this.setZone(z);
    this.updatePets(dt,t);

    this.collect();
    this.updateEnemies(dt);
    this.updateHeroShots(dt);
    this.updatePositiveFields(dt);
    this.updateEnemyShots(dt);
    this.updateCookieBombs(dt);
    this.updateBoss(dt,t);
    this.updateCityHallDamage();
    if(this.boss.active&&this.boss.alive){
      if(this.bossDialogueStage===0)this.showBossTaunt(1);
      else if(this.boss.hp<=7&&this.bossDialogueStage<2)this.showBossTaunt(2);
      else if(this.boss.hp<=3&&this.bossDialogueStage<3)this.showBossTaunt(3);
    }
    this.updateParticles(dt);

    if(this.player.inv>0)this.player.inv-=dt;
    if(this.shake>0)this.shake-=dt;
    if(this.landImpact>0)this.landImpact-=.055*dt;
    if(this.powerFlash>0)this.powerFlash-=dt;
    if(this.tauntCooldown>0)this.tauntCooldown-=dt;
    if(this.worldPulse>0)this.worldPulse-=dt;
    if(this.switchBurst>0)this.switchBurst-=dt;if(this.bossHitFlash>0)this.bossHitFlash-=dt;if(this.arenaPulse>0)this.arenaPulse-=dt;if(this.combatFlash>0)this.combatFlash-=dt;if(this.ultimateFlash>0)this.ultimateFlash-=dt;if(this.comboPulse>0)this.comboPulse-=dt;
    if(this.switchCombo.expires&&t>this.switchCombo.expires)this.switchCombo={heroes:[this.state.dude],expires:0};
    for(const echo of this.defeatEchoes){echo.life-=dt;echo.y+=echo.vy*dt;echo.vy+=.05*dt;echo.x+=echo.vx*dt;echo.spin+=echo.spinV*dt}
    this.defeatEchoes=this.defeatEchoes.filter(e=>e.life>0);
    for(const hit of this.hitNumbers){hit.life-=dt;hit.y-=.7*dt}
    this.hitNumbers=this.hitNumbers.filter(h=>h.life>0);

    const restoration=this.restorationLevel();
    if(restoration>.15&&Math.random()<restoration*.025*dt){
      this.ambientSparkles.push({
        x:this.camera+Math.random()*W,
        y:260+Math.random()*310,
        vy:-.15-Math.random()*.35,
        drift:(Math.random()-.5)*.4,
        life:70+Math.random()*80,
        s:1.5+Math.random()*2.8,
        color:['#ffe66d','#ff4fb8','#3ce7d2','#ffffff'][Math.floor(Math.random()*4)]
      });
    }
    for(const sparkle of this.ambientSparkles){
      sparkle.x+=sparkle.drift*dt;
      sparkle.y+=sparkle.vy*dt;
      sparkle.life-=dt;
    }
    this.ambientSparkles=this.ambientSparkles.filter(s=>s.life>0);

    this.updateObjective();
    this.state.triangle=clamp(this.state.triangle+.01*dt,0,100);
    qs('triangleUltimateBtn')?.classList.toggle('hidden',this.state.triangle<100||!this.boss.active||!this.boss.alive);
    this.ui.hud(this);
  }
  setInputMode(mode){
    this.inputMode=mode;
    if(mode!=='PLAYING')this.input.releaseAll?.();
  }

  pauseGameplay(){
    if(this.inputMode!=='PLAYING')return;
    this.state.paused=true;
    this.setInputMode('PAUSED');
    qs('journal')?.classList.remove('hidden');
    this.input.releaseAll?.();
  }

  resumeGameplay(){
    qs('journal')?.classList.add('hidden');
    qs('dialogueBox')?.classList.add('hidden');
    this.state.paused=false;
    this.setInputMode('PLAYING');
    this.input.releaseAll?.();
    this.input.focusCanvas?.();
  }

  showCinematicZone(zone,subtitle='THE QUEST CONTINUES'){
    const card=qs('cinematicZoneCard');
    if(!card)return;
    qs('cinematicZoneTitle').textContent=zone.name;
    qs('cinematicZoneSubtitle').textContent=subtitle;
    card.classList.remove('hidden');
    card.classList.remove('play');
    void card.offsetWidth;
    card.classList.add('play');
    this.cinematicActiveUntil=performance.now()+2600;
    clearTimeout(this.zoneCardTimer);
    this.zoneCardTimer=setTimeout(()=>card.classList.add('hidden'),2550);
  }

  showPetMoment(title,text,icon='🐾'){
    const panel=qs('petMoment');
    if(!panel)return;
    qs('petMomentIcon').textContent=icon;
    qs('petMomentTitle').textContent=title;
    qs('petMomentText').textContent=text;
    panel.classList.remove('hidden');
    panel.classList.remove('show');
    void panel.offsetWidth;
    panel.classList.add('show');
    clearTimeout(this.petMomentTimer);
    this.petMomentTimer=setTimeout(()=>panel.classList.add('hidden'),2600);
  }

  findNearbySecret(){
    const site=this.secretSites.find(s=>!s.found&&Math.abs(this.rigsby.x-s.x)<105);
    if(!site)return;
    site.found=true;
    this.secretsFound++;
    this.state.triangle=clamp(this.state.triangle+8,0,100);
    this.burst(site.x,site.y-18,'#ffe66d',46);
    this.burst(site.x,site.y-18,'#3ce7d2',28);
    this.showPetMoment('Rigsby found a secret!',site.label,'🐶');
    showAchievement(`Secret ${this.secretsFound}/5 discovered`,'🐾');
    this.haptic([22,25,36]);
  }

  updatePets(dt,t){
    // During the rescue cinematic, updateFinale owns both dogs so they cannot duplicate or snap.
    if(this.finale.active)return;

    const facing=this.player.facing||1;
    const rigsbyTarget=this.state.zoeyUnlocked
      ? this.player.x-128*facing
      : this.player.x+118*facing;
    const zoeyTarget=this.player.x-72*facing;

    this.rigsby.x+=(clamp(rigsbyTarget,120,WORLD-90)-this.rigsby.x)*.09*dt;
    this.rigsby.y=FLOOR-43;
    this.findNearbySecret();

    if(!this.state.zoeyUnlocked){
      this.zoey.active=false;
      this.zoey.x=8665;
      this.zoey.y=FLOOR-40;
      return;
    }

    if(this.zoey.cooldown>0)this.zoey.cooldown-=dt;
    if(this.zoey.heart>0)this.zoey.heart-=dt;

    // Zoey's Guardian Heart is earned only after she is rescued.
    if(this.state.health<=1&&this.zoey.cooldown<=0){
      this.zoey.active=true;
      this.zoey.x=this.player.x-120*facing;
      this.zoey.cooldown=1200;
      this.zoey.heart=150;
      this.state.health=clamp(this.state.health+1,0,4);
      this.state.triangle=clamp(this.state.triangle+18,0,100);
      this.player.inv=Math.max(this.player.inv,140);
      this.burst(this.player.x+22,this.player.y+24,'#ff8db8',52);
      this.showPetMoment('Zoey to the rescue!','Guardian Heart restored one health and protected the trio.','❤️');
      showAchievement('Zoey’s Guardian Heart','🐶');
      this.haptic([35,30,65]);
    }

    this.zoey.active=true;
    this.zoey.x+=(clamp(zoeyTarget,120,WORLD-90)-this.zoey.x)*.12*dt;
    this.zoey.y=FLOOR-40;

    // Rare post-rescue moment where both dogs scout together.
    this.petDuoTimer-=dt;
    if(this.petDuoTimer<=0){
      this.petDuoTimer=520+Math.random()*420;
      this.zoey.heart=105;
      this.showPetMoment('The beagles are on the move!','Rigsby and Zoey are scouting ahead together.','🐾');
    }
  }

  showBossTaunt(stage){
    if(stage<=this.bossDialogueStage)return;
    this.bossDialogueStage=stage;
    const lines={
      1:['QUEEN OF BEIGE','Your little dog is staying in my HOA-approved cage.'],
      2:['QUEEN OF BEIGE','Why must everything be so colorful?'],
      3:['QUEEN OF BEIGE','You cannot defeat the HOA—or free that beagle!']
    };
    const data=lines[stage];
    if(!data)return;
    const panel=qs('bossTaunt');
    qs('bossTauntName').textContent=data[0];
    qs('bossTauntText').textContent=data[1];
    panel.classList.remove('hidden','show');
    void panel.offsetWidth;
    panel.classList.add('show');
    clearTimeout(this.bossTauntTimer);
    this.bossTauntTimer=setTimeout(()=>panel.classList.add('hidden'),2300);
    this.shake=Math.max(this.shake,stage===3?11:6);
    // Intentionally never pauses, changes focus, or changes input mode.
  }

  showBossDialogue(stage){
    // Backward-safe alias. Boss dialogue is now always non-blocking.
    this.showBossTaunt(stage);
  }

  togglePhotoMode(force=null){
    this.photoMode=force===null?!this.photoMode:Boolean(force);
    qs('photoMode')?.classList.toggle('hidden',!this.photoMode);
    document.body.classList.toggle('photoModeActive',this.photoMode);
    this.state.paused=this.photoMode;
    this.setInputMode(this.photoMode?'PHOTO_MODE':'PLAYING');
    if(!this.photoMode)this.input.focusCanvas?.();
  }

  restorationLevel(){
    const beaconProgress=this.state.beacons/3;
    const cardProgress=this.state.cards/6;
    const bossBonus=this.state.bossDefeated?0.25:0;
    return clamp(beaconProgress*.68+cardProgress*.17+bossBonus,0,1);
  }

  haptic(pattern){
    try{
      if(navigator.vibrate)navigator.vibrate(pattern);
    }catch(_){}
  }

  restorationBurst(x,y){
    this.worldPulse=30;
    this.shake=Math.max(this.shake,7);
    this.burst(x,y,'#3ce7d2',72);
    this.burst(x,y,'#ffe66d',48);
    this.burst(x,y,'#ff4fb8',36);
    this.haptic([28,35,42]);
  }

  enemyDefeated(e,color='#ff4fb8'){
    this.shake=Math.max(this.shake,8);
    this.burst(e.x+26,e.y+25,color,48);
    this.burst(e.x+26,e.y+25,'#ffe66d',22);
    for(let i=0;i<7;i++){
      this.particles.push({
        x:e.x+26+(Math.random()-.5)*18,
        y:e.y+24+(Math.random()-.5)*14,
        vx:(Math.random()-.5)*7,
        vy:-3-Math.random()*6,
        life:38+Math.random()*28,
        color:i%2?'#f3eadc':'#ff4fb8',
        s:3+Math.random()*5,
        paper:i%2===0
      });
    }
    this.haptic(18);
  }

  collect(){
    for(const c of this.cards){
      if(!c.taken&&overlap(this.player,c)){
        c.taken=true;
        this.state.cards++;
        this.state.triangle=clamp(this.state.triangle+12,0,100);
        this.worldPulse=14;
        this.shake=Math.max(this.shake,4);
        this.burst(c.x,c.y,'#ffe66d',44);
        this.burst(c.x,c.y,'#ff4fb8',24);
        this.haptic([18,18,28]);
        showCollect(`🌈 Gay Card ${this.state.cards}/6`);
      }
    }
    for(const b of this.beacons){
      if(!b.on&&overlap(this.player,b)){
        b.on=true;
        this.state.beacons++;
        this.state.triangle=clamp(this.state.triangle+18,0,100);
        this.restorationBurst(b.x+27,b.y+46);
        showAchievement(`Color restored ${this.state.beacons}/3`,'🔺');
        this.zoneBanner={text:['HILLCREST BLOOMS','THE COAST SHINES','LOS ANGELES RESTORED'][this.state.beacons-1]||'COLOR RESTORED',until:performance.now()+1900};
      }
    }
  }
  updateEnemies(dt){
    for(const e of this.enemies){
      if(!e.alive)continue;
      if(e.hitFlash>0)e.hitFlash-=dt;
      if(e.stun>0)e.stun-=dt;
      if(e.heartHeld>0){e.heartHeld-=dt;e.vx*=Math.pow(.82,dt);e.status='HEARTFIELD'}
      else if(e.status==='HEARTFIELD')e.status='';
      if(Math.abs(e.knock||0)>.08){e.x+=e.knock*dt;e.knock*=Math.pow(.72,dt)}
      if(e.stun<=0)e.x+=e.vx*dt;
      if(e.x<e.min||e.x>e.max)e.vx*=-1;

      if((e.type==='protester'||e.type==='leadProtester')&&e.stun<=0){
        e.cool=(e.cool||70)-dt;
        const distance=Math.abs(this.player.x-e.x);
        if(distance<520&&e.cool<=0){
          e.cool=e.type==='leadProtester'?48:90+Math.random()*45;
          const direction=this.player.x<e.x?-1:1;
          this.enemyShots.push({
            x:e.x+(direction<0?-10:e.w),y:e.y+26,w:44,h:26,
            vx:direction*(e.type==='leadProtester'?7.1:5.6),
            vy:-1.2+Math.random()*2.4,life:150,type:'pamphlet',
            label:e.sign?.[0]||'NO PRIDE'
          });
        }
      }

      if(overlap(this.player,e)&&this.player.inv<=0)this.hurt(e.x);
    }

    if(this.player.x>6250&&!this.protestWaveAnnounced){
      this.protestWaveAnnounced=true;
      this.zoneBanner={text:'HATE-SIGN BLOCKADE',until:performance.now()+1900};
      this.showCombatStatus('PROTEST WAVE','Break their signs, then clear the path.','🪧');
    }
  }
  showCombatStatus(title,text,icon='⚡'){
    const panel=qs('combatStatus');
    if(!panel)return;
    panel.innerHTML=`<span>${icon}</span><div><b>${title}</b><small>${text}</small></div>`;
    panel.classList.remove('hidden','show');
    void panel.offsetWidth;
    panel.classList.add('show');
    clearTimeout(this.combatStatusTimer);
    this.combatStatusTimer=setTimeout(()=>panel.classList.add('hidden'),2500);
  }

  damageEnemy(e,amount=1,source='rainbow'){
    if(!e||!e.alive)return false;
    let remaining=amount;
    e.hitFlash=12;e.stun=Math.max(e.stun||0,source==='heart'?20:8);
    const sourceColor=source==='cookie'?'#ff9a3c':source==='heart'?'#3ce7d2':'#ff4fb8';

    if(e.signUp){
      e.signHp=(e.signHp??1)-remaining;
      if(e.signHp<=0){
        remaining=Math.max(0,-e.signHp);
        e.signUp=false;e.knock=(this.player.x<e.x?1:-1)*2.8;
        this.shake=Math.max(this.shake,7);this.combatFlash=15;
        this.burst(e.x+e.w/2,e.y-15,'#ffe66d',42);
        for(let i=0;i<12;i++)this.particles.push({
          x:e.x+e.w/2+(Math.random()-.5)*40,y:e.y-12+(Math.random()-.5)*25,
          vx:(Math.random()-.5)*8,vy:-2-Math.random()*6,life:45+Math.random()*35,
          color:i%2?'#d8c3a6':'#ff4fb8',s:3+Math.random()*5,paper:true
        });
        this.ui.flash(e.type==='leadProtester'?'Captain’s hate sign shattered!':'Hate sign shattered!');
      }else{
        remaining=0;this.burst(e.x+e.w/2,e.y-20,'#d8c3a6',24);
      }
    }

    if(remaining>0){
      e.hp=(e.hp??1)-remaining;
      e.knock=(this.player.x<e.x?1:-1)*(source==='cookie'?5.2:source==='heart'?2.2:3.5);
      this.hitNumbers.push({x:e.x+e.w/2,y:e.y-12,text:source==='heart'?'♥':source==='cookie'?'BOOM':'✦',color:sourceColor,life:32});
    }

    if(e.hp<=0){
      e.alive=false;
      this.defeatEchoes.push({x:e.x+e.w/2,y:e.y+e.h/2,vx:e.knock*.45,vy:-2.4,spin:0,spinV:(Math.random()-.5)*.12,life:42,type:e.type||'hoa',source,color:sourceColor,w:e.w,h:e.h});
      if(e.type==='protester'||e.type==='leadProtester'){
        this.protestersDefeated++;
        this.enemyDefeated(e,sourceColor);
        this.ui.flash(e.type==='leadProtester'?'Blockade captain fled!':'Hate-sign protester fled!');
        if(e.type==='leadProtester'){
          this.showCombatStatus('BLOCKADE CLEARED','City Hall is open. The Queen is next.','🌈');
          showAchievement('Hate-Sign Blockade Cleared','🪧');
        }
      }else{
        this.enemyDefeated(e,sourceColor);
        this.ui.flash(source==='heart'?'HOA Bot loved into oblivion!':source==='cookie'?'HOA Bot cookie-crunched!':'HOA Bot rainbowed!');
      }
      this.sound(source==='heart'?'heartPop':source==='cookie'?'cookie':'ricochet');
      return true;
    }

    this.burst(e.x+e.w/2,e.y+e.h/2,sourceColor,18);
    return false;
  }

  hurt(source){this.state.health--;this.player.inv=100;this.player.vx=source<this.player.x?7:-7;this.player.vy=-7;this.burst(this.player.x,this.player.y,'#ff6b8a',18);if(this.state.health<=0){this.state.health=4;const z=this.zone();this.player.x=z.start+100;this.player.y=FLOOR-this.player.h;this.camera=clamp(this.player.x-250,0,WORLD-W)}}
  sound(kind='hit'){
    try{
      const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
      if(!this.audioCtx)this.audioCtx=new AC();
      const ctx=this.audioCtx;if(ctx.state==='suspended')ctx.resume();
      const osc=ctx.createOscillator(),gain=ctx.createGain();
      const now=ctx.currentTime;
      const tones={ricochet:[660,980,.08,'triangle'],heart:[520,740,.13,'sine'],heartPop:[380,880,.18,'sine'],cookie:[150,60,.2,'square'],switch:[420,620,.08,'sine'],combo:[440,1040,.28,'triangle']};
      const [from,to,duration,type]=tones[kind]||[280,420,.08,'sine'];
      osc.type=type;osc.frequency.setValueAtTime(from,now);osc.frequency.exponentialRampToValueAtTime(Math.max(30,to),now+duration);
      gain.gain.setValueAtTime(.035,now);gain.gain.exponentialRampToValueAtTime(.001,now+duration);
      osc.connect(gain).connect(ctx.destination);osc.start(now);osc.stop(now+duration+.02);
    }catch(_){/* sound is optional */}
  }

  power(t){
    this.player.anim='attack';this.player.animUntil=t+430;const dude=this.state.dude;
    if(dude===0){
      this.heroShots.push({type:'rainbow',x:this.player.x+(this.player.facing>0?48:-18),y:this.player.y+30,w:58,h:22,vx:this.player.facing*12.8,vy:0,life:130,trail:[],bounces:2,hitTargets:[]});
      this.shake=Math.max(this.shake,5);this.burst(this.player.x+22,this.player.y+32,'#ffe66d',20);this.burst(this.player.x+22,this.player.y+32,'#ff4fb8',16);
      this.sound('ricochet');this.haptic(10);this.ui.flash('Rainbow Ricochet!');return;
    }
    if(dude===1){
      const facing=this.player.facing||1;
      this.heroShots.push({type:'heart',x:this.player.x+(facing>0?44:-20),y:this.player.y+22,w:38,h:34,vx:facing*10.2,vy:0,life:132,age:0,trail:[],facing});
      this.player.inv=Math.max(this.player.inv,42);this.shake=Math.max(this.shake,4);
      // Daniel gets one clean heart pulse—no glitter cloud.
      this.switchBurst=Math.max(this.switchBurst,10);
      this.burst(this.player.x+22,this.player.y+32,'#ff79bd',14);
      this.sound('heart');this.haptic([12,20,18]);this.ui.flash('Heartfield launched!');return;
    }
    this.cookieBombs.push({x:this.player.x+(this.player.facing>0?48:-12),y:this.player.y+22,w:32,h:32,vx:this.player.facing*7.4,vy:-7.4,life:180,fuse:38,stuck:false,target:null});
    this.shake=Math.max(this.shake,3);this.burst(this.player.x+22,this.player.y+28,'#ff9a3c',14);
    this.sound('cookie');this.haptic(18);this.ui.flash('Sticky Cookie!');
  }

  findRicochetTarget(shot,from){
    const candidates=this.enemies.filter(e=>e.alive&&!shot.hitTargets.includes(e));
    if(this.boss.active&&this.boss.alive&&!shot.hitTargets.includes(this.boss))candidates.push(this.boss);
    let best=null,bestDistance=430*430;
    for(const target of candidates){
      const dx=(target.x+target.w/2)-(from.x+from.w/2),dy=(target.y+target.h/2)-(from.y+from.h/2),distance=dx*dx+dy*dy;
      if(distance<bestDistance){bestDistance=distance;best=target}
    }
    return best;
  }

  redirectRicochet(shot,from){
    if(shot.bounces<=0)return false;
    const target=this.findRicochetTarget(shot,from);if(!target)return false;
    const dx=(target.x+target.w/2)-(from.x+from.w/2),dy=(target.y+target.h/2)-(from.y+from.h/2),len=Math.max(1,Math.hypot(dx,dy));
    shot.x=from.x+from.w/2-shot.w/2;shot.y=from.y+from.h/2-shot.h/2;
    shot.vx=dx/len*13.4;shot.vy=dy/len*13.4;shot.bounces--;shot.life=Math.max(shot.life,48);
    this.burst(shot.x+shot.w/2,shot.y+shot.h/2,'#ffe66d',28);this.sound('ricochet');
    return true;
  }

  updateHeroShots(dt){
    for(const s of this.heroShots){
      s.age=(s.age||0)+dt;s.trail.push({x:s.x,y:s.y});if(s.trail.length>(s.type==='heart'?15:13))s.trail.shift();

      if(s.type==='heart'){
        const candidates=this.enemies.filter(e=>e.alive&&((s.vx>0&&e.x>s.x-35)||(s.vx<0&&e.x<s.x+35))&&Math.abs(e.x-s.x)<520);
        if(this.boss.active&&this.boss.alive&&((s.vx>0&&this.boss.x>s.x-50)||(s.vx<0&&this.boss.x<s.x+50))&&Math.abs(this.boss.x-s.x)<620)candidates.push(this.boss);
        let target=null,best=Infinity;
        for(const e of candidates){const dx=(e.x+e.w/2)-(s.x+s.w/2),dy=(e.y+e.h/2)-(s.y+s.h/2),d=dx*dx+dy*dy;if(d<best){best=d;target=e}}
        if(target){const targetY=target.y+target.h*.45-s.h/2;s.vy+=(targetY-s.y)*.018*dt;s.vy=clamp(s.vy,-4.2,4.2);s.vx+=Math.sign((target.x+target.w/2)-(s.x+s.w/2))*.08*dt;s.vx=clamp(s.vx,-12.5,12.5)}
      }

      s.x+=s.vx*dt;s.y+=(s.vy||0)*dt;s.life-=dt;
      let handled=false;
      for(const e of this.enemies){
        if(!e.alive||s.hitTargets?.includes(e)||!overlap(s,e))continue;
        handled=true;
        if(s.type==='heart'){s.life=0;this.spawnPositiveField(e.x+e.w/2,e.y+e.h/2,e,false)}
        else{
          s.hitTargets.push(e);this.damageEnemy(e,1,'rainbow');
          if(!this.redirectRicochet(s,e))s.life=0;
        }
        break;
      }
      if(!handled&&this.boss.active&&this.boss.alive&&!s.hitTargets?.includes(this.boss)&&overlap(s,this.boss)){
        if(s.type==='heart'){s.life=0;this.spawnPositiveField(this.boss.x+this.boss.w/2,this.boss.y+this.boss.h/2,this.boss,true)}
        else{s.hitTargets.push(this.boss);this.damageBoss(1,'Rainbow ricochet!');if(!this.redirectRicochet(s,this.boss))s.life=0}
      }
    }
    this.heroShots=this.heroShots.filter(s=>s.life>0&&s.x>-100&&s.x<WORLD+100&&s.y>-120&&s.y<H+120);
  }

  spawnPositiveField(x,y,target,isBoss=false){
    if(target&&this.positiveFields.some(f=>f.target===target&&!f.detonated))return;
    this.positiveFields.push({x,y,target,isBoss,life:62,maxLife:62,age:0,radius:20,detonated:false,absorbed:0});
    if(target&&!isBoss){target.heartHeld=62;target.status='HEARTFIELD';target.stun=Math.max(target.stun||0,32);}
    this.burst(x,y,'#ff79bd',38);
    this.burst(x,y,'#3ce7d2',28);
    this.shake=Math.max(this.shake,6);
    this.ui.flash(isBoss?'Queen trapped in a Heartfield!':'HOA ghost trapped in a Heartfield!');
  }

  updatePositiveFields(dt){
    for(const f of this.positiveFields){
      f.age+=dt;f.life-=dt;
      if(f.target&&((f.isBoss&&this.boss.alive)||(!f.isBoss&&f.target.alive))){
        f.x=f.target.x+f.target.w/2;f.y=f.target.y+f.target.h/2;
        if(!f.isBoss){f.target.heartHeld=Math.max(f.target.heartHeld||0,f.life);f.target.vx*=Math.pow(.78,dt)}
      }
      f.radius=20+Math.sin(clamp(f.age/30,0,1)*Math.PI/2)*78;

      for(const shot of this.enemyShots){
        if(shot.life<=0)continue;
        const dx=shot.x+shot.w/2-f.x,dy=shot.y+shot.h/2-f.y;
        if(dx*dx+dy*dy<f.radius*f.radius){
          shot.life=0;f.absorbed++;
          this.burst(shot.x,shot.y,'#3ce7d2',14);
        }
      }

      if(!f.detonated&&f.age>=30){
        f.detonated=true;
        this.shake=Math.max(this.shake,13);
        this.combatFlash=Math.max(this.combatFlash,22);
        this.burst(f.x,f.y,'#ff4fb8',82);
        this.burst(f.x,f.y,'#3ce7d2',58);
        this.burst(f.x,f.y,'#ffe66d',35);

        let defeated=false;
        if(f.isBoss){
          if(this.boss.alive)this.damageBoss(1,'Heartfield explosion!');
        }else if(f.target&&f.target.alive){
          const amount=f.target.type==='hoa'?2:1;
          defeated=this.damageEnemy(f.target,amount,'heart');
        }
        const triangleGain=(defeated?8:3)+Math.min(6,f.absorbed*2);
        this.state.triangle=clamp(this.state.triangle+triangleGain,0,100);

        for(const e of this.enemies){
          if(!e.alive||e===f.target)continue;
          const dx=e.x+e.w/2-f.x,dy=e.y+e.h/2-f.y;
          if(dx*dx+dy*dy<135*135)this.damageEnemy(e,1,'heart');
        }
        this.heartCombo++;
        this.ui.flash(f.absorbed?`Heartfield burst • +${Math.min(6,f.absorbed*2)} Triangle!`:'Heartfield burst • Triangle charged!');this.sound('heartPop');
      }
    }
    this.positiveFields=this.positiveFields.filter(f=>f.life>0);
  }

  updateCookieBombs(dt){
    for(const b of this.cookieBombs){
      if(b.stuck){
        b.fuse-=dt;b.life-=dt;
        if(b.target&&b.target.alive){b.x=b.target.x+b.target.w/2-b.w/2;b.y=b.target.y-8}
        else b.target=null;
        if(b.fuse<=0){b.life=0;this.explodeCookie(b.x+b.w/2,b.y+b.h/2)}
        continue;
      }

      b.x+=b.vx*dt;b.y+=b.vy*dt;b.vy+=.42*dt;b.life-=dt;
      let target=null;
      for(const e of this.enemies){if(e.alive&&overlap(b,e)){target=e;break}}
      if(!target&&this.boss.active&&this.boss.alive&&overlap(b,this.boss))target=this.boss;
      if(target){
        b.stuck=true;b.target=target;b.vx=b.vy=0;b.fuse=34;
        if(target!==this.boss){target.status='COOKIE';target.stun=Math.max(target.stun||0,8)}
        this.ui.flash('Cookie stuck!');this.burst(b.x,b.y,'#ffe66d',18);continue;
      }
      if(b.y+b.h>=FLOOR){b.y=FLOOR-b.h;b.vx=b.vy=0;b.stuck=true;b.fuse=30;this.ui.flash('Cookie armed!')}
      if(b.life<=0){b.life=0;this.explodeCookie(b.x+b.w/2,b.y+b.h/2)}
    }
    this.cookieBombs=this.cookieBombs.filter(b=>b.life>0);
  }

  explodeCookie(x,y){
    this.shake=15;this.combatFlash=Math.max(this.combatFlash,20);this.burst(x,y,'#ff9a3c',82);this.burst(x,y,'#ffe66d',48);this.sound('cookie');this.haptic([25,20,55]);
    for(const e of this.enemies)if(e.alive&&Math.hypot(e.x-x,e.y-y)<220){e.status='';this.damageEnemy(e,2,'cookie')}
    if(this.boss.active&&this.boss.alive&&Math.hypot(this.boss.x-x,this.boss.y-y)<280)this.damageBoss(2,'Cookie explosion!');
  }

  updateEnemyShots(dt){
    for(const s of this.enemyShots){
      if(s.life<=0)continue;
      s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;
      if(overlap(this.player,s)){
        if(this.state.dude===1&&this.player.inv>0){s.vx*=-1.4;s.vy*=.4;s.reflected=true;this.burst(s.x,s.y,'#3ce7d2',18)}
        else if(this.player.inv<=0){this.hurt(s.x);s.life=0}
      }
      if(s.reflected&&this.boss.active&&this.boss.alive&&overlap(s,this.boss)){s.life=0;this.damageBoss(1,'Heartfield reflection!')}
    }
    this.enemyShots=this.enemyShots.filter(s=>s.life>0&&s.x>-200&&s.x<WORLD+200);
  }

  useTriangleUltimate(){
    if(this.state.triangle<100||!this.boss.active||!this.boss.alive||this.finale.active)return;
    this.state.triangle=0;
    this.ultimateFlash=95;
    this.worldPulse=70;
    this.shake=30;
    this.cameraZoom=.94;
    this.cameraZoomTarget=1.08;
    this.input.releaseAll?.();
    this.burst(this.player.x+22,this.player.y+30,'#ff4fb8',75);
    this.burst(this.player.x+22,this.player.y+30,'#3ce7d2',75);
    this.burst(this.boss.x+60,this.boss.y+60,'#ffe66d',120);
    this.showCombatStatus('TRIANGLE POWER!','Will, Daniel, and Caleb combine into one giant prism blast.','△');
    this.haptic([55,35,85,35,120]);
    this.damageBoss(4,'TRIANGLE POWER!');
    qs('triangleUltimateBtn')?.classList.add('hidden');
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
    else if(this.enemies.some(e=>e.type==='leadProtester'&&e.alive))this.state.objective={title:'Clear the Hate-Sign Blockade',detail:'Break the protest captain’s sign and clear the City Hall entrance.'};
    else if(this.boss.alive&&!this.boss.active)this.state.objective={title:'Enter Beige City Hall',detail:'The blockade is gone. Cross the rainbow security gate and confront the Queen.'};
    else if(this.boss.active&&this.boss.alive)this.state.objective={title:`Defeat the Queen — Phase ${this.boss.phase}`,detail:'Will ricochets through groups. Daniel traps enemies. Caleb sticks timed cookie bombs.'};
    else if(this.finale.active)this.state.objective={title:'Zoey Rescue',detail:'Stay with the beagles while the city celebrates.'};
    else this.state.objective={title:'Enter the Lake Tahoe Portal',detail:'Southern California is restored. Adventure 2 awaits.'};
  }

  updateBoss(dt,t){
    const prereq=this.state.cards===6&&this.state.beacons===3,arenaX=7980;
    if(this.player.x>arenaX&&!prereq){
      this.player.x=arenaX-55;this.player.vx=-2;
      const cards=6-this.state.cards,beacons=3-this.state.beacons;
      this.ui.flash(`City Hall locked: ${cards} card${cards===1?'':'s'}, ${beacons} beacon${beacons===1?'':'s'} remaining.`);return;
    }
    const protestCaptain=this.enemies.find(e=>e.type==='leadProtester'&&e.alive);
    if(this.player.x>arenaX-8&&prereq&&protestCaptain){
      this.player.x=arenaX-70;this.player.vx=-3;
      this.ui.flash('Clear the hate-sign blockade before entering City Hall.');return;
    }
    if(this.player.x>arenaX&&prereq&&this.boss.alive){
      this.boss.active=true;
      if(!this.bossIntroShown){
        this.bossIntroShown=true;
        this.bossEntranceUntil=t+1900;
        this.zoneBanner={text:'FINAL BOSS — QUEEN OF BEIGE',until:t+1900};
        this.ui.flash('That rainbow is NOT HOA approved.');
        this.shake=14;
        this.tauntCooldown=110;
      }
    }
    if(!this.boss.active||!this.boss.alive)return;
    const phase=this.boss.phase,speed=phase===1?1.05:phase===2?1.65:2.15;
    if(phase!==this.lastBossPhase){
      this.lastBossPhase=phase;
      const phaseLines={
        2:'Your happiness exceeds city code.',
        3:'I am writing ALL THREE of you up!'
      };
      this.ui.flash(phaseLines[phase]||'Absolutely not.');
      this.shake=18;
      this.tauntCooldown=130;
    }
    if(this.tauntCooldown<=0&&Math.random()<.0022*dt){
      const taunts=[
        'Sir...that outfit requires approval.',
        'Excessive joy is a violation.',
        'Your lawn is too fabulous.',
        'Absolutely not.',
        'This neighborhood was beige for a reason.'
      ];
      this.ui.flash(taunts[Math.floor(Math.random()*taunts.length)]);
      this.tauntCooldown=150;
    }
    if(phase===3&&Math.random()<.006*dt){
      const oldX=this.boss.x;this.boss.x=8085+Math.random()*390;this.burst(oldX+60,this.boss.y+70,'#c8b99b',34);this.burst(this.boss.x+60,this.boss.y+70,'#ff4fb8',42);this.shake=11;
    }else{this.boss.x+=this.boss.dir*speed*dt;if(this.boss.x<8080||this.boss.x>8500)this.boss.dir*=-1;}
    this.boss.cool-=dt;
    if(this.boss.cool<=0){
      this.boss.cool=phase===1?85:phase===2?58:42;
      if(phase===1)this.enemyShots.push({x:this.boss.x,y:this.boss.y+55,w:42,h:24,vx:-6.5,vy:0,life:190,type:'fine',label:['TOO GAY','JOY FINE','NO COLOR','$900'][Math.floor(Math.random()*4)]});
      else if(phase===2)for(const vy of [-2.4,0,2.4])this.enemyShots.push({x:this.boss.x,y:this.boss.y+55,w:34,h:20,vx:-7.2,vy,life:190,type:'beige'});
      else{
        this.enemyShots.push({x:this.boss.x,y:this.boss.y+45,w:52,h:22,vx:-8,vy:-1.3,life:200,type:'fine',label:'TOO FAB'});
        this.enemyShots.push({x:this.boss.x,y:this.boss.y+90,w:44,h:22,vx:-8,vy:1.3,life:200,type:'fine',label:'HAPPINESS'});
        if(!this.boss.summoned){
          this.boss.summoned=true;
          this.enemies.push({x:7950,y:FLOOR-54,w:52,h:54,vx:1.4,min:7880,max:8100,alive:true},{x:8580,y:FLOOR-54,w:52,h:54,vx:-1.4,min:8500,max:8720,alive:true});
          this.ui.flash('Phase 3: HOA reinforcements!');
        }
      }
    }
    if(phase>=2&&Math.random()<.0035*dt){const rainX=7980+Math.random()*650;this.enemyShots.push({x:rainX,y:180,w:28,h:34,vx:0,vy:5.3,life:110,type:'beigeRain'});}
    if(overlap(this.player,this.boss)&&this.player.inv<=0)this.hurt(this.boss.x);
  }

  updateCityHallDamage(){
    if(!this.boss.active||!this.boss.alive)return;
    const damage=clamp(1-this.boss.hp/this.boss.maxHp,0,1);
    this.cityHallDamage=damage;
    const stage=damage>=.75?3:damage>=.45?2:damage>=.18?1:0;
    if(stage>this.cityHallDamageStage){
      this.cityHallDamageStage=stage;
      this.cityHallBreakBurst=32;
      this.shake=Math.max(this.shake,stage===3?24:14);
      const burstX=7520+stage*170;
      this.burst(burstX,360,'#e9d7c1',55+stage*25);
      for(let i=0;i<10+stage*7;i++){
        this.cityHallDebris.push({
          x:burstX+(Math.random()-.5)*180,
          y:300+Math.random()*170,
          vx:(Math.random()-.5)*(3+stage),
          vy:-1-Math.random()*4,
          spin:(Math.random()-.5)*.15,
          r:Math.random()*6,
          life:85+Math.random()*85,
          size:3+Math.random()*7,
          color:i%3===0?'#8d5cff':i%3===1?'#d8c3a6':'#f3eadf'
        });
      }
      this.showCombatStatus(
        stage===3?'CITY HALL IS COLLAPSING':stage===2?'CITY HALL IS BREAKING':'CITY HALL IS CRACKING',
        stage===3?'Finish the Queen before the whole façade comes down.':stage===2?'The beige spell cannot hold the building together.':'Every hit is breaking the Queen’s grip.',
        '🏛️'
      );
    }
  }

  defeatBoss(){
    if(this.finale.active||this.state.bossDefeated)return;
    this.boss.alive=false;
    this.boss.active=false;
    this.state.bossDefeated=true;
    this.portal.open=false;
    this.finale={active:true,stage:0,timer:0,complete:false,portalReady:false};
    this.player.vx=0;this.player.vy=0;this.player.x=8420;this.player.y=FLOOR-this.player.h;
    this.setInputMode('OVERLAY');
    this.input.releaseAll?.();
    this.worldPulse=90;this.shake=34;this.cameraZoom=.92;
    this.cityHallDamage=1;this.cityHallDamageStage=3;this.cityHallBreakBurst=60;
    for(let i=0;i<34;i++)this.cityHallDebris.push({x:7700+Math.random()*520,y:270+Math.random()*220,vx:(Math.random()-.5)*8,vy:-2-Math.random()*6,spin:(Math.random()-.5)*.22,r:0,life:110+Math.random()*120,size:3+Math.random()*8,color:i%3===0?'#ff4fb8':i%3===1?'#d8c3a6':'#ffe66d'});
    this.state.objective={title:'Zoey Rescue',detail:'The Queen is defeated. Stay with the beagles for this moment.'};
    this.burst(this.boss.x+60,this.boss.y+70,'#ffe66d',150);
    this.burst(this.boss.x+60,this.boss.y+70,'#ff4fb8',110);
    this.showFinaleCard('QUEEN DEFEATED','The beige spell is breaking.','ADVENTURE 1 FINALE');
    this.haptic([45,35,80,45,120]);
  }

  showFinaleCard(title,text,eyebrow='ADVENTURE 1 FINALE'){
    const card=qs('finaleCard');if(!card)return;
    qs('finaleEyebrow').textContent=eyebrow;qs('finaleTitle').textContent=title;qs('finaleText').textContent=text;
    card.classList.remove('hidden','show');void card.offsetWidth;card.classList.add('show');
    clearTimeout(this.finaleCardTimer);this.finaleCardTimer=setTimeout(()=>card.classList.add('hidden'),2350);
  }

  updateFinale(dt,t){
    const f=this.finale;f.timer+=dt;
    this.player.vx=0;this.player.vy=0;
    this.cameraTarget=8260;this.camera+=(this.cameraTarget-this.camera)*.055;
    this.cameraZoom+=(1.035-this.cameraZoom)*.035;
    if(Math.random()<.22*dt)this.ambientSparkles.push({x:8100+Math.random()*720,y:250+Math.random()*340,vy:-.35-Math.random()*.5,drift:(Math.random()-.5)*.5,life:70+Math.random()*80,s:2+Math.random()*3,color:['#ffe66d','#ff4fb8','#3ce7d2','#fff'][Math.floor(Math.random()*4)]});
    for(const s of this.ambientSparkles){s.x+=s.drift*dt;s.y+=s.vy*dt;s.life-=dt}this.ambientSparkles=this.ambientSparkles.filter(s=>s.life>0);

    if(f.stage===0&&f.timer>78){
      f.stage=1;f.timer=0;this.shake=8;
      this.showFinaleCard('WAIT...','The cage is moving.','CITY HALL FALLS SILENT');
      this.burst(8665,FLOOR-90,'#e9d7c1',42);
    }else if(f.stage===1&&f.timer>92){
      f.stage=2;f.timer=0;
      this.state.zoeyUnlocked=true;this.zoey.active=true;this.zoey.x=8660;this.zoey.y=FLOOR-40;this.zoey.heart=300;
      this.rigsby.x=8460;
      this.showFinaleCard('ZOEY!','Rigsby sees her.','THE CAGE OPENS');
      this.burst(8665,FLOOR-70,'#ff8db8',110);this.haptic([30,30,55]);
    }else if(f.stage===2){
      this.rigsby.x+=(8550-this.rigsby.x)*.065*dt;this.zoey.x+=(8588-this.zoey.x)*.055*dt;
      if(f.timer>125){f.stage=3;f.timer=0;this.showFinaleCard('WE GOT HER.','Rigsby and Zoey are together again.','THE BEAGLES REUNITE');this.burst(8570,FLOOR-55,'#ff4fb8',90);this.burst(8570,FLOOR-55,'#ffe66d',65);showAchievement('Zoey Rescued!','🐶');}
    }else if(f.stage===3&&f.timer>115){
      f.stage=4;f.timer=0;
      this.celebrationNPCs=Array.from({length:12},(_,i)=>({x:8070+i*62,y:FLOOR-42,bob:Math.random()*6,color:['#ff4fb8','#3ce7d2','#ffe66d','#8d5cff','#ff9a3c'][i%5]}));
      this.showFinaleCard('COLOR RESTORED','Southern California celebrates.','THE CITY COMES BACK TO LIFE');
      this.worldPulse=130;this.shake=10;
    }else if(f.stage===4&&f.timer>120){
      f.stage=5;f.timer=0;this.portal.open=true;f.portalReady=true;
      this.showFinaleCard('ADVENTURE 2 AWAITS','Take Rigsby and Zoey into Lake Tahoe.','PORTAL OPEN');
      this.burst(this.portal.x+75,this.portal.y+82,'#3ce7d2',120);this.burst(this.portal.x+75,this.portal.y+82,'#ff4fb8',100);this.haptic([40,30,70,30,100]);
    }else if(f.stage===5&&f.timer>110){
      f.stage=6;f.timer=0;f.active=false;f.complete=true;f.completedAt=performance.now();
      this.rigsby.x=this.player.x-128*(this.player.facing||1);
      this.zoey.x=this.player.x-72*(this.player.facing||1);
      this.state.objective={title:'Enter the Lake Tahoe Portal',detail:'Zoey is safe. Rigsby and Zoey are ready for Adventure 2.'};
      this.setInputMode('PLAYING');this.input.focusCanvas?.();
      this.showPetMoment('Both beagles are ready!','Take one last look at restored City Hall, then enter the portal.','🐾');
    }
    this.ui.hud(this);
  }

  checkPortal(){if(this.portal.open&&this.finale.complete&&overlap(this.player,this.portal)&&!this.finished){this.finished=true;this.running=false;setTimeout(()=>this.onComplete(this.state),500)}}
  draw(t){
    const c=this.ctx;
    c.clearRect(0,0,W,H);
    c.save();

    if(this.shake>0)c.translate((Math.random()-.5)*this.shake,(Math.random()-.5)*this.shake);

    const z=this.cameraZoom||1;
    c.translate(W/2,H/2);
    c.scale(z,z);
    c.translate(-W/2,-H/2);

    this.drawSky(t);
    c.save();
    c.translate(-this.camera,0);
    this.drawWorld(t);
    this.drawLivingWorld(t);
    this.drawCinematicLife(t);
    this.drawCollectibles(t);
    this.drawPositiveFields(t);
    this.drawEnemies(t);
    this.drawHeroShots(t);
    this.drawCookieBombs(t);
    this.drawEnemyShots(t);
    this.drawBossArenaFX(t);
    this.drawBoss(t);
    this.drawPortal(t);
    this.drawFinale(t);
    if(this.finale.complete&&performance.now()-(this.finale.completedAt||0)>=2400){
      this.finale.complete=false;
    }
    this.drawRigsby(t);
    this.drawPlayer(t);
    this.drawCombatReactions(t);
    this.drawParticles();
    c.restore();

    this.drawDynamicLighting(t);
    c.restore();

    this.drawVignette();
    this.drawZoneBanner(t);

    if(this.state.paused&&this.inputMode==='PAUSED'){
      c.fillStyle='rgba(5,4,18,.78)';
      c.fillRect(0,0,W,H);
      this.text('PAUSED',W/2,H/2,62,'#fff','center');
    }
    this.checkPortal();
  }
  drawCombatReactions(t){
    const c=this.ctx;
    for(const echo of this.defeatEchoes){
      const alpha=clamp(echo.life/42,0,1),scale=1+(1-alpha)*.45;
      c.save();c.translate(echo.x,echo.y);c.rotate(echo.spin);c.scale(scale,scale);c.globalAlpha=alpha;
      if(echo.source==='heart'){
        c.shadowColor='#ff79bd';c.shadowBlur=20;this.text('♥',0,0,28,'#ff79bd','center');
      }else if(echo.source==='cookie'){
        c.fillStyle='#b76a35';c.beginPath();c.arc(0,0,15,0,Math.PI*2);c.fill();this.text('BOOM',0,-24,10,'#ffe66d','center');
      }else{
        c.strokeStyle=echo.color;c.lineWidth=5;c.beginPath();c.arc(0,0,16+(1-alpha)*28,0,Math.PI*2);c.stroke();
      }
      c.restore();
    }
    for(const hit of this.hitNumbers){c.save();c.globalAlpha=clamp(hit.life/18,0,1);this.text(hit.text,hit.x,hit.y,16,hit.color,'center');c.restore()}
    if(this.comboPulse>0){
      const p=clamp(this.comboPulse/75,0,1);c.save();c.globalCompositeOperation='screen';c.globalAlpha=p*.55;
      const g=c.createRadialGradient(this.player.x+22,this.player.y+35,10,this.player.x+22,this.player.y+35,150*(1-p)+55);g.addColorStop(0,'rgba(255,255,255,.8)');g.addColorStop(.35,'rgba(255,79,184,.5)');g.addColorStop(.7,'rgba(60,231,210,.32)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(this.player.x-150,this.player.y-150,344,344);c.restore();
    }
  }

  drawFinale(t){
    const f=this.finale;if(!f.active&&!f.complete)return;
    const holdTableau=f.active||((performance.now()-(f.completedAt||performance.now()))<2400);
    if(!holdTableau)return;
    const c=this.ctx;
    c.save();
    if(f.active&&f.stage<=1){
      const shake=f.stage===1?Math.sin(t*.045)*5:0;
      c.strokeStyle='rgba(255,230,109,.65)';c.lineWidth=4;c.shadowColor='#ffe66d';c.shadowBlur=18;
      c.strokeRect(8628+shake,FLOOR-137,106,102);c.shadowBlur=0;
    }
    if((f.active&&f.stage>=2)||f.complete){
      const reunion=f.active&&f.stage===2;
      this.drawBeagle(this.rigsby.x,this.rigsby.y,t,'rigsby',false);
      this.drawBeagle(this.zoey.x,this.zoey.y,t,'zoey',true);
      if(reunion||f.stage===3){
        for(let i=0;i<7;i++){const a=t*.003+i*Math.PI*2/7,r=35+Math.sin(t*.006+i)*8;this.text('♥',8570+Math.cos(a)*r,FLOOR-92+Math.sin(a)*18,18,i%2?'#ff4fb8':'#ffe66d','center')}
      }
    }
    for(const n of this.celebrationNPCs){
      const bob=Math.sin(t*.007+n.x)*5;c.fillStyle=n.color;c.beginPath();c.arc(n.x,n.y-30+bob,10,0,Math.PI*2);c.fill();c.fillRect(n.x-8,n.y-20+bob,16,24);c.strokeStyle='#fff';c.lineWidth=3;c.beginPath();c.moveTo(n.x-8,n.y-13+bob);c.lineTo(n.x-20,n.y-34+bob);c.moveTo(n.x+8,n.y-13+bob);c.lineTo(n.x+20,n.y-34+bob);c.stroke();
    }
    if(f.stage>=4||f.complete){
      for(let i=0;i<16;i++){const x=8020+i*55,y=260+((i*47+t*.04)%280);c.fillStyle=['#ff4fb8','#3ce7d2','#ffe66d','#8d5cff'][i%4];c.save();c.translate(x,y);c.rotate(t*.004+i);c.fillRect(-4,-8,8,16);c.restore()}
    }
    c.restore();
  }

  drawDynamicLighting(t){
    const c=this.ctx;
    if(this.powerFlash<=0&&!this.portal.open&&this.ultimateFlash<=0&&!this.finale.active)return;
    c.save();
    c.globalCompositeOperation='screen';
    if(this.powerFlash>0){
      const hero=DUDES[this.state.dude];
      const px=(this.player.x-this.camera)+this.player.w/2;
      const py=this.player.y+this.player.h/2;
      const radius=90+this.powerFlash*4;
      const glow=c.createRadialGradient(px,py,8,px,py,radius);
      glow.addColorStop(0,this.hexAlpha(hero.color,.22));
      glow.addColorStop(1,'rgba(0,0,0,0)');
      c.fillStyle=glow;c.fillRect(px-radius,py-radius,radius*2,radius*2);
    }
    if(this.ultimateFlash>0){const glow=c.createRadialGradient(W/2,H/2,20,W/2,H/2,620);glow.addColorStop(0,`rgba(255,255,255,${clamp(this.ultimateFlash/220,0,.38)})`);glow.addColorStop(.35,`rgba(255,79,184,${clamp(this.ultimateFlash/340,0,.24)})`);glow.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=glow;c.fillRect(0,0,W,H);}
    if(this.portal.open){
      const px=this.portal.x-this.camera+75,py=this.portal.y+82;
      const glow=c.createRadialGradient(px,py,8,px,py,120);
      glow.addColorStop(0,'rgba(255,79,184,.18)');
      glow.addColorStop(1,'rgba(0,0,0,0)');
      c.fillStyle=glow;c.fillRect(px-125,py-125,250,250);
    }
    c.restore();
  }

  drawForeground(t){}

  hexAlpha(hex,alpha){
    if(!hex||hex[0]!=='#')return hex;
    const clean=hex.slice(1);
    const full=clean.length===3?clean.split('').map(x=>x+x).join(''):clean;
    const n=parseInt(full,16);
    return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${alpha})`;
  }

  drawSky(t){
    const c=this.ctx,z=this.zone(),restoration=this.restorationLevel();
    const palettes={
      home:['#5b398d','#ff6e9f','#ffc476'],
      hillcrest:['#321761','#d93e92','#ffad69'],
      pch:['#086b9b','#4acbd3','#ffd08b'],
      hollywood:['#21143e','#7f3f9d','#ffb45e'],
      la:['#160f31','#4a205c','#e75f78']
    };
    const p=palettes[z.id],g=c.createLinearGradient(0,0,0,H);
    g.addColorStop(0,p[0]);g.addColorStop(.58,p[1]);g.addColorStop(1,p[2]);
    c.fillStyle=g;c.fillRect(0,0,W,H);

    if(restoration>0){
      const joy=c.createLinearGradient(0,0,W,H);
      joy.addColorStop(0,`rgba(60,231,210,${restoration*.08})`);
      joy.addColorStop(.5,`rgba(255,79,184,${restoration*.07})`);
      joy.addColorStop(1,`rgba(255,230,109,${restoration*.09})`);
      c.fillStyle=joy;c.fillRect(0,0,W,H);
    }

    const sunAlpha=.62+restoration*.28;
    c.fillStyle=`rgba(255,244,190,${sunAlpha})`;
    c.shadowColor='rgba(255,230,109,.45)';
    c.shadowBlur=restoration*32;
    c.beginPath();c.arc(1080,135,58+restoration*5,0,Math.PI*2);c.fill();
    c.shadowBlur=0;

    const cloudAlpha=this.weatherMode==='softClouds'?.44:.30;
    for(let i=0;i<4;i++){
      const x=((i*390+t*.012)-this.camera*.05)%1600-150;
      c.fillStyle=`rgba(255,255,255,${cloudAlpha})`;
      c.beginPath();c.ellipse(x,170+i*35,90,24,0,0,Math.PI*2);c.fill();
    }

    if(restoration>.48){
      c.strokeStyle=`rgba(255,255,255,${.16+restoration*.18})`;
      c.lineWidth=3;
      c.beginPath();
      c.arc(860,390,210,Math.PI*1.13,Math.PI*1.87);
      c.stroke();
    }
  }
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
    // Remastered City Hall: layered stone, depth, windows, stairs and architectural trim.
    c.save();
    const hallX=8000,hallY=300,hallW=700,hallH=320;
    const shadow=c.createLinearGradient(hallX,hallY,hallX,hallY+hallH);
    shadow.addColorStop(0,'#f2eadf');shadow.addColorStop(.55,'#d9ccbc');shadow.addColorStop(1,'#aa9a89');
    c.shadowColor='rgba(9,6,24,.42)';c.shadowBlur=28;c.shadowOffsetY=16;
    c.fillStyle=shadow;c.beginPath();c.roundRect(hallX,hallY,hallW,hallH,22);c.fill();
    c.shadowBlur=0;c.shadowOffsetY=0;

    // Pediment and layered roof.
    const roof=c.createLinearGradient(8000,165,8700,300);
    roof.addColorStop(0,'#fff7ec');roof.addColorStop(.55,'#eadfce');roof.addColorStop(1,'#cfc0ad');
    c.fillStyle=roof;c.beginPath();c.moveTo(7988,302);c.lineTo(8350,154);c.lineTo(8712,302);c.closePath();c.fill();
    c.strokeStyle='rgba(95,76,67,.28)';c.lineWidth=3;c.stroke();
    c.fillStyle='#d4c6b5';c.fillRect(8172,245,356,68);
    c.fillStyle='rgba(255,255,255,.58)';c.fillRect(8184,252,332,8);
    this.text('LOS ANGELES CITY HALL',8350,279,29,'#514644','center');

    // Recessed façade bays and windows.
    for(let bay=0;bay<5;bay++){
      const bx=8052+bay*122;
      const recess=c.createLinearGradient(bx,326,bx+78,326);
      recess.addColorStop(0,'#b9aa99');recess.addColorStop(.5,'#e7ded2');recess.addColorStop(1,'#b5a594');
      c.fillStyle=recess;c.fillRect(bx,328,80,248);
      c.fillStyle='rgba(40,31,58,.34)';c.fillRect(bx+18,370,44,104);
      c.fillStyle='rgba(255,230,109,.18)';c.fillRect(bx+22,374,36,96);
    }

    // Columns with caps, bases and soft side shading.
    for(let x=8060;x<=8620;x+=112){
      const col=c.createLinearGradient(x,0,x+44,0);
      col.addColorStop(0,'#cfc2b4');col.addColorStop(.28,'#fffaf2');col.addColorStop(.72,'#f0e7dc');col.addColorStop(1,'#b7a796');
      c.fillStyle=col;c.fillRect(x,330,44,250);
      c.fillStyle='#c4b4a2';c.fillRect(x-10,318,64,18);c.fillRect(x-8,575,60,19);
      c.fillStyle='rgba(255,255,255,.55)';c.fillRect(x+7,337,6,232);
    }

    // Steps and plaza shadows.
    for(let i=0;i<4;i++){
      c.fillStyle=`rgba(${182-i*8},${169-i*7},${153-i*6},1)`;
      c.fillRect(7978-i*7,588+i*8,744+i*14,12);
    }
    c.fillStyle='rgba(35,26,52,.18)';c.fillRect(8012,600,676,20);
    c.restore();
  }

  drawLivingWorld(t){
    const c=this.ctx;
    const level=this.restorationLevel();
    if(level<=.01)return;

    c.save();

    c.globalCompositeOperation='screen';
    const wash=c.createLinearGradient(this.camera,180,this.camera,FLOOR);
    wash.addColorStop(0,`rgba(255,230,109,${.025+.055*level})`);
    wash.addColorStop(.55,`rgba(60,231,210,${.018+.045*level})`);
    wash.addColorStop(1,`rgba(255,79,184,${.012+.03*level})`);
    c.fillStyle=wash;
    c.fillRect(this.camera,0,W,H);
    c.globalCompositeOperation='source-over';

    // Flowers bloom progressively along the route.
    const flowerCount=Math.floor(14+level*42);
    const flowerColors=['#ff4fb8','#ffe66d','#3ce7d2','#8d5cff','#ff8f5c'];
    for(let i=0;i<flowerCount;i++){
      const x=260+i*173+(i%3)*31;
      if(x<this.camera-40||x>this.camera+W+40)continue;
      if(x/WORLD>level+.16)continue;
      const sway=Math.sin(t*.0028+i)*2.5;
      const y=FLOOR-4;
      c.strokeStyle='rgba(53,139,91,.92)';
      c.lineWidth=2;
      c.beginPath();
      c.moveTo(x,y);
      c.quadraticCurveTo(x+sway,y-13,x+sway*.6,y-25);
      c.stroke();
      c.fillStyle=flowerColors[i%flowerColors.length];
      for(let p=0;p<5;p++){
        const a=p*Math.PI*2/5+t*.00025;
        c.beginPath();
        c.arc(x+sway*.6+Math.cos(a)*5,y-25+Math.sin(a)*5,3.7,0,Math.PI*2);
        c.fill();
      }
      c.fillStyle='#fff5b8';
      c.beginPath();c.arc(x+sway*.6,y-25,3,0,Math.PI*2);c.fill();
    }

    // Pride flags appear only after restoration reaches each area.
    const flags=[
      {x:1220,min:.12},{x:2280,min:.24},{x:3260,min:.40},
      {x:4720,min:.52},{x:6100,min:.67},{x:7480,min:.82}
    ];
    const rainbow=['#ff4b4b','#ff9f43','#ffe66d','#49d17d','#45a3ff','#a55cff'];
    for(const flag of flags){
      if(level<flag.min||flag.x<this.camera-100||flag.x>this.camera+W+100)continue;
      c.strokeStyle='rgba(245,245,255,.88)';
      c.lineWidth=5;
      c.beginPath();c.moveTo(flag.x,FLOOR);c.lineTo(flag.x,FLOOR-112);c.stroke();
      const wave=Math.sin(t*.004+flag.x)*4;
      rainbow.forEach((color,i)=>{
        c.fillStyle=color;
        c.beginPath();
        c.moveTo(flag.x+3,FLOOR-108+i*7);
        c.quadraticCurveTo(flag.x+39+wave,FLOOR-113+i*7,flag.x+76,FLOOR-105+i*7);
        c.lineTo(flag.x+76,FLOOR-98+i*7);
        c.quadraticCurveTo(flag.x+39+wave,FLOOR-106+i*7,flag.x+3,FLOOR-101+i*7);
        c.closePath();
        c.fill();
      });
    }

    // Simple cheering neighbors.
    const neighbors=[
      {x:1460,min:.18,shirt:'#ff4fb8'},
      {x:3150,min:.38,shirt:'#3ce7d2'},
      {x:5050,min:.58,shirt:'#ffe66d'},
      {x:6760,min:.76,shirt:'#8d5cff'},
      {x:7750,min:.90,shirt:'#ff8f5c'}
    ];
    for(const n of neighbors){
      if(level<n.min||n.x<this.camera-80||n.x>this.camera+W+80)continue;
      const bounce=Math.sin(t*.006+n.x)*3;
      c.fillStyle='rgba(0,0,0,.14)';
      c.beginPath();c.ellipse(n.x,FLOOR-2,18,5,0,0,Math.PI*2);c.fill();
      c.fillStyle='#c88f6b';
      c.beginPath();c.arc(n.x,FLOOR-57+bounce,10,0,Math.PI*2);c.fill();
      c.fillStyle=n.shirt;
      c.beginPath();c.roundRect(n.x-12,FLOOR-47+bounce,24,31,7);c.fill();
      c.strokeStyle='#c88f6b';c.lineWidth=5;
      c.beginPath();
      c.moveTo(n.x-8,FLOOR-40+bounce);c.lineTo(n.x-18,FLOOR-58+bounce-Math.sin(t*.01)*5);
      c.moveTo(n.x+8,FLOOR-40+bounce);c.lineTo(n.x+18,FLOOR-58+bounce+Math.sin(t*.01)*5);
      c.stroke();
      c.strokeStyle='#30233d';c.lineWidth=5;
      c.beginPath();
      c.moveTo(n.x-6,FLOOR-17+bounce);c.lineTo(n.x-8,FLOOR);
      c.moveTo(n.x+6,FLOOR-17+bounce);c.lineTo(n.x+8,FLOOR);
      c.stroke();
    }

    for(const s of this.ambientSparkles){
      const alpha=clamp(s.life/80,0,.8);
      c.globalAlpha=alpha;
      c.fillStyle=s.color;
      c.shadowColor=s.color;
      c.shadowBlur=8;
      c.beginPath();
      c.arc(s.x,s.y,s.s,0,Math.PI*2);
      c.fill();
    }
    c.globalAlpha=1;c.shadowBlur=0;

    if(this.worldPulse>0){
      const alpha=clamp(this.worldPulse/30,0,.22);
      c.globalCompositeOperation='screen';
      c.fillStyle=`rgba(255,255,255,${alpha})`;
      c.fillRect(this.camera,0,W,H);
    }

    c.restore();
  }

  drawBeagle(x,y,t,variant='rigsby',flip=false){
    const c=this.ctx;
    const run=Math.sin(t*.012+x*.01);
    c.save();
    c.translate(x+(flip?54:0),y);
    c.scale(flip?-1:1,1);
    c.fillStyle='rgba(0,0,0,.16)';
    c.beginPath();c.ellipse(27,38,27,6,0,0,Math.PI*2);c.fill();
    c.fillStyle=variant==='zoey'?'#f2e6d6':'#d8b28a';
    c.beginPath();c.ellipse(28,21,25,16,0,0,Math.PI*2);c.fill();
    c.fillStyle=variant==='zoey'?'#6a4431':'#6f4932';
    c.beginPath();c.ellipse(45,13,16,13,0,0,Math.PI*2);c.fill();
    c.beginPath();c.ellipse(47,22,11,15,.35,0,Math.PI*2);c.fill();
    c.fillStyle='#23170f';
    c.beginPath();c.arc(57,14,4,0,Math.PI*2);c.fill();
    c.fillStyle='#fff';
    c.beginPath();c.arc(48,9,3.2,0,Math.PI*2);c.fill();
    c.fillStyle='#21150f';
    c.beginPath();c.arc(49,9,1.5,0,Math.PI*2);c.fill();
    c.strokeStyle=variant==='zoey'?'#ff4fb8':'#3ce7d2';
    c.lineWidth=3;
    c.beginPath();c.arc(45,19,10,.2,2.5);c.stroke();
    c.strokeStyle=variant==='zoey'?'#f2e6d6':'#d8b28a';
    c.lineWidth=7;
    c.beginPath();
    c.moveTo(14,30);c.lineTo(12+run*3,39);
    c.moveTo(34,31);c.lineTo(36-run*3,39);
    c.stroke();
    c.strokeStyle=variant==='zoey'?'#6a4431':'#6f4932';
    c.lineWidth=5;
    c.beginPath();c.moveTo(4,18);c.quadraticCurveTo(-8,5,-2,-4-run*3);c.stroke();
    c.restore();
  }

  drawCinematicLife(t){
    const c=this.ctx;
    const z=this.zone();

    // Road traffic, bikes and distant life stay behind gameplay.
    c.save();
    c.globalAlpha=.72;
    const traffic=[
      {base:1650,speed:.020,color:'#ff4fb8'},
      {base:3400,speed:.027,color:'#3ce7d2'},
      {base:5200,speed:.018,color:'#ffe66d'},
      {base:6840,speed:.024,color:'#8d5cff'}
    ];
    for(const car of traffic){
      const zoneStart=ZONES.find(q=>car.base>=q.start&&car.base<q.end)?.start||0;
      const zoneEnd=ZONES.find(q=>car.base>=q.start&&car.base<q.end)?.end||WORLD;
      const span=Math.max(300,zoneEnd-zoneStart);
      const x=zoneStart+((car.base-zoneStart+t*car.speed)%span);
      if(x<this.camera-100||x>this.camera+W+100)continue;
      c.fillStyle=car.color;
      c.beginPath();c.roundRect(x,FLOOR-31,78,22,8);c.fill();
      c.fillStyle='rgba(255,255,255,.55)';
      c.fillRect(x+18,FLOOR-27,20,7);
      c.fillStyle='#171326';
      c.beginPath();c.arc(x+18,FLOOR-7,7,0,Math.PI*2);c.arc(x+61,FLOOR-7,7,0,Math.PI*2);c.fill();
    }
    c.restore();

    // Ocean foam and shimmer become more cinematic on the PCH.
    if(z.id==='pch'){
      c.save();
      c.globalCompositeOperation='screen';
      for(let i=0;i<7;i++){
        const y=448+i*23;
        c.strokeStyle=`rgba(255,255,255,${.13+i*.018})`;
        c.lineWidth=2+i*.25;
        c.beginPath();
        for(let x=Math.floor(this.camera/35)*35-70;x<this.camera+W+70;x+=35){
          c.lineTo(x,y+Math.sin(x*.018+t*.003+i)*7);
        }
        c.stroke();
      }
      c.fillStyle='rgba(255,244,184,.13)';
      for(let i=0;i<9;i++){
        const x=this.camera+((i*177+t*.036)%W);
        c.beginPath();c.ellipse(x,470+(i%3)*35,35,4,0,0,Math.PI*2);c.fill();
      }
      c.restore();
    }

    // Rigsby is rendered once by drawRigsby(). Zoey appears only after rescue.
    if(this.state.zoeyUnlocked&&!this.finale.active&&!this.finale.complete){
      this.drawBeagle(this.zoey.x,this.zoey.y,t,'zoey',this.zoey.x>this.player.x);
      if(this.zoey.heart>0){
        c.save();
        c.globalAlpha=clamp(this.zoey.heart/55,0,1);
        this.text('♥',this.zoey.x+27,this.zoey.y-15,26,'#ff6b9d','center');
        c.restore();
      }
    }

    // Paw-print markers make Rigsby's secret path legible.
    for(const site of this.secretSites){
      if(site.found||Math.abs(site.x-this.rigsby.x)>240)continue;
      c.save();
      c.globalAlpha=.28+.25*Math.sin(t*.006);
      this.text('🐾',site.x,site.y-18,25,'#ffe66d','center');
      c.restore();
    }

    // Restrained, character-specific switch cue—Daniel no longer pops in glitter.
    if(this.switchBurst>0){
      const progress=clamp(this.switchBurst/22,0,1),radius=(1-progress)*58+14;
      c.save();c.globalCompositeOperation='screen';c.globalAlpha=progress;
      if(this.state.dude===1){
        c.strokeStyle='#ff79bd';c.lineWidth=3;c.beginPath();c.arc(this.player.x+22,this.player.y+55,radius,0,Math.PI*2);c.stroke();
        this.text('♥',this.player.x+22,this.player.y+60-radius*.3,15+progress*8,'#ff8fc7','center');
      }else if(this.state.dude===0){
        c.strokeStyle='#ffe66d';c.lineWidth=3;c.beginPath();c.arc(this.player.x+22,this.player.y+38,radius,0,Math.PI*2);c.stroke();
      }else{
        c.strokeStyle='#ff9a3c';c.lineWidth=4;c.setLineDash([5,7]);c.beginPath();c.arc(this.player.x+22,this.player.y+55,radius*.8,0,Math.PI*2);c.stroke();c.setLineDash([]);
      }
      c.restore();
    }
  }

  drawHeroShots(t){
    const c=this.ctx;
    const heartPath=(x,y,size)=>{
      c.beginPath();
      c.moveTo(x,y+size*.25);
      c.bezierCurveTo(x-size*.72,y-size*.28,x-size*.55,y-size*.82,x,y-size*.42);
      c.bezierCurveTo(x+size*.55,y-size*.82,x+size*.72,y-size*.28,x,y+size*.25);
      c.closePath();
    };
    for(const s of this.heroShots){
      if(s.type==='heart'){
        c.save();
        for(let i=0;i<s.trail.length;i++){
          const p=s.trail[i],a=(i+1)/s.trail.length;
          c.globalAlpha=a*.34;c.fillStyle=i%2?'#ff79bd':'#3ce7d2';
          heartPath(p.x+s.w/2,p.y+s.h/2,5+a*5);c.fill();
        }
        c.globalAlpha=1;
        const pulse=1+Math.sin(t*.022+s.x)*.08;
        c.translate(s.x+s.w/2,s.y+s.h/2);c.scale(pulse,pulse);
        c.shadowColor='#ff4fb8';c.shadowBlur=24;
        const g=c.createLinearGradient(-18,-18,18,18);g.addColorStop(0,'#fff');g.addColorStop(.28,'#ff8fc7');g.addColorStop(.7,'#ff4fb8');g.addColorStop(1,'#8d5cff');
        c.fillStyle=g;heartPath(0,0,21);c.fill();
        c.lineWidth=2;c.strokeStyle='rgba(255,255,255,.82)';c.stroke();
        c.restore();
        continue;
      }
      for(let i=0;i<s.trail.length;i++){
        const p=s.trail[i];c.globalAlpha=(i+1)/s.trail.length*.38;
        c.fillStyle=['#ff4fb8','#ffe66d','#3ce7d2','#8d5cff'][i%4];
        c.beginPath();c.arc(p.x,p.y+9,4+i*.35,0,Math.PI*2);c.fill();
      }
      c.globalAlpha=1;
      const g=c.createLinearGradient(s.x,s.y,s.x+s.w,s.y);g.addColorStop(0,'#ff4fb8');g.addColorStop(.34,'#ffe66d');g.addColorStop(.67,'#3ce7d2');g.addColorStop(1,'#8d5cff');
      c.shadowColor='#ff4fb8';c.shadowBlur=20;c.fillStyle=g;c.beginPath();c.roundRect(s.x,s.y,s.w,s.h,9);c.fill();c.shadowBlur=0;
      if((s.bounces||0)>0){c.strokeStyle='rgba(255,255,255,.72)';c.lineWidth=2;for(let i=0;i<s.bounces;i++){c.beginPath();c.arc(s.x+s.w-7-i*9,s.y+4,3,0,Math.PI*2);c.stroke()}}
    }
    c.globalAlpha=1;
  }

  drawPositiveFields(t){
    const c=this.ctx;
    for(const f of this.positiveFields){
      const fade=clamp(f.life/18,0,1),pulse=.92+.08*Math.sin(t*.018+f.x);
      c.save();c.translate(f.x,f.y);c.globalAlpha=fade;
      c.globalCompositeOperation='screen';
      const glow=c.createRadialGradient(0,0,4,0,0,f.radius*1.25);
      glow.addColorStop(0,'rgba(255,255,255,.56)');glow.addColorStop(.28,'rgba(255,79,184,.34)');glow.addColorStop(.68,'rgba(60,231,210,.2)');glow.addColorStop(1,'rgba(141,92,255,0)');
      c.fillStyle=glow;c.beginPath();c.arc(0,0,f.radius*1.25,0,Math.PI*2);c.fill();
      c.strokeStyle=f.detonated?'#ffe66d':'#3ce7d2';c.lineWidth=f.detonated?6:4;c.shadowColor='#ff4fb8';c.shadowBlur=22;
      c.beginPath();c.arc(0,0,f.radius*pulse,0,Math.PI*2);c.stroke();
      c.strokeStyle='rgba(255,255,255,.64)';c.lineWidth=2;c.beginPath();c.arc(0,0,f.radius*.72,0,Math.PI*2);c.stroke();
      for(let i=0;i<7;i++){
        const a=t*.004+i*Math.PI*2/7,rr=f.radius*(.75+(i%2)*.2),hx=Math.cos(a)*rr,hy=Math.sin(a)*rr;
        c.save();c.translate(hx,hy);c.rotate(a+Math.PI/2);c.fillStyle=i%2?'#ff79bd':'#ffe66d';c.font='900 16px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText('♥',0,0);c.restore();
      }
      c.restore();
    }
  }

  drawCookieBombs(t){
    const c=this.ctx;
    for(const b of this.cookieBombs){
      c.save();c.translate(b.x+b.w/2,b.y+b.h/2);c.rotate(b.stuck?Math.sin(t*.02)*.08:t*.01+b.x);
      const urgency=b.stuck?clamp(1-b.fuse/38,0,1):0;
      c.shadowColor=urgency>.58?'#ff4b6e':'#ff9a3c';c.shadowBlur=12+urgency*22;
      c.fillStyle='#b76a35';c.beginPath();c.arc(0,0,14+urgency*2,0,Math.PI*2);c.fill();
      c.fillStyle='#4b291e';for(const [x,y] of [[-5,-4],[5,-5],[-2,5],[7,4]]){c.beginPath();c.arc(x,y,2.4,0,Math.PI*2);c.fill()}
      if(b.stuck){c.strokeStyle=urgency>.55?'#ff4b6e':'#ffe66d';c.lineWidth=3;c.beginPath();c.arc(0,0,20+Math.sin(t*.025)*3,0,Math.PI*2);c.stroke();this.text('!',0,-27,14,urgency>.55?'#ff4b6e':'#ffe66d','center')}
      c.restore();
    }
  }

  drawEnemyShots(t){
    const c=this.ctx;
    for(const s of this.enemyShots){
      c.save();
      c.shadowColor=s.reflected?'#3ce7d2':s.type==='pamphlet'?'#ff4fb8':'#c7b7a2';
      c.shadowBlur=14;
      if(s.type==='pamphlet'){
        c.translate(s.x+s.w/2,s.y+s.h/2);
        c.rotate(Math.sin(t*.014+s.x)*.18);
        c.fillStyle=s.reflected?'#3ce7d2':'#eee1cd';
        c.beginPath();c.roundRect(-s.w/2,-s.h/2,s.w,s.h,4);c.fill();
        c.strokeStyle='#8b4a61';c.lineWidth=2;c.stroke();
        this.text((s.label||'NO PRIDE').slice(0,10),0,0,7,'#624450','center');
      }else{
        c.fillStyle=s.reflected?'#3ce7d2':'#d5c6b1';
        c.beginPath();c.roundRect(s.x,s.y,s.w,s.h,7);c.fill();
        if(s.type==='fine')this.text(s.label||'FINE',s.x+s.w/2,s.y+s.h/2,9,'#554843','center');
      }
      c.restore();
    }
  }
  house(x){const c=this.ctx;c.fillStyle='#fff1dc';c.fillRect(x+90,330,560,290);c.fillStyle='#37263f';c.beginPath();c.moveTo(x,340);c.lineTo(x+370,120);c.lineTo(x+740,340);c.fill();c.fillStyle='#573344';c.fillRect(x+170,420,140,200);c.fillStyle='#54cbe0';c.fillRect(x+400,420,180,110)}
  storefront(x,y,color){const c=this.ctx;c.fillStyle='#302443';c.fillRect(x,y,220,FLOOR-y);c.fillStyle=color;c.fillRect(x,y,220,24);c.fillStyle='#75dbe3';c.fillRect(x+25,y+55,70,80);c.fillRect(x+120,y+55,70,80);c.fillStyle='#fff';c.font='900 15px system-ui';c.fillText(x%560?'CAFÉ':'PRIDE',x+65,y+190)}
  rainbowCrosswalk(x){const colors=['#ff4b4b','#ff9f43','#ffe66d','#49d17d','#45a3ff','#a55cff'];colors.forEach((co,i)=>{this.ctx.fillStyle=co;this.ctx.fillRect(x+i*45,FLOOR-18,38,18)})}
  palm(x,y){const c=this.ctx;c.strokeStyle='#70513f';c.lineWidth=13;c.beginPath();c.moveTo(x,y+100);c.quadraticCurveTo(x-10,y+20,x,y-70);c.stroke();c.fillStyle='#20734f';for(let i=0;i<7;i++){c.save();c.translate(x,y-70);c.rotate(i*Math.PI/3.5);c.beginPath();c.ellipse(0,-48,12,58,0,0,Math.PI*2);c.fill();c.restore()}}
  drawCollectibles(t){for(const c of this.cards){if(c.taken)continue;const y=c.y+Math.sin(t*.004+c.x)*7;this.ctx.save();this.ctx.shadowColor='#ffe66d';this.ctx.shadowBlur=20;this.ctx.fillStyle='#171128';this.ctx.beginPath();this.ctx.roundRect(c.x,y,c.w,c.h,7);this.ctx.fill();['#ff4b4b','#ff9f43','#ffe66d','#49d17d','#45a3ff','#a55cff'].forEach((co,i)=>{this.ctx.fillStyle=co;this.ctx.fillRect(c.x+7,y+8+i*5,c.w-14,5)});this.ctx.restore()}for(const b of this.beacons){const pulse=.8+.18*Math.sin(t*.006+b.x);this.ctx.save();this.ctx.translate(b.x+27,b.y+46);this.ctx.shadowColor=b.on?'#3ce7d2':'#7d708a';this.ctx.shadowBlur=b.on?35:10;this.ctx.fillStyle=b.on?'#3ce7d2':'#665a78';this.ctx.beginPath();this.ctx.moveTo(0,-45);this.ctx.lineTo(25,0);this.ctx.lineTo(0,45);this.ctx.lineTo(-25,0);this.ctx.closePath();this.ctx.fill();if(b.on){this.ctx.globalAlpha=.25;this.ctx.scale(1.5*pulse,1.5*pulse);this.ctx.fill()}this.ctx.restore()}}
  drawEnemies(t){
    const c=this.ctx;
    for(const e of this.enemies){
      if(!e.alive)continue;
      const reactionY=e.heartHeld>0?Math.sin(t*.02+e.x)*5:0;
      c.save();c.translate(0,-reactionY);if(e.hitFlash>0){c.globalCompositeOperation='screen';c.shadowColor='#fff';c.shadowBlur=18;}
      if(e.type==='protester'||e.type==='leadProtester'){
        const lead=e.type==='leadProtester';
        const bob=Math.sin(t*.006+e.x)*2;
        c.save();
        c.fillStyle='rgba(0,0,0,.22)';
        c.beginPath();c.ellipse(e.x+e.w/2,FLOOR-2,e.w*.48,8,0,0,Math.PI*2);c.fill();

        // Legs and body.
        c.strokeStyle='#382d3d';c.lineWidth=lead?8:7;
        c.beginPath();
        c.moveTo(e.x+e.w*.38,e.y+e.h*.72+bob);c.lineTo(e.x+e.w*.31,FLOOR);
        c.moveTo(e.x+e.w*.62,e.y+e.h*.72+bob);c.lineTo(e.x+e.w*.69,FLOOR);
        c.stroke();
        c.fillStyle=e.shirt||'#66535f';
        c.beginPath();c.roundRect(e.x+10,e.y+32+bob,e.w-20,e.h*.52,lead?12:9);c.fill();

        // Generic cartoon face.
        c.fillStyle='#b97857';
        c.beginPath();c.arc(e.x+e.w/2,e.y+22+bob,lead?17:14,0,Math.PI*2);c.fill();
        c.fillStyle='#2a2030';
        c.beginPath();c.arc(e.x+e.w*.43,e.y+20+bob,2.2,0,Math.PI*2);c.arc(e.x+e.w*.57,e.y+20+bob,2.2,0,Math.PI*2);c.fill();
        c.strokeStyle='#67384a';c.lineWidth=2;
        c.beginPath();c.arc(e.x+e.w/2,e.y+29+bob,6,3.35,6.05);c.stroke();

        if(lead){
          c.fillStyle='#ffe66d';
          c.beginPath();c.moveTo(e.x+18,e.y+7+bob);c.lineTo(e.x+27,e.y-10+bob);c.lineTo(e.x+38,e.y+7+bob);c.lineTo(e.x+49,e.y-10+bob);c.lineTo(e.x+60,e.y+7+bob);c.closePath();c.fill();
        }

        // The sign is a combat shield and visibly cracks before breaking.
        if(e.signUp){
          const sx=e.x-12,sy=e.y-62+bob,sw=e.w+24,sh=63;
          c.strokeStyle='#76533d';c.lineWidth=7;
          c.beginPath();c.moveTo(e.x+e.w/2,e.y+5+bob);c.lineTo(e.x+e.w/2,sy+sh);c.stroke();
          const signGradient=c.createLinearGradient(sx,sy,sx+sw,sy+sh);
          signGradient.addColorStop(0,lead?'#6d334e':'#e8dbc6');
          signGradient.addColorStop(1,lead?'#331c37':'#cbbba5');
          c.fillStyle=signGradient;
          c.beginPath();c.roundRect(sx,sy,sw,sh,7);c.fill();
          c.strokeStyle=lead?'#ffe66d':'#7b6257';c.lineWidth=3;c.stroke();

          const lines=e.sign||['NO PRIDE','ALLOWED'];
          this.text(lines[0],sx+sw/2,sy+22,lead?11:10,lead?'#fff':'#65404c','center');
          this.text(lines[1],sx+sw/2,sy+42,lead?11:10,lead?'#ffe66d':'#65404c','center');

          const maxSign=lead?2:1;
          if((e.signHp??maxSign)<maxSign){
            c.strokeStyle='#ff4fb8';c.lineWidth=3;
            c.beginPath();
            c.moveTo(sx+sw*.3,sy+4);c.lineTo(sx+sw*.48,sy+25);c.lineTo(sx+sw*.38,sy+43);c.lineTo(sx+sw*.58,sy+sh-3);
            c.stroke();
          }
        }else{
          c.strokeStyle='#76533d';c.lineWidth=5;
          c.beginPath();c.moveTo(e.x+e.w/2,e.y+8+bob);c.lineTo(e.x+e.w*.33,e.y+44+bob);c.stroke();
        }

        if(lead){
          const health=clamp(e.hp/e.maxHp,0,1);
          c.fillStyle='rgba(15,10,35,.75)';c.beginPath();c.roundRect(e.x-5,e.y-86,e.w+10,8,4);c.fill();
          c.fillStyle='#ff4fb8';c.beginPath();c.roundRect(e.x-5,e.y-86,(e.w+10)*health,8,4);c.fill();
        }
        c.restore();
        if(e.status)this.text(e.status==='COOKIE'?'🍪':'♥',e.x+e.w/2,e.y-100,16,e.status==='COOKIE'?'#ffe66d':'#ff79bd','center');
        c.restore();
        continue;
      }

      c.fillStyle='rgba(0,0,0,.2)';
      c.beginPath();c.ellipse(e.x+26,FLOOR-2,30,8,0,0,Math.PI*2);c.fill();
      const botGradient=c.createLinearGradient(e.x,e.y,e.x+e.w,e.y+e.h);
      botGradient.addColorStop(0,'#d5c7b5');botGradient.addColorStop(1,'#897b6e');
      c.fillStyle=botGradient;c.beginPath();c.roundRect(e.x,e.y,e.w,e.h,10);c.fill();
      this.text('HOA',e.x+26,e.y+38,11,'#554a45','center');
      c.fillStyle='#fff';c.fillRect(e.x+8,e.y+14,10,8);c.fillRect(e.x+34,e.y+14,10,8);
      c.fillStyle=e.hitFlash>0?'#fff':'#ff4fb8';c.fillRect(e.x+11,e.y+16,4,4);c.fillRect(e.x+37,e.y+16,4,4);
      if(e.status)this.text(e.status==='COOKIE'?'🍪':'♥',e.x+e.w/2,e.y-15,16,e.status==='COOKIE'?'#ffe66d':'#ff79bd','center');
      c.restore();
    }
  }
  drawCaptiveZoey(t){
    if(this.state.zoeyUnlocked)return;
    const c=this.ctx;
    const x=8660,y=FLOOR-112;
    c.save();

    // Warning glow and story label.
    c.fillStyle='rgba(255,79,184,.12)';
    c.beginPath();c.ellipse(x+38,y+98,75,17,0,0,Math.PI*2);c.fill();
    this.text('RESCUE ZOEY',x+38,y-20,12,'#ffe66d','center');

    // Zoey inside the cage, visibly distinct from Rigsby.
    this.drawBeagle(x+12,y+55,t,'zoey',false);

    c.strokeStyle='#6e625c';
    c.lineWidth=7;
    c.fillStyle='rgba(202,190,173,.12)';
    c.beginPath();c.roundRect(x,y,82,106,8);c.fill();c.stroke();
    c.lineWidth=5;
    for(let bar=14;bar<82;bar+=17){
      c.beginPath();c.moveTo(x+bar,y+5);c.lineTo(x+bar,y+101);c.stroke();
    }
    c.beginPath();c.moveTo(x+4,y+31);c.lineTo(x+78,y+31);c.stroke();

    c.fillStyle='#d6c8b5';
    c.beginPath();c.roundRect(x+60,y+44,18,24,4);c.fill();
    c.fillStyle='#342a29';
    c.beginPath();c.arc(x+69,y+55,3,0,Math.PI*2);c.fill();

    const pulse=.55+.35*Math.sin(t*.006);
    c.globalAlpha=pulse;
    this.text('♥',x+42,y+49,22,'#ff6b9d','center');
    c.restore();
  }

  drawBossArenaFX(t){
    if(this.zone().id!=='la')return;
    const c=this.ctx;
    c.save();

    // Moving city-light reflections.
    c.globalCompositeOperation='screen';
    for(let i=0;i<12;i++){
      const x=6740+i*205;
      const pulse=.12+.09*Math.sin(t*.002+i);
      c.fillStyle=`rgba(${i%3===0?'255,79,184':i%3===1?'60,231,210':'255,230,109'},${pulse})`;
      c.fillRect(x,FLOOR-8,118,5);
    }

    const bossDamage=this.boss.alive?clamp(1-this.boss.hp/this.boss.maxHp,0,1):1;

    // City Hall regains color in real time as the Queen loses health.
    if(bossDamage>0){
      const columnColors=['#ff4fb8','#ffe66d','#3ce7d2','#8d5cff','#ff9a3c'];
      c.globalCompositeOperation='screen';
      for(let i=0;i<5;i++){
        const x=7440+i*132;
        const beam=c.createLinearGradient(x,FLOOR,x,280);
        beam.addColorStop(0,`${columnColors[i]}${Math.round(80+bossDamage*110).toString(16).padStart(2,'0')}`);
        beam.addColorStop(1,'rgba(0,0,0,0)');
        c.fillStyle=beam;
        c.fillRect(x,290,82,330);
      }
      for(let i=0;i<18;i++){
        const x=6710+i*137;
        c.fillStyle=columnColors[i%columnColors.length];
        c.globalAlpha=.08+bossDamage*.18;
        c.fillRect(x,420+(i%3)*39,38,13);
      }
      c.globalAlpha=1;
    }

    // Finale UX Remaster: fine branching fractures, impact craters, dust and exposed rainbow energy.
    if(this.cityHallDamage>0&&this.boss.alive){
      const damage=this.cityHallDamage;
      c.globalCompositeOperation='source-over';
      c.save();
      const impactPoints=[
        {x:8175,y:352,seed:1,stage:1},
        {x:8420,y:325,seed:2,stage:1},
        {x:8575,y:405,seed:3,stage:2},
        {x:8285,y:475,seed:4,stage:2},
        {x:8495,y:520,seed:5,stage:3}
      ];
      const branch=(x,y,angle,len,depth,seed)=>{
        if(depth<=0||len<5)return;
        const wobble=Math.sin(seed*12.9898+depth*3.17)*.19;
        const x2=x+Math.cos(angle+wobble)*len;
        const y2=y+Math.sin(angle+wobble)*len;
        c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();
        branch(x2,y2,angle-.48+Math.sin(seed)*.16,len*.62,depth-1,seed+1.7);
        if(depth>1)branch(x2,y2,angle+.55+Math.cos(seed)*.12,len*.47,depth-1,seed+3.1);
      };
      const visible=impactPoints.filter(p=>this.cityHallDamageStage>=p.stage);
      for(const p of visible){
        const glow=c.createRadialGradient(p.x,p.y,2,p.x,p.y,36+damage*28);
        glow.addColorStop(0,`rgba(255,230,109,${.22+damage*.24})`);
        glow.addColorStop(.45,`rgba(255,79,184,${.08+damage*.12})`);
        glow.addColorStop(1,'rgba(0,0,0,0)');
        c.fillStyle=glow;c.beginPath();c.arc(p.x,p.y,66,0,Math.PI*2);c.fill();
        c.strokeStyle=`rgba(58,45,62,${.42+damage*.35})`;
        c.lineWidth=1.15+damage*.85;c.lineCap='round';
        for(let r=0;r<5;r++)branch(p.x,p.y,-2.5+r*1.18,28+damage*24,3,p.seed+r*.73);
        c.fillStyle=`rgba(48,36,52,${.22+damage*.23})`;
        c.beginPath();c.arc(p.x,p.y,3.5+damage*4,0,Math.PI*2);c.fill();
      }

      // Architectural trim separates and falls instead of giant black holes.
      if(this.cityHallDamageStage>=2){
        c.fillStyle='rgba(91,73,72,.35)';
        c.save();c.translate(8528,302);c.rotate(.035+damage*.035);c.fillRect(-74,-5,148,10);c.restore();
        c.fillStyle='rgba(255,248,236,.28)';c.fillRect(8178,247,188,5);
      }
      if(this.cityHallDamageStage>=3){
        c.fillStyle='rgba(31,23,42,.23)';
        c.beginPath();c.moveTo(8622,321);c.lineTo(8685,312);c.lineTo(8672,366);c.lineTo(8631,352);c.closePath();c.fill();
        c.fillStyle='rgba(255,230,109,.16)';c.fillRect(8632,326,38,28);
      }

      // Dust hugs the façade and never reads like marker strokes.
      for(let i=0;i<12;i++){
        const px=8080+((i*137+t*.018)%540),py=520-(i%4)*42;
        const a=(.025+damage*.045)*(1+.35*Math.sin(t*.002+i));
        c.fillStyle=`rgba(224,211,194,${a})`;
        c.beginPath();c.ellipse(px,py,36+damage*28,11+damage*8,0,0,Math.PI*2);c.fill();
      }
      for(const d of this.cityHallDebris){
        c.save();c.translate(d.x,d.y);c.rotate(d.r);c.globalAlpha=clamp(d.life/90,0,1);
        c.fillStyle=d.color;c.beginPath();c.roundRect(-d.size/2,-d.size/3,d.size,d.size*.66,1.5);c.fill();c.restore();
      }
      c.restore();c.globalAlpha=1;
    }

    // After Zoey is rescued, rainbow energy repairs the building instead of leaving it ruined.
    if(!this.boss.alive){
      const repair=clamp(this.finale.stage>=3||this.finale.complete?1:(this.finale.timer||0)/260,0,1);
      c.save();c.globalCompositeOperation='screen';
      const repairGlow=c.createLinearGradient(8000,580,8700,180);
      repairGlow.addColorStop(0,`rgba(60,231,210,${repair*.10})`);
      repairGlow.addColorStop(.5,`rgba(255,79,184,${repair*.13})`);
      repairGlow.addColorStop(1,`rgba(255,230,109,${repair*.10})`);
      c.fillStyle=repairGlow;c.fillRect(7990,160,730,460);
      for(let i=0;i<28;i++){
        const x=8020+(i*97)%660,y=560-((i*53+t*.035)%340);
        c.fillStyle=['#ff4fb8','#3ce7d2','#ffe66d','#8d5cff'][i%4];
        c.globalAlpha=.16+.28*repair;c.beginPath();c.arc(x,y,2+(i%3),0,Math.PI*2);c.fill();
      }
      c.restore();c.globalAlpha=1;
    }

    // Queen arena spotlight.
    if(this.boss.active&&this.boss.alive){
      const glow=c.createRadialGradient(this.boss.x+60,this.boss.y+65,15,this.boss.x+60,this.boss.y+65,310);
      glow.addColorStop(0,`rgba(210,191,166,${.18+.08*Math.sin(t*.004)})`);
      glow.addColorStop(.55,'rgba(141,92,255,.06)');
      glow.addColorStop(1,'rgba(0,0,0,0)');
      c.fillStyle=glow;c.fillRect(this.boss.x-270,this.boss.y-230,660,600);

      // Rotating HOA warning rings.
      c.strokeStyle='rgba(210,191,166,.22)';
      c.lineWidth=3;
      c.setLineDash([18,12]);
      c.beginPath();c.arc(this.boss.x+60,this.boss.y+75,175+Math.sin(t*.003)*7,t*.0004,t*.0004+Math.PI*1.7);c.stroke();
      c.setLineDash([]);
    }

    // Distant protest crowd silhouettes make the approach feel populated.
    if(this.player.x>6200&&!this.state.bossDefeated){
      c.globalCompositeOperation='source-over';
      for(let i=0;i<13;i++){
        const x=6360+i*128;
        if(x<this.camera-80||x>this.camera+W+80)continue;
        const sway=Math.sin(t*.004+i)*3;
        c.fillStyle='rgba(20,14,35,.38)';
        c.beginPath();c.arc(x,FLOOR-104+sway,10,0,Math.PI*2);c.fill();
        c.fillRect(x-8,FLOOR-94+sway,16,34);
        c.strokeStyle='rgba(20,14,35,.45)';c.lineWidth=4;
        c.beginPath();c.moveTo(x,FLOOR-92+sway);c.lineTo(x+(i%2?18:-18),FLOOR-125+sway);c.stroke();
        c.fillStyle='rgba(224,208,184,.28)';
        c.fillRect(x+(i%2?5:-45),FLOOR-151+sway,43,25);
      }
    }

    if(this.arenaPulse>0){
      c.fillStyle=`rgba(255,79,184,${clamp(this.arenaPulse/90,0,.18)})`;
      c.fillRect(this.camera,0,W,H);
    }
    if(this.combatFlash>0){
      c.globalCompositeOperation='screen';
      c.fillStyle=`rgba(255,230,109,${clamp(this.combatFlash/80,0,.15)})`;
      c.fillRect(this.camera,0,W,H);
    }
    c.restore();
  }

  drawBoss(t){
    this.drawCaptiveZoey(t);
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
  drawRigsby(t){
    // drawFinale owns both dogs while the reunion/tableau is visible.
    if(this.finale.active||this.finale.complete)return;
    const target=this.state.zoeyUnlocked
      ? this.player.x-128*(this.player.facing||1)
      : this.player.x+118*(this.player.facing||1);
    const moving=Math.abs(this.rigsby.x-target)>8;
    const flip=target<this.rigsby.x;
    const im=this.images[`rigsby_${moving?'walk':'idle'}`];
    if(!this.sprite(im,this.rigsby.x-10,this.rigsby.y-28,Math.floor(t/(moving?90:150)),128,96,78,58,flip)){
      this.drawBeagle(this.rigsby.x,this.rigsby.y,t,'rigsby',flip);
    }
  }
  drawPlayer(t){const names=['will','daniel','caleb'],n=names[this.state.dude];let a='idle',frames=6,speed=150;if(this.player.animUntil>t)a=this.player.anim;else if(!this.player.onGround){a='jump';frames=4}else if(Math.abs(this.player.vx)>.35){a='walk';frames=8;speed=82}const im=this.images[`${n}_${a}`],alpha=this.player.inv>0&&Math.floor(this.player.inv/5)%2===0?.35:1;this.ctx.save();this.ctx.globalAlpha=alpha;this.ctx.fillStyle='rgba(0,0,0,.22)';this.ctx.beginPath();this.ctx.ellipse(this.player.x+22,FLOOR-2,31,8,0,0,Math.PI*2);this.ctx.fill();if(!this.sprite(im,this.player.x-20,this.player.y-50,Math.floor(t/speed)%frames,128,192,84,126,this.player.facing<0))this.fallbackHero();this.ctx.restore()}
  sprite(im,x,y,frame,fw,fh,w,h,flip){if(!im||!im.complete||!im.naturalWidth)return false;const count=Math.max(1,Math.floor(im.naturalWidth/fw));frame%=count;this.ctx.save();this.ctx.translate(x+(flip?w:0),y);this.ctx.scale(flip?-1:1,1);this.ctx.drawImage(im,frame*fw,0,fw,Math.min(fh,im.naturalHeight),0,0,w,h);this.ctx.restore();return true}
  fallbackHero(){const c=this.ctx,p=this.player,d=DUDES[this.state.dude];c.fillStyle='#b87855';c.beginPath();c.arc(p.x+22,p.y+15,15,0,Math.PI*2);c.fill();c.fillStyle=d.color;c.beginPath();c.roundRect(p.x+5,p.y+28,34,38,9);c.fill();c.fillStyle=d.accent;c.fillRect(p.x+18,p.y+31,7,30);c.fillStyle='#211a34';c.fillRect(p.x+8,p.y+63,11,17);c.fillRect(p.x+26,p.y+63,11,17)}
  burst(x,y,color,n){for(let i=0;i<n;i++)this.particles.push({x,y,vx:(Math.random()-.5)*8,vy:(Math.random()-.8)*8,life:40+Math.random()*55,color,s:2+Math.random()*5})}
  updateParticles(dt){for(const p of this.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=.18*dt;p.life-=dt}this.particles=this.particles.filter(p=>p.life>0)}
  drawParticles(){
    const c=this.ctx;
    for(const p of this.particles){
      c.globalAlpha=clamp(p.life/50,0,1);
      c.fillStyle=p.color;
      if(p.paper){
        c.save();
        c.translate(p.x,p.y);
        c.rotate((p.x+p.y)*.02);
        c.fillRect(-p.s,-p.s*.65,p.s*2,p.s*1.3);
        c.restore();
      }else{
        c.beginPath();c.arc(p.x,p.y,p.s,0,Math.PI*2);c.fill();
      }
    }
    c.globalAlpha=1;
  }
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
  togglePause(){if(this.inputMode==='PAUSED')this.resumeGameplay();else if(this.inputMode==='PLAYING')this.pauseGameplay()}
  updatePowerButton(){
    const dude=DUDES[this.state.dude];
    const button=qs('powerBtn'),icon=qs('powerIcon'),label=qs('powerLabel');
    if(icon)icon.textContent=dude.powerIcon||'⚡';
    if(label)label.textContent=dude.shortPower||'POWER';
    if(button){button.dataset.hero=dude.name.toLowerCase();button.setAttribute('aria-label',`Use ${dude.power}`)}
  }
  switchDude(i=null){
    const now=performance.now();
    this.switchFrom=this.state.dude;
    this.state.dude=i===null?(this.state.dude+1)%3:i;
    this.switchBurst=22;this.shake=Math.max(this.shake,2);this.haptic(10);this.sound('switch');
    this.heroTheme=DUDES[this.state.dude].color;

    if(!this.switchCombo.expires||now>this.switchCombo.expires)this.switchCombo={heroes:[this.switchFrom],expires:now+3000};
    if(!this.switchCombo.heroes.includes(this.state.dude))this.switchCombo.heroes.push(this.state.dude);
    this.switchCombo.expires=now+3000;
    if(this.switchCombo.heroes.length>=3){
      this.state.triangle=clamp(this.state.triangle+20,0,100);this.comboPulse=75;this.worldPulse=45;this.shake=12;
      this.showCombatStatus('TRIPLE SWITCH COMBO','All three dudes connected • +20 Triangle Power','△');
      this.burst(this.player.x+22,this.player.y+34,'#ff4fb8',35);this.burst(this.player.x+22,this.player.y+34,'#3ce7d2',35);this.burst(this.player.x+22,this.player.y+34,'#ffe66d',35);
      this.sound('combo');this.haptic([20,20,35,20,60]);this.switchCombo={heroes:[this.state.dude],expires:0};
    }

    const lines=[
      ['Will: Let’s make it fabulous.','Will: Ricochet ready.'],
      ['Daniel: Sending love!','Daniel: Heartfield ready.'],
      ['Caleb: I brought snacks.','Caleb: Sticky cookie ready.']
    ];
    const line=lines[this.state.dude][Math.floor(Math.random()*lines[this.state.dude].length)];this.ui.flash(line);this.powerFlash=7;
    // Character-specific arrival effects. Daniel gets a soft heart pulse, never a glitter explosion.
    if(this.state.dude===0)this.burst(this.player.x+22,this.player.y+34,'#ffe66d',12);
    else if(this.state.dude===2)this.burst(this.player.x+22,this.player.y+48,'#ff9a3c',10);
    document.documentElement.style.setProperty('--active-hero',DUDES[this.state.dude].color);
    document.documentElement.style.setProperty('--active-accent',DUDES[this.state.dude].accent);
    this.updatePowerButton();
  }

  save(){return {version:'1.0.8V',player:{x:this.player.x,y:this.player.y},state:this.state,cards:this.cards.map(c=>c.taken),beacons:this.beacons.map(b=>b.on),enemies:this.enemies.map(e=>({alive:e.alive,hp:e.hp,signHp:e.signHp,signUp:e.signUp})),secrets:this.secretSites.map(s=>s.found),boss:{hp:this.boss.hp,alive:this.boss.alive,phase:this.boss.phase},cityHallDamage:this.cityHallDamage,savedAt:new Date().toISOString()}}
  applySave(s){if(!s)return;this.player.x=clamp(s.player?.x||150,0,WORLD-50);this.player.y=s.player?.y||FLOOR-72;Object.assign(this.state,s.state||{},{paused:false});s.cards?.forEach((v,i)=>this.cards[i].taken=v);s.beacons?.forEach((v,i)=>this.beacons[i].on=v);s.enemies?.forEach((v,i)=>{const e=this.enemies[i];if(!e)return;if(typeof v==='boolean')e.alive=v;else if(v){e.alive=v.alive??e.alive;e.hp=v.hp??e.hp;e.signHp=v.signHp??e.signHp;e.signUp=v.signUp??e.signUp}});s.secrets?.forEach((v,i)=>{if(this.secretSites[i])this.secretSites[i].found=v});this.secretsFound=this.secretSites.filter(site=>site.found).length;if(s.boss){this.boss.hp=s.boss.hp;this.boss.alive=s.boss.alive;this.boss.phase=s.boss.phase||1;this.state.bossDefeated=!s.boss.alive;this.state.zoeyUnlocked=Boolean(this.state.zoeyUnlocked||!s.boss.alive);this.portal.open=!s.boss.alive;if(this.state.zoeyUnlocked){this.zoey.active=true;this.zoey.x=this.player.x+110}}this.cityHallDamage=s.cityHallDamage??(this.boss.alive?clamp(1-this.boss.hp/this.boss.maxHp,0,1):1);this.cityHallDamageStage=this.cityHallDamage>=.75?3:this.cityHallDamage>=.45?2:this.cityHallDamage>=.18?1:0;this.camera=clamp(this.player.x-350,0,WORLD-W)}
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
function showCollect(text){const t=qs('collectibleToast');t.textContent=text;t.classList.add('isVisible');clearTimeout(showCollect.t);showCollect.t=setTimeout(()=>t.classList.remove('isVisible'),1450)}
window.showAchievement=showAchievement;window.showCollectible=showCollect;

const canvas=qs('gameCanvas');canvas.width=W;canvas.height=H;const ui=createUI();let game;const input=createInput(i=>game?.switchDude(i));game=new Adventure(canvas,ui,input,state=>{ui.refs.completeStats.textContent=`All ${state.cards}/6 Gay Cards recovered, ${state.beacons}/3 Prism Beacons restored, and the Queen of Beige defeated.`;ui.show('complete')});window.__questGame=game;
const SAVE='3dudes1quest-save-108v';
const LEGACY_SAVES=['3dudes1quest-save-108u','3dudes1quest-save-108t','3dudes1quest-save-108s','3dudes1quest-save-108r','3dudes1quest-save-108q','3dudes1quest-save-108p','3dudes1quest-save-108o','3dudes1quest-save-108n','3dudes1quest-save-108m','3dudes1quest-save-108l','3dudes1quest-save-108k','3dudes1quest-save-108j','3dudes1quest-save-108i','3dudes1quest-save-108h','3dudes1quest-save-108g'];
function readSave(){
  try{
    const current=JSON.parse(localStorage.getItem(SAVE)||'null');
    if(current)return current;
    for(const key of LEGACY_SAVES){
      const legacy=JSON.parse(localStorage.getItem(key)||'null');
      if(legacy){
        try{localStorage.setItem(SAVE,JSON.stringify({...legacy,version:'1.0.8T'}))}catch{}
        return legacy;
      }
    }
  }catch(error){console.warn('Save storage unavailable:',error)}
  return null;
}
function refresh(){const s=readSave();qs('continueBtn').classList.toggle('hidden',!s);qs('saveStatus').textContent=s?`Adventure saved • ${new Date(s.savedAt).toLocaleString()}`:'No saved quest yet.'}
const livingTitleWorld=createLivingTitleWorld();
let selectedStartingDude=0;

function updateStartingDudeSelection(index){
  selectedStartingDude=clamp(Number(index)||0,0,2);
  const dude=DUDES[selectedStartingDude];
  livingTitleWorld.setHero(selectedStartingDude);
  qs('titleScreen')?.setAttribute('data-hero',String(selectedStartingDude));

  document.querySelectorAll('.dudeSelectCard').forEach((card,cardIndex)=>{
    const selected=cardIndex===selectedStartingDude;
    card.classList.toggle('selected',selected);
    card.setAttribute('aria-pressed',String(selected));
  });

  const selectedName=qs('selectedDudeName');
  const selectedPower=qs('selectedDudePower');
  const startBtn=qs('startBtn');

  if(selectedName)selectedName.textContent=dude.name;
  if(selectedPower)selectedPower.textContent=dude.power;
  if(startBtn)startBtn.textContent=`Start as ${dude.name}`;
}

document.querySelectorAll('.dudeSelectCard').forEach((card,index)=>{
  card.addEventListener('click',()=>updateStartingDudeSelection(index));
  card.addEventListener('keydown',event=>{
    if(event.key==='Enter'||event.key===' '){
      event.preventDefault();
      updateStartingDudeSelection(index);
    }
  });
});

function begin(s=null,startingDude=selectedStartingDude){
  ui.show('game');
  game.start(s,startingDude);
  requestAnimationFrame(()=>game.input.focusCanvas?.());
}

updateStartingDudeSelection(0);

qs('startBtn').onclick=()=>{
  try{localStorage.removeItem(SAVE)}catch{};
  refresh();
  begin(null,selectedStartingDude);
};
qs('continueBtn').onclick=()=>begin(readSave());
qs('helpBtn').onclick=()=>ui.show('help');
qs('backBtn').onclick=()=>ui.show('title');
qs('triangleUltimateBtn').onclick=()=>{game.input.ultimate=true;setTimeout(()=>game.input.ultimate=false,80)};
qs('pauseBtn').onclick=()=>game.pauseGameplay();
qs('journalBtn').onclick=()=>{if(game.inputMode==='PAUSED')game.resumeGameplay();else game.pauseGameplay()};
qs('journalClose').onclick=()=>game.resumeGameplay();
{
  const switchButton=qs('switchBtn');
  switchButton.onclick=null;
  switchButton.addEventListener('pointerdown',event=>{
    event.preventDefault();
    event.stopPropagation();
    if(!game.input.isPlaying?.())return;
    game.switchDude();
    switchButton.classList.add('isPressed');
    try{switchButton.setPointerCapture(event.pointerId)}catch(_){}
  },{passive:false});
  const releaseSwitch=event=>{
    event.preventDefault();
    switchButton.classList.remove('isPressed');
    try{
      if(switchButton.hasPointerCapture(event.pointerId)){
        switchButton.releasePointerCapture(event.pointerId);
      }
    }catch(_){}
  };
  switchButton.addEventListener('pointerup',releaseSwitch,{passive:false});
  switchButton.addEventListener('pointercancel',releaseSwitch,{passive:false});
}
qs('restartBtn').onclick=()=>begin(null,selectedStartingDude);
qs('portalBtn').onclick=()=>ui.show('portal');
qs('titleBtn').onclick=()=>ui.show('title');
qs('saveBtn').onclick=()=>{try{localStorage.setItem(SAVE,JSON.stringify(game.save()))}catch(error){console.warn('Unable to save quest:',error)};qs('saveToast').classList.add('show');setTimeout(()=>qs('saveToast').classList.remove('show'),1200);refresh()};
qs('cutsceneNext').onclick=()=>{qs('cutscene').classList.add('hidden');game.resumeGameplay()};

function buildWorldMap(){
  const route=qs('worldMapRoute');
  const game=window.__questGame;
  if(!route||!game)return;
  const current=game.zone().id;
  route.innerHTML=ZONES.map((zone,index)=>{
    const reached=game.player.x>=zone.start;
    const active=zone.id===current;
    return `<div class="mapStop ${reached?'reached':''} ${active?'active':''}">
      <span>${['🏡','🏳️‍🌈','🌊','🎬','🏙️'][index]}</span>
      <b>${zone.name}</b><small>${reached?'DISCOVERED':'LOCKED'}</small>
    </div>${index<ZONES.length-1?'<i></i>':''}`;
  }).join('');
  qs('mapProgressCopy').textContent=`${Math.round(game.player.x/(WORLD-game.player.w)*100)}% traveled • ${game.state.cards}/6 Gay Cards • ${game.state.beacons}/3 Beacons • ${game.secretsFound}/5 Secrets`;
}

function buildPassport(){
  const game=window.__questGame;
  if(!game)return;
  const complete=game.state.bossDefeated;
  const stamp=qs('passportStampM');
  stamp.classList.toggle('complete',complete);
  stamp.querySelector('span').textContent=complete?'RESTORED':'IN PROGRESS';
  qs('passportStatsM').innerHTML=`
    <div><b>${game.state.cards}/6</b><span>Gay Cards</span></div>
    <div><b>${game.state.beacons}/3</b><span>Prism Beacons</span></div>
    <div><b>${game.secretsFound}/5</b><span>Secrets</span></div>
    <div><b>${complete?'✓':'—'}</b><span>Queen Defeated</span></div>`;
}

function openFeatureOverlay(id){
  window.__questGame.state.paused=true;window.__questGame.setInputMode('OVERLAY');
  window.__questGame.input.releaseAll?.();
  qs(id)?.classList.remove('hidden');
}

function closeFeatureOverlay(id){
  qs(id)?.classList.add('hidden');
  const otherOpen=document.querySelector('.featureOverlay:not(.hidden)');
  if(!otherOpen&&!window.__questGame.photoMode&&qs('journal')?.classList.contains('hidden')){
    window.__questGame.resumeGameplay();
  }
}

qs('resumeBtn').onclick=()=>game.resumeGameplay();
qs('mapBtn').onclick=()=>{buildWorldMap();openFeatureOverlay('worldMapOverlay')};
qs('passportBtn').onclick=()=>{buildPassport();openFeatureOverlay('passportOverlay')};
qs('photoBtn').onclick=()=>game.togglePhotoMode();
qs('photoHubBtn').onclick=()=>{qs('journal').classList.add('hidden');game.togglePhotoMode(true)};
qs('photoExit').onclick=()=>game.togglePhotoMode(false);
qs('worldMapClose').onclick=()=>closeFeatureOverlay('worldMapOverlay');
qs('passportClose').onclick=()=>closeFeatureOverlay('passportOverlay');

qs('photoCapture').onclick=()=>{
  try{
    const link=document.createElement('a');
    link.download=`3Dudes1Quest-SoCal-${Date.now()}.png`;
    link.href=canvas.toDataURL('image/png');
    link.click();
    game.showPetMoment('Photo saved!','Your SoCal adventure moment is ready.','📸');
  }catch(error){
    console.warn('Photo capture unavailable:',error);
    game.ui.flash('Screenshot capture is unavailable in this browser.');
  }
};

function resize(){canvas.width=W;canvas.height=H;let w=innerWidth,h=w/(16/9);if(h>innerHeight){h=innerHeight;w=h*(16/9)}canvas.style.width=Math.floor(w)+'px';canvas.style.height=Math.floor(h)+'px'}addEventListener('resize',resize,{passive:true});resize();
function updateMobileLayoutMode(){
  const coarse=window.matchMedia?matchMedia('(pointer:coarse)').matches:false;
  document.body.classList.toggle('touchDevice',coarse);
  document.body.classList.toggle('portraitGame',coarse&&innerHeight>innerWidth);
  document.body.classList.toggle('landscapeGame',coarse&&innerWidth>=innerHeight);
}
addEventListener('resize',updateMobileLayoutMode,{passive:true});
addEventListener('orientationchange',()=>setTimeout(updateMobileLayoutMode,120),{passive:true});
updateMobileLayoutMode();


function installSafariGameMode(){
  const gameScreen=qs('gameScreen');
  const touchControls=qs('touchControls');
  if(!gameScreen||!touchControls)return;

  let lastTouchEnd=0;

  const gameIsActive=()=>gameScreen.classList.contains('active');
  const insideGameControls=target=>Boolean(
    target?.closest?.(
      '#touchControls, #pauseBtn, #journalBtn, #photoBtn, #dialogueNext, #cutsceneNext, #journal, .featureOverlay, #photoMode, #gameCanvas'
    )
  );

  // iOS Safari pinch-to-zoom events.
  ['gesturestart','gesturechange','gestureend'].forEach(type=>{
    document.addEventListener(type,event=>{
      if(gameIsActive())event.preventDefault();
    },{passive:false});
  });

  // Block double-tap zoom while preserving single-tap game input.
  document.addEventListener('touchend',event=>{
    if(!gameIsActive()||!insideGameControls(event.target))return;
    const now=Date.now();
    if(now-lastTouchEnd<420){
      event.preventDefault();
    }
    lastTouchEnd=now;
  },{passive:false,capture:true});

  // Safari sometimes promotes rapid button taps into a dblclick zoom.
  document.addEventListener('dblclick',event=>{
    if(gameIsActive()&&insideGameControls(event.target)){
      event.preventDefault();
      event.stopPropagation();
    }
  },{passive:false,capture:true});

  // Keep the page fixed while the player is interacting with game controls.
  document.addEventListener('touchmove',event=>{
    if(gameIsActive()&&insideGameControls(event.target)){
      event.preventDefault();
    }
  },{passive:false,capture:true});

  // Prevent native selection/callout behavior from interrupting play.
  document.addEventListener('contextmenu',event=>{
    if(gameIsActive()&&insideGameControls(event.target)){
      event.preventDefault();
    }
  },{capture:true});

  const resetInput=()=>window.__questGame?.input?.releaseAll?.();
  addEventListener('orientationchange',resetInput,{passive:true});
  addEventListener('pagehide',resetInput,{passive:true});
}
installSafariGameMode();

refresh();setInterval(()=>{if(game.running&&!game.state.paused){try{localStorage.setItem(SAVE,JSON.stringify(game.save()))}catch{}}},30000);
