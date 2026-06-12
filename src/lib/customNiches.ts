const STORAGE_KEY = "aspect-niche-custom-niches";

export type CustomNiche = {
  id: string;
  label: string;
  description: string;
  beginnerTip: string;
  categoryId: string;
  categoryLabel: string;
  tags: {
    difficulty: "beginner" | "intermediate" | "advanced";
    environment: "indoors" | "outdoors" | "both";
    social: "solo" | "social" | "either";
    cost: "free" | "low" | "medium" | "high";
    timeCommitment: "quick" | "moderate" | "deep";
  };
  whyItsNiche: string;
  createdAt: number;
  source: "ai-generated";
};

export function getCustomNiches(): CustomNiche[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CustomNiche[]) : [];
  } catch {
    return [];
  }
}

export function addCustomNiche(niche: CustomNiche): void {
  try {
    const existing = getCustomNiches();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, niche]));
  } catch {}
}

export function removeCustomNiche(id: string): void {
  try {
    const existing = getCustomNiches();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(existing.filter((n) => n.id !== id)),
    );
  } catch {}
}

export function hasCustomNiche(id: string): boolean {
  return getCustomNiches().some((n) => n.id === id);
}
