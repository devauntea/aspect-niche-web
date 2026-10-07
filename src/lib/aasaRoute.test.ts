import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/.well-known/apple-app-site-association/route";

afterEach(() => vi.unstubAllEnvs());

describe("apple-app-site-association route", () => {
  it("is 404 when no Team ID is configured", () => {
    vi.stubEnv("APPLE_TEAM_ID", "");
    expect(GET().status).toBe(404);
  });

  it("serves JSON when a Team ID is configured", async () => {
    vi.stubEnv("APPLE_TEAM_ID", "ABCDE12345");
    const res = GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/json");
    expect((await res.json()).applinks.details[0].appIDs).toEqual(["ABCDE12345.com.aspectniche.app"]);
  });
});
