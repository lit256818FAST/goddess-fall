import type { UnitTemplate } from "./battle";
import { battleObjectiveConfigs, type BattleObjectiveConfig, type MissionModifierKind } from "./battleObjectives";
import type { CampaignCharacterId } from "./campaign";

export type CharacterBattleProfile = Readonly<
  Required<Pick<UnitTemplate, "health" | "faith" | "moveRange" | "attackRange" | "attackDamage" | "faithDamage">>
>;

/**
 * Runtime roster construction and balance verification consume the same table,
 * preventing the proof from silently drifting away from player-facing values.
 */
export const characterBattleProfiles: Readonly<Record<Exclude<CampaignCharacterId, "arthur" | "hans" | "asnoka">, CharacterBattleProfile>> = {
  the_unflagged: { health: 7, faith: 5, moveRange: 3, attackRange: 1, attackDamage: 3, faithDamage: 2 },
  seraphina: { health: 5, faith: 8, moveRange: 3, attackRange: 2, attackDamage: 3, faithDamage: 3 },
  reina: { health: 6, faith: 6, moveRange: 3, attackRange: 2, attackDamage: 4, faithDamage: 2 },
  odric: { health: 9, faith: 5, moveRange: 3, attackRange: 1, attackDamage: 3, faithDamage: 2 },
  cole: { health: 5, faith: 5, moveRange: 4, attackRange: 2, attackDamage: 2, faithDamage: 2 },
  agnes: { health: 5, faith: 8, moveRange: 3, attackRange: 3, attackDamage: 3, faithDamage: 4 },
};

export const mainlineCharacterBattleProfiles: Readonly<Record<"arthur" | "hans" | "asnoka", CharacterBattleProfile>> = {
  arthur: { health: 8, faith: 4, moveRange: 3, attackRange: 1, attackDamage: 4, faithDamage: 1 },
  hans: { health: 10, faith: 4, moveRange: 2, attackRange: 1, attackDamage: 3, faithDamage: 1 },
  asnoka: { health: 6, faith: 6, moveRange: 4, attackRange: 2, attackDamage: 3, faithDamage: 2 },
};

export const campaignCharacterIds = Object.freeze(
  ["the_unflagged", "seraphina", "reina", "odric", "cole", "agnes"] as CampaignCharacterId[],
);

/**
 * Utilities correspond to implemented effects. They remain close together so
 * specialization matters without erasing a character's combat profile.
 */
export const missionModifierUtility: Readonly<Record<MissionModifierKind, number>> = {
  "start-progress": 6,
  "protect-ward": 5,
  "weaken-target": 5,
  "extend-limit": 4,
};

export interface CharacterMissionScore {
  characterId: CampaignCharacterId;
  battleId: string;
  combatScore: number;
  roleScore: number;
  total: number;
}

export interface LineupMissionScore {
  lineup: readonly CampaignCharacterId[];
  battleId: string;
  total: number;
  members: readonly CharacterMissionScore[];
}

export function scoreCharacterForMission(
  characterId: CampaignCharacterId,
  config: BattleObjectiveConfig,
): CharacterMissionScore {
  const profile = (characterBattleProfiles as Record<string, CharacterBattleProfile>)[characterId]
    ?? (mainlineCharacterBattleProfiles as Record<string, CharacterBattleProfile>)[characterId];
  const durability = profile.health + profile.faith * 0.65;
  const bestDamage = Math.max(profile.attackDamage, profile.faithDamage);
  let combatScore: number;

  switch (config.kind) {
    case "eliminate":
      combatScore = bestDamage * 2 + profile.moveRange * 0.65 + durability * 0.2;
      break;
    case "hold":
      combatScore = durability * 0.5 + profile.moveRange * 1.25 + bestDamage * 0.35;
      break;
    case "protect":
      combatScore = durability * 0.65 + profile.moveRange * 0.8 + bestDamage * 0.4;
      break;
    case "evacuate":
      combatScore = profile.moveRange * 1.9 + durability * 0.25 + bestDamage * 0.25;
      break;
    case "disrupt":
      combatScore = profile.moveRange * 1.35 + durability * 0.35 + bestDamage * 0.45;
      break;
    case "tri-route":
      combatScore = profile.moveRange * 1.35 + durability * 0.35 + bestDamage * 0.45;
      break;
    case "white-knight":
      combatScore = bestDamage * 1.5 + durability * 0.45 + profile.moveRange * 0.7;
      break;
    case "iron-bulwark":
      combatScore = profile.moveRange * 1.4 + bestDamage * 0.9 + durability * 0.45;
      break;
    case "night-judge":
      combatScore = profile.faith * 1.15 + durability * 0.55 + profile.moveRange * 0.45;
      break;
  }

  const modifier = config.roleModifiers[characterId];
  const roleScore = modifier ? missionModifierUtility[modifier.kind] : 0;
  return {
    characterId,
    battleId: config.battleId,
    combatScore,
    roleScore,
    total: combatScore + roleScore,
  };
}

export function allThreeCharacterLineups(
  ids: readonly CampaignCharacterId[] = campaignCharacterIds,
): readonly (readonly CampaignCharacterId[])[] {
  const lineups: CampaignCharacterId[][] = [];
  for (let first = 0; first < ids.length; first += 1) {
    for (let second = first + 1; second < ids.length; second += 1) {
      for (let third = second + 1; third < ids.length; third += 1) {
        lineups.push([ids[first], ids[second], ids[third]]);
      }
    }
  }
  return lineups;
}

export function scoreLineupForMission(
  lineup: readonly CampaignCharacterId[],
  config: BattleObjectiveConfig,
): LineupMissionScore {
  if (lineup.length !== 3 || new Set(lineup).size !== 3) {
    throw new Error("A campaign lineup must contain exactly three distinct characters.");
  }
  const members = lineup.map((characterId) => scoreCharacterForMission(characterId, config));
  return {
    lineup,
    battleId: config.battleId,
    members,
    total: members.reduce((sum, member) => sum + member.total, 0),
  };
}

export function rankLineupsForMission(
  config: BattleObjectiveConfig,
): readonly LineupMissionScore[] {
  return allThreeCharacterLineups()
    .map((lineup) => scoreLineupForMission(lineup, config))
    .sort((left, right) =>
      right.total - left.total || lineupKey(left.lineup).localeCompare(lineupKey(right.lineup)));
}

export function rankCharactersForMission(
  config: BattleObjectiveConfig,
): readonly CharacterMissionScore[] {
  return campaignCharacterIds
    .map((characterId) => scoreCharacterForMission(characterId, config))
    .sort((left, right) =>
      right.total - left.total || left.characterId.localeCompare(right.characterId));
}

export function buildRosterBalanceMatrix() {
  return Object.values(battleObjectiveConfigs).map((config) => ({
    battleId: config.battleId,
    kind: config.kind,
    characters: rankCharactersForMission(config),
    lineups: rankLineupsForMission(config),
  }));
}

export function lineupKey(lineup: readonly CampaignCharacterId[]): string {
  return [...lineup].sort().join("+");
}
