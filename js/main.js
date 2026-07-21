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

document.getElementById('startBtn').onclick=()=>{ui.show('game');game.start()};
document.getElementById('helpBtn').onclick=()=>ui.show('help');
document.getElementById('backBtn').onclick=()=>ui.show('title');
document.getElementById('pauseBtn').onclick=()=>game.togglePause();
document.getElementById('switchBtn').onclick=()=>game.switchDude();
document.getElementById('restartBtn').onclick=()=>{ui.show('game');game.start()};
document.getElementById('portalBtn').onclick=()=>ui.show('portal');
document.getElementById('titleBtn').onclick=()=>ui.show('title');


const dialogueBox=document.getElementById('dialogueBox');
const dialogueName=document.getElementById('dialogueName');
const dialogueText=document.getElementById('dialogueText');
const dialogueNext=document.getElementById('dialogueNext');
let dialogueOpen=false;

window.addEventListener('quest-dialogue',e=>{
  dialogueName.textContent=e.detail.name;
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
    journalContent.innerHTML=`<div class="journalPage"><h3>Southern California Route</h3><div class="route">
      <div>🏠<br>Home</div><div>🌴<br>Neighborhood</div><div>🏖️<br>Beach</div>
      <div>🚗<br>PCH / I-5</div><div>🎬<br>Hollywood</div><div>🌆<br>Los Angeles</div>
    </div><p>Restore every Prism Beacon before confronting the HOA Queen of Beige.</p></div>`;
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
