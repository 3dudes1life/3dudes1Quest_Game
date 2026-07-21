export function createInput(onSwitch){
  const keys={left:false,right:false,jump:false,power:false};

  const setKey=(key,value)=>{
    if(['ArrowLeft','a','A'].includes(key))keys.left=value;
    if(['ArrowRight','d','D'].includes(key))keys.right=value;
    if(['ArrowUp','w','W',' '].includes(key))keys.jump=value;
    if(['x','X','f','F'].includes(key))keys.power=value;
  };

  window.addEventListener('keydown',event=>{
    if(['ArrowLeft','ArrowRight','ArrowUp',' ','a','A','d','D','w','W','x','X','f','F'].includes(event.key)){
      event.preventDefault();
    }
    setKey(event.key,true);
    if(event.key==='1')onSwitch(0);
    if(event.key==='2')onSwitch(1);
    if(event.key==='3')onSwitch(2);
  },{passive:false});

  window.addEventListener('keyup',event=>setKey(event.key,false));
  window.addEventListener('blur',()=>{
    keys.left=keys.right=keys.jump=keys.power=false;
  });

  document.querySelectorAll('[data-action]').forEach(button=>{
    const action=button.dataset.action;
    const set=value=>event=>{
      event.preventDefault();
      keys[action]=value;
    };
    button.addEventListener('pointerdown',set(true),{passive:false});
    button.addEventListener('pointerup',set(false),{passive:false});
    button.addEventListener('pointercancel',set(false),{passive:false});
    button.addEventListener('pointerleave',set(false),{passive:false});
    button.addEventListener('contextmenu',event=>event.preventDefault());
  });
  return keys;
}
