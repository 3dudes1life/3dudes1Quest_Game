(() => {
  const VERSION='2.5.0';
  let deferredPrompt=null;
  const root=document.documentElement;
  root.classList.add('pwa-ready');

  function makeUI(){
    if(document.getElementById('pwaDock')) return;
    const dock=document.createElement('div'); dock.id='pwaDock'; dock.className='pwaDock';
    dock.innerHTML=`<button id="pwaShare" type="button" aria-label="Share 3Dudes1Quest">↗ <span>SHARE</span></button><button id="pwaInstall" type="button" aria-label="Add 3Dudes1Quest to Home Screen" hidden>＋ <span>INSTALL</span></button>`;
    document.body.appendChild(dock);
    document.getElementById('pwaShare').addEventListener('click',shareGame);
    document.getElementById('pwaInstall').addEventListener('click',installGame);
  }
  async function shareGame(){
    const data={title:'3Dudes1Quest',text:'Save Tahoe, defeat the Pine Beetle Queen, and open the portal to Alaska!',url:location.origin+location.pathname.replace(/[^/]*$/,'')};
    try{ if(navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(data.url); toast('GAME LINK COPIED'); } }catch(e){ if(e.name!=='AbortError') toast('SHARE CANCELLED'); }
  }
  async function installGame(){
    if(deferredPrompt){ deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt=null; document.getElementById('pwaInstall').hidden=true; return; }
    toast(/iphone|ipad|ipod/i.test(navigator.userAgent)?'TAP SHARE, THEN ADD TO HOME SCREEN':'OPEN BROWSER MENU, THEN INSTALL APP',5500);
  }
  function toast(text,time=2600){
    let el=document.getElementById('pwaToast'); if(!el){ el=document.createElement('div');el.id='pwaToast';el.className='pwaToast';document.body.appendChild(el); }
    el.textContent=text;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),time);
  }
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;const b=document.getElementById('pwaInstall');if(b)b.hidden=false;});
  window.addEventListener('appinstalled',()=>toast('3DUDES1QUEST INSTALLED'));

  async function register(){
    if(!('serviceWorker' in navigator)) return;
    try{
      const reg=await navigator.serviceWorker.register('./service-worker.js',{scope:'./',updateViaCache:'none'});
      const check=()=>reg.update().catch(()=>{});
      check(); setInterval(check,30*60*1000);
      document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check();});
      let refreshing=false;
      navigator.serviceWorker.addEventListener('controllerchange',()=>{ if(refreshing)return; refreshing=true; location.reload(); });
      reg.addEventListener('updatefound',()=>{ const worker=reg.installing; if(!worker)return; worker.addEventListener('statechange',()=>{ if(worker.state==='installed' && navigator.serviceWorker.controller){ toast('NEW VERSION READY — UPDATING…'); worker.postMessage({type:'SKIP_WAITING'}); } }); });
    }catch(e){ console.warn('PWA registration failed',e); }
  }
  document.addEventListener('DOMContentLoaded',()=>{makeUI();register();});
})();
