import type { MainlineProgress } from "./campaign";

export type MainlineSkillRoute = "战士路线" | "指挥路线" | "系统路线";

export interface MainlineSkillDefinition {
  id: string;
  route: MainlineSkillRoute;
  name: string;
  description: string;
  effect: string;
  requires?: string;
}

export const mainlineSkills: readonly MainlineSkillDefinition[] = [
  { id: "iron-bone", route: "战士路线", name: "铁骨", description: "把伤势转化为可以继续行动的余地。", effect: "体质 +2；轻伤造成的生命减益减少 1。" },
  { id: "shield-counter", route: "战士路线", name: "盾反", description: "在敌方攻击意图兑现前保留一次反击窗口。", effect: "护持状态下第一次生命伤害 -2。", requires: "iron-bone" },
  { id: "heavy-strike", route: "战士路线", name: "重击", description: "把力量集中在一次稳定的破阵一击。", effect: "亚瑟生命攻击 +1；配合暴露目标可快速击穿阶段。", requires: "shield-counter" },
  { id: "lance-charge", route: "战士路线", name: "骑枪冲锋", description: "用更长的步幅把直线冲锋变成可重复的战术。", effect: "亚瑟移动力 +1，能更可靠地切入 Boss 侧翼。", requires: "heavy-strike" },
  { id: "battle-line", route: "指挥路线", name: "军阵", description: "把三名出战成员看作一条可以调整的阵线。", effect: "相邻队友获得 1 点额外防御。" },
  { id: "rally", route: "指挥路线", name: "鼓舞", description: "用军令稳定队友的信念，而不是强迫他们服从。", effect: "每场战斗开局全队信念 +1。", requires: "battle-line" },
  { id: "tactical-retreat", route: "指挥路线", name: "战术撤退", description: "承认这一格不值得牺牲整条粮路。", effect: "失败时额外保留 1 份口粮与 1 点军队声望。", requires: "rally" },
  { id: "field-dispatch", route: "指挥路线", name: "临时调度", description: "把军职任务的后果带进战场。", effect: "可在战斗中把一次可行动单位重新交给队友。", requires: "tactical-retreat" },
  { id: "identify", route: "系统路线", name: "敌方鉴定", description: "让系统先回答敌人想做什么。", effect: "战前显示第一轮意图，并让敌方首个移动力 -1。" },
  { id: "weakness-analysis", route: "系统路线", name: "弱点分析", description: "把敌人的阶段阈值标记为可读的信息。", effect: "Boss 阶段阈值提前显示，暴露目标受到的额外伤害 +1。", requires: "identify" },
  { id: "experience-boost", route: "系统路线", name: "经验增幅", description: "系统把失败中的有效信息也写入成长。", effect: "战斗经验获取 +20%。", requires: "weakness-analysis" },
  { id: "danger-warning", route: "系统路线", name: "危险预警", description: "在红色意图脉冲出现前提醒一次最危险的目标格。", effect: "每回合第一次被瞄准时获得一次免费移动提示。", requires: "experience-boost" },
];

export function mainlineSkillAvailable(progress: MainlineProgress, skill: MainlineSkillDefinition): boolean {
  return progress.level >= 1 && (!skill.requires || progress.skills.includes(skill.requires));
}

export function learnMainlineSkill(progress: MainlineProgress, skillId: string): MainlineProgress {
  const skill = mainlineSkills.find((item) => item.id === skillId);
  if (!skill || progress.skillPoints < 1 || progress.skills.includes(skillId) || !mainlineSkillAvailable(progress, skill)) return progress;
  const next = { ...progress, skillPoints: progress.skillPoints - 1, skills: [...progress.skills, skillId] };
  const statBonuses: Partial<Record<string, keyof MainlineProgress>> = {
    "iron-bone": "constitution",
    "shield-counter": "constitution",
    "heavy-strike": "strength",
    "lance-charge": "agility",
    "battle-line": "will",
    rally: "will",
    identify: "agility",
    "weakness-analysis": "will",
  };
  const stat = statBonuses[skillId];
  if (stat && typeof next[stat] === "number") next[stat] = (next[stat] as number) + (skillId === "iron-bone" || skillId === "heavy-strike" ? 2 : 1) as never;
  return next;
}
