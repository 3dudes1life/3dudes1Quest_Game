import {CONFIG} from './config.js';
import {createInput} from './input.js';
import {createUI} from './ui.js';
import {Game} from './game.js';

const canvas=document.getElementById('gameCanvas');
canvas.width=CONFIG.width;canvas.height=CONFIG.height;

const ui=createUI();
let game;
const input=createInput(index=>game?.switchDude(index));

game=new Game(canvas,ui,input,state=>{
  ui.refs.completeStats.textContent=`You collected ${state.cards}/6 Gay Cards and restored ${state.beacons}/3 Prism Beacons.`;
  ui.show('complete');
});

const SAVE_KEY='3dudes1quest-save-v100';
const continueBtn=document.getElementById('continueBtn');
const saveStatus=document.getElementById('saveStatus');
const saveToast=document.getElementById('saveToast');

function readSave(){
  try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'null')}catch{return null}
}
function refreshSaveUI(){
  const save=readSave();
  continueBtn.classList.toggle('hidden',!save);
  saveStatus.textContent=save?`Saved quest available • ${new Date(save.savedAt).toLocaleString()}`:'No saved quest yet.';
}
function saveQuest(){
  if(!game?.running)return;
  localStorage.setItem(SAVE_KEY,JSON.stringify(game.getSaveData()));
  refreshSaveUI();
  saveToast.classList.add('show');
  clearTimeout(saveQuest.timer);
  saveQuest.timer=setTimeout(()=>saveToast.classList.remove('show'),1400);
}
document.getElementById('startBtn').onclick=()=>{
  localStorage.removeItem(SAVE_KEY);refreshSaveUI();ui.show('game');game.start();
  playCutscene([
    {title:'The Southern California Road Trip',text:'A strange beige wave is draining the color from Home Base, Hillcrest, the coast, and Los Angeles.'},
    {title:'The Route',text:'Travel from Home Base through Hillcrest and Pacific Coast Highway before confronting the HOA Queen in Los Angeles.'},
    {title:'Triangle of Support',text:'Switch between Will, Daniel, and Caleb. Together, their power is stronger.'}
  ]);
};
continueBtn.onclick=()=>{const save=readSave();ui.show('game');game.start(save)};
refreshSaveUI();
document.getElementById('helpBtn').onclick=()=>ui.show('help');
document.getElementById('backBtn').onclick=()=>ui.show('title');
document.getElementById('pauseBtn').onclick=()=>game.togglePause();
document.getElementById('switchBtn').onclick=()=>game.switchDude();
document.getElementById('restartBtn').onclick=()=>{ui.show('game');game.start()};
document.getElementById('portalBtn').onclick=()=>ui.show('portal');
document.getElementById('titleBtn').onclick=()=>ui.show('title');


const dialogueBox=document.getElementById('dialogueBox');
const dialogueName=document.getElementById('dialogueName');
const dialoguePortrait=document.getElementById('dialoguePortrait');
const dialogueText=document.getElementById('dialogueText');
const dialogueNext=document.getElementById('dialogueNext');
let dialogueOpen=false;

window.addEventListener('quest-dialogue',e=>{
  dialogueName.textContent=e.detail.name;
  const portraitMap={
    'Will':'will','Daniel':'daniel','Caleb':'caleb','Neighbor':'neighbor',
    'Hillcrest Local':'hillcrest local','Café Regular':'café regular',
    'Coastal Local':'coastal local','LA Local':'la local',
    'HOA Queen':'hoa queen','Rigsby':'will'
  };
  const key=(portraitMap[e.detail.name]||e.detail.name).toLowerCase().replaceAll(' ','_').replaceAll('é','e');
  dialoguePortrait.src=`assets/portraits/${key}.png`;
  dialoguePortrait.alt=e.detail.name;
  dialogueText.textContent=e.detail.text;
  dialogueBox.classList.remove('hidden');
  dialogueOpen=true;
  if(game) game.state.paused=true;
});
dialogueNext.onclick=()=>{
  dialogueBox.classList.add('hidden');
  dialogueOpen=false;
  if(game) game.state.paused=false;
};

const journal=document.getElementById('journal');
const journalContent=document.getElementById('journalContent');
function renderJournal(tab='map'){
  document.querySelectorAll('.journalTabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  if(tab==='map'){
    journalContent.innerHTML=`<div class="journalPage"><h3>The Southern California Road Trip</h3><div class="route">
      <div>🏠<br>Home Base</div>
      <div>🌈<br>Hillcrest</div>
      <div>🌊<br>Pacific Coast Highway</div>
      <div>🎬<br>Los Angeles</div>
      <div>👑<br>HOA Queen</div>
      <div>🌀<br>Lake Tahoe Portal</div>
    </div><p>Restore color from Escondido to Los Angeles before entering the Rainbow Portal.</p></div>`;
  }
  if(tab==='cards'){
    const found=game?.state.cards||0;
    journalContent.innerHTML=`<div class="journalPage"><h3>Gay Card Wallet</h3><div class="cardGrid">${
      Array.from({length:6},(_,i)=>`<div class="journalCard ${i<found?'found':''}">${i<found?'GAY CARD ✓':'???'}</div>`).join('')
    }</div></div>`;
  }
  if(tab==='dudes'){
    journalContent.innerHTML=`<div class="journalPage"><h3>Triangle of Support</h3><div class="bioGrid">
      <div class="bio"><h3>Will</h3><p>Sassy rainbow rogue.</p><b>Rainbow Toss</b></div>
      <div class="bio"><h3>Daniel</h3><p>Magical and loving.</p><b>Shield + Freeze</b></div>
      <div class="bio"><h3>Caleb</h3><p>Chaotic cookie agent.</p><b>Cookie Bombs + Traps</b></div>
    </div></div>`;
  }
  if(tab==='memories'){
    const memories=game?.state.memories||[];
    const all=['Hillcrest Rainbow Crosswalk','Pacific Coast Slay','Los Angeles in Color'];
    journalContent.innerHTML=`<div class="journalPage"><h3>Travel Memories</h3><div class="memoryGrid">${
      all.map((m,i)=>`<div class="memory ${memories.includes(m)?'unlocked':''}"><span class="icon">${['🌈','🌊','🎬'][i]}</span>${memories.includes(m)?m:'Undiscovered Selfie Spot'}</div>`).join('')
    }</div></div>`;
  }
  if(tab==='secrets'){
    const secrets=game?.state.secrets||[];
    journalContent.innerHTML=`<div class="journalPage"><h3>Hidden Chaos</h3><div class="secretGrid">
      <div class="secret ${secrets.length?'unlocked':''}"><span class="icon">🥣</span>${secrets.length?'Super Jump Chaos':'A hidden bowl is waiting somewhere near Hollywood.'}</div>
    </div></div>`;
  }
  if(tab==='objectives'){
    const zones=game?.zones||[];
    journalContent.innerHTML=`<div class="journalPage"><h3>Restoration Missions</h3><div class="objectiveGrid">${
      zones.map(z=>`<div class="objectiveRow ${z.complete?'done':''}"><b>${z.complete?'✓':'○'}</b><div><strong>${z.name}</strong><br><small>${z.detail}</small></div><b>${z.complete?'RESTORED':'ACTIVE'}</b></div>`).join('')
    }</div></div>`;
  }
  if(tab==='passport'){
    journalContent.innerHTML=`<div class="journalPage passportPage"><h3>Adventure Passport</h3>
      <div class="miniStamp">SOUTHERN<br>CALIFORNIA<br>${game?.state.bossDefeated?'RESTORED':'IN PROGRESS'}</div>
      <p>Next portal: Lake Tahoe</p></div>`;
  }
}
document.getElementById('journalBtn').onclick=()=>{
  journal.classList.remove('hidden');renderJournal('map');if(game)game.state.paused=true;
};
document.getElementById('journalClose').onclick=()=>{
  journal.classList.add('hidden');if(game&&!dialogueOpen)game.state.paused=false;
};
document.querySelectorAll('.journalTabs button').forEach(b=>b.onclick=()=>renderJournal(b.dataset.tab));


document.getElementById('saveBtn').onclick=saveQuest;

const cutscene=document.getElementById('cutscene');
const cutsceneTitle=document.getElementById('cutsceneTitle');
const cutsceneText=document.getElementById('cutsceneText');
const cutsceneNext=document.getElementById('cutsceneNext');
let cutsceneQueue=[];
function playCutscene(slides){
  cutsceneQueue=[...slides];
  if(game)game.state.paused=true;
  showNextCutscene();
}
function showNextCutscene(){
  const slide=cutsceneQueue.shift();
  if(!slide){
    cutscene.classList.add('hidden');
    if(game)game.state.paused=false;
    return;
  }
  cutsceneTitle.textContent=slide.title;
  cutsceneText.textContent=slide.text;
  cutscene.classList.remove('hidden');
}
cutsceneNext.onclick=showNextCutscene;

window.addEventListener('boss-phase',e=>{
  const box=document.getElementById('bossPhase');
  const copy={
    2:'PHASE 2 — BEIGE PAINT PANIC',
    3:'FINAL PHASE — MEGA BEIGE'
  };
  box.textContent=copy[e.detail.phase]||'';
  box.classList.remove('hidden');
  setTimeout(()=>box.classList.add('hidden'),1800);
});
window.addEventListener('boss-defeated',()=>{
  localStorage.removeItem(SAVE_KEY);
  refreshSaveUI();
  playCutscene([
    {title:'Los Angeles Restored',text:'Murals return, music fills the streets, and the skyline explodes back into color.'},
    {title:'The Rainbow Prism',text:'The restored Prism rises above the city and tears open a portal through space.'},
    {title:'Next Stop',text:'Lake Tahoe is calling.'}
  ]);
});

setInterval(()=>{if(game?.running&&!game.state.paused&&!game.state.bossDefeated)saveQuest()},30000);

window.addEventListener('zone-restored',e=>{
  const box=document.getElementById('bossPhase');
  box.textContent=`${e.detail.name.toUpperCase()} RESTORED`;
  box.classList.remove('hidden');
  setTimeout(()=>box.classList.add('hidden'),1800);
});
