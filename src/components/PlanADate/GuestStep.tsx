"use client";

import { useState } from "react";
import { activities, interests } from "@/data/activities";
import { dinnerLabel } from "@/data/dinnerOptions";
import { dateTheme } from "@/lib/theme";
import type { BudgetRange, DatePlan, GuestResponse } from "@/lib/plan/store";
import {
  BudgetSlider,
  Chip,
  PrimaryButton,
  Section,
  TextInput,
  formatWindow,
} from "./ui";

interface Props {
  plan: DatePlan;
  onSubmit: (guest: DatePlan["guest"], response: GuestResponse) => void;
}

function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export default function GuestStep({ plan, onSubmit }: Props) {
  const [name, setName] = useState(plan.guest?.name ?? "");
  const [email, setEmail] = useState(plan.guest?.email ?? "");
  const [interestIds, setInterestIds] = useState<string[]>(
    plan.guest?.interestIds ?? [],
  );
  const [votes, setVotes] = useState<Record<string, "up" | "down">>(
    plan.response?.activityVotes ?? {},
  );
  const [budget, setBudget] = useState<BudgetRange>(
    plan.response?.budget ?? { min: 0, max: 100 },
  );
  const [dinnerVotes, setDinnerVotes] = useState<string[]>(
    plan.response?.dinnerVotes ?? [],
  );
  const [windowVotes, setWindowVotes] = useState<string[]>(
    plan.response?.windowVotes ?? [],
  );
  const [noneWork, setNoneWork] = useState(false);

  const missing = [
    name.trim() === "" && "your name",
    interestIds.length === 0 && "at least one interest",
    windowVotes.length === 0 &&
      !noneWork &&
      "a time that works (or say none do)",
  ].filter(Boolean) as string[];

  function vote(id: string, dir: "up" | "down") {
    setVotes(
      (prev) =>
        ({
          ...prev,
          [id]: prev[id] === dir ? undefined : dir,
        }) as Record<string, "up" | "down">,
    );
  }

  function submit() {
    onSubmit(
      {
        name: name.trim(),
        email: email.trim() || undefined,
        interestIds,
      },
      {
        activityVotes: Object.fromEntries(
          Object.entries(votes).filter(([, v]) => v),
        ) as Record<string, "up" | "down">,
        budget,
        dinnerVotes,
        windowVotes: noneWork ? [] : windowVotes,
      },
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div
        style={{
          padding: 14,
          borderRadius: 14,
          background: dateTheme.accentSoft,
          border: `1px solid ${dateTheme.panelBorder}`,
        }}
      >
        <p style={{ fontSize: 14, color: dateTheme.text, margin: 0 }}>
          <strong>{plan.inviter.name}</strong> wants to plan a date with you.
        </p>
        <p
          style={{
            fontSize: 12,
            color: dateTheme.textDim,
            margin: "4px 0 0",
            lineHeight: 1.5,
          }}
        >
          Share your side — interests, what sounds fun, budget, food, timing —
          and the plan builds itself from the overlap.
        </p>
      </div>

      <Section
        title="About you"
        hint="Email optional — for the calendar invite."
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
        hint="Pick honestly — shared ones glow in the final plan."
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

      <Section title="Their date ideas" hint="React to each one.">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {plan.proposal.activityIds.map((id) => {
            const a = activities.find((x) => x.id === id);
            const v = votes[id];
            return (
              <div
                key={id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: dateTheme.inputBg,
                  border: `1px solid ${dateTheme.border}`,
                }}
              >
                <span style={{ fontSize: 14, color: dateTheme.text }}>
                  {a?.label ?? id}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => vote(id, "up")}
                    title="Sounds fun"
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 999,
                      border:
                        v === "up"
                          ? `1.5px solid ${dateTheme.gold}`
                          : `1px solid ${dateTheme.border}`,
                      background:
                        v === "up" ? dateTheme.goldSoft : "transparent",
                      cursor: "pointer",
                      fontSize: 16,
                    }}
                  >
                    ❤️
                  </button>
                  <button
                    onClick={() => vote(id, "down")}
                    title="Not for me"
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 999,
                      border:
                        v === "down"
                          ? `1.5px solid ${dateTheme.accent}`
                          : `1px solid ${dateTheme.border}`,
                      background:
                        v === "down" ? dateTheme.accentSoft : "transparent",
                      cursor: "pointer",
                      fontSize: 14,
                      color: dateTheme.textDim,
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Your budget" hint="What feels comfortable for you.">
        <BudgetSlider value={budget} onChange={setBudget} />
      </Section>

      <Section title="Dinner" hint="Vote for everything you'd eat.">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {plan.proposal.dinnerOptionIds.map((id) => (
            <Chip
              key={id}
              label={dinnerLabel(id)}
              active={dinnerVotes.includes(id)}
              onClick={() => setDinnerVotes((prev) => toggle(prev, id))}
              tone="gold"
            />
          ))}
        </div>
      </Section>

      <Section title="Timing" hint="Which of their suggestions work for you?">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {plan.proposal.windows.map((w) => (
            <Chip
              key={w.id}
              label={formatWindow(w.start)}
              active={windowVotes.includes(w.id)}
              onClick={() => {
                setNoneWork(false);
                setWindowVotes((prev) => toggle(prev, w.id));
              }}
            />
          ))}
          <Chip
            label="None of these work"
            active={noneWork}
            onClick={() => {
              setNoneWork((n) => !n);
              setWindowVotes([]);
            }}
          />
        </div>
      </Section>

      <PrimaryButton
        label="Send my side →"
        onClick={submit}
        disabled={missing.length > 0}
        hint={
          missing.length > 0 ? `Still needed: ${missing.join(", ")}` : undefined
        }
      />
    </div>
  );
}
