import type { StoryChapter } from "./types";
import {ironRoadExpansionNodes} from "./chapterIronRoadExpansion";
import {ironRoadRequiredStoryNodes} from "./chapterRequiredStory";

export const ironRoadChapter: StoryChapter = {
  id: "iron-road",
  title: "第二章：铁窗与粮路",
  subtitle: "城墙会移动，饥饿不会。",
  artwork: {
    src: "/assets/images/chapter-iron-road.webp",
    alt: "铁窗壁垒封锁粮路与工坊边境的阴沉景象",
  },
  startNodeId: "iron-letter",
  actionNodeIds: ["iron-letter", "border-machines", "grain-crossing", "iron-bulwark-battle"],
  nodes: {
    "iron-letter": {
      id: "iron-letter",
      kind: "dialogue",
      title: "铁窗来信",
      lines: [
        {
          text: "离开圣辉城的第三夜，一封带着铁屑的命令追上使团。卫道士议长赫尔曼要求蕾娜归队，并交出所有涉及铁砧工坊的证物。",
          stageDirection: "河湾驿站。粮车在雨里排成一条看不见尽头的黑线。",
        },
        {
          speakerId: "reina",
          emotion: "doubt",
          text: "这不是召回，是封口。扳手的金属来自圣辉城，制式却来自我们的工坊。有人同时向两边出售战争的理由。",
        },
        {
          speakerId: "seraphina",
          emotion: "resolve",
          text: "河湾的粮车已经停了六天。无论是谁造了封路机，饿死的人都不会写在他的报告里。",
        },
        {
          speakerId: "the_unflagged",
          text: "我们只够先做一件事：保存完整的工坊记录，或立刻打开粮路。",
        },
      ],
      choices: [
        {
          id: "keep-ledger",
          label: "让蕾娜保存完整工坊记录",
          hint: "取得技术弱点，但女神国会认为使团偏向卫道士。",
          effects: {
            setFlags: ["trusted_reina_plan"],
            statChanges: { wardenTrust: 2, goddessTrust: -1 },
          },
          next: "reina-forge-child",
        },
        {
          id: "open-road",
          label: "先护送粮车穿过封锁",
          hint: "平民更安全，但只能带走残缺的装置记录。",
          effects: {
            setFlags: ["protected_grain_route"],
            statChanges: { civilianSafety: 15, wardenTrust: -1 },
          },
          next: "reina-forge-child",
        },
      ],
    },
    "ledger-consequence": {
      id: "ledger-consequence",
      kind: "dialogue",
      title: "可以测量的谎言",
      lines: [
        {
          speakerId: "reina",
          emotion: "resolve",
          text: "三座封路机使用同一组动力编号，却被登记成九次紧急采购。它们不是为了守住边境，而是为了让边境永远需要下一座墙。",
        },
        {
          speakerId: "seraphina",
          emotion: "doubt",
          text: "把账目公开，粮路也不会自己打开。我们仍得从那座墙面前走过去。",
        },
        {
          text: "你取得了完整动力编号。Boss 第二阶段的动力节点将提前暴露，但沿路村民的补给已经见底。",
        },
      ],
      choices: [
        {
          id: "face-bulwark-with-ledger",
          label: "带着动力编号前往移动壁垒",
          next: "cole-granary-drill",
        },
      ],
    },
    "road-consequence": {
      id: "road-consequence",
      kind: "dialogue",
      title: "一车粮与两村人",
      lines: [
        {
          text: "使团把最后两袋口粮分给领路的村民。天亮时，他们带来一条穿过旧灌渠的路，却也带来消息：移动壁垒正在碾平那条灌渠。",
        },
        {
          speakerId: "reina",
          emotion: "anger",
          text: "赫尔曼知道这里有人。他把村庄写成了地图上的空白，所以机器就可以从空白上通过。",
        },
        {
          speakerId: "the_unflagged",
          emotion: "resolve",
          text: "那就让他在每一道意图里写出自己准备碾过谁。",
        },
      ],
      choices: [
        {
          id: "face-bulwark-with-witnesses",
          label: "护送村民前往移动壁垒",
          next: "cole-granary-drill",
        },
      ],
    },
    "blockade-approach": {
      id: "blockade-approach",
      kind: "dialogue",
      title: "三座封路机",
      lines: [
        { text: "三台封路机占住灌渠，编号互不相同，磨损却来自同一套模具。蕾娜必须靠近装置才能拆除锁轴。" },
        { speakerId: "reina", emotion: "resolve", text: "这不是壁垒的复制品。每台都有不同的盲区，必须逐个占住控制格。" },
      ],
      choices: [{ id: "enter-border-machines", label: "开战：拆除三座封路机", next: "border-machines" }],
    },
    "border-machines": {
      id: "border-machines",
      kind: "battle",
      battleId: "border-machines",
      title: "三座封路机",
      briefing: "敌人移动快但信念薄弱；先击溃监军，再为蕾娜打开装置格。",
      objectives: ["控制中央装置格", "击退工坊监军", "保留至少一台完整编号牌"],
      victoryNext: "wrench-provenance",
      defeatNext: "wrench-provenance",
    },
    "grain-approach": {
      id: "grain-approach",
      kind: "dialogue",
      title: "一车粮与两村人",
      lines: [
        { text: "使团穿过封路机时，一辆粮车被伪旗武装拖向岔路，两名村民仍困在倒塌的水门后。" },
        { speakerId: "seraphina", emotion: "resolve", text: "粮、证人和追兵都在移动。我们必须先决定谁不能被留下。" },
      ],
      choices: [{ id: "enter-grain-crossing", label: "开战：抢回粮车并救出村民", next: "grain-crossing" }],
    },
    "grain-crossing": {
      id: "grain-crossing",
      kind: "battle",
      battleId: "grain-crossing",
      title: "粮车岔路",
      briefing: "敌方斥候会高速切入后排，教团抄写员则从信念侧阻止救援。",
      objectives: ["保住粮车", "救出受困村民", "截住持伪旗者"],
      victoryNext: "cole-no-pursuit",
      defeatNext: "rain-camp-council",
    },
    "bulwark-approach": {
      id: "bulwark-approach",
      kind: "dialogue",
      title: "会移动的城墙",
      lines: [
        {
          text: "铁窗壁垒从雨幕中升起，履带拖着半截灌渠。赫尔曼站在装甲平台上，没有拔剑，只把一份继续武装边境的预算摊在护栏上。",
        },
        {
          speakerId: "reina",
          emotion: "resolve",
          text: "第一层装甲保护的是驾驶舱。装甲开裂后，他会切断限速器，壁垒的攻击会增强，意图也会改变。",
        },
        {
          speakerId: "seraphina",
          emotion: "resolve",
          text: "那就让所有人看见它改变。力量不是神谕，机器也不能替人免除选择。",
        },
      ],
      choices: [
        {
          id: "enter-bulwark-battle",
          label: "开战：截停铁窗壁垒",
          hint: "击破指挥装甲后进入第二阶段；敌方阶段与下一步意图始终可见。",
          next: "iron-bulwark-battle",
        },
      ],
    },
    "iron-bulwark-battle": {
      id: "iron-bulwark-battle",
      kind: "battle",
      battleId: "iron-bulwark",
      title: "阶梯 Boss：铁窗壁垒",
      briefing: "先击破指挥装甲，再面对解除限速的移动壁垒。每次阶段转换都会公开新的敌方意图。",
      objectives: ["击破第一阶段指挥装甲", "在第二阶段截停动力核心", "保住至少一名见证者"],
      victoryNext: "bulwark-aftermath",
      defeatNext: "iron-failure",
    },
    "bulwark-aftermath": {
      id: "bulwark-aftermath",
      kind: "dialogue",
      title: "停机以后",
      lines: [
        {
          text: "履带终于停止。雨水从裂开的装甲间冲出油污，也冲出九份盖着不同印章、编号却完全相同的采购单。",
        },
        {
          speakerId: "reina",
          emotion: "doubt",
          text: "公开它，卫道士会说我背叛；封存它，下一台壁垒只会换一个编号。",
        },
        {
          speakerId: "seraphina",
          text: "真相不能替我们决定代价，但至少能让付出代价的人知道原因。",
        },
      ],
      choices: [
        {
          id: "publish-profit-chain",
          label: "公开重复采购与动力编号",
          hint: "削弱军工利益链，卫道士关系下降。",
          effects: {
            setFlags: ["exposed_iron_profit"],
            statChanges: { publicFaith: 5, wardenTrust: -3 },
          },
          next: "reina-hermann-platform",
        },
        {
          id: "trade-for-grain",
          label: "以证据换取粮路停火",
          hint: "立即恢复运输，但利益链仍被保留。",
          effects: {
            statChanges: { civilianSafety: 10, wardenTrust: 2 },
          },
          next: "reina-hermann-platform",
        },
      ],
    },
    ...ironRoadExpansionNodes,
    ...ironRoadRequiredStoryNodes,
    "iron-truth-ending": {
      id: "iron-truth-ending",
      kind: "ending",
      endingId: "truth",
      title: "结果：写在墙上的价码",
      lines: [
        { text: "采购单被贴上河湾每一座仓门。人们第一次知道，挡住粮车的墙从自己缴纳的税里获利。" },
        { speakerId: "reina", text: "机器停了。制造它的理由还在，但现在理由有了名字。" },
      ],
      summary: "粮路重新开放，卫道士议会开始调查军工采购。赫尔曼保留立场，却失去继续扩张壁垒的授权。",
    },
    "iron-order-ending": {
      id: "iron-order-ending",
      kind: "ending",
      endingId: "order",
      title: "结果：一纸停机令",
      lines: [
        { text: "赫尔曼签下停机令，粮车在当夜通过。作为交换，九份采购单被封进无旗使团的证据箱。" },
        { speakerId: "seraphina", emotion: "doubt", text: "今天没人挨饿。明天那座墙还会不会回来，要看我们何时打开箱子。" },
      ],
      summary: "粮路立即恢复，证据暂未公开。卫道士愿意谈判，但军工利益链仍在运转。",
    },
    "iron-failure": {
      id: "iron-failure",
      kind: "ending",
      endingId: "failure",
      title: "结果：被履带截断的路",
      lines: [
        { text: "壁垒越过灌渠，使团被迫撤离。粮车仍停在雨里，但幸存者记住了动力核心暴露的位置。" },
      ],
      summary: "行动受挫，故事继续。下一次调查将保留已确认的壁垒阶段情报。",
    },
  },
};
