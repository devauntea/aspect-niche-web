"use client";

// The night-sky component kit — every visual value comes from tokens
// (nightSky / radiiScale / durations in src/lib/theme.ts). Depth is glow,
// not shadow. Each interactive component covers the six states:
// default / hover / selected(active) / loading / empty(disabled) / error.

import { useState } from "react";
import { durations, nightSky, radiiScale } from "@/lib/theme";

/* ── Card ─────────────────────────────────────────────── */

export function Card({
  children,
  style,
  className,
  padding = 20,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  padding?: number;
}) {
  return (
    <div
      className={className}
      style={{
        background: nightSky.space900,
        border: `1px solid ${nightSky.space800}`,
        borderRadius: radiiScale.card,
        boxShadow: nightSky.raisedGlow,
        padding,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Sheet (dock panels, drawers, modals) ─────────────── */

export function Sheet({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        background: nightSky.space900,
        border: `1px solid ${nightSky.space800}`,
        borderRadius: radiiScale.sheet,
        boxShadow: nightSky.raisedGlow,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Button ───────────────────────────────────────────── */

type ButtonVariant = "alpha" | "violet" | "ghost" | "danger";

const BUTTON_STYLES: Record<
  ButtonVariant,
  { bg: string; color: string; border: string; hoverBg: string; glow?: string }
> = {
  // alpha-star: THE primary action — one per screen, never two
  alpha: {
    bg: nightSky.alphaStar,
    color: "var(--color-on-alpha, var(--color-bg))",
    border: nightSky.alphaStar,
    hoverBg: "color-mix(in srgb, var(--color-alpha) 88%, white)",
    glow: "0 0 20px color-mix(in srgb, var(--color-alpha) 25%, transparent)",
  },
  violet: {
    bg: "color-mix(in srgb, var(--color-glow) 16%, transparent)",
    color: "var(--color-glow-text, var(--color-glow))",
    border:
      "color-mix(in srgb, var(--color-glow-text, var(--color-glow)) 45%, transparent)",
    hoverBg: "color-mix(in srgb, var(--color-glow) 26%, transparent)",
  },
  ghost: {
    bg: "transparent",
    color: nightSky.dust,
    border: nightSky.space800,
    hoverBg: nightSky.space800,
  },
  danger: {
    bg: "color-mix(in srgb, var(--color-danger-t) 12%, transparent)",
    color: nightSky.danger,
    border: "color-mix(in srgb, var(--color-danger-t) 40%, transparent)",
    hoverBg: "color-mix(in srgb, var(--color-danger-t) 20%, transparent)",
  },
};

export function Button({
  variant = "violet",
  children,
  onClick,
  disabled,
  loading,
  title,
  size = "md",
  style,
}: {
  variant?: ButtonVariant;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  title?: string;
  size?: "sm" | "md";
  style?: React.CSSProperties;
}) {
  const v = BUTTON_STYLES[variant];
  const [hover, setHover] = useState(false);
  const inert = disabled || loading;
  return (
    <button
      onClick={inert ? undefined : onClick}
      disabled={disabled}
      title={title}
      aria-busy={loading || undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        height: size === "sm" ? 36 : 44,
        minHeight: size === "sm" ? 36 : 44,
        padding: size === "sm" ? "0 14px" : "0 18px",
        borderRadius: radiiScale.control,
        border: `1px solid ${v.border}`,
        background: hover && !inert ? v.hoverBg : v.bg,
        color: v.color,
        fontSize: size === "sm" ? 12 : 14,
        fontWeight: 600,
        cursor: inert ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        boxShadow: !inert && v.glow ? v.glow : "none",
        transition: `background ${durations.micro}ms ease, transform ${durations.micro}ms ease, opacity ${durations.micro}ms ease`,
        whiteSpace: "nowrap",
        ...style,
      }}
      onMouseDown={(e) => {
        if (!inert) e.currentTarget.style.transform = "scale(0.97)";
      }}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {loading && (
        <span
          aria-hidden
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            border: `2px solid ${v.color}`,
            borderTopColor: "transparent",
            animation: "orbitalSpin 0.8s linear infinite",
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </button>
  );
}

/* ── Chip (tags, filters, toggles) ────────────────────── */

export function Chip({
  label,
  active,
  onClick,
  disabled,
  accent = "var(--color-glow-text, var(--color-glow))",
  title,
}: {
  label: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  accent?: string;
  title?: string;
}) {
  const interactive = !!onClick && !disabled;
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={interactive ? onClick : undefined}
      disabled={disabled}
      title={title}
      aria-pressed={onClick ? active : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: 30,
        padding: "0 12px",
        borderRadius: radiiScale.control,
        fontSize: 12,
        fontWeight: active ? 600 : 500,
        background: active
          ? `color-mix(in srgb, ${accent} 14%, transparent)`
          : hover && interactive
            ? nightSky.space800
            : "color-mix(in srgb, var(--color-surface-raised) 60%, transparent)",
        color: active ? accent : nightSky.dust,
        border: `1px solid ${active ? `color-mix(in srgb, ${accent} 40%, transparent)` : nightSky.space800}`,
        cursor: interactive ? "pointer" : disabled ? "not-allowed" : "default",
        opacity: disabled ? 0.4 : 1,
        transition: `all ${durations.micro}ms ease`,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

/* ── Input ────────────────────────────────────────────── */

export function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  disabled,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}) {
  const [focus, setFocus] = useState(false);
  const borderColor = error
    ? nightSky.danger
    : focus
      ? nightSky.violetGlow
      : nightSky.space800;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        aria-invalid={!!error || undefined}
        style={{
          height: 44,
          borderRadius: radiiScale.control,
          border: `1px solid ${borderColor}`,
          background: nightSky.space950,
          color: nightSky.starlight,
          padding: "0 14px",
          fontSize: 14,
          outline: "none",
          width: "100%",
          opacity: disabled ? 0.45 : 1,
          colorScheme: "dark",
          boxShadow: focus
            ? `0 0 0 3px color-mix(in srgb, var(--color-glow) 18%, transparent)`
            : "none",
          transition: `border-color ${durations.micro}ms ease, box-shadow ${durations.micro}ms ease`,
          ...style,
        }}
      />
      {error && (
        <p style={{ fontSize: 11, color: nightSky.danger, margin: 0 }}>
          {error}
        </p>
      )}
    </div>
  );
}

/* ── Page star field — fixed, static, ~free ───────────── */

const PAGE_STARS = Array.from({ length: 36 }, (_, i) => ({
  left: `${(i * 37 + 13) % 100}%`,
  top: `${(i * 53 + 7) % 100}%`,
  size: 1 + (i % 3) * 0.35,
  opacity: 0.16 + (i % 4) * 0.05,
}));

export function PageStarField() {
  return (
    <div
      aria-hidden
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}
    >
      {PAGE_STARS.map((s, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: nightSky.starlight,
            opacity: `calc(${s.opacity} * var(--starfield-opacity, 0.35) / 0.35)`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Eyebrow (all-caps section label, wide tracking) ──── */

export function Eyebrow({
  children,
  color = nightSky.dust,
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <p
      style={{
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: "0.14em",
        fontWeight: 600,
        color,
        margin: 0,
      }}
    >
      {children}
    </p>
  );
}
