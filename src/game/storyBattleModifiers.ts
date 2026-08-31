import {previewEnemyIntents,type BattleState} from "./battle";
import type {StoryFlag} from "../content/types";

export interface StoryBattleModifierResult{
  state:BattleState;
  notes:string[];
}

export function applyStoryBattleModifiers(
  state:BattleState,
  battleId:string,
  flags:Partial<Record<StoryFlag,boolean>>,
):StoryBattleModifierResult{
  let units=state.units;
  const notes:string[]=[];
  const mapUnits=(change:(unit:BattleState["units"][number])=>BattleState["units"][number])=>{units=units.map(change)};
  if((battleId==="holy-square-crisis"||battleId==="odric-judgment")&&(flags.heard_seraphina_archive||flags.recovered_ash_testimony)){
    mapUnits(unit=>unit.team==="enemy"?{...unit,faith:Math.max(1,unit.faith-1),maxFaith:Math.max(1,unit.maxFaith-1)}:unit);
    notes.push("档案与灰烬证言：敌方信念 -1");
  }
  if(battleId==="odric-judgment"&&flags.odric_spared_witness){
    mapUnits(unit=>unit.id==="boss-odric"?{...unit,faith:Math.max(1,unit.faith-1),maxFaith:Math.max(1,unit.maxFaith-1)}:unit);
    notes.push("奥德里克保护见证人：Boss 信念额外 -1");
  }
  if(["border-machines","grain-crossing","iron-bulwark"].includes(battleId)&&(flags.reina_disclosed_design||flags.camp_investigated_core)){
    mapUnits(unit=>unit.team==="enemy"?{...unit,moveRange:Math.max(1,unit.moveRange-1)}:unit);
    notes.push("工程盲区：敌方移动 -1");
  }
  if(["border-machines","grain-crossing"].includes(battleId)&&flags.cole_trained_militia){
    mapUnits(unit=>unit.team==="player"?{...unit,moveRange:unit.moveRange+1}:unit);
    notes.push("三圈防卫：我方移动 +1");
  }
  if(battleId==="iron-bulwark"&&flags.camp_restored_party){
    mapUnits(unit=>unit.team==="player"?{...unit,health:unit.health+1,maxHealth:unit.maxHealth+1}:unit);
    notes.push("战前休整：我方生命 +1");
  }
  if(battleId==="iron-bulwark"&&flags.camp_negotiated_drivers){
    mapUnits(unit=>unit.team==="enemy"?{...unit,faith:Math.max(1,unit.faith-1),maxFaith:Math.max(1,unit.maxFaith-1)}:unit);
    notes.push("驾驶员交涉：敌方信念 -1");
  }
  if((battleId==="silent-march"||battleId==="veiled-avatar")&&flags.agnes_restored_witnesses){
    mapUnits(unit=>unit.team==="player"?{...unit,health:unit.health+1,maxHealth:unit.maxHealth+1}:unit);
    notes.push("见证人休整：我方生命 +1");
  }
  if((battleId==="silent-march"||battleId==="veiled-avatar")&&flags.agnes_negotiated_passage){
    mapUnits(unit=>unit.team==="enemy"?{...unit,faith:Math.max(1,unit.faith-1),maxFaith:Math.max(1,unit.maxFaith-1)}:unit);
    notes.push("公开通行条件：敌方信念 -1");
  }
  const next={...state,units};
  return {state:{...next,enemyIntents:previewEnemyIntents(next)},notes};
}
