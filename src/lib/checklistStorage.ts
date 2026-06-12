const KEY = (id: string) => `aspect-niche-check-${id}`;

export function getChecked(activityId: string): number[] {
  try {
    const raw = localStorage.getItem(KEY(activityId));
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

export function saveChecked(activityId: string, indices: number[]): void {
  try {
    localStorage.setItem(KEY(activityId), JSON.stringify(indices));
  } catch {}
}
