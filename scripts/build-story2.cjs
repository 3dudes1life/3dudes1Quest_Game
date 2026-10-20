// Build-time encoding only. Patch Scene 1; preserve every decoded pixel in the other five atlas panels.
const sharp=require('sharp'),fs=require('node:fs'),crypto=require('node:crypto');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const source='docs/origin-story-2/source/scenes.png',correctionSource='docs/origin-story-2/source/dominican-republic.png',file='assets/story2/scenes.webp';
 const previous=JSON.parse(fs.readFileSync('assets/story2/manifest.json'));
 const approved=await sharp(source).resize(1024,864,{kernel:'nearest'}).webp({nearLossless:true,quality:65,effort:6}).toBuffer();
 if(hash(approved)!=='39318a4f588ed0a3f23dbe19f1d9506fbcad208fa7433d20c9f27823908976e1')throw Error('Approved atlas rebuild changed');
 const panel=await sharp(correctionSource).resize(512,288,{fit:'cover',position:'centre',kernel:'nearest'}).png().toBuffer();
 await sharp(approved).composite([{input:panel,left:0,top:0}]).webp({lossless:true,effort:6}).toFile(file);
 const before=await sharp(approved).ensureAlpha().raw().toBuffer(),after=await sharp(file).ensureAlpha().raw().toBuffer();
 let changed=0;for(let y=0;y<864;y++)for(let x=0;x<1024;x++)for(let c=0;c<4;c++){const i=(y*1024+x)*4+c;if(before[i]!==after[i]){if(x>=512||y>=288)throw Error('Changed artwork outside Scene 1');changed++}}
 if(!changed)throw Error('Scene 1 did not change');
 const panelHashes=[];for(let i=0;i<6;i++){const region={left:i%2*512,top:Math.floor(i/2)*288,width:512,height:288};panelHashes.push({panel:i,before:hash(await sharp(approved).extract(region).ensureAlpha().raw().toBuffer()),after:hash(await sharp(file).extract(region).ensureAlpha().raw().toBuffer())})}
 fs.writeFileSync('assets/story2/manifest.json',JSON.stringify({...previous,correctionSource,correctionSourceBytes:fs.statSync(correctionSource).size,runtimeBytes:fs.statSync(file).size,sha256:hash(fs.readFileSync(file)),encoding:'Lossless composite over the approved decoded atlas; only panel 0 replaced',unchangedOtherPanels:true,panelHashes},null,2)+'\n');
 console.log(JSON.stringify({runtimeBytes:fs.statSync(file).size,changedChannels:changed,otherPanelsIdentical:panelHashes.slice(1).every(p=>p.before===p.after)},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
