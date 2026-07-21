import {CONFIG} from './config.js?v=1.0.7';
import {createInput} from './input.js?v=1.0.7';
import {createUI} from './ui.js?v=1.0.7';
import {Game} from './game.js?v=1.0.7';

const canvas=document.getElementById('gameCanvas');
canvas.width=CONFIG.width;
canvas.height=CONFIG.height;

const ui=createUI();
let game;
const input=createInput(index=>game?.switchDude(index));

game=new Game(canvas,ui,input,state=>{
  ui.refs.completeStats.textContent=`You collected ${state.cards}/1 Gay Card and restored ${state.beacons}/1 Prism Beacon.`;
  ui.show('complete');
});
window.__questGame=game;

const SAVE_KEY='3dudes1quest-save-v107';
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
  saveQuest.timer=setTimeout(()=>saveToast.classList.remove('show'),1200);
}

function begin(save=null){
  ui.show('game');
  game.start(save);
  requestAnimationFrame(()=>canvas.focus());
}

document.getElementById('startBtn').onclick=()=>{
  localStorage.removeItem(SAVE_KEY);
  refreshSaveUI();
  begin();
};
continueBtn.onclick=()=>begin(readSave());
document.getElementById('restartBtn').onclick=()=>begin();
document.getElementById('helpBtn').onclick=()=>ui.show('help');
document.getElementById('backBtn').onclick=()=>ui.show('title');
document.getElementById('pauseBtn').onclick=()=>game.togglePause();
document.getElementById('switchBtn').onclick=()=>game.switchDude();
document.getElementById('portalBtn').onclick=()=>ui.show('portal');
document.getElementById('titleBtn').onclick=()=>ui.show('title');
document.getElementById('journalBtn').onclick=()=>game.togglePause();
document.getElementById('saveBtn').onclick=saveQuest;
document.getElementById('journalClose').onclick=()=>game.togglePause();

const dialogueBox=document.getElementById('dialogueBox');
document.getElementById('dialogueNext').onclick=()=>{
  dialogueBox.classList.add('hidden');
  game.state.paused=false;
};

document.getElementById('cutsceneNext').onclick=()=>{
  document.getElementById('cutscene').classList.add('hidden');
  game.state.paused=false;
};

function resizeGameCanvas(){
  canvas.width=1280;
  canvas.height=720;
  const availableW=window.innerWidth;
  const availableH=window.innerHeight;
  const aspect=16/9;
  let w=availableW;
  let h=w/aspect;
  if(h>availableH){h=availableH;w=h*aspect}
  canvas.style.width=`${Math.floor(w)}px`;
  canvas.style.height=`${Math.floor(h)}px`;
}
window.addEventListener('resize',resizeGameCanvas,{passive:true});
window.addEventListener('orientationchange',()=>setTimeout(resizeGameCanvas,100),{passive:true});
resizeGameCanvas();
refreshSaveUI();

setInterval(()=>{
  if(game.running&&!game.state.paused&&!game.completed)saveQuest();
},30000);
