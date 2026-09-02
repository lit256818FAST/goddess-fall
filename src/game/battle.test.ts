import { describe, expect, it } from "vitest";
import {
  attackUnit,
  createBattle,
  determineOutcome,
  endPlayerTurn,
  interactTerrain,
  isBlockedTerrain,
  effectiveMoveRange,
  terrainInteractionLabel,
  terrainSpecialtyLabel,
  moveUnit,
  passiveLabel,
  useSkill,
  undoMove,
  type UnitTemplate,
} from "./battle";

function roster(overrides: Partial<Record<string, Partial<UnitTemplate>>> = {}): UnitTemplate[] {
  const base: UnitTemplate[] = [
    { id: "p1", name: "Envoy", team: "player", position: { x: 0, y: 0 } },
    { id: "p2", name: "Knight", team: "player", position: { x: 0, y: 2 } },
    { id: "p3", name: "Saint", team: "player", position: { x: 0, y: 4 } },
    { id: "e1", name: "Guard", team: "enemy", position: { x: 7, y: 0 } },
    { id: "e2", name: "Zealot", team: "enemy", position: { x: 7, y: 2 } },
    { id: "e3", name: "Scout", team: "enemy", position: { x: 7, y: 4 } },
  ];
  return base.map((unit) => ({ ...unit, ...overrides[unit.id], position: overrides[unit.id]?.position ?? unit.position }));
}

describe("battle rules", () => {
  it("creates an 8x8 three-versus-three battle with visible enemy intents", () => {
    const state = createBattle(roster());
    expect([state.width, state.height]).toEqual([8, 8]);
    expect(state.units).toHaveLength(6);
    expect(state.enemyIntents).toHaveLength(3);
  });

  it("moves once within range and rejects occupied or repeated movement", () => {
    const state = createBattle(roster());
    const moved = moveUnit(state, "p1", { x: 2, y: 0 });
    expect(moved.ok).toBe(true);
    expect(moved.state.units.find((unit) => unit.id === "p1")?.position).toEqual({ x: 2, y: 0 });
    expect(moveUnit(moved.state, "p1", { x: 3, y: 0 }).ok).toBe(false);
    expect(moveUnit(state, "p1", { x: 0, y: 2 }).ok).toBe(false);
  });

  it("supports health damage and faith defeat", () => {
    let state = createBattle(roster({ e1: { position: { x: 1, y: 0 }, health: 2 } }));
    const killed = attackUnit(state, "p1", "e1", "health");
    expect(killed.ok).toBe(true);
    expect(killed.state.units.find((unit) => unit.id === "e1")?.health).toBe(0);

    state = createBattle(roster({ e1: { position: { x: 1, y: 0 }, faith: 2 } }));
    const broken = attackUnit(state, "p1", "e1", "faith");
    expect(broken.state.units.find((unit) => unit.id === "e1")?.faith).toBe(0);
  });

  it("allows a ranged profession to attack without moving into melee", () => {
    const state = createBattle(roster({
      p1: { attackRange: 2, attackDamage: 2 },
      e1: { position: { x: 2, y: 0 }, health: 5 },
    }));
    const result = attackUnit(state, "p1", "e1", "health");
    expect(result.ok).toBe(true);
    expect(result.state.units.find((unit) => unit.id === "p1")?.position).toEqual({ x: 0, y: 0 });
    expect(result.state.units.find((unit) => unit.id === "e1")?.health).toBe(3);
  });

  it("treats environment cells as real blockers and interactables", () => {
    const state = createBattle(roster(), [
      { position: { x: 1, y: 0 }, kind: "ruin-cover", blocksMovement: true, interactable: false },
      { position: { x: 0, y: 1 }, kind: "holy-fire", blocksMovement: true, interactable: true, active: true },
    ]);
    expect(isBlockedTerrain(state, { x: 1, y: 0 })).toBe(true);
    expect(moveUnit(state, "p1", { x: 1, y: 0 }).ok).toBe(false);
    const interacted = interactTerrain(state, "p2", { x: 0, y: 1 });
    expect(interacted.ok).toBe(true);
    expect(interacted.state.terrain.find((cell) => cell.position.x === 0 && cell.position.y === 1)?.active).toBe(false);
    expect(isBlockedTerrain(interacted.state, { x: 0, y: 1 })).toBe(false);
    expect(interactTerrain(interacted.state, "p2", { x: 0, y: 1 }).ok).toBe(false);
  });

  it("turns brush and mud into readable tactical effects", () => {
    let state = createBattle(roster(), [
      { position: { x: 1, y: 0 }, kind: "brush", blocksMovement: false, interactable: false },
      { position: { x: 1, y: 2 }, kind: "mud", blocksMovement: false, interactable: false },
    ]);
    let result = moveUnit(state, "p1", { x: 1, y: 0 });
    expect(result.ok).toBe(true);
    expect(result.state.units.find((unit) => unit.id === "p1")?.guarded).toBe(true);
    state = createBattle(roster(), [{ position: { x: 1, y: 2 }, kind: "mud", blocksMovement: false, interactable: false }]);
    result = moveUnit(state, "p2", { x: 1, y: 2 });
    expect(result.ok).toBe(true);
    const unit = result.state.units.find((candidate) => candidate.id === "p2")!;
    expect(unit.suppressed).toBe(true);
    expect(effectiveMoveRange(unit)).toBe(unit.moveRange - 1);
  });

  it("gives professions distinct terrain interaction bonuses without restricting shared objectives", () => {
    const base = createBattle(roster({ p1: { id: "u1" }, p2: { id: "u2" }, p3: { id: "u3" }, e1: { position: { x: 1, y: 0 } } }), [
      { position: { x: 0, y: 1 }, kind: "holy-fire", blocksMovement: true, interactable: true },
    ]);
    const witness = interactTerrain(base, "u1", { x: 0, y: 1 });
    expect(witness.ok).toBe(true);
    expect(witness.state.units.find((unit) => unit.id === "e1")?.exposed).toBe(true);
    expect(terrainInteractionLabel({ id: "u1" }, { kind: "holy-fire" })).toContain("暴露");
    expect(terrainSpecialtyLabel({id:"u3"})).toContain("机关");

    const seraphina = interactTerrain(base, "u2", { x: 0, y: 1 });
    expect(seraphina.ok).toBe(true);
    expect(seraphina.state.units.filter((unit) => unit.team === "player").every((unit) => unit.faith === unit.maxFaith)).toBe(true);

    const engineerState = createBattle(roster({ p3: { id: "u3", position: { x: 2, y: 2 } }, e1: { position: { x: 3, y: 2 } } }), [{ position: { x: 2, y: 3 }, kind: "mechanism", blocksMovement: true, interactable: true }]);
    const engineer = interactTerrain(engineerState, "u3", { x: 2, y: 3 });
    expect(engineer.state.units.find((unit) => unit.id === "e1")?.suppressed).toBe(true);
  });

  it("applies all six profession passives through combat or enemy turns", () => {
    let state=createBattle(roster({p1:{id:"u1"},e1:{position:{x:1,y:0},health:8}}));
    state={...state,units:state.units.map(unit=>unit.id==="e1"?{...unit,exposed:true}:unit)};
    const witness=attackUnit(state,"u1","e1","health");
    expect(witness.state.units.find(unit=>unit.id==="e1")?.health).toBe(2);
    expect(passiveLabel({id:"u6"})).toContain("灼痕");

    state=createBattle(roster({p1:{id:"u3"},e1:{position:{x:1,y:0},health:7}}));
    state={...state,units:state.units.map(unit=>unit.id==="e1"?{...unit,suppressed:true}:unit)};
    const engineer=attackUnit(state,"u3","e1","health");
    expect(engineer.state.units.find(unit=>unit.id==="e1")?.health).toBe(3);

    state=createBattle(roster({p1:{id:"u6"},e1:{position:{x:1,y:0},faith:7}}));
    state={...state,units:state.units.map(unit=>unit.id==="e1"?{...unit,scorched:true}:unit)};
    const ritual=attackUnit(state,"u6","e1","faith");
    expect(ritual.state.units.find(unit=>unit.id==="e1")?.faith).toBe(4);

    state=createBattle(roster({p1:{id:"u5"},e1:{position:{x:1,y:0},health:7}}));
    state={...state,units:state.units.map(unit=>unit.id==="e1"?{...unit,suppressed:true}:unit)};
    const vanguard=attackUnit(state,"u5","e1","health");
    expect(vanguard.state.units.find(unit=>unit.id==="e1")?.health).toBe(3);

    state=createBattle(roster({p1:{id:"u4",health:6,faith:10},e1:{position:{x:1,y:0},attackDamage:4,faithDamage:1}}));
    state={...state,units:state.units.map(unit=>unit.id==="u4"?{...unit,guarded:true}:unit)};
    const guardTurn=endPlayerTurn(state);
    expect(guardTurn.units.find(unit=>unit.id==="u4")?.health).toBe(5);

    state=createBattle(roster({p1:{id:"u2",faith:6},e1:{position:{x:1,y:0},faithDamage:3}}));
    const wardTurn=endPlayerTurn(state);
    expect(wardTurn.units.find(unit=>unit.id==="u2")?.faith).toBe(4);
  });

  it("gives the first three roles distinct skills with cooldowns", () => {
    let state = createBattle(roster({
      p1: { id: "p1", position: { x: 2, y: 0 } },
      p2: { id: "p2", position: { x: 1, y: 2 }, faith: 2 },
      p3: { id: "p3", position: { x: 2, y: 4 } },
      e1: { position: { x: 3, y: 0 } },
    }));
    let result = useSkill(state, "witness-mark", "p1", "e1");
    expect(result.ok).toBe(true);
    state = result.state;
    expect(state.units.find((unit) => unit.id === "e1")?.exposed).toBe(true);
    expect(state.units.find((unit) => unit.id === "p1")?.skillCooldown).toBe(2);
    expect(useSkill(state, "witness-mark", "p1", "e1").ok).toBe(false);

    state = createBattle(roster({ p2: { position: { x: 1, y: 2 } }, p3: { position: { x: 2, y: 4 } } }));
    state = { ...state, units: state.units.map((unit) => unit.id === "p2" ? { ...unit, faith: 2 } : unit) };
    result = useSkill(state, "seraphina-restore", "p2", "p2");
    expect(result.ok).toBe(true);
    expect(result.state.units.find((unit) => unit.id === "p2")?.faith).toBe(5);

    state = createBattle(roster({ p3: { position: { x: 2, y: 4 } }, e3: { position: { x: 4, y: 4 }, health: 5 } }));
    result = useSkill(state, "reina-overload", "p3", "e3");
    expect(result.ok).toBe(true);
    expect(result.state.units.find((unit) => unit.id === "e3")?.health).toBe(3);

    state = createBattle(roster({ p1: { position: { x: 1, y: 0 } }, p2: { position: { x: 1, y: 2 }, health: 4 }, p3: { position: { x: 1, y: 4 } }, e1: { position: { x: 3, y: 0 } } }));
    result = useSkill(state, "odric-guard", "p1", "p2");
    expect(result.ok).toBe(false);
    // The production ids u4/u5/u6 are tested through the shared behavior below.
    state = createBattle(roster({ p1: { id: "u4", position: { x: 1, y: 0 } }, p2: { id: "u5", position: { x: 1, y: 2 }, health: 4 }, p3: { id: "u6", position: { x: 1, y: 4 } }, e1: { position: { x: 1, y: 3 }, health: 5 } }));
    result = useSkill(state, "odric-guard", "u4", "u5");
    expect(result.ok).toBe(true);
    expect(result.state.units.find((unit) => unit.id === "u5")?.guarded).toBe(true);
    result = useSkill(state, "agnes-rite", "u6", "e1");
    expect(result.ok).toBe(true);
    expect(result.state.units.find((unit) => unit.id === "e1")?.faith).toBe(3);
    expect(result.state.units.find((unit) => unit.id === "e1")?.scorched).toBe(true);
    state = createBattle(roster({ p1: { id: "u5", position: { x: 1, y: 0 } }, e1: { position: { x: 2, y: 0 } } }));
    result = useSkill(state, "cole-charge", "u5", "e1");
    expect(result.ok).toBe(true);
    expect(result.state.units.find((unit) => unit.id === "e1")?.suppressed).toBe(true);
    expect(effectiveMoveRange(result.state.units.find((unit) => unit.id === "e1")!)).toBe(2);
    state = createBattle(roster({ p1: { id: "u1", position: { x: 1, y: 0 } }, e1: { position: { x: 2, y: 0 } } }));
    result = useSkill(state, "witness-cross", "u1", "e1");
    expect(result.ok).toBe(true);
    expect(result.state.units.find((unit) => unit.id === "e1")?.faith).toBe(4);
  });

  it("executes previewed enemy actions and advances the round", () => {
    const state = createBattle(roster({ p1: { faith: 12 }, e1: { position: { x: 1, y: 0 } } }));
    const intent = state.enemyIntents.find((item) => item.unitId === "e1");
    expect(intent?.type).toBe("attack");
    const next = endPlayerTurn(state);
    expect(next.round).toBe(2);
    expect(next.phase).toBe("player");
    expect(next.units.find((unit) => unit.id === "p1")?.health).toBe(7);
  });

  it("lets all three player units act before the explicit enemy phase", () => {
    let state = createBattle(roster());
    for (const [id, destination] of [["p1", { x: 1, y: 0 }], ["p2", { x: 1, y: 2 }], ["p3", { x: 1, y: 4 }]] as const) {
      const result = moveUnit(state, id, destination);
      expect(result.ok).toBe(true);
      state = result.state;
      expect(state.phase).toBe("player");
      expect(state.round).toBe(1);
    }
    expect(state.units.filter((unit) => unit.team === "player" && unit.acted)).toHaveLength(3);
  });

  it("safely undoes one move and restores the unit action", () => {
    const state = createBattle(roster());
    const moved = moveUnit(state, "p1", { x: 3, y: 0 });
    const undone = undoMove(moved.state, "p1", { x: 0, y: 0 });
    expect(undone.ok).toBe(true);
    expect(undone.state.units.find((unit) => unit.id === "p1")?.position).toEqual({ x: 0, y: 0 });
    expect(undone.state.units.find((unit) => unit.id === "p1")?.acted).toBe(false);
  });

  it("declares victory when every enemy is dead or faith-broken", () => {
    const state = createBattle(roster());
    const units = state.units.map((unit) => unit.team === "enemy" ? { ...unit, faith: 0 } : unit);
    expect(determineOutcome(units)).toBe("victory");
  });
});
