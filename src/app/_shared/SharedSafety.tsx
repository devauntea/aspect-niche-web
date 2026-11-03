"use client";
import { useState } from "react";
import { safetyRequest } from "@/lib/sharedAuth";
export default function SharedSafety({ kind, id, names, onBlocked }: { kind: "invite" | "series"; id: string; names: string[]; onBlocked: () => void }) {
  const [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [confirm, setConfirm] = useState(false);
  const [reason, setReason] = useState("harassment"), [details,setDetails] = useState(""), [guestName,setGuestName] = useState(""), [message,setMessage] = useState("");
  const act = async (action: "report" | "block") => {
    if (busy) return;
    setBusy(true); setMessage("");
    try {
      await safetyRequest({ action, kind, targetId: id, ...(guestName ? { guestName } : {}), reason, details });
      if (action === "block") onBlocked(); else setMessage("Report received. You can also block this account.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not complete this request."); }
    finally { setBusy(false); }
  };
  return <section className="invite-shell" style={{ margin: "0 auto 24px" }}>
    <button onClick={() => setOpen(!open)} aria-expanded={open}>Report or block</button>
    {open && <div style={{ display: "grid", gap: 16, marginTop: 20 }}>
      <p>Reports include this activity, your account ID and the details you enter. They are private to the moderation team.</p>
      <label>About<select value={guestName} onChange={(e) => setGuestName(e.target.value)}><option value="">The host</option>{names.map((n) => <option key={n}>{n}</option>)}</select></label>
      <label>Reason<select value={reason} onChange={(e) => setReason(e.target.value)}>{["harassment","hate","sexual","violence","spam","other"].map((r) => <option key={r}>{r}</option>)}</select></label>
      <label>Details<textarea maxLength={1000} value={details} onChange={(e) => setDetails(e.target.value)} /></label>
      <button className="invite-send" disabled={busy} onClick={() => void act("report")}>Send report</button>
      {confirm ? <><p>Block this account and stop its activities, replies and updates? You can undo this in the app.</p><button disabled={busy} onClick={() => void act("block")}>Confirm block</button><button onClick={() => setConfirm(false)}>Cancel</button></> : <button disabled={busy} onClick={() => setConfirm(true)}>Block this account</button>}
      <p role="status">{message}</p><a href="/support">Contact support</a>
    </div>}
  </section>;
}
