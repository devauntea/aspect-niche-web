"use client";

// Choosing an icon family. Six of them, each drawing all 105 pictograms.
//
// Sits next to the theme switcher because they are the same kind of choice, and
// stays a separate control because they are not the same choice: a theme owns
// colour, type and motion, and someone who wants the paper theme does not
// necessarily want folders. That separation is the app's rule and the demo
// should teach it rather than blur it.
//
// Each row previews the set with a real mark rather than a swatch, because the
// difference between these families is the drawing, and a colour chip would
// say nothing about it.

import { useEffect, useRef, useState } from "react";
import HobbyGlyph from "@/components/HobbyGlyph";
import {
  ICON_SETS,
  storeIconSet,
  type IconSetId,
} from "@/lib/iconSet";

export default function IconSetSwitcher({
  value,
  onChange,
  hue = "#c9c4ff",
}: {
  value: IconSetId;
  onChange: (id: IconSetId) => void;
  hue?: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = ICON_SETS.find((s) => s.id === value) ?? ICON_SETS[0];

  return (
    <div ref={root} className="iconset-root">
      <button
        type="button"
        className="demo-flip-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <HobbyGlyph
          id={current.specimen}
          category="craft"
          hue={hue}
          size={16}
          iconSet={current.id}
        />
        <span className="hidden sm:inline">{current.label}</span>
      </button>

      {open && (
        <div className="iconset-menu" role="menu" aria-label="Icon set">
          {ICON_SETS.map((set) => (
            <button
              key={set.id}
              type="button"
              role="menuitemradio"
              aria-checked={set.id === value}
              className={`iconset-row ${set.id === value ? "is-active" : ""}`}
              onClick={() => {
                onChange(set.id);
                storeIconSet(set.id);
                setOpen(false);
              }}
            >
              <span className="iconset-preview">
                <HobbyGlyph
                  id={set.specimen}
                  category="craft"
                  hue={hue}
                  size={30}
                  iconSet={set.id}
                />
              </span>
              <span className="iconset-text">
                <strong>{set.label}</strong>
                <small>{set.description}</small>
              </span>
              {set.id === value && <span className="iconset-tick">In use</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
