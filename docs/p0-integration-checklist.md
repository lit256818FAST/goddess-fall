# P0 集成验收清单

## 接线边界

- `src/content/` 负责章节、节点、选项效果与结局数据。
- `src/game/` 负责战斗状态、合法性、伤害、敌方意图和胜负。
- `src/render/` 仅负责 Three.js 呈现、命中检测与把玩家输入翻译成规则层动作。
- `src/main.ts` 负责页面状态编排，不复制剧情或战斗规则。

## 运行时接线

- [ ] `main.ts` 从 `holyFlameChapter.startNodeId` 开始渲染节点。
- [ ] 选项统一应用 `StoryEffect`，更新 flags、evidence 和 stats。
- [ ] `BattleNode` 的胜负分别跳转到 `victoryNext`、`defeatNext`。
- [ ] `Battlefield` 以 `BattleState` 为唯一战斗数据源。
- [ ] 移动、攻击、结束阶段分别调用 `moveUnit`、`attackUnit`、`endPlayerTurn`。
- [ ] HUD 读取 health、faith、round、phase、acted 和 enemyIntents。
- [ ] 每次状态变化后统一同步模型位置、可见性和选中状态。

## P0 验收

- [ ] 生命或信念归零的敌我单位均不再可选，并从棋盘隐藏。
- [ ] 三名我方单位可分别行动；敌方只在结束我方阶段后执行预告动作。
- [ ] 敌方攻击意图在执行前可见，执行后正确刷新。
- [ ] 非法移动、重复行动、超距攻击均有明确反馈且不改变状态。
- [ ] 内容流程可到达公开真相、维持秩序和失败结局。
- [ ] `npm test`、`npm run check`、`npm run build` 全部通过。
- [ ] Playwright覆盖标题、剧情选择、战斗选择/移动/攻击/结束阶段和结局。
- [ ] 记录 `dist/` 总体积与最大文件，确认远低于100MB。
写入环境恢复验证：2026-07-18（官方修复后）
