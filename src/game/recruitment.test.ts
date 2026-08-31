import {describe,expect,it} from 'vitest';
import {awardBattleMeeting,createCampaignState} from './campaign';
import {drawRecruitment,recruitmentPool,recruitmentProbabilities} from './recruitment';

describe('recruitment pool',()=>{
  it('publishes the exact six-person base probabilities',()=>{
    const probabilities=recruitmentProbabilities(createCampaignState());
    expect(probabilities).toHaveLength(6);
    expect(probabilities.every(candidate=>candidate.probability===1/6)).toBe(true);
    expect(probabilities.filter(candidate=>candidate.owned)).toHaveLength(3);
  });

  it('keeps all six public role descriptions valid UTF-8 Chinese',()=>{
    expect(recruitmentPool.map(({id,role,faction,fieldValue})=>({id,role,faction,fieldValue}))).toEqual([
      {id:'the_unflagged',role:'调查员',faction:'无旗使团',fieldValue:'证据交涉与位置交换'},
      {id:'seraphina',role:'调停者',faction:'女神国',fieldValue:'信念恢复与安抚'},
      {id:'reina',role:'工程师',faction:'卫道士军团',fieldValue:'拆除装置与地形控制'},
      {id:'odric',role:'守卫',faction:'女神国',fieldValue:'护卫相邻友军'},
      {id:'cole',role:'斥候',faction:'新卡瓦拉',fieldValue:'揭示意图与快速占点'},
      {id:'agnes',role:'见证人',faction:'黑色教团流亡者',fieldValue:'保全证据与削弱信念'},
    ]);
    expect(JSON.stringify(recruitmentPool)).not.toMatch(/�|锟斤拷|绔嬪満|鎴樺満/);
  });

  it('uses one free meeting and adds an unowned character to the roster',()=>{
    const initial=awardBattleMeeting(createCampaignState(),'recruitment-new-test');
    const {state,draw}=drawRecruitment(initial,()=>.55);
    expect(draw.ok).toBe(true);
    expect(draw.result).toBe('new');
    expect(state.recruitmentMeetings).toBe(initial.recruitmentMeetings-1);
    expect(state.roster).toHaveLength(4);
    expect(state.recruitmentPity).toBe(0);
  });

  it('converts a duplicate into one archive mark',()=>{
    const initial=awardBattleMeeting(createCampaignState(),'recruitment-duplicate-test');
    const {state,draw}=drawRecruitment(initial,()=>0);
    expect(draw.result).toBe('duplicate');
    expect(draw.marksAdded).toBe(1);
    expect(state.recruitmentMarks).toBe(1);
    expect(state.recruitmentPity).toBe(1);
    expect(state.roster).toHaveLength(3);
  });

  it('guarantees an unowned character after two consecutive duplicates',()=>{
    const initial={
      ...awardBattleMeeting(createCampaignState(),'recruitment-pity-test'),
      recruitmentPity:2,
    };
    const probabilities=recruitmentProbabilities(initial);
    expect(probabilities.filter(candidate=>candidate.owned).every(candidate=>candidate.probability===0)).toBe(true);
    const {state,draw}=drawRecruitment(initial,()=>0);
    expect(draw.result).toBe('new');
    expect(draw.pityTriggered).toBe(true);
    expect(state.roster).toHaveLength(4);
    expect(state.recruitmentPity).toBe(0);
  });

  it('does not draw without a free meeting',()=>{
    const initial={...createCampaignState(),recruitmentMeetings:0};
    const result=drawRecruitment(initial,()=>0);
    expect(result.draw).toEqual({ok:false,reason:'no-meetings'});
    expect(result.state).toBe(initial);
  });
});
