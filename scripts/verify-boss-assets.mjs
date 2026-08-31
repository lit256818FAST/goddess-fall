import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const assets=[
  {
    key:'boss-odric',
    file:'public/assets/models/bosses/odric-judgment.glb',
    actions:{
      idle:['idle'],
      attack_health:['attack_health','attack'],
      attack_faith:['attack_faith','attack_health','attack','skill'],
      hit_health:['hit_health','hit'],
      death_health:['death_health','death'],
      boss_phase_2:['phase_transition','skill','attack'],
    },
  },
  {
    key:'boss-iron-bulwark',
    file:'public/assets/models/bosses/iron-bulwark.glb',
    actions:{
      idle:['idle','Idle'],
      attack_health:['attack_health','2H_Melee_Attack_Chop','1H_Melee_Attack_Chop'],
      attack_faith:['attack_faith','attack_health','Spellcast_Shoot','Spellcast_Raise'],
      hit_health:['hit_health','Hit_A','Block_Hit'],
      death_health:['death_health','Death_A','Death_B'],
      boss_phase_2:['phase_transition','Cheer','attack_health'],
    },
  },
  {
    key:'boss-veiled-avatar',
    file:'public/assets/models/bosses/veiled-avatar.glb',
    actions:{
      idle:['idle'],
      attack_health:['attack_health','attack_faith','attack'],
      attack_faith:['attack_faith','attack','skill'],
      hit_health:['hit_health','hit_faith','hit'],
      death_health:['death_health','death'],
      boss_phase_2:['phase_transition','skill','attack'],
    },
  },
];

let failures=0;
for(const asset of assets){
  const bytes=readFileSync(resolve(asset.file));
  if(bytes.subarray(0,4).toString()!=='glTF')throw new Error(`${asset.key}: invalid GLB header`);
  const jsonLength=bytes.readUInt32LE(12);
  const gltf=JSON.parse(bytes.subarray(20,20+jsonLength).toString('utf8').replace(/\u0000/g,''));
  const clips=new Set((gltf.animations??[]).map(clip=>clip.name));
  const missing=Object.entries(asset.actions).filter(([,names])=>!names.some(name=>clips.has(name))).map(([action])=>action);
  if(missing.length){
    failures++;
    process.stderr.write(`${asset.key}: missing clip coverage for ${missing.join(', ')}\n`);
  }else{
    process.stdout.write(`${asset.key}: PASS (${bytes.length} bytes, ${clips.size} clips)\n`);
  }
}
if(failures)process.exitCode=1;
