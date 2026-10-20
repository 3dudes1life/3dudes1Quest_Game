/* Additive encounter records. Historical world access is separate from new victories. */
(() => {
 'use strict';
 const integer=(v,f,min,max)=>typeof v==='number'&&Number.isFinite(v)?Math.max(min,Math.min(max,Math.floor(v))):f;
 function read(world,save){
  const raw=save?.encounters,valid=raw?.version===1,old=Boolean(save&&!valid),s=save?.state||{};
  const legacyAccess=valid?raw.legacyAccess===true:old&&(world==='socal'?(s.adventureComplete===true||s.bossDefeated===true):save.bossDefeated===true||save.completed===true);
  const x=world==='socal'?save?.player?.x:save?.checkpoint;
  const pastMid=valid?raw.pastMid===true:old&&Number.isFinite(x)&&x>(world==='socal'?5000:world==='tahoe'?3300:3260);
  const common={version:1,legacyAccess,pastMid};
  if(world==='socal')return {...common,queenComplete:valid?raw.queenComplete===true:old&&s.bossDefeated===true,finalComplete:valid&&raw.finalComplete===true,court:{active:valid&&raw.court?.active===true,phase:integer(raw?.court?.phase,1,1,3),hp:Array.from({length:9},(_,i)=>integer(raw?.court?.hp?.[i],-1,-1,3))}};
  if(world==='tahoe'){const cores=Array.from({length:3},(_,i)=>integer(raw?.bloom?.cores?.[i],2,0,2)),complete=valid&&raw.bloom?.complete===true;if(complete)cores.fill(0);else if(cores.every(h=>h===0))cores[2]=2;return {...common,bloom:{complete,cores,contamination:integer(raw?.bloom?.contamination,0,0,100)}};}
  const result={...common,pipeline:{complete:valid&&raw.pipeline?.complete===true,defeated:Array.from({length:5},(_,i)=>valid&&raw.pipeline?.defeated?.[i]===true),valves:Array.from({length:3},(_,i)=>integer(raw?.pipeline?.valves?.[i],2,0,2)),stage:integer(raw?.pipeline?.stage,0,0,5),floodTicks:integer(raw?.pipeline?.floodTicks,0,0,3600)}};if(result.pipeline.complete){result.pipeline.valves.fill(0);result.pipeline.stage=5;}else if(result.pipeline.valves.every(h=>h===0))result.pipeline.stage=Math.max(2,result.pipeline.stage);else if(result.pipeline.stage>=2)result.pipeline.stage=1;return result;
 }
 window.QuestEncounters=Object.freeze({read,integer});
})();
