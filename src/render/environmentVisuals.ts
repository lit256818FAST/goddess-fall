import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import type { TerrainCell } from '../game/battle';

/** Static K3 environment assets are optional visual replacements, never rule dependencies. */
export type EnvironmentVisualKey='rail-straight'|'rail-curve'|'rail-buffer'|'valve-wheel'|'scrap-pile'|'mud-patch'|'anvil-block'|'ore-crate'|'iron-fence'|'coal-cart'|'altar'|'brazier'|'bush'|'column'|'dead-tree'|'gate-segment'|'grain-cart'|'road-sign'|'rubble'|'wall-broken'|'statue-base'|'corrupted-brazier'|'stone-steps'|'floating-shard-a'|'floating-shard-b'|'black-bush'|'black-tree'|'ritual-ring'|'veil-pillar'|'fallen-bell'|'veiled-anchor'|'veiled-pillar'|'veiled-rubble'|'veiled-brazier';
type EnvironmentVisualEntry={url:string;visualScale:number;floating?:boolean;hoverAmplitude?:number};
export const environmentVisualManifest:Readonly<Record<EnvironmentVisualKey,EnvironmentVisualEntry>>={
  'rail-straight':{url:'/assets/models/environment/anvil-frontier/rail-straight.glb',visualScale:.667},
  'rail-curve':{url:'/assets/models/environment/anvil-frontier/rail-curve.glb',visualScale:.667},
  'rail-buffer':{url:'/assets/models/environment/anvil-frontier/rail-buffer.glb',visualScale:.667},
  'valve-wheel':{url:'/assets/models/environment/anvil-frontier/valve-wheel.glb',visualScale:.667},
  'scrap-pile':{url:'/assets/models/environment/anvil-frontier/scrap-pile.glb',visualScale:.667},
  'mud-patch':{url:'/assets/models/environment/anvil-frontier/mud-patch.glb',visualScale:.667},
  'anvil-block':{url:'/assets/models/environment/anvil-frontier/anvil-block.glb',visualScale:.667},
  'ore-crate':{url:'/assets/models/environment/anvil-frontier/ore-crate.glb',visualScale:.667},
  'iron-fence':{url:'/assets/models/environment/anvil-frontier/iron-fence.glb',visualScale:.667},
  'coal-cart':{url:'/assets/models/environment/anvil-frontier/coal-cart.glb',visualScale:.667},
  altar:{url:'/assets/models/environment/shenghui/altar.glb',visualScale:.667},
  brazier:{url:'/assets/models/environment/shenghui/brazier.glb',visualScale:.667},
  bush:{url:'/assets/models/environment/shenghui/bush.glb',visualScale:.667},
  column:{url:'/assets/models/environment/shenghui/column.glb',visualScale:.667},
  'dead-tree':{url:'/assets/models/environment/shenghui/dead-tree.glb',visualScale:.667},
  'gate-segment':{url:'/assets/models/environment/shenghui/gate-segment.glb',visualScale:.667},
  'grain-cart':{url:'/assets/models/environment/shenghui/grain-cart.glb',visualScale:.667},
  'road-sign':{url:'/assets/models/environment/shenghui/road-sign.glb',visualScale:.667},
  rubble:{url:'/assets/models/environment/shenghui/rubble.glb',visualScale:.667},
  'wall-broken':{url:'/assets/models/environment/shenghui/wall-broken.glb',visualScale:.667},
  'statue-base':{url:'/assets/models/environment/veil-sanctum/statue-base.glb',visualScale:.667},
  'corrupted-brazier':{url:'/assets/models/environment/veil-sanctum/corrupted-brazier.glb',visualScale:.667},
  'stone-steps':{url:'/assets/models/environment/veil-sanctum/stone-steps.glb',visualScale:.667},
  'floating-shard-a':{url:'/assets/models/environment/veil-sanctum/floating-shard-a.glb',visualScale:.667,floating:true,hoverAmplitude:.05},
  'floating-shard-b':{url:'/assets/models/environment/veil-sanctum/floating-shard-b.glb',visualScale:.667,floating:true,hoverAmplitude:.05},
  'black-bush':{url:'/assets/models/environment/veil-sanctum/black-bush.glb',visualScale:.667},
  'black-tree':{url:'/assets/models/environment/veil-sanctum/black-tree.glb',visualScale:.667},
  'ritual-ring':{url:'/assets/models/environment/veil-sanctum/ritual-ring.glb',visualScale:.667},
  'veil-pillar':{url:'/assets/models/environment/veil-sanctum/veil-pillar.glb',visualScale:.667},
  'fallen-bell':{url:'/assets/models/environment/veil-sanctum/fallen-bell.glb',visualScale:.667},
  'veiled-anchor':{url:'/assets/models/environment/veil-sanctum/ritual-ring.glb',visualScale:.667},
  'veiled-pillar':{url:'/assets/models/environment/veil-sanctum/veil-pillar.glb',visualScale:.667},
  'veiled-rubble':{url:'/assets/models/environment/veil-sanctum/stone-steps.glb',visualScale:.667},
  'veiled-brazier':{url:'/assets/models/environment/veil-sanctum/corrupted-brazier.glb',visualScale:.667},
};

export function environmentVisualKeyForCell(cell:TerrainCell):EnvironmentVisualKey|undefined {
  return cell.assetId as EnvironmentVisualKey|undefined;
}

export class EnvironmentVisualLoader {
  private loader=new GLTFLoader();
  private cache=new Map<string,Promise<GLTF>>();
  private disposed=false;

  create(cell:TerrainCell,fallback:THREE.Group,tint?:number):THREE.Group {
    const root=new THREE.Group();root.name=`environment-${cell.assetId??cell.kind}`;root.add(fallback);
    const key=environmentVisualKeyForCell(cell),entry=key?environmentVisualManifest[key]:undefined;
    if(!entry)return root;
    this.load(entry.url).then(gltf=>{
      if(this.disposed)return;
      const model=gltf.scene.clone(true);model.name=`${key}-model`;model.scale.setScalar(entry.visualScale);const tintColor=tint===undefined?undefined:new THREE.Color(tint);model.traverse(child=>{if(child instanceof THREE.Mesh){child.castShadow=true;child.receiveShadow=true;child.userData.terrain=cell;const materials=(Array.isArray(child.material)?child.material:[child.material]).map(material=>material.clone());child.material=Array.isArray(child.material)?materials:materials[0];if(tintColor){materials.forEach(material=>{const colorMaterial=material as THREE.Material&{color?:THREE.Color};if(colorMaterial.color)colorMaterial.color.lerp(tintColor,.34)})}}});
      root.remove(fallback);root.add(model);root.userData.visualSourceUrl=entry.url;
      if(entry.floating){root.userData.floatAmplitude=entry.hoverAmplitude??.05;root.userData.floatPhase=(cell.position.x*1.7+cell.position.y*.9)%Math.PI;root.userData.floatBaseY=root.position.y;}
      dispatchEvent(new CustomEvent('goddess-environment-ready',{detail:{key,url:entry.url}}));
    }).catch(()=>{root.userData.visualSourceUrl='procedural';dispatchEvent(new CustomEvent('goddess-environment-ready',{detail:{key,url:'procedural'}}));});
    return root;
  }

  private load(url:string){const cached=this.cache.get(url);if(cached)return cached;const pending=this.loader.loadAsync(url).catch(error=>{this.cache.delete(url);throw error});this.cache.set(url,pending);return pending}
  dispose(){this.disposed=true;this.cache.clear()}
}
