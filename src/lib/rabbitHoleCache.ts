import type { RabbitHoleResult } from "./rabbitHoleTypes";

const KEY_PREFIX = "aspect-niche-rh-";

export function getCached(activityId: string): RabbitHoleResult | null {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + activityId);
    if (!raw) return null;
    return JSON.parse(raw) as RabbitHoleResult;
  } catch {
    return null;
  }
}

export function setCached(activityId: string, data: RabbitHoleResult): void {
  try {
    localStorage.setItem(KEY_PREFIX + activityId, JSON.stringify(data));
  } catch {
    // localStorage unavailable (SSR, private browsing quota)
  }
}

export function clearCached(activityId: string): void {
  try {
    localStorage.removeItem(KEY_PREFIX + activityId);
  } catch {
    // localStorage unavailable
  }
}
