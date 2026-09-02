import { describe, expect, it } from "vitest";
import {
  advanceCampaignWeek,
  awardBattleMeeting,
  buyCampaignWeapon,
  clearStoryCheckpoint,
  commitCampaignAction,
  completeCampaignBattle,
  consumeCampaignPotion,
  createCampaignState,
  createMainlineCampaignState,
  equipCampaignWeapon,
  finishCampaignSeason,
  loadCampaign,
  resolveStoryCheckpoint,
  saveCampaign,
  selectCampaignAction,
  setCampaignLineup,
  setStoryCheckpoint,
  type CampaignState,
  type CampaignStorage,
} from "./campaign";

function memoryStorage(): CampaignStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => void values.set(key, value),
    removeItem: (key) => void values.delete(key),
  };
}

describe("campaign state", () => {
  it("commits exactly one weekly action", () => {
    const initial = createCampaignState();
    const investigated = commitCampaignAction(selectCampaignAction(initial, "investigate"));
    const ignored = commitCampaignAction(selectCampaignAction(investigated, "rest"));

    expect(investigated.evidence).toBe(initial.evidence + 1);
    expect(investigated.evidenceItems).toContain("cold_ash");
    expect(investigated.intelLevel).toBe(1);
    expect(ignored).toBe(investigated);
  });

  it("rests only one fatigued member and records cohesion", () => {
    const base = createCampaignState();
    const initial = {...base, roster: base.roster.map((member) => member.id === "reina" ? {...member, condition: "fatigued" as const} : member)};
    const rested = commitCampaignAction(selectCampaignAction(initial, "rest"));
    expect(rested.cohesion).toBe(initial.cohesion + 1);
    expect(rested.roster.find((member) => member.id === "seraphina")?.condition).toBe("normal");
    expect(rested.roster.find((member) => member.id === "reina")?.condition).toBe("fatigued");
  });

  it("negotiates for the ledger and a visible faction attitude", () => {
    const initial = createCampaignState();
    const negotiated = commitCampaignAction(selectCampaignAction(initial, "negotiate"));
    expect(negotiated.evidence).toBe(initial.evidence + 1);
    expect(negotiated.evidenceItems).toContain("lamp_oil_ledger");
    expect(negotiated.factionAttitudes.goddessState).toBe(1);
  });

  it("accepts only three unique available members", () => {
    const initial = createCampaignState();
    const invalid = setCampaignLineup(initial, ["the_unflagged", "the_unflagged", "reina"]);
    const valid = setCampaignLineup(initial, ["reina", "seraphina", "the_unflagged"]);

    expect(invalid).toBe(initial);
    expect(valid.lineup).toEqual(["reina", "seraphina", "the_unflagged"]);
  });

  it("advances after a report whether the battle is won or lost", () => {
    for (const result of ["victory", "defeat"] as const) {
      const reported = completeCampaignBattle(createCampaignState(), result);
      const next = advanceCampaignWeek(reported);
      expect(reported.view).toBe("report");
      expect(next.week).toBe(2);
      expect(next.routeIndex).toBe(1);
      expect(next.view).toBe("home");
    }
  });

  it("keeps a completed season on its terminal report instead of creating week four", () => {
    const finalReport=completeCampaignBattle({...createCampaignState(),week:3},"victory");
    const finished=finishCampaignSeason(finalReport);
    expect(advanceCampaignWeek(finished)).toEqual(finished);
  });

  it("lets Arthur's tactical retreat preserve rations and experience boost accelerate failed-battle growth", () => {
    const base = createMainlineCampaignState();
    const skilled: CampaignState = {
      ...base,
      mainline: { ...base.mainline!, skills: ["tactical-retreat", "experience-boost"] },
    };
    const defeated = completeCampaignBattle(skilled, "defeat");
    expect(defeated.supplies).toBe(base.supplies);
    expect(defeated.factionAttitudes.wardens).toBe(1);
    expect(defeated.mainline?.experience).toBe(Math.round((14 + base.week * 2) * 1.2));
  });

  it("records every promised victory and defeat state change", () => {
    const initial = createCampaignState();
    const victory = completeCampaignBattle(initial, "victory");
    expect(victory.evidence).toBe(initial.evidence + 1);
    expect(victory.evidenceItems).toContain("broken_wrench");
    expect(victory.civilianSafety).toBe(3);
    expect(victory.cohesion).toBe(initial.cohesion + 1);
    expect(victory.routeRiskModifier).toBe("normal");
    expect(victory.lastReport?.conditionCharacterId).toBe("the_unflagged");
    expect(victory.roster.find((member) => member.id === "the_unflagged")?.condition).toBe("fatigued");

    const defeat = completeCampaignBattle(initial, "defeat");
    expect(defeat.supplies).toBe(initial.supplies - 1);
    expect(defeat.civilianSafety).toBe(initial.civilianSafety - 1);
    expect(defeat.factionAttitudes.goddessState).toBe(-1);
    expect(defeat.lastReport?.conditionCharacterId).toBe("the_unflagged");
    expect(defeat.roster.find((member) => member.id === "the_unflagged")?.condition).toBe("wounded");
    expect(defeat.routeRiskModifier).toBe("heightened");
  });

  it("awards one free meeting per formal battle id without duplicating retries", () => {
    const initial = createCampaignState();
    const first = awardBattleMeeting(initial, "holy-flame-square");
    const retried = awardBattleMeeting(first, "holy-flame-square");
    const second = awardBattleMeeting(retried, "iron-road-ambush");

    expect(first.recruitmentMeetings).toBe(initial.recruitmentMeetings + 1);
    expect(retried).toBe(first);
    expect(second.recruitmentMeetings).toBe(initial.recruitmentMeetings + 2);
    expect(second.rewardedBattleIds).toEqual(["holy-flame-square", "iron-road-ambush"]);
  });

  it("does not grant a chapter-level meeting during battle report completion", () => {
    const initial = createCampaignState();
    expect(completeCampaignBattle(initial, "victory").recruitmentMeetings).toBe(initial.recruitmentMeetings);
    expect(completeCampaignBattle(initial, "defeat").recruitmentMeetings).toBe(initial.recruitmentMeetings);
  });

  it("round-trips through local storage", () => {
    const storage = memoryStorage();
    const state = commitCampaignAction(selectCampaignAction(createCampaignState(), "negotiate"));
    saveCampaign(state, storage);
    expect(loadCampaign(storage)).toEqual(state);
  });

  it("keeps purchased equipment permanently owned and lets the player swap the equipped item", () => {
    const mainline = createMainlineCampaignState();
    const purchased = buyCampaignWeapon({ ...mainline, coins: 100 }, "echo-compass");
    expect(purchased.ownedWeapons).toContain("echo-compass");
    expect(purchased.equippedWeapon).toBe("echo-compass");
    expect(purchased.mainline?.equipment.weapon).toBe("echo-compass");
    const swapped = equipCampaignWeapon(purchased, "echo-compass");
    expect(swapped.equippedWeapon).toBe("echo-compass");
    expect(swapped.coins).toBe(48);
  });

  it("consumes one stocked potion without allowing a negative inventory", () => {
    const state = { ...createCampaignState(), potions: 2 };
    expect(consumeCampaignPotion(state).potions).toBe(1);
    expect(consumeCampaignPotion({ ...state, potions: 0 }).potions).toBe(0);
  });

  it("migrates a valid version-one save and preserves the existing campaign", () => {
    const storage = memoryStorage();
    const current = createCampaignState();
    const {recruitmentMeetings: _meetings, recruitmentPity: _pity, recruitmentMarks: _marks, lastRecruitment: _last, ...legacy} = current;
    storage.setItem("goddess-fall:campaign:milestone-a:v1", JSON.stringify({...legacy, version: 1}));
    const migrated = loadCampaign(storage);
    expect(migrated.version).toBe(4);
    expect(migrated.week).toBe(current.week);
    expect(migrated.lineup).toEqual(current.lineup);
    expect(migrated.recruitmentMeetings).toBe(1);
    expect(migrated.storyCheckpoint).toBeUndefined();
    expect(migrated.rewardedBattleIds).toEqual([]);
  });

  it("migrates a version-two save with an empty story checkpoint", () => {
    const storage = memoryStorage();
    const current = createCampaignState();
    storage.setItem("goddess-fall:campaign:milestone-a:v1", JSON.stringify({...current, version: 2}));
    const migrated = loadCampaign(storage);
    expect(migrated.version).toBe(4);
    expect(migrated.week).toBe(current.week);
    expect(migrated.storyCheckpoint).toBeUndefined();
  });

  it("migrates a version-three save without changing its existing meetings", () => {
    const storage = memoryStorage();
    const current = createCampaignState();
    const { rewardedBattleIds: _rewarded, storyState: _storyState, ...legacy } = current;
    storage.setItem("goddess-fall:campaign:milestone-a:v1", JSON.stringify({
      ...legacy,
      version: 3,
      recruitmentMeetings: 7,
    }));
    const migrated = loadCampaign(storage);
    expect(migrated.version).toBe(4);
    expect(migrated.recruitmentMeetings).toBe(7);
    expect(migrated.rewardedBattleIds).toEqual([]);
    expect(migrated.storyState.stats.publicFaith).toBe(60);
  });

  it("round-trips and resolves a valid story checkpoint", () => {
    const storage = memoryStorage();
    const checkpointed = setStoryCheckpoint(createCampaignState(), {
      chapterId: "holy-flame",
      currentNodeId: "square-battle",
      completedNodeIds: ["opening", "confrontation"],
      storyState: {
        flags: { inspected_altar: true },
        evidence: ["cold_ash", "broken_wrench"],
        stats: { publicFaith: 50, civilianSafety: 60, goddessTrust: -1, wardenTrust: 2 },
      },
    });
    saveCampaign(checkpointed, storage);
    const loaded = loadCampaign(storage);
    const resolved = resolveStoryCheckpoint(loaded.storyCheckpoint, "holy-flame", new Set(["opening", "confrontation", "square-battle"]), "opening");
    expect(resolved.resumed).toBe(true);
    expect(resolved.nodeId).toBe("square-battle");
    expect(resolved.storyState?.flags.inspected_altar).toBe(true);
    expect(resolved.storyState?.evidence).toContain("cold_ash");
    expect(loaded.storyState.flags.inspected_altar).toBe(true);
    expect(loaded.storyState.evidence).toContain("broken_wrench");
  });

  it("rejects a checkpoint from another chapter or with a missing node", () => {
    const checkpointed = setStoryCheckpoint(createCampaignState(), {
      chapterId: "iron-road",
      currentNodeId: "missing-node",
      completedNodeIds: ["also-missing"],
      storyState: {
        flags: {},
        evidence: [],
        stats: { publicFaith: 60, civilianSafety: 50, goddessTrust: 0, wardenTrust: 0 },
      },
    });
    const resolved = resolveStoryCheckpoint(checkpointed.storyCheckpoint, "holy-flame", new Set(["opening"]), "opening");
    expect(resolved).toEqual({ nodeId: "opening", completedNodeIds: [], resumed: false });
  });

  it("clears a checkpoint at chapter completion and when advancing a week", () => {
    const checkpointed = setStoryCheckpoint(createCampaignState(), {
      chapterId: "holy-flame",
      currentNodeId: "truth-ending",
      completedNodeIds: ["opening"],
      storyState: {
        flags: {},
        evidence: [],
        stats: { publicFaith: 60, civilianSafety: 50, goddessTrust: 0, wardenTrust: 0 },
      },
    });
    const cleared = clearStoryCheckpoint(checkpointed);
    expect(cleared.storyCheckpoint).toBeUndefined();
    expect(cleared.storyState).toEqual(checkpointed.storyState);
    const reported = completeCampaignBattle(checkpointed, "victory");
    expect(advanceCampaignWeek(reported).storyCheckpoint).toBeUndefined();
  });

  it("rejects malformed same-version storage instead of crashing the UI", () => {
    const storage = memoryStorage();
    storage.setItem("goddess-fall:campaign:milestone-a:v1", JSON.stringify({
      ...createCampaignState(),
      view: "hacked-view",
      lineup: ["unknown", "seraphina", "reina"],
      supplies: -99,
    }));
    expect(loadCampaign(storage)).toEqual(createCampaignState());
  });
});
