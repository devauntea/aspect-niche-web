import { describe, expect, it } from "vitest";
import {
  canPin,
  capturedAtFrom,
  entryDate,
  focusLayout,
  newPinnedNote,
  progressEntries,
  progressSummary,
  type HobbyPhoto,
  type PinnedNote,
} from "@/lib/progress";

const photo = (id: string, addedAt: string, capturedAt?: string): HobbyPhoto => ({
  id,
  uri: `file:///${id}.jpg`,
  addedAt,
  ...(capturedAt ? { capturedAt } : {}),
});

const note = (id: string, submittedAt: string): PinnedNote => ({
  id,
  body: `note ${id}`,
  submittedAt,
});

describe("pinning", () => {
  it("refuses a note with nothing on it", () => {
    expect(canPin("")).toBe(false);
    expect(canPin("   \n  ")).toBe(false);
    expect(canPin("threw my first cylinder")).toBe(true);
  });

  it("trims what it pins", () => {
    expect(newPinnedNote("  centred it at last  ").body).toBe("centred it at last");
  });

  it("gives each note its own id", () => {
    const ids = new Set(Array.from({ length: 300 }, () => newPinnedNote("x").id));
    expect(ids.size).toBe(300);
  });
});

describe("ordering", () => {
  it("reads as one record rather than photos then notes", () => {
    const entries = progressEntries(
      [photo("p1", "2026-03-01T00:00:00Z"), photo("p2", "2026-06-01T00:00:00Z")],
      [note("n1", "2026-04-01T00:00:00Z")],
    );
    expect(entries.map((e) => e.id)).toEqual(["p1", "n1", "p2"]);
  });

  it("prefers when a photo was taken over when it was added", () => {
    const entries = progressEntries(
      [
        photo("added-today-taken-long-ago", "2026-09-01T00:00:00Z", "2026-01-01T00:00:00Z"),
      ],
      [note("n1", "2026-05-01T00:00:00Z")],
    );
    expect(entries.map((e) => e.id)).toEqual([
      "added-today-taken-long-ago",
      "n1",
    ]);
  });

  it("sinks undated entries instead of dating them to 1970", () => {
    const undated = { ...photo("u", ""), addedAt: "" };
    const entries = progressEntries([undated, photo("p", "2026-02-01T00:00:00Z")], []);
    expect(entries.map((e) => e.id)).toEqual(["p", "u"]);
  });
});

describe("dating", () => {
  it("says which date it is showing", () => {
    expect(
      entryDate({
        kind: "photo",
        id: "p",
        at: "2026-01-02T00:00:00Z",
        photo: photo("p", "2026-09-01T00:00:00Z", "2026-01-02T00:00:00Z"),
      }).label,
    ).toBe("Taken");

    // The add date is a real fact but it is not the capture date, and calling
    // it "Taken" would be the one thing the kit says never to do.
    expect(
      entryDate({
        kind: "photo",
        id: "p",
        at: "2026-09-01T00:00:00Z",
        photo: photo("p", "2026-09-01T00:00:00Z"),
      }).label,
    ).toBe("Added");

    expect(
      entryDate({
        kind: "note",
        id: "n",
        at: "2026-09-01T00:00:00Z",
        note: note("n", "2026-09-01T00:00:00Z"),
      }).label,
    ).toBe("Posted");
  });

  it("admits when it does not know", () => {
    const blank = { ...photo("u", ""), addedAt: "" };
    expect(entryDate({ kind: "photo", id: "u", at: null, photo: blank })).toEqual({
      label: "Date unknown",
      text: "",
    });
  });
});

describe("focus layout", () => {
  it("opens a hobby the same way every time", () => {
    expect(focusLayout(9)).toEqual(focusLayout(9));
  });

  it("places exactly one position per entry", () => {
    for (const n of [0, 1, 2, 5, 6, 7, 14, 30]) {
      expect(focusLayout(n)).toHaveLength(n);
    }
  });

  it("keeps every entry off the hobby itself", () => {
    for (const { x, y } of focusLayout(30)) {
      expect(Math.hypot(x, y)).toBeGreaterThan(40);
    }
  });

  it("spreads a partial ring rather than bunching it", () => {
    // Two entries belong opposite each other, not side by side.
    const [a, b] = focusLayout(2);
    expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(100);
  });

  it("moves outward rather than stacking one huge ring", () => {
    const many = focusLayout(20);
    const first = Math.hypot(many[0].x, many[0].y);
    const last = Math.hypot(many[19].x, many[19].y);
    expect(last).toBeGreaterThan(first);
  });

  it("gives no two entries the same spot", () => {
    const seen = focusLayout(24).map((p) => `${p.x},${p.y}`);
    expect(new Set(seen).size).toBe(24);
  });
});

describe("summary", () => {
  it("counts what a hobby has, and says nothing when it has nothing", () => {
    expect(progressSummary([], [])).toBeNull();
    expect(progressSummary([photo("p", "")], [])).toBe("1 photo");
    expect(
      progressSummary([photo("p", ""), photo("q", "")], [note("n", "")]),
    ).toBe("2 photos · 1 note");
  });
});

describe("capture dates", () => {
  it("reads EXIF's own punctuation", () => {
    // "2026:08:12 18:30:00" is what cameras write. Date.parse reads it as
    // invalid on some engines and as a wrong date on others, which is why it
    // is parsed by hand.
    const iso = capturedAtFrom({ DateTimeOriginal: "2026:08:12 18:30:00" });
    expect(iso).toBeDefined();
    const d = new Date(iso!);
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(7);
    expect(d.getDate()).toBe(12);
    expect(d.getHours()).toBe(18);
  });

  it("falls back through the other EXIF date fields", () => {
    expect(capturedAtFrom({ DateTimeDigitized: "2025:01:02 03:04:05" })).toBeDefined();
    expect(capturedAtFrom({ DateTime: "2025-01-02T03:04:05" })).toBeDefined();
  });

  it("says nothing rather than guessing", () => {
    // An undefined capture date is what makes the node say "Added" instead of
    // "Taken", so guessing here would produce a confident wrong label.
    expect(capturedAtFrom(undefined)).toBeUndefined();
    expect(capturedAtFrom({})).toBeUndefined();
    expect(capturedAtFrom({ DateTimeOriginal: "" })).toBeUndefined();
    expect(capturedAtFrom({ DateTimeOriginal: "not a date" })).toBeUndefined();
    expect(capturedAtFrom({ DateTimeOriginal: 20260812 })).toBeUndefined();
  });
});
