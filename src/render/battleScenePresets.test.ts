import { describe, expect, it } from 'vitest';
import { battleScenePresetFor, mainlineBattleScenePresets, terrainForBattleScene } from './battleScenePresets';

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

  it('returns no scene contract for a side-campaign battle', () => {
    expect(battleScenePresetFor('holy-square-crisis')).toBeUndefined();
    expect(terrainForBattleScene('holy-square-crisis')).toBeUndefined();
  });
});
