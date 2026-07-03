// Maps deep links — search links first, Places API second (blueprint rule).

/** Google Maps search for places to do an activity near the user. */
export function mapsSearchUrl(activityLabel: string): string {
  return `https://www.google.com/maps/search/${encodeURIComponent(
    `${activityLabel} near me`,
  )}`;
}
