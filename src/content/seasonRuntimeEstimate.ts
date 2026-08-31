import {
  initialStoryState,
  type CharacterId,
  type StoryChapter,
  type StoryChoice,
  type StoryCondition,
  type StoryEffect,
  type StoryFlag,
  type StoryNode,
  type StoryState,
  type StoryStat,
  type EvidenceId,
} from "./types";

export interface SeasonNarrativeMetrics {
  visibleChineseCharacters: number;
  dialogueLines: number;
  choices: number;
  dialogueNodes: number;
  battleNodes: number;
  endingNodes: number;
  personalSceneCharacters: CharacterId[];
  evidenceRecoveryDialogues: number;
}

export interface SeasonRuntimeEstimate {
  modelNotice: string;
  readingMinutes: { min: number; max: number };
  battleMinutes: { min: number; max: number };
  menuAndPreparationMinutes: { min: number; max: number };
  totalMinutes: { min: number; max: number };
}

export interface SuccessfulRouteMetrics {
  visibleChineseCharacters: number;
  dialogueLines: number;
  choicesShown: number;
  dialogueNodes: number;
  battleNodes: number;
  endingNodes: number;
  visitedNodeIds: string[];
  selectedChoiceIds: string[];
  endingIds: Array<"truth" | "order">;
}

export interface SuccessfulRouteEstimate {
  metrics: SuccessfulRouteMetrics;
  runtime: SeasonRuntimeEstimate;
  finalState: StoryState;
}

interface RouteProgress {
  metrics: SuccessfulRouteMetrics;
  state: StoryState;
}

interface StateRelevance {
  flags: StoryFlag[];
  evidence: EvidenceId[];
  statThresholds: Partial<Record<StoryStat, number[]>>;
}

const chineseCharacters = (value: string | undefined): number =>
  value?.match(/\p{Script=Han}/gu)?.length ?? 0;

const countChinese = (...values: Array<string | undefined>): number =>
  values.reduce((total, value) => total + chineseCharacters(value), 0);

const cloneState = (state: StoryState): StoryState => ({
  flags: { ...state.flags },
  evidence: [...state.evidence],
  stats: { ...state.stats },
});

const stateKey = (state: StoryState, relevance: StateRelevance): string => {
  const flags = relevance.flags.map((flag) => (state.flags[flag] ? "1" : "0")).join("");
  const evidence = relevance.evidence
    .map((evidenceId) => (state.evidence.includes(evidenceId) ? "1" : "0"))
    .join("");
  const stats = Object.entries(relevance.statThresholds)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([stat, thresholds]) => {
      const value = state.stats[stat as StoryStat];
      return `${stat}:${thresholds?.map((threshold) => (value >= threshold ? "1" : "0")).join("")}`;
    })
    .join(",");
  return `${flags}|${evidence}|${stats}`;
};

const collectStateRelevance = (chapters: readonly StoryChapter[]): StateRelevance => {
  const flags = new Set<StoryFlag>();
  const evidence = new Set<EvidenceId>();
  const statThresholds = new Map<StoryStat, Set<number>>();
  for (const chapter of chapters) {
    for (const node of Object.values(chapter.nodes)) {
      if (node.kind !== "dialogue") continue;
      for (const choice of node.choices) {
        for (const flag of choice.condition?.flagsAll ?? []) flags.add(flag);
        for (const flag of choice.condition?.flagsNone ?? []) flags.add(flag);
        for (const evidenceId of choice.condition?.evidenceAll ?? []) evidence.add(evidenceId);
        for (const [stat, threshold] of Object.entries(choice.condition?.statAtLeast ?? {})) {
          const key = stat as StoryStat;
          const values = statThresholds.get(key) ?? new Set<number>();
          values.add(threshold ?? 0);
          statThresholds.set(key, values);
        }
      }
    }
  }
  return {
    flags: [...flags].sort(),
    evidence: [...evidence].sort(),
    statThresholds: Object.fromEntries(
      [...statThresholds.entries()].map(([stat, thresholds]) => [
        stat,
        [...thresholds].sort((left, right) => left - right),
      ]),
    ),
  };
};

const conditionMatches = (
  condition: StoryCondition | undefined,
  state: StoryState,
): boolean => {
  if (!condition) return true;
  if (condition.flagsAll?.some((flag) => !state.flags[flag])) return false;
  if (condition.flagsNone?.some((flag) => state.flags[flag])) return false;
  if (condition.evidenceAll?.some((evidence) => !state.evidence.includes(evidence))) return false;
  if (
    Object.entries(condition.statAtLeast ?? {}).some(
      ([stat, minimum]) => state.stats[stat as keyof StoryState["stats"]] < (minimum ?? 0),
    )
  ) {
    return false;
  }
  return true;
};

const applyEffects = (state: StoryState, effects: StoryEffect | undefined): StoryState => {
  const next = cloneState(state);
  for (const flag of effects?.setFlags ?? []) next.flags[flag] = true;
  for (const evidence of effects?.addEvidence ?? []) {
    if (!next.evidence.includes(evidence)) next.evidence.push(evidence);
  }
  for (const [stat, change] of Object.entries(effects?.statChanges ?? {})) {
    const key = stat as keyof StoryState["stats"];
    next.stats[key] += change ?? 0;
  }
  return next;
};

const emptyRouteMetrics = (): SuccessfulRouteMetrics => ({
  visibleChineseCharacters: 0,
  dialogueLines: 0,
  choicesShown: 0,
  dialogueNodes: 0,
  battleNodes: 0,
  endingNodes: 0,
  visitedNodeIds: [],
  selectedChoiceIds: [],
  endingIds: [],
});

const cloneMetrics = (metrics: SuccessfulRouteMetrics): SuccessfulRouteMetrics => ({
  ...metrics,
  visitedNodeIds: [...metrics.visitedNodeIds],
  selectedChoiceIds: [...metrics.selectedChoiceIds],
  endingIds: [...metrics.endingIds],
});

const routeMinimumMinutes = (
  metrics: Pick<SuccessfulRouteMetrics, "visibleChineseCharacters" | "battleNodes">,
  completedChapterCount: number,
): number =>
  metrics.visibleChineseCharacters / 320 +
  metrics.battleNodes * 12 +
  metrics.battleNodes * 12 +
  completedChapterCount * 7;

const countVisibleNode = (
  chapter: StoryChapter,
  node: StoryNode,
  state: StoryState,
  metrics: SuccessfulRouteMetrics,
): { metrics: SuccessfulRouteMetrics; availableChoices: StoryChoice[] } => {
  const next = cloneMetrics(metrics);
  next.visitedNodeIds.push(`${chapter.id}:${node.id}`);

  if (node.kind === "dialogue") {
    const availableChoices = node.choices.filter((choice) => conditionMatches(choice.condition, state));
    next.visibleChineseCharacters += countChinese(
      node.title,
      ...node.lines.flatMap((line) => [line.text, line.stageDirection]),
      ...availableChoices.flatMap((choice) => [choice.label, choice.hint]),
    );
    next.dialogueLines += node.lines.length;
    next.choicesShown += availableChoices.length;
    next.dialogueNodes += 1;
    return { metrics: next, availableChoices };
  }

  if (node.kind === "battle") {
    next.visibleChineseCharacters += countChinese(node.title, node.briefing, ...node.objectives);
    next.battleNodes += 1;
    return { metrics: next, availableChoices: [] };
  }

  next.visibleChineseCharacters += countChinese(
    node.title,
    node.summary,
    ...node.lines.flatMap((line) => [line.text, line.stageDirection]),
  );
  next.dialogueLines += node.lines.length;
  next.endingNodes += 1;
  return { metrics: next, availableChoices: [] };
};

function traverseChapter(
  chapter: StoryChapter,
  incoming: RouteProgress,
  completedChapterCount: number,
  relevance: StateRelevance,
): RouteProgress[] {
  const seededMetrics = cloneMetrics(incoming.metrics);
  seededMetrics.visibleChineseCharacters += countChinese(
    chapter.title,
    chapter.subtitle,
    chapter.artwork.alt,
  );

  const successfulByState = new Map<string, RouteProgress>();
  const bestAtNodeAndState = new Map<string, number>();

  const visit = (nodeId: string, state: StoryState, metrics: SuccessfulRouteMetrics): void => {
    const node = chapter.nodes[nodeId];
    if (!node) throw new Error(`Chapter "${chapter.id}" points to missing node "${nodeId}".`);

    const visitKey = `${nodeId}|${stateKey(state, relevance)}`;
    const runtimeBeforeNode = routeMinimumMinutes(metrics, completedChapterCount);
    const previousBest = bestAtNodeAndState.get(visitKey);
    if (previousBest !== undefined && previousBest <= runtimeBeforeNode) return;
    bestAtNodeAndState.set(visitKey, runtimeBeforeNode);

    const visible = countVisibleNode(chapter, node, state, metrics);
    if (node.kind === "battle") {
      visit(node.victoryNext, state, visible.metrics);
      return;
    }

    if (node.kind === "ending") {
      if (node.endingId === "failure") return;
      visible.metrics.endingIds.push(node.endingId);
      const key = stateKey(state, relevance);
      const candidate = { metrics: visible.metrics, state: cloneState(state) };
      const previous = successfulByState.get(key);
      if (
        !previous ||
        routeMinimumMinutes(candidate.metrics, completedChapterCount + 1) <
          routeMinimumMinutes(previous.metrics, completedChapterCount + 1)
      ) {
        successfulByState.set(key, candidate);
      }
      return;
    }

    for (const choice of visible.availableChoices) {
      const nextMetrics = cloneMetrics(visible.metrics);
      nextMetrics.selectedChoiceIds.push(`${chapter.id}:${choice.id}`);
      visit(choice.next, applyEffects(state, choice.effects), nextMetrics);
    }
  };

  visit(chapter.startNodeId, cloneState(incoming.state), seededMetrics);
  return [...successfulByState.values()];
}

/**
 * Finds the fastest route that wins every battle and reaches a non-failure ending
 * in every chapter. Story flags, evidence and stats are carried across chapters.
 *
 * Character counting follows what the player can actually read on that route:
 * node copy plus every currently available choice, not every unreachable branch.
 */
export function estimateShortestSuccessfulRoute(
  chapters: readonly StoryChapter[],
  initialState: StoryState = initialStoryState,
): SuccessfulRouteEstimate {
  if (chapters.length === 0) {
    const metrics = emptyRouteMetrics();
    return { metrics, runtime: estimateRouteRuntime(metrics, 0), finalState: cloneState(initialState) };
  }

  let routes: RouteProgress[] = [{ metrics: emptyRouteMetrics(), state: cloneState(initialState) }];
  const relevance = collectStateRelevance(chapters);
  chapters.forEach((chapter, chapterIndex) => {
    const nextByState = new Map<string, RouteProgress>();
    for (const route of routes) {
      for (const candidate of traverseChapter(chapter, route, chapterIndex, relevance)) {
        const key = stateKey(candidate.state, relevance);
        const previous = nextByState.get(key);
        if (
          !previous ||
          routeMinimumMinutes(candidate.metrics, chapterIndex + 1) <
            routeMinimumMinutes(previous.metrics, chapterIndex + 1)
        ) {
          nextByState.set(key, candidate);
        }
      }
    }
    routes = [...nextByState.values()];
    if (routes.length === 0) {
      throw new Error(`Chapter "${chapter.id}" has no reachable successful ending.`);
    }
  });

  const shortest = routes.reduce((best, route) =>
    routeMinimumMinutes(route.metrics, chapters.length) <
    routeMinimumMinutes(best.metrics, chapters.length)
      ? route
      : best,
  );
  return {
    metrics: shortest.metrics,
    runtime: estimateRouteRuntime(shortest.metrics, chapters.length),
    finalState: cloneState(shortest.state),
  };
}

export function collectSeasonNarrativeMetrics(
  chapters: readonly StoryChapter[],
): SeasonNarrativeMetrics {
  let visibleChineseCharacters = 0;
  let dialogueLines = 0;
  let choices = 0;
  let dialogueNodes = 0;
  let battleNodes = 0;
  let endingNodes = 0;
  let evidenceRecoveryDialogues = 0;
  const personalSceneCharacters = new Set<CharacterId>();
  const count = (...values: Array<string | undefined>): void => {
    visibleChineseCharacters += countChinese(...values);
  };

  for (const chapter of chapters) {
    count(chapter.title, chapter.subtitle);
    for (const node of Object.values(chapter.nodes)) {
      if (node.kind === "dialogue") {
        dialogueNodes += 1;
        dialogueLines += node.lines.length;
        choices += node.choices.length;
        if (node.focusCharacterId) personalSceneCharacters.add(node.focusCharacterId);
        if (node.evidenceRecovery) evidenceRecoveryDialogues += 1;
        count(node.title);
        for (const line of node.lines) count(line.text, line.stageDirection);
        for (const choice of node.choices) count(choice.label, choice.hint);
      } else if (node.kind === "battle") {
        battleNodes += 1;
        count(node.title, node.briefing, ...node.objectives);
      } else {
        endingNodes += 1;
        dialogueLines += node.lines.length;
        count(node.title, node.summary);
        for (const line of node.lines) count(line.text, line.stageDirection);
      }
    }
  }

  return {
    visibleChineseCharacters,
    dialogueLines,
    choices,
    dialogueNodes,
    battleNodes,
    endingNodes,
    personalSceneCharacters: [...personalSceneCharacters].sort(),
    evidenceRecoveryDialogues,
  };
}

function estimateRouteRuntime(
  metrics: Pick<SuccessfulRouteMetrics, "visibleChineseCharacters" | "battleNodes">,
  chapterCount: number,
): SeasonRuntimeEstimate {
  const readingMinutes = {
    min: metrics.visibleChineseCharacters / 320,
    max: metrics.visibleChineseCharacters / 250,
  };
  const battleMinutes = { min: metrics.battleNodes * 12, max: metrics.battleNodes * 20 };
  const menuAndPreparationMinutes = {
    min: metrics.battleNodes * 12 + chapterCount * 7,
    max: metrics.battleNodes * 16 + chapterCount * 10,
  };
  return {
    modelNotice:
      "基于实际可达成功路线的中文阅读字数、战斗场次和战前准备行为进行模型估算，并非真人计时。",
    readingMinutes,
    battleMinutes,
    menuAndPreparationMinutes,
    totalMinutes: {
      min: readingMinutes.min + battleMinutes.min + menuAndPreparationMinutes.min,
      max: readingMinutes.max + battleMinutes.max + menuAndPreparationMinutes.max,
    },
  };
}

export function estimateSeasonRuntime(metrics: SeasonNarrativeMetrics): SeasonRuntimeEstimate {
  return estimateRouteRuntime(
    {
      visibleChineseCharacters: metrics.visibleChineseCharacters,
      battleNodes: metrics.battleNodes,
    },
    3,
  );
}
