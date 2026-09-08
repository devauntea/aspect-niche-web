"use client";

import React from "react";
import type { Category } from "@/lib/themes";
import { DEFAULT_ICON_SET, type IconSetId } from "@/lib/iconSet";
import {
  FILES_BOX,
  FILES_DOCUMENT,
  FILES_FOLDER,
  FILES_STROKE,
  KIT_CATEGORY_GLYPHS,
  KIT_HOBBY_GLYPHS,
  KIT_STROKE,
  type KitGlyph,
} from "@/graph/iconKits";
import {
  CLEAN_GLYPH,
  CLEAN_TILE,
  CLEAN_TILE_RECT,
  CURVE_BOX,
  CURVE_CATEGORY_GLYPHS,
  CURVE_HOBBY_GLYPHS,
  CURVE_STROKE,
  RETRO_ACCENT,
  RETRO_CONSOLE,
  RETRO_DARK,
  RETRO_GLYPH,
  RETRO_HANDHELD,
  RETRO_METAL,
  RETRO_PLAYER,
  RETRO_PLAYERS,
  RETRO_STROKE,
  type CurveGlyph,
} from "@/graph/curveKits";
import {
  GALLERY_DROP,
  GALLERY_GLYPH,
  GALLERY_PIGMENT,
  GALLERY_STROKE,
  POCKET_CAMERA,
  POCKET_CAMERA_BODY,
  POCKET_GLASS,
  POCKET_GLYPH,
  POCKET_JEWEL,
  POCKET_LCD,
  POCKET_PLAYER,
  POCKET_PLAYERS,
  POCKET_SHELL,
  POCKET_SILVER,
  POCKET_STATUS,
  POCKET_STROKE,
} from "@/graph/themeKits";

// Draws a hobby's mark in whichever icon set is in use. graph/iconKits.ts holds
// the angular supplied kits and graph/curveKits.ts the curved ones.
//
// The mark is identity only — it says which hobby this is and nothing else.
// Collected state is stated in words on the row that holds it, so tinting the
// mark as well would be the third signal for one fact, and in Collection, where
// every entry is collected, it would say nothing at all.

type Props = {
  id: string;
  /** Cluster, used only to pick the fallback glyph. */
  category: Category;
  hue: string;
  /** Sizing handle, kept from the old sigil so call sites did not have to move. */
  R: number;
  /**
   * Engraved themes draw a finer line. On mobile this came off the theme
   * object; here it is a prop, because the two apps' theme shapes differ and
   * the mark only ever needed the one bit.
   */
  engraved?: boolean;
  /**
   * Forces a set instead of taking the user's. Only the specimen previews in
   * Settings and Studio pass this, so that a row can show a set you are not
   * currently using.
   */
  iconSet?: IconSetId;
};

/** Glyphs are drawn on a box running -12..12, with art inside ±10. */
const GLYPH_BOX = 12;
/** Multiples of R the mark fills, matched to the viewBoxes callers already use. */
const FOOTPRINT = 3.1;
/**
 * The Files carriers are drawn with their own margin inside the 80-unit box —
 * the sheet spans about 60% of it, where a line glyph spans 85% — so dropped
 * straight in they read a size smaller than the other two sets beside them.
 * This is optical sizing, not a redrawing: the artwork is untouched.
 */
const FILES_OPTICAL = 1.3;

/**
 * Maps a carrier drawn on a kit's own 0..80 box onto the -12..12 box every
 * call site already sizes for. `optical` shrinks the carrier inside that box
 * without redrawing it, for the kits whose artwork carries its own margin.
 */
function carrierTransform(box: number, optical: number): string {
  const scale = ((2 * GLYPH_BOX) / box) * optical;
  const inset = (box / 2) * (1 / optical - 1);
  return `translate(${-GLYPH_BOX},${-GLYPH_BOX}) scale(${scale}) translate(${inset},${inset})`;
}

/** True when the id is a cluster rather than a hobby. */
function kitGlyphFor(id: string, category: Category): [KitGlyph, boolean] {
  const hobby = KIT_HOBBY_GLYPHS[id];
  if (hobby) return [hobby, false];
  return [KIT_CATEGORY_GLYPHS[category] ?? KIT_CATEGORY_GLYPHS.mind, true];
}

/** Line art with lit vertices, stroked in the theme's hue. */
function StrokedGlyph({
  d,
  dots,
  stroke,
  strokeWidth,
}: {
  d?: string;
  dots?: [number, number, number][];
  stroke: string;
  strokeWidth: number;
}) {
  return (
    <>
      {d && (
        <path
          d={d}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {dots?.map(([cx, cy, r], i) => (
        <circle key={`d${i}`} cx={cx} cy={cy} r={r} fill={stroke} />
      ))}
    </>
  );
}

/**
 * The Files set: a blue folder for a cluster, a sheet of paper for a hobby,
 * with the pictogram set into it.
 *
 * This one set ignores `hue` and the theme entirely. Its whole proposition is
 * the file browser's own colours, and a folder recoloured per cluster stops
 * reading as a folder. Everything else about the mark still comes from the
 * theme, because the carrier is the only thing this set paints.
 *
 * The gradients need ids unique within the rendered document, and a screen can
 * hold sixty of these, so the id carries the mark's own id.
 */
function FilesMark({
  id,
  glyph,
  isCluster,
}: {
  id: string;
  glyph: KitGlyph;
  isCluster: boolean;
}) {
  const carrier = isCluster ? FILES_FOLDER : FILES_DOCUMENT;
  const gid = `fk-${id}`;
  const d = glyph.filesD ?? glyph.d;
  const dots = glyph.filesDots ?? glyph.dots;

  return (
    <g transform={carrierTransform(FILES_BOX, FILES_OPTICAL)}>
      {isCluster ? (
        <>
          <defs>
            <linearGradient id={`${gid}-back`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={FILES_FOLDER.backTop} />
              <stop offset="1" stopColor={FILES_FOLDER.backBottom} />
            </linearGradient>
            <linearGradient id={`${gid}-front`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={FILES_FOLDER.frontTop} />
              <stop offset="1" stopColor={FILES_FOLDER.frontBottom} />
            </linearGradient>
          </defs>
          <path d={FILES_FOLDER.back} fill={`url(#${gid}-back)`} />
          <path d={FILES_FOLDER.front} fill={`url(#${gid}-front)`} />
          <path
            d={FILES_FOLDER.lip}
            stroke={FILES_FOLDER.lipStroke}
            strokeOpacity={0.7}
            fill="none"
          />
        </>
      ) : (
        <>
          <defs>
            <linearGradient id={`${gid}-paper`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={FILES_DOCUMENT.paperTop} />
              <stop offset="1" stopColor={FILES_DOCUMENT.paperBottom} />
            </linearGradient>
          </defs>
          <path
            d={FILES_DOCUMENT.shadow}
            fill={FILES_DOCUMENT.shadowFill}
            opacity={0.3}
            transform="translate(1,1.5)"
          />
          <path
            d={FILES_DOCUMENT.sheet}
            fill={`url(#${gid}-paper)`}
            stroke={FILES_DOCUMENT.edge}
            strokeWidth={0.8}
          />
          <path
            d={FILES_DOCUMENT.fold}
            fill={FILES_DOCUMENT.foldFill}
            stroke={FILES_DOCUMENT.foldEdge}
            strokeWidth={0.8}
          />
        </>
      )}
      <g
        transform={`translate(${carrier.glyph.x},${carrier.glyph.y}) scale(${carrier.glyph.scale})`}
      >
        <StrokedGlyph
          d={d}
          dots={dots}
          stroke={carrier.ink}
          strokeWidth={FILES_STROKE}
        />
      </g>
      {!isCluster && (
        <path
          d={FILES_DOCUMENT.rule}
          stroke={FILES_DOCUMENT.ruleStroke}
          strokeWidth={1.4}
          strokeLinecap="round"
          fill="none"
        />
      )}
    </g>
  );
}

/** The curved kits' pictogram: an ordered stack of shapes in one ink. */
function CurveLayers({
  glyph,
  ink,
  strokeWidth,
}: {
  glyph: CurveGlyph;
  ink: string;
  strokeWidth: number;
}) {
  return (
    <>
      {glyph.map((layer, i) => {
        // A layer is painted with the ink or stroked with it, never both. The
        // kits say which by writing fill="none"; the generator keeps that as
        // the absence of `f`.
        const fill = "f" in layer && layer.f ? ink : "none";
        const common = {
          fill,
          stroke: ink,
          strokeWidth,
          strokeLinecap: "round" as const,
          strokeLinejoin: "round" as const,
        };
        if ("p" in layer) return <path key={i} d={layer.p} {...common} />;
        if ("c" in layer) {
          const [cx, cy, r] = layer.c;
          return <circle key={i} cx={cx} cy={cy} r={r} {...common} />;
        }
        if ("r" in layer) {
          const [x, y, w, h, rx] = layer.r;
          return (
            <rect key={i} x={x} y={y} width={w} height={h} rx={rx} {...common} />
          );
        }
        const [cx, cy, rx, ry] = layer.e;
        return (
          <ellipse
            key={i}
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            transform={layer.t ? `rotate(${layer.t})` : undefined}
            {...common}
          />
        );
      })}
    </>
  );
}

/** True when the id is a cluster rather than a hobby, for the curved kits. */
function curveGlyphFor(id: string, category: Category): [CurveGlyph, boolean] {
  const hobby = CURVE_HOBBY_GLYPHS[id];
  if (hobby) return [hobby, false];
  return [CURVE_CATEGORY_GLYPHS[category] ?? CURVE_CATEGORY_GLYPHS.mind, true];
}

/**
 * The Clean set: a coloured tile behind a cluster, and nothing behind a hobby.
 *
 * The asymmetry is the kit's, and it is the right way round. A cluster is a
 * container and reads as one; a hobby is a subject, and forty-seven tiled
 * subjects in a grid become a grid of tiles. Leaving hobbies bare also lets
 * them take the theme's hue, so this set is the colourful one and the
 * theme-following one at the same time.
 */
function CleanMark({
  id,
  glyph,
  category,
  isCluster,
  hue,
}: {
  id: string;
  glyph: CurveGlyph;
  category: Category;
  isCluster: boolean;
  hue: string;
}) {
  if (!isCluster) {
    return <CurveLayers glyph={glyph} ink={hue} strokeWidth={CURVE_STROKE} />;
  }

  const [from, to] = CLEAN_TILE[category] ?? CLEAN_TILE.mind;
  const gid = `ck-${id}`;
  const place = CLEAN_GLYPH.category;
  return (
    <g transform={carrierTransform(CURVE_BOX, 1)}>
      <defs>
        {/* The kit writes x2="1" y2="1": a diagonal, top-left to bottom-right. */}
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <rect
        x={CLEAN_TILE_RECT.x}
        y={CLEAN_TILE_RECT.y}
        width={CLEAN_TILE_RECT.size}
        height={CLEAN_TILE_RECT.size}
        rx={CLEAN_TILE_RECT.radius}
        fill={`url(#${gid})`}
      />
      <g transform={`translate(${place.x},${place.y}) scale(${place.scale})`}>
        <CurveLayers glyph={glyph} ink="#FFFFFF" strokeWidth={CURVE_STROKE} />
      </g>
    </g>
  );
}

/**
 * The Retro set: brushed metal with the pictogram lit on a screen inside it.
 *
 * Like Files, this one ignores the theme: the proposition is the object, and a
 * handheld in Gallery's graphite is not a handheld. The accent is the screen's
 * own glow and the kit assigns one per icon rather than one per cluster, so it
 * is looked up by id.
 *
 * Three hobbies are drawn as a pocket player rather than the handheld, which is
 * the kit's decision, detected by the generator and read from a list here.
 */
function RetroMark({
  id,
  glyph,
  isCluster,
  category,
}: {
  id: string;
  glyph: CurveGlyph;
  isCluster: boolean;
  category: Category;
}) {
  const accent = RETRO_ACCENT[id] ?? RETRO_ACCENT[category] ?? RETRO_METAL[0];
  const gid = `rk-${id}`;
  const player = RETRO_PLAYERS.includes(id);
  const place = isCluster
    ? RETRO_GLYPH.category
    : player
      ? RETRO_GLYPH.player
      : RETRO_GLYPH.handheld;

  // Both gradients are declared for every mark rather than per branch: two
  // unused Defs entries cost nothing, and a branch that forgets one paints the
  // casing black.
  const defs = (
    <defs>
      <linearGradient id={`${gid}-m`} x1="0" y1="0" x2="0.9" y2="1">
        <stop offset="0" stopColor={RETRO_METAL[0]} />
        <stop offset="0.4" stopColor={RETRO_METAL[1]} />
        <stop offset="0.65" stopColor={RETRO_METAL[2]} />
        <stop offset="1" stopColor={RETRO_METAL[3]} />
      </linearGradient>
      <linearGradient id={`${gid}-g`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={RETRO_DARK[0]} />
        <stop offset="0.5" stopColor={RETRO_DARK[1]} />
        <stop offset="1" stopColor={RETRO_DARK[2]} />
      </linearGradient>
    </defs>
  );

  const pictogram = (
    <g transform={`translate(${place.x},${place.y}) scale(${place.scale})`}>
      <CurveLayers glyph={glyph} ink={accent} strokeWidth={RETRO_STROKE} />
    </g>
  );

  if (isCluster) {
    const c = RETRO_CONSOLE;
    return (
      <g transform={carrierTransform(CURVE_BOX, 1)}>
        {defs}
        <rect
          x={c.body.x}
          y={c.body.y}
          width={c.body.w}
          height={c.body.h}
          rx={c.body.r}
          fill={`url(#${gid}-g)`}
          stroke={c.bodyStroke}
        />
        <path d={c.gloss} fill={c.glossFill} opacity={0.15} />
        <circle
          cx={c.screen.cx}
          cy={c.screen.cy}
          r={c.screen.r}
          fill={accent}
          fillOpacity={0.12}
          stroke={accent}
          strokeWidth={1.2}
        />
        {pictogram}
        <rect
          x={c.bar.x}
          y={c.bar.y}
          width={c.bar.w}
          height={c.bar.h}
          rx={c.bar.r}
          fill={accent}
        />
      </g>
    );
  }

  if (player) {
    const p = RETRO_PLAYER;
    return (
      <g transform={carrierTransform(CURVE_BOX, 1)}>
        {defs}
        <rect
          x={p.shell.x}
          y={p.shell.y}
          width={p.shell.w}
          height={p.shell.h}
          rx={p.shell.r}
          fill={`url(#${gid}-m)`}
          stroke={p.shellStroke}
        />
        <rect
          x={p.screen.x}
          y={p.screen.y}
          width={p.screen.w}
          height={p.screen.h}
          rx={p.screen.r}
          fill={p.screenFill}
        />
        {pictogram}
        <circle
          cx={p.wheel.cx}
          cy={p.wheel.cy}
          r={p.wheel.r}
          fill={p.wheelFill}
          stroke={p.wheelStroke}
        />
        <circle cx={p.hub.cx} cy={p.hub.cy} r={p.hub.r} fill={p.hubFill} />
        <path
          d={p.keys}
          fill={p.keyFill}
          stroke={p.keyFill}
          strokeWidth={1}
        />
      </g>
    );
  }

  const h = RETRO_HANDHELD;
  return (
    <g transform={carrierTransform(CURVE_BOX, 1)}>
      {defs}
      <rect
        x={h.shell.x}
        y={h.shell.y}
        width={h.shell.w}
        height={h.shell.h}
        rx={h.shell.r}
        fill={`url(#${gid}-m)`}
        stroke={h.shellStroke}
      />
      <rect
        x={h.screen.x}
        y={h.screen.y}
        width={h.screen.w}
        height={h.screen.h}
        rx={h.screen.r}
        fill={h.screenFill}
        stroke={h.screenStroke}
      />
      <path d={h.gloss} fill="#FFFFFF" opacity={0.07} />
      {pictogram}
      <circle cx={h.light.cx} cy={h.light.cy} r={h.light.r} fill={accent} />
      <path
        d={h.speaker}
        stroke={h.speakerStroke}
        strokeWidth={1.2}
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}

/**
 * Maps a carrier already centred on its own box, which is how the Gallery kit
 * draws: everything is wrapped in one translate to the middle, so the art is in
 * -40..40 rather than 0..80 and only needs scaling.
 */
function centredTransform(box: number, optical: number): string {
  return `scale(${((2 * GLYPH_BOX) / box) * optical})`;
}

/**
 * The Paint set: a glossy drop of pigment with the linework cut out of it in
 * paper white.
 *
 * The pigment is assigned per icon from four colours rather than per cluster.
 * That is the kit's decision and it is the right one — four colours across
 * eleven clusters would read as a legend that does not quite work, where a
 * rotation reads as a shelf of paint. It does mean the colour carries no
 * meaning, so nothing in the app should try to read one out of it.
 *
 * Clusters and hobbies are the same drawing here. In this set the mark does not
 * say which is which and the layout has to, which every surface using it
 * already does by labelling every entry.
 */
function GalleryMark({ id, glyph }: { id: string; glyph: CurveGlyph }) {
  const pigment = GALLERY_PIGMENT[id] ?? GALLERY_PIGMENT.mind;
  const gid = `gk-${id}`;

  return (
    <g transform={centredTransform(CURVE_BOX, 1)}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0.75" y2="1">
          <stop offset="0" stopColor={GALLERY_DROP.wash} />
          <stop offset="0.3" stopColor={pigment} />
          <stop offset="0.73" stopColor={pigment} />
          <stop offset="1" stopColor={GALLERY_DROP.shade} />
        </linearGradient>
      </defs>
      <path d={GALLERY_DROP.blob} fill={`url(#${gid})`} />
      {/* The wet highlight. It is what makes the drop read as pigment rather
          than as a coloured circle, and it sits above the blob and below the
          linework so it never washes out the drawing. */}
      <path
        d={GALLERY_DROP.highlight}
        stroke={GALLERY_DROP.highlightStroke}
        strokeOpacity={0.58}
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
      <g transform={`scale(${GALLERY_GLYPH.drop})`}>
        <CurveLayers
          glyph={glyph}
          ink={GALLERY_DROP.ink}
          strokeWidth={GALLERY_STROKE}
        />
      </g>
    </g>
  );
}

/**
 * The Pocket Tech set: smoked glass behind satin silver.
 *
 * One material for every icon, so the hierarchy is carried by the shape of the
 * casing instead of by colour — a rounded shell for a cluster, a round jewel
 * for a hobby. Three hobbies are a pocket player and photography is a camera
 * with no pictogram in it at all, which are the kit's decisions; the generator
 * finds them rather than a list here naming them.
 */
function PocketMark({
  id,
  glyph,
  isCluster,
}: {
  id: string;
  glyph: CurveGlyph;
  isCluster: boolean;
}) {
  const gid = `ptk-${id}`;
  const silver = `url(#${gid}-s)`;
  const glass = `url(#${gid}-b)`;

  const defs = (
    <defs>
      <linearGradient id={`${gid}-s`} x1="0" y1="0" x2="0.8" y2="1">
        <stop offset="0" stopColor={POCKET_SILVER[0]} />
        <stop offset="0.36" stopColor={POCKET_SILVER[1]} />
        <stop offset="0.66" stopColor={POCKET_SILVER[2]} />
        <stop offset="1" stopColor={POCKET_SILVER[3]} />
      </linearGradient>
      <linearGradient id={`${gid}-b`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={POCKET_GLASS[0]} />
        <stop offset="0.48" stopColor={POCKET_GLASS[1]} />
        <stop offset="1" stopColor={POCKET_GLASS[2]} />
      </linearGradient>
      <linearGradient id={`${gid}-l`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={POCKET_LCD[0]} />
        <stop offset="1" stopColor={POCKET_LCD[1]} />
      </linearGradient>
    </defs>
  );

  if (POCKET_CAMERA.includes(id)) {
    const c = POCKET_CAMERA_BODY;
    return (
      <g transform={carrierTransform(CURVE_BOX, 1)}>
        {defs}
        <path d={c.shell} fill={silver} stroke={c.shellStroke} strokeWidth={0.7} />
        <rect
          x={c.back.x}
          y={c.back.y}
          width={c.back.w}
          height={c.back.h}
          rx={c.back.r}
          fill={glass}
        />
        <circle cx={c.barrel.cx} cy={c.barrel.cy} r={c.barrel.r} fill={silver} />
        <circle cx={c.glass.cx} cy={c.glass.cy} r={c.glass.r} fill={c.glassFill} />
        <circle cx={c.iris.cx} cy={c.iris.cy} r={c.iris.r} fill={c.irisFill} />
        <path
          d={c.catchlight}
          stroke={c.catchlightStroke}
          strokeWidth={2}
          strokeLinecap="round"
          fill="none"
        />
        <rect
          x={c.flash.x}
          y={c.flash.y}
          width={c.flash.w}
          height={c.flash.h}
          rx={c.flash.r}
          fill={c.flashFill}
        />
      </g>
    );
  }

  if (POCKET_PLAYERS.includes(id)) {
    const p = POCKET_PLAYER;
    return (
      <g transform={carrierTransform(CURVE_BOX, 1)}>
        {defs}
        <rect
          x={p.shell.x}
          y={p.shell.y}
          width={p.shell.w}
          height={p.shell.h}
          rx={p.shell.r}
          fill={silver}
          stroke={p.shellStroke}
          strokeWidth={0.7}
        />
        <rect
          x={p.screen.x}
          y={p.screen.y}
          width={p.screen.w}
          height={p.screen.h}
          rx={p.screen.r}
          fill={`url(#${gid}-l)`}
        />
        <g
          transform={`translate(${POCKET_GLYPH.player.x},${POCKET_GLYPH.player.y}) scale(${POCKET_GLYPH.player.scale})`}
        >
          <CurveLayers glyph={glyph} ink={p.ink} strokeWidth={1.5} />
        </g>
        <circle cx={p.wheel.cx} cy={p.wheel.cy} r={p.wheel.r} fill={p.wheelFill} />
        <circle cx={p.hub.cx} cy={p.hub.cy} r={p.hub.r} fill={p.hubFill} />
        <path
          d={p.keys}
          fill={p.keyFill}
          stroke={p.keyFill}
          strokeWidth={0.9}
          strokeLinecap="round"
        />
      </g>
    );
  }

  const scale = isCluster ? POCKET_GLYPH.shell : POCKET_GLYPH.jewel;
  return (
    <g transform={carrierTransform(CURVE_BOX, 1)}>
      {defs}
      {isCluster ? (
        <>
          <rect
            x={POCKET_SHELL.body.x}
            y={POCKET_SHELL.body.y}
            width={POCKET_SHELL.body.w}
            height={POCKET_SHELL.body.h}
            rx={POCKET_SHELL.body.r}
            fill={glass}
            stroke={POCKET_SHELL.bodyStroke}
            strokeWidth={0.7}
          />
          <path
            d={POCKET_SHELL.gloss}
            stroke={POCKET_SHELL.glossStroke}
            strokeOpacity={0.45}
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
          />
        </>
      ) : (
        <>
          {/* Rim then face: the silver ring is the larger circle showing
              through, not a stroke, so it keeps its gradient. */}
          <circle cx={40} cy={40} r={POCKET_JEWEL.rim} fill={silver} />
          <circle cx={40} cy={40} r={POCKET_JEWEL.face} fill={glass} />
          <path
            d={POCKET_JEWEL.gloss}
            stroke={POCKET_JEWEL.glossStroke}
            strokeOpacity={0.38}
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}
      <g transform={`translate(40,40) scale(${scale})`}>
        <CurveLayers glyph={glyph} ink={silver} strokeWidth={POCKET_STROKE} />
      </g>
      {isCluster && (
        <circle
          cx={POCKET_SHELL.status.cx}
          cy={POCKET_SHELL.status.cy}
          r={POCKET_SHELL.status.r}
          fill={POCKET_STATUS}
        />
      )}
    </g>
  );
}

function HobbyMarkInner({ id, category, hue, R, engraved, iconSet }: Props) {
  const set = iconSet ?? DEFAULT_ICON_SET;
  const scale = (FOOTPRINT * R) / GLYPH_BOX;

  if (set === "files") {
    const [glyph, isCluster] = kitGlyphFor(id, category);
    return (
      <g transform={`scale(${scale})`}>
        <FilesMark id={id} glyph={glyph} isCluster={isCluster} />
      </g>
    );
  }

  // The app lightens the cluster hue against its theme; on the web the
  // caller passes the colour it wants drawn.
  const stroke = hue;

  if (set === "gallery" || set === "pocket") {
    const [glyph, isCluster] = curveGlyphFor(id, category);
    return (
      <g transform={`scale(${scale})`}>
        {set === "gallery" ? (
          <GalleryMark id={id} glyph={glyph} />
        ) : (
          <PocketMark id={id} glyph={glyph} isCluster={isCluster} />
        )}
      </g>
    );
  }

  if (set === "clean" || set === "retro") {
    const [glyph, isCluster] = curveGlyphFor(id, category);
    return (
      <g transform={`scale(${scale})`}>
        {set === "clean" ? (
          <CleanMark
            id={id}
            glyph={glyph}
            category={category}
            isCluster={isCluster}
            hue={stroke}
          />
        ) : (
          <RetroMark
            id={id}
            glyph={glyph}
            isCluster={isCluster}
            category={category}
          />
        )}
      </g>
    );
  }
  // Weight is given in glyph units and scaled with the art, so the line stays
  // proportional at 40pt in a list and at 76pt in onboarding. Engraved themes
  // draw finer, matching the rest of the gallery chrome.
  const fine = engraved === true;

  const [glyph] = kitGlyphFor(id, category);
  return (
    <g transform={`scale(${scale})`}>
      <StrokedGlyph
        d={glyph.d}
        dots={glyph.dots}
        stroke={stroke}
        strokeWidth={fine ? KIT_STROKE * 0.85 : KIT_STROKE}
      />
    </g>
  );
}

export default React.memo(HobbyMarkInner);
