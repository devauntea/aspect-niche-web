"use client";

// Plan a Date — a full-screen mode with its own warm evening theme, so it
// reads as an occasion, not another graph screen. All persistence goes
// through PlanStore (localStorage today, real backend later, same contract).

import { useEffect, useState } from "react";
import { dateTheme } from "@/lib/theme";
import {
  localPlanStore,
  newPlanId,
  type DatePlan,
  type GuestResponse,
} from "@/lib/plan/store";
import DraftStep from "./DraftStep";
import GuestStep from "./GuestStep";
import MergedStep from "./MergedStep";
import { GhostButton, PrimaryButton } from "./ui";

interface Props {
  onExit: () => void;
}

type View =
  | { kind: "loading" }
  | { kind: "resume"; existing: DatePlan }
  | { kind: "draft" }
  | { kind: "invite" }
  | { kind: "guest" }
  | { kind: "merged" }
  | { kind: "error"; message: string };

const store = localPlanStore;

function emptyPlan(): DatePlan {
  return {
    id: newPlanId(),
    createdAt: Date.now(),
    status: "draft",
    inviter: { name: "", interestIds: [] },
    proposal: {
      activityIds: [],
      budget: { min: 20, max: 80 },
      dinnerOptionIds: [],
      windows: [],
    },
  };
}

function viewForStatus(plan: DatePlan): View {
  if (plan.status === "draft") return { kind: "draft" };
  if (plan.status === "invited") return { kind: "invite" };
  return { kind: "merged" };
}

const STEPS = ["Your side", "Invite", "Their side", "The plan"];

function stepIndex(view: View): number {
  switch (view.kind) {
    case "draft":
      return 0;
    case "invite":
      return 1;
    case "guest":
      return 2;
    case "merged":
      return 3;
    default:
      return 0;
  }
}

export default function PlanADateMode({ onExit }: Props) {
  const [plan, setPlan] = useState<DatePlan>(emptyPlan);
  const [view, setView] = useState<View>({ kind: "loading" });

  // Resume the latest plan on this device, if any
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const id = await store.latestId();
        const existing = id ? await store.get(id) : null;
        if (cancelled) return;
        if (existing) setView({ kind: "resume", existing });
        else setView({ kind: "draft" });
      } catch {
        if (!cancelled)
          setView({ kind: "error", message: "Couldn't load saved plans." });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function persist(next: DatePlan, nextView: View) {
    setPlan(next);
    setView(nextView);
    try {
      await store.save(next);
    } catch {
      setView({
        kind: "error",
        message: "Couldn't save the plan on this device.",
      });
    }
  }

  const showSteps =
    view.kind === "draft" ||
    view.kind === "invite" ||
    view.kind === "guest" ||
    view.kind === "merged";

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: dateTheme.bg }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "28px 20px 80px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {/* Mode header */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 26,
                color: dateTheme.text,
                margin: 0,
                letterSpacing: "0.01em",
              }}
            >
              Plan a date
            </h1>
            <p
              style={{
                fontSize: 12,
                color: dateTheme.textFaint,
                margin: "2px 0 0",
              }}
            >
              {showSteps && plan.inviter.name
                ? `Plan ${plan.id}`
                : "Two sides, one plan"}
            </p>
          </div>
          <button
            onClick={onExit}
            title="Back to exploring"
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              border: `1px solid ${dateTheme.border}`,
              background: dateTheme.panelBg,
              color: dateTheme.textDim,
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            ×
          </button>
        </header>

        {/* Progress */}
        {showSteps && (
          <div style={{ display: "flex", gap: 6 }}>
            {STEPS.map((label, i) => {
              const active = i === stepIndex(view);
              const done = i < stepIndex(view);
              return (
                <div key={label} style={{ flex: 1, textAlign: "center" }}>
                  <div
                    style={{
                      height: 4,
                      borderRadius: 2,
                      background: done
                        ? dateTheme.gold
                        : active
                          ? dateTheme.accent
                          : "rgba(255,255,255,0.12)",
                      boxShadow: active
                        ? `0 0 10px ${dateTheme.accent}80`
                        : "none",
                      transition: "all 0.3s ease",
                    }}
                  />
                  <p
                    style={{
                      fontSize: 10,
                      marginTop: 6,
                      color: active
                        ? dateTheme.text
                        : done
                          ? dateTheme.gold
                          : dateTheme.textFaint,
                      fontWeight: active ? 700 : 500,
                    }}
                  >
                    {label}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Body panel */}
        <main
          style={{
            background: dateTheme.panelBg,
            border: `1px solid ${dateTheme.panelBorder}`,
            borderRadius: 20,
            padding: 24,
            backdropFilter: "blur(10px)",
            boxShadow: "0 12px 48px rgba(0,0,0,0.45)",
          }}
        >
          {view.kind === "loading" && (
            <p
              style={{
                textAlign: "center",
                color: dateTheme.textDim,
                fontSize: 14,
                padding: "40px 0",
              }}
            >
              Setting the mood…
            </p>
          )}

          {view.kind === "error" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                alignItems: "center",
                padding: "24px 0",
              }}
            >
              <p style={{ color: dateTheme.text, fontSize: 14, margin: 0 }}>
                {view.message}
              </p>
              <PrimaryButton
                label="Start a fresh plan"
                onClick={() => {
                  setPlan(emptyPlan());
                  setView({ kind: "draft" });
                }}
              />
            </div>
          )}

          {view.kind === "resume" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p style={{ color: dateTheme.text, fontSize: 15, margin: 0 }}>
                You have a plan in progress
                {view.existing.inviter.name
                  ? ` (${view.existing.inviter.name}${
                      view.existing.guest?.name
                        ? ` + ${view.existing.guest.name}`
                        : ""
                    })`
                  : ""}
                .
              </p>
              <PrimaryButton
                label="Pick up where you left off"
                onClick={() => {
                  setPlan(view.existing);
                  setView(viewForStatus(view.existing));
                }}
              />
              <GhostButton
                label="Start over with a fresh plan"
                onClick={() => {
                  setPlan(emptyPlan());
                  setView({ kind: "draft" });
                }}
              />
            </div>
          )}

          {view.kind === "draft" && (
            <DraftStep
              plan={plan}
              onSubmit={(updates) =>
                persist(
                  { ...plan, ...updates, status: "invited" },
                  { kind: "invite" },
                )
              }
            />
          )}

          {view.kind === "invite" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <p
                  style={{
                    fontSize: 15,
                    color: dateTheme.text,
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  Your invite is ready, {plan.inviter.name}.
                </p>
                <p
                  style={{
                    fontFamily: "Georgia, serif",
                    fontSize: 30,
                    color: dateTheme.gold,
                    margin: "12px 0",
                    letterSpacing: "0.06em",
                  }}
                >
                  {plan.id}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: dateTheme.textDim,
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  With a shared backend this becomes a link you text them. For
                  now, hand this device over — their answers stay separate from
                  yours.
                </p>
              </div>
              <PrimaryButton
                label="They're here — continue as your date →"
                onClick={() => setView({ kind: "guest" })}
              />
              <GhostButton
                label="← Back to edit your side"
                onClick={() => setView({ kind: "draft" })}
              />
            </div>
          )}

          {view.kind === "guest" && (
            <GuestStep
              plan={plan}
              onSubmit={(guest, response: GuestResponse) =>
                persist(
                  { ...plan, guest, response, status: "merged" },
                  { kind: "merged" },
                )
              }
            />
          )}

          {view.kind === "merged" && plan.guest && plan.response && (
            <MergedStep
              plan={plan}
              onResolve={(resolutions) =>
                persist({ ...plan, resolutions }, { kind: "merged" })
              }
            />
          )}

          {view.kind === "merged" && (!plan.guest || !plan.response) && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                alignItems: "center",
                padding: "24px 0",
              }}
            >
              <p style={{ color: dateTheme.text, fontSize: 14, margin: 0 }}>
                This plan is missing your date&apos;s side.
              </p>
              <PrimaryButton
                label="Collect their answers"
                onClick={() => setView({ kind: "guest" })}
              />
            </div>
          )}
        </main>

        {view.kind === "merged" && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <GhostButton label="Done — back to exploring" onClick={onExit} />
          </div>
        )}
      </div>
    </div>
  );
}
