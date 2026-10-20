"use client";

import Image from "next/image";
import { PlayIcon } from "../_site/SiteHeader";
import { CONTACT_EMAIL } from "../_site/sections";
import { playFilm } from "../_site/film";

// The close repays the opening, as the film's does: the rabbit out of its
// hole, the film's last line, and the honest state of things. There is no
// download button because there is nowhere honest to send anyone yet; the
// film and a person to write to are what there is.

export default function Closer() {
  return (
    <section className="closer" aria-labelledby="closer-title">
      <div className="container closer-inner">
        <Image
          className="closer-rabbit"
          src="/brand/rabbit-hole.png"
          alt=""
          width={240}
          height={240}
          sizes="240px"
        />
        <h2 id="closer-title" className="voice">
          Your next favorite thing is closer than you think.
        </h2>
        <p className="closer-status">Coming soon for iPhone and iPad.</p>
        <div className="closer-actions">
          <button type="button" className="btn btn-primary" onClick={playFilm}>
            <PlayIcon /> Watch the film
          </button>
          <a
            className="btn btn-quiet"
            href={`mailto:${CONTACT_EMAIL}?subject=Aspect%20Niche`}
          >
            Write to us
          </a>
        </div>
      </div>
    </section>
  );
}
