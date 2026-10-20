"use client";

import { useEffect, useState } from "react";

// The contents list beside a legal page.
//
// Built from the page's own Section titles (LegalPage reads them from its
// children), so it can never list a section that is not there or miss one
// that is. The section being read is marked as you scroll.

export type Entry = { id: string; title: string };

export default function LegalContents({ entries }: { entries: Entry[] }) {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    const headings = entries
      .map((e) => document.getElementById(e.id))
      .filter((h): h is HTMLElement => h !== null);
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (items) => {
        for (const item of items)
          if (item.isIntersecting) setCurrent(item.target.id);
      },
      { rootMargin: "-15% 0px -75% 0px" },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [entries]);

  if (entries.length < 3) return null;

  return (
    <nav className="legal-contents" aria-label="On this page">
      <p>On this page</p>
      <ol>
        {entries.map((e) => (
          <li key={e.id}>
            <a
              href={`#${e.id}`}
              aria-current={current === e.id ? "location" : undefined}
            >
              {e.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
