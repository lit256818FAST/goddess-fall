import { readdir, readFile, writeFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const distRoot = fileURLToPath(new URL('../dist/', import.meta.url));
const textExtensions = new Set(['.html', '.css', '.js', '.mjs']);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (textExtensions.has(extname(entry.name).toLowerCase())) files.push(path);
  }
  return files;
}

const files = await walk(distRoot);
let changed = 0;
for (const file of files) {
  const extension = extname(file).toLowerCase();
  const before = await readFile(file, 'utf8');
  const after = extension === '.css'
    ? before
      .replace(/url\((['"])\/assets\//g, 'url($1../assets/')
      .replace(/url\(\/assets\//g, 'url(../assets/')
    : before.replace(/(["'`])\/assets\//g, '$1assets/');
  if (after !== before) {
    await writeFile(file, after, 'utf8');
    changed += 1;
  }
}

console.log(`GitHub Pages paths normalized in ${changed} dist file(s) from ${relative(process.cwd(), distRoot)}.`);
