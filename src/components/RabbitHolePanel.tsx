"use client";

import { useState, useCallback } from "react";
import { isValidRabbitHoleResult } from "@/lib/rabbitHoleTypes";
import { getCached, setCached, clearCached } from "@/lib/rabbitHoleCache";
import type { RabbitHoleResult } from "@/lib/rabbitHoleTypes";

type Props = {
  activityId: string;
  activityLabel: string;
  accentColor: string;
  tags: Record<string, string>;
  onCreateNiche: () => void;
  isCreating: boolean;
};

type Status = "idle" | "loading" | "loaded" | "error";

export default function RabbitHolePanel({
  activityId,
  activityLabel,
  accentColor,
  tags,
  onCreateNiche,
  isCreating,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [data, setData] = useState<RabbitHoleResult | null>(null);

  const fetchData = useCallback(
    async (skipCache = false) => {
      if (!skipCache) {
        const cached = getCached(activityId);
        if (cached) {
          setData(cached);
          setStatus("loaded");
          return;
        }
      }

      setStatus("loading");
      try {
        const res = await fetch("/api/rabbit-hole", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activityId, activityLabel, tags }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: unknown = await res.json();
        if (!isValidRabbitHoleResult(json)) throw new Error("Invalid response");
        setCached(activityId, json);
        setData(json);
        setStatus("loaded");
      } catch {
        setStatus("error");
      }
    },
    [activityId, activityLabel, tags],
  );

  function handleToggle() {
    if (!isOpen) {
      setIsOpen(true);
      if (status === "idle") fetchData();
    } else {
      setIsOpen(false);
    }
  }

  function handleRefresh() {
    clearCached(activityId);
    setData(null);
    fetchData(true);
  }

  return (
    <div className="rounded-3xl border border-space-800 bg-space-950 overflow-hidden">
      {/* Header */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-2 h-2 rounded-full bg-violet-glow flex-shrink-0" />
          <span className="text-sm font-semibold text-starlight">
            Rabbit hole
          </span>
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-medium flex-shrink-0"
            style={{
              background: `color-mix(in srgb, ${accentColor} 9%, transparent)`,
              color: accentColor,
            }}
          >
            {activityLabel}
          </span>
          {!isOpen && (
            <span className="text-xs text-dust">AI-powered discovery</span>
          )}
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`flex-shrink-0 ml-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="var(--color-text-dim)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Body */}
      {isOpen && (
        <div className="px-5 pb-5">
          {status === "loading" && (
            <div className="flex items-center justify-center gap-3 py-8 text-dust">
              <div className="w-4 h-4 rounded-full border-2 border-[var(--color-glow)] border-t-transparent animate-spin" />
              <span className="text-sm">Going down the rabbit hole...</span>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-sm text-dust">
                Couldn&apos;t load right now — try again later
              </p>
              <button
                onClick={() => fetchData()}
                className="rounded-full px-4 py-1.5 text-xs font-medium bg-space-900 border border-space-800 text-dust hover:border-space-800 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {status === "loaded" && data && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                {/* Col 1: Deeper cuts */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-dust mb-3">
                    Deeper cuts
                  </p>
                  <div className="flex flex-col gap-2.5">
                    {data.deeperCuts.map((cut, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span
                          className="text-xs flex-shrink-0 mt-0.5"
                          style={{ color: "var(--color-glow)" }}
                        >
                          →
                        </span>
                        <p className="text-xs text-dust leading-relaxed">
                          {cut}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Col 2: Ultra-niche hobbies */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-dust mb-3">
                    You might not know about
                  </p>
                  <div className="flex flex-col gap-3">
                    {data.ultraNicheHobbies.map((h, i) => (
                      <div
                        key={i}
                        className="rounded-xl p-3 bg-space-900 border border-space-800"
                      >
                        <p className="text-xs font-semibold text-starlight mb-1">
                          {h.name}
                        </p>
                        <p className="text-xs text-dust leading-relaxed">
                          {h.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Col 3: Related + insider term + fun fact */}
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-dust mb-3">
                      Related you&apos;d like
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {data.relatedActivities.map((act, i) => (
                        <span
                          key={i}
                          className="rounded-full px-2.5 py-1 text-xs font-medium"
                          style={{
                            background: `color-mix(in srgb, ${accentColor} 8%, transparent)`,
                            color: accentColor,
                          }}
                        >
                          {act}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div
                    className="rounded-xl p-3"
                    style={{
                      background: `color-mix(in srgb, ${accentColor} 3%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${accentColor} 13%, transparent)`,
                    }}
                  >
                    <p
                      className="text-[10px] uppercase tracking-widest mb-1"
                      style={{ color: accentColor }}
                    >
                      Insider term
                    </p>
                    <p className="text-xs font-semibold text-starlight mb-1">
                      {data.insiderTerm}
                    </p>
                    <p className="text-xs text-dust leading-relaxed">
                      {data.insiderDefinition}
                    </p>
                  </div>
                  <div className="rounded-xl p-3 bg-space-900 border border-space-800">
                    <p className="text-[10px] uppercase tracking-widest text-dust mb-1">
                      Fun fact
                    </p>
                    <p className="text-xs text-dust leading-relaxed">
                      {data.funFact}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-space-800">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-dust">
                    Powered by Groq · Llama 3
                  </span>
                  <button
                    onClick={onCreateNiche}
                    disabled={isCreating}
                    className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all"
                    style={{
                      border: "1.5px solid var(--color-glow)40",
                      background: "var(--color-glow)0e",
                      color: "var(--color-glow)",
                      opacity: isCreating ? 0.7 : 1,
                      transform: isCreating ? "none" : undefined,
                    }}
                    onMouseEnter={(e) => {
                      if (!isCreating)
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "var(--color-glow)18";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "var(--color-glow)0e";
                    }}
                  >
                    {isCreating ? (
                      <>
                        <span className="inline-block w-2 h-2 rounded-full border border-[var(--color-glow)] border-t-transparent animate-spin flex-shrink-0" />
                        Creating...
                      </>
                    ) : (
                      "✦ Create a niche"
                    )}
                  </button>
                </div>
                <button
                  onClick={handleRefresh}
                  className="text-[10px] font-medium hover:underline"
                  style={{ color: "var(--color-glow)" }}
                >
                  Refresh
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
