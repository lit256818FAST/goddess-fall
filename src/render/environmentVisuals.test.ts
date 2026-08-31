import {describe,expect,it} from 'vitest';
import {environmentVisualKeyForCell,environmentVisualManifest} from './environmentVisuals';

describe('K3 Anvil Frontier environment manifest',()=>{
  it('keeps optional static assets separate from tactical terrain rules',()=>{
    expect(Object.keys(environmentVisualManifest)).toHaveLength(34);
    expect(environmentVisualKeyForCell({position:{x:3,y:3},kind:'mechanism',blocksMovement:true,interactable:true,assetId:'valve-wheel'})).toBe('valve-wheel');
    expect(environmentVisualKeyForCell({position:{x:2,y:4},kind:'mud',blocksMovement:false,interactable:false,assetId:'mud-patch'})).toBe('mud-patch');
    expect(environmentVisualKeyForCell({position:{x:0,y:0},kind:'brush',blocksMovement:false,interactable:false})).toBeUndefined();
  });

  it('uses local public URLs so a load failure can fall back without changing the battle state',()=>{
    for(const entry of Object.values(environmentVisualManifest))expect(entry.url).toMatch(/^\/assets\/models\/environment\/(anvil-frontier|shenghui|veil-sanctum)\/.*\.glb$/);
  });
});
