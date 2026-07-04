"use client";

// Theme switcher: each theme rendered as a small "sky swatch" — bg tile,
// glow dot, alpha chip — with its name. Hover live-previews (desktop),
// click applies. The trigger button shows the current theme's swatch.

import { useEffect, useRef, useState } from "react";
import { THEMES, type ThemeDefinition } from "@/lib/themes";
import { useTheme } from "@/lib/useTheme";
import { nightSky, radiiScale } from "@/lib/theme";

function Swatch({ t, size = 26 }: { t: ThemeDefinition; size?: number }) {
  return (
    <span
      aria-hidden
      style={{
        position: "relative",
        display: "inline-block",
        width: size * 1.45,
        height: size,
        borderRadius: 7,
        background: t.colors.bg,
        border: `1px solid ${t.colors.surfaceRaised}`,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* glow dot */}
      <span
        style={{
          position: "absolute",
          left: "26%",
          top: "34%",
          width: size * 0.28,
          height: size * 0.28,
          borderRadius: "50%",
          background: t.colors.glow,
          boxShadow: `0 0 6px ${t.colors.glow}`,
        }}
      />
      {/* alpha chip */}
      <span
        style={{
          position: "absolute",
          right: "14%",
          bottom: "22%",
          width: size * 0.34,
          height: size * 0.18,
          borderRadius: 3,
          background: t.colors.alpha,
        }}
      />
    </span>
  );
}

export default function ThemeSwitcher() {
  const { themeId, theme, setThemeId, preview } = useTheme();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative ml-1">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`Theme: ${theme.label}. Change theme`}
        aria-expanded={open}
        className="flex items-center rounded-full p-1.5 bg-space-900 border border-space-800 hover:border-violet-glow/40 transition-colors active:scale-95"
        style={{ minHeight: 44, minWidth: 44, justifyContent: "center" }}
      >
        <Swatch t={theme} size={20} />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Themes"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            zIndex: 60,
            width: 250,
            padding: 6,
            background: nightSky.space900,
            border: `1px solid ${nightSky.space800}`,
            borderRadius: radiiScale.card,
            boxShadow: nightSky.raisedGlow,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
          onMouseLeave={() => preview(null)}
        >
          {THEMES.map((t) => {
            const active = t.id === themeId;
            return (
              <button
                key={t.id}
                role="menuitemradio"
                aria-checked={active}
                onMouseEnter={() => preview(t.id)}
                onFocus={() => preview(t.id)}
                onClick={() => {
                  setThemeId(t.id);
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  borderRadius: radiiScale.control,
                  background: active
                    ? "color-mix(in srgb, var(--color-glow) 14%, transparent)"
                    : "transparent",
                  border: `1px solid ${
                    active
                      ? "color-mix(in srgb, var(--color-glow) 40%, transparent)"
                      : "transparent"
                  }`,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <Swatch t={t} />
                <span style={{ minWidth: 0 }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: nightSky.starlight,
                    }}
                  >
                    {t.label}
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: 11,
                      color: nightSky.dust,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {t.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
