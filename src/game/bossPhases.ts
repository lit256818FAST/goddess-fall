import { previewEnemyIntents, type BattleState, type Position, type TerrainCell } from "./battle";

export interface BossPhase {
  phase: number;
  title: string;
  intentSummary: string;
  triggerBelowHealth?: number;
  triggerBelowFaith?: number;
  health: number;
  faith: number;
  moveRange: number;
  attackDamage: number;
  faithDamage: number;
}

export interface BossPhaseConfig {
  battleId: string;
  bossUnitId: string;
  /** Additional units that share this phase clock (used by multi-core bosses). */
  phaseUnitIds?: readonly string[];
  /** Visual manifest key; the renderer falls back to its procedural unit model. */
  visualKey?: string;
  artwork?: {
    src: string;
    alt: string;
  };
  phases: readonly [BossPhase, BossPhase, ...BossPhase[]];
}

export interface BossPhaseRuntime {
  config: BossPhaseConfig;
  phaseIndex: number;
}

interface TerrainPhaseChange {
  position: Position;
  kind?: TerrainCell["kind"];
  label?: string;
  active?: boolean;
  blocksMovement?: boolean;
}

const terrainPhaseChanges: Readonly<Record<string, Readonly<Record<number, readonly TerrainPhaseChange[]>>>> = {
  "odric-judgment": { 1: [{ position: { x: 2, y: 4 }, active: false }] },
  "iron-bulwark": { 1: [{ position: { x: 3, y: 5 }, active: false }] },
  "veiled-avatar": { 1: [{ position: { x: 5, y: 4 }, active: false }] },
  "white-knight-charge": { 1: [
    { position: { x: 2, y: 4 }, active: false, label: "盾阵缺口·已崩解" },
    { position: { x: 3, y: 5 }, kind: "mud", blocksMovement: true, label: "白光冲锋裂痕" },
  ] },
  "night-judge": { 1: [{ position: { x: 4, y: 3 }, active: false }] },
  "lake-dual-god": { 1: [
    { position: { x: 3, y: 5 }, active: false, label: "中庭主路·已熄灭" },
    { position: { x: 4, y: 4 }, kind: "mud", blocksMovement: true, label: "神力污染·中路" },
    { position: { x: 6, y: 4 }, kind: "mud", blocksMovement: true, label: "神力污染·右路" },
  ] },
};

export const odricJudgmentBoss: BossPhaseConfig = {
  battleId: "odric-judgment",
  bossUnitId: "boss-odric",
  artwork: {
    src: "/assets/images/portrait-odric.webp",
    alt: "奥德里克举盾守卫城门的角色立绘",
  },
  phases: [
    {
      phase: 1,
      title: "第一阶段 · 城门盾阵",
      intentSummary: "奥德里克守住狭道，骑士从两侧保护他的信念。",
      triggerBelowHealth: 4,
      triggerBelowFaith: 5,
      health: 8,
      faith: 9,
      moveRange: 2,
      attackDamage: 3,
      faithDamage: 2,
    },
    {
      phase: 2,
      title: "第二阶段 · 无神的守门人",
      intentSummary: "盾阵散开：奥德里克亲自追击证据携带者，但信念核心已经暴露。",
      health: 6,
      faith: 6,
      moveRange: 3,
      attackDamage: 4,
      faithDamage: 3,
    },
  ],
};

export const ironBulwarkBoss: BossPhaseConfig = {
  battleId: "iron-bulwark",
  bossUnitId: "boss-iron-bulwark",
  artwork: {
    src: "/assets/images/chapter-iron-road.webp",
    alt: "铁窗壁垒封锁铁砧道路的章节场景",
  },
  phases: [
    {
      phase: 1,
      title: "第一阶段 · 指挥装甲",
      intentSummary: "壁垒锁定最近目标，护卫压缩侧翼通路。",
      triggerBelowHealth: 7,
      triggerBelowFaith: 6,
      health: 10,
      faith: 8,
      moveRange: 1,
      attackDamage: 2,
      faithDamage: 1,
    },
    {
      phase: 2,
      title: "第二阶段 · 动力核心暴露",
      intentSummary: "限速器解除：壁垒移动与生命攻击增强，动力核心可以被信念击溃。",
      health: 8,
      faith: 6,
      moveRange: 3,
      attackDamage: 4,
      faithDamage: 3,
    },
  ],
};

export const veiledAvatarBoss: BossPhaseConfig = {
  battleId: "veiled-avatar",
  bossUnitId: "boss-veiled-avatar",
  artwork: {
    src: "/assets/images/chapter-veiled-dawn.webp",
    alt: "守幕圣像笼罩雾门的章节场景",
  },
  phases: [
    {
      phase: 1,
      title: "第一阶段 · 裁决外壳",
      intentSummary: "圣像标记最近的见证人，以生命攻击维持封锁。",
      triggerBelowHealth: 6,
      triggerBelowFaith: 6,
      health: 12,
      faith: 12,
      moveRange: 2,
      attackDamage: 4,
      faithDamage: 3,
    },
    {
      phase: 2,
      title: "第二阶段 · 无名光室",
      intentSummary: "外壳开启：移动与两类攻击增强，但生命和信念核心同时暴露。",
      health: 9,
      faith: 9,
      moveRange: 3,
      attackDamage: 5,
      faithDamage: 5,
    },
  ],
};

export const whiteKnightChargeBoss: BossPhaseConfig = {
  battleId: "white-knight-charge", bossUnitId: "boss-white-knight", visualKey: "boss-white-knight",
  artwork: { src: "/assets/images/boss-white-knight-bg.webp", alt: "白光骑士长在圣辉城门前的盾阵" },
  phases: [
    { phase: 1, title: "第一阶段 · 纪律盾阵", intentSummary: "骑士长锁定最靠前的单位，盾卫会为他挡住第一轮攻击。", triggerBelowHealth: 6, triggerBelowFaith: 5, health: 11, faith: 8, moveRange: 2, attackDamage: 4, faithDamage: 2 },
    { phase: 2, title: "第二阶段 · 白光冲锋", intentSummary: "盾阵解散，骑士长沿直线冲锋；关闭圣火旗标可阻止连续冲锋。", health: 8, faith: 5, moveRange: 4, attackDamage: 6, faithDamage: 3 },
  ],
};

export const nightJudgeBoss: BossPhaseConfig = {
  battleId: "night-judge", bossUnitId: "boss-night-judge", visualKey: "boss-night-judge",
  artwork: { src: "/assets/images/boss-night-judge-bg.webp", alt: "永夜殿审判官在污染审判厅中展开审查" },
  phases: [
    { phase: 1, title: "第一阶段 · 内心审查", intentSummary: "审判官标记意志最低的单位，并把政治压力转成信念伤害。", triggerBelowHealth: 7, triggerBelowFaith: 7, health: 12, faith: 13, moveRange: 2, attackDamage: 3, faithDamage: 5 },
    { phase: 2, title: "第二阶段 · 黑廷裁决", intentSummary: "污染地块扩散；审判官可同时威胁生命与信念，但本体更易被意志高的单位打断。", health: 9, faith: 10, moveRange: 3, attackDamage: 5, faithDamage: 6 },
  ],
};

export const lakeDualGodBoss: BossPhaseConfig = {
  battleId: "lake-dual-god", bossUnitId: "boss-lake-god-a", phaseUnitIds: ["boss-lake-god-a", "boss-lake-god-b"], visualKey: "boss-lake-god-a",
  artwork: { src: "/assets/images/boss-lake-dual-god-bg.webp", alt: "湖都三路战场、信仰发散器与双重神力核心" },
  phases: [
    { phase: 1, title: "第一阶段 · 双核共鸣", intentSummary: "赤核与白核互相强化；关闭发散器比直接攻击更重要。", triggerBelowHealth: 8, triggerBelowFaith: 8, health: 14, faith: 12, moveRange: 2, attackDamage: 4, faithDamage: 4 },
    { phase: 2, title: "第二阶段 · 神力互噬", intentSummary: "两个核心开始互相伤害；三路目标全部关闭后，战斗会以秩序结算。", health: 10, faith: 9, moveRange: 3, attackDamage: 6, faithDamage: 6 },
  ],
};

export const bossPhaseConfigs: Readonly<Record<string, BossPhaseConfig>> = {
  [odricJudgmentBoss.battleId]: odricJudgmentBoss,
  [ironBulwarkBoss.battleId]: ironBulwarkBoss,
  [veiledAvatarBoss.battleId]: veiledAvatarBoss,
};

const mainlineBossPhaseConfigs: Readonly<Record<string, BossPhaseConfig>> = {
  [whiteKnightChargeBoss.battleId]: whiteKnightChargeBoss,
  [nightJudgeBoss.battleId]: nightJudgeBoss,
  [lakeDualGodBoss.battleId]: lakeDualGodBoss,
};

export function createBossRuntime(battleId: string): BossPhaseRuntime | undefined {
  const config = bossPhaseConfigs[battleId] ?? mainlineBossPhaseConfigs[battleId];
  return config ? { config, phaseIndex: 0 } : undefined;
}

export function currentBossPhase(runtime?: BossPhaseRuntime): BossPhase | undefined {
  return runtime?.config.phases[runtime.phaseIndex];
}

export function advanceBossPhase(
  state: BattleState,
  runtime: BossPhaseRuntime,
): { state: BattleState; runtime: BossPhaseRuntime; transitioned: boolean } {
  const phase = currentBossPhase(runtime)!;
  const phaseUnitIds = runtime.config.phaseUnitIds ?? [runtime.config.bossUnitId];
  const bosses = state.units.filter((unit) => phaseUnitIds.includes(unit.id));
  const nextPhase = runtime.config.phases[runtime.phaseIndex + 1];
  if (!bosses.length || !nextPhase) return { state, runtime, transitioned: false };
  const healthThreshold = phase.triggerBelowHealth;
  const faithThreshold = phase.triggerBelowFaith;
  const healthTriggered = healthThreshold !== undefined && bosses.some((unit) => unit.health <= healthThreshold);
  const faithTriggered = faithThreshold !== undefined && bosses.some((unit) => unit.faith <= faithThreshold);
  if (!healthTriggered && !faithTriggered) return { state, runtime, transitioned: false };

  const units = state.units.map((unit) => phaseUnitIds.includes(unit.id) ? {
    ...unit,
    health: nextPhase.health,
    maxHealth: nextPhase.health,
    faith: nextPhase.faith,
    maxFaith: nextPhase.faith,
    moveRange: nextPhase.moveRange,
    attackDamage: nextPhase.attackDamage,
    faithDamage: nextPhase.faithDamage,
    acted: false,
  } : unit);
  const terrain = applyTerrainPhaseChanges(state.terrain, runtime.config.battleId, runtime.phaseIndex + 1);
  const nextState: BattleState = { ...state, units, terrain, phase: "player", enemyIntents: [] };
  return {
    state: { ...nextState, enemyIntents: previewEnemyIntents(nextState) },
    runtime: { ...runtime, phaseIndex: runtime.phaseIndex + 1 },
    transitioned: true,
  };
}

function applyTerrainPhaseChanges(
  terrain: readonly TerrainCell[],
  battleId: string,
  phaseIndex: number,
): TerrainCell[] {
  const changes = terrainPhaseChanges[battleId]?.[phaseIndex] ?? [];
  return terrain.map((cell) => {
    const change = changes.find((candidate) => candidate.position.x === cell.position.x && candidate.position.y === cell.position.y);
    return change ? { ...cell, ...change, position: { ...cell.position } } : { ...cell, position: { ...cell.position } };
  });
}
