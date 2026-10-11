/* Original 3.4 cast atlases. Outfit selection changes artwork, never physics. */
(() => {
 'use strict';
 const names=['will','daniel','caleb','rigsby','zoey'];
 const world=document.querySelector('main[data-world]')?.dataset.world || (document.getElementById('tahoeApp')?'tahoe':'socal');
 const atlas=new Image(), strips={}, portraits={};
 const animations={idle:[0,0,0,0,0,0],walk:[1,2,1,2,1,2,1,2],jump:[3,3,3,3],attack:[4,4,4,4,4,4],hurt:[3,3,3,3,3,3],celebrate:[5,5,5,5,5,5],bark:[4,4,4,4,4,4]};
 const ready=new Promise((resolve,reject)=>{atlas.onload=()=>{try{
  const cw=atlas.naturalWidth/6;
  // Atlas rows have different heights for full-size humans and shorter beagles.
  const rows=[0,265,509,753,948,1145].map(v=>v*atlas.naturalHeight/1145);
  const scratch=document.createElement('canvas');scratch.width=Math.ceil(cw);scratch.height=Math.ceil(rows[1]);const sc=scratch.getContext('2d',{willReadFrequently:true});
  names.forEach((name,row)=>{const sy=rows[row],ch=rows[row+1]-sy;scratch.height=Math.ceil(ch);sc.imageSmoothingEnabled=false;
   const bounds=[];
   for(let col=0;col<6;col++){sc.clearRect(0,0,cw,ch);sc.drawImage(atlas,col*cw,sy,cw,ch,0,0,cw,ch);const data=sc.getImageData(0,0,scratch.width,scratch.height).data;let left=cw,right=0,top=ch,bottom=0;
    for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)if(data[(y*scratch.width+x)*4+3]>96){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y)}bounds.push({left,right,top,bottom});
   }
   const scale=(row<3?180:86)/Math.max(...bounds.map(b=>b.bottom-b.top+1));
   for(const [animation,cols] of Object.entries(animations)){
    if(row<3&&animation==='bark')continue;
    const fw=row<3?192:128,fh=row<3?192:96,c=document.createElement('canvas');c.width=fw*cols.length;c.height=fh;const cx=c.getContext('2d');cx.imageSmoothingEnabled=false;
    cols.forEach((col,i)=>{const b=bounds[col],sw=b.right-b.left+1,sh=b.bottom-b.top+1,dw=sw*scale,dh=sh*scale;cx.save();const bob=animation==='idle'&&i%3===1?-1:animation==='celebrate'&&i%2?-3:0;cx.translate(animation==='attack'?-[0,2,3,1,0,0][i]:0,bob);if(animation==='hurt'||(animation==='jump'&&i>=2)){cx.translate(i*fw+fw/2,fh-4);cx.rotate(animation==='hurt'?-.12:.08);cx.translate(-i*fw-fw/2,-fh+4)}cx.drawImage(atlas,col*cw+b.left,sy+b.top,sw,sh,i*fw+(fw-dw)/2,fh-4-dh,dw,dh);cx.restore()});
    strips[name+'_'+animation]=c.toDataURL();
   }
   if(row<3){const b=bounds[0],c=document.createElement('canvas');c.width=128;c.height=128;const cx=c.getContext('2d');cx.imageSmoothingEnabled=false;const side=Math.max(b.right-b.left+1,(b.bottom-b.top)*.52);cx.drawImage(atlas,b.left,sy+b.top,side,side,0,0,128,128);portraits[name]=c.toDataURL()}
  });
  const replacePortraits=()=>document.querySelectorAll('img[data-cast-portrait],img[src*="assets/portraits/"]').forEach(im=>{const name=im.dataset.castPortrait||im.getAttribute('src').split('/').pop().split('.')[0];if(portraits[name]&&im.src!==portraits[name]){im.src=portraits[name];im.dataset.cast='3.4.0'}});
  replacePortraits();new MutationObserver(replacePortraits).observe(document.body,{subtree:true,attributes:true,attributeFilter:['src']});
  resolve(true);
 }catch(e){reject(e)}};atlas.onerror=()=>reject(new Error('Cannot load '+world+' cast atlas'));atlas.src='assets/cast340/'+world+'.png?v=3.4.0'});
 function loadImages(){const images={};names.forEach(name=>Object.keys(animations).forEach(anim=>{if(names.indexOf(name)<3&&anim==='bark')return;const image=new Image();images[name+'_'+anim]=image;ready.then(()=>image.src=strips[name+'_'+anim]).catch(()=>image.dispatchEvent(new Event('error')))}));return images}
 let pets;function drawPet(ctx,x,y,time,name,flip){if(!pets)pets=loadImages();const image=pets[name+'_walk'];if(!image?.complete||!image.naturalWidth)return false;ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(Math.round(x+(flip?78:0)),Math.round(y-18));ctx.scale(flip?-1:1,1);ctx.drawImage(image,(Math.floor(time/110)%8)*128,0,128,96,0,0,78,58);ctx.restore();return true}
 window.QuestCast=Object.freeze({world,ready,loadImages,drawPet,portraits,names,atlas});
})();
