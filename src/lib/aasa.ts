// The file iOS reads to decide that aspectniche.com links open the app.
//
// Without it, every invitation, date and series link opened in Safari even on
// a phone with the app installed. The Team ID comes from the environment
// (Apple Developer > Membership) so the repo carries no account detail.

type Component = { "/": string; exclude?: boolean };

export function aasaBody(teamId: string) {
  const components: Component[] = [
    { "/": "/i/card*", exclude: true },
    { "/": "/p/card*", exclude: true },
    ...["/i", "/r", "/p", "/pr", "/s", "/g"].map((p) => ({ "/": p })),
  ];
  return {
    applinks: {
      details: [{ appIDs: [`${teamId}.com.aspectniche.app`], components }],
    },
  };
}
