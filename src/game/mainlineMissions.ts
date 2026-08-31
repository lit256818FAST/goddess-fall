import type { MainlineProgress } from "./campaign";

export type MainlineMissionType = "清剿" | "护送" | "侦察" | "训练" | "谈判" | "追捕" | "调度";

export interface MainlineMissionDefinition {
  id: string;
  chapter: number;
  type: MainlineMissionType;
  icon: string;
  title: string;
  description: string;
  reward: string;
  xp: number;
  coins: number;
}

/**
 * One optional military task board per chapter. They are deliberately small
 * and data-driven so chapters can add a second/third task without changing UI.
 */
export const mainlineMissions: readonly MainlineMissionDefinition[] = [
  { id: "ch1-scout-execution-yard", chapter: 1, type: "侦察", icon: "/assets/images/missions/scout.webp", title: "刑场地形测绘", description: "在开战前记录绞架、侧门与平民撤离线。", reward: "首回合意图更清晰", xp: 18, coins: 8 },
  { id: "ch2-escort-grain", chapter: 2, type: "护送", icon: "/assets/images/missions/escort.webp", title: "护住流亡粮车", description: "保证至少一辆粮车穿过暗影教堂外的封锁线。", reward: "战后额外口粮 +2", xp: 24, coins: 12 },
  { id: "ch3-train-new-kavala", chapter: 3, type: "训练", icon: "/assets/images/missions/train.webp", title: "河湾民兵操练", description: "把民兵编成可撤退的两列阵，减少低洼地失序。", reward: "军队声望 +1", xp: 28, coins: 14 },
  { id: "ch4-negotiate-council", chapter: 4, type: "谈判", icon: "/assets/images/missions/negotiate.webp", title: "四国会前交涉", description: "为临时盟军写下换边时仍可执行的军令。", reward: "政治压力 -1", xp: 32, coins: 18 },
  { id: "ch5-hunt-raiders", chapter: 5, type: "追捕", icon: "/assets/images/missions/hunt.webp", title: "追踪草原掠骑", description: "在龙誓矿脉附近锁定蛮荒先锋，不让他们切断粮路。", reward: "骑兵侧翼开局", xp: 38, coins: 24 },
  { id: "ch6-cleanse-sanctum", chapter: 6, type: "清剿", icon: "/assets/images/missions/cleanse.webp", title: "清理污染圣殿", description: "封住神力污染源，避免战斗中出现额外污染地块。", reward: "污染扩散延后一回合", xp: 44, coins: 30 },
  { id: "ch7-dispatch-lake-city", chapter: 7, type: "调度", icon: "/assets/images/missions/dispatch.webp", title: "湖都会战调度", description: "为三路部队分配一名能独立执行命令的军官。", reward: "终局额外一枚行动令", xp: 52, coins: 40 },
];

export function mainlineMissionsForChapter(chapter: number): readonly MainlineMissionDefinition[] {
  return mainlineMissions.filter((mission) => mission.chapter === chapter);
}

export function selectMainlineMission(progress: MainlineProgress, missionId: string): MainlineProgress {
  const mission = mainlineMissions.find((item) => item.id === missionId);
  if (!mission || progress.completedMissions.includes(missionId)) return progress;
  return { ...progress, selectedMissionId: missionId };
}
