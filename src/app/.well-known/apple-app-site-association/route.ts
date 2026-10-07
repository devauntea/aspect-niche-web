import { aasaBody } from "@/lib/aasa";

// Read at request time, so the Team ID is whatever the deployment holds and
// never one baked in by a build that did not have it.
export const dynamic = "force-dynamic";

export function GET() {
  const teamId = process.env.APPLE_TEAM_ID;
  if (!teamId) return new Response("Not configured", { status: 404 });
  return Response.json(aasaBody(teamId));
}
