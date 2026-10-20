"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { playFilm } from "./film";
import { SECTIONS } from "./sections";

// The masthead every page shares.
//
// On the landing page the links are in-page anchors and the current section
// is marked as you scroll; everywhere else they lead back to those sections.
// The film button opens the theater on the landing page and links to it from
// anywhere else, so it always does what it says.

export default function SiteHeader({
  onLanding = false,
}: {
  onLanding?: boolean;
}) {
  const [solid, setSolid] = useState(!onLanding);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  // The bar is clear over the hero's sky and gains a ground once the page
  // scrolls under it, so text never sits on moving content without one.
  useEffect(() => {
    if (!onLanding) return;
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onLanding]);

  // Which section is on screen: the one crossing a line a third of the way
  // down the viewport.
  useEffect(() => {
    if (!onLanding || typeof IntersectionObserver === "undefined") return;
    const targets = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setCurrent(entry.target.id);
        }
      },
      { rootMargin: "-33% 0px -66% 0px" },
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [onLanding]);

  // The open menu closes on Escape and hands focus back to its button.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    menu.current?.querySelector<HTMLElement>("a, button")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const href = (id: string) => (onLanding ? `#${id}` : `/#${id}`);

  const filmButton = (className: string) =>
    onLanding ? (
      <button
        type="button"
        className={className}
        onClick={() => {
          setOpen(false);
          playFilm();
        }}
      >
        <PlayIcon /> Watch the film
      </button>
    ) : (
      <Link className={className} href="/#film">
        <PlayIcon /> Watch the film
      </Link>
    );

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header" data-solid={solid || open}>
        <div className="container site-header-inner">
          <Link
            className="brand"
            href={onLanding ? "#top" : "/"}
            aria-label="Aspect Niche, home"
          >
            <Image
              src="/brand/logo-tile.png"
              alt=""
              width={32}
              height={32}
              priority
            />
            <span>Aspect Niche</span>
          </Link>

          <nav className="site-nav" aria-label="Main">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={href(s.id)}
                aria-current={current === s.id ? "location" : undefined}
              >
                {s.label}
              </a>
            ))}
          </nav>
          {filmButton("btn btn-primary header-cta")}

          <button
            ref={menuButton}
            type="button"
            className="menu-button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <span />
          </button>
        </div>
      </header>

      <div
        id="mobile-menu"
        ref={menu}
        className="mobile-menu"
        data-open={open}
        // Hidden from everyone while closed, not just from sight.
        inert={!open}
      >
        <nav aria-label="Main">
          <ul>
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={href(s.id)} onClick={() => setOpen(false)}>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {filmButton("btn btn-primary")}
      </div>
    </>
  );
}

export function PlayIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden="true">
      <path
        d="M3 1.8v10.4a.6.6 0 0 0 .9.5l8.4-5.2a.6.6 0 0 0 0-1L3.9 1.3a.6.6 0 0 0-.9.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
