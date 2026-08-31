import type {CampaignCharacterId,CampaignState} from './campaign';

export interface RecruitmentCandidate{
  id:CampaignCharacterId;
  role:string;
  faction:string;
  fieldValue:string;
}

export const recruitmentPool:RecruitmentCandidate[]=[
  {id:'the_unflagged',role:'调查员',faction:'无旗使团',fieldValue:'证据交涉与位置交换'},
  {id:'seraphina',role:'调停者',faction:'女神国',fieldValue:'信念恢复与安抚'},
  {id:'reina',role:'工程师',faction:'卫道士军团',fieldValue:'拆除装置与地形控制'},
  {id:'odric',role:'守卫',faction:'女神国',fieldValue:'护卫相邻友军'},
  {id:'cole',role:'斥候',faction:'新卡瓦拉',fieldValue:'揭示意图与快速占点'},
  {id:'agnes',role:'见证人',faction:'黑色教团流亡者',fieldValue:'保全证据与削弱信念'},
];

export interface RecruitmentProbability extends RecruitmentCandidate{
  owned:boolean;
  probability:number;
}

export interface RecruitmentDrawResult{
  ok:boolean;
  reason?:'no-meetings';
  characterId?:CampaignCharacterId;
  result?:'new'|'duplicate';
  marksAdded?:number;
  pityTriggered?:boolean;
}

export function recruitmentProbabilities(state:CampaignState):RecruitmentProbability[]{
  const owned=new Set(state.roster.map(member=>member.id));
  const unowned=recruitmentPool.filter(candidate=>!owned.has(candidate.id));
  const forced=state.recruitmentPity>=2&&unowned.length>0;
  const eligible=forced?unowned:recruitmentPool;
  return recruitmentPool.map(candidate=>({
    ...candidate,
    owned:owned.has(candidate.id),
    probability:eligible.some(item=>item.id===candidate.id)?1/eligible.length:0,
  }));
}

export function drawRecruitment(state:CampaignState,random:()=>number=Math.random):{state:CampaignState;draw:RecruitmentDrawResult}{
  if(state.recruitmentMeetings<=0)return {state,draw:{ok:false,reason:'no-meetings'}};
  const probabilities=recruitmentProbabilities(state);
  const eligible=probabilities.filter(candidate=>candidate.probability>0);
  const roll=Math.min(.999999,Math.max(0,random()));
  let cursor=0,selected=eligible[eligible.length-1];
  for(const candidate of eligible){
    cursor+=candidate.probability;
    if(roll<cursor){selected=candidate;break}
  }
  const pityTriggered=state.recruitmentPity>=2&&!selected.owned;
  const result=selected.owned?'duplicate':'new';
  const marksAdded=result==='duplicate'?1:0;
  return {
    state:{
      ...state,
      recruitmentMeetings:state.recruitmentMeetings-1,
      recruitmentPity:result==='new'?0:Math.min(2,state.recruitmentPity+1),
      recruitmentMarks:state.recruitmentMarks+marksAdded,
      roster:result==='new'?[...state.roster,{id:selected.id,condition:'normal'}]:state.roster,
      lastRecruitment:{characterId:selected.id,result,marksAdded},
    },
    draw:{ok:true,characterId:selected.id,result,marksAdded,pityTriggered},
  };
}
