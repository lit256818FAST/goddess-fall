import * as THREE from 'three';
import type { Unit } from '../game/battle';
import { characterVisualManifest, visualKeyForUnit, type CharacterVisualInstance, type VisualAction } from './characterVisuals';

type IllustrationState = 'idle' | 'attack' | 'hit';

const stateForAction = (action: VisualAction): IllustrationState => {
  if (action === 'attack_health' || action === 'attack_faith' || action === 'skill') return 'attack';
  if (action === 'hit_health' || action === 'hit_faith' || action === 'death_health' || action === 'death_faith') return 'hit';
  return 'idle';
};

const disposeObject = (root: THREE.Object3D) => root.traverse(child => {
  if (!(child instanceof THREE.Mesh)) return;
  child.geometry.dispose();
  for (const material of Array.isArray(child.material) ? child.material : [child.material]) material.dispose();
});

export class CharacterIllustrationLoader {
  private loader = new THREE.TextureLoader();
  private cache = new Map<string, Promise<THREE.Texture>>();
  private loaded = new Set<THREE.Texture>();
  private disposed = false;

  create(unit: Unit, fallback: THREE.Group): CharacterVisualInstance | undefined {
    const key = visualKeyForUnit(unit);
    const spec = key ? characterVisualManifest[key]?.illustrations : undefined;
    if (!spec) return undefined;

    const root = new THREE.Group();
    root.name = `illustration-${unit.id}`;
    root.add(fallback);
    const hitTarget = new THREE.Mesh(new THREE.BoxGeometry(.72, 1.5, .72), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
    hitTarget.name = `${unit.id}-hit-proxy`;
    hitTarget.position.y = .75;
    hitTarget.userData.unitId = unit.id;
    root.add(hitTarget);

    let sprite: THREE.Sprite | undefined;
    let currentState: IllustrationState = 'idle';
    let currentRequest: VisualAction = 'idle';
    let currentDuration = .6;
    let pending: { action: VisualAction; durationMs?: number } | undefined;
    let fallbackActive = true;
    let localDisposed = false;

    const urlFor = (state: IllustrationState) => spec[state];
    const snapshot = (): CharacterVisualInstance['actionSnapshot'] extends (() => infer T) ? T : never => sprite ? {
      requestedAction: currentRequest,
      clip: `illustration-${currentState}`,
      fallbackUsed: false,
      duration: currentDuration,
      time: 0,
      timeScale: 1,
      running: false,
      weight: 1,
    } : undefined;
    const fitSprite = (texture: THREE.Texture) => {
      if (!sprite) return;
      const image = texture.image as { width?: number; height?: number } | undefined;
      const aspect = image?.width && image?.height ? image.width / image.height : 2 / 3;
      const height = 1.95;
      sprite.scale.set(aspect * height, height, 1);
    };
    const applyState = (action: VisualAction, durationMs?: number) => {
      if (!sprite) {
        pending = { action, durationMs };
        return snapshot();
      }
      currentRequest = action;
      currentDuration = Math.max(.05, (durationMs ?? 600) / 1000);
      const state = stateForAction(action);
      this.load(urlFor(state)).then(texture => {
        if (localDisposed || !sprite) return;
        sprite.material.map = texture;
        sprite.material.needsUpdate = true;
        currentState = state;
        fitSprite(texture);
        root.userData.visualSourceUrl = urlFor(state);
      }).catch(() => undefined);
      return snapshot();
    };
    const makeSprite = (texture: THREE.Texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, alphaTest: .01, depthWrite: false, depthTest: true }));
      sprite.name = `${key}-illustration`;
      sprite.center.set(.5, 0);
      sprite.position.y = 0;
      fitSprite(texture);
      root.remove(fallback);
      disposeObject(fallback);
      root.add(sprite);
      fallbackActive = false;
      root.userData.visualSourceUrl = spec.idle;
    };

    this.load(spec.idle).then(texture => {
      if (this.disposed || localDisposed) return;
      makeSprite(texture);
      window.dispatchEvent(new CustomEvent('goddess-character-ready', { detail: { unitId: unit.id, key, url: spec.idle, meshCount: 0, raycastTagged: true, clips: ['illustration-idle', 'illustration-attack', 'illustration-hit'] } }));
      const queued = pending;
      pending = undefined;
      applyState(queued?.action ?? 'idle', queued?.durationMs);
    }).catch(() => undefined);

    return {
      root,
      hitTarget,
      play: applyState,
      setPhase: () => undefined,
      update: () => undefined,
      actionSnapshot: snapshot,
      anchor: () => undefined,
      usingFallback: () => fallbackActive,
      dispose: () => {
        localDisposed = true;
        pending = undefined;
        if (sprite) {
          sprite.material.map?.dispose();
          sprite.material.dispose();
        }
        if (fallbackActive) disposeObject(fallback);
        window.dispatchEvent(new CustomEvent('goddess-character-disposed', { detail: { unitId: unit.id, key, url: root.userData.visualSourceUrl ?? 'procedural' } }));
      },
    };
  }

  private load(url: string) {
    const cached = this.cache.get(url);
    if (cached) return cached;
    const pending = this.loader.loadAsync(url).then(texture => {
      if (this.disposed) texture.dispose();
      else this.loaded.add(texture);
      return texture;
    }).catch(error => {
      this.cache.delete(url);
      throw error;
    });
    this.cache.set(url, pending);
    return pending;
  }

  dispose() {
    this.disposed = true;
    for (const texture of this.loaded) texture.dispose();
    this.loaded.clear();
    this.cache.clear();
  }
}

export { stateForAction as illustrationStateForAction };
