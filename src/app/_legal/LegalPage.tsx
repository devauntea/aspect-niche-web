import Link from "next/link";

// Shared chrome for the legal pages, so Privacy and Terms cannot drift apart.
//
// Deliberately plain: warm paper, one column, generous measure. A legal page is
// read, not browsed, and the landing page's motion has no business here.

// 0.7 rather than the 0.6 this started at: on the paper ground 0.6 measures
// 4.04:1, under AA for text this size, and these are links and a date rather
// than decoration.
const MUTED = "rgba(44,36,32,0.7)";
const ink = "#2C2420";
const paper = "#FAF6EC";

export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginTop: 40 }}>
      <h2
        style={{
          fontFamily: "var(--font-grotesk), sans-serif",
          fontSize: 22,
          color: ink,
          marginBottom: 12,
        }}
      >
        {title}
      </h2>
      <div
        style={{
          fontSize: 16,
          lineHeight: 1.65,
          color: "rgba(44,36,32,0.86)",
          display: "grid",
          gap: 14,
        }}
      >
        {children}
      </div>
    </section>
  );
}

export function List({ items }: { items: React.ReactNode[] }) {
  return (
    // listStyle is explicit because Tailwind's preflight resets it to none, and
    // an unmarked list reads as stray lines.
    <ul style={{ margin: 0, paddingLeft: 22, listStyle: "disc outside" }}>
      {items.map((item, i) => (
        <li key={i} style={{ marginTop: i === 0 ? 0 : 8 }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function LegalPage({
  title,
  updated,
  lede,
  children,
}: {
  title: string;
  updated: string;
  lede: string;
  children: React.ReactNode;
}) {
  return (
    <main
      style={{ background: paper, minHeight: "100vh", padding: "64px 24px 80px" }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <Link href="/" style={{ fontSize: 13, color: MUTED }}>
          Aspect Niche
        </Link>

        <h1
          style={{
            fontFamily: "var(--font-grotesk), sans-serif",
            fontSize: 40,
            color: ink,
            margin: "16px 0 8px",
            lineHeight: 1.15,
          }}
        >
          {title}
        </h1>
        <p style={{ fontSize: 14, color: MUTED }}>
          Last updated {updated}
        </p>

        <p
          style={{
            fontSize: 17,
            lineHeight: 1.6,
            color: ink,
            marginTop: 28,
            paddingTop: 24,
            borderTop: "1px solid rgba(44,36,32,0.14)",
          }}
        >
          {lede}
        </p>

        {children}

        <nav
          style={{
            marginTop: 48,
            paddingTop: 20,
            borderTop: "1px solid rgba(44,36,32,0.14)",
            fontSize: 13,
            color: MUTED,
            display: "flex",
            gap: 18,
            flexWrap: "wrap",
          }}
        >
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/">Home</Link>
          <span style={{ marginLeft: "auto" }}>
            Aspect Niche &middot; Devauntae Norman
          </span>
        </nav>
      </div>
    </main>
  );
}
