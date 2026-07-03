"use client";

import { useState } from "react";
import { activities, interests } from "@/data/activities";
import { dinnerOptions } from "@/data/dinnerOptions";
import { dateTheme } from "@/lib/theme";
import type { BudgetRange, DatePlan, TimeWindow } from "@/lib/plan/store";
import { BudgetSlider, Chip, PrimaryButton, Section, TextInput } from "./ui";

interface Props {
  plan: DatePlan;
  onSubmit: (updates: Pick<DatePlan, "inviter" | "proposal">) => void;
}

function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

function defaultWindowStart(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(18, 30, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export default function DraftStep({ plan, onSubmit }: Props) {
  const [name, setName] = useState(plan.inviter.name);
  const [email, setEmail] = useState(plan.inviter.email ?? "");
  const [interestIds, setInterestIds] = useState<string[]>(
    plan.inviter.interestIds,
  );
  const [activityIds, setActivityIds] = useState<string[]>(
    plan.proposal.activityIds,
  );
  const [budget, setBudget] = useState<BudgetRange>(plan.proposal.budget);
  const [dinnerIds, setDinnerIds] = useState<string[]>(
    plan.proposal.dinnerOptionIds,
  );
  const [windows, setWindows] = useState<TimeWindow[]>(
    plan.proposal.windows.length > 0
      ? plan.proposal.windows
      : [{ id: "w1", start: defaultWindowStart(2) }],
  );

  // Candidate pool: activities under the interests you picked
  const pool = interestIds.flatMap(
    (id) => interests.find((i) => i.id === id)?.activityIds ?? [],
  );
  const uniquePool = [...new Set(pool)];
  // Dropped interests shouldn't leave orphan candidates behind
  const keptActivities = activityIds.filter((id) => uniquePool.includes(id));

  const windowsValid = windows.filter(
    (w) => !Number.isNaN(new Date(w.start).getTime()),
  );

  const missing = [
    name.trim() === "" && "your name",
    interestIds.length === 0 && "at least one interest",
    keptActivities.length === 0 && "at least one activity idea",
    dinnerIds.length === 0 && "a dinner option",
    windowsValid.length === 0 && "a possible day & time",
  ].filter(Boolean) as string[];

  function submit() {
    onSubmit({
      inviter: {
        name: name.trim(),
        email: email.trim() || undefined,
        interestIds,
      },
      proposal: {
        activityIds: keptActivities,
        budget,
        dinnerOptionIds: dinnerIds,
        windows: windowsValid,
      },
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <Section
        title="You"
        hint="Email is optional — it turns the final calendar file into a real invite."
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 160px" }}>
            <TextInput
              value={name}
              onChange={setName}
              placeholder="Your name"
            />
          </div>
          <div style={{ flex: "1 1 200px" }}>
            <TextInput
              value={email}
              onChange={setEmail}
              placeholder="you@email.com (optional)"
              type="email"
            />
          </div>
        </div>
      </Section>

      <Section
        title="Your interests"
        hint="These get compared with theirs — the overlap shapes the date."
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {interests.map((i) => (
            <Chip
              key={i.id}
              label={i.label}
              active={interestIds.includes(i.id)}
              onClick={() => setInterestIds((prev) => toggle(prev, i.id))}
            />
          ))}
        </div>
      </Section>

      {interestIds.length > 0 && (
        <Section
          title="Date ideas to propose"
          hint="Pick a few activities — they'll react to each one."
        >
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {uniquePool.map((id) => {
              const a = activities.find((x) => x.id === id);
              return a ? (
                <Chip
                  key={id}
                  label={a.label}
                  active={keptActivities.includes(id)}
                  onClick={() => setActivityIds((prev) => toggle(prev, id))}
                />
              ) : null;
            })}
          </div>
        </Section>
      )}

      <Section
        title="Budget"
        hint="A comfortable range — they'll set theirs too."
      >
        <BudgetSlider value={budget} onChange={setBudget} />
      </Section>

      <Section title="Dinner options" hint="Offer a few — they vote.">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {dinnerOptions.map((o) => (
            <Chip
              key={o.id}
              label={`${o.emoji} ${o.label}`}
              active={dinnerIds.includes(o.id)}
              onClick={() => setDinnerIds((prev) => toggle(prev, o.id))}
              tone="gold"
            />
          ))}
        </div>
      </Section>

      <Section
        title="When could it happen?"
        hint="Propose up to three days & times — they pick what works."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {windows.map((w, idx) => (
            <div key={w.id} style={{ display: "flex", gap: 8 }}>
              <input
                type="datetime-local"
                value={w.start}
                onChange={(e) =>
                  setWindows((prev) =>
                    prev.map((x) =>
                      x.id === w.id ? { ...x, start: e.target.value } : x,
                    ),
                  )
                }
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 12,
                  border: `1px solid ${dateTheme.border}`,
                  background: dateTheme.inputBg,
                  color: dateTheme.text,
                  padding: "0 12px",
                  fontSize: 14,
                  colorScheme: "dark",
                }}
              />
              {windows.length > 1 && (
                <button
                  onClick={() =>
                    setWindows((prev) => prev.filter((x) => x.id !== w.id))
                  }
                  title={`Remove option ${idx + 1}`}
                  style={{
                    width: 44,
                    borderRadius: 12,
                    border: `1px solid ${dateTheme.border}`,
                    background: "transparent",
                    color: dateTheme.textFaint,
                    cursor: "pointer",
                    fontSize: 16,
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {windows.length < 3 && (
            <button
              onClick={() =>
                setWindows((prev) => [
                  ...prev,
                  {
                    id: `w${Date.now()}`,
                    start: defaultWindowStart(prev.length * 2 + 2),
                  },
                ])
              }
              style={{
                height: 40,
                borderRadius: 12,
                border: `1px dashed ${dateTheme.panelBorder}`,
                background: "transparent",
                color: dateTheme.accent,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              + Add another option
            </button>
          )}
        </div>
      </Section>

      <PrimaryButton
        label="Create the invite →"
        onClick={submit}
        disabled={missing.length > 0}
        hint={
          missing.length > 0 ? `Still needed: ${missing.join(", ")}` : undefined
        }
      />
    </div>
  );
}
