// The name a guest answers under, remembered in this browser so a regular
// answers each week in one tap. Shared by the running page and the ended one.
//
// The remembered name is browser storage, so the server render has none and
// the client picks it up after hydrating (useSyncExternalStore), without a
// state-setting effect.

export const NAME_KEY = "aspect-niche-series-name";

export function readSavedName(): string {
  try {
    return localStorage.getItem(NAME_KEY) ?? "";
  } catch {
    return ""; // Private mode: the name is simply typed again.
  }
}

export function watchSavedName(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}
