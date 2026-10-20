/* Verified idle/walk artwork foundation. Combat timing, targets, hitboxes and saves are owned by existing runtimes. */
(() => {
 'use strict';
 const world=document.querySelector('main[data-world]')?.dataset.world||(document.querySelector('#tahoeApp')?'tahoe':'socal');
 const actors={socal:['queen-beige','court-judge','flaming-law','hoa-drone','beige-bot'],tahoe:['pine-queen','pine-beetle','larva','flying-beetle'],alaska:['frost-queen','zombie-salmon','alaskan-owl']}[world];
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 const images={},stats={draws:0,backgrounds:0,failed:[]};let loaded=false;
 const load=(id,url)=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images[id]=im;resolve()};im.onerror=()=>{stats.failed.push(url);reject(Error('Artwork unavailable: '+url))};im.src=url});
 const ready=Promise.all([...actors.map(id=>load(id,'assets/master-build/actors/'+id+'.png')),load('scenery','assets/master-build/'+world+'-scenes.png')]).then(()=>loaded=true);
 // Avoid unhandled rejections; entrypoints inspect the same ready promise before enabling play.
 ready.catch(()=>{});
 function draw(ctx,id,x,foot,time,size=100,{moving=true,flip=false,flash=false}={}){
  const im=images[id];if(!im||!loaded)return false;
  const reduced=reducedMotion.matches;
  const frame=(moving?2:0)+(reduced?0:Math.floor(time/(moving?140:180))%2);
  ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(Math.round(x),Math.round(foot));if(flip)ctx.scale(-1,1);if(flash)ctx.globalAlpha*=.4;
  ctx.drawImage(im,frame*192,0,192,192,-size/2,-size*188/192,size,size);ctx.restore();stats.draws++;return true;
 }
 function background(ctx,panel,camera,width=1280,height=620){
  const im=images.scenery;if(!im||!loaded)return false;
  const col=panel%2,row=Math.floor(panel/2),x=Math.floor(col*im.width/2)+3,y=Math.floor(row*im.height/3)+3,cw=Math.floor(im.width/2)-6,ch=Math.floor(im.height/3)-6;
  const scale=Math.max(width/cw,height/ch)*1.04,sw=width/scale,sh=height/scale,travel=Math.max(0,Math.min(1,camera/9000));
  ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(im,x+(cw-sw)*travel,y+(ch-sh)*.35,sw,sh,0,0,width,height);ctx.restore();stats.backgrounds++;return true;
 }
 window.QuestMasterArt=Object.freeze({world,ready,draw,background,status:()=>({loaded,actors:[...actors],...stats,failed:[...stats.failed]}),scope:'idle-walk foundation; new encounters and full action animation pending'});
})();
