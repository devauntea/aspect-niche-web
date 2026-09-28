import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Section, List } from "@/app/_legal/LegalPage";

// The terms the App Store and the ordinary "can I get sued" checklist both ask
// for, written from what the product actually is. Every limitation below
// describes something the software really does or really does not do.
//
// Rewritten 26 September 2026. The first version described an app with no
// account, no purchases and nothing leaving the phone. Since then the app
// gained optional accounts that sync, photo backup, clubs, live replies to
// invitations, a subscription sold through Apple, one sponsored row, and help
// from an AI model -- and a page that still said otherwise would have been a
// promise the product broke.

export const metadata: Metadata = {
  title: "Terms of Use — Aspect Niche",
  description:
    "The terms for using Aspect Niche, a hobby-discovery app and website: accounts, the membership subscription, AI help, clubs and your content.",
};

export default function Terms() {
  return (
    <LegalPage
      title="Terms of Use"
      updated="26 September 2026"
      lede="Aspect Niche is free to use and complete without an account. An
            optional account carries your things between phones, and an
            optional membership adds room. These terms explain what you can
            expect from it and what it expects from you."
    >
      <Section title="Who provides this">
        <p>
          Aspect Niche is made and operated by Devauntae Norman, an individual
          developer, reachable at{" "}
          <a href="mailto:devauntaenorman@gmail.com">
            devauntaenorman@gmail.com
          </a>
          . &ldquo;We&rdquo; and &ldquo;us&rdquo; below mean that person. These
          terms cover the Aspect Niche mobile app and this website.
        </p>
      </Section>

      <Section title="Who it is for">
        <p>
          Aspect Niche is intended for adults.{" "}
          <strong>You must be 18 or older to use it.</strong> By using it you
          confirm that you are.
        </p>
        <p>
          This is a condition of use rather than a gate: the app works without
          an account, so there is often nothing to attach an age to. It is here
          because some of what the app helps you plan — bars, and hobbies that
          carry real physical risk — is not suitable for children.
        </p>
      </Section>

      <Section title="Using it">
        <p>
          You may use Aspect Niche for your own personal, non-commercial
          purposes. Every hobby in it is free, with or without an account.
        </p>
        <List
          items={[
            "Do not attempt to break, overload, or gain unauthorised access to the website, the app or the services behind them.",
            "Do not scrape or bulk-download the hobby catalogue or the place data for republication.",
            "Do not use invitations, clubs or anything else in the app to harass, threaten or deceive anyone.",
            "Do not try to get around the limits on free use, or use the AI features to produce anything unlawful or harmful.",
          ]}
        />
      </Section>

      <Section title="Accounts">
        <p>
          An account is optional. Signing in uses a six-digit code sent to your
          email address; there is no password. With an account, your hobbies,
          notes and plans are copied to our servers so they can reach another
          phone you sign in on. You are responsible for keeping access to your
          email address, since that is how you get back in.
        </p>
        <p>
          You can sign out at any time, and you can delete the account&rsquo;s
          copy of your things from the app when you do. Signing out never
          removes anything from the phone you are holding.
        </p>
      </Section>

      <Section title="The membership">
        <p>
          A membership is an optional subscription that adds room. It does not
          unlock any hobby: the catalogue is free for everyone. While active, it
          includes:
        </p>
        <List
          items={[
            "More hobbies of your own than the three a free account can make.",
            "Backup for up to 5,000 photos, instead of 100.",
            "Up to 200 answers a month from the AI features, instead of 5.",
            "No sponsored row in the app.",
          ]}
        />
        <p>
          <strong>Payment and renewal.</strong> Memberships are sold monthly or
          yearly through the Apple App Store, at the price shown in the app
          before you buy. Payment is charged to your Apple ID when you confirm
          the purchase. A membership renews automatically at the end of each
          period, at the same length and price, unless you turn off auto-renewal
          at least 24 hours before the period ends. Your Apple ID is charged for
          the renewal within the 24 hours before the period ends.
        </p>
        <p>
          <strong>Cancelling.</strong> You can manage or cancel a membership at
          any time in your Apple ID&rsquo;s subscription settings, or from
          Manage subscription in the app. Cancelling stops the next renewal; the
          membership stays active until the end of the period you have paid for.
        </p>
        <p>
          <strong>Refunds.</strong> Purchases are processed by Apple, and
          refunds are handled by Apple under its own policies at
          reportaproblem.apple.com. We cannot issue or override them. A refunded
          membership ends when the refund is made.
        </p>
        <p>
          <strong>
            When a membership ends, nothing you made is taken away.
          </strong>{" "}
          Every hobby, note and photo stays on your phone, editable, and photos
          already backed up stay backed up. The free limits apply only to what
          you add after that.
        </p>
        <p>
          If we change the price, Apple will tell you before it applies, and you
          can cancel before your next renewal. Purchases are verified through a
          service called RevenueCat, which tells our servers whether a
          membership is active.
        </p>
      </Section>

      <Section title="The sponsored row">
        <p>
          Free use shows one sponsored row, at the foot of the Discover and
          Plans lists, labelled &ldquo;Sponsored&rdquo;. It is served by
          Google&rsquo;s advertising service and is not personalised to you. A
          sponsored row is not a recommendation from us, and we are not
          responsible for what an advertiser offers. Members see none.
        </p>
      </Section>

      <Section title="Links to shops and classes">
        <p>
          Some links to gear and classes are affiliate links: if you buy
          through one we may earn a commission, at no cost to you. We choose
          what is listed for someone starting out, and a commission never
          decides what appears or where. Purchases and bookings are between you
          and that shop or organiser, under their terms; we are not responsible
          for what they sell. As an Amazon Associate, Aspect Niche earns from
          qualifying purchases.
        </p>
      </Section>

      <Section title="Help from AI">
        <p>
          When you are signed in, the app can write a plan for your first time
          at a hobby, answer questions about a hobby, look back over your own
          notes, and suggest where a hobby you made yourself might be done.
          These answers are written by an AI model, run for us by Groq, and are
          labelled as written by AI wherever they appear.
        </p>
        <p>
          <strong>AI answers can be wrong.</strong> They are not instruction, a
          safety assessment, or medical, financial or professional advice, and
          they do not know a place&rsquo;s current prices, hours or rules. Check
          anything that matters with the place or a qualified person before you
          rely on it.
        </p>
        <p>
          To produce an answer, what you asked and the details it needs — the
          hobby, the place you picked, and your notes for that hobby — are sent
          to the model provider. Use of the AI features is limited each month,
          as described above.
        </p>
      </Section>

      <Section title="Your content stays yours">
        <p>
          The notes, photos, plans and hobbies you add are yours, and we claim
          no ownership of them. Everything lives on your device first. If you
          sign in, you give us permission to store and transmit a copy only so
          far as that is needed to carry it to your other phones and to run the
          features you use — nothing else. See the{" "}
          <Link href="/privacy">Privacy Policy</Link> for exactly what is stored
          where.
        </p>
        <p>
          Some things stay on the phone even with an account: unfinished draft
          notes, vision boards, and photos beyond your backup limit.{" "}
          <strong>
            You are responsible for keeping copies of anything you cannot afford
            to lose
          </strong>
          ; the app&rsquo;s Keeping a copy setting exports one.
        </p>
      </Section>

      <Section title="Clubs, invitations and what other people see">
        <p>
          A club is shared with the people in it, and an invitation with the
          people you send it to. What you write there — your name, a
          club&rsquo;s name and description, the message on an invitation — is
          seen by them, and you are responsible for it. Do not write anything
          unlawful, abusive, or that you do not have the right to share.
        </p>
        <p>
          Clubs are private: there is no public directory, and a club is reached
          only through its link. You can report a club from inside the app. We
          may remove a club or end access to clubs for anyone who breaks these
          terms.
        </p>
        <p>
          When a signed-in host sends an invitation, guests&rsquo; replies pass
          through our servers so the host can see them. Otherwise an invitation
          travels between you and the person you send it to, through whichever
          messaging app you choose.
        </p>
      </Section>

      <Section title="Places to go">
        <p>
          Suggested places come from open map data — Overture Maps, and
          OpenStreetMap where that is not available — ranked for a first visit.
          Map data can be out of date or wrong: a place may have moved, closed,
          or never been what its listing says. A suggestion is not an
          endorsement, and you should check a place before you go.
        </p>
      </Section>

      <Section title="The hobby content is information, not advice">
        <p>
          The catalogue, first steps and linked resources are general
          information to help you find something to try. Some hobbies carry real
          physical risk — climbing, kayaking, blacksmithing, glassblowing and
          others. Nothing here is instruction, training, or a safety assessment,
          and it is not medical, financial or professional advice.
        </p>
        <p>
          <strong>
            Use your own judgement, get proper instruction where a hobby calls
            for it, and follow the safety guidance of the people running the
            activity.
          </strong>{" "}
          Links to third-party sites and videos are suggestions; we do not
          control them and are not responsible for their content or safety.
        </p>
      </Section>

      <Section title="Availability">
        <p>
          Aspect Niche is provided as it is, without any warranty. We do not
          promise it will be available, uninterrupted, or free of errors, and we
          may change or discontinue any part of it. The app keeps working on
          your phone without our servers; accounts, backup, clubs, AI help and
          place suggestions need them. If we ever discontinue a paid feature, we
          will say so in the app first.
        </p>
      </Section>

      <Section title="Liability">
        <p>
          To the fullest extent the law allows, we are not liable for indirect
          or consequential loss, lost data, loss arising from a hobby you chose
          to take up or a place you chose to visit, or loss from relying on an
          AI answer. Our total liability to you for anything else is limited to
          what you paid us in the twelve months before the claim. Nothing here
          limits liability that cannot legally be limited — including for death
          or personal injury caused by negligence, or for fraud.
        </p>
        <p>
          If you are a consumer, you keep every right your local consumer law
          gives you, and nothing in these terms takes those rights away.
        </p>
      </Section>

      <Section title="The App Store">
        <p>
          These terms are between you and us, not Apple. Apple is not
          responsible for the app or its content, has no obligation to provide
          maintenance or support for it, and is not responsible for any claims
          relating to it, including product liability, legal or regulatory
          claims, or claims that it infringes someone&rsquo;s intellectual
          property. If the app fails to conform to a warranty that applies by
          law, you may notify Apple, and Apple may refund the purchase price, if
          any; beyond that, Apple has no warranty obligation. Apple and its
          subsidiaries are third-party beneficiaries of these terms and may
          enforce them against you.
        </p>
      </Section>

      <Section title="Ending use">
        <p>
          You can stop using Aspect Niche at any time, and delete your
          account&rsquo;s copy of your things from the app. We may suspend or
          end an account that breaks these terms. Ending an account does not
          cancel an Apple subscription; cancel that in your Apple ID settings.
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
          If these terms change, the date at the top changes with them. If a
          change affects what a membership includes or costs, we will say so in
          the app before it applies. Carrying on using Aspect Niche after a
          change means the new version applies.
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
