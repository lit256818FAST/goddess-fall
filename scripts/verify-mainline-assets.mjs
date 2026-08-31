import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const modelDir = path.join(root, 'public', 'assets', 'models', 'mainline');
const manifestPath = path.join(modelDir, 'manifest.json');
const expected = ['arthur', 'hans', 'asnoka'];
const actions = ['idle', 'move', 'attack_health', 'attack_faith', 'hit_health', 'hit_faith', 'death_health', 'death_faith', 'skill'];
const expectedBosses = ['boss-white-knight', 'boss-night-judge', 'boss-lake-god-a', 'boss-lake-god-b'];
const bossActions = {
  'boss-white-knight': ['idle', 'move', 'attack_health', 'hit_health', 'death_health', 'phase_transition'],
  'boss-night-judge': ['idle', 'move', 'attack_faith', 'hit_faith', 'death_faith', 'phase_transition'],
  'boss-lake-god-a': ['idle', 'move', 'attack_faith', 'hit_faith', 'death_faith', 'phase_transition'],
  'boss-lake-god-b': ['idle', 'move', 'attack_faith', 'hit_faith', 'death_faith', 'phase_transition'],
};
const bossActionAliases = {
  'boss-night-judge': {
    attack_faith: ['attack_faith', 'attack_health'],
    hit_faith: ['hit_faith', 'hit_health'],
    death_faith: ['death_faith', 'death_health'],
  },
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

function assetFile(runtimePath) {
  const normalized = runtimePath.replace(/^\//, '').replaceAll('/', path.sep);
  return path.join(root, normalized.startsWith(`public${path.sep}`) ? normalized : `public${path.sep}${normalized}`);
}

if (!fs.existsSync(manifestPath)) throw new Error('mainline manifest.json missing');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const entries = new Map((manifest.models ?? []).map((entry) => [entry.id, entry]));
const report = [];

for (const id of expected) {
  const entry = entries.get(id);
  if (!entry) throw new Error(`manifest entry missing: ${id}`);
  const file = assetFile(entry.modelPath);
  if (!fs.existsSync(file)) throw new Error(`model missing: ${entry.modelPath}`);
  const json = readGlbJson(file);
  const clips = (json.animations ?? []).map((animation) => ({ name: animation.name, channels: animation.channels?.length ?? 0 }));
  const missing = actions.filter((action) => !clips.some((clip) => clip.name === action && clip.channels > 0));
  if (missing.length) throw new Error(`${id}: animation channels missing for ${missing.join(', ')}`);
  const bytes = fs.statSync(file).size;
  if (bytes > 800 * 1024) throw new Error(`${id}: ${bytes} bytes exceeds 800KB hero budget`);
  report.push({ id, bytes, animations: clips });
}

const bossEntries = new Map((manifest.bosses ?? []).map((entry) => [entry.id, entry]));
for (const id of expectedBosses) {
  const entry = bossEntries.get(id);
  if (!entry) throw new Error(`boss manifest entry missing: ${id}`);
  const file = assetFile(entry.modelPath);
  if (!fs.existsSync(file)) throw new Error(`boss model missing: ${entry.modelPath}`);
  const json = readGlbJson(file);
  const clips = (json.animations ?? []).map((animation) => ({ name: animation.name, channels: animation.channels?.length ?? 0 }));
  const resolved = {};
  const missing = (bossActions[id] ?? []).filter((action) => {
    const candidates = bossActionAliases[id]?.[action] ?? [action];
    const match = candidates.find((candidate) => clips.some((clip) => clip.name === candidate && clip.channels > 0));
    if (match) resolved[action] = match;
    return !match;
  });
  if (missing.length) throw new Error(`${id}: boss animation channels missing for ${missing.join(', ')}`);
  const phaseNodes = new Set((json.nodes ?? []).map((node) => node.name));
  if (!phaseNodes.has('Phase1Parts') || !phaseNodes.has('Phase2Parts')) throw new Error(`${id}: phase nodes missing`);
  const bytes = fs.statSync(file).size;
  if (bytes > 1.5 * 1024 * 1024) throw new Error(`${id}: ${bytes} bytes exceeds 1.5MB boss budget`);
  report.push({ id, bytes, animations: clips, resolvedActions: resolved, phases: ['Phase1Parts', 'Phase2Parts'] });
}

console.log(JSON.stringify({ ok: true, source: manifest.source, models: report }, null, 2));
