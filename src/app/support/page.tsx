import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Section } from "@/app/_legal/LegalPage";
import { CONTACT_EMAIL } from "@/app/_site/sections";

// App Store Connect requires a Support URL that actually resolves and offers a
// way to get help. This answers the questions the app actually raises.
//
// Rewritten 19 October 2026: the earlier version still described an app with
// no account, no server and nothing to buy, which the Privacy Policy and Terms
// of Use (rewritten in late September) had stopped saying. Every answer here
// now matches those two pages, and the menu paths are the app's own labels as
// of the mobile repo's 18 October 2026 commit (src/app/settings).

export const metadata: Metadata = {
  title: "Support — Aspect Niche",
  description:
    "Help with Aspect Niche: where your things are kept, moving to a new phone, invitations, permissions, the membership, and how to reach a person.",
};

export default function Support() {
  return (
    <LegalPage
      title="Support"
      updated="19 October 2026"
      lede="Most questions about Aspect Niche come down to where your things are
            kept and how invitations travel. Here are the ones that come up, and
            how to reach a person if yours is not among them."
    >
      <Section title="Get in touch">
        <p>
          Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. It is
          one person reading, so please allow a few days.
        </p>
        <p>
          If you are reporting something broken, it helps enormously to include
          your device model, your iOS version, and what you were doing just
          before it went wrong.
        </p>
      </Section>

      <Section title="Where are my hobbies, notes and photos kept?">
        <p>
          On your phone first, in the app&rsquo;s own storage. An account is
          optional: if you make one, a copy of your collection, pinned notes,
          sessions, plans, the hobbies you made yourself and your settings
          travels with it, so it reaches any other phone you sign in on. Photos
          are backed up as a reduced copy, up to your backup limit.
        </p>
        <p>
          Some things never leave the phone, even with an account: unfinished
          draft notes, vision boards, and photos beyond your backup limit.{" "}
          <strong>
            Without an account, deleting the app deletes what it held, and there
            is no copy anywhere else.
          </strong>{" "}
          Settings &rarr; Your data &rarr; Export a copy saves one you can keep.
        </p>
      </Section>

      <Section title="I moved to a new phone and my hobbies are gone">
        <p>
          If you had an account, sign in on the new phone with the same email
          address; the six-digit code arrives there, and your synced things come
          across.
        </p>
        <p>
          Without an account, a new phone starts empty. An encrypted iPhone
          backup restored to the new phone brings the app and its contents
          across; a fresh install does not. A copy you exported can be brought
          back under Settings &rarr; Your data &rarr; Import a copy.
        </p>
      </Section>

      <Section title="Scheduling a session did not reach my calendar">
        <p>
          Aspect Niche opens your calendar&rsquo;s own new-event screen with the
          details filled in. You still have to tap <strong>Add</strong> there;
          if you tapped Cancel, nothing is saved.
        </p>
        <p>
          If the screen never appears, calendar access is probably off. Open{" "}
          <strong>Settings &rarr; Aspect Niche</strong> in iOS and turn on
          Calendars. iOS asks for full access because that is the only level at
          which the system event screen can be opened at all; the app adds the
          one event you asked for and never reads your calendar.
        </p>
      </Section>

      <Section title="Photos and the camera">
        <p>
          The app asks for these only when you add a photo to a hobby, and it
          copies the image into its own storage rather than reading your library
          afterwards. Declining leaves everything else working. You can change
          your mind in <strong>Settings &rarr; Aspect Niche</strong> in iOS.
        </p>
      </Section>

      <Section title="My friend replied to an invitation but I do not see it">
        <p>
          It depends on whether you were signed in when you sent it. Signed in,
          a guest&rsquo;s answer reaches you in the app, with a notification if
          you allowed them.
        </p>
        <p>
          Signed out, there is nothing in between: the answer travels back as a
          link, and it appears on your side once you open the reply link your
          friend sent you. So the guest list is who has replied <em>and</em>{" "}
          whose reply you have opened, not a live roster.
        </p>
        <p>
          Your friend never needs the app or an account to answer; the
          invitation opens in any browser.
        </p>
      </Section>

      <Section title="Address suggestions are not appearing">
        <p>
          The <strong>Where</strong> field looks addresses up over the internet
          and needs a connection and at least three characters. If it stays
          quiet, type the name of the place instead. Anything you type is
          accepted, and &ldquo;my flat&rdquo; is a perfectly good answer.
        </p>
      </Section>

      <Section title="How do I delete everything?">
        <p>
          <strong>From this phone:</strong> Settings &rarr; Your data &rarr;
          Erase. That clears your hobbies, sessions, notes, photos, boards and
          plans from the phone. If you have an account, its copy is not erased,
          and the next sync brings it back.
        </p>
        <p>
          <strong>Your account, and everything our servers hold for it:</strong>{" "}
          Settings &rarr; Account &amp; sync &rarr; Delete my account. It takes
          effect straight away and cannot be undone; what is on your phone
          stays. If you only want the synced copy gone, choose to delete the
          copy when you sign out instead.
        </p>
        <p>
          If you cannot use the app, email us from the address you sign in with
          and we will delete the account within 30 days. The{" "}
          <Link href="/privacy">Privacy Policy</Link> sets out exactly what is
          kept, and where.
        </p>
      </Section>

      <Section title="The membership and what it costs">
        <p>
          Every hobby is free, with or without an account. An optional
          membership, sold monthly or yearly through the App Store, adds room:
          more hobbies of your own, more photo backup and more answers from the
          AI features, and no sponsored row.
        </p>
        <p>
          Manage or cancel it in your Apple ID&rsquo;s subscription settings, or
          from Manage subscription in the app. Deleting your account does not
          cancel it. Payment and refunds are handled by Apple, under its own
          policies. When a membership ends, nothing you made is taken away. The{" "}
          <Link href="/terms">Terms of Use</Link> have the details.
        </p>
      </Section>

      <Section title="Accessibility">
        <p>
          The app supports VoiceOver, Dynamic Type and Reduce Motion, and this
          site is built to WCAG 2.1 AA, including reduced motion and full
          keyboard use. If something is hard to read, hard to reach, or unusable
          with assistive technology, please tell us. That is a bug and we would
          like to fix it.
        </p>
      </Section>

      <Section title="Reporting a security or privacy issue">
        <p>
          Email the address above with &ldquo;security&rdquo; in the subject.
          Please give us a reasonable chance to fix an issue before describing
          it publicly.
        </p>
      </Section>
    </LegalPage>
  );
}
