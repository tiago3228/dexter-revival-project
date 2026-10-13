export function validateHomeSearch(search: Record<string, unknown>) {
  return search["resumePainscreek"] === "1" ||
    search["resumePainscreek"] === "true" ||
    search["resumePainscreek"] === true
    ? { resumePainscreek: true as const }
    : {};
}
