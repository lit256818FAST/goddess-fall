import { describe, expect, it } from 'vitest';
import { modelGalleryAssets, modelGallerySummary } from './modelGallery';

describe('model gallery maker classification', () => {
  it('separates K3, GPT/img2threejs, and external project assets', () => {
    expect(modelGallerySummary()).toMatchObject({ total: 55, k3: 39, gpt: 12, other: 4, fallbacks: 3 });
    expect(new Set(modelGalleryAssets.filter(asset => asset.maker === 'K3').map(asset => asset.url)).size).toBe(39);
    expect(modelGalleryAssets.filter(asset => asset.maker === 'GPT').every(asset => asset.url.includes('/mainline/'))).toBe(true);
  });
});
