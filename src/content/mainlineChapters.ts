import type { StoryChapter, StoryNode } from "./types";

type MainlineChapterSpec = {
  id: string;
  title: string;
  subtitle: string;
  artwork: { src: string; alt: string };
  nodeArtwork: { src: string; alt: string };
  location: string;
  battleId: string;
  battleTitle: string;
  briefing: string;
  objectives: string[];
  secondBattleId?: string;
  secondBattleTitle?: string;
  secondBriefing?: string;
  secondObjectives?: string[];
  secondOpening?: string;
  opening: string;
  choiceA: string;
  choiceB: string;
  aftermath: string;
  failure: string;
};

const specs: readonly MainlineChapterSpec[] = [
  {
    id: "arthur-vol-1-iron-fire", title: "第一章·铁与火", subtitle: "刑场苏醒与卫道士军国", artwork: { src: "/assets/images/mainline-iron-fire.webp", alt: "刑场苏醒后通往卫道士城堡的铁与火之路" }, nodeArtwork: { src: "/assets/images/mainline-nodes/chapter-1-execution-turn.webp", alt: "刑场铁环落地后，亚瑟伸手救援平民的关键转折" },
    location: "卫道士军国 · 刑场边境", battleId: "arthur-execution-escape", battleTitle: "刑场逃亡", briefing: "亚瑟在处刑台上醒来。系统给出的第一个指令不是求生，而是判断谁正在把平民推向火线。", objectives: ["护送两名平民离开刑场", "在第 7 回合前关闭处刑机关"], secondBattleId: "arthur-border-blockade", secondBattleTitle: "边境堵截", secondBriefing: "逃出刑场不等于脱离军国。边境哨线已经落闸，亚瑟必须用第一枚军牌换取一条可撤回的通道。", secondObjectives: ["让亚瑟抵达东侧军牌检查点", "阻止敌方封锁三回合"], secondOpening: "军牌还带着刑场的灰。哨兵没有问你是否无辜，只问你能不能让身后的人活着通过。", opening: "铁环落地的声音先于疼痛抵达。一个陌生的界面在亚瑟眼前亮起：力量、意志、危险预警。", choiceA: "先救被押来的平民", choiceB: "先夺取卫道士的盾牌", aftermath: "你没有成为英雄，只是让三个人活过了这一段铁与火。卫道士军国因此给你一枚临时军牌。", failure: "刑场的门还是打开了。亚瑟带着伤势逃入边境，系统第一次记录了失败也能继续的事实。",
  },
  {
    id: "arthur-vol-2-exile", title: "第二章·流亡与争抢", subtitle: "各方都想要的系统持有者", artwork: { src: "/assets/images/mainline-exile.webp", alt: "暗影大教堂外的流亡者与撤离灯火" }, nodeArtwork: { src: "/assets/images/mainline-nodes/chapter-2-evacuation-turn.webp", alt: "证人穿过暗影大教堂门槛、传送锚点在身后破裂" },
    location: "暗影大教堂 · 撤离区", battleId: "arthur-cathedral-evacuation", battleTitle: "暗影大教堂撤离", briefing: "女神国、黑色教廷与议会国同时寻找亚瑟。穿过教堂不等于击倒所有敌人，而是让证人和路线一起活下来。", objectives: ["让三名证人抵达北侧出口", "关闭黑色教廷的传送锚点"], secondBattleId: "arthur-council-front", secondBattleTitle: "议会国前线", secondBriefing: "证人离开教堂后，议会国的前线要求你交出名单。传送锚点仍在远处脉动，抓捕与护送必须同时完成。", secondObjectives: ["保护证人到达粮路", "关闭两座传送锚点"], secondOpening: "议会的印章比刀更快。它能把一个人写成证人，也能把一整条粮路写成叛乱。", opening: "流亡者把名字写在粮袋上。有人说亚瑟是钥匙，也有人说他只是一个会走路的灾难。", choiceA: "相信维拉的撤离路线", choiceB: "公开系统的存在换取时间", aftermath: "你带走了证人，也带走了一个无法轻易解释的政治债务。", failure: "传送门吞掉了半条街。亚瑟没有被捕，但从此每一方都把他列为高危目标。",
  },
  {
    id: "arthur-vol-3-new-kavala", title: "第三章·新卡瓦拉守护者", subtitle: "河湾、粮路与三方战场", artwork: { src: "/assets/images/mainline-kavala.webp", alt: "新卡瓦拉河湾的水闸、粮路与森林缓冲区" }, nodeArtwork: { src: "/assets/images/mainline-nodes/chapter-3-watergate-turn.webp", alt: "泥泞低地的水闸关闭，民兵推粮车穿过狭窄堤道" },
    location: "新卡瓦拉 · 马奴低洼地", battleId: "arthur-lowland-ambush", battleTitle: "马奴低洼伏击", briefing: "亚瑟以军事顾问身份回到河湾。洪闸、粮车和三方谈判都在同一张地图上，任何一次冲锋都可能让另一方断粮。", objectives: ["守住水闸控制格两回合", "保护粮车离开低洼地"], secondBattleId: "arthur-army-trials", secondBattleTitle: "河湾军阵试炼", secondBriefing: "低洼地的水位退去后，民兵必须在泥地里证明新的军阵不是纸上谈兵。", secondObjectives: ["让两支民兵完成集结", "保持至少一辆粮车可用"], secondOpening: "水闸合上了，但没人庆祝。真正的考验是让一群互不信任的人在同一声号令里移动。", opening: "阿斯诺卡把一枚湿透的粮票按在地图上：这里不是战场，是一条会决定谁能过冬的线。", choiceA: "先封水闸再护送粮车", choiceB: "先与森林缓冲区谈判", aftermath: "河湾没有给你王冠，只给你一张可以继续使用的粮路通行证。", failure: "水闸提前开了。三方都损失了东西，也都认为亚瑟欠自己一次解释。",
  },
  {
    id: "arthur-vol-4-reform", title: "第四章·改革与崩溃", subtitle: "女神国改革与四国会战", artwork: { src: "/assets/images/mainline-reform.webp", alt: "四国会战中的改革派指挥台与换边旗帜" }, nodeArtwork: { src: "/assets/images/mainline-nodes/chapter-4-banners-turn.webp", alt: "湿石上的四面战旗与正在撤离的临时盟军" },
    location: "圣辉城 · 四国会战外环", battleId: "white-knight-charge", battleTitle: "白光骑士长", briefing: "改革派、黑色教廷与卫道士军国在同一场会战中换边。亚瑟必须先在白光骑士长面前证明自己能守住阵线。", objectives: ["在骑士长冲锋后保持阵线", "让亚瑟完成一次盾牌格挡"], secondBattleId: "arthur-four-country-war", secondBattleTitle: "四国会战", secondBriefing: "白光骑士长退入烟尘，四国会战才真正开始。临时盟军会换边，任何旗标都不能被当作永恒的忠诚。", secondObjectives: ["让至少两支临时盟军完成集结", "关闭战场上的信仰扩散旗标"], secondOpening: "骑士长留下的白光照在四面旗上。它们看起来都像答案，直到第一支盟军开始后撤。", opening: "宴席上的每个人都说自己愿意改革，直到改革真正要求他们交出一部分权力。", choiceA: "站在改革派一侧", choiceB: "先保存军队，再等待换边", aftermath: "你第一次明白，改革不是一句正确的话，而是一场允许盟友离开的战斗。", failure: "盟军各自撤离。女神国没有立刻崩溃，但它的裂缝已经写进了所有人的档案。",
  },
  {
    id: "arthur-vol-5-steppe", title: "第五章·草原之主", subtitle: "龙誓、粮食危机与部队编制", artwork: { src: "/assets/images/mainline-steppe.webp", alt: "草原粮线、龙誓矿脉与远方骑兵" }, nodeArtwork: { src: "/assets/images/mainline-nodes/chapter-5-oath-mine-turn.webp", alt: "龙影掠过龙誓矿脉，疲惫士兵在裂开的誓石旁推粮车" },
    location: "北方草原 · 龙誓矿脉", battleId: "arthur-dragon-oath", battleTitle: "龙誓矿脉", briefing: "草原诸部要求你成为名义上的领袖，龙族只承认一份没有被污染的誓约。粮食危机让每个选择都有重量。", objectives: ["保护三辆粮车", "在龙誓祭坛完成一次无武力互动"], secondBattleId: "arthur-steppe-supply", secondBattleTitle: "草原护粮", secondBriefing: "龙誓暂时成立，蛮荒先锋却趁夜切入粮线。亚瑟必须在骑兵机动与粮食分配之间做出可执行的选择。", secondObjectives: ["保护两辆粮车抵达营地", "阻止掠骑切断南侧粮线"], secondOpening: "龙影从矿脉上空掠过，粮车的轮子却还陷在泥里。盟约不会替你把车推出来。", opening: "草原上的风没有旗帜。它只会把粮食的味道带给最先闻到的人。", choiceA: "把粮食优先给伤员", choiceB: "用矿脉换取龙族支援", aftermath: "草原承认你的调度，而不是你的血统。军职等级第一次影响了对话之外的战场编制。", failure: "矿脉没有封住，粮路也没有守住。你仍然拥有一支队伍，但它不再相信每条命令都值得执行。",
  },
  {
    id: "arthur-vol-6-evil-god", title: "第六章·邪神崛起", subtitle: "造神圣殿与生者防线", artwork: { src: "/assets/images/mainline-evil-god.webp", alt: "造神圣殿的污染仪式环与生者防线" }, nodeArtwork: { src: "/assets/images/mainline-nodes/chapter-6-sanctum-turn.webp", alt: "造神圣殿中生者防线围住昏暗祭坛，审判官站在仪式屏幕后" },
    location: "造神圣殿 · 生者防线", battleId: "night-judge", battleTitle: "永夜殿审查", briefing: "新神、女神、黑色教廷和邪神同时介入。审判官不只攻击亚瑟的生命，还会把你与各方的关系变成可见的敌方意图。", objectives: ["保护生者防线四回合", "打断审判官的内心审查"], opening: "审判官没有问你做过什么。他问的是：如果所有人都知道，你还会做同样的选择吗？", choiceA: "承认曾经的失败", choiceB: "把责任推给系统", aftermath: "意志不再是隐藏数值。它成为一条可以被队友看见、也可以被敌人利用的线。", failure: "审查没有结束，只是换了一个记录者。亚瑟带着污染和更高的军职压力进入湖都。",
  },
  {
    id: "arthur-vol-7-finale", title: "第七章·终局之战", subtitle: "湖都会战与凡人的秩序", artwork: { src: "/assets/images/mainline-finale.webp", alt: "湖都三路会战与信仰发散器" }, nodeArtwork: { src: "/assets/images/mainline-nodes/chapter-7-three-roads-turn.webp", alt: "三条路径汇向湖都庭院的三个装置，赤白双核在水面上对峙" },
    location: "湖都外围 · 信仰发散器", battleId: "lake-dual-god", battleTitle: "湖都双邪神战", briefing: "三路分兵，三个目标，两个神力核心。胜利不是杀死 Boss，而是关闭信仰发散器，让凡人重新拥有决定秩序的权利。", objectives: ["三路各完成一项关闭装置任务", "让亚瑟活着抵达湖都中庭"], opening: "湖都的钟声同时来自三座神殿。亚瑟终于看见系统最初没有告诉他的那一行字：世界不会替你选择秩序。", choiceA: "关闭发散器，放走其中一个核心", choiceB: "让两股神力互噬，承担失控风险", aftermath: "你拒绝成为皇帝，也拒绝成为神。新的秩序从一份允许失败继续推进的记录开始。", failure: "湖都没有被拯救成一个完美的结局，但幸存者仍然拥有争论下一步的资格。",
  },
];

function buildChapter(spec: MainlineChapterSpec): StoryChapter {
  const intro = `${spec.id}-intro`;
  const battle = `${spec.id}-battle`;
  const secondBattle = spec.secondBattleId ? `${spec.id}-second-battle` : undefined;
  const secondIntro = secondBattle ? `${spec.id}-second-intro` : undefined;
  const victory = `${spec.id}-victory`;
  const defeat = `${spec.id}-defeat`;
  const nodes: Record<string, StoryNode> = {
    [intro]: {
      id: intro, kind: "dialogue", title: spec.location, artwork: spec.nodeArtwork,
      lines: [
        { speakerId: "arthur", text: spec.opening, emotion: "doubt" },
        { speakerId: "hans", text: "命令可以改变，阵线不能凭空消失。先决定谁必须活着离开。", emotion: "resolve" },
        { speakerId: "asnoka", text: "地图上有两条路。没有一条会同时让所有人满意。", emotion: "neutral" },
      ],
      choices: [
        { id: `${spec.id}-a`, label: spec.choiceA, hint: "获得一点战前情报", effects: { statChanges: { wardenTrust: 1, publicFaith: 1 } }, next: battle },
        { id: `${spec.id}-b`, label: spec.choiceB, hint: "保留一次失败后的撤退余地", effects: { statChanges: { civilianSafety: 1, goddessTrust: -1 } }, next: battle },
      ],
    },
    [battle]: {
      id: battle, kind: "battle", battleId: spec.battleId, title: spec.battleTitle,
      briefing: spec.briefing, objectives: spec.objectives,
      victoryNext: secondIntro ?? victory, defeatNext: secondIntro ?? defeat,
    },
    [victory]: {
      id: victory, kind: "ending", endingId: "order", title: `${spec.title} · 余火未灭`,
      lines: [{ speakerId: "arthur", text: spec.aftermath, emotion: "resolve" }], summary: "胜利不是清空棋盘，而是让下一章仍然拥有选择。",
    },
    [defeat]: {
      id: defeat, kind: "ending", endingId: "failure", title: `${spec.title} · 失败仍会推进`,
      lines: [{ speakerId: "arthur", text: spec.failure, emotion: "doubt" }], summary: "伤势、资源和政治后果会写入存档，但主线不会被迫读档。",
    },
  };
  if (secondBattle && secondIntro && spec.secondBattleTitle && spec.secondBriefing && spec.secondObjectives && spec.secondOpening) {
    nodes[secondIntro] = {
      id: secondIntro, kind: "dialogue", title: spec.secondBattleTitle,
      lines: [
        { speakerId: "arthur", text: spec.secondOpening, emotion: "resolve" },
        { speakerId: "hans", text: "第一道命令已经有了代价。第二道命令必须说明谁来承担。", emotion: "doubt" },
      ],
      choices: [
        { id: `${spec.id}-second-a`, label: "保持原定军令", hint: "保留当前阵线与情报", effects: { statChanges: { wardenTrust: 1 } }, next: secondBattle },
        { id: `${spec.id}-second-b`, label: "临时改变部署", hint: "牺牲一条路线换取撤退窗口", effects: { statChanges: { civilianSafety: 1, publicFaith: -1 } }, next: secondBattle },
      ],
    };
    nodes[secondBattle] = {
      id: secondBattle, kind: "battle", battleId: spec.secondBattleId!, title: spec.secondBattleTitle,
      briefing: spec.secondBriefing, objectives: spec.secondObjectives, victoryNext: victory, defeatNext: defeat,
    };
  }
  return { id: spec.id, title: spec.title, subtitle: spec.subtitle, artwork: spec.artwork, startNodeId: intro, actionNodeIds: [intro, battle, ...(secondIntro ? [secondIntro, secondBattle!] : [])], nodes };
}

export const mainlineChapters: readonly StoryChapter[] = specs.map(buildChapter);
export const mainlineChapterByWeek: Readonly<Record<number, StoryChapter>> = Object.fromEntries(mainlineChapters.map((chapter, index) => [index + 1, chapter]));

/** The twelve battle IDs used by the seven-volume campaign. */
export const mainlineBattleIds = Object.freeze([
  "arthur-execution-escape", "arthur-border-blockade", "arthur-army-trials", "white-knight-charge", "arthur-cathedral-evacuation", "arthur-council-front", "arthur-lowland-ambush", "arthur-four-country-war", "arthur-steppe-supply", "arthur-dragon-oath", "night-judge", "lake-dual-god",
]);
