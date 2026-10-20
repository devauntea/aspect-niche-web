import Link from "next/link";
import { CONTACT_EMAIL } from "../_site/sections";

// The questions people ask before they try something. Every answer is taken
// from the Privacy Policy and Terms of Use as they stand, which is why each
// one links there: those pages are the source, and this is the short version.

const QUESTIONS: { q: string; a: React.ReactNode }[] = [
  {
    q: "When can I get it?",
    a: (
      <p>
        Aspect Niche is coming soon for iPhone and iPad. Until it is on the App
        Store, the film above is the best look at it.
      </p>
    ),
  },
  {
    q: "Does a friend need the app to answer an invitation?",
    a: (
      <p>
        No. An invitation is a link that opens in any browser, where they answer
        with just their name. Nothing else is asked of them, and they never need
        an account.
      </p>
    ),
  },
  {
    q: "Do I need an account?",
    a: (
      <p>
        No. The app works fully without one, and what you make stays on your
        phone. An optional account, signed in with a six-digit code sent to your
        email, carries your collection, notes and plans to another phone. The{" "}
        <Link className="text-link" href="/privacy">
          Privacy Policy
        </Link>{" "}
        lists exactly what it stores.
      </p>
    ),
  },
  {
    q: "What does it cost?",
    a: (
      <p>
        Every hobby is free, with or without an account. An optional membership,
        bought through the App Store, adds room: more hobbies of your own, more
        photo backup and more answers from the AI features, and no sponsored
        row. The{" "}
        <Link className="text-link" href="/terms">
          Terms of Use
        </Link>{" "}
        have the details.
      </p>
    ),
  },
  {
    q: "What does this website collect?",
    a: (
      <p>
        It sets no cookies and runs no analytics, and it loads nothing from any
        other company: the fonts and the film are served from here. The one
        thing it remembers is the name you type on a repeating-plan page, in
        your own browser.
      </p>
    ),
  },
  {
    q: "Who makes it?",
    a: (
      <p>
        One independent developer, Devauntae Norman. Questions, bugs and ideas
        all reach the same person at{" "}
        <a className="text-link" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    ),
  },
];

export default function Questions() {
  return (
    <section
      className="questions"
      id="questions"
      aria-labelledby="questions-title"
    >
      <div className="container questions-grid">
        <div>
          <h2 id="questions-title">Good questions.</h2>
          <p className="questions-intro">
            The short answers. The{" "}
            <Link className="text-link" href="/support">
              Support page
            </Link>{" "}
            has the longer ones.
          </p>
        </div>
        <div className="questions-list">
          {QUESTIONS.map(({ q, a }) => (
            <details key={q}>
              <summary>
                <span>{q}</span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  aria-hidden="true"
                >
                  <path
                    d="M4 9h10M9 4v10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </summary>
              <div className="answer">{a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
