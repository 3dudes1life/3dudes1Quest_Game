/* Adventure data only. Simulation and presentation live in QuestAdventure. */
window.AlaskaWorld=Object.freeze({
 id:'alaska',name:'Alaska',subtitle:'The Aurora Return',saveKey:'3dudes1quest_alaska_v340',length:7600,floor:620,
 music:'alaska',bossMusic:'alaskaBoss',bossName:'FROST QUEEN',bossX:7000,
 opening:'Tahoe is safe, but the northern lights have gone dark. The Frost Queen controls blizzards and has cursed the salmon! Restore three Aurora Relays, then break her ice shield. Caleb has prepared a strongly worded cookie.',
 ending:'The aurora returns. The Frost Queen’s curse breaks. Salmon return to normal and the northern lights shine in rainbow colors. Rigsby celebrates with snow zoomies; Zoey retrieves the trail keeper’s satchel. Beyond the portal: Costa Rica, where Caleb hopes the cookies will finally stay warm.',
 sections:[{x:0,name:'Trail Station'},{x:2400,name:'Frozen River'},{x:4400,name:'Glacier Pass'},{x:6200,name:'Aurora Ridge'}],
 relays:[{x:1150,name:'Trail Relay'},{x:3850,name:'River Relay'},{x:5900,name:'Ridge Relay'}],
 checkpoints:[{x:2450,name:'River Shelter',line:'Rigsby: Thin ice ahead! The blue stepping ledges are safer than a surprise bath.'},{x:4800,name:'Glacier Shelter',line:'Zoey found a supply cache above the glacier. Daniel: Finally, a heartwarming discovery.'},{x:6320,name:'Aurora Shelter',line:'Will: Three relays, one sarcastic ice queen. Watch snowball warnings, dodge the icicle markers, and break her shield with any power.'}],
 platforms:[{x:520,y:530,w:220},{x:850,y:450,w:180},{x:1450,y:530,w:220},{x:1750,y:450,w:200},{x:2750,y:540,w:190},{x:3010,y:480,w:210},{x:3320,y:540,w:190},{x:4450,y:540,w:180},{x:4700,y:460,w:210},{x:5000,y:380,w:220},{x:5300,y:460,w:190},{x:5560,y:540,w:190}],
 ice:[{x:2750,w:460},{x:5200,w:300}],
 shards:[{x:600,y:500},{x:930,y:420},{x:1520,y:500},{x:1810,y:420},{x:2810,y:510},{x:3100,y:450},{x:3380,y:510},{x:4510,y:510},{x:4810,y:430},{x:5090,y:350},{x:5360,y:430},{x:5630,y:510}],
 caches:[{x:990,y:420},{x:5140,y:350}],
 enemies:[{x:760,type:'salmon'},{x:1600,type:'salmon'},{x:2120,type:'owl'},{x:2600,type:'salmon'},{x:3020,y:480,type:'salmon'},{x:3100,y:480,type:'salmon'},{x:3540,type:'salmon'},{x:4160,type:'salmon'},{x:4560,type:'owl'},{x:5550,type:'salmon'},{x:6060,type:'salmon'}]
});
