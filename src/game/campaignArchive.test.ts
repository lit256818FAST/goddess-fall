import {describe,expect,it} from 'vitest';
import {createCampaignState,finishCampaignSeason,loadCampaign,saveCampaign,type CampaignStorage} from './campaign';
import {campaignProgress,parseCampaignArchive,serializeCampaignArchive} from './campaignArchive';
describe('campaign archive',()=>{
  it('exports the full state with its current checkpoint',()=>{const base=createCampaignState();const state={...base,week:2 as const,routeIndex:5,storyCheckpoint:{chapterId:'iron-road',currentNodeId:'iron-gate',completedNodeIds:['iron-letter'],storyState:base.storyState}};const archive=parseCampaignArchive(serializeCampaignArchive(state,new Date('2026-08-01T00:00:00Z')));expect(archive?.state).toEqual(state);expect(archive?.label).toContain('iron-gate');expect(campaignProgress(state)).toEqual({completed:5,total:12,chapter:2,node:'iron-gate'});});
  it('rejects malformed or incompatible archives',()=>{expect(parseCampaignArchive('{')).toBeUndefined();expect(parseCampaignArchive(JSON.stringify({format:'goddess-fall-archive',version:2,state:{}}))).toBeUndefined();});
  it('preserves a completed season through archive export and local-save restore',()=>{
    const completed=finishCampaignSeason({...createCampaignState(),week:3,routeIndex:11});
    const archive=parseCampaignArchive(serializeCampaignArchive(completed));
    const values=new Map<string,string>();const storage:CampaignStorage={getItem:key=>values.get(key)??null,setItem:(key,value)=>void values.set(key,value),removeItem:key=>void values.delete(key)};
    saveCampaign(archive!.state,storage);
    expect(loadCampaign(storage)).toMatchObject({week:3,routeIndex:11,seasonComplete:true});
  });
});
