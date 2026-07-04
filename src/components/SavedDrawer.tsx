"use client";

import BrandMark from "./BrandMark";
import { starHues } from "@/lib/theme";

import { activities, interests } from "../data/activities";

interface Props {
  savedIds: string[];
  onSelect: (id: string) => void;
  onUnsave: (id: string) => void;
  onClose: () => void;
}

export default function SavedDrawer({
  savedIds,
  onSelect,
  onUnsave,
  onClose,
}: Props) {
  const savedActivities = savedIds
    .map((id) => activities.find((a) => a.id === id))
    .filter(Boolean) as typeof activities;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-space-900 z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-space-800">
          <div>
            <h2 className="text-base font-semibold text-starlight">Saved</h2>
            <p className="text-xs text-dust mt-0.5">
              {savedIds.length === 0
                ? "Nothing saved yet"
                : `${savedIds.length} activit${savedIds.length === 1 ? "y" : "ies"}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-space-800 flex items-center justify-center hover:bg-space-800 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M1 1l10 10M11 1L1 11"
                stroke="var(--color-text-dim)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {savedActivities.length === 0 ? (
            <div className="relative flex flex-col items-center justify-center h-full gap-3 text-center pb-16">
              {/* Faint brand mark behind the empty-state copy */}
              <BrandMark
                size={150}
                variant="mono"
                className="text-dust opacity-25"
              />
              <p className="text-sm font-medium text-dust">No stars here yet</p>
              <p className="text-xs text-dust max-w-[210px] leading-relaxed">
                Expand a node and tap the bookmark on an activity — or try
                Surprise me.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {savedActivities.map((activity) => {
                const parent = interests.find((i) =>
                  i.activityIds.includes(activity.id),
                );
                const color = parent
                  ? (starHues[parent.id] ?? "var(--color-glow)")
                  : "var(--color-glow)";
                return (
                  <div
                    key={activity.id}
                    className="rounded-2xl border border-space-800 p-4 flex items-center gap-3 hover:border-space-800 transition-colors"
                  >
                    {/* Color dot */}
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: color }}
                    />

                    {/* Info */}
                    <button
                      className="flex-1 text-left"
                      onClick={() => {
                        onSelect(activity.id);
                        onClose();
                      }}
                    >
                      <p className="text-sm font-medium text-starlight">
                        {activity.label}
                      </p>
                      <p className="text-xs text-dust mt-0.5 capitalize">
                        {activity.tags.difficulty} · {activity.tags.environment}
                      </p>
                    </button>

                    {/* Unsave */}
                    <button
                      onClick={() => onUnsave(activity.id)}
                      className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-space-800 transition-colors flex-shrink-0"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                      >
                        <path
                          d="M2.5 2h9a.5.5 0 01.5.5v10l-5-2.5-5 2.5V2.5a.5.5 0 01.5-.5z"
                          fill={color}
                          stroke={color}
                          strokeWidth="1"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
