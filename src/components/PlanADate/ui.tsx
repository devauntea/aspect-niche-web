"use client";

// Shared date-mode UI primitives. Everything reads from dateTheme so the
// mode stays visually distinct from the exploration app.

import { dateTheme } from "@/lib/theme";

export function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div>
        <p
          style={{
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            fontWeight: 700,
            color: dateTheme.gold,
            margin: 0,
          }}
        >
          {title}
        </p>
        {hint && (
          <p
            style={{
              fontSize: 12,
              color: dateTheme.textDim,
              margin: "3px 0 0",
              lineHeight: 1.5,
            }}
          >
            {hint}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

export function Chip({
  label,
  active,
  onClick,
  tone = "rose",
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  tone?: "rose" | "gold";
}) {
  const accent = tone === "gold" ? dateTheme.gold : dateTheme.accent;
  return (
    <button
      onClick={onClick}
      style={{
        borderRadius: 999,
        padding: "8px 14px",
        minHeight: 36,
        fontSize: 13,
        fontWeight: active ? 700 : 500,
        cursor: "pointer",
        background: active
          ? tone === "gold"
            ? dateTheme.goldSoft
            : dateTheme.accentSoft
          : dateTheme.inputBg,
        color: active ? accent : dateTheme.textDim,
        border: active
          ? `1.5px solid ${accent}`
          : `1px solid ${dateTheme.border}`,
        boxShadow: active ? `0 0 14px ${accent}40` : "none",
        transition: "all 0.15s ease",
      }}
    >
      {label}
    </button>
  );
}

export function PrimaryButton({
  label,
  onClick,
  disabled,
  hint,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <button
        onClick={onClick}
        disabled={disabled}
        style={{
          height: 48,
          minHeight: 48,
          borderRadius: 999,
          border: "none",
          background: disabled
            ? "rgba(232,93,138,0.18)"
            : `linear-gradient(135deg, ${dateTheme.accent}, ${dateTheme.accentDark})`,
          color: disabled ? dateTheme.textFaint : "white",
          fontSize: 15,
          fontWeight: 700,
          cursor: disabled ? "not-allowed" : "pointer",
          boxShadow: disabled ? "none" : `0 6px 24px ${dateTheme.accent}50`,
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
        }}
        onMouseDown={(e) => {
          if (!disabled) e.currentTarget.style.transform = "scale(0.98)";
        }}
        onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {label}
      </button>
      {disabled && hint && (
        <p
          style={{
            fontSize: 11,
            color: dateTheme.textFaint,
            margin: 0,
            textAlign: "center",
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

export function GhostButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 40,
        minHeight: 40,
        borderRadius: 999,
        padding: "0 16px",
        background: "transparent",
        border: `1px solid ${dateTheme.border}`,
        color: dateTheme.textDim,
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {label}
    </button>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{
        height: 44,
        borderRadius: 12,
        border: `1px solid ${dateTheme.border}`,
        background: dateTheme.inputBg,
        color: dateTheme.text,
        padding: "0 14px",
        fontSize: 14,
        outline: "none",
        width: "100%",
        colorScheme: "dark",
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = dateTheme.accent)}
      onBlur={(e) => (e.currentTarget.style.borderColor = dateTheme.border)}
    />
  );
}

/** Min/max budget picker: two sliders, one live readout. */
export function BudgetSlider({
  value,
  onChange,
}: {
  value: { min: number; max: number };
  onChange: (v: { min: number; max: number }) => void;
}) {
  const slider: React.CSSProperties = {
    width: "100%",
    accentColor: dateTheme.accent,
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <p
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: dateTheme.text,
          margin: 0,
        }}
      >
        ${value.min} – ${value.max}
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: dateTheme.textFaint,
            marginLeft: 8,
          }}
        >
          per person
        </span>
      </p>
      <label style={{ fontSize: 11, color: dateTheme.textDim }}>
        At least
        <input
          type="range"
          min={0}
          max={200}
          step={5}
          value={value.min}
          onChange={(e) => {
            const min = Number(e.target.value);
            onChange({ min, max: Math.max(min, value.max) });
          }}
          style={slider}
        />
      </label>
      <label style={{ fontSize: 11, color: dateTheme.textDim }}>
        Up to
        <input
          type="range"
          min={0}
          max={200}
          step={5}
          value={value.max}
          onChange={(e) => {
            const max = Number(e.target.value);
            onChange({ min: Math.min(value.min, max), max });
          }}
          style={slider}
        />
      </label>
    </div>
  );
}

export function formatWindow(start: string): string {
  const d = new Date(start);
  if (Number.isNaN(d.getTime())) return start;
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
