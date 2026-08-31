import { describe, expect, it } from "vitest";
import { createBattle } from "./battle";
import { applyCampaignBattleModifiers } from "./campaignBattleModifiers";
import { createCampaignState, createMainlineCampaignState, type CampaignAction, type CampaignCondition, type CampaignState } from "./campaign";

function battle() {
  return createBattle([
    { id: "u1", name: "无旗者", team: "player", position: { x: 0, y: 0 }, health: 6, faith: 6, moveRange: 3, attackDamage: 3 },
    { id: "u2", name: "塞拉菲娜", team: "player", position: { x: 0, y: 1 }, health: 6, faith: 6, moveRange: 3, attackDamage: 3 },
    { id: "u3", name: "蕾娜", team: "player", position: { x: 0, y: 2 }, health: 6, faith: 6, moveRange: 3, attackDamage: 3 },
    { id: "e1", name: "敌一", team: "enemy", position: { x: 6, y: 0 }, health: 6, faith: 6, moveRange: 3 },
    { id: "e2", name: "敌二", team: "enemy", position: { x: 6, y: 1 }, health: 6, faith: 6, moveRange: 2 },
    { id: "e3", name: "敌三", team: "enemy", position: { x: 6, y: 2 }, health: 6, faith: 6, moveRange: 1 },
  ]);
}

function campaign(action: CampaignAction, condition: CampaignCondition = "normal") {
  const state = createCampaignState();
  return {
    ...state,
    selectedAction: action,
    lineup: ["the_unflagged", "seraphina", "reina"] as CampaignState["lineup"],
    roster: state.roster.map((member) => member.id === "the_unflagged" ? { ...member, condition } : member),
  };
}

function mainlineBattle() {
  return createBattle([
    { id: "u-arthur", name: "亚瑟", team: "player", position: { x: 0, y: 0 }, health: 8, faith: 5, moveRange: 3, attackDamage: 3 },
    { id: "u-hans", name: "汉斯", team: "player", position: { x: 0, y: 1 }, health: 8, faith: 5, moveRange: 2, attackDamage: 2 },
    { id: "u-asnoka", name: "阿斯诺卡", team: "player", position: { x: 0, y: 2 }, health: 6, faith: 6, moveRange: 4, attackDamage: 2 },
    { id: "e1", name: "黑廷侍从", team: "enemy", position: { x: 5, y: 0 }, health: 6, faith: 6, moveRange: 2 },
    { id: "e2", name: "审查骑士", team: "enemy", position: { x: 5, y: 2 }, health: 6, faith: 6, moveRange: 2 },
    { id: "boss-night-judge", name: "审判官", team: "enemy", position: { x: 6, y: 1 }, health: 12, faith: 13, moveRange: 2, attackDamage: 3 },
  ]);
}

describe("campaign battle modifiers", () => {
  it("makes investigate, rest, and negotiate affect distinct battle axes", () => {
    const investigated = applyCampaignBattleModifiers(battle(), campaign("investigate"));
    const rested = applyCampaignBattleModifiers(battle(), campaign("rest"));
    const negotiated = applyCampaignBattleModifiers(battle(), campaign("negotiate"));
    expect(investigated.state.units.filter((unit) => unit.team === "enemy").map((unit) => unit.moveRange)).toEqual([2, 1, 1]);
    expect(rested.state.units.filter((unit) => unit.team === "player").every((unit) => unit.health === 7 && unit.maxHealth === 7)).toBe(true);
    expect(negotiated.state.units.filter((unit) => unit.team === "enemy").every((unit) => unit.faith === 5 && unit.maxFaith === 5)).toBe(true);
    expect(investigated.state.enemyIntents).not.toEqual(battle().enemyIntents);
  });

  it("turns fatigue and wounds into bounded deployed-unit penalties", () => {
    const fatigued = applyCampaignBattleModifiers(battle(), campaign("rest", "fatigued"));
    const wounded = applyCampaignBattleModifiers(battle(), campaign("rest", "wounded"));
    const tiredUnit = fatigued.state.units.find((unit) => unit.id === "u1")!;
    const woundedUnit = wounded.state.units.find((unit) => unit.id === "u1")!;
    expect(tiredUnit.moveRange).toBe(2);
    expect(woundedUnit.health).toBe(5);
    expect(woundedUnit.maxHealth).toBe(5);
    expect(woundedUnit.attackDamage).toBe(2);
    expect(Math.min(tiredUnit.moveRange, woundedUnit.health, woundedUnit.attackDamage)).toBeGreaterThanOrEqual(1);
  });

  it("never lowers movement, health, faith, or attack below one", () => {
    const minimal = battle();
    minimal.units = minimal.units.map((unit) => unit.team === "player"
      ? { ...unit, health: 1, maxHealth: 1, attackDamage: 1, moveRange: 1 }
      : { ...unit, faith: 1, maxFaith: 1, moveRange: 1 });

    const investigated = applyCampaignBattleModifiers(minimal, campaign("investigate"));
    const negotiated = applyCampaignBattleModifiers(minimal, campaign("negotiate"));
    const wounded = applyCampaignBattleModifiers(minimal, campaign("investigate", "wounded"));

    expect(investigated.state.units.filter((unit) => unit.team === "enemy")
      .every((unit) => unit.moveRange === 1)).toBe(true);
    expect(negotiated.state.units.filter((unit) => unit.team === "enemy")
      .every((unit) => unit.faith === 1 && unit.maxFaith === 1)).toBe(true);
    expect(wounded.state.units.find((unit) => unit.id === "u1")).toMatchObject({
      health: 1,
      maxHealth: 1,
      attackDamage: 1,
    });
  });

  it("does not mutate the source battle and ignores conditions outside the deployed lineup", () => {
    const source = battle();
    const state = createCampaignState();
    const modifiedCampaign: CampaignState = {
      ...state,
      selectedAction: "investigate",
      lineup: ["seraphina", "reina", "odric"],
      roster: [
        ...state.roster.map((member) => member.id === "the_unflagged"
          ? { ...member, condition: "wounded" as const }
          : member),
        { id: "odric", condition: "normal" },
      ],
    };
    const before = structuredClone(source);
    const result = applyCampaignBattleModifiers(source, modifiedCampaign);

    expect(source).toEqual(before);
    expect(result.state).not.toBe(source);
    expect(result.state.units.find((unit) => unit.id === "u1")).toMatchObject({
      health: 6,
      maxHealth: 6,
      attackDamage: 3,
    });
    expect(result.notes.some((note) => note.includes("the_unflagged"))).toBe(false);
  });

  it("applies Arthur's permanent equipment and skill-tree effects to the real battle state", () => {
    const base = createMainlineCampaignState();
    const campaign: CampaignState = {
      ...base,
      equippedWeapon: "echo-compass",
      lineup: ["arthur", "hans", "asnoka"],
      mainline: {
        ...base.mainline!,
        skills: ["iron-bone", "shield-counter", "heavy-strike", "lance-charge", "battle-line", "rally", "identify", "weakness-analysis"],
        equipment: { ...base.mainline!.equipment, weapon: "echo-compass" },
      },
    };
    const result = applyCampaignBattleModifiers(mainlineBattle(), campaign);
    const arthur = result.state.units.find((unit) => unit.id === "u-arthur")!;
    const hans = result.state.units.find((unit) => unit.id === "u-hans")!;
    const enemy = result.state.units.find((unit) => unit.id === "boss-night-judge")!;
    expect(arthur).toMatchObject({ health: 11, maxHealth: 11, attackDamage: 4, moveRange: 5, guarded: true });
    expect(arthur.faith).toBe(7);
    expect(hans.guarded).toBe(true);
    expect(enemy.moveRange).toBe(1);
    expect(enemy.exposed).toBe(true);
    expect(result.notes.some((note) => note.includes("系统回响罗盘"))).toBe(true);
  });
});
