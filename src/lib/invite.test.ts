import { describe, expect, it } from "vitest";
import {
  RSVP_CHOICES,
  decodeBase64Url,
  decodeInvite,
  decodeReply,
  encodeBase64Url,
  encodeInvite,
  formatInviteWhen,
  guestSummary,
  inviteLink,
  newInviteId,
  replyLink,
  type Invite,
} from "@/lib/invite";

// An invitation is a link, so the round trip is the feature. If a link decodes
// wrong the guest gets the wrong address or the wrong night, and there is no
// server holding the truth to correct it against.

const invite: Invite = {
  id: "abc123",
  host: "Gloria",
  kind: "hobby",
  title: "Pottery, then coffee",
  activityId: "pottery",
  category: "craft",
  startsAt: "2026-09-18T21:00:00.000Z",
  durationMinutes: 120,
  place: "266 Himrod St ROOFTOP",
  note: "chill hangout on a rooftop. #BYOB",
};

describe("base64url", () => {
  it("round-trips ASCII", () => {
    for (const s of ["", "a", "ab", "abc", "abcd", "hello world"]) {
      expect(decodeBase64Url(encodeBase64Url(s))).toBe(s);
    }
  });

  it("round-trips text people actually type", () => {
    // Names and notes are free text. An encoder that only handles ASCII loses
    // the accent in a name, which is a worse bug than it looks.
    for (const s of ["Zoë", "Renée & Jürgen", "日本語", "emoji 🎉 in a note"]) {
      expect(decodeBase64Url(encodeBase64Url(s))).toBe(s);
    }
  });

  it("stays in the URL-safe alphabet", () => {
    const encoded = encodeBase64Url("subjects?with=chars&that+break/urls");
    expect(encoded).toMatch(/^[A-Za-z0-9_-]*$/);
  });

  it("survives padding a messaging app may have added", () => {
    const encoded = `${encodeBase64Url("hello")}==`;
    expect(decodeBase64Url(encoded)).toBe("hello");
  });
});

describe("invite links", () => {
  it("round-trips every field", () => {
    expect(decodeInvite(encodeInvite(invite))).toEqual(invite);
  });

  it("round-trips without an activity", () => {
    const date = { ...invite, kind: "date" as const, activityId: undefined };
    expect(decodeInvite(encodeInvite(date))).toEqual(date);
  });

  it("opens the app rather than a web page", () => {
    expect(inviteLink(invite).startsWith("aspectniche://invite?d=")).toBe(true);
  });

  it("refuses anything that is not one of ours", () => {
    expect(decodeInvite("")).toBeNull();
    expect(decodeInvite("not-base64-at-all!!")).toBeNull();
    expect(decodeInvite(encodeBase64Url("{}"))).toBeNull();
    expect(decodeInvite(encodeBase64Url('{"i":"x"}'))).toBeNull();
  });

  it("refuses an invite with an unreadable date", () => {
    // Rather than rendering "Invalid Date" on the card.
    const broken = encodeBase64Url(
      JSON.stringify({ i: "1", h: "A", t: "T", c: "craft", s: "whenever" }),
    );
    expect(decodeInvite(broken)).toBeNull();
  });

  it("fills in what an older or sloppier sender left out", () => {
    const sparse = encodeBase64Url(
      JSON.stringify({ i: "1", h: "A", t: "T", c: "craft", s: invite.startsAt }),
    );
    const decoded = decodeInvite(sparse);
    expect(decoded?.durationMinutes).toBe(90);
    expect(decoded?.place).toBe("");
    expect(decoded?.kind).toBe("hobby");
  });
});

describe("replies", () => {
  it("round-trips a name and a status", () => {
    const link = replyLink("abc123", "Renée", "maybe");
    const params = Object.fromEntries(
      link.split("?")[1].split("&").map((p) => p.split("=")),
    );
    const guest = decodeReply(params);
    expect(guest?.inviteId).toBe("abc123");
    expect(guest?.name).toBe("Renée");
    expect(guest?.status).toBe("maybe");
  });

  it("treats an unknown status as going", () => {
    expect(decodeReply({ i: "1", n: encodeBase64Url("Sam"), s: "???" })?.status)
      .toBe("going");
  });

  it("refuses a reply with no name", () => {
    expect(decodeReply({ i: "1", n: encodeBase64Url("  "), s: "going" })).toBeNull();
    expect(decodeReply({ i: "1", s: "going" })).toBeNull();
    expect(decodeReply({ n: encodeBase64Url("Sam") })).toBeNull();
  });
});

describe("ids", () => {
  it("does not collide when two are made in the same moment", () => {
    const ids = new Set(Array.from({ length: 500 }, newInviteId));
    expect(ids.size).toBe(500);
  });
});

describe("rsvp labels", () => {
  it("keeps the card labels short enough to fit three across", () => {
    // "Can't make it" was arriving on the card as "CAN'T MAKE…". The prose
    // label keeps the full phrase; the card takes the short one.
    for (const choice of RSVP_CHOICES) {
      expect(choice.short.length, choice.id).toBeLessThanOrEqual(9);
    }
  });
});

describe("wording", () => {
  it("names the day and the time", () => {
    const when = formatInviteWhen(invite.startsAt);
    expect(when).toMatch(/·/);
    expect(when.toLowerCase()).toMatch(/am|pm/);
  });

  it("counts the replies it has, and says nothing when it has none", () => {
    expect(guestSummary([])).toBeNull();
    expect(
      guestSummary([
        { name: "A", status: "going", at: "" },
        { name: "B", status: "going", at: "" },
        { name: "C", status: "maybe", at: "" },
        { name: "D", status: "out", at: "" },
      ]),
    ).toBe("2 going · 1 maybe · 1 out");
  });
});

describe("the link stays short", () => {
  const full: Invite = {
    id: "m1y2d3g4",
    host: "Dev",
    kind: "hobby",
    title: "Foraging",
    category: "nature",
    startsAt: "2026-09-08T18:00:00.000Z",
    durationMinutes: 90,
    place: "My house",
    note: "Come hang out and go foraging",
  };

  it("fits an ordinary invitation into a line of a message", () => {
    // The object form this replaced took 207. The whole point of the change was
    // that the link stopped dominating the bubble it was sent in.
    expect(encodeInvite(full).length).toBeLessThan(140);
  });

  it("says the same thing after the round trip", () => {
    expect(decodeInvite(encodeInvite(full))).toEqual(full);
  });

  it("drops the tail it does not need", () => {
    const bare = { ...full, place: "", note: "" };
    expect(encodeInvite(bare).length).toBeLessThan(encodeInvite(full).length);
    expect(decodeInvite(encodeInvite(bare))).toEqual(bare);
  });

  it("keeps reading the invitations already sent", () => {
    // Someone has a link in a message thread from before the format changed.
    const v1 = encodeBase64Url(
      JSON.stringify({
        i: "old1",
        h: "Dev",
        k: "date",
        t: "Pottery",
        c: "craft",
        s: "2026-09-08T18:00:00.000Z",
        d: 120,
        p: "The studio",
        n: "Bring an apron",
      }),
    );
    const decoded = decodeInvite(v1);
    expect(decoded?.title).toBe("Pottery");
    expect(decoded?.kind).toBe("date");
    expect(decoded?.durationMinutes).toBe(120);
  });

  it("keeps the minute even though it drops the second", () => {
    const odd = { ...full, startsAt: "2026-09-08T18:37:00.000Z" };
    expect(decodeInvite(encodeInvite(odd))?.startsAt).toBe(odd.startsAt);
  });

  it("refuses a payload from a format it does not know", () => {
    expect(decodeInvite(encodeBase64Url(JSON.stringify([99, "x"])))).toBeNull();
  });

  it("carries a category it has never heard of rather than losing it", () => {
    const exotic = { ...full, category: "aeronautics" as Invite["category"] };
    expect(decodeInvite(encodeInvite(exotic))?.category).toBe("aeronautics");
  });
});
