# 《女神之殇：铁与火》Agent 制作任务板

## 总监职责

- 统一主线七章、角色职责、Boss 目标与场景机制。
- 审核各部门输出是否满足包体、回退、交互和移动端约束。
- 合并前执行 `npm run build`、`npm test`、资源验证和 Playwright 冒烟。

## 美术与模型部：img2threejs

负责人：`art_img2threejs`

交付范围：

- 生成亚瑟、汉斯、阿斯诺卡统一风格概念参考图。
- 按 img2threejs 阶段门禁制作程序化模型或可复现 factory。
- 输出 sculpt spec、assessment、细节分区、动作枢轴、socket、fallback 和验证记录。
- 3D 模型源文件放在 `model-inventory/assets/models/`，不随主游戏 `public/` 首包发布；运行时默认关闭 GLB 加载，独立 `model-gallery.html` 构建才复制库存。

禁止：

- 不修改 `src/` 业务代码。
- 不覆盖无旗使团支线和 K3 既有资产。
- 不把概念图直接作为运行时角色模型。

当前批次：亚瑟、汉斯、阿斯诺卡、白光骑士长、永夜殿审判官已完成并通过 GLB/动作/阶段节点门禁；湖都双邪神保留待制作接口。

## Three.js 技术部

负责人：`runtime_scene_integration`

交付范围：

- 接入 `BattleScenePreset` 和四个主线战斗场景。
- 接入地形、道具、目标格、光照和交互 fallback。
- 扩展主线角色与 Boss 的 `CharacterVisualManifest` / `BossPhaseConfig` 预留。
- 确保模型加载失败自动回退到现有程序化模型。

禁止：

- 不修改 `art-source/` 和模型文件。
- 不把美术资源路径写死在规则层。

当前批次：四个主线战斗预设已接入，主线角色/Boss manifest 与 fallback 已接通；下一步是把 Boss 目标、阶段机制和三路终局目标纳入战斗验收。

## 测试与验收部

负责人：`qa_acceptance_audit`

交付范围：

- 基线构建、类型检查、单元测试。
- 桌面 1440×1024、移动 390×844 Playwright 冒烟。
- 控制台错误、HTTP 4xx/5xx、资源路径、交互阻塞和包体风险。
- 输出 `docs/QA_BASELINE.md`，记录通过项、失败项和复现步骤。

当前批次：资源、运行时、桌面/移动冒烟已完成；永夜殿审判官正在追加真实页面加载复核，湖都双邪神尚未启用。

## 统一验收门槛

- `npm run build` 通过。
- `npm test` 全部通过。
- 四个场景可进入、可点击、可阻挡或触发目标。
- 新角色/Boss 有可播放动作或明确 fallback。
- 资产加载失败不阻塞战斗。
- 首次可玩下载不超过 20MB，完整缓存不超过 100MB。
