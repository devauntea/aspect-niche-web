import { describe, expect, it } from "vitest";
import type { HobbyPhoto, PinnedNote } from "@/lib/progress";
import {
  MIN_SETTLED_MS,
  PACE_MS,
  TRAVEL_MS,
  buildQueue,
  dwellMs,
  hasAnyMemories,
  reconcileIndex,
  scopeOptions,
  wordCount,
  type WalkItem,
} from "@/lib/memoryWalk";

const photo = (id: string, capturedAt?: string, addedAt = ""): HobbyPhoto => ({
  id,
  uri: `file:///${id}.jpg`,
  addedAt,
  ...(capturedAt ? { capturedAt } : {}),
});
const note = (id: string, submittedAt: string, body = "one two three"): PinnedNote => ({
  id,
  body,
  submittedAt,
});

const labels = { pottery: "Pottery", hiking: "Hiking", coffee: "Coffee" };

const base = {
  collected: ["pottery", "hiking"],
  photos: {
    pottery: [photo("p-aug", "2026-08-12T00:00:00Z")],
    hiking: [photo("h-sep", "2026-09-03T00:00:00Z")],
  },
  notes: {
    hiking: [note("n-sep1", "2026-09-01T00:00:00Z")],
  },
  labels,
  scope: { kind: "all" } as const,
  includeNotes: false,
};

describe("who gets in", () => {
  it("takes only hobbies that are currently collected", () => {
    // The whole point of the flipped side: uncollecting takes a hobby's
    // memories out of view without deleting them.
    const q = buildQueue({
      ...base,
      collected: ["pottery"],
      photos: { ...base.photos, coffee: [photo("c1", "2026-01-01T00:00:00Z")] },
    });
    expect(q.map((i) => i.id)).toEqual(["p-aug"]);
  });

  it("leaves notes out until they are asked for", () => {
    expect(buildQueue(base).map((i) => i.id)).toEqual(["p-aug", "h-sep"]);
    expect(
      buildQueue({ ...base, includeNotes: true }).map((i) => i.id),
    ).toEqual(["p-aug", "n-sep1", "h-sep"]);
  });

  it("narrows to one hobby without listing the others", () => {
    const q = buildQueue({
      ...base,
      includeNotes: true,
      scope: { kind: "hobby", hobbyId: "hiking" },
    });
    expect(q.every((i) => i.hobbyId === "hiking")).toBe(true);
    expect(q.map((i) => i.id)).toEqual(["n-sep1", "h-sep"]);
  });

  it("is empty rather than wrong when nothing qualifies", () => {
    expect(buildQueue({ ...base, collected: [] })).toEqual([]);
  });
});

describe("order", () => {
  it("runs oldest first across hobbies", () => {
    const q = buildQueue({ ...base, includeNotes: true });
    expect(q.map((i) => i.id)).toEqual(["p-aug", "n-sep1", "h-sep"]);
  });

  it("puts undated photos after dated ones", () => {
    const q = buildQueue({
      ...base,
      collected: ["pottery"],
      photos: { pottery: [photo("undated"), photo("dated", "2026-08-12T00:00:00Z")] },
    });
    expect(q.map((i) => i.id)).toEqual(["dated", "undated"]);
  });

  it("breaks a tie on the entry's own id so the walk is repeatable", () => {
    const at = "2026-08-12T00:00:00Z";
    const q = buildQueue({
      ...base,
      collected: ["pottery"],
      photos: { pottery: [photo("zeta", at), photo("alpha", at)] },
    });
    expect(q.map((i) => i.id)).toEqual(["alpha", "zeta"]);
  });

  it("captions each entry with the date it is actually showing", () => {
    const q = buildQueue({ ...base, includeNotes: true });
    expect(q.find((i) => i.id === "p-aug")!.caption).toMatch(/^Taken /);
    expect(q.find((i) => i.id === "n-sep1")!.caption).toMatch(/^Posted /);
    // An upload time is never dressed up as a capture time.
    const undated = buildQueue({
      ...base,
      collected: ["pottery"],
      photos: { pottery: [photo("u", undefined, "2026-09-09T00:00:00Z")] },
    });
    expect(undated[0].caption).toMatch(/^Added /);
  });
});

describe("landing somewhere sensible when the queue changes", () => {
  const q = (ids: string[]): WalkItem[] =>
    ids.map((id) => ({
      id,
      hobbyId: "h",
      hobbyLabel: "H",
      caption: "",
      entry: { kind: "photo", id, at: null, photo: photo(id) },
    }));

  it("stays on the same entry when it survived", () => {
    expect(reconcileIndex(q(["a", "b", "c"]), q(["a", "b", "c"]), "b")).toBe(1);
    // Even when its index moved.
    expect(reconcileIndex(q(["a", "b", "c"]), q(["b", "c"]), "b")).toBe(0);
  });

  it("takes the nearest entry after the one that went", () => {
    expect(reconcileIndex(q(["a", "b", "c"]), q(["a", "c"]), "b")).toBe(1);
  });

  it("falls back to the one before when nothing follows", () => {
    expect(reconcileIndex(q(["a", "b", "c"]), q(["a"]), "c")).toBe(0);
  });

  it("says so when there is nothing left", () => {
    expect(reconcileIndex(q(["a"]), [], "a")).toBe(-1);
  });

  it("starts at the beginning when it has nothing to go on", () => {
    expect(reconcileIndex(q(["a", "b"]), q(["a", "b"]), null)).toBe(0);
    expect(reconcileIndex(q(["a", "b"]), q(["a", "b"]), "never-existed")).toBe(0);
  });
});

describe("how long to hold", () => {
  const item = (entry: WalkItem["entry"]): WalkItem => ({
    id: "x",
    hobbyId: "h",
    hobbyLabel: "H",
    caption: "",
    entry,
  });

  it("gives a photo real settled time whatever the pace", () => {
    const p = item({ kind: "photo", id: "x", at: null, photo: photo("x") });
    // Slow is 5s and travel is 1.35s, so the naive reading would leave 3.65s —
    // fine here, but the floor is what stops a shorter pace from flashing past.
    expect(dwellMs(p, "slow")).toBeGreaterThanOrEqual(TRAVEL_MS + MIN_SETTLED_MS);
    expect(dwellMs(p, "reflective")).toBe(PACE_MS.reflective);
  });

  it("holds a long note long enough to finish reading it", () => {
    const short = item({
      kind: "note",
      id: "x",
      at: "",
      note: note("x", "", "three words here"),
    });
    const long = item({
      kind: "note",
      id: "x",
      at: "",
      note: note("x", "", Array.from({ length: 90 }, () => "word").join(" ")),
    });
    expect(dwellMs(long, "slow")).toBeGreaterThan(dwellMs(short, "slow"));
    // Ninety words at three a second is thirty seconds of reading; the hold has
    // to cover that rather than the five-second pace.
    expect(dwellMs(long, "slow")).toBeGreaterThan(30000);
  });

  it("counts words the way a reader would", () => {
    expect(wordCount("")).toBe(0);
    expect(wordCount("   ")).toBe(0);
    expect(wordCount("one  two\nthree ")).toBe(3);
  });
});

describe("scope options", () => {
  it("offers only collected hobbies that have something to show", () => {
    const opts = scopeOptions(
      ["pottery", "hiking", "coffee"],
      base.photos,
      base.notes,
      labels,
      false,
    );
    expect(opts.map((o) => o.id)).toEqual(["hiking", "pottery"]);
  });

  it("counts notes only when they are included", () => {
    const withNotes = scopeOptions(["hiking"], {}, base.notes, labels, true);
    expect(withNotes[0].count).toBe(1);
    expect(scopeOptions(["hiking"], {}, base.notes, labels, false)).toEqual([]);
  });
});

describe("eligibility for the entry point", () => {
  it("counts notes as memories even when the toggle is off", () => {
    // The empty state needs to be able to say "you have notes, turn them on"
    // rather than pretending there is nothing here.
    expect(hasAnyMemories(["hiking"], {}, base.notes)).toBe(true);
    expect(hasAnyMemories(["hiking"], {}, {})).toBe(false);
    expect(hasAnyMemories([], base.photos, base.notes)).toBe(false);
  });
});
