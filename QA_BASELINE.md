# QA 基线验收报告

检查日期：2026-08-23   
检查范围：当前正式工作区 `goddess-fall-web`，包括主线入口、战斗流程、资源路径、包体和桌面/移动端浏览器冒烟。  
测试方式：静态审计 + `npm run verify:release`（含主线资源/运行时门禁）+ Playwright 驱动本机 Edge（生产预览 `http://127.0.0.1:4175/`）。

## 结论摘要

当前代码基线可以构建，规则/内容/渲染单元测试全部通过，核心主线流程从启动页到战斗可操作；桌面 1440×1024 与移动 390×844 冒烟没有发现页面级交互阻塞、控制台错误或 HTTP 4xx/5xx。

当前已完成第一批主线美术纵切，但还不能签署“七章主线正式美术完成”验收：

1. 亚瑟、汉斯、阿斯诺卡、白光骑士长、永夜殿审判官和湖都双邪神的 img2threejs 资产均已落盘并启用；三组主线 Boss 的阶段部件接口已统一。
2. `public/assets/models/mainline/manifest.json` 的 `modelPath` 已统一为 `/assets/...` 运行时 URL，并由 `verify:mainline-assets` 校验；当前不会产生 `/public/...` 误请求。
3. 本次工作区即时体积盘点为 `public/` 17.79 MiB（86 文件）、生产 `dist/` 18.78 MiB（89 文件），加入湖都双邪神后仍未超过首次可玩 20 MiB 红线；仍需在最终音频批次接入后复核。
4. 本地 `npm run dev` 的 Vite 依赖预优化失败（`three.core.js`、`BufferGeometryUtils.js` 解析及 `Access is denied`），但 `npm run build` 和 `vite preview` 正常。这更像复制的 `node_modules`/Windows 权限问题，需要重新安装依赖后复测开发服务器。

## 自动化结果

| 检查 | 结果 | 备注 |
|---|---|---|
| `npm run check` | PASS | TypeScript 严格检查通过 |
| `npm test` | PASS | 22 个测试文件，116 个测试 |
| `npm run verify:season-assets` | PASS | 10 个正式 GLB 条目、六名英雄 9 条动作，17.26 MiB public 资产 |
| `npm run verify:boss-assets` | PASS | 现有 3 个支线 Boss，动作覆盖完整 |
| `npm run verify:mainline-assets` | PASS | 3 名主线角色 + 3 名主线 Boss，动作通道、Boss 阶段节点、体积通过 |
| `npm run verify:mainline-runtime` | PASS | GLTFLoader、SkeletonUtils.clone、AnimationMixer、7 个主线模型独立克隆通过 |
| `npm run verify:minion-assets` | PASS | 盾卫、斥候、信仰术士、工程兵、掠骑五类 GLB，动作通道、挂点和体积通过 |
| `npm run verify:budget` | PASS | public 17.79 MiB，dist 18.78 MiB，均低于 20MiB |
| `npm run build` | PASS | Vite 7.3.6；JS 985.73 kB，出现单 chunk >500 kB 警告 |
| `npm run verify:release` | PASS | 上述检查串联全部通过 |

主线验证脚本当前覆盖亚瑟、汉斯、阿斯诺卡、白光骑士长、永夜殿审判官与湖都双邪神；三场主线 Boss 均已进入 enabled 资产集合。

## Playwright 冒烟结果

### 桌面 1440×1024

- 启动封面正常出现，约等待 1.8 秒后进入登录/选择存档界面。
- “新建主线”进入主页；主页显示章节、口粮、银币、军职、战斗/藏书馆/档案入口。
- 主页三项准备行动可切换，`aria-pressed` 与视觉 selected 状态同步。
- “战斗”→“调整阵容”→“进入战前准备”链路可达。
- 战前准备三项可切换，选中后“开战”进入剧情选择。
- 战前准备第二项“训练与整备”已实测可点击，`aria-pressed`、文案和“已选”状态同步更新。
- 剧情选项可进入 Three.js 战场；`#viewport` 与 `canvas` 均存在。
- 主线第一批实战加载事件通过：`arthur.glb`、`hans.glb`、`asnoka.glb` 均有 `goddess-character-ready`，每个含 9 个动作通道；环境物件也有 `goddess-environment-ready` 事件。
- 第四章白光骑士长实战加载通过：`boss-white-knight.glb` 返回 6 个动作（含 `phase_transition`），战场文案显示“第一阶段 · 纪律盾阵”。
- 通过 `?qa` 暴露的运行时接口验证 Boss 阶段切换：初始 `Phase1Parts=true/Phase2Parts=false`，切换到阶段 2 后反转，再切回阶段 1；`phase_transition` 按名播放且 `fallbackUsed=false`。
- 第六章永夜殿审判官实战加载通过：`boss-night-judge.glb` 返回 6 个动作（含 `phase_transition`），战场文案显示“第一阶段 · 内心审查”。
- 通过 `?qa` 暴露的运行时接口验证审判官阶段切换：初始 `Phase1Parts=true/Phase2Parts=false`，切换到阶段 2 后反转，再切回阶段 1；`phase_transition` 按名播放且 `fallbackUsed=false`。
- 第七章“湖都双邪神战”实战加载通过：`boss-lake-god-a.glb` 与 `boss-lake-god-b.glb` 均产生正式 `goddess-character-ready` 事件，各含 6 个动作（含 `phase_transition`），`fallbackUsed=false`。
- 双邪神阶段切换通过：两者初始均为 `Phase1Parts=true/Phase2Parts=false`，切换阶段 2 后反转，再切回阶段 1；两者 `phase_transition` 均按名播放。
- 三路目标与敌方意图通过：战场显示“赤核左路 · 白核右路 · 中庭主路”，目标进度为“ 三路关闭 0/3”；运行时存在 3 个可见红色脉冲意图覆盖层，颜色为 `#f0444f`，且无数字坐标依赖。
- 动画交互轻验收通过：在湖都战场选择亚瑟并点击“军阵鼓舞”，战报更新为“亚瑟 以军阵鼓舞 亚瑟”，单位状态显示“护持”，战场 canvas 仍可操作；随后通过当前运行时动作接口实测 `skill` clip 播放，`fallbackUsed=false`，并收到 `goddess-character-action` 事件。
- 第一章“刑场逃亡”实战加载通过：`shield-guard.glb` 与 `faith-acolyte.glb` 均产生正式 `goddess-character-ready` 事件，使用 `/assets/models/enemies/mainline/` 路径并带可点击 raycast 标记。
- 第二章“铁窗与粮路”实战加载通过：`engineer.glb` 产生正式 `goddess-character-ready` 事件；同场 `scout.glb` 也加载成功。工程战场同时加载泥地、铁栅、阀轮与砧块环境资源。
- 教程可跳过；点击角色后能显示生命、信念、移动力和技能；生命攻击可进入攻击模式。
- 设置齿轮可打开面板；可看到声音、音量、返回标题。返回标题回到启动页。
- 音量滑杆改为 70 后写入 `localStorage`：`goddess-fall:audio:v1`，值为 `{"muted":false,"volume":0.7}`。
- 启动页点击“选择存档”会显示存档说明弹窗，文案和取消/继续按钮存在。
- 主线商店页面实测显示口粮、回血药剂和六件永久装备；银币不足时按钮正确禁用。
- 亚瑟技能树的数据、装备和技能点写入本地存档；“临时调度”和“危险预警”仅在对应技能学习后出现。

### 移动 390×844

- 战斗页面 `document.documentElement.scrollWidth === clientWidth === 390`，无横向溢出。
- 战场容器宽 358px，侧栏会纵向排列；结束阶段、教程、战斗控制均能通过页面滚动访问。
- 设置齿轮仍在视口右下角可见。

### 浏览器错误采集

- `console.error`：0
- `pageerror`：0
- HTTP 4xx/5xx：0
- 发现 1 次 `requestfailed`：`/assets/audio/unsolved-investigation.ogg` → `net::ERR_ABORTED`。这是 AudioManager 在场景切换/自动播放未解锁时中止音频请求的表现；不属于 HTTP 错误，但需在音频验收中确认不会造成无声或反复请求。

截图产物：

- `output-qa-desktop-startup.png`
- `output-qa-desktop-battle.png`
- `output-qa-night-judge-battle.png`
- `output-qa-mainline-minions-battle.png`
- `output-qa-iron-bulwark-minions-battle.png`
- `output-qa-lake-dual-god-battle.png`
- `output-qa-skill-interaction.png`
- `output-qa-mobile-battle.png`

## 静态资源与主线美术状态

当前 `public/assets/models/mainline/` 已有：

- `arthur.glb` 125,568 bytes
- `hans.glb` 120,780 bytes
- `asnoka.glb` 109,800 bytes
- `boss-white-knight.glb` 135,116 bytes
- `boss-night-judge.glb` 126,200 bytes
- `boss-lake-god-a.glb` 277,288 bytes
- `boss-lake-god-b.glb` 277,280 bytes
- `manifest.json`

新增敌人资产目录 `public/assets/models/enemies/mainline/`：

- `shield-guard.glb` 62,492 bytes
- `scout.glb` 62,472 bytes
- `faith-acolyte.glb` 66,056 bytes
- `engineer.glb` 65,344 bytes
- `raider-rider.glb` 68,268 bytes
- `manifest.json`

五类小兵通过 `UnitTemplate.visualKey` 按战斗场景接入；旧支线未指定视觉角色时仍保留 `e3 → cultist-melee` fallback。

本轮真实战斗已覆盖盾卫、信仰侍从和工程师：三类事件的 `url` 均指向对应正式 GLB，`raycastTagged=true`，没有走 procedural fallback；浏览器采集的 `console.error`、`pageerror` 和 HTTP 4xx/5xx 均为 0。

三份主线角色 GLB 均含 9 条动作（idle/move/两类攻击/两类受击/两类退场/skill）；白光骑士长、永夜殿审判官与湖都双邪神各含 6 条动作和 `Phase1Parts`/`Phase2Parts`。已通过 Three.js 加载、克隆、动作和阶段切换脚本，并分别在第四、六、七章战场中实测。

本轮新增 `src/render/battleFxTemplates.ts` 通用表现模板：移动尘屑、生命斩击弧、生命冲击、信念双环/光柱、职业技能脉冲和退场环。主角、小兵与 Boss 共用同一套低开销模板；技能动作现在通过 `BattleAnimation` 进入真实播放，并由 `prefers-reduced-motion` 路径统一降级。

主线三场 Boss 的 GLB 路径均已存在且设置为 `enabled:true`；本轮湖都战斗未产生资源 404。

## 包体风险

当前 `public/` 86 个文件、约 17.79 MiB；`dist/` 89 个文件、约 18.78 MiB。主要大文件是：

- `unsolved-investigation.ogg` 2.10 MiB
- `original-library.wav`、`original-archive.wav`、`original-battle.wav`、`original-boss.wav`、`original-story.wav` 各约 1.22 MiB
- 六名支线英雄及现有 Boss GLB 合计约数 MiB

建议在 Boss 资产进入 public 前：把首屏只保留启动/主页所需资源；战斗、Boss、章节音乐继续按场景懒加载；同时在脚本中增加对 `dist/` 而非只对 `public/` 的预算断言。

## 待办清单（按验收优先级）

### P0 / 合并前必须完成

- 将湖都双邪神的真实加载、克隆、动作和阶段切换纳入每次发布门禁（本轮已通过，当前覆盖三名主线角色与三场主线 Boss）。
- 完成一轮真人操作验收：攻击/技能模板、受击与退场环、三路关闭全流程；自动化已覆盖加载、阶段、意图覆盖层与错误采集。

### P1 / 发布前完成

- 将 `verify:mainline-assets` 和 `verify:mainline-runtime` 保持在发布流水线中，继续检查 GLB 头、动作、挂点、尺寸、包体。
- 解决复制依赖导致的 `npm run dev` Vite 预优化失败，重新启动开发服务器复测。
- `verify:budget` 已加入发布门禁，继续在新增 Boss/音乐后复核。
- 音频场景切换时确认 `ERR_ABORTED` 是预期行为，并验证未解锁浏览器会进入可接受的程序化 fallback。

### P2 / 优化

- 将入口 JS 约 966 kB 做代码分包，消除 Vite 单 chunk >500 kB 警告。
- 桌面/移动端补全商店、藏书馆、档案、Boss 挑战和主线七章的 Playwright 全链路覆盖。
- 为三类《铁与火》Boss 补充完整真人操作验收：纪律旗标、动力锁轴、审查印记与阶段胜负条件。
