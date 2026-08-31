import { distance, previewEnemyIntents, type BattleState, type Unit } from "./battle";
import { campaignShop, type CampaignCharacterId, type CampaignState } from "./campaign";

export interface CampaignBattleModifierResult {
  state: BattleState;
  notes: string[];
}

const unitIdByCharacter: Readonly<Record<CampaignCharacterId, string>> = {
  the_unflagged: "u1",
  seraphina: "u2",
  reina: "u3",
  odric: "u4",
  cole: "u5",
  agnes: "u6",
  arthur: "u-arthur",
  hans: "u-hans",
  asnoka: "u-asnoka",
};

/**
 * Applies campaign choices and persistent injuries to a freshly-created battle.
 * The function is intentionally pure so save data remains the source of truth.
 */
export function applyCampaignBattleModifiers(
  state: BattleState,
  campaign: Pick<CampaignState, "selectedAction" | "lineup" | "roster" | "equippedWeapon"> & { mainline?: CampaignState["mainline"] },
): CampaignBattleModifierResult {
  let units = state.units.map((unit) => ({ ...unit, position: { ...unit.position } }));
  const notes: string[] = [];
  const mapUnits = (change: (unit: Unit) => Unit) => {
    units = units.map(change);
  };

  if (campaign.selectedAction === "investigate") {
    mapUnits((unit) => unit.team === "enemy"
      ? { ...unit, moveRange: Math.max(1, unit.moveRange - 1) }
      : unit);
    notes.push("战前调查：敌方移动 -1");
  } else if (campaign.selectedAction === "rest") {
    mapUnits((unit) => unit.team === "player"
      ? { ...unit, health: unit.health + 1, maxHealth: unit.maxHealth + 1 }
      : unit);
    notes.push("战前休整：我方生命 +1");
  } else if (campaign.selectedAction === "negotiate") {
    mapUnits((unit) => unit.team === "enemy"
      ? { ...unit, faith: Math.max(1, unit.faith - 1), maxFaith: Math.max(1, unit.maxFaith - 1) }
      : unit);
    notes.push("战前交涉：敌方信念 -1");
  }

  const deployed = new Set(campaign.lineup);
  for (const member of campaign.roster) {
    if (!deployed.has(member.id) || member.condition === "normal") continue;
    const unitId = unitIdByCharacter[member.id];
    if (member.condition === "fatigued") {
      mapUnits((unit) => unit.id === unitId
        ? { ...unit, moveRange: Math.max(1, unit.moveRange - 1) }
        : unit);
      notes.push(`${member.id} 疲劳：移动 -1`);
    } else {
      mapUnits((unit) => unit.id === unitId
        ? {
          ...unit,
          health: Math.max(1, unit.health - 2),
          maxHealth: Math.max(1, unit.maxHealth - 2),
          attackDamage: Math.max(1, unit.attackDamage - 1),
        }
        : unit);
      notes.push(`${member.id} 轻伤：生命 -2、攻击 -1`);
    }
  }

  const equipped = campaign.equippedWeapon ?? campaign.mainline?.equipment.weapon;
  const equipment = equipped ? campaignShop.find((item) => item.id === equipped) : undefined;
  if (equipment) {
    const protagonistId = campaign.mainline ? "u-arthur" : "u1";
    mapUnits((unit) => unit.id === protagonistId ? {
      ...unit,
      health: unit.health + equipment.defense,
      maxHealth: unit.maxHealth + equipment.defense,
      faith: unit.faith + equipment.faith,
      maxFaith: unit.maxFaith + equipment.faith,
      moveRange: unit.moveRange + equipment.moveRange,
      attackDamage: unit.attackDamage + equipment.attack,
      faithDamage: unit.faithDamage + equipment.faith,
    } : unit);
    notes.push(`装备：${equipment.name}（${equipment.description}）`);
  }

  const mainlineSkills = new Set(campaign.mainline?.skills ?? []);
  if (campaign.mainline) {
    mapUnits((unit) => {
      if (unit.id === "u-arthur") {
        return {
          ...unit,
          health: unit.health + (mainlineSkills.has("iron-bone") ? 2 : 0),
          maxHealth: unit.maxHealth + (mainlineSkills.has("iron-bone") ? 2 : 0),
          attackDamage: unit.attackDamage + (mainlineSkills.has("heavy-strike") ? 1 : 0),
          moveRange: unit.moveRange + (mainlineSkills.has("lance-charge") ? 1 : 0),
          guarded: unit.guarded || mainlineSkills.has("shield-counter") || mainlineSkills.has("battle-line"),
        };
      }
      if (mainlineSkills.has("rally") && unit.team === "player") return { ...unit, faith: Math.min(unit.maxFaith, unit.faith + 1) };
      return unit;
    });
    if (mainlineSkills.has("battle-line")) {
      const arthur = units.find((unit) => unit.id === "u-arthur");
      if (arthur) {
        mapUnits((unit) => unit.team === "player" && unit.id !== "u-arthur" && distance(unit.position, arthur.position) <= 1
          ? { ...unit, guarded: true }
          : unit);
        notes.push("技能：军阵，相邻队友获得护持");
      }
    }
    if (mainlineSkills.has("identify")) {
      mapUnits((unit) => unit.team === "enemy" ? { ...unit, moveRange: Math.max(1, unit.moveRange - 1) } : unit);
      notes.push("技能：敌方鉴定，敌方移动 -1");
    }
    if (mainlineSkills.has("weakness-analysis")) {
      mapUnits((unit) => unit.team === "enemy" && unit.id.startsWith("boss-") ? { ...unit, exposed: true } : unit);
      notes.push("技能：弱点分析，Boss 初始暴露");
    }
  }

  const modified = { ...state, units };
  return {
    state: { ...modified, enemyIntents: previewEnemyIntents(modified) },
    notes,
  };
}
