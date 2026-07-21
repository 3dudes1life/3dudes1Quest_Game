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
  }
  return {screens,refs,show,flash,hud};
}
