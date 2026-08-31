import { describe, expect, it } from "vitest";
import { createBattle } from "./battle";
import {
  battleObjectiveConfigs,
  createBattleObjectiveRuntime,
  evaluateBattleObjective,
} from "./battleObjectives";
import type { CampaignCharacterId } from "./campaign";

const allRoles: CampaignCharacterId[] = ["the_unflagged", "seraphina", "reina", "odric", "cole", "agnes"];

function baseState() {
  return createBattle([
    { id: "u1", name: "U1", team: "player", position: { x: 0, y: 6 } },
    { id: "u2", name: "U2", team: "player", position: { x: 1, y: 6 } },
    { id: "u3", name: "U3", team: "player", position: { x: 2, y: 6 } },
    { id: "e1", name: "E1", team: "enemy", position: { x: 5, y: 1 } },
    { id: "e2", name: "E2", team: "enemy", position: { x: 6, y: 1 } },
    { id: "e3", name: "E3", team: "enemy", position: { x: 7, y: 1 } },
  ]);
}

describe("data-driven battle objectives", () => {
  it("maps all seven battles across four objective families, including non-kill disruption", () => {
    expect(Object.keys(battleObjectiveConfigs).sort()).toEqual([
      "border-machines",
      "grain-crossing",
      "holy-square-crisis",
      "iron-bulwark",
      "odric-judgment",
      "silent-march",
      "veiled-avatar",
    ]);
    expect(new Set(Object.values(battleObjectiveConfigs).map((config) => config.kind))).toEqual(
      new Set(["disrupt", "hold", "protect", "evacuate", "iron-bulwark"]),
    );
  });

  it("evaluates hold, protection, evacuation, disruption, and elimination without battle-specific branches", () => {
    const holdState = {
      ...baseState(),
      round: 2,
      units: baseState().units.map((unit, index) => index === 0 ? { ...unit, position: { x: 3, y: 4 } } : index === 1 ? { ...unit, position: { x: 4, y: 4 } } : unit),
    };
    expect(evaluateBattleObjective(holdState, createBattleObjectiveRuntime("holy-square-crisis", ["the_unflagged", "seraphina", "reina"]), true).phase).toBe("victory");

    const protectState = { ...baseState(), round: 4 };
    expect(evaluateBattleObjective(protectState, createBattleObjectiveRuntime("grain-crossing", ["the_unflagged", "reina", "cole"]), true).phase).toBe("victory");

    const evacuateState = {
      ...baseState(),
      units: baseState().units.map((unit, index) => index === 0 ? { ...unit, position: { x: 5, y: 0 } } : index === 1 ? { ...unit, position: { x: 7, y: 0 } } : unit),
    };
    expect(evaluateBattleObjective(evacuateState, createBattleObjectiveRuntime("silent-march", ["seraphina", "reina", "odric"])).phase).toBe("victory");

    const disruptState = {
      ...baseState(),
      terrain: [
        { position: { x: 3, y: 3 }, kind: "holy-fire" as const, blocksMovement: true, interactable: true, active: false },
        { position: { x: 4, y: 3 }, kind: "holy-fire" as const, blocksMovement: true, interactable: true, active: false },
      ],
    };
    const disrupted = evaluateBattleObjective(disruptState, createBattleObjectiveRuntime("odric-judgment", ["reina", "odric", "cole"]));
    expect(disrupted.phase).toBe("victory");
    expect(disrupted.progressText).toContain("2/2");

    const eliminateState = {
      ...baseState(),
      units: baseState().units.map((unit) => unit.id === "e1" ? { ...unit, health: 0 } : unit),
    };
    const runtime = createBattleObjectiveRuntime("odric-judgment", ["reina", "odric", "cole"]);
    runtime.config = { ...runtime.config, kind: "eliminate", targetUnitId: "e1" };
    expect(evaluateBattleObjective(eliminateState, runtime).phase).toBe("victory");
  });

  it("requires all three lake routes and rejects a boss-only victory", () => {
    const runtime = createBattleObjectiveRuntime("lake-dual-god", ["arthur", "hans", "asnoka"]);
    const terrain = [
      { position: { x: 2, y: 2 }, kind: "mechanism" as const, blocksMovement: true, interactable: true, active: false },
      { position: { x: 5, y: 2 }, kind: "mechanism" as const, blocksMovement: true, interactable: true, active: false },
      { position: { x: 3, y: 5 }, kind: "holy-fire" as const, blocksMovement: true, interactable: true, active: false },
    ];
    const allClosed = evaluateBattleObjective({ ...baseState(), terrain }, runtime);
    expect(allClosed.phase).toBe("victory");
    expect(allClosed.progressText).toContain("三路关闭 3/3");

    const twoClosed = { ...baseState(), phase: "victory" as const, terrain: terrain.map((cell, index) => index === 2 ? { ...cell, active: true } : cell) };
    const incomplete = evaluateBattleObjective(twoClosed, runtime);
    expect(incomplete.phase).toBe("defeat");
    expect(incomplete.consequence).toContain("三路");
  });

  it("forces the iron-and-fire boss to break both discipline flags before victory", () => {
    const runtime = createBattleObjectiveRuntime("white-knight-charge", ["arthur", "hans", "asnoka"]);
    const terrain = [
      { position: { x: 3, y: 3 }, kind: "holy-fire" as const, blocksMovement: true, interactable: true, active: false },
      { position: { x: 4, y: 3 }, kind: "holy-fire" as const, blocksMovement: true, interactable: true, active: false },
    ];
    const bossOnly = { ...baseState(), phase: "victory" as const, terrain, units: [
      ...baseState().units.filter((unit) => unit.team === "player"),
      { id: "boss-white-knight", name: "白光骑士长", team: "enemy" as const, position: { x: 6, y: 1 }, health: 0, maxHealth: 11, faith: 0, maxFaith: 8, moveRange: 2, attackRange: 1, attackDamage: 4, faithDamage: 2, exposed: false, guarded: false, suppressed: false, scorched: false, skillCooldown: 0, acted: false },
    ] };
    expect(evaluateBattleObjective(bossOnly, runtime).phase).toBe("defeat");

    const exposed = { ...bossOnly, units: bossOnly.units.map((unit) => unit.id === "boss-white-knight" ? { ...unit, maxHealth: 8 } : unit) };
    expect(evaluateBattleObjective(exposed, runtime).phase).toBe("victory");
  });

  it("requires the iron bulwark to expose its core after both lock axes are disabled", () => {
    const runtime = createBattleObjectiveRuntime("iron-bulwark", ["the_unflagged", "seraphina", "reina"]);
    const terrain = [
      { position: { x: 3, y: 3 }, kind: "mechanism" as const, blocksMovement: true, interactable: true, active: false },
      { position: { x: 4, y: 3 }, kind: "mechanism" as const, blocksMovement: true, interactable: true, active: false },
    ];
    const boss = { id: "boss-iron-bulwark", name: "铁窗壁垒", team: "enemy" as const, position: { x: 6, y: 1 }, health: 0, maxHealth: 10, faith: 0, maxFaith: 8, moveRange: 1, attackRange: 1, attackDamage: 2, faithDamage: 1, exposed: false, guarded: false, suppressed: false, scorched: false, skillCooldown: 0, acted: false };
    const killedTooEarly = evaluateBattleObjective({ ...baseState(), phase: "victory" as const, terrain, units: [...baseState().units.filter((unit) => unit.team === "player"), boss] }, runtime);
    expect(killedTooEarly.phase).toBe("defeat");
    expect(killedTooEarly.consequence).toContain("动力核心");
    const exposed = evaluateBattleObjective({ ...baseState(), phase: "victory" as const, terrain, units: [...baseState().units.filter((unit) => unit.team === "player"), { ...boss, maxHealth: 8 }] }, runtime);
    expect(exposed.phase).toBe("victory");
  });

  it("makes the night judge a two-part audit: break seals, then survive four rounds", () => {
    const runtime = createBattleObjectiveRuntime("night-judge", ["arthur", "hans", "asnoka"]);
    const terrain = [
      { position: { x: 3, y: 3 }, kind: "mechanism" as const, blocksMovement: true, interactable: true, active: false },
      { position: { x: 4, y: 3 }, kind: "mechanism" as const, blocksMovement: true, interactable: true, active: false },
    ];
    const early = evaluateBattleObjective({ ...baseState(), phase: "victory" as const, round: 3, terrain }, runtime);
    expect(early.phase).toBe("defeat");
    expect(early.consequence).toContain("四回合");
    const complete = evaluateBattleObjective({ ...baseState(), phase: "victory" as const, round: 4, terrain }, runtime);
    expect(complete.phase).toBe("victory");
  });

  it("applies timed failure consequences", () => {
    const state = { ...baseState(), round: 8 };
    const result = evaluateBattleObjective(state, createBattleObjectiveRuntime("silent-march", ["seraphina", "reina", "odric"]), true);
    expect(result.phase).toBe("defeat");
    expect(result.consequence).toContain("档案");
  });

  it("gives every profession mission value without one role dominating all seven battles", () => {
    const counts = Object.fromEntries(allRoles.map((role) => [
      role,
      Object.values(battleObjectiveConfigs).filter((config) => Boolean(config.roleModifiers[role])).length,
    ])) as Record<CampaignCharacterId, number>;
    for (const role of allRoles) {
      expect(counts[role]).toBeGreaterThan(0);
      expect(counts[role]).toBeLessThan(7);
    }
    expect(new Set(Object.values(counts)).size).toBeGreaterThan(1);
  });
});
