import { describe, expect, it } from "vitest";
import { veiledDawnChapter } from "./chapterVeiledDawn";
import { veiledDawnExpansionNodes } from "./chapterVeiledDawnExpansion";
import type { StoryChoice, StoryCondition, StoryState } from "./types";

const evidenceIds = ["lamp_oil_ledger", "cold_ash", "broken_wrench"] as const;

function makeState(evidence: StoryState["evidence"] = []): StoryState {
  return {
    flags: {},
    evidence: [...evidence],
    stats: {
      publicFaith: 60,
      civilianSafety: 50,
      goddessTrust: 0,
      wardenTrust: 0,
    },
  };
}

function isAvailable(condition: StoryCondition | undefined, state: StoryState): boolean {
  if (!condition) return true;
  return (
    (condition.flagsAll ?? []).every((flag) => state.flags[flag]) &&
    (condition.flagsNone ?? []).every((flag) => !state.flags[flag]) &&
    (condition.evidenceAll ?? []).every((id) => state.evidence.includes(id)) &&
    Object.entries(condition.statAtLeast ?? {}).every(
      ([stat, value]) => state.stats[stat as keyof StoryState["stats"]] >= value!,
    )
  );
}

function applyChoice(state: StoryState, choice: StoryChoice): StoryState {
  const next: StoryState = {
    flags: { ...state.flags },
    evidence: [...state.evidence],
    stats: { ...state.stats },
  };
  for (const flag of choice.effects?.setFlags ?? []) next.flags[flag] = true;
  for (const evidence of choice.effects?.addEvidence ?? []) {
    if (!next.evidence.includes(evidence)) next.evidence.push(evidence);
  }
  for (const [stat, delta] of Object.entries(choice.effects?.statChanges ?? {})) {
    next.stats[stat as keyof StoryState["stats"]] += delta!;
  }
  return next;
}

function dialogueChoice(nodeId: string, choiceId: string): StoryChoice {
  const node = veiledDawnChapter.nodes[nodeId];
  expect(node.kind).toBe("dialogue");
  if (node.kind !== "dialogue") throw new Error(`${nodeId} is not a dialogue node`);
  const choice = node.choices.find((item) => item.id === choiceId);
  expect(choice, `${choiceId} should exist on ${nodeId}`).toBeDefined();
  return choice!;
}

describe("veiled dawn finale", () => {
  it("offers evidence, life, and faith solutions and resolves victory or defeat", () => {
    const start = veiledDawnChapter.nodes["three-chains"];
    expect(start.kind).toBe("dialogue");
    if (start.kind !== "dialogue") return;
    expect(start.choices.map((choice) => choice.id)).toEqual([
      "submit-complete-chain",
      "open-vessel",
      "answer-with-faith",
    ]);
    expect(start.choices[0].condition?.evidenceAll).toEqual([
      "lamp_oil_ledger",
      "cold_ash",
      "broken_wrench",
    ]);
    for (const battleId of ["final-battle"]) {
      const battle = veiledDawnChapter.nodes[battleId];
      expect(battle.kind).toBe("battle");
      if (battle.kind !== "battle") continue;
      const victory = veiledDawnChapter.nodes[battle.victoryNext];
      expect(victory.kind).toBe("dialogue");
      if (victory.kind === "dialogue") {
        expect(victory.id).toBe("first-night-without-the-statue");
        expect(victory.choices.map((choice) => choice.next)).toEqual(["final-resolution"]);
        const resolution = veiledDawnChapter.nodes[victory.choices[0].next];
        expect(resolution.kind).toBe("dialogue");
        if (resolution.kind === "dialogue") {
          expect(resolution.choices.every((choice) => veiledDawnChapter.nodes[choice.next].kind === "ending")).toBe(true);
        }
      }
      expect(veiledDawnChapter.nodes[battle.defeatNext].kind).toBe("ending");
    }
  });

  it("does not create missing evidence during cross-checking", () => {
    const rescue = dialogueChoice("silent-room-rescue", "rescue-with-ledger-sample");
    const sample = dialogueChoice("original-pages-or-open-door", "sample-originals-after-rescue");
    const crosscheck = dialogueChoice("three-evidence-crosscheck", "publish-evidence-limits");

    let state = makeState();
    state = applyChoice(state, rescue);
    state = applyChoice(state, sample);
    expect(state.evidence.sort()).toEqual(["cold_ash", "lamp_oil_ledger"]);

    const afterCrosscheck = applyChoice(state, crosscheck);
    expect(afterCrosscheck.evidence.sort()).toEqual(["cold_ash", "lamp_oil_ledger"]);
    expect(afterCrosscheck.evidence).not.toContain("broken_wrench");
  });

  it("keeps evidence submission locked until all three items were actually recovered", () => {
    const submit = dialogueChoice("three-chains", "submit-complete-chain");
    expect(isAvailable(submit.condition, makeState(["lamp_oil_ledger", "cold_ash"]))).toBe(false);
    expect(isAvailable(submit.condition, makeState([...evidenceIds]))).toBe(true);
  });

  it("sends the complete-evidence route through the final battle", () => {
    const submit = dialogueChoice("three-chains", "submit-complete-chain");
    const state = applyChoice(makeState([...evidenceIds]), submit);
    expect(isAvailable(submit.condition, makeState([...evidenceIds]))).toBe(true);
    expect(submit.next).toBe("final-battle");
    expect(veiledDawnChapter.nodes[submit.next].kind).toBe("battle");
    expect(state.flags.chose_evidence).toBe(true);
    expect(state.flags.completed_three_witnesses).toBe(true);
  });

  it.each([
    ["submit-complete-chain", "record-evidence"],
    ["open-vessel", "record-vessel"],
    ["answer-with-faith", "record-faith"],
  ])("offers exactly one resolution after route %s", (routeChoiceId, resolutionChoiceId) => {
    const route = dialogueChoice("three-chains", routeChoiceId);
    const state = applyChoice(makeState([...evidenceIds]), route);
    const resolution = veiledDawnChapter.nodes["final-resolution"];
    expect(resolution.kind).toBe("dialogue");
    if (resolution.kind !== "dialogue") return;

    expect(resolution.choices.filter((choice) => isAvailable(choice.condition, state)).map((choice) => choice.id)).toEqual([
      resolutionChoiceId,
    ]);
  });

  it("keeps expansion scenes from setting route and prior-chapter flags", () => {
    const forbiddenFlags = new Set([
      "chose_faith",
      "completed_three_witnesses",
      "protected_grain_route",
    ]);
    const leakedFlags = Object.values(veiledDawnExpansionNodes).flatMap((node) =>
      node.choices.flatMap((choice) =>
        (choice.effects?.setFlags ?? []).filter((flag) => forbiddenFlags.has(flag)),
      ),
    );
    expect(leakedFlags).toEqual([]);

    expect(veiledDawnExpansionNodes["seraphina-unspoken-prayer"].focusCharacterId).toBe("seraphina");
    expect(veiledDawnExpansionNodes["unflagged-no-oath"].focusCharacterId).toBe("the_unflagged");
  });

  it("keeps the goddess unresolved in all three ending directions", () => {
    const endings = Object.values(veiledDawnChapter.nodes).filter((node) => node.kind === "ending");
    expect(endings).toHaveLength(3);
    expect(endings.map((node) => node.endingId).sort()).toEqual(["failure", "order", "truth"]);
    for (const ending of endings) {
      const text = `${ending.summary} ${ending.lines.map((line) => line.text).join(" ")}`;
      expect(text).not.toMatch(/女神确实存在|女神并不存在/);
    }
  });
});
