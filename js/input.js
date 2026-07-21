export function createInput(onSwitch){
  const keys={left:false,right:false,jump:false,power:false};
  const map=(key,val)=>{
    if(['ArrowLeft','a','A'].includes(key)) keys.left=val;
    if(['ArrowRight','d','D'].includes(key)) keys.right=val;
    if(['ArrowUp','w','W',' '].includes(key)) keys.jump=val;
    if(['x','X','f','F'].includes(key)) keys.power=val;
  };
  addEventListener('keydown',e=>{
    map(e.key,true);
    if(['ArrowUp','w','W',' '].includes(e.key)) e.preventDefault();
    if(e.key==='1') onSwitch(0);
    if(e.key==='2') onSwitch(1);
    if(e.key==='3') onSwitch(2);
  });
  addEventListener('keyup',e=>map(e.key,false));

  document.querySelectorAll('[data-action]').forEach(btn=>{
    const action=btn.dataset.action;
    const set=v=>e=>{e.preventDefault();keys[action]=v;};
    btn.addEventListener('pointerdown',set(true));
    btn.addEventListener('pointerup',set(false));
    btn.addEventListener('pointercancel',set(false));
    btn.addEventListener('pointerleave',set(false));
  });
  return keys;
}
