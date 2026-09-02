export type CampaignView =
  | "home"
  | "battle-route"
  | "roster"
  | "preparation"
  | "story"
  | "battle"
  | "report"
  | "growth"
  | "recruitment"
  | "shop"
  | "library"
  | "archive"
  | "models";

import { mainlineMissions } from "./mainlineMissions";

export type CampaignAction = "investigate" | "rest" | "negotiate";
export type CampaignResult = "victory" | "defeat";
export type CampaignCondition = "normal" | "fatigued" | "wounded";
export type CampaignId = "arthur-main" | "unflagged-side";
export type CampaignCharacterId = "the_unflagged" | "seraphina" | "reina" | "odric" | "cole" | "agnes" | "arthur" | "hans" | "asnoka";
export type CampaignEvidenceId = "cold_ash" | "lamp_oil_ledger" | "broken_wrench";
export type RouteRiskModifier = "normal" | "heightened";
export type CampaignWeaponId = "iron-ward" | "frontier-lance" | "sanctified-edge" | "warden-mail" | "veil-breaker" | "echo-compass";

export interface CampaignWeapon {
  id: CampaignWeaponId;
  name: string;
  quality: "普通" | "稀有" | "史诗";
  slot: "武器" | "护甲" | "饰品";
  cost: number;
  attack: number;
  defense: number;
  faith: number;
  moveRange: number;
  description: string;
}

export const campaignShop: readonly CampaignWeapon[] = [
  { id: "iron-ward", name: "铁砧护具", quality: "普通", slot: "护甲", cost: 18, attack: 0, defense: 1, faith: 0, moveRange: 0, description: "来自铁砧边境的铆接护具，减少生命伤害。" },
  { id: "frontier-lance", name: "边境骑枪", quality: "普通", slot: "武器", cost: 24, attack: 1, defense: 0, faith: 0, moveRange: 1, description: "适合直线冲锋；亚瑟获得额外 1 格移动力。" },
  { id: "sanctified-edge", name: "圣火刃", quality: "稀有", slot: "武器", cost: 30, attack: 1, defense: 0, faith: 1, moveRange: 0, description: "旧圣火锻成的刃，生命与信念攻击都更稳定。" },
  { id: "warden-mail", name: "卫道士锁甲", quality: "稀有", slot: "护甲", cost: 36, attack: 0, defense: 2, faith: 0, moveRange: 0, description: "军国制式锁甲，护持状态下额外抵消 1 点生命伤害。" },
  { id: "veil-breaker", name: "破幕棱刃", quality: "史诗", slot: "武器", cost: 46, attack: 2, defense: 1, faith: 1, moveRange: 0, description: "针对守幕装置打磨的棱刃，适合 Boss 阶段战。" },
  { id: "echo-compass", name: "系统回响罗盘", quality: "史诗", slot: "饰品", cost: 52, attack: 0, defense: 1, faith: 2, moveRange: 1, description: "记录危险预警，提升信念上限与移动灵活度。" },
];

export interface CampaignRosterMember {
  id: CampaignCharacterId;
  condition: CampaignCondition;
}

export interface CampaignReport {
  result: CampaignResult;
  week: number;
  suppliesDelta: number;
  evidenceDelta: number;
  cohesionDelta: number;
  civilianSafetyDelta: number;
  goddessAttitudeDelta: number;
  evidenceAdded?: CampaignEvidenceId;
  routeRiskModifier: RouteRiskModifier;
  conditionCharacterId?: CampaignCharacterId;
  conditionAfter?: CampaignCondition;
  coinsDelta?: number;
  experienceDelta?: number;
  missionCompleted?: string;
}

export interface CampaignRecruitmentRecord {
  characterId: CampaignCharacterId;
  result: "new" | "duplicate";
  marksAdded: number;
}

export interface StoryCheckpointState {
  flags: Record<string, boolean>;
  evidence: CampaignEvidenceId[];
  stats: {
    publicFaith: number;
    civilianSafety: number;
    goddessTrust: number;
    wardenTrust: number;
  };
}

export interface StoryCheckpoint {
  chapterId: string;
  currentNodeId: string;
  completedNodeIds: string[];
  storyState: StoryCheckpointState;
}

export interface CampaignState {
  version: 5;
  campaignId: CampaignId;
  view: CampaignView;
  act: 1;
  week: number;
  routeIndex: number;
  supplies: number;
  coins: number;
  potions: number;
  ownedWeapons: CampaignWeaponId[];
  equippedWeapon?: CampaignWeaponId;
  evidence: number;
  evidenceItems: CampaignEvidenceId[];
  cohesion: number;
  civilianSafety: number;
  intelLevel: 0 | 1 | 2;
  factionAttitudes: {
    goddessState: number;
    wardens: number;
  };
  roster: CampaignRosterMember[];
  lineup: CampaignCharacterId[];
  selectedAction?: CampaignAction;
  actionCommitted: boolean;
  routeRiskModifier: RouteRiskModifier;
  recruitmentMeetings: number;
  recruitmentPity: number;
  recruitmentMarks: number;
  rewardedBattleIds: string[];
  storyState: StoryCheckpointState;
  lastRecruitment?: CampaignRecruitmentRecord;
  lastReport?: CampaignReport;
  storyCheckpoint?: StoryCheckpoint;
  /** A terminal season remains exportable and replayable, but must not advance into an undefined week. */
  seasonComplete?: boolean;
  /** Mainline-only RPG progression. Side-story saves intentionally omit this. */
  mainline?: MainlineProgress;
}

export type MilitaryRank = "recruit" | "soldier" | "sergeant" | "squire" | "knight" | "armored-knight";

export interface MainlineProgress {
  protagonist: "arthur";
  level: number;
  experience: number;
  strength: number;
  agility: number;
  constitution: number;
  will: number;
  skillPoints: number;
  skills: string[];
  weaponMastery: Record<string, number>;
  militaryRank: MilitaryRank;
  equipment: { weapon?: CampaignWeaponId; armor?: string; shield?: string };
  completedMissions: string[];
  /** Optional military task selected from the chapter task board. */
  selectedMissionId?: string;
  factionPressure: Record<string, number>;
}

export interface CampaignStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const campaignSaveKey = "goddess-fall:campaign:milestone-a:v1";
export const mainlineSaveKey = "goddess-fall:campaign:arthur-main:v1";

const initialRoster: CampaignRosterMember[] = [
  { id: "the_unflagged", condition: "normal" },
  { id: "seraphina", condition: "fatigued" },
  { id: "reina", condition: "normal" },
];

export function createCampaignState(): CampaignState {
  return {
    version: 5,
    campaignId: "unflagged-side",
    view: "home",
    act: 1,
    week: 1,
    routeIndex: 0,
    supplies: 18,
    coins: 0,
    potions: 0,
    ownedWeapons: [],
    evidence: 0,
    evidenceItems: [],
    cohesion: 2,
    civilianSafety: 2,
    intelLevel: 0,
    factionAttitudes: { goddessState: 0, wardens: 0 },
    roster: initialRoster.map((member) => ({ ...member })),
    lineup: initialRoster.map((member) => member.id),
    selectedAction: "investigate",
    actionCommitted: false,
    routeRiskModifier: "normal",
    recruitmentMeetings: 0,
    recruitmentPity: 0,
    recruitmentMarks: 0,
    rewardedBattleIds: [],
    storyState: createInitialStoryState(),
  };
}

export function createMainlineCampaignState(): CampaignState {
  const roster: CampaignRosterMember[] = [
    { id: "arthur", condition: "normal" },
    { id: "hans", condition: "normal" },
    { id: "asnoka", condition: "normal" },
  ];
  return {
    version: 5,
    campaignId: "arthur-main",
    view: "home",
    act: 1,
    week: 1,
    routeIndex: 0,
    supplies: 24,
    coins: 0,
    potions: 0,
    ownedWeapons: [],
    evidence: 0,
    evidenceItems: [],
    cohesion: 2,
    civilianSafety: 2,
    intelLevel: 0,
    factionAttitudes: { goddessState: 0, wardens: 0 },
    roster,
    lineup: roster.map((member) => member.id),
    selectedAction: "investigate",
    actionCommitted: false,
    routeRiskModifier: "normal",
    recruitmentMeetings: 0,
    recruitmentPity: 0,
    recruitmentMarks: 0,
    rewardedBattleIds: [],
    storyState: createInitialStoryState(),
    mainline: {
      protagonist: "arthur",
      level: 1,
      experience: 0,
      strength: 12,
      agility: 10,
      constitution: 12,
      will: 8,
      skillPoints: 0,
      skills: [],
      weaponMastery: { sword: 0, shield: 0, lance: 0 },
      militaryRank: "recruit",
      equipment: { shield: "旧木盾" },
      completedMissions: [],
      selectedMissionId: undefined,
      factionPressure: { wardens: 0, goddess_state: 0, council: 0, new_kavala: 0 },
    },
  };
}

export function battleRationCost(state: CampaignState): number {
  return Math.max(1, state.lineup.length);
}

export function consumeBattleRations(state: CampaignState, boss = false): CampaignState {
  if (boss) return state;
  return { ...state, supplies: Math.max(0, state.supplies - battleRationCost(state)) };
}

export function battleCoinReward(state: CampaignState, result: CampaignResult): number {
  const completed = Math.max(0, state.rewardedBattleIds.length - 1);
  const base = battleRationCost(state) * 2 ** completed;
  return result === "victory" ? base * 2 : Math.max(1, Math.floor(base / 2));
}

export function awardBattleCoins(state: CampaignState, result: CampaignResult): CampaignState {
  return { ...state, coins: Math.min(9999, (state.coins ?? 0) + battleCoinReward(state, result)) };
}

export function buyCampaignWeapon(state: CampaignState, weaponId: CampaignWeaponId): CampaignState {
  const weapon = campaignShop.find(item => item.id === weaponId);
  if (!weapon || state.ownedWeapons.includes(weaponId) || (state.coins ?? 0) < weapon.cost) return state;
  const next = { ...state, coins: state.coins - weapon.cost, ownedWeapons: [...state.ownedWeapons, weaponId], equippedWeapon: weaponId };
  return state.mainline ? { ...next, mainline: { ...state.mainline, equipment: { ...state.mainline.equipment, weapon: weaponId } } } : next;
}

export function equipCampaignWeapon(state: CampaignState, weaponId: CampaignWeaponId): CampaignState {
  if (!state.ownedWeapons.includes(weaponId) || !campaignShop.some(item => item.id === weaponId)) return state;
  const next = { ...state, equippedWeapon: weaponId };
  return state.mainline ? { ...next, mainline: { ...state.mainline, equipment: { ...state.mainline.equipment, weapon: weaponId } } } : next;
}

export function buyCampaignPotion(state: CampaignState): CampaignState {
  const cost = 5;
  if ((state.coins ?? 0) < cost) return state;
  return { ...state, coins: state.coins - cost, potions: (state.potions ?? 0) + 1 };
}

export function consumeCampaignPotion(state: CampaignState): CampaignState {
  if ((state.potions ?? 0) <= 0) return state;
  return { ...state, potions: Math.max(0, state.potions - 1) };
}

export function buyCampaignRations(state: CampaignState, quantity = 3): CampaignState {
  const amount = Math.max(1, Math.floor(quantity));
  const cost = amount;
  if ((state.coins ?? 0) < cost) return state;
  return { ...state, coins: state.coins - cost, supplies: Math.min(99, state.supplies + amount) };
}

function createInitialStoryState(): StoryCheckpointState {
  return {
    flags: {},
    evidence: [],
    stats: {
      publicFaith: 60,
      civilianSafety: 50,
      goddessTrust: 0,
      wardenTrust: 0,
    },
  };
}

function cloneStoryState(storyState: StoryCheckpointState): StoryCheckpointState {
  return {
    flags: { ...storyState.flags },
    evidence: [...storyState.evidence],
    stats: { ...storyState.stats },
  };
}

export function navigateCampaign(state: CampaignState, view: CampaignView): CampaignState {
  return { ...state, view };
}

export function setStoryCheckpoint(state: CampaignState, checkpoint: StoryCheckpoint): CampaignState {
  const storyState = cloneStoryState(checkpoint.storyState);
  return {
    ...state,
    storyState,
    storyCheckpoint: {
      ...checkpoint,
      completedNodeIds: [...checkpoint.completedNodeIds],
      storyState: cloneStoryState(storyState),
    },
  };
}

export function clearStoryCheckpoint(state: CampaignState): CampaignState {
  if (!state.storyCheckpoint) return state;
  const { storyCheckpoint: _checkpoint, ...rest } = state;
  return rest as CampaignState;
}

/**
 * Awards the free recruitment meeting promised for a formal battle exactly once.
 * The battle id is persisted so retries, reloads, and alternate result screens
 * cannot duplicate the reward.
 */
export function awardBattleMeeting(state: CampaignState, battleId: string): CampaignState {
  const normalizedId = battleId.trim();
  if (!normalizedId || state.rewardedBattleIds.includes(normalizedId)) return state;
  return {
    ...state,
    recruitmentMeetings: Math.min(9, state.recruitmentMeetings + 1),
    rewardedBattleIds: [...state.rewardedBattleIds, normalizedId],
  };
}

export function resolveStoryCheckpoint(
  checkpoint: StoryCheckpoint | undefined,
  chapterId: string,
  nodeIds: ReadonlySet<string>,
  startNodeId: string,
): { nodeId: string; storyState?: StoryCheckpointState; completedNodeIds: string[]; resumed: boolean } {
  if (!checkpoint || checkpoint.chapterId !== chapterId || !nodeIds.has(checkpoint.currentNodeId)) {
    return { nodeId: startNodeId, completedNodeIds: [], resumed: false };
  }
  return {
    nodeId: checkpoint.currentNodeId,
    storyState: checkpoint.storyState,
    completedNodeIds: checkpoint.completedNodeIds.filter((id) => nodeIds.has(id)),
    resumed: true,
  };
}

export function selectCampaignAction(state: CampaignState, action: CampaignAction): CampaignState {
  if (state.actionCommitted) return state;
  return { ...state, selectedAction: action };
}

export function setCampaignLineup(
  state: CampaignState,
  lineup: CampaignCharacterId[],
): CampaignState {
  const available = new Set(state.roster.map((member) => member.id));
  const unique = new Set(lineup);
  if (lineup.length !== 3 || unique.size !== 3 || lineup.some((id) => !available.has(id))) {
    return state;
  }
  return { ...state, lineup: [...lineup] };
}

export function commitCampaignAction(state: CampaignState): CampaignState {
  if (!state.selectedAction || state.actionCommitted) return state;

  if (state.selectedAction === "investigate") {
    const isNewEvidence = !state.evidenceItems.includes("cold_ash");
    return {
      ...state,
      evidence: Math.min(9, state.evidence + (isNewEvidence ? 1 : 0)),
      evidenceItems: isNewEvidence ? [...state.evidenceItems, "cold_ash"] : state.evidenceItems,
      intelLevel: Math.min(2, state.intelLevel + 1) as 0 | 1 | 2,
      actionCommitted: true,
    };
  }

  if (state.selectedAction === "rest") {
    const woundedId=state.lineup.find(id=>state.roster.some(member=>member.id===id&&member.condition==="wounded"));
    const fatiguedId=state.lineup.find(id=>state.roster.some(member=>member.id===id&&member.condition==="fatigued"));
    const recoveringId=woundedId??fatiguedId;
    return {
      ...state,
      cohesion: Math.min(5, state.cohesion + 1),
      roster: state.roster.map((member) => {
        if(member.id!==recoveringId)return member;
        if(member.condition==="wounded")return{...member,condition:"fatigued"};
        if(member.condition==="fatigued")return{...member,condition:"normal"};
        return member;
      }),
      actionCommitted: true,
    };
  }

  const isNewEvidence = !state.evidenceItems.includes("lamp_oil_ledger");
  return {
    ...state,
    evidence: Math.min(9, state.evidence + (isNewEvidence ? 1 : 0)),
    evidenceItems: isNewEvidence ? [...state.evidenceItems, "lamp_oil_ledger"] : state.evidenceItems,
    factionAttitudes: {
      ...state.factionAttitudes,
      goddessState: Math.min(3, state.factionAttitudes.goddessState + 1),
    },
    actionCommitted: true,
  };
}

export function completeCampaignBattle(
  state: CampaignState,
  result: CampaignResult,
): CampaignState {
  const tacticalRetreat = result === "defeat" && state.mainline?.skills.includes("tactical-retreat");
  const conditionCharacterId=state.lineup.find(id=>{
    const condition=state.roster.find(member=>member.id===id)?.condition;
    return result==="victory"?condition==="normal":condition!=="wounded";
  });
  const conditionAfter:CampaignCondition|undefined=conditionCharacterId?(result==="victory"?"fatigued":"wounded"):undefined;
  const report: CampaignReport = result === "victory"
    ? { result, week: state.week, suppliesDelta: 0, evidenceDelta: 1, cohesionDelta: 1, civilianSafetyDelta: 1, goddessAttitudeDelta: 0, evidenceAdded: "broken_wrench", routeRiskModifier: "normal" }
    : { result, week: state.week, suppliesDelta: tacticalRetreat ? 0 : -1, evidenceDelta: 0, cohesionDelta: 0, civilianSafetyDelta: -1, goddessAttitudeDelta: -1, routeRiskModifier: "heightened" };
  if(conditionCharacterId&&conditionAfter){report.conditionCharacterId=conditionCharacterId;report.conditionAfter=conditionAfter}
  const evidenceAlreadyOwned = report.evidenceAdded ? state.evidenceItems.includes(report.evidenceAdded) : false;
  const effectiveReport = evidenceAlreadyOwned ? { ...report, evidenceDelta: 0 } : report;

  const nextState: CampaignState = {
    ...state,
    view: "report",
    supplies: Math.max(0, state.supplies + report.suppliesDelta),
    evidence: Math.min(9, state.evidence + effectiveReport.evidenceDelta),
    evidenceItems: report.evidenceAdded && !evidenceAlreadyOwned ? [...state.evidenceItems, report.evidenceAdded] : state.evidenceItems,
    cohesion: Math.min(5, state.cohesion + report.cohesionDelta),
    civilianSafety: Math.max(0, Math.min(3, state.civilianSafety + report.civilianSafetyDelta)),
    factionAttitudes: {
      ...state.factionAttitudes,
      goddessState: Math.max(-3, Math.min(3, state.factionAttitudes.goddessState + report.goddessAttitudeDelta)),
      ...(tacticalRetreat ? { wardens: Math.min(3, state.factionAttitudes.wardens + 1) } : {}),
    },
    routeRiskModifier: report.routeRiskModifier,
    coins: Math.min(9999, (state.coins ?? 0) + battleCoinReward(state, result)),
    roster: state.roster.map((member) => member.id === conditionCharacterId
      ? { ...member, condition: conditionAfter! }
      : member),
    lastReport: effectiveReport,
  };
  const baseCoins = battleCoinReward(state, result);
  effectiveReport.coinsDelta = baseCoins;
  if (nextState.campaignId === "arthur-main" && nextState.mainline) {
    const selectedMission = nextState.mainline.selectedMissionId
      ? mainlineMissions.find((mission) => mission.id === nextState.mainline!.selectedMissionId)
      : undefined;
    const missionCompleted = Boolean(selectedMission && result === "victory" && !nextState.mainline.completedMissions.includes(selectedMission.id));
    const baseGain = (result === "victory" ? 34 + nextState.week * 6 : 14 + nextState.week * 2) + (missionCompleted ? selectedMission!.xp : 0);
    const gain = Math.round(baseGain * (nextState.mainline.skills.includes("experience-boost") ? 1.2 : 1));
    const xp = nextState.mainline.experience + gain;
    const nextLevel = Math.min(30, 1 + Math.floor(xp / 100));
    const levelDelta = Math.max(0, nextLevel - nextState.mainline.level);
    const rankByLevel: MilitaryRank[] = ["recruit", "soldier", "sergeant", "squire", "knight", "armored-knight"];
    const rankIndex = Math.min(rankByLevel.length - 1, Math.floor(nextLevel / 2));
    nextState.mainline = {
      ...nextState.mainline,
      experience: xp,
      level: nextLevel,
      skillPoints: nextState.mainline.skillPoints + levelDelta * 2,
      strength: nextState.mainline.strength + levelDelta,
      constitution: nextState.mainline.constitution + levelDelta,
      militaryRank: rankByLevel[rankIndex],
      completedMissions: missionCompleted
        ? [...nextState.mainline.completedMissions, selectedMission!.id]
        : nextState.mainline.completedMissions,
      selectedMissionId: missionCompleted ? undefined : nextState.mainline.selectedMissionId,
    };
    effectiveReport.experienceDelta = gain;
    if (missionCompleted) effectiveReport.missionCompleted = selectedMission!.title;
    if (missionCompleted) nextState.coins = Math.min(9999, nextState.coins + selectedMission!.coins);
  }
  return nextState;
}

/**
 * Records an intermediate battle in a multi-battle chapter without opening
 * the report screen. The story checkpoint immediately after the battle is
 * still the source of truth, so reloads resume at the next dialogue node.
 */
export function recordMainlineBattleProgress(state: CampaignState, result: CampaignResult): CampaignState {
  if (state.campaignId !== "arthur-main" || !state.mainline) return state;
    const baseGain = result === "victory" ? 34 + state.week * 6 : 14 + state.week * 2;
    const gain = Math.round(baseGain * (state.mainline.skills.includes("experience-boost") ? 1.2 : 1));
  const xp = state.mainline.experience + gain;
  const level = Math.min(30, 1 + Math.floor(xp / 100));
  const levelDelta = Math.max(0, level - state.mainline.level);
  const rankByLevel: MilitaryRank[] = ["recruit", "soldier", "sergeant", "squire", "knight", "armored-knight"];
  return {
    ...state,
    coins: Math.min(9999, (state.coins ?? 0) + battleCoinReward(state, result)),
    mainline: {
      ...state.mainline,
      experience: xp,
      level,
      skillPoints: state.mainline.skillPoints + levelDelta * 2,
      strength: state.mainline.strength + levelDelta,
      constitution: state.mainline.constitution + levelDelta,
      militaryRank: rankByLevel[Math.min(rankByLevel.length - 1, Math.floor(level / 2))],
    },
  };
}

export function advanceCampaignWeek(state: CampaignState): CampaignState {
  if (!state.lastReport || state.seasonComplete) return state;
  return {
    ...state,
    view: "home",
    week: state.week + 1,
    routeIndex: state.routeIndex + 1,
    selectedAction: "investigate",
    actionCommitted: false,
    lastReport: undefined,
    storyCheckpoint: undefined,
  };
}

export function finishCampaignSeason(state: CampaignState): CampaignState {
  return {...state,seasonComplete:true};
}

export function saveCampaign(state: CampaignState, storage: CampaignStorage): void {
  storage.setItem(state.campaignId === "arthur-main" ? mainlineSaveKey : campaignSaveKey, JSON.stringify(state));
}

const validViews = new Set<CampaignView>(["home", "battle-route", "roster", "preparation", "story", "battle", "report", "growth", "recruitment", "shop", "library", "archive", "models"]);
const validActions = new Set<CampaignAction>(["investigate", "rest", "negotiate"]);
const validCampaignIds = new Set<CampaignId>(["arthur-main", "unflagged-side"]);
const validCharacters = new Set<CampaignCharacterId>(["the_unflagged", "seraphina", "reina", "odric", "cole", "agnes", "arthur", "hans", "asnoka"]);
const validConditions = new Set<CampaignCondition>(["normal", "fatigued", "wounded"]);
const validEvidence = new Set<CampaignEvidenceId>(["cold_ash", "lamp_oil_ledger", "broken_wrench"]);
const validRiskModifiers = new Set<RouteRiskModifier>(["normal", "heightened"]);
const inRange = (value: unknown, min: number, max: number): value is number => Number.isInteger(value) && Number(value) >= min && Number(value) <= max;

function validReport(value: unknown): value is CampaignReport {
  if (!value || typeof value !== "object") return false;
  const report = value as Record<string, unknown>;
  return (report.result === "victory" || report.result === "defeat")
    && inRange(report.week, 1, 99)
    && inRange(report.suppliesDelta, -9, 9)
    && inRange(report.evidenceDelta, -9, 9)
    && inRange(report.cohesionDelta, -5, 5)
    && inRange(report.civilianSafetyDelta, -3, 3)
    && inRange(report.goddessAttitudeDelta, -3, 3)
    && (report.evidenceAdded === undefined || validEvidence.has(report.evidenceAdded as CampaignEvidenceId))
    && (report.conditionCharacterId === undefined || validCharacters.has(report.conditionCharacterId as CampaignCharacterId))
    && (report.conditionAfter === undefined || validConditions.has(report.conditionAfter as CampaignCondition))
    && ((report.conditionCharacterId === undefined) === (report.conditionAfter === undefined))
    && (report.coinsDelta === undefined || inRange(report.coinsDelta, -999, 9999))
    && (report.experienceDelta === undefined || inRange(report.experienceDelta, 0, 9999))
    && (report.missionCompleted === undefined || (typeof report.missionCompleted === "string" && report.missionCompleted.length < 120))
    && validRiskModifiers.has(report.routeRiskModifier as RouteRiskModifier);
}

/** Public validation boundary for local saves and shareable archive snapshots. */
export function isCampaignState(value: unknown): value is CampaignState {
  if (!value || typeof value !== "object") return false;
  const state = value as Record<string, unknown>;
  if (![4, 5].includes(state.version as number) || !validCampaignIds.has(state.campaignId as CampaignId) || state.act !== 1 || !validViews.has(state.view as CampaignView)) return false;
  if (!inRange(state.week, 1, 99) || !inRange(state.routeIndex, 0, state.campaignId === "arthur-main" ? 13 : 11)) return false;
  if (!inRange(state.supplies, 0, 99) || !inRange(state.coins, 0, 9999) || !inRange(state.potions, 0, 99) || !Array.isArray(state.ownedWeapons) || state.ownedWeapons.some(id => !campaignShop.some(item => item.id === id)) || (state.equippedWeapon !== undefined && !campaignShop.some(item => item.id === state.equippedWeapon)) || !inRange(state.evidence, 0, 9) || !inRange(state.cohesion, 0, 5) || !inRange(state.civilianSafety, 0, 3) || !inRange(state.intelLevel, 0, 2)) return false;
  if (typeof state.actionCommitted !== "boolean" || !validRiskModifiers.has(state.routeRiskModifier as RouteRiskModifier)) return false;
  if (state.selectedAction !== undefined && !validActions.has(state.selectedAction as CampaignAction)) return false;
  if (!state.factionAttitudes || typeof state.factionAttitudes !== "object") return false;
  const attitudes = state.factionAttitudes as Record<string, unknown>;
  if (!inRange(attitudes.goddessState, -3, 3) || !inRange(attitudes.wardens, -3, 3)) return false;
  if (!Array.isArray(state.evidenceItems) || new Set(state.evidenceItems).size !== state.evidenceItems.length || state.evidenceItems.some((id) => !validEvidence.has(id as CampaignEvidenceId))) return false;
  if (!inRange(state.recruitmentMeetings, 0, 9) || !inRange(state.recruitmentPity, 0, 2) || !inRange(state.recruitmentMarks, 0, 99)) return false;
  if (!Array.isArray(state.rewardedBattleIds)
    || state.rewardedBattleIds.length > 100
    || new Set(state.rewardedBattleIds).size !== state.rewardedBattleIds.length
    || state.rewardedBattleIds.some((id) => typeof id !== "string" || id.trim() !== id || id.length < 1 || id.length > 80)) return false;
  if (!validStoryState(state.storyState)) return false;
  if (state.lastRecruitment !== undefined) {
    if (!state.lastRecruitment || typeof state.lastRecruitment !== "object") return false;
    const recruitment = state.lastRecruitment as Record<string, unknown>;
    if (!validCharacters.has(recruitment.characterId as CampaignCharacterId)
      || (recruitment.result !== "new" && recruitment.result !== "duplicate")
      || !inRange(recruitment.marksAdded, 0, 1)) return false;
  }
  if (!Array.isArray(state.roster) || state.roster.length < 3 || state.roster.length > 6) return false;
  const rosterIds = new Set<string>();
  for (const rawMember of state.roster) {
    if (!rawMember || typeof rawMember !== "object") return false;
    const member = rawMember as Record<string, unknown>;
    if (!validCharacters.has(member.id as CampaignCharacterId) || !validConditions.has(member.condition as CampaignCondition)) return false;
    rosterIds.add(member.id as string);
  }
  if (rosterIds.size !== state.roster.length) return false;
  if (!Array.isArray(state.lineup) || state.lineup.length !== 3 || new Set(state.lineup).size !== 3 || state.lineup.some((id) => !validCharacters.has(id as CampaignCharacterId) || !rosterIds.has(id as string))) return false;
  if (state.lastReport !== undefined && !validReport(state.lastReport)) return false;
  if (state.storyCheckpoint !== undefined && !validStoryCheckpoint(state.storyCheckpoint)) return false;
  if (state.seasonComplete !== undefined && typeof state.seasonComplete !== "boolean") return false;
  if (state.version === 5 && state.campaignId === "arthur-main") {
    if (!validMainlineProgress(state.mainline)) return false;
    if (state.roster.some((member) => !["arthur", "hans", "asnoka"].includes(member.id))) return false;
  }
  return true;
}

function validMainlineProgress(value: unknown): value is MainlineProgress {
  if (!value || typeof value !== "object") return false;
  const progress = value as Record<string, unknown>;
  const rank = new Set<MilitaryRank>(["recruit", "soldier", "sergeant", "squire", "knight", "armored-knight"]);
  const equipment = progress.equipment as Record<string, unknown> | undefined;
  return progress.protagonist === "arthur"
    && inRange(progress.level, 1, 30)
    && inRange(progress.experience, 0, 999999)
    && ["strength", "agility", "constitution", "will", "skillPoints"].every((key) => inRange(progress[key], 0, 9999))
    && Array.isArray(progress.skills) && progress.skills.every((item) => typeof item === "string" && item.length < 80)
    && progress.weaponMastery !== undefined && typeof progress.weaponMastery === "object"
    && rank.has(progress.militaryRank as MilitaryRank)
    && equipment !== undefined && typeof equipment === "object"
    && (equipment.weapon === undefined || campaignShop.some((item) => item.id === equipment.weapon))
    && Array.isArray(progress.completedMissions) && progress.completedMissions.every((item) => typeof item === "string")
    && (progress.selectedMissionId === undefined || typeof progress.selectedMissionId === "string")
    && progress.factionPressure !== undefined && typeof progress.factionPressure === "object";
}

function validStoryCheckpoint(value: unknown): value is StoryCheckpoint {
  if (!value || typeof value !== "object") return false;
  const checkpoint = value as Record<string, unknown>;
  if (typeof checkpoint.chapterId !== "string" || checkpoint.chapterId.length < 1 || checkpoint.chapterId.length > 80) return false;
  if (typeof checkpoint.currentNodeId !== "string" || checkpoint.currentNodeId.length < 1 || checkpoint.currentNodeId.length > 80) return false;
  if (!Array.isArray(checkpoint.completedNodeIds) || checkpoint.completedNodeIds.length > 100
    || checkpoint.completedNodeIds.some((id) => typeof id !== "string" || id.length < 1 || id.length > 80)
    || new Set(checkpoint.completedNodeIds).size !== checkpoint.completedNodeIds.length) return false;
  return validStoryState(checkpoint.storyState);
}

function validStoryState(value: unknown): value is StoryCheckpointState {
  if (!value || typeof value !== "object") return false;
  const story = value as Record<string, unknown>;
  if (!story.flags || typeof story.flags !== "object" || Array.isArray(story.flags)) return false;
  const flagValues = Object.values(story.flags as Record<string, unknown>);
  if (flagValues.length > 100 || flagValues.some((flag) => typeof flag !== "boolean")) return false;
  if (!Array.isArray(story.evidence) || story.evidence.some((id) => !validEvidence.has(id as CampaignEvidenceId))) return false;
  if (!story.stats || typeof story.stats !== "object") return false;
  const stats = story.stats as Record<string, unknown>;
  return ["publicFaith", "civilianSafety", "goddessTrust", "wardenTrust"]
    .every((key) => inRange(stats[key], -999, 999));
}

export function loadCampaign(storage: CampaignStorage, key: string = campaignSaveKey): CampaignState {
  try {
    const raw = storage.getItem(key);
    if (!raw) return key === mainlineSaveKey ? createMainlineCampaignState() : createCampaignState();
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && (parsed as Record<string, unknown>).version === 5) {
      const legacy = parsed as Record<string, unknown>;
      const normalized = {
        ...legacy,
        campaignId: legacy.campaignId === "arthur-main" ? "arthur-main" : "unflagged-side",
        coins: typeof legacy.coins === "number" ? legacy.coins : 0,
        potions: typeof legacy.potions === "number" ? legacy.potions : 0,
        ownedWeapons: Array.isArray(legacy.ownedWeapons) ? legacy.ownedWeapons : [],
        evidence: Array.isArray(legacy.evidenceItems) && legacy.evidenceItems.length > 0 ? legacy.evidence : 0,
      };
      if (isCampaignState(normalized)) {
        storage.setItem(key, JSON.stringify(normalized));
        return normalized;
      }
    }
    if (parsed && typeof parsed === "object" && (parsed as Record<string, unknown>).version === 4) {
      const legacy = parsed as Record<string, unknown>;
      const migrated = {
        ...legacy,
        version: 4,
        campaignId: "unflagged-side",
        coins: typeof legacy.coins === "number" ? legacy.coins : 0,
        potions: typeof legacy.potions === "number" ? legacy.potions : 0,
        ownedWeapons: Array.isArray(legacy.ownedWeapons) ? legacy.ownedWeapons : [],
        evidence: Array.isArray(legacy.evidenceItems) && legacy.evidenceItems.length > 0 ? legacy.evidence : 0,
      };
      if (isCampaignState(migrated)) {
        storage.setItem(campaignSaveKey, JSON.stringify(migrated));
        return migrated;
      }
    }
    if (parsed && typeof parsed === "object" && [1, 2, 3].includes((parsed as Record<string, unknown>).version as number)) {
      const legacyVersion = (parsed as Record<string, unknown>).version as 1 | 2 | 3;
      const legacy = parsed as Record<string, unknown>;
      const checkpointStoryState = legacy.storyCheckpoint && typeof legacy.storyCheckpoint === "object"
        ? (legacy.storyCheckpoint as Record<string, unknown>).storyState
        : undefined;
      const migratedStoryState = validStoryState(legacy.storyState)
        ? cloneStoryState(legacy.storyState)
        : validStoryState(checkpointStoryState)
          ? cloneStoryState(checkpointStoryState)
          : {
              ...createInitialStoryState(),
              evidence: Array.isArray(legacy.evidenceItems)
                ? legacy.evidenceItems.filter((id): id is CampaignEvidenceId => validEvidence.has(id as CampaignEvidenceId))
                : [],
            };
      const migrated = {
        ...legacy,
        version: 4,
        campaignId: "unflagged-side",
        ...(legacyVersion === 1 ? { recruitmentMeetings: 1, recruitmentPity: 0, recruitmentMarks: 0 } : {}),
        rewardedBattleIds: [],
        storyState: migratedStoryState,
      };
      if (isCampaignState(migrated)) {
        storage.setItem(campaignSaveKey, JSON.stringify(migrated));
        return migrated;
      }
    }
    return key === mainlineSaveKey ? createMainlineCampaignState() : createCampaignState();
  } catch {
    return key === mainlineSaveKey ? createMainlineCampaignState() : createCampaignState();
  }
}

export function loadCampaignById(storage: CampaignStorage, campaignId: CampaignId): CampaignState {
  return loadCampaign(storage, campaignId === "arthur-main" ? mainlineSaveKey : campaignSaveKey);
}

export function clearCampaign(storage: CampaignStorage): CampaignState {
  storage.removeItem(campaignSaveKey);
  return createCampaignState();
}
