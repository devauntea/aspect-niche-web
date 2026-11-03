export type PreviewScreen =
  "graph" | "about" | "plan" | "session" | "progress" | "gallery";
export type PreviewState = { screen: PreviewScreen; manual: boolean };
export type PreviewAction =
  | { type: "choose"; screen: PreviewScreen }
  | { type: "scroll"; progress: number }
  | { type: "follow"; progress: number };

export function screenForProgress(progress: number): PreviewScreen {
  const bounded = Math.max(
    0,
    Math.min(1, Number.isFinite(progress) ? progress : 0),
  );
  return bounded < 0.33 ? "graph" : bounded < 0.66 ? "plan" : "progress";
}

export function previewReducer(
  state: PreviewState,
  action: PreviewAction,
): PreviewState {
  if (action.type === "choose") return { screen: action.screen, manual: true };
  if (action.type === "scroll" && state.manual) return state;
  const screen = screenForProgress(action.progress);
  if (state.screen === screen && !state.manual) return state;
  return { screen, manual: false };
}

export function previewChapter(screen: PreviewScreen) {
  if (screen === "plan" || screen === "session") return 1;
  if (screen === "progress") return 2;
  return 0;
}
