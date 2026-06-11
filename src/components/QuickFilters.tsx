"use client";

export type ActiveFilters = {
  environment: string[];
  social: string[];
  difficulty: string[];
  cost: string[];
};

const GROUPS: {
  key: keyof ActiveFilters;
  label: string;
  options: { value: string; label: string }[];
}[] = [
  {
    key: "environment",
    label: "Where",
    options: [
      { value: "indoors", label: "Indoors" },
      { value: "outdoors", label: "Outdoors" },
      { value: "both", label: "In or Out" },
    ],
  },
  {
    key: "social",
    label: "Social",
    options: [
      { value: "solo", label: "Solo" },
      { value: "social", label: "Social" },
      { value: "either", label: "Either" },
    ],
  },
  {
    key: "difficulty",
    label: "Level",
    options: [
      { value: "beginner", label: "Beginner" },
      { value: "intermediate", label: "Intermediate" },
      { value: "advanced", label: "Advanced" },
    ],
  },
  {
    key: "cost",
    label: "Cost",
    options: [
      { value: "free", label: "Free" },
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
    ],
  },
];

type Props = {
  activeFilters: ActiveFilters;
  onToggle: (category: keyof ActiveFilters, value: string) => void;
  onClear: () => void;
};

export default function QuickFilters({ activeFilters, onToggle, onClear }: Props) {
  const hasAny = Object.values(activeFilters).some((arr) => arr.length > 0);

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {GROUPS.map((group, gi) => (
        <div key={group.key} className="flex items-center gap-1.5 flex-shrink-0">
          {gi > 0 && <div className="w-px h-4 bg-[#E8E4DA] mx-1.5 flex-shrink-0" />}
          <span className="text-[10px] uppercase tracking-widest text-[#B0ADA8] mr-0.5 flex-shrink-0">
            {group.label}
          </span>
          {group.options.map((opt) => {
            const active = activeFilters[group.key].includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => onToggle(group.key, opt.value)}
                className="rounded-full px-3 py-1 text-xs font-medium transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                style={
                  active
                    ? { background: "#7F77DD", color: "#FFFFFF", border: "1.5px solid #7F77DD" }
                    : { background: "#FFFFFF", color: "#5A5855", border: "1.5px solid #E8E4DA" }
                }
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      ))}

      {hasAny && (
        <>
          <div className="w-px h-4 bg-[#E8E4DA] mx-1.5 flex-shrink-0" />
          <button
            onClick={onClear}
            className="flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all hover:scale-105 active:scale-95"
            style={{
              color: "#7F77DD",
              border: "1.5px solid #7F77DD40",
              background: "#7F77DD0e",
            }}
          >
            Clear all
          </button>
        </>
      )}
    </div>
  );
}
