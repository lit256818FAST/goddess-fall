import { describe, expect, it } from 'vitest';
import { battleBackgroundFor, battleScenePresetFor, mainlineBattleScenePresets, terrainForBattleScene } from './battleScenePresets';

describe('mainline battle scene presets', () => {
  it('provides the first four mainline vertical-slice scenes', () => {
    expect(Object.keys(mainlineBattleScenePresets).sort()).toEqual([
      'arthur-border-blockade',
      'arthur-execution-escape',
      'arthur-lowland-ambush',
      'lake-dual-god',
    ]);
  });

  it('keeps objective cells aligned with interactive terrain', () => {
    for (const preset of Object.values(mainlineBattleScenePresets)) {
      const terrain = terrainForBattleScene(preset.id)!;
      expect((preset.objectiveCells ?? []).length).toBeGreaterThan(0);
      expect((preset.objectiveCells ?? []).some((objective) =>
        terrain.some((cell) => cell.position.x === objective.x && cell.position.y === objective.y && cell.interactable),
      )).toBe(true);
      expect(terrain.every((cell) => cell.active === true)).toBe(true);
      expect(terrain.every((cell) => Boolean(cell.assetId))).toBe(true);
    }
  });

  it('assigns a battle background to every mainline battle id', () => {
    const ids = [
      'arthur-execution-escape', 'arthur-border-blockade', 'arthur-cathedral-evacuation', 'arthur-council-front',
      'arthur-lowland-ambush', 'arthur-army-trials', 'white-knight-charge', 'arthur-four-country-war',
      'arthur-dragon-oath', 'arthur-steppe-supply', 'night-judge', 'lake-dual-god',
    ];
    expect(ids.every(id => battleBackgroundFor(id)?.startsWith('/assets/images/'))).toBe(true);
  });

  it('returns no scene contract for a side-campaign battle', () => {
    expect(battleScenePresetFor('holy-square-crisis')).toBeUndefined();
    expect(terrainForBattleScene('holy-square-crisis')).toBeUndefined();
  });

  it('keeps legacy side-campaign battle boards on authored scene art', () => {
    for (const battleId of ['holy-square-crisis', 'odric-judgment', 'border-machines', 'grain-crossing', 'iron-bulwark', 'silent-march', 'veiled-avatar']) {
      expect(battleBackgroundFor(battleId)).toMatch(/^\/assets\/images\/.+\.webp$/);
    }
  });
});
