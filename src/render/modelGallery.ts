import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { environmentVisualManifest } from './environmentVisuals';
import { characterVisualManifest, type VisualKey } from './characterVisuals';
import { inventoryModelUrl } from './modelInventory';

export type ModelGalleryCategory = '角色' | '敌人' | 'Boss' | '环境' | 'K3 回退';
export type ModelGalleryMaker = 'K3' | 'GPT' | '项目/第三方';

export interface ModelGalleryAsset {
  id: string;
  title: string;
  category: ModelGalleryCategory;
  maker: ModelGalleryMaker;
  source: 'runtime' | 'K3';
  url: string;
  visualScale: number;
  actions: string[];
  aliases?: string[];
  fallbackOf?: string;
}

const characterTitles: Record<string, string> = {
  unflagged: '无旗者', seraphina: '塞拉菲娜', reina: '蕾娜', odric: '奥德里克', cole: '科尔', agnes: '阿格尼丝',
  'cultist-melee': '邪教徒近战', 'shield-guard': '盾卫', scout: '斥候', 'faith-acolyte': '信仰术士', engineer: '工程兵', 'raider-rider': '掠骑',
  arthur: '亚瑟', hans: '汉斯', asnoka: '阿斯诺卡',
  'boss-odric': '奥德里克 · 信念裁决', 'boss-iron-bulwark': '铁窗壁垒', 'boss-veiled-avatar': '守幕圣像',
  'boss-white-knight': '白光骑士', 'boss-night-judge': '永夜审判官', 'boss-lake-god-a': '湖都双神 · A', 'boss-lake-god-b': '湖都双神 · B',
};

const environmentTitles: Record<string, string> = {
  'rail-straight': '直轨', 'rail-curve': '弯轨', 'rail-buffer': '止挡轨', 'valve-wheel': '阀轮', 'scrap-pile': '废料堆', 'mud-patch': '泥地',
  'anvil-block': '铁砧块', 'ore-crate': '矿石箱', 'iron-fence': '铁栅栏', 'coal-cart': '煤车', altar: '祭坛', brazier: '圣火火盆',
  bush: '灌木', column: '石柱', 'dead-tree': '枯树', 'gate-segment': '圣辉门段', 'grain-cart': '粮车', 'road-sign': '路标', rubble: '碎石',
  'wall-broken': '残墙', 'statue-base': '神座底座', 'corrupted-brazier': '污火火盆', 'stone-steps': '石阶', 'floating-shard-a': '浮空碎片 A',
  'floating-shard-b': '浮空碎片 B', 'black-bush': '黑灌木', 'black-tree': '黑树', 'ritual-ring': '仪式环', 'veil-pillar': '幕柱', 'fallen-bell': '坠钟',
};

const enemyKeys = new Set(['cultist-melee', 'shield-guard', 'scout', 'faith-acolyte', 'engineer', 'raider-rider']);
const uniqueByUrl = (assets: ModelGalleryAsset[]) => {
  const unique: ModelGalleryAsset[] = [];
  const seen = new Set<string>();
  for (const asset of assets) {
    if (seen.has(asset.url)) continue;
    seen.add(asset.url);
    unique.push(asset);
  }
  return unique;
};
function makerForUrl(url: string): ModelGalleryMaker {
  if (url.includes('/mainline/')) return 'GPT';
  if (url.includes('/environment/') || url.includes('/models/k3/') || url.includes('/models/heroes/')) return 'K3';
  return '项目/第三方';
}

function characterCategory(key: string): ModelGalleryCategory {
  if (key.startsWith('boss-')) return 'Boss';
  return enemyKeys.has(key) ? '敌人' : '角色';
}

function characterAssets(): ModelGalleryAsset[] {
  const assets: ModelGalleryAsset[] = [];
  for (const [key, entry] of Object.entries(characterVisualManifest) as [VisualKey, typeof characterVisualManifest[VisualKey]][]) {
    if (!entry.url) continue;
    const title = characterTitles[key] ?? key;
    assets.push({ id: key, title, category: characterCategory(key), maker: makerForUrl(entry.url), source: 'K3', url: inventoryModelUrl(entry.url), visualScale: entry.visualScale, actions: Object.keys(entry.actionAliases ?? {}) });
    for (const [index, fallback] of (entry.fallbacks ?? []).entries()) {
      assets.push({ id: key + '-fallback-' + index, title: title + ' · K3 回退', category: 'K3 回退', maker: 'K3', source: 'K3', url: inventoryModelUrl(fallback.url), visualScale: fallback.visualScale, actions: Object.keys(entry.actionAliases ?? {}), fallbackOf: key });
    }
  }
  return assets;
}

function environmentAssets(): ModelGalleryAsset[] {
  const grouped = new Map<string, ModelGalleryAsset>();
  for (const [key, entry] of Object.entries(environmentVisualManifest)) {
    const existing = grouped.get(entry.url);
    if (existing) existing.aliases = [...(existing.aliases ?? []), key];
    else grouped.set(entry.url, { id: key, title: environmentTitles[key] ?? key, category: '环境', maker: 'K3', source: 'K3', url: inventoryModelUrl(entry.url), visualScale: entry.visualScale, actions: [], aliases: [key] });
  }
  return [...grouped.values()].map(asset => ({ ...asset, aliases: asset.aliases && asset.aliases.length > 1 ? asset.aliases : undefined }));
}

export const modelGalleryAssets: readonly ModelGalleryAsset[] = uniqueByUrl([...characterAssets(), ...environmentAssets()]);

export function modelGallerySummary() {
  const unique = uniqueByUrl([...modelGalleryAssets]);
  const k3 = unique.filter(asset => asset.maker === 'K3');
  const gpt = unique.filter(asset => asset.maker === 'GPT');
  const other = unique.filter(asset => asset.maker === '项目/第三方');
  return { total: unique.length, k3: k3.length, gpt: gpt.length, other: other.length, fallbacks: modelGalleryAssets.filter(asset => asset.fallbackOf).length };
}

export function formatModelBytes(bytes: number | undefined): string {
  if (bytes === undefined) return '读取中';
  if (bytes < 1024) return bytes + ' B';
  return (bytes / 1024 / 1024).toFixed(2) + ' MiB';
}

export interface ModelGalleryController { select(id: string): void; dispose(): void }

export function mountModelGallery(root: HTMLElement, initialId: string, onSelection?: (asset: ModelGalleryAsset) => void): ModelGalleryController {
  const canvas = root.querySelector<HTMLCanvasElement>('#model-gallery-canvas');
  if (!canvas) throw new Error('Missing model gallery canvas');
  const stage = canvas.parentElement;
  if (!stage) throw new Error('Missing model gallery stage');
  const loader = new GLTFLoader();
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#101a20');
  scene.fog = new THREE.Fog('#101a20', 7, 13);
  const camera = new THREE.PerspectiveCamera(35, 1, .05, 50);
  camera.position.set(2.8, 1.8, 4.2);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.target.set(0, .8, 0);
  const modelRoot = new THREE.Group();
  const ground = new THREE.Mesh(new THREE.CircleGeometry(1.65, 64), new THREE.MeshStandardMaterial({ color: '#1c2b31', roughness: .9, metalness: .05 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = .002;
  scene.add(modelRoot, ground);
  scene.add(new THREE.HemisphereLight('#d6e2e3', '#11161a', 1.5));
  const keyLight = new THREE.DirectionalLight('#f7d99e', 3.2); keyLight.position.set(3, 5, 4); scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight('#7eb7c6', 1.5); rimLight.position.set(-4, 3, -3); scene.add(rimLight);
  let activeModel: THREE.Object3D | undefined;
  let mixer: THREE.AnimationMixer | undefined;
  let token = 0;
  let selected = modelGalleryAssets.find(asset => asset.id === initialId) ?? modelGalleryAssets[0];
  let rotation = 0;
  const setText = (selector: string, value: string) => { const node = root.querySelector<HTMLElement>(selector); if (node) node.textContent = value; };
  const setStatus = (value: string, error = false) => { const node = root.querySelector<HTMLElement>('[data-model-status]'); if (node) { node.textContent = value; node.dataset.error = error ? 'true' : 'false'; } };
  const updateDetails = (asset: ModelGalleryAsset) => {
    setText('[data-model-title]', asset.title);
    setText('[data-model-source]', asset.maker === 'K3' ? 'K3 制作' : asset.maker === 'GPT' ? 'GPT / img2threejs 制作' : '项目整理 / 第三方资产');
    setText('[data-model-path]', asset.url);
    setText('[data-model-scale]', asset.visualScale.toFixed(4));
    setText('[data-model-actions]', asset.actions.length ? asset.actions.join(' · ') : '加载后读取动画片段');
    root.querySelectorAll<HTMLButtonElement>('[data-model-select]').forEach(button => button.classList.toggle('active', button.dataset.modelSelect === asset.id));
    onSelection?.(asset);
  };
  const disposeObject = (object: THREE.Object3D) => object.traverse(child => {
    if (!(child instanceof THREE.Mesh)) return;
    child.geometry.dispose();
    for (const material of Array.isArray(child.material) ? child.material : [child.material]) {
      for (const value of Object.values(material)) if (value instanceof THREE.Texture) value.dispose();
      material.dispose();
    }
  });
  const load = async (asset: ModelGalleryAsset) => {
    const request = ++token;
    selected = asset;
    updateDetails(asset);
    setStatus('正在加载 GLB…');
    try {
      const gltf = await loader.loadAsync(asset.url);
      if (request !== token) { disposeObject(gltf.scene); return; }
      if (activeModel) { modelRoot.remove(activeModel); disposeObject(activeModel); }
      activeModel = gltf.scene;
      activeModel.scale.setScalar(asset.visualScale);
      activeModel.traverse(child => { if (child instanceof THREE.Mesh) { child.castShadow = true; child.receiveShadow = true; } });
      modelRoot.add(activeModel);
      modelRoot.updateMatrixWorld(true);
      const bounds = new THREE.Box3().setFromObject(activeModel);
      const center = bounds.getCenter(new THREE.Vector3());
      activeModel.position.x -= center.x;
      activeModel.position.z -= center.z;
      activeModel.position.y -= bounds.min.y;
      const size = bounds.getSize(new THREE.Vector3());
      const height = Math.max(size.y, 1);
      camera.position.set(height * 1.25, height * .75, height * 1.85);
      controls.target.set(0, height * .5, 0);
      controls.update();
      mixer = gltf.animations.length ? new THREE.AnimationMixer(activeModel) : undefined;
      const idle = gltf.animations.find(clip => /idle/i.test(clip.name)) ?? gltf.animations[0];
      if (idle && mixer) mixer.clipAction(idle).play();
      setText('[data-model-actions]', gltf.animations.length ? gltf.animations.map(clip => clip.name).join(' · ') : '无内嵌动画');
      setStatus('已加载 · ' + gltf.animations.length + ' 个动画片段');
    } catch (error) {
      setStatus('加载失败：' + String(error).replace(/^Error:\s*/, ''), true);
    }
  };
  const resize = () => { const rect = stage.getBoundingClientRect(); const width = Math.max(1, rect.width); const height = Math.max(1, rect.height); renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); };
  const observer = new ResizeObserver(resize); observer.observe(stage); resize();
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-model-select]')];
  const onSelect = (event: Event) => { const id = (event.currentTarget as HTMLButtonElement).dataset.modelSelect; const asset = modelGalleryAssets.find(item => item.id === id); if (asset) void load(asset); };
  buttons.forEach(button => button.addEventListener('click', onSelect));
  const render = () => { if (activeModel) { rotation += .0025; modelRoot.rotation.y = rotation; } controls.update(); mixer?.update(.016); renderer.render(scene, camera); };
  renderer.setAnimationLoop(render);
  updateDetails(selected);
  void load(selected);
  const bytes = new Map<string, number>();
  void Promise.all(uniqueByUrl([...modelGalleryAssets]).map(async asset => { try { const response = await fetch(asset.url, { method: 'HEAD' }); const value = Number(response.headers.get('content-length')); if (Number.isFinite(value) && value > 0) bytes.set(asset.url, value); } catch { /* size is optional metadata */ } })).then(() => { const total = [...bytes.values()].reduce((sum, value) => sum + value, 0); const k3Total = uniqueByUrl([...modelGalleryAssets].filter(asset => asset.maker === 'K3')).reduce((sum, asset) => sum + (bytes.get(asset.url) ?? 0), 0); setText('[data-model-total-size]', total ? formatModelBytes(total) : '不可用'); setText('[data-model-k3-size]', k3Total ? formatModelBytes(k3Total) : '不可用'); });
  return { select: id => { const asset = modelGalleryAssets.find(item => item.id === id); if (asset) void load(asset); }, dispose: () => { ++token; observer.disconnect(); buttons.forEach(button => button.removeEventListener('click', onSelect)); renderer.setAnimationLoop(null); controls.dispose(); if (activeModel) disposeObject(activeModel); ground.geometry.dispose(); ground.material.dispose(); renderer.dispose(); } };
}
