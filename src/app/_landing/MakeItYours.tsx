"use client";

import Image from "next/image";
import { useRef, useState } from "react";

// Make it yours: the app's eight themes and six icon sets, as the app draws
// them. Every image is a capture of the app (the same captures the film's
// carousel and icon sequence use), so what you pick here is what you get.
//
// Themes and icon sets are separate choices in the app, so they are separate
// tabs here; merging them would teach the wrong model.

type Option = { id: string; name: string; line?: string };

const THEMES: Option[] = [
  { id: "midnight", name: "Midnight" },
  { id: "aurora", name: "Aurora" },
  { id: "obsidian", name: "Obsidian" },
  { id: "pocket-tech", name: "Pocket Tech" },
  { id: "glass", name: "Glass" },
  { id: "gallery", name: "Gallery" },
  { id: "gallery-night", name: "Gallery Night" },
  { id: "daybreak", name: "Daybreak" },
];

// Names and lines are the app's own (src/lib/iconSet.tsx in the app).
const ICON_SETS: Option[] = [
  { id: "obsidian", name: "Obsidian", line: "Outlines with lit vertices" },
  { id: "files", name: "Files", line: "Folders and paper, like a browser" },
  {
    id: "clean",
    name: "Clean",
    line: "Flowing curves, and colour on the clusters",
  },
  { id: "retro", name: "Retro", line: "Brushed metal, and a lit screen" },
  {
    id: "gallery",
    name: "Paint",
    line: "Glossy pigment, one colour per hobby",
  },
  { id: "pocket", name: "Pocket Tech", line: "Smoked glass and satin silver" },
];

type Tab = "themes" | "icons";

export default function MakeItYours() {
  const [tab, setTab] = useState<Tab>("themes");
  const [theme, setTheme] = useState("midnight");
  const [iconSet, setIconSet] = useState("obsidian");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const options = tab === "themes" ? THEMES : ICON_SETS;
  const current = tab === "themes" ? theme : iconSet;
  const choose = tab === "themes" ? setTheme : setIconSet;
  const folder = tab === "themes" ? "themes" : "icons";
  const currentName = options.find((o) => o.id === current)!.name;

  // Arrow keys move between the two tabs, as a tab list should.
  const onTabKey = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next = index === 0 ? 1 : 0;
    setTab(next === 0 ? "themes" : "icons");
    tabRefs.current[next]?.focus();
  };

  return (
    <section className="yours" id="yours" aria-labelledby="yours-title">
      <div className="container yours-grid">
        <div className="yours-copy">
          <h2 id="yours-title">Make the whole map feel like yours.</h2>
          <p>
            Eight themes and six icon sets, every one drawn across all 47
            hobbies. Earn milestones as you go, like Wide Net, for mapping four
            or more clusters.
          </p>

          <div
            className="yours-tabs"
            role="tablist"
            aria-label="What to change"
          >
            {(["themes", "icons"] as Tab[]).map((t, i) => (
              <button
                key={t}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`yours-tab-${t}`}
                aria-selected={tab === t}
                aria-controls="yours-panel"
                tabIndex={tab === t ? 0 : -1}
                onClick={() => setTab(t)}
                onKeyDown={(e) => onTabKey(e, i)}
              >
                {t === "themes" ? "Themes" : "Icon sets"}
                <small>
                  {t === "themes" ? THEMES.length : ICON_SETS.length}
                </small>
              </button>
            ))}
          </div>

          <div
            id="yours-panel"
            role="tabpanel"
            aria-labelledby={`yours-tab-${tab}`}
          >
            <ul className="yours-options">
              {options.map((o) => (
                <li key={`${tab}-${o.id}`}>
                  <button
                    type="button"
                    aria-pressed={current === o.id}
                    onClick={() => choose(o.id)}
                  >
                    <span className="yours-thumb" aria-hidden="true">
                      <Image
                        src={`/make/${folder}/${o.id}.jpg`}
                        alt=""
                        width={36}
                        height={78}
                        sizes="36px"
                      />
                    </span>
                    <span className="yours-option-text">
                      <span>{o.name}</span>
                      {o.line && <small>{o.line}</small>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <figure className="yours-stage">
          <div className="device device-yours">
            <div className="device-screen">
              {options.map((o) => (
                <Image
                  key={`${tab}-${o.id}`}
                  src={`/make/${folder}/${o.id}.jpg`}
                  alt={
                    tab === "themes"
                      ? `The hobby graph in the ${o.name} theme`
                      : `The hobby graph drawn in the ${o.name} icon set`
                  }
                  fill
                  sizes="(max-width: 1000px) 70vw, 340px"
                  className="yours-shot"
                  data-shown={current === o.id}
                  aria-hidden={current !== o.id}
                />
              ))}
            </div>
          </div>
          <figcaption>
            <span className="voice">{currentName}</span>, captured from the app.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
