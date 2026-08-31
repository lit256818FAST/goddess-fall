export type RouteNodeKind = "investigation" | "negotiation" | "battle" | "rest";

export interface RouteNodePreview {
  id: string;
  sequence: number;
  title: string;
  kind: RouteNodeKind;
  location: string;
  objective: string;
  risk: "低" | "中" | "高";
  knownThreat: string;
  consequence: string;
  status: "next" | "future";
}

export interface WeekActionOption {
  id: "investigate" | "rest" | "negotiate";
  title: string;
  description: string;
  immediateEffect: string;
  battleEffect: string;
  unavailableReason?: string;
}

export interface RosterState {
  characterId: import("../game/campaign").CampaignCharacterId;
  roleName: string;
  condition: "正常" | "疲劳" | "轻伤";
  readiness: string;
  relationshipNote: string;
  selected: boolean;
}

export interface PostBattleOutcome {
  result: "victory" | "defeat";
  headline: string;
  summary: string;
  changes: string[];
  nextWeekNotice: string;
  recommendedNextAction: "investigate" | "rest" | "negotiate";
}

export interface MilestoneAWeekContent {
  id: string;
  actLabel: string;
  weekLabel: string;
  homeHeadline: string;
  route: RouteNodePreview[];
  actions: WeekActionOption[];
  roster: RosterState[];
  battlePreparation: {
    title: string;
    objective: string;
    terrain: string;
    knownIntent: string;
    evidencePrompt: string;
    launchLabel: string;
  };
  postBattle: Record<"victory" | "defeat", PostBattleOutcome>;
}

/** 里程碑 A：从驻地到战后成长反馈的一整周玩家可见内容。 */
export const campaignWeekOne: MilestoneAWeekContent = {
  id: "act1_week1_holy_flame",
  actLabel: "第一幕 · 灰烬圣路",
  weekLabel: "第一周 · 圣火余烬",
  homeHeadline: "钟声已经响过三遍，圣火仍未重新点燃。",
  route: [
    {
      id: "holy_flame_square",
      sequence: 1,
      title: "熄火的广场",
      kind: "battle",
      location: "圣辉城 · 圣火广场",
      objective: "保护平民，控制祭坛，并阻止灰眼人带走机关部件。",
      risk: "中",
      knownThreat: "破坏者会绕向祭坛；恐慌人群可能阻塞通路。",
      consequence: "战斗结果将决定女神国是否允许使团继续调查。",
      status: "next",
    },
    {
      id: "ash_gate_checkpoint",
      sequence: 2,
      title: "灰门盘查",
      kind: "negotiation",
      location: "圣辉城 · 北灰门",
      objective: "带着证物通过审判庭封锁，避免使团被扣押。",
      risk: "低",
      knownThreat: "审判官奥德里克已下令核验所有铁砧制式器具。",
      consequence: "若缺乏证据或信任，下一场护送将增加追兵。",
      status: "future",
    },
    {
      id: "witness_road",
      sequence: 3,
      title: "证人之路",
      kind: "battle",
      location: "圣辉城外 · 旧朝圣道",
      objective: "护送守灯人抵达河湾驿站；无需全歼敌人。",
      risk: "高",
      knownThreat: "圣辉骑士可能封锁撤离格，敌方增援数量未知。",
      consequence: "证人是否抵达将改变奥德里克审判战的第三种解法。",
      status: "future",
    },
  ],
  actions: [
    {
      id: "investigate",
      title: "调查祭坛灰烬",
      description: "蕾娜复核熄火时间，并检查祭坛下方的供油结构。",
      immediateEffect: "获得证物“无温余烬”，证据 +1，敌情提升一级。",
      battleEffect: "战前简报显示一条已确认的敌方意图；不改变战斗数值。",
    },
    {
      id: "rest",
      title: "短暂休整",
      description: "让使团离开骚动中心，处理擦伤并稳定塞拉菲娜的信念。",
      immediateEffect: "清除一名角色的疲劳，队伍凝聚 +1。",
      battleEffect: "本周不提供额外战斗增益；休整结果写入出战状态。",
    },
    {
      id: "negotiate",
      title: "与守灯人交涉",
      description: "承诺保护老玛拉及其家人，换取她对灯油账簿的证词。",
      immediateEffect: "获得证物“守灯账簿”，证据 +1，女神国态度 +1。",
      battleEffect: "本周不增加战斗数值；派系态度会在主页与成长页显示。",
    },
  ],
  roster: [
    {
      characterId: "the_unflagged",
      roleName: "使节 / 见证人",
      condition: "正常",
      readiness: "可携带一份证据进入战前准备。",
      relationshipNote: "塞拉菲娜希望你保护信仰；蕾娜要求你保护事实。",
      selected: true,
    },
    {
      characterId: "seraphina",
      roleName: "调停者",
      condition: "疲劳",
      readiness: "仍可出战；连续行动后可能转为轻伤。",
      relationshipNote: "她愿意安抚群众，但反对当众拆解祭坛。",
      selected: true,
    },
    {
      characterId: "reina",
      roleName: "工程师",
      condition: "正常",
      readiness: "可拆除机关，并识别伪造的铁砧工具。",
      relationshipNote: "她接受保护平民，但拒绝替神迹背书。",
      selected: true,
    },
  ],
  battlePreparation: {
    title: "战前准备 · 熄火的广场",
    objective: "在平民安全降至零前控制祭坛，并阻止灰眼人撤离。",
    terrain: "8×8 广场；祭坛居中；两侧火盆形成狭窄通路。",
    knownIntent: "灰眼人优先接近祭坛；恐慌者会远离最近的敌对单位。",
    evidencePrompt: "是否投入一份证据改变开战条件？证据将在本次行动中消耗。",
    launchLabel: "开战",
  },
  postBattle: {
    victory: {
      result: "victory",
      headline: "广场恢复秩序，但圣火的秘密已经无法完全收回。",
      summary: "平民得以撤离，祭坛机关被完整保留。灰眼人留下的工具证明有人刻意嫁祸卫道士。",
      changes: [
        "获得证物“折断的异制扳手”",
        "平民安全 +1",
        "队伍凝聚 +1",
        "塞拉菲娜保留“疲劳”状态",
        "解锁行动路线节点“灰门盘查”",
      ],
      nextWeekNotice: "第二周将从灰门盘查开始；奥德里克要求使团交出全部证物。",
      recommendedNextAction: "negotiate",
    },
    defeat: {
      result: "defeat",
      headline: "灰眼人逃离广场，审判庭接管了祭坛。",
      summary: "使团保住了大部分平民，却失去现场主动权。故事继续，但灰门守军会把你们视为嫌疑人。",
      changes: [
        "口粮 -1",
        "平民安全 -1",
        "女神国态度 -1",
        "塞拉菲娜由“疲劳”转为“轻伤”",
        "下一行动风险标记为“警戒升级”",
      ],
      nextWeekNotice: "第二周仍进入灰门盘查；先调查可找回一份能证明时间线的证据。",
      recommendedNextAction: "investigate",
    },
  },
};
