
(function(){
  function init(){
    document.documentElement.classList.add('remastered');
    document.querySelectorAll('button').forEach(button=>{
      button.addEventListener('pointerdown',()=>button.classList.add('isPressed'));
      button.addEventListener('pointerup',()=>button.classList.remove('isPressed'));
      button.addEventListener('pointerleave',()=>button.classList.remove('isPressed'));
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
