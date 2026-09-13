import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Section, List } from "@/app/_legal/LegalPage";

// The privacy policy the App Store requires a URL for.
//
// It covers BOTH properties, which the first version did not: it described the
// app's on-device storage and said "no server", while this website was quietly
// calling a language model from two API routes. A policy that is true of one
// half of the product is a false statement about the other half.
//
// Every claim below maps to code. Verified before writing, in the browser and
// by reading the source: no cookies are set on either page, no request leaves
// the visitor's browser to any host but this one, and the only two `fetch`
// calls in the site go to our own API routes carrying curated hobby ids.

export const metadata: Metadata = {
  title: "Privacy Policy — Aspect Niche",
  description:
    "Aspect Niche keeps your collection, notes and photos on your own device. No account, no analytics, no cookies, no tracking.",
};

export default function PrivacyPolicy() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="8 September 2026"
      lede="Aspect Niche keeps what you make on your own phone. There is no
            account to create, no server holding your collection, and nothing in
            the app or on this site that watches how you use it."
    >
      <Section title="The short version">
        <List
          items={[
            "No accounts, no sign-in, no profiles.",
            "No analytics, no advertising, no tracking of any kind.",
            "This website sets no cookies at all.",
            "Your hobbies, notes and photos stay on your device.",
          ]}
        />
      </Section>

      <Section title="The app: what stays on your device">
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
        <p>
          We have no way to see any of it. If you delete the app, it is gone.
          You can also erase it from inside the app at any time, under{" "}
          <strong>You &rarr; Erase my data</strong>.
        </p>
      </Section>

      <Section title="The app: the one thing it sends anywhere">
        <p>
          When you are inviting someone and you type into the{" "}
          <strong>Where</strong> field, the app looks up matching addresses so
          it can suggest them. To do that it sends the text you have typed — and
          nothing else — to{" "}
          <a
            href="https://photon.komoot.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            Photon
          </a>
          , an address search service run by komoot. That request carries no
          name, no account, no device identifier and no location.
        </p>
        <p>
          It only happens while you are typing in that one field, and only once
          you have typed at least three characters. If you would rather not use
          it, type the name of the place instead — &ldquo;my flat&rdquo;,
          &ldquo;the studio&rdquo; — and the app never makes the request.
          Nothing else in the app talks to the internet.
        </p>
      </Section>

      <Section title="The app: permissions, and why">
        <List
          items={[
            <>
              <strong>Photos and camera</strong> — only when you add a photo to
              a hobby. The app copies the image into its own storage and never
              reads your library otherwise.
            </>,
            <>
              <strong>Calendar</strong> — only to put a session or date you have
              scheduled onto your calendar. iOS asks for full calendar access
              because that is the only level at which the system event editor
              can be opened at all; the app uses it to add the one event you
              asked for, and does not read, collect or transmit your calendar.
            </>,
          ]}
        />
        <p>
          Both are asked for at the moment you use the feature, and declining
          either leaves the rest of the app working.
        </p>
      </Section>

      <Section title="The app: invitations and sharing">
        <p>
          An invitation is a link that contains the event itself — what, when,
          where, and whatever you wrote. When you send one, it goes through
          whichever app you choose to send it with, the same way any other
          message you write does. It does not pass through us: no server ever
          sees an invitation, a reply, or who you sent it to.
        </p>
        <p>
          The same is true of anything else you share from the app — a
          collection, a calendar file, a graph. Opening maps or a calendar hands
          off to Apple Maps, Google Maps or Google Calendar with the search term
          or event you asked for; once you are in that app, its own privacy
          policy applies.
        </p>
      </Section>

      <Section title="This website: no cookies, no tracking">
        <p>
          This site sets <strong>no cookies</strong>, and loads nothing from any
          other company — no analytics, no advertising, no social buttons, no
          embedded video, no font service. Every file the page loads comes from
          this domain, fonts included.
        </p>
        <p>
          That is why you are not being shown a cookie banner. There is nothing
          to consent to.
        </p>
        <p>
          The site also stores nothing in your browser&rsquo;s own local storage.
          It is a set of pages that describe the app, plus the invitation links
          the app generates, and it keeps no record of your visit.
        </p>
      </Section>

      <Section title="This website: server logs">
        <p>
          Like any website, this one is served by a hosting provider that keeps
          short-lived technical request logs, which include IP addresses. That is
          ordinary infrastructure logging for security and reliability. We do not
          build profiles from it, connect it to anything you do in the app, or
          use it for analytics.
        </p>
      </Section>

      <Section title="What we never do">
        <List
          items={[
            "Sell or share personal information — there is none to sell",
            "Serve advertising or use advertising identifiers",
            "Track you across sites or apps",
            "Include third-party SDKs that collect data",
            "Ask for an email address, a phone number, or a name",
          ]}
        />
      </Section>

      <Section title="Age">
        <p>
          Aspect Niche is intended for adults and the{" "}
          <Link href="/terms">Terms of Use</Link> ask that you be 18 or older.
          It is not directed at children.
        </p>
        <p>
          It collects no personal information from anyone, of any age, so there
          is nothing held about a child to disclose or delete. If you believe a
          child has somehow provided us with personal information, contact us
          and we will look into it — though by design there is nowhere for such
          information to have gone.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          Laws such as the UK and EU GDPR and the California Consumer Privacy
          Act give you rights to see, correct, export and delete the personal
          data a company holds about you. We hold none, so there is nothing for
          us to produce or erase, and no sale or sharing to opt out of.
        </p>
        <p>
          The data the app creates is on your device and entirely under your
          control: you can view it in the app, and remove all of it with{" "}
          <strong>Erase my data</strong> or by deleting the app. Site storage
          clears with your browsing data.
        </p>
        <p>
          If you are in the UK or EU and believe we have handled your data
          improperly, you have the right to complain to your data protection
          authority.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          If a future version collects or sends something new, this page will be
          updated before that version ships, and the date at the top will change.
          Aspect Niche has no user backend today; if that ever changes, it will
          be described here plainly rather than folded into broader wording.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Aspect Niche is made and operated by Devauntae Norman. Questions about
          this policy, or about the app:{" "}
          <a href="mailto:devauntaenorman@gmail.com">
            devauntaenorman@gmail.com
          </a>
        </p>
        <p>
          See also the <Link href="/terms">Terms of Use</Link>.
        </p>
      </Section>
    </LegalPage>
  );
}
