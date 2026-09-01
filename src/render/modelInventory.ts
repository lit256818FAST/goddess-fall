/** Only Iron & Fire mainline GLBs live in the optional gallery package. */
export const modelInventoryRoot = '/model-inventory/assets/models';
export function isIronFireInventoryModel(url: string): boolean {
  return /\/assets\/models\/(?:mainline|enemies\/mainline)\//.test(url);
}

export function runtimeModelLoadingAllowed(url: string): boolean {
  return !isIronFireInventoryModel(url);
}

export function inventoryModelUrl(url: string): string {
  return isIronFireInventoryModel(url) ? url.replace(/^\/assets\/models\//, `${modelInventoryRoot}/`) : url;
}
