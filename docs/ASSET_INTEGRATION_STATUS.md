# 图片与对话资产接入记录

更新：2026-08-26

这份文档是当前运行时图片资产的单一事实来源。早期的[图片资产审计](../output/art-asset-audit.md)保留为缺口分析；本文件记录已经落盘、已经接线和仍然需要补充的部分。

## 已完成并接入

| 类别 | 数量 | 运行时位置 | 接入点 | 状态 |
| --- | ---: | --- | --- | --- |
| 主线章节视觉 | 7 | `public/assets/images/mainline-*.webp` | `src/content/mainlineChapters.ts` 第一至第七章 | 已接入 |
| 主线节点级剧情插图 | 7 | `public/assets/images/mainline-nodes/*.webp` | 主线各章 intro 对话节点，按需懒加载 | 已接入 |
| 主线对话透明立绘 | 3 | `public/assets/images/dialogue/` | `renderDialogue()`、主线藏书馆人物图鉴 | 已接入 |
| 主线 NPC/Boss 对话立绘 | 5 | `public/assets/images/dialogue/old-mara.webp` 等 | `renderDialogue()`，无图时保留原有 fallback | 已接入 |
| 商店商品图 | 8 | `public/assets/images/shop/` | `renderShop()` 的六件装备、口粮、回血药剂 | 已接入 |
| 主线 Boss 战斗背景 | 3 | `public/assets/images/boss-*-bg.webp` | `src/game/bossPhases.ts` 白光、永夜、湖都 | 已接入 |
| 军职任务图标 | 7 | `public/assets/images/missions/*.webp` | `src/game/mainlineMissions.ts`、主线主页任务板 | 已接入 |
| 无旗使团角色立绘 | 6 | `public/assets/images/portrait-*.webp` | 支线阵容、支线藏书馆 | 已有 |
| 无旗使团透明对话立绘 | 6 | `public/assets/images/dialogue/` | `renderDialogue()`，原档案立绘作为 fallback | 已接入 |
| 启动、路线、档案背景 | 3 | `public/assets/images/` | 启动页、主页、藏书馆/档案 | 已有 |

当前 `public/assets/images/` 运行时目录共 73 个文件，约 **4.87 MiB**；其中对话目录 29 个文件、约 **2.80 MiB**（含待清理的重复副本）。主线与支线透明对话图的源文件保存在 `art-source/dialogue-alpha/`，格式为 PNG-32/RGBA；运行时采用 WebP，以降低首次下载体积。

五张新增主线章节图的原始 PNG 保存在 `art-source/mainline-chapters/`，运行时文件名与章节对应：`mainline-kavala`、`mainline-reform`、`mainline-steppe`、`mainline-evil-god`、`mainline-finale`。

## 透明对话立绘规范

源文件必须满足：

- PNG-32、RGBA，Alpha 通道同时包含 0 和 255；
- 背景完全透明，不使用白底、灰棋盘格、地面阴影或环境光晕；
- 不带文字、水印和外部边框；
- 主体边缘干净，不出现白边；
- 角色姿态为半身或胸像，适合放在 GAL 对话舞台两侧/中央；
- 运行时转换为 WebP，并保持透明 Alpha。

当前源文件：

- `art-source/dialogue-alpha/arthur.png`
- `art-source/dialogue-alpha/hans.png`
- `art-source/dialogue-alpha/asnoka.png`
- `art-source/dialogue-alpha/mainline-npcs/old-mara.png`
- `art-source/dialogue-alpha/mainline-npcs/gray-eyed.png`
- `art-source/dialogue-alpha/mainline-npcs/white-knight-captain.png`
- `art-source/dialogue-alpha/mainline-npcs/night-judge.png`
- `art-source/dialogue-alpha/mainline-npcs/lake-dual-god.png`
- `art-source/dialogue-alpha/unflagged-side/` 下的 6 名支线角色 PNG

当前映射：

```ts
arthur -> idle: /assets/images/dialogue/arthur.webp
          attack/hit: /assets/images/dialogue/states/arthur-{attack,hit}.webp
hans   -> idle: /assets/images/dialogue/hans.webp
          attack/hit: /assets/images/dialogue/states/hans-{attack,hit}.webp
asnoka -> idle: /assets/images/dialogue/asnoka.webp
          attack/hit: /assets/images/dialogue/states/asnoka-{attack,hit}.webp
```

其余 11 名对话角色同样映射到 `dialogue/states/` 的 attack/hit WebP；idle 统一回退到原档案立绘。`DialogueLine.portraitState` 可显式指定状态，未指定时 `anger -> attack`、`fear -> hit`、其他情绪 -> idle。桌面端显示多名角色，当前说话者提高亮度并前移；移动端只显示当前说话者，历史台词保留在可滚动面板中。

## 仍需补充的图片

这些是视觉增强项，不是当前运行时断链：

1. 主线节点级剧情插图（本轮已补齐每章 1 张）；
2. 七个军职任务图标（本轮已补齐）；
3. 主线关键 NPC 半身立绘（本轮已补齐）；
4. 支线对话角色透明立绘（本轮已补齐，保留原档案立绘回退）。

本轮已完成节点插图、任务图标、主线关键 NPC/Boss 立绘与支线透明对话立绘；每章节点图使用 WebP 懒加载，不将所有章节图预载入启动页。

## 体积与发布约束

- `dist/` 当前构建总量约 **92.08 MiB**，仍低于 100 MiB 上限；
- `public/assets/images/` 图片运行时目录约 **8.28 MiB**；
- 透明 PNG 源文件不进入 `public/`，不会增加首次可玩下载；
- `npm run build` 已通过，主包约 1,025 KiB（未压缩）；
- `npm run verify:budget` 当前未通过：初始 `public` 包约 **39.18 MiB**，超过 20 MiB 门槛；完整 `public` 约 **91.03 MiB**，主要体积仍来自既有模型与延迟音乐资源。
- 三状态新增运行时文件：`public/assets/images/dialogue/states/` 下 28 张 WebP，合计约 **3.41 MiB**；逐张检查为 RGBA 且 Alpha 非空。idle 不重复进入该目录。
- 新图片接入后必须重新执行构建，并检查图片路径无 404。

## 验收记录

- 三张透明立绘已用棋盘格合成图目视确认真实透明；
- 桌面剧情对话实机截图已确认三名角色可见、选择按钮可操作；
- 浏览器控制台在该剧情节点无错误；
- 移动端样式已调整为单角色聚焦和可滚动前文；
- 终局战真实 Edge 回归：1440×1024 与 390×844 均无横向溢出；三路关闭胜利、第二阶段转换、失败继续推进均已验证；采样期间控制台无错误、页面无错误、资源无 4xx/5xx；
- 最后一次生产构建：`npm run build` 通过。
- 三状态构建：`npm run build:dialogue-states` 输出 42 张源帧（14×3），运行时保留 28 张 attack/hit WebP；`npm run check` 通过。
- production preview 已抽检状态资源：28/28 返回 HTTP 200、`image/webp`；浏览器预览页错误日志为空。主线资产专项脚本仍受继承工作树中的 `boss-night-judge` 动画通道缺失与 Node 环境 `self` 未定义影响，未因本次立绘改动扩大。
