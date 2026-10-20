"use client";

import Starfield from "../_site/Starfield";
import { PlayIcon } from "../_site/SiteHeader";
import { playFilm, FILM } from "../_site/film";
import {
  RABBIT_EDGES,
  RABBIT_STARS,
  RABBIT_VIEWBOX,
  GLINT_STAR,
} from "../_site/rabbit";

// The opening, and the page's one orchestrated moment.
//
// The film opens on a night sky, a line of narration, and a rabbit drawn
// star by star; the page opens the same way. The headline is the film's first
// line, the italic beneath it is the second, and the rabbit is the brand
// mark's own constellation, drawn in the mark's order. It plays once on load,
// takes under three seconds, and under reduced motion it is simply there.

export default function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <Starfield className="hero-sky" />

      <svg className="hero-rabbit" viewBox={RABBIT_VIEWBOX} aria-hidden="true">
        <g className="rabbit-edges">
          {RABBIT_EDGES.map(([x1, y1, x2, y2], i) => (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              pathLength={1}
              style={{ "--i": i } as React.CSSProperties}
            />
          ))}
        </g>
        <g className="rabbit-stars">
          {RABBIT_STARS.map(([cx, cy, r], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r / 2.2}
              style={{ "--i": i } as React.CSSProperties}
            />
          ))}
        </g>
        <g
          className="rabbit-glint"
          transform={`translate(${GLINT_STAR[0]} ${GLINT_STAR[1]})`}
        >
          <circle r="14" className="glint-halo" />
          <circle r="4.5" className="glint-core" />
          <path d="M-20 0H20M0 -20V20" />
        </g>
      </svg>

      <div className="container hero-inner">
        <h1 id="hero-title" className="hero-title">
          <span className="rise" style={{ "--d": 0 } as React.CSSProperties}>
            Somewhere out there is something{" "}
          </span>
          <span className="rise" style={{ "--d": 1 } as React.CSSProperties}>
            you&rsquo;d love doing.
          </span>
        </h1>
        <p
          className="hero-voice voice rise"
          style={{ "--d": 2 } as React.CSSProperties}
        >
          You just haven&rsquo;t met it yet.
        </p>
        <p
          className="hero-lede rise"
          style={{ "--d": 3 } as React.CSSProperties}
        >
          Aspect Niche is a hobby discovery app for iPhone and iPad. Tell it
          what pulls at you and a living map of hobbies unfolds, each with what
          it really takes, places to try it nearby, and a link to bring a
          friend.
        </p>
        <div
          className="hero-actions rise"
          style={{ "--d": 4 } as React.CSSProperties}
        >
          <button type="button" className="btn btn-primary" onClick={playFilm}>
            <PlayIcon /> Play the film{" "}
            <span className="btn-meta">{FILM.duration}</span>
          </button>
          <a className="btn btn-quiet" href="#map">
            Explore the map
          </a>
        </div>
        <p
          className="hero-status rise"
          style={{ "--d": 5 } as React.CSSProperties}
        >
          <span className="status-dot" aria-hidden="true" />
          Coming soon for iPhone and iPad
        </p>
      </div>
    </section>
  );
}
