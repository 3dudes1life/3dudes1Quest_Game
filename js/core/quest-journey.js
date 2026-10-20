/* Shared route metadata; three adventures share one connected route. */
(() => {
  'use strict';
  const worlds=Object.freeze([
    {id:'socal',name:'Southern California',url:'index.html'},
    {id:'tahoe',name:'Lake Tahoe',url:'tahoe.html'},
    {id:'alaska',name:'Alaska',url:'alaska.html'}, {id:'hawaii',name:'Hawaii'}, {id:'costa-rica',name:'Costa Rica'}
  ].map(Object.freeze));
  const key='3dudes1quest_journey';
  let completed=QuestRuntime.readSave(key)||{};
  // Migrate badges from existing campaign saves without rewriting those saves.
  if(QuestRuntime.readSave('3dudes1quest-save-109')?.state?.adventureComplete)completed.socal=true;
  if(QuestRuntime.readSave('3dudes1quest_tahoe_v250')?.bossDefeated)completed.tahoe=true;
  if(QuestRuntime.readSave('3dudes1quest_alaska_v340')?.bossDefeated)completed.alaska=true;
  function complete(id){QuestSurvival.complete(id);if(!worlds.some(w=>w.id===id&&w.url))return;completed[id]=true;QuestRuntime.writeSave(key,completed);render()}
  function render(){
    document.querySelectorAll('.journeyRoute').forEach(el=>el.remove());
    const current=document.querySelector('[data-world]')?.dataset.world||(document.querySelector('#tahoeApp')?'tahoe':'socal');
    for(const panel of document.querySelectorAll('#journal,#pauseMenu,#titleScreen .card,#openingCard')){
      const route=document.createElement('ol');route.className='journeyRoute';route.setAttribute('aria-label','Five-world quest');
      for(const [i,world] of worlds.entries()){
        const item=document.createElement('li');if(world.id===current)item.setAttribute('aria-current','step');
        const label=document.createElement(world.url?'a':'span');label.textContent=`${i+1}. ${world.name}`;
        if(world.url)label.href=world.url;
        const status=document.createElement('small');status.textContent=completed[world.id]?'CLEARED':world.url?(world.id===current?'YOU ARE HERE':'PLAYABLE'):'COMING SOON';
        item.append(label,status);route.append(item);
      }
      panel.append(route);
    }
  }
  function next(id){const index=worlds.findIndex(w=>w.id===id);return index>=0?worlds[index+1]||null:null}
  window.QuestJourney=Object.freeze({worlds,complete,next});
  document.addEventListener('DOMContentLoaded',render);
})();
