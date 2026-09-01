import {existsSync,readdirSync,statSync,readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';

const publicRoot=resolve('public');
const required=[
  ...['unflagged','seraphina','reina','odric','cole','agnes'].map(id=>`assets/models/heroes/${id}.glb`),
  'assets/models/enemies/cultist-melee.glb',
  ...['odric-judgment','iron-bulwark','veiled-avatar'].map(id=>`assets/models/bosses/${id}.glb`),
  'assets/models/environment/shenghui/manifest.json',
  'assets/models/environment/anvil-frontier/manifest.json',
  'assets/models/environment/veil-sanctum/manifest.json',
];
const missing=required.filter(path=>!existsSync(join(publicRoot,path)));
if(missing.length)throw new Error(`Missing required season assets:\n${missing.join('\n')}`);

function totalBytes(dir){return readdirSync(dir,{withFileTypes:true}).reduce((sum,item)=>sum+(item.isDirectory()?totalBytes(join(dir,item.name)):statSync(join(dir,item.name)).size),0)}
const bytes=totalBytes(publicRoot);
const lazyMusicRoot=join(publicRoot,'assets','audio','music-lazy');
const lazyMusicBytes=existsSync(lazyMusicRoot)?totalBytes(lazyMusicRoot):0;
const lazyImageRoot=join(publicRoot,'assets','images-lazy');
const lazyImageBytes=existsSync(lazyImageRoot)?totalBytes(lazyImageRoot):0;
const initialBytes=bytes-lazyMusicBytes-lazyImageBytes;
const mb=bytes/1024/1024,initialMb=initialBytes/1024/1024;
if(initialBytes>20*1024*1024)throw new Error(`First-playable public asset budget exceeded: ${initialMb.toFixed(2)}MB > 20MB`);
const formalCount=required.filter(path=>path.endsWith('.glb')).length;
if(formalCount<4)throw new Error('Need at least four formal GLB assets');
for(const chapter of ['shenghui','anvil-frontier','veil-sanctum']){
  const manifestPath=join(publicRoot,`assets/models/environment/${chapter}/manifest.json`);
  const entries=JSON.parse(readFileSync(manifestPath,'utf8'));
  if(!Array.isArray(entries)||entries.length===0)throw new Error(`${chapter}: empty environment manifest`);
  for(const entry of entries){
    const sourceChapter=entry.sharedFrom??chapter;
    const modelPath=join(publicRoot,`assets/models/environment/${sourceChapter}`,entry.file);
    if(!existsSync(modelPath))throw new Error(`${chapter}: missing ${entry.file}`);
    const header=readFileSync(modelPath).subarray(0,4).toString();
    if(header!=='glTF')throw new Error(`${chapter}: invalid GLB header for ${entry.file}`);
  }
}
const heroActions=['idle','move','attack_health','attack_faith','hit_health','hit_faith','death_health','death_faith','skill'];
for(const hero of ['unflagged','seraphina','reina','odric','cole','agnes']){
  const bytes=readFileSync(join(publicRoot,`assets/models/heroes/${hero}.glb`));
  if(bytes.subarray(0,4).toString()!=='glTF')throw new Error(`${hero}: invalid GLB header`);
  const jsonLength=bytes.readUInt32LE(12);
  const gltf=JSON.parse(bytes.subarray(20,20+jsonLength).toString('utf8').replace(/\0/g,''));
  const clips=new Set((gltf.animations??[]).map(clip=>clip.name));
  const missing=heroActions.filter(action=>!clips.has(action));
  if(missing.length)throw new Error(`${hero}: missing formal action clips ${missing.join(', ')}`);
}
process.stdout.write(`season-assets: PASS (${formalCount} formal GLB entries, six heroes × ${heroActions.length} action tracks, ${initialMb.toFixed(2)}MB initial + ${mb.toFixed(2)}MB full public assets)\n`);
