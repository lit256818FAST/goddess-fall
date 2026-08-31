import { describe, expect, it } from "vitest";
import { holyFlameChapter } from "./chapterHolyFlame";
import { ironRoadChapter } from "./chapterIronRoad";
import { ChapterRegistry } from "./chapterRegistry";
import { chapterCatalog } from "./chapterCatalog";

describe("chapter registry", () => {
  it("resolves different chapters from campaign progress", () => {
    const registry = new ChapterRegistry()
      .register({ id: holyFlameChapter.id, act: 1, weekFrom: 1, weekTo: 1, chapter: holyFlameChapter })
      .register({ id: ironRoadChapter.id, act: 1, weekFrom: 2, weekTo: 99, chapter: ironRoadChapter });
    expect(registry.forProgress(1, 1).id).toBe("holy-flame");
    expect(registry.forProgress(1, 2).id).toBe("iron-road");
  });

  it("rejects duplicate registrations", () => {
    const registry = new ChapterRegistry()
      .register({ id: holyFlameChapter.id, act: 1, weekFrom: 1, weekTo: 1, chapter: holyFlameChapter });
    expect(() => registry.register({ id: holyFlameChapter.id, act: 1, weekFrom: 1, weekTo: 1, chapter: holyFlameChapter })).toThrow();
  });

  it("loads and caches a chapter behind the lazy boundary", async () => {
    let calls = 0;
    const registry = new ChapterRegistry().register({
      id: "lazy-finale",
      act: 1,
      weekFrom: 3,
      weekTo: 3,
      load: async () => {
        calls += 1;
        return ironRoadChapter;
      },
    });
    expect(() => registry.forProgress(1, 3)).toThrow("not loaded");
    expect((await registry.loadForProgress(1, 3)).id).toBe("iron-road");
    expect((await registry.loadForProgress(1, 3)).id).toBe("iron-road");
    expect(calls).toBe(1);
  });

  it("bundles all three campaign chapters for the portable single-file build", async () => {
    expect(chapterCatalog).toHaveLength(3);
    expect(chapterCatalog.every((registration) => Boolean(registration.chapter) && !registration.load)).toBe(true);

    const registry = chapterCatalog.reduce(
      (result, registration) => result.register(registration),
      new ChapterRegistry(),
    );
    expect(registry.forProgress(1, 1)).toMatchObject({ id: "holy-flame", startNodeId: "opening" });
    expect(registry.forProgress(1, 2)).toMatchObject({ id: "iron-road", startNodeId: "iron-letter" });
    expect(registry.forProgress(1, 3)).toMatchObject({ id: "veiled-dawn", startNodeId: "mist-guests" });
  });
});
