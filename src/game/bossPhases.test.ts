import { describe, expect, it } from "vitest";
import { attackUnit, createBattle, distance, endPlayerTurn, isActive, moveUnit, type BattleState, type Position } from "./battle";
import { advanceBossPhase, bossPhaseConfigs, createBossRuntime, currentBossPhase } from "./bossPhases";

const publicArtworkPaths=new Set(
  Object.keys(import.meta.glob("/public/assets/images/*.webp")).map((path)=>path.replace("/public","")),
);

describe("boss phases", () => {
  it("gives all three bosses an existing accessible artwork", () => {
    expect(Object.keys(bossPhaseConfigs)).toHaveLength(3);
    expect(Object.values(bossPhaseConfigs).map((config)=>config.artwork?.src).sort()).toEqual([
      "/assets/images/chapter-iron-road.webp",
      "/assets/images/chapter-veiled-dawn.webp",
      "/assets/images/portrait-odric.webp",
    ]);
    for(const config of Object.values(bossPhaseConfigs)){
      expect(config.artwork?.alt.length).toBeGreaterThan(0);
      expect(publicArtworkPaths.has(config.artwork!.src)).toBe(true);
    }
  });

  it("lets a standard three-person lineup reach the iron bulwark second phase through normal turns", () => {
    let state = createBattle([
      { id: "u1", name: "无旗者", team: "player", position: { x: 1, y: 6 }, health: 7, faith: 5 },
      { id: "u2", name: "塞拉菲娜", team: "player", position: { x: 2, y: 6 }, health: 5, faith: 8, faithDamage: 3 },
      { id: "u3", name: "蕾娜", team: "player", position: { x: 1, y: 7 }, health: 6, faith: 6, attackDamage: 4 },
      { id: "boss-iron-bulwark", name: "铁窗壁垒", team: "enemy", position: { x: 6, y: 1 }, health: 9, faith: 7, moveRange: 1, attackDamage: 2, faithDamage: 1 },
      { id: "e2", name: "壁垒护卫", team: "enemy", position: { x: 5, y: 1 }, health: 5, faith: 5, moveRange: 2, attackDamage: 2, faithDamage: 1 },
      { id: "e3", name: "工坊监军", team: "enemy", position: { x: 6, y: 2 }, health: 4, faith: 7, moveRange: 2, attackDamage: 2, faithDamage: 2 },
    ]);
    let runtime = createBossRuntime("iron-bulwark")!;
    let reachedAtRound: number | undefined;

    for (let round = 0; round < 5 && state.phase === "player" && reachedAtRound === undefined; round += 1) {
      for (const playerId of ["u1", "u2", "u3"]) {
        const player = state.units.find((unit) => unit.id === playerId);
        const boss = state.units.find((unit) => unit.id === "boss-iron-bulwark");
        if (!player || !boss || !isActive(player) || player.acted) continue;
        if (distance(player.position, boss.position) <= player.attackRange) {
          const kind = playerId === "u2" ? "faith" : "health";
          state = attackUnit(state, playerId, boss.id, kind).state;
          const transition = advanceBossPhase(state, runtime);
          state = transition.state;
          runtime = transition.runtime;
          if (transition.transitioned) reachedAtRound = state.round;
          continue;
        }
        const destination = bestOpenApproach(state, player.id, boss.position);
        if (destination) state = moveUnit(state, player.id, destination).state;
      }
      if (reachedAtRound === undefined && state.phase === "player") state = endPlayerTurn(state);
    }

    expect(reachedAtRound).toBeDefined();
    expect(reachedAtRound).toBeLessThanOrEqual(4);
    expect(state.units.filter((unit) => unit.team === "player" && isActive(unit)).length).toBeGreaterThanOrEqual(2);
    expect(currentBossPhase(runtime)?.phase).toBe(2);
  });

  it("moves the iron bulwark into a stronger visible second phase", () => {
    const state = createBattle([
      { id: "p1", name: "P1", team: "player", position: { x: 0, y: 5 } },
      { id: "p2", name: "P2", team: "player", position: { x: 1, y: 5 } },
      { id: "p3", name: "P3", team: "player", position: { x: 0, y: 6 } },
      { id: "boss-iron-bulwark", name: "Boss", team: "enemy", position: { x: 6, y: 1 }, health: 10, faith: 8 },
      { id: "e2", name: "E2", team: "enemy", position: { x: 5, y: 1 } },
      { id: "e3", name: "E3", team: "enemy", position: { x: 6, y: 2 } },
    ], [{ position: { x: 3, y: 5 }, kind: "ruin-cover", blocksMovement: true, interactable: false, active: true }]);
    const damaged = {
      ...state,
      units: state.units.map((unit) => unit.id === "boss-iron-bulwark" ? { ...unit, health: 5 } : unit),
    };
    const runtime = createBossRuntime("iron-bulwark")!;
    const result = advanceBossPhase(damaged, runtime);
    const boss = result.state.units.find((unit) => unit.id === "boss-iron-bulwark")!;
    expect(result.transitioned).toBe(true);
    expect(currentBossPhase(result.runtime)?.phase).toBe(2);
    expect(boss.attackDamage).toBe(4);
    expect(result.state.enemyIntents.some((intent) => intent.unitId === boss.id)).toBe(true);
    expect(result.state.terrain[0].active).toBe(false);
  });

  it("transitions the tier-three avatar from either damage axis and refreshes intent", () => {
    for (const damageAxis of ["health", "faith"] as const) {
      const state = createBattle([
        { id: "p1", name: "P1", team: "player", position: { x: 0, y: 5 } },
        { id: "p2", name: "P2", team: "player", position: { x: 1, y: 5 } },
        { id: "p3", name: "P3", team: "player", position: { x: 0, y: 6 } },
        { id: "boss-veiled-avatar", name: "Avatar", team: "enemy", position: { x: 6, y: 1 }, health: 12, faith: 12 },
        { id: "e2", name: "E2", team: "enemy", position: { x: 5, y: 1 } },
        { id: "e3", name: "E3", team: "enemy", position: { x: 6, y: 2 } },
      ]);
      const damaged = {
        ...state,
        units: state.units.map((unit) => unit.id === "boss-veiled-avatar"
          ? { ...unit, [damageAxis]: 6 }
          : unit),
      };
      const result = advanceBossPhase(damaged, createBossRuntime("veiled-avatar")!);
      const boss = result.state.units.find((unit) => unit.id === "boss-veiled-avatar")!;
      expect(result.transitioned).toBe(true);
      expect(currentBossPhase(result.runtime)?.phase).toBe(2);
      expect(boss.attackDamage).toBe(5);
      expect(boss.faithDamage).toBe(5);
      expect(result.state.enemyIntents.some((intent) => intent.unitId === boss.id)).toBe(true);
    }
  });

  it("advances both lake cores together and contaminates the third-route arena", () => {
    const state = createBattle([
      { id: "p1", name: "P1", team: "player", position: { x: 0, y: 6 } },
      { id: "p2", name: "P2", team: "player", position: { x: 1, y: 6 } },
      { id: "p3", name: "P3", team: "player", position: { x: 2, y: 6 } },
      { id: "boss-lake-god-a", name: "赤核", team: "enemy", position: { x: 6, y: 1 }, health: 7, faith: 12 },
      { id: "boss-lake-god-b", name: "白核", team: "enemy", position: { x: 6, y: 2 }, health: 12, faith: 14 },
      { id: "e3", name: "侍从", team: "enemy", position: { x: 5, y: 1 } },
    ], [
      { position: { x: 3, y: 5 }, kind: "holy-fire", blocksMovement: true, interactable: true, active: true },
      { position: { x: 4, y: 4 }, kind: "brush", blocksMovement: false, interactable: false, active: true },
      { position: { x: 6, y: 4 }, kind: "ruin-cover", blocksMovement: true, interactable: false, active: true },
    ]);
    const result = advanceBossPhase(state, createBossRuntime("lake-dual-god")!);
    expect(result.transitioned).toBe(true);
    expect(result.runtime.config.phaseUnitIds).toEqual(["boss-lake-god-a", "boss-lake-god-b"]);
    expect(result.state.units.find((unit) => unit.id === "boss-lake-god-a")?.attackDamage).toBe(6);
    expect(result.state.units.find((unit) => unit.id === "boss-lake-god-b")?.attackDamage).toBe(6);
    expect(result.state.terrain.find((cell) => cell.position.x === 4 && cell.position.y === 4)?.blocksMovement).toBe(true);
  });
});

function bestOpenApproach(state: BattleState, unitId: string, target: Position): Position | undefined {
  const unit = state.units.find((candidate) => candidate.id === unitId)!;
  const occupied = new Set(state.units.filter((candidate) => candidate.id !== unitId && isActive(candidate)).map((candidate) => `${candidate.position.x},${candidate.position.y}`));
  const candidates: Position[] = [];
  for (let x = 0; x < state.width; x += 1) for (let y = 0; y < state.height; y += 1) {
    const position = { x, y };
    if (distance(unit.position, position) <= unit.moveRange && !occupied.has(`${x},${y}`)) candidates.push(position);
  }
  return candidates.sort((a, b) => distance(a, target) - distance(b, target) || a.y - b.y || a.x - b.x)[0];
}
