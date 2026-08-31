import type { BattleState, Position } from "./battle";
import { isActive } from "./battle";
import type { CampaignCharacterId } from "./campaign";

export type BattleObjectiveKind = "eliminate" | "hold" | "protect" | "evacuate" | "disrupt" | "tri-route" | "white-knight" | "iron-bulwark" | "night-judge";
export type MissionModifierKind = "weaken-target" | "protect-ward" | "extend-limit" | "start-progress";

export interface MissionRoleModifier {
  kind: MissionModifierKind;
  label: string;
}

export interface BattleObjectiveConfig {
  battleId: string;
  title: string;
  kind: BattleObjectiveKind;
  targetUnitId?: string;
  targetCells?: readonly Position[];
  routeLabels?: readonly string[];
  requiredCount?: number;
  requiredRounds?: number;
  protectedUnitId?: string;
  surviveUntilRound?: number;
  roundLimit?: number;
  failureConsequence: string;
  roleModifiers: Partial<Record<CampaignCharacterId, MissionRoleModifier>>;
}

export interface BattleObjectiveRuntime {
  config: BattleObjectiveConfig;
  progress: number;
  lastEvaluatedRound: number;
  roundLimit?: number;
  protectedWard: number;
  activeRoleNotes: string[];
}

export interface BattleObjectiveEvaluation {
  runtime: BattleObjectiveRuntime;
  phase: "active" | "victory" | "defeat";
  progressText: string;
  consequence?: string;
}

const configs: BattleObjectiveConfig[] = [
  {
    battleId: "holy-square-crisis", title: "稳住两处油槽", kind: "hold",
    targetCells: [{ x: 3, y: 4 }, { x: 4, y: 4 }], requiredCount: 2, requiredRounds: 1, roundLimit: 6,
    failureConsequence: "油线越过封锁，平民安全下降。",
    roleModifiers: {
      seraphina: { kind: "protect-ward", label: "调停：为被保护者保留一次任务豁免" },
      odric: { kind: "start-progress", label: "守卫：占点任务从 1 点进度开始" },
      cole: { kind: "extend-limit", label: "斥候：回合限制 +1" },
    },
  },
  {
    battleId: "odric-judgment", title: "公开两处封锁证据", kind: "disrupt", targetCells: [{ x: 3, y: 3 }, { x: 4, y: 3 }], requiredCount: 2,
    failureConsequence: "证据箱被扣留，但幸存者仍会记住封锁。",
    roleModifiers: {
      the_unflagged: { kind: "weaken-target", label: "见证：目标初始生命与信念各 -1" },
      seraphina: { kind: "weaken-target", label: "调停：目标初始生命与信念各 -1" },
      agnes: { kind: "weaken-target", label: "抄经：目标初始生命与信念各 -1" },
    },
  },
  {
    battleId: "border-machines", title: "占领两处锁轴控制格", kind: "hold",
    targetCells: [{ x: 3, y: 2 }, { x: 4, y: 2 }], requiredCount: 2, requiredRounds: 1, roundLimit: 6,
    failureConsequence: "封路机完成自锁，下一行动的警戒升级。",
    roleModifiers: {
      reina: { kind: "start-progress", label: "工程：拆除任务从 1 点进度开始" },
      cole: { kind: "extend-limit", label: "斥候：回合限制 +1" },
      odric: { kind: "protect-ward", label: "守卫：为被保护者保留一次任务豁免" },
    },
  },
  {
    battleId: "grain-crossing", title: "保护塞拉菲娜至粮车撤离", kind: "protect",
    protectedUnitId: "u2", surviveUntilRound: 4, roundLimit: 5,
    failureConsequence: "粮车被迫抛下部分补给，口粮记录下降。",
    roleModifiers: {
      seraphina: { kind: "protect-ward", label: "调停：自身获得一次任务豁免" },
      odric: { kind: "protect-ward", label: "护民：被保护者获得一次任务豁免" },
      cole: { kind: "extend-limit", label: "斥候：回合限制 +1" },
    },
  },
  {
    battleId: "iron-bulwark", title: "解除两处锁轴并击穿动力核心", kind: "iron-bulwark", targetUnitId: "boss-iron-bulwark", targetCells: [{ x: 3, y: 3 }, { x: 4, y: 3 }], requiredCount: 2,
    failureConsequence: "壁垒继续封锁粮路：动力核心未暴露，路线风险升级。",
    roleModifiers: {
      reina: { kind: "weaken-target", label: "工程：目标初始生命与信念各 -1" },
      the_unflagged: { kind: "extend-limit", label: "交涉：保留一次停机窗口" },
      cole: { kind: "extend-limit", label: "斥候：行动窗口 +1" },
    },
  },
  {
    battleId: "silent-march", title: "两名同伴抵达北侧撤离区", kind: "evacuate",
    targetCells: [{ x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 5, y: 1 }, { x: 7, y: 1 }],
    requiredCount: 2, roundLimit: 6,
    failureConsequence: "档案未能完整穿过雾门，但抄本仍保留一份。",
    roleModifiers: {
      cole: { kind: "start-progress", label: "斥候：撤离任务从 1 点进度开始" },
      agnes: { kind: "protect-ward", label: "见证：档案获得一次任务豁免" },
      the_unflagged: { kind: "extend-limit", label: "使节：回合限制 +1" },
    },
  },
  {
    battleId: "veiled-avatar", title: "解除两处守幕锚点", kind: "disrupt", targetCells: [{ x: 3, y: 3 }, { x: 4, y: 3 }], requiredCount: 2,
    failureConsequence: "使团撤出圣所，但公开记录不会被删除。",
    roleModifiers: {
      seraphina: { kind: "weaken-target", label: "信念：目标初始生命与信念各 -1" },
      reina: { kind: "weaken-target", label: "工程：目标初始生命与信念各 -1" },
      agnes: { kind: "extend-limit", label: "见证：保留一次公开抄录窗口" },
    },
  },
  {
    battleId: "arthur-execution-escape", title: "护送平民离开刑场", kind: "evacuate", targetCells: [{ x: 6, y: 0 }, { x: 7, y: 0 }, { x: 6, y: 1 }, { x: 7, y: 1 }], requiredCount: 2, roundLimit: 7,
    failureConsequence: "处刑机关重新锁死，亚瑟带着伤势逃入边境。", roleModifiers: { arthur: { kind: "start-progress", label: "系统：撤离任务从 1 点进度开始" }, hans: { kind: "protect-ward", label: "盾手：平民获得一次任务豁免" }, asnoka: { kind: "extend-limit", label: "侦骑：回合限制 +1" } },
  },
  {
    battleId: "arthur-cathedral-evacuation", title: "让证人抵达北侧出口", kind: "evacuate", targetCells: [{ x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 5, y: 1 }, { x: 7, y: 1 }], requiredCount: 3, roundLimit: 8,
    failureConsequence: "传送锚点吞掉撤离街区，政治压力上升。", roleModifiers: { arthur: { kind: "weaken-target", label: "鉴定：传送锚点初始信念 -1" }, hans: { kind: "protect-ward", label: "盾手：证人获得一次任务豁免" }, asnoka: { kind: "start-progress", label: "侦骑：撤离任务从 1 点进度开始" } },
  },
  {
    battleId: "arthur-lowland-ambush", title: "守住水闸并护送粮车", kind: "hold", targetCells: [{ x: 3, y: 3 }, { x: 4, y: 3 }], requiredCount: 2, requiredRounds: 2, roundLimit: 8,
    failureConsequence: "低洼地被洪水切开，粮路与三方谈判同时受损。", roleModifiers: { arthur: { kind: "extend-limit", label: "军职：回合限制 +1" }, hans: { kind: "protect-ward", label: "盾手：粮车获得一次任务豁免" }, asnoka: { kind: "start-progress", label: "侦骑：占点任务从 1 点进度开始" } },
  },
  {
    battleId: "arthur-four-country-war", title: "关闭三面信仰旗标", kind: "disrupt", targetCells: [{ x: 3, y: 3 }, { x: 4, y: 3 }, { x: 3, y: 4 }], requiredCount: 2,
    failureConsequence: "临时盟军换边，四国会战进入失控阶段。", roleModifiers: { arthur: { kind: "weaken-target", label: "鉴定：旗标核心初始生命与信念 -1" }, hans: { kind: "protect-ward", label: "军阵：盟军获得一次任务豁免" }, asnoka: { kind: "extend-limit", label: "侦骑：行动窗口 +1" } },
  },
  {
    battleId: "arthur-dragon-oath", title: "守住龙誓祭坛", kind: "hold", targetCells: [{ x: 3, y: 3 }, { x: 4, y: 3 }], requiredCount: 1, requiredRounds: 3, roundLimit: 8,
    failureConsequence: "龙誓破裂，草原粮线断裂。", roleModifiers: { arthur: { kind: "start-progress", label: "系统：祭坛进度从 1 点开始" }, hans: { kind: "protect-ward", label: "盾手：祭坛获得一次任务豁免" }, asnoka: { kind: "extend-limit", label: "侦骑：回合限制 +1" } },
  },
  {
    battleId: "night-judge", title: "打断内心审查并撑过四回合", kind: "night-judge", targetUnitId: "boss-night-judge", targetCells: [{ x: 3, y: 3 }, { x: 4, y: 3 }], requiredCount: 2, requiredRounds: 4,
    failureConsequence: "审查记录写入亚瑟的军职档案：未撑过四回合，污染继续扩散。", roleModifiers: { arthur: { kind: "weaken-target", label: "系统：审查官初始信念 -1" }, hans: { kind: "protect-ward", label: "护卫：生者防线获得一次任务豁免" }, asnoka: { kind: "extend-limit", label: "侦骑：回合限制 +1" } },
  },
  {
    battleId: "lake-dual-god", title: "关闭三路信仰发散器", kind: "tri-route", targetCells: [{ x: 2, y: 2 }, { x: 5, y: 2 }, { x: 3, y: 5 }], routeLabels: ["赤核左路", "白核右路", "中庭主路"], requiredCount: 3, roundLimit: 10,
    failureConsequence: "三路未能同时关闭，双邪神继续互噬，湖都外围被神力污染。", roleModifiers: { arthur: { kind: "weaken-target", label: "系统：识别三路核心弱点" }, hans: { kind: "protect-ward", label: "盾手：中庭撤离者获得一次任务豁免" }, asnoka: { kind: "start-progress", label: "侦骑：关闭任务从 1 点进度开始" } },
  },
  {
    battleId: "white-knight-charge", title: "击破纪律盾阵并逼退骑士长", kind: "white-knight", targetUnitId: "boss-white-knight", targetCells: [{ x: 3, y: 3 }, { x: 4, y: 3 }], requiredCount: 2, roundLimit: 9,
    failureConsequence: "白光骑士长保住纪律盾阵，军国把亚瑟列为失控变量。", roleModifiers: { arthur: { kind: "weaken-target", label: "系统：骑士长弱点初始暴露" }, hans: { kind: "protect-ward", label: "盾手：白光冲锋获得一次防线豁免" }, asnoka: { kind: "extend-limit", label: "侦骑：回合限制 +1" } },
  },
  ...["arthur-border-blockade", "arthur-army-trials", "arthur-council-front", "arthur-steppe-supply"].map((battleId) => ({
    battleId, title: "主线军职任务", kind: "eliminate" as const, targetUnitId: "e1", failureConsequence: "军职任务失败，后续章节风险上升。", roleModifiers: {
      arthur: { kind: "weaken-target" as const, label: "系统：鉴定目标弱点" }, hans: { kind: "protect-ward" as const, label: "军阵：保留一次防线豁免" }, asnoka: { kind: "extend-limit" as const, label: "侦骑：行动窗口 +1" },
    },
  })),
];

export const battleObjectiveConfigs: Readonly<Record<string, BattleObjectiveConfig>> =
  Object.fromEntries(configs.filter((config) => !config.battleId.startsWith("arthur-") && !["white-knight-charge", "night-judge", "lake-dual-god"].includes(config.battleId)).map((config) => [config.battleId, config]));

const mainlineObjectiveConfigs: Readonly<Record<string, BattleObjectiveConfig>> =
  Object.fromEntries(configs.filter((config) => config.battleId.startsWith("arthur-") || ["white-knight-charge", "night-judge", "lake-dual-god"].includes(config.battleId)).map((config) => [config.battleId, config]));

export function createBattleObjectiveRuntime(
  battleId: string,
  lineup: readonly CampaignCharacterId[],
): BattleObjectiveRuntime {
  const config = battleObjectiveConfigs[battleId] ?? mainlineObjectiveConfigs[battleId];
  if (!config) throw new Error(`Missing battle objective config: ${battleId}`);
  let progress = 0;
  let roundLimit = config.roundLimit;
  let protectedWard = 0;
  const activeRoleNotes: string[] = [];
  for (const characterId of lineup) {
    const modifier = config.roleModifiers[characterId];
    if (!modifier) continue;
    activeRoleNotes.push(modifier.label);
    if (modifier.kind === "start-progress") progress += 1;
    if (modifier.kind === "extend-limit" && roundLimit !== undefined) roundLimit += 1;
    if (modifier.kind === "protect-ward") protectedWard += 1;
  }
  return { config, progress, lastEvaluatedRound: 1, roundLimit, protectedWard, activeRoleNotes };
}

export function applyOpeningMissionModifiers(
  state: BattleState,
  runtime: BattleObjectiveRuntime,
  lineup: readonly CampaignCharacterId[],
): BattleState {
  const weakenCount = lineup.filter((id) => runtime.config.roleModifiers[id]?.kind === "weaken-target").length;
  if (!weakenCount || !runtime.config.targetUnitId) return state;
  return {
    ...state,
    units: state.units.map((unit) => unit.id === runtime.config.targetUnitId
      ? { ...unit, health: Math.max(1, unit.health - weakenCount), maxHealth: Math.max(1, unit.maxHealth - weakenCount), faith: Math.max(1, unit.faith - weakenCount), maxFaith: Math.max(1, unit.maxFaith - weakenCount) }
      : unit),
  };
}

export function evaluateBattleObjective(
  state: BattleState,
  runtime: BattleObjectiveRuntime,
  advanceRound = false,
): BattleObjectiveEvaluation {
  const config = runtime.config;
  let next = runtime;
  if (advanceRound && state.round > runtime.lastEvaluatedRound) {
    let progress = runtime.progress;
    if (config.kind === "hold") {
      const occupied = countPlayersInCells(state, config.targetCells ?? []);
      if (occupied >= (config.requiredCount ?? 1)) progress += 1;
    }
    next = { ...runtime, progress, lastEvaluatedRound: state.round };
  }
  if (config.kind === "tri-route") {
    next = { ...next, progress: countDisabledTerrain(state, config.targetCells ?? []), lastEvaluatedRound: state.round };
  }

  const activePlayers = state.units.filter((unit) => unit.team === "player" && isActive(unit));
  if (!activePlayers.length || state.phase === "defeat") return failed(next, progressText(state, next));

  if (config.kind === "eliminate") {
    const target = state.units.find((unit) => unit.id === config.targetUnitId);
    if (!target || !isActive(target)) return won(next, "主要目标已退出战斗。");
  }
  if (config.kind === "hold" && next.progress >= (config.requiredRounds ?? 1)) {
    return won(next, `控制点已守住 ${next.progress}/${config.requiredRounds ?? 1} 回合。`);
  }
  if (config.kind === "protect") {
    const protectedUnit = state.units.find((unit) => unit.id === config.protectedUnitId);
    if (!protectedUnit || !isActive(protectedUnit)) {
      if (next.protectedWard > 0) next = { ...next, protectedWard: next.protectedWard - 1 };
      else return failed(next, "被保护目标已退出战斗。");
    }
    if (state.round >= (config.surviveUntilRound ?? Infinity)) return won(next, "保护目标已经等到撤离窗口。");
  }
  if (config.kind === "evacuate") {
    const evacuated = countPlayersInCells(state, config.targetCells ?? []);
    if (evacuated >= (config.requiredCount ?? 1)) return won(next, `已有 ${evacuated} 名同伴抵达撤离区。`);
  }
  if (config.kind === "iron-bulwark") {
    const unlocked = countDisabledTerrain(state, config.targetCells ?? []);
    const boss = state.units.find((unit) => unit.id === config.targetUnitId);
    const phaseTwo = Boolean(boss && boss.maxHealth <= 8);
    if (state.phase === "victory") {
      if (unlocked < (config.requiredCount ?? 2)) return failed(next, "动力锁轴仍在运转：必须先解除两处锁轴，不能只靠击毁壁垒结束战斗。");
      if (!phaseTwo) return failed(next, "动力核心尚未暴露：先让壁垒进入过载阶段，再完成最后一击。");
      return won(next, `动力核心已暴露，锁轴 ${unlocked}/${config.requiredCount ?? 2} 已解除。`);
    }
    if (unlocked < (config.requiredCount ?? 2)) return { runtime: { ...next, progress: unlocked }, phase: "active", progressText: `锁轴 ${unlocked}/${config.requiredCount ?? 2} · 先拆机关再破核心` };
    return { runtime: { ...next, progress: unlocked }, phase: "active", progressText: phaseTwo ? "动力核心已暴露 · 可用信念攻击击穿" : "两处锁轴已解除 · 继续削弱壁垒触发过载" };
  }
  if (config.kind === "night-judge") {
    const seals = countDisabledTerrain(state, config.targetCells ?? []);
    const rounds = config.requiredRounds ?? 4;
    if (state.phase === "victory") {
      if (seals < (config.requiredCount ?? 2)) return failed(next, "审查印记仍在：必须先打断两处内心审查。");
      if (state.round < rounds) return failed(next, `审查尚未撑过 ${rounds} 回合，队伍的证词还没有完成。`);
      return won(next, `内心审查已打断，队伍撑过 ${rounds} 回合。`);
    }
    if (seals < (config.requiredCount ?? 2)) return { runtime: { ...next, progress: seals }, phase: "active", progressText: `审查印记 ${seals}/${config.requiredCount ?? 2} · 先打断再守住队伍` };
    if (state.round < rounds) return { runtime: { ...next, progress: seals }, phase: "active", progressText: `审查已打断 · 坚持到第 ${rounds} 回合（当前 ${state.round}）` };
    return { runtime: { ...next, progress: seals }, phase: "active", progressText: "审查记录已完成 · 击退审判官即可结算" };
  }
  if (config.kind === "disrupt" || config.kind === "tri-route") {
    const disrupted = countDisabledTerrain(state, config.targetCells ?? []);
    if (disrupted >= (config.requiredCount ?? 1)) {
      return won(next, config.kind === "tri-route"
        ? progressText(state, next)
        : `已解除 ${disrupted}/${config.requiredCount ?? 1} 处关键地形。`);
    }
  }
  if (config.kind === "white-knight") {
    const closed = countDisabledTerrain(state, config.targetCells ?? []);
    const boss = state.units.find((unit) => unit.id === config.targetUnitId);
    const phaseTwo = Boolean(boss && boss.maxHealth <= 8);
    if (state.phase === "victory") {
      if (closed < (config.requiredCount ?? 2)) return failed(next, "盾阵仍在运转：必须先关闭两面纪律旗标，不能只靠击杀骑士长结束战斗。");
      if (!phaseTwo) return failed(next, "白光核心尚未暴露：骑士长倒下得太快，纪律盾阵没有被真正击破。");
      return won(next, `纪律盾阵已破 ${closed}/${config.requiredCount ?? 2}，白光骑士长被逼退。`);
    }
    if (closed < (config.requiredCount ?? 2)) return { runtime: { ...next, progress: closed }, phase: "active", progressText: `纪律旗标 ${closed}/${config.requiredCount ?? 2} · 先破盾阵再追击` };
    if (!phaseTwo) return { runtime: { ...next, progress: closed }, phase: "active", progressText: "两面纪律旗标已关闭 · 继续削弱骑士长以触发白光冲锋" };
    return { runtime: { ...next, progress: closed }, phase: "active", progressText: "白光核心已暴露 · 击退骑士长即可完成任务" };
  }
  if (state.phase === "victory") {
    if (config.kind === "tri-route" && next.progress < (config.requiredCount ?? 1)) return failed(next, "双核失控：必须先完成三路关闭，不能只靠击破核心结束战斗。");
    return won(next, "敌方已失去继续阻止任务的能力。");
  }
  if (next.roundLimit !== undefined && state.round > next.roundLimit) return failed(next, `超过第 ${next.roundLimit} 回合限制。`);
  return { runtime: next, phase: "active", progressText: progressText(state, next) };
}

function countPlayersInCells(state: BattleState, cells: readonly Position[]): number {
  return state.units.filter((unit) => unit.team === "player" && isActive(unit)
    && cells.some((cell) => cell.x === unit.position.x && cell.y === unit.position.y)).length;
}

function countDisabledTerrain(state: BattleState, cells: readonly Position[]): number {
  return cells.filter((position) => state.terrain.some((cell) => cell.position.x === position.x && cell.position.y === position.y && cell.active === false)).length;
}

function progressText(state: BattleState, runtime: BattleObjectiveRuntime): string {
  const config = runtime.config;
  const limit = runtime.roundLimit ? ` · 限制 ${runtime.roundLimit} 回合` : "";
  if (config.kind === "hold") return `占点进度 ${runtime.progress}/${config.requiredRounds ?? 1}${limit}`;
  if (config.kind === "protect") return `保护至第 ${config.surviveUntilRound} 回合 · 当前第 ${state.round} 回合${limit}`;
  if (config.kind === "evacuate") return `撤离 ${countPlayersInCells(state, config.targetCells ?? [])}/${config.requiredCount ?? 1}${limit}`;
  if (config.kind === "disrupt") return `解除关键地形 ${countDisabledTerrain(state, config.targetCells ?? [])}/${config.requiredCount ?? 1}${limit}`;
  if (config.kind === "tri-route") {
    const closed = countDisabledTerrain(state, config.targetCells ?? []);
    const labels = (config.routeLabels ?? []).map((label, index) => `${label}${state.terrain.some((cell) => cell.position.x === config.targetCells?.[index]?.x && cell.position.y === config.targetCells?.[index]?.y && cell.active === false) ? "✓" : "·"}`).join(" ");
    return `三路关闭 ${closed}/${config.requiredCount ?? 3}${limit}${labels ? ` · ${labels}` : ""}`;
  }
  if (config.kind === "white-knight") {
    const closed = countDisabledTerrain(state, config.targetCells ?? []);
    const boss = state.units.find((unit) => unit.id === config.targetUnitId);
    return `纪律旗标 ${closed}/${config.requiredCount ?? 2} · ${boss && boss.maxHealth <= 8 ? "白光核心已暴露" : "盾阵运转中"}${limit}`;
  }
  if (config.kind === "iron-bulwark") {
    const unlocked = countDisabledTerrain(state, config.targetCells ?? []);
    const boss = state.units.find((unit) => unit.id === config.targetUnitId);
    return `锁轴 ${unlocked}/${config.requiredCount ?? 2} · ${boss && boss.maxHealth <= 8 ? "动力核心已暴露" : "装甲过载未触发"}${limit}`;
  }
  if (config.kind === "night-judge") {
    const seals = countDisabledTerrain(state, config.targetCells ?? []);
    return `审查印记 ${seals}/${config.requiredCount ?? 2} · 坚持到第 ${config.requiredRounds ?? 4} 回合${limit}`;
  }
  return `主要目标：${config.title}${limit}`;
}

function won(runtime: BattleObjectiveRuntime, progressText: string): BattleObjectiveEvaluation {
  return { runtime, phase: "victory", progressText };
}

function failed(runtime: BattleObjectiveRuntime, progressText: string): BattleObjectiveEvaluation {
  return { runtime, phase: "defeat", progressText, consequence: runtime.config.failureConsequence };
}
