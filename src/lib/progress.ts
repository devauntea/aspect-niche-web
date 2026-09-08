
// The progress side of a hobby: pinned notes and photos, and how they are laid
// out when a hobby is opened in the flipped graph.
//
// Ported from the mobile app so the two stay honest about the same things —
// especially the dating rules, which are the part it would be easy to get
// quietly wrong. Pure, so the layout and the dates are testable without a
// canvas.
//
// The web demo has no camera and no file system, so a photo here is a URL and a
// date rather than a copied file. Everything else is the app's logic verbatim.

/** A photo attached to a hobby. In the demo these are sample images. */
export type HobbyPhoto = {
  id: string;
  /** Image URL. */
  uri: string;
  /** ISO 8601, when it was added. */
  addedAt: string;
  /** ISO 8601, when the shutter fired, when that is actually known. */
  capturedAt?: string;
};

/**
 * A note the user pinned to a hobby.
 *
 * `submittedAt` never changes. Editing the body writes `updatedAt` instead,
 * because the date on the node answers "when did I write this", and an edit
 * three months later must not silently move the entry to today.
 */
export type PinnedNote = {
  id: string;
  body: string;
  /** ISO 8601, set once. */
  submittedAt: string;
  /** ISO 8601, set on every edit after the first. */
  updatedAt?: string;
};

export type ProgressEntry =
  | { kind: "photo"; id: string; at: string | null; photo: HobbyPhoto }
  | { kind: "note"; id: string; at: string; note: PinnedNote };

export function newPinnedNote(body: string): PinnedNote {
  return {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    body: body.trim(),
    submittedAt: new Date().toISOString(),
  };
}

/** A note is only pinnable if there is something on it. */
export function canPin(draft: string): boolean {
  return draft.trim().length > 0;
}

/**
 * Every entry for one hobby, oldest first, with undated photos last.
 *
 * Chronological rather than grouped by kind: the point of the focused graph is
 * that it reads as a record of how the hobby went, and a wall of photos
 * followed by a wall of notes is two records of it instead.
 */
export function progressEntries(
  photos: HobbyPhoto[],
  notes: PinnedNote[],
): ProgressEntry[] {
  const entries: ProgressEntry[] = [
    ...photos.map((photo) => ({
      kind: "photo" as const,
      id: photo.id,
      at: photo.capturedAt ?? photo.addedAt ?? null,
      photo,
    })),
    ...notes.map((note) => ({
      kind: "note" as const,
      id: note.id,
      at: note.submittedAt,
      note,
    })),
  ];
  return entries.sort((a, b) => {
    // Undated entries sink rather than sorting as 1970, which would put a photo
    // with no metadata before everything the user actually did first.
    if (!a.at) return b.at ? 1 : 0;
    if (!b.at) return -1;
    return Date.parse(a.at) - Date.parse(b.at);
  });
}

/**
 * The date under an entry's node, and what that date means.
 *
 * The label is load-bearing. A photo's capture time and the moment it was added
 * to the app are different facts, and showing the second under the word "Taken"
 * would be a quiet lie about when something happened.
 */
export function entryDate(entry: ProgressEntry): {
  label: string;
  text: string;
} {
  if (entry.kind === "note") {
    return { label: "Posted", text: formatEntryDate(entry.note.submittedAt) };
  }
  if (entry.photo.capturedAt) {
    return { label: "Taken", text: formatEntryDate(entry.photo.capturedAt) };
  }
  if (entry.photo.addedAt) {
    return { label: "Added", text: formatEntryDate(entry.photo.addedAt) };
  }
  return { label: "Date unknown", text: "" };
}

/** "12 Aug" for this year, "12 Aug 2025" for any other. */
export function formatEntryDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

/**
 * When the shutter fired, from an image's own metadata.
 *
 * EXIF writes local time with no offset, in its own punctuation:
 * "2026:08:12 18:30:00". Parsed by hand rather than handed to `Date`, which
 * reads that string as invalid on some engines and as a wrong date on others.
 * Anything unrecognised returns undefined and the photo is dated by when it was
 * added instead, labelled as such.
 */
export function capturedAtFrom(exif: unknown): string | undefined {
  if (!exif || typeof exif !== "object") return undefined;
  const bag = exif as Record<string, unknown>;
  const raw =
    bag.DateTimeOriginal ?? bag.DateTimeDigitized ?? bag.DateTime;
  if (typeof raw !== "string") return undefined;
  const m = raw.match(
    /^(\d{4})[:-](\d{2})[:-](\d{2})[ T](\d{2}):(\d{2}):(\d{2})/,
  );
  if (!m) return undefined;
  const [, y, mo, d, h, mi, sec] = m;
  const when = new Date(
    Number(y),
    Number(mo) - 1,
    Number(d),
    Number(h),
    Number(mi),
    Number(sec),
  );
  return Number.isNaN(when.getTime()) ? undefined : when.toISOString();
}

/** Radius of the first ring of entries around the focused hobby. */
const FIRST_RING = 78;
/** Extra radius per ring after the first. */
const RING_STEP = 62;
/** Entries on the first ring; each ring after holds two more. */
const FIRST_RING_SLOTS = 6;

/**
 * Where each entry sits around a focused hobby.
 *
 * Derived from the index alone, so a hobby opens the same way every time. The
 * kit is explicit about this and it matters more than it sounds: these nodes
 * are a record, and a record that rearranges itself on every visit is one you
 * cannot build a memory of.
 *
 * Rings rather than one circle, because a hobby with thirty entries would put
 * thirty nodes on one huge ring that no longer reads as belonging to anything.
 * Each ring is rotated off the one inside it so nodes do not line up spokewise.
 */
export function focusLayout(count: number): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  let index = 0;
  let ring = 0;
  while (index < count) {
    const slots = FIRST_RING_SLOTS + ring * 2;
    const radius = FIRST_RING + ring * RING_STEP;
    const take = Math.min(slots, count - index);
    // A partial ring spreads across the whole circle rather than filling the
    // first few slots of it: two entries belong opposite each other, not sixty
    // degrees apart with a gap where the other four would go.
    //
    // The cost is that adding an entry moves the others on that ring. Worth it
    // — the early counts are the common ones and a lopsided ring looks broken,
    // while a ring that redistributes reads as the record growing. The layout
    // is still the same every time you open the hobby, which is what has to
    // hold for it to be a place you remember rather than a shuffle.
    const spread = take < slots ? take : slots;
    for (let i = 0; i < take; i += 1) {
      // Start at the top and go clockwise, offsetting each ring by half a slot.
      const turn = (i / spread + (ring % 2 ? 0.5 / spread : 0)) * Math.PI * 2;
      const angle = turn - Math.PI / 2;
      out.push({
        x: Math.round(Math.cos(angle) * radius),
        y: Math.round(Math.sin(angle) * radius),
      });
    }
    index += take;
    ring += 1;
  }
  return out;
}

/** One line summarising a hobby's record, for the collected overview. */
export function progressSummary(
  photos: HobbyPhoto[],
  notes: PinnedNote[],
): string | null {
  const parts: string[] = [];
  if (photos.length) {
    parts.push(`${photos.length} photo${photos.length === 1 ? "" : "s"}`);
  }
  if (notes.length) {
    parts.push(`${notes.length} note${notes.length === 1 ? "" : "s"}`);
  }
  return parts.length ? parts.join(" · ") : null;
}
