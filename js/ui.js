export function createUI(){
  const screens={
    title:document.getElementById('titleScreen'),
    help:document.getElementById('helpScreen'),
    game:document.getElementById('gameScreen'),
    complete:document.getElementById('completeScreen'),
    portal:document.getElementById('portalScreen')
  };
  const refs={
    dude:document.getElementById('hudDude'),
    health:document.getElementById('hudHealth'),
    cards:document.getElementById('hudCards'),
    beacons:document.getElementById('hudBeacons'),
    triangle:document.getElementById('hudTriangle'),
    routeFill:document.getElementById('routeProgressFill'),
    routeLabel:document.getElementById('routeLabel'),
    objectiveTitle:document.getElementById('objectiveTitle'),
    objectiveDetail:document.getElementById('objectiveDetail'),
    message:document.getElementById('message'),
    completeStats:document.getElementById('completeStats')
  };
  function show(name){
    Object.values(screens).forEach(s=>s.classList.remove('active'));
    screens[name].classList.add('active');
  }
  function flash(text){
    refs.message.textContent=text;
    refs.message.classList.add('show');
    clearTimeout(flash.timer);
    flash.timer=setTimeout(()=>refs.message.classList.remove('show'),1700);
  }
  function hud(state,dude){
    refs.dude.textContent=dude.name;
    refs.health.textContent=state.health;
    refs.cards.textContent=state.cards;
    refs.beacons.textContent=state.beacons;
    refs.triangle.textContent=Math.floor(state.triangle||0);
    const progress=Math.max(0,Math.min(100,((state.playerX||0)/4900)*100));
    refs.routeFill.style.width=`${progress}%`;
    const x=state.playerX||0;
    refs.routeLabel.textContent=x<650?'HOME':x<1600?'BEACH':x<2750?'PCH':x<3650?'HOLLYWOOD':x<4510?'LOS ANGELES':'BOSS';
    if(state.currentObjective){
      refs.objectiveTitle.textContent=state.currentObjective.title;
      refs.objectiveDetail.textContent=state.currentObjective.detail;
    }
  }
  return {screens,refs,show,flash,hud};
}
