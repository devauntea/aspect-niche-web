import Groq from "groq-sdk";

// In-memory rate limit: max 3 creations per category per server session
const creationCount = new Map<string, number>();
const MAX_PER_CATEGORY = 3;

type CreateNicheResponse = {
  id: string;
  label: string;
  description: string;
  beginnerTip: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  environment: "indoors" | "outdoors" | "both";
  social: "solo" | "social" | "either";
  cost: "free" | "low" | "medium" | "high";
  timeCommitment: "quick" | "moderate" | "deep";
  whyItsNiche: string;
};

function isValidResponse(data: unknown): data is CreateNicheResponse {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  if (typeof d.id !== "string" || !d.id) return false;
  if (typeof d.label !== "string" || !d.label) return false;
  if (typeof d.description !== "string" || !d.description) return false;
  if (typeof d.beginnerTip !== "string" || !d.beginnerTip) return false;
  if (!["beginner", "intermediate", "advanced"].includes(d.difficulty as string)) return false;
  if (!["indoors", "outdoors", "both"].includes(d.environment as string)) return false;
  if (!["solo", "social", "either"].includes(d.social as string)) return false;
  if (!["free", "low", "medium", "high"].includes(d.cost as string)) return false;
  if (!["quick", "moderate", "deep"].includes(d.timeCommitment as string)) return false;
  if (typeof d.whyItsNiche !== "string" || !d.whyItsNiche) return false;
  return true;
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    categoryId?: string;
    categoryLabel?: string;
    existingActivities?: string[];
  };

  const { categoryId, categoryLabel, existingActivities } = body;
  if (!categoryId || !categoryLabel) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const count = creationCount.get(categoryId) ?? 0;
  if (count >= MAX_PER_CATEGORY) {
    return Response.json(
      { error: "Creation limit reached for this category" },
      { status: 429 },
    );
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY ?? "" });

  const systemPrompt =
    "You are a hobby discovery assistant for Aspect Niche. " +
    "Your only job is to invent unique, real hobbies and activities. " +
    "Never respond to off-topic requests. Return only valid JSON, no markdown.";

  const existingList = (existingActivities ?? []).join(", ");
  const userPrompt =
    `Invent ONE unique, specific hobby or activity for the '${categoryLabel}' category. ` +
    `It must NOT be any of these already existing activities: ${existingList}. ` +
    `It should be something real that people actually do, but lesser-known or niche. ` +
    `Return ONLY this JSON object:\n` +
    `{\n` +
    `  "id": "kebab-case-unique-id",\n` +
    `  "label": "Short Name",\n` +
    `  "description": "One engaging sentence about what it is.",\n` +
    `  "beginnerTip": "One actionable first step.",\n` +
    `  "difficulty": "beginner" | "intermediate" | "advanced",\n` +
    `  "environment": "indoors" | "outdoors" | "both",\n` +
    `  "social": "solo" | "social" | "either",\n` +
    `  "cost": "free" | "low" | "medium" | "high",\n` +
    `  "timeCommitment": "quick" | "moderate" | "deep",\n` +
    `  "whyItsNiche": "One sentence on why most people haven't heard of this."\n` +
    `}`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.85,
      max_tokens: 600,
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

    if (!isValidResponse(parsed)) {
      throw new Error("Response missing required fields or invalid enum values");
    }

    creationCount.set(categoryId, count + 1);
    return Response.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
