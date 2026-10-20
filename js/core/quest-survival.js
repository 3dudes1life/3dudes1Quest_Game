/* Opt-in survival owns health and saves; legacy world contracts remain unchanged. */
(() => {
 'use strict';
 const KEY='3dudes1quest-survival-v1', TEST_KEY=KEY+'-test';
 const LOCAL=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
 const testing=LOCAL&&new URLSearchParams(location.search).get('tester')==='1';
 const key=testing?TEST_KEY:KEY;
 const names=['Will','Daniel','Caleb'], worlds=['socal','tahoe','alaska'];
 const worldKeys=['3dudes1quest-save-109','3dudes1quest_tahoe_v250','3dudes1quest_alaska_v340'];
 const BALANCE=Object.freeze({maxHealth:4,hitCharge:5,objectiveCharge:15,bossRecovery:2,objectiveRecovery:1,shieldMs:1200,maxTargets:12,maxLedger:2048});
 const copy=v=>JSON.parse(JSON.stringify(v));
 function valid(v){return v?.schema===1&&typeof v.enabled==='boolean'&&Array.isArray(v.characters)&&v.characters.length===3&&v.characters.every(c=>Number.isInteger(c.hp)&&c.hp>=0&&c.hp<=4&&c.available===(c.hp>0))&&Number.isInteger(v.active)&&v.active>=0&&v.active<3&&Number.isFinite(v.charge)&&v.charge>=0&&v.charge<=100&&Array.isArray(v.contributions)&&v.contributions.length===3&&v.contributions.every(c=>typeof c==='boolean')&&['playing','ended'].includes(v.status)&&v.worlds&&typeof v.worlds==='object'&&v.ledger&&typeof v.ledger==='object'&&Array.isArray(v.completedWorlds)&&Array.isArray(v.achievements)&&v.achievements.every(a=>a&&typeof a.world==='string'&&typeof a.badge==='string')&&Array.isArray(v.history)&&Number.isInteger(v.sequence)&&v.sequence>=0&&(v.status==='ended'?v.characters.every(c=>!c.hp):v.characters[v.active].hp>0)}
 function read(){for(const k of [key,key+':backup'])try{const v=JSON.parse(localStorage.getItem(k)||'null');if(valid(v))return v}catch(_){}return null}
 const revision=r=>r?r.id+':'+r.sequence:null;
 let record=read(),seenRevision=revision(record),conflict=false,adapter,shieldUntil=0,chargeBlockedUntil=0,lastRender='',saving=false,storageBlocked=false,teamDamage=false;
 const enabled=()=>Boolean(record?.enabled),live=()=>enabled()&&record.status==='playing';
 function store(){
  if(!record)return true;
  try{
   const previous=read();
   if(revision(previous)!==seenRevision){storageBlocked=true;conflict=true;return false;}
   const raw=JSON.stringify(record);
   // A backup is a whole committed envelope, never a mix of world and campaign generations.
   if(previous)try{localStorage.setItem(key+':backup',JSON.stringify(previous))}catch(_){}
   localStorage.setItem(key,raw);seenRevision=revision(record);
   // Mirror the latest committed generation so backup recovery retains knockouts.
   try{localStorage.setItem(key+':backup',raw)}catch(_){}
   storageBlocked=false;return true;
  }catch(_){storageBlocked=true;return false}
 }
 function commit(){
  if(!enabled()||saving||adapter?.replaying())return true;
  saving=true;record.sequence++;
  if(adapter?.snapshot)record.worlds[worldKeys[worlds.indexOf(adapter.world)]]=copy(adapter.snapshot());
  const ok=store();saving=false;render();
  if(!ok){adapter?.freeze();announce(conflict?'ANOTHER TAB SAVED THIS RUN · reload this tab to continue safely.':'SAVE UNAVAILABLE · keep this tab open and retry Save. Travel is blocked.');}
  return ok;
 }
 function begin(world='socal',startingDude=0){
  const old=record;
  record={schema:1,enabled:true,id:Date.now().toString(36),sequence:0,characters:names.map(()=>({hp:4,available:true})),active:[0,1,2].includes(startingDude)?startingDude:0,charge:0,contributions:[false,false,false],currentWorld:world,completedWorlds:[],achievements:[],status:'playing',worlds:{},ledger:{},history:old?[...(old.history||[]),{id:old.id,status:old.status,characters:old.characters,completedWorlds:old.completedWorlds,achievements:old.achievements}]:[]};
  if(!store()){record=old;announce('Survival could not start: storage unavailable. Existing saves are safe.');return false}
  shieldUntil=chargeBlockedUntil=0;render();window.QuestJourney?.render();return true;
 }
 function leave(){if(!record)return true;const old=record.enabled;record.enabled=false;if(!store()){record.enabled=old;return false}return true}
 function routeKey(k){return worldKeys.some(w=>k===w||k.startsWith(w+'-'))||k==='3dudes1quest_journey'}
 const storage={
  read(k,validate){if(!enabled()||!routeKey(k))return undefined;const v=record.worlds[k];return v&&validate(v)?copy(v):null},
  write(k,v){if(!enabled()||!routeKey(k))return undefined;record.worlds[k]=copy(v);record.sequence++;return store()},
  clear(k){if(!enabled()||!routeKey(k))return false;delete record.worlds[k];store();return true}
 };
 function bindState(s){
  if(s.__survivalBound)return;
  let health=s.health,dude=s.dude;
  Object.defineProperties(s,{
   __survivalBound:{value:true},
   health:{enumerable:true,configurable:true,get:()=>enabled()?record.characters[record.active].hp:health,set:v=>{if(!enabled())health=v}},
   dude:{enumerable:true,configurable:true,get:()=>enabled()?record.active:dude,set:v=>{if(!enabled())dude=v}}
  });
 }
 function attach(a){adapter=a;bindState(a.state());mount();render()}
 function enter(){if(!enabled())return;record.currentWorld=adapter.world;if(record.status==='ended')adapter?.freeze();else commit();render()}
 function select(n,cycle=false){
  if(!enabled())return true;if(!live()||storageBlocked)return false;
  n=((Math.floor(n)%3)+3)%3;
  if(cycle){for(let i=0;i<3&&!record.characters[n].hp;i++)n=(n+1)%3}
  if(!record.characters[n].hp){announce(names[n]+' is knocked out for this run.');return false}
  record.active=n;adapter?.release();commit();return true;
 }
 function damage(){
  if(!enabled())return false;
  if(!live()||testing||adapter.replaying()||adapter.now()<shieldUntil)return true;
  const c=record.characters[record.active];c.hp--;c.available=c.hp>0;
  adapter.protect();
  if(!c.hp){
   const lost=record.active,next=record.characters.findIndex(c=>c.hp>0);
   adapter.release();adapter.respawn();
   if(next<0){record.status='ended';adapter.freeze();announce('QUEST ENDED · all three dudes are knocked out. Your run history is saved.');}
   else{record.active=next;announce(names[lost]+' is out · '+names[next]+' continues from safe ground.');}
  }else announce(names[record.active]+' · '+c.hp+'/4 hearts');
  window.QuestAudio?.effect('damage');commit();return true;
 }
 function once(id){if(Object.hasOwn(record.ledger,id)||Object.keys(record.ledger).length>=BALANCE.maxLedger)return false;record.ledger[id]=true;return true}
 function recover(id,amount=BALANCE.objectiveRecovery){if(!live()||adapter?.replaying()||!once(adapter.world+':heal:'+id))return false;const c=record.characters[record.active];c.hp=Math.min(4,c.hp+amount);return true}
 function objective(id,major=false){if(!live()||adapter?.replaying()||!once(adapter.world+':objective:'+id))return;record.charge=Math.min(100,record.charge+BALANCE.objectiveCharge);recover(id,major?BALANCE.bossRecovery:BALANCE.objectiveRecovery);commit()}
 function hit(id,before,after,owner){
  if(!live()||teamDamage||adapter.now()<chargeBlockedUntil||adapter?.replaying()||!Number.isInteger(owner)||!record.characters[owner]?.hp||after>=before)return;
  // Reward at most each actual HP threshold once, even after resetting an encounter.
  const token=adapter.world+':hit:'+id+':'+Math.max(0,Math.ceil(after));
  if(!once(token))return;
  record.charge=Math.min(100,record.charge+BALANCE.hitCharge);record.contributions[owner]=true;commit();
 }
 function complete(world){
  if(!live()||testing||adapter?.replaying()||record.completedWorlds.includes(world)||!worlds.includes(world))return;
  record.completedWorlds.push(world);const count=record.characters.filter(c=>c.hp).length;
  record.achievements.push({world,badge:count===3?'THREE DUDES STANDING':count===2?'DOUBLE TROUBLE':'LAST DUDE STANDING'});objective('world:'+world,true);commit();
 }
 function tier(){const count=record?.characters.filter(c=>c.hp).length||0;return ['QUEST ENDED','SOLO SURGE','DOUBLE TROUBLE','THROUPLE POWER'][count]}
 function activate(){
  if(!live()||!adapter?.playing()||adapter.replaying()||adapter.blocked())return false;
  const survivors=record.characters.map((c,i)=>c.hp?i:-1).filter(i=>i>=0);
  const missing=survivors.filter(i=>!record.contributions[i]);
  if(record.charge<100){announce('THROUPLE POWER · '+record.charge+'% · land powers and complete objectives.');return false}
  if(survivors.length===3&&missing.length){announce('FULL CHARGE · land '+missing.map(i=>names[i]+"’s power").join(' + '));return false}
  const previous=record.charge,contributions=record.contributions.slice();record.charge=0;record.contributions=[false,false,false];
  if(!commit()){record.charge=previous;record.contributions=contributions;return false}
  shieldUntil=adapter.now()+BALANCE.shieldMs;chargeBlockedUntil=adapter.now()+2500;
  // Existing projectiles, collision rules and phase gates own all damage. Maximum six shots.
  survivors.forEach(i=>{adapter.emit(i,-12);adapter.emit(i,12)});
  adapter.interrupt();window.QuestAudio?.effect('throuple');announce(tier()+'! · short shield active');render();return true;
 }
 function announce(text){if(typeof document==='undefined')return;const el=document.getElementById('survivalStatus');if(el)el.textContent=text}
 function mount(){
  if(typeof document==='undefined')return;
  if(document.getElementById('survivalHud'))return;
  const panel=document.querySelector('#titleScreen .titleMenuCard,#titleScreen .card,#openingCard');
  const menu=document.createElement('section');menu.className='survivalMenu';menu.innerHTML='<strong>Three dudes. One survival run.</strong><p>Four hearts each. Knockouts last for the run. Legacy saves stay separate.</p><button id="startSurvival">Start a fresh Survival run</button><button id="resumeSurvival">Continue Survival</button><button id="legacySurvival">Play legacy adventure</button>';
  panel?.append(menu);
  menu.querySelector('#startSurvival').onclick=()=>{const native=document.getElementById('startBtn');if(native?.disabled)return;if(begin('socal',Number(document.getElementById('titleScreen')?.dataset.hero)||0)){if(native)native.click();else location.href='index.html'+(testing?'?tester=1':'')}};
  menu.querySelector('#resumeSurvival').onclick=()=>{if(!record)return;record.enabled=true;if(!store())return;location.href=({socal:'index',tahoe:'tahoe',alaska:'alaska'}[record.currentWorld]||'index')+'.html'+(testing?'?tester=1':'')};
  menu.querySelector('#legacySurvival').onclick=()=>{if(leave())location.reload()};
  const runInfo=document.createElement('section');runInfo.id='survivalRunInfo';runInfo.className='survivalMenu';runInfo.innerHTML='<h3>Survival campaign</h3><p id="survivalRunSummary"></p><button id="survivalNewRun">Archive this run and start a fresh Survival run</button><button id="survivalLegacy">Return to legacy adventure</button>';document.querySelector('#journal,#pauseMenu')?.append(runInfo);
  runInfo.querySelector('#survivalNewRun').onclick=()=>{if(begin())location.href='index.html'+(testing?'?tester=1':'')};
  runInfo.querySelector('#survivalLegacy').onclick=()=>{if(leave())location.href='index.html'};
  const hud=document.createElement('section');hud.id='survivalHud';hud.setAttribute('aria-label','Survival team');hud.innerHTML=names.map((name,i)=>'<div class="survivor" data-survivor="'+i+'"><img data-cast-portrait="'+name.toLowerCase()+'" alt="'+name+'"><span></span></div>').join('')+'<button id="teamPower" aria-keyshortcuts="KeyT">THROUPLE POWER</button><output id="survivalStatus" role="status" aria-live="polite"></output>';
  (document.querySelector('#gameScreen,#tahoeApp,#app')||document.body).append(hud);
  window.QuestCast?.ready.then(()=>{lastRender='';render()});
  hud.querySelector('#teamPower').onclick=activate;
  document.addEventListener('click',e=>{const link=e.target.closest?.('a[href]');if(enabled()&&link&&/^(index|tahoe|alaska)\.html/.test(link.getAttribute('href'))){if(!commit())e.preventDefault();else if(testing)link.href=link.pathname+'?tester=1';}},true);
  addEventListener('keydown',e=>{if(e.code==='KeyT'&&!e.repeat&&!/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)){if(enabled()){e.preventDefault();activate()}}});
  if(testing){const tools=document.createElement('div');tools.className='survivalTest';tools.innerHTML='<b>LOCAL TEST MODE · damage protection · isolated saves</b><button>Reset test hearts</button>';tools.querySelector('button').onclick=()=>{if(!enabled())return;record.characters.forEach(c=>{c.hp=4;c.available=true});record.status='playing';commit()};document.querySelector('#journal,#pauseMenu')?.append(tools)}
 }
 function render(){
  if(typeof document==='undefined')return;const hud=document.getElementById('survivalHud');if(!hud)return;
  const changed=document.documentElement.classList.contains('survival')!==enabled();document.documentElement.classList.toggle('survival',enabled());if(changed)dispatchEvent(new Event('resize'));
  document.querySelectorAll('#queenReplayBtn,#courtReplayBtn,#bloomReplayBtn,#pipelineReplayBtn').forEach(el=>{el.dataset.replayLabel??=el.textContent;el.textContent=el.dataset.replayLabel+(enabled()?' (practice)':'')});
  hud.hidden=!enabled();document.getElementById('survivalRunInfo').hidden=!record;document.getElementById('survivalRunSummary').textContent=record?(testing?'LOCAL TEST MODE · ':'')+(record.status==='ended'?'Quest ended. Start a fresh run to try again.':'Knockouts last for this run. Charge carries between worlds.')+' '+record.achievements.map(a=>a.world+': '+a.badge).join(' · ')+' · Archived runs: '+(record.history?.length||0):'';document.getElementById('resumeSurvival').hidden=!record;document.getElementById('legacySurvival').hidden=!enabled();
  if(!enabled())return;
  const signature=JSON.stringify([record.characters,record.active,record.charge,record.contributions,record.status,testing]);if(signature===lastRender)return;lastRender=signature;
  hud.querySelectorAll('.survivor').forEach((el,i)=>{const c=record.characters[i],name=names[i];el.dataset.active=String(record.active===i);el.dataset.out=String(!c.hp);el.querySelector('span').textContent=name+' '+(c.hp?'♥'.repeat(c.hp)+'♡'.repeat(4-c.hp):'OUT')+(record.contributions[i]?' ✓':'');el.setAttribute('aria-label',name+' '+c.hp+' of 4 hearts'+(record.active===i?', active':'')+(c.hp?'':', knocked out'));window.QuestCast?.setPortrait(el.querySelector('img'),name.toLowerCase())});
  const button=hud.querySelector('#teamPower');button.textContent=(testing?'TEST · ':'')+tier()+' '+record.charge+'% · T';button.setAttribute('aria-label',tier()+' '+record.charge+' percent. Press T or tap to activate.');
 }
 if(typeof addEventListener==='function')addEventListener('storage',e=>{if(e.key===key&&enabled()&&revision(read())!==seenRevision){storageBlocked=true;conflict=true;adapter?.release();adapter?.freeze();announce('ANOTHER TAB SAVED THIS RUN · reload this tab to continue safely.')}});
 if(testing&&!record)begin();
 window.QuestSurvival=Object.freeze({BALANCE,enabled,live,storage,bindState,attach,enter,select,damage,recover,objective,hit,complete,activate,begin,leave,commit,valid,get state(){return record?copy(record):null},get testing(){return testing},get storageBlocked(){return storageBlocked}});
})();
