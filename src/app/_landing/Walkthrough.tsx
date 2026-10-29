"use client";

import { useReveal } from "./useReveal";

// The launch film, in the spot the closing section kept for it.
//
// It never plays by itself: sound and motion start when someone asks, which
// is also what the page's motion switch promises. `preload="metadata"` keeps
// the film off the wire until then, and the poster is a real frame from it,
// so what you see before pressing play is what plays. Narrow screens get the
// 720p encode (11 MB) and everyone else the 1080p (24 MB); the English
// captions are on the video's own CC control.
export default function Walkthrough() {
  const eyebrow = useReveal<HTMLParagraphElement>();
  const heading = useReveal<HTMLHeadingElement>();
  const copy = useReveal<HTMLParagraphElement>();
  return (
    <section id="watch" className="walkthrough section-pad" aria-labelledby="watch-title">
      <p className="eyebrow reveal" ref={eyebrow}>
        04 / SEE IT IN ACTION
      </p>
      <h2 id="watch-title" className="reveal" ref={heading}>
        Two minutes twenty,
        <br />
        <em>start to finish.</em>
      </h2>
      <p className="walkthrough-copy reveal" ref={copy}>
        The launch film: find a hobby, plan a first visit, bring friends, then
        flip the graph and watch your own story grow. Narrated, with captions.
      </p>
      <div className="walkthrough-frame">
        <video
          controls
          playsInline
          preload="metadata"
          poster="/landing/launch-poster.jpg"
          aria-label="Aspect Niche launch film"
        >
          <source
            src="/landing/aspect-niche-launch-720p.mp4"
            type="video/mp4"
            media="(max-width: 900px)"
          />
          <source src="/landing/aspect-niche-launch-1080p.mp4" type="video/mp4" />
          <track
            kind="captions"
            src="/landing/aspect-niche-launch.en.vtt"
            srcLang="en"
            label="English"
          />
          Your browser cannot play this video.{" "}
          <a href="/landing/aspect-niche-launch-1080p.mp4">Download it instead</a>.
        </video>
      </div>
    </section>
  );
}
