import { existsSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';

const pruneOriginalIllustrationPng = () => ({
  name: 'prune-original-illustration-png',
  apply: 'build',
  closeBundle() {
    const root = join(process.cwd(), 'dist', 'assets', 'illustrations');
    if (!existsSync(root)) return;
    const pending = [root];
    while (pending.length) {
      const directory = pending.pop();
      if (!directory) continue;
      for (const entry of readdirSync(directory)) {
        const target = join(directory, entry);
        if (statSync(target).isDirectory()) pending.push(target);
        else if (target.toLowerCase().endsWith('.png')) rmSync(target);
      }
    }
  },
});

export default {
  // GitHub Pages serves project sites from /<repository>/; relative entry
  // paths keep the same build usable from a custom domain and local preview.
  base: './',
  optimizeDeps: {
    noDiscovery: true,
  },
  plugins: [pruneOriginalIllustrationPng()],
};
