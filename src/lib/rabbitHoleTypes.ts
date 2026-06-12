export type RabbitHoleResult = {
  deeperCuts: string[];
  ultraNicheHobbies: Array<{ name: string; description: string }>;
  relatedActivities: string[];
  insiderTerm: string;
  insiderDefinition: string;
  funFact: string;
};

export function isValidRabbitHoleResult(data: unknown): data is RabbitHoleResult {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  if (!Array.isArray(d.deeperCuts) || d.deeperCuts.length < 1) return false;
  if (!d.deeperCuts.every((s) => typeof s === "string")) return false;
  if (!Array.isArray(d.ultraNicheHobbies) || d.ultraNicheHobbies.length < 1) return false;
  if (
    !d.ultraNicheHobbies.every(
      (h) =>
        h != null &&
        typeof h === "object" &&
        typeof (h as Record<string, unknown>).name === "string" &&
        typeof (h as Record<string, unknown>).description === "string",
    )
  )
    return false;
  if (!Array.isArray(d.relatedActivities)) return false;
  if (typeof d.insiderTerm !== "string") return false;
  if (typeof d.insiderDefinition !== "string") return false;
  if (typeof d.funFact !== "string") return false;
  return true;
}
