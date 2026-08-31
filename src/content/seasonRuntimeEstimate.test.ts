import { describe, expect, it } from "vitest";
import { holyFlameChapter } from "./chapterHolyFlame";
import { ironRoadChapter } from "./chapterIronRoad";
import {
  collectSeasonNarrativeMetrics,
  estimateSeasonRuntime,
  estimateShortestSuccessfulRoute,
} from "./seasonRuntimeEstimate";
import { veiledDawnChapter } from "./chapterVeiledDawn";
import type { StoryChapter } from "./types";

const chapters = [holyFlameChapter, ironRoadChapter, veiledDawnChapter];

describe("season runtime estimate", () => {
  it("reports deterministic whole-season inventory metrics", () => {
    const metrics = collectSeasonNarrativeMetrics(chapters);
    const estimate = estimateSeasonRuntime(metrics);
    expect(metrics.battleNodes).toBe(7);
    expect(metrics.visibleChineseCharacters).toBeGreaterThanOrEqual(28_000);
    expect(metrics.choices).toBeGreaterThanOrEqual(24);
    expect(metrics.personalSceneCharacters).toEqual([
      "agnes",
      "cole",
      "odric",
      "reina",
      "seraphina",
      "the_unflagged",
    ]);
    expect(metrics.evidenceRecoveryDialogues).toBeGreaterThanOrEqual(3);
    expect(estimate.modelNotice).toContain("并非真人计时");
  });

  it("gates 4.5 hours on the actual shortest successful route", () => {
    const route = estimateShortestSuccessfulRoute(chapters);
    expect(route.metrics.battleNodes).toBe(7);
    expect(route.metrics.endingNodes).toBe(3);
    expect(route.metrics.endingIds).toHaveLength(3);
    expect(route.metrics.endingIds).not.toContain("failure");
    expect(route.runtime.totalMinutes.min).toBeGreaterThanOrEqual(270);
    expect(route.runtime.modelNotice).toContain("实际可达成功路线");
  });

  it("carries flags, evidence and stats across chapter boundaries", () => {
    const first: StoryChapter = {
      id: "first",
      title: "第一章",
      subtitle: "状态起点",
      artwork: { src: "/first.webp", alt: "第一章插图" },
      startNodeId: "start",
      actionNodeIds: [],
      nodes: {
        start: {
          id: "start",
          kind: "dialogue",
          lines: [{ text: "取得跨章通行证。" }],
          choices: [
            {
              id: "prepare",
              label: "记录证据并争取信任",
              effects: {
                setFlags: ["questioned_mara"],
                addEvidence: ["cold_ash"],
                statChanges: { wardenTrust: 2 },
              },
              next: "done",
            },
          ],
        },
        done: {
          id: "done",
          kind: "ending",
          endingId: "truth",
          title: "第一章结束",
          lines: [],
          summary: "继续前进。",
        },
      },
    };
    const second: StoryChapter = {
      id: "second",
      title: "第二章",
      subtitle: "状态验证",
      artwork: { src: "/second.webp", alt: "第二章插图" },
      startNodeId: "gate",
      actionNodeIds: [],
      nodes: {
        gate: {
          id: "gate",
          kind: "dialogue",
          lines: [{ text: "守卫核验上一章留下的记录。" }],
          choices: [
            {
              id: "pass",
              label: "出示记录",
              condition: {
                flagsAll: ["questioned_mara"],
                evidenceAll: ["cold_ash"],
                statAtLeast: { wardenTrust: 2 },
              },
              next: "done",
            },
          ],
        },
        done: {
          id: "done",
          kind: "ending",
          endingId: "order",
          title: "第二章结束",
          lines: [],
          summary: "跨章状态有效。",
        },
      },
    };

    const route = estimateShortestSuccessfulRoute([first, second]);
    expect(route.metrics.endingIds).toEqual(["truth", "order"]);
    expect(route.finalState.flags.questioned_mara).toBe(true);
    expect(route.finalState.evidence).toContain("cold_ash");
    expect(route.finalState.stats.wardenTrust).toBe(2);
  });

  it("counts only state-visible choices and always follows battle victoryNext", () => {
    const chapter: StoryChapter = {
      id: "route-proof",
      title: "路线证明",
      subtitle: "只统计可见内容",
      artwork: { src: "/proof.webp", alt: "证明插图" },
      startNodeId: "start",
      actionNodeIds: [],
      nodes: {
        start: {
          id: "start",
          kind: "dialogue",
          lines: [{ text: "先取得许可。" }],
          choices: [
            {
              id: "permit",
              label: "取得许可",
              effects: { setFlags: ["questioned_mara"] },
              next: "battle",
            },
            {
              id: "hidden",
              label: "这段文字在当前状态不可见",
              condition: { flagsAll: ["inspected_altar"] },
              next: "failure",
            },
          ],
        },
        battle: {
          id: "battle",
          kind: "battle",
          battleId: "proof",
          title: "验证战斗",
          briefing: "胜利后继续。",
          objectives: ["完成验证"],
          victoryNext: "success",
          defeatNext: "failure",
        },
        success: {
          id: "success",
          kind: "ending",
          endingId: "truth",
          title: "成功",
          lines: [],
          summary: "胜利出口抵达。",
        },
        failure: {
          id: "failure",
          kind: "ending",
          endingId: "failure",
          title: "失败",
          lines: [],
          summary: "失败出口不应抵达。",
        },
      },
    };

    const route = estimateShortestSuccessfulRoute([chapter]);
    expect(route.metrics.selectedChoiceIds).toEqual(["route-proof:permit"]);
    expect(route.metrics.visitedNodeIds).not.toContain("route-proof:failure");
    expect(route.metrics.choicesShown).toBe(1);
    expect(route.metrics.battleNodes).toBe(1);
  });

  it("uses choices for flags, stats, evidence and ending branches rather than label-only variants", () => {
    const choices = chapters.flatMap((chapter) =>
      Object.values(chapter.nodes)
        .filter((node) => node.kind === "dialogue")
        .flatMap((node) => node.choices),
    );
    expect(choices.some((choice) => Boolean(choice.effects?.setFlags?.length))).toBe(true);
    expect(
      choices.some((choice) => Boolean(Object.keys(choice.effects?.statChanges ?? {}).length)),
    ).toBe(true);
    expect(choices.some((choice) => Boolean(choice.effects?.addEvidence?.length))).toBe(true);
    expect(choices.some((choice) => Boolean(choice.condition))).toBe(true);
    const destinations = new Set(choices.map((choice) => choice.next));
    expect(["truth-ending", "order-ending"].every((id) => destinations.has(id))).toBe(true);
  });
});
