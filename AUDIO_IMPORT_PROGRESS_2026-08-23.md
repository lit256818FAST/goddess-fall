# 音乐接入进度记录 · 2026-08-23

## 当前状态

音乐库已从 `C:\Users\Storm\Downloads\My Workspace.zip` 解压到 `art-source/audio-inbox/`，共 10 首 MP3，解压后约 54.36MB。试听目录与初步分类仍保留在该目录，不进入首屏资源。

运行时副本位于 `public/assets/audio/music-lazy/`，所有曲目使用 `preload="none"`，按场景首次进入时加载。

## 已确认映射

| 场景 | 音乐 |
|---|---|
| 启动标题 | Archive Gate |
| 主页、战斗路线、阵容、战前准备 | Lantern Map |
| 普通剧情 | Lantern Map_1 |
| 温暖剧情、藏书馆、档案 | Archive Gate_1 |
| 悲伤剧情 | Ashes on the Map / Ashes on the Map_1 |
| 激动剧情、剧情到战斗过渡 | Shadow Council March |
| 主线普通战斗 | Shadow Council March |
| 无旗使团普通战斗 | Abyss Gatefall_1 |
| Boss 第一阶段 | Shadow Council March_1 |
| Boss 第二阶段 | Abyss Gatefall |

## 技术实现

- `src/audio/AudioManager.ts` 新增 `MUSIC_TRACKS`、`sceneTrackFor()` 和 `MusicSceneOptions`。
- `src/main.ts` 启动页使用标题音乐；剧情根据文本关键词选择温暖、悲伤或激动曲目；Boss 阶段切换同步换曲；无旗使团战斗使用专属曲目。
- 新音乐加载失败时，自动回退到原有 OGG/WAV；原有资源未删除。
- `scripts/check-package-budget.mjs` 将懒加载音乐从“首次可玩”统计中单独列出。

## 验证记录

上一次回退逻辑修改前：

- TypeScript 检查通过；
- 22 个测试文件、116 项测试通过；
- 构建通过；
- 首次可玩资源 17.79MiB，完整构建 70.63MiB，低于 100MiB 上限；
- Playwright 已实测标题、主页、剧情和无旗使团战斗音乐源，均正确加载。

最新回归结果：

- TypeScript 检查通过；
- 22 个测试文件、116 项测试通过；
- 构建通过（仅保留既有的 JS chunk 体积提示）；
- 首次可玩资源 17.79MiB，完整构建 70.63MiB；
- Playwright 实测：标题 `Archive Gate`、主页 `Lantern Map`、剧情 `Lantern Map_1`，无旗使团战斗最终使用 `Abyss Gatefall_1`，均有真实 MP3 请求并进入 playing 状态。
- Boss 第二阶段的 `Abyss Gatefall` 与普通主线战斗/Boss 第一阶段映射由单元测试覆盖。

完整 `npm run verify:release` 已通过：季节资产、三 Boss、主线模型、主线运行时、小兵、测试、构建和包体均通过。
