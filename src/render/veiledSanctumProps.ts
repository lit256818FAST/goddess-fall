import * as THREE from 'three';
import type { TerrainCell } from '../game/battle';

/**
 * Chapter-three procedural environment kit. It deliberately uses simple, reusable
 * primitives: the gameplay collider remains the grid cell while this only supplies
 * a readable silhouette at 80–160 px and costs no network request.
 */
export type VeiledSanctumProp='veiled-anchor'|'veiled-pillar'|'veiled-thorn'|'veiled-rubble'|'veiled-brazier';

export function appendVeiledSanctumDetails(root:THREE.Group,cell:TerrainCell):boolean {
  const id=cell.assetId as VeiledSanctumProp|undefined;
  if(!id?.startsWith('veiled-'))return false;
  const stone=new THREE.MeshStandardMaterial({color:0x283039,roughness:.94,flatShading:true});
  const charcoal=new THREE.MeshStandardMaterial({color:0x11161d,roughness:.98,flatShading:true});
  const oldGold=new THREE.MeshStandardMaterial({color:0x8e7645,roughness:.52,metalness:.52,flatShading:true});
  const ember=new THREE.MeshBasicMaterial({color:0xe39a56,transparent:true,opacity:.86});
  const add=(mesh:THREE.Mesh,name:string,x=0,y=0,z=0)=>{mesh.name=name;mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;};
  if(id==='veiled-anchor'){
    add(new THREE.Mesh(new THREE.CylinderGeometry(.18,.29,.72,5),charcoal),'CurtainAnchorCore',0,.39,0);
    add(new THREE.Mesh(new THREE.ConeGeometry(.31,.5,5),stone),'CurtainAnchorShard',0,.95,0).rotation.z=.1;
    const ring=add(new THREE.Mesh(new THREE.TorusGeometry(.28,.035,5,8),oldGold),'CurtainAnchorSeal',0,.7,0);ring.rotation.x=Math.PI/2;
    root.userData.effectAnchor='FxAnchor';
  }else if(id==='veiled-pillar'){
    add(new THREE.Mesh(new THREE.CylinderGeometry(.17,.22,.86,6),stone),'BrokenPillar',0,.42,0);
    add(new THREE.Mesh(new THREE.DodecahedronGeometry(.14,0),charcoal),'PillarFragment',-.19,.1,.1);
    add(new THREE.Mesh(new THREE.DodecahedronGeometry(.1,0),stone),'PillarFragmentSmall',.18,.07,-.08);
  }else if(id==='veiled-thorn'){
    for(const [x,z,h] of [[-.17,.03,.44],[.13,.08,.53],[.02,-.16,.36]] as const){const thorn=add(new THREE.Mesh(new THREE.ConeGeometry(.1,h,5),charcoal),'VeiledThorn',x,h/2,z);thorn.rotation.z=x*.45;}
  }else if(id==='veiled-rubble'){
    for(const [x,z,s] of [[-.18,.06,.19],[.04,.12,.25],[.2,-.1,.14],[-.03,-.18,.12]] as const)add(new THREE.Mesh(new THREE.DodecahedronGeometry(s,0),stone),'SanctumRubble',x,s*.45,z);
  }else if(id==='veiled-brazier'){
    add(new THREE.Mesh(new THREE.CylinderGeometry(.2,.25,.28,6),charcoal),'CinderBrazier',0,.16,0);
    add(new THREE.Mesh(new THREE.ConeGeometry(.12,.34,5),ember),'CinderFlame',0,.43,0);
    root.userData.effectAnchor='FxFlame';
  }
  root.userData.proceduralEnvironment=true;
  return true;
}
