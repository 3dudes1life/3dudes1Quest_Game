/* One gesture-unlocked audio graph, bounded look-ahead, and shared settings for both worlds. */
(() => {
  'use strict';
  const KEY='3dudes1quest-audio',defaults={music:true,sfx:true,musicVolume:.32,sfxVolume:.55,mute:false};
  let settings={...defaults};
  try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved)settings=normalize(saved)}catch(_){}
  function normalize(value){const out={...defaults};for(const k of ['music','sfx','mute'])if(typeof value[k]==='boolean')out[k]=value[k];for(const k of ['musicVolume','sfxVolume'])if(Number.isFinite(value[k]))out[k]=Math.max(0,Math.min(1,value[k]));return out}
  let ctx,master,musicBus,sfxBus,analyser,noise,pulse,interval=null,suspendTimer=null,blocked=true;
  let provider=()=>({track:'title',paused:false}),track=null,cursor=0,nextAt=0,playing=false,completed=false;
  const voices=new Set(),cooldowns=new Map(),counts={};let peakVoices=0,scheduled=0,dropped=0,transitions=0,duckUntil=0,ducked=false;
  function graph(context){
    const master=context.createGain(),music=context.createGain(),sfx=context.createGain(),analyser=context.createAnalyser();
    master.gain.value=.7;music.gain.value=settings.musicVolume;sfx.gain.value=settings.sfxVolume;
    music.connect(master);sfx.connect(master);const limiter=context.createDynamicsCompressor();limiter.threshold.value=-12;limiter.knee.value=6;limiter.ratio.value=8;limiter.attack.value=.003;limiter.release.value=.08;master.connect(limiter);limiter.connect(analyser);analyser.connect(context.destination);
    const noise=context.createBuffer(1,context.sampleRate,context.sampleRate),data=noise.getChannelData(0);
    let seed=137;for(let i=0;i<data.length;i++){seed=(seed*1664525+1013904223)>>>0;data[i]=(seed/2147483648-1)*.7}
    const real=new Float32Array(33),imag=new Float32Array(33);
    for(let n=1;n<33;n++){real[n]=Math.sin(2*Math.PI*n*.25)/(Math.PI*n);imag[n]=(1-Math.cos(2*Math.PI*n*.25))/(Math.PI*n)}
    return {master,music,sfx,analyser,noise,pulse:context.createPeriodicWave(real,imag)};
  }
  function synth(context,bus,spec,at,resources,onend){
    const [wave,from,to,duration,delay=0,amp=.1]=spec,start=at+delay;
    const gain=context.createGain();gain.gain.value=0;let source,filter;
    if(wave==='noise'){
      source=context.createBufferSource();source.buffer=resources.noise;source.loop=true;
      filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.setValueAtTime(from,start);filter.frequency.exponentialRampToValueAtTime(Math.max(30,to),start+duration);
      source.connect(filter).connect(gain);
    }else{
      source=context.createOscillator();if(wave==='pulse')source.setPeriodicWave(resources.pulse);else source.type=wave;
      source.frequency.setValueAtTime(from,start);source.frequency.exponentialRampToValueAtTime(Math.max(30,to),start+duration);source.connect(gain);
    }
    gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(amp,start+.004);
    gain.gain.setValueAtTime(amp,Math.max(start+.004,start+duration-.025));gain.gain.linearRampToValueAtTime(0,start+duration);
    gain.connect(bus);source.onended=()=>{source.disconnect();filter?.disconnect();gain.disconnect();onend?.()};
    source.start(start);source.stop(start+duration+.01);
    return {source,gain,start,end:start+duration+.01};
  }
  function note(spec,at,group,priority=1){
    // Hard bound includes future notes in the look-ahead window, not just sounding notes.
    if(voices.size>=40){dropped++;return false}
    let voice;voice=synth(ctx,group==='music'?musicBus:sfxBus,spec,at,{noise,pulse},()=>voices.delete(voice));
    Object.assign(voice,{group,priority});voices.add(voice);scheduled++;peakVoices=Math.max(peakVoices,voices.size);return true;
  }
  function fadeVoice(voice,now){
    const p=voice.gain.gain;
    // Cancelling a future envelope must never restore GainNode's default gain of 1.
    if(voice.start>now){p.cancelScheduledValues(now);p.setValueAtTime(0,now)}
    else if(p.cancelAndHoldAtTime)p.cancelAndHoldAtTime(now);
    else{const value=p.value;p.cancelScheduledValues(now);p.setValueAtTime(value,now)}
    p.linearRampToValueAtTime(0,now+.018);
    try{voice.source.stop(now+.02)}catch(_){}
  }
  function stop(group){
    if(!ctx)return;
    const now=ctx.currentTime;
    for(const voice of voices){if((group&&voice.group!==group)||voice.retiring)continue;voice.retiring=true;
      fadeVoice(voice,now);
    }
  }
  function levels(){if(!ctx)return;const now=ctx.currentTime;for(const [node,value] of [[master,settings.mute?0:.7],[musicBus,settings.music?settings.musicVolume*(ducked?.2:1):0],[sfxBus,settings.sfx?settings.sfxVolume:0]]){node.gain.cancelScheduledValues(now);node.gain.setTargetAtTime(value,now,.012)}}
  function sync(){
    if(!ctx||ctx.state!=='running'||blocked)return;
    let scene;try{scene=provider()||{}}catch(_){return}
    const wanted=QuestScore.songs[scene.track]?scene.track:'title';
    if(wanted!==track){stop('music');track=wanted;cursor=0;completed=false;playing=false;transitions++}
    const gate=document.getElementById('viewportPause')?.matches(':not([hidden])');
    if(gate)stop('sfx');
    const shouldDuck=ctx.currentTime<duckUntil;if(shouldDuck!==ducked){ducked=shouldDuck;levels()}
    const paused=scene.paused||document.hidden||gate;
    if(paused||settings.mute||!settings.music||settings.musicVolume===0){stop('music');playing=false;return}
    if(completed)return;
    if(!playing){nextAt=ctx.currentTime+.035;playing=true}
    const song=QuestScore.songs[track],step=30/song.bpm;
    // Never catch up a throttled tab with a burst of stale notes.
    if(nextAt<ctx.currentTime-.05)nextAt=ctx.currentTime+.025;
    let budget=3;
    while(nextAt<ctx.currentTime+.12&&budget-->0){
      for(const spec of QuestScore.notes(song,cursor))note(spec,nextAt,'music');
      cursor++;nextAt+=step;
      if(cursor>=song.melody.length){if(song.once){completed=true;playing=false;break}cursor=0}
    }
  }
  async function unlock(event){
    if(!event?.isTrusted||document.hidden)return;
    clearTimeout(suspendTimer);blocked=false;
    try{
      if(!ctx){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;ctx=new Audio();const g=graph(ctx);({master,analyser,noise,pulse}=g);musicBus=g.music;sfxBus=g.sfx;levels()}
      if(ctx.state!=='running')await ctx.resume();
      if(blocked){await ctx.suspend();return}
      if(interval===null)interval=setInterval(sync,25);sync();
    }catch(_){blocked=true;updateStatus('Audio unavailable. Gameplay still works.')}
  }
  function suspend(){
    blocked=true;playing=false;if(interval!==null){clearInterval(interval);interval=null}stop();
    clearTimeout(suspendTimer);suspendTimer=setTimeout(()=>{if(blocked&&ctx?.state==='running')ctx.suspend().catch(()=>{})},24);
  }
  const priority={gameOver:5,bossDefeat:5,damage:4,bossAppear:4,warning:4,checkpoint:3,beacon:3,portal:3,secret:3,card:3,memory:3};
  function effect(name){
    if(!ctx||ctx.state!=='running'||blocked||settings.mute||!settings.sfx||settings.sfxVolume===0)return false;
    const specs=QuestScore.effects[name];if(!specs)return false;
    const now=ctx.currentTime,p=priority[name]||1,cool=name==='warning'?.35:name==='land'?.12:.055;
    if(now-(cooldowns.get(name)??-99)<cool)return false;
    let active=[...voices].filter(v=>v.group==='sfx'&&!v.retiring);
    if(active.length+specs.length>14){
      // Important warnings/damage may replace lower priority voices. Quiet hits simply drop.
      if(p<3){dropped++;return false}
      for(const v of active.filter(v=>v.priority<p)){v.retiring=true;fadeVoice(v,now);}
      if(active.filter(v=>!v.retiring).length+specs.length>14||voices.size+specs.length>40){dropped++;return false}
    }
    if(name==='gameOver')duckUntil=now+1.1;
    cooldowns.set(name,now);counts[name]=(counts[name]||0)+1;
    for(const spec of specs)note(spec,now+.002,'sfx',p);
    return true;
  }
  function configure(patch,event){settings=normalize({...settings,...patch});try{localStorage.setItem(KEY,JSON.stringify(settings))}catch(_){updateStatus('Settings work for this visit; storage is unavailable.')}
    levels();if(settings.mute)stop();else if(!settings.sfx)stop('sfx');if(!settings.music)stop('music');
    syncControls();if(event?.isTrusted)unlock(event);sync();
  }
  function updateStatus(message){document.querySelectorAll('.audioStatus').forEach(el=>el.textContent=message)}
  function syncControls(){document.querySelectorAll('[data-audio-setting]').forEach(el=>{const k=el.dataset.audioSetting;if(el.type==='checkbox')el.checked=settings[k];else{el.value=Math.round(settings[k]*100);el.nextElementSibling.textContent=el.value+'%'}})}
  function settingsUI(){
    for(const [i,panel] of [...document.querySelectorAll('#titleScreen .card,#openingCard,#journal,#pauseMenu')].entries()){
      const details=document.createElement('details');details.className='audioSettings';
      const summary=document.createElement('summary');summary.textContent='Sound settings';details.append(summary);
      const field=document.createElement('fieldset');field.innerHTML='<legend>Original chiptunes & effects</legend>';
      for(const [key,label] of [['mute','Master mute'],['music','Music'],['sfx','Sound effects'],['musicVolume','Music volume'],['sfxVolume','Effects volume']]){
        const row=document.createElement('label'),input=document.createElement('input');input.id=`audio-${i}-${key}`;input.dataset.audioSetting=key;row.htmlFor=input.id;
        const span=document.createElement('span');span.textContent=label;row.append(span,input);
        input.type=key.endsWith('Volume')?'range':'checkbox';if(input.type==='range'){input.min=0;input.max=100;input.step=1;const output=document.createElement('output');output.htmlFor=input.id;row.append(output)}
        input.addEventListener('input',event=>configure({[key]:input.type==='checkbox'?input.checked:Number(input.value)/100},event));field.append(row);
      }
      const tip=document.createElement('p');tip.className='audioStatus';tip.textContent='Sound starts after you tap or press a key. Pause stops music; resume restarts it safely.';field.append(tip);details.append(field);panel.append(details);
    }syncControls();
    document.addEventListener('click',event=>{if(event.target.closest('button:not([data-action]),summary'))effect('menu')});
  }
  for(const type of ['pointerdown','keydown'])document.addEventListener(type,unlock,{capture:true});
  for(const type of ['blur','pagehide'])addEventListener(type,suspend);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)suspend()});
  addEventListener('pageshow',()=>{if(ctx&&ctx.state!=='running')blocked=true});
  document.addEventListener('DOMContentLoaded',settingsUI);
  function status(){const data=analyser?new Float32Array(analyser.fftSize):[];analyser?.getFloatTimeDomainData(data);return {initialized:!!ctx,state:ctx?.state||'locked',blocked,track,cursor,playing,completed,voices:voices.size,musicVoices:[...voices].filter(v=>v.group==='music').length,sfxVoices:[...voices].filter(v=>v.group==='sfx').length,ahead:ctx?nextAt-ctx.currentTime:0,peakVoices,scheduled,dropped,transitions,schedulers:interval===null?0:1,settings:{...settings},events:{...counts},signalPeak:data.length?data.reduce((max,v)=>Math.max(max,Math.abs(v)),0):0,rms:data.length?Math.sqrt(data.reduce((sum,v)=>sum+v*v,0)/data.length):0}}
  window.QuestAudio=Object.freeze({effect,configure,bind(fn){provider=fn;sync()},sync,suspend,status});
  if(new URLSearchParams(location.search).has('audioqa'))window.__QUEST_AUDIO_TEST__={
    async renderRetired(){
      const Offline=window.OfflineAudioContext||window.webkitOfflineAudioContext;
      const offline=new Offline(1,4410,44100),g=graph(offline);
      for(let i=0;i<40;i++){const voice=synth(offline,g.sfx,['square',440,440,.08,0,.1],.002,g);fadeVoice(voice,0)}
      return Array.from((await offline.startRendering()).getChannelData(0));
    },
    async render(name,seconds=8){
      seconds=Math.min(20,Math.max(1,seconds));const Offline=window.OfflineAudioContext||window.webkitOfflineAudioContext;
      const offline=new Offline(1,44100*seconds,44100),g=graph(offline),song=QuestScore.songs[name];
      if(song){const step=30/song.bpm;for(let i=0;i*step<seconds-.5;i++){if(song.once&&i>=song.melody.length)break;for(const spec of QuestScore.notes(song,i))synth(offline,g.music,spec,i*step+.01,g)}}
      else{if(!QuestScore.effects[name])throw Error('Unknown cue');for(const spec of QuestScore.effects[name])synth(offline,g.sfx,spec,.05,g)}
      const buffer=await offline.startRendering();return Array.from(buffer.getChannelData(0));
    }
  };
})();
