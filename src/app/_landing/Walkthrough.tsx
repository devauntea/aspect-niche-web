"use client";

import { useReveal } from "./useReveal";

// The two-minute walkthrough, in the spot the closing section kept for it.
//
// It never plays by itself: sound and motion start when someone asks, which
// is also what the page's motion switch promises. `preload="metadata"` keeps
// the nine megabytes off the wire until then, and the poster is a real frame
// from the video, so what you see before pressing play is what plays.
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
        Two minutes,
        <br />
        <em>start to finish.</em>
      </h2>
      <p className="walkthrough-copy reveal" ref={copy}>
        Find a hobby, plan a first visit, bring friends, then flip the graph and
        watch your own story grow.
      </p>
      <div className="walkthrough-frame">
        <video
          controls
          playsInline
          preload="metadata"
          poster="/landing/walkthrough-poster.jpg"
          aria-label="Aspect Niche walkthrough video"
        >
          <source src="/landing/walkthrough.mp4" type="video/mp4" />
          Your browser cannot play this video.{" "}
          <a href="/landing/walkthrough.mp4">Download it instead</a>.
        </video>
      </div>
    </section>
  );
}
