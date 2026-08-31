import type { ChapterRegistration } from "./chapterRegistry";
import { holyFlameChapter } from "./chapterHolyFlame";
import { ironRoadChapter } from "./chapterIronRoad";
import { veiledDawnChapter } from "./chapterVeiledDawn";

/**
 * Chapter routing metadata. Chapters are bundled into the main entry so the
 * portable single-file build also works when opened directly from file://.
 */
export const chapterCatalog: readonly ChapterRegistration[] = [
  {
    id: "holy-flame",
    act: 1,
    weekFrom: 1,
    weekTo: 1,
    chapter: holyFlameChapter,
  },
  {
    id: "iron-road",
    act: 1,
    weekFrom: 2,
    weekTo: 2,
    chapter: ironRoadChapter,
  },
  {
    id: "veiled-dawn",
    act: 1,
    weekFrom: 3,
    weekTo: 99,
    chapter: veiledDawnChapter,
  },
];
