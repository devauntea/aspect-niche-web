// The launch film, in one place.
//
// The master is aspect-launch-film/out/aspect-niche-launch-1080p.mp4 (the
// Flint narration, rendered 18 October 2026), re-encoded for the web; the
// archival CRF 17 master stays in the film project. The 720p file is served to
// narrow screens, and the teaser is 18 silent seconds of the same film (the
// living map, the 47-hobby graph and the hobby card) for the muted preview.

export const FILM = {
  title: "Aspect Niche launch film",
  /** As spoken: 2 minutes 20 seconds. */
  duration: "2:20",
  sources: [
    { src: "/film/aspect-niche-launch-720p.mp4", media: "(max-width: 900px)" },
    { src: "/film/aspect-niche-launch-1080p.mp4" },
  ],
  captions: "/film/aspect-niche-launch.en.vtt",
  poster: "/film/poster.jpg",
  teaser: "/film/teaser.mp4",
  teaserPoster: "/film/teaser.jpg",
} as const;

/** Asks the page's film theater to open and play from the start. Fired from a
 *  click, so the browser treats the playback as user-initiated and lets it
 *  start with sound. */
export const PLAY_FILM_EVENT = "aspectniche:play-film";

export function playFilm() {
  window.dispatchEvent(new Event(PLAY_FILM_EVENT));
}
