import type { HobbyPhoto, PinnedNote } from "@/lib/progress";

// Sample progress for the demo's flipped graph.
//
// Explicitly fictional, and labelled as such wherever it is drawn. The demo has
// no camera, no upload and no account, so there is no real progress to show —
// but the flipped graph is meaningless without something on it, and a feature
// you cannot see is a feature nobody believes in.
//
// Two rules carried over from the app, because getting them wrong here would
// teach the wrong thing about what the dates mean:
//
//   `capturedAt` is when the shutter fired. It is set here because these are
//   sample images with a chosen date, and the app labels it "Taken".
//   `submittedAt` on a note is when it was written and never changes.
//
// Only pottery and hiking have entries. Everything else a visitor collects
// opens with an honest empty state rather than borrowed content.

export const SAMPLE_PHOTOS: Record<string, HobbyPhoto[]> = {
  pottery: [
    {
      id: "sample-pottery-1",
      uri: "/landing/pottery.webp",
      addedAt: "2026-09-06T18:20:00.000Z",
      capturedAt: "2026-09-06T18:20:00.000Z",
    },
  ],
  hiking: [
    {
      id: "sample-hiking-1",
      uri: "/landing/hiking.webp",
      addedAt: "2026-09-07T09:05:00.000Z",
      capturedAt: "2026-09-07T09:05:00.000Z",
    },
  ],
};

export const SAMPLE_NOTES: Record<string, PinnedNote[]> = {
  pottery: [
    {
      id: "sample-note-pottery",
      body: "Centred it on the fourth try. The trick was slowing the wheel right down and letting my elbow rest on my knee instead of holding it up. It does not have to be perfect to be worth keeping.",
      submittedAt: "2026-09-06T19:02:00.000Z",
    },
  ],
  hiking: [
    {
      id: "sample-note-hiking",
      body: "Set off before six to beat the heat. The ridge opened up about an hour in and I sat there for a while doing nothing at all, which was the point.",
      submittedAt: "2026-09-07T12:40:00.000Z",
    },
  ],
};

/** Hobbies the demo has sample progress for. */
export const SAMPLE_PROGRESS_IDS = Object.keys(SAMPLE_PHOTOS);

export function samplePhotos(hobbyId: string): HobbyPhoto[] {
  return SAMPLE_PHOTOS[hobbyId] ?? [];
}

export function sampleNotes(hobbyId: string): PinnedNote[] {
  return SAMPLE_NOTES[hobbyId] ?? [];
}

/** True when this hobby has something to show in focus mode. */
export function hasSampleProgress(hobbyId: string): boolean {
  return samplePhotos(hobbyId).length > 0 || sampleNotes(hobbyId).length > 0;
}
