"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import BrandMark from "../components/BrandMark";
import RabbitHoleMark from "../components/RabbitHoleMark";

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6"
      style={{
        height: 56,
        background: scrolled ? "rgba(250,246,236,1)" : "rgba(250,246,236,0.85)",
        backdropFilter: scrolled ? "none" : "blur(12px)",
        WebkitBackdropFilter: scrolled ? "none" : "blur(12px)",
        borderBottom: scrolled ? "1px solid #E8E4DA" : "1px solid transparent",
        transition: "background 0.2s ease, border-color 0.2s ease",
      }}
    >
      <div className="flex items-center gap-2">
        <BrandMark size={24} variant="mono" className="text-[#2C2420]" />
        <span
          style={{
            fontFamily: "var(--font-grotesk), sans-serif",
            fontSize: 16,
            color: "#2C2420",
            letterSpacing: "0.01em",
          }}
        >
          aspect niche
        </span>
      </div>
      <Link
        href="/demo"
        className="rounded-full font-semibold text-white transition-all hover:opacity-90 active:scale-95"
        style={{ background: "#584CC4", fontSize: 13, padding: "8px 16px" }}
      >
        Try demo →
      </Link>
    </nav>
  );
}

function ScrollChevron() {
  return (
    <div
      className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40"
      aria-hidden="true"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        style={{ animation: "chevronBounce 1.8s ease-in-out infinite" }}
      >
        <path
          d="M4 7l6 6 6-6"
          stroke="#3a2e2a"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function FeatureBlock({
  num,
  title,
  desc,
}: {
  num: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#A33B5E",
          letterSpacing: "0.08em",
        }}
      >
        {num}
      </span>
      <h3
        style={{
          fontFamily: "var(--font-grotesk), sans-serif",
          fontSize: 22,
          color: "#2C2420",
          lineHeight: 1.3,
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: 15, color: "#5A5855", lineHeight: 1.75 }}>{desc}</p>
    </div>
  );
}

const INSPIRE_CARDS = [
  {
    dot: "#5FA8A8",
    title: "Obsidian's graph view",
    body: "The idea that knowledge has shape — that notes connect to notes and ideas link to ideas — made us ask: what if hobbies worked the same way?",
  },
  {
    dot: "#E0A94E",
    title: "The Game of Life",
    body: "Playful, colorful, full of unexpected turns. We wanted the app to feel like play, not a productivity tool. The bright palette and animated nodes are a direct nod.",
  },
  {
    dot: "#A33B5E",
    title: "3am Reddit spirals",
    body: "The feeling of stumbling into r/mycology at midnight and emerging 2 hours later knowing everything about foraging. That's the experience we're building toward.",
  },
  {
    dot: "#6B8FB5",
    title: "AI with a conscience",
    body: "We use Groq's energy-efficient LLMs intentionally — one cached call per activity, scoped only to hobby discovery. No chatbot, no abuse, no waste.",
  },
];

export default function HomePage() {
  const section2Ref = useRef<HTMLElement>(null);

  function scrollToSection2() {
    section2Ref.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <style>{`
        @keyframes chevronBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
      `}</style>

      <Nav />

      <main>
        {/* ── Section 1: Hero ── */}
        <section
          className="relative flex flex-col items-center justify-center text-center px-6"
          style={{ minHeight: "100vh", background: "#FAF6EC", paddingTop: 56 }}
        >
          <RabbitHoleMark width={340} className="text-[#2C2420]" />

          <h1
            style={{
              fontFamily: "var(--font-grotesk), sans-serif",
              fontSize: 56,
              fontWeight: 400,
              color: "#2C2420",
              letterSpacing: "0.01em",
              marginTop: 24,
              lineHeight: 1.1,
            }}
          >
            aspect niche
          </h1>

          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 18,
              color: "#6a5e58",
              marginTop: 8,
            }}
          >
            Navigate the Hobby Verse
          </p>

          <div
            className="flex items-center gap-4 flex-wrap justify-center"
            style={{ marginTop: 40 }}
          >
            <Link
              href="/demo"
              className="rounded-full font-semibold text-white transition-all hover:opacity-90 active:scale-95"
              style={{
                background: "#584CC4",
                fontSize: 16,
                padding: "14px 32px",
                boxShadow: "0 4px 20px #584CC445",
              }}
            >
              Try the demo →
            </Link>
            <button
              onClick={scrollToSection2}
              className="rounded-full transition-all hover:bg-[#F0EDE6] active:scale-95"
              style={{
                fontSize: 16,
                padding: "14px 32px",
                border: "1.5px solid #C4BFB4",
                background: "transparent",
                color: "#3a2e2a",
              }}
            >
              Learn more ↓
            </button>
          </div>

          <ScrollChevron />
        </section>

        {/* ── Section 2: The Problem ── */}
        <section
          ref={section2Ref}
          style={{ background: "white", padding: "80px 24px" }}
        >
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#584CC4",
                letterSpacing: "0.1em",
                textTransform: "uppercase" as const,
                marginBottom: 20,
              }}
            >
              WHY WE BUILT THIS
            </p>
            <h2
              style={{
                fontFamily: "var(--font-grotesk), sans-serif",
                fontSize: 40,
                color: "#2C2420",
                lineHeight: 1.2,
                marginBottom: 32,
              }}
            >
              Hobbies don&apos;t come with a map.
            </h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column" as const,
                gap: 20,
              }}
            >
              {[
                "Most people discover new hobbies the same way — a random recommendation, a friend's suggestion, or a late-night YouTube spiral. It works occasionally. But it's not a system.",
                "The real problem is that hobbies connect to each other in surprising ways. Rock climbing leads to bouldering leads to fingerboard training leads to biomechanics. Cooking leads to fermentation leads to mycology leads to foraging. The path is always there — it’s just invisible.",
                "Aspect Niche makes the path visible.",
              ].map((para, i) => (
                <p
                  key={i}
                  style={{ fontSize: 16, color: "#5A5855", lineHeight: 1.8 }}
                >
                  {para}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 3: How It Works ── */}
        <section style={{ background: "#FAF6EC", padding: "80px 24px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#584CC4",
                letterSpacing: "0.1em",
                textTransform: "uppercase" as const,
                marginBottom: 20,
              }}
            >
              THE PRODUCT
            </p>
            <h2
              style={{
                fontFamily: "var(--font-grotesk), sans-serif",
                fontSize: 40,
                color: "#2C2420",
                lineHeight: 1.2,
                marginBottom: 48,
              }}
            >
              A graph of everything you could become.
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 40,
                marginBottom: 52,
              }}
            >
              <FeatureBlock
                num="01"
                title="Pick your world"
                desc="Choose the interest categories that pull at you — fitness, creative, tech, nature, and more. Your graph builds from your choices."
              />
              <FeatureBlock
                num="02"
                title="Follow the connections"
                desc="Tap any node to expand it into a cluster of specific activities. Tap an activity to learn more, find nearby places, or go deeper into the niche layer of that hobby."
              />
              <FeatureBlock
                num="03"
                title="Let AI go further"
                desc="The Rabbit Hole panel uses Groq AI to surface ultra-niche hobbies you've never heard of, find deeper cuts on any activity, and even generate brand new hobby nodes on demand."
              />
            </div>

            <div className="flex justify-center">
              <Link
                href="/demo"
                className="rounded-full font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                style={{
                  background: "#584CC4",
                  fontSize: 15,
                  padding: "14px 36px",
                  boxShadow: "0 4px 20px #584CC440",
                }}
              >
                Try it now →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Section 4: Inspiration ── */}
        <section style={{ background: "white", padding: "80px 24px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#584CC4",
                letterSpacing: "0.1em",
                textTransform: "uppercase" as const,
                marginBottom: 20,
              }}
            >
              WHAT INSPIRED US
            </p>
            <h2
              style={{
                fontFamily: "var(--font-grotesk), sans-serif",
                fontSize: 40,
                color: "#2C2420",
                lineHeight: 1.2,
                marginBottom: 40,
              }}
            >
              Built on curiosity, not algorithms.
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 20,
              }}
            >
              {INSPIRE_CARDS.map((card, i) => (
                <div
                  key={i}
                  style={{
                    background: "white",
                    border: "1px solid #E8E4DA",
                    borderRadius: 16,
                    padding: 24,
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: card.dot,
                      marginBottom: 14,
                    }}
                  />
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#1A1916",
                      marginBottom: 8,
                    }}
                  >
                    {card.title}
                  </h3>
                  <p
                    style={{ fontSize: 14, color: "#5A5855", lineHeight: 1.6 }}
                  >
                    {card.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 5: Demo Preview ── */}
        <section
          style={{
            background:
              "linear-gradient(160deg, #5FA8A8 0%, #A33B5E 50%, #E0A94E 100%)",
            padding: "80px 24px",
            textAlign: "center" as const,
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-grotesk), sans-serif",
              fontSize: 48,
              fontWeight: 400,
              color: "white",
              marginBottom: 16,
              lineHeight: 1.15,
            }}
          >
            See it for yourself.
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.8)",
              marginBottom: 32,
            }}
          >
            The full demo is live — pick your interests, explore the graph, go
            down a rabbit hole.
          </p>
          <Link
            href="/demo"
            className="inline-block rounded-full font-semibold transition-all hover:scale-105 active:scale-95"
            style={{
              background: "white",
              color: "#A33B5E",
              fontSize: 16,
              padding: "16px 40px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
            }}
          >
            Open the demo →
          </Link>
          <p
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.6)",
              marginTop: 16,
            }}
          >
            No account needed · Runs in your browser
          </p>
        </section>
      </main>

      {/* ── Section 6: Footer ── */}
      <footer style={{ background: "#2C2420", padding: "40px 24px" }}>
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap" as const,
            gap: 24,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-grotesk), sans-serif",
                fontSize: 20,
                color: "#FAF6EC",
              }}
            >
              aspect niche
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(250,246,236,0.68)",
                marginTop: 4,
              }}
            >
              Navigate the Hobby Verse
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column" as const,
              gap: 8,
              alignItems: "flex-end",
            }}
          >
            <div className="flex items-center gap-5">
              <Link
                href="/demo"
                style={{ fontSize: 13, color: "rgba(250,246,236,0.7)" }}
              >
                Demo
              </Link>
              <a
                href="https://github.com/Devauntae"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 13, color: "rgba(250,246,236,0.7)" }}
              >
                GitHub
              </a>
            </div>
            <p
              style={{
                fontSize: 12,
                color: "rgba(250,246,236,0.62)",
                textAlign: "right" as const,
              }}
            >
              Built with Next.js, React Flow, and Groq
            </p>
          </div>
        </div>
        <div
          style={{
            maxWidth: 900,
            margin: "20px auto 0",
            paddingTop: 20,
            borderTop: "1px solid rgba(250,246,236,0.1)",
            fontSize: 11,
            color: "rgba(250,246,236,0.62)",
          }}
        >
          © 2026 Aspect Niche. Built by Devauntae Norman.
        </div>
      </footer>
    </>
  );
}
