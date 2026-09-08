import type { ProgressEntry } from "@/lib/progress";

export type TagSet = {
  environment: "indoors" | "outdoors" | "both";
  social: "solo" | "social" | "either";
  difficulty: "beginner" | "intermediate" | "advanced";
  cost: "free" | "low" | "medium" | "high";
  timeCommitment: "quick" | "moderate" | "deep";
};

export type Activity = {
  id: string;
  label: string;
  description: string;
  tags: TagSet;
  beginnerTip?: string;
  source: "curated" | "ai-generated" | "ai-reviewed";
};

export type Interest = {
  id: string;
  label: string;
  activityIds: string[];
};

export type HobbyNode = {
  id: string;
  label: string;
  /**
   * "photo" and "note" only ever appear on the flipped graph, in focus mode.
   * The discovery side never carries a progress entry — see lib/progress.ts.
   */
  type: "interest" | "activity" | "photo" | "note";
  data: Activity | Interest | ProgressEntry;
  position: { x: number; y: number };
  color?: string;
  /** Progress entries carry their own date, drawn under the node. */
  sublabel?: string;
  /** True when the label belongs above the node rather than below it. */
  labelAbove?: boolean;
};

export type HobbyEdge = {
  id: string;
  source: string;
  target: string;
};

export type GraphState = {
  nodes: HobbyNode[];
  edges: HobbyEdge[];
  selectedNodeId: string | null;
};

/**
 * How a node/edge should render relative to the active neighborhood:
 * "active" = the hovered/selected node itself, "neighbor" = directly
 * connected, "dim" = unrelated while a neighborhood is active, "idle" =
 * nothing is active.
 */
export type NodeVisualState = "active" | "neighbor" | "dim" | "idle";
