import fs from 'node:fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';

// GLTFLoader expects browser globals while this verifier runs in Node.
globalThis.self ??= globalThis;

const models = [
  { id: 'arthur', actions: ['idle', 'move', 'attack_health', 'attack_faith', 'hit_health', 'death_health', 'skill'] },
  { id: 'hans', actions: ['idle', 'move', 'attack_health', 'attack_faith', 'hit_health', 'death_health', 'skill'] },
  { id: 'asnoka', actions: ['idle', 'move', 'attack_health', 'attack_faith', 'hit_health', 'death_health', 'skill'] },
  { id: 'boss-white-knight', actions: ['idle', 'move', 'attack_health', 'hit_health', 'death_health', 'phase_transition'] },
  { id: 'boss-night-judge', actions: ['idle', 'move', 'attack_faith', 'hit_faith', 'death_faith', 'phase_transition'] },
  { id: 'boss-lake-god-a', actions: ['idle', 'move', 'attack_faith', 'hit_faith', 'death_faith', 'phase_transition'] },
  { id: 'boss-lake-god-b', actions: ['idle', 'move', 'attack_faith', 'hit_faith', 'death_faith', 'phase_transition'] },
];
const actionAliases = {
  'boss-night-judge': {
    attack_faith: ['attack_faith', 'attack_health'],
    hit_faith: ['hit_faith', 'hit_health'],
    death_faith: ['death_faith', 'death_health'],
  },
};
models.push(
  { id: 'shield-guard', path: 'public/assets/models/enemies/mainline/shield-guard.glb', actions: ['idle', 'move', 'attack_health', 'hit_health', 'death_health'] },
  { id: 'scout', path: 'public/assets/models/enemies/mainline/scout.glb', actions: ['idle', 'move', 'attack_health', 'hit_health', 'death_health'] },
  { id: 'faith-acolyte', path: 'public/assets/models/enemies/mainline/faith-acolyte.glb', actions: ['idle', 'move', 'attack_faith', 'hit_health', 'death_health'] },
  { id: 'engineer', path: 'public/assets/models/enemies/mainline/engineer.glb', actions: ['idle', 'move', 'attack_health', 'hit_health', 'death_health'] },
  { id: 'raider-rider', path: 'public/assets/models/enemies/mainline/raider-rider.glb', actions: ['idle', 'move', 'attack_health', 'hit_health', 'death_health'] },
);

const loader = new GLTFLoader();
const load = (id) => new Promise((resolve, reject) => {
  const buffer = fs.readFileSync(specPath(id));
  loader.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength), '', resolve, reject);
});

const specPath = (id) => {
  const spec = models.find((item) => item.id === id);
  return spec?.path ?? `public/assets/models/mainline/${id}.glb`;
};

const report = [];
for (const spec of models) {
  const gltf = await load(spec.id);
  const first = cloneSkeleton(gltf.scene);
  const second = cloneSkeleton(gltf.scene);
  const mixerA = new THREE.AnimationMixer(first);
  const mixerB = new THREE.AnimationMixer(second);
  for (const name of spec.actions) {
    const candidates = actionAliases[spec.id]?.[name] ?? [name];
    const clip = candidates.map((candidate) => gltf.animations.find((item) => item.name === candidate)).find(Boolean);
    if (!clip || clip.tracks.length === 0) throw new Error(`${spec.id}: missing playable clip ${name}`);
    mixerA.clipAction(clip).reset().play();
    mixerB.clipAction(clip).reset().play();
    mixerA.update(Math.min(0.12, clip.duration));
    mixerB.update(Math.min(0.12, clip.duration));
  }
  if (first === second || first === gltf.scene) throw new Error(`${spec.id}: clone was not independent`);
  const bounds = new THREE.Box3().setFromObject(first);
  if (!Number.isFinite(bounds.min.y) || bounds.max.y <= bounds.min.y) throw new Error(`${spec.id}: invalid bounds`);
  if (spec.id.startsWith('boss-')) {
    const phase1 = first.getObjectByName('Phase1Parts');
    const phase2 = first.getObjectByName('Phase2Parts');
    if (!phase1 || !phase2) throw new Error(`${spec.id}: phase nodes missing`);
    phase1.visible = true; phase2.visible = false;
    phase1.visible = false; phase2.visible = true;
  }
  report.push({ id: spec.id, clips: spec.actions.length, height: Number((bounds.max.y - bounds.min.y).toFixed(3)), independentClone: true });
}

console.log(JSON.stringify({ ok: true, models: report }, null, 2));
