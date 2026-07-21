
const once=(el,event,handler)=>el&&el.addEventListener(event,handler,{once:true});

document.addEventListener('DOMContentLoaded',()=>{
  document.documentElement.classList.add('remastered');

  const shell=document.querySelector('.gameShell');
  if(shell){
    shell.addEventListener('pointermove',(e)=>{
      const r=shell.getBoundingClientRect();
      shell.style.setProperty('--mx',`${((e.clientX-r.left)/r.width)*100}%`);
      shell.style.setProperty('--my',`${((e.clientY-r.top)/r.height)*100}%`);
    });
  }

  document.querySelectorAll('button').forEach(btn=>{
    btn.addEventListener('pointerdown',()=>btn.classList.add('isPressed'));
    btn.addEventListener('pointerup',()=>btn.classList.remove('isPressed'));
    btn.addEventListener('pointerleave',()=>btn.classList.remove('isPressed'));
  });
});
