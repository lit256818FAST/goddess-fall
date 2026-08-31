export type FactionId = "goddess_state" | "wardens" | "new_kavala" | "unflagged" | "council" | "black_church";

export type CharacterId =
  | "the_unflagged"
  | "seraphina"
  | "reina"
  | "odric"
  | "cole"
  | "agnes"
  | "old_mara"
  | "masked_saboteur"
  | "arthur"
  | "hans"
  | "asnoka"
  | "white_knight_captain"
  | "night_judge"
  | "lake_dual_god";

export type EvidenceId = "lamp_oil_ledger" | "cold_ash" | "broken_wrench";

export type StoryFlag =
  | "questioned_mara"
  | "inspected_altar"
  | "protected_pilgrims"
  | "accused_wardens"
  | "revealed_mechanism"
  | "concealed_mechanism"
  | "saboteur_captured"
  | "square_stabilized"
  | "trusted_reina_plan"
  | "protected_grain_route"
  | "exposed_iron_profit"
  | "chose_vessel"
  | "chose_faith"
  | "chose_evidence"
  | "completed_three_witnesses"
  | "published_evidence_limits"
  | "continued_evidence_crosscheck"
  | "seraphina_signed_limited_testimony"
  | "unflagged_published_protocol"
  | "unflagged_negotiated_voluntary_passage"
  | "witnesses_adopted_exit_rights"
  | "protected_living_witnesses"
  | "heard_seraphina_archive"
  | "seraphina_preserved_archive"
  | "reina_mapped_altar"
  | "reina_disabled_altar"
  | "unflagged_declared_origin"
  | "unflagged_recorded_names"
  | "recovered_ash_testimony"
  | "protected_ash_witnesses"
  | "odric_spared_witness"
  | "odric_took_public_copy"
  | "odric_signed_passage"
  | "reina_disclosed_design"
  | "reina_mapped_villages"
  | "cole_trained_militia"
  | "cole_scouted_blindspots"
  | "recovered_wrench_provenance"
  | "secured_wrench_copies"
  | "cole_rejected_pursuit"
  | "cole_shadowed_scouts"
  | "camp_investigated_core"
  | "camp_restored_party"
  | "camp_negotiated_drivers"
  | "reina_owned_design"
  | "agnes_restored_witnesses"
  | "agnes_negotiated_passage";

export type StoryStat = "publicFaith" | "civilianSafety" | "goddessTrust" | "wardenTrust";

export interface Faction {
  id: FactionId;
  name: string;
  shortName: string;
  creed: string;
  color: string;
  description: string;
}

export interface Character {
  id: CharacterId;
  name: string;
  title: string;
  factionId: FactionId;
  role: "player" | "companion" | "civilian" | "enemy";
  portraitKey: string;
  description: string;
}

export interface Evidence {
  id: EvidenceId;
  name: string;
  summary: string;
  detail: string;
  iconKey: string;
  tags: string[];
}

export interface StoryState {
  flags: Partial<Record<StoryFlag, boolean>>;
  evidence: EvidenceId[];
  stats: Record<StoryStat, number>;
}

export interface StoryEffect {
  setFlags?: StoryFlag[];
  addEvidence?: EvidenceId[];
  statChanges?: Partial<Record<StoryStat, number>>;
}

export interface StoryCondition {
  flagsAll?: StoryFlag[];
  flagsNone?: StoryFlag[];
  evidenceAll?: EvidenceId[];
  statAtLeast?: Partial<Record<StoryStat, number>>;
}

export interface DialogueLine {
  speakerId?: CharacterId;
  text: string;
  emotion?: "neutral" | "fear" | "anger" | "resolve" | "doubt";
  portraitState?: "idle" | "attack" | "hit";
  stageDirection?: string;
}

export interface StoryChoice {
  id: string;
  label: string;
  hint?: string;
  condition?: StoryCondition;
  effects?: StoryEffect;
  next: string;
}

export interface DialogueNode {
  id: string;
  kind: "dialogue";
  title?: string;
  artwork?: {
    src: string;
    alt: string;
  };
  focusCharacterId?: CharacterId;
  evidenceRecovery?: boolean;
  lines: DialogueLine[];
  choices: StoryChoice[];
}

export interface BattleNode {
  id: string;
  kind: "battle";
  battleId: string;
  title: string;
  briefing: string;
  objectives: string[];
  victoryNext: string;
  defeatNext: string;
}

export interface EndingNode {
  id: string;
  kind: "ending";
  endingId: "truth" | "order" | "failure";
  title: string;
  lines: DialogueLine[];
  summary: string;
  /** Optional continuation used by multi-battle chapters. */
  continueNodeId?: string;
}

export type StoryNode = DialogueNode | BattleNode | EndingNode;

export interface StoryChapter {
  id: string;
  title: string;
  subtitle: string;
  artwork: {
    src: string;
    alt: string;
  };
  startNodeId: string;
  actionNodeIds: readonly string[];
  nodes: Record<string, StoryNode>;
}

export const initialStoryState: StoryState = {
  flags: {},
  evidence: [],
  stats: {
    publicFaith: 60,
    civilianSafety: 50,
    goddessTrust: 0,
    wardenTrust: 0,
  },
};
