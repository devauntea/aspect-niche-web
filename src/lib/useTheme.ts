"use client";

// Theme state: reads/writes data-theme on <html> and persists the choice.
// Implemented over useSyncExternalStore so every hook instance (switcher,
// header logo, …) stays in sync, and the server snapshot avoids hydration
// mismatches (the attribute is set pre-hydration by layout's inline script).
// preview() flips the attribute without persisting — live hover previews.

import { useCallback, useSyncExternalStore } from "react";
import {
  DEFAULT_THEME_ID,
  THEME_STORAGE_KEY,
  THEMES,
  getTheme,
} from "./themes";

function normalize(id: string | null | undefined): string {
  return THEMES.some((t) => t.id === id) ? (id as string) : DEFAULT_THEME_ID;
}

const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
function emit() {
  listeners.forEach((l) => l());
}
function getSnapshot(): string {
  return normalize(document.documentElement.dataset.theme);
}
function getServerSnapshot(): string {
  return DEFAULT_THEME_ID;
}

/** 240ms crossfade: blanket transitions while the variables flip. */
function crossfade() {
  const root = document.documentElement;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  root.classList.add("theme-xfade");
  window.setTimeout(() => root.classList.remove("theme-xfade"), 320);
}

export function useTheme() {
  const themeId = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setThemeId = useCallback((id: string) => {
    const next = normalize(id);
    crossfade();
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {}
    emit();
  }, []);

  /** Attribute-only flip for hover previews; pass null to restore. */
  const preview = useCallback(
    (id: string | null) => {
      crossfade();
      document.documentElement.dataset.theme = normalize(id ?? themeId);
    },
    [themeId],
  );

  return { themeId, theme: getTheme(themeId), setThemeId, preview };
}
