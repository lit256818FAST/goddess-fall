import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const bytesIn = (directory) => fs.existsSync(directory)
  ? fs.readdirSync(directory, { withFileTypes: true }).reduce((sum, entry) => {
      const target = path.join(directory, entry.name);
      return sum + (entry.isDirectory() ? bytesIn(target) : fs.statSync(target).size);
    }, 0)
  : 0;

const publicBytes = bytesIn(path.join(root, 'public'));
const distBytes = bytesIn(path.join(root, 'dist'));
const lazyPublicDirectory = path.join(root, 'public', 'assets', 'audio', 'music-lazy');
const lazyDistDirectory = path.join(root, 'dist', 'assets', 'audio', 'music-lazy');
const lazyImagesPublicDirectory = path.join(root, 'public', 'assets', 'images-lazy');
const lazyImagesDistDirectory = path.join(root, 'dist', 'assets', 'images-lazy');
const lazyPublicBytes = bytesIn(lazyPublicDirectory);
const lazyDistBytes = bytesIn(lazyDistDirectory);
const lazyImagesPublicBytes = bytesIn(lazyImagesPublicDirectory);
const lazyImagesDistBytes = bytesIn(lazyImagesDistDirectory);
const publicInitialBytes = publicBytes - lazyPublicBytes - lazyImagesPublicBytes;
const distInitialBytes = distBytes - lazyDistBytes - lazyImagesDistBytes;
const firstPlayableLimit = 20 * 1024 * 1024;
const fullCacheLimit = 100 * 1024 * 1024;
if (publicInitialBytes > firstPlayableLimit) throw new Error(`initial public package ${publicInitialBytes} bytes exceeds 20MiB`);
if (distInitialBytes > firstPlayableLimit) throw new Error(`initial dist package ${distInitialBytes} bytes exceeds 20MiB`);
if (distBytes > fullCacheLimit) throw new Error(`dist package ${distBytes} bytes exceeds 100MiB`);
console.log(JSON.stringify({
  ok: true,
  publicMiB: Number((publicBytes / 1024 / 1024).toFixed(2)),
  publicInitialMiB: Number((publicInitialBytes / 1024 / 1024).toFixed(2)),
  lazyMusicMiB: Number((lazyPublicBytes / 1024 / 1024).toFixed(2)),
  lazyImagesMiB: Number((lazyImagesPublicBytes / 1024 / 1024).toFixed(2)),
  distMiB: Number((distBytes / 1024 / 1024).toFixed(2)),
  distInitialMiB: Number((distInitialBytes / 1024 / 1024).toFixed(2)),
  firstPlayableLimitMiB: 20,
  fullCacheLimitMiB: 100,
}, null, 2));
