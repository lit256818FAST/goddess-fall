import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const modelDir = path.join(root, 'model-inventory', 'assets', 'models', 'enemies', 'mainline');
const manifestPath = path.join(modelDir, 'manifest.json');
const expected = {
  'shield-guard': ['idle', 'move', 'attack_health', 'hit_health', 'death_health'],
  scout: ['idle', 'move', 'attack_health', 'hit_health', 'death_health'],
  'faith-acolyte': ['idle', 'move', 'attack_faith', 'hit_health', 'death_health'],
  engineer: ['idle', 'move', 'attack_health', 'hit_health', 'death_health'],
  'raider-rider': ['idle', 'move', 'attack_health', 'hit_health', 'death_health'],
};

function readGlbJson(file) {
  const buffer = fs.readFileSync(file);
  if (buffer.toString('ascii', 0, 4) !== 'glTF') throw new Error(`${file}: not a GLB`);
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32LE(offset);
    const type = buffer.readUInt32LE(offset + 4);
    if (type === 0x4e4f534a) return JSON.parse(buffer.subarray(offset + 8, offset + 8 + length).toString('utf8'));
    offset += 8 + length;
  }
  throw new Error(`${file}: JSON chunk missing`);
}

if (!fs.existsSync(manifestPath)) throw new Error('mainline enemy manifest.json missing');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const entries = new Map((manifest.models ?? []).map((entry) => [entry.id, entry]));
const report = [];
for (const [id, actions] of Object.entries(expected)) {
  const entry = entries.get(id);
  if (!entry) throw new Error(`manifest entry missing: ${id}`);
  const file = path.join(root, 'model-inventory', entry.modelPath.replace(/^\//, '').replaceAll('/', path.sep).replace(/^assets[\\/]models[\\/]/, 'assets\\models\\'));
  if (!fs.existsSync(file)) throw new Error(`model missing: ${entry.modelPath}`);
  const json = readGlbJson(file);
  const clips = (json.animations ?? []).map((animation) => ({ name: animation.name, channels: animation.channels?.length ?? 0 }));
  const missing = actions.filter((action) => !clips.some((clip) => clip.name === action && clip.channels > 0));
  if (missing.length) throw new Error(`${id}: missing animation channels ${missing.join(', ')}`);
  const nodes = new Set((json.nodes ?? []).map((node) => node.name));
  for (const socket of entry.sockets ?? []) if (!nodes.has(socket)) throw new Error(`${id}: socket node missing ${socket}`);
  const bytes = fs.statSync(file).size;
  if (bytes > 256 * 1024) throw new Error(`${id}: ${bytes} bytes exceeds 256KB minion budget`);
  report.push({ id, bytes, animations: clips, mapsTo: entry.mapsTo });
}
console.log(JSON.stringify({ ok: true, source: manifest.source, models: report }, null, 2));
