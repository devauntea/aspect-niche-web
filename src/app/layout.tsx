import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

// Space Grotesk for display/wordmark, Inter for body/UI.
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
    >
      <body className="min-h-full flex flex-col bg-[#FAF8F2] text-[#1A1916]">
        {children}
      </body>
    </html>
  );
}
