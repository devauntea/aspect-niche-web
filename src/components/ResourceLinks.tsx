"use client";

import { useState } from "react";
import type { Resource } from "../data/resources";

const TYPE_CONFIG = {
  youtube: { icon: "▶", label: "YouTube", color: "#D4537E" },
  reddit: { icon: "●", label: "Reddit", color: "#D85A30" },
  reference: { icon: "◆", label: "Read", color: "#378ADD" },
};

interface Props {
  resources: Resource[];
  accentColor: string;
}

export default function ResourceLinks({ resources, accentColor }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] uppercase tracking-widest text-dust">
          Resources
        </p>
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-[10px] font-medium transition-colors"
          style={{ color: accentColor }}
        >
          {expanded ? "less" : "more"}
        </button>
      </div>

      {/* Quick-access chips */}
      <div className="flex gap-2 flex-wrap">
        {resources.map((r, i) => {
          const cfg = TYPE_CONFIG[r.type];
          return (
            <a
              key={i}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all hover:scale-105 active:scale-95"
              style={{
                background: `color-mix(in srgb, ${cfg.color} 7%, transparent)`,
                color: cfg.color,
                border: `1px solid color-mix(in srgb, ${cfg.color} 15%, transparent)`,
              }}
            >
              <span style={{ fontSize: 8 }}>{cfg.icon}</span>
              {cfg.label}
            </a>
          );
        })}
      </div>

      {/* Expandable detail list */}
      {expanded && (
        <div className="mt-3 flex flex-col gap-2">
          {resources.map((r, i) => {
            const cfg = TYPE_CONFIG[r.type];
            return (
              <a
                key={i}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 rounded-xl p-3 transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: "var(--color-bg)",
                  border: "1px solid var(--color-surface-raised)",
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 mt-0.5"
                  style={{
                    background: `color-mix(in srgb, ${cfg.color} 8%, transparent)`,
                    color: cfg.color,
                  }}
                >
                  {cfg.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-starlight truncate">
                    {r.title}
                  </p>
                  <p className="text-[11px] text-dust leading-snug mt-0.5">
                    {r.description}
                  </p>
                </div>
                <svg
                  className="flex-shrink-0 mt-1"
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                >
                  <path
                    d="M2 8l6-6M4 2h4v4"
                    stroke="var(--color-text-dim)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
