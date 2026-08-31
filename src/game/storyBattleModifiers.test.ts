import {describe,expect,it} from "vitest";
import {createBattle} from "./battle";
import {applyStoryBattleModifiers} from "./storyBattleModifiers";

describe("story battle modifiers",()=>{
  it("turns investigation, rest and negotiation flags into different battle effects",()=>{
    const state=createBattle([
      {id:"p1",name:"P1",team:"player",position:{x:0,y:0},health:5,faith:5},
      {id:"p2",name:"P2",team:"player",position:{x:0,y:1},health:5,faith:5},
      {id:"p3",name:"P3",team:"player",position:{x:0,y:2},health:5,faith:5},
      {id:"boss-iron-bulwark",name:"B",team:"enemy",position:{x:2,y:0},health:10,faith:8,moveRange:3},
      {id:"e2",name:"E2",team:"enemy",position:{x:3,y:1},health:6,faith:6,moveRange:2},
      {id:"e3",name:"E3",team:"enemy",position:{x:3,y:2},health:6,faith:6,moveRange:1},
    ]);
    const investigated=applyStoryBattleModifiers(state,"iron-bulwark",{camp_investigated_core:true});
    const rested=applyStoryBattleModifiers(state,"iron-bulwark",{camp_restored_party:true});
    const negotiated=applyStoryBattleModifiers(state,"iron-bulwark",{camp_negotiated_drivers:true});
    expect(investigated.state.units.find(unit=>unit.id==="boss-iron-bulwark")?.moveRange).toBe(2);
    expect(rested.state.units.filter(unit=>unit.team==="player").every(unit=>unit.health===6)).toBe(true);
    expect(negotiated.state.units.find(unit=>unit.id==="boss-iron-bulwark")?.faith).toBe(7);
    expect(new Set([...investigated.notes,...rested.notes,...negotiated.notes]).size).toBe(3);
  });
});
