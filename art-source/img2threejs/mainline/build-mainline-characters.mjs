import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  BONE_NAMES, COLORS, RIG_LIFT, createSceneRoot, mat, boxGeo, capGeo, cylGeo, coneGeo, icoGeo, torusGeo, shieldGeo,
  buildClips, addStandardAnchors,
} from '../shared/rig-factory.mjs';

// GLTFExporter is browser-first. This tiny shim keeps the factory reproducible in Node.
if (typeof globalThis.FileReader === 'undefined') {
  globalThis.FileReader = class FileReader {
    readAsArrayBuffer(blob) { blob.arrayBuffer().then(value => { this.result = value; this.onloadend?.(); }); }
    readAsDataURL(blob) { blob.arrayBuffer().then(value => { this.result = `data:application/octet-stream;base64,${Buffer.from(value).toString('base64')}`; this.onloadend?.(); }); }
  };
}

const OUT = path.resolve('public/assets/models/mainline');
const SPEC_DIR = path.resolve('art-source/img2threejs/mainline');

// Weapon group sits on Hand_R (former "Weapon" bone offset [0,-0.18,0]).
const WEAPON_OFFSET = [0, -0.18, 0];

function buildSword(skinned) {
  const steel = mat('Metal_Sword', COLORS.steelLight, 0.82, 0.29), leather = mat('Leather_Grip', COLORS.leather, 0.1, 0.85), gold = mat('Metal_Gold', COLORS.gold, 0.75, 0.33);
  const tilt = -0.08;
  skinned(boxGeo(), steel, 'Weapon_Blade', 'Hand_R', [WEAPON_OFFSET[0], -0.47 + WEAPON_OFFSET[1], WEAPON_OFFSET[2]], [0.075, 0.78, 0.028], [0, 0, 0.01 + tilt]);
  skinned(boxGeo(), gold, 'Weapon_Guard', 'Hand_R', [WEAPON_OFFSET[0], -0.06 + WEAPON_OFFSET[1], WEAPON_OFFSET[2]], [0.34, 0.045, 0.065], [0, 0, tilt]);
  skinned(cylGeo(), leather, 'Weapon_Grip', 'Hand_R', [WEAPON_OFFSET[0], 0.12 + WEAPON_OFFSET[1], WEAPON_OFFSET[2]], [0.055, 0.23, 0.055], [0, 0, tilt]);
  skinned(cylGeo(), gold, 'Weapon_Pommel', 'Hand_R', [WEAPON_OFFSET[0], 0.26 + WEAPON_OFFSET[1], WEAPON_OFFSET[2]], [0.075, 0.06, 0.075], [0, 0, tilt]);
}

function buildMace(skinned) {
  const steelLight = mat('Metal_Mace', COLORS.steelLight, 0.78, 0.32), wood = mat('Wood', COLORS.wood, 0.05, 0.8);
  skinned(boxGeo(), steelLight, 'Mace_Head', 'Hand_R', [WEAPON_OFFSET[0], -0.45 + WEAPON_OFFSET[1], WEAPON_OFFSET[2]], [0.18, 0.23, 0.18]);
  skinned(cylGeo(), wood, 'Mace_Handle', 'Hand_R', [WEAPON_OFFSET[0], -0.15 + WEAPON_OFFSET[1], WEAPON_OFFSET[2]], [0.055, 0.55, 0.055]);
}

function buildCrossbow(skinned) {
  const wood = mat('Wood', COLORS.wood, 0.05, 0.78), steel = mat('Metal_Steel_Light', COLORS.steelLight, 0.75, 0.4), brass = mat('Metal_Brass', COLORS.brass, 0.68, 0.45), rope = mat('Rope', COLORS.rope, 0, 0.95);
  skinned(boxGeo(), wood, 'Crossbow_Stock', 'Hand_R', [0.06 + WEAPON_OFFSET[0], -0.24 + WEAPON_OFFSET[1], 0.16 + WEAPON_OFFSET[2]], [0.13, 0.55, 0.09], [0, 0, -0.22]);
  skinned(boxGeo(), steel, 'Crossbow_Limb', 'Hand_R', [0.06 + WEAPON_OFFSET[0], -0.08 + WEAPON_OFFSET[1], 0.16 + WEAPON_OFFSET[2]], [0.7, 0.06, 0.045], [0, 0, 0.05]);
  skinned(boxGeo(), brass, 'Crossbow_Trigger', 'Hand_R', [0.06 + WEAPON_OFFSET[0], -0.35 + WEAPON_OFFSET[1], 0.16 + WEAPON_OFFSET[2]], [0.06, 0.09, 0.08]);
  const string = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.35, -0.08, 0.02), new THREE.Vector3(0, -0.17, 0.02), new THREE.Vector3(0.35, -0.08, 0.02)]);
  skinned(new THREE.TubeGeometry(string, 5, 0.012, 4, false), rope, 'Crossbow_String', 'Hand_R', [0.06 + WEAPON_OFFSET[0], -0.1 + WEAPON_OFFSET[1], 0.16 + WEAPON_OFFSET[2]], [1, 1, 1], [0, 0, -0.25]);
}

function buildShield(skinned, name, broad = false) {
  const shield = mat('Metal_Shield', COLORS.steel, 0.78, 0.38);
  const rim = mat('Metal_Gold', COLORS.gold, 0.83, 0.34);
  const boss = mat('Metal_Gold', COLORS.gold, 0.8, 0.3);
  const emblem = name.includes('Arthur') ? mat('Metal_Gold', COLORS.gold, 0.72, 0.33) : mat('Cloth_Emblem', COLORS.cloth, 0.1, 0.7);
  const pos = name.includes('Arthur') ? [-0.16, -0.12, 0.18] : [-0.22, -0.12, 0.18];
  const rot = [0.05, 0.1, name.includes('Arthur') ? 0.08 : -0.02];
  skinned(shieldGeo(broad ? 0.74 : 0.58, broad ? 1.18 : 0.92, 0.09), shield, 'Shield_Plate', 'Hand_L', [pos[0], pos[1], 0.04 + pos[2]], [1, 1, 1], [Math.PI / 2 + rot[0], rot[1], rot[2]]);
  skinned(shieldGeo(broad ? 0.80 : 0.64, broad ? 1.24 : 0.98, 0.025), rim, 'Shield_Rim', 'Hand_L', [pos[0], pos[1], 0.09 + pos[2]], [1.03, 1.03, 0.7], [Math.PI / 2 + rot[0], rot[1], rot[2]]);
  skinned(cylGeo(), boss, 'Shield_Boss', 'Hand_L', [pos[0], 0.05 + pos[1], 0.11 + pos[2]], [0.11, 0.035, 0.11], [Math.PI / 2 + rot[0], rot[1], rot[2]]);
  skinned(boxGeo(), emblem, 'Shield_Emblem', 'Hand_L', [pos[0], -0.1 + pos[1], 0.12 + pos[2]], [0.04, broad ? 0.42 : 0.3, 0.02], [rot[0], rot[1], Math.PI / 4 + rot[2]]);
}

function addCommonBody({ skinned }, id, style) {
  const skin = mat('Skin', COLORS.skin, 0, 0.73), steel = mat('Metal_Steel', COLORS.steel, 0.72, 0.38), steelLight = mat('Metal_Steel_Light', COLORS.steelLight, 0.8, 0.28);
  const gold = mat('Metal_Gold', COLORS.gold, 0.82, 0.28), cloth = mat('Cloth', style.cloth, 0.05, 0.82);
  const clothDark = mat('Cloth_Dark', COLORS.dark, 0.05, 0.9), leather = mat('Leather', COLORS.leather, 0.08, 0.88), eye = mat('Eye_Void', 0x0b0d12, 0.1, 0.4);

  // ---- head: face + features + class headwear ----
  skinned(icoGeo(0.20, 2), skin, 'Head_Face', 'Head', [0, 0.02, 0.01], [0.86, 1.0, 0.82]);
  skinned(boxGeo(), skin, 'Head_Nose', 'Head', [0, -0.09, 0.15], [0.05, 0.05, 0.05], [0, 0, 0.12]);
  for (const side of ['L', 'R']) {
    const s = side === 'L' ? -1 : 1;
    skinned(boxGeo(), eye, `Head_Eye_${side}`, 'Head', [s * 0.07, 0.04, 0.13], [0.035, 0.02, 0.015], [0, s * 0.18, 0]);
  }
  if (id === 'arthur') {
    skinned(cylGeo(), steel, 'Head_Helm', 'Head', [0, 0.07, -0.02], [0.30, 0.26, 0.30]);
    skinned(boxGeo(), steel, 'Head_Visor', 'Head', [0, 0.01, 0.13], [0.17, 0.05, 0.03]);
    skinned(boxGeo(), eye, 'Head_VisorSlit', 'Head', [0, 0.01, 0.145], [0.12, 0.014, 0.008]);
    skinned(cylGeo(), steel, 'Head_Crest', 'Head', [0, 0.23, 0], [0.05, 0.10, 0.05], [Math.PI / 2, 0, 0]);
    skinned(boxGeo(), gold, 'Head_HelmTrim', 'Head', [0, 0.08, 0.16], [0.31, 0.02, 0.02]);
  } else if (id === 'hans') {
    skinned(icoGeo(0.24, 1), clothDark, 'Head_Coif', 'Head', [0, 0.04, -0.04], [0.92, 0.85, 0.86]);
    skinned(boxGeo(), eye, 'Head_CoifFace', 'Head', [0, 0.02, 0.12], [0.13, 0.13, 0.02]);
  } else {
    skinned(coneGeo(0.20, 0.13, 8), cloth, 'Head_Hood', 'Head', [0, 0.10, -0.07], [1, 0.52, 1], [0.22, 0, 0]);
    skinned(boxGeo(), eye, 'Head_HoodFace', 'Head', [0, 0.0, 0.11], [0.14, 0.12, 0.02]);
  }

  // ---- torso: tapered tunic + layered plate + belt ----
  skinned(coneGeo(0.26, 0.17, 8), cloth, 'Body_Tunic', 'Spine', [0, -0.01, 0], [0.30, 0.52, 0.20]);
  skinned(boxGeo(), steel, 'Chest_Plate', 'Spine2', [0, 0.05, 0.15], [0.33, 0.28, 0.08], [0.06, 0, 0]);
  skinned(boxGeo(), gold, 'Chest_Trim', 'Spine2', [0, 0.05, 0.21], [0.36, 0.03, 0.02]);
  skinned(cylGeo(), leather, 'Body_Belt', 'Hips', [0, 0.02, 0], [0.34, 0.07, 0.34]);
  skinned(boxGeo(), gold, 'Body_Buckle', 'Hips', [0, 0.02, 0.17], [0.08, 0.08, 0.02]);

  // ---- limbs + layered pauldrons ----
  for (const side of ['L', 'R']) {
    const s = side === 'L' ? -1 : 1;
    skinned(icoGeo(0.13, 1), steel, `Shoulder_${side}_Pauldron`, `Shoulder_${side}`, [0, -0.03, 0], [1.25, 0.8, 1.0]);
    skinned(boxGeo(), gold, `Shoulder_${side}_Trim`, `Shoulder_${side}`, [0, -0.09, 0], [0.30, 0.03, 0.07]);
    skinned(capGeo(), cloth, `Arm_${side}_Sleeve`, `Arm_${side}`, [0, -0.16, 0], [0.12, 0.34, 0.12], [0, 0, s * 0.12]);
    skinned(capGeo(), steel, `Arm_${side}_Bracer`, `Forearm_${side}`, [0, -0.15, 0], [0.115, 0.27, 0.115]);
    skinned(icoGeo(0.08, 1), skin, `Hand_${side}`, `Hand_${side}`, [0, -0.02, 0]);
    skinned(capGeo(), clothDark, `Leg_${side}_Upper`, `Leg_${side}`, [0, -0.18, 0], [0.14, 0.30, 0.14]);
    skinned(capGeo(), steelLight, `Leg_${side}_Greave`, `Shin_${side}`, [0, -0.20, 0], [0.14, 0.33, 0.14]);
    skinned(boxGeo(), leather, `Foot_${side}_Boot`, `Foot_${side}`, [0, -0.08, 0.08], [0.22, 0.16, 0.38]);
  }

  // ---- cloak + satchel ----
  skinned(boxGeo(), leather, 'Prop_Satchel', 'Hips', [0.34, -0.07, 0], [0.16, 0.24, 0.18], [0.1, 0.2, 0]);
  const cloakMat = mat('Cloth_Cloak', style.cloak, 0.02, 0.9);
  for (const side of ['L', 'R']) {
    const s = side === 'L' ? -1 : 1;
    skinned(boxGeo(), cloakMat, `Cloak_${side}`, 'Spine', [s * 0.41, -0.51, -0.14], [0.34, 0.82, 0.04], [0, s * 0.08, s * 0.06]);
  }
}

function makeCharacter(id) {
  const ctx = createSceneRoot('CharacterRoot');
  const configs = {
    arthur: { cloth: COLORS.navy, cloak: 0x162337, weapon: 'sword', scale: 1.0 },
    hans: { cloth: COLORS.cloth, cloak: 0x332220, weapon: 'shield', scale: 1.03 },
    asnoka: { cloth: COLORS.green, cloak: 0x1e352d, weapon: 'crossbow', scale: 0.98 },
  };
  const style = configs[id];
  addCommonBody(ctx, id, style);
  if (id === 'arthur') { buildShield(ctx.skinned, 'Shield_Arthur'); buildSword(ctx.skinned); }
  if (id === 'hans') { buildShield(ctx.skinned, 'Shield_Hans', true); buildMace(ctx.skinned); }
  if (id === 'asnoka') {
    buildCrossbow(ctx.skinned);
    ctx.skinned(cylGeo(), mat('Rope', COLORS.rope, 0, 0.95), 'Prop_Rope', 'Hips', [0.32, 0.48, -0.12], [0.08, 0.32, 0.08], [0, 0, 0.3]);
  }
  addStandardAnchors(ctx);
  // Feet are baked at world Y=0 inside the rig (no root-node offset/scale), keeping skin
  // bind matrices consistent across export/load. The runtime applies visualScale separately.
  ctx.root.userData.sculptRuntime = { id, boneNames: BONE_NAMES, sockets: ['HeadAnchor', 'WeaponAnchor', 'HitAnchor', 'FootAnchor', 'FxWeapon'], explodable: true, clickableParts: true };
  return ctx;
}

function addPhasePart(ctx, group, builder) {
  const phase = new THREE.Group(); phase.name = group; phase.visible = group === 'Phase2Parts' ? false : true;
  ctx.root.add(phase);
  const skinned = (geo, m, n, bone, rootPos, scale, rot) => ctx.skinnedAtRoot(geo, m, n, bone, [rootPos[0], rootPos[1] + RIG_LIFT, rootPos[2]], scale, rot, phase);
  builder(skinned);
}

function makeWhiteKnightBoss() {
  const ctx = makeCharacter('arthur');
  ctx.root.name = 'BossRoot';
  const gold = mat('Metal_Gold', COLORS.gold, 0.82, 0.28), darkSteel = mat('Metal_Steel_Dark', 0x1c232d, 0.78, 0.34), ember = mat('Emissive_Ember', 0x9d3a1c, 0.1, 0.45, 0x9d3a1c, 1.3);
  addPhasePart(ctx, 'Phase1Parts', (skinned) => {
    skinned(cylGeo(), gold, 'Phase1_Crest', 'Head', [0, 1.86, 0], [0.16, 0.10, 0.16]);
    skinned(boxGeo(), gold, 'Phase1_WhiteMantle', 'Spine2', [0, 1.48, -0.02], [0.48, 0.08, 0.28]);
  });
  addPhasePart(ctx, 'Phase2Parts', (skinned) => {
    skinned(cylGeo(), darkSteel, 'Phase2_BrokenCrest', 'Head', [0, 1.82, 0], [0.19, 0.07, 0.19]);
    skinned(boxGeo(), ember, 'Phase2_ChestCore', 'Spine2', [0, 1.35, 0.22], [0.16, 0.22, 0.06]);
    skinned(boxGeo(), darkSteel, 'Phase2_BrokenMantle', 'Spine2', [0, 1.48, -0.03], [0.52, 0.08, 0.28]);
  });
  ctx.root.userData.sculptRuntime.bossPhases = ['Phase1Parts', 'Phase2Parts'];
  return ctx;
}

function makeNightJudgeBoss() {
  const ctx = makeCharacter('asnoka');
  ctx.root.name = 'BossRoot';
  const black = mat('Cloth_Black', 0x0c111b, 0.35, 0.48), ritual = mat('Metal_Ritual', 0x4c273e, 0.2, 0.58), violet = mat('Emissive_Violet', 0x6f2e72, 0.2, 0.58, 0x6f2e72, 1.18), pale = mat('Skin_Pale', 0x8a7d71, 0.2, 0.75);
  addPhasePart(ctx, 'Phase1Parts', (skinned) => {
    skinned(torusGeo(0.42, 0.025, 5, 16), ritual, 'Phase1_RitualRing', 'Head', [0, 1.62, 0], [1, 1, 1], [Math.PI / 2, 0, 0]);
    skinned(boxGeo(), black, 'Phase1_JudgeMantle', 'Spine2', [0, 1.47, -0.08], [0.53, 0.08, 0.3]);
    skinned(boxGeo(), pale, 'Phase1_InnerMask', 'Head', [0, 1.55, 0.19], [0.19, 0.25, 0.04]);
  });
  addPhasePart(ctx, 'Phase2Parts', (skinned) => {
    skinned(torusGeo(0.5, 0.035, 5, 16), violet, 'Phase2_BrokenHalo', 'Head', [0, 1.66, -0.02], [1, 1, 1], [Math.PI / 2, 0, 0]);
    skinned(boxGeo(), black, 'Phase2_OpenMask', 'Head', [0, 1.55, 0.2], [0.24, 0.28, 0.05]);
    skinned(boxGeo(), violet, 'Phase2_ReviewEye', 'Head', [0, 1.55, 0.24], [0.06, 0.08, 0.025]);
  });
  ctx.root.userData.sculptRuntime.bossPhases = ['Phase1Parts', 'Phase2Parts'];
  return ctx;
}

function makeLakeGod(coreColor, shellColor) {
  const ctx = makeCharacter('arthur');
  ctx.root.name = 'BossRoot';
  // Lake god is a floating core entity: drop the humanoid body + weapon meshes entirely
  // (keeps the 23-bone skeleton for anchors/phase-part skinning; saves ~380KB per file).
  const droppable = [];
  ctx.root.traverse((o) => { if (o.isMesh) droppable.push(o); });
  for (const o of droppable) o.parent?.remove(o);
  const core = mat('Emissive_Core', coreColor, 0.1, 0.45, coreColor, 1.45), shell = mat('Metal_Shell', shellColor, 0.56, 0.42), shard = mat('Metal_Shard', 0x5b526a, 0.35, 0.5);
  addPhasePart(ctx, 'Phase1Parts', (skinned) => {
    skinned(icoGeo(0.42, 2), core, 'Core', 'Root', [0, 1.35, 0.1], [1, 1.18, 1]);
    skinned(torusGeo(0.58, 0.035, 5, 18), shell, 'Core_Ring', 'Root', [0, 1.35, 0.06], [1, 1, 1], [Math.PI / 2, 0, 0]);
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      skinned(icoGeo(0.13, 1), shard, `FloatingShard_${i}`, 'Root', [Math.cos(a) * 0.72, 1.35 + Math.sin(a) * 0.42, 0.06 + Math.sin(a) * 0.28], [1, 1, 1]);
    }
  });
  addPhasePart(ctx, 'Phase2Parts', (skinned) => {
    skinned(icoGeo(0.42, 2), core, 'Core', 'Root', [0, 1.35, 0.1], [1, 1.18, 1]);
    skinned(torusGeo(0.58, 0.035, 5, 18), shell, 'Core_Ring', 'Root', [0, 1.35, 0.06], [1, 1, 1], [Math.PI / 2, 0, 0]);
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      skinned(icoGeo(0.13, 1), core, `FloatingShard_${i}`, 'Root', [Math.cos(a) * 0.72, 1.35 + Math.sin(a) * 0.42, 0.06 + Math.sin(a) * 0.28], [1, 1, 1]);
    }
    skinned(boxGeo(), core, 'Phase2_SplitCore', 'Root', [0, 1.35, 0.18], [0.08, 0.5, 0.08], [0, 0, 0.55]);
  });
  const coreAnchor = new THREE.Object3D(); coreAnchor.name = 'CoreAnchor'; coreAnchor.position.set(0, 1.35 + RIG_LIFT, 0.2); ctx.root.add(coreAnchor);
  const fxCore = new THREE.Object3D(); fxCore.name = 'FxCore'; fxCore.position.set(0, 1.35 + RIG_LIFT, 0.2); ctx.root.add(fxCore);
  const altarAnchor = new THREE.Object3D(); altarAnchor.name = 'AltarAnchor'; altarAnchor.position.set(0, 0.08, 0); ctx.root.add(altarAnchor);
  ctx.root.userData.sculptRuntime.bossPhases = ['Phase1Parts', 'Phase2Parts'];
  return ctx;
}

const HERO_CLIPS = ['idle', 'move', 'attack_health', 'attack_faith', 'hit_health', 'hit_faith', 'death_health', 'death_faith', 'skill'];
const BOSS_HEALTH_CLIPS = ['idle', 'move', 'attack_health', 'hit_health', 'death_health', 'phase_transition'];
const BOSS_FAITH_CLIPS = ['idle', 'move', 'attack_faith', 'hit_faith', 'death_faith', 'phase_transition'];

async function exportScene(name, root, clipNames) {
  const scene = new THREE.Scene(); scene.name = name; scene.add(root);
  const clips = buildClips(clipNames);
  const exporter = new GLTFExporter();
  const data = await new Promise((resolve, reject) => exporter.parse(scene, resolve, reject, { binary: true, animations: clips, trs: true, onlyVisible: false }));
  return { data, clips };
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const results = [];
  for (const id of ['arthur', 'hans', 'asnoka']) {
    const ctx = makeCharacter(id);
    const { data, clips } = await exportScene(`Mainline_${id}`, ctx.root, HERO_CLIPS);
    const file = `${id}.glb`;
    await fs.writeFile(path.join(OUT, file), Buffer.from(data));
    results.push({ id, path: `public/assets/models/mainline/${file}`, bytes: Buffer.byteLength(data), clips: clips.map(c => c.name) });
  }
  const bosses = [
    { id: 'boss-white-knight', build: makeWhiteKnightBoss, clips: BOSS_HEALTH_CLIPS, scale: 0.85, fallback: 'procedural-boss-white-knight-v1' },
    { id: 'boss-night-judge', build: makeNightJudgeBoss, clips: BOSS_FAITH_CLIPS, scale: 0.78, fallback: 'procedural-boss-night-judge-v1' },
    { id: 'boss-lake-god-a', build: () => makeLakeGod(0x9b3024, 0x7a522c), clips: BOSS_FAITH_CLIPS, scale: 0.92, fallback: 'procedural-boss-lake-god-v1' },
    { id: 'boss-lake-god-b', build: () => makeLakeGod(0xb9d7e2, 0x7f9fb7), clips: BOSS_FAITH_CLIPS, scale: 0.92, fallback: 'procedural-boss-lake-god-v1' },
  ];
  const bossRows = [];
  for (const spec of bosses) {
    const ctx = spec.build();
    const { data, clips } = await exportScene(`Mainline_${spec.id}`, ctx.root, spec.clips);
    const file = `${spec.id}.glb`;
    await fs.writeFile(path.join(OUT, file), Buffer.from(data));
    bossRows.push({ id: spec.id, bytes: Buffer.byteLength(data), clips: clips.map(c => c.name), scale: spec.scale, fallback: spec.fallback, phases: ['Phase1Parts', 'Phase2Parts'] });
  }

  const runtimePath = (filePath) => `/${filePath.replace(/^public[\\/]/, '').replaceAll('\\', '/')}`;
  const manifest = {
    schemaVersion: 1,
    source: 'img2threejs',
    generatedAt: new Date().toISOString(),
    sharedSkeleton: BONE_NAMES,
    models: results.map(r => ({
      id: r.id, modelPath: runtimePath(r.path), visualScale: r.id === 'hans' ? 0.74 : 0.76, facing: '+Z', targetWorldHeight: 1.75,
      feetOrigin: 'baked rig lift (foot sole at Y=0)',
      actions: Object.fromEntries(r.clips.map(name => [name, name])),
      sockets: ['HeadAnchor', 'WeaponAnchor', 'HitAnchor', 'FootAnchor', 'FxWeapon'],
      fallback: 'procedural-mainline-v1', license: 'Generated procedural geometry; concept reference only',
    })),
  };
  manifest.bosses = bossRows.map(b => ({
    id: b.id, modelPath: runtimePath(`public/assets/models/mainline/${b.id}.glb`), visualScale: b.scale, facing: '+Z', targetWorldHeight: 1.95,
    phases: [{ id: 'phase-1', node: 'Phase1Parts', visibleByDefault: true }, { id: 'phase-2', node: 'Phase2Parts', visibleByDefault: false }],
    actions: Object.fromEntries(b.clips.map(name => [name, name])),
    sockets: ['HeadAnchor', 'WeaponAnchor', 'HitAnchor', 'FootAnchor', 'FxWeapon'],
    fallback: b.fallback, license: 'Generated procedural geometry; concept reference only',
  }));
  await fs.writeFile(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
  await fs.writeFile(path.join(SPEC_DIR, 'build-report.json'), JSON.stringify({ generatedBy: 'img2threejs', pipeline: ['blockout', 'structure', 'form', 'material', 'lighting', 'interaction', 'optimization'], results, bosses: bossRows, notes: ['23-bone K3-structured rig with real skinning.', 'Full-body multi-track animation clips.', 'Named PBR materials (metal/cloth/skin/emissive).', 'No src files or side-campaign assets touched.'] }, null, 2));
  console.log(JSON.stringify({ results, bosses: bossRows, manifest: path.join(OUT, 'manifest.json') }, null, 2));
}

await main();
