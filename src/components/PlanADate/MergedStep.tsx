"use client";

// The merged plan: interest-overlap constellation on top, then the agreed
// activity / dinner / budget / time. Conflicts are shown inline with tap-to-
// resolve options (no dead ends), and the finished plan exports to both
// people's calendars through the Track C CalendarService.

import { activities } from "@/data/activities";
import { dinnerLabel, dinnerOptions } from "@/data/dinnerOptions";
import { dateTheme } from "@/lib/theme";
import { resolvedPlan } from "@/lib/plan/merge";
import type { DatePlan } from "@/lib/plan/store";
import {
  localCalendarService,
  type CalendarEvent,
} from "@/lib/calendar/service";
import { mapsSearchUrl } from "@/lib/maps";
import OverlapGraph from "./OverlapGraph";
import { Chip, Section, formatWindow } from "./ui";

interface Props {
  plan: DatePlan;
  onResolve: (resolutions: NonNullable<DatePlan["resolutions"]>) => void;
}

const DATE_DURATION_MIN = 180; // activity + dinner

function downloadIcs(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function Row({
  label,
  value,
  conflict,
  children,
}: {
  label: string;
  value: string | null;
  conflict?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: "12px 16px",
        borderRadius: 14,
        background: dateTheme.inputBg,
        border: `1px solid ${conflict ? dateTheme.accent : dateTheme.border}`,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 12,
        }}
      >
        <span
          style={{
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: 700,
            color: conflict ? dateTheme.accent : dateTheme.gold,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: value ? dateTheme.text : dateTheme.textFaint,
            textAlign: "right",
          }}
        >
          {value ?? "Not settled yet"}
        </span>
      </div>
      {children}
    </div>
  );
}

export default function MergedStep({ plan, onResolve }: Props) {
  const merged = resolvedPlan(plan);
  const guest = plan.guest!;

  const activity = merged.activityId
    ? activities.find((a) => a.id === merged.activityId)
    : null;
  const windowStart = merged.windowId
    ? plan.proposal.windows.find((w) => w.id === merged.windowId)?.start
    : null;

  const settled =
    !!merged.activityId &&
    !!merged.dinnerId &&
    !!merged.budget &&
    !!windowStart;

  function buildEvent(forInviter: boolean): CalendarEvent | null {
    if (!settled || !windowStart || !activity) return null;
    const start = new Date(windowStart);
    const end = new Date(start.getTime() + DATE_DURATION_MIN * 60_000);
    const other = forInviter ? guest : plan.inviter;
    const self = forInviter ? plan.inviter : guest;
    return {
      title: `Date: ${activity.label} + ${dinnerLabel(merged.dinnerId!)}`,
      description:
        `${plan.inviter.name} + ${guest.name}\n` +
        `Activity: ${activity.label}\n` +
        `Dinner: ${dinnerLabel(merged.dinnerId!)}\n` +
        `Budget: $${merged.budget!.min}–$${merged.budget!.max} per person\n\n` +
        `Find a spot: ${mapsSearchUrl(activity.label)}`,
      location: mapsSearchUrl(activity.label),
      start,
      end,
      organizer: self.email
        ? { email: self.email, name: self.name }
        : undefined,
      guests: other.email
        ? [{ email: other.email, name: other.name }]
        : undefined,
    };
  }

  function calendarButtons(forInviter: boolean) {
    const person = forInviter ? plan.inviter : guest;
    const event = buildEvent(forInviter);
    const btn: React.CSSProperties = {
      flex: 1,
      height: 40,
      borderRadius: 999,
      border: `1.5px solid ${dateTheme.gold}55`,
      background: "transparent",
      color: dateTheme.gold,
      fontSize: 12,
      fontWeight: 700,
      cursor: "pointer",
      transition: "background 0.15s",
    };
    return (
      <div
        key={person.name}
        style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}
      >
        <p style={{ fontSize: 12, color: dateTheme.textDim, margin: 0 }}>
          {person.name}&apos;s calendar
          {!person.email && (
            <span style={{ color: dateTheme.textFaint }}>
              {" "}
              (no email — event has no attendee)
            </span>
          )}
        </p>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            style={btn}
            onClick={() => {
              if (!event) return;
              window.open(
                localCalendarService.createEventLinks(event).googleUrl,
                "_blank",
              );
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = dateTheme.goldSoft)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            Google ↗
          </button>
          <button
            style={btn}
            onClick={() => {
              if (!event) return;
              const { ics } = localCalendarService.createEventLinks(event);
              downloadIcs(ics.filename, ics.content);
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = dateTheme.goldSoft)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            Apple / .ics ↓
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <Section
        title="Where you overlap"
        hint="Shared interests glow gold — the date grows out of them."
      >
        <div
          style={{
            borderRadius: 16,
            border: `1px solid ${dateTheme.border}`,
            background: "rgba(0,0,0,0.25)",
            padding: 8,
          }}
        >
          <OverlapGraph
            inviterName={plan.inviter.name}
            guestName={guest.name}
            sharedIds={merged.sharedInterestIds}
            inviterOnlyIds={merged.inviterOnlyIds}
            guestOnlyIds={merged.guestOnlyIds}
          />
        </div>
      </Section>

      <Section title="The plan">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Row
            label="Activity"
            value={activity?.label ?? null}
            conflict={merged.activityNote === "needs-pick"}
          >
            {merged.activityNote === "both-in" && (
              <p style={{ fontSize: 12, color: dateTheme.textDim, margin: 0 }}>
                {guest.name} loved this one.
              </p>
            )}
            {merged.activityNote === "shared-interest" && (
              <p style={{ fontSize: 12, color: dateTheme.textDim, margin: 0 }}>
                Picked from an interest you share.
              </p>
            )}
            {merged.activityNote === "needs-pick" && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {plan.proposal.activityIds.map((id) => (
                  <Chip
                    key={id}
                    label={activities.find((a) => a.id === id)?.label ?? id}
                    active={merged.activityId === id}
                    onClick={() =>
                      onResolve({ ...plan.resolutions, activityId: id })
                    }
                  />
                ))}
              </div>
            )}
          </Row>

          <Row
            label="Dinner"
            value={merged.dinnerId ? dinnerLabel(merged.dinnerId) : null}
            conflict={merged.dinnerConflict}
          >
            {merged.dinnerConflict && (
              <>
                <p
                  style={{ fontSize: 12, color: dateTheme.textDim, margin: 0 }}
                >
                  No overlap in food votes — pick a compromise:
                </p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[
                    ...new Set([
                      ...plan.proposal.dinnerOptionIds,
                      ...(plan.response?.dinnerVotes ?? []),
                    ]),
                  ].map((id) => (
                    <Chip
                      key={id}
                      label={
                        dinnerOptions.find((o) => o.id === id)
                          ? dinnerLabel(id)
                          : id
                      }
                      active={false}
                      onClick={() =>
                        onResolve({ ...plan.resolutions, dinnerId: id })
                      }
                      tone="gold"
                    />
                  ))}
                </div>
              </>
            )}
          </Row>

          <Row
            label="Budget"
            value={
              merged.budget
                ? `$${merged.budget.min} – $${merged.budget.max} each`
                : null
            }
            conflict={merged.budgetConflict}
          >
            {merged.budgetConflict && (
              <>
                <p
                  style={{ fontSize: 12, color: dateTheme.textDim, margin: 0 }}
                >
                  Your ranges don&apos;t overlap — meet in the middle?
                </p>
                <Chip
                  label={(() => {
                    const a = plan.proposal.budget;
                    const b = plan.response!.budget;
                    const lo = Math.min(a.max, b.max);
                    const hi = Math.max(a.min, b.min);
                    return `Split it: $${lo} – $${hi} each`;
                  })()}
                  active={false}
                  onClick={() => {
                    const a = plan.proposal.budget;
                    const b = plan.response!.budget;
                    onResolve({
                      ...plan.resolutions,
                      budget: {
                        min: Math.min(a.max, b.max),
                        max: Math.max(a.min, b.min),
                      },
                    });
                  }}
                  tone="gold"
                />
              </>
            )}
          </Row>

          <Row
            label="When"
            value={windowStart ? formatWindow(windowStart) : null}
            conflict={merged.timeConflict}
          >
            {merged.timeConflict && (
              <>
                <p
                  style={{ fontSize: 12, color: dateTheme.textDim, margin: 0 }}
                >
                  None of the proposed times worked — pick one to suggest
                  anyway:
                </p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {plan.proposal.windows.map((w) => (
                    <Chip
                      key={w.id}
                      label={formatWindow(w.start)}
                      active={false}
                      onClick={() =>
                        onResolve({ ...plan.resolutions, windowId: w.id })
                      }
                    />
                  ))}
                </div>
              </>
            )}
          </Row>
        </div>
      </Section>

      {settled ? (
        <Section
          title="Put it on both calendars"
          hint="Each side gets the full plan; add the other person's email in their step to make it a real invite."
        >
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {calendarButtons(true)}
            {calendarButtons(false)}
          </div>
        </Section>
      ) : (
        <p
          style={{
            fontSize: 13,
            color: dateTheme.textDim,
            textAlign: "center",
            margin: 0,
          }}
        >
          Settle the highlighted items above to unlock the calendar buttons.
        </p>
      )}
    </div>
  );
}
