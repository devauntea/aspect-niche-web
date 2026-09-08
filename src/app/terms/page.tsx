import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Section, List } from "@/app/_legal/LegalPage";

// The terms the App Store and the ordinary "can I get sued" checklist both ask
// for. Written from what the product actually is: a free app with no account,
// no purchases and no user-to-user content on our servers, because there are no
// servers holding user content. Every limitation below describes something the
// software really does or really does not do.

export const metadata: Metadata = {
  title: "Terms of Use — Aspect Niche",
  description:
    "The terms for using Aspect Niche, a free hobby-discovery app and website.",
};

export default function Terms() {
  return (
    <LegalPage
      title="Terms of Use"
      updated="8 September 2026"
      lede="Aspect Niche is free, has no account, and sells nothing. These terms
            explain what you can expect from it and what it expects from you."
    >
      <Section title="Who provides this">
        <p>
          Aspect Niche is made and operated by Devauntae Norman, an individual
          developer, reachable at{" "}
          <a href="mailto:devauntaenorman@gmail.com">
            devauntaenorman@gmail.com
          </a>
          . &ldquo;We&rdquo; and &ldquo;us&rdquo; below mean that person. These
          terms cover the Aspect Niche mobile app and this website, including
          the interactive demo.
        </p>
      </Section>

      <Section title="Using it">
        <p>
          You may use Aspect Niche for your own personal, non-commercial
          purposes. You do not need an account and we do not ask for one.
        </p>
        <List
          items={[
            "Do not attempt to break, overload, or gain unauthorised access to the website or its services.",
            "Do not scrape or bulk-download the hobby catalogue for republication.",
            "Do not use the app to harass anyone, including through the invitations it can generate.",
          ]}
        />
      </Section>

      <Section title="What it costs, and refunds">
        <p>
          Aspect Niche is free. There are no purchases, no subscriptions, no
          in-app payments and no advertising, so there is nothing to refund and
          no refund policy to apply.
        </p>
        <p>
          If that ever changes, this page will say so before any charge exists,
          and any purchase made through the App Store would additionally be
          covered by Apple&rsquo;s own refund process, which we cannot override.
        </p>
      </Section>

      <Section title="Your content stays yours">
        <p>
          The notes and photos you add stay on your device. We claim no licence
          over them, we cannot see them, and we do not store, transmit or back
          them up. See the{" "}
          <Link href="/privacy">Privacy Policy</Link> for exactly where things
          live.
        </p>
        <p>
          Because your content is only on your device, <strong>you are
          responsible for backing it up</strong>. Deleting the app deletes what
          it held, and we have no copy to restore.
        </p>
      </Section>

      <Section title="Invitations">
        <p>
          An invitation is a link you send yourself, through whichever messaging
          app you choose. It travels between you and the person you send it to;
          it does not pass through us. You are responsible for who you send one
          to and what you write in it.
        </p>
      </Section>

      <Section title="The hobby content is information, not advice">
        <p>
          The catalogue, first steps and linked resources are general
          information to help you find something to try. Some hobbies carry real
          physical risk — climbing, kayaking, blacksmithing, glassblowing and
          others. Nothing here is instruction, training, or a safety
          assessment, and it is not medical, financial or professional advice.
        </p>
        <p>
          <strong>Use your own judgement, get proper instruction where a hobby
          calls for it, and follow the safety guidance of the people running the
          activity.</strong> Links to third-party sites and videos are
          suggestions; we do not control them and are not responsible for their
          content or safety.
        </p>
      </Section>

      <Section title="Generated content in the web demo">
        <p>
          The demo can generate a suggested niche hobby using a language model.
          Generated text can be wrong, odd, or inconsistent with the rest of the
          catalogue. It is illustrative, it is not checked by a person before
          you see it, and it should not be relied on as fact.
        </p>
      </Section>

      <Section title="Availability">
        <p>
          Aspect Niche is provided as it is, without any warranty. We do not
          promise it will be available, uninterrupted, or free of errors, and we
          may change or discontinue any part of it. Because the app runs on your
          device, it will keep working if this website does not.
        </p>
      </Section>

      <Section title="Liability">
        <p>
          To the fullest extent the law allows, we are not liable for indirect
          or consequential loss, lost data, or loss arising from a hobby you
          chose to take up. Nothing here limits liability that cannot legally be
          limited — including for death or personal injury caused by negligence,
          or for fraud.
        </p>
        <p>
          If you are a consumer, you keep every right your local consumer law
          gives you, and nothing in these terms takes those rights away.
        </p>
      </Section>

      <Section title="Our own material">
        <p>
          The name Aspect Niche, the rabbit mark, the icon sets, the written
          hobby catalogue and the design of the app and site belong to us.
          Please do not copy them for your own product. The photographs used on
          this site are illustrative samples created for it, and are labelled as
          samples where they appear.
        </p>
      </Section>

      <Section title="Changes to these terms">
        <p>
          If these terms change, the date at the top changes with them. Carrying
          on using Aspect Niche after that means the new version applies.
        </p>
      </Section>

      <Section title="Law">
        <p>
          These terms are governed by the laws of the State of New York, United
          States, and the courts there have jurisdiction. If you are a consumer
          living elsewhere, you may still bring a claim in your own country
          where your local law gives you that right.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about these terms:{" "}
          <a href="mailto:devauntaenorman@gmail.com">
            devauntaenorman@gmail.com
          </a>
        </p>
      </Section>
    </LegalPage>
  );
}
