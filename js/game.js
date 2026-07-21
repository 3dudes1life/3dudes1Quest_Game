import {CONFIG,DUDES} from './config.js?v=1.0.7';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const hit=(a,b)=>a.x+a.w>b.x&&a.x<b.x+b.w&&a.y+a.h>b.y&&a.y<b.y+b.h;

export class Game{
  constructor(canvas,ui,input,onComplete){
    this.canvas=canvas;
    this.ctx=canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled=true;
    this.ui=ui;
    this.input=input;
    this.onComplete=onComplete;
    this.images={};
    this.loadImage('home','assets/environments/home_base_remastered.svg');
    ['will','daniel','caleb'].forEach(name=>{
      ['idle','walk','jump','attack','hurt','celebrate'].forEach(state=>{
        this.loadImage(`${name}_${state}`,`assets/sprites_hd/${name}_${state}.png`);
      });
    });
    ['idle','walk','bark'].forEach(state=>this.loadImage(`rigsby_${state}`,`assets/sprites_hd/rigsby_${state}.png`));
    this.running=false;
    this.last=0;
    this.reset();
    window.__questGame=this;
  }

  loadImage(key,src){
    const image=new Image();
    image.src=src;
    this.images[key]=image;
  }

  reset(){
    this.state={
      paused:false,health:4,cards:0,beacons:0,dude:0,triangle:0,
      playerX:145,currentObjective:{
        title:'Follow Rigsby',
        detail:'Move with A/D or the arrows. Jump with Space. Reach the Prism Beacon.'
      },
      bossDefeated:false,playTime:0
    };
    this.player={
      x:145,y:548,w:44,h:72,vx:0,vy:0,onGround:true,facing:1,
      anim:'idle',animUntil:0,invuln:0
    };
    this.cameraX=0;
    this.worldWidth=2550;
    this.floorY=620;
    this.rigsby={x:255,y:577,w:52,h:38};
    this.card={x:730,y:520,w:38,h:50,collected:false};
    this.beacon={x:1110,y:515,w:54,h:92,active:false};
    this.enemy={x:1480,y:566,w:50,h:54,vx:-1.05,alive:true};
    this.exit={x:2210,y:470,w:150,h:150};
    this.particles=[];
    this.introUntil=performance.now()+1600;
    this.completed=false;
    this.ui.hud(this.state,DUDES[this.state.dude]);
  }

  start(saved=null){
    this.reset();
    if(saved)this.applySave(saved);
    this.state.paused=false;
    this.running=true;
    this.last=performance.now();
    this.ui.flash('Home Base restored. The quest is playable.');
    requestAnimationFrame(t=>this.loop(t));
  }

  stop(){this.running=false}
  togglePause(){
    this.state.paused=!this.state.paused;
    this.ui.flash(this.state.paused?'Quest paused.':'Back to the quest.');
  }
  switchDude(index=null){
    this.state.dude=index===null?(this.state.dude+1)%3:index;
    this.ui.flash(DUDES[this.state.dude].line);
  }

  getSaveData(){
    return {
      version:'1.0.7V',
      player:{x:this.player.x,y:this.player.y},
      state:{...this.state,paused:false},
      card:this.card.collected,
      beacon:this.beacon.active,
      enemy:this.enemy.alive,
      savedAt:new Date().toISOString()
    };
  }

  applySave(save){
    if(!save)return;
    if(save.player){
      this.player.x=clamp(save.player.x??145,0,this.worldWidth-this.player.w);
      this.player.y=save.player.y??548;
    }
    if(save.state)Object.assign(this.state,save.state,{paused:false,bossDefeated:false});
    this.card.collected=!!save.card;
    this.beacon.active=!!save.beacon;
    this.enemy.alive=save.enemy!==false;
    this.cameraX=clamp(this.player.x-360,0,this.worldWidth-1280);
  }

  loop(t){
    if(!this.running)return;
    const dt=clamp((t-this.last)/16.667||1,0,2);
    this.last=t;
    if(!this.state.paused)this.update(dt,t);
    this.draw(t);
    requestAnimationFrame(n=>this.loop(n));
  }

  update(dt,t){
    const dude=DUDES[this.state.dude];
    const accel=.72;
    if(this.input.left){
      this.player.vx-=accel*dt;
      this.player.facing=-1;
    }
    if(this.input.right){
      this.player.vx+=accel*dt;
      this.player.facing=1;
    }
    if(!this.input.left&&!this.input.right)this.player.vx*=Math.pow(.76,dt);
    this.player.vx=clamp(this.player.vx,-dude.speed,dude.speed);

    if(this.input.jump&&!this._jumpHeld&&this.player.onGround){
      this.player.vy=-dude.jump;
      this.player.onGround=false;
      this.player.anim='jump';
      this.burst(this.player.x+22,this.floorY,'#ffe66d',8);
    }
    this._jumpHeld=this.input.jump;

    if(this.input.power&&!this._powerHeld)this.usePower(t);
    this._powerHeld=this.input.power;

    this.player.vy+=CONFIG.gravity*dt;
    this.player.x+=this.player.vx*dt;
    this.player.y+=this.player.vy*dt;
    this.player.x=clamp(this.player.x,0,this.worldWidth-this.player.w);

    if(this.player.y+this.player.h>=this.floorY){
      this.player.y=this.floorY-this.player.h;
      this.player.vy=0;
      this.player.onGround=true;
    }

    if(this.player.y>760){
      this.player.x=145;
      this.player.y=this.floorY-this.player.h;
      this.player.vx=0;
      this.player.vy=0;
    }

    this.cameraX+=(this.player.x-350+this.player.facing*80-this.cameraX)*.08;
    this.cameraX=clamp(this.cameraX,0,this.worldWidth-1280);

    const followTarget=clamp(this.player.x+120,250,2050);
    this.rigsby.x+=(followTarget-this.rigsby.x)*.055*dt;
    this.rigsby.y=this.floorY-this.rigsby.h-5;

    if(!this.card.collected&&hit(this.player,this.card)){
      this.card.collected=true;
      this.state.cards=1;
      this.state.triangle=35;
      this.state.currentObjective={
        title:'Restore the Prism Beacon',
        detail:'Keep moving right. The glowing beacon is beyond the pool.'
      };
      this.burst(this.card.x,this.card.y,'#ffe66d',30);
      this.ui.flash('Gay Card acquired!');
      window.showCollectible?.('🌈 GAY CARD ACQUIRED');
    }

    if(!this.beacon.active&&hit(this.player,this.beacon)){
      this.beacon.active=true;
      this.state.beacons=1;
      this.state.triangle=70;
      this.state.currentObjective={
        title:'Reach the Hillcrest Portal',
        detail:'Defeat the Beige Bot or jump over it, then enter the rainbow gate.'
      };
      this.burst(this.beacon.x+27,this.beacon.y+30,'#3ce7d2',46);
      this.ui.flash('Prism Beacon restored!');
      window.showAchievement?.('Home Base Restored','🔺');
    }

    if(this.enemy.alive){
      this.enemy.x+=this.enemy.vx*dt;
      if(this.enemy.x<1370||this.enemy.x>1640)this.enemy.vx*=-1;
      if(hit(this.player,this.enemy)&&this.player.invuln<=0){
        this.state.health--;
        this.player.invuln=90;
        this.player.vx=-this.player.facing*7;
        this.player.vy=-6;
        this.ui.flash('Beige Bot attack!');
        this.burst(this.player.x,this.player.y,'#ff6b8a',18);
        if(this.state.health<=0){
          this.state.health=4;
          this.player.x=980;
          this.player.y=this.floorY-this.player.h;
          this.cameraX=650;
        }
      }
    }
    if(this.player.invuln>0)this.player.invuln-=dt;

    if(hit(this.player,this.exit)&&this.beacon.active&&!this.completed){
      this.completed=true;
      this.state.bossDefeated=true;
      this.player.anim='celebrate';
      this.player.animUntil=t+2200;
      this.ui.flash('Level 1 complete!');
      window.showAchievement?.('Hillcrest Unlocked','🌈');
      setTimeout(()=>this.onComplete(this.state),1200);
    }else if(hit(this.player,this.exit)&&!this.beacon.active){
      this.ui.flash('Restore the Prism Beacon first!');
      this.player.x=this.exit.x-70;
    }

    this.updateParticles(dt);
    this.state.playTime+=dt;
    this.state.playerX=this.player.x;
    this.state.triangle=clamp(this.state.triangle+.008*dt,0,100);
    this.ui.hud(this.state,DUDES[this.state.dude]);
  }

  usePower(t){
    this.player.anim='attack';
    this.player.animUntil=t+420;
    const dude=this.state.dude;
    if(dude===0){
      if(this.enemy.alive&&Math.abs(this.enemy.x-this.player.x)<260){
        this.enemy.alive=false;
        this.burst(this.enemy.x,this.enemy.y,'#ff4fb8',40);
        this.ui.flash('Rainbow Toss!');
      }else this.ui.flash('Rainbow Toss!');
    }else if(dude===1){
      this.state.health=clamp(this.state.health+1,0,4);
      this.player.invuln=120;
      this.burst(this.player.x,this.player.y,'#3ce7d2',28);
      this.ui.flash('Positive energy shield!');
    }else{
      if(this.enemy.alive&&Math.abs(this.enemy.x-this.player.x)<320){
        this.enemy.alive=false;
        this.burst(this.enemy.x,this.enemy.y,'#ff9a3c',40);
      }
      this.ui.flash('Cookie chaos!');
    }
  }

  burst(x,y,color,count){
    for(let i=0;i<count;i++){
      this.particles.push({
        x,y,vx:(Math.random()-.5)*7,vy:(Math.random()-.75)*7,
        life:40+Math.random()*45,color,size:2+Math.random()*5
      });
    }
  }

  updateParticles(dt){
    for(const p of this.particles){
      p.x+=p.vx*dt;
      p.y+=p.vy*dt;
      p.vy+=.18*dt;
      p.life-=dt;
    }
    this.particles=this.particles.filter(p=>p.life>0);
  }

  frame(t,speed,count){
    return Math.floor(t/speed)%count;
  }

  drawSprite(img,x,y,frame,fw,fh,w,h,flip=false){
    if(!img||!img.complete||!img.naturalWidth)return false;
    const maxFrames=Math.max(1,Math.floor(img.naturalWidth/fw));
    frame=frame%maxFrames;
    this.ctx.save();
    this.ctx.translate(x+(flip?w:0),y);
    this.ctx.scale(flip?-1:1,1);
    this.ctx.drawImage(img,frame*fw,0,fw,Math.min(fh,img.naturalHeight),0,0,w,h);
    this.ctx.restore();
    return true;
  }

  draw(t){
    const c=this.ctx;
    c.clearRect(0,0,1280,720);
    this.drawBackdrop(t);

    c.save();
    c.translate(-this.cameraX,0);
    this.drawGround(t);
    this.drawProps(t);
    this.drawCard(t);
    this.drawBeacon(t);
    this.drawEnemy(t);
    this.drawExit(t);
    this.drawRigsby(t);
    this.drawPlayer(t);
    this.drawParticles();
    c.restore();

    this.drawAtmosphere(t);
    if(t<this.introUntil)this.drawIntro(t);
    if(this.state.paused){
      c.fillStyle='rgba(7,5,20,.76)';
      c.fillRect(0,0,1280,720);
      this.text('PAUSED',640,360,64,'#fff','center');
    }
  }

  drawBackdrop(t){
    const img=this.images.home;
    if(img?.complete&&img.naturalWidth){
      this.ctx.drawImage(img,0,0,1280,720);
    }else{
      const g=this.ctx.createLinearGradient(0,0,0,720);
      g.addColorStop(0,'#4d2f86');
      g.addColorStop(.45,'#ff6b9d');
      g.addColorStop(1,'#f7bd73');
      this.ctx.fillStyle=g;
      this.ctx.fillRect(0,0,1280,720);
    }
    if(this.cameraX>900){
      const a=clamp((this.cameraX-900)/500,0,1);
      this.ctx.fillStyle=`rgba(26,18,52,${.55*a})`;
      this.ctx.fillRect(0,0,1280,720);
      this.ctx.fillStyle=`rgba(255,79,184,${.14*a})`;
      for(let i=0;i<10;i++){
        const x=i*150-(this.cameraX*.2%150);
        this.ctx.fillRect(x,260+(i%3)*45,90,360);
      }
    }
  }

  drawGround(t){
    const c=this.ctx;
    c.fillStyle='#8f553b';
    c.fillRect(0,this.floorY,this.worldWidth,100);
    c.strokeStyle='rgba(255,195,122,.36)';
    c.lineWidth=4;
    for(let x=0;x<this.worldWidth;x+=110){
      c.beginPath();
      c.moveTo(x,this.floorY);
      c.lineTo(x+55,720);
      c.stroke();
    }
    c.fillStyle='#275944';
    c.fillRect(1280,this.floorY-12,1270,112);
  }

  drawProps(t){
    const c=this.ctx;
    for(let i=0;i<7;i++){
      const x=1260+i*175;
      const h=120+(i%3)*38;
      c.fillStyle=i%2?'#263552':'#33254c';
      c.fillRect(x,this.floorY-h,110,h);
      c.fillStyle='rgba(255,224,93,.5)';
      for(let wy=this.floorY-h+25;wy<this.floorY-20;wy+=34){
        c.fillRect(x+18,wy,18,11);
        c.fillRect(x+65,wy,18,11);
      }
    }
    c.fillStyle='#ff4fb8';
    c.fillRect(1940,438,240,18);
    c.fillStyle='#3ce7d2';
    c.fillRect(1940,456,240,18);
    c.fillStyle='#ffe66d';
    c.fillRect(1940,474,240,18);
  }

  drawPlayer(t){
    const names=['will','daniel','caleb'];
    const name=names[this.state.dude];
    let anim='idle',frames=6,speed=150;
    if(this.player.animUntil>t)anim=this.player.anim;
    else if(!this.player.onGround){anim='jump';frames=4}
    else if(Math.abs(this.player.vx)>.35){anim='walk';frames=8;speed=84}
    const img=this.images[`${name}_${anim}`];
    const frame=this.frame(t,speed,frames);
    const x=this.player.x-20;
    const y=this.player.y-49;
    const alpha=this.player.invuln>0&&Math.floor(this.player.invuln/5)%2===0?.35:1;
    this.ctx.save();
    this.ctx.globalAlpha=alpha;
    this.ctx.fillStyle='rgba(10,5,30,.25)';
    this.ctx.beginPath();
    this.ctx.ellipse(this.player.x+22,this.floorY-2,30,8,0,0,Math.PI*2);
    this.ctx.fill();
    const ok=this.drawSprite(img,x,y,frame,128,192,84,126,this.player.facing<0);
    if(!ok)this.drawFallbackHero(this.player.x,this.player.y,DUDES[this.state.dude]);
    this.ctx.restore();
  }

  drawFallbackHero(x,y,dude){
    const c=this.ctx;
    c.fillStyle='#b87855';
    c.beginPath();c.arc(x+22,y+15,15,0,Math.PI*2);c.fill();
    c.fillStyle=dude.color;
    c.beginPath();c.roundRect(x+5,y+28,34,38,9);c.fill();
    c.fillStyle=dude.accent;
    c.fillRect(x+18,y+31,7,30);
    c.fillStyle='#241a35';
    c.fillRect(x+8,y+63,11,17);
    c.fillRect(x+26,y+63,11,17);
  }

  drawRigsby(t){
    const moving=Math.abs(this.rigsby.x-(this.player.x+120))>8;
    const state=moving?'walk':'idle';
    const frame=this.frame(t,moving?90:150,moving?8:6);
    const img=this.images[`rigsby_${state}`];
    this.ctx.fillStyle='rgba(10,5,30,.2)';
    this.ctx.beginPath();
    this.ctx.ellipse(this.rigsby.x+25,this.floorY-1,28,7,0,0,Math.PI*2);
    this.ctx.fill();
    if(!this.drawSprite(img,this.rigsby.x-10,this.rigsby.y-26,frame,128,96,76,57,false)){
      this.ctx.fillStyle='#fff';
      this.ctx.beginPath();this.ctx.ellipse(this.rigsby.x+25,this.rigsby.y+20,28,17,0,0,Math.PI*2);this.ctx.fill();
      this.ctx.fillStyle='#8b5c3d';
      this.ctx.beginPath();this.ctx.arc(this.rigsby.x+42,this.rigsby.y+10,12,0,Math.PI*2);this.ctx.fill();
    }
  }

  drawCard(t){
    if(this.card.collected)return;
    const y=this.card.y+Math.sin(t*.004)*7;
    this.ctx.save();
    this.ctx.shadowColor='#ffe66d';
    this.ctx.shadowBlur=22;
    this.ctx.fillStyle='#161128';
    this.ctx.beginPath();this.ctx.roundRect(this.card.x,y,this.card.w,this.card.h,7);this.ctx.fill();
    const colors=['#ff4b4b','#ff9f43','#ffe66d','#49d17d','#45a3ff','#a55cff'];
    colors.forEach((color,i)=>{
      this.ctx.fillStyle=color;
      this.ctx.fillRect(this.card.x+7,y+8+i*5,this.card.w-14,5);
    });
    this.ctx.restore();
  }

  drawBeacon(t){
    const c=this.ctx;
    const pulse=.8+.2*Math.sin(t*.006);
    c.save();
    c.translate(this.beacon.x+27,this.beacon.y+46);
    c.shadowColor=this.beacon.active?'#3ce7d2':'#b8a8c8';
    c.shadowBlur=this.beacon.active?35:14;
    c.fillStyle=this.beacon.active?'#3ce7d2':'#675a78';
    c.beginPath();
    c.moveTo(0,-45);c.lineTo(25,0);c.lineTo(0,45);c.lineTo(-25,0);c.closePath();c.fill();
    c.globalAlpha=this.beacon.active?.35*pulse:.12;
    c.scale(1.6*pulse,1.6*pulse);
    c.fill();
    c.restore();
  }

  drawEnemy(t){
    if(!this.enemy.alive)return;
    const c=this.ctx;
    c.save();
    c.fillStyle='rgba(10,5,30,.22)';
    c.beginPath();c.ellipse(this.enemy.x+25,this.floorY-2,29,8,0,0,Math.PI*2);c.fill();
    c.fillStyle='#b9aa98';
    c.beginPath();c.roundRect(this.enemy.x,this.enemy.y,this.enemy.w,this.enemy.h,11);c.fill();
    c.fillStyle='#fff';
    c.fillRect(this.enemy.x+9,this.enemy.y+15,10,9);
    c.fillRect(this.enemy.x+31,this.enemy.y+15,10,9);
    c.fillStyle='#111';
    c.fillRect(this.enemy.x+13,this.enemy.y+18,4,4);
    c.fillRect(this.enemy.x+35,this.enemy.y+18,4,4);
    c.fillStyle='#665a51';
    this.text('HOA',this.enemy.x+25,this.enemy.y+44,11,'#665a51','center');
    c.restore();
  }

  drawExit(t){
    const c=this.ctx;
    const open=this.beacon.active;
    c.save();
    c.translate(this.exit.x+75,this.exit.y+75);
    const pulse=1+Math.sin(t*.004)*.035;
    c.scale(pulse,pulse);
    c.strokeStyle=open?'#ff4fb8':'#776b83';
    c.lineWidth=15;
    c.shadowColor=open?'#ff4fb8':'transparent';
    c.shadowBlur=open?34:0;
    c.beginPath();c.arc(0,0,63,0,Math.PI*2);c.stroke();
    c.strokeStyle=open?'#3ce7d2':'#5b5268';
    c.lineWidth=8;
    c.beginPath();c.arc(0,0,43,0,Math.PI*2);c.stroke();
    c.fillStyle=open?'rgba(142,92,255,.28)':'rgba(50,45,60,.55)';
    c.beginPath();c.arc(0,0,36,0,Math.PI*2);c.fill();
    c.restore();
    this.text(open?'HILLCREST':'LOCKED',this.exit.x+75,this.exit.y-12,16,open?'#fff':'#aaa','center');
  }

  drawParticles(){
    for(const p of this.particles){
      this.ctx.globalAlpha=clamp(p.life/50,0,1);
      this.ctx.fillStyle=p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha=1;
  }

  drawAtmosphere(t){
    const c=this.ctx;
    const g=c.createRadialGradient(640,340,230,640,360,800);
    g.addColorStop(0,'rgba(0,0,0,0)');
    g.addColorStop(1,'rgba(8,5,20,.22)');
    c.fillStyle=g;
    c.fillRect(0,0,1280,720);
    for(let i=0;i<4;i++){
      const x=((i*390+t*.018)%1500)-100;
      const y=300+Math.sin(t*.002+i)*35;
      c.fillStyle=i%2?'rgba(255,79,184,.65)':'rgba(255,224,93,.65)';
      c.beginPath();c.ellipse(x,y,5,2.5,.5,0,Math.PI*2);c.fill();
    }
  }

  drawIntro(t){
    const remain=this.introUntil-t;
    const alpha=clamp(remain/450,0,1);
    this.ctx.save();
    this.ctx.globalAlpha=alpha;
    this.ctx.fillStyle='rgba(10,7,25,.72)';
    this.ctx.beginPath();this.ctx.roundRect(395,42,490,110,22);this.ctx.fill();
    this.text('ADVENTURE 1',640,83,16,'#3ce7d2','center');
    this.text('HOME BASE',640,126,42,'#fff','center');
    this.ctx.restore();
  }

  text(text,x,y,size,color,align='left'){
    this.ctx.font=`900 ${size}px system-ui,-apple-system,sans-serif`;
    this.ctx.textAlign=align;
    this.ctx.textBaseline='middle';
    this.ctx.fillStyle=color;
    this.ctx.fillText(text,x,y);
  }
}
