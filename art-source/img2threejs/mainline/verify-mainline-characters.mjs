import fs from 'node:fs/promises';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { AnimationMixer } from 'three';

const loader = new GLTFLoader();
const ids = ['arthur', 'hans', 'asnoka'];
const report = [];
for (const id of ids) {
  const bytes = await fs.readFile(`public/assets/models/mainline/${id}.glb`);
  const gltf = await new Promise((resolve, reject) => loader.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '', resolve, reject));
  const named = []; let meshes = 0; let triangles = 0;
  gltf.scene.traverse((object) => {
    if (object.name) named.push(object.name);
    if (object.isMesh) { meshes += 1; const index = object.geometry.index; triangles += index ? index.count / 3 : object.geometry.attributes.position.count / 3; }
  });
  const mixer = new AnimationMixer(gltf.scene);
  const clipInfo = gltf.animations.map((clip) => { const action = mixer.clipAction(clip); action.play(); mixer.update(Math.min(clip.duration, 0.12)); return { name: clip.name, tracks: clip.tracks.length, duration: Number(clip.duration.toFixed(3)) }; });
  const clips = clipInfo.map((clip) => clip.name);
  const required = ['CharacterRoot', 'Armature', 'HeadAnchor', 'WeaponAnchor', 'HitAnchor', 'FootAnchor', 'Root', 'Hips', 'Spine2', 'Weapon', 'Prop'];
  const missing = required.filter((name) => !named.includes(name));
  const box = new THREE.Box3().setFromObject(gltf.scene); const scale = id === 'hans' ? 0.74 : id === 'asnoka' ? 0.76 : 0.76;
  report.push({ id, bytes: bytes.length, meshes, triangles, boneCount: named.filter((name) => ['Root','Hips','Spine','Spine2','Neck','Head','Shoulder_L','Arm_L','Forearm_L','Hand_L','Shoulder_R','Arm_R','Forearm_R','Hand_R','Leg_L','Shin_L','Foot_L','Toe_L','Leg_R','Shin_R','Foot_R','Toe_R','Cloak_L','Cloak_R','Weapon','Prop'].includes(name)).length, rawBounds: { minY: Number(box.min.y.toFixed(3)), maxY: Number(box.max.y.toFixed(3)), height: Number((box.max.y - box.min.y).toFixed(3)) }, runtimeBounds: { minY: Number((box.min.y * scale).toFixed(3)), maxY: Number((box.max.y * scale).toFixed(3)), height: Number(((box.max.y - box.min.y) * scale).toFixed(3)), visualScale: scale }, clipCount: clips.length, clips: clipInfo, missing, pass: missing.length === 0 && clips.length === 9 && clipInfo.every((clip) => clip.tracks > 0) && triangles > 1000 && box.min.y >= -0.01 });
}
{
  const bytes = await fs.readFile('public/assets/models/mainline/boss-white-knight.glb');
  const gltf = await new Promise((resolve, reject) => loader.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '', resolve, reject));
  const named = []; let meshes = 0; let triangles = 0;
  gltf.scene.traverse((object) => { if (object.name) named.push(object.name); if (object.isMesh) { meshes += 1; triangles += object.geometry.index ? object.geometry.index.count / 3 : object.geometry.attributes.position.count / 3; } });
  report.push({ id: 'boss-white-knight', bytes: bytes.length, meshes, triangles, phaseNodes: ['Phase1Parts','Phase2Parts'].filter((name) => named.includes(name)), clipCount: gltf.animations.length, clips: gltf.animations.map((clip) => ({ name: clip.name, tracks: clip.tracks.length, duration: Number(clip.duration.toFixed(3)) })), pass: named.includes('Phase1Parts') && named.includes('Phase2Parts') && gltf.animations.some((clip) => clip.name === 'phase_transition' && clip.tracks.length > 0) });
}
for (const id of ['boss-night-judge','boss-lake-god-a','boss-lake-god-b']) {
  const bytes = await fs.readFile(`public/assets/models/mainline/${id}.glb`); const gltf = await new Promise((resolve, reject) => loader.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '', resolve, reject)); const named=[]; let meshes=0; let triangles=0; gltf.scene.traverse((o)=>{if(o.name) named.push(o.name); if(o.isMesh) { meshes++; triangles += o.geometry.index ? o.geometry.index.count/3 : o.geometry.attributes.position.count/3; }}); const clips=gltf.animations.map(c=>({name:c.name,tracks:c.tracks.length,duration:Number(c.duration.toFixed(3))})); report.push({id,bytes:bytes.length,meshes,triangles,phaseNodes:['Phase1Parts','Phase2Parts'].filter(n=>named.includes(n)),clipCount:clips.length,clips,pass:named.includes('Phase1Parts')&&named.includes('Phase2Parts')&&clips.length===6&&clips.every(c=>c.tracks>0)});
}
await fs.writeFile('art-source/img2threejs/mainline/three-smoke-log.json', JSON.stringify({ generatedAt: new Date().toISOString(), report }, null, 2));
console.log(JSON.stringify(report, null, 2));
