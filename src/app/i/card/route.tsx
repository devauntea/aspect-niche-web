import { ImageResponse } from "next/og";
import { decodeInvite, formatInviteWhen } from "@/lib/invite";

// The picture a messaging app shows instead of a link.
//
// An invitation sent as a bare URL arrives as a wall of blue text, which is the
// least inviting thing a message can contain — the recipient has to decide
// whether to tap an opaque string before they know what it is. This draws the
// invitation itself, so the message carries the event: who, what, when, where.
//
// It is generated per invitation and takes everything from the link, exactly
// like the page does. No database, no stored images, nothing to keep in step.

export const runtime = "edge";

const BG = "#0a0c18";
const SURFACE = "#131629";
const TEXT = "#f0eeff";
const DIM = "#8b93c9";
const GLOW = "#8b7cf6";
const ALPHA = "#fff7d6";

/** Open Graph's standard size. Smaller and iMessage renders a thumbnail. */
const WIDTH = 1200;
const HEIGHT = 630;

/**
 * Long titles have to shrink rather than wrap forever — a five-word hobby name
 * and a two-word one should both fill the card without pushing the details off
 * the bottom.
 */
function titleSize(title: string): number {
  if (title.length > 46) return 54;
  if (title.length > 30) return 66;
  return 82;
}

export async function GET(request: Request) {
  const d = new URL(request.url).searchParams.get("d");
  const invite = d ? decodeInvite(d) : null;

  // A card still gets drawn for a link that did not decode. Falling back to no
  // image would show the site's generic preview, which would tell the guest
  // this is an ordinary page rather than an invitation that arrived broken.
  const host = invite?.host?.trim() || "Someone";
  const title = invite?.title?.trim() || "An invitation";
  const when = invite ? formatInviteWhen(invite.startsAt) : "";
  const place = invite?.place?.trim() ?? "";
  const note = invite?.note?.trim() ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BG,
          padding: 72,
          // The one flourish: the glow the app's own graph sits in.
          backgroundImage: `radial-gradient(1000px 520px at 15% -10%, ${SURFACE} 0%, ${BG} 70%)`,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: GLOW,
            }}
          >
            {`${host} invited you to`}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 20,
              fontSize: titleSize(title),
              lineHeight: 1.1,
              color: TEXT,
            }}
          >
            {title}
          </div>
          {note ? (
            <div
              style={{
                display: "flex",
                marginTop: 26,
                fontSize: 30,
                lineHeight: 1.35,
                color: DIM,
              }}
            >
              {note.length > 120 ? `${note.slice(0, 117)}...` : note}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", height: 1, background: "#1b1e36" }} />
          <div
            style={{
              display: "flex",
              marginTop: 28,
              alignItems: "flex-end",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 36, color: ALPHA }}>
                {when}
              </div>
              {place ? (
                <div
                  style={{
                    display: "flex",
                    marginTop: 10,
                    fontSize: 30,
                    color: DIM,
                  }}
                >
                  {place.length > 60 ? `${place.slice(0, 57)}...` : place}
                </div>
              ) : null}
            </div>
            <div style={{ display: "flex", fontSize: 26, color: DIM }}>
              aspectniche.com
            </div>
          </div>
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT },
  );
}
