"use strict";

(function goldMasterSelfTest(){
  function run(){
    const checks=[];
    const add=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});
    const game=window.__questGame;
    const release=window.__QUEST_RELEASE__;
    const canvas=document.getElementById('gameCanvas');
    const powerLabel=document.getElementById('powerLabel');

    add('Gold Master title',document.title.includes('v1.0.9'),document.title);
    add('Release metadata',release?.version==='1.0.9',release?.version||'missing');
    add('Three playable dudes',release?.dudeCount===3,String(release?.dudeCount));
    add('Three power identities',Array.isArray(release?.powers)&&release.powers.length===3);
    add('Game object created',Boolean(game));
    add('Canvas resolution',canvas?.width===1280&&canvas?.height===720,`${canvas?.width}×${canvas?.height}`);
    add('Universal POWER label',powerLabel?.textContent?.trim()==='POWER',powerLabel?.textContent||'missing');
    add('Power method',typeof game?.power==='function');
    add('Character switch method',typeof game?.switchDude==='function');
    add('Triangle ultimate method',typeof game?.useTriangleUltimate==='function');
    add('Portal completion method',typeof game?.checkPortal==='function');
    add('Save method',typeof game?.save==='function');
    add('Load method',typeof game?.applySave==='function');
    add('Five touch controls',document.querySelectorAll('#touchControls button').length===5,String(document.querySelectorAll('#touchControls button').length));

    try{
      const snapshot=game?.save?.();
      const encoded=JSON.stringify(snapshot);
      add('Save serializes',Boolean(encoded&&encoded.length>100),`${encoded?.length||0} bytes`);
      add('Save version',snapshot?.version==='1.0.9',snapshot?.version||'missing');
      add('Save schema',snapshot?.schema===2,String(snapshot?.schema));
      add('Finale state saved',Boolean(snapshot?.finale&&'complete' in snapshot.finale));
      add('Portal state saved',Boolean(snapshot?.portal&&'open' in snapshot.portal));
    }catch(error){
      add('Save serializes',false,error.message);
    }

    try{
      const testKey='3dudes1quest-gold-master-storage-test';
      localStorage.setItem(testKey,'ok');
      const readable=localStorage.getItem(testKey)==='ok';
      localStorage.removeItem(testKey);
      add('Local storage writable',readable);
    }catch(error){
      add('Local storage writable',false,error.message);
    }

    const passed=checks.filter(check=>check.pass).length;
    const report={
      release:'1.0.9',
      passed,
      total:checks.length,
      ok:passed===checks.length,
      checks,
      generatedAt:new Date().toISOString()
    };

    window.__GOLD_MASTER_QA__=report;
    document.documentElement.dataset.goldMasterQa=report.ok?'pass':'fail';
    document.documentElement.dataset.goldMasterQaScore=`${passed}/${checks.length}`;

    if(report.ok)console.info('3Dudes1Quest Gold Master QA PASS',report);
    else console.error('3Dudes1Quest Gold Master QA FAIL',report);

    if(new URLSearchParams(location.search).has('qa')){
      document.getElementById('goldMasterQaPanel')?.remove();
      const panel=document.createElement('section');
      panel.id='goldMasterQaPanel';
      panel.setAttribute('aria-live','polite');
      Object.assign(panel.style,{
        position:'fixed',zIndex:'20000',left:'12px',right:'12px',bottom:'12px',
        maxHeight:'45vh',overflow:'auto',padding:'14px',borderRadius:'18px',
        color:'#fff',font:'700 12px/1.4 system-ui,-apple-system,sans-serif',
        background:'rgba(12,8,31,.96)',border:`2px solid ${report.ok?'#3ce7d2':'#ff6b8a'}`,
        boxShadow:'0 18px 60px rgba(0,0,0,.55)'
      });
      panel.innerHTML=`
        <button type="button" aria-label="Close QA report" style="float:right;background:#3d3269;color:#fff;padding:7px 10px;border:0;border-radius:10px;font-weight:900">✕</button>
        <strong style="display:block;font-size:16px;margin-bottom:7px">Gold Master QA ${report.ok?'PASS':'FAIL'} • ${passed}/${checks.length}</strong>
        ${checks.map(check=>`<div>${check.pass?'✅':'❌'} ${check.name}${check.detail?` <small style="opacity:.7">${check.detail}</small>`:''}</div>`).join('')}
      `;
      panel.querySelector('button').onclick=()=>panel.remove();
      document.body.appendChild(panel);
    }

    return report;
  }

  window.runGoldMasterQA=run;
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>setTimeout(run,80),{once:true});
  }else{
    setTimeout(run,80);
  }
})();
