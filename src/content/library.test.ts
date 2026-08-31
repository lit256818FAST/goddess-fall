import { describe, expect, it } from "vitest";
import { libraryEntries, libraryEntriesForWeek, libraryLockedCount, supplementalLibraryEntriesForWeek } from "./library";

describe("library unlocks", () => {
  it("sorts source-derived records into time, region, faction, and character axes", () => {
    expect(new Set(libraryEntries.map((entry) => entry.axis))).toEqual(new Set(["时间", "区域", "势力", "人物"]));
  });

  it("reveals more setting records as chapters advance", () => {
    const chapterOne = libraryEntriesForWeek(1);
    const chapterTwo = libraryEntriesForWeek(2);
    const chapterThree = libraryEntriesForWeek(3);
    expect(chapterOne.length).toBeGreaterThan(0);
    expect(chapterTwo.length).toBeGreaterThan(chapterOne.length);
    expect(chapterThree).toHaveLength(libraryEntries.length);
    expect(libraryLockedCount(1)).toBe(libraryEntries.length - chapterOne.length);
    expect(libraryLockedCount(3)).toBe(0);
  });

  it("unlocks plot-linked evidence and mission notes with their chapter", () => {
    const chapterOne = supplementalLibraryEntriesForWeek(1).map((entry) => entry.id);
    const chapterTwo = supplementalLibraryEntriesForWeek(2).map((entry) => entry.id);
    const chapterThree = supplementalLibraryEntriesForWeek(3).map((entry) => entry.id);
    expect(chapterOne).toContain("evidence-cold-ash");
    expect(chapterOne).toContain("mission-holy-square");
    expect(chapterTwo).toContain("mission-iron-road");
    expect(chapterThree).toContain("chapter-three-evidence-chains");
    expect(chapterThree.length).toBeGreaterThan(chapterTwo.length);
  });
});
