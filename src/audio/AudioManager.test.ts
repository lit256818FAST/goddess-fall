import { describe, expect, it } from "vitest";
import {
  AUDIO_UI_TEXT,
  configureLazyTrack,
  SCENE_AUDIO,
  SCENE_TRACKS,
  MUSIC_TRACKS,
  sceneTrackFor,
  sceneAudioDefinition,
  volumeFromPercent,
} from "./AudioManager";

describe("audio preferences", () => {
  it("captures and clamps a range value without retaining a DOM event", () => {
    expect(volumeFromPercent("63")).toBe(.63);
    expect(volumeFromPercent("-20")).toBe(0);
    expect(volumeFromPercent("140")).toBe(1);
  });

  it("keeps all public audio labels readable Chinese without mojibake", () => {
    const labels=Object.values(AUDIO_UI_TEXT).join("");
    expect(labels).toContain("声音设置");
    expect(labels).toContain("主音量");
    expect(labels).not.toMatch(/�|锟斤拷|绔嬪満|鎴樺満|澹伴煶|闊抽噺/);
  });

  it("declares selected lazy tracks while preserving a distinct source per audible scene", () => {
    expect(new Set(Object.values(SCENE_TRACKS).map(track=>track?.src)).size).toBeGreaterThanOrEqual(6);
    expect(Object.values(MUSIC_TRACKS).every(track=>track.license==="user-provided")).toBe(true);
    const audibleScenes=["home","story","battle","boss","victory","defeat"] as const;
    expect(new Set(audibleScenes.map(scene=>SCENE_AUDIO[scene].source)).size).toBe(audibleScenes.length);
    expect(sceneAudioDefinition("story")).toEqual({
      source:MUSIC_TRACKS.lanternMapAlt.src,
      mode:"track",
      family:"story",
    });
    expect(sceneTrackFor("battle",{campaignId:"unflagged-side"})).toBe(MUSIC_TRACKS.abyssGatefallSide);
    expect(sceneTrackFor("boss",{bossPhase:2})).toBe(MUSIC_TRACKS.abyssGatefall);
    expect(sceneAudioDefinition("victory").family).toBe("result");
    expect(sceneAudioDefinition("defeat").family).toBe("result");
    expect(sceneAudioDefinition("victory").source).not.toBe(sceneAudioDefinition("defeat").source);
  });

  it("configures a requested track for no eager preload and looping playback", () => {
    const audio:Pick<HTMLAudioElement,"preload"|"loop"|"src">={preload:"auto",loop:false,src:""};
    configureLazyTrack(audio,"/assets/audio/test.ogg");
    expect(audio).toEqual({
      preload:"none",
      loop:true,
      src:"/assets/audio/test.ogg",
    });
  });
});
