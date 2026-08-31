/** Models are kept in an optional gallery package, never in the first-playable game package. */
export const modelInventoryRoot = '/model-inventory/assets/models';
export const runtimeModelLoadingEnabled = false;

export function inventoryModelUrl(url: string): string {
  return url.replace(/^\/assets\/models\//, `${modelInventoryRoot}/`);
}
