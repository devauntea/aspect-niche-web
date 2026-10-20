"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CLUSTER_GLYPHS,
  CLUSTERS,
  HOBBY_GLYPHS,
  KIT_STROKE,
  TAG_LABELS,
  type Glyph,
} from "./catalogue";
import { MAP, MAP_HEIGHT, MAP_WIDTH } from "./mapLayout";
import { onFirstView, useReducedMotion } from "./useReducedMotion";

// The map: the app's real catalogue, as a sky you can light up.
//
// This is the onboarding mechanic from the app — pick the clusters that pull
// at you, and the hobbies around them appear, linked to every cluster they
// belong to — run against the same 47 hobbies and 11 clusters the app ships.
// Tapping a hobby opens the facts its card in the app leads with.
//
// Nothing here is stored. It is a preview of a mechanic, and choosing a hobby
// on a web page must never mean anything to anyone's real collection.
//
// Accessibility: every star and every hub is a real button; hidden stars are
// taken out of the tab order; the card announces what was picked; and the
// whole thing works from the cluster checkboxes and the hobby list alone.

const STARTING_CLUSTERS = ["creative", "outdoor", "culinary"];

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

function GlyphMark({
  glyph,
  size = 20,
}: {
  glyph: Glyph | undefined;
  size?: number;
}) {
  if (!glyph) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="-12 -12 24 24"
      aria-hidden="true"
      className="glyph"
    >
      <path
        d={glyph.d}
        fill="none"
        stroke="currentColor"
        strokeWidth={KIT_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {glyph.dots.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="currentColor" />
      ))}
    </svg>
  );
}

export default function HobbyMap() {
  const reduced = useReducedMotion();
  const [picked, setPicked] = useState<Set<string>>(
    () => new Set(STARTING_CLUSTERS),
  );
  const [focus, setFocus] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  // The map builds itself the first time it comes into view; until then, and
  // without script, it is simply drawn.
  const [built, setBuilt] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || reduced) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.6) return;
    setBuilt(false);
    // Watch the visible frame, not the map inside it: on a phone the map is
    // wider than the screen and could never be a third on screen.
    return onFirstView(scrollerRef.current ?? el, () => setBuilt(true), 0.35);
  }, [reduced]);

  // On a narrow screen the map is wider than the screen and scrolls sideways;
  // start it centred.
  useEffect(() => {
    const s = scrollerRef.current;
    if (s && s.scrollWidth > s.clientWidth)
      s.scrollLeft = (s.scrollWidth - s.clientWidth) / 2;
  }, []);

  const visible = useMemo(
    () =>
      new Set(
        MAP.stars
          .filter((s) => s.clusterIds.some((c) => picked.has(c)))
          .map((s) => s.hobby.id),
      ),
    [picked],
  );

  // A focused hobby whose clusters were all switched off is let go.
  const focused =
    focus && visible.has(focus)
      ? MAP.stars.find((s) => s.hobby.id === focus)!
      : null;
  const lit = hover ?? focused?.hobby.id ?? null;

  const toggleCluster = (id: string) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const surprise = () => {
    // From what is on the map, or from everything if the map is empty — in
    // which case the hobby's first cluster is switched on so it can be seen.
    const pool = MAP.stars.filter(
      (s) =>
        (visible.size ? visible.has(s.hobby.id) : true) && s.hobby.id !== focus,
    );
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (!visible.has(pick.hobby.id))
      setPicked((prev) => new Set(prev).add(pick.clusterIds[0]));
    setFocus(pick.hobby.id);
    document
      .getElementById(`star-${pick.hobby.id}`)
      ?.focus({ preventScroll: true });
  };

  const clusterCount = picked.size;

  return (
    <section
      className="map-section"
      id="map"
      aria-labelledby="map-title"
      ref={sectionRef}
    >
      <div className="container map-head">
        <h2 id="map-title">
          Forty-seven hobbies, linked by what they have in&nbsp;common.
        </h2>
        <p>
          This is the app&rsquo;s real catalogue. Pick what pulls at you and
          watch the map light up, then tap any hobby to see what it really
          takes.
        </p>
      </div>

      <div className="container">
        <fieldset className="cluster-picker">
          <legend>Pick what pulls at you</legend>
          <div className="cluster-chips">
            {CLUSTERS.map((c) => (
              <label
                key={c.id}
                className="cluster-chip"
                style={{ "--hue": c.hue } as React.CSSProperties}
              >
                <input
                  type="checkbox"
                  checked={picked.has(c.id)}
                  onChange={() => toggleCluster(c.id)}
                />
                <GlyphMark glyph={CLUSTER_GLYPHS[c.id]} size={18} />
                <span>{c.label}</span>
                <small>{c.hobbyIds.length}</small>
              </label>
            ))}
          </div>
          <p className="map-count" aria-live="polite">
            {visible.size === 0
              ? "Pick a cluster to start your map."
              : `${visible.size} ${visible.size === 1 ? "hobby" : "hobbies"} across ${clusterCount} ${clusterCount === 1 ? "cluster" : "clusters"}.`}
          </p>
        </fieldset>
      </div>

      <div className="container map-stage">
        <div className="sky-scroller" ref={scrollerRef}>
          <div
            className="sky-map"
            data-built={built}
            data-lit={lit ? "true" : "false"}
            style={{ aspectRatio: `${MAP_WIDTH} / ${MAP_HEIGHT}` }}
          >
            <svg
              className="sky-links"
              viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {MAP.stars.flatMap((s, si) =>
                s.clusterIds.map((cid) => {
                  const hub = MAP.hubs.find((h) => h.cluster.id === cid)!;
                  const on = picked.has(cid);
                  return (
                    <line
                      key={`${s.hobby.id}-${cid}`}
                      x1={hub.x}
                      y1={hub.y}
                      x2={s.x}
                      y2={s.y}
                      pathLength={1}
                      stroke={hub.cluster.hue}
                      className={`link${on ? " on" : ""}${lit === s.hobby.id ? " lit" : ""}`}
                      style={{ "--i": si % 12 } as React.CSSProperties}
                    />
                  );
                }),
              )}
            </svg>

            {MAP.hubs.map((h) => {
              const on = picked.has(h.cluster.id);
              return (
                <button
                  key={h.cluster.id}
                  type="button"
                  className={`hub${on ? " on" : ""}`}
                  style={
                    {
                      left: pct(h.x, MAP_WIDTH),
                      top: pct(h.y, MAP_HEIGHT),
                      "--hue": h.cluster.hue,
                    } as React.CSSProperties
                  }
                  aria-pressed={on}
                  aria-label={`${h.cluster.label} cluster, ${h.cluster.hobbyIds.length} hobbies`}
                  onClick={() => toggleCluster(h.cluster.id)}
                >
                  <span className="hub-orb">
                    <GlyphMark glyph={CLUSTER_GLYPHS[h.cluster.id]} size={22} />
                  </span>
                  <span className="hub-label">{h.cluster.label}</span>
                </button>
              );
            })}

            {MAP.stars.map((s, i) => {
              const on = visible.has(s.hobby.id);
              const hue = CLUSTERS.find((c) => c.id === s.clusterIds[0])!.hue;
              return (
                <button
                  key={s.hobby.id}
                  id={`star-${s.hobby.id}`}
                  type="button"
                  className={`star${on ? " on" : ""}${focused?.hobby.id === s.hobby.id ? " focused" : ""}`}
                  style={
                    {
                      left: pct(s.x, MAP_WIDTH),
                      top: pct(s.y, MAP_HEIGHT),
                      "--hue": hue,
                      "--i": i % 12,
                    } as React.CSSProperties
                  }
                  tabIndex={on ? 0 : -1}
                  aria-hidden={!on}
                  aria-pressed={focused?.hobby.id === s.hobby.id}
                  onClick={() => setFocus(s.hobby.id)}
                  onPointerEnter={() => setHover(s.hobby.id)}
                  onPointerLeave={() => setHover(null)}
                  onFocus={() => setHover(s.hobby.id)}
                  onBlur={() => setHover(null)}
                >
                  <span className="star-orb">
                    <GlyphMark glyph={HOBBY_GLYPHS[s.hobby.id]} size={18} />
                  </span>
                  <span className="star-label">{s.hobby.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        <p className="sky-hint">Drag sideways to see the whole map.</p>

        <aside className="hobby-card" aria-labelledby="hobby-card-title">
          <div aria-live="polite" aria-atomic="true">
            {focused ? (
              <>
                <h3 id="hobby-card-title" className="voice">
                  {focused.hobby.label}
                </h3>
                <ul className="hobby-clusters" aria-label="Clusters">
                  {focused.clusterIds.map((cid) => {
                    const c = CLUSTERS.find((x) => x.id === cid)!;
                    return (
                      <li
                        key={cid}
                        style={{ "--hue": c.hue } as React.CSSProperties}
                      >
                        {c.label}
                      </li>
                    );
                  })}
                </ul>
                <p className="hobby-blurb">{focused.hobby.blurb}</p>
                <dl className="hobby-facts">
                  <div>
                    <dt>Where</dt>
                    <dd>
                      {TAG_LABELS.environment[focused.hobby.tags.environment]}
                    </dd>
                  </div>
                  <div>
                    <dt>Pace</dt>
                    <dd>
                      {
                        TAG_LABELS.timeCommitment[
                          focused.hobby.tags.timeCommitment
                        ]
                      }
                    </dd>
                  </div>
                  <div>
                    <dt>Level</dt>
                    <dd>
                      {TAG_LABELS.difficulty[focused.hobby.tags.difficulty]}
                    </dd>
                  </div>
                  <div>
                    <dt>Company</dt>
                    <dd>{TAG_LABELS.social[focused.hobby.tags.social]}</dd>
                  </div>
                  <div>
                    <dt>Outlay</dt>
                    <dd>{TAG_LABELS.cost[focused.hobby.tags.cost]}</dd>
                  </div>
                </dl>
                {focused.hobby.tip && (
                  <p className="hobby-tip">
                    <strong>A first step.</strong> {focused.hobby.tip}
                  </p>
                )}
              </>
            ) : (
              <>
                <h3 id="hobby-card-title">Where will you go first?</h3>
                <p className="hobby-blurb">
                  Tap a hobby on the map to see what it really takes: where it
                  happens, how often, how hard it is to start, and what it
                  costs.
                </p>
              </>
            )}
          </div>
          <div className="hobby-card-actions">
            <button type="button" className="btn btn-quiet" onClick={surprise}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <path
                  d="M1.5 4.5h2.2c1.4 0 2.3.6 3.1 1.8l2.4 3.4c.8 1.2 1.7 1.8 3.1 1.8h2.2M12.5 9.5l2 2-2 2M1.5 11.5h2.2c.9 0 1.6-.3 2.2-.8M9.6 5.3c.6-.5 1.3-.8 2.2-.8h2.7M12.5 2.5l2 2-2 2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Surprise me
            </button>
            {focused && (
              <button
                type="button"
                className="text-button"
                onClick={() => setFocus(null)}
              >
                Clear
              </button>
            )}
          </div>
          <p className="hobby-card-note">
            From the app&rsquo;s catalogue. In the app, each card goes on to a
            plan for your first session and places nearby.
          </p>
        </aside>
      </div>
    </section>
  );
}
