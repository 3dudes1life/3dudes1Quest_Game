/* Original 3Dudes1Quest compositions. MIDI pitches, eighth-note steps, no sampled music. */
(() => {
  'use strict';
  const phrase = rows => rows.flatMap(row => row.split(' ').map(Number));
  const songs = {
    title: {name:'Three Dudes, One Quest', bpm:116, roots:[48,53,57,55,48,53,55,48], melody:phrase([
      '67 72 76 74 69 67 0 72','69 72 77 76 72 69 0 65','69 76 79 76 72 71 69 0','67 71 74 77 76 74 71 0',
      '72 0 76 79 74 76 72 67','69 72 77 0 76 72 69 65','71 74 77 74 79 77 74 71','76 74 72 67 72 0 0 0'])},
    socal: {name:'Sunshine Sidequest', bpm:144, roots:[48,57,53,55,48,53,50,55], melody:phrase([
      '76 79 72 0 74 76 67 72','76 72 69 72 81 79 76 0','77 76 72 69 72 77 81 77','74 71 67 71 79 77 74 0',
      '79 76 72 74 76 0 84 79','81 77 72 77 76 72 69 0','74 77 81 77 76 74 69 74','71 74 79 0 77 74 71 67'])},
    tahoe: {name:'Pines Above the Lake', bpm:126, roots:[45,50,53,52,45,53,50,52], melody:phrase([
      '69 0 76 72 74 71 69 0','74 77 76 74 69 0 65 69','72 77 81 79 77 76 72 0','71 68 64 68 76 74 71 0',
      '81 76 72 69 71 72 76 0','77 0 81 84 79 77 76 72','74 69 65 69 77 76 74 0','71 76 74 71 68 0 64 68'])},
    boss: {name:'No Beige Allowed', bpm:172, roots:[45,45,41,52,45,48,50,52], melody:phrase([
      '69 76 69 72 71 76 71 68','69 72 76 79 78 76 72 71','65 72 65 69 68 72 68 64','68 71 76 77 76 71 68 64',
      '81 76 72 76 81 79 76 72','79 76 72 67 72 74 76 79','77 74 69 74 77 76 74 69','76 74 71 68 71 76 80 83'])},
    victory: {name:'Color Comes Home', bpm:132, once:true, roots:[48,53,55,48], melody:phrase([
      '72 76 79 0 79 81 84 0','81 77 72 77 81 0 84 0','83 79 74 79 86 84 83 79','84 0 0 0 0 0 0 0'])}
  };
  // [wave, start Hz, end Hz, duration seconds, delay seconds, amplitude]
  const tone=(wave,from,to,duration,delay=0,amp=.15)=>[wave,from,to,duration,delay,amp];
  const effects = {
    jump:[tone('pulse',220,660,.13)], land:[tone('noise',180,80,.045,0,.08)],
    card:[tone('square',660,660,.08),tone('square',880,880,.13,.09)],
    beacon:[tone('triangle',440,440,.12),tone('pulse',660,660,.12,.12),tone('pulse',880,1320,.22,.24)],
    switch:[tone('triangle',392,523,.08),tone('triangle',784,784,.09,.08)],
    ricochet:[tone('square',600,1200,.075),tone('triangle',960,720,.07,.065)],
    heart:[tone('triangle',330,660,.18),tone('pulse',660,660,.12,.12,.08)],
    heartPop:[tone('triangle',523,1046,.17),tone('noise',900,200,.09,0,.06)],
    cookie:[tone('pulse',190,90,.12),tone('noise',150,60,.07,.10,.09)],
    hit:[tone('noise',800,220,.065),tone('square',180,100,.05,0,.07)],
    defeat:[tone('square',440,220,.07),tone('triangle',660,880,.13,.07)],
    damage:[tone('square',260,80,.18),tone('noise',900,120,.12,0,.09)],
    checkpoint:[tone('triangle',523,523,.11),tone('square',659,659,.11,.12),tone('triangle',784,784,.22,.24)],
    triangle:[tone('pulse',220,880,.30),tone('triangle',660,1320,.28,.20),tone('noise',1400,200,.15,.40,.08)],
    bossAppear:[tone('square',110,110,.14),tone('square',147,147,.14,.17),tone('pulse',208,208,.28,.34)],
    bossHit:[tone('noise',1600,180,.09),tone('pulse',220,110,.12)],
    bossDefeat:[tone('noise',1000,100,.23),tone('triangle',220,880,.35,.12)],
    menu:[tone('triangle',740,988,.045,0,.09)], save:[tone('triangle',659,659,.075),tone('triangle',988,988,.12,.085)],
    secret:[tone('pulse',880,880,.08),tone('triangle',1175,1175,.10,.09),tone('pulse',1568,1568,.17,.20)],
    portal:[tone('triangle',330,990,.35),tone('pulse',660,1320,.28,.20,.08)],
    nest:[tone('noise',600,80,.16),tone('square',330,110,.16,.04)],
    memory:[tone('triangle',440,440,.12),tone('triangle',554,554,.12,.12),tone('triangle',830,830,.25,.24)],
    warning:[tone('pulse',440,440,.075),tone('pulse',440,440,.075,.14)],
    gameOver:[tone('triangle',523,523,.16),tone('triangle',494,494,.16,.18),tone('pulse',392,392,.23,.36),tone('triangle',262,294,.32,.62)],
    combo:[tone('triangle',440,880,.20),tone('square',880,1320,.18,.16,.09)]
  };
  const midi=n=>440*2**((n-69)/12);
  // Three tonal voices plus short noise percussion. The last step joins the first on the same clock.
  function notes(song,index){
    const i=index%song.melody.length, root=song.roots[Math.floor(i/8)], step=30/song.bpm;
    const notes=[],lead=song.melody[i];
    if(lead)notes.push(tone('pulse',midi(lead),midi(lead),step*(song.melody[i+1]===0?1.8:.78),0,.105));
    if(i%2===0)notes.push(tone('triangle',midi(root+(i%8===4?7:0)),midi(root+(i%8===4?7:0)),step*1.65,0,.17));
    if(i%2===1){const note=root+12+[0,7,12,7][Math.floor(i%8/2)];notes.push(tone('square',midi(note),midi(note),step*.38,0,.035))}
    if(!song.once||i<24)notes.push(tone('noise',i%4===0?120:1800,i%4===0?60:900,i%4===0?.055:.025,0,i%4===0?.045:.018));
    return notes;
  }
  window.QuestScore=Object.freeze({songs:Object.freeze(songs),effects:Object.freeze(effects),notes});
})();
