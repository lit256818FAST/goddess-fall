import * as THREE from 'three';

export type FxTween = (duration: number, update: (t: number) => void, done: () => void) => void;

type FxContext = { scene: THREE.Scene; tween: FxTween };

function disposeGroup(scene: THREE.Scene, group: THREE.Group) {
  scene.remove(group);
  group.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => material.dispose());
  });
}

function basicMaterial(color: number, opacity = 0.9) {
  return new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
}

/** Reusable low-poly movement feedback: three fading dust puffs at the feet. */
export function moveDust({ scene, tween }: FxContext, position: THREE.Vector3) {
  const group = new THREE.Group();
  for (let index = 0; index < 3; index += 1) {
    const puff = new THREE.Mesh(new THREE.CircleGeometry(0.08 + index * 0.018, 8), basicMaterial(0xb8a98f, 0.42));
    puff.rotation.x = -Math.PI / 2;
    puff.position.set((index - 1) * 0.12, 0.035, (index % 2 ? 0.06 : -0.04));
    group.add(puff);
  }
  group.position.copy(position);
  scene.add(group);
  tween(260, (t) => {
    group.scale.setScalar(0.75 + t * 1.7);
    group.position.y = t * 0.08;
    group.children.forEach((child, index) => {
      const material = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      material.opacity = 0.42 * (1 - t) * (1 - index * 0.12);
    });
  }, () => disposeGroup(scene, group));
}

/** Reusable physical hit template: a warm ring plus two small impact wedges. */
export function healthImpact({ scene, tween }: FxContext, position: THREE.Vector3, direction: THREE.Vector3) {
  const group = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.14, 0.24, 12), basicMaterial(0xff8066, 0.95));
  ring.rotation.x = -Math.PI / 2;
  group.add(ring);
  for (let index = 0; index < 2; index += 1) {
    const spark = new THREE.Mesh(new THREE.TetrahedronGeometry(0.07, 0), basicMaterial(0xffc06b, 0.9));
    spark.position.set((index ? -1 : 1) * 0.12, 0.2, 0);
    group.add(spark);
  }
  group.position.copy(position);
  group.rotation.y = Math.atan2(direction.z, direction.x);
  scene.add(group);
  tween(300, (t) => {
    group.scale.setScalar(0.8 + t * 1.35);
    group.children.forEach((child, index) => {
      const material = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      material.opacity = (index === 0 ? 0.95 : 0.9) * (1 - t);
    });
  }, () => disposeGroup(scene, group));
}

/** Reusable melee arc template, shared by heroes and every physical minion. */
export function healthSlash({ scene, tween }: FxContext, position: THREE.Vector3, direction: THREE.Vector3) {
  const group = new THREE.Group();
  const arc = new THREE.Mesh(new THREE.RingGeometry(0.34, 0.42, 16, 1, -Math.PI * 0.34, Math.PI * 0.68), basicMaterial(0xffb36e, 0.9));
  arc.rotation.x = -Math.PI / 2;
  arc.rotation.z = Math.atan2(direction.z, direction.x);
  group.add(arc);
  group.position.copy(position).add(new THREE.Vector3(0, 0.42, 0));
  scene.add(group);
  tween(260, (t) => {
    group.scale.setScalar(0.55 + t * 1.2);
    (arc.material as THREE.MeshBasicMaterial).opacity = 0.9 * (1 - t);
    group.rotation.y = t * 0.22;
  }, () => disposeGroup(scene, group));
}

/** Reusable faith template: concentric halo and a short vertical light column. */
export function faithBurst({ scene, tween }: FxContext, position: THREE.Vector3) {
  const group = new THREE.Group();
  const outer = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.045, 6, 20), basicMaterial(0xffefb0, 0.85));
  outer.rotation.x = Math.PI / 2;
  const inner = new THREE.Mesh(new THREE.RingGeometry(0.08, 0.13, 18), basicMaterial(0xc7e9ff, 0.82));
  inner.rotation.x = -Math.PI / 2;
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.14, 0.8, 8), basicMaterial(0xfff2c4, 0.32));
  beam.position.y = 0.4;
  group.add(outer, inner, beam);
  group.position.copy(position);
  scene.add(group);
  tween(460, (t) => {
    group.scale.setScalar(0.7 + t * 2.4);
    outer.rotation.z = t * 1.5;
    inner.rotation.z = -t * 2.2;
    group.children.forEach((child) => ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity *= 1 - t);
  }, () => disposeGroup(scene, group));
}

/** Reusable skill template for support/caster actions, distinct from ordinary attacks. */
export function skillPulse({ scene, tween }: FxContext, position: THREE.Vector3, color = 0x8fe8d9) {
  const group = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 6, 18), basicMaterial(color, 0.88));
  ring.rotation.x = Math.PI / 2;
  const glyph = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), basicMaterial(0xf3f7df, 0.75));
  glyph.position.y = 0.28;
  group.add(ring, glyph);
  group.position.copy(position);
  scene.add(group);
  tween(520, (t) => {
    group.scale.setScalar(0.55 + t * 1.5);
    glyph.rotation.y = t * Math.PI * 2;
    group.children.forEach((child) => ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.88 * (1 - t));
  }, () => disposeGroup(scene, group));
}

/** Reusable defeat template: a dark ring marks the unit's last tile before it fades. */
export function deathBurst({ scene, tween }: FxContext, position: THREE.Vector3, color = 0xa74343) {
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.3, 12), basicMaterial(color, 0.72));
  ring.rotation.x = -Math.PI / 2;
  ring.position.copy(position).setY(0.05);
  scene.add(ring);
  tween(620, (t) => {
    ring.scale.setScalar(0.8 + t * 1.3);
    (ring.material as THREE.MeshBasicMaterial).opacity = 0.72 * (1 - t);
  }, () => {
    scene.remove(ring);
    ring.geometry.dispose();
    (ring.material as THREE.Material).dispose();
  });
}
