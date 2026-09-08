import {
  entryDate,
  progressEntries,
  type HobbyPhoto,
  type PinnedNote,
  type ProgressEntry,
} from "@/lib/progress";

// Memory Walk: the camera moving through what you have already done.
//
// A viewer over the flipped graph, not a second collection. It shows progress
// entries that are already there, in the order they happened, and adds nothing
// of its own — no score, no feed, no upload path.
//
// This file is the queue and the clock. Everything about *which* entries are in
// play, in what order, and how long the camera rests on each one lives here so
// it can be tested without a canvas; the scene draws whatever this hands it.

export type WalkScope = { kind: "all" } | { kind: "hobby"; hobbyId: string };

export type WalkPace = "slow" | "reflective";

export const PACE_MS: Record<WalkPace, number> = {
  slow: 5000,
  reflective: 8000,
};

export const PACE_CHOICES: { id: WalkPace; label: string }[] = [
  { id: "slow", label: "Slow" },
  { id: "reflective", label: "Reflective" },
];

/** How long the camera takes to travel between two entries. */
export const TRAVEL_MS = 1350;
/** How far the camera pulls back mid-travel, so the move reads as spatial. */
export const TRAVEL_ZOOM_OUT = 0.13;
/** A photo gets at least this long settled, whatever the pace says. */
export const MIN_SETTLED_MS = 3500;

/** One stop on the walk: the entry, and the hobby it belongs to. */
export type WalkItem = {
  id: string;
  hobbyId: string;
  hobbyLabel: string;
  entry: ProgressEntry;
  /** "Taken 12 Aug" / "Posted 1 Sep" / "Date unknown". */
  caption: string;
};

/**
 * The entries in play, oldest first.
 *
 * Built from the same models the graph draws, so an entry is in the walk only
 * if it is already on the flipped graph: owned, submitted, and belonging to a
 * hobby that is *currently* collected. Uncollecting a hobby takes its memories
 * out of the walk without touching them.
 */
export function buildQueue({
  collected,
  photos,
  notes,
  labels,
  scope,
  includeNotes,
}: {
  /** Hobby ids currently in the collection. Order is not significant. */
  collected: string[];
  photos: Record<string, HobbyPhoto[]>;
  notes: Record<string, PinnedNote[]>;
  /** hobbyId → display name. */
  labels: Record<string, string>;
  scope: WalkScope;
  includeNotes: boolean;
}): WalkItem[] {
  const inScope =
    scope.kind === "hobby"
      ? collected.filter((id) => id === scope.hobbyId)
      : collected;

  const items: { item: WalkItem; at: string | null }[] = [];
  for (const hobbyId of inScope) {
    const entries = progressEntries(
      photos[hobbyId] ?? [],
      includeNotes ? (notes[hobbyId] ?? []) : [],
    );
    for (const entry of entries) {
      const { label, text } = entryDate(entry);
      items.push({
        at: entry.at,
        item: {
          id: entry.id,
          hobbyId,
          hobbyLabel: labels[hobbyId] ?? hobbyId,
          entry,
          caption: text ? `${label} ${text}` : label,
        },
      });
    }
  }

  // One order across cinema, collage, counters and navigation. Undated entries
  // go last rather than sorting as 1970, and ties break on the entry's own id
  // so the same collection always walks the same way.
  return items
    .sort((a, b) => {
      if (a.at && b.at) {
        const delta = Date.parse(a.at) - Date.parse(b.at);
        if (delta !== 0) return delta;
      } else if (a.at !== b.at) {
        return a.at ? -1 : 1;
      }
      return a.item.id.localeCompare(b.item.id);
    })
    .map((x) => x.item);
}

/**
 * Where to land after the queue changes under you.
 *
 * Turning notes off while looking at one, or narrowing the scope, must not drop
 * the viewer somewhere arbitrary. The entry they were on wins if it survived;
 * otherwise the nearest thing after it, then before it, then the start. Nothing
 * here guesses: it walks the old order, which is why the old queue is a
 * parameter rather than something rebuilt from scratch.
 */
export function reconcileIndex(
  previous: WalkItem[],
  next: WalkItem[],
  currentId: string | null,
): number {
  if (next.length === 0) return -1;
  if (!currentId) return 0;

  const kept = next.findIndex((i) => i.id === currentId);
  if (kept >= 0) return kept;

  const wasAt = previous.findIndex((i) => i.id === currentId);
  if (wasAt < 0) return 0;

  const surviving = new Set(next.map((i) => i.id));
  for (let i = wasAt + 1; i < previous.length; i += 1) {
    if (surviving.has(previous[i].id)) {
      return next.findIndex((n) => n.id === previous[i].id);
    }
  }
  for (let i = wasAt - 1; i >= 0; i -= 1) {
    if (surviving.has(previous[i].id)) {
      return next.findIndex((n) => n.id === previous[i].id);
    }
  }
  return 0;
}

/** Words in a note, for working out how long it needs to be readable. */
export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * How long to hold on an entry before moving on, travel included.
 *
 * A photo is looked at; a note is read, and a long one needs longer than the
 * pace allows or it leaves mid-sentence. Reading time is generous on purpose —
 * this is a thing you sit with, and the manual controls are always there for
 * anyone who disagrees.
 */
export function dwellMs(
  item: WalkItem,
  pace: WalkPace,
  travelMs = TRAVEL_MS,
): number {
  const base = PACE_MS[pace];
  if (item.entry.kind === "note") {
    const reading = (wordCount(item.entry.note.body) / 3) * 1000 + 1500;
    return Math.max(base, travelMs + reading);
  }
  // Whatever the pace, a photo is not worth showing for less time than it takes
  // to actually look at it.
  return Math.max(base, travelMs + MIN_SETTLED_MS);
}

/** Every hobby that has something to show, for the scope selector. */
export function scopeOptions(
  collected: string[],
  photos: Record<string, HobbyPhoto[]>,
  notes: Record<string, PinnedNote[]>,
  labels: Record<string, string>,
  includeNotes: boolean,
): { id: string; label: string; count: number }[] {
  return collected
    .map((id) => ({
      id,
      label: labels[id] ?? id,
      count:
        (photos[id]?.length ?? 0) +
        (includeNotes ? (notes[id]?.length ?? 0) : 0),
    }))
    .filter((o) => o.count > 0)
    .sort((a, b) => a.label.localeCompare(b.label));
}

/** True when there is anything at all to walk through, notes aside. */
export function hasAnyMemories(
  collected: string[],
  photos: Record<string, HobbyPhoto[]>,
  notes: Record<string, PinnedNote[]>,
): boolean {
  return collected.some(
    (id) => (photos[id]?.length ?? 0) + (notes[id]?.length ?? 0) > 0,
  );
}
