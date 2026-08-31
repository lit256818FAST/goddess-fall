import { describe, expect, it } from "vitest";
import { createMainlineCampaignState } from "./campaign";
import { learnMainlineSkill, mainlineSkillAvailable } from "./mainlineSkills";

describe("Arthur skill tree", () => {
  it("spends one point and applies Iron Bone's stat effect", () => {
    const state = createMainlineCampaignState().mainline!;
    const next = learnMainlineSkill({ ...state, skillPoints: 1 }, "iron-bone");
    expect(next.skillPoints).toBe(0);
    expect(next.skills).toContain("iron-bone");
    expect(next.constitution).toBe(state.constitution + 2);
  });

  it("requires the previous skill in a route", () => {
    const state = { ...createMainlineCampaignState().mainline!, skillPoints: 2 };
    const shieldCounter = { id: "shield-counter", route: "战士路线", name: "盾反", description: "", effect: "", requires: "iron-bone" } as const;
    expect(mainlineSkillAvailable(state, shieldCounter)).toBe(false);
    const learned = learnMainlineSkill(state, "iron-bone");
    expect(mainlineSkillAvailable(learned, shieldCounter)).toBe(true);
  });
});
