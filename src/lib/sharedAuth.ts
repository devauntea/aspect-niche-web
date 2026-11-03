import { createClient } from "@supabase/supabase-js";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Session tokens use browser storage; no service-role key belongs in this app.
export const sharedAuth = url && key ? createClient(url, key, { auth: { detectSessionInUrl: false } }) : null;
export async function sharedHeaders(): Promise<Record<string,string>> {
  if (!sharedAuth) return {};
  const { data } = await sharedAuth.auth.getSession();
  return data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {};
}
export async function safetyRequest(body: Record<string,unknown>) {
  const response = await fetch(`${url ?? ""}/functions/v1/safety`, {
    method: "POST", headers: { "Content-Type": "application/json", ...await sharedHeaders() },
    body: JSON.stringify(body), cache: "no-store", signal: AbortSignal.timeout(10000),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "Please try again.");
  return data;
}
