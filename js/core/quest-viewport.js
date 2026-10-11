/* 3.1.0: one viewport owner; rendering coordinates stay at 1280 × 720. */
(() => {
  'use strict';
  const root = document.documentElement;
  const app = document.querySelector('#app, #tahoeApp');
  if (!app) return;
  root.classList.add('quest-layout');
  const probe = document.createElement('div');
  probe.className = 'safeAreaProbe'; document.body.append(probe);
  const gate = document.createElement('section');
  gate.id = 'viewportPause'; gate.hidden = true;
  gate.setAttribute('role', 'dialog'); gate.setAttribute('aria-modal', 'true');
  gate.setAttribute('aria-labelledby', 'viewportPauseTitle');
  gate.innerHTML = '<div><h2 id="viewportPauseTitle">View adjusted · quest paused</h2><p>Your controls have been released. Continue when you’re comfortable.</p><button type="button" id="viewportResume">Continue</button></div>';
  document.body.append(gate);
  let previous, frame, recovery = null, focusBefore;
  let preferences = { size: 'standard', hand: 'right' };
  try { Object.assign(preferences, JSON.parse(localStorage.getItem('quest-controls') || '{}')); } catch (_) {}
  function applyPreferences() {
    if (!['small','standard','large'].includes(preferences.size)) preferences.size = 'standard';
    if (!['left','right'].includes(preferences.hand)) preferences.hand = 'right';
    root.dataset.controlHand = preferences.hand;
    root.dataset.controlSize = preferences.size;
  }
  applyPreferences();
  const settings = document.createElement('fieldset');
  settings.className = 'controlSettings';
  settings.innerHTML = '<legend>Touch controls</legend><label>Button size <select aria-label="Touch button size"><option value="small">Small</option><option value="standard">Standard</option><option value="large">Large</option></select></label><label>Movement side <select aria-label="Movement side"><option value="right">Left (default)</option><option value="left">Right (left-handed)</option></select></label>';
  const [size, hand] = settings.querySelectorAll('select');
  size.value = preferences.size; hand.value = preferences.hand;
  settings.addEventListener('change', () => {
    preferences = { size: size.value, hand: hand.value }; applyPreferences();
    try { localStorage.setItem('quest-controls', JSON.stringify(preferences)); } catch (_) {}
    schedule();
  });
  const panel = document.querySelector('#journal, #pauseMenu');
  panel.append(settings);
  const objectiveCopy = document.createElement('p'); objectiveCopy.className = 'pauseObjective';
  panel.append(objectiveCopy);
  const objective = document.querySelector('#objectiveCard, #objective');
  const copyObjective = () => { objectiveCopy.textContent = objective.textContent; };
  new MutationObserver(copyObjective).observe(objective, { childList:true, subtree:true, characterData:true });
  copyObjective();
  function interrupt() {
    const session = window.__QUEST_SESSION__;
    if (recovery || !session?.isActive()) return;
    focusBefore = document.activeElement;
    recovery = session.suspendViewport();
    app.inert = true; gate.hidden = false;
    gate.querySelector('button').focus({ preventScroll: true });
  }
  gate.querySelector('button').addEventListener('click', () => {
    const restore = recovery; recovery = null;
    gate.hidden = true; app.inert = false;
    restore?.();
    if (focusBefore?.isConnected) focusBefore.focus({ preventScroll: true });
  });
  function layout() {
    frame = null;
    const v = window.visualViewport;
    const w = v?.width || innerWidth, h = v?.height || innerHeight;
    const touch = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
    const portrait = h > w;
    // Toolbar changes only relayout; crossing orientation or changing width interrupts play.
    if (previous && (portrait !== previous.portrait || (touch && Math.abs(w - previous.w) > 80))) interrupt();
    previous = { w, h, portrait };
    root.classList.toggle('quest-touch', touch);
    root.classList.toggle('quest-portrait', portrait);
    root.classList.toggle('quest-compact', h < 500);
    root.classList.toggle('quest-rails', touch && !portrait);
    document.body.classList.toggle('touchDevice', touch);
    document.body.classList.toggle('portraitGame', touch && portrait);
    document.body.classList.toggle('landscapeGame', touch && !portrait);
    const css = getComputedStyle(probe);
    const safe = ['Top','Right','Bottom','Left'].map(edge => parseFloat(css['padding' + edge]) || 0);
    const width = Math.max(1, w - safe[1] - safe[3]), height = Math.max(1, h - safe[0] - safe[2]);
    const button = Math.min({small:48,standard:58,large:70}[preferences.size], Math.max(44, (width - 48) / 5));
    const top = touch ? (portrait ? 118 : 76) : 64;
    const rails = touch && !portrait;
    const bottom = rails ? 26 : button + 18;
    const rail = rails ? button * 2 + 18 : 0;
    const scale = Math.max(.01, Math.min(Math.max(1, width - rail * 2) / 1280, Math.max(1, height - top - bottom) / 720));
    const values = {
      'view-x': (v?.offsetLeft || 0) + safe[3], 'view-y': (v?.offsetTop || 0) + safe[0],
      'view-w': width, 'view-h': height, 'control-size': button,
      'world-w': 1280 * scale, 'world-h': 720 * scale,
      'world-x': (width - 1280 * scale) / 2,
      'world-y': top + Math.max(0, height - top - bottom - 720 * scale) / 2
    };
    for (const [key, value] of Object.entries(values)) root.style.setProperty('--' + key, value + 'px');
    root.dataset.displayMode = document.fullscreenElement ? 'fullscreen' : matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches ? 'installed' : 'browser';
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(layout); }
  addEventListener('resize', schedule, { passive: true });
  addEventListener('orientationchange', () => { interrupt(); schedule(); }, { passive: true });
  screen.orientation?.addEventListener('change', () => { interrupt(); schedule(); });
  document.addEventListener('fullscreenchange', () => { interrupt(); schedule(); });
  window.visualViewport?.addEventListener('resize', schedule, { passive: true });
  window.visualViewport?.addEventListener('scroll', schedule, { passive: true });
  matchMedia('(display-mode: standalone)').addEventListener('change', schedule);
  layout();
})();
