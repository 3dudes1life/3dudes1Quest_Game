/* Origin Story 2.0: 55 seconds. Approved cast, scenery-first compositing, no campaign mutation. */
(() => {
 'use strict';
 const SEEN='3dudes1quest-origin-seen',DURATION=55;
 const scenes=[
  {at:0,title:'01 · WHERE LOVE BEGAN',music:'storySun',beats:[[0,'Their love began in the Dominican Republic: three hearts, three personalities, no instruction manual.']]},
  {at:8,title:'02 · BUILDING A LIFE',music:'storySun',beats:[[8,'Will, Daniel and Caleb built a home, a family, and a life worth fighting for.']]},
  {at:15,title:'03 · THROUGH THE STORM',music:'storyStorm',beats:[[15,'A pandemic. Economic hardship. Hateful attacks on their love and community. Through every storm, they stood together.']]},
  {at:24,title:'04 · THREE HEARTS, ONE STRENGTH',music:'storyRise',beats:[[24,'Three hearts became one strength. Music, kindness and cookies could do more than protect their family.']]},
  {at:32,title:'05 · LOVE BECOMES ACTION',music:'storyRise',beats:[[32,'They would defend their community and protect the planet—with love, laughter, and a few questionable decisions.']]},
  {at:40,title:'06 · FIVE WORLDS. ONE FAMILY.',music:'storyQuest',beats:[[40,'Rigsby and Zoey joined the quest. Did someone pack the cookies?'],[44,'Southern California → Tahoe → Alaska → Hawaii → Costa Rica. Their retirement dream, together.']]},
  {at:49,title:'07 · WELCOME HOME',music:'storyQuest',beats:[[49,'Southern California. Home Base. Three dudes. One life. One quest. Let’s go!']]}
 ];
 const dialog=document.createElement('dialog');dialog.id='originStory';dialog.setAttribute('aria-label','Our Story — Three dudes. One life. One quest.');
 dialog.innerHTML='<div class="storyStage"><canvas id="storyCanvas" width="640" height="360" aria-hidden="true"></canvas><h2 class="storyScene"></h2><p id="storyCaption" class="storyCaption" aria-live="polite" aria-atomic="true"></p><div id="storyNotice" role="status" hidden>Story paused. Resume when you’re ready.</div></div><div id="storyProgress" role="progressbar" aria-label="Story progress" aria-valuemin="0" aria-valuemax="55"><span></span></div><div class="storyControls"><button id="storyPause" type="button">Pause story</button><button id="storyMute" type="button">Mute sound</button><span class="storyTime" aria-hidden="true"></span><button id="storySkip" type="button">Skip Intro</button></div>';
 document.body.append(dialog);
 const canvas=dialog.querySelector('canvas'),ctx=canvas.getContext('2d'),caption=dialog.querySelector('.storyCaption'),heading=dialog.querySelector('h2'),pauseButton=dialog.querySelector('#storyPause'),muteButton=dialog.querySelector('#storyMute'),notice=dialog.querySelector('#storyNotice');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),colors=['#f151b6','#ffb25d','#f9df7a','#67dfae','#58cdf2','#a691ed'];
 let images={};let scenery,sceneryPromise,preparing=false,sceneryUnavailable=false;let renderedCast=[],renderLayers=[]; // Reuse the game's decoded strips instead of allocating another cast.
 let active=false,paused=false,elapsed=0,last=0,painted=-100,frame=0,currentBeat='',onFinish=null,selected=0,previousView;
 const sceneIndex=()=>{let i=0;while(i+1<scenes.length&&elapsed>=scenes[i+1].at)i++;return i};
 function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
 function disk(x,y,r,c){for(let yy=-r;yy<=r;yy+=3){const w=Math.floor(Math.sqrt(Math.max(0,r*r-yy*yy))/3)*3;rect(x-w,y+yy,w*2,3,c)}}
 function line(x,y,x2,y2,c,width=2){ctx.strokeStyle=c;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(Math.round(x),Math.round(y));ctx.lineTo(Math.round(x2),Math.round(y2));ctx.stroke()}
 function text(t,x,y,size=12,c='#fff2d4'){ctx.fillStyle=c;ctx.font=`bold ${size}px monospace`;ctx.textAlign='center';ctx.fillText(t,x,y)}
 function heart(x,y,s=1,c='#ff72b6'){const rows=['0110110','1111111','1111111','0111110','0011100','0001000'];for(let j=0;j<rows.length;j++)for(let k=0;k<7;k++)if(rows[j][k]==='1')rect(x+(k-3)*s,y+j*s,s,s,c)}
 // Scene art is lazy-loaded once; an unavailable download falls back to the already loaded SoCal art.
 function prepareScenery(){return sceneryPromise??=new Promise(resolve=>{const im=new Image(),timer=setTimeout(()=>done(false),8000);let settled=false;function done(ok){if(settled)return;settled=true;clearTimeout(timer);if(ok)scenery=im;sceneryUnavailable=!ok;resolve()}im.onload=()=>done(true);im.onerror=()=>done(false);im.src='assets/story2/scenes.webp'})}
 function backdrop(panel,time){
  if(!scenery){QuestMasterArt.background(ctx,0,0,640,270);return;}
  const cw=scenery.naturalWidth/2,ch=scenery.naturalHeight/3,sw=Math.floor(cw)-8,sh=Math.floor(sw*270/640),travel=reduced.matches?0:Math.sin(time*.12)*2;
  // Cover crop preserves aspect ratio and retains the foreground promenade; never stretch art.
  ctx.drawImage(scenery,Math.floor(panel%2*cw)+4,Math.floor(Math.floor(panel/2)*ch+ch-sh-4)+travel,sw,sh,0,0,640,270);
 }
 function hero(name,x,foot,time,animation='idle',size=112){const im=images[name+'_'+animation];if(!im?.complete||!im.naturalWidth)return;const n=im.width/192,idx=reduced.matches?0:Math.floor(time*7)%n,dx=Math.round(x-size/2),dy=Math.round(foot-size*188/192);ctx.drawImage(im,idx*192,0,192,192,dx,dy,size,size);renderedCast.push({name,animation,frame:idx,x:dx,y:dy,size,face:{x:Math.round(x-23),y:dy+12,w:46,h:44}})}
 function crew(time,{foot=262,animation='idle',spread=116,size=112}={}){['will','daniel','caleb'].forEach((n,i)=>hero(n,320+(i-1)*spread,foot,time,animation,size))}
 function pet(name,x,foot,time){const im=images[name+'_walk'];if(!im?.complete||!im.naturalWidth)return;const idx=reduced.matches?0:Math.floor(time*8)%8;ctx.drawImage(im,idx*128,0,128,96,x-32,foot-46,64,48)}
 function rainbowGround(){ctx.save();ctx.lineWidth=2;for(let k=0;k<colors.length;k++){ctx.strokeStyle=colors[k];ctx.beginPath();ctx.ellipse(320,254,180-k*5,12-k,0,0,Math.PI*2);ctx.stroke()}ctx.restore()}
 function atmosphere(i,time){
  if(i===2&&!reduced.matches){for(let n=0;n<22;n++){const x=(n*79+time*18)%640,y=(n*37+time*40)%262;line(x,y,x-3,y+7,'#9db2cd70',1)}}
  if(i===3){ctx.save();ctx.lineWidth=3;for(let n=0;n<6;n++){ctx.strokeStyle=colors[n];ctx.beginPath();ctx.arc(320,278,182-n*4,Math.PI,Math.PI*2);ctx.stroke()}ctx.restore();rainbowGround()}
 }
 function symbols(i,time){
  if(i===0)for(let n=0;n<3;n++)heart(204+n*116,112,2,'#ffd1d7');
  if(i===1)heart(320,105,2,'#ffb5d5');
  if(i===2)heart(320,105,2,'#ffcfdf');
  if(i===3||i===4){text('♪',112,112,24,'#7deaff');heart(320,99,3);disk(529,107,13,'#e5aa63');for(let n=0;n<4;n++)rect(522+n%2*10,99+Math.floor(n/2)*10,3,3,'#795043')}
  if(i===5&&elapsed>=44){for(const [n,label] of ['SO CAL','TAHOE','ALASKA','HAWAII','COSTA RICA'].entries()){ctx.save();ctx.font='bold 12px monospace';ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='#102238';ctx.strokeText(label,64+n*128,93);text(label,64+n*128,93,12);ctx.restore()}text('RETIRE, TOGETHER',548,115,10,'#fff0b2')}
 }
 function environment(i,time){if(i===6)QuestMasterArt.background(ctx,0,0,640,270);else backdrop(i,time)}
 function paint(){
  const i=sceneIndex(),time=reduced.matches?0:elapsed;renderedCast=[];renderLayers=[];
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.imageSmoothingEnabled=false;rect(0,0,640,360,'#0d122d');
  renderLayers.push('environment');const dissolve=reduced.matches?1:Math.min(1,(elapsed-scenes[i].at)/.35);if(i>0&&dissolve<1){environment(i-1,time);ctx.save();ctx.globalAlpha=dissolve;environment(i,time);ctx.restore()}else environment(i,time);
  // All atmospheric effects and symbols precede the approved cast. Nothing is painted across faces afterward.
  renderLayers.push('atmosphere');atmosphere(i,time);renderLayers.push('symbols');symbols(i,time);
  renderLayers.push('cast');crew(time,{spread:i===2?94:116,animation:i===3?'celebrate':i===5||i===6?'walk':'idle'});
  if(i===5||i===6){pet('rigsby',100,262,time);pet('zoey',540,262,time)}
  ctx.restore();
 }
 function updateCopy(){const i=sceneIndex(),scene=scenes[i];let beat=scene.beats[0];for(const b of scene.beats)if(elapsed>=b[0])beat=b;const key=i+':'+beat[0];if(currentBeat!==key){const changedScene=dialog.dataset.scene!==String(i+1);currentBeat=key;heading.textContent=scene.title;caption.textContent=beat[1];dialog.dataset.scene=String(i+1);QuestAudio.sync();if(changedScene){const cue={3:'heart',4:'beacon',6:'portal'}[i];if(cue)QuestAudio.effect(cue)}}
  const seconds=Math.min(DURATION,Math.floor(elapsed));dialog.querySelector('.storyTime').textContent=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')} / 0:55`;
  dialog.querySelector('#storyProgress span').style.width=elapsed/DURATION*100+'%';dialog.querySelector('#storyProgress').setAttribute('aria-valuenow',seconds);
  const muted=QuestAudio.status().settings.mute;muteButton.textContent=muted?'Unmute sound':'Mute sound';muteButton.setAttribute('aria-pressed',String(muted));
 }
 function tick(now){frame=0;if(!active||paused)return;if(last)elapsed+=Math.min(.25,(now-last)/1000);last=now;if(elapsed>=DURATION){finish();return;}updateCopy();if(now-painted>=80){paint();painted=now}frame=requestAnimationFrame(tick)}
 function pause(){if(!active||paused)return;paused=true;cancelAnimationFrame(frame);frame=0;last=0;pauseButton.textContent='Resume story';notice.hidden=false;QuestAudio.sync()}
 function resume(){if(!active||!paused)return;paused=false;last=0;notice.hidden=true;pauseButton.textContent='Pause story';QuestAudio.sync();frame=requestAnimationFrame(tick)}
 function finish(){if(!active)return;active=false;paused=false;cancelAnimationFrame(frame);frame=0;last=0;try{localStorage.setItem(SEEN,'1')}catch(_){}dialog.close();const callback=onFinish;onFinish=null;QuestAudio.sync();callback?.()}
 function shouldIntroduce(){try{return localStorage.getItem(SEEN)!=='1'}catch(_){return true}}
 async function play({dude=0,onFinish:callback}={}){if(active||preparing)return;preparing=true;try{await QuestCast.ready;await prepareScenery();images=window.__questGame.images;await Promise.all(Object.entries(images).filter(([key])=>/^(will|daniel|caleb)_(idle|walk|celebrate)$|^(rigsby|zoey)_walk$/.test(key)).map(([,im])=>im.decode()));}finally{preparing=false}if(active)return;selected=dude;onFinish=callback;elapsed=0;last=0;painted=-100;currentBeat='';active=true;paused=false;notice.hidden=true;pauseButton.textContent='Pause story';previousView={portrait:innerHeight>innerWidth,width:innerWidth};dialog.showModal();updateCopy();paint();pauseButton.focus({preventScroll:true});QuestAudio.sync();frame=requestAnimationFrame(tick);if(document.hidden)pause()}
 pauseButton.onclick=()=>paused?resume():pause();muteButton.onclick=event=>{QuestAudio.configure({mute:!QuestAudio.status().settings.mute},event);updateCopy()};dialog.querySelector('#storySkip').onclick=finish;
 dialog.addEventListener('cancel',event=>{event.preventDefault();paused?resume():pause()});
 document.addEventListener('keydown',event=>{if(!active)return;if(!['Tab','Enter',' ','Escape'].includes(event.key))event.preventDefault();if(event.key!=='Escape')event.stopPropagation()},true);
 for(const type of ['blur','pagehide','orientationchange'])addEventListener(type,pause);
 screen.orientation?.addEventListener('change',pause);document.addEventListener('fullscreenchange',pause);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});
 addEventListener('resize',()=>{if(!active)return;const next={portrait:innerHeight>innerWidth,width:innerWidth};if(next.portrait!==previousView?.portrait||(navigator.maxTouchPoints>0&&Math.abs(next.width-previousView.width)>80))pause();previousView=next;paint()},{passive:true});
 window.visualViewport?.addEventListener('resize',()=>{if(active)paint()},{passive:true});reduced.addEventListener('change',()=>{if(active)paint()});
 window.QuestStory=Object.freeze({get active(){return active},play,shouldIntroduce,audioScene:()=>({track:scenes[sceneIndex()].music,paused}),status:()=>({active,paused,seconds:elapsed,duration:DURATION,scene:sceneIndex()+1,reducedMotion:reduced.matches,selected,framesPending:frame?1:0,preparing,sceneryUnavailable,renderLayers:[...renderLayers],cast:renderedCast.map(c=>({...c,face:{...c.face}}))}),scenes:scenes.map(s=>Object.freeze({...s})),duration:DURATION});
 // Review captures may seek; ordinary playback has no debug timeline or gameplay mutation.
 if(new URLSearchParams(location.search).has('storyqa'))window.__QUEST_STORY_TEST__={getImages:()=>images,seek(seconds){if(!active)throw Error('Open Our Story first');elapsed=Math.max(0,Math.min(DURATION-.01,seconds));last=0;updateCopy();paint()},pause,resume};
})();
