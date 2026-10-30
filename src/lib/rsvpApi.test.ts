import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendRsvp } from "@/lib/rsvpApi";

function reply(status: number, body: unknown) {
  const fetch = vi.fn(async (_url: string, _init?: RequestInit) => new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("sendRsvp", () => {
  it("posts the answer to the rsvp function with no key", async () => {
    const fetch = reply(200, { ok: true });
    expect(await sendRsvp("mh3x9qab12cd", "Sam", "going")).toEqual({ ok: true });
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe("https://project.supabase.co/functions/v1/rsvp");
    expect(JSON.parse(init!.body as string)).toEqual({ inviteId: "mh3x9qab12cd", guestName: "Sam", status: "going" });
    expect(init!.headers).toEqual({ "Content-Type": "application/json" });
  });

  it("is unknown only when the function says no host registered it", async () => {
    reply(404, { error: "unknown invitation" });
    expect(await sendRsvp("mh3x9qab12cd", "Sam", "going")).toEqual({ ok: false, reason: "unknown" });
  });

  it("calls any other 404, a full invitation or an unreadable 200 a failure", async () => {
    reply(404, { code: "NOT_FOUND", message: "Requested function was not found" });
    expect(await sendRsvp("mh3x9qab12cd", "Sam", "going")).toEqual({ ok: false, reason: "failed" });
    reply(429, { error: "this invitation has all the answers it can take" });
    expect(await sendRsvp("mh3x9qab12cd", "Sam", "going")).toEqual({ ok: false, reason: "failed" });
    reply(200, null);
    expect(await sendRsvp("mh3x9qab12cd", "Sam", "going")).toEqual({ ok: false, reason: "failed" });
  });

  it("fails on a network error, and without a project sends nothing", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new Error("offline"))));
    expect(await sendRsvp("mh3x9qab12cd", "Sam", "going")).toEqual({ ok: false, reason: "failed" });
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    const fetch = reply(200, { ok: true });
    expect(await sendRsvp("mh3x9qab12cd", "Sam", "going")).toEqual({ ok: false, reason: "failed" });
    expect(fetch).not.toHaveBeenCalled();
  });
});
