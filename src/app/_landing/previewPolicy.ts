// When the hobby scenes load on their own, and whether the first-visit
// preview plays. Kept free of React so the decision is testable.

export const PREVIEW_KEY = "aspect-niche.hobby-preview.v1";

export type DeviceSignals = {
  saveData: boolean;
  effectiveType: string;
  deviceMemory: number;
  cores: number;
  reducedMotion: boolean;
  seen: boolean;
};

export type PreviewPlan = {
  /** Load the live scene after the page is idle (otherwise wait for a tap). */
  autoload: boolean;
  /** Play the first-visit preview. */
  preview: boolean;
  /** Show one scene instead of all three. */
  short: boolean;
};

export function decidePreview(signals: DeviceSignals): PreviewPlan {
  const slowNetwork = /(^|-)2g$/.test(signals.effectiveType);
  const autoload =
    !signals.saveData && !slowNetwork && signals.deviceMemory > 2;
  return {
    autoload,
    preview: autoload && !signals.reducedMotion && !signals.seen,
    short:
      signals.deviceMemory <= 4 ||
      signals.cores <= 4 ||
      signals.effectiveType === "3g",
  };
}

// Also remembered for the life of the page, so a remount (for example after
// a lost GPU context) or blocked storage never replays it.
let seenThisPage = false;

function readSeen() {
  if (seenThisPage) return true;
  for (const store of ["localStorage", "sessionStorage"] as const) {
    try {
      if (window[store].getItem(PREVIEW_KEY)) return true;
    } catch {
      // Storage can be unavailable (private windows, blocked site data).
    }
  }
  return false;
}

export function markPreviewSeen() {
  seenThisPage = true;
  for (const store of ["localStorage", "sessionStorage"] as const) {
    try {
      window[store].setItem(PREVIEW_KEY, "seen");
      return;
    } catch {
      // Try the next store; the in-memory flag still holds.
    }
  }
}

export function previewPlan(): PreviewPlan {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  return decidePreview({
    saveData: !!nav.connection?.saveData,
    effectiveType: nav.connection?.effectiveType ?? "4g",
    deviceMemory: nav.deviceMemory ?? 8,
    cores: nav.hardwareConcurrency ?? 8,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches,
    seen: readSeen(),
  });
}
