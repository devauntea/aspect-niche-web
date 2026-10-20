import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "./_site/SiteHeader";
import SiteFooter from "./_site/SiteFooter";

// A wrong turn, in the site's own sky. Says what happened and offers the two
// places someone most likely meant to go.

export const metadata: Metadata = {
  title: "Page not found — Aspect Niche",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="container not-found">
        <Image src="/brand/rabbit-hole.png" alt="" width={160} height={160} />
        <h1>This page is not here.</h1>
        <p>
          The link may be out of date, or cut short in transit. If someone sent
          you an invitation, ask them to send the link again and tap it rather
          than copying it.
        </p>
        <div className="not-found-actions">
          <Link className="btn btn-primary" href="/">
            Go to the home page
          </Link>
          <Link className="btn btn-quiet" href="/support">
            Get help
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
