"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { sharedAuth, safetyRequest } from "@/lib/sharedAuth";
import { getSeries } from "@/lib/seriesApi";
import { formatInviteWhen, encodeInvite, type Invite } from "@/lib/invite";
import { nextGames, UPCOMING_GAMES } from "@/lib/series";
import InviteView from "@/app/i/InviteView";
import { artUrl } from "@/app/i/art";
import SeriesView from "@/app/s/SeriesView";
import SeriesTakeBack from "@/app/s/SeriesTakeBack";
import SharedSafety from "./SharedSafety";

function ActivitySession({ kind, id }: { kind: "invite" | "series"; id: string }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState<{ owner: string; request: number; invite?: Invite; series?: Exclude<Awaited<ReturnType<typeof getSeries>>, string>; now: number } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [blocked, setBlocked] = useState(false);
  useEffect(() => {
    if (!sharedAuth) return;
    let live = true;
    void sharedAuth.auth.getSession().then(({ data, error }) => { if (live) { setSession(data.session); setReady(true); if (error) setMessage("Your session could not be restored. Please sign in again."); } }).catch(() => { if (live) { setReady(true); setMessage("Your session could not be restored. Please sign in again."); } });
    const { data } = sharedAuth.auth.onAuthStateChange((_event, next) => { if (live) setSession(next); });
    return () => { live = false; data.subscription.unsubscribe(); };
  }, []);
  useEffect(() => {
    if (!session || !id) return;
    let live = true;
    void (async () => {
      try {
        const result = await safetyRequest({ action: "check", kind, targetId: id });
        const series = kind === "series" ? await getSeries(id) : undefined;
        if (series && typeof series !== "object") throw new Error("This schedule could not load.");
        if (live) { setLoaded({ owner: session.user.id, request: attempt, invite: kind === "invite" ? result.doc : undefined, series: typeof series === "object" ? series : undefined, now: Date.now() }); setMessage(""); }
      } catch (error) { if (live) setMessage(error instanceof Error ? error.message : "Please try again."); }
    })();
    return () => { live = false; };
  }, [session, kind, id, attempt]);
  const signIn = async () => {
    if (!sharedAuth || busy) return;
    setBusy(true); setMessage("");
    try {
      const result = sent ? await sharedAuth.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" }) : await sharedAuth.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
      if (result.error) throw result.error;
      if (!sent) { setSent(true); setMessage("Check your email for the six-digit code."); }
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not sign in. Try again."); }
    finally { setBusy(false); }
  };
  if (blocked) return <main className="invite-page"><article className="invite-shell"><h1>Account blocked</h1><p>This activity is hidden and its updates are stopped. Manage blocked accounts in the app under Settings.</p><a href="/support">Get help</a></article></main>;
  const current = loaded?.owner === session?.user.id && loaded?.request === attempt ? loaded : null;
  if (current) return <>
    {current.invite ? <InviteView invite={current.invite} encoded={encodeInvite(current.invite)} when={formatInviteWhen(current.invite.startsAt,current.invite.tzOffset)} art={artUrl(current.invite.background)} /> : current.series ? <main className="invite-page"><article className="invite-shell">
      <p className="invite-kicker">Hosted by {current.series.series.host}</p><h1 className="invite-title">{current.series.series.title}</h1>
      <p>{current.series.series.place}</p><p>{current.series.series.note}</p>
      {current.series.series.ended ? <><p>This series has ended.</p><SeriesTakeBack id={id} answers={current.series.answers} /></> : nextGames(current.series.series,current.now,UPCOMING_GAMES).length ? <SeriesView id={id} series={current.series.series} answers={current.series.answers} games={nextGames(current.series.series,current.now,UPCOMING_GAMES)} /> : <p>No games are scheduled.</p>}
    </article></main> : null}
    <SharedSafety kind={kind} id={id} names={current.series ? [...new Set(current.series.answers.map((a) => a.name))] : []} onBlocked={() => setBlocked(true)} />
    <p style={{ textAlign: "center", padding: 24 }}><button onClick={() => void sharedAuth?.auth.signOut()}>Sign out</button></p>
  </>;
  return <main className="invite-page"><article className="invite-shell"><p className="invite-kicker">Aspect Niche</p><h1 className="invite-broken-title">A shared activity</h1>
    {!sharedAuth ? <p>Sign-in is temporarily unavailable on this page. Please open the invitation in the Aspect Niche app or contact <a href="/support">support</a>.</p> : !ready ? <p>Checking your account…</p> : session ? <><p role="status">{message || "Checking this activity…"}</p><button className="invite-send" onClick={() => setAttempt((a) => a + 1)}>Try again</button></> : <form onSubmit={(e) => { e.preventDefault(); void signIn(); }}>
      <p>Sign in or create an account to reply and control who can contact you. Your email stays private.</p>
      <label className="invite-field">Email<input type="email" required value={email} autoComplete="email" disabled={sent || busy} onChange={(e) => setEmail(e.target.value)} /></label>
      {sent && <label className="invite-field">Six-digit code<input required value={code} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} onChange={(e) => setCode(e.target.value)} /></label>}
      <p>By continuing, you confirm you are 18 or older and accept the <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.</p>
      <button className="invite-send" disabled={busy}>{busy ? "Please wait…" : sent ? "Verify code" : "Email me a code"}</button>
      {sent && <button type="button" disabled={busy} onClick={() => { setSent(false); setCode(""); }}>Use another email or resend</button>}
      <p role="status">{message}</p>
    </form>}
    <footer className="invite-foot"><a href="/support">Help and support</a><Link href="/">About Aspect Niche</Link></footer>
  </article></main>;
}

// Changing activity identity unmounts the previous content and its pending requests.
export default function SharedActivity(props: { kind: "invite" | "series"; id: string }) {
  return <ActivitySession key={`${props.kind}:${props.id}`} {...props} />;
}
