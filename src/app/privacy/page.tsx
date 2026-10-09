import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Section, List } from "@/app/_legal/LegalPage";

// The privacy policy the App Store requires a URL for, covering the app and
// this website.
//
// Rewritten 26 September 2026, because the first version had become false.
// It said "no accounts, no advertising, no server holding your collection",
// and the app has since gained optional accounts that sync, photo backup,
// clubs, live invitation replies, a membership sold through Apple, one
// sponsored row, and AI answers. Every claim below was checked against the
// code on that date: the tables in supabase/migrations, what `toSynced`
// carries, what each edge function stores, and which SDKs load when.

export const metadata: Metadata = {
  title: "Privacy Policy — Aspect Niche",
  description:
    "What Aspect Niche keeps on your phone, what an optional account stores, and every service that handles data for the app.",
};

export default function PrivacyPolicy() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="7 October 2026"
      lede="Aspect Niche keeps what you make on your own phone first. An account
            is optional; if you make one, a copy travels with it. This page
            says exactly what goes where, and who handles it."
    >
      <Section title="The short version">
        <List
          items={[
            "Without an account, what you make stays on your phone. The app still reaches the internet for a few things you ask it to do, listed below.",
            "An account is optional. With one, your collection, notes, plans and some photos are stored so they can reach your other phones.",
            "We do not sell personal information, and nothing in the app tracks you across other companies' apps or websites.",
            "Free use shows one non-personalised sponsored row, from Google. Members see none.",
            "This website sets no cookies and loads nothing from any other company.",
          ]}
        />
      </Section>

      <Section title="On your phone">
        <p>
          Everything the app remembers is stored on your phone first, in the
          app&rsquo;s own storage: the interests you pick and the hobbies you
          collect, notes and photos, sessions and plans, vision boards, hobbies
          you made yourself, and your settings. It also remembers the last place
          you searched near, so a hobby card can show places close by.
        </p>
        <p>
          You can erase all of it at any time under{" "}
          <strong>Settings &rarr; Erase my data</strong>, or by deleting the
          app.
        </p>
      </Section>

      <Section title="If you make an account">
        <p>
          Signing in needs only an email address. We send it a six-digit code;
          there is no password, name or phone number. With an account, we store:
        </p>
        <List
          items={[
            "Your email address, to sign you in.",
            "A copy of your collection, pinned notes, sessions, plans, hobbies you made yourself, settings, and the last place you searched near — so they reach another phone you sign in on.",
            "Photos you add, up to your backup limit: a reduced copy (at most 1600 pixels on the long side), in a private folder only your account can read. The original stays on the phone that took it.",
          ]}
        />
        <p>
          Some things never leave the phone, even with an account: unfinished
          draft notes, vision boards, and photos beyond your backup limit.
        </p>
      </Section>

      <Section title="Invitations and replies">
        <p>
          An invitation is a link that carries the event itself — what, when,
          where, and whatever you wrote — and you send it through whichever
          messaging app you choose.
        </p>
        <p>
          If you are signed in when you send one, we record the
          invitation&rsquo;s id against your account, so replies can reach you.
          A guest&rsquo;s reply then stores the name they typed and their answer
          — going, maybe or out — and only the host can read it. A guest needs
          no account and gives nothing else. Signed out, replies travel as
          links, and nothing passes through us.
        </p>
        <p>
          You can put one of the app&rsquo;s own pictures behind an invitation,
          which sends nothing but its name. If you choose a photo of your own
          and are signed in, we store a reduced copy (at most 1600 pixels on the
          long side) under a long random name, so your guest&rsquo;s phone or
          browser can show it. Anyone with the invitation link can see that
          photo; nobody can find it without the link, and it carries nothing
          that identifies you. Signed out, the photo stays on your phone and
          your guest sees the invitation without it.
        </p>
        <p>
          A repeating plan (a series) is stored on our servers, because its
          link has to show this week&rsquo;s changes. Anyone with the link can
          see its schedule and the names of everyone who answered, and can add
          their own; the page says so above the name field. A name and its
          answers are deleted when the host removes them, when the host deletes
          the series or their account, or when the guest takes them back:
          &ldquo;Take back my answers&rdquo; on the series page removes every
          answer under their name, including answers to games already played.
          Answers to games more than 90 days past are cleared the next time
          anyone opens the series or changes an answer in it. The host can
          remove a name from every game at any time, and deleting the series
          removes everything. An &ldquo;I&rsquo;m usually in&rdquo; answer
          stays until the guest withdraws it or the host removes it. A series
          holds at most 40 names.
        </p>
      </Section>

      <Section title="Clubs">
        <p>
          A club needs an account. We store the club&rsquo;s name, its hobby and
          any place you gave it, and for each member the display name they
          typed. Other members see those display names, never an email address.
          If you report a club, we store the report for a moderator; nobody in
          the club is told.
        </p>
      </Section>

      <Section title="Finding places">
        <List
          items={[
            <>
              <strong>Typing a place.</strong> When you type in a place field,
              the text you have typed — nothing else — is sent to{" "}
              <a
                href="https://photon.komoot.io"
                target="_blank"
                rel="noopener noreferrer"
              >
                Photon
              </a>
              , an address search run by komoot, to suggest matches.
            </>,
            <>
              <strong>Your location.</strong> Only when you tap &ldquo;Use my
              location&rdquo; or &ldquo;Suggest places near me&rdquo;, and only
              after iOS asks your permission. The coordinates are used for that
              one search and are not stored against your account, except as the
              last place you searched near, described above.
            </>,
            <>
              <strong>The search.</strong> Our server looks for places in its
              own copy of Overture Maps data. Where that has nothing, it asks
              OpenStreetMap&rsquo;s public servers about the area, and keeps
              that answer for a while against a coarse area and the place name
              you gave — not against you — so the next person nearby is not
              another request. Your IP address is used to limit how many
              searches can come from one connection, in a counter that only
              covers the current short window.
            </>,
          ]}
        />
      </Section>

      <Section title="Help from AI">
        <p>
          The AI features work only when you are signed in, and only when you
          ask. Each time, our server sends Groq, which runs the AI model, what
          that one answer needs, and nothing else:
        </p>
        <List
          items={[
            "Asking about a hobby: the hobby, your question and the earlier ones in that conversation, and your level with it — how many sessions you confirmed, the time they added up to, when the last one was, and how long ago you took it up.",
            "A plan for your first time: the hobby, the place you picked, and your pinned notes for it.",
            "Looking back: the hobby, and your pinned notes and answered sessions for it.",
            "Ideas for a date: the hobby you both agreed on, and the time, meal, budget and place you agreed.",
            "What should I try?: what you type about what you like, and the names of hobbies you have collected.",
            "Suggested words for a vision board: the board's title, the hobbies on it, and the words already on it.",
            "Adding a hobby of your own: its name and description, to pick the kinds of places it is done at.",
          ]}
        />
        <p>
          We do not store the answers on our servers; they live on your phone
          unless you keep one as a note. We store only how many answers you have
          used each month, to apply the monthly limit. Groq processes the
          request under its own privacy policy.
        </p>
      </Section>

      <Section title="The membership">
        <p>
          Memberships are bought through Apple. Apple handles the payment, and
          we never see your card or billing details. Purchases are verified by
          RevenueCat, which receives Apple&rsquo;s record of the purchase and an
          id for you — your account&rsquo;s id if you are signed in, otherwise a
          random one — along with basic device information.
        </p>
        <p>
          For a signed-in account we store whether it has a membership, which
          plan, and when it ends, so the membership works on your other phones.
        </p>
      </Section>

      <Section title="The sponsored row">
        <p>
          Free use shows one sponsored row, served by the Google Mobile Ads SDK.
          It is always requested as <strong>non-personalised</strong>: it is not
          chosen from a profile of you, and the app never asks for permission to
          track you, so Apple&rsquo;s advertising identifier is not available to
          it. To show and measure the ad and to prevent fraud, Google receives
          device and connection information such as your IP address, and whether
          the ad was seen or tapped. For members the ad SDK never starts.
        </p>
      </Section>

      <Section title="Links to shops and classes">
        <p>
          A hobby&rsquo;s plan can link to starter gear (REI, Amazon) and to
          classes (Eventbrite, Cozymeal). Some of these may be affiliate links,
          which earn us a commission if you buy, at no cost to you. Tapping one
          opens that site in your browser; the app sends it nothing about you,
          and the link says only which search to show. What you do there is
          covered by that site&rsquo;s own privacy policy.
        </p>
      </Section>

      <Section title="Permissions, and why">
        <List
          items={[
            <>
              <strong>Photos and camera</strong> — only when you add a photo to
              a hobby. The app copies that image into its own storage and never
              reads your library otherwise.
            </>,
            <>
              <strong>Calendar</strong> — only to put a session or date you
              scheduled onto your calendar. iOS asks for full calendar access
              because the system event editor cannot open at any lower level;
              the app adds the one event you asked for and does not read,
              collect or send your calendar.
            </>,
            <>
              <strong>Location</strong> — only when you tap a button that asks
              for it, as described under Finding places.
            </>,
            <>
              <strong>Notifications</strong> — reminders are scheduled on your
              phone and sent by your phone. Nothing about them reaches us.
            </>,
          ]}
        />
        <p>
          Each is asked for when you first use the feature, and declining leaves
          the rest of the app working.
        </p>
      </Section>

      <Section title="Who handles data for us">
        <p>
          We use these services to run the app and this site. Each receives only
          what its job needs:
        </p>
        <List
          items={[
            "Supabase — our servers and database: accounts, synced copies, backed-up photos, invitation photos, clubs, replies, series, membership status and AI usage counts.",
            "Resend — sends the sign-in code to your email address.",
            "Apple — App Store purchases and payment.",
            "RevenueCat — verifies purchases and tells our servers when a membership starts or ends.",
            "Groq — runs the AI model for AI answers.",
            "Google — serves the sponsored row to free users.",
            "komoot (Photon) — address suggestions while you type.",
            "OpenStreetMap — place data, where our own copy has none.",
            "Vercel — hosts this website.",
          ]}
        />
      </Section>

      <Section title="What we never do">
        <List
          items={[
            "Sell or rent personal information.",
            "Show personalised ads, or track you across other companies' apps and websites.",
            "Read your photo library, calendar or location beyond the moment you ask the app to use it.",
            "Show your email address to anyone else in the app.",
          ]}
        />
      </Section>

      <Section title="How long we keep it, and deleting it">
        <p>
          On your phone, data stays until you erase it or delete the app. On our
          servers, your account&rsquo;s data stays while the account exists.
        </p>
        <p>
          You can delete your account from inside the app, under{" "}
          <strong>You &rarr; Account &rarr; Delete my account</strong>. That
          deletes, straight away and for good, your sign-in and everything our
          servers hold for it: the synced copy, backed-up photos, photos behind
          your invitations, clubs you made
          (their other members lose them too), your club memberships,
          invitations and the replies to them, series you host and every answer to them, your membership record and AI
          usage counts, and your customer record with RevenueCat. Everything on
          your phone stays. Reports you made about a club are kept for the
          moderator, without your name on them.
        </p>
        <p>
          If you only want the synced copy gone, choose{" "}
          <strong>Sign out and delete the copy</strong> when you sign out
          instead. Deleting an account does not cancel a membership bought
          through Apple; cancel that in your Apple ID settings. Apple keeps its
          own purchase records as its policies and the law require. If you
          cannot use the app, email{" "}
          <a href="mailto:devauntaenorman@gmail.com">
            devauntaenorman@gmail.com
          </a>{" "}
          from the address you sign in with and we will delete the account
          within 30 days.
        </p>
      </Section>

      <Section title="This website">
        <p>
          This site sets <strong>no cookies</strong>, stores nothing in your
          browser beyond the one thing described below, and loads nothing from
          any other company — no analytics, no
          advertising, no embedded video, no font service. That is why there is
          no cookie banner. It is a set of pages about the app, plus the pages
          the app&rsquo;s invitation and plan links open.
        </p>
        <p>
          The repeating-plan page remembers the name you typed, in this browser
          only, so you can answer in one tap. Clearing the site&rsquo;s data in
          your browser removes it.
        </p>
        <p>
          Like any website, it is served by a hosting provider that keeps
          short-lived technical request logs, which include IP addresses, for
          security and reliability. We do not build profiles from them or
          connect them to anything you do in the app.
        </p>
      </Section>

      <Section title="Age">
        <p>
          Aspect Niche is intended for adults, and the{" "}
          <Link href="/terms">Terms of Use</Link> require you to be 18 or older.
          It is not directed at children. If you believe a child has given us
          personal information, contact us and we will delete it.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          Depending on where you live — including under the UK and EU GDPR and
          California law — you can ask to see, correct, export or delete the
          personal data we hold about you. Email us from the address you sign in
          with and we will respond within 30 days. Much of it you can see and
          remove yourself in the app. We do not sell or share personal
          information for advertising, so there is nothing to opt out of there.
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
          updated before that version ships, and the date at the top will
          change.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Aspect Niche is made and operated by Devauntae Norman. Questions about
          this policy, or requests about your data:{" "}
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
