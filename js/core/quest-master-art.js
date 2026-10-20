/* Measured idle, movement and action sprite states. Combat timing, targets, hitboxes and saves are owned by existing runtimes. */
(() => {
 'use strict';
 const world=document.querySelector('main[data-world]')?.dataset.world||(document.querySelector('#tahoeApp')?'tahoe':'socal');
 const actors={socal:['queen-beige','court-judge','flaming-law','hoa-drone','beige-bot'],tahoe:['toxic-bloom','algae-slime','pine-queen','pine-beetle','larva','flying-beetle'],alaska:['pipeline-worker','surveillance-drone','security-turret','machinery','oil-slime','frost-queen','zombie-salmon','alaskan-owl']}[world];
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 const deaths=[];const actionStates={prepare:[0],attack:[1],hurt:[2],defeat:[3],transform:[0,1]};
 const images={},stats={draws:0,backgrounds:0,failed:[],poses:{}};let loaded=false;
 const load=(id,url)=>new Promise((resolve,reject)=>{const im=new Image(),timer=setTimeout(()=>im.onerror(),20000);im.onload=()=>{clearTimeout(timer);images[id]=im;resolve()};im.onerror=()=>{clearTimeout(timer);if(!stats.failed.includes(url))stats.failed.push(url);reject(Error('Artwork unavailable: '+url))};im.src=url});
 const ready=Promise.all([...actors.flatMap(id=>[load(id,'assets/master-build/actors/'+id+'.webp'),load(id+'-actions','assets/master-build/actors/'+id+'-actions.webp')]),load('props','assets/master-build/foreground.webp'),load('scenery','assets/master-build/'+world+'-scenes.webp')]).then(()=>loaded=true);
 // Avoid unhandled rejections; entrypoints inspect the same ready promise before enabling play.
 ready.catch(()=>{});
 // Cache only the outside silhouette at logical pixel resolution. Original RGB art stays on top.
 const contours=new Map(),groundedActors=new Set(['queen-beige','court-judge','flaming-law','beige-bot','pine-beetle','larva','algae-slime','pipeline-worker','security-turret','machinery','oil-slime']);
 let contourBytes=0,contourBuilds=0;
 function contour(im,cell,action,size){
  const key=im.src+':'+cell+':'+size;if(contours.has(key))return contours.get(key);
  const sw=action?384:192,sh=action?256:192,dw=action?size*2:size,dh=action?size*256/192:size;
  const dx=Math.round(action?-size*144/192:-size/2),dy=Math.round(action?-size*244/192:-size*188/192),ox=Math.floor(dx)-3,oy=Math.floor(dy)-3;
  const cv=document.createElement('canvas');cv.width=Math.ceil(dx+dw)-ox+3;cv.height=Math.ceil(dy+dh)-oy+3;
  const c=cv.getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(im,cell*sw,0,sw,sh,dx-ox,dy-oy,dw,dh);
  const source=c.getImageData(0,0,cv.width,cv.height),out=c.createImageData(cv.width,cv.height),w=cv.width,h=cv.height;
  // Separable distance scan: five row checks per outside pixel instead of 25 alpha lookups.
  const horizontal=new Uint8Array(w*h);
  for(let y=0;y<h;y++){
   let distance=3;for(let x=0;x<w;x++){const i=y*w+x;distance=source.data[i*4+3]>160?0:Math.min(3,distance+1);horizontal[i]=distance}
   distance=3;for(let x=w-1;x>=0;x--){const i=y*w+x;distance=source.data[i*4+3]>160?0:Math.min(3,distance+1);horizontal[i]=Math.min(horizontal[i],distance)}
  }
  for(let y=2;y<h-2;y++)for(let x=2;x<w-2;x++){
   const i=(y*w+x)*4;if(source.data[i+3]>160)continue;
   let distance=3;for(let dy=-2;dy<=2;dy++)distance=Math.min(distance,Math.max(Math.abs(dy),horizontal[(y+dy)*w+x]));
   if(distance>2)continue;const light=distance===1;out.data[i]=light?222:18;out.data[i+1]=light?220:26;out.data[i+2]=light?187:39;out.data[i+3]=light?215:245;
  }
  c.putImageData(out,0,0);const entry={canvas:cv,x:ox,y:oy,bytes:w*h*4};contours.set(key,entry);contourBytes+=entry.bytes;contourBuilds++;
  if(contours.size>96){const oldest=contours.keys().next().value;contourBytes-=contours.get(oldest).bytes;contours.delete(oldest)}return entry;
 }
 function warning(ctx,x,y){ctx.save();ctx.imageSmoothingEnabled=false;x=Math.round(x);y=Math.round(y);ctx.fillStyle='#151d2c';ctx.fillRect(x-7,y-2,14,24);ctx.fillStyle='#ffe47b';ctx.fillRect(x-3,y+1,6,12);ctx.fillRect(x-3,y+17,6,4);ctx.restore();}
 function draw(ctx,id,x,foot,time,size=100,{moving=true,flip=false,flash=false,pose=null,grounded=groundedActors.has(id)}={}){
  const action=actionStates[pose],im=images[id+(action?'-actions':'')];if(!im||!loaded)return false;
  const reduced=reducedMotion.matches;
  const frame=(moving?2:0)+(reduced?0:Math.floor(time/(moving?140:180))%2);
  ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(Math.round(x),Math.round(foot));if(flip)ctx.scale(-1,1);if(flash)ctx.globalAlpha*=.4;
  if(grounded&&pose!=='defeat'){ctx.fillStyle='rgba(14,23,31,.38)';const width=Math.min(52,Math.round(size*.52));ctx.fillRect(-Math.floor(width/2),-1,width,3);ctx.fillRect(-Math.floor(width*.35),2,Math.round(width*.7),2);}
  const selected=action?action[reduced?0:Math.floor(time/120)%action.length]:frame,edge=contour(im,selected,Boolean(action),size);ctx.drawImage(edge.canvas,edge.x,edge.y);
  if(action){const cell=action[reduced?0:Math.floor(time/120)%action.length];ctx.drawImage(im,cell*384,0,384,256,Math.round(-size*144/192),Math.round(-size*244/192),size*384/192,size*256/192);}else ctx.drawImage(im,frame*192,0,192,192,Math.round(-size/2),Math.round(-size*188/192),size,size);ctx.restore();stats.draws++;const key=pose||(moving?'walk':'idle');stats.poses[key]=(stats.poses[key]||0)+1;return true;
 }
 function background(ctx,panel,camera,width=1280,height=620){
  const im=images.scenery;if(!im||!loaded)return false;
  const col=panel%2,row=Math.floor(panel/2),x=Math.floor(col*im.width/2)+3,y=Math.floor(row*im.height/3)+3,cw=Math.floor(im.width/2)-6,ch=Math.floor(im.height/3)-6;
  const scale=Math.max(width/cw,height/ch)*1.04,sw=width/scale,sh=height/scale,travel=Math.max(0,Math.min(1,camera/9000));
  ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(im,x+(cw-sw)*travel,y+(ch-sh)*.35,sw,sh,0,0,width,height);ctx.restore();stats.backgrounds++;stats.lastPanel=panel;return true;
 }
 function prop(ctx,index,x,foot,height=230){const im=images.props;if(!im||!loaded)return false;ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(im,index*256,0,256,320,Math.round(x-height*.4),Math.round(foot-height*312/320),height*.8,height);ctx.restore();return true;}
 function defeat(id,x,foot,time,size){deaths.push({id,x,foot,time,size});if(deaths.length>32)deaths.shift();}
 function drawDefeats(ctx,time,camera=0){for(let i=deaths.length-1;i>=0;i--){const d=deaths[i],age=time-d.time;if(age<0||age>1000){deaths.splice(i,1);continue;}ctx.save();ctx.globalAlpha*=Math.min(1,(1000-age)/350);draw(ctx,d.id,d.x-camera,d.foot-Math.floor(age/150),time,d.size,{pose:age<120?'hurt':'defeat',grounded:false});ctx.restore();}}
 window.QuestMasterArt=Object.freeze({world,ready,draw,background,prop,defeat,warning,drawDefeats,clearDeaths:()=>deaths.length=0,status:()=>({loaded,actors:[...actors],contours:contours.size,contourBytes,contourBuilds,...stats,poses:{...stats.poses},failed:[...stats.failed]}),scope:'measured idle/walk and distinct action poses; final visual approval required'});
})();
