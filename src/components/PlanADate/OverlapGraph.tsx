"use client";

// The interest-overlap constellation — the merged plan's centerpiece.
// Two person-stars on the sides; interests hang between them. Shared
// interests sit on the center line, linked to both people and glowing
// candlelight-gold. Deterministic layout: positions derive from list order.

import { interests } from "@/data/activities";
import { interestColors, dateTheme, colors } from "@/lib/theme";

interface Props {
  inviterName: string;
  guestName: string;
  sharedIds: string[];
  inviterOnlyIds: string[];
  guestOnlyIds: string[];
}

const W = 640;
const H = 320;
const PERSON_X = 70;
const CENTER_X = W / 2;

function label(id: string): string {
  return interests.find((i) => i.id === id)?.label ?? id;
}

function spread(count: number, index: number, span: number): number {
  if (count === 1) return H / 2;
  const step = span / (count - 1);
  return H / 2 - span / 2 + step * index;
}

export default function OverlapGraph({
  inviterName,
  guestName,
  sharedIds,
  inviterOnlyIds,
  guestOnlyIds,
}: Props) {
  const personY = H / 2;
  const shared = sharedIds.map((id, i) => ({
    id,
    x: CENTER_X,
    y: spread(sharedIds.length, i, Math.min(220, sharedIds.length * 70)),
  }));
  const inviterOnly = inviterOnlyIds.map((id, i) => ({
    id,
    x: CENTER_X - 170,
    y: spread(
      inviterOnlyIds.length,
      i,
      Math.min(240, inviterOnlyIds.length * 80),
    ),
  }));
  const guestOnly = guestOnlyIds.map((id, i) => ({
    id,
    x: CENTER_X + 170,
    y: spread(guestOnlyIds.length, i, Math.min(240, guestOnlyIds.length * 80)),
  }));

  const edge = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    stroke: string,
    opacity: number,
    key: string,
  ) => (
    <line
      key={key}
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={stroke}
      strokeWidth={1.2}
      opacity={opacity}
      strokeDasharray="3 6"
      strokeLinecap="round"
    />
  );

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", height: "auto", display: "block" }}
      role="img"
      aria-label={`Interest overlap between ${inviterName} and ${guestName}`}
    >
      {/* Edges — person to their interests, both people to shared */}
      {inviterOnly.map((n) =>
        edge(PERSON_X, personY, n.x, n.y, dateTheme.accent, 0.3, `ei-${n.id}`),
      )}
      {guestOnly.map((n) =>
        edge(
          W - PERSON_X,
          personY,
          n.x,
          n.y,
          dateTheme.accent,
          0.3,
          `eg-${n.id}`,
        ),
      )}
      {shared.map((n) => (
        <g key={`es-${n.id}`}>
          {edge(PERSON_X, personY, n.x, n.y, dateTheme.gold, 0.65, "l")}
          {edge(W - PERSON_X, personY, n.x, n.y, dateTheme.gold, 0.65, "r")}
        </g>
      ))}

      {/* Person stars */}
      {[
        { x: PERSON_X, name: inviterName },
        { x: W - PERSON_X, name: guestName },
      ].map((p) => (
        <g key={p.name + p.x}>
          <circle
            cx={p.x}
            cy={personY}
            r={26}
            fill={dateTheme.accentSoft}
            stroke={dateTheme.accent}
            strokeWidth={2}
          />
          <circle cx={p.x} cy={personY} r={7} fill={dateTheme.accent}>
            <animate
              attributeName="opacity"
              values="1;0.55;1"
              dur="2.6s"
              repeatCount="indefinite"
            />
          </circle>
          <text
            x={p.x}
            y={personY + 48}
            textAnchor="middle"
            fill={dateTheme.text}
            fontSize={14}
            fontWeight={700}
          >
            {p.name}
          </text>
        </g>
      ))}

      {/* One-sided interests */}
      {[...inviterOnly, ...guestOnly].map((n) => {
        const c = interestColors[n.id] ?? colors.brand;
        return (
          <g key={`n-${n.id}`} opacity={0.65}>
            <circle
              cx={n.x}
              cy={n.y}
              r={8}
              fill="none"
              stroke={c}
              strokeWidth={2}
            />
            <text
              x={n.x}
              y={n.y - 14}
              textAnchor="middle"
              fill={dateTheme.textDim}
              fontSize={11}
            >
              {label(n.id)}
            </text>
          </g>
        );
      })}

      {/* Shared interests — the glowing middle */}
      {shared.map((n) => {
        const c = interestColors[n.id] ?? colors.brand;
        return (
          <g key={`s-${n.id}`}>
            <circle
              cx={n.x}
              cy={n.y}
              r={16}
              fill={dateTheme.gold}
              opacity={0.18}
            >
              <animate
                attributeName="r"
                values="14;19;14"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              cx={n.x}
              cy={n.y}
              r={10}
              fill={c}
              stroke={dateTheme.gold}
              strokeWidth={2}
            />
            <text
              x={n.x}
              y={n.y - 20}
              textAnchor="middle"
              fill={dateTheme.gold}
              fontSize={12}
              fontWeight={700}
            >
              {label(n.id)}
            </text>
          </g>
        );
      })}

      {sharedIds.length === 0 && (
        <text
          x={CENTER_X}
          y={personY}
          textAnchor="middle"
          fill={dateTheme.textFaint}
          fontSize={12}
        >
          No shared interests yet — opposites attract
        </text>
      )}
    </svg>
  );
}
