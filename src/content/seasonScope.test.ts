import { describe, expect, it } from "vitest";
import { bossPhaseConfigs } from "../game/bossPhases";
import { awardBattleMeeting, commitCampaignAction, createCampaignState, selectCampaignAction } from "../game/campaign";
import { drawRecruitment } from "../game/recruitment";
import { holyFlameChapter } from "./chapterHolyFlame";
import { ironRoadChapter } from "./chapterIronRoad";
import { veiledDawnChapter } from "./chapterVeiledDawn";
import type { StoryChapter } from "./types";

const chapters: StoryChapter[] = [holyFlameChapter, ironRoadChapter, veiledDawnChapter];
const publicArtworkPaths=new Set(
  Object.keys(import.meta.glob("/public/assets/images/*.webp")).map((path)=>path.replace("/public","")),
);

describe("season one playable scope", () => {
  it("assigns every chapter a unique existing artwork", () => {
    const paths=chapters.map((chapter)=>chapter.artwork.src);
    expect(new Set(paths).size).toBe(chapters.length);
    expect(paths.sort()).toEqual([
      "/assets/images/chapter-holy-flame.webp",
      "/assets/images/chapter-iron-road.webp",
      "/assets/images/chapter-veiled-dawn.webp",
    ]);
    for(const chapter of chapters){
      expect(chapter.artwork.alt.length).toBeGreaterThan(0);
      expect(publicArtworkPaths.has(chapter.artwork.src)).toBe(true);
    }
  });

  it("contains exactly three chapters, twelve action nodes, and seven distinct battles", () => {
    expect(chapters).toHaveLength(3);
    expect(chapters.flatMap((chapter) => chapter.actionNodeIds)).toHaveLength(12);
    for (const chapter of chapters) {
      expect(chapter.actionNodeIds).toHaveLength(4);
      expect(chapter.actionNodeIds.every((id) => Boolean(chapter.nodes[id]))).toBe(true);
    }
    const battles = chapters.flatMap((chapter) =>
      Object.values(chapter.nodes).filter((node) => node.kind === "battle"),
    );
    expect(new Set(battles.map((node) => node.battleId))).toEqual(new Set([
      "holy-square-crisis",
      "odric-judgment",
      "border-machines",
      "grain-crossing",
      "iron-bulwark",
      "silent-march",
      "veiled-avatar",
    ]));
  });

  it("has one two-stage boss per chapter and every battle advances on victory or defeat", () => {
    expect(Object.keys(bossPhaseConfigs).sort()).toEqual([
      "iron-bulwark",
      "odric-judgment",
      "veiled-avatar",
    ]);
    for (const config of Object.values(bossPhaseConfigs)) expect(config.phases.length).toBeGreaterThanOrEqual(2);
    for (const chapter of chapters) {
      for (const node of Object.values(chapter.nodes)) {
        if (node.kind !== "battle") continue;
        expect(chapter.nodes[node.victoryNext]).toBeTruthy();
        expect(chapter.nodes[node.defeatNext]).toBeTruthy();
      }
    }
  });

  it("gives investigation, rest, negotiation, and recruitment deterministic state consequences", () => {
    const initial = createCampaignState();
    const investigated = commitCampaignAction(selectCampaignAction(initial, "investigate"));
    const rested = commitCampaignAction(selectCampaignAction(initial, "rest"));
    const negotiated = commitCampaignAction(selectCampaignAction(initial, "negotiate"));
    const meetingAwarded = awardBattleMeeting(initial, "season-scope-recruitment");
    const recruited = drawRecruitment(meetingAwarded, () => 0.51);
    expect(investigated.intelLevel).toBeGreaterThan(initial.intelLevel);
    expect(rested.cohesion).toBeGreaterThan(initial.cohesion);
    expect(negotiated.factionAttitudes.goddessState).toBeGreaterThan(initial.factionAttitudes.goddessState);
    expect(recruited.draw.ok).toBe(true);
    expect(initial.recruitmentMeetings).toBe(0);
    expect(meetingAwarded.recruitmentMeetings).toBe(1);
    expect(recruited.state.recruitmentMeetings).toBe(0);
  });
});
