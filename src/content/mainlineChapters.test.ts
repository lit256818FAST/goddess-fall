import { describe, expect, it } from "vitest";
import { mainlineBattleIds, mainlineChapterByWeek } from "./mainlineChapters";

describe("Arthur mainline chapter spine", () => {
  it("exposes seven chapters and twelve reachable battle nodes", () => {
    expect(Object.keys(mainlineChapterByWeek)).toHaveLength(7);
    const battleIds = Object.values(mainlineChapterByWeek).flatMap((chapter) => Object.values(chapter.nodes)
      .filter((node) => node.kind === "battle")
      .map((node) => node.battleId));
    expect(battleIds).toHaveLength(12);
    expect(new Set(battleIds)).toEqual(new Set(mainlineBattleIds));
  });

  it("continues the first five chapters through a second battle", () => {
    for (const week of [1, 2, 3, 4, 5]) {
      const chapter = mainlineChapterByWeek[week];
      expect(Object.values(chapter.nodes).filter((node) => node.kind === "battle")).toHaveLength(2);
    }
    expect(Object.values(mainlineChapterByWeek[6].nodes).filter((node) => node.kind === "battle")).toHaveLength(1);
    expect(Object.values(mainlineChapterByWeek[7].nodes).filter((node) => node.kind === "battle")).toHaveLength(1);
  });

  it("keeps each chapter's playable story beats substantial", () => {
    for (const chapter of Object.values(mainlineChapterByWeek)) {
      const dialogueNodes = Object.values(chapter.nodes).filter((node) => node.kind === "dialogue");
      const endingNodes = Object.values(chapter.nodes).filter((node) => node.kind === "ending");
      expect(dialogueNodes[0]?.lines.length).toBeGreaterThanOrEqual(5);
      expect(endingNodes.every((node) => node.lines.length >= 2)).toBe(true);
    }
    for (const week of [1, 2, 3, 4, 5]) {
      const dialogueNodes = Object.values(mainlineChapterByWeek[week].nodes).filter((node) => node.kind === "dialogue");
      expect(dialogueNodes[1]?.lines.length).toBeGreaterThanOrEqual(3);
    }
  });
});
