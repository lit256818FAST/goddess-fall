import type { StoryChapter } from "./types";
import {holyFlameExpansionNodes} from "./chapterHolyFlameExpansion";
import {holyFlameRequiredStoryNodes} from "./chapterRequiredStory";

export const holyFlameChapter: StoryChapter = {
  id: "holy-flame",
  title: "第一章：熄灭的圣火",
  subtitle: "当神迹第一次需要证人，真相便成了武器。",
  artwork: {
    src: "/assets/images/chapter-holy-flame.webp",
    alt: "圣火熄灭后被晨雾与警戒笼罩的圣辉广场",
  },
  startNodeId: "opening",
  actionNodeIds: ["opening", "confrontation", "square-battle", "odric-judgment"],
  nodes: {
    opening: {
      id: "opening",
      kind: "dialogue",
      title: "钟声之后",
      lines: [
        {
          text: "圣辉历四百一十七年，女神国的圣火在万人朝圣日熄灭。第十三声警钟响起时，广场上的人群开始互相指认异端。",
          stageDirection: "黎明前的圣辉广场。祭坛只剩一圈灰白烟雾。",
        },
        {
          speakerId: "seraphina",
          emotion: "fear",
          text: "骑士已经封锁城门。他们认定是铁砧的人干的——可蕾娜从昨夜起就被关在使馆。",
        },
        {
          speakerId: "reina",
          emotion: "anger",
          text: "先抓一个卫道士，再寻找能配得上判决的证据。这就是他们所谓的神谕。",
        },
        {
          speakerId: "the_unflagged",
          emotion: "resolve",
          text: "我们只有一刻钟。骑士冲进广场之前，先决定从哪里查起。",
        },
      ],
      choices: [
        {
          id: "ask-keeper",
          label: "询问守灯人",
          hint: "优先确认圣火的日常维护记录。",
          effects: { setFlags: ["questioned_mara"], statChanges: { goddessTrust: 1 } },
          next: "seraphina-vault",
        },
        {
          id: "inspect-altar",
          label: "检查祭坛",
          hint: "让蕾娜冒险接近被视为神圣的装置。",
          effects: { setFlags: ["inspected_altar"], statChanges: { wardenTrust: 1, goddessTrust: -1 } },
          next: "reina-altar-memory",
        },
      ],
    },
    keeper: {
      id: "keeper",
      kind: "dialogue",
      title: "守灯人的账",
      lines: [
        {
          speakerId: "old_mara",
          emotion: "fear",
          text: "圣火当然不需要灯油。那是……那是给朝圣者照路的副灯。",
        },
        {
          speakerId: "the_unflagged",
          text: "副灯每七日正好用掉一桶油，而今天这一页被撕了。是谁领走了它？",
        },
        {
          speakerId: "old_mara",
          emotion: "doubt",
          text: "一个蒙着灰布的祭司。他有内殿的铜印。我不敢问名字。",
        },
        {
          text: "你取得了证据【守灯账簿】。广场另一侧忽然传来金属断裂声。",
        },
      ],
      choices: [
        {
          id: "protect-crowd",
          label: "先疏散朝圣者",
          hint: "牺牲追踪时间，降低战斗中的平民风险。",
          effects: {
            setFlags: ["protected_pilgrims"],
            addEvidence: ["lamp_oil_ledger"],
            statChanges: { civilianSafety: 20 },
          },
          next: "unflagged-night-letter",
        },
        {
          id: "chase-sound",
          label: "追向祭坛后门",
          hint: "可能抓住破坏者，但人群将无人照看。",
          effects: { addEvidence: ["lamp_oil_ledger"], statChanges: { civilianSafety: -10 } },
          next: "unflagged-night-letter",
        },
      ],
    },
    altar: {
      id: "altar",
      kind: "dialogue",
      title: "不会燃烧的灰",
      lines: [
        {
          speakerId: "reina",
          emotion: "resolve",
          text: "灰是冷的。不是刚熄灭——至少冷了一个小时。钟响以前，有东西替它发光。",
        },
        {
          speakerId: "seraphina",
          emotion: "doubt",
          text: "你是说，我们跪拜的火焰……只是一道幻光？",
        },
        {
          speakerId: "the_unflagged",
          text: "我只说有人伪造了熄灭时间。至于此前的四百年，我们还没有证据。",
        },
        {
          text: "你取得了证据【无温余烬】。石阶下躺着一把折断的铁砧制式扳手。",
        },
      ],
      choices: [
        {
          id: "take-both",
          label: "收起灰烬与扳手",
          hint: "扳手可能是嫁祸卫道士的线索。",
          effects: { addEvidence: ["cold_ash", "broken_wrench"] },
          next: "unflagged-night-letter",
        },
        {
          id: "public-accusation",
          label: "当众指控有人嫁祸",
          hint: "暂时保护蕾娜，却会激怒骑士。",
          effects: {
            setFlags: ["accused_wardens"],
            addEvidence: ["cold_ash", "broken_wrench"],
            statChanges: { wardenTrust: 2, publicFaith: -10, goddessTrust: -2 },
          },
          next: "unflagged-night-letter",
        },
      ],
    },
    confrontation: {
      id: "confrontation",
      kind: "dialogue",
      title: "灰眼人",
      lines: [
        {
          text: "祭坛后门轰然洞开。蒙灰布的人把最后一罐油泼向台阶，火线在人群与骑士之间升起。",
        },
        {
          speakerId: "masked_saboteur",
          emotion: "resolve",
          text: "看清楚吧！会饥饿的火，会被油喂养的神——你们为它杀了多少人？",
        },
        {
          speakerId: "seraphina",
          emotion: "resolve",
          text: "他的真相不需要用平民作柴。先救人，之后再审判圣火。",
        },
      ],
      choices: [
        {
          id: "enter-battle",
          label: "进入战斗：控制圣辉广场",
          hint: "第六回合前救出平民，并阻止灰眼人点燃主祭坛。",
          next: "square-battle",
        },
      ],
    },
    "square-battle": {
      id: "square-battle",
      kind: "battle",
      battleId: "holy-square-crisis",
      title: "圣辉广场危机",
      briefing: "灰眼人正在点燃三处油槽，女神骑士则把蕾娜视为共犯。敌人的攻击意图会提前显示；击倒灰眼人或令其信念归零均可将其捕获。",
      objectives: ["六回合内稳定广场", "至少救出两组平民", "阻止主祭坛被点燃"],
      victoryNext: "ash-witness-circle",
      defeatNext: "square-setback",
    },
    "square-setback": {
      id: "square-setback",
      kind: "dialogue",
      title: "燃烧的封锁线",
      lines: [
        { text: "广场没有被完全稳住，但使团带出了守灯人和证物。奥德里克封锁城门，要求立刻交出证据。" },
        { speakerId: "seraphina", emotion: "resolve", text: "我们失去了一部分广场，不能再把活着的见证也留给一纸命令。" },
      ],
      choices: [{ id: "face-odric-after-loss", label: "带着幸存者前往城门", next: "odric-gatewatch" }],
    },
    "aftermath-choice": {
      id: "aftermath-choice",
      kind: "dialogue",
      title: "火焰重新亮起以前",
      lines: [
        {
          text: "灰眼人被缴械，祭坛的供油机关也暴露在晨光下。骑士要求封锁现场；广场上仍有数百双眼睛等待解释。",
        },
        {
          speakerId: "seraphina",
          emotion: "doubt",
          text: "公开机关，今天也许会有暴乱。隐瞒它，我们就替四百年的谎言续上了第一桶油。",
        },
        {
          speakerId: "reina",
          emotion: "resolve",
          text: "真相不会因为公布得太早而变成谎言，但人会死。由你决定。",
        },
      ],
      choices: [
        {
          id: "reveal-truth",
          label: "公开供油机关与全部证据",
          hint: "信仰将遭受冲击，但调查不再受教廷控制。",
          effects: {
            setFlags: ["revealed_mechanism", "saboteur_captured", "square_stabilized"],
            statChanges: { publicFaith: -25, wardenTrust: 2, goddessTrust: -2 },
          },
          next: "odric-gatewatch",
        },
        {
          id: "preserve-order",
          label: "封存机关，宣布破坏者已落网",
          hint: "暂时保全秩序，并取得女神国的通行许可。",
          effects: {
            setFlags: ["concealed_mechanism", "saboteur_captured", "square_stabilized"],
            statChanges: { publicFaith: 10, goddessTrust: 3, wardenTrust: -2 },
          },
          next: "odric-gatewatch",
        },
      ],
    },
    "odric-approach": {
      id: "odric-approach",
      kind: "dialogue",
      title: "秩序的剑",
      lines: [
        { text: "奥德里克把城门横闩落下。他承认自己并不确定女神是否存在，却认定没有封锁就只剩流血。" },
        { speakerId: "the_unflagged", text: "你可以保护秩序，但不能让秩序替证据失踪。" },
      ],
      choices: [{ id: "enter-odric-judgment", label: "开战：护送证据穿过城门", hint: "Tier 1 Boss 会在信念动摇后改变攻击意图。", next: "gate-register-blank" }],
    },
    "odric-judgment": {
      id: "odric-judgment",
      kind: "battle",
      battleId: "odric-judgment",
      title: "阶梯 Boss：奥德里克",
      briefing: "击破盾阵或动摇奥德里克的信念，为证据与幸存者打开城门。",
      objectives: ["突破第一阶段盾阵", "令奥德里克让出城门", "保住至少一名见证者"],
      victoryNext: "odric-resolution",
      defeatNext: "failure",
    },
    "odric-resolution": {
      id: "odric-resolution",
      kind: "dialogue",
      title: "剑尖落下以后",
      lines: [{ text: "奥德里克收剑，让出一条只够证据箱与幸存者通过的路。广场仍在争吵，但证据不再只属于封锁线内的人。" }],
      choices: [{id:"hear-temporary-passage",label:"听取奥德里克提出的临时通行令",next:"odric-lowered-sword"}],
    },
    ...holyFlameExpansionNodes,
    ...holyFlameRequiredStoryNodes,
    "truth-ending": {
      id: "truth-ending",
      kind: "ending",
      endingId: "truth",
      title: "结果：没有神迹的清晨",
      lines: [
        { text: "你拆开祭坛外壳，让铜管、油槽与幻光晶片暴露在所有人面前。广场没有立刻欢呼，只剩漫长的沉默。" },
        { speakerId: "seraphina", emotion: "resolve", text: "如果女神存在，她不该害怕我们看见一根铜管。" },
        { speakerId: "reina", emotion: "doubt", text: "城门打开了。但从今天开始，每一扇门后都可能有一场战争。" },
      ],
      summary: "真相被公开。卫道士愿意合作，女神国开始动荡；第二章将从逃离圣辉城展开。",
    },
    "order-ending": {
      id: "order-ending",
      kind: "ending",
      endingId: "order",
      title: "结果：重新点燃的谎言",
      lines: [
        { text: "守灯人接上备用油管，塞拉菲娜亲手点燃祭坛。人群跪下时，你把账簿封进无旗使团的铁箱。" },
        { speakerId: "seraphina", emotion: "doubt", text: "他们今晚不会互相残杀。这足够成为我们沉默的理由吗？" },
        { speakerId: "reina", emotion: "anger", text: "你保住了一座城，也教会教廷：真相可以被你定价。" },
      ],
      summary: "秩序被保全。女神国授予通行许可，卫道士不再完全信任你；被封存的证据仍可能在之后公开。",
    },
    failure: {
      id: "failure",
      kind: "ending",
      endingId: "failure",
      title: "结果：第二场火",
      lines: [
        { text: "主祭坛爆燃，恐慌的人群撞开封锁线。等钟声停止，圣辉城已经有三个街区升起浓烟。" },
      ],
      summary: "垂直切片失败结局。玩家可从战斗前重新开始。",
    },
  },
};
