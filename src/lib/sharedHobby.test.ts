import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  inviteHeadline,
  isShareToken,
  peekShare,
  peopleLine,
} from "@/lib/sharedHobby";

const TOKEN = "AbCdEfGhIjKlMnOpQrStU_";

function reply(status: number, body: unknown) {
  const fetch = vi.fn(
    async () => new Response(JSON.stringify(body), { status }),
  );
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("isShareToken", () => {
  it("accepts exactly 22 base64url characters", () => {
    expect(isShareToken(TOKEN)).toBe(true);
    expect(isShareToken("test")).toBe(false);
    expect(isShareToken(`${TOKEN}x`)).toBe(false);
    expect(isShareToken("AbCdEfGhIjKlMnOpQrSt/=")).toBe(false);
  });
});

describe("peekShare", () => {
  it("never calls the function for something that cannot be a token", async () => {
    const fetch = reply(200, {});
    expect(await peekShare("test")).toEqual({ kind: "gone" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("asks with the anon key and the peek action only", async () => {
    const fetch = reply(200, {
      ok: true,
      share: {
        activityId: "pottery",
        title: "Pottery",
        from: "Sam",
        people: 3,
      },
    });
    expect(await peekShare(TOKEN)).toEqual({
      kind: "found",
      share: { title: "Pottery", from: "Sam", people: 3 },
    });
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://example.supabase.co/functions/v1/shared-hobby");
    expect(init.headers).toMatchObject({
      apikey: "anon",
      Authorization: "Bearer anon",
    });
    expect(JSON.parse(init.body as string)).toEqual({
      action: "peek",
      token: TOKEN,
    });
    expect(init.cache).toBe("no-store");
  });

  it("is gone only when the function itself says so", async () => {
    reply(404, {
      error: "This link no longer works. Ask whoever sent it for a new one.",
    });
    expect(await peekShare(TOKEN)).toEqual({ kind: "gone" });
  });

  it("calls an undeployed function, an outage or a bad body a failure, not a dead link", async () => {
    reply(404, {
      code: "NOT_FOUND",
      message: "Requested function was not found",
    });
    expect(await peekShare(TOKEN)).toEqual({ kind: "failed" });
    reply(503, { error: "Could not reach shared hobbies. Please try again." });
    expect(await peekShare(TOKEN)).toEqual({ kind: "failed" });
    reply(200, { ok: true, share: { title: "Pottery" } });
    expect(await peekShare(TOKEN)).toEqual({ kind: "failed" });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Promise.reject(new Error("offline"))),
    );
    expect(await peekShare(TOKEN)).toEqual({ kind: "failed" });
  });

  it("fails calmly with no backend configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    const fetch = reply(200, {});
    expect(await peekShare(TOKEN)).toEqual({ kind: "failed" });
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("copy", () => {
  it("says who invited you, to what, and how many", () => {
    expect(inviteHeadline({ from: "Sam", title: "Pottery", people: 2 })).toBe(
      "Sam invited you to keep Pottery together",
    );
    expect(peopleLine(1)).toBe("1 person in it so far.");
    expect(peopleLine(4)).toBe("4 people in it so far.");
  });
});
