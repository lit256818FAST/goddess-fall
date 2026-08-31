import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const dist = resolve(projectRoot, 'dist');
const input = join(dist, 'index.html');
if (!existsSync(input)) throw new Error('dist/index.html 不存在，请先运行 npm run build。');

const mime = {
  '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.glb': 'model/gltf-binary',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
};
const assets = [];
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (relative(dist, full).replaceAll('\\', '/').startsWith('assets/')) assets.push(full);
  }
}
walk(dist);
const embedded = new Map();
for (const file of assets) {
  const rel = relative(dist, file).replaceAll('\\', '/');
  const key = `/${rel}`;
  const ext = file.slice(file.lastIndexOf('.')).toLowerCase();
  const type = mime[ext] ?? 'application/octet-stream';
  const data = `data:${type};base64,${readFileSync(file).toString('base64')}`;
  // Runtime catalogs may use URL-encoded paths (notably MP3 filenames with
  // spaces). Keep both spellings so a direct file:// HTML has no missing
  // lazy-loaded asset.
  embedded.set(key, data);
  embedded.set(encodeURI(key), data);
}

function inlinePaths(text) {
  let result = text;
  for (const [key, data] of [...embedded].sort((a, b) => b[0].length - a[0].length)) result = result.split(key).join(data);
  return result;
}

let html = readFileSync(input, 'utf8');
html = html.replace(/<link[^>]+href="(\/assets\/[^\"]+\.css)"[^>]*>/g, (_, href) => {
  const data = embedded.get(href);
  return data ? `<style>${Buffer.from(data.split(',')[1], 'base64').toString('utf8')}</style>` : _;
});
html = html.replace(/<script[^>]+src="(\/assets\/[^\"]+\.js)"[^>]*><\/script>/g, (_, href) => {
  const data = embedded.get(href);
  if (!data) return _;
  const js = Buffer.from(data.split(',')[1], 'base64').toString('utf8').replace(/<\/script/gi, '<\\/script');
  return `<script type="module">${js}</script>`;
});
html = inlinePaths(html);

const output = join(dist, '女神之殇-单文件.html');
writeFileSync(output, `<!-- 女神之殇：无旗者 · 单文件便携版 -->\n${html}`, 'utf8');
const bytes = statSync(output).size;
console.log(`single-file package ready: ${output} (${(bytes / 1024 / 1024).toFixed(2)}MB, ${assets.length} embedded assets)`);
