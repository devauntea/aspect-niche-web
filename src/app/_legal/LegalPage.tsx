import { Children, isValidElement } from "react";
import Link from "next/link";
import SiteHeader from "../_site/SiteHeader";
import SiteFooter from "../_site/SiteFooter";
import LegalContents from "./LegalContents";
import "./legal.css";

// Shared chrome for Privacy, Terms and Support, so they cannot drift apart.
//
// The same night as the rest of the site, but set for reading: one column at a
// comfortable measure, body text a step larger than the landing's, and a
// contents list beside it on wide screens, because these pages are consulted
// rather than read top to bottom. Nothing here moves.

/** A stable anchor for a section title, so a heading can be linked to. */
export function slug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const id = slug(title);
  return (
    <section className="legal-section" aria-labelledby={id}>
      <h2 id={id}>
        <a href={`#${id}`}>{title}</a>
      </h2>
      <div className="legal-body">{children}</div>
    </section>
  );
}

export function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="legal-list">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export function LegalPage({
  title,
  updated,
  lede,
  children,
}: {
  title: string;
  updated: string;
  lede: string;
  children: React.ReactNode;
}) {
  // The contents list, from the Section titles this page is made of.
  const entries = Children.toArray(children)
    .filter(
      (c): c is React.ReactElement<{ title: string }> =>
        isValidElement(c) && c.type === Section,
    )
    .map((c) => ({ id: slug(c.props.title), title: c.props.title }));

  return (
    <div className="legal">
      <SiteHeader />
      <main id="main" className="container legal-layout">
        <header className="legal-head">
          <nav aria-label="Breadcrumb" className="legal-crumbs">
            <Link href="/">Aspect Niche</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{title}</span>
          </nav>
          <h1>{title}</h1>
          <p className="legal-updated">Last updated {updated}</p>
          <p className="legal-lede">{lede}</p>
        </header>

        <LegalContents entries={entries} />

        <article className="legal-article">{children}</article>
      </main>
      <SiteFooter />
    </div>
  );
}
