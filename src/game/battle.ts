export const BOARD_SIZE = 8;

export type Team = "player" | "enemy";
export type BattlePhase = "player" | "enemy" | "victory" | "defeat";
export type DamageKind = "health" | "faith";
export type TerrainKind = "holy-fire" | "ruin-cover" | "brush" | "mud" | "mechanism";
export type SkillId = "witness-mark" | "seraphina-restore" | "reina-overload" | "odric-guard" | "cole-rally" | "agnes-rite" | "witness-cross" | "seraphina-sanctify" | "reina-repair" | "odric-lock" | "cole-charge" | "agnes-veil" | "arthur-guardbreak" | "arthur-rally" | "hans-intercept" | "asnoka-scout";

export interface Position {
  x: number;
  y: number;
}

export interface TerrainCell {
  position: Position;
  kind: TerrainKind;
  blocksMovement: boolean;
  interactable: boolean;
  active?: boolean;
  label?: string;
  /** Optional static environment visual; the rule layer never depends on its network load. */
  assetId?: string;
}

export interface Unit {
  id: string;
  name: string;
  team: Team;
  /** Optional data-driven visual role. Rules never depend on the asset being loaded. */
  visualKey?: string;
  position: Position;
  health: number;
  maxHealth: number;
  faith: number;
  maxFaith: number;
  moveRange: number;
  attackRange: number;
  attackDamage: number;
  faithDamage: number;
  exposed: boolean;
  guarded: boolean;
  suppressed: boolean;
  scorched: boolean;
  skillCooldown: number;
  acted: boolean;
}

export interface AttackIntent {
  type: "attack";
  unitId: string;
  targetId: string;
  damageKind: DamageKind;
  amount: number;
}

export interface MoveIntent {
  type: "move";
  unitId: string;
  destination: Position;
}

export type EnemyIntent = AttackIntent | MoveIntent;

export interface BattleState {
  width: typeof BOARD_SIZE;
  height: typeof BOARD_SIZE;
  round: number;
  phase: BattlePhase;
  units: Unit[];
  enemyIntents: EnemyIntent[];
  terrain: TerrainCell[];
}

export interface UnitTemplate {
  id: string;
  name: string;
  team: Team;
  visualKey?: string;
  position: Position;
  health?: number;
  faith?: number;
  moveRange?: number;
  attackRange?: number;
  attackDamage?: number;
  faithDamage?: number;
}

export interface ActionResult {
  state: BattleState;
  ok: boolean;
  reason?: string;
}

export function passiveLabel(unit:Pick<Unit,"id">):string|undefined {
  const labels:Record<string,string>={
    u1:"证词链：攻击暴露目标时额外 +1 伤害",
    u2:"守灯：塞拉菲娜在场时，全队受到的信念伤害 -1",
    u3:"工程弱点：生命攻击压制目标时额外 +1 伤害",
    u4:"护卫本能：奥德里克的护持额外抵消 1 点生命伤害",
    u5:"突击队：生命攻击压制目标时额外 +1 伤害",
    u6:"余烬传导：信念攻击灼痕目标时额外 +1 伤害",
  };
  return labels[unit.id];
}

export function interactTerrain(state: BattleState, actorId: string, position: Position): ActionResult {
  const actor = state.units.find((unit) => unit.id === actorId);
  const error = validatePlayerAction(state, actor);
  if (error) return failed(state, error);
  const cell = terrainAt(state, position);
  if (!cell || !cell.interactable) return failed(state, "这里没有可互动的地形。");
  if (cell.active === false) return failed(state, "该地形已经关闭，不能再次开启。");
  if (distance(actor!.position, position) > 1) return failed(state, "需要站在相邻格才能互动。");
  const terrain = state.terrain.map((candidate) => candidate === cell
    ? { ...candidate, active: candidate.active === false }
    : candidate);
  const nearestEnemy = nearest(actor!, state.units.filter((unit) => unit.team === "enemy" && isActive(unit)));
  const units = state.units.map((unit) => {
    if (unit.id === actorId) return {
      ...unit,
      acted: true,
      guarded: unit.id === "u4" && cell.kind === "ruin-cover" ? true : unit.guarded,
      suppressed: unit.id === "u5" && (cell.kind === "brush" || cell.kind === "mud") ? false : unit.suppressed,
      health: unit.id === "u5" && (cell.kind === "brush" || cell.kind === "mud") ? Math.min(unit.maxHealth, unit.health + 1) : unit.health,
    };
    if (unit.id === nearestEnemy?.id) return {
      ...unit,
      exposed: actor!.id === "u1" ? true : unit.exposed,
      suppressed: actor!.id === "u3" && cell.kind === "mechanism" ? true : unit.suppressed,
      scorched: actor!.id === "u6" && cell.kind === "holy-fire" ? true : unit.scorched,
    };
    if (unit.team === "player" && actor!.id === "u2" && cell.kind === "holy-fire") return { ...unit, faith: Math.min(unit.maxFaith, unit.faith + 1) };
    return unit;
  });
  return succeeded(refresh({ ...state, terrain, units }));
}

export function terrainInteractionLabel(actor:Pick<Unit,"id">,cell:Pick<TerrainCell,"kind">):string {
  if(actor.id === "u1") return "取证完成：最近敌人获得暴露";
  if(actor.id === "u2" && cell.kind === "holy-fire") return "守灯祷言：全队信念 +1";
  if(actor.id === "u3" && cell.kind === "mechanism") return "机械弱点：最近敌人获得压制";
  if(actor.id === "u4" && cell.kind === "ruin-cover") return "封锁残墙：奥德里克获得护持";
  if(actor.id === "u5" && (cell.kind === "brush" || cell.kind === "mud")) return "护送整队：科尔恢复 1 生命并解除压制";
  if(actor.id === "u6" && cell.kind === "holy-fire") return "余烬仪式：最近敌人获得灼痕";
  return "地形已处理";
}

export function terrainSpecialtyLabel(actor:Pick<Unit,"id">):string|undefined {
  const labels:Record<string,string>={
    u1:"地形专长：取证 · 处理任意互动地形时，最近敌人获得暴露",
    u2:"地形专长：守灯 · 处理圣火时，全队信念 +1",
    u3:"地形专长：工程 · 处理机关时，最近敌人获得压制",
    u4:"地形专长：封锁 · 处理废墟时，奥德里克获得护持",
    u5:"地形专长：护送 · 处理灌木或泥地时，恢复生命并解除压制",
    u6:"地形专长：仪式 · 处理圣火时，最近敌人获得灼痕",
  };
  return labels[actor.id];
}

const DEFAULT_HEALTH = 10;
const DEFAULT_FAITH = 6;

export function createUnit(template: UnitTemplate): Unit {
  const health = template.health ?? DEFAULT_HEALTH;
  const faith = template.faith ?? DEFAULT_FAITH;
  return {
    ...template,
    position: { ...template.position },
    health,
    maxHealth: health,
    faith,
    maxFaith: faith,
    moveRange: template.moveRange ?? 3,
    attackRange: template.attackRange ?? 1,
    attackDamage: template.attackDamage ?? 3,
    faithDamage: template.faithDamage ?? 2,
    exposed: false,
    guarded: false,
    suppressed: false,
    scorched: false,
    skillCooldown: 0,
    acted: false,
  };
}

export function createBattle(units: UnitTemplate[], terrain: TerrainCell[] = []): BattleState {
  if (units.filter((unit) => unit.team === "player").length !== 3 ||
      units.filter((unit) => unit.team === "enemy").length !== 3) {
    throw new Error("Battle requires exactly three player units and three enemies.");
  }
  const created = units.map(createUnit);
  validateTerrain(terrain);
  validatePositions(created);
  if (created.some((unit) => terrain.some((cell) => cell.blocksMovement && cell.active !== false && samePosition(unit.position, cell.position)))) {
    throw new Error("A unit cannot start on a blocked terrain cell.");
  }
  const initial: BattleState = {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    round: 1,
    phase: "player",
    units: created,
    enemyIntents: [],
    terrain: terrain.map(cloneTerrain),
  };
  return { ...initial, enemyIntents: previewEnemyIntents(initial) };
}

export function isActive(unit: Unit): boolean {
  return unit.health > 0 && unit.faith > 0;
}

export function distance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function moveUnit(state: BattleState, unitId: string, destination: Position): ActionResult {
  const unit = state.units.find((candidate) => candidate.id === unitId);
  const error = validatePlayerAction(state, unit);
  if (error) return failed(state, error);
  if (!insideBoard(destination)) return failed(state, "Destination is outside the board.");
  if (state.units.some((other) => isActive(other) && samePosition(other.position, destination))) {
    return failed(state, "Destination is occupied.");
  }
  if (isBlockedTerrain(state, destination)) return failed(state, "这格被地形阻挡，无法移动。");
  if (distance(unit!.position, destination) > effectiveMoveRange(unit!)) {
    return failed(state, "Destination is outside movement range.");
  }
  if (!canReachPosition(state, unitId, destination)) return failed(state, "路径被地形或单位阻挡。");
  const terrain = terrainAt(state, destination);
  const units = state.units.map((candidate) => candidate.id === unitId
    ? {
      ...candidate,
      position: { ...destination },
      acted: true,
      // Brush grants immediate cover; mud costs momentum. Both are shown in the unit card.
      guarded: terrain?.kind === "brush" ? true : candidate.guarded,
      suppressed: terrain?.kind === "mud" ? true : candidate.suppressed,
    }
    : candidate);
  return succeeded(refresh({ ...state, units }));
}

/** Reverts one unresolved player move without bypassing battle invariants. */
export function undoMove(state: BattleState, unitId: string, origin: Position): ActionResult {
  if (state.phase !== "player") return failed(state, "It is not the player phase.");
  const unit = state.units.find((candidate) => candidate.id === unitId);
  if (!unit || unit.team !== "player" || !isActive(unit)) return failed(state, "Unit is unavailable.");
  if (!unit.acted) return failed(state, "Unit has not moved this round.");
  if (!insideBoard(origin)) return failed(state, "Destination is outside the board.");
  if (state.units.some((other) => other.id !== unitId && isActive(other) && samePosition(other.position, origin))) {
    return failed(state, "Destination is occupied.");
  }
  if (isBlockedTerrain(state, origin)) return failed(state, "原位置已被地形占用。");
  const units = state.units.map((candidate) => candidate.id === unitId
    ? { ...candidate, position: { ...origin }, acted: false }
    : candidate);
  return succeeded(refresh({ ...state, units }));
}

export function attackUnit(
  state: BattleState,
  attackerId: string,
  targetId: string,
  damageKind: DamageKind = "health",
): ActionResult {
  const attacker = state.units.find((unit) => unit.id === attackerId);
  const target = state.units.find((unit) => unit.id === targetId);
  const error = validatePlayerAction(state, attacker);
  if (error) return failed(state, error);
  if (!target || !isActive(target)) return failed(state, "Target is unavailable.");
  if (target.team === attacker!.team) return failed(state, "Cannot attack an ally.");
  if (distance(attacker!.position, target.position) > attacker!.attackRange) {
    return failed(state, "Target is outside attack range.");
  }
  const amount = (damageKind === "health" ? attacker!.attackDamage : attacker!.faithDamage) + (target.exposed ? 2 : 0) + passiveAttackBonus(attacker!, target, damageKind);
  const units = applyDamage(state.units, targetId, damageKind, amount).map((unit) =>
    unit.id === attackerId ? { ...unit, acted: true } : unit.id === targetId ? { ...unit, exposed: false } : unit,
  );
  return succeeded(refresh({ ...state, units }));
}

export function useSkill(state: BattleState, skill: SkillId, actorId: string, targetId: string): ActionResult {
  const actor = state.units.find((unit) => unit.id === actorId);
  const target = state.units.find((unit) => unit.id === targetId);
  const error = validatePlayerAction(state, actor);
  if (error) return failed(state, error);
  if (!target || !isActive(target)) return failed(state, "Target is unavailable.");
  if (actor!.skillCooldown > 0) return failed(state, "Skill is on cooldown.");
  const range = ["witness-mark", "reina-overload", "asnoka-scout"].includes(skill) ? 3 : 2;
  if (distance(actor!.position, target.position) > range) return failed(state, "Target is outside skill range.");
  if (skill === "seraphina-restore") {
    if (!(["u2", "p2"] as string[]).includes(actor!.id) || target.team !== "player") return failed(state, "This skill cannot target that unit.");
    const units = state.units.map((unit) => unit.id === targetId
      ? { ...unit, faith: Math.min(unit.maxFaith, unit.faith + 3) }
      : unit.id === actorId ? { ...unit, acted: true, skillCooldown: 2 } : unit);
    return succeeded(refresh({ ...state, units }));
  }
  if (skill === "seraphina-sanctify") {
    if (!(actor!.id === "u2" || actor!.id === "p2") || target.team !== "player") return failed(state, "This skill cannot target that unit.");
    const units = state.units.map((unit) => unit.id === targetId
      ? { ...unit, faith: Math.min(unit.maxFaith, unit.faith + 1), exposed: false, suppressed: false, scorched: false }
      : unit.id === actorId ? { ...unit, acted: true, skillCooldown: 2 } : unit);
    return succeeded(refresh({ ...state, units }));
  }
  if (skill === "reina-repair") {
    if (!(actor!.id === "u3" || actor!.id === "p3") || target.team !== "player") return failed(state, "This skill cannot target that unit.");
    const units = state.units.map((unit) => unit.id === targetId
      ? { ...unit, health: Math.min(unit.maxHealth, unit.health + 2) }
      : unit.id === actorId ? { ...unit, acted: true, skillCooldown: 2 } : unit);
    return succeeded(refresh({ ...state, units }));
  }
  if (skill === "odric-guard") {
    if (!(actor!.id === "u4" || actor!.id === "p4") || target.team !== "player") return failed(state, "This skill cannot target that unit.");
    const units = state.units.map((unit) => unit.id === targetId
      ? { ...unit, guarded: true }
      : unit.id === actorId ? { ...unit, acted: true, skillCooldown: 2 } : unit);
    return succeeded(refresh({ ...state, units }));
  }
  if (skill === "odric-lock") {
    if (!(actor!.id === "u4" || actor!.id === "p4") || target.team !== "enemy") return failed(state, "This skill cannot target that unit.");
    const units = applyDamage(state.units, targetId, "health", 1).map((unit) =>
      unit.id === actorId ? { ...unit, acted: true, skillCooldown: 2 } : unit,
    );
    return succeeded(refresh({ ...state, units }));
  }
  if (skill === "cole-rally") {
    if (!(actor!.id === "u5" || actor!.id === "p5") || target.team !== "player") return failed(state, "This skill cannot target that unit.");
    const units = state.units.map((unit) => unit.id === targetId
      ? { ...unit, health: Math.min(unit.maxHealth, unit.health + 1), faith: Math.min(unit.maxFaith, unit.faith + 2), suppressed: false }
      : unit.id === actorId ? { ...unit, acted: true, skillCooldown: 2 } : unit);
    return succeeded(refresh({ ...state, units }));
  }
  if (skill === "cole-charge") {
    if (!(actor!.id === "u5" || actor!.id === "p5") || target.team !== "enemy") return failed(state, "This skill cannot target that unit.");
    const units = applyDamage(state.units, targetId, "health", 2).map((unit) =>
      unit.id === actorId ? { ...unit, acted: true, skillCooldown: 2 } : unit.id === targetId ? { ...unit, suppressed: true } : unit,
    );
    return succeeded(refresh({ ...state, units }));
  }
  if (skill === "agnes-rite") {
    if (!(actor!.id === "u6" || actor!.id === "p6") || target.team !== "enemy") return failed(state, "This skill cannot target that unit.");
    const units = applyDamage(state.units, targetId, "faith", 3).map((unit) =>
      unit.id === actorId ? { ...unit, acted: true, skillCooldown: 2 } : unit.id === targetId ? { ...unit, scorched: true } : unit,
    );
    return succeeded(refresh({ ...state, units }));
  }
  if (skill === "witness-cross" || skill === "agnes-veil") {
    if ((skill === "witness-cross" && !(actor!.id === "u1" || actor!.id === "p1")) || (skill === "agnes-veil" && !(actor!.id === "u6" || actor!.id === "p6")) || target.team !== "enemy") return failed(state, "This skill cannot target that unit.");
    const units = applyDamage(state.units, targetId, "faith", skill === "witness-cross" ? 2 : 1).map((unit) =>
      unit.id === actorId ? { ...unit, acted: true, skillCooldown: 2 } : unit,
    );
    return succeeded(refresh({ ...state, units }));
  }
  if (skill === "arthur-rally") {
    if (!(actor!.id === "u-arthur" || actor!.id === "p-arthur") || target.team !== "player") return failed(state, "This skill cannot target that unit.");
    const units = state.units.map((unit) => unit.id === targetId
      ? { ...unit, faith: Math.min(unit.maxFaith, unit.faith + 1), guarded: true }
      : unit.id === actorId ? { ...unit, acted: true, skillCooldown: 2 } : unit);
    return succeeded(refresh({ ...state, units }));
  }
  if (target.team !== "enemy") return failed(state, "This skill cannot target an ally.");
  if (skill === "witness-mark") {
    if (!(actor!.id === "u1" || actor!.id === "p1")) return failed(state, "This unit cannot use that skill.");
    const units = state.units.map((unit) => unit.id === targetId
      ? { ...unit, exposed: true }
      : unit.id === actorId ? { ...unit, acted: true, skillCooldown: 2 } : unit);
    return succeeded(refresh({ ...state, units }));
  }
  if (skill === "arthur-guardbreak") {
    if (!(actor!.id === "u-arthur" || actor!.id === "p-arthur")) return failed(state, "This unit cannot use that skill.");
    const units = applyDamage(state.units, targetId, "health", 2).map((unit) =>
      unit.id === actorId ? { ...unit, acted: true, skillCooldown: 2 } : unit.id === targetId ? { ...unit, exposed: true, suppressed: true } : unit,
    );
    return succeeded(refresh({ ...state, units }));
  }
  if (skill === "hans-intercept") {
    if (!(actor!.id === "u-hans" || actor!.id === "p-hans") || target.team !== "enemy") return failed(state, "This skill cannot target that unit.");
    const units = applyDamage(state.units, targetId, "health", 1).map((unit) => unit.id === actorId ? { ...unit, acted: true, skillCooldown: 2, guarded: true } : unit);
    return succeeded(refresh({ ...state, units }));
  }
  if (skill === "asnoka-scout") {
    if (!(actor!.id === "u-asnoka" || actor!.id === "p-asnoka") || target.team !== "enemy") return failed(state, "This skill cannot target that unit.");
    const units = state.units.map((unit) => unit.id === targetId ? { ...unit, exposed: true } : unit.id === actorId ? { ...unit, acted: true, skillCooldown: 2 } : unit);
    return succeeded(refresh({ ...state, units }));
  }
  if (!(actor!.id === "u3" || actor!.id === "p3")) return failed(state, "This unit cannot use that skill.");
  const units = applyDamage(state.units, targetId, "health", 2).map((unit) =>
    unit.id === actorId ? { ...unit, acted: true, skillCooldown: 2 } : unit,
  );
  return succeeded(refresh({ ...state, units }));
}

export function endPlayerTurn(state: BattleState): BattleState {
  if (state.phase !== "player") return state;
  const pending: BattleState = { ...state, phase: "enemy", enemyIntents: previewEnemyIntents(state) };
  return executeEnemyTurn(pending);
}

export function previewEnemyIntents(state: BattleState): EnemyIntent[] {
  const simulated = state.units.map(cloneUnit);
  const intents: EnemyIntent[] = [];
  for (const enemy of simulated.filter((unit) => unit.team === "enemy" && isActive(unit))) {
    const target = nearest(enemy, simulated.filter((unit) => unit.team === "player" && isActive(unit)));
    if (!target) break;
    if (distance(enemy.position, target.position) <= enemy.attackRange) {
      intents.push(attackIntent(enemy, target));
      continue;
    }
    const destination = stepToward(enemy, target, simulated, state.terrain);
    intents.push({ type: "move", unitId: enemy.id, destination });
    enemy.position = { ...destination };
  }
  return intents;
}

export function executeEnemyTurn(state: BattleState): BattleState {
  if (state.phase !== "enemy") return state;
  let units = state.units.map(cloneUnit);
  for (const intent of state.enemyIntents) {
    const actor = units.find((unit) => unit.id === intent.unitId);
    if (!actor || !isActive(actor)) continue;
    if (intent.type === "move") {
      if (!units.some((unit) => unit.id !== actor.id && isActive(unit) && samePosition(unit.position, intent.destination))) {
        actor.position = { ...intent.destination };
      }
    } else {
      const target = units.find((unit) => unit.id === intent.targetId);
      if (target && isActive(target) && distance(actor.position, target.position) <= actor.attackRange) {
        const faithWard = intent.damageKind === "faith" && units.some((unit) => unit.id === "u2" && unit.team === "player" && isActive(unit)) ? 1 : 0;
        units = applyDamage(units, target.id, intent.damageKind, Math.max(0, intent.amount - faithWard));
      }
    }
  }
  units = units.map((unit) => {
    const faith = unit.scorched ? Math.max(0, unit.faith - 1) : unit.faith;
    return { ...unit, faith, acted: false, skillCooldown: Math.max(0, unit.skillCooldown - 1) };
  });
  const result = determineOutcome(units);
  const next: BattleState = {
    ...state,
    units,
    round: state.round + 1,
    phase: result ?? "player",
    enemyIntents: [],
  };
  return next.phase === "player" ? { ...next, enemyIntents: previewEnemyIntents(next) } : next;
}

export function determineOutcome(units: Unit[]): "victory" | "defeat" | null {
  if (!units.some((unit) => unit.team === "enemy" && isActive(unit))) return "victory";
  if (!units.some((unit) => unit.team === "player" && isActive(unit))) return "defeat";
  return null;
}

function refresh(state: BattleState): BattleState {
  const outcome = determineOutcome(state.units);
  if (outcome) return { ...state, phase: outcome, enemyIntents: [] };
  return { ...state, enemyIntents: previewEnemyIntents(state) };
}

function validatePlayerAction(state: BattleState, unit?: Unit): string | undefined {
  if (state.phase !== "player") return "It is not the player phase.";
  if (!unit || !isActive(unit)) return "Unit is unavailable.";
  if (unit.team !== "player") return "Only player units can be commanded.";
  if (unit.acted) return "Unit has already acted this round.";
}

function attackIntent(enemy: Unit, target: Unit): AttackIntent {
  const useFaith = target.faith <= enemy.faithDamage || target.faith < target.health;
  return {
    type: "attack",
    unitId: enemy.id,
    targetId: target.id,
    damageKind: useFaith ? "faith" : "health",
    amount: useFaith ? enemy.faithDamage : enemy.attackDamage,
  };
}

function stepToward(enemy: Unit, target: Unit, units: Unit[], terrain: TerrainCell[]): Position {
  let current = { ...enemy.position };
  for (let step = 0; step < effectiveMoveRange(enemy); step += 1) {
    const options = [
      { x: current.x + Math.sign(target.position.x - current.x), y: current.y },
      { x: current.x, y: current.y + Math.sign(target.position.y - current.y) },
    ].filter((position) => insideBoard(position) && !samePosition(position, current));
    const next = options
      .filter((position) => !isBlockedTerrain({ terrain } as BattleState, position))
      .filter((position) => !units.some((unit) => unit.id !== enemy.id && isActive(unit) && samePosition(unit.position, position)))
      .sort((a, b) => distance(a, target.position) - distance(b, target.position))[0];
    if (!next || distance(next, target.position) >= distance(current, target.position)) break;
    current = next;
  }
  return current;
}

function nearest(source: Unit, targets: Unit[]): Unit | undefined {
  return [...targets].sort((a, b) => distance(source.position, a.position) - distance(source.position, b.position) || a.id.localeCompare(b.id))[0];
}

function applyDamage(units: Unit[], id: string, kind: DamageKind, amount: number): Unit[] {
  return units.map((unit) => {
    if (unit.id !== id) return unit;
    return kind === "health"
      ? { ...unit, health: Math.max(0, unit.health - Math.max(0, amount - (unit.guarded ? unit.id === "u4" ? 3 : 2 : 0))), guarded: false }
      : { ...unit, faith: Math.max(0, unit.faith - amount) };
  });
}

function passiveAttackBonus(attacker:Unit,target:Unit,kind:DamageKind):number {
  if(attacker.id === "u1" && target.exposed)return 1;
  if((attacker.id === "u3" || attacker.id === "u5") && kind === "health" && target.suppressed)return 1;
  if(attacker.id === "u6" && kind === "faith" && target.scorched)return 1;
  return 0;
}

/** Suppression is a positional debuff: a unit loses one tile of movement, never below one. */
export function effectiveMoveRange(unit: Pick<Unit, "moveRange" | "suppressed">): number {
  return Math.max(1, unit.moveRange - (unit.suppressed ? 1 : 0));
}

function validatePositions(units: Unit[]): void {
  const occupied = new Set<string>();
  for (const unit of units) {
    if (!insideBoard(unit.position)) throw new Error(`Unit ${unit.id} is outside the board.`);
    const key = `${unit.position.x},${unit.position.y}`;
    if (occupied.has(key)) throw new Error(`Multiple units occupy ${key}.`);
    occupied.add(key);
  }
}

function validateTerrain(terrain: TerrainCell[]): void {
  const occupied = new Set<string>();
  for (const cell of terrain) {
    if (!insideBoard(cell.position)) throw new Error(`Terrain is outside the board at ${cell.position.x},${cell.position.y}.`);
    const key = `${cell.position.x},${cell.position.y}`;
    if (occupied.has(key)) throw new Error(`Multiple terrain cells occupy ${key}.`);
    occupied.add(key);
  }
}

export function isBlockedTerrain(state: Pick<BattleState, "terrain">, position: Position): boolean {
  return state.terrain.some((cell) => cell.blocksMovement && cell.active !== false && samePosition(cell.position, position));
}

export function terrainAt(state: Pick<BattleState, "terrain">, position: Position): TerrainCell | undefined {
  return state.terrain.find((cell) => samePosition(cell.position, position));
}

export function canReachPosition(state: BattleState, unitId: string, destination: Position): boolean {
  const unit = state.units.find((candidate) => candidate.id === unitId);
  if (!unit || !insideBoard(destination) || distance(unit.position, destination) > effectiveMoveRange(unit)) return false;
  const queue: Position[] = [{ ...unit.position }];
  const visited = new Set<string>([`${unit.position.x},${unit.position.y}`]);
  while (queue.length) {
    const current = queue.shift()!;
    if (samePosition(current, destination)) return true;
    for (const next of [
      { x: current.x + 1, y: current.y }, { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 }, { x: current.x, y: current.y - 1 },
    ]) {
      const key = `${next.x},${next.y}`;
      if (!insideBoard(next) || visited.has(key) || distance(unit.position, next) > effectiveMoveRange(unit) || isBlockedTerrain(state, next)) continue;
      if (state.units.some((other) => other.id !== unitId && isActive(other) && samePosition(other.position, next))) continue;
      visited.add(key); queue.push(next);
    }
  }
  return false;
}

function insideBoard(position: Position): boolean {
  return Number.isInteger(position.x) && Number.isInteger(position.y) &&
    position.x >= 0 && position.x < BOARD_SIZE && position.y >= 0 && position.y < BOARD_SIZE;
}

function samePosition(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

function cloneUnit(unit: Unit): Unit {
  return { ...unit, position: { ...unit.position } };
}

function cloneTerrain(cell: TerrainCell): TerrainCell {
  return { ...cell, position: { ...cell.position } };
}

function failed(state: BattleState, reason: string): ActionResult {
  return { state, ok: false, reason };
}

function succeeded(state: BattleState): ActionResult {
  return { state, ok: true };
}
