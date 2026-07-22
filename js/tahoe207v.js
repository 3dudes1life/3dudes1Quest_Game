(() => {
"use strict";

const canvas = document.getElementById("tahoeCanvas");
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;
const WORLD_W = 4600;
const FLOOR = 570;
const SAVE_KEY = "3dudes1quest_tahoe_v207";
const RELEASE = "2.0.7v";

const images = {};
const imagePaths = {
  will: "assets/sprites_hd/will_walk.png",
  daniel: "assets/sprites_hd/daniel_walk.png",
  caleb: "assets/sprites_hd/caleb_walk.png",
  rigsby: "assets/sprites_hd/rigsby_walk.png"
};
for (const [key, src] of Object.entries(imagePaths)) {
  const img = new Image();
  img.src = src;
  images[key] = img;
}

const dudes = [
  { key:"will", name:"Will", letter:"W", portrait:"assets/portraits/will.png" },
  { key:"daniel", name:"Daniel", letter:"D", portrait:"assets/portraits/daniel.png" },
  { key:"caleb", name:"Caleb", letter:"C", portrait:"assets/portraits/caleb.png" }
];

const state = {
  started:false,
  cinematic:false,
  cinematicStart:0,
  cinematicStage:0,
  missionShown:false,
  finale:false,
  paused:false,
  dialogue:false,
  dialogueIndex:0,
  complete:false,
  memoryFound:false,
  discoveriesFound:[false,false,false,false],
  currentZone:-1,
  companionHintCooldown:0,
  rigsbyAlert:0,
  health:5,
  beetlesDefeated:0,
  invulnerable:0,
  checkpointX:250,
  checkpointReached:false,
  coyoteMs:0,
  jumpBufferMs:0,
  landingGrace:0,
  landingSquash:0,
  saveLoaded:false,
  saveTimer:0,
  dogTrail:[],
  beetleBursts:[],
  blasts:[],
  powerCooldown:0,
  cameraX:0,
  time:0,
  dudeIndex:0,
  keys:{left:false,right:false,jump:false,power:false},
  player:{x:250,y:FLOOR-102,w:72,h:102,vx:0,vy:0,onGround:true,facing:1,frame:0},
  rigsby:{x:140,y:FLOOR-58,w:88,h:58,frame:0},
  particles:[],
  wildlife:Array.from({length:16},(_,i)=>({type:["butterfly","squirrel","rabbit"][i%3],x:700+i*245,y:0,phase:i*.8,flee:0})),
  ducks:Array.from({length:5},(_,i)=>({x:280+i*215,y:420+(i%2)*24,phase:i})),
  fish:Array.from({length:6},(_,i)=>({x:420+i*540,next:1800+i*730,active:0})),
  portal:{x:350,y:350,r:0,alpha:0},
  zoey:{x:90,y:FLOOR-50,w:70,h:48},
  birds:Array.from({length:9},(_,i)=>({x:300+i*430,y:100+(i%4)*38,speed:.16+(i%3)*.04,phase:i})),
  flowers:Array.from({length:95},(_,i)=>({x:760+i*39+(i%5)*13,y:FLOOR-3-(i%4),kind:i%4})),
  pines:Array.from({length:48},(_,i)=>({x:900+i*87+(i%3)*21,scale:.72+(i%5)*.09,dead:i>31 && i%4===0})),
  platforms:[
    {x:1320,y:520,w:230,h:26},
    {x:1630,y:475,w:210,h:25},
    {x:1935,y:425,w:230,h:25},
    {x:2260,y:380,w:250,h:25},
    {x:2620,y:430,w:210,h:25},
    {x:2920,y:360,w:250,h:25},
    {x:3260,y:310,w:230,h:25},
    {x:3610,y:365,w:240,h:25},
    {x:3950,y:300,w:250,h:25}
  ],
  memory:{x:2440,y:320,w:42,h:42},
  discoveries:[
    {x:840,y:505,w:42,h:42,icon:"🌅",title:"SUNRISE AT THE LAKE",text:"The quiet mornings—the water like glass before the rest of the world wakes up."},
    {x:2180,y:350,w:42,h:42,icon:"🐾",title:"RIGSBY'S TAHOE DAYS",text:"Cold paws, brave swimming, and the kind of joy only a beagle can bring to the shoreline."},
    {x:3245,y:245,w:42,h:42,icon:"❄️",title:"TAHOE IN WINTER",text:"Snow on every branch, frozen air, and an entirely different version of the lake."},
    {x:4040,y:235,w:42,h:42,icon:"🌄",title:"THE OVERLOOK",text:"Sixteen years of returning here—and still finding a new reason to stop and look."}
  ],
  zones:[
    {x:0,name:"EMERALD SHORE",sub:"THE LAKESHORE"},
    {x:1120,name:"WHISPERING PINES",sub:"THE FOREST TRAIL"},
    {x:2360,name:"EAGLE CREEK",sub:"THE HIGH TRAIL"},
    {x:3200,name:"GRANITE CROWN",sub:"THE OVERLOOK"},
    {x:4110,name:"INFESTED TRAILHEAD",sub:"THE FINAL CLIMB"}
  ],
  beetles:[
    {x:1450,y:0,w:46,h:30,vx:1.25,min:1360,max:1570,alive:true},
    {x:2020,y:0,w:46,h:30,vx:-1.4,min:1900,max:2180,alive:true},
    {x:2720,y:0,w:46,h:30,vx:1.55,min:2590,max:2860,alive:true},
    {x:3370,y:0,w:46,h:30,vx:-1.65,min:3240,max:3500,alive:true},
    {x:3970,y:0,w:46,h:30,vx:1.8,min:3850,max:4110,alive:true}
  ]
};

const ui = {
  opening:document.getElementById("openingCard"),
  begin:document.getElementById("beginTahoe"),
  dialogue:document.getElementById("dialogue"),
  dialoguePortrait:document.getElementById("dialoguePortrait"),
  dialogueName:document.getElementById("dialogueName"),
  dialogueText:document.getElementById("dialogueText"),
  dialogueNext:document.getElementById("dialogueNext"),
  memoryCard:document.getElementById("memoryCard"),
  trailheadCard:document.getElementById("trailheadCard"),
  replay:document.getElementById("replayTahoe"),
  pauseMenu:document.getElementById("pauseMenu"),
  pauseBtn:document.getElementById("pauseBtn"),
  resume:document.getElementById("resumeTahoe"),
  restart:document.getElementById("restartTahoe"),
  switchBtn:document.getElementById("switchBtn"),
  powerBtn:document.getElementById("powerBtn"),
  hudDude:document.getElementById("hudDude"),
  hudPortrait:document.getElementById("hudPortrait"),
  hudMemories:document.getElementById("hudMemories"),
  hudHealth:document.getElementById("hudHealth"),
  hudBeetles:document.getElementById("hudBeetles"),
  hudAltitude:document.getElementById("hudAltitude"),
  trailFill:document.getElementById("trailProgressFill"),
  objectiveTitle:document.getElementById("objectiveTitle"),
  objectiveText:document.getElementById("objectiveText"),
  missionCard:document.getElementById("missionCard"),
  cinematicCaption:document.getElementById("cinematicCaption"),
  cinematicText:document.getElementById("cinematicText"),
  skipCinematic:document.getElementById("skipCinematic"),
  photoFrame:document.getElementById("photoFrame"),
  checkpointCard:document.getElementById("checkpointCard"),
  damageFlash:document.getElementById("damageFlash"),
  playTip:document.getElementById("playTip"),
  inputStatus:document.getElementById("inputStatus")
};

const zoneBanner=document.createElement("div");
zoneBanner.className="zoneBanner";
zoneBanner.innerHTML="<small>NEW AREA</small><strong>EMERALD SHORE</strong>";
document.getElementById("tahoeApp").appendChild(zoneBanner);

const companionHint=document.createElement("div");
companionHint.className="companionHint";
companionHint.innerHTML="<b>Rigsby:</b> Something is nearby...";
document.getElementById("tahoeApp").appendChild(companionHint);

const memoryCardTitle=document.getElementById("memoryCardTitle");
const memoryCardText=document.getElementById("memoryCardText");

const saveToast=document.createElement("div");
saveToast.className="saveToast";
saveToast.textContent="PROGRESS SAVED";
document.getElementById("tahoeApp").appendChild(saveToast);

const dialogue = [
  ["Will","Sixteen years... and somehow it never gets old.","assets/portraits/will.png"],
  ["Daniel","Every time we come back, it still feels like home.","assets/portraits/daniel.png"],
  ["Caleb","Wait. Look at those trees... something is wrong.","assets/portraits/caleb.png"]
];


function showSaveToast(text="PROGRESS SAVED"){
  saveToast.textContent=text;
  saveToast.classList.add("show");
  clearTimeout(showSaveToast.timer);
  showSaveToast.timer=setTimeout(()=>saveToast.classList.remove("show"),1200);
}

function saveProgress(showToast=false){
  try{
    const data={
      version:RELEASE,
      checkpointX:state.checkpointX,
      checkpointReached:state.checkpointReached,
      memoryFound:state.memoryFound,
      discoveriesFound:state.discoveriesFound,
      beetlesDefeated:state.beetlesDefeated,
      beetleAlive:state.beetles.map(b=>b.alive),
      dudeIndex:state.dudeIndex
    };
    localStorage.setItem(SAVE_KEY,JSON.stringify(data));
    if(showToast) showSaveToast();
  }catch(_){}
}

function loadProgress(){
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    if(!raw) return false;
    const data=JSON.parse(raw);
    if(!data || !Array.isArray(data.beetleAlive)) return false;
    state.checkpointX=Number(data.checkpointX)||250;
    state.checkpointReached=!!data.checkpointReached;
    state.memoryFound=!!data.memoryFound;
    if(Array.isArray(data.discoveriesFound)) state.discoveriesFound=data.discoveriesFound.slice(0,4).map(Boolean);
    state.memoryFound=state.discoveriesFound.some(Boolean)||state.memoryFound;
    state.beetlesDefeated=Math.max(0,Math.min(5,Number(data.beetlesDefeated)||0));
    state.beetles.forEach((b,i)=>b.alive=data.beetleAlive[i]!==false);
    setDude(Number(data.dudeIndex)||0);
    state.player.x=state.checkpointX;
    state.player.y=groundAt(state.player.x)-state.player.h-5;
    ui.hudMemories.textContent=String(state.discoveriesFound.filter(Boolean).length);
    ui.hudBeetles.textContent=String(state.beetlesDefeated);
  saveProgress(true);
    state.saveLoaded=true;
    return true;
  }catch(_){return false;}
}

function reset() {
  Object.assign(state.player,{x:250,y:FLOOR-102,vx:0,vy:0,onGround:true,facing:1,frame:0});
  Object.assign(state.rigsby,{x:140,y:FLOOR-58,frame:0});
  state.cameraX=0;
  state.cinematic=false; state.cinematicStage=0; state.missionShown=false; state.finale=false;
  state.memoryFound=false;
  state.discoveriesFound=[false,false,false,false];
  state.currentZone=-1; state.companionHintCooldown=0; state.rigsbyAlert=0;
  state.health=5;
  state.beetlesDefeated=0;
  state.invulnerable=0;
  state.checkpointX=250;
  state.checkpointReached=false;
  state.coyoteMs=0; state.jumpBufferMs=0; state.landingGrace=0; state.landingSquash=0; state.dogTrail.length=0; state.beetleBursts.length=0; state.blasts.length=0; state.powerCooldown=0; state.keys.left=state.keys.right=state.keys.jump=state.keys.power=false;
  state.beetles.forEach(b=>{b.alive=true;b.y=groundAt(b.x)-b.h;});
  state.complete=false;
  state.dudeIndex=0;
  state.dialogueIndex=0;
  state.particles.length=0;
  ui.hudMemories.textContent="0";
  ui.hudHealth.textContent="5";
  ui.hudBeetles.textContent="0";
  ui.memoryCard.classList.add("hidden");
  ui.trailheadCard.classList.add("hidden");
  ui.missionCard.classList.add("hidden"); ui.cinematicCaption.classList.add("hidden"); ui.photoFrame.classList.add("hidden"); ui.checkpointCard.classList.add("hidden"); ui.playTip.classList.add("hidden");
  setDude(0);
  setObjective("Take in the lake","Walk right and explore the shoreline.");
}

function begin() {
  reset();
  const resumed=loadProgress();
  state.started=true;
  state.paused=false;
  state.cinematic=true;
  state.cinematicStart=performance.now();
  state.cameraX=0;
  ui.opening.classList.add("hidden");
  ui.cinematicCaption.classList.remove("hidden");
  ui.cinematicText.textContent=resumed?"Returning to your Tahoe checkpoint...":"The portal is opening over the lake...";
  canvas.focus();
}

function endCinematic(){
  state.cinematic=false;
  state.portal.alpha=0;
  state.cameraX=0;
  ui.cinematicCaption.classList.add("hidden");
  if(state.saveLoaded){
    state.dialogue=false;
    setObjective(state.beetlesDefeated>=5?"Reach the upper trail":"Continue clearing beetles",
      state.beetlesDefeated>=5?"The trailhead is open.":"Your checkpoint progress was restored.");
    ui.playTip.classList.remove("hidden");
    setTimeout(()=>ui.playTip.classList.add("hidden"),5000);
    showSaveToast("CHECKPOINT RESTORED");
    canvas.focus({preventScroll:true});
  }else startDialogue();
}

function updateCinematic(now){
  const t=now-state.cinematicStart;
  state.portal.r=Math.min(135,t*.07);
  state.portal.alpha=Math.min(1,t/700);
  if(t<2400){state.cameraX=0;ui.cinematicText.textContent=resumed?"Returning to your Tahoe checkpoint...":"The portal is opening over the lake...";}
  else if(t<4700){state.cameraX+=(850-state.cameraX)*.025;ui.cinematicText.textContent="Lake. Mountains. Forest. The trail climbs into all of it.";}
  else if(t<6900){state.cameraX+=(2750-state.cameraX)*.018;ui.cinematicText.textContent="But patches of brown are spreading through the pines.";}
  else if(t<8500){state.cameraX+=(0-state.cameraX)*.03;ui.cinematicText.textContent="Rigsby and Zoey race through first. The guys follow.";}
  else endCinematic();
}

function startDialogue() {
  state.dialogue=true;
  state.dialogueIndex=0;
  ui.dialogue.classList.remove("hidden");
  showDialogueLine();
}

function showDialogueLine() {
  const [name,text,portrait]=dialogue[state.dialogueIndex];
  ui.dialogueName.textContent=name;
  ui.dialogueText.textContent=text;
  ui.dialoguePortrait.src=portrait;
}

function nextDialogue() {
  state.dialogueIndex++;
  if (state.dialogueIndex>=dialogue.length) {
    state.dialogue=false;
    ui.dialogue.classList.add("hidden");
    setObjective("Clear the first beetle cluster","Stomp 5 Pine Beetles and climb to the trailhead.");
    ui.playTip.classList.remove("hidden"); setTimeout(()=>ui.playTip.classList.add("hidden"),7000);
    ui.missionCard.querySelector("p").textContent="The Pine Beetle is spreading. Stomp 5 beetles and reach the trailhead.";
    ui.missionCard.classList.remove("hidden");
    state.missionShown=true;
    canvas.focus({preventScroll:true});
    showInputStatus("GO!");
    setTimeout(()=>ui.missionCard.classList.add("hidden"),3200);
    return;
  }
  showDialogueLine();
}

function setObjective(title,text) {
  ui.objectiveTitle.textContent=title;
  ui.objectiveText.textContent=text;
}

function setDude(index) {
  state.dudeIndex=(index+dudes.length)%dudes.length;
  const dude=dudes[state.dudeIndex];
  ui.hudDude.textContent=dude.name;
  ui.hudPortrait.textContent=dude.letter;
  if(state.started) saveProgress(false);
}

function togglePause(force) {
  if (!state.started || state.complete) return;
  state.paused=typeof force==="boolean"?force:!state.paused;
  ui.pauseMenu.classList.toggle("hidden",!state.paused);
}

function finish() {
  if (state.complete) return;
  state.complete=true; state.finale=true;
  saveProgress(true);
  state.player.vx=0;
  const finaleCam=setInterval(()=>{state.cameraX+=(3500-state.cameraX)*.035;},16);
  setTimeout(()=>clearInterval(finaleCam),1900);
  setObjective("Something is in the trees","A faint clicking comes from beneath the bark.");
  setTimeout(()=>ui.trailheadCard.classList.remove("hidden"),2400);
}


function flashDamage(){
  ui.damageFlash.classList.remove("hidden");
  void ui.damageFlash.offsetWidth;
  ui.damageFlash.classList.add("hidden");
  setTimeout(()=>ui.damageFlash.classList.remove("hidden"),0);
  setTimeout(()=>ui.damageFlash.classList.add("hidden"),360);
}

function hurtPlayer(sourceX){
  if(state.invulnerable>0 || state.complete || state.cinematic || state.dialogue) return;
  state.health--;
  state.invulnerable=1500;
  ui.hudHealth.textContent=String(state.health);
  flashDamage();
  state.player.vy=-8.5;
  state.player.vx=state.player.x<sourceX?-7:7;
  for(let i=0;i<18;i++) state.particles.push({x:state.player.x+35,y:state.player.y+45,vx:(Math.random()-.5)*8,vy:(Math.random()-.7)*7,life:44});
  if(state.health<=0){
    state.health=5;
    ui.hudHealth.textContent="5";
    state.player.x=state.checkpointX;
    state.player.y=groundAt(state.checkpointX)-state.player.h-5;
    state.player.vx=0; state.player.vy=0;
    setObjective("Try the climb again","You returned to the latest checkpoint.");
  }
}

function defeatBeetle(beetle){
  beetle.alive=false;
  state.beetleBursts.push({x:beetle.x+beetle.w/2,y:beetle.y+beetle.h/2,life:24});
  state.beetlesDefeated++;
  ui.hudBeetles.textContent=String(state.beetlesDefeated);
  state.player.vy=-9.5;
  for(let i=0;i<22;i++) state.particles.push({x:beetle.x+20,y:beetle.y+12,vx:(Math.random()-.5)*7,vy:(Math.random()-.75)*6,life:48});
  if(state.beetlesDefeated===5){
    setObjective("Reach the upper trail","The first beetle cluster is cleared.");
  }else{
    setObjective("Clear the first beetle cluster",`${5-state.beetlesDefeated} Pine Beetle${5-state.beetlesDefeated===1?"":"s"} remaining.`);
  }
}

function updateBeetles(dt, oldY){
  if(state.invulnerable>0) state.invulnerable=Math.max(0,state.invulnerable-dt);
  for(const b of state.beetles){
    if(!b.alive) continue;
    b.x+=b.vx;
    if(b.x<b.min || b.x>b.max){b.vx*=-1;b.x=Math.max(b.min,Math.min(b.max,b.x));}
    b.y=groundAt(b.x)-b.h;
    if(overlap(state.player,b)){
      const landed=state.player.vy>0 && oldY+state.player.h<=b.y+18 && state.player.y+state.player.h<=b.y+30;
      if(landed) defeatBeetle(b); else hurtPlayer(b.x);
    }
  }
}


function usePower(){
  if(!state.started || state.paused || state.dialogue || state.complete || state.cinematic) return;
  if(state.powerCooldown>0) return;
  const p=state.player;
  state.powerCooldown=520;
  state.blasts.push({
    x:p.x+p.w/2+p.facing*34,
    y:p.y+p.h*.48,
    vx:p.facing*11.5,
    life:72,
    facing:p.facing
  });
  for(let i=0;i<15;i++){
    state.particles.push({
      x:p.x+p.w/2+p.facing*32,y:p.y+p.h*.5,
      vx:p.facing*(2+Math.random()*5),vy:(Math.random()-.5)*4,life:34
    });
  }
  showInputStatus("POWER!");
}

function updateBlasts(dt){
  state.powerCooldown=Math.max(0,state.powerCooldown-dt);
  for(const blast of state.blasts){
    blast.x+=blast.vx;
    blast.life--;
    const hitbox={x:blast.x-28,y:blast.y-22,w:56,h:44};
    for(const beetle of state.beetles){
      if(beetle.alive && overlap(hitbox,beetle)){
        defeatBeetle(beetle);
        blast.life=0;
        break;
      }
    }
  }
  state.blasts=state.blasts.filter(b=>b.life>0 && b.x>0 && b.x<WORLD_W);
  if(ui.powerBtn){
    ui.powerBtn.disabled=state.powerCooldown>0;
    ui.powerBtn.style.opacity=state.powerCooldown>0?".58":"1";
  }
}

function press(action,value) {
  if(!(action in state.keys)) return;
  const wasDown=state.keys[action];
  state.keys[action]=value;
  if(action==="jump" && value && !wasDown){state.jumpBufferMs=150;jump();}
  if(action==="power" && value && !wasDown)usePower();
}

function jump() {
  if (!state.started || state.paused || state.dialogue || state.complete) return;
  if (state.player.onGround || state.coyoteMs>0) {
    state.player.vy=-13.25;
    state.jumpBufferMs=0; state.coyoteMs=0;
    state.player.onGround=false;
    for(let i=0;i<8;i++) state.particles.push({x:state.player.x+34,y:state.player.y+98,vx:(Math.random()-.5)*2,vy:-Math.random()*2,life:28});
  }
}


function showZone(zone){
  zoneBanner.querySelector("small").textContent=zone.sub;
  zoneBanner.querySelector("strong").textContent=zone.name;
  zoneBanner.classList.add("show");
  clearTimeout(showZone.timer);
  showZone.timer=setTimeout(()=>zoneBanner.classList.remove("show"),2200);
}

function collectDiscovery(index){
  if(state.discoveriesFound[index]) return;
  const item=state.discoveries[index];
  state.discoveriesFound[index]=true;
  state.memoryFound=true;
  const total=state.discoveriesFound.filter(Boolean).length;
  ui.hudMemories.textContent=String(total);
  memoryCardTitle.textContent=item.title;
  memoryCardText.textContent=item.text;
  ui.memoryCard.classList.remove("hidden");
  ui.photoFrame.classList.remove("hidden");
  setTimeout(()=>ui.photoFrame.classList.add("hidden"),1700);
  setTimeout(()=>ui.memoryCard.classList.add("hidden"),3600);
  setObjective(total<4?"Keep exploring Tahoe":"All Tahoe memories found",
    total<4?`${total}/4 memories found. Rigsby may help locate the others.`:"You found every hidden memory on the trail.");
  for(let i=0;i<52;i++) state.particles.push({x:item.x+20,y:item.y+20,vx:(Math.random()-.5)*7,vy:(Math.random()-.8)*7,life:60});
  saveProgress(true);
}

function updateDiscoveries(){
  const p=state.player;
  let nearest=Infinity;
  for(let i=0;i<state.discoveries.length;i++){
    if(state.discoveriesFound[i]) continue;
    const item=state.discoveries[i];
    const d=Math.abs((p.x+p.w/2)-(item.x+item.w/2));
    nearest=Math.min(nearest,d);
    if(overlap(p,item)) collectDiscovery(i);
  }
  state.companionHintCooldown=Math.max(0,state.companionHintCooldown-16);
  if(nearest<210){
    state.rigsbyAlert=Math.min(1,state.rigsbyAlert+.08);
    if(state.companionHintCooldown<=0){
      companionHint.classList.add("show");
      state.companionHintCooldown=1500;
      setTimeout(()=>companionHint.classList.remove("show"),1050);
    }
  }else state.rigsbyAlert=Math.max(0,state.rigsbyAlert-.05);
}

function updateZones(){
  let index=0;
  for(let i=0;i<state.zones.length;i++) if(state.player.x>=state.zones[i].x) index=i;
  if(index!==state.currentZone){
    state.currentZone=index;
    showZone(state.zones[index]);
  }
}

function update(dt) {
  state.time+=dt;
  if(state.cinematic){ updateCinematic(performance.now()); return; }
  if (!state.started || state.paused || state.dialogue || state.complete) return;

  const p=state.player;
  const accel=.66;
  const max=6.35;
  if (state.keys.left) {p.vx-=accel;p.facing=-1;}
  if (state.keys.right) {p.vx+=accel;p.facing=1;}
  if (!state.keys.left && !state.keys.right) p.vx*=p.onGround?.80:.94;
  p.vx=Math.max(-max,Math.min(max,p.vx));
  p.vy+=state.keys.jump?.60:.78;
  if (p.vy>15) p.vy=15;

  const oldY=p.y;
  const wasGrounded=p.onGround;
  state.jumpBufferMs=Math.max(0,state.jumpBufferMs-dt);
  state.coyoteMs=wasGrounded?125:Math.max(0,state.coyoteMs-dt);
  p.x+=p.vx;
  p.y+=p.vy;
  p.x=Math.max(40,Math.min(WORLD_W-p.w-40,p.x));

  p.onGround=false;
  const groundY = p.x<1050 ? FLOOR : FLOOR - Math.min(95,(p.x-1050)*.024);
  if (p.y+p.h>=groundY && oldY+p.h<=groundY+20 && p.vy>=0) {
    p.y=groundY-p.h;p.vy=0;p.onGround=true;state.landingSquash=1;
  }

  for (const plat of state.platforms) {
    const wasAbove=oldY+p.h<=plat.y+8;
    const crosses=p.y+p.h>=plat.y && p.y+p.h<=plat.y+22;
    const horizontal=p.x+p.w>plat.x-10 && p.x<plat.x+plat.w+10;
    if (wasAbove && crosses && horizontal && p.vy>=0) {
      p.y=plat.y-p.h;p.vy=0;p.onGround=true;state.landingSquash=1;
    }
  }

  if(p.onGround && state.jumpBufferMs>0) jump();

  if (p.y>H+200) {
    p.x=state.checkpointX;
    p.y=groundAt(state.checkpointX)-p.h-5;
    p.vx=0;p.vy=0;
    hurtPlayer(p.x+100);
  }

  updateBeetles(dt, oldY);
  updateBlasts(dt);
  updateDiscoveries();
  updateZones();

  if(!state.checkpointReached && p.x>2850){
    state.checkpointReached=true;
    state.checkpointX=2860;
    ui.checkpointCard.classList.remove("hidden");
    setTimeout(()=>ui.checkpointCard.classList.add("hidden"),2800);
    setObjective("Climb through the infested pines","Use the granite ledges and clear the remaining beetles.");
    saveProgress(true);
  }

  state.landingSquash*=.82;
  p.frame += Math.abs(p.vx)*.055;
  if(Math.abs(p.vx)>1.2 && p.onGround && Math.floor(state.time/90)%3===0){
    state.particles.push({x:p.x+p.w/2-p.facing*18,y:p.y+p.h,vx:-p.facing*(.4+Math.random()),vy:-Math.random()*.8,life:18});
  }

  state.dogTrail.push({x:p.x,y:p.y,facing:p.facing});
  if(state.dogTrail.length>90) state.dogTrail.shift();
  const rTarget=state.dogTrail[Math.max(0,state.dogTrail.length-24)]||{x:p.x-105*p.facing};
  const zTarget=state.dogTrail[Math.max(0,state.dogTrail.length-48)]||{x:p.x-175*p.facing};
  state.rigsby.x+=(rTarget.x-state.rigsby.x)*.11;
  state.rigsby.y+=(groundAt(state.rigsby.x)-state.rigsby.h-state.rigsby.y)*.24;
  state.rigsby.frame+=Math.abs(state.rigsby.x-rTarget.x)*.035;
  state.zoey.x+=(zTarget.x-state.zoey.x)*.085;
  state.zoey.y+=(groundAt(state.zoey.x)-state.zoey.h-state.zoey.y)*.22;

  for(const w of state.wildlife){
    w.y=groundAt(w.x)-18;
    const d=Math.abs(state.player.x-w.x);
    if(d<150) w.flee=Math.min(1,w.flee+.08); else w.flee=Math.max(0,w.flee-.015);
    if(w.flee>0) w.x += (w.x>state.player.x?1:-1)*(2+w.flee*5);
  }
  for(const fish of state.fish){
    if(state.time>fish.next && !fish.active){fish.active=1;fish.next=state.time+4500+Math.random()*6000;}
    if(fish.active) fish.active+=dt*.004;
    if(fish.active>3.2) fish.active=0;
  }

  const targetCam=Math.max(0,Math.min(WORLD_W-W,p.x-W*.36));
  state.cameraX+=(targetCam-state.cameraX)*.085;


  if (p.x>4300) {
    if(state.beetlesDefeated>=5) finish();
    else {
      p.x=4260;p.vx=-3;
      setObjective("The trail is blocked",`Defeat ${5-state.beetlesDefeated} more Pine Beetle${5-state.beetlesDefeated===4?"":"s"} first.`);
    }
  }

  const progress=Math.max(0,Math.min(100,(p.x/(WORLD_W-300))*100));
  ui.trailFill.style.width=progress+"%";
  ui.hudAltitude.textContent=state.zones[Math.max(0,state.currentZone)]?.name||"Emerald Shore";

  for (const part of state.particles) {
    part.x+=part.vx;part.y+=part.vy;part.vy+=.12;part.life--;
  }
  state.particles=state.particles.filter(v=>v.life>0);
  for(const burst of state.beetleBursts) burst.life--;
  state.beetleBursts=state.beetleBursts.filter(v=>v.life>0);
}

function groundAt(x) {
  return x<1050?FLOOR:FLOOR-Math.min(95,(x-1050)*.024);
}

function overlap(a,b) {
  return a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y;
}

function draw() {
  ctx.clearRect(0,0,W,H);
  drawSky();
  drawFarMountains();
  drawLake();
  drawLakeLife();
  drawForest();
  drawTerrain();
  drawWorldDetails();
  drawLandmarks();
  drawTrailProps();
  drawWildlife();
  drawAmbientWildlife();
  drawPlatforms();
  drawBeetles();
  drawBlasts();
  drawBeetleBursts();
  drawDiscoveries();
  drawZoey();
  drawRigsby();
  drawPlayer();
  if(state.cinematic) drawPortalArrival();
  if(state.finale) drawBeetleTeaser();
  drawParticles();
  if (!state.started) drawVignette(.28);
}

function drawSky() {
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,"#87d7ed");g.addColorStop(.47,"#b8e8eb");g.addColorStop(1,"#6bb5b1");
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.fillStyle="rgba(255,245,198,.82)";ctx.beginPath();ctx.arc(1030,105,52,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="rgba(255,255,255,.36)";
  for(let i=0;i<7;i++){const x=(i*245-state.cameraX*.06)%1500-100;ctx.beginPath();ctx.ellipse(x,95+(i%3)*32,80,18,0,0,Math.PI*2);ctx.fill();}
  for (const b of state.birds) {
    const x=((b.x+state.time*b.speed-state.cameraX*.12)%(W+300))-100;
    ctx.strokeStyle="rgba(18,70,75,.65)";ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,b.y,9,Math.PI*1.05,Math.PI*1.8);ctx.arc(x+17,b.y,9,Math.PI*1.2,Math.PI*1.95);ctx.stroke();
  }
}

function drawFarMountains() {
  const layers=[
    {off:.08,y:315,c:"#71949e",peaks:[0,260,510,760,1030,1300]},
    {off:.16,y:390,c:"#456f78",peaks:[-100,170,440,710,970,1250,1510]},
    {off:.25,y:450,c:"#284f55",peaks:[-100,210,560,870,1170,1480]}
  ];
  for(const layer of layers){
    ctx.fillStyle=layer.c;ctx.beginPath();ctx.moveTo(0,H);
    for(let i=0;i<layer.peaks.length;i++){const x=layer.peaks[i]-((state.cameraX*layer.off)%310);ctx.lineTo(x,layer.y-(i%3)*65);ctx.lineTo(x+155,layer.y+80);}
    ctx.lineTo(W,H);ctx.closePath();ctx.fill();
  }
  ctx.fillStyle="rgba(241,250,255,.72)";
  ctx.beginPath();ctx.moveTo(480-state.cameraX*.16,325);ctx.lineTo(560-state.cameraX*.16,215);ctx.lineTo(640-state.cameraX*.16,330);ctx.lineTo(600-state.cameraX*.16,300);ctx.lineTo(560-state.cameraX*.16,260);ctx.lineTo(525-state.cameraX*.16,305);ctx.closePath();ctx.fill();
}

function drawLake() {
  const lakeTop=365;
  const g=ctx.createLinearGradient(0,lakeTop,0,FLOOR);
  g.addColorStop(0,"#2d9fc2");g.addColorStop(.45,"#43bdd0");g.addColorStop(1,"#1d748f");
  ctx.fillStyle=g;ctx.fillRect(0,lakeTop,W,FLOOR-lakeTop);
  for(let i=0;i<18;i++){
    const y=lakeTop+12+i*11;
    const x=((i*113-state.cameraX*.32+state.time*.06*(i%2?1:-1))%(W+260))-130;
    ctx.strokeStyle=`rgba(230,253,255,${.1+(i%4)*.035})`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+55,y-4,x+110,y);ctx.stroke();
  }
  // Tahoe-clear shallows with visible stones.
  const shallow=ctx.createLinearGradient(0,FLOOR-72,0,FLOOR);
  shallow.addColorStop(0,"rgba(89,211,214,0)");
  shallow.addColorStop(1,"rgba(181,228,190,.68)");
  ctx.fillStyle=shallow;ctx.fillRect(0,FLOOR-78,W,78);
  for(let i=0;i<28;i++){
    const wx=40+i*69;
    const x=((wx-state.cameraX*.38)%(W+90))-45;
    const y=FLOOR-15-(i%4)*11;
    ctx.fillStyle=`rgba(${95+i%3*18},${116+i%2*12},${111+i%4*8},.38)`;
    ctx.beginPath();ctx.ellipse(x,y,9+(i%4)*4,5+(i%3)*2,-.2,0,Math.PI*2);ctx.fill();
  }
  ctx.strokeStyle="rgba(244,255,250,.75)";ctx.lineWidth=4;
  for(let i=0;i<5;i++){
    const x=((i*290-state.cameraX*.15+state.time*.025)%(W+350))-100;
    ctx.beginPath();ctx.moveTo(x,FLOOR-8-i*3);ctx.quadraticCurveTo(x+70,FLOOR-17-i*3,x+145,FLOOR-8-i*3);ctx.stroke();
  }
}

function drawLakeLife(){
  for(const d of state.ducks){
    const x=d.x-state.cameraX*.25+Math.sin(state.time*.001+d.phase)*22;
    if(x<-55||x>W+55)continue;
    const y=d.y+Math.sin(state.time*.002+d.phase)*2;
    ctx.save();ctx.translate(x,y);
    // Wake and reflection
    ctx.strokeStyle="rgba(235,253,255,.46)";ctx.lineWidth=2;
    ctx.beginPath();ctx.ellipse(-7,8,34,6,0,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle="rgba(50,88,70,.16)";ctx.beginPath();ctx.ellipse(-2,11,20,5,0,0,Math.PI*2);ctx.fill();
    // Mallard body
    ctx.fillStyle="#8c6842";ctx.beginPath();ctx.ellipse(-4,0,22,11,-.08,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#c8a16c";ctx.beginPath();ctx.ellipse(-7,-2,11,6,-.15,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#f2f0d9";ctx.fillRect(8,-7,7,5);
    // Neck and head
    ctx.fillStyle="#245f50";ctx.beginPath();ctx.ellipse(14,-12,9,10,.15,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#183d35";ctx.beginPath();ctx.arc(16,-14,7,0,Math.PI*2);ctx.fill();
    // Bill and eye
    ctx.fillStyle="#efb743";ctx.beginPath();ctx.moveTo(22,-14);ctx.lineTo(32,-11);ctx.lineTo(22,-9);ctx.closePath();ctx.fill();
    ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(18,-16,2.3,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#111";ctx.beginPath();ctx.arc(18.5,-16,1.1,0,Math.PI*2);ctx.fill();
    // Tail
    ctx.fillStyle="#4a3525";ctx.beginPath();ctx.moveTo(-25,-3);ctx.lineTo(-34,-10);ctx.lineTo(-29,1);ctx.closePath();ctx.fill();
    ctx.restore();
  }
  for(const f of state.fish){ if(!f.active)continue; const q=f.active; const x=f.x-state.cameraX*.2; const y=465-Math.sin(Math.min(Math.PI,q))*58;
    ctx.strokeStyle="#eafcff";ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);ctx.stroke();
    ctx.strokeStyle="rgba(255,255,255,.35)";ctx.beginPath();ctx.arc(x,470,12+q*8,0,Math.PI*2);ctx.stroke();
  }
}

function drawWildlife(){
  for(const w of state.wildlife){const x=w.x-state.cameraX;if(x<-60||x>W+60)continue;const y=w.y;
    ctx.save();ctx.translate(x,y);
    if(w.type==="butterfly"){ctx.fillStyle=w.phase%2?"#ffd65c":"#e99bff";const flap=5+Math.sin(state.time*.012+w.phase)*4;ctx.beginPath();ctx.ellipse(-flap,-22,7,11,-.5,0,Math.PI*2);ctx.ellipse(flap,-22,7,11,.5,0,Math.PI*2);ctx.fill();}
    else if(w.type==="squirrel"){ctx.fillStyle="#9a6338";ctx.beginPath();ctx.ellipse(0,-12,13,9,0,0,Math.PI*2);ctx.arc(12,-21,7,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#9a6338";ctx.lineWidth=7;ctx.beginPath();ctx.arc(-10,-18,16,.5,5);ctx.stroke();}
    else {ctx.fillStyle="#c7b399";ctx.beginPath();ctx.ellipse(0,-11,15,9,0,0,Math.PI*2);ctx.arc(12,-20,7,0,Math.PI*2);ctx.ellipse(10,-32,3,12,-.2,0,Math.PI*2);ctx.ellipse(17,-32,3,12,.2,0,Math.PI*2);ctx.fill();}
    ctx.restore();
  }
}


function drawAmbientWildlife(){
  // Eagle gliding over the high trail.
  const ex=((state.time*.045-state.cameraX*.12)%(W+420))-180;
  const ey=95+Math.sin(state.time*.002)*18;
  ctx.save();ctx.translate(ex,ey);ctx.strokeStyle="#44372b";ctx.lineWidth=5;ctx.lineCap="round";
  ctx.beginPath();ctx.moveTo(-34,2);ctx.quadraticCurveTo(-16,-12,0,0);ctx.quadraticCurveTo(16,-12,34,2);ctx.stroke();
  ctx.fillStyle="#f5f0dd";ctx.beginPath();ctx.arc(1,0,4,0,Math.PI*2);ctx.fill();ctx.restore();

  // Dragonflies near the water and creek.
  for(let i=0;i<6;i++){
    const wx=520+i*305;
    const x=wx-state.cameraX+Math.sin(state.time*.004+i)*28;
    const y=455+(i%2)*18+Math.cos(state.time*.006+i)*13;
    if(x<-40||x>W+40) continue;
    ctx.save();ctx.translate(x,y);ctx.strokeStyle="#244b59";ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(-8,0);ctx.lineTo(8,0);ctx.stroke();
    ctx.fillStyle="rgba(197,250,255,.72)";
    ctx.beginPath();ctx.ellipse(-5,-4,7,3,-.5,0,Math.PI*2);ctx.ellipse(5,-4,7,3,.5,0,Math.PI*2);ctx.fill();ctx.restore();
  }
}

function drawZoey(){
  const z=state.zoey,x=z.x-state.cameraX;if(x<-100||x>W+100)return;
  ctx.save();ctx.translate(x,z.y);
  ctx.strokeStyle="#a76d43";ctx.lineWidth=7;ctx.lineCap="round";
  const wag=Math.sin(state.time*.014)*10;
  ctx.beginPath();ctx.moveTo(6,24);ctx.quadraticCurveTo(-8,10+wag,-16,4+wag*.4);ctx.stroke();
  ctx.fillStyle="#f0eee6";ctx.beginPath();ctx.ellipse(34,27,31,19,0,0,Math.PI*2);ctx.arc(59,18,16,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#a76d43";ctx.beginPath();ctx.ellipse(58,10,14,12,0,0,Math.PI*2);ctx.ellipse(48,15,7,17,-.6,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#ff5ca8";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(48,28);ctx.lineTo(70,27);ctx.stroke();ctx.restore();
}

function drawPortalArrival(){
  const p=state.portal; if(p.alpha<=0)return; const x=p.x-state.cameraX;
  ctx.save();ctx.globalAlpha=p.alpha;ctx.translate(x,p.y);ctx.rotate(state.time*.0015);
  const colors=["#ff4ca8","#ff8a3c","#ffe45d","#61e38b","#51c8ff","#9e6cff"];
  colors.forEach((c,i)=>{ctx.strokeStyle=c;ctx.lineWidth=7;ctx.beginPath();ctx.ellipse(0,0,p.r-i*10,p.r*.72-i*7,0,0,Math.PI*2);ctx.stroke();});
  ctx.fillStyle="rgba(255,255,255,.16)";ctx.beginPath();ctx.ellipse(0,0,p.r*.58,p.r*.42,0,0,Math.PI*2);ctx.fill();ctx.restore();
}

function drawBeetleTeaser(){
  const x=3880-state.cameraX; if(x<-40||x>W+40)return; const crawl=(state.time*.025)%55;
  ctx.fillStyle="#26150f";ctx.beginPath();ctx.ellipse(x-22+crawl,groundAt(3880)-112-crawl*.35,7,11,.7,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="#26150f";ctx.lineWidth=2;for(let i=-1;i<=1;i+=2){ctx.beginPath();ctx.moveTo(x-22+crawl,groundAt(3880)-112-crawl*.35);ctx.lineTo(x-30+crawl,groundAt(3880)-102-crawl*.35+i*9);ctx.stroke();}
}

function drawForest() {
  for(const tree of state.pines){
    const x=tree.x-state.cameraX*.82;
    if(x<-130||x>W+130)continue;
    const base=groundAt(tree.x)+15;
    drawPine(x,base,tree.scale*(.92+(tree.x%5)*.025),tree.dead,true,Math.floor(tree.x)%3);
  }
  for(let i=0;i<26;i++){
    const wx=1300+i*170;
    const x=wx-state.cameraX;
    if(x<-170||x>W+170)continue;
    drawPine(x,groundAt(wx)+8,1+(i%4)*.13,i>19&&i%3===0,false,i%3);
  }
}

function drawPine(x,base,s,dead,far,variant=0) {
  ctx.save();ctx.translate(x,base);ctx.scale(s,s);
  ctx.fillStyle=dead?"#70553c":far?"#215e52":"#174c3f";
  ctx.fillRect(-7,-120,14,125);
  const colors=dead?["#a56f3a","#8a5b32","#72503a"]:far?["#347c68","#286756","#205144"]:["#2e8b67","#247454","#195b43"];
  for(let i=0;i<3;i++){
    ctx.fillStyle=colors[i];
    const spread=(variant===0?62:variant===1?52:70);ctx.beginPath();ctx.moveTo(0,-190+i*48-(variant===2?8:0));ctx.lineTo(-spread+i*7,-70+i*28);ctx.lineTo(spread-i*7,-70+i*28);ctx.closePath();ctx.fill();
  }
  ctx.restore();
}

function drawTerrain() {
  const offset=-state.cameraX;
  ctx.fillStyle="#d3bc87";ctx.beginPath();ctx.moveTo(offset, FLOOR-4);ctx.quadraticCurveTo(240+offset,FLOOR-18,470+offset,FLOOR-5);ctx.quadraticCurveTo(750+offset,FLOOR+10,1050+offset,FLOOR);
  ctx.lineTo(4600+offset,FLOOR-95);ctx.lineTo(4600+offset,H);ctx.lineTo(offset,H);ctx.closePath();ctx.fill();
  ctx.fillStyle="#80905d";ctx.beginPath();ctx.moveTo(offset,FLOOR-5);ctx.lineTo(1050+offset,FLOOR-5);ctx.lineTo(4600+offset,FLOOR-100);ctx.lineTo(4600+offset,FLOOR-75);ctx.lineTo(1050+offset,FLOOR+16);ctx.lineTo(offset,FLOOR+16);ctx.closePath();ctx.fill();
  ctx.fillStyle="rgba(237,220,174,.45)";
  for(let i=0;i<85;i++){const x=i*67+30-state.cameraX;if(x<-20||x>W+20)continue;const y=groundAt(i*67+30)+8;ctx.beginPath();ctx.ellipse(x,y,8+(i%4)*3,3,0,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle="#6d7776";
  for(let i=0;i<22;i++){const wx=1150+i*180;const x=wx-state.cameraX;if(x<-90||x>W+90)continue;const y=groundAt(wx);ctx.beginPath();ctx.ellipse(x,y-6,32+(i%3)*12,20+(i%2)*7,-.15,0,Math.PI*2);ctx.fill();}
}

function drawWorldDetails() {
  for(const f of state.flowers){
    const x=f.x-state.cameraX;if(x<0||x>W)continue;
    const y=groundAt(f.x)-2;
    ctx.strokeStyle="#2a6847";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-12);ctx.stroke();
    ctx.fillStyle=["#f6d66c","#f39bbf","#fff4df","#9de1ff"][f.kind];ctx.beginPath();ctx.arc(x,y-14,4,0,Math.PI*2);ctx.fill();
  }
  const signX=4200-state.cameraX;
  if(signX>-100&&signX<W+100){
    ctx.fillStyle="#7b522f";ctx.fillRect(signX-8,groundAt(4200)-104,16,104);ctx.fillStyle="#c99855";ctx.fillRect(signX-80,groundAt(4200)-135,160,52);ctx.strokeStyle="#5d3b23";ctx.lineWidth=4;ctx.strokeRect(signX-80,groundAt(4200)-135,160,52);ctx.fillStyle="#36271e";ctx.font="900 17px system-ui";ctx.textAlign="center";ctx.fillText("TRAILHEAD",signX,groundAt(4200)-103);
  }
  const deadX=3880-state.cameraX;
  if(deadX>-100&&deadX<W+100){drawPine(deadX,groundAt(3880),1.25,true,false);ctx.fillStyle="#4e261c";for(let i=0;i<9;i++){ctx.beginPath();ctx.ellipse(deadX-26+i*7,groundAt(3880)-88+(i%3)*16,4,7,.5,0,Math.PI*2);ctx.fill();}}
}



function drawLandmarks(){
  const landmarks=[
    {type:"cove",x:720},{type:"giantLog",x:1510},{type:"waterfall",x:2460},
    {type:"ruins",x:2910},{type:"dome",x:3550},{type:"overlook",x:4050}
  ];
  for(const l of landmarks){
    const x=l.x-state.cameraX;
    if(x<-260||x>W+260) continue;
    const y=groundAt(l.x);
    if(l.type==="cove"){
      ctx.fillStyle="rgba(75,214,211,.42)";ctx.beginPath();ctx.ellipse(x,y+24,170,38,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="rgba(247,241,204,.55)";ctx.beginPath();ctx.ellipse(x,y+17,115,20,0,0,Math.PI*2);ctx.fill();
    }else if(l.type==="giantLog"){
      ctx.save();ctx.translate(x,y-31);ctx.rotate(-.11);
      ctx.fillStyle="#6b3f24";roundRect(-110,-22,220,44,20);ctx.fill();
      ctx.strokeStyle="#a86a3b";ctx.lineWidth=5;
      for(let i=-75;i<85;i+=28){ctx.beginPath();ctx.moveTo(i,-18);ctx.lineTo(i+12,18);ctx.stroke();}
      ctx.fillStyle="#3e2518";ctx.beginPath();ctx.ellipse(110,0,21,22,0,0,Math.PI*2);ctx.fill();ctx.restore();
    }else if(l.type==="waterfall"){
      ctx.fillStyle="#596c70";ctx.beginPath();ctx.moveTo(x-92,y);ctx.lineTo(x-54,y-152);ctx.lineTo(x+62,y-132);ctx.lineTo(x+95,y);ctx.closePath();ctx.fill();
      const g=ctx.createLinearGradient(x,y-138,x,y);
      g.addColorStop(0,"rgba(238,255,255,.96)");g.addColorStop(.55,"rgba(133,227,244,.88)");g.addColorStop(1,"rgba(76,194,211,.28)");
      ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x-24,y-137);ctx.quadraticCurveTo(x+10,y-72,x-10,y);ctx.lineTo(x+31,y);ctx.quadraticCurveTo(x+12,y-75,x+20,y-130);ctx.closePath();ctx.fill();
      ctx.fillStyle="rgba(200,250,255,.48)";ctx.beginPath();ctx.ellipse(x+5,y-3,70,17,0,0,Math.PI*2);ctx.fill();
    }else if(l.type==="ruins"){
      ctx.fillStyle="#70553d";ctx.fillRect(x-62,y-84,18,84);ctx.fillRect(x+45,y-64,18,64);
      ctx.fillStyle="#98714c";ctx.fillRect(x-62,y-84,125,14);
      ctx.fillStyle="#545e59";ctx.fillRect(x-45,y-43,90,10);
      ctx.fillStyle="#ccb071";ctx.font="900 12px system-ui";ctx.textAlign="center";ctx.fillText("RANGER POST 1964",x,y-92);
    }else if(l.type==="dome"){
      const g=ctx.createLinearGradient(x-130,y-150,x+130,y);
      g.addColorStop(0,"#b8bbb1");g.addColorStop(.52,"#808a88");g.addColorStop(1,"#5f6b6b");
      ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x-145,y);ctx.quadraticCurveTo(x-120,y-140,x-15,y-168);ctx.quadraticCurveTo(x+112,y-138,x+152,y);ctx.closePath();ctx.fill();
      ctx.fillStyle="rgba(255,255,255,.22)";ctx.beginPath();ctx.ellipse(x-35,y-118,55,18,-.35,0,Math.PI*2);ctx.fill();
    }else{
      ctx.fillStyle="#5b412b";ctx.fillRect(x-8,y-92,16,92);
      ctx.fillStyle="#d6ad61";roundRect(x-88,y-128,176,46,8);ctx.fill();
      ctx.strokeStyle="#5b412b";ctx.lineWidth=4;ctx.stroke();
      ctx.fillStyle="#30251d";ctx.font="900 15px system-ui";ctx.textAlign="center";ctx.fillText("EAGLE OVERLOOK",x,y-99);
      ctx.strokeStyle="#8e7554";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x-120,y-15);ctx.lineTo(x+120,y-15);ctx.stroke();
    }
  }
}

function drawTrailProps(){
  const props=[
    {type:"log",x:1180},{type:"pinecones",x:1710},{type:"bridge",x:2350},
    {type:"boulder",x:3040},{type:"pinecones",x:3480},{type:"log",x:3780}
  ];
  for(const item of props){
    const x=item.x-state.cameraX;
    if(x<-180||x>W+180) continue;
    const y=groundAt(item.x);
    if(item.type==="log"){
      ctx.save();ctx.translate(x,y-17);ctx.rotate(-.06);
      ctx.fillStyle="#714429";roundRect(-55,-15,110,30,13);ctx.fill();
      ctx.strokeStyle="#a97549";ctx.lineWidth=4;
      for(let i=-35;i<=35;i+=18){ctx.beginPath();ctx.moveTo(i,-12);ctx.lineTo(i+8,12);ctx.stroke();}
      ctx.fillStyle="#4c301f";ctx.beginPath();ctx.ellipse(55,0,13,15,0,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#a97549";ctx.lineWidth=2;ctx.beginPath();ctx.arc(55,0,8,0,Math.PI*2);ctx.stroke();ctx.restore();
    }else if(item.type==="bridge"){
      ctx.fillStyle="#654329";ctx.fillRect(x-72,y-14,144,12);
      for(let i=-64;i<=64;i+=16){ctx.fillStyle=i%32===0?"#a87948":"#92653d";ctx.fillRect(x+i,y-25,13,22);}
      ctx.fillStyle="#51331f";ctx.fillRect(x-69,y-3,10,30);ctx.fillRect(x+59,y-3,10,30);
    }else if(item.type==="boulder"){
      ctx.fillStyle="#818b8b";ctx.beginPath();ctx.moveTo(x-55,y);ctx.quadraticCurveTo(x-45,y-55,x-8,y-62);ctx.quadraticCurveTo(x+42,y-55,x+58,y);ctx.closePath();ctx.fill();
      ctx.fillStyle="rgba(255,255,255,.2)";ctx.beginPath();ctx.ellipse(x-10,y-42,24,9,-.4,0,Math.PI*2);ctx.fill();
    }else{
      for(let i=0;i<5;i++){ctx.save();ctx.translate(x+i*14-28,y-5-(i%2)*4);ctx.rotate(i*.7);ctx.fillStyle="#6c4326";ctx.beginPath();ctx.ellipse(0,0,6,11,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#a66b37";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-4,-5);ctx.lineTo(4,5);ctx.stroke();ctx.restore();}
    }
  }
}

function drawPlatforms() {
  for(const p of state.platforms){
    const x=p.x-state.cameraX;if(x+p.w<0||x>W)continue;
    ctx.fillStyle="#747d7d";roundRect(x,p.y,p.w,p.h,10);ctx.fill();
    ctx.fillStyle="#a7aaa0";roundRect(x+8,p.y+4,p.w-16,7,5);ctx.fill();
    ctx.fillStyle="#47704e";ctx.fillRect(x+8,p.y-4,p.w-16,6);
  }
}


function drawBeetles(){
  for(const b of state.beetles){
    if(!b.alive) continue;
    const x=b.x-state.cameraX;
    if(x<-70||x>W+70) continue;
    ctx.save();
    ctx.translate(x+b.w/2,b.y+b.h/2);
    if(b.vx<0) ctx.scale(-1,1);
    const bob=Math.sin(state.time*.012+b.x)*2;
    ctx.translate(0,bob);
    ctx.fillStyle="#261411";
    ctx.beginPath();ctx.ellipse(-7,0,9,10,0,0,Math.PI*2);ctx.fill();
    const shell=ctx.createLinearGradient(-2,-11,17,10);
    shell.addColorStop(0,"#a5472e");shell.addColorStop(.5,"#6e281e");shell.addColorStop(1,"#3c1815");
    ctx.fillStyle=shell;ctx.beginPath();ctx.ellipse(7,0,15,11,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#d06b43";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(7,-10);ctx.lineTo(7,10);ctx.stroke();
    ctx.fillStyle="#20100d";ctx.beginPath();ctx.arc(-14,-2,6,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#2a1511";ctx.lineWidth=3;
    for(let i=-1;i<=1;i++){
      ctx.beginPath();ctx.moveTo(-8,i*5);ctx.lineTo(-24,i*9-4);ctx.stroke();
      ctx.beginPath();ctx.moveTo(8,i*5);ctx.lineTo(24,i*9-4);ctx.stroke();
    }
    ctx.fillStyle="#ffcf5a";ctx.beginPath();ctx.arc(10,-4,2.5,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
}



function drawBlasts(){
  for(const b of state.blasts){
    const x=b.x-state.cameraX;
    const pulse=1+Math.sin(state.time*.025)*.12;
    ctx.save();ctx.translate(x,b.y);ctx.scale(b.facing,1);
    ctx.globalCompositeOperation="lighter";
    const g=ctx.createRadialGradient(0,0,2,0,0,34*pulse);
    g.addColorStop(0,"rgba(255,255,255,1)");
    g.addColorStop(.2,"rgba(255,235,97,.95)");
    g.addColorStop(.42,"rgba(255,88,184,.92)");
    g.addColorStop(.68,"rgba(72,218,255,.72)");
    g.addColorStop(1,"rgba(76,255,177,0)");
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,34*pulse,0,Math.PI*2);ctx.fill();
    const colors=["#ff54ae","#ffb13b","#ffe869","#65e79c","#54cfff","#a573ff"];
    colors.forEach((c,i)=>{
      ctx.strokeStyle=c;ctx.lineWidth=3;
      ctx.beginPath();ctx.moveTo(-28-i*4,-12+i*4);ctx.quadraticCurveTo(-8,0,25,0);ctx.stroke();
    });
    ctx.restore();
  }
}

function drawBeetleBursts(){
  for(const b of state.beetleBursts){
    const x=b.x-state.cameraX;
    const progress=1-b.life/24;
    ctx.save();ctx.globalAlpha=Math.max(0,b.life/24);ctx.translate(x,b.y);
    ctx.strokeStyle="#ffd86a";ctx.lineWidth=3;
    for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.beginPath();ctx.moveTo(Math.cos(a)*8,Math.sin(a)*8);ctx.lineTo(Math.cos(a)*(18+progress*24),Math.sin(a)*(18+progress*24));ctx.stroke();}
    ctx.fillStyle="#6e281e";ctx.beginPath();ctx.arc(0,0,10*(1-progress),0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
}

function drawDiscoveries(){
  for(let i=0;i<state.discoveries.length;i++){
    if(state.discoveriesFound[i]) continue;
    const m=state.discoveries[i],x=m.x-state.cameraX;
    if(x<-80||x>W+80) continue;
    const bob=Math.sin(state.time*.005+i)*7;
    const glow=22+Math.sin(state.time*.008+i)*7;
    ctx.save();ctx.translate(x+m.w/2,m.y+m.h/2+bob);
    ctx.shadowColor="#ffe58d";ctx.shadowBlur=glow;
    const g=ctx.createRadialGradient(0,0,3,0,0,28);
    g.addColorStop(0,"#fffde7");g.addColorStop(.45,"#ffe58d");g.addColorStop(1,"rgba(255,199,80,.25)");
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,27,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;ctx.font="28px serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(m.icon,0,1);
    ctx.restore();
  }
}

function drawSprite(img,x,y,w,h,frame,count=8,facing=1) {
  if(!img.complete||!img.naturalWidth){ctx.fillStyle="#ff5ab9";roundRect(x,y,w,h,18);ctx.fill();return;}
  const sw=img.naturalWidth/count,sh=img.naturalHeight;
  ctx.save();
  if(facing<0){ctx.translate(x+w,y);ctx.scale(-1,1);ctx.drawImage(img,(Math.floor(frame)%count)*sw,0,sw,sh,0,0,w,h);}
  else ctx.drawImage(img,(Math.floor(frame)%count)*sw,0,sw,sh,x,y,w,h);
  ctx.restore();
}

function drawPlayer() {
  if(state.invulnerable>0 && Math.floor(state.invulnerable/100)%2===0) return;
  const p=state.player,x=p.x-state.cameraX;
  const dude=dudes[state.dudeIndex];
  ctx.save();
  const squash=state.landingSquash*.09;
  const stretch=Math.max(0,Math.min(.08,-p.vy*.004));
  ctx.translate(x+p.w/2,p.y+p.h);
  ctx.scale(1+squash-stretch,1-squash+stretch);
  ctx.translate(-(x+p.w/2),-(p.y+p.h));
  drawSprite(images[dude.key],x,p.y,p.w,p.h,p.frame,8,p.facing);
  ctx.restore();
  ctx.fillStyle="rgba(0,0,0,.2)";ctx.beginPath();ctx.ellipse(x+p.w/2,p.y+p.h+3,30,7,0,0,Math.PI*2);ctx.fill();
}

function drawRigsby() {
  const r=state.rigsby,x=r.x-state.cameraX;
  drawSprite(images.rigsby,x,r.y,r.w,r.h,r.frame,8,state.player.facing);
  if(state.rigsbyAlert>.15){
    const pulse=1+Math.sin(state.time*.018)*.12;
    ctx.save();ctx.globalAlpha=state.rigsbyAlert;ctx.translate(x+r.w*.72,r.y-10);
    ctx.scale(pulse,pulse);ctx.fillStyle="#fff2a8";ctx.font="900 22px system-ui";ctx.textAlign="center";ctx.fillText("!",0,0);
    ctx.restore();
  }
}

function drawParticles() {
  for(const p of state.particles){const x=p.x-state.cameraX;ctx.globalAlpha=Math.max(0,p.life/55);ctx.fillStyle=p.life>35?"#ffe58d":"#79edd1";ctx.beginPath();ctx.arc(x,p.y,3+(p.life%4),0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
}

function drawVignette(alpha) {
  const g=ctx.createRadialGradient(W/2,H/2,180,W/2,H/2,760);g.addColorStop(0,"transparent");g.addColorStop(1,`rgba(0,14,24,${alpha})`);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
}

function roundRect(x,y,w,h,r) {
  ctx.beginPath();ctx.roundRect(x,y,w,h,r);
}

function showInputStatus(label){
  if(!ui.inputStatus)return;
  ui.inputStatus.classList.add("active");
  ui.inputStatus.querySelector("b").textContent=label;
  clearTimeout(showInputStatus.timer);
  showInputStatus.timer=setTimeout(()=>{
    ui.inputStatus.classList.remove("active");
    ui.inputStatus.querySelector("b").textContent="READY";
  },650);
}

const activePointers=new Map();

function releaseAllInput(){
  state.keys.left=state.keys.right=state.keys.jump=state.keys.power=false;
  activePointers.clear();
  document.querySelectorAll("#touchControls button.isPressed").forEach(button=>button.classList.remove("isPressed"));
}

function gameplayReady(){
  return state.started&&!state.paused&&!state.dialogue&&!state.complete&&!state.cinematic;
}

document.querySelectorAll("[data-action]").forEach(button=>{
  const action=button.dataset.action;
  const pressButton=event=>{
    event.preventDefault();
    if(!gameplayReady())return;
    activePointers.set(event.pointerId,action);
    press(action,true);
    try{button.setPointerCapture(event.pointerId)}catch(_){}
    button.classList.add("isPressed");
    showInputStatus(action==="power"?"POWER":action==="jump"?"JUMP":action.toUpperCase());
    canvas.focus({preventScroll:true});
  };
  const releaseButton=event=>{
    event.preventDefault();
    const held=activePointers.get(event.pointerId)||action;
    press(held,false);
    activePointers.delete(event.pointerId);
    button.classList.remove("isPressed");
    try{if(button.hasPointerCapture?.(event.pointerId))button.releasePointerCapture(event.pointerId)}catch(_){}
  };
  button.addEventListener("pointerdown",pressButton,{passive:false});
  button.addEventListener("pointerup",releaseButton,{passive:false});
  button.addEventListener("pointercancel",releaseButton,{passive:false});
  button.addEventListener("lostpointercapture",releaseButton);
  button.addEventListener("contextmenu",event=>event.preventDefault());
  button.addEventListener("click",event=>event.preventDefault(),{passive:false});
});

function handleKeyboard(event,isDown){
  const code=event.code||"";
  let action="";
  if(code==="ArrowLeft"||code==="KeyA")action="left";
  else if(code==="ArrowRight"||code==="KeyD")action="right";
  else if(code==="ArrowUp"||code==="KeyW"||code==="Space")action="jump";
  else if(code==="KeyX"||code==="KeyF")action="power";
  if(action){
    event.preventDefault();
    if(gameplayReady()||!isDown)press(action,isDown);
    if(isDown&&!event.repeat)showInputStatus(action==="power"?"POWER":action==="jump"?"JUMP":action.toUpperCase());
    return true;
  }
  return false;
}

window.addEventListener("keydown",event=>{
  if(handleKeyboard(event,true))return;
  if(event.code==="Digit1")setDude(0);
  if(event.code==="Digit2")setDude(1);
  if(event.code==="Digit3")setDude(2);
  if(event.code==="Escape"){event.preventDefault();togglePause();}
},{capture:true,passive:false});

window.addEventListener("keyup",event=>handleKeyboard(event,false),{capture:true,passive:false});
window.addEventListener("blur",releaseAllInput);
window.addEventListener("pagehide",releaseAllInput);
document.addEventListener("visibilitychange",()=>{if(document.hidden)releaseAllInput();});
canvas.addEventListener("pointerdown",()=>canvas.focus({preventScroll:true}));

ui.begin.addEventListener("click",begin);
ui.skipCinematic.addEventListener("click",endCinematic);
ui.dialogueNext.addEventListener("click",nextDialogue);
ui.switchBtn.addEventListener("pointerdown",event=>{
  event.preventDefault();
  if(!gameplayReady())return;
  setDude(state.dudeIndex+1);
  ui.switchBtn.classList.add("isPressed");
  showInputStatus("SWITCH");
},{passive:false});
ui.switchBtn.addEventListener("pointerup",event=>{event.preventDefault();ui.switchBtn.classList.remove("isPressed");},{passive:false});
ui.switchBtn.addEventListener("pointercancel",()=>ui.switchBtn.classList.remove("isPressed"));
ui.pauseBtn.addEventListener("click",()=>togglePause());
ui.resume.addEventListener("click",()=>togglePause(false));
ui.restart.addEventListener("click",()=>{togglePause(false);begin();});
ui.replay.addEventListener("click",()=>{begin();});

let last=performance.now();
function loop(now){
  const dt=Math.min(32,now-last);last=now;
  update(dt);draw();requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

window.__TAHOE_RELEASE__={version:"2.0.7v",name:"The Great Tahoe Rebuild",publicDevShortcuts:false,features:["four saved Tahoe memories","Rigsby discovery alerts","five named trail zones","Emerald Shore cove","giant fallen pine","Eagle Creek waterfall","historic ranger ruins","granite dome","Eagle Overlook","gliding eagle","dragonflies","reactive wildlife","exploration progression"]};
})();