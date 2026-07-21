(() => {
"use strict";

const canvas = document.getElementById("tahoeCanvas");
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;
const WORLD_W = 4600;
const FLOOR = 570;
const RELEASE = "2.0.1";

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
  cameraX:0,
  time:0,
  dudeIndex:0,
  keys:{left:false,right:false,jump:false},
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
  memory:{x:2440,y:320,w:42,h:42}
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
  hudDude:document.getElementById("hudDude"),
  hudPortrait:document.getElementById("hudPortrait"),
  hudMemories:document.getElementById("hudMemories"),
  hudAltitude:document.getElementById("hudAltitude"),
  trailFill:document.getElementById("trailProgressFill"),
  objectiveTitle:document.getElementById("objectiveTitle"),
  objectiveText:document.getElementById("objectiveText"),
  missionCard:document.getElementById("missionCard"),
  cinematicCaption:document.getElementById("cinematicCaption"),
  cinematicText:document.getElementById("cinematicText"),
  skipCinematic:document.getElementById("skipCinematic"),
  photoFrame:document.getElementById("photoFrame")
};

const dialogue = [
  ["Will","Sixteen years... and somehow it never gets old.","assets/portraits/will.png"],
  ["Daniel","Every time we come back, it still feels like home.","assets/portraits/daniel.png"],
  ["Caleb","Wait. Look at those trees... something is wrong.","assets/portraits/caleb.png"]
];

function reset() {
  Object.assign(state.player,{x:250,y:FLOOR-102,vx:0,vy:0,onGround:true,facing:1,frame:0});
  Object.assign(state.rigsby,{x:140,y:FLOOR-58,frame:0});
  state.cameraX=0;
  state.cinematic=false; state.cinematicStage=0; state.missionShown=false; state.finale=false;
  state.memoryFound=false;
  state.complete=false;
  state.dudeIndex=0;
  state.dialogueIndex=0;
  state.particles.length=0;
  ui.hudMemories.textContent="0";
  ui.memoryCard.classList.add("hidden");
  ui.trailheadCard.classList.add("hidden");
  ui.missionCard.classList.add("hidden"); ui.cinematicCaption.classList.add("hidden"); ui.photoFrame.classList.add("hidden");
  setDude(0);
  setObjective("Take in the lake","Walk right and explore the shoreline.");
}

function begin() {
  reset();
  state.started=true;
  state.paused=false;
  state.cinematic=true;
  state.cinematicStart=performance.now();
  state.cameraX=0;
  ui.opening.classList.add("hidden");
  ui.cinematicCaption.classList.remove("hidden");
  ui.cinematicText.textContent="The portal is opening over the lake...";
  canvas.focus();
}

function endCinematic(){
  state.cinematic=false;
  state.portal.alpha=0;
  state.cameraX=0;
  ui.cinematicCaption.classList.add("hidden");
  startDialogue();
}

function updateCinematic(now){
  const t=now-state.cinematicStart;
  state.portal.r=Math.min(135,t*.07);
  state.portal.alpha=Math.min(1,t/700);
  if(t<2400){state.cameraX=0;ui.cinematicText.textContent="The portal is opening over the lake...";}
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
    setObjective("Reach the trailhead","Follow the shoreline and investigate the dying pines.");
    ui.missionCard.classList.remove("hidden");
    state.missionShown=true;
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
}

function togglePause(force) {
  if (!state.started || state.complete) return;
  state.paused=typeof force==="boolean"?force:!state.paused;
  ui.pauseMenu.classList.toggle("hidden",!state.paused);
}

function finish() {
  if (state.complete) return;
  state.complete=true; state.finale=true;
  state.player.vx=0;
  setObjective("Something is in the trees","A faint clicking comes from beneath the bark.");
  setTimeout(()=>ui.trailheadCard.classList.remove("hidden"),2100);
}

function press(action,value) {
  if (action==="jump" && value && !state.keys.jump) jump();
  state.keys[action]=value;
}

function jump() {
  if (!state.started || state.paused || state.dialogue || state.complete) return;
  if (state.player.onGround) {
    state.player.vy=-12.8;
    state.player.onGround=false;
    for(let i=0;i<8;i++) state.particles.push({x:state.player.x+34,y:state.player.y+98,vx:(Math.random()-.5)*2,vy:-Math.random()*2,life:28});
  }
}

function update(dt) {
  state.time+=dt;
  if(state.cinematic){ updateCinematic(performance.now()); return; }
  if (!state.started || state.paused || state.dialogue || state.complete) return;

  const p=state.player;
  const accel=.75;
  const max=6.1;
  if (state.keys.left) {p.vx-=accel;p.facing=-1;}
  if (state.keys.right) {p.vx+=accel;p.facing=1;}
  if (!state.keys.left && !state.keys.right) p.vx*=.78;
  p.vx=Math.max(-max,Math.min(max,p.vx));
  p.vy+=.63;
  if (p.vy>15) p.vy=15;

  const oldY=p.y;
  p.x+=p.vx;
  p.y+=p.vy;
  p.x=Math.max(40,Math.min(WORLD_W-p.w-40,p.x));

  p.onGround=false;
  const groundY = p.x<1050 ? FLOOR : FLOOR - Math.min(95,(p.x-1050)*.024);
  if (p.y+p.h>=groundY && oldY+p.h<=groundY+20 && p.vy>=0) {
    p.y=groundY-p.h;p.vy=0;p.onGround=true;
  }

  for (const plat of state.platforms) {
    const wasAbove=oldY+p.h<=plat.y+8;
    const crosses=p.y+p.h>=plat.y && p.y+p.h<=plat.y+22;
    const horizontal=p.x+p.w>plat.x && p.x<plat.x+plat.w;
    if (wasAbove && crosses && horizontal && p.vy>=0) {
      p.y=plat.y-p.h;p.vy=0;p.onGround=true;
    }
  }

  if (p.y>H+200) {
    p.x=Math.max(120,p.x-260);p.y=300;p.vx=0;p.vy=0;
  }

  p.frame += Math.abs(p.vx)*.055;

  const followTarget=p.x-105*p.facing;
  state.rigsby.x+=(followTarget-state.rigsby.x)*.055;
  state.rigsby.y+=(groundAt(state.rigsby.x)-state.rigsby.h-state.rigsby.y)*.16;
  state.rigsby.frame+=Math.abs(state.rigsby.x-followTarget)*.02;
  state.zoey.x+=(state.player.x-175*state.player.facing-state.zoey.x)*.035;
  state.zoey.y+=(groundAt(state.zoey.x)-state.zoey.h-state.zoey.y)*.14;

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

  if (!state.memoryFound && overlap(p,state.memory)) {
    state.memoryFound=true;
    ui.hudMemories.textContent="1";
    ui.memoryCard.classList.remove("hidden");
    ui.photoFrame.classList.remove("hidden");
    setTimeout(()=>ui.photoFrame.classList.add("hidden"),1850);
    setObjective("Reach the trailhead","Your first memory is safe. Keep climbing.");
    setTimeout(()=>ui.memoryCard.classList.add("hidden"),3500);
    for(let i=0;i<45;i++) state.particles.push({x:state.memory.x+20,y:state.memory.y+20,vx:(Math.random()-.5)*7,vy:(Math.random()-.7)*6,life:55});
  }

  if (p.x>4300) finish();

  const progress=Math.max(0,Math.min(100,(p.x/(WORLD_W-300))*100));
  ui.trailFill.style.width=progress+"%";
  ui.hudAltitude.textContent=p.x<1100?"Lake Level":p.x<2600?"Forest Trail":"Granite Overlook";

  for (const part of state.particles) {
    part.x+=part.vx;part.y+=part.vy;part.vy+=.12;part.life--;
  }
  state.particles=state.particles.filter(v=>v.life>0);
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
  drawWildlife();
  drawPlatforms();
  drawMemory();
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
}

function drawLakeLife(){
  for(const d of state.ducks){
    const x=d.x-state.cameraX*.25+Math.sin(state.time*.001+d.phase)*22;
    if(x<-40||x>W+40)continue;
    ctx.fillStyle="#5b432c";ctx.beginPath();ctx.ellipse(x,d.y,16,8,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#24614e";ctx.beginPath();ctx.arc(x+12,d.y-7,7,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="rgba(255,255,255,.28)";ctx.beginPath();ctx.ellipse(x-4,d.y+6,29,5,0,0,Math.PI*2);ctx.stroke();
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

function drawZoey(){
  const z=state.zoey,x=z.x-state.cameraX;if(x<-100||x>W+100)return;
  ctx.save();ctx.translate(x,z.y);ctx.fillStyle="#f0eee6";ctx.beginPath();ctx.ellipse(34,27,31,19,0,0,Math.PI*2);ctx.arc(59,18,16,0,Math.PI*2);ctx.fill();
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
    drawPine(x,base,tree.scale,tree.dead,true);
  }
  for(let i=0;i<26;i++){
    const wx=1300+i*170;
    const x=wx-state.cameraX;
    if(x<-170||x>W+170)continue;
    drawPine(x,groundAt(wx)+8,1+(i%4)*.13,i>19&&i%3===0,false);
  }
}

function drawPine(x,base,s,dead,far) {
  ctx.save();ctx.translate(x,base);ctx.scale(s,s);
  ctx.fillStyle=dead?"#70553c":far?"#215e52":"#174c3f";
  ctx.fillRect(-7,-120,14,125);
  const colors=dead?["#a56f3a","#8a5b32","#72503a"]:far?["#347c68","#286756","#205144"]:["#2e8b67","#247454","#195b43"];
  for(let i=0;i<3;i++){
    ctx.fillStyle=colors[i];
    ctx.beginPath();ctx.moveTo(0,-190+i*48);ctx.lineTo(-62+i*7,-70+i*28);ctx.lineTo(62-i*7,-70+i*28);ctx.closePath();ctx.fill();
  }
  ctx.restore();
}

function drawTerrain() {
  const offset=-state.cameraX;
  ctx.fillStyle="#c8b27f";ctx.beginPath();ctx.moveTo(offset, FLOOR);ctx.lineTo(1050+offset,FLOOR);
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

function drawPlatforms() {
  for(const p of state.platforms){
    const x=p.x-state.cameraX;if(x+p.w<0||x>W)continue;
    ctx.fillStyle="#747d7d";roundRect(x,p.y,p.w,p.h,10);ctx.fill();
    ctx.fillStyle="#a7aaa0";roundRect(x+8,p.y+4,p.w-16,7,5);ctx.fill();
    ctx.fillStyle="#47704e";ctx.fillRect(x+8,p.y-4,p.w-16,6);
  }
}

function drawMemory() {
  if(state.memoryFound)return;
  const m=state.memory;const x=m.x-state.cameraX;if(x<-80||x>W+80)return;
  const bob=Math.sin(state.time*.005)*8;
  ctx.save();ctx.translate(x+m.w/2,m.y+m.h/2+bob);ctx.shadowColor="#ffe58d";ctx.shadowBlur=25;ctx.fillStyle="#ffe58d";ctx.beginPath();ctx.arc(0,0,25,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.font="30px serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("📸",0,1);ctx.restore();
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
  const p=state.player,x=p.x-state.cameraX;
  const dude=dudes[state.dudeIndex];
  drawSprite(images[dude.key],x,p.y,p.w,p.h,p.frame,8,p.facing);
  ctx.fillStyle="rgba(0,0,0,.2)";ctx.beginPath();ctx.ellipse(x+p.w/2,p.y+p.h+3,30,7,0,0,Math.PI*2);ctx.fill();
}

function drawRigsby() {
  const r=state.rigsby,x=r.x-state.cameraX;
  drawSprite(images.rigsby,x,r.y,r.w,r.h,r.frame,8,state.player.facing);
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

function bindHold(button,action) {
  const down=e=>{e.preventDefault();press(action,true);};
  const up=e=>{e.preventDefault();press(action,false);};
  button.addEventListener("pointerdown",down);
  button.addEventListener("pointerup",up);
  button.addEventListener("pointercancel",up);
  button.addEventListener("pointerleave",up);
}

document.querySelectorAll("[data-action]").forEach(btn=>bindHold(btn,btn.dataset.action));
window.addEventListener("keydown",e=>{
  if(["ArrowLeft","ArrowRight","ArrowUp"," ","a","d","w","1","2","3","Escape"].includes(e.key))e.preventDefault();
  if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")press("left",true);
  if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")press("right",true);
  if(e.key==="ArrowUp"||e.key.toLowerCase()==="w"||e.key===" ")press("jump",true);
  if(e.key==="1")setDude(0);if(e.key==="2")setDude(1);if(e.key==="3")setDude(2);
  if(e.key==="Escape")togglePause();
});
window.addEventListener("keyup",e=>{
  if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")press("left",false);
  if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")press("right",false);
  if(e.key==="ArrowUp"||e.key.toLowerCase()==="w"||e.key===" ")press("jump",false);
});
window.addEventListener("blur",()=>{state.keys.left=state.keys.right=state.keys.jump=false;if(state.started&&!state.complete)togglePause(true);});

ui.begin.addEventListener("click",begin);
ui.skipCinematic.addEventListener("click",endCinematic);
ui.dialogueNext.addEventListener("click",nextDialogue);
ui.switchBtn.addEventListener("click",()=>setDude(state.dudeIndex+1));
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

window.__TAHOE_RELEASE__={version:"2.0.1",name:"The Arrival",features:["portal arrival cinematic","camera flyover","Zoey companion","ambient wildlife","fish and ducks","mission reveal","memory postcard","pine beetle finale teaser"]};
})();