import './styles.css';
import './campaign.css';
import './model-gallery.css';
import { campaignWeekOne } from './content/campaignWeekOne';
import { campaignWeekTwo } from './content/campaignWeekTwo';
import { campaignWeekThree } from './content/campaignWeekThree';
import { mainlineChapterByWeek } from './content/mainlineChapters';
import type { MilestoneAWeekContent } from './content/campaignWeekOne';
import { chapterCatalog } from './content/chapterCatalog';
import { ChapterRegistry } from './content/chapterRegistry';
import { libraryEntriesForWeek, supplementalLibraryEntriesForWeek, allLibraryLockedCount, mainlineLibraryEntriesForWeek, type LibraryAxis } from './content/library';
import {
  initialStoryState,
  type DialogueNode,
  type StoryChoice,
  type StoryCondition,
  type StoryEffect,
  type StoryNode,
  type StoryState,
} from './content/types';
import { characters, factions } from './content/world';
import {
  attackUnit,
  createBattle,
  distance,
  endPlayerTurn,
  interactTerrain,
  isActive,
  moveUnit,
  passiveLabel,
  terrainInteractionLabel,
  terrainSpecialtyLabel,
  useSkill,
  undoMove,
  type BattleState,
  type SkillId,
  type TerrainCell,
  type Unit,
  type UnitTemplate,
} from './game/battle';
import {
  advanceCampaignWeek,
  awardBattleMeeting,
  clearStoryCheckpoint,
  commitCampaignAction,
  completeCampaignBattle,
  recordMainlineBattleProgress,
  createCampaignState,
  createMainlineCampaignState,
  finishCampaignSeason,
  loadCampaign,
  loadCampaignById,
  navigateCampaign,
  resolveStoryCheckpoint,
  saveCampaign,
  selectCampaignAction,
  setStoryCheckpoint,
  setCampaignLineup,
  buyCampaignPotion,
  buyCampaignRations,
  buyCampaignWeapon,
  equipCampaignWeapon,
  campaignShop,
  consumeBattleRations,
  type CampaignAction,
  type CampaignCharacterId,
  type CampaignState,
  type CampaignView,
  type CampaignWeaponId,
  type CampaignId,
  campaignSaveKey,
} from './game/campaign';
import {applyCampaignBattleModifiers} from './game/campaignBattleModifiers';
import {advanceBossPhase,createBossRuntime,currentBossPhase,type BossPhaseRuntime} from './game/bossPhases';
import {applyOpeningMissionModifiers,createBattleObjectiveRuntime,evaluateBattleObjective,type BattleObjectiveRuntime} from './game/battleObjectives';
import {characterBattleProfiles,mainlineCharacterBattleProfiles} from './game/rosterBalance';
import {drawRecruitment,recruitmentPool,recruitmentProbabilities} from './game/recruitment';
import {mainlineSkillAvailable,mainlineSkills,learnMainlineSkill} from './game/mainlineSkills';
import {mainlineMissionsForChapter,selectMainlineMission} from './game/mainlineMissions';
import {applyStoryBattleModifiers} from './game/storyBattleModifiers';
import {campaignProgress,parseCampaignArchive,serializeCampaignArchive} from './game/campaignArchive';
import {Battlefield,type BattleAnimation,type BattleInput} from './render/battlefield';
import {battleScenePresetFor,paletteForBattleId,terrainForBattleScene} from './render/battleScenePresets';
import {audioManager,type MusicTrackId} from './audio/AudioManager';
import {modelGalleryAssets,modelGallerySummary} from './render/modelGallery';

const app=document.querySelector<HTMLElement>('#app');
if(!app)throw new Error('Missing #app');
if('scrollRestoration' in history)history.scrollRestoration='manual';
audioManager.mountControls(document.body);
let initialBootVisible=Boolean(app.querySelector('.boot'));

type TutorialStep='intro'|'select-unit'|'move-three'|'read-vitals'|'read-intent'|'end-phase'|'observe-enemy'|'complete'|'off';
const tutorialKey='goddess-fall:tutorial:first-battle:v1';
const campaignGuideKey='goddess-fall:tutorial:campaign-flow:v2';
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
let battlefield:Battlefield|undefined;
let modelGalleryCleanup:(()=>void)|undefined;
let storyState:StoryState=structuredClone(initialStoryState);
const chapterRegistry=chapterCatalog.reduce(
  (registry,registration)=>registry.register(registration),
  new ChapterRegistry(),
);
let currentNodeId='';
let battleState:BattleState|undefined;
let battleNodeId='';
let battleEndingScheduled=false;
let bossChallengeMode=false;
let bossRuntime:BossPhaseRuntime|undefined;
let objectiveRuntime:BattleObjectiveRuntime|undefined;
let storyBattleNotes:string[]=[];
let fieldDispatchUsed=false;
let dangerWarningRound=0;
let selectedId:string|undefined;
let attackMode:'health'|'faith'|undefined;
let undoSnapshot:{unitId:string;from:{x:number;y:number};to:{x:number;y:number};round:number}|undefined;
let tutorial:TutorialStep='off';
let tutorialForced=false;
let tutorialRound=1;
const activeCampaignKey='goddess-fall:active-campaign';
const initialCampaignId:CampaignId=localStorage.getItem(activeCampaignKey)==='arthur-main'?'arthur-main':'unflagged-side';
let campaignState:CampaignState=loadCampaignById(localStorage,initialCampaignId);
let lineupDraft:CampaignCharacterId[]=[...campaignState.lineup];
const battleLog:{text:string;cell?:{x:number;y:number}}[]=[];
const qaWindow=globalThis as typeof globalThis&{__goddessBattlefield?:Battlefield};

const set=(html:string)=>{
  battlefield?.dispose();battlefield=undefined;modelGalleryCleanup?.();modelGalleryCleanup=undefined;delete qaWindow.__goddessBattlefield;
  // A scroll hint belongs to the view that created it. Remove it before
  // swapping screens so it cannot cover the next page's nav or controls.
  document.querySelectorAll<HTMLElement>('.campaign-scroll-hint').forEach((hint)=>hint.remove());
  app.innerHTML=html;scrollTo(0,0);requestAnimationFrame(()=>scrollTo(0,0));
  if(html.includes('class="battle"'))audioManager.setScene(bossRuntime?'boss':'battle',{track:!bossRuntime&&campaignState.campaignId==='unflagged-side'?'abyssGatefallSide':undefined,campaignId:campaignState.campaignId,bossPhase:bossRuntime?(currentBossPhase(bossRuntime)?.phase===2?2:1):undefined});
  else if(html.includes('class="screen story"'))audioManager.setScene('story');
  else if(html.includes('campaign-home-grid')||html.includes('battle-overview')||html.includes('roster-page')||html.includes('preparation-page')||html.includes('model-gallery-page')||html.includes('shop-page'))audioManager.setScene('home');
  else if(html.includes('library-page'))audioManager.setScene('library');
  else if(html.includes('archive-page'))audioManager.setScene('archive');
  else if(html.includes('campaign-shell'))audioManager.setScene('story');
  app.querySelector<HTMLButtonElement>('[data-open-library]')?.addEventListener('click',()=>renderLibrary());
  app.querySelector<HTMLButtonElement>('[data-open-archive]')?.addEventListener('click',()=>renderArchive());
  app.querySelector<HTMLButtonElement>('[data-open-models]')?.addEventListener('click',()=>renderModelGallery());
  app.querySelector<HTMLButtonElement>('[data-go-home]')?.addEventListener('click',()=>renderCampaignHome());
  const returnControl=app.querySelector<HTMLButtonElement>('[data-return-title]');
  if(returnControl?.closest('.shop-page')){
    returnControl.textContent='返回主页';
    returnControl.addEventListener('click',()=>renderCampaignHome());
  }else{
    returnControl?.addEventListener('click',()=>dispatchEvent(new CustomEvent('goddess:return-title')));
  }
  app.querySelectorAll<HTMLButtonElement>('[data-flow-step]').forEach(button=>button.addEventListener('click',()=>{
    const step=button.dataset.flowStep as FlowStep|undefined;
    if(step==='models')renderModelGallery();
    else if(step==='battle-route')renderBattleOverview();
    else if(step==='roster')renderRosterSelection();
    else if(step==='preparation')renderPreparation();
    else if(step==='report')renderCampaignReport();
    else if(step==='growth')renderGrowth();
    else if(step==='shop')renderShop();
  }));
};
const escapeHtml=(value:string)=>value.replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]!));
const unitById=(id?:string)=>battleState?.units.find(unit=>unit.id===id);
const activePlayers=()=>battleState?.units.filter(unit=>unit.team==='player'&&isActive(unit)&&!unit.acted).length??0;

type FlowStep='home'|'battle-route'|'roster'|'preparation'|'launch'|'report'|'growth'|'recruitment'|'shop'|'library'|'archive'|'models';
const flowSteps:Array<{id:FlowStep;label:string}>=[
  {id:'home',label:'主页'},
  {id:'battle-route',label:'战斗'},
  {id:'roster',label:'阵容'},
  {id:'preparation',label:'战前准备'},
  {id:'launch',label:'开战'},
  {id:'report',label:'战后报告'},
  {id:'growth',label:'成长'},
  {id:'library',label:'藏书馆'},
  {id:'archive',label:'档案'},
];
const portraitByCharacter:Partial<Record<CampaignCharacterId,string>>={
  arthur:'/assets/images/dialogue/arthur.webp',
  hans:'/assets/images/dialogue/hans.webp',
  asnoka:'/assets/images/dialogue/asnoka.webp',
  the_unflagged:'/assets/images/portrait-unflagged.webp',
  seraphina:'/assets/images/portrait-seraphina.webp',
  reina:'/assets/images/portrait-reina.webp',
  odric:'/assets/images/portrait-odric.webp',
  cole:'/assets/images/portrait-cole.webp',
  agnes:'/assets/images/portrait-agnes.webp',
};
type DialoguePortraitState='idle'|'attack'|'hit';
type DialoguePortraitSet=Record<DialoguePortraitState,string>;
const dialoguePortraitByCharacter:Partial<Record<keyof typeof characters,DialoguePortraitSet>>={
  arthur:{idle:'/assets/images/dialogue/arthur.webp',attack:'/assets/images/dialogue/states/arthur-attack.webp',hit:'/assets/images/dialogue/states/arthur-hit.webp'},
  hans:{idle:'/assets/images/dialogue/hans.webp',attack:'/assets/images/dialogue/states/hans-attack.webp',hit:'/assets/images/dialogue/states/hans-hit.webp'},
  asnoka:{idle:'/assets/images/dialogue/asnoka.webp',attack:'/assets/images/dialogue/states/asnoka-attack.webp',hit:'/assets/images/dialogue/states/asnoka-hit.webp'},
  old_mara:{idle:'/assets/images/dialogue/old-mara.webp',attack:'/assets/images/dialogue/states/old-mara-attack.webp',hit:'/assets/images/dialogue/states/old-mara-hit.webp'},
  masked_saboteur:{idle:'/assets/images/dialogue/gray-eyed.webp',attack:'/assets/images/dialogue/states/gray-eyed-attack.webp',hit:'/assets/images/dialogue/states/gray-eyed-hit.webp'},
  white_knight_captain:{idle:'/assets/images/dialogue/white-knight-captain.webp',attack:'/assets/images/dialogue/states/white-knight-captain-attack.webp',hit:'/assets/images/dialogue/states/white-knight-captain-hit.webp'},
  night_judge:{idle:'/assets/images/dialogue/night-judge-final.webp',attack:'/assets/images/dialogue/states/night-judge-attack.webp',hit:'/assets/images/dialogue/states/night-judge-hit.webp'},
  lake_dual_god:{idle:'/assets/images/dialogue/lake-dual-god.webp',attack:'/assets/images/dialogue/states/lake-dual-god-attack.webp',hit:'/assets/images/dialogue/states/lake-dual-god-hit.webp'},
  the_unflagged:{idle:'/assets/images/dialogue/unflagged.webp',attack:'/assets/images/dialogue/states/unflagged-attack.webp',hit:'/assets/images/dialogue/states/unflagged-hit.webp'},
  seraphina:{idle:'/assets/images/dialogue/seraphina.webp',attack:'/assets/images/dialogue/states/seraphina-attack.webp',hit:'/assets/images/dialogue/states/seraphina-hit.webp'},
  reina:{idle:'/assets/images/dialogue/reina-final2.webp',attack:'/assets/images/dialogue/states/reina-attack.webp',hit:'/assets/images/dialogue/states/reina-hit.webp'},
  odric:{idle:'/assets/images/dialogue/odric.webp',attack:'/assets/images/dialogue/states/odric-attack.webp',hit:'/assets/images/dialogue/states/odric-hit.webp'},
  cole:{idle:'/assets/images/dialogue/cole.webp',attack:'/assets/images/dialogue/states/cole-attack.webp',hit:'/assets/images/dialogue/states/cole-hit.webp'},
  agnes:{idle:'/assets/images/dialogue/agnes.webp',attack:'/assets/images/dialogue/states/agnes-attack.webp',hit:'/assets/images/dialogue/states/agnes-hit.webp'},
};
const legacyDialoguePortraitByCharacter:Partial<Record<keyof typeof characters,string>>={
  arthur:'/assets/images/dialogue/arthur.webp',hans:'/assets/images/dialogue/hans.webp',asnoka:'/assets/images/dialogue/asnoka.webp',old_mara:'/assets/images/dialogue/old-mara.webp',masked_saboteur:'/assets/images/dialogue/gray-eyed.webp',white_knight_captain:'/assets/images/dialogue/white-knight-captain.webp',night_judge:'/assets/images/dialogue/night-judge-final.webp',lake_dual_god:'/assets/images/dialogue/lake-dual-god.webp',the_unflagged:'/assets/images/dialogue/unflagged.webp',seraphina:'/assets/images/dialogue/seraphina.webp',reina:'/assets/images/dialogue/reina-final2.webp',odric:'/assets/images/dialogue/odric.webp',cole:'/assets/images/dialogue/cole.webp',agnes:'/assets/images/dialogue/agnes.webp',
};
const dialoguePortraitForState=(id:keyof typeof characters,state:DialoguePortraitState='idle')=>dialoguePortraitByCharacter[id]?.[state]??legacyDialoguePortraitByCharacter[id];
const conditionLabel={normal:'状态良好',fatigued:'疲劳',wounded:'轻伤'} as const;
const conditionBattleEffect={normal:'无战斗减益',fatigued:'移动 -1',wounded:'生命 -2、攻击 -1'} as const;
const campaignActionBattleEffect={
  investigate:'敌方移动 -1，并重新计算首步意图。',
  rest:'全体出战成员生命与生命上限 +1。',
  negotiate:'敌方信念与信念上限 -1。',
} as const;
const routePositions=[{x:21,y:76},{x:40,y:48},{x:61,y:35}];
// The mainline uses its own regional map. These anchors follow the geography
// in the seven-volume outline: mountain border → gate road → river junction →
// furnace city → mine → scorched front → lake capital.
const mainlineMapNodes=[
  {week:1,title:'刑场逃亡',location:'第一章·铁与火',x:18,y:35},
  {week:2,title:'暗影大教堂撤离',location:'第二章·流亡与争抢',x:24,y:12},
  {week:3,title:'马奴低洼伏击',location:'第三章·新卡瓦拉守护者',x:49,y:48},
  {week:4,title:'四国会战',location:'第四章·改革与崩溃',x:53,y:16},
  {week:5,title:'龙誓矿脉',location:'第五章·草原之主',x:17,y:68},
  {week:6,title:'造神圣殿',location:'第六章·邪神崛起',x:79,y:29},
  {week:7,title:'湖都终局',location:'第七章·终局之战',x:83,y:59},
] as const;

function persistCampaign(next:CampaignState){campaignState=next;saveCampaign(campaignState,localStorage);try{localStorage.setItem(activeCampaignKey,next.campaignId)}catch{}}
function mainlineWeekContent(week:number):MilestoneAWeekContent{
  const chapter=mainlineChapterByWeek[Math.min(7,Math.max(1,week))];
  const node=Object.values(chapter.nodes).find((item)=>item.kind==='battle');
  const battle=node?.kind==='battle'?node:undefined;
  const chapterName=chapter.title.replace(/^第[一二三四五六七]章·/,'');
  return {
    id:`arthur_main_week_${week}`,actLabel:'主线 · 铁与火',weekLabel:`第 ${week} 章 · ${chapterName}`,
    homeHeadline:chapter.subtitle,
    route:[{id:`arthur-route-${week}`,sequence:1,title:battle?.title??chapter.title,kind:'battle',location:chapter.title.split('·')[1]??'主线战区',objective:battle?.objectives.join('；')??'完成当前主线目标。',risk:week>=5?'高':week>=3?'中':'低',knownThreat:battle?.briefing??'战场情报正在整理。',consequence:'战败会保留伤势、资源和政治压力，主线仍会继续。',status:'next'}],
    actions:[
      {id:'investigate',title:'侦察战区',description:'让亚瑟调用系统扫描敌方阵线与地形。',immediateEffect:'情报 +1；解锁一条首回合敌方意图。',battleEffect:'敌方首步意图会在战前简报中显示。'},
      {id:'rest',title:'训练与整备',description:'处理伤势，提升亚瑟的武器熟练度与军阵准备。',immediateEffect:'恢复一名伤员；本章获得少量经验。',battleEffect:'出战单位生命上限 +1。'},
      {id:'negotiate',title:'军职交涉',description:'与军需官和地方代表确认粮路、援军与撤退权。',immediateEffect:'军队声望 +1；改变下一章的政治压力。',battleEffect:'敌方信念上限 -1。'},
    ],
    roster:[
      {characterId:'arthur',roleName:'系统持有者 / 剑盾兵',condition:'正常',readiness:'力量与盾牌熟练度会随成长改变。',relationshipNote:'亚瑟的选择决定军职路线。',selected:true},
      {characterId:'hans',roleName:'卫道士盾手',condition:'正常',readiness:'可拦截、格挡并封锁通道。',relationshipNote:'汉斯相信纪律必须保护具体的人。',selected:true},
      {characterId:'asnoka',roleName:'边境侦骑',condition:'正常',readiness:'移动力高，可从侧翼侦察和护送。',relationshipNote:'阿斯诺卡优先考虑粮路和撤退窗口。',selected:true},
    ],
    battlePreparation:{title:`战前准备 · ${battle?.title??chapter.title}`,objective:battle?.objectives.join('；')??'完成主线目标。',terrain:'8×8 低模战场；地形、障碍与目标会随章节变化。',knownIntent:batchIntent(week),evidencePrompt:'系统扫描或军职交涉会改变战前情报。',launchLabel:'开战'},
    postBattle:{victory:{result:'victory',headline:'主线推进：火线暂时稳定。',summary:'胜利会提供经验、银币与军职声望，下一章沿用当前状态。',changes:['亚瑟获得经验与技能点','银币奖励随章节增长','解锁下一章主线档案'],nextWeekNotice:'下一章将根据当前军职与政治压力改变开局。',recommendedNextAction:'investigate'},defeat:{result:'defeat',headline:'主线推进：失败被写进军令。',summary:'你保留伤势、资源损失和关系后果，不会被强制读档。',changes:['保留伤势与政治压力','获得少量失败经验','下一章风险提高'],nextWeekNotice:'先处理伤势或重新分配阵容，再进入下一章。',recommendedNextAction:'rest'}},
  };
}
function batchIntent(week:number){return week>=6?'审判官会优先锁定意志最低的单位；污染地块会扩散。':week>=4?'临时盟军可能换边；优先观察旗标和集结格。':'敌方会优先接近平民、粮车或控制目标。'}
function currentWeekContent(){return campaignState.campaignId==='arthur-main'?mainlineWeekContent(campaignState.week):campaignState.week>=3?campaignWeekThree:campaignState.week===2?campaignWeekTwo:campaignWeekOne}
function currentChapter(){return campaignState.campaignId==='arthur-main'?(mainlineChapterByWeek[campaignState.week]??mainlineChapterByWeek[7]):chapterRegistry.forProgress(campaignState.act,campaignState.week)}
function currentRouteIndex(){return campaignState.week>=2?0:Math.min(campaignState.routeIndex,currentWeekContent().route.length-1)}
function currentRoute(){return currentWeekContent().route[currentRouteIndex()]}
function attitudeLabel(value:number){return value>=2?'信任':value===1?'接纳':value===0?'中立':value===-1?'警惕':'敌对'}
function visibleRisk(){const base=currentRoute().risk;return campaignState.routeRiskModifier==='heightened'?`${base==='低'?'中':base} · 警戒升级`:base}
function signed(value:number){return value>0?`+${value}`:`${value}`}
function actualReportChanges(){
  const report=campaignState.lastReport;if(!report)return[];
  const changes:string[]=[];
  if(report.evidenceAdded)changes.push(`获得证物“${report.evidenceAdded==='broken_wrench'?'折断的异制扳手':report.evidenceAdded}”`);
  changes.push(`口粮 ${signed(report.suppliesDelta)}`);
  changes.push(`证据 ${signed(report.evidenceDelta)}`);
  changes.push(`平民安全 ${signed(report.civilianSafetyDelta)}`);
  changes.push(`队伍凝聚 ${signed(report.cohesionDelta)}`);
  changes.push(`女神国态度 ${signed(report.goddessAttitudeDelta)}`);
  if(report.coinsDelta)changes.push(`银币 ${signed(report.coinsDelta)}`);
  if(report.experienceDelta)changes.push(`亚瑟经验 ${signed(report.experienceDelta)} XP`);
  if(report.missionCompleted)changes.push(`军职任务完成：${report.missionCompleted}`);
  if(report.conditionCharacterId&&report.conditionAfter)changes.push(`${characters[report.conditionCharacterId].name}：${conditionLabel[report.conditionAfter]}`);
  changes.push(report.routeRiskModifier==='heightened'?'下一行动风险：警戒升级':'下一行动已按正常风险开放');
  return changes;
}
function flowHeader(active:FlowStep){
  const labels=new Map(flowSteps.map(step=>[step.id,step.label]));
  const visible:FlowStep[]=active==='home'?['home','battle-route','library','archive']:
    active==='battle-route'?['home','battle-route','roster','library','archive']:
    active==='roster'?['home','battle-route','roster','library','archive']:
    active==='preparation'?['home','roster','preparation','library','archive']:
    active==='report'?['home','report','growth','library','archive']:
    active==='growth'?['home','report','growth','library','archive']:
    active==='recruitment'?['home','growth','library','archive']:
    active==='library'?['home','library','archive']:
    active==='archive'?['home','library','archive']:
    ['home','library','archive'];
  const nav=visible.map(step=>{
    const current=step===active;
    if(step==='home')return current?`<span class="active">${labels.get(step)}</span>`:`<button data-go-home>${labels.get(step)}</button>`;
    if(step==='library')return current?`<span class="active">${labels.get(step)}</span>`:`<button data-open-library>${labels.get(step)}</button>`;
    if(step==='archive')return current?`<span class="active">${labels.get(step)}</span>`:`<button data-open-archive>${labels.get(step)}</button>`;
    return current?`<span class="active">${labels.get(step)}</span>`:`<button data-flow-step="${step}">${labels.get(step)}</button>`;
  }).join('');
  const mainline=campaignState.campaignId==='arthur-main';
  const title=mainline?'铁与火 · 亚瑟主线':'无旗使团 · 并行档案';
  const resources=mainline?`<span>口粮 <b>${campaignState.supplies}</b></span><span>银币 <b>${campaignState.coins}</b></span><span>军职 <b>${escapeHtml(campaignState.mainline?.militaryRank??'recruit')}</b></span>`:`<span>口粮 <b>${campaignState.supplies}</b></span><span>证据 <b>${campaignState.evidence}</b></span>`;
  return `<header class="campaign-top"><strong class="campaign-name">${title}</strong><span>${escapeHtml(currentWeekContent().weekLabel)}</span><div class="campaign-resources">${resources}</div><nav class="campaign-flow" aria-label="当前行动流程">${nav}</nav></header>`;
}

function renderCampaign(view:CampaignView=campaignState.view){
  if(view==='home'){renderCampaignHome();return}
  if(view==='battle-route'){renderBattleOverview();return}
  if(view==='roster'){renderRosterSelection();return}
  if(view==='preparation'){renderPreparation();return}
  if(view==='report'){renderCampaignReport();return}
  if(view==='growth'){renderGrowth();return}
  if(view==='recruitment'){renderRecruitment();return}
  if(view==='shop'){renderShop();return}
  if(view==='library'){renderLibrary();return}
  if(view==='archive'){renderArchive();return}
  if(view==='models'){renderModelGallery();return}
  if(view==='story'||view==='battle'){void startStory();return}
  renderCampaignHome();
}

function renderCampaignHome(){
  const route=currentRoute();
  const content=currentWeekContent(),activeRouteIndex=currentRouteIndex();
  const mainline=campaignState.campaignId==='arthur-main';
  const mapAsset=mainline?'/assets/images/mainline-iron-fire-map.webp':'/assets/images/campaign-route-map.webp';
  const mapAlt=mainline?'铁与火七章区域地图：山口、铁路、熔炉城、焦土前线与湖都':'从圣辉城通向铁砧边境与河湾境的战斗路线地图';
  const lineupNames=campaignState.lineup.map(id=>characters[id].name).join(' · ');
  const mainlineStats=mainline&&campaignState.mainline?`<div class="campaign-status-line mainline-stats"><span>亚瑟 Lv.${campaignState.mainline.level} <b>${campaignState.mainline.experience} XP</b></span><span>力量 <b>${campaignState.mainline.strength}</b></span><span>意志 <b>${campaignState.mainline.will}</b></span><span>军职 <b>${escapeHtml(campaignState.mainline.militaryRank)}</b></span></div>`:'';
  persistCampaign(navigateCampaign(campaignState,'home'));
  const actions=content.actions.map((action,index)=>`<button class="campaign-action ${campaignState.selectedAction===action.id?'selected':''}" data-home-action="${action.id}"><span class="campaign-action-order">${String(index+1).padStart(2,'0')}</span><span class="campaign-action-copy"><strong>${escapeHtml(action.title)}</strong><small>${escapeHtml(action.immediateEffect)}</small></span><span class="campaign-action-state" aria-hidden="true">${campaignState.selectedAction===action.id?'已选':'选择'}</span></button>`).join('');
  const mainlineMissions=campaignState.campaignId==='arthur-main'&&campaignState.mainline?mainlineMissionsForChapter(campaignState.week).map(mission=>{const selected=campaignState.mainline?.selectedMissionId===mission.id,done=campaignState.mainline?.completedMissions.includes(mission.id);return `<button type="button" class="mission-card ${selected?'selected':''} ${done?'completed':''}" data-mainline-mission="${mission.id}" aria-pressed="${selected}" ${done?'disabled':''}><img src="${mission.icon}" alt="" width="56" height="56" loading="lazy" decoding="async" onerror="this.hidden=true"><span><small>${escapeHtml(mission.type)} · ${done?'已完成':selected?'当前任务':'可接取'}</small><strong>${escapeHtml(mission.title)}</strong><em>${escapeHtml(mission.description)}</em></span><b>${escapeHtml(mission.reward)}</b></button>`}).join(''):'';
  const mainlineMissionPanel=campaignState.campaignId==='arthur-main'?`<section class="mainline-mission-board"><div class="campaign-actions-heading"><h2>军职任务</h2><span>完成战斗可结算</span></div>${mainlineMissions||'<p class="campaign-feedback">本章暂无额外任务；先完成主线行动。</p>'}</section>`:'';
  const mainlineWeek=Math.min(mainlineMapNodes.length,Math.max(1,campaignState.week));
  const nodes=mainline?mainlineMapNodes.map(node=>{const active=node.week===mainlineWeek,complete=node.week<mainlineWeek;return `<button class="map-node mainline-map-node ${active?'current':complete?'complete':''}" style="--node-x:${node.x}%;--node-y:${node.y}%" data-mainline-map-week="${node.week}" aria-label="${escapeHtml(node.title)}：${escapeHtml(node.location)}"><span>${escapeHtml(node.title)}</span><small>${escapeHtml(node.location)}</small></button>`}).join(''):content.route.map((node,index)=>{const position=routePositions[index]??routePositions[routePositions.length-1];return `<button class="map-node ${index===activeRouteIndex?'current':index<activeRouteIndex?'complete':''}" style="--node-x:${position.x}%;--node-y:${position.y}%" data-route-index="${index}"><span>${escapeHtml(node.title)}</span><small>${escapeHtml(node.location)}</small></button>`}).join('');
  const lineup=campaignState.lineup.map(id=>{const memberContent=content.roster.find(item=>item.characterId===id),person=characters[id],condition=campaignState.roster.find(item=>item.id===id)?.condition??'normal',portrait=portraitByCharacter[id];return `<article class="home-member">${portrait?`<img src="${portrait}" alt="${escapeHtml(person.name)}" width="260" height="360">`:`<div class="portrait-fallback" aria-label="${escapeHtml(person.name)}暂无人物画像"><span>${escapeHtml(person.name.slice(0,1))}</span></div>`}<div><small>${escapeHtml(memberContent?.roleName??person.title)}</small><strong>${escapeHtml(person.name)}</strong><span class="condition ${condition}">${conditionLabel[condition]}</span></div></article>`}).join('');
  set(`<main class="campaign-shell hud-page">${flowHeader('home')}<div class="campaign-home-grid"><section class="campaign-map ${mainline?'mainline-map':''}" aria-label="战斗路线"><img src="${mapAsset}" alt="${mapAlt}" width="1536" height="1024">${nodes}</section><aside class="campaign-next"><div class="campaign-next-heading"><p class="eyebrow">下一行动</p><h1>${escapeHtml(route.title)}</h1><p class="location">${escapeHtml(route.location)} · 风险${escapeHtml(visibleRisk())}</p></div><figure class="campaign-next-scene"><img src="${mapAsset}" alt="${escapeHtml(route.title)}所在区域的路线图景" width="1536" height="1024"><figcaption><span>当前战斗节点</span><strong>${escapeHtml(route.location)}</strong></figcaption></figure><div class="campaign-status-line"><span>平民安全 <b>${campaignState.civilianSafety}/3</b></span><span>${mainline?'军队声望':'女神国'} <b>${mainline?campaignState.factionAttitudes.wardens:attitudeLabel(campaignState.factionAttitudes.goddessState)}</b></span><span class="campaign-lineup-status">当前阵容 <b>${escapeHtml(lineupNames)}</b></span></div>${mainlineStats}<p>${escapeHtml(route.objective)}</p><section class="campaign-actions"><div class="campaign-actions-heading"><h2>${mainline?'战前准备':'准备行动'}</h2><span>三选一</span></div>${actions}</section>${mainlineMissionPanel}<button id="open-battle" class="campaign-primary">查看战斗</button><p id="home-feedback" class="campaign-feedback" aria-live="polite"></p></aside></div><section class="home-lineup"><header><p class="eyebrow">出战三人</p><button id="home-roster" class="text-button">调整阵容</button></header><div>${lineup}</div></section></main>`);
  mountMobileHomeBriefToggle();
  document.querySelectorAll<HTMLButtonElement>('[data-home-action]').forEach((button,index)=>{
    button.type='button';
    button.setAttribute('aria-pressed',String(button.classList.contains('selected')));
    button.setAttribute('aria-label',`准备行动：${button.querySelector('strong')?.textContent??`选项 ${index+1}`}`);
    button.onclick=()=>{persistCampaign(selectCampaignAction(campaignState,button.dataset.homeAction as CampaignAction));renderCampaignHome()};
  });
  document.querySelectorAll<HTMLButtonElement>('[data-mainline-mission]').forEach((button)=>button.addEventListener('click',()=>{
    const missionId=button.dataset.mainlineMission;
    if(!missionId||!campaignState.mainline)return;
    persistCampaign({...campaignState,mainline:selectMainlineMission(campaignState.mainline,missionId)});
    renderCampaignHome();
  }));
  document.querySelector<HTMLButtonElement>('#open-battle')?.setAttribute('aria-label','查看当前行动的战斗路线');
  document.querySelector('#open-battle')?.addEventListener('click',()=>{persistCampaign(navigateCampaign(campaignState,'battle-route'));renderBattleOverview()});
  const shopLink=document.createElement('button');shopLink.type='button';shopLink.className='text-button';shopLink.textContent='商店';shopLink.addEventListener('click',renderShop);
  const bossLink=document.createElement('button');bossLink.type='button';bossLink.className='text-button';bossLink.textContent='Boss挑战';bossLink.addEventListener('click',renderBossChallenge);
  document.querySelector('.campaign-top .campaign-flow')?.prepend(bossLink,shopLink);
  document.querySelector('#home-roster')?.addEventListener('click',()=>{lineupDraft=[...campaignState.lineup];persistCampaign(navigateCampaign(campaignState,'roster'));renderRosterSelection()});
  document.querySelectorAll<HTMLButtonElement>('[data-route-index]').forEach(button=>button.onclick=()=>{const index=Number(button.dataset.routeIndex);const feedback=document.querySelector<HTMLElement>('#home-feedback');if(index!==activeRouteIndex&&feedback)feedback.textContent='未来行动尚未开放；完成当前行动后，路线会根据战后报告更新。';else renderBattleOverview()});
  document.querySelectorAll<HTMLButtonElement>('[data-mainline-map-week]').forEach(button=>button.onclick=()=>{const week=Number(button.dataset.mainlineMapWeek);const current=Math.min(mainlineMapNodes.length,Math.max(1,campaignState.week));const feedback=document.querySelector<HTMLElement>('#home-feedback');if(week===current){renderBattleOverview();return}if(feedback)feedback.textContent=week<current?'该章节已完成，可在藏书馆回看相关档案。':'后续章节尚未开放；完成当前行动后，路线会继续向前推进。'});
  showScrollHintOnce('home');
}

function mountMobileHomeBriefToggle(){
  const grid=document.querySelector<HTMLElement>('.campaign-home-grid');
  const map=document.querySelector<HTMLElement>('.campaign-map');
  const panel=document.querySelector<HTMLElement>('.campaign-next');
  if(!grid||!map||!panel)return;
  const close=document.createElement('button');
  close.type='button';
  close.className='campaign-next-close text-button';
  close.textContent='返回地图';
  close.addEventListener('click',()=>grid.classList.remove('brief-open'));
  panel.prepend(close);
  map.addEventListener('click',(event)=>{
    if(!matchMedia('(max-width: 900px)').matches)return;
    const target=(event.target as Element).closest<HTMLButtonElement>('.map-node');
    if(!target||!target.classList.contains('current'))return;
    event.preventDefault();
    event.stopImmediatePropagation();
    grid.classList.add('brief-open');
  },true);
}

function showScrollHintOnce(key:string){
  const storageKey=`goddess-fall:scroll-hint:${key}`;try{if(localStorage.getItem(storageKey))return}catch{}
  const hint=document.createElement('div');hint.className='campaign-scroll-hint';hint.setAttribute('role','status');hint.innerHTML='<span>如果没有你想要的显示选项，可以往下滑动</span><button type="button" aria-label="关闭提示">×</button>';
  (document.querySelector<HTMLElement>('.campaign-shell')??document.body).prepend(hint);
  const close=()=>{try{localStorage.setItem(storageKey,'1')}catch{}hint.remove()};hint.querySelector('button')?.addEventListener('click',close);window.setTimeout(close,7000);
}

function showHintOnce(key:string,title:string,body:string){
  const storageKey=`goddess-fall:hint:${key}`;try{if(localStorage.getItem(storageKey))return}catch{}
  const overlay=document.createElement('div');overlay.className='campaign-guide';overlay.innerHTML=`<div class="campaign-guide-card hint-card" role="dialog" aria-modal="true"><button class="campaign-guide-close" aria-label="关闭提示">×</button><small>首次提示</small><h2>${escapeHtml(title)}</h2><p>${escapeHtml(body)}</p><div class="campaign-guide-actions"><span>关闭后不会影响其他提示</span><button class="campaign-primary">知道了</button></div></div>`;document.body.append(overlay);const close=()=>{try{localStorage.setItem(storageKey,'1')}catch{}overlay.remove()};overlay.querySelector('.campaign-guide-close')?.addEventListener('click',close);overlay.querySelector('.campaign-primary')?.addEventListener('click',close);
}

function showSaveHint(onContinue:()=>void){
  const overlay=document.createElement('div');overlay.className='campaign-guide';overlay.innerHTML='<div class="campaign-guide-card hint-card" role="dialog" aria-modal="true"><button class="campaign-guide-close" aria-label="关闭提示">×</button><small>存档提示</small><h2>如何选择自己的存档</h2><p>在当前界面的“档案”页下载 JSON，就能保存一个关键节点。下次从登录界面点击“选择存档”，即可直接回到档案与剧情推演页面。</p><div class="campaign-guide-actions"><button class="text-button">取消</button><button class="campaign-primary">继续选择存档</button></div></div>';document.body.append(overlay);const close=()=>overlay.remove();overlay.querySelector('.campaign-guide-close')?.addEventListener('click',close);overlay.querySelector('.text-button')?.addEventListener('click',close);overlay.querySelector('.campaign-primary')?.addEventListener('click',()=>{close();onContinue()});
}

function mountCampaignGuide(force=false){
  let seen=false;try{seen=Boolean(localStorage.getItem(campaignGuideKey))}catch{}
  if(seen&&!force)return;
  const steps=[
    ['1 / 7','主页：先看下一行动','这里显示当前章节、战斗节点、风险、平民安全和出战三人。每周都从主页开始。'],
    ['2 / 7','战斗路线：确认目标','点击“战斗”查看已知威胁、地形和未来行动；完成当前节点后，下一节点才会开放。'],
    ['3 / 7','阵容：选择三人','不同职业有不同技能和地形专长。没有永远最优的三人组合，先根据目标和敌人调整。'],
    ['4 / 7','战前准备：三选一','调查提高情报并解锁证据，休整处理伤势，交涉改变关系和敌方信念。选择会写入存档。'],
    ['5 / 7','开战：读意图再行动','先选单位查看生命、信念和敌方意图，再移动、攻击或使用技能；敌方在我方结束阶段后统一行动。'],
    ['6 / 7','战后报告 → 成长','胜利和失败都会继续推进。战斗会影响口粮、证据、伤势、关系和银币，成长页决定下一周怎么走。'],
    ['7 / 7','藏书馆、商店与 Boss挑战','藏书馆随章节解锁原文档案；商店购买永久武器、药剂和口粮；Boss挑战需完成第一季全部章节后开放。'],
  ];let index=0;
  const overlay=document.createElement('div');overlay.className='campaign-guide';overlay.innerHTML='<div class="campaign-guide-card" role="dialog" aria-modal="true"><small id="campaign-guide-step"></small><h2 id="campaign-guide-title"></h2><p id="campaign-guide-body"></p><div class="campaign-guide-actions"><button id="campaign-guide-skip" class="text-button">跳过指引</button><button id="campaign-guide-next" class="campaign-primary">下一步</button></div></div>';document.body.append(overlay);
  const step=()=>{const item=steps[index];overlay.querySelector('#campaign-guide-step')!.textContent=item[0];overlay.querySelector('#campaign-guide-title')!.textContent=item[1];overlay.querySelector('#campaign-guide-body')!.textContent=item[2];overlay.querySelector('#campaign-guide-next')!.textContent=index===steps.length-1?'完成指引':'下一步'};
  const close=()=>{try{localStorage.setItem(campaignGuideKey,'1')}catch{}overlay.remove()};
  overlay.querySelector('#campaign-guide-next')?.addEventListener('click',()=>{if(index===steps.length-1){close();return}index+=1;step()});overlay.querySelector('#campaign-guide-skip')?.addEventListener('click',close);step();
}

function renderBattleOverview(){
  const route=currentRoute(),content=currentWeekContent(),activeRouteIndex=currentRouteIndex();persistCampaign(navigateCampaign(campaignState,'battle-route'));
  const future=content.route.slice(activeRouteIndex,activeRouteIndex+3).map((node,index)=>`<li class="${index===0?'current':''}"><small>${index===0?'当前行动':`未来 ${index}`}</small><strong>${escapeHtml(node.title)}</strong><span>${escapeHtml(node.location)} · 风险${node.risk}</span></li>`).join('');
  const reward=campaignState.campaignId==='arthur-main'?'经验、银币与军职声望':'口粮、证据与队伍凝聚';
  set(`<main class="campaign-shell inner hud-page">${flowHeader('battle-route')}<section class="campaign-page battle-overview"><div class="route-main"><header class="route-heading"><p class="eyebrow">战斗路线 · 当前任务</p><h1>${escapeHtml(route.title)}</h1><p class="location">${escapeHtml(route.location)} · 风险 ${escapeHtml(visibleRisk())}</p></header><section class="route-fact-grid" aria-label="当前任务情报"><article class="route-fact route-fact-target"><span>目标</span><strong>${escapeHtml(route.objective)}</strong><p>完成目标即可进入战前准备。</p></article><article class="route-fact route-fact-risk"><span>风险</span><strong>${escapeHtml(visibleRisk())}</strong><p>${escapeHtml(route.consequence)}</p></article><article class="route-fact route-fact-reward"><span>奖励</span><strong>${escapeHtml(reward)}</strong><p>战斗结果会写入存档，并影响后续节点。</p></article><article class="route-fact route-fact-enemy"><span>敌方情报</span><strong>已知威胁</strong><p>${escapeHtml(route.knownThreat)}</p></article></section><div class="page-actions"><button class="text-button" data-back="home">返回主页</button><button id="to-roster" class="campaign-primary">调整阵容</button></div></div><aside class="route-list"><h2>未来三行动</h2><ol>${future}</ol></aside></section></main>`);
  document.querySelector('[data-back="home"]')?.addEventListener('click',renderCampaignHome);
  showScrollHintOnce('battle');
  document.querySelector('#to-roster')?.addEventListener('click',()=>{lineupDraft=[...campaignState.lineup];renderRosterSelection()});
}

function renderRosterSelection(){
  persistCampaign(navigateCampaign(campaignState,'roster'));
  const content=currentWeekContent();
  const cards=campaignState.roster.map(rosterMember=>{const id=rosterMember.id,member=content.roster.find(item=>item.characterId===id),person=characters[id],selected=lineupDraft.includes(id),portrait=portraitByCharacter[id];return `<button class="roster-choice ${selected?'selected':''}" data-roster-id="${id}" aria-pressed="${selected}">${portrait?`<img src="${portrait}" alt="${escapeHtml(person.name)}" width="360" height="480">`:`<span class="portrait-fallback roster-portrait" aria-hidden="true"><span>${escapeHtml(person.name.slice(0,1))}</span></span>`}<span><small>${escapeHtml(member?.roleName??person.title)}</small><strong>${escapeHtml(person.name)}</strong><em>${conditionLabel[rosterMember.condition]} · ${conditionBattleEffect[rosterMember.condition]}</em><p>${escapeHtml(member?.readiness??person.description)}</p></span></button>`}).join('');
  set(`<main class="campaign-shell inner hud-page">${flowHeader('roster')}<section class="campaign-page roster-page"><div class="page-heading"><p class="eyebrow">阵容 · 出战编制</p><h1>选择三名出战成员</h1><p>从已经加入使团的成员中选择三人；确认后的阵容会立即保存。</p></div><div class="roster-grid">${cards}</div><p id="roster-count" class="campaign-feedback" aria-live="polite">已选择 ${lineupDraft.length}/3</p><div class="page-actions"><button id="back-battle" class="text-button">返回战斗</button><button id="confirm-roster" class="campaign-primary" ${lineupDraft.length===3?'':'disabled'}>进入战前准备</button></div></section></main>`);
  document.querySelectorAll<HTMLButtonElement>('[data-roster-id]').forEach(button=>button.onclick=()=>{const id=button.dataset.rosterId as CampaignCharacterId;lineupDraft=lineupDraft.includes(id)?lineupDraft.filter(item=>item!==id):[...lineupDraft,id];renderRosterSelection()});
  document.querySelector('#back-battle')?.addEventListener('click',renderBattleOverview);
  document.querySelector('#confirm-roster')?.addEventListener('click',()=>{persistCampaign(setCampaignLineup(campaignState,lineupDraft));renderPreparation()});
}

function renderPreparation(){
  persistCampaign(navigateCampaign(campaignState,'preparation'));
  const content=currentWeekContent(),prep=content.battlePreparation,route=currentRoute();
  const actions=content.actions.map(action=>{const selected=campaignState.selectedAction===action.id;return `<button type="button" class="prep-action ${selected?'selected':''}" data-prep-action="${action.id}" aria-pressed="${selected}"><strong>${escapeHtml(action.title)}</strong><span>${escapeHtml(action.description)}</span><small>${escapeHtml(campaignActionBattleEffect[action.id])}</small><em class="prep-action-state">${selected?'已选':'选择'}</em></button>`}).join('');
  const hasExtraIntel=campaignState.intelLevel>0||campaignState.selectedAction==='investigate';
  const intentCopy=hasExtraIntel?prep.knownIntent:'尚未完成调查：敌方首步意图未确认。';
  set(`<main class="campaign-shell inner hud-page">${flowHeader('preparation')}<section class="campaign-page preparation-page"><div class="briefing"><p class="eyebrow">战前准备 · 任务简报</p><h1>${escapeHtml(prep.title)}</h1><dl><div><dt>目标</dt><dd>${escapeHtml(prep.objective)}</dd></div><div><dt>地形</dt><dd>${escapeHtml(prep.terrain)}</dd></div><div><dt>额外敌情</dt><dd>${escapeHtml(intentCopy)}</dd></div><div><dt>失败后果</dt><dd>${escapeHtml(route.consequence)}</dd></div></dl></div><aside class="preparation-actions"><h2>选择一项准备行动</h2>${actions}<p class="campaign-feedback">${campaignState.selectedAction?'行动将在开战时确认并写入本地存档。':'请选择调查、休整或交涉。'}</p><div class="page-actions"><button id="back-roster" type="button" class="text-button">返回阵容</button><button id="launch" type="button" class="campaign-primary" ${campaignState.selectedAction?'':'disabled'}>${escapeHtml(prep.launchLabel)}</button></div></aside></section></main>`);
  document.querySelectorAll<HTMLButtonElement>('[data-prep-action]').forEach(button=>button.addEventListener('click',()=>{const action=button.dataset.prepAction as CampaignAction|undefined;if(!action)return;persistCampaign(selectCampaignAction(campaignState,action));renderPreparation()}));
  document.querySelector('#back-roster')?.addEventListener('click',renderRosterSelection);
  document.querySelector('#launch')?.addEventListener('click',launchCampaignBattle);
}

async function launchCampaignBattle(){
  const committed=commitCampaignAction(campaignState);if(!committed.actionCommitted)return;
  persistCampaign(navigateCampaign(committed,'story'));
  await startStory();
}

async function startStory(){
  const chapter=campaignState.campaignId==='arthur-main'?currentChapter():await chapterRegistry.loadForProgress(campaignState.act,campaignState.week);
  const resolved=resolveStoryCheckpoint(campaignState.storyCheckpoint,chapter.id,new Set(Object.keys(chapter.nodes)),chapter.startNodeId);
  storyState=resolved.storyState
    ? structuredClone(resolved.storyState) as StoryState
    : {
      flags:{...campaignState.storyState.flags},
      evidence:[...new Set([...campaignState.storyState.evidence,...campaignState.evidenceItems])],
      stats:{...campaignState.storyState.stats},
    };
  currentNodeId=resolved.nodeId;battleState=undefined;battleLog.length=0;
  renderNode(currentNodeId);
}

function renderCampaignReport(){
  const result=campaignState.lastReport?.result;if(!result){renderCampaignHome();return}
  const outcome=currentWeekContent().postBattle[result];persistCampaign(navigateCampaign(campaignState,'report'));
  set(`<main class="campaign-shell inner">${flowHeader('report')}<section class="campaign-page report-page"><div><p class="eyebrow">战后报告 · ${result==='victory'?'行动完成':'行动受挫'}</p><h1>${escapeHtml(outcome.headline)}</h1><p>${escapeHtml(outcome.summary)}</p><h2>记录变化</h2><ul>${actualReportChanges().map(change=>`<li>${escapeHtml(change)}</li>`).join('')}</ul></div><aside><h2>当前状态</h2><p>口粮 ${campaignState.supplies} · 证据 ${campaignState.evidence}<br>平民安全 ${campaignState.civilianSafety}/3 · 队伍凝聚 ${campaignState.cohesion}/5<br>女神国态度 ${attitudeLabel(campaignState.factionAttitudes.goddessState)} · 下一行动风险 ${escapeHtml(campaignState.routeRiskModifier==='heightened'?'警戒升级':'正常')}</p><h2>下一行动</h2><p>${escapeHtml(outcome.nextWeekNotice)}</p><button id="to-growth" class="campaign-primary">进入成长</button></aside></section></main>`);
  document.querySelector('#to-growth')?.addEventListener('click',renderGrowth);
}

function renderGrowth(){
  const result=campaignState.lastReport?.result;if(!result){renderCampaignHome();return}
  const outcome=currentWeekContent().postBattle[result];persistCampaign(navigateCampaign(campaignState,'growth'));
  const members=campaignState.roster.map(member=>{const person=characters[member.id];return `<li><strong>${escapeHtml(person.name)}</strong><span>${conditionLabel[member.condition]}</span></li>`}).join('');
  const terminal=Boolean(campaignState.seasonComplete);
  const mainline=campaignState.mainline;
  const mainlinePanel=campaignState.campaignId==='arthur-main'&&mainline?`<div class="mainline-growth-panel"><dt>亚瑟等级</dt><dd>Lv.${mainline.level} · ${mainline.experience} XP</dd><dt>属性</dt><dd>力量 ${mainline.strength} · 敏捷 ${mainline.agility} · 体质 ${mainline.constitution} · 意志 ${mainline.will}</dd><dt>军职</dt><dd>${escapeHtml(mainline.militaryRank)} · 技能点 ${mainline.skillPoints}</dd></div>`:'';
  const mainlineSkillPanel=campaignState.campaignId==='arthur-main'&&mainline?`<section class="mainline-skill-tree"><header><h2>亚瑟技能树</h2><span>剩余技能点 ${mainline.skillPoints}</span></header><p>三条路线可以混合学习；前置技能和技能点都会真实写入存档。</p><div class="skill-tree-grid">${mainlineSkills.map(skill=>{const learned=mainline.skills.includes(skill.id),available=!learned&&mainlineSkillAvailable(mainline,skill)&&mainline.skillPoints>0;return `<button type="button" class="mainline-skill-card ${learned?'learned':''} ${available?'available':''}" data-mainline-skill="${skill.id}" ${learned||!available?'disabled':''}><small>${escapeHtml(skill.route)} · ${learned?'已学习':available?'可学习':'未解锁'}</small><strong>${escapeHtml(skill.name)}</strong><span>${escapeHtml(skill.effect)}</span>${skill.requires?`<em>前置：${escapeHtml(mainlineSkills.find(item=>item.id===skill.requires)?.name??skill.requires)}</em>`:''}</button>`}).join('')}</div></section>`:'';
  set(`<main class="campaign-shell inner">${flowHeader('growth')}<section class="campaign-page growth-page"><div><p class="eyebrow">成长</p><h1>${terminal?(campaignState.campaignId==='arthur-main'?'第七卷记录已封存':'第一季记录已封存'):'这一周留下了什么'}</h1><p>${terminal?'这不是读档终点：你可以导出这一条秩序路线，或从新档案重新走向另一种结局。':campaignState.campaignId==='arthur-main'?'升级获得 2 点属性点；技能点可在三条路线中自由分配，军职任务会改变经验、声望与后续剧情。':'成长记录人物状态、证据链与关系变化。'}</p><dl>${mainlinePanel}<div><dt>队伍凝聚</dt><dd>${campaignState.cohesion}/5</dd></div><div><dt>证据</dt><dd>${campaignState.evidence} · ${campaignState.evidenceItems.map(id=>id==='cold_ash'?'无温余烬':id==='lamp_oil_ledger'?'守灯账簿':'折断的异制扳手').join('、')||'尚无命名证物'}</dd></div><div><dt>口粮</dt><dd>${campaignState.supplies}</dd></div><div><dt>平民安全</dt><dd>${campaignState.civilianSafety}/3</dd></div><div><dt>女神国</dt><dd>${attitudeLabel(campaignState.factionAttitudes.goddessState)}</dd></div><div><dt>路线风险</dt><dd>${campaignState.routeRiskModifier==='heightened'?'警戒升级':'正常'}</dd></div></dl>${mainlineSkillPanel}</div><aside><h2>成员状态</h2><ul>${members}</ul><section class="recruitment-entry"><small>免费会面 ${campaignState.recruitmentMeetings}</small><strong>${campaignState.campaignId==='arthur-main'?'军职任务板':'六人名册'}</strong><p>${campaignState.campaignId==='arthur-main'?'清剿、护送、侦察、训练、谈判和追捕会在后续章节逐步开放。':'只使用行动中获得的免费会面；概率、保底与重复转化全部公开。'}</p>${campaignState.campaignId==='arthur-main'?'':'<button id="open-recruitment" class="text-button">查看旅人名册</button>'}</section><p>${escapeHtml(outcome.nextWeekNotice)}</p>${terminal?'<button id="open-final-archive" class="campaign-primary">导出第一季档案</button><button id="restart-season" class="text-button">开始新的第一季</button>':'<button id="advance-week" class="campaign-primary">继续行动路线</button>'}</aside></section></main>`);
  document.querySelectorAll<HTMLButtonElement>('[data-mainline-skill]').forEach((button)=>button.addEventListener('click',()=>{
    const skillId=button.dataset.mainlineSkill;
    if(!skillId||!campaignState.mainline)return;
    const next=learnMainlineSkill(campaignState.mainline,skillId);
    if(next===campaignState.mainline)return;
    persistCampaign({...campaignState,mainline:next});
    renderGrowth();
  }));
  document.querySelector('#open-recruitment')?.addEventListener('click',renderRecruitment);
  document.querySelector('#open-final-archive')?.addEventListener('click',renderArchive);
  document.querySelector('#restart-season')?.addEventListener('click',()=>{if(confirm('开始新的第一季？当前完成档案仍可先在“档案”页导出。')){persistCampaign(createCampaignState());lineupDraft=[...campaignState.lineup];renderCampaignHome()}});
  document.querySelector('#advance-week')?.addEventListener('click',()=>{persistCampaign(advanceCampaignWeek(campaignState));lineupDraft=[...campaignState.lineup];renderCampaignHome()});
}

function renderRecruitment(){
  persistCampaign(navigateCampaign(campaignState,'recruitment'));
  const chances=recruitmentProbabilities(campaignState);
  const cards=chances.map(candidate=>{const person=characters[candidate.id],portrait=portraitByCharacter[candidate.id];return `<article class="recruit-card ${candidate.owned?'owned':''}">${portrait?`<img class="recruit-portrait" src="${portrait}" alt="${escapeHtml(person.name)}" width="116" height="140">`:`<div class="recruit-monogram" aria-label="${escapeHtml(person.name)}暂无人物画像">${escapeHtml(person.name.slice(0,1))}</div>`}<div><small>${escapeHtml(candidate.faction)} · ${candidate.owned?'已在阵容':'尚未加入'}</small><strong>${escapeHtml(person.name)}</strong><span>${escapeHtml(candidate.role)}</span><p>${escapeHtml(candidate.fieldValue)}</p></div><b>${(candidate.probability*100).toFixed(candidate.probability===0?0:2)}%</b></article>`}).join('');
  const last=campaignState.lastRecruitment;
  const result=last?`<div class="recruit-result"><small>最近会面</small><strong>${escapeHtml(characters[last.characterId].name)}</strong><p>${last.result==='new'?'已加入阵容，可在阵容页面安排出战。':`重复相遇，已转化为档案印记 +${last.marksAdded}。`}</p></div>`:'';
  const pity=campaignState.recruitmentPity>=2?'下一次必定遇见尚未加入的角色。':`再连续重复 ${2-campaignState.recruitmentPity} 次后，下一次必得新角色。`;
  set(`<main class="campaign-shell inner">${flowHeader('growth')}<section class="campaign-page recruitment-page"><div><p class="eyebrow">成长 · 旅人名册</p><h1>让同行来自一次真实会面</h1><p>每场正式战斗获得一次免费会面。没有付费入口、限时池或十连；六名角色强度横向，出现概率实时公开。</p><div class="recruit-disclosure"><span>会面 <b>${campaignState.recruitmentMeetings}</b></span><span>档案印记 <b>${campaignState.recruitmentMarks}</b></span><span>${pity}</span></div><div class="recruit-grid">${cards}</div></div><aside>${result}<h2>规则公开</h2><ol><li>常规会面：六人等概率，各 ${(100/recruitmentPool.length).toFixed(2)}%。</li><li>连续两次遇见已有成员后，第三次只在未加入成员中等概率抽取。</li><li>重复成员转化为 1 枚档案印记，不提升角色数值。</li><li>所有会面资源只通过游玩获得。</li></ol><button id="recruit-once" class="campaign-primary" ${campaignState.recruitmentMeetings>0?'':'disabled'}>进行一次免费会面</button><button id="back-growth" class="text-button">返回成长</button><p id="recruit-feedback" class="campaign-feedback" aria-live="polite">${campaignState.recruitmentMeetings>0?'本次会面将立即保存。':'当前没有可用会面。'}</p></aside></section></main>`);
  document.querySelector('#recruit-once')?.addEventListener('click',()=>{
    const outcome=drawRecruitment(campaignState);
    if(!outcome.draw.ok)return;
    persistCampaign(outcome.state);
    renderRecruitment();
  });
  document.querySelector('#back-growth')?.addEventListener('click',renderGrowth);
}

function achievementList(){
  const ids=new Set(campaignState.rewardedBattleIds);
  return [
    {id:'first-battle',title:'第一道火痕',desc:'完成第一场正式战斗。',unlocked:ids.size>0},
    {id:'three-bosses',title:'阶梯尽头',desc:'完成三场阶梯 Boss 战。',unlocked:['odric-judgment','iron-bulwark','veiled-avatar'].every(id=>ids.has(id))},
    {id:'archivist',title:'档案整理员',desc:'收藏当前章节全部已解锁条目。',unlocked:[...libraryEntriesForWeek(campaignState.week),...supplementalLibraryEntriesForWeek(campaignState.week)].every(entry=>libraryCollectionHas(entry.id))},
    {id:'season-finished',title:'建立秩序',desc:'完成第一季并进入结局。',unlocked:Boolean(campaignState.seasonComplete)},
  ];
}
function libraryCollectionHas(id:string){try{return new Set(JSON.parse(localStorage.getItem('goddess-fall:library:collection')??'[]') as string[]).has(id)}catch{return false}}

function renderLibrary(axis:LibraryAxis|'全部'='全部'){
  persistCampaign(navigateCampaign(campaignState,'library'));
  const mainline=campaignState.campaignId==='arthur-main';
  let reveal='current';try{reveal=localStorage.getItem('goddess-fall:library:reveal')??'current'}catch{}
  const revealWeek=reveal==='all'?3:reveal==='chapter-2'?2:reveal==='chapter-3'?3:1;
  const unlocked=mainline?mainlineLibraryEntriesForWeek(campaignState.week):[...libraryEntriesForWeek(reveal==='current'?campaignState.week:revealWeek),...supplementalLibraryEntriesForWeek(reveal==='current'?campaignState.week:revealWeek)];
  const axes:Array<LibraryAxis|'全部'>=['全部','时间','区域','势力','人物'];
  const visible=axis==='全部'?unlocked:unlocked.filter(entry=>entry.axis===axis);
  const guideCard='<article class="library-entry library-guide-entry"><header><span>指引</span><small>操作与存档</small></header><h2>使团行动手册</h2><p class="library-summary">主页 → 战斗路线 → 阵容 → 战前准备 → 剧情 → 开战 → 战后报告 → 成长。</p><details><summary>查看完整指引</summary><p>主页确认下一行动；战斗路线查看目标和威胁；阵容选择三名职业互补的成员；战前准备在调查、休整、交涉中三选一；开战后先读敌方意图，再移动、攻击或使用技能；战后报告记录资源和关系变化，成长页进入下一周。</p><p>要保存关键节点，请进入档案，点击“下载当前档案”，保存 JSON。下次登录界面点击“选择存档”，会直接回到档案与剧情推演页面。</p></details><footer>分类：操作指引</footer></article>';
  const cards=visible.map(entry=>`<article class="library-entry"><header><span>${escapeHtml(entry.axis)}</span><small>${escapeHtml(entry.period??entry.region??'未定区域')}</small></header><h2>${escapeHtml(entry.title)}</h2><p class="library-summary">${escapeHtml(entry.summary)}</p><details class="library-detail"><summary>打开原文全文</summary><p>${escapeHtml(entry.text)}</p></details><footer>于 ${entry.unlockWeek===1?'第一章':entry.unlockWeek===2?'第二章':'第三章'} 解锁</footer></article>`).join('')||'<p class="campaign-feedback">这个分类暂未有解锁条目。</p>';
  const worldview=mainline?['女神与系统','七卷路线','记录的作用']:['圣火疑案','无旗使团','证据与关系'];
  const worldviewText=mainline?['女神是否存在仍未有定论；系统只提供可验证的战场提示，选择权始终在亚瑟手中。','刑场、流亡、河湾、四国会战、草原、造神圣殿与湖都，会随着章节推进逐步开放。','每一次升级、军职任务和失败都会写回档案；数字记录的是后果，不是替玩家做决定。']:['圣火熄灭不是一个孤立的奇闻，它牵连祭坛、粮路、骑士团和被删去的名字。','使团不替任何旗帜宣布真相，只把伤亡、证物和相互矛盾的证词并置保存。','证据会改变交涉筹码，也会改变下一场战斗的目标；打开全文即可把条目收入收藏。'];
  const worldviewPanel=`<section class="library-worldview" aria-label="世界观导览">${worldview.map((title,index)=>`<article><small>${index+1}</small><strong>${title}</strong><p>${worldviewText[index]}</p></article>`).join('')}</section>`;
  const archiveCharacters:CampaignCharacterId[]=mainline?['arthur','hans','asnoka']:['the_unflagged','seraphina','reina','odric','cole','agnes'];
  const characterGallery=(axis==='全部'||axis==='人物')?`<section class="library-character-gallery"><header><p class="eyebrow">人物图鉴</p><span>立绘与已归档人物信息</span></header><div>${archiveCharacters.map(id=>{const character=characters[id];const portrait=mainline?dialoguePortraitForState(id):portraitByCharacter[id];return `<article><figure>${portrait?`<img src="${portrait}" alt="${escapeHtml(character.name)}" loading="lazy" width="640" height="640">`:'<span>待补</span>'}</figure><div><small>${escapeHtml(character.title)}</small><strong>${escapeHtml(character.name)}</strong><p>${escapeHtml(character.description)}</p></div></article>`}).join('')}</div></section>`:'';
  set(`<main class="campaign-shell inner">${flowHeader('library')}<section class="campaign-page library-page"><header class="page-heading"><p class="eyebrow">藏书馆 · ${mainline?'亚瑟主线档案':'使团档案'}</p><h1>${mainline?'七卷记录仍在展开':'世界并不会一次性讲完'}</h1><p>随着章节推进，新的年代、区域、势力与人物记录会被归档。当前已解锁 ${unlocked.length} 卷，尚有 ${mainline?Math.max(0,7-unlocked.length):allLibraryLockedCount(campaignState.week)} 卷待发现。</p></header>${worldviewPanel}${characterGallery}<div class="library-toolbar" role="tablist" aria-label="藏书馆分类">${axes.map(item=>`<button class="${axis===item?'active':''}" data-library-axis="${item}">${item}</button>`).join('')}</div><div class="library-grid">${cards}</div></section></main>`);
  document.querySelectorAll<HTMLButtonElement>('[data-library-axis]').forEach(button=>button.onclick=()=>renderLibrary(button.dataset.libraryAxis as LibraryAxis|'全部'));
  const collectionKey='goddess-fall:library:collection';
  const readCollection=()=>{try{return new Set(JSON.parse(localStorage.getItem(collectionKey)??'[]') as string[])}catch{return new Set<string>()}};
  const writeCollection=(ids:Set<string>)=>{try{localStorage.setItem(collectionKey,JSON.stringify([...ids]))}catch{}};
  const collection=readCollection();
  const entries=[...document.querySelectorAll<HTMLElement>('.library-entry:not(.library-guide-entry)')];
  entries.forEach((card,index)=>{const entry=visible[index];if(!entry)return;card.dataset.libraryEntry=entry.id;card.classList.toggle('collected',collection.has(entry.id));const header=card.querySelector('header');if(header&&!header.querySelector('[data-collection-status]')){const badge=document.createElement('small');badge.dataset.collectionStatus='';badge.textContent=collection.has(entry.id)?'已收藏':'未收藏';header.append(badge)}const details=card.querySelector('details');details?.addEventListener('toggle',()=>{if(!details.open||collection.has(entry.id))return;collection.add(entry.id);writeCollection(collection);card.classList.add('collected');const badge=card.querySelector<HTMLElement>('[data-collection-status]');if(badge)badge.textContent='已收藏';});});
  const unlockedCount=unlocked.length, collectedCount=visible.filter(entry=>collection.has(entry.id)).length, achievements=achievementList();
  const achievementPanel=document.createElement('section');achievementPanel.className='achievement-strip';achievementPanel.innerHTML=`<div><small>收藏进度</small><strong>${collectedCount}/${unlockedCount}</strong><span>打开条目全文即可收藏</span></div><div><small>成就</small><strong>${achievements.filter(item=>item.unlocked).length}/${achievements.length}</strong><span>完成行动与整理档案解锁</span></div><div class="achievement-list">${achievements.map(item=>`<span class="achievement-chip ${item.unlocked?'unlocked':''}"><b>${item.unlocked?'✓':'○'} ${escapeHtml(item.title)}</b><small>${escapeHtml(item.desc)}</small></span>`).join('')}</div>`;document.querySelector('.library-toolbar')?.after(achievementPanel);
  if(!mainline)mountLibraryRevealControl(axis);
  const guide=document.createElement('article');guide.className='library-entry library-guide-entry';guide.innerHTML=guideCard;document.querySelector('.library-grid')?.prepend(guide);
  const guideTab=document.createElement('button');guideTab.type='button';guideTab.textContent='指引';guideTab.className='library-guide-tab';guideTab.addEventListener('click',()=>guide.scrollIntoView({behavior:'smooth',block:'start'}));document.querySelector('.library-toolbar')?.append(guideTab);
}

function renderModelGallery(){
  persistCampaign(navigateCampaign(campaignState,'models'));
  const summary=modelGallerySummary();
  const cards=modelGalleryAssets.map(asset=>'<button type="button" class="model-gallery-card" data-model-select="'+escapeHtml(asset.id)+'" data-model-category="'+escapeHtml(asset.category)+'" data-model-maker="'+escapeHtml(asset.maker)+'" aria-label="查看 '+escapeHtml(asset.title)+'"><strong>'+escapeHtml(asset.title)+'</strong><small>'+escapeHtml(asset.maker)+' · '+escapeHtml(asset.category)+'</small><span>'+escapeHtml(asset.url.split('/').pop()??asset.url)+'</span></button>').join('');
  set('<main class="campaign-shell inner">'+flowHeader('models')+'<section class="campaign-page model-gallery-page"><header class="page-heading model-gallery-heading"><div><p class="eyebrow">美术资产 · 3D 模型库存</p><h1>模型已移出游戏包</h1><p>模型文件已从主游戏运行时剥离，保存在独立库存中；主游戏战斗使用 2D 立绘或程序化 fallback。要查看可旋转的 GLB，请使用单独构建的 model-gallery.html。</p></div></header><section class="model-gallery-stats" aria-label="模型统计"><article><small>库存模型文件</small><strong>'+summary.total+'</strong><span>去重后的 GLB</span></article><article><small>K3 制作</small><strong>'+summary.k3+'</strong><span>含环境与角色回退</span></article><article><small>GPT 制作</small><strong>'+summary.gpt+'</strong><span>img2threejs 主线模型</span></article><article><small>项目 / 第三方</small><strong>'+summary.other+'</strong><span>外部模型与整理资产</span></article></section><div class="model-gallery-toolbar"><label for="model-gallery-search">搜索模型<input id="model-gallery-search" type="search" placeholder="名称或文件名"></label><label for="model-gallery-filter">筛选分类<select id="model-gallery-filter"><option value="全部">全部分类</option><option value="角色">角色</option><option value="敌人">敌人</option><option value="Boss">Boss</option><option value="环境">环境</option><option value="K3 回退">K3 回退</option></select></label><label for="model-gallery-maker-filter">筛选制作方<select id="model-gallery-maker-filter"><option value="全部">全部制作方</option><option value="K3">K3 制作</option><option value="GPT">GPT / img2threejs</option><option value="项目/第三方">项目 / 第三方</option></select></label></div><section class="model-gallery-layout"><div class="model-gallery-stage"><div class="model-gallery-status" data-model-status role="status">主游戏不加载 3D 模型；请运行 npm run build:gallery 生成独立检验台。</div></div><aside class="model-gallery-detail"><p class="eyebrow" data-model-source>模型库存</p><h2 data-model-title>可选资产</h2><p class="model-gallery-note">当前页只展示库存索引，不触发模型下载；独立检验台会从 model-inventory/ 加载 GLB。</p><div class="page-actions"><button type="button" class="text-button" data-go-home>返回主页</button></div></aside></section><div class="model-gallery-grid" aria-label="模型列表">'+cards+'</div></section></main>');
  const page=document.querySelector<HTMLElement>('.model-gallery-page');
  if(!page)return;
  modelGalleryCleanup=undefined;
  const search=page.querySelector<HTMLInputElement>('#model-gallery-search');
  const filter=page.querySelector<HTMLSelectElement>('#model-gallery-filter');
  const makerFilter=page.querySelector<HTMLSelectElement>('#model-gallery-maker-filter');
  const cardNodes=[...page.querySelectorAll<HTMLElement>('[data-model-select]')];
  const applyFilter=()=>{const query=search?.value.trim().toLowerCase()??'';const category=filter?.value??'全部';const maker=makerFilter?.value??'全部';cardNodes.forEach(card=>{const matchesCategory=category==='全部'||card.dataset.modelCategory===category;const matchesMaker=maker==='全部'||card.dataset.modelMaker===maker;const matchesQuery=!query||card.textContent?.toLowerCase().includes(query);card.hidden=!(matchesCategory&&matchesMaker&&matchesQuery);});};
  search?.addEventListener('input',applyFilter);
  filter?.addEventListener('change',applyFilter);
  makerFilter?.addEventListener('change',applyFilter);
}

function renderBossChallenge(){
  if(!campaignState.seasonComplete){
    set(`<main class="campaign-shell inner"><section class="campaign-page battle-overview"><div class="page-copy"><p class="eyebrow">Boss挑战</p><h1>阶梯 Boss 挑战</h1><p>未解锁：需要完成第一季全部三章主线并进入任意结局。完成后此入口会开放，挑战不消耗口粮。</p><button id="back-boss-home" class="text-button">返回主页</button></div></section></main>`);
    document.querySelector('#back-boss-home')?.addEventListener('click',renderCampaignHome);
    return;
  }
  const bossByWeek=[['odric-judgment','奥德里克 · 信念裁决'],['iron-bulwark-battle','铁窗壁垒 · 工程战'],['final-battle','守幕圣像 · 破幕战']][Math.min(2,Math.max(0,campaignState.week-1))];
  set(`<main class="campaign-shell inner"><section class="campaign-page battle-overview"><div class="page-copy"><p class="eyebrow">Boss挑战</p><h1>选择一场阶梯 Boss 战</h1><p>直接进入 Boss 战，不推进剧情；挑战结束后返回主页。Boss 战不消耗口粮。</p><article class="library-entry"><h2>${bossByWeek[1]}</h2><p>当前章节可挑战的 Boss，沿用现有阵容。</p><button id="start-boss-challenge" class="campaign-primary">选择阵容并开战</button></article><button id="back-boss-home" class="text-button">返回主页</button></div></section></main>`);
  document.querySelector('#back-boss-home')?.addEventListener('click',renderCampaignHome);
  document.querySelector('#start-boss-challenge')?.addEventListener('click',()=>{bossChallengeMode=true;lineupDraft=[...campaignState.lineup];const node=currentChapter().nodes[bossByWeek[0]];if(node?.kind==='battle'){startBattle(node.id)}else{bossChallengeMode=false;renderCampaignHome()}});
}

function renderShop(){
  persistCampaign(navigateCampaign(campaignState,'shop'));
  const shopItemArt:Record<string,string>={"iron-ward":"anvil-guard","frontier-lance":"frontier-lance","sanctified-edge":"holy-flame-blade","warden-mail":"warden-mail","veil-breaker":"veil-prism","echo-compass":"system-compass"};
  const shopQuips:Record<string,string>={"iron-ward":"穿上它，你会更像一个暂时不会被风吹倒的人。","frontier-lance":"直线很诚实；拐弯的账留给下一回合。","sanctified-edge":"圣火不保证胜利，只保证刀刃很有仪式感。","warden-mail":"它很重，但伤势报告会因此少写两行。","veil-breaker":"专门拆幕的棱刃，顺便拆掉一点自信。","echo-compass":"会提前告诉你哪里危险；不会替你绕开。"};
  const weapons=campaignShop.map(item=>{const owned=campaignState.ownedWeapons.includes(item.id),equipped=campaignState.equippedWeapon===item.id;const art=shopItemArt[item.id];return `<article class="library-entry shop-entry"><div class="shop-art"><img src="/assets/images/shop/${art}.webp" alt="${item.name}" loading="lazy" width="256" height="256"></div><header><span>${item.quality} · ${item.slot}</span><small>${item.attack?`攻击 +${item.attack}`:''} ${item.defense?`防御 +${item.defense}`:''} ${item.faith?`信念 +${item.faith}`:''} ${item.moveRange?`移动 +${item.moveRange}`:''}</small></header><h2>${item.name}</h2><p>${item.description}购买后永久记录在档案。</p><small class="shop-quip">${shopQuips[item.id]}</small><button class="campaign-primary" data-buy-weapon="${item.id}" ${owned||campaignState.coins<item.cost?'disabled':''}>${owned?'已拥有':`购买 · ${item.cost} 银币`}</button>${owned?`<button class="text-button" data-equip-weapon="${item.id}" ${equipped?'disabled':''}>${equipped?'当前装备':'装备'}</button>`:''}</article>`}).join('');
  set(`<main class="campaign-shell inner"><section class="campaign-page library-page shop-page"><header class="page-heading"><div class="shop-heading-row"><div><p class="eyebrow">商店 · 补给与装备</p><h1>把战果换成下一场的余地</h1></div><button class="text-button shop-home-button" data-return-title>返回标题</button></div><p>银币来自战斗；胜利奖励按章节翻倍。Boss 挑战不消耗口粮。</p><div class="campaign-status-line"><span>银币 <b>${campaignState.coins ?? 0}</b></span><span>口粮 <b>${campaignState.supplies}</b></span><span>药剂 <b>${campaignState.potions ?? 0}</b></span></div></header><div class="library-grid">${weapons}<article class="library-entry shop-entry"><div class="shop-art"><img src="/assets/images/shop/healing-vial.webp" alt="回血药剂" loading="lazy" width="256" height="256"></div><header><span>消耗品</span><small>恢复用</small></header><h2>回血药剂</h2><p>在战斗前储备，后续接入角色伤势恢复。</p><small class="shop-quip">喝下去不会让你忘记挨过的打，但能让你继续挨打。</small><button class="campaign-primary" data-buy-potion ${(campaignState.coins ?? 0)<5?'disabled':''}>购买 · 5 银币</button></article></div></section></main>`);
  const rationCard=document.createElement('article');rationCard.className='library-entry shop-entry';rationCard.innerHTML=`<div class="shop-art"><img src="/assets/images/shop/rations.webp" alt="口粮" loading="lazy" width="256" height="256"></div><header><span>补给</span><small>3 份</small></header><h2>口粮</h2><p>普通战斗按出战人数消耗；Boss 战不消耗。</p><small class="shop-quip">没有口粮，最勇敢的军阵也只能讨论晚饭。</small><button class="campaign-primary" data-buy-rations ${((campaignState.coins??0)<3)?'disabled':''}>购买 3 份 · 3 银币</button>`;document.querySelector('.library-grid')?.prepend(rationCard);
  rationCard.querySelector<HTMLButtonElement>('[data-buy-rations]')?.addEventListener('click',()=>{persistCampaign(buyCampaignRations(campaignState,3));renderShop()});
  document.querySelectorAll<HTMLButtonElement>('[data-buy-weapon]').forEach(button=>button.onclick=()=>{persistCampaign(buyCampaignWeapon(campaignState,button.dataset.buyWeapon as CampaignWeaponId));renderShop()});
  document.querySelectorAll<HTMLButtonElement>('[data-equip-weapon]').forEach(button=>button.onclick=()=>{persistCampaign(equipCampaignWeapon(campaignState,button.dataset.equipWeapon as CampaignWeaponId));renderShop()});
  document.querySelector<HTMLButtonElement>('[data-buy-potion]')?.addEventListener('click',()=>{persistCampaign(buyCampaignPotion(campaignState));renderShop()});
}

function mountLibraryRevealControl(axis:LibraryAxis|string){
  const revealButton=document.createElement('button');revealButton.className='library-reveal-button';revealButton.type='button';revealButton.textContent='显示范围';document.querySelector('.library-page .page-heading')?.append(revealButton);
  revealButton.addEventListener('click',()=>{const modal=document.createElement('div');modal.className='library-reveal-modal';modal.innerHTML='<div class="library-reveal-card" role="dialog" aria-modal="true"><h2>是否允许所有的藏书馆内容展现？</h2><p>选择后只影响当前查看范围，不会改变剧情解锁进度。</p><div><button data-reveal="chapter-1">第一章</button><button data-reveal="chapter-2">第二章</button><button data-reveal="chapter-3">第三章</button><button data-reveal="all">全部开放</button><button data-reveal="cancel">取消</button></div></div>';document.body.append(modal);modal.querySelectorAll<HTMLButtonElement>('[data-reveal]').forEach(button=>button.onclick=()=>{if(button.dataset.reveal==='cancel'){modal.remove();return}localStorage.setItem('goddess-fall:library:reveal',button.dataset.reveal!);modal.remove();renderLibrary(axis as any)})});
}

function renderArchive(){
  persistCampaign(navigateCampaign(campaignState,'archive'));
  const progress=campaignProgress(campaignState);
  const checkpoint=campaignState.storyCheckpoint;
  const conditions=campaignState.roster.map(member=>`${characters[member.id].name} · ${conditionLabel[member.condition]}`).join(' / ');
  const payload=serializeCampaignArchive(campaignState);
  set(`<main class="campaign-shell inner">${flowHeader('archive')}<section class="campaign-page archive-page"><header class="page-heading"><p class="eyebrow">档案 · 存档与剧情推演</p><h1>使团记录不会遗失</h1><p>本地存档会在每次行动、剧情选择和战斗结果后自动更新。导出的档案包含当前状态与关键节点，可在另一台设备导入，或作为分歧剧情推演的起点。</p></header><div class="archive-summary"><article><small>通关进度</small><strong>节点 ${progress.completed}/${progress.total}</strong><span>第 ${progress.chapter} 章 · 当前周 ${campaignState.week}</span></article><article><small>当前节点</small><strong>${escapeHtml(progress.node)}</strong><span>${checkpoint?`已记录 ${checkpoint.completedNodeIds.length} 个剧情节点`:'尚未进入剧情节点'}</span></article><article><small>使团状态</small><strong>口粮 ${campaignState.supplies} · 证据 ${campaignState.evidence}</strong><span>安全 ${campaignState.civilianSafety}/3 · 凝聚 ${campaignState.cohesion}/5</span></article><article><small>出战与伤势</small><strong>${campaignState.lineup.map(id=>characters[id].name).join('、')}</strong><span>${escapeHtml(conditions)}</span></article></div><section class="archive-tools"><div><h2>导出关键节点</h2><p>下载或复制当前完整档案。导入后会从这个剧情节点、阵容、证据、关系与资源继续；它不覆盖原档，直到你确认导入。</p><button id="archive-download" class="campaign-primary">下载当前档案</button><button id="archive-copy" class="text-button">复制推演文本</button></div><div><h2>导入剧情推演</h2><p>粘贴此前导出的 JSON。格式或版本不匹配时不会改动当前存档。</p><textarea id="archive-import" rows="8" spellcheck="false" aria-label="粘贴存档档案"></textarea><button id="archive-import-button" class="campaign-primary">验证并载入档案</button><p id="archive-feedback" class="campaign-feedback" aria-live="polite">当前档案已自动保存。</p></div></section><details class="archive-preview"><summary>查看当前导出内容</summary><pre>${escapeHtml(payload)}</pre></details></section></main>`);
  const fullText=document.createElement('details');
  fullText.className='archive-fulltext';
  const fullEntries=campaignState.campaignId==='arthur-main'?mainlineLibraryEntriesForWeek(campaignState.week):[...libraryEntriesForWeek(campaignState.week),...supplementalLibraryEntriesForWeek(campaignState.week)];
  fullText.innerHTML=`<summary>查看已解锁设定全文（原文档案）</summary><p class="archive-fulltext-note">以下内容保留原设定条目，并按时间、区域、势力与人物分类；新增的游戏内解读会单独标注，不覆盖原文。</p>${fullEntries.map(entry=>`<article><header><span>${escapeHtml(entry.axis)}</span><small>${escapeHtml(entry.period??entry.region??'')}</small></header><h2>${escapeHtml(entry.title)}</h2><p>${escapeHtml(entry.text)}</p></article>`).join('')}`;
  document.querySelector('.archive-page')?.append(fullText);
  const feedback=document.querySelector<HTMLElement>('#archive-feedback');
  const report=(message:string)=>{if(feedback)feedback.textContent=message};
  document.querySelector<HTMLButtonElement>('#archive-download')?.addEventListener('click',()=>{
    const blob=new Blob([payload],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`goddess-fall-${progress.chapter}-${progress.completed}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),0);report('档案已下载；可将它保存为一个可反复推演的关键节点。');
  });
  document.querySelector<HTMLButtonElement>('#archive-copy')?.addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(payload);report('推演文本已复制。')}catch{report('浏览器拒绝剪贴板权限，请使用下方展开的文本手动复制。')}
  });
  document.querySelector<HTMLButtonElement>('#archive-import-button')?.addEventListener('click',()=>{
    const raw=document.querySelector<HTMLTextAreaElement>('#archive-import')?.value??'';const archive=parseCampaignArchive(raw);
    if(!archive){report('未载入：这不是受支持的《女神之殇》档案，当前进度保持不变。');return}
    if(!confirm(`载入“${archive.label}”？当前本地进度将被这份档案替换。`))return;
    persistCampaign(archive.state);lineupDraft=[...campaignState.lineup];renderCampaign(campaignState.view); 
  });
}

function renderStartup(){
  if(!app)return;
  const hasSideSave=Boolean(localStorage.getItem(campaignSaveKey));
  const mainlineSaveKey='goddess-fall:campaign:arthur-main:v1';
  const hasMainlineSave=Boolean(localStorage.getItem(mainlineSaveKey));
  app.innerHTML=`<main class="startup-screen"><div class="startup-backdrop" role="img" aria-label="圣辉城档案厅与远方圣火之城"></div><section class="startup-card"><h1>女神之殇</h1><div class="startup-campaign-grid"><article class="startup-campaign-entry"><div class="startup-entry-title"><span class="startup-entry-index">01</span><h2>铁与火</h2></div><div class="startup-entry-actions"><button id="startup-mainline-continue" class="campaign-primary" type="button" ${hasMainlineSave?'':'disabled'}>${hasMainlineSave?'继续':'暂无存档'}</button><button id="startup-mainline-new" class="text-button" type="button">新建</button></div></article><article class="startup-campaign-entry"><div class="startup-entry-title"><span class="startup-entry-index">02</span><h2>无旗使团</h2></div><div class="startup-entry-actions"><button id="startup-side-continue" class="campaign-primary" type="button" ${hasSideSave?'':'disabled'}>${hasSideSave?'继续':'暂无存档'}</button><button id="startup-side-new" class="text-button" type="button">新建</button></div></article></div><div class="startup-global-actions"><button id="startup-load" class="text-button" type="button">选择存档</button><input id="startup-file" type="file" accept=".json,application/json" hidden></div><small class="startup-note">本地存档 · 音乐将在首次点击后启用</small></section></main>`;
  const fileInput=document.querySelector<HTMLInputElement>('#startup-file')!;
  document.querySelector('#startup-load')?.addEventListener('click',()=>{void audioManager.unlock();showSaveHint(()=>fileInput.click())});
  fileInput.onchange=()=>{const file=fileInput.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{const archive=parseCampaignArchive(String(reader.result??''));if(!archive){alert('无法载入：请选择有效的《女神之殇》存档 JSON。');return}persistCampaign(archive.state);lineupDraft=[...campaignState.lineup];renderCampaign(campaignState.view)};reader.readAsText(file)};
  audioManager.setScene('title');
  document.querySelector('#startup-mainline-continue')?.addEventListener('click',()=>{void audioManager.unlock();campaignState=loadCampaignById(localStorage,'arthur-main');lineupDraft=[...campaignState.lineup];renderCampaign(campaignState.view)});
  document.querySelector('#startup-mainline-new')?.addEventListener('click',()=>{void audioManager.unlock();persistCampaign(createMainlineCampaignState());lineupDraft=[...campaignState.lineup];renderCampaignHome()});
  document.querySelector('#startup-side-continue')?.addEventListener('click',()=>{void audioManager.unlock();campaignState=loadCampaignById(localStorage,'unflagged-side');lineupDraft=[...campaignState.lineup];renderCampaign(campaignState.view)});
  document.querySelector('#startup-side-new')?.addEventListener('click',()=>{void audioManager.unlock();persistCampaign(createCampaignState());lineupDraft=[...campaignState.lineup];renderCampaignHome()});
}

function title(){
  if(!initialBootVisible){renderStartup();return}
  initialBootVisible=false;
  const boot=app?.querySelector<HTMLElement>('.boot');
  if(!boot){renderStartup();return}
  const started=performance.now();
  let finished=false;
  const finish=()=>{
    if(finished)return;
    finished=true;
    const remaining=Math.max(0,720-(performance.now()-started));
    window.setTimeout(()=>{
      boot.classList.add('boot-leaving');
      window.setTimeout(renderStartup,260);
    },remaining);
  };
  const backdrop=new Image();
  backdrop.onload=finish;
  backdrop.onerror=finish;
  backdrop.src='/assets/images/title-archive-gateway.webp';
  window.setTimeout(finish,1500);
}

addEventListener('goddess:return-title',title);

function renderNode(id:string){
  currentNodeId=id;const node=currentChapter().nodes[id];
  if(!node)throw new Error(`Unknown story node: ${id}`);
  const previous=campaignState.storyCheckpoint;
  const completed=previous?.chapterId===currentChapter().id&&previous.currentNodeId!==id
    ? [...new Set([...previous.completedNodeIds,previous.currentNodeId])]
    : previous?.chapterId===currentChapter().id?[...previous.completedNodeIds]:[];
  const checkpointState={
    flags:Object.fromEntries(Object.entries(storyState.flags).filter((entry):entry is [string,boolean]=>typeof entry[1]==='boolean')),
    evidence:[...storyState.evidence],
    stats:{...storyState.stats},
  };
  persistCampaign(setStoryCheckpoint(navigateCampaign(campaignState,node.kind==='battle'?'battle':'story'),{chapterId:currentChapter().id,currentNodeId:id,completedNodeIds:completed,storyState:checkpointState}));
  if(node.kind==='battle'){startBattle(node.id);return}
  if(node.kind==='ending'){renderEnding(node);return}
  renderDialogue(node);
}

function renderDialogue(node:DialogueNode){
  const chapter=currentChapter();
  const speakerIds=[...new Set(node.lines.flatMap(line=>line.speakerId?[line.speakerId]:[]))];
  const latestSpeaker=[...node.lines].reverse().find(line=>line.speakerId)?.speakerId;
  const latestLineBySpeaker=new Map<string,DialogueNode['lines'][number]>();
  node.lines.forEach(line=>{if(line.speakerId)latestLineBySpeaker.set(line.speakerId,line)});
  const portraitStateForLine=(line:DialogueNode['lines'][number]|undefined):DialoguePortraitState=>line?.portraitState??(line?.emotion==='anger'?'attack':line?.emotion==='fear'?'hit':'idle');
  const speakerPosition=(index:number,count:number)=>count===1?'center':count===2?(index===0?'left':'right'):(index===0?'left':index===1?'center':'right');
  const cast=speakerIds.map((id,index)=>{const speaker=characters[id];const state=portraitStateForLine(latestLineBySpeaker.get(id));const src=dialoguePortraitForState(id,state)??portraitByCharacter[id as CampaignCharacterId];const fallback=legacyDialoguePortraitByCharacter[id]??portraitByCharacter[id as CampaignCharacterId];if(!speaker||!src)return '';return `<img class="vn-character ${speakerPosition(index,speakerIds.length)} ${id===latestSpeaker?'speaking':''}" src="${src}" data-portrait-state="${state}" data-dialogue-fallback="${fallback??''}" alt="${escapeHtml(speaker.name)}" loading="eager" decoding="async">`}).join('');
  const lines=node.lines.map(line=>{const speaker=line.speakerId?characters[line.speakerId]:undefined;const color=speaker?factions[speaker.factionId].color:'#c8c5bd';return `<div class="dialogue-line ${line.speakerId===latestSpeaker?'current-line':''}">${speaker?`<strong class="speaker" style="--faction:${color}">${escapeHtml(speaker.name)} · ${escapeHtml(speaker.title)}</strong>`:''}<p>${escapeHtml(line.text)}</p>${line.stageDirection?`<small>${escapeHtml(line.stageDirection)}</small>`:''}</div>`}).join('');
  const choices=node.choices.filter(choice=>meets(choice.condition)).map(choice=>`<button data-choice="${choice.id}">${escapeHtml(choice.label)}${choice.hint?`<span>${escapeHtml(choice.hint)}</span>`:''}</button>`).join('');
  const backdrop=node.artwork??chapter.artwork;
  set(`<main class="screen story"><section class="vn-stage" aria-label="${escapeHtml(chapter.title)}剧情对话"><img class="vn-backdrop" src="${escapeHtml(backdrop.src)}" alt="${escapeHtml(backdrop.alt)}" loading="${node.artwork?'lazy':'eager'}" ${node.artwork?'':'fetchpriority="high"'} decoding="async"><div class="vn-cast" aria-hidden="true">${cast}</div><section class="vn-dialogue-panel"><header><p class="eyebrow">${chapter.title}</p><h2>${escapeHtml(node.title??chapter.title)}</h2></header><div class="dialogue">${lines}</div><p class="dialogue-scroll-hint">可向上滑动回看前文</p><div class="choices">${choices}</div></section></section></main>`);
  audioManager.setScene('story',{track:storyMusicForNode(node)});
  document.querySelectorAll<HTMLImageElement>('[data-dialogue-fallback]').forEach(image=>image.addEventListener('error',()=>{
    const fallback=image.dataset.dialogueFallback;
    if(fallback&&!image.dataset.fallbackTried){image.dataset.fallbackTried='true';image.src=fallback;return}
    image.hidden=true;
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-choice]').forEach(button=>button.onclick=()=>{const choice=node.choices.find(item=>item.id===button.dataset.choice);if(!choice)return;applyEffects(choice.effects);renderNode(choice.next)});
}

function storyMusicForNode(node:DialogueNode):MusicTrackId{
  const text=[node.title??'',...node.lines.map(line=>line.text)].join(' ');
  if(/温暖|安抚|团聚|归来|希望|灯火|柔和|守护|孩子|家人|相拥/.test(text))return 'archiveGateAlt';
  if(/悲|哀|牺牲|失去|死亡|废墟|灰烬|烧毁|告别|哭|伤势|无温/.test(text))return text.length%2?'ashesMap':'ashesMapAlt';
  if(/冲锋|开战|战斗|追击|爆发|审判|军阵|号角|愤怒|激动|决战|兵变/.test(text))return 'shadowMarch';
  return 'lanternMapAlt';
}

function meets(condition?:StoryCondition){
  if(!condition)return true;
  return (condition.flagsAll??[]).every(flag=>storyState.flags[flag])&&(condition.flagsNone??[]).every(flag=>!storyState.flags[flag])&&(condition.evidenceAll??[]).every(id=>storyState.evidence.includes(id))&&Object.entries(condition.statAtLeast??{}).every(([key,value])=>storyState.stats[key as keyof StoryState['stats']]>=value!);
}

function applyEffects(effects?:StoryEffect){
  for(const flag of effects?.setFlags??[])storyState.flags[flag]=true;
  for(const id of effects?.addEvidence??[])if(!storyState.evidence.includes(id))storyState.evidence.push(id);
  for(const [key,value] of Object.entries(effects?.statChanges??{}))storyState.stats[key as keyof StoryState['stats']]+=value??0;
}

function roster(battleId:string):UnitTemplate[]{
  const positions=[{x:1,y:6},{x:2,y:6},{x:1,y:7}];
  const templates:Record<CampaignCharacterId,Omit<UnitTemplate,'position'>>={
    the_unflagged:{id:'u1',name:'无旗者',team:'player',...characterBattleProfiles.the_unflagged},
    seraphina:{id:'u2',name:'塞拉菲娜',team:'player',...characterBattleProfiles.seraphina},
    reina:{id:'u3',name:'蕾娜',team:'player',...characterBattleProfiles.reina},
    odric:{id:'u4',name:'奥德里克',team:'player',...characterBattleProfiles.odric},
    cole:{id:'u5',name:'科尔',team:'player',...characterBattleProfiles.cole},
    agnes:{id:'u6',name:'阿格尼丝',team:'player',...characterBattleProfiles.agnes},
    arthur:{id:'u-arthur',name:'亚瑟',team:'player',...mainlineCharacterBattleProfiles.arthur},
    hans:{id:'u-hans',name:'汉斯',team:'player',...mainlineCharacterBattleProfiles.hans},
    asnoka:{id:'u-asnoka',name:'阿斯诺卡',team:'player',...mainlineCharacterBattleProfiles.asnoka},
  };
  const enemies:UnitTemplate[]=battleId==='odric-judgment'?[
    {id:'boss-odric',name:'奥德里克',team:'enemy',position:{x:6,y:1},health:8,faith:9,moveRange:2,attackDamage:3,faithDamage:2},
    {id:'e2',name:'城门盾卫',visualKey:'shield-guard',team:'enemy',position:{x:5,y:1},health:6,faith:5,moveRange:1,attackDamage:3},
    {id:'e3',name:'封锁书记',visualKey:'faith-acolyte',team:'enemy',position:{x:6,y:2},health:4,faith:7,faithDamage:3},
  ]:battleId==='border-machines'?[
    {id:'e1',name:'锁轴监军',visualKey:'engineer',team:'enemy',position:{x:6,y:1},health:7,faith:4,moveRange:2,attackDamage:4},
    {id:'e2',name:'巡渠斥候',visualKey:'scout',team:'enemy',position:{x:5,y:1},health:4,faith:5,moveRange:4,attackDamage:2},
    {id:'e3',name:'编号抄写员',visualKey:'faith-acolyte',team:'enemy',position:{x:6,y:2},health:4,faith:7,moveRange:2,faithDamage:3},
  ]:battleId==='grain-crossing'?[
    {id:'e1',name:'伪旗骑手',visualKey:'raider-rider',team:'enemy',position:{x:6,y:1},health:6,faith:5,moveRange:4,attackDamage:3},
    {id:'e2',name:'粮契掮客',visualKey:'faith-acolyte',team:'enemy',position:{x:5,y:1},health:4,faith:8,moveRange:2,faithDamage:4},
    {id:'e3',name:'水门破坏者',visualKey:'engineer',team:'enemy',position:{x:6,y:2},health:5,faith:4,moveRange:3,attackDamage:3},
  ]:battleId==='silent-march'?[
    {id:'e1',name:'无声追猎者',visualKey:'scout',team:'enemy',position:{x:6,y:1},health:7,faith:6,moveRange:4,attackDamage:4},
    {id:'e2',name:'内心审查官',visualKey:'faith-acolyte',team:'enemy',position:{x:5,y:1},health:5,faith:9,moveRange:2,faithDamage:4},
    {id:'e3',name:'雾门守卫',visualKey:'shield-guard',team:'enemy',position:{x:6,y:2},health:8,faith:4,moveRange:1,attackDamage:3},
  ]:battleId==='veiled-avatar'?[
    {id:'boss-veiled-avatar',name:'守幕圣像',team:'enemy',position:{x:6,y:1},health:12,faith:12,moveRange:2,attackDamage:4,faithDamage:3},
    {id:'e2',name:'见证封印',visualKey:'faith-acolyte',team:'enemy',position:{x:5,y:1},health:6,faith:7,faithDamage:3},
    {id:'e3',name:'无名灯卫',visualKey:'shield-guard',team:'enemy',position:{x:6,y:2},health:6,faith:6,attackDamage:3},
  ]:battleId==='iron-bulwark'?[ 
    {id:'boss-iron-bulwark',name:'铁窗壁垒',team:'enemy',position:{x:6,y:1},health:10,faith:8,moveRange:1,attackDamage:2,faithDamage:1},
    {id:'e2',name:'壁垒护卫',visualKey:'shield-guard',team:'enemy',position:{x:5,y:1},health:5,faith:5,moveRange:2,attackDamage:2,faithDamage:1},
    {id:'e3',name:'工坊监军',visualKey:'engineer',team:'enemy',position:{x:6,y:2},health:4,faith:7,moveRange:2,attackDamage:2,faithDamage:2},
  ]:battleId==='white-knight-charge'?[ 
    {id:'boss-white-knight',name:'白光骑士长',team:'enemy',position:{x:6,y:1},health:11,faith:8,moveRange:2,attackDamage:4,faithDamage:2},
    {id:'e2',name:'白光盾卫',visualKey:'shield-guard',team:'enemy',position:{x:5,y:1},health:6,faith:5,moveRange:2,attackDamage:3},
    {id:'e3',name:'军令传令官',visualKey:'scout',team:'enemy',position:{x:6,y:2},health:4,faith:7,moveRange:3,faithDamage:3},
  ]:battleId==='night-judge'?[ 
    {id:'boss-night-judge',name:'永夜殿审判官',team:'enemy',position:{x:6,y:1},health:12,faith:13,moveRange:2,attackDamage:3,faithDamage:5},
    {id:'e2',name:'内心审查官',visualKey:'faith-acolyte',team:'enemy',position:{x:5,y:1},health:5,faith:9,moveRange:2,faithDamage:4},
    {id:'e3',name:'黑廷执灯人',visualKey:'faith-acolyte',team:'enemy',position:{x:6,y:2},health:6,faith:6,moveRange:2,attackDamage:3},
  ]:battleId==='lake-dual-god'?[ 
    {id:'boss-lake-god-a',name:'湖都双邪神·赤核',team:'enemy',position:{x:6,y:1},health:14,faith:12,moveRange:2,attackDamage:4,faithDamage:4},
    {id:'boss-lake-god-b',name:'湖都双邪神·白核',team:'enemy',position:{x:6,y:2},health:12,faith:14,moveRange:2,attackDamage:3,faithDamage:5},
    {id:'e3',name:'信仰扩散侍从',visualKey:'faith-acolyte',team:'enemy',position:{x:5,y:1},health:6,faith:8,moveRange:3,faithDamage:3},
  ]:[
    {id:'e1',name:'女神骑士',visualKey:'shield-guard',team:'enemy',position:{x:6,y:1},health:6,faith:5},
    {id:'e2',name:'狂热侍从',visualKey:'faith-acolyte',team:'enemy',position:{x:5,y:1},health:4,faith:4},
    {id:'e3',name:'狂热侍从',visualKey:'cultist-melee',team:'enemy',position:{x:6,y:2},health:4,faith:4},
  ];
  return[...campaignState.lineup.map((id,index)=>({...templates[id],position:positions[index]})),...enemies]
}

function terrainForBattle(battleId:string):TerrainCell[]{
  const mainlineTerrain=terrainForBattleScene(battleId);
  if(mainlineTerrain)return mainlineTerrain;
  const cell=(x:number,y:number,kind:TerrainCell['kind'],interactable=false,label?:string,assetId?:string):TerrainCell=>({position:{x,y},kind,blocksMovement:kind==='holy-fire'||kind==='ruin-cover'||kind==='mechanism',interactable,active:true,label,assetId});
  if(battleId==='holy-square-crisis'||battleId==='odric-judgment')return[
    cell(3,3,'holy-fire',true,'圣火祭坛','altar'),cell(4,3,'holy-fire',true,'圣火祭坛','brazier'),
    cell(2,4,'ruin-cover',false,undefined,'wall-broken'),cell(5,4,'ruin-cover',false,undefined,'column'),cell(3,5,'brush',false,undefined,'bush'),
  ];
  if(battleId==='border-machines'||battleId==='grain-crossing'||battleId==='iron-bulwark')return[
    cell(3,3,'mechanism',true,'锁轴机关','valve-wheel'),cell(4,3,'mechanism',true,'锁轴机关','anvil-block'),
    cell(2,4,'mud',false,undefined,'mud-patch'),cell(5,4,'mud',false,undefined,'mud-patch'),cell(3,5,'ruin-cover',false,undefined,'iron-fence'),
  ];
  if(battleId==='arthur-execution-escape'||battleId==='white-knight-charge'||battleId==='arthur-four-country-war')return[
    cell(3,3,'holy-fire',true,'军旗火盆','brazier'),cell(4,3,'holy-fire',true,'军旗火盆','altar'),
    cell(2,4,'ruin-cover',false,undefined,'wall-broken'),cell(5,4,'ruin-cover',false,undefined,'column'),cell(3,5,'brush',false,undefined,'bush'),
  ];
  if(battleId==='arthur-cathedral-evacuation'||battleId==='night-judge'||battleId==='lake-dual-god')return[
    cell(3,3,'mechanism',true,'传送锚点','veiled-anchor'),cell(4,3,'mechanism',true,'传送锚点','veiled-anchor'),
    cell(2,4,'ruin-cover',false,undefined,'veiled-pillar'),cell(5,4,'mud',false,undefined,'veiled-rubble'),cell(3,5,'holy-fire',true,'封印火盆','veiled-brazier'),
  ];
  if(battleId==='arthur-lowland-ambush'||battleId==='arthur-dragon-oath'||battleId==='arthur-steppe-supply')return[
    cell(3,3,'mechanism',true,'水闸/祭坛','valve-wheel'),cell(4,3,'mud',false,undefined,'mud-patch'),
    cell(2,4,'brush',false,undefined,'bush'),cell(5,4,'mud',false,undefined,'mud-patch'),cell(3,5,'ruin-cover',false,undefined,'grain-cart'),
  ];
  return [
    cell(3,3,'brush',true,'守幕锚点','veiled-anchor'),cell(4,3,'brush',true,'守幕锚点','veiled-anchor'),
    cell(2,4,'ruin-cover',false,undefined,'veiled-pillar'),cell(5,4,'mud',false,undefined,'veiled-rubble'),cell(3,5,'holy-fire',true,'余烬火盆','veiled-brazier'),
  ];
}

function tutorialStored(){try{return Boolean(localStorage.getItem(tutorialKey))}catch{return false}}
function startBattle(nodeId:string){
  persistCampaign(navigateCampaign(campaignState,'battle'));
  const node=currentChapter().nodes[nodeId];if(!node||node.kind!=='battle')return;
  battleNodeId=nodeId;
  battleEndingScheduled=false;
  fieldDispatchUsed=false;
  dangerWarningRound=0;
  bossRuntime=createBossRuntime(node.battleId);
  persistCampaign(consumeBattleRations(campaignState, Boolean(bossRuntime)));
  objectiveRuntime=createBattleObjectiveRuntime(node.battleId,campaignState.lineup);
  const missionModified=applyOpeningMissionModifiers(createBattle(roster(node.battleId),terrainForBattle(node.battleId)),objectiveRuntime,campaignState.lineup);
  const campaignModified=applyCampaignBattleModifiers(missionModified,campaignState);
  const storyModified=applyStoryBattleModifiers(campaignModified.state,node.battleId,storyState.flags);
  battleState=storyModified.state;
  storyBattleNotes=[...campaignModified.notes,...storyModified.notes];
  selectedId=undefined;attackMode=undefined;undoSnapshot=undefined;battleLog.length=0;tutorial=bossRuntime?'off':tutorialForced||!tutorialStored()?'intro':'off';tutorialForced=false;
  renderBattleShell();
  audioManager.setScene(bossRuntime?'boss':'battle',{track:!bossRuntime&&campaignState.campaignId==='unflagged-side'?'abyssGatefallSide':undefined,campaignId:campaignState.campaignId,bossPhase:bossRuntime?(currentBossPhase(bossRuntime)?.phase===2?2:1):undefined});
  syncBattle('选择一名尚未行动的同伴，查看可达范围与敌方意图。');
}

function renderBattleShell(){
  const chapter=currentChapter(),node=chapter.nodes[battleNodeId];if(!node||node.kind!=='battle'||!battleState)return;
  set(`<main class="battle"><header><div><p class="eyebrow">${chapter.title}</p><h2>${escapeHtml(node.title)}</h2></div><div class="objective">${node.objectives.map(escapeHtml).join(' · ')}</div></header><section class="battle-layout"><div id="viewport" aria-label="8乘8三维战术棋盘"></div><aside><div class="battle-meta"><strong id="phase"></strong><span id="remaining"></span></div><div id="mission-objective" class="mission-objective" aria-live="polite"></div><div id="boss-phase" class="boss-phase" aria-live="polite"></div><section id="tutorial" class="tutorial" aria-live="polite"></section><h3>战况</h3><p id="status" aria-live="polite"></p><div id="unit-card" class="unit-card" tabindex="0">选择单位查看状态</div><div id="attack-controls" class="attack-controls"></div><button id="undo" class="ghost" disabled>撤回本次移动</button><div id="dispatch-controls" class="dispatch-controls" aria-live="polite"></div><section class="intents"><h3>敌方意图</h3><div id="intent-list"></div></section><section class="battle-log"><h3>最近战报</h3><ol id="battle-log"></ol></section><button id="wait" data-action="end-phase">结束我方阶段</button><button id="help" class="ghost">重看教程</button><button id="retreat" class="ghost">退出战斗</button></aside></section></main>`);
  const view=document.querySelector<HTMLElement>('#viewport')!;
  try{const basePreset=battleScenePresetFor(node.battleId);const visualPreset=basePreset??{id:node.battleId,title:node.title,region:chapter.title,terrain:[],palette:paletteForBattleId(node.battleId)};battlefield=new Battlefield(view,battleState,onBattleInput,visualPreset);if(new URLSearchParams(location.search).has('qa'))qaWindow.__goddessBattlefield=battlefield}catch(err){view.innerHTML=`<div class="error">3D战场无法启动。请确认浏览器已启用 WebGL。<br><small>${escapeHtml(String(err))}</small><br><button id="retry" class="primary">重试</button></div>`;document.querySelector('#retry')?.addEventListener('click',()=>startBattle(battleNodeId))}
  document.querySelector('#wait')?.addEventListener('click',endPhase);
  document.querySelector('#undo')?.addEventListener('click',undoLastMove);
  document.querySelector('#help')?.addEventListener('click',()=>{tutorial='intro';tutorialForced=true;renderTutorial()});
  document.querySelector('#retreat')?.addEventListener('click',()=>{if(confirm('退出将放弃本场战斗进度，确定吗？'))renderCampaignHome()});
}

function onBattleInput(input:BattleInput){
  if(!battleState||battleState.phase!=='player')return;
  if(tutorial==='intro'){syncBattle('请先点击教程卡片中的“开始指引”。');return}
  if(input.type==='cancel'){audioManager.playSfx('cancel');selectedId=undefined;setAttackMode(undefined);syncBattle('已取消选择。');return}
  if(input.type==='inspect'){audioManager.playSfx('select');undoSnapshot=undefined;selectedId=input.unitId;setAttackMode(undefined);syncBattle('已选中敌方单位，仅查看状态；请选择我方单位并选择攻击模式后才能攻击。');return}
  if(input.type==='select'){audioManager.playSfx('select');if(selectedId&&selectedId!==input.unitId)undoSnapshot=undefined;selectedId=input.unitId;setAttackMode(undefined);syncBattle();tutorialEvent('select');return}
  if(input.type==='terrain'){
    const actor=selectedId?unitById(selectedId):undefined;if(!actor){syncBattle('先选择一名尚未行动的同伴，再靠近地形互动。');return}
    const result=interactTerrain(battleState,actor.id,input.position);if(result.ok)audioManager.playSfx('terrain');resolveAction(result,`${actor.name} 处理了${input.kind==='holy-fire'?'圣火':input.kind==='mechanism'?'机关':'地形'}：${terrainInteractionLabel(actor,{kind:input.kind})}。`,undefined,input.position);if(result.ok){selectedId=undefined;undoSnapshot=undefined}
    return;
  }
  if(input.type==='move'){
    const actor=unitById(input.unitId);if(!actor)return;
    if(tutorial==='move-three'&&distance(actor.position,input.destination)!==3){syncBattle('教程：这一步请尝试完整的 3 格移动。');return}
    const from={...actor.position},result=moveUnit(battleState,input.unitId,input.destination),animation:BattleAnimation={type:'move',unitId:input.unitId,from,to:input.destination};resolveAction(result,`${actor.name} 移动到 (${input.destination.x+1},${input.destination.y+1})。`,animation,input.destination);if(result.ok){undoSnapshot={unitId:input.unitId,from,to:input.destination,round:battleState.round};syncBattle();tutorialEvent('move')}return;
  }
  if(input.type==='attack'){
    if(tutorial==='move-three'){syncBattle('先完成一次三格移动，再练习攻击。');return}
    const actor=unitById(input.unitId),target=unitById(input.targetId);if(!actor||!target)return;
    undoSnapshot=undefined;const before=input.damageKind==='faith'?target.faith:target.health,result=attackUnit(battleState,input.unitId,input.targetId,input.damageKind),after=result.state.units.find(unit=>unit.id===target.id),amount=Math.max(0,before-(input.damageKind==='faith'?(after?.faith??before):(after?.health??before))),animation:BattleAnimation={type:'attack',unitId:input.unitId,targetId:input.targetId,damageKind:input.damageKind,amount,visualAction:input.damageKind==='faith'&&['u2','u6'].includes(input.unitId)?'skill':undefined};resolveAction(result,`${actor.name} 对 ${target.name} 造成${input.damageKind==='faith'?'信念':'生命'}伤害，坐标 (${target.position.x+1},${target.position.y+1})。`,animation,target.position);if(result.ok)setAttackMode(undefined);
  }
}

function resolveAction(result:{state:BattleState;ok:boolean;reason?:string},message:string,animation?:BattleAnimation,cell?:{x:number;y:number}){
  if(!result.ok){audioManager.playSfx('error');syncBattle(reasonZh(result.reason));return}
  if(animation?.type==='move')audioManager.playSfx('move');
  if(animation?.type==='attack'){
    audioManager.playSfx(animation.damageKind==='faith'?'attackFaith':'attackHealth');
    setTimeout(()=>audioManager.playSfx('hit'),reducedMotion?0:190);
  }
  if(animation?.type==='skill')audioManager.playSfx('skill');
  battleState=result.state;battleLog.unshift({text:message,cell});battleLog.splice(3);
  const transition=applyCurrentBossTransition();
  const objective=applyMissionObjective();
  battlefield?.sync(battleState,animation);syncBattle(transition??objective??message);finishIfNeeded();
}

function applyCurrentBossTransition(){
  if(!battleState||!bossRuntime)return;
  const result=advanceBossPhase(battleState,bossRuntime);if(!result.transitioned)return;
  battleState=result.state;bossRuntime=result.runtime;selectedId=undefined;attackMode=undefined;undoSnapshot=undefined;
  const phase=currentBossPhase(bossRuntime)!;
  audioManager.setScene('boss',{bossPhase:phase.phase===2?2:1});
  const message=`阶段转换：${phase.title}。${phase.intentSummary}`;
  battleLog.unshift({text:message});battleLog.splice(3);
  const phaseAction=phase.phase===2?'boss_phase_2':'boss_phase_1';
  const phaseUnitIds=bossRuntime.config.phaseUnitIds??[bossRuntime.config.bossUnitId];
  for(const unitId of phaseUnitIds){
    battlefield?.setUnitVisualPhase(unitId,phase.phase);
    setTimeout(()=>battlefield?.playUnitAction(unitId,phaseAction,650),reducedMotion?0:360);
  }
  return message;
}

function applyLakeMutualSiphon(){
  if(battleNodeId!=='lake-dual-god'||bossRuntime?.phaseIndex!==1||!battleState)return;
  const ids=new Set(['boss-lake-god-a','boss-lake-god-b']);
  const active=battleState.units.filter(unit=>ids.has(unit.id)&&isActive(unit));
  if(active.length<2)return;
  battleState={...battleState,units:battleState.units.map(unit=>ids.has(unit.id)?{...unit,health:Math.max(1,unit.health-1),faith:Math.max(1,unit.faith-1)}:unit)};
  battleLog.unshift({text:'神力互噬：赤核与白核彼此撕裂，各失去 1 点生命与信念。'});battleLog.splice(3);
}

function applyMissionObjective(advanceRound=false){
  if(!battleState||!objectiveRuntime)return;
  const evaluation=evaluateBattleObjective(battleState,objectiveRuntime,advanceRound);objectiveRuntime=evaluation.runtime;
  if(evaluation.phase!=='active')battleState={...battleState,phase:evaluation.phase,enemyIntents:[]};
  if(evaluation.phase==='defeat'&&evaluation.consequence){battleLog.unshift({text:`任务失败：${evaluation.consequence}`});battleLog.splice(3)}
  return evaluation.phase==='active'?undefined:evaluation.phase==='victory'?`任务完成：${evaluation.progressText}`:`任务失败：${evaluation.consequence}`;
}

function setAttackMode(mode?:'health'|'faith'){
  if(mode&&battlefield?.isBusy())return;
  audioManager.playSfx(mode?'select':'cancel');
  attackMode=mode;battlefield?.setAttackMode(mode);renderAttackControls();
  if(mode){syncBattle(`当前模式：${mode==='health'?'生命攻击':'信念打击'}。点击带目标环的合法敌人；再次点击可取消。`);tutorialEvent('attack-mode')}
}

function undoLastMove(){
  if(battlefield?.isBusy()||!battleState||!undoSnapshot||undoSnapshot.round!==battleState.round)return;
  const snapshot=undoSnapshot,result=undoMove(battleState,snapshot.unitId,snapshot.from);
  if(!result.ok){syncBattle(reasonZh(result.reason));return}
  const unit=result.state.units.find(item=>item.id===snapshot.unitId);audioManager.playSfx('cancel');battleState=result.state;undoSnapshot=undefined;selectedId=undefined;setAttackMode(undefined);battlefield?.sync(battleState,{type:'move',unitId:snapshot.unitId,from:snapshot.to,to:snapshot.from});battleLog.unshift({text:`${unit?.name??'单位'} 撤回移动，返回坐标 (${snapshot.from.x+1},${snapshot.from.y+1})。`,cell:snapshot.from});battleLog.splice(3);syncBattle('移动已撤回，该单位恢复为可行动；请重新选择单位。');
}

function endPhase(){
  if(battlefield?.isBusy()||!battleState||battleState.phase!=='player')return;
  if(tutorial==='intro'||tutorial==='select-unit'||tutorial==='move-three'){syncBattle('请先完成当前教程步骤。');return}
  if(tutorial==='read-vitals'){syncBattle('先点击单位卡，了解生命与信念。');return}
  if(tutorial==='read-intent'){syncBattle('先点击一条敌方意图，再决定是否结束阶段。');return}
  if(tutorial==='end-phase'){tutorialRound=battleState.round;tutorial='observe-enemy'}
  undoSnapshot=undefined;setAttackMode(undefined);const before=battleState;
  if(campaignState.campaignId==='arthur-main'&&campaignState.mainline?.skills.includes('danger-warning')&&dangerWarningRound!==before.round){
    const warning=[...before.enemyIntents].sort((a,b)=>(b.type==='attack'?(b.amount??0):0)-(a.type==='attack'?(a.amount??0):0))[0];
    const warningCell=warning?.type==='attack'?before.units.find(unit=>unit.id===warning.targetId)?.position:warning?.destination;
    if(warningCell){battlefield?.flashCell(warningCell.x,warningCell.y);battleLog.unshift({text:`危险预警：红色意图最危险的目标格在 (${warningCell.x+1},${warningCell.y+1})。`,cell:warningCell});battleLog.splice(3)}
    dangerWarningRound=before.round;
  }
  audioManager.playSfx('endPhase');
  const after=endPlayerTurn(before);
  battleState={...before,phase:'enemy'};battlefield?.sync(battleState);syncBattle('敌方阶段：正在执行已预告的行动……');renderTutorial();
  setTimeout(()=>{battleState=after;selectedId=undefined;applyLakeMutualSiphon();const objective=applyMissionObjective(true);battlefield?.sync(battleState);for(const intent of [...before.enemyIntents].reverse()){const actor=before.units.find(unit=>unit.id===intent.unitId);if(intent.type==='move'){battleLog.unshift({text:`${actor?.name??'敌人'} 移动至 (${intent.destination.x+1},${intent.destination.y+1})。`,cell:intent.destination})}else{const target=before.units.find(unit=>unit.id===intent.targetId),cell=target?.position;battleLog.unshift({text:`${actor?.name??'敌人'} 在 (${(cell?.x??0)+1},${(cell?.y??0)+1}) 攻击 ${target?.name??'目标'}。`,cell})}}battleLog.splice(3);syncBattle(objective??`第 ${battleState.round} 回合开始；所有存活同伴恢复行动。`);if(tutorial==='observe-enemy'&&(battleState.round===tutorialRound+1||battleState.phase==='victory'||battleState.phase==='defeat'))completeTutorial();finishIfNeeded()},reducedMotion?0:500);
}

function syncBattle(message?:string){
  if(!battleState)return;
  const phase=document.querySelector<HTMLElement>('#phase'),remaining=document.querySelector<HTMLElement>('#remaining'),status=document.querySelector<HTMLElement>('#status'),wait=document.querySelector<HTMLButtonElement>('#wait'),undo=document.querySelector<HTMLButtonElement>('#undo');
  if(phase)phase.textContent=`第 ${battleState.round} 回合 · ${battleState.phase==='player'?'我方阶段':battleState.phase==='enemy'?'敌方阶段':'战斗结束'}`;
  if(remaining)remaining.textContent=`剩余可行动 ${activePlayers()} 人`;
  if(status&&message)status.textContent=message;
  if(wait)wait.disabled=battleState.phase!=='player';
  if(undo)undo.disabled=!undoSnapshot||undoSnapshot.round!==battleState.round;
  const bossPhase=document.querySelector<HTMLElement>('#boss-phase'),boss=currentBossPhase(bossRuntime);
  if(bossPhase){const artwork=bossRuntime?.config.artwork;bossPhase.hidden=!boss;bossPhase.classList.toggle('has-art',Boolean(boss&&artwork));bossPhase.innerHTML=boss?`${artwork?`<img src="${escapeHtml(artwork.src)}" alt="${escapeHtml(artwork.alt)}" loading="lazy" decoding="async">`:''}<div><strong>${escapeHtml(boss.title)}</strong><span>${escapeHtml(boss.intentSummary)}</span></div>`:''}
  const mission=document.querySelector<HTMLElement>('#mission-objective');
  if(mission&&objectiveRuntime){const evaluation=evaluateBattleObjective(battleState,objectiveRuntime),notes=[...objectiveRuntime.activeRoleNotes,...storyBattleNotes];mission.innerHTML=`<strong>${escapeHtml(objectiveRuntime.config.title)}</strong><span>${escapeHtml(evaluation.progressText)}</span>${notes.length?`<small>${notes.map(escapeHtml).join(' · ')}</small>`:''}`}
  renderUnitCard();renderAttackControls();renderDispatchControls();renderIntents();renderLog();renderTutorial();
}

function renderDispatchControls(){
  const root=document.querySelector<HTMLElement>('#dispatch-controls');
  if(!root)return;
  const available=campaignState.campaignId==='arthur-main'&&campaignState.mainline?.skills.includes('field-dispatch')&&!fieldDispatchUsed&&battleState?.phase==='player'
    ? battleState.units.filter(unit=>unit.team==='player'&&isActive(unit)&&unit.acted)
    : [];
  root.innerHTML=available.length?`<small>临时调度：让一名已行动单位重新获得一次行动</small>${available.map(unit=>`<button class="ghost" data-dispatch-unit="${escapeHtml(unit.id)}">调度 ${escapeHtml(unit.name)}</button>`).join('')}`:'';
  root.querySelectorAll<HTMLButtonElement>('[data-dispatch-unit]').forEach(button=>button.onclick=()=>dispatchUnit(button.dataset.dispatchUnit!));
}

function dispatchUnit(unitId:string){
  if(fieldDispatchUsed||!battleState||battleState.phase!=='player'||!campaignState.mainline?.skills.includes('field-dispatch'))return;
  const unit=battleState.units.find(candidate=>candidate.id===unitId);
  if(!unit||unit.team!=='player'||!isActive(unit)||!unit.acted)return;
  battleState={...battleState,units:battleState.units.map(candidate=>candidate.id===unitId?{...candidate,acted:false}:candidate)};
  fieldDispatchUsed=true;
  selectedId=unitId;
  battleLog.unshift({text:`临时调度：${unit.name}重新获得一次行动。`});battleLog.splice(3);
  battlefield?.sync(battleState);syncBattle('临时调度已使用；这名单位可以再次移动、攻击或施放技能。');
}

function renderUnitCard(){
  const card=document.querySelector<HTMLElement>('#unit-card'),unit=unitById(selectedId);if(!card)return;
  if(!unit){card.innerHTML='选择单位查看状态';return}
  const health=Math.round(unit.health/unit.maxHealth*100),faith=Math.round(unit.faith/unit.maxFaith*100);
  const intent=unit.team==='enemy'?battleState?.enemyIntents.find(item=>item.unitId===unit.id):undefined,intentText=intent?.type==='attack'?`下一步：攻击 ${unitById(intent.targetId)?.name??'目标'}，${intent.damageKind==='faith'?'信念':'生命'} -${intent.amount}`:intent?.type==='move'?'下一步：移动至红色脉冲格':'暂无预告';
  const states=[unit.exposed?'暴露':null,unit.guarded?'护持':null,unit.suppressed?'压制':null,unit.scorched?'灼痕':null].filter(Boolean).join(' · ');
  const movement=Math.max(1,unit.moveRange-(unit.suppressed?1:0));
  const passive=unit.team==='player'?passiveLabel(unit):undefined;
  card.classList.toggle('enemy-card',unit.team==='enemy');card.innerHTML=`<strong>${escapeHtml(unit.name)}${unit.team==='enemy'?' · 敌方':''}</strong><span data-vital="health">生命 ${unit.health}/${unit.maxHealth}</span><i class="meter"><b style="width:${health}%"></b></i><span data-vital="faith">信念 ${unit.faith}/${unit.maxFaith}</span><i class="meter faith"><b style="width:${faith}%"></b></i><small>${isActive(unit)?unit.team==='enemy'?intentText:unit.acted?'本回合已行动':'可行动 · 移动 '+movement+' 格':'已退出战斗'}${states?' · '+states:''}${passive?' · 被动：'+escapeHtml(passive):''}</small>`;
}

function renderAttackControls(){
  const root=document.querySelector<HTMLElement>('#attack-controls'),unit=unitById(selectedId);if(!root)return;
  if(!unit||unit.team!=='player'||unit.acted||!isActive(unit)){root.innerHTML='';return}
  const skill=unit.id==='u1'?`<button data-skill="witness-mark" class="skill">证词标记 · 最近敌人易伤</button>`:unit.id==='u2'?`<button data-skill="seraphina-restore" class="skill">守灯祷言 · 恢复最低信念队友</button>`:unit.id==='u3'?`<button data-skill="reina-overload" class="skill">过载拆解 · 最近敌人 -2生命</button>`:unit.id==='u4'?`<button data-skill="odric-guard" class="skill">盾墙 · 护持最低生命队友</button>`:unit.id==='u5'?`<button data-skill="cole-rally" class="skill">集结号 · 恢复队友状态</button>`:unit.id==='u6'?`<button data-skill="agnes-rite" class="skill">余烬祷告 · 信念 -3</button>`:unit.id==='u-arthur'?`<button data-skill="arthur-guardbreak" class="skill">破阵 · 生命 -2 并压制</button>`:unit.id==='u-hans'?`<button data-skill="hans-intercept" class="skill">拦截 · 生命 -1 并护持</button>`:unit.id==='u-asnoka'?`<button data-skill="asnoka-scout" class="skill">侦察标记 · 暴露目标</button>`:'';
  const cooldown=unit.skillCooldown?`（冷却 ${unit.skillCooldown} 回合）`:'';
  const specialty=terrainSpecialtyLabel(unit);
  root.innerHTML=`<p>选择攻击方式（不会自动出手）</p><div><button data-attack="health" class="health ${attackMode==='health'?'active':''}">生命攻击 · ${unit.attackDamage}</button><button data-attack="faith" class="faith ${attackMode==='faith'?'active':''}">信念打击 · ${unit.faithDamage}</button></div>${specialty?`<small class="terrain-specialty">${escapeHtml(specialty)}</small>`:''}${skill?skill.replace('class="skill"',`class="skill" ${unit.skillCooldown?'disabled':''}`).replace('最近敌人易伤',`最近敌人易伤${cooldown}`).replace('恢复最低信念队友',`恢复最低信念队友${cooldown}`).replace('最近敌人 -2生命',`最近敌人 -2生命${cooldown}`).replace('护持最低生命队友',`护持最低生命队友${cooldown}`).replace('恢复队友状态',`恢复队友状态${cooldown}`).replace('信念 -3',`信念 -3${cooldown}`):''}<button data-attack="cancel" class="cancel">取消攻击模式 / 返回移动</button>`;
  root.querySelectorAll<HTMLButtonElement>('[data-attack]').forEach(button=>button.onclick=()=>{const mode=button.dataset.attack;if(mode==='cancel'||mode===attackMode)setAttackMode(undefined);else setAttackMode(mode as 'health'|'faith')});
  root.querySelectorAll<HTMLButtonElement>('[data-skill]').forEach(button=>button.onclick=()=>triggerSkill(button.dataset.skill as SkillId));
  renderAdditionalSkills(root,unit);
}

function renderAdditionalSkills(root:HTMLElement,unit:Unit){
  const options:Record<string,[SkillId,string]>={
    u1:['witness-cross','交叉质询 · 信念 -2'],u2:['seraphina-sanctify','净化 · 清除暴露、压制、灼痕'],u3:['reina-repair','现场修复 · 生命 +2'],
    u4:['odric-lock','封门 · 最近敌人 -1生命'],u5:['cole-charge','冲锋 · 最近敌人 -2生命并压制'],u6:['agnes-veil','虚像 · 信念 -1'],
    'u-arthur':['arthur-rally','军阵鼓舞 · 恢复信念并护持队友'],'u-hans':['hans-intercept','盾击 · 生命 -1 并护持自己'],'u-asnoka':['asnoka-scout','远望 · 暴露敌人并刷新意图'],
  };
  const option=options[unit.id];if(!option)return;
  const [id,label]=option;const button=document.createElement('button');button.type='button';button.dataset.skill=id;button.className='skill secondary-skill';button.textContent=unit.skillCooldown?`${label}（冷却 ${unit.skillCooldown} 回合）`:label;button.disabled=unit.skillCooldown>0;button.onclick=()=>triggerSkill(id);root.insertBefore(button,root.querySelector('[data-attack="cancel"]'));
}

function triggerSkill(skill:SkillId){
  if(!battleState||!selectedId)return;
  const actor=unitById(selectedId);if(!actor)return;
  const allySkill=skill==='seraphina-restore'||skill==='seraphina-sanctify'||skill==='reina-repair'||skill==='odric-guard'||skill==='cole-rally'||skill==='arthur-rally';
  const candidates=battleState.units.filter(unit=>isActive(unit)&&((allySkill&&unit.team==='player')||(!allySkill&&unit.team==='enemy'))&&distance(actor.position,unit.position)<= (skill==='odric-guard'||skill==='cole-rally'?2:3));
  const target=[...candidates].sort((a,b)=>allySkill?(a.health+a.faith)-(b.health+b.faith):distance(actor.position,a.position)-distance(actor.position,b.position))[0];
  if(!target){syncBattle('当前没有符合技能范围的目标。');return}
  const result=useSkill(battleState,skill,actor.id,target.id);
  const message=skill==='witness-mark'?`${actor.name} 标记 ${target.name}，下一次受到攻击时暴露弱点。`:skill==='witness-cross'?`${actor.name} 交叉质询 ${target.name}，削弱其信念。`:skill==='seraphina-restore'?`${actor.name} 为 ${target.name} 恢复信念。`:skill==='seraphina-sanctify'?`${actor.name} 净化 ${target.name} 的暴露、压制与灼痕。`:skill==='reina-overload'?`${actor.name} 过载拆解 ${target.name}，造成 2 点生命伤害。`:skill==='reina-repair'?`${actor.name} 修复 ${target.name}，恢复生命。`:skill==='odric-guard'?`${actor.name} 为 ${target.name} 架起盾墙，下一次生命伤害降低。`:skill==='odric-lock'?`${actor.name} 封住通道，削弱 ${target.name}。`:skill==='cole-rally'?`${actor.name} 吹响集结号，${target.name} 恢复状态。`:skill==='cole-charge'?`${actor.name} 发起冲锋，打击并压制 ${target.name}。`:skill==='agnes-rite'?`${actor.name} 施放余烬祷告，灼伤 ${target.name} 的信念。`:skill==='agnes-veil'?`${actor.name} 制造虚像，扰乱 ${target.name} 的信念。`:skill==='arthur-guardbreak'?`${actor.name} 破阵，打击并压制 ${target.name}。`:skill==='arthur-rally'?`${actor.name} 以军阵鼓舞 ${target.name}。`:skill==='hans-intercept'?`${actor.name} 拦截 ${target.name}，护住前线。`:`${actor.name} 标记远处的 ${target.name}。`;
  resolveAction(result,message,{type:'skill',unitId:actor.id,targetId:target.id,skill},target.position);
}

function renderIntents(){
  const list=document.querySelector<HTMLElement>('#intent-list');if(!list||!battleState)return;
  list.innerHTML=battleState.enemyIntents.map((intent,index)=>{const actor=unitById(intent.unitId);if(intent.type==='attack'){const target=unitById(intent.targetId);return `<button class="intent" data-enemy-intent="${index}" data-intent-kind="attack">攻击：${escapeHtml(actor?.name??'敌人')} → ${escapeHtml(target?.name??'目标')} · ${intent.damageKind==='faith'?'信念':'生命'} -${intent.amount}</button>`}return `<button class="intent" data-enemy-intent="${index}" data-intent-kind="move">移动：${escapeHtml(actor?.name??'敌人')} → 红色脉冲目标格</button>`}).join('')||'<span>暂无意图</span>';
  list.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>tutorialEvent('intent')));
}

function renderLog(){const list=document.querySelector<HTMLOListElement>('#battle-log');if(!list)return;list.innerHTML=battleLog.map((item,index)=>`<li>${item.cell?`<button data-log-cell="${index}">${escapeHtml(item.text)}</button>`:escapeHtml(item.text)}</li>`).join('')||'<li>战斗尚未开始。</li>';list.querySelectorAll<HTMLButtonElement>('[data-log-cell]').forEach(button=>button.onclick=()=>{const item=battleLog[Number(button.dataset.logCell)];if(item?.cell)battlefield?.flashCell(item.cell.x,item.cell.y)})}

function tutorialEvent(event:'start'|'select'|'attack-mode'|'move'|'intent'){
  if(tutorial==='intro'&&event==='start')tutorial='select-unit';
  else if(tutorial==='select-unit'&&event==='select')tutorial='read-vitals';
  else if(tutorial==='read-vitals'&&event==='attack-mode'){
    tutorial='move-three';
    setAttackMode(undefined);
    queueMicrotask(()=>{
      if(tutorial!=='move-three')return;
      attackMode=undefined;
      battlefield?.setAttackMode(undefined);
      renderAttackControls();
      syncBattle('攻击模式已取消。请选择一个高亮格移动；本次移动在出手前可以撤回。');
    });
  }
  else if(tutorial==='move-three'&&event==='move')tutorial='read-intent';
  else if(tutorial==='read-intent'&&event==='intent')tutorial='end-phase';
  renderTutorial();
}

function renderTutorial(){
  const root=document.querySelector<HTMLElement>('#tutorial');if(!root)return;
  if(tutorial==='off'||tutorial==='complete'){root.hidden=true;root.innerHTML='';return}
  root.hidden=false;
  const copy:Record<Exclude<TutorialStep,'off'|'complete'>,[number,string,string]>={
    intro:[1,'先稳住广场。','现在是我方阶段。三名同伴可以各行动一次，敌人会在你结束阶段后统一行动。'],
    'select-unit':[2,'先选择一名同伴。','点击带圆形底座、尚未行动的青色单位。'],
    'read-vitals':[3,'选择怎样击溃敌人。','单位卡会显示生命与信念；任意一项归零都会退出战斗。请试选一次“生命攻击”或“信念打击”，它只会进入瞄准模式，不会自动出手。'],
    'move-three':[4,'向火线推进。','攻击模式已取消。亮起的格子都可到达；这一步请选择距离起点恰好 3 格的位置。移动后、攻击或切换单位前可用“撤回本次移动”。'],
    'read-intent':[5,'敌人已经亮明下一步。','点击一条敌方意图，确认敌人将移动还是攻击。'],
    'end-phase':[6,'决定何时交出主动权。','你仍可指挥其他同伴；准备好后点击“结束我方阶段”。'],
    'observe-enemy':[7,'预告正在兑现。','敌方会依次执行意图；结束后所有存活同伴可再次行动。'],
  };
  const [number,title,body]=copy[tutorial];root.dataset.tutorialStep=tutorial;root.innerHTML=`<div><small>战斗指引 ${number}/7</small><strong>${title}</strong><p>${body}</p>${tutorial==='intro'?'<button data-tutorial="start">开始指引</button>':tutorial==='end-phase'?'<button data-tutorial="end-phase">结束我方阶段</button>':''}<button data-tutorial="skip" class="link">跳过教程</button></div>`;
  root.querySelector('[data-tutorial="start"]')?.addEventListener('click',()=>tutorialEvent('start'));
  root.querySelector('[data-tutorial="end-phase"]')?.addEventListener('click',endPhase);
  root.querySelector('[data-tutorial="skip"]')?.addEventListener('click',skipTutorial);
}

function skipTutorial(){tutorial='off';try{localStorage.setItem(tutorialKey,JSON.stringify({status:'skipped',skippedAt:new Date().toISOString()}))}catch{}renderTutorial();syncBattle('教程已跳过，可随时点击“重看教程”。')}
function completeTutorial(){tutorial='complete';try{localStorage.setItem(tutorialKey,JSON.stringify({status:'completed',completedAt:new Date().toISOString()}))}catch{}syncBattle('第 2 回合开始。你已掌握战斗节奏。')}

function finishIfNeeded(){
  if(!battleState||!['victory','defeat'].includes(battleState.phase))return;
  if(battleEndingScheduled)return;
  battleEndingScheduled=true;
  if(battleState.phase==='victory'&&tutorial!=='off')completeTutorial();
  const node=currentChapter().nodes[battleNodeId];if(!node||node.kind!=='battle')return;
  let afterMeeting=awardBattleMeeting(campaignState,node.battleId);
  if(bossChallengeMode){
    persistCampaign({...afterMeeting,coins:(afterMeeting.coins??0)+24});
    setTimeout(()=>{bossChallengeMode=false;renderCampaignHome()},reducedMotion?0:850);
    return;
  }
  const nextNodeId=battleState.phase==='victory'?node.victoryNext:node.defeatNext;
  const nextNode=currentChapter().nodes[nextNodeId];
  if(campaignState.campaignId==='arthur-main'&&nextNode?.kind!=='ending')afterMeeting=recordMainlineBattleProgress(afterMeeting,battleState.phase==='victory'?'victory':'defeat');
  persistCampaign(afterMeeting);
  setTimeout(()=>renderNode(battleState?.phase==='victory'?node.victoryNext:node.defeatNext),reducedMotion?0:850);
}

function renderEnding(node:Extract<StoryNode,{kind:'ending'}>){
  const lines=node.lines.map(line=>`<p>${line.speakerId?`<strong>${escapeHtml(characters[line.speakerId].name)}：</strong>`:''}${escapeHtml(line.text)}</p>`).join('');
  set(`<main class="screen result"><section class="story-card"><p class="eyebrow">战斗结果 · ${escapeHtml(node.endingId)}</p><h2>${escapeHtml(node.title)}</h2>${lines}<p>${escapeHtml(node.summary)}</p><div class="outcome"><span>公众信仰 ${storyState.stats.publicFaith}</span><span>平民安全 ${storyState.stats.civilianSafety}</span><span>证据 ${storyState.evidence.length}</span></div><button id="again" class="primary">查看战后报告</button></section></main>`);
  audioManager.setScene(node.endingId==='failure'?'defeat':'victory');
  document.querySelector('#again')?.addEventListener('click',()=>{const reported=completeCampaignBattle(clearStoryCheckpoint(campaignState),node.endingId==='failure'?'defeat':'victory');const terminal=campaignState.campaignId==='arthur-main'?campaignState.week>=7:campaignState.week>=3;persistCampaign(terminal?finishCampaignSeason(reported):reported);renderCampaignReport()});
}

function reasonZh(reason?:string){return ({'It is not the player phase.':'现在不是我方阶段。','Unit is unavailable.':'该单位无法行动。','Only player units can be commanded.':'只能指挥我方单位。','Unit has already acted this round.':'该单位本回合已经行动。','Destination is outside the board.':'目标位于棋盘之外。','Destination is occupied.':'该位置已被占用。','Destination is outside movement range.':'目标超出移动范围。','Target is unavailable.':'目标不可用。','Cannot attack an ally.':'不能攻击友军。','Target is outside attack range.':'目标超出攻击范围。'} as Record<string,string>)[reason??'']??reason??'行动无效。'}

addEventListener('error',event=>console.error(event.error));
title();
