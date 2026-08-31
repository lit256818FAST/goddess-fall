import fs from 'node:fs';

function readGlbJson(file) {
  const buffer = fs.readFileSync(file);
  let off = 12;
  while (off + 8 <= buffer.length) {
    const len = buffer.readUInt32LE(off);
    const type = buffer.readUInt32LE(off + 4);
    if (type === 0x4e4f534a) return JSON.parse(buffer.subarray(off + 8, off + 8 + len).toString('utf8'));
    off += 8 + len;
  }
  throw new Error('no JSON chunk');
}

const models = [
  'public/assets/models/heroes/unflagged.glb',
  'public/assets/models/heroes/seraphina.glb',
  'public/assets/models/heroes/reina.glb',
  'public/assets/models/heroes/odric.glb',
  'public/assets/models/heroes/cole.glb',
  'public/assets/models/heroes/agnes.glb',
  'public/assets/models/bosses/odric-judgment.glb',
  'public/assets/models/bosses/veiled-avatar.glb',
];
for (const rel of models) {
  const json = readGlbJson(rel);
  const nodes = json.nodes ?? [];
  const materials = (json.materials ?? []).map((m) => ({
    name: m.name,
    base: m.pbrMetallicRoughness?.baseColorFactor?.map((v) => +v.toFixed(2)) ?? null,
    metal: m.pbrMetallicRoughness?.metallicFactor ?? null,
    rough: m.pbrMetallicRoughness?.roughnessFactor ?? null,
    baseTex: m.pbrMetallicRoughness?.baseColorTexture?.index ?? null,
    emissive: m.emissiveFactor?.map((v) => +v.toFixed(2)) ?? null,
    emissiveTex: m.emissiveTexture?.index ?? null,
    doubleSided: m.doubleSided ?? false,
  }));
  const images = (json.images ?? []).map((i) => ({ name: i.name ?? '(unnamed)', mime: i.mimeType, hasBufferView: i.bufferView != null, uri: i.uri ?? null }));
  const bones = new Set();
  for (const s of json.skins ?? []) for (const j of s.joints ?? []) bones.add(nodes[j]?.name);
  const meshes = (json.meshes ?? []).map((m) => ({ name: m.name ?? '(unnamed)', prims: m.primitives.length }));
  const clips = (json.animations ?? []).map((a) => `${a.name}:${a.channels?.length ?? 0}`);
  const anchors = nodes.filter((n) => /Anchor|Fx/i.test(n.name ?? '')).map((n) => n.name);
  const size = fs.statSync(rel).size;
  console.log(JSON.stringify({
    rel: rel.replace('public/assets/models/', ''),
    size,
    bones: bones.size,
    boneSample: [...bones].slice(0, 6),
    meshes,
    materials,
    images,
    clips,
    anchors,
  }));
}
