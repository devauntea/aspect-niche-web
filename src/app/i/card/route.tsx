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
//
// The card does not print "aspectniche.com". Every messaging client draws the
// domain in its own chrome directly beneath the image — it was there twice,
// and the copy inside the artwork was spending a line of the card on it.

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
 * Everything on this card is set far larger than a 1200px canvas suggests,
 * and the reason is where it is actually looked at. iMessage draws this at
 * roughly a third of its native width inside a chat bubble, so the old 36px
 * date landed at about 12pt on the glass — legible in a design tool, squinting
 * on a phone. The type scale here is chosen for the rendered size, not the
 * drawn one: the date is now the size a headline would be on the page.
 */
function titleSize(title: string): number {
  if (title.length > 46) return 74;
  if (title.length > 30) return 92;
  return 116;
}

export async function GET(request: Request) {
  const d = new URL(request.url).searchParams.get("d");
  const invite = d ? decodeInvite(d) : null;

  // A card still gets drawn for a link that did not decode. Falling back to no
  // image would show the site's generic preview, which would tell the guest
  // this is an ordinary page rather than an invitation that arrived broken.
  const host = invite?.host?.trim() || "Someone";
  const title = invite?.title?.trim() || "An invitation";
  const when = invite ? formatInviteWhen(invite.startsAt, invite.tzOffset) : "";
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
          padding: 76,
          // Two lights rather than one. A single wash from the top-left left
          // the bottom-right corner flat, which at bubble size read as a plain
          // dark rectangle; crossing a violet key light with a warm counter
          // light gives the card a direction and keeps the corner alive. Both
          // are wide and low-contrast — this sits behind type, and a gradient
          // that competes with the title is worse than no gradient.
        }}
      >
        {/* The background is layered divs rather than several gradients stacked
            in one `backgroundImage`. Satori renders a radial gradient well but
            is unreliable about a comma-separated list of them, and this way each
            light's size, position and strength is a number I can move on its
            own.

            Both lights sit to the RIGHT. All the type is set flush left, so the
            right half was the empty part of the card — putting the glow there
            fills it and leaves the copy on quiet ground, instead of making the
            title fight a gradient for contrast. */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `radial-gradient(760px 700px at 92% 12%, rgba(139,124,246,0.55) 0%, rgba(139,124,246,0.12) 45%, rgba(10,12,24,0) 72%)`,
          }}
        />
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `radial-gradient(620px 420px at 78% 108%, rgba(255,247,214,0.20) 0%, rgba(255,247,214,0.04) 48%, rgba(10,12,24,0) 74%)`,
          }}
        />
        {/* A wash back over the lower left, so the date and place keep their
            contrast where the warm light reaches across. */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `radial-gradient(900px 560px at -8% 86%, rgba(10,12,24,0.92) 0%, rgba(10,12,24,0.45) 45%, rgba(10,12,24,0) 70%)`,
          }}
        />
        {/* An inset hairline. Message clients round and crop the card against
            their own bubble, and without an edge of its own the artwork simply
            stops. */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 18,
            left: 18,
            right: 18,
            bottom: 18,
            borderRadius: 28,
            border: "2px solid rgba(139,124,246,0.22)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 36,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: GLOW,
            }}
          >
            {`${host} invited you to`}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 18,
              fontSize: titleSize(title),
              lineHeight: 1.05,
              letterSpacing: -1.5,
              color: TEXT,
            }}
          >
            {title}
          </div>
          {note ? (
            <div
              style={{
                display: "flex",
                marginTop: 28,
                fontSize: 38,
                lineHeight: 1.3,
                color: DIM,
              }}
            >
              {/* Cut shorter than before. The note is the personal line, not
                  the content — at bubble size a long one crowds out the date,
                  which is the thing a guest actually needs off this card. */}
              {note.length > 84 ? `${note.slice(0, 81)}...` : note}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", height: 2, background: "#232748" }} />
          <div
            style={{
              display: "flex",
              marginTop: 30,
              alignItems: "flex-end",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              {/* The date is the one line a guest has to be able to read at a
                  glance, so it is set like a headline rather than a caption,
                  and it is the only thing on the card wearing the warm accent. */}
              <div
                style={{
                  display: "flex",
                  fontSize: 52,
                  letterSpacing: -0.5,
                  color: ALPHA,
                }}
              >
                {when}
              </div>
              {place ? (
                <div
                  style={{
                    display: "flex",
                    marginTop: 14,
                    fontSize: 40,
                    color: DIM,
                  }}
                >
                  {place.length > 44 ? `${place.slice(0, 41)}...` : place}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT },
  );
}
