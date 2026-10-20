import Image from "next/image";
import Link from "next/link";
import { CONTACT_EMAIL, SECTIONS } from "./sections";

// The footer every page shares. The store requires a reachable privacy policy
// and support page, and the footer is where a reviewer looks for them.

export default function SiteFooter({
  onLanding = false,
}: {
  onLanding?: boolean;
}) {
  return (
    <footer className="site-footer">
      <div className="container site-footer-grid">
        <div>
          <Link className="brand" href="/">
            <Image src="/brand/logo-tile.png" alt="" width={28} height={28} />
            <span>Aspect Niche</span>
          </Link>
          <p className="site-footer-tagline">
            A hobby discovery app for the endlessly curious. Follow your
            curiosity.
          </p>
          <p className="site-footer-status">Coming soon for iPhone and iPad.</p>
        </div>

        <nav aria-labelledby="footer-explore">
          <h2 id="footer-explore">Explore</h2>
          <ul>
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={onLanding ? `#${s.id}` : `/#${s.id}`}>{s.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-help">
          <h2 id="footer-help">Help</h2>
          <ul>
            <li>
              <Link href="/support">Support</Link>
            </li>
            <li>
              <Link href="/privacy">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms">Terms of Use</Link>
            </li>
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`}>Email us</a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="container site-footer-legal">
        <p>Aspect Niche™, © 2026 Devauntae Norman. All rights reserved.</p>
        <p>No cookies, no analytics, nothing loaded from anyone else.</p>
      </div>
    </footer>
  );
}
