export function validateHomeSearch(search: Record<string, unknown>) {
  return search.resumeVivian === "1" ||
    search.resumeVivian === "true" ||
    search.resumeVivian === true
    ? { resumeVivian: true as const }
    : {};
}
