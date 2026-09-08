"use client";

// A hobby or cluster mark at a given size, in whichever icon set is chosen.
//
// HobbyMark draws into an SVG coordinate space centred on the origin, the same
// way it does in the app; this wraps it in the viewBox that makes that work in
// the DOM. Everything else about the drawing — which set, which carrier, how
// the pictogram sits inside it — is the app's code unchanged, which is the
// point: the demo should show the real icon families, not an approximation.

import HobbyMark from "@/graph/HobbyMark";
import type { Category } from "@/lib/themes";
import type { IconSetId } from "@/lib/iconSet";

export default function HobbyGlyph({
  id,
  category,
  hue,
  size = 40,
  iconSet,
  engraved,
  className,
}: {
  id: string;
  category: Category;
  hue: string;
  size?: number;
  iconSet?: IconSetId;
  engraved?: boolean;
  className?: string;
}) {
  // R is the app's sizing handle: a mark spans about 3.1R, so this makes the
  // drawing fill the box it is given.
  const R = size / 3.1;
  const half = size / 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`${-half} ${-half} ${size} ${size}`}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <HobbyMark
        id={id}
        category={category}
        hue={hue}
        R={R}
        iconSet={iconSet}
        engraved={engraved}
      />
    </svg>
  );
}
