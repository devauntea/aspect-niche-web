import type { Metadata } from "next";
import {
  DEFAULT_THEME_ID,
  LIGHT_DEFAULT_THEME_ID,
  THEME_STORAGE_KEY,
  themeCss,
} from "@/lib/themes";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

// Night-sky field guide type: Space Grotesk for display/wordmark, Inter for
// body/UI (see nightSky tokens in src/lib/theme.ts).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-grotesk",
  weight: ["500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aspect Niche — Navigate the Hobby Verse",
  description:
    "A graph-based hobby discovery app. Pick your interests, explore connections, and find your next obsession.",
  openGraph: {
    title: "Aspect Niche — Navigate the Hobby Verse",
    description:
      "A graph-based hobby discovery app. Pick your interests, explore connections, and find your next obsession.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Theme variables generated from the registry (src/lib/themes.ts) */}
        <style id="theme-css">{themeCss()}</style>
        {/* Set data-theme before first paint: stored choice, else system */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem(${JSON.stringify(
              THEME_STORAGE_KEY,
            )});if(!t)t=window.matchMedia("(prefers-color-scheme: light)").matches?${JSON.stringify(
              LIGHT_DEFAULT_THEME_ID,
            )}:${JSON.stringify(
              DEFAULT_THEME_ID,
            )};document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FAF8F2] text-[#1A1916]">
        {children}
      </body>
    </html>
  );
}
