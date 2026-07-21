export const SOCAL_LEVEL = {
  name: 'Southern California',
  next: 'Lake Tahoe',
  platforms: [
    {x:0,y:620,w:930,h:100,type:'sand'},
    {x:970,y:610,w:430,h:110,type:'boardwalk'},
    {x:1440,y:590,w:780,h:130,type:'city'},
    {x:2260,y:620,w:860,h:100,type:'suburb'},
    {x:3160,y:600,w:730,h:120,type:'freeway'},
    {x:3930,y:620,w:1040,h:100,type:'hills'},
    {x:330,y:505,w:180,h:24,type:'pier'},
    {x:570,y:430,w:165,h:24,type:'pier'},
    {x:1060,y:485,w:180,h:24,type:'neon'},
    {x:1300,y:405,w:165,h:24,type:'neon'},
    {x:1660,y:470,w:195,h:24,type:'roof'},
    {x:1930,y:390,w:195,h:24,type:'roof'},
    {x:2390,y:500,w:175,h:24,type:'lawn'},
    {x:2660,y:420,w:195,h:24,type:'lawn'},
    {x:3310,y:470,w:205,h:24,type:'sign'},
    {x:3610,y:395,w:185,h:24,type:'sign'},
    {x:4090,y:500,w:185,h:24,type:'rock'},
    {x:4400,y:420,w:175,h:24,type:'rock'},
    {x:1520,y:315,w:130,h:20,type:'roof'},
    {x:1740,y:260,w:130,h:20,type:'roof'},
    {x:1960,y:300,w:130,h:20,type:'roof'},
    {x:2910,y:330,w:125,h:20,type:'sign'},
    {x:3090,y:275,w:125,h:20,type:'sign'},
    {x:4270,y:325,w:120,h:20,type:'rock'}
  ],
  cards: [
    {x:400,y:450},{x:1120,y:430},{x:1730,y:415},
    {x:2720,y:365},{x:3670,y:340},{x:4460,y:365}
  ],
  beacons: [
    {x:790,y:550},{x:2080,y:330},{x:3510,y:410}
  ],
  enemies: [
    {x:730,y:570,type:'troll'},{x:1190,y:560,type:'scooter'},
    {x:1560,y:540,type:'beigeBot'},{x:2010,y:340,type:'troll'},
    {x:2490,y:560,type:'hoaDrone'},{x:2860,y:560,type:'beigeBot'},
    {x:3400,y:420,type:'scooter'},{x:3720,y:345,type:'hoaDrone'},
    {x:4200,y:560,type:'beigeBot'}
  ],
  npcs: [
    {
      x:610,y:550,name:'Neighbor',
      line:'The whole neighborhood turned beige overnight. Even the flamingos look emotionally unavailable.'
    },
    {
      x:1260,y:550,name:'Hillcrest Local',
      line:'She drained the rainbow crosswalk first. Honestly, that felt personal.'
    },
    {
      x:1900,y:520,name:'Café Regular',
      line:'The Beige Brigade shut down brunch. This is officially a crisis.'
    },
    {
      x:2870,y:550,name:'Coastal Local',
      line:'PCH is blocked ahead. Restore the Prism Beacon and bring the ocean color back.'
    },
    {
      x:4050,y:550,name:'LA Local',
      line:'She took the murals and the skyline. Please make Los Angeles loud again.'
    }
  ],
  selfieSpots:[
    {x:1480,y:520,title:'Hillcrest Rainbow Crosswalk',icon:'🌈'},
    {x:2860,y:520,title:'Pacific Coast Slay',icon:'🌊'},
    {x:4020,y:520,title:'Los Angeles in Color',icon:'🎬'}
  ],
  chaosBowls:[
    {x:3360,y:535,title:'Super Jump Chaos',modifier:'superJump'}
  ],
  boss: {x:4720,y:505,w:120,h:115,hp:18}
};
