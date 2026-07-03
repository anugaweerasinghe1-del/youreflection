# Fix "results say error" + viral roadmap

## 1. What the scan actually found

I traced the full flow — landing, reflect, generate, letter, wall — and cross-checked AI Gateway logs, the DB, and the server code.

**The real failure (why users see "error, no results"):**

- The gateway call to Gemini yesterday **succeeded** — valid JSON, all fields present (log `019f2386…`, 200 OK, 674 output tokens).
- The `reflection_sessions` table is **empty** — the Supabase insert that follows the AI call never landed a row.
- The whole handler is wrapped in one `try/catch` that swallows *every* error (AI, JSON parse, Zod validation, DB insert) and rethrows one generic string: *"We couldn't complete your reflection right now."* So users see failure with zero signal, and we couldn't tell what actually broke. That single catch-all is the biggest UX bug.
- Server-function logs only retain ~1h, so the specific insert error from yesterday is gone. But the pattern is clear: even a valid AI response can't reach the user because one unrelated failure kills the whole flow.

**Other issues found:**
- No fallback model — a single Gemini timeout / rate limit / safety block = total failure.
- No retry, no partial recovery, and the AI output isn't cached, so a downstream DB hiccup wastes the entire generation.
- Prompt is generic across users — answers are just dumped as `id: value`. The letter feels less "personal" than it should.
- `generateText` is called with `maxRetries: 1` and no `maxTokens` — Gemini can silently truncate long JSON.
- Insights Zod schema uses hard `.min(3).max(6)` bounds; if the model returns 2 or 7 items the whole run fails validation and the user gets nothing.

## 2. Fix plan (server-side)

**a. Split the try/catch into stages with distinct errors**
- Stage 1: AI generation → on failure, try fallback model.
- Stage 2: JSON parse + Zod validation → on failure, retry once with a stricter "return ONLY JSON" reminder, then fallback.
- Stage 3: DB insert → on failure, still return the generated letter to the client via an in-memory/edge-cache short-lived signed payload so the user is never punished for a DB blip. Log the real error server-side.
- Each stage logs a specific reason so we can debug from `server-function-logs` next time.

**b. Fallback LLM chain**
Primary: `google/gemini-3-flash-preview` (fast, current).
Fallback 1: `google/gemini-2.5-flash` (stable, proven).
Fallback 2: `openai/gpt-5-mini` (different provider entirely — dodges Gemini-wide outages / safety false-positives).
Order tried only on failure; success on first model returns immediately. Both fallbacks use the same prompt.

**c. Loosen the schema, clamp in code**
Remove `.min/.max` from arrays in the Zod schema. Instead, after parsing, clamp arrays to 3–6 / 2–5 items and pad with safe defaults if too short. A well-formed letter should never be thrown away because it has 2 growth areas instead of 3.

**d. Set `maxOutputTokens` and detect truncation**
Pass `maxTokens: 2048` on the generation, and if `finishReason === "length"` treat as a soft failure and trigger fallback with a shorter prompt.

**e. Real personalization**
Currently the prompt sends `identity_notice: my heart`. Change the prompt builder to:
- Group answers by category (Identity, Confidence, Comparison, Self-worth, etc.).
- Include the actual question prompt, not just the id, so the model sees "When you enter a room of strangers, your mind first looks for: Approval" instead of `confidence_room: Approval`.
- Add a short "priority signals" block computed server-side (e.g. detected patterns: "high self-worth score but harsh mirror talk", "seeks approval but trusts own judgement") so the letter references the *specific tension* in that user's answers.
- Vary the greeting seed with a hash of answers so two people don't get identical openings.

**f. Never show raw "error" to the user**
On total failure, show a real, human message ("Our writer is quiet right now — try again in a moment") and offer a *retry* button that reuses the already-collected answers from sessionStorage without asking them to redo the 15 questions.

## 3. Fix plan (client-side)

- On `/reflect` submit failure: keep answers in `sessionStorage`, show a "Try again" button that re-calls `generateLetter` without losing state. Currently the user has to restart mentally.
- On `/letter/$sessionId` loader failure: distinguish "not found" (bad link) vs "temporarily unavailable" (server error) instead of always throwing `notFound()`.
- Add a subtle "regenerate letter" affordance on the letter page (once), for users who want a second pass.

## 4. Verification

- Manually invoke `generateLetter` with a fixed answer set via `invoke-server-function` and confirm a `reflection_sessions` row lands.
- Force the primary model to fail (bad model id) and confirm the fallback returns a valid letter.
- Force the DB insert to fail (temporary table rename in a scratch env) and confirm the client still receives a letter and shows a friendly recoverable state.
- Re-run the full flow in Playwright: reflect → submit → letter renders with real content.

## 5. World-class / viral additions (my strongest picks)

Ranked by likely virality × fit with the "quiet, cinematic, anonymous" brand:

1. **Shareable "Letter Card"** — from the letter page, generate a beautiful vertical image (server-side, using Gemini image or a canvas render) containing just the *title* + *questionToCarry* + a signature line "beyondwhatyousee.app". One tap → download / share to IG story / X. This is *the* virality driver: every letter becomes a share asset with brand attribution, no personal data leaked.
2. **"Send this to someone" quiet gift** — instead of only sharing your own letter, let a user compose a 15-second reflection *for* a friend (anonymous, no account) that generates a one-off letter link. Word-of-mouth loop, same infra.
3. **The Wall, alive** — right now the wall is static. Make it a slow, cinematic auto-scrolling wall (like a night sky) where each sentence fades in on scroll, with a live count of "reflections written today". Social proof + return visits.
4. **Return ritual (weekly)** — an optional, no-account "come back Sunday" — user gets a shareable link with a single question to sit with for the week, tied to their letter's `questionToCarry`. Retention without emails.
5. **Voice mode** — read the letter aloud with Lovable AI text-to-speech, quiet piano bed. People screen-record and repost audio-letter videos on TikTok.
6. **"Two of you" comparison** — take the reflection twice, months apart, and see a soft side-by-side of how your inner sentences shifted. Deep emotional hook, drives repeat use.
7. **Language expansion** — the letter reads beautifully in many languages; add a language toggle so it's not English-only. Multiplies virality per market.
8. **Zero-friction landing hook** — the current hero is gorgeous but slow. Add one interactive line above the fold: "One sentence. What do you wish people saw in you?" → immediately drops them into the reflection. Shortens time-to-magic-moment.

I'll ship #1, #3 (upgrade), and the reflection fixes in this pass, with #2 and #5 as immediate follow-ups if you approve.

## Implementation order

1. Server: staged errors + fallback chain + schema loosening + richer prompt.
2. Client: retryable submit + friendlier letter-page errors.
3. Verify with real invoke + Playwright.
4. Ship shareable letter card + wall upgrade.
5. Report back with a list of what changed and what to try next for growth.
