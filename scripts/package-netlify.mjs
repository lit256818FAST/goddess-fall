import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const dist = join(root, 'dist');
const out = join(root, 'dist-netlify');
if (!existsSync(join(dist, 'index.html'))) throw new Error('请先运行 npm run build。');
if (existsSync(out)) rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(join(dist, 'index.html'), join(out, 'index.html'));
cpSync(join(dist, 'assets'), join(out, 'assets'), { recursive: true });
writeFileSync(join(out, '_headers'), '/assets/*\n  Cache-Control: public,max-age=31536000,immutable\n\n/index.html\n  Cache-Control: no-cache\n', 'utf8');
console.log(`Netlify deploy package ready: ${out}`);
console.log(`Files: ${readdirSync(join(out, 'assets')).length} assets (loaded on demand)`);
