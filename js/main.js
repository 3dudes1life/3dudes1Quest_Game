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
