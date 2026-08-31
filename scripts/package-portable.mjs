import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(projectRoot, 'dist');
if (!existsSync(dist)) throw new Error('dist 不存在，请先运行 npm run build。');
cpSync(resolve(projectRoot, 'scripts/portable-server.ps1'), resolve(dist, 'portable-server.ps1'));
cpSync(resolve(projectRoot, 'scripts/portable-launcher.cmd'), resolve(dist, '启动女神之殇.cmd'));
cpSync(resolve(projectRoot, 'scripts/portable-stop.cmd'), resolve(dist, '关闭女神之殇.cmd'));
writeFileSync(resolve(dist, '使用说明.txt'), [
  '女神之殇：无旗者 · 便携网页版本',
  '',
  '双击“启动女神之殇.cmd”即可自动打开游戏。',
  '关闭游戏后，如需停止本地服务，双击“关闭女神之殇.cmd”。',
  '需要 Windows PowerShell（Windows 10/11 默认包含），不需要安装 Node.js 或 Python。',
  '',
].join('\r\n'), 'utf8');
console.log(`portable package ready: ${dist}`);
