import type { SeriesAnswer, SeriesStatus } from "@/lib/series";

// What pressing Going, Maybe or Out for one game should send: the choice, or
// null to take the answer back. The app's series screen follows the same
// rule (its `tapChoice`).
//
// Only an answer actually GIVEN for that game is taken back. Going because of
// "I'm usually in" is not one -- there is no row for that game to withdraw --
// so pressing it records an explicit Going, and a second press withdraws it.
// Kept out of lib/series, which is byte-shared with the app and the server.
export function afterTap(answers: SeriesAnswer[], name: string, game: string, choice: SeriesStatus): SeriesStatus | null {
  const key = name.toLowerCase();
  const given = answers.find((a) => a.game === game && a.name.toLowerCase() === key);
  return given && given.status === choice ? null : choice;
}
