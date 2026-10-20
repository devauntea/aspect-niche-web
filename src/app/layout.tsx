import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif, Space_Grotesk } from "next/font/google";
import "./globals.css";

// The app's own three faces, self-hosted through the framework's loader: the
// privacy policy promises this site loads nothing from any other company, and
// that includes a font service.
//   Space Grotesk    display, as the app and the film set it
//   Inter            body and interface
//   Instrument Serif the narrator's voice, and the names of hobbies
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-grotesk",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

const DESCRIPTION =
  "Aspect Niche is a hobby discovery app for iPhone and iPad. Tell it what pulls at you and a living map of hobbies unfolds, with what each one really takes, a plan for your first session, and a link to bring a friend.";

export const metadata: Metadata = {
  metadataBase: new URL("https://aspectniche.com"),
  title: "Aspect Niche — Follow your curiosity",
  description: DESCRIPTION,
  openGraph: {
    title: "Aspect Niche — Follow your curiosity",
    description: DESCRIPTION,
    siteName: "Aspect Niche",
    type: "website",
    images: [
      {
        url: "/film/poster.jpg",
        width: 1600,
        height: 900,
        alt: "Aspect Niche: the rabbit climbing out of its hole, with the words Follow your curiosity",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0a0e1c",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${instrumentSerif.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
