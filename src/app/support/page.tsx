import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Section, List } from "@/app/_legal/LegalPage";

// App Store Connect requires a Support URL that actually resolves and offers a
// way to get help. A page that only says "email me" technically satisfies it
// and helps nobody, so this answers the questions the app can actually raise —
// most of which are "where did my data go", and have real answers here because
// the answer is always "on your device".

export const metadata: Metadata = {
  title: "Support — Aspect Niche",
  description:
    "Help with Aspect Niche: where your data lives, calendar and photo permissions, invitations, and how to get in touch.",
};

export default function Support() {
  return (
    <LegalPage
      title="Support"
      updated="8 September 2026"
      lede="Aspect Niche keeps everything on your device, which answers most
            questions about it. Here are the ones that come up, and how to reach
            a person if yours is not among them."
    >
      <Section title="Get in touch">
        <p>
          Email{" "}
          <a href="mailto:devauntaenorman@gmail.com">
            devauntaenorman@gmail.com
          </a>
          . It is one person reading, so please allow a few days.
        </p>
        <p>
          If you are reporting something broken, it helps enormously to include
          your device model, your iOS version, and what you were doing just
          before it went wrong.
        </p>
      </Section>

      <Section title="Where is my collection stored?">
        <p>
          On your phone, in the app&rsquo;s own storage. There is no account and
          no server, so nothing syncs between devices and nothing is backed up
          to us.
        </p>
        <p>
          <strong>This means you should not rely on the app as the only copy of
          a photo you care about.</strong> Deleting the app deletes what it
          held, and we have no way to restore it.
        </p>
      </Section>

      <Section title="I moved to a new phone and my hobbies are gone">
        <p>
          Because everything is on-device, a new phone starts empty. An
          encrypted iPhone backup restored to the new device will bring the app
          and its contents across; a fresh install will not.
        </p>
      </Section>

      <Section title="Scheduling a session did not reach my calendar">
        <p>
          Aspect Niche opens your calendar&rsquo;s own new-event screen with the
          details filled in. You still have to tap <strong>Add</strong> there —
          if you tapped Cancel, nothing is saved.
        </p>
        <p>
          If the screen never appears, calendar access is probably off. Open{" "}
          <strong>Settings &rarr; Aspect Niche</strong> and turn on Calendars.
          iOS asks for full access because that is the only level at which the
          system event screen can be opened at all; the app adds the one event
          you asked for and never reads your calendar.
        </p>
      </Section>

      <Section title="Photos and the camera">
        <p>
          The app asks for these only when you add a photo to a hobby, and it
          copies the image into its own storage rather than reading your library
          afterwards. Declining leaves everything else working. You can change
          your mind in <strong>Settings &rarr; Aspect Niche</strong>.
        </p>
      </Section>

      <Section title="My friend replied to an invitation but I do not see it">
        <p>
          An invitation travels entirely inside a link, and so does the reply.
          Their answer only appears on your side once you open the reply link
          they sent back.
        </p>
        <p>
          So the guest list is who has replied <em>and</em> whose reply you have
          opened — not a live roster. There is no server keeping the two of you
          in sync.
        </p>
      </Section>

      <Section title="Address suggestions are not appearing">
        <p>
          The <strong>Where</strong> field looks addresses up over the internet
          and needs a connection and at least three characters. If it stays
          quiet, type the name of the place instead — anything you type is
          accepted, and &ldquo;my flat&rdquo; is a perfectly good answer.
        </p>
      </Section>

      <Section title="How do I delete everything?">
        <p>
          In the app, go to <strong>You &rarr; Erase my data</strong>. That
          clears your collection, notes, photos, plans and settings from the
          device. Deleting the app removes it all too.
        </p>
        <p>
          There is nothing for us to delete on our side, because we never
          received anything. The{" "}
          <Link href="/privacy">Privacy Policy</Link> sets out exactly what
          lives where.
        </p>
      </Section>

      <Section title="Accessibility">
        <p>
          The app supports VoiceOver, Dynamic Type and Reduce Motion, and this
          site is built to WCAG 2.1 AA. If something is hard to read, hard to
          reach, or unusable with assistive technology, please tell us — that is
          a bug and we would like to fix it.
        </p>
      </Section>

      <Section title="Reporting a security or privacy issue">
        <p>
          Email the address above with &ldquo;security&rdquo; in the subject.
          Please give us a reasonable chance to fix an issue before describing it
          publicly.
        </p>
      </Section>

      <Section title="What it costs">
        <p>
          Nothing. There are no purchases, subscriptions or adverts, so there is
          nothing to cancel and nothing to refund. See the{" "}
          <Link href="/terms">Terms of Use</Link>.
        </p>
      </Section>
    </LegalPage>
  );
}
