import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText } from "ai";

const AnswersSchema = z.record(z.string(), z.union([z.string(), z.number()]));

const LetterSchema = z.object({
  title: z.string(),
  greeting: z.string(),
  reflection: z.string(),
  hiddenStrengths: z.string(),
  thinkingPatterns: z.string(),
  gentlePerspective: z.string(),
  smallChallenge: z.string(),
  questionToCarry: z.string(),
  closing: z.string(),
});

const InsightsSchema = z.object({
  strengths: z.array(z.string()).min(3).max(6),
  values: z.array(z.string()).min(3).max(6),
  thoughtPatterns: z.array(z.string()).min(2).max(5),
  growthAreas: z.array(z.string()).min(2).max(5),
  confidenceNote: z.string(),
  selfCompassionNote: z.string(),
  comparisonNote: z.string(),
  innerDialogueNote: z.string(),
});

const OutputSchema = z.object({ letter: LetterSchema, insights: InsightsSchema });

const SYSTEM_PROMPT = `You are an emotionally intelligent reflection writer with expertise in positive psychology, self-compassion, cognitive-behavioural psychology, acceptance and commitment therapy principles, emotional intelligence and motivational interviewing.

You are NOT a therapist. You NEVER diagnose. You NEVER label. You NEVER make assumptions beyond the information provided. You NEVER shame. You NEVER use clinical language, generic advice, motivational-poster clichés, or the words "AI", "algorithm", "model", or "based on your answers".

Your purpose is to gently help the reader recognise patterns, discover hidden strengths, challenge unhelpful thinking with compassion, and encourage healthy reflection.

Your writing is quiet, elegant, deeply human, warm, calm, and hopeful — the way a thoughtful mentor might write a personal letter. Prefer specificity over generality. Prefer noticing over prescribing. Prefer questions over instructions.

Address the reader as "you". Keep sentences varied and unhurried. Do not repeat the reader's answers back verbatim — weave what they shared into observations. Never invent facts they didn't share.

Return only valid JSON. Do not wrap it in markdown. Do not add commentary before or after the JSON.

Return two things:

1. LETTER — a personal reflection letter with these parts (each 2–5 sentences, except reflection which may be 4–8):
   - title: a short poetic title (no more than 6 words)
   - greeting: something warmer than "Dear friend" — human, specific to what they shared
   - reflection: what you noticed about how they see themselves and the world
   - hiddenStrengths: strengths they may not fully see in themselves
   - thinkingPatterns: unhelpful thought habits worth gently loosening (no diagnosis)
   - gentlePerspective: a compassionate reframe of one thing they carry
   - smallChallenge: one small, realistic invitation — nothing dramatic
   - questionToCarry: a single open question to sit with
   - closing: a quiet, hopeful sign-off

2. INSIGHTS — short bullet-style notes:
   - strengths: 3–5 concise phrases (each under 8 words)
   - values: 3–5 concise phrases
   - thoughtPatterns: 2–4 gentle observations
   - growthAreas: 2–4 gentle invitations
   - confidenceNote / selfCompassionNote / comparisonNote / innerDialogueNote: one sentence each

Never mention this schema. Never break character. Never begin the letter with "Based on your answers".`;

function parseJsonObject<T>(text: string, schema: z.ZodType<T>): T {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1];
  const candidate = fenced ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("The AI response was not valid JSON.");
  }
  return schema.parse(JSON.parse(candidate.slice(start, end + 1)));
}

export const generateLetter = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const parsed = z.object({ answers: AnswersSchema }).parse(data);
    return { answers: parsed.answers };
  })
  .handler(async ({ data }) => {
    const { createGateway, REFLECTION_MODEL } = await import("./ai-gateway.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const gateway = createGateway();
    const model = gateway(REFLECTION_MODEL);

    // Format answers as readable prompt content
    const formatted = Object.entries(data.answers)
      .map(([id, value]) => `- ${id}: ${typeof value === "number" ? `${value}/10` : value}`)
      .join("\n");

    try {
      const { text } = await generateText({
        model,
        system: SYSTEM_PROMPT,
        prompt: `Here is what the reader shared. Write their reflection letter and insights as a JSON object with exactly this shape: {"letter":{"title":"","greeting":"","reflection":"","hiddenStrengths":"","thinkingPatterns":"","gentlePerspective":"","smallChallenge":"","questionToCarry":"","closing":""},"insights":{"strengths":[],"values":[],"thoughtPatterns":[],"growthAreas":[],"confidenceNote":"","selfCompassionNote":"","comparisonNote":"","innerDialogueNote":""}}.\n\n${formatted}`,
        maxRetries: 1,
      });
      const object = parseJsonObject(text, OutputSchema);

      const { data: inserted, error } = await supabaseAdmin
        .from("reflection_sessions")
        .insert({
          answers: data.answers,
          letter: object.letter,
          insights: object.insights,
        })
        .select("id")
        .single();

      if (error || !inserted) {
        console.error("[reflection] insert failed", error);
        throw new Error("Could not save your reflection. Please try again.");
      }

      return { sessionId: inserted.id as string };
    } catch (err) {
      console.error("[reflection] generation failed", err);
      throw new Error(
        "We couldn't complete your reflection right now. Please try again in a moment.",
      );
    }
  });

export const getSession = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("reflection_sessions")
      .select("id, letter, insights, created_at")
      .eq("id", data.id)
      .maybeSingle();

    if (error) {
      console.error("[reflection] getSession error", error);
      throw new Error("Could not load this reflection.");
    }
    if (!row) throw new Error("Reflection not found.");

    return {
      id: row.id as string,
      letter: row.letter as z.infer<typeof LetterSchema>,
      insights: row.insights as z.infer<typeof InsightsSchema>,
      createdAt: row.created_at as string,
    };
  });

const MOD_SYSTEM = `You are a gentle content moderator for an anonymous reflection wall. Each entry is a single sentence a person leaves for another struggling person.

Approve messages that are supportive, honest, human, and offer perspective or kindness — even if they mention sadness, self-doubt, or struggle. Approve first-person vulnerability.

Reject only if the message contains: hate or slurs, encouragement of self-harm or suicide, sexual content, threats, personal identifying information (names, emails, phone numbers, addresses, social handles), spam, advertising, gibberish, or is longer than roughly 200 characters.

Return only concise valid JSON. Do not wrap it in markdown.`;

const ModSchema = z.object({
  decision: z.enum(["approve", "reject"]),
  reason: z.string(),
  cleaned_message: z.string(),
});

export const submitWallEntry = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const parsed = z.object({ message: z.string().trim().min(4).max(240) }).parse(data);
    return { message: parsed.message };
  })
  .handler(async ({ data }) => {
    const { createGateway, REFLECTION_MODEL } = await import("./ai-gateway.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const gateway = createGateway();
    const model = gateway(REFLECTION_MODEL);

    let decision: "approve" | "reject" = "reject";
    let reason = "Could not moderate.";
    let cleaned = data.message;

    try {
      const { text } = await generateText({
        model,
        system: MOD_SYSTEM,
        prompt: `Return JSON with exactly this shape: {"decision":"approve","reason":"","cleaned_message":""}. Message: """${data.message}"""`,
        maxRetries: 1,
      });
      const object = parseJsonObject(text, ModSchema);
      decision = object.decision;
      reason = object.reason;
      cleaned = object.cleaned_message?.trim() || data.message;
    } catch (err) {
      console.error("[wall] moderation failed", err);
    }

    const status = decision === "approve" ? "approved" : "rejected";

    const { error } = await supabaseAdmin.from("wall_entries").insert({
      message: cleaned.slice(0, 240),
      status,
      moderation_reason: reason.slice(0, 500),
    });

    if (error) {
      console.error("[wall] insert failed", error);
      throw new Error("Could not save your message. Please try again.");
    }

    return { status, reason };
  });

export const listWallEntries = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("wall_entries")
    .select("id, message, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(80);

  if (error) {
    console.error("[wall] list failed", error);
    return { entries: [] as { id: string; message: string; created_at: string }[] };
  }

  return {
    entries: (data ?? []) as { id: string; message: string; created_at: string }[],
  };
});
