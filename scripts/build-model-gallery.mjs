import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { build } from 'esbuild';

const root = resolve('.');
const dist = join(root, 'dist');
const assets = join(dist, 'assets');
await mkdir(assets, { recursive: true });
await cp(join(root, 'model-inventory', 'assets', 'models'), join(dist, 'model-inventory', 'assets', 'models'), { recursive: true });
// Keep esbuild's worker outside the CJK workspace path. The Windows binary
// can otherwise resolve the workspace parent as a package directory and fail
// before it reaches the actual entry file. The output is copied back through
// Node's filesystem API after the bundle completes.
const buildRoot = await fsTempRoot();
await cp(join(root, 'src'), join(buildRoot, 'src'), { recursive: true });
const buildOut = join(buildRoot, 'model-gallery.js');
try {
  await build({
    absWorkingDir: buildRoot,
    entryPoints: ['./src/model-gallery-entry.ts'],
    bundle: true,
    format: 'esm',
    target: 'es2022',
    outfile: buildOut,
    loader: { '.ts': 'ts', '.css': 'css' },
    logLevel: 'warning',
  });
  await writeFile(join(assets, 'model-gallery.js'), await readFile(buildOut));
  await writeFile(join(assets, 'model-gallery.css'), await readFile(join(buildRoot, 'model-gallery.css')));
} finally {
  await rm(buildRoot, { recursive: true, force: true });
}

const sourceHtml = await readFile(join(root, 'model-gallery.html'), 'utf8');
const productionHtml = sourceHtml
  .replace('<script type="module" src="/src/model-gallery-entry.ts"></script>', '<link rel="stylesheet" href="/assets/model-gallery.css"><script type="module" src="/assets/model-gallery.js"></script>');
await writeFile(join(dist, 'model-gallery.html'), productionHtml);
console.log('generated dist/model-gallery.html');

async function fsTempRoot() {
  const prefix = join(tmpdir(), 'goddess-fall-gallery-');
  const { mkdtemp } = await import('node:fs/promises');
  return mkdtemp(prefix);
}
