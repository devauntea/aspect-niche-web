import { USUAL, cleanSeriesName, type SeriesAnswer, type SeriesStatus } from "@/lib/series";

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

/**
 * Every game this name has an answer for, "usual" first: what "Take back my
 * answers" sends a clear for once a series has ended. Only the answers the
 * page holds. Answers to games more than 90 days past are cleared the next
 * time anyone opens the series or changes an answer in it -- never on a
 * timer -- and the host can remove a name from every game at any time. The
 * app keeps the same function in its lib/seriesState.
 */
export function answeredGames(answers: SeriesAnswer[], name: string): string[] {
  const me = cleanSeriesName(name);
  if (!me) return [];
  const key = me.toLowerCase();
  const games = [...new Set(answers.filter((a) => a.name.toLowerCase() === key).map((a) => a.game))];
  return games.sort((a, b) => (a === USUAL ? -1 : b === USUAL ? 1 : a.localeCompare(b)));
}
