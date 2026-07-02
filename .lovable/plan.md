# Beyond What You See — Build Plan

A cinematic, Awwwards-caliber self-reflection experience. Dark mode only, editorial typography, one seamless emotional journey from landing → 40-question reflection → AI-written letter → insight dashboard → anonymous community wall.

## Scope (one pass)

1. Landing (hero + 6 story sections + final CTA)
2. Cinematic reflection questionnaire (40 questions, one-per-screen)
3. AI-generated personal reflection letter (Gemini)
4. Reflection dashboard (8 insight cards)
5. Community Reflection Wall (submit + browse, auto-moderated)
6. Zero-account privacy model

## Visual system

- Backgrounds: `#050505` / `#101010` / `#171717`
- Text: warm white `#F5F1EA`, soft grey `#8A857D`, champagne accent `#C9A96E` (used ~1% of surface)
- Type: Instrument Serif (display headlines, tracking-tight) + Inter (body). No decorative fonts.
- Motion: Framer Motion. Slow fades (600–1200ms), text mask reveals, Ken Burns on hero portrait, parallax on section imagery, blur-in transitions between questionnaire screens. Nothing bouncy.
- Imagery: cinematic editorial portraits (half-lit faces, silhouettes, reflections) generated via image gen, always with dark gradient overlay for text legibility.
- Layout: generous whitespace, single-column hero, asymmetric editorial rows, no card grids on marketing sections.

## Page / route structure (TanStack Start)

```
src/routes/
  __root.tsx              // dark shell, font preload, meta
  index.tsx               // landing (hero + 6 sections + CTA)
  reflect.tsx             // cinematic questionnaire flow
  letter.$sessionId.tsx   // AI reflection letter + dashboard tabs
  wall.tsx                // community reflection wall
  api/public/wall.ts      // GET approved entries (public read)
```

Each route sets its own `head()` with unique title/description/OG.

## Data & backend (Lovable Cloud)

Tables (all with GRANTs + RLS):

- `reflection_sessions` — `id uuid pk`, `created_at`, `answers jsonb`, `letter jsonb`, `insights jsonb`. Anonymous. Public INSERT + SELECT by id (via server fn only).
- `wall_entries` — `id`, `created_at`, `message text`, `status text` (`pending`|`approved`|`rejected`), `moderation_reason text`. Public reads restricted to `status='approved'`.

Server functions (`src/lib/*.functions.ts`):

- `generateLetter({ answers })` → calls Gemini via Lovable AI Gateway (`google/gemini-3-flash-preview`), returns structured `{ letter, insights }`, persists to `reflection_sessions`, returns `sessionId`.
- `getSession({ id })` → fetch letter+insights for the letter route.
- `submitWallEntry({ message })` → runs Gemini moderation pass (safety + on-topic + length), sets status accordingly, inserts.
- `listWallEntries({ cursor })` → paginated approved entries (also exposed via public server route for SSR).

All AI calls go through Lovable AI Gateway with `LOVABLE_API_KEY` (auto-provisioned). This satisfies the "Gemini" requirement — the gateway routes to Google's Gemini models — without asking the user to paste an API key. Fully server-side; key never touches the browser.

## AI reflection engine

Single system prompt built from the user's spec (positive psych, self-compassion, ACT, CBT reframing, motivational interviewing; never diagnose/label/shame). Uses AI SDK `generateText` + `Output.object` with a Zod schema producing:

```
{
  letter: { title, greeting, reflection, hiddenStrengths,
            thinkingPatterns, gentlePerspective, smallChallenge,
            questionToCarry, closing },
  insights: {
    strengths[], values[], thoughtPatterns[], growthAreas[],
    confidenceNote, selfCompassionNote,
    comparisonNote, innerDialogueNote
  }
}
```

Frontend renders the letter as a long-form editorial piece; dashboard renders insights as 8 minimal cards.

## Questionnaire (40 questions)

Categories: Identity, Confidence, Appearance, Comparison, Relationships, Self-worth, Purpose, Kindness, Growth, Dreams, Social Media, Self-Compassion. Mix of open text, multiple choice, sliders (1–10), and short reflection prompts. Questions written in the thoughtful, non-clinical voice from the brief ("What is something you wish people noticed about you beyond your appearance?").

UX: one question per full-viewport screen, blur-out/in transitions, tiny dot progress indicator, Enter to advance, back arrow allowed, autosave to `sessionStorage` so refresh doesn't lose progress. No account, no email.

## Community wall

- Prompt at end of letter: "If you could tell one struggling person one sentence, what would it be?"
- Submission runs through Gemini moderation (reject: hate/self-harm-encouragement/spam/PII; accept: supportive humanity). Approved entries appear on `/wall`.
- Wall UI: typography only, huge quiet spacing, slow fade-in as they enter viewport, no avatars/likes/comments.

## Privacy

- No auth, no email, no name. Session id is a random uuid stored in `sessionStorage` + as URL param on the letter page (user can revisit if they keep the link).
- Copy throughout reinforces anonymity.
- Analytics: none by default.

## Technical notes

- Framer Motion for all transitions; `prefers-reduced-motion` respected.
- Fonts via `@fontsource/instrument-serif` + `@fontsource/inter`.
- All colors as semantic tokens in `src/styles.css` (oklch), no hardcoded hex in components.
- Images: generated hero + section portraits saved under `src/assets/`, lazy-loaded, WebP.
- Lighthouse target ≥95: code split by route, defer AI call until user submits, no heavy libs beyond framer-motion.
- Full mobile parity — questionnaire, letter, and wall all designed mobile-first.

## Deliverable

One complete build in this pass: landing, reflection flow, AI letter, dashboard, community wall, backend, moderation. Ready to publish.