import { afterEach, describe, expect, it, vi } from "vitest";
import { getSeries, sendAnswer } from "@/lib/seriesApi";

function reply(status: number, body: unknown) {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(body), { status })));
}

afterEach(() => vi.unstubAllGlobals());

describe("getSeries", () => {
  it("is missing only when the function says it does not know the series", async () => {
    reply(404, { error: "unknown series" });
    expect(await getSeries("abc")).toBe("missing");
    reply(400, { error: "bad id" });
    expect(await getSeries("abc")).toBe("missing");
  });

  it("calls any other 404 a failure, not a deleted series", async () => {
    reply(404, { code: "NOT_FOUND", message: "Requested function was not found" });
    expect(await getSeries("abc")).toBe("failed");
  });

  it("fails on a network error or a bad document", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new Error("offline"))));
    expect(await getSeries("abc")).toBe("failed");
    reply(200, { series: { nope: true }, answers: [], members: 0 });
    expect(await getSeries("abc")).toBe("failed");
  });
});

describe("sendAnswer", () => {
  it("adopts the name the server kept", async () => {
    reply(200, { ok: true, name: "Sam" });
    expect(await sendAnswer("abc", "2026-10-15", "sam", "going")).toEqual({ ok: true, name: "Sam" });
  });

  it("shows the server's text when the group is full", async () => {
    reply(409, { error: "This group is full (40 people). Ask Ava to make room.", full: true });
    expect(await sendAnswer("abc", "2026-10-15", "Sam", "going")).toEqual({
      ok: false,
      message: "This group is full (40 people). Ask Ava to make room.",
    });
  });

  it("says when the series has ended", async () => {
    reply(409, { error: "this series has ended" });
    expect(await sendAnswer("abc", "2026-10-15", "Sam", null)).toEqual({ ok: false, message: "This series has ended." });
  });

  it("falls back to a plain retry message", async () => {
    reply(502, { error: "could not record the answer" });
    const r = await sendAnswer("abc", "2026-10-15", "Sam", "going");
    expect(r.ok).toBe(false);
  });

  it("does not count a 200 with no readable body as saved", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("<html>", { status: 200 })));
    expect(await sendAnswer("abc", "2026-10-15", "Sam", "going")).toEqual({
      ok: false,
      message: "Could not save your answer. Try again.",
    });
  });

  it("says when the game is no longer open", async () => {
    reply(400, { error: "that game is not open for answers" });
    expect(await sendAnswer("abc", "2026-10-15", "Sam", "going")).toEqual({
      ok: false,
      message: "That game is no longer open for answers.",
    });
  });

  it("says when the plan is gone, and keeps the retry copy for an outage 404", async () => {
    reply(404, { error: "unknown series" });
    expect(await sendAnswer("abc", "2026-10-15", "Sam", "going")).toEqual({ ok: false, message: "This plan no longer exists." });
    reply(404, { code: "NOT_FOUND" });
    expect(await sendAnswer("abc", "2026-10-15", "Sam", "going")).toEqual({
      ok: false,
      message: "Could not save your answer. Try again.",
    });
  });
});
