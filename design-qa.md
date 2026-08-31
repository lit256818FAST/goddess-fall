# 《女神之殇：无旗者》视觉与交互终验报告

验收日期：2026-07-26  
验收环境：Microsoft Edge、Playwright CLI  
桌面视口：1440×1024  
移动视口：390×844

## 结论

本轮指定范围内剩余 0 个 P0、0 个 P1、0 个 P2。

首页、战前准备、剧情、战场、战后报告和成长均完成桌面与移动端真实操作复核。所有页面无横向溢出，控制台错误为 0，HTTP 4xx/5xx 为 0。

## 本轮修复

- 战场曝光由 1.32 降至 1.08，并重新平衡主光、补光和轮廓光。浅色主角不再整片过曝，衣物、装备和人物轮廓重新可辨；棋盘仍保持昏暗但清楚。
- 移动端教程从固定遮挡层改为战斗信息栏内的正常内容，不再覆盖“结束我方阶段”。
- 教程第 6 步新增就地“结束我方阶段”按钮；跳过教程后，原结束阶段按钮可滚动到达并保持粘性。
- 页面切换和存档恢复后统一回到页面顶部，避免剧情、战前准备、战后报告和成长从中段开始显示。
- 首屏章节插画改为优先加载，移动端进入剧情即可看到正式插画。
- 移动首页压缩路线地图高度，去除重复地图缩略图，并在摘要中加入当前阵容。首屏现在能直接看到下一目标、地点、风险、阵容和三选一行动入口。

## 战斗交互验收

- 点击敌人后，侧栏显示敌人名称、生命、信念与下一步意图。
- 敌方意图列表显示移动或攻击目标、伤害类型和数值。
- 地图上的敌方目标格持续以金色呼吸标记显示。
- 点击带坐标的敌方意图后，对应格子出现短暂强化闪烁。
- 生命攻击、信念攻击、移动范围、撤回按钮和结束阶段入口均保持可见状态反馈。

## 响应式验收

- 1440×1024：首页、战前准备、剧情、战场、敌人状态、意图坐标、战后报告、成长全部通过。
- 390×844：首页、战前准备、剧情、战场、教程、结束阶段入口、战后报告、成长全部通过。
- 17 张终验截图的页面宽度均等于视口宽度，横向溢出为 0。
- 移动端教程与结束阶段按钮的几何重叠为 0。

## 自动化结果

- `npm run build`：通过。
- `npm test`：13 个测试文件、74 项测试全部通过。
- 浏览器控制台错误：0。
- HTTP 4xx/5xx：0。

## 证据

- 桌面首页：`output/playwright/visual-final-desktop-home.png`
- 桌面战场：`output/playwright/visual-final-desktop-battle.png`
- 敌人点击状态：`output/playwright/visual-final-desktop-enemy-state.png`
- 意图坐标格：`output/playwright/visual-final-desktop-intent-cell.png`
- 移动首页：`output/playwright/visual-final-mobile-home.png`
- 移动剧情：`output/playwright/visual-final-mobile-story.png`
- 移动教程：`output/playwright/visual-final-mobile-battle.png`
- 移动结束阶段入口：`output/playwright/visual-final-mobile-battle-actions.png`
- 结构化结果：`output/playwright/visual-closeout-result.json`

## 前后对比

- 修改前战场：`output/playwright/qa-desktop-battle.png`
- 修改后战场：`output/playwright/visual-final-desktop-battle.png`

修改后浅色人物的阴影、腰部、手臂和装备边缘更清楚，棋盘灰阶层次仍足以辨识可行走格、意图格和目标格。
