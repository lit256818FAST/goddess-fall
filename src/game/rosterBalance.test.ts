import { describe, expect, it } from "vitest";
import { battleObjectiveConfigs } from "./battleObjectives";
import {
  allThreeCharacterLineups,
  buildRosterBalanceMatrix,
  campaignCharacterIds,
  characterBattleProfiles,
  lineupKey,
  rankCharactersForMission,
  scoreLineupForMission,
} from "./rosterBalance";

describe("six-character roster balance proof", () => {
  it("enumerates all 20 possible three-character lineups over all seven battles", () => {
    const lineups = allThreeCharacterLineups();
    expect(lineups).toHaveLength(20);
    expect(new Set(lineups.map(lineupKey))).toHaveLength(20);
    const matrix = buildRosterBalanceMatrix();
    expect(matrix).toHaveLength(7);
    expect(matrix.every((mission) => mission.lineups.length === 20)).toBe(true);
    expect(matrix.flatMap((mission) => mission.lineups)).toHaveLength(140);
  });

  it("defines complete positive combat profiles for all six campaign characters", () => {
    expect(Object.keys(characterBattleProfiles).sort()).toEqual([...campaignCharacterIds].sort());
    for (const profile of Object.values(characterBattleProfiles)) {
      expect(profile.health).toBeGreaterThan(0);
      expect(profile.faith).toBeGreaterThan(0);
      expect(profile.moveRange).toBeGreaterThan(0);
      expect(profile.attackRange).toBeGreaterThan(0);
      expect(Math.max(profile.attackDamage, profile.faithDamage)).toBeGreaterThan(0);
    }
  });

  it("gives each profession a distinct attack style and reach", () => {
    expect(characterBattleProfiles.seraphina.attackRange).toBe(3);
    expect(characterBattleProfiles.reina.attackRange).toBe(4);
    expect(characterBattleProfiles.cole.attackRange).toBe(4);
    expect(characterBattleProfiles.agnes.attackRange).toBe(3);
    expect(characterBattleProfiles.odric.attackRange).toBe(1);
    expect(characterBattleProfiles.odric.attackStyle).toBe("heavy-single");
    expect(characterBattleProfiles.seraphina.attackStyle).toBe("ranged-single");
    expect(characterBattleProfiles.reina.criticalChance).toBeGreaterThan(0);
    expect(characterBattleProfiles.the_unflagged.attackStyle).toBe("melee-aoe");
  });

  it("gives every character a top-two advantage mission and a bottom-half poor-fit mission", () => {
    const ranks = Object.fromEntries(campaignCharacterIds.map((id) => [id, [] as number[]]));
    for (const config of Object.values(battleObjectiveConfigs)) {
      rankCharactersForMission(config).forEach((entry, index) => ranks[entry.characterId].push(index + 1));
    }
    for (const characterId of campaignCharacterIds) {
      expect(Math.min(...ranks[characterId]), `${characterId} needs an advantage mission`).toBeLessThanOrEqual(2);
      expect(Math.max(...ranks[characterId]), `${characterId} needs a poor-fit mission`).toBeGreaterThanOrEqual(4);
    }
  });

  it("has no universally optimal character or fixed lineup across all seven missions", () => {
    const matrix = buildRosterBalanceMatrix();
    const characterWins = new Map(campaignCharacterIds.map((id) => [id, 0]));
    const lineupWins = new Map(allThreeCharacterLineups().map((lineup) => [lineupKey(lineup), 0]));
    for (const mission of matrix) {
      characterWins.set(
        mission.characters[0].characterId,
        (characterWins.get(mission.characters[0].characterId) ?? 0) + 1,
      );
      const winner = lineupKey(mission.lineups[0].lineup);
      lineupWins.set(winner, (lineupWins.get(winner) ?? 0) + 1);
    }
    expect(Math.max(...characterWins.values())).toBeLessThan(7);
    expect(Math.max(...lineupWins.values())).toBeLessThanOrEqual(2);
    expect([...lineupWins.values()].filter((wins) => wins > 0)).toHaveLength(6);
  });

  it("changes the recommended lineup when the mission objective changes", () => {
    const winners = Object.fromEntries(buildRosterBalanceMatrix().map((mission) => [
      mission.battleId,
      lineupKey(mission.lineups[0].lineup),
    ]));
    expect(winners["holy-square-crisis"]).not.toBe(winners["odric-judgment"]);
    expect(winners["border-machines"]).not.toBe(winners["grain-crossing"]);
    expect(winners["iron-bulwark"]).not.toBe(winners["silent-march"]);
    expect(winners["silent-march"]).not.toBe(winners["veiled-avatar"]);
  });

  it("rejects malformed lineups instead of producing misleading scores", () => {
    const config = battleObjectiveConfigs["holy-square-crisis"];
    expect(() => scoreLineupForMission(["cole", "cole", "agnes"], config)).toThrow(
      "exactly three distinct",
    );
  });
});
