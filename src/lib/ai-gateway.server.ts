import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Server-only Lovable AI Gateway provider (routes to Google Gemini).
 * Never import this from browser code.
 */
export function createGateway() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) {
    throw new Error("LOVABLE_API_KEY is not configured on the server.");
  }
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    supportsStructuredOutputs: false,
    headers: {
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}

export const REFLECTION_MODEL = "google/gemini-3-flash-preview";
