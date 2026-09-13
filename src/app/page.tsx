import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import Landing from "./_landing/Landing";

// The marketing entry route.
//
// The previous landing page is kept in git history rather than beside this one:
// it described only the web demo, and two landing pages is a routing question
// nobody asked for. The web demo has since been removed; the closing section
// holds the spot where a demo-video gallery is meant to go.

// Self-hosted through the framework's own loader, which is the site's existing
// strategy — the reference's Google Fonts <link> would add a third-party
// request and a flash of fallback type.
const dmSans = DM_Sans({
  variable: "--anl-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--anl-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aspect Niche — Follow your curiosity.",
  description:
    "Discover a hobby. Follow a connection. Make a little world of your own. Explore an interactive preview of Aspect Niche.",
  openGraph: {
    title: "Aspect Niche — Follow your curiosity.",
    description:
      "Discover a hobby. Follow a connection. Make a little world of your own.",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <div className={`${dmSans.variable} ${instrumentSerif.variable}`}>
      <Landing />
    </div>
  );
}
