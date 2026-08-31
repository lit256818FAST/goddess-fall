import fs from 'node:fs';
import path from 'node:path';

// Re-color a K3 GLB by multiplying the material base color (baseColorFactor)
// and re-serialize it to a new path. Geometry + embedded PNG atlas + animations
// are carried over byte-for-byte in the BIN chunk.

function readGlb(file) {
  const b = fs.readFileSync(file);
  if (b.toString('ascii', 0, 4) !== 'glTF') throw new Error(`${file}: not a GLB`);
  let off = 12; let json = null, jsonDataLen = 0, binChunk = null;
  while (off + 8 <= b.length) {
    const len = b.readUInt32LE(off);
    const type = b.readUInt32LE(off + 4);
    if (type === 0x4e4f534a) { // JSON
      jsonDataLen = len;
      json = JSON.parse(b.subarray(off + 8, off + 8 + len).toString('utf8').replace(/\0/g, ''));
    } else if (type === 0x004e4942) { // BIN
      binChunk = b.subarray(off, off + 8 + len);
      break;
    }
    off += 8 + len;
  }
  if (!json) throw new Error(`${file}: no JSON chunk`);
  return { json, binChunk };
}

function heightOf(json) {
  let maxY = -Infinity, minY = Infinity;
  for (const mesh of json.meshes ?? []) {
    for (const prim of mesh.primitives ?? []) {
      const posIdx = prim.attributes?.POSITION;
      if (posIdx == null) continue;
      const acc = json.accessors[posIdx];
      if (acc?.min && acc?.max) {
        minY = Math.min(minY, acc.min[1]);
        maxY = Math.max(maxY, acc.max[1]);
      }
    }
  }
  return Number.isFinite(maxY) ? (maxY - minY) : null;
}

function tint(json, rgb) {
  for (const m of json.materials ?? []) {
    if (m.pbrMetallicRoughness) {
      m.pbrMetallicRoughness.baseColorFactor = [rgb[0], rgb[1], rgb[2], 1.0];
    }
  }
}

function writeGlb(dst, json, binChunk) {
  let jsonBuf = Buffer.from(JSON.stringify(json), 'utf8');
  const pad = (4 - (jsonBuf.length % 4)) % 4;
  if (pad > 0) jsonBuf = Buffer.concat([jsonBuf, Buffer.from(' '.repeat(pad))]);
  const jsonDataLen = jsonBuf.length;
  const total = 12 + 8 + jsonDataLen + (binChunk ? binChunk.length : 0);
  const out = Buffer.alloc(total);
  out.write('glTF', 0, 'ascii');
  out.writeUInt32LE(2, 4);
  out.writeUInt32LE(total, 8);
  out.writeUInt32LE(jsonDataLen, 12);
  out.writeUInt32LE(0x4e4f534a, 16);
  jsonBuf.copy(out, 20);
  if (binChunk) binChunk.copy(out, 20 + jsonDataLen);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.writeFileSync(dst, out);
  return out.length;
}

const ROOT = process.cwd();
const TARGET_HEIGHT = { hero: 1.75, boss: 1.95 };
const JOBS = [
  // heroes: K3 base + distinct faction tint
  { id: 'arthur', src: 'public/assets/models/heroes/unflagged.glb', dst: 'public/assets/models/mainline/arthur.glb', tint: [0.80, 0.85, 1.00], kind: 'hero' },
  { id: 'hans', src: 'public/assets/models/heroes/odric.glb', dst: 'public/assets/models/mainline/hans.glb', tint: [0.95, 0.70, 0.60], kind: 'hero' },
  { id: 'asnoka', src: 'public/assets/models/heroes/cole.glb', dst: 'public/assets/models/mainline/asnoka.glb', tint: [0.65, 0.92, 0.68], kind: 'hero' },
  // bosses: K3 boss bases + phase nodes preserved
  { id: 'boss-white-knight', src: 'public/assets/models/bosses/odric-judgment.glb', dst: 'public/assets/models/mainline/boss-white-knight.glb', tint: [1.00, 0.96, 0.85], kind: 'boss' },
  { id: 'boss-night-judge', src: 'public/assets/models/bosses/odric-judgment.glb', dst: 'public/assets/models/mainline/boss-night-judge.glb', tint: [0.42, 0.40, 0.58], kind: 'boss' },
  // Lake gods + enemies stay procedural (veiled-avatar lacks the full boss action set; enemies are budget-capped at 256KB).
];

const rows = [];
for (const job of JOBS) {
  const srcPath = path.join(ROOT, job.src);
  const { json, binChunk } = readGlb(srcPath);
  const height = heightOf(json);
  tint(json, job.tint);
  const dstPath = path.join(ROOT, job.dst);
  const bytes = writeGlb(dstPath, json, binChunk);
  const visualScale = height ? +(TARGET_HEIGHT[job.kind] / height).toFixed(4) : null;
  rows.push({ id: job.id, src: job.src, dst: job.dst, bytes, height: height ? +height.toFixed(3) : null, visualScale, tint: job.tint });
}
console.log(JSON.stringify(rows, null, 2));
