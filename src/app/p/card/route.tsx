import { ImageResponse } from "next/og";
import { previewFromQuery } from "../preview";
import { cardArtUrl, loadCardArt } from "../../i/cardArt";

// The link preview's poster for a date invitation.
//
// Built from `datePreview` alone -- the host, the date's name and the day --
// so a poster that gets forwarded or cached carries nothing more than a
// title would. No place, no note, no itinerary.

export const runtime = "edge";

const BG = "#21191f";
const ROSE = "#efb1c5";
const TEXT = "#f6eee6";
const DIM = "#d6c6ce";

function titleSize(title: string): number {
  if (title.length > 40) return 76;
  if (title.length > 24) return 96;
  return 120;
}

export async function GET(request: Request) {
  // The preview fields arrive as their own query (`posterQuery`); the
  // invitation itself is never sent here.
  const url = new URL(request.url);
  const p = previewFromQuery(url.searchParams);
  const art = await loadCardArt(cardArtUrl(p.background, url.origin));
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
          position: "relative",
        }}
      >
        {art ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={art} alt="" width={1200} height={630} style={{ position: "absolute", top: -76, left: -76, width: 1200, height: 630, objectFit: "cover" }} />
            {/* Darker under the words, which sit on the left and bottom.
                Placed against the card's edges, not the padded box. */}
            <div
              style={{
                display: "flex",
                position: "absolute",
                top: -76,
                left: -76,
                width: 1200,
                height: 630,
                backgroundImage: `linear-gradient(90deg, rgba(33,25,31,0.86) 0%, rgba(33,25,31,0.62) 55%, rgba(33,25,31,0.25) 100%)`,
              }}
            />
          </>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `radial-gradient(720px 620px at 88% 10%, rgba(239,177,197,0.42) 0%, rgba(239,177,197,0.10) 46%, rgba(33,25,31,0) 72%)`,
              }}
            />
            <div style={{ display: "flex", position: "absolute", right: 150, top: 90, width: 90, height: 90, borderRadius: 45, boxShadow: `-22px 14px 0 0 ${ROSE}` }} />
          </>
        )}
        <div style={{ display: "flex", fontSize: 30, color: DIM, letterSpacing: 1 }}>Aspect Niche</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", fontSize: 40, color: ROSE }}>{p.headline}</div>
          <div style={{ display: "flex", fontSize: titleSize(p.title), color: TEXT, lineHeight: 1.05, fontStyle: "italic" }}>{p.title}</div>
          {p.day ? <div style={{ display: "flex", fontSize: 44, color: DIM }}>{p.day}</div> : null}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
