import Link from "next/link";
import "../i/invite.css";
export default function LegacyLink() {
  return <main className="invite-page"><article className="invite-shell">
    <p className="invite-kicker">Aspect Niche</p><h1 className="invite-broken-title">This older link is unavailable</h1>
    <p className="invite-broken-body">Shared activities now use verified accounts and built-in report and block controls. Ask the host for a new invitation from the updated app. Date proposal links are temporarily unavailable; private date planning still works in the app.</p>
    <p>No reply has been recorded from this link.</p><footer className="invite-foot"><Link href="/support">Help and support</Link><Link href="/">About Aspect Niche</Link></footer>
  </article></main>;
}
