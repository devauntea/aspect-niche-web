import type { Metadata } from "next";
import Link from "next/link";

// The privacy policy the App Store requires a URL for.
//
// It is written from what the app actually does rather than from a template:
// the mobile app keeps everything on the device, makes exactly one network
// request, and has no accounts, no analytics and no third-party SDKs that
// collect anything. Every claim below maps to code in aspect-niche-mobile, so
// if that changes, this page changes with it — a policy that drifts from the
// build is worse than no policy, because it is a statement to users that has
// quietly stopped being true.

export const metadata: Metadata = {
  title: "Privacy Policy — Aspect Niche",
  description:
    "Aspect Niche keeps your collection, notes and photos on your own device. No account, no analytics, no tracking.",
};

const UPDATED = "8 September 2026";

// Swap this for a dedicated address if you would rather not publish a personal
// inbox — App Store Connect requires a contact that actually reaches you.
const CONTACT = "devauntaenorman@gmail.com";

const ink = "#2C2420";
const paper = "#FAF6EC";

function Section({
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
      <div style={{ fontSize: 16, lineHeight: 1.65, color: "rgba(44,36,32,0.86)" }}>
        {children}
      </div>
    </section>
  );
}

function List({ items }: { items: React.ReactNode[] }) {
  return (
    // listStyle is explicit because Tailwind's preflight resets it to none, and
    // a list of six things with no markers reads as six stray lines.
    <ul
      style={{
        margin: "12px 0 0",
        paddingLeft: 22,
        listStyle: "disc outside",
      }}
    >
      {items.map((item, i) => (
        <li key={i} style={{ marginTop: i === 0 ? 0 : 8 }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function PrivacyPolicy() {
  return (
    <main style={{ background: paper, minHeight: "100vh", padding: "64px 24px 80px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <Link
          href="/"
          style={{ fontSize: 13, color: "rgba(44,36,32,0.6)" }}
        >
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
          Privacy Policy
        </h1>
        <p style={{ fontSize: 14, color: "rgba(44,36,32,0.6)" }}>
          Last updated {UPDATED}
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
          Aspect Niche keeps what you make on your own phone. There is no
          account to create, no server holding your collection, and nothing in
          the app that watches how you use it.
        </p>

        <Section title="What stays on your device">
          <p>
            Everything the app remembers is stored on your phone, in the app&rsquo;s
            own storage. None of it is uploaded, backed up to us, or readable by
            anyone but you:
          </p>
          <List
            items={[
              "The interest clusters you pick and the hobbies you collect",
              "Your first-step checklists, streak, and earned badges",
              "Notes you write and pin to a hobby",
              "Photos you attach to a hobby, which are copied into the app's private storage",
              "Sessions you schedule and date plans you build",
              "Your theme, icon set, and graph settings",
            ]}
          />
          <p style={{ marginTop: 14 }}>
            We have no way to see any of it. If you delete the app, it is gone.
            You can also erase it from inside the app at any time, under{" "}
            <strong>You &rarr; Erase my data</strong>.
          </p>
        </Section>

        <Section title="The one thing the app sends anywhere">
          <p>
            When you are inviting someone and you type into the{" "}
            <strong>Where</strong> field, the app looks up matching addresses so
            it can suggest them. To do that it sends the text you have typed —
            and nothing else — to{" "}
            <a
              href="https://photon.komoot.io"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: ink, textDecoration: "underline" }}
            >
              Photon
            </a>
            , an address search service run by komoot. That request carries no
            name, no account, no device identifier and no location.
          </p>
          <p style={{ marginTop: 14 }}>
            It only happens while you are typing in that one field, and only
            once you have typed at least three characters. If you would rather
            not use it, type the name of the place instead — &ldquo;my
            flat&rdquo;, &ldquo;the studio&rdquo; — and the app never makes the
            request. Nothing else in Aspect Niche talks to the internet.
          </p>
        </Section>

        <Section title="Permissions, and why">
          <List
            items={[
              <>
                <strong>Photos and camera</strong> — only when you add a photo
                to a hobby. The app copies the image into its own storage and
                never reads your library otherwise.
              </>,
              <>
                <strong>Calendar</strong> — only to add a session or date you
                have scheduled. The app writes events; it does not read your
                calendar.
              </>,
            ]}
          />
          <p style={{ marginTop: 14 }}>
            Both are asked for at the moment you use the feature, and declining
            either leaves the rest of the app working.
          </p>
        </Section>

        <Section title="Invitations and sharing">
          <p>
            An invitation is a link that contains the event itself — what, when,
            where, and whatever you wrote. When you send one, it goes through
            whichever app you choose to send it with, the same way any other
            message you write does. It does not pass through us, because there
            is no us to pass through: no server ever sees an invitation, a
            reply, or who you sent it to.
          </p>
          <p style={{ marginTop: 14 }}>
            The same is true of anything else you share from the app — a
            collection, a calendar file, a graph. You choose the recipient and
            the app hands it to your phone&rsquo;s share sheet.
          </p>
          <p style={{ marginTop: 14 }}>
            <strong>Opening maps or a calendar</strong> hands off to Apple Maps,
            Google Maps or Google Calendar with the search term or event you
            asked for. Once you are in that app, its own privacy policy applies.
          </p>
        </Section>

        <Section title="What we do not do">
          <List
            items={[
              "No accounts, sign-ins, or profiles",
              "No analytics, crash reporting, or usage tracking",
              "No advertising and no ad identifiers",
              "No third-party SDKs that collect data",
              "No selling or sharing of personal information, because none is collected",
            ]}
          />
        </Section>

        <Section title="Children">
          <p>
            Aspect Niche does not collect personal information from anyone, of
            any age. It is not directed at children under 13, and because
            nothing is collected there is nothing held about a child to delete.
          </p>
        </Section>

        <Section title="Your rights">
          <p>
            Laws such as the GDPR and the CCPA give you rights to see, correct,
            export and delete the personal data a company holds about you. We
            hold none, so there is nothing for us to produce or erase. The data
            the app creates is on your device and entirely under your control:
            you can view it in the app, and remove all of it with{" "}
            <strong>Erase my data</strong> or by deleting the app.
          </p>
        </Section>

        <Section title="Changes">
          <p>
            If a future version of the app collects or sends something new, this
            page will be updated before that version ships, and the date at the
            top will change. Aspect Niche has no backend today; if that ever
            changes, it will be described here plainly rather than folded into
            broader wording.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about this policy, or about the app: {" "}
            <a
              href={`mailto:${CONTACT}`}
              style={{ color: ink, textDecoration: "underline" }}
            >
              {CONTACT}
            </a>
          </p>
        </Section>

        <p
          style={{
            marginTop: 48,
            paddingTop: 20,
            borderTop: "1px solid rgba(44,36,32,0.14)",
            fontSize: 13,
            color: "rgba(44,36,32,0.6)",
          }}
        >
          Aspect Niche &middot; Built by Devauntae Norman
        </p>
      </div>
    </main>
  );
}
