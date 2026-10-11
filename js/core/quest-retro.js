/* Original Quest art, rendered on a shared 320×180 pixel grid. Physics stays 1280×720. */
(() => {
  'use strict';
  const palette = ['101020','242438','404058','606078','888898','b8b8c0','e8e8d8','ffffff',
    '381848','682878','a038a0','e050a8','f898b8','f8c8d8','282858','4040a0','6868d8','a898f8',
    '103858','185888','2878b8','48a8d8','88d8e8','b8e8f8','183828','286838','489848','88b858','b8d878',
    '584020','886038','b88850','e8b878','f8d898','f8e858','782838','b83848','e85858','f88858','d86838']
    .map(hex=>[0,2,4].map(i=>parseInt(hex.slice(i,i+2),16)));
  const lookup = new Uint8Array(32768);
  for(let i=0;i<lookup.length;i++){
    const r=(i>>10)*8+4,g=((i>>5)&31)*8+4,b=(i&31)*8+4;
    let best=Infinity;
    palette.forEach((p,n)=>{const d=(r-p[0])**2+(g-p[1])**2+(b-p[2])**2;if(d<best){best=d;lookup[i]=n}});
  }
  function createRenderer(canvas) {
    const buffer=document.createElement('canvas'); buffer.width=320;buffer.height=180;
    const ctx=buffer.getContext('2d',{willReadFrequently:true});ctx.scale(.25,.25);ctx.imageSmoothingEnabled=false;
    const output=canvas.getContext('2d');output.imageSmoothingEnabled=false;
    function present(){
      const pixels=ctx.getImageData(0,0,320,180),d=pixels.data;
      for(let i=0;i<d.length;i+=4){const p=palette[lookup[((d[i]>>3)<<10)|((d[i+1]>>3)<<5)|(d[i+2]>>3)]];d[i]=p[0];d[i+1]=p[1];d[i+2]=p[2];}
      ctx.putImageData(pixels,0,0);output.clearRect(0,0,1280,720);output.drawImage(buffer,0,0,1280,720);
    }
    return {ctx,present};
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
