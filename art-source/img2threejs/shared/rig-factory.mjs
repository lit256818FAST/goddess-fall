// Shared low-poly stylized rig factory for the img2threejs mainline batch.
// Contract: exactly 23 bones (K3 structure), real SkinnedMesh skinning,
// full-body multi-track animation clips, semantically named PBR materials,
// and the standard anchor sockets (HeadAnchor / WeaponAnchor / HitAnchor / FootAnchor).
import * as THREE from 'three';

// Baked lift that puts the foot sole at world Y=0. Kept as a constant so phase-part
// positions authored in pre-lift character space can be re-based automatically.
export const RIG_LIFT = 0.20;

export const BONE_NAMES = [
  'Root', 'Hips', 'Spine', 'Spine1', 'Spine2', 'Neck', 'Head',
  'Shoulder_L', 'Arm_L', 'Forearm_L', 'Hand_L',
  'Shoulder_R', 'Arm_R', 'Forearm_R', 'Hand_R',
  'Leg_L', 'Shin_L', 'Foot_L', 'Toe_L',
  'Leg_R', 'Shin_R', 'Foot_R', 'Toe_R',
];

// Palette aligned to the project style bible (cold slate, worn bronze, sacred gold, desaturated cloth).
export const COLORS = {
  steel: 0x39424c, steelLight: 0x6f7780, navy: 0x1c2c42,
  leather: 0x4a3328, gold: 0xb38a3d, skin: 0x9c684e,
  cloth: 0x4e2523, green: 0x263f35, brass: 0x896836,
  wood: 0x4b3425, rope: 0x6a5140, dark: 0x151922,
};

export function buildRig() {
  const armature = new THREE.Group(); armature.name = 'Armature';
  const bones = [];
  const byName = new Map();
  const add = (name, parent, pos) => {
    const b = new THREE.Bone(); b.name = name; b.position.set(...pos);
    (parent || armature).add(b); bones.push(b); byName.set(name, b); return b;
  };
  // The rig is authored with the foot sole at world Y=0 (baked lift, no root-node offset),
  // so SkinnedMesh bind matrices stay consistent across the GLB export/load round-trip.
  const root = add('Root', null, [0, RIG_LIFT, 0]);
  const hips = add('Hips', root, [0, 0.88, 0]);
  const spine = add('Spine', hips, [0, 0.19, 0]);
  const spine1 = add('Spine1', spine, [0, 0.19, 0]);
  const spine2 = add('Spine2', spine1, [0, 0.18, 0]);
  const neck = add('Neck', spine2, [0, 0.25, 0]);
  add('Head', neck, [0, 0.18, 0]);
  for (const side of ['L', 'R']) {
    const s = side === 'L' ? -1 : 1;
    const shoulder = add(`Shoulder_${side}`, spine2, [s * 0.34, 0.15, 0]);
    const arm = add(`Arm_${side}`, shoulder, [0, -0.17, 0]);
    const fore = add(`Forearm_${side}`, arm, [0, -0.30, 0]);
    add(`Hand_${side}`, fore, [0, -0.27, 0]);
    const leg = add(`Leg_${side}`, hips, [s * 0.17, -0.14, 0]);
    const shin = add(`Shin_${side}`, leg, [0, -0.40, 0]);
    const foot = add(`Foot_${side}`, shin, [0, -0.38, 0.06]);
    add(`Toe_${side}`, foot, [0, -0.05, 0.14]);
  }
  armature.updateMatrixWorld(true);
  const skeleton = new THREE.Skeleton(bones);
  return { armature, bones, byName, skeleton };
}

function skinRigid(geometry, boneIndex) {
  const count = geometry.attributes.position.count;
  // Uint8 JOINTS_0 (glTF UNSIGNED_BYTE) — 23 bones fit well under 256, halving index bytes vs Uint16.
  const skinIndex = new THREE.BufferAttribute(new Uint8Array(count * 4), 4);
  const skinWeight = new THREE.BufferAttribute(new Float32Array(count * 4), 4);
  for (let i = 0; i < count; i++) {
    skinIndex.setXYZW(i, boneIndex, 0, 0, 0);
    skinWeight.setXYZW(i, 1, 0, 0, 0);
  }
  geometry.setAttribute('skinIndex', skinIndex);
  geometry.setAttribute('skinWeight', skinWeight);
  return geometry;
}

export function createSceneRoot(name = 'CharacterRoot') {
  const { armature, bones, byName, skeleton } = buildRig();
  const root = new THREE.Group(); root.name = name; root.add(armature);

  const skinned = (geometry, material, meshName, boneName, pos = [0, 0, 0], scale = [1, 1, 1], rot = [0, 0, 0], parent = root) => {
    const bone = byName.get(boneName);
    const boneIndex = bones.indexOf(bone);
    const local = new THREE.Matrix4().compose(
      new THREE.Vector3(...pos),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot, 'XYZ')),
      new THREE.Vector3(...scale),
    );
    const g = geometry.clone().applyMatrix4(local).applyMatrix4(bone.matrixWorld);
    const mesh = new THREE.SkinnedMesh(skinRigid(g, boneIndex), material);
    mesh.name = meshName;
    mesh.castShadow = true; mesh.receiveShadow = true;
    mesh.userData.explodeWithParent = false;
    mesh.bind(skeleton);
    parent.add(mesh);
    return mesh;
  };

  // Skin a mesh positioned by an absolute root-space point to a bone (used for phase parts).
  const skinnedAtRoot = (geometry, material, meshName, boneName, rootPos, scale = [1, 1, 1], rot = [0, 0, 0], parent = root) => {
    const bone = byName.get(boneName);
    const boneWorld = bone.getWorldPosition(new THREE.Vector3());
    const pos = [rootPos[0] - boneWorld.x, rootPos[1] - boneWorld.y, rootPos[2] - boneWorld.z];
    return skinned(geometry, material, meshName, boneName, pos, scale, rot, parent);
  };

  const anchor = (boneName, anchorName, pos = [0, 0, 0]) => {
    const bone = byName.get(boneName);
    const a = new THREE.Object3D(); a.name = anchorName; a.position.set(...pos);
    bone.add(a); return a;
  };

  return { root, armature, bones, byName, skeleton, skinned, skinnedAtRoot, anchor };
}

// ---- PBR materials (named, family-differentiated) ----
export function mat(name, color, metalness = 0, roughness = 0.72, emissive = 0x000000, emissiveIntensity = 0) {
  return new THREE.MeshStandardMaterial({ name, color, metalness, roughness, emissive, emissiveIntensity });
}

// ---- Geometry primitives (unit) ----
export const boxGeo = () => new THREE.BoxGeometry(1, 1, 1);
export const capGeo = () => new THREE.CapsuleGeometry(0.5, 1, 3, 6);
export const cylGeo = () => new THREE.CylinderGeometry(0.5, 0.5, 1, 6);
// Tapered primitive (cone / trapezoid). rTop/rBottom are world radii of the 1-unit-tall solid.
export const coneGeo = (rTop, rBottom, radial = 6) => new THREE.CylinderGeometry(rTop, rBottom, 1, radial, 1, false);
export const icoGeo = (radius, detail) => new THREE.IcosahedronGeometry(radius, detail);
export const torusGeo = (r, tube, radial, tubular) => new THREE.TorusGeometry(r, tube, radial, tubular);
export const shieldGeo = (width = 0.58, height = 0.92, depth = 0.08) => {
  const s = new THREE.Shape();
  s.moveTo(-width * 0.5, height * 0.35); s.lineTo(-width * 0.42, height * 0.5);
  s.lineTo(width * 0.42, height * 0.5); s.lineTo(width * 0.5, height * 0.35);
  s.lineTo(width * 0.42, -height * 0.20); s.lineTo(0, -height * 0.5);
  s.lineTo(-width * 0.42, -height * 0.20); s.closePath();
  return new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSegments: 1, bevelSize: 0.025, bevelThickness: 0.018 });
};

// ---- Animation: full-body multi-track clips ----
function quatTrack(bone, times, eulers) {
  const q = new THREE.Quaternion(); const e = new THREE.Euler();
  const values = [];
  for (const [x, y, z] of eulers) { e.set(x, y, z); q.setFromEuler(e); values.push(q.x, q.y, q.z, q.w); }
  return new THREE.QuaternionKeyframeTrack(`${bone}.quaternion`, times, values);
}

export function clip(name, duration, specs) {
  const tracks = specs.map(([bone, times, eulers]) => quatTrack(bone, times, eulers));
  return new THREE.AnimationClip(name, duration, tracks);
}

// Full-body pose library. Each entry animates 15+ bones so clips are true character actions.
export const ACTIONS = {
  idle: () => clip('idle', 2.0, [
    ['Arm_L', [0, 0.5, 1, 1.5, 2], [[0, 0.05, 0], [0, 0.09, 0], [0, 0.05, 0], [0, 0.02, 0], [0, 0.05, 0]]],
    ['Arm_R', [0, 0.5, 1, 1.5, 2], [[0, -0.04, 0], [0, -0.08, 0], [0, -0.04, 0], [0, -0.01, 0], [0, -0.04, 0]]],
    ['Forearm_L', [0, 1, 2], [[0, 0.03, 0], [0, 0.01, 0], [0, 0.03, 0]]],
    ['Forearm_R', [0, 1, 2], [[0, -0.02, 0], [0, 0, 0], [0, -0.02, 0]]],
    ['Spine', [0, 1, 2], [[0.02, 0, 0], [0.04, 0, 0], [0.02, 0, 0]]],
    ['Spine1', [0, 1, 2], [[0.01, 0, 0], [0.02, 0, 0], [0.01, 0, 0]]],
    ['Spine2', [0, 1, 2], [[0.01, 0, 0], [0.02, 0, 0], [0.01, 0, 0]]],
    ['Neck', [0, 1, 2], [[-0.01, 0, 0], [-0.02, 0, 0], [-0.01, 0, 0]]],
    ['Head', [0, 1, 2], [[0.01, 0, 0], [0.02, 0, 0], [0.01, 0, 0]]],
    ['Hips', [0, 1, 2], [[0, 0, 0], [0, 0.01, 0], [0, 0, 0]]],
    ['Leg_L', [0, 1, 2], [[0.01, 0, 0], [-0.01, 0, 0], [0.01, 0, 0]]],
    ['Leg_R', [0, 1, 2], [[-0.01, 0, 0], [0.01, 0, 0], [-0.01, 0, 0]]],
    ['Shoulder_L', [0, 1, 2], [[0.02, 0, 0], [0.03, 0, 0], [0.02, 0, 0]]],
    ['Shoulder_R', [0, 1, 2], [[-0.02, 0, 0], [-0.03, 0, 0], [-0.02, 0, 0]]],
  ]),
  move: () => clip('move', 0.9, [
    ['Leg_L', [0, 0.225, 0.45, 0.675, 0.9], [[0.25, 0, 0], [-0.25, 0, 0], [0.25, 0, 0], [-0.25, 0, 0], [0.25, 0, 0]]],
    ['Leg_R', [0, 0.225, 0.45, 0.675, 0.9], [[-0.25, 0, 0], [0.25, 0, 0], [-0.25, 0, 0], [0.25, 0, 0], [-0.25, 0, 0]]],
    ['Shin_L', [0, 0.45, 0.9], [[-0.30, 0, 0], [-0.05, 0, 0], [-0.30, 0, 0]]],
    ['Shin_R', [0, 0.45, 0.9], [[-0.05, 0, 0], [-0.30, 0, 0], [-0.05, 0, 0]]],
    ['Arm_L', [0, 0.225, 0.45, 0.675, 0.9], [[-0.20, 0, 0], [0.20, 0, 0], [-0.20, 0, 0], [0.20, 0, 0], [-0.20, 0, 0]]],
    ['Arm_R', [0, 0.225, 0.45, 0.675, 0.9], [[0.20, 0, 0], [-0.20, 0, 0], [0.20, 0, 0], [-0.20, 0, 0], [0.20, 0, 0]]],
    ['Forearm_L', [0, 0.45, 0.9], [[0.10, 0, 0], [-0.10, 0, 0], [0.10, 0, 0]]],
    ['Forearm_R', [0, 0.45, 0.9], [[-0.10, 0, 0], [0.10, 0, 0], [-0.10, 0, 0]]],
    ['Shoulder_L', [0, 0.45, 0.9], [[0.10, 0, 0], [-0.10, 0, 0], [0.10, 0, 0]]],
    ['Shoulder_R', [0, 0.45, 0.9], [[-0.10, 0, 0], [0.10, 0, 0], [-0.10, 0, 0]]],
    ['Hips', [0, 0.45, 0.9], [[0, 0, 0], [0, 0.02, 0], [0, 0, 0]]],
    ['Spine', [0, 0.45, 0.9], [[0.02, 0, 0], [0.04, 0, 0], [0.02, 0, 0]]],
    ['Spine2', [0, 0.45, 0.9], [[0.02, 0, 0], [0.04, 0, 0], [0.02, 0, 0]]],
    ['Head', [0, 0.45, 0.9], [[0.01, 0, 0], [0.02, 0, 0], [0.01, 0, 0]]],
  ]),
  attack_health: () => clip('attack_health', 0.9, [
    ['Arm_R', [0, 0.25, 0.5, 0.9], [[0, -0.30, 0], [0, 1.10, 0], [0, -0.50, 0], [0, -0.10, 0]]],
    ['Forearm_R', [0, 0.25, 0.5, 0.9], [[0.15, 0, 0], [-0.40, 0, 0], [0.30, 0, 0], [0.05, 0, 0]]],
    ['Shoulder_R', [0, 0.25, 0.9], [[0.15, 0, 0], [-0.20, 0, 0], [0, 0, 0]]],
    ['Spine2', [0, 0.25, 0.5, 0.9], [[0, 0.20, 0], [0, -0.35, 0], [0, 0.20, 0], [0, 0, 0]]],
    ['Spine', [0, 0.5, 0.9], [[0, 0.10, 0], [0, -0.15, 0], [0, 0, 0]]],
    ['Hips', [0, 0.25, 0.9], [[0, 0.10, 0], [0, -0.15, 0], [0, 0, 0]]],
    ['Arm_L', [0, 0.5, 0.9], [[0, 0.10, 0], [0, -0.20, 0], [0, 0, 0]]],
    ['Forearm_L', [0, 0.5, 0.9], [[0, 0, 0], [0, 0.10, 0], [0, 0, 0]]],
    ['Leg_L', [0, 0.5, 0.9], [[0.10, 0, 0], [-0.10, 0, 0], [0, 0, 0]]],
    ['Leg_R', [0, 0.5, 0.9], [[-0.10, 0, 0], [0.10, 0, 0], [0, 0, 0]]],
    ['Neck', [0, 0.5, 0.9], [[0, 0, 0], [-0.05, 0, 0], [0, 0, 0]]],
    ['Head', [0, 0.5, 0.9], [[0, 0, 0], [-0.08, 0, 0], [0, 0, 0]]],
  ]),
  attack_faith: () => clip('attack_faith', 1.0, [
    ['Arm_R', [0, 0.3, 0.6, 1.0], [[0, 0, 0], [-1.20, 0, 0], [-0.80, 0, 0], [-0.10, 0, 0]]],
    ['Arm_L', [0, 0.3, 0.6, 1.0], [[0, 0, 0], [-0.90, 0, 0], [-0.50, 0, 0], [-0.05, 0, 0]]],
    ['Forearm_R', [0, 0.6, 1.0], [[0, 0, 0], [-0.30, 0, 0], [0, 0, 0]]],
    ['Forearm_L', [0, 0.6, 1.0], [[0, 0, 0], [-0.25, 0, 0], [0, 0, 0]]],
    ['Shoulder_R', [0, 0.3, 1.0], [[0, 0, 0], [-0.30, 0, 0], [0, 0, 0]]],
    ['Shoulder_L', [0, 0.3, 1.0], [[0, 0, 0], [-0.25, 0, 0], [0, 0, 0]]],
    ['Spine2', [0, 0.6, 1.0], [[0, 0, 0], [0, 0.15, 0], [0, 0, 0]]],
    ['Spine', [0, 0.6, 1.0], [[0, 0, 0], [0, 0.08, 0], [0, 0, 0]]],
    ['Hips', [0, 0.6, 1.0], [[0.03, 0, 0], [0, 0, 0], [0.03, 0, 0]]],
    ['Head', [0, 0.6, 1.0], [[0, 0, 0], [-0.12, 0, 0], [0, 0, 0]]],
    ['Neck', [0, 0.6, 1.0], [[0, 0, 0], [-0.10, 0, 0], [0, 0, 0]]],
  ]),
  hit_health: () => clip('hit_health', 0.5, [
    ['Spine2', [0, 0.15, 0.5], [[0, 0, 0], [0, 0, -0.25], [0, 0, 0]]],
    ['Spine', [0, 0.15, 0.5], [[0, 0, 0], [0, 0, -0.15], [0, 0, 0]]],
    ['Hips', [0, 0.15, 0.5], [[0, 0, 0], [0, 0, -0.08], [0, 0, 0]]],
    ['Head', [0, 0.15, 0.5], [[0, 0, 0], [-0.18, 0, 0], [0, 0, 0]]],
    ['Neck', [0, 0.15, 0.5], [[0, 0, 0], [-0.12, 0, 0], [0, 0, 0]]],
    ['Arm_L', [0, 0.15, 0.5], [[0, 0.05, 0], [0, -0.15, 0], [0, 0, 0]]],
    ['Arm_R', [0, 0.15, 0.5], [[0, -0.05, 0], [0, -0.15, 0], [0, 0, 0]]],
  ]),
  hit_faith: () => clip('hit_faith', 0.5, [
    ['Head', [0, 0.15, 0.5], [[0, 0, 0], [0.22, 0, 0], [0, 0, 0]]],
    ['Neck', [0, 0.15, 0.5], [[0, 0, 0], [0.14, 0, 0], [0, 0, 0]]],
    ['Spine2', [0, 0.15, 0.5], [[0, 0, 0], [-0.15, 0, -0.10], [0, 0, 0]]],
    ['Arm_L', [0, 0.15, 0.5], [[0, 0, 0], [0.20, 0, 0], [0, 0, 0]]],
    ['Arm_R', [0, 0.15, 0.5], [[0, 0, 0], [0.20, 0, 0], [0, 0, 0]]],
  ]),
  death_health: () => clip('death_health', 1.0, [
    ['Root', [0, 0.25, 0.5, 1.0], [[0, 0, 0], [-0.30, 0, 0], [-0.70, 0, 0], [-1.35, 0, 0]]],
    ['Arm_L', [0, 0.5, 1.0], [[0, 0, 0], [0.40, 0, 0], [0.60, 0, 0]]],
    ['Arm_R', [0, 0.5, 1.0], [[0, 0, 0], [-0.40, 0, 0], [-0.60, 0, 0]]],
    ['Leg_L', [0, 0.5, 1.0], [[0, 0, 0], [0.20, 0, 0], [0.30, 0, 0]]],
    ['Leg_R', [0, 0.5, 1.0], [[0, 0, 0], [-0.20, 0, 0], [-0.30, 0, 0]]],
    ['Head', [0, 0.5, 1.0], [[0, 0, 0], [-0.20, 0, 0], [-0.30, 0, 0]]],
  ]),
  death_faith: () => clip('death_faith', 1.0, [
    ['Root', [0, 0.25, 0.5, 1.0], [[0, 0, 0], [0.30, 0, 0], [0.70, 0, 0], [1.35, 0, 0]]],
    ['Arm_L', [0, 0.5, 1.0], [[0, 0, 0], [0.35, 0, 0], [0.55, 0, 0]]],
    ['Arm_R', [0, 0.5, 1.0], [[0, 0, 0], [-0.35, 0, 0], [-0.55, 0, 0]]],
    ['Leg_L', [0, 0.5, 1.0], [[0, 0, 0], [0.15, 0, 0], [0.25, 0, 0]]],
    ['Leg_R', [0, 0.5, 1.0], [[0, 0, 0], [-0.15, 0, 0], [-0.25, 0, 0]]],
    ['Spine2', [0, 0.5, 1.0], [[0, 0, 0], [0.30, 0, 0], [0.50, 0, 0]]],
    ['Head', [0, 0.5, 1.0], [[0, 0, 0], [0.25, 0, 0], [0.40, 0, 0]]],
  ]),
  skill: () => clip('skill', 1.1, [
    ['Arm_L', [0, 0.3, 0.7, 1.1], [[0, 0, 0], [0, 0, -1.00], [0, 0, -0.60], [0, 0, -0.05]]],
    ['Arm_R', [0, 0.3, 0.7, 1.1], [[0, 0, 0], [0, 0, 1.00], [0, 0, 0.60], [0, 0, 0.05]]],
    ['Forearm_L', [0, 0.3, 1.1], [[0, 0, 0], [0, 0, -0.30], [0, 0, 0]]],
    ['Forearm_R', [0, 0.3, 1.1], [[0, 0, 0], [0, 0, 0.30], [0, 0, 0]]],
    ['Shoulder_L', [0, 0.3, 1.1], [[0, 0, 0], [0, 0, -0.30], [0, 0, 0]]],
    ['Shoulder_R', [0, 0.3, 1.1], [[0, 0, 0], [0, 0, 0.30], [0, 0, 0]]],
    ['Spine2', [0, 0.3, 0.7, 1.1], [[0, 0, 0], [0, 0.20, 0], [0, -0.20, 0], [0, 0, 0]]],
    ['Spine', [0, 0.7, 1.1], [[0, 0, 0], [0, 0.10, 0], [0, 0, 0]]],
    ['Hips', [0, 0.7, 1.1], [[0, 0, 0], [0, 0.06, 0], [0, 0, 0]]],
    ['Head', [0, 0.7, 1.1], [[0, 0, 0], [-0.10, 0, 0], [0, 0, 0]]],
    ['Neck', [0, 0.7, 1.1], [[0, 0, 0], [-0.06, 0, 0], [0, 0, 0]]],
  ]),
  phase_transition: () => clip('phase_transition', 1.2, [
    ['Spine2', [0, 0.4, 0.8, 1.2], [[0, 0, 0], [0, 0.35, 0], [0, -0.35, 0], [0, 0, 0]]],
    ['Spine', [0, 0.8, 1.2], [[0, 0, 0], [0, 0.20, 0], [0, 0, 0]]],
    ['Hips', [0, 0.8, 1.2], [[0, 0, 0], [0, 0.12, 0], [0, 0, 0]]],
    ['Arm_L', [0, 0.4, 1.2], [[0, 0, 0], [0, 0, -0.90], [0, 0, 0]]],
    ['Arm_R', [0, 0.4, 1.2], [[0, 0, 0], [0, 0, 0.90], [0, 0, 0]]],
    ['Forearm_L', [0, 0.4, 1.2], [[0, 0, 0], [0, 0, -0.30], [0, 0, 0]]],
    ['Forearm_R', [0, 0.4, 1.2], [[0, 0, 0], [0, 0, 0.30], [0, 0, 0]]],
    ['Head', [0, 0.8, 1.2], [[0, 0, 0], [-0.15, 0, 0], [0, 0, 0]]],
    ['Neck', [0, 0.8, 1.2], [[0, 0, 0], [-0.10, 0, 0], [0, 0, 0]]],
    ['Leg_L', [0, 0.8, 1.2], [[0, 0, 0], [0.10, 0, 0], [0, 0, 0]]],
    ['Leg_R', [0, 0.8, 1.2], [[0, 0, 0], [-0.10, 0, 0], [0, 0, 0]]],
  ]),
};

export function buildClips(actionNames) {
  return actionNames.map((name) => (ACTIONS[name] ?? ACTIONS.idle)());
}

// Standard character sockets, per the runtime contract.
export function addStandardAnchors({ anchor }) {
  anchor('Head', 'HeadAnchor', [0, 0.1, 0.1]);
  anchor('Hand_R', 'WeaponAnchor', [0, -0.55, 0.04]);
  anchor('Spine2', 'HitAnchor', [0, 0.1, 0.28]);
  anchor('Root', 'FootAnchor', [0, 0.02, 0]);
  anchor('Hand_R', 'FxWeapon', [0, -0.4, 0.04]);
}
