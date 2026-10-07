import { describe, expect, it } from "vitest";
import { aasaBody } from "@/lib/aasa";

describe("apple-app-site-association", () => {
  it("hands the link pages to the app and keeps the preview images on the web", () => {
    const body = aasaBody("ABCDE12345");
    const details = body.applinks.details[0];
    expect(details.appIDs).toEqual(["ABCDE12345.com.aspectniche.app"]);
    const paths = details.components.map((c) => `${c.exclude ? "!" : ""}${c["/"]}`);
    expect(paths).toEqual(["!/i/card*", "!/p/card*", "/i", "/r", "/p", "/pr", "/s", "/g"]);
  });
});
