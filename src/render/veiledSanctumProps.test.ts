import {describe,expect,it} from 'vitest';
import * as THREE from 'three';
import {appendVeiledSanctumDetails} from './veiledSanctumProps';

describe('veiled sanctum procedural environment kit',()=>{
  it('creates recognizable, clickable low-poly detail only for the chapter-three prop ids',()=>{
    const root=new THREE.Group();
    expect(appendVeiledSanctumDetails(root,{position:{x:3,y:3},kind:'brush',blocksMovement:false,interactable:true,assetId:'veiled-anchor'})).toBe(true);
    expect(root.getObjectByName('CurtainAnchorCore')).toBeTruthy();
    expect(root.userData.effectAnchor).toBe('FxAnchor');
    expect(appendVeiledSanctumDetails(new THREE.Group(),{position:{x:0,y:0},kind:'brush',blocksMovement:false,interactable:false})).toBe(false);
  });
});
