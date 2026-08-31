import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  BONE_NAMES, COLORS, createSceneRoot, mat, boxGeo, capGeo, cylGeo, coneGeo, icoGeo, torusGeo,
  buildClips, addStandardAnchors,
} from '../shared/rig-factory.mjs';

if (typeof globalThis.FileReader === 'undefined') {
  globalThis.FileReader = class FileReader {
    readAsArrayBuffer(b) { b.arrayBuffer().then(v => { this.result = v; this.onloadend?.(); }); }
  };
}

const OUT = path.resolve('public/assets/models/enemies/mainline');
const SOURCE = path.resolve('art-source/img2threejs/minions');
// Former "Weapon" bone was Hand_R + [0,-0.18,0]; former "Prop" bone was Hips + [0.3,-0.02,0].
const WEAPON_OFFSET = [0, -0.18, 0];
const PROP_OFFSET = [0.3, -0.02, 0];

const C = { steel: 0x39424c, dark: 0x141a22, cloth: 0x303b4d, red: 0x63302d, green: 0x294636, gold: 0xa67d37, leather: 0x4b3527, skin: 0x956047, wood: 0x65452d, ember: 0x793032 };

function addBody({ skinned }, id, steel, cloth, leather, skin, gold) {
  const eye = mat('Eye_Void', 0x0b0d12, 0.1, 0.4), clothDark = mat('Cloth_Dark', C.dark, 0.05, 0.9);
  // head + face + class headwear
  skinned(icoGeo(0.20, 1), skin, 'Head_Face', 'Head', [0, 0.02, 0.01], [0.88, 1.0, 0.84]);
  skinned(boxGeo(), skin, 'Head_Nose', 'Head', [0, -0.09, 0.15], [0.05, 0.05, 0.05], [0, 0, 0.1]);
  for (const side of ['L', 'R']) {
    const s = side === 'L' ? -1 : 1;
    skinned(boxGeo(), eye, `Head_Eye_${side}`, 'Head', [s * 0.07, 0.04, 0.13], [0.035, 0.02, 0.015], [0, s * 0.18, 0]);
  }
  if (id === 'shield-guard' || id === 'raider-rider') {
    skinned(cylGeo(), steel, 'Head_Helm', 'Head', [0, 0.07, -0.02], [0.29, 0.24, 0.29]);
    if (id === 'shield-guard') {
      skinned(boxGeo(), steel, 'Head_Visor', 'Head', [0, 0.01, 0.13], [0.16, 0.05, 0.03]);
      skinned(boxGeo(), eye, 'Head_VisorSlit', 'Head', [0, 0.01, 0.145], [0.12, 0.014, 0.008]);
    }
  } else if (id === 'scout' || id === 'faith-acolyte') {
    skinned(coneGeo(0.20, 0.13, 8), cloth, 'Head_Hood', 'Head', [0, 0.10, -0.07], [1, 0.52, 1], [0.22, 0, 0]);
    skinned(boxGeo(), eye, 'Head_HoodFace', 'Head', [0, 0.0, 0.11], [0.14, 0.12, 0.02]);
  } else { // engineer
    skinned(boxGeo(), leather, 'Head_Cap', 'Head', [0, 0.08, -0.02], [0.26, 0.10, 0.26]);
    skinned(boxGeo(), gold, 'Head_GoggleBand', 'Head', [0, 0.03, 0.13], [0.18, 0.05, 0.02]);
    for (const side of ['L', 'R']) {
      const s = side === 'L' ? -1 : 1;
      skinned(cylGeo(), gold, `Head_Goggle_${side}`, 'Head', [s * 0.06, 0.03, 0.13], [0.045, 0.03, 0.045], [Math.PI / 2, 0, 0]);
    }
  }
  // torso
  skinned(coneGeo(0.26, 0.17, 8), cloth, 'Body_Tunic', 'Spine', [0, -0.01, 0], [0.30, 0.52, 0.20]);
  skinned(boxGeo(), steel, 'Chest_Plate', 'Spine2', [0, 0.05, 0.15], [0.32, 0.26, 0.07], [0.06, 0, 0]);
  skinned(cylGeo(), leather, 'Body_Belt', 'Hips', [0, 0.02, 0], [0.33, 0.07, 0.33]);
  skinned(boxGeo(), gold, 'Body_Buckle', 'Hips', [0, 0.02, 0.17], [0.07, 0.07, 0.02]);
  // limbs
  for (const side of ['L', 'R']) {
    const s = side === 'L' ? -1 : 1;
    skinned(icoGeo(0.12, 1), steel, `Shoulder_${side}_Pauldron`, `Shoulder_${side}`, [0, -0.03, 0], [1.2, 0.8, 1.0]);
    skinned(capGeo(), cloth, `Arm_${side}_Sleeve`, `Arm_${side}`, [0, -0.15, 0], [0.12, 0.34, 0.12], [0, 0, s * 0.1]);
    skinned(capGeo(), steel, `Arm_${side}_Bracer`, `Forearm_${side}`, [0, -0.15, 0], [0.11, 0.27, 0.11]);
    skinned(icoGeo(0.08, 1), skin, `Hand_${side}`, `Hand_${side}`, [0, -0.02, 0]);
    skinned(capGeo(), leather, `Leg_${side}_Upper`, `Leg_${side}`, [0, -0.18, 0], [0.13, 0.3, 0.13]);
    skinned(capGeo(), steel, `Leg_${side}_Greave`, `Shin_${side}`, [0, -0.2, 0], [0.13, 0.33, 0.13]);
    skinned(boxGeo(), leather, `Foot_${side}_Boot`, `Foot_${side}`, [0, -0.08, 0.08], [0.21, 0.15, 0.36]);
  }
  skinned(boxGeo(), leather, 'Prop_Satchel', 'Hips', [PROP_OFFSET[0], PROP_OFFSET[1] - 0.03, PROP_OFFSET[2]], [0.16, 0.22, 0.18]);
  // cloth skirt for robe classes
  if (id === 'faith-acolyte' || id === 'scout') {
    skinned(coneGeo(0.24, 0.15, 8), clothDark, 'Body_Skirt', 'Hips', [0, -0.08, 0], [0.32, 0.40, 0.26]);
  }
}

function addWeapon({ skinned }, id, steel, gold, wood, leather) {
  if (id === 'shield-guard') {
    skinned(boxGeo(), gold, 'Shield_Rim', 'Hand_L', [-0.05, -0.1, 0.13], [0.12, 0.72, 0.06]);
    skinned(boxGeo(), steel, 'Shield_Plate', 'Hand_L', [-0.05, -0.1, 0.1], [0.48, 0.75, 0.08], [0, 0, 0.03]);
  }
  if (id === 'scout') {
    skinned(boxGeo(), wood, 'Crossbow_Stock', 'Hand_R', [WEAPON_OFFSET[0], -0.25 + WEAPON_OFFSET[1], 0.12 + WEAPON_OFFSET[2]], [0.1, 0.5, 0.08], [0, 0, -0.22]);
    skinned(boxGeo(), steel, 'Crossbow_Limb', 'Hand_R', [WEAPON_OFFSET[0], -0.1 + WEAPON_OFFSET[1], 0.13 + WEAPON_OFFSET[2]], [0.62, 0.05, 0.04]);
  }
  if (id === 'faith-acolyte') {
    skinned(cylGeo(), gold, 'Staff', 'Hand_R', [WEAPON_OFFSET[0], -0.42 + WEAPON_OFFSET[1], 0.05 + WEAPON_OFFSET[2]], [0.045, 0.8, 0.045]);
    skinned(torusGeo(0.12, 0.02, 5, 12), mat('Emissive_Ember', C.ember, 0.2, 0.5, C.ember, 1.2), 'Ritual_Ring', 'Hips', [PROP_OFFSET[0], PROP_OFFSET[1] + 0.12, PROP_OFFSET[2] + 0.05]);
  }
  if (id === 'engineer') {
    skinned(boxGeo(), steel, 'Hammer_Head', 'Hand_R', [WEAPON_OFFSET[0], -0.4 + WEAPON_OFFSET[1], 0.08 + WEAPON_OFFSET[2]], [0.24, 0.18, 0.18]);
    skinned(cylGeo(), wood, 'Hammer_Handle', 'Hand_R', [WEAPON_OFFSET[0], -0.17 + WEAPON_OFFSET[1], 0.08 + WEAPON_OFFSET[2]], [0.04, 0.52, 0.04]);
    skinned(boxGeo(), gold, 'Toolbox', 'Hips', [PROP_OFFSET[0] + 0.18, PROP_OFFSET[1] - 0.02, PROP_OFFSET[2] + 0.02], [0.24, 0.18, 0.18]);
  }
  if (id === 'raider-rider') {
    const mountBody = mat('Mount_Body', 0x3a2824, 0, 0.9), mountNeck = mat('Mount_Neck', 0x251a1a, 0, 0.9);
    skinned(capGeo(), mountBody, 'Mount_Body', 'Root', [0, 0.4, -0.02], [0.48, 0.42, 0.8]);
    skinned(capGeo(), mountNeck, 'Mount_Neck', 'Root', [0, 0.78, 0.22], [0.24, 0.5, 0.3], [-0.2, 0, 0]);
    skinned(boxGeo(), leather, 'Mount_Saddle', 'Root', [0, 0.78, 0], [0.5, 0.12, 0.4]);
  }
}

function create(id) {
  const ctx = createSceneRoot('CharacterRoot');
  const cfg = {
    'shield-guard': { cloth: C.cloth }, scout: { cloth: C.green }, 'faith-acolyte': { cloth: C.red }, engineer: { cloth: 0x5a513e }, 'raider-rider': { cloth: 0x4b2e2b },
  }[id];
  const steel = mat('Metal_Steel', C.steel, 0.72, 0.4), cloth = mat('Cloth', cfg.cloth, 0, 0.84), leather = mat('Leather', C.leather, 0.05, 0.86), skin = mat('Skin', C.skin, 0, 0.7), gold = mat('Metal_Gold', C.gold, 0.7, 0.35), wood = mat('Wood', C.wood, 0, 0.82);
  addBody(ctx, id, steel, cloth, leather, skin, gold);
  addWeapon(ctx, id, steel, gold, wood, leather);
  addStandardAnchors(ctx);
  ctx.root.userData.sculptRuntime = { id, boneNames: BONE_NAMES, sockets: ['HeadAnchor', 'WeaponAnchor', 'HitAnchor', 'FootAnchor'], explodable: true, clickableParts: true };
  return ctx;
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  await fs.mkdir(SOURCE, { recursive: true });
  const ids = ['shield-guard', 'scout', 'faith-acolyte', 'engineer', 'raider-rider'];
  const rows = [];
  for (const id of ids) {
    const ctx = create(id);
    const actionNames = id === 'faith-acolyte' ? ['idle', 'move', 'attack_faith', 'hit_health', 'death_health'] : ['idle', 'move', 'attack_health', 'hit_health', 'death_health'];
    const clips = buildClips(actionNames);
    const scene = new THREE.Scene(); scene.name = `Mainline_${id}`; scene.add(ctx.root);
    const ex = new GLTFExporter();
    const data = await new Promise((res, rej) => ex.parse(scene, res, rej, { binary: true, animations: clips, trs: true }));
    const file = `${id}.glb`;
    await fs.writeFile(path.join(OUT, file), Buffer.from(data));
    rows.push({
      id, role: id, mapsTo: id === 'shield-guard' ? 'e1' : id === 'scout' ? 'e2' : id === 'faith-acolyte' ? 'e4' : id === 'engineer' ? 'e5' : 'e6',
      modelPath: `/assets/models/enemies/mainline/${file}`, bytes: Buffer.byteLength(data),
      visualScale: id === 'raider-rider' ? 0.78 : 0.76,
      actions: Object.fromEntries(actionNames.map(n => [n, n])),
      sockets: ['HeadAnchor', 'WeaponAnchor', 'HitAnchor', 'FootAnchor'],
      fallback: 'procedural-enemy-v1', license: 'Generated procedural geometry; concept reference only',
    });
  }
  await fs.writeFile(path.join(OUT, 'manifest.json'), JSON.stringify({ schemaVersion: 1, source: 'img2threejs', sharedSkeleton: BONE_NAMES, models: rows }, null, 2));
  await fs.writeFile(path.join(SOURCE, 'BUILD-REPORT.json'), JSON.stringify({ pipeline: ['intake', 'pre-spec', 'blockout', 'structure', 'material', 'lighting', 'interaction', 'optimization'], models: rows, notes: ['23-bone K3-structured rig with real skinning.', 'Full-body multi-track animation clips.', 'Named PBR materials.', 'No src/business code or existing side-campaign assets changed.'] }, null, 2));
  console.log(JSON.stringify(rows, null, 2));
}

await main();
