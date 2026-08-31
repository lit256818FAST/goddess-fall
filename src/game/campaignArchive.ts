import {isCampaignState,type CampaignState} from './campaign';

export interface CampaignArchive {
  format:'goddess-fall-archive'; version:1; exportedAt:string; label:string; state:CampaignState;
}

export function campaignProgress(state:Pick<CampaignState,'routeIndex'|'week'|'storyCheckpoint'|'campaignId'>){
  const mainline=state.campaignId==='arthur-main';
  return {completed:Math.min(mainline?14:12,Math.max(0,state.routeIndex)),total:mainline?14:12,chapter:Math.min(mainline?7:3,Math.max(1,state.week)),node:state.storyCheckpoint?.currentNodeId??'行动桌'};
}
export function archiveLabel(state:CampaignState){const p=campaignProgress(state);return `第 ${p.chapter} 章 · 节点 ${p.completed+1}/${p.total} · ${p.node}`}
export function serializeCampaignArchive(state:CampaignState,now=new Date()):string{
  return JSON.stringify({format:'goddess-fall-archive',version:1,exportedAt:now.toISOString(),label:archiveLabel(state),state:structuredClone(state)} satisfies CampaignArchive,null,2);
}
export function parseCampaignArchive(raw:string):CampaignArchive|undefined{
  try{const value:unknown=JSON.parse(raw);if(!value||typeof value!=='object')return;const a=value as Partial<CampaignArchive>;return a.format==='goddess-fall-archive'&&a.version===1&&typeof a.exportedAt==='string'&&typeof a.label==='string'&&isCampaignState(a.state)?a as CampaignArchive:undefined}catch{return undefined}
}
