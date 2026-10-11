/* Shared original-color pixel renderer. Physics stays 1280×720. */
(() => {
  'use strict';
  function createRenderer(canvas) {
    // Native logical coordinates on desktop; a half-size buffer on touch screens.
    // No palette conversion or per-frame readback: original artwork retains its colors.
    const requested=Number(new URLSearchParams(location.search).get('renderqa'));
    const touch=matchMedia('(pointer: coarse)').matches||navigator.maxTouchPoints>0;
    const width=[640,960,1280].includes(requested)?requested:touch?640:1280;
    const height=width*9/16,buffer=width===1280?canvas:document.createElement('canvas');
    buffer.width=width;buffer.height=height;
    const ctx=buffer.getContext('2d');ctx.scale(width/1280,width/1280);ctx.imageSmoothingEnabled=false;
    const output=canvas.getContext('2d');output.imageSmoothingEnabled=false;
    canvas.dataset.renderResolution=`${width}x${height}`;
    function present(){
      if(buffer===canvas)return;
      output.clearRect(0,0,1280,720);output.drawImage(buffer,0,0,1280,720);
    }
    return {ctx,present,width,height};
  }
  const snap=n=>Math.round(n/4)*4;
  function heart(ctx,x,y,size=4){
    const rows=['0110110','1111111','1111111','0111110','0011100','0001000'];
    rows.forEach((row,dy)=>[...row].forEach((pixel,dx)=>{if(pixel==='1')ctx.fillRect(snap(x)+dx*size,snap(y)+dy*size,size,size)}));
  }
  function shots(ctx,items,time,camera=0){
    ctx.save();ctx.translate(-snap(camera),0);
    for(const s of items){
      const x=snap(s.x),y=snap(s.y);
      for(const p of (s.trail||[]).filter((_,i)=>i%3===0)){ctx.fillStyle=s.type==='heart'?'#a038a0':'#48a8d8';ctx.fillRect(snap(p.x),snap(p.y)+8,4,4)}
      if(s.type==='heart'){ctx.fillStyle='#101020';heart(ctx,x,y,5);ctx.fillStyle='#e050a8';heart(ctx,x+4,y+4,4);ctx.fillStyle='#fff';ctx.fillRect(x+8,y+8,4,4)}
      else{ctx.fillStyle='#101020';ctx.fillRect(x,y,60,24);['#e050a8','#f8e858','#88b858','#48a8d8'].forEach((color,i)=>{ctx.fillStyle=color;ctx.fillRect(x+4+i*12,y+4,12,16)});ctx.fillStyle='#fff';for(let i=0;i<(s.bounces||0);i++)ctx.fillRect(x+40-i*8,y,4,4)}
    }ctx.restore();
  }
  function fields(ctx,items,time,camera=0){
    ctx.save();ctx.translate(-snap(camera),0);
    for(const f of items){ctx.fillStyle=f.detonated?'#f8e858':'#e050a8';
      const phase=Math.floor(time/100)%2;
      for(let i=0;i<32;i++){if(!f.detonated&&i%2===phase)continue;const a=i*Math.PI/16;ctx.fillRect(snap(f.x+Math.cos(a)*f.radius),snap(f.y+Math.sin(a)*f.radius),8,8)}
      ctx.fillStyle='#f898b8';heart(ctx,f.x-14,f.y-12);
    }ctx.restore();
  }
  function cookies(ctx,items,time,camera=0){
    ctx.save();ctx.translate(-snap(camera),0);
    for(const b of items){const x=snap(b.x),y=snap(b.y);ctx.fillStyle='#101020';ctx.fillRect(x,y+4,32,24);ctx.fillRect(x+4,y,24,32);
      ctx.fillStyle=b.stuck&&Math.floor(time/80)%2?'#ffffff':'#e8b878';ctx.fillRect(x+4,y+4,24,24);
      ctx.fillStyle='#584020';for(const [dx,dy] of [[8,8],[20,8],[12,20]])ctx.fillRect(x+dx,y+dy,4,4);
      if(b.stuck){ctx.fillStyle='#e85858';ctx.fillRect(x+12,y-8,8,4)}
    }ctx.restore();
  }
  function cast(ctx,player,remaining,camera=0){if(remaining<=0)return;ctx.save();ctx.fillStyle='#e050a8';heart(ctx,player.x-camera+8,player.y-28);ctx.restore()}
  window.QuestRetro=Object.freeze({createRenderer,shots,fields,cookies,cast,snap});
})();
