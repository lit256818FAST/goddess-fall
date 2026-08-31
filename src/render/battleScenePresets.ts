import type { TerrainCell, TerrainKind } from '../game/battle';

export interface BattleSceneLighting {
  background: number;
  fog: number;
  sun: number;
  fill: number;
  rim: number;
  exposure: number;
}

export interface BattleScenePalette {
  ground: number;
  tileEven: number;
  tileOdd: number;
  slab: number;
  frame: number;
  cap: number;
  gold: number;
  terrain: Readonly<Record<TerrainKind, number>>;
  flame: number;
  glow: number;
}

export interface BattleSceneTerrainSpec {
  position: { x: number; y: number };
  kind: TerrainKind;
  label?: string;
  assetId?: string;
  blocksMovement?: boolean;
  interactable?: boolean;
  active?: boolean;
}

/**
 * Runtime-only scene contract. It describes tactical cells and visual props,
 * while the rule layer remains responsible for validating movement and goals.
 * Optional GLBs are referenced by assetId and always have a procedural visual
 * fallback in Battlefield.
 */
export interface BattleScenePreset {
  id: string;
  title: string;
  region: string;
  terrain: readonly BattleSceneTerrainSpec[];
  objectiveCells?: readonly { x: number; y: number }[];
  lighting?: BattleSceneLighting;
  palette?: BattleScenePalette;
}

const defaultLighting: BattleSceneLighting = {
  background: 0x18242d,
  fog: 0x18242d,
  sun: 2.75,
  fill: 0.72,
  rim: 0.9,
  exposure: 1.08,
};

const palettes: Readonly<Record<string, BattleScenePalette>> = {
  ironFire: {
    ground: 0x726d67, tileEven: 0x59636a, tileOdd: 0x68747a, slab: 0x30383e, frame: 0x41484e, cap: 0x9b8d6e, gold: 0xc69a55,
    terrain: { 'holy-fire': 0x9a6345, 'ruin-cover': 0x59636a, brush: 0x435449, mud: 0x675b4f, mechanism: 0x68757c }, flame: 0xff9b4b, glow: 0xffa556,
  },
  ironFrontier: {
    ground: 0x6b716f, tileEven: 0x4c5d64, tileOdd: 0x5d6d72, slab: 0x2d363a, frame: 0x3b454b, cap: 0x987e60, gold: 0xb8874e,
    terrain: { 'holy-fire': 0x8b5c43, 'ruin-cover': 0x566166, brush: 0x3d5047, mud: 0x715d4c, mechanism: 0x6f7776 }, flame: 0xff8d3e, glow: 0xf28c42,
  },
  riverGreen: {
    ground: 0x68776d, tileEven: 0x536960, tileOdd: 0x647a6c, slab: 0x35433e, frame: 0x4b5b50, cap: 0x92896a, gold: 0xb99a57,
    terrain: { 'holy-fire': 0x8c6845, 'ruin-cover': 0x59645b, brush: 0x3b6148, mud: 0x76644a, mechanism: 0x607b73 }, flame: 0xffac57, glow: 0xf0a04e,
  },
  holyConflict: {
    ground: 0x746d69, tileEven: 0x5d6068, tileOdd: 0x6f7279, slab: 0x35383e, frame: 0x454850, cap: 0xa69772, gold: 0xd0aa5e,
    terrain: { 'holy-fire': 0xb47a46, 'ruin-cover': 0x60626a, brush: 0x3d4d47, mud: 0x6a5a50, mechanism: 0x77777a }, flame: 0xffb85a, glow: 0xffb45b,
  },
  veilMidnight: {
    ground: 0x4d5965, tileEven: 0x394856, tileOdd: 0x465565, slab: 0x242d38, frame: 0x35424e, cap: 0x807962, gold: 0xb89b59,
    terrain: { 'holy-fire': 0x7b5961, 'ruin-cover': 0x4e5a68, brush: 0x283f42, mud: 0x4d4750, mechanism: 0x586777 }, flame: 0x9ed9ff, glow: 0x87d9ff,
  },
  steppe: {
    ground: 0x7c7562, tileEven: 0x6d735d, tileOdd: 0x7d8068, slab: 0x4b463d, frame: 0x5a5447, cap: 0xa28b62, gold: 0xc49b56,
    terrain: { 'holy-fire': 0xa56e3f, 'ruin-cover': 0x696554, brush: 0x526345, mud: 0x796849, mechanism: 0x73715d }, flame: 0xffb45b, glow: 0xf3a44d,
  },
};

export const defaultBattlePalette = palettes.ironFire;

export function paletteForBattleId(battleId: string): BattleScenePalette {
  if (battleId.includes('lake') || battleId.includes('night-judge') || battleId.includes('cathedral')) return palettes.veilMidnight;
  if (battleId.includes('steppe') || battleId.includes('dragon')) return palettes.steppe;
  if (battleId.includes('four-country') || battleId.includes('white-knight')) return palettes.holyConflict;
  if (battleId.includes('lowland')) return palettes.riverGreen;
  if (battleId.includes('border') || battleId.includes('iron-bulwark') || battleId.includes('grain-crossing')) return palettes.ironFrontier;
  return palettes.ironFire;
}

const cell = (
  x: number,
  y: number,
  kind: TerrainKind,
  options: Omit<BattleSceneTerrainSpec, 'position' | 'kind'> = {},
): BattleSceneTerrainSpec => ({ position: { x, y }, kind, ...options });

/** First runtime vertical slice for the Arthur campaign. */
export const mainlineBattleScenePresets: Readonly<Record<string, BattleScenePreset>> = {
  'arthur-execution-escape': {
    id: 'arthur-execution-escape',
    title: '刑场逃亡',
    region: '卫道士军国 · 刑场边境',
    terrain: [
      cell(3, 3, 'holy-fire', { label: '处刑火盆', assetId: 'brazier', interactable: true, blocksMovement: true }),
      cell(4, 3, 'holy-fire', { label: '处刑祭坛', assetId: 'altar', interactable: true, blocksMovement: true }),
      cell(2, 4, 'ruin-cover', { assetId: 'wall-broken', blocksMovement: true }),
      cell(5, 4, 'ruin-cover', { assetId: 'gate-segment', blocksMovement: true }),
      cell(3, 5, 'brush', { assetId: 'bush' }),
      cell(6, 0, 'mechanism', { label: '东侧军牌检查点', assetId: 'road-sign', interactable: true, blocksMovement: false }),
    ],
    objectiveCells: [{ x: 6, y: 0 }, { x: 7, y: 0 }, { x: 6, y: 1 }, { x: 7, y: 1 }],
    lighting: { ...defaultLighting, background: 0x20252a, fog: 0x20252a, sun: 3.15, exposure: 1.14 },
    palette: palettes.ironFire,
  },
  'arthur-border-blockade': {
    id: 'arthur-border-blockade',
    title: '边境堵截',
    region: '卫道士军国 · 东侧军牌哨线',
    terrain: [
      cell(3, 2, 'mechanism', { label: '锁轴控制轮', assetId: 'valve-wheel', interactable: true, blocksMovement: true }),
      cell(4, 2, 'mechanism', { label: '锁轴动力块', assetId: 'anvil-block', interactable: true, blocksMovement: true }),
      cell(2, 4, 'mud', { assetId: 'mud-patch' }),
      cell(5, 4, 'ruin-cover', { assetId: 'iron-fence', blocksMovement: true }),
      cell(3, 5, 'ruin-cover', { assetId: 'coal-cart', blocksMovement: true }),
      cell(4, 5, 'ruin-cover', { assetId: 'scrap-pile', blocksMovement: true }),
    ],
    objectiveCells: [{ x: 3, y: 2 }, { x: 4, y: 2 }],
    lighting: { ...defaultLighting, background: 0x202a30, fog: 0x202a30, sun: 2.65, fill: 0.88, exposure: 1.12 },
    palette: palettes.ironFrontier,
  },
  'arthur-lowland-ambush': {
    id: 'arthur-lowland-ambush',
    title: '马奴低洼伏击',
    region: '新卡瓦拉 · 河湾低洼地',
    terrain: [
      cell(3, 3, 'mechanism', { label: '北侧水闸', assetId: 'valve-wheel', interactable: true, blocksMovement: true }),
      cell(4, 3, 'mud', { assetId: 'mud-patch' }),
      cell(2, 4, 'brush', { assetId: 'bush' }),
      cell(5, 4, 'mud', { assetId: 'mud-patch' }),
      cell(3, 5, 'ruin-cover', { label: '粮车', assetId: 'grain-cart', interactable: true, blocksMovement: true }),
      cell(5, 5, 'ruin-cover', { assetId: 'dead-tree', blocksMovement: true }),
    ],
    objectiveCells: [{ x: 3, y: 3 }, { x: 4, y: 3 }],
    lighting: { ...defaultLighting, background: 0x25302d, fog: 0x25302d, sun: 2.45, fill: 0.95, rim: 0.72, exposure: 1.16 },
    palette: palettes.riverGreen,
  },
  'lake-dual-god': {
    id: 'lake-dual-god',
    title: '湖都信仰发散器',
    region: '湖都外围 · 三路信仰装置',
    terrain: [
      cell(2, 2, 'mechanism', { label: '赤核发散器', assetId: 'veiled-anchor', interactable: true, blocksMovement: true }),
      cell(5, 2, 'mechanism', { label: '白核发散器', assetId: 'ritual-ring', interactable: true, blocksMovement: true }),
      cell(3, 5, 'holy-fire', { label: '中央信仰阀', assetId: 'veiled-brazier', interactable: true, blocksMovement: true }),
      cell(3, 3, 'ruin-cover', { assetId: 'statue-base', blocksMovement: true }),
      cell(4, 4, 'brush', { assetId: 'floating-shard-a' }),
      cell(4, 5, 'brush', { assetId: 'floating-shard-b' }),
      cell(1, 4, 'brush', { assetId: 'black-bush' }),
      cell(6, 4, 'ruin-cover', { assetId: 'veil-pillar', blocksMovement: true }),
    ],
    objectiveCells: [{ x: 2, y: 2 }, { x: 5, y: 2 }, { x: 3, y: 5 }],
    lighting: { ...defaultLighting, background: 0x151e2b, fog: 0x151e2b, sun: 2.15, fill: 0.58, rim: 1.18, exposure: 1.2 },
    palette: palettes.veilMidnight,
  },
};

export function battleScenePresetFor(battleId: string): BattleScenePreset | undefined {
  return mainlineBattleScenePresets[battleId];
}

export function terrainForBattleScene(battleId: string): TerrainCell[] | undefined {
  const preset = battleScenePresetFor(battleId);
  if (!preset) return undefined;
  return preset.terrain.map((spec) => ({
    position: { ...spec.position },
    kind: spec.kind,
    blocksMovement: spec.blocksMovement ?? ['holy-fire', 'ruin-cover', 'mechanism'].includes(spec.kind),
    interactable: spec.interactable ?? false,
    active: spec.active ?? true,
    label: spec.label,
    assetId: spec.assetId,
  }));
}
