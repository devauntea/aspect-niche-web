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
};

type Status = "idle" | "loading" | "loaded" | "error";

export default function RabbitHolePanel({
  activityId,
  activityLabel,
  accentColor,
  tags,
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
    <div className="rounded-3xl border border-[#E8E4DA] bg-[#FAF8F2] overflow-hidden">
      {/* Header */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-2 h-2 rounded-full bg-[#7F77DD] flex-shrink-0" />
          <span className="text-sm font-semibold text-[#1A1916]">Rabbit hole</span>
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-medium flex-shrink-0"
            style={{ background: `${accentColor}18`, color: accentColor }}
          >
            {activityLabel}
          </span>
          {!isOpen && (
            <span className="text-xs text-[#B0ADA8]">AI-powered discovery</span>
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
            stroke="#B0ADA8"
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
            <div className="flex items-center justify-center gap-3 py-8 text-[#B0ADA8]">
              <div className="w-4 h-4 rounded-full border-2 border-[#7F77DD] border-t-transparent animate-spin" />
              <span className="text-sm">Going down the rabbit hole...</span>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-sm text-[#5A5855]">
                Couldn&apos;t load right now — try again later
              </p>
              <button
                onClick={() => fetchData()}
                className="rounded-full px-4 py-1.5 text-xs font-medium bg-white border border-[#E8E4DA] text-[#5A5855] hover:border-[#D3D0C8] transition-colors"
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
                  <p className="text-[10px] uppercase tracking-widest text-[#B0ADA8] mb-3">
                    Deeper cuts
                  </p>
                  <div className="flex flex-col gap-2.5">
                    {data.deeperCuts.map((cut, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: "#7F77DD" }}>
                          →
                        </span>
                        <p className="text-xs text-[#5A5855] leading-relaxed">{cut}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Col 2: Ultra-niche hobbies */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#B0ADA8] mb-3">
                    You might not know about
                  </p>
                  <div className="flex flex-col gap-3">
                    {data.ultraNicheHobbies.map((h, i) => (
                      <div
                        key={i}
                        className="rounded-xl p-3 bg-white border border-[#E8E4DA]"
                      >
                        <p className="text-xs font-semibold text-[#1A1916] mb-1">{h.name}</p>
                        <p className="text-xs text-[#5A5855] leading-relaxed">{h.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Col 3: Related + insider term + fun fact */}
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#B0ADA8] mb-3">
                      Related you&apos;d like
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {data.relatedActivities.map((act, i) => (
                        <span
                          key={i}
                          className="rounded-full px-2.5 py-1 text-xs font-medium"
                          style={{ background: `${accentColor}14`, color: accentColor }}
                        >
                          {act}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div
                    className="rounded-xl p-3"
                    style={{
                      background: `${accentColor}08`,
                      border: `1px solid ${accentColor}20`,
                    }}
                  >
                    <p
                      className="text-[10px] uppercase tracking-widest mb-1"
                      style={{ color: accentColor }}
                    >
                      Insider term
                    </p>
                    <p className="text-xs font-semibold text-[#1A1916] mb-1">
                      {data.insiderTerm}
                    </p>
                    <p className="text-xs text-[#5A5855] leading-relaxed">
                      {data.insiderDefinition}
                    </p>
                  </div>
                  <div className="rounded-xl p-3 bg-white border border-[#E8E4DA]">
                    <p className="text-[10px] uppercase tracking-widest text-[#B0ADA8] mb-1">
                      Fun fact
                    </p>
                    <p className="text-xs text-[#5A5855] leading-relaxed">{data.funFact}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-[#E8E4DA]">
                <span className="text-[10px] text-[#B0ADA8]">
                  Powered by Groq · Llama 3
                </span>
                <button
                  onClick={handleRefresh}
                  className="text-[10px] font-medium hover:underline"
                  style={{ color: "#7F77DD" }}
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
