import {describe,expect,it,vi} from 'vitest';
import * as THREE from 'three';
import {createUnit} from '../game/battle';
import {
 CharacterVisualLoader,
 characterVisualManifest,
 deathAction,
 hitAction,
 visualKeyForUnit,
} from './characterVisuals';
import type {GLTF} from 'three/addons/loaders/GLTFLoader.js';

function animatedGltf(clipNames=['idle','move','attack','hit','death','skill']){
 const scene=new THREE.Group(),animated=new THREE.Object3D();
 animated.name='Animated';
 scene.add(animated);
 const animations=clipNames.map((name,index)=>new THREE.AnimationClip(name,1,[
  new THREE.VectorKeyframeTrack('Animated.position',[0,1],[0,0,0,index+1,0,0]),
 ]));
 return{scene,animations} as unknown as GLTF;
}

describe('character visual manifest',()=>{
 it('maps the six playable units and leaves the cultist mapping intact',()=>{
  expect(['u1','u2','u3','u4','u5','u6'].map(id=>visualKeyForUnit({id}))).toEqual(
   ['unflagged','seraphina','reina','odric','cole','agnes']);
 expect(visualKeyForUnit({id:'e3'})).toBe('cultist-melee');
 expect(visualKeyForUnit({id:'e1',visualKey:'shield-guard'})).toBe('shield-guard');
 expect(visualKeyForUnit({id:'e2',visualKey:'faith-acolyte'})).toBe('faith-acolyte');
});

 it('enables delivered img2threejs assets and keeps undelivered bosses disabled',()=>{
  expect(['u-arthur','u-hans','u-asnoka'].map(id=>visualKeyForUnit({id}))).toEqual(['arthur','hans','asnoka']);
  for(const key of ['arthur','hans','asnoka','shield-guard','scout','faith-acolyte','engineer','raider-rider','boss-white-knight','boss-night-judge','boss-lake-god-a','boss-lake-god-b'] as const){
   expect(characterVisualManifest[key].source).toBe('img2threejs');
   expect(characterVisualManifest[key].enabled).toBe(['arthur','hans','asnoka','shield-guard','scout','faith-acolyte','engineer','raider-rider','boss-white-knight','boss-night-judge','boss-lake-god-a','boss-lake-god-b'].includes(key));
   expect(characterVisualManifest[key].url).toContain(key.match(/^(shield-guard|scout|faith-acolyte|engineer|raider-rider)$/) ? '/assets/models/enemies/mainline/' : '/assets/models/mainline/');
  }
 });

 it('maps every staged boss to a distinct formal model with a fallback',()=>{
  const ids=['boss-odric','boss-iron-bulwark','boss-veiled-avatar'] as const;
  expect(ids.map(id=>visualKeyForUnit({id}))).toEqual(ids);
  const entries=ids.map(id=>characterVisualManifest[id]);
  expect(new Set(entries.map(entry=>entry.url)).size).toBe(3);
  for(const entry of entries){
   expect(entry.url).toContain('/assets/models/bosses/');
   expect(entry.fallbacks?.length).toBeGreaterThan(0);
   expect(entry.actionAliases?.idle?.length).toBeGreaterThan(0);
   expect(entry.actionAliases?.attack_health?.length).toBeGreaterThan(0);
   expect(entry.actionAliases?.attack_faith?.length).toBeGreaterThan(0);
   expect(entry.actionAliases?.hit_health?.length).toBeGreaterThan(0);
   expect(entry.actionAliases?.death_health?.length).toBeGreaterThan(0);
   expect(entry.actionAliases?.boss_phase_2?.length).toBeGreaterThan(0);
  }
 });

 it('keeps K3 as the first 3D tier for the original three heroes',()=>{
  expect(characterVisualManifest.unflagged.url).toContain('/k3/heroes/unflagged.glb');
  expect(characterVisualManifest.seraphina.url).toContain('/k3/heroes/seraphina.glb');
  expect(characterVisualManifest.reina.url).toContain('/k3/heroes/reina.glb');
  expect(characterVisualManifest.odric.fallbacks).toBeUndefined();
 });

 it('provides health and faith aliases for every formal hero',()=>{
  for(const key of ['unflagged','seraphina','reina','odric','cole','agnes'] as const){
   const aliases=characterVisualManifest[key].actionAliases;
   expect(aliases?.attack_health).toContain('attack');
   expect(aliases?.attack_faith).toContain('attack');
   expect(aliases?.attack_faith?.indexOf('skill')).toBeLessThan(aliases?.attack_faith?.indexOf('attack')??0);
   expect(aliases?.death_health).toContain('death');
   expect(aliases?.death_faith).toContain('death');
  }
 });

 it('drives a real AnimationMixer and prioritizes the profession skill for faith attacks',async()=>{
  vi.stubGlobal('dispatchEvent',()=>true);
  const loader=new CharacterVisualLoader(async()=>animatedGltf());
  const unit=createUnit({id:'u2',name:'塞拉菲娜',team:'player',position:{x:0,y:0}});
  const visual=loader.create(unit,new THREE.Group());
  visual.play('attack_faith',1000);
  await vi.waitFor(()=>expect(visual.usingFallback()).toBe(false));
  expect(visual.actionSnapshot()).toMatchObject({requestedAction:'attack_faith',clip:'skill',running:true,time:0});
  const animated=visual.root.getObjectByName('Animated')!;
  visual.update(.5);
  expect(visual.actionSnapshot()?.time).toBeCloseTo(.5);
  expect(animated.position.x).toBeCloseTo(3);
  visual.dispose();
  loader.dispose();
  vi.unstubAllGlobals();
 });

 it('falls back safely through an actual mixer when a requested clip is absent',async()=>{
  vi.stubGlobal('dispatchEvent',()=>true);
  const loader=new CharacterVisualLoader(async()=>animatedGltf(['idle']));
  const unit=createUnit({id:'u1',name:'无旗者',team:'player',position:{x:0,y:0}});
  const visual=loader.create(unit,new THREE.Group());
  await vi.waitFor(()=>expect(visual.usingFallback()).toBe(false));
  const playback=visual.play('death_faith',700);
  expect(playback).toMatchObject({requestedAction:'death_faith',clip:'idle',fallbackUsed:true,running:true});
  visual.update(.2);
  expect(visual.actionSnapshot()?.time).toBeGreaterThan(0);
  visual.dispose();
  loader.dispose();
  vi.unstubAllGlobals();
 });

 it('exposes a stable hit target and maps both defeat tracks',()=>{
  vi.stubGlobal('dispatchEvent',()=>true);
  const loader=new CharacterVisualLoader();
  const unit=createUnit({id:'unmapped-proxy-test',name:'代理测试',team:'enemy',position:{x:0,y:0}});
  const visual=loader.create(unit,new THREE.Group());
  expect(visual.hitTarget.parent).toBe(visual.root);
  expect(visual.hitTarget.userData.unitId).toBe(unit.id);
  expect(visual.hitTarget.geometry.boundingBox).toBeNull();
  visual.hitTarget.geometry.computeBoundingBox();
  const hitSize=visual.hitTarget.geometry.boundingBox!.getSize(new THREE.Vector3());
  expect(hitSize.x).toBeCloseTo(.72);
  expect(hitSize.y).toBeCloseTo(1.5);
  expect(hitSize.z).toBeCloseTo(.72);
  expect(hitAction('health')).toBe('hit_health');
  expect(hitAction('faith')).toBe('hit_faith');
  expect(deathAction('health')).toBe('death_health');
  expect(deathAction('faith')).toBe('death_faith');
  visual.dispose();
  loader.dispose();
  vi.unstubAllGlobals();
 });
});
