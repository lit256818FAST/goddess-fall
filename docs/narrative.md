# 《女神之殇》垂直切片叙事说明

## 内容目标

垂直切片只讲一个可以在 30—45 分钟内完成的案件：女神国圣火在朝圣日熄灭。玩家以无旗调查使身份，在“圣火是否依靠人工装置”这一局部真相上作出第一次政治选择。

这一章需要同时证明三件事：

1. 调查与对话可以改变战斗条件，而不是战斗前的装饰文本。
2. 战斗目标以救援、控制和捕获为主，不要求杀光敌人。
3. 战后选择比胜负更重要，同一场胜利可以导向“公开真相”或“维持秩序”两种结果。

## 节点流程

`opening` → `keeper` 或 `altar` → `confrontation` → `square-battle` → `aftermath-choice` → `truth-ending` 或 `order-ending`

战斗失败进入 `failure`，允许前端提供读档或立即重试。

开场调查路线的差异：

- 守灯人路线取得“守灯账簿”，并可提前疏散平民。
- 祭坛路线取得“无温余烬”和“折断的异制扳手”，更容易证明嫁祸。
- 垂直切片不要求一次流程拿齐全部证据，为以后周回和章节回访保留空间。

## 前端接入

统一从 `src/content/index.ts` 导入：

```ts
import {
  holyFlameChapter,
  initialStoryState,
  characters,
  evidence,
  factions,
  type StoryChoice,
  type StoryState,
} from "./content";
```

运行节点时按 `kind` 分派：

- `dialogue`：依次显示 `lines`，再过滤并显示 `choices`。
- `battle`：把 `battleId` 交给战斗模块；胜利读取 `victoryNext`，失败读取 `defeatNext`。
- `ending`：显示结局标题、台词和 `summary`。

选择的推荐处理顺序：

1. 校验 `choice.condition`。
2. 将 `choice.effects.setFlags` 写入 `state.flags`。
3. 合并 `addEvidence`，避免重复 ID。
4. 应用 `statChanges`；界面显示的关系值建议限制在 -100 至 100，`publicFaith` 与 `civilianSafety` 限制在 0 至 100。
5. 跳转到 `choice.next`。

`portraitKey`、`iconKey` 都是资源别名，不是硬编码路径。没有美术资源时，前端可以用角色首字、阵营色和 CSS 图标占位。

## 战斗与剧情的接口约定

战斗模块至少返回：

```ts
interface BattleResult {
  status: "victory" | "defeat";
  civiliansSaved: number;
  saboteurCaptured: boolean;
  turnsUsed: number;
}
```

当前切片只依赖 `status` 完成跳转。其余字段建议在接入时转成剧情旗标和数值：

- `civiliansSaved >= 2`：设置 `protected_pilgrims`，提高 `civilianSafety`。
- `saboteurCaptured`：设置 `saboteur_captured`；如果为假，战后文案可改为破坏者逃脱。
- `turnsUsed <= 4`：可增加一条群众尚未完全失控的演出反馈。

## 写作约束

- 女神是否真实存在，本章不下最终结论。这里揭露的是祭坛的维护机关和人为伪造时间线。
- 塞拉菲娜不是“愚昧宗教”的代言人；她首先保护人，然后才维护信仰。
- 蕾娜不是自动正确的科学家；她理解公开真相可能立即造成伤亡。
- 灰眼人的问题可能成立，但伤害平民的方式不可被叙事奖励。
- 所有选项都应产生代价，避免明显的善恶按钮。

## 后续扩展点

如果原型验证成功，第二章可以读取 `revealed_mechanism` 或 `concealed_mechanism`：前者开启逃离圣辉城，后者开启持女神国通行证前往边境。两条路线最终在新卡瓦拉粮道汇合，从而控制分支制作成本。
