import { ImageResponse } from "next/og";
export function GET() {
  return new ImageResponse(<div style={{ display: "flex", width: "100%", height: "100%", background: "#ece8de", color: "#222c27", alignItems: "center", justifyContent: "center", fontSize: 64 }}>Aspect Niche · Shared activities</div>, { width: 1200, height: 630 });
}
