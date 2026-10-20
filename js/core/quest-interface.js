/* Shared menu accessibility. Simulation, artwork, sound and save ownership stay in their runtimes. */
(() => {
 'use strict';
 const selectors=['#survivalEnded','#viewportPause','#photoMode','#worldMapOverlay','#passportOverlay','#cutscene','#dialogueBox','#dialogue','#completeScreen','#portalScreen','#endingCard','#trailheadCard','#journal','#pauseMenu','#helpScreen','#titleScreen','#openingCard'];
 const panels=[...new Set(selectors.flatMap(s=>[...document.querySelectorAll(s)]))];
 const screens=new Set(['titleScreen','helpScreen','completeScreen','portalScreen']);
 const fullPage=el=>screens.has(el.id)||el.id==='openingCard';
 const focusable='button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),summary,[tabindex]:not([tabindex="-1"])';
 let current=null,previousFocus=null,queued=false;const inerted=new Map();
 const visible=el=>!el.hidden&&!el.classList.contains('hidden')&&(!screens.has(el.id)||el.classList.contains('active'))&&Boolean(el.getClientRects().length)&&getComputedStyle(el).visibility!=='hidden';
 const controls=el=>[...el.querySelectorAll(focusable)].filter(e=>visible(e)&&!e.closest('[inert]'));
 function restoreInert(){for(const [el,value] of inerted)el.inert=value;inerted.clear()}
 function isolate(panel){for(let el=panel;el&&el!==document.body;el=el.parentElement)for(const sibling of el.parentElement?.children||[])if(sibling!==el&&sibling.tagName!=='DIALOG'&&!inerted.has(sibling)){inerted.set(sibling,sibling.inert);sibling.inert=true}}
 function refresh(){
  queued=false;
  // Rotation recovery owns the app's inert state. Never save its temporary true value
  // and restore it after that manager has explicitly resumed the game.
  const gate=document.getElementById('viewportPause');
  if(gate&&!gate.hidden){restoreInert();const app=document.querySelector('#app,#tahoeApp');if(app)app.inert=true;current=gate;document.documentElement.setAttribute('data-menu-open','');return}
  // Native cinematic dialogs own their own focus trap and remain untouched.
  if(window.QuestStory?.active){restoreInert();current=null;document.documentElement.removeAttribute('data-menu-open');return}
  const next=panels.find(visible)||null;document.documentElement.toggleAttribute('data-menu-open',Boolean(next));if(next===current)return;
  restoreInert();
  if(!current&&next)previousFocus=document.activeElement;
  current=next;document.documentElement.toggleAttribute('data-menu-open',Boolean(next));
  if(next){
   if(!fullPage(next)){next.setAttribute('role','dialog');next.setAttribute('aria-modal','true');if(!next.hasAttribute('aria-label')&&!next.hasAttribute('aria-labelledby'))next.setAttribute('aria-label',next.querySelector('h1,h2')?.textContent||'Adventure menu');isolate(next)}
   if(!next.contains(document.activeElement)){next.tabIndex=-1;(next.id==='survivalEnded'?next.querySelector('h2'):controls(next)[0]||next).focus({preventScroll:true})}
  }else{
   const canvas=document.querySelector('#gameCanvas,#tahoeCanvas,#adventureCanvas');const target=canvas&&visible(canvas)?canvas:previousFocus&&visible(previousFocus)&&!previousFocus.closest('[inert]')?previousFocus:null;target?.focus({preventScroll:true});previousFocus=null;
  }
 }
 function queue(){if(!queued){queued=true;queueMicrotask(refresh)}}
 const observer=new MutationObserver(queue);for(const panel of panels)observer.observe(panel,{attributes:true,attributeFilter:['class','hidden']});
 document.getElementById('originStory')&&observer.observe(document.getElementById('originStory'),{attributes:true,attributeFilter:['open']});
 document.addEventListener('keydown',e=>{
  if(e.key!=='Tab'||!current||fullPage(current)||window.QuestStory?.active)return;
  const list=controls(current);if(!list.length){e.preventDefault();current.focus();return}
  const index=list.indexOf(document.activeElement);
  if(e.shiftKey&&index<=0){e.preventDefault();list.at(-1).focus()}else if(!e.shiftKey&&(index<0||index===list.length-1)){e.preventDefault();list[0].focus()}
 });
 queue();
 window.QuestInterface=Object.freeze({status:()=>({menu:current?.id||null,isolated:inerted.size,observers:1})});
})();
