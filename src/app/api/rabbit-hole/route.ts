import Groq from "groq-sdk";
import { isValidRabbitHoleResult } from "@/lib/rabbitHoleTypes";

// Simple in-memory cooldown: prevents rapid duplicate requests for the same activityId
const lastRequestAt = new Map<string, number>();
const COOLDOWN_MS = 5_000;

export async function POST(request: Request) {
  const body = (await request.json()) as {
    activityId?: string;
    activityLabel?: string;
    tags?: Record<string, string>;
  };

  const { activityId, activityLabel, tags } = body;
  if (!activityId || !activityLabel) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const last = lastRequestAt.get(activityId);
  if (last !== undefined && Date.now() - last < COOLDOWN_MS) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }
  lastRequestAt.set(activityId, Date.now());

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY ?? "" });

  const systemPrompt =
    "You are a hobby discovery assistant for Aspect Niche. Only respond about hobbies, activities, and interests. Refuse any off-topic requests. Return only valid JSON.";

  const userPrompt = `For the hobby "${activityLabel}" (tags: ${JSON.stringify(tags ?? {})}), return a JSON object with exactly these fields:
{
  "deeperCuts": ["topic1", "topic2", "topic3"],
  "ultraNicheHobbies": [
    { "name": "...", "description": "..." },
    { "name": "...", "description": "..." }
  ],
  "relatedActivities": ["activity1", "activity2", "activity3", "activity4"],
  "insiderTerm": "...",
  "insiderDefinition": "...",
  "funFact": "..."
}
deeperCuts: 3 specific rabbit hole topics within ${activityLabel}.
ultraNicheHobbies: 2 obscure hobbies most people haven't heard of, related to ${activityLabel}.
relatedActivities: 4 different hobby names outside our current list.
insiderTerm: one technical or slang term practitioners use.
insiderDefinition: a one-sentence explanation of that term.
funFact: one genuinely surprising fact about ${activityLabel}.
Return only the JSON object, no markdown, no extra text.`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content ?? "";

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON found in response");
      parsed = JSON.parse(match[0]);
    }

    if (!isValidRabbitHoleResult(parsed)) {
      throw new Error("Response missing required fields");
    }

    return Response.json(parsed);
  } catch (err) {
    lastRequestAt.delete(activityId);
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
