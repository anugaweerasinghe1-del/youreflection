# Plan — Living wall, warmer questions, safer answers

Three focused changes. Nothing removed, nothing renamed, nothing that touches AI generation, DB schema, routing, or the homepage hero. Every change is additive or in-place.

## 1. Living wall on the homepage (privacy-safe, cinematic)

Replace the current static `CommunityPreview` section with an auto-scrolling "living wall" — keeps the exact same section slot (05 — Others, quietly) and the "Visit the wall" link, so nothing about page structure changes.

- New client component `LivingWall` (same file, `src/routes/index.tsx`) — pulls approved entries via the existing `listWallEntries` server fn using `useQuery`.
- Fallback to the existing 4 hand-written lines when the list is empty or still loading, so the section never looks broken.
- Two vertically-stacked marquee rows, opposite directions, very slow (~60–90s per loop), CSS-only transform animation (no JS timers, no libs). Pauses on hover.
- Edge fade masks (top/bottom) so lines drift in and out cinematically.
- Privacy-safe: only shows already-approved wall entries (same source the `/wall` page uses) — no new data path, no PII.
- Respects `prefers-reduced-motion` (freezes the scroll).
- Kept short: one section, no layout shift; the "Visit the wall" CTA stays exactly where it is.

## 2. Warmer, less-empty reflect page

The questions page currently sits on plain `bg-background` with just text.

- Add a subtle, fixed background layer behind the questions in `src/routes/reflect.tsx`:
  - One of the existing hero images (`section-window.jpg` / `section-reflection.jpg`) used at very low opacity (~8–12%), heavily blurred, with a strong background gradient overlay on top so text contrast is unchanged.
  - A soft radial "warm glow" using existing accent tokens (no new colors).
  - Optional very subtle grain (already available via `.grain`).
- No change to text sizes, layout, TopBar/BottomBar, or the `Composing` state.
- No new assets required — reuses images already imported elsewhere.

## 3. Softer questions + "type your own answer"

Rewrite `src/lib/questions.ts` in place — same 15 items, same ids, same categories, same types, so the AI prompt, `detectSignals()`, and `sessionStorage` all keep working unchanged.

Changes per question:
- Reword a handful of prompts that lean too hard on empathy/therapy tone into more neutral, curious phrasing (e.g. "How gently do you speak to yourself in the mirror" → "When you look in the mirror, your inner voice is usually…").
- Rewrite the choice options that are too specific/opaque (e.g. `photo` → "Warmth / Neutral / A small critique / A loud one" → simpler, clearer options).
- Keep all ids and categories identical so `detectSignals()` string matches (e.g. `"A loud one"`, `"Approval"`, `"Heartbroken"`, `"Missing"`, `"Distant"`) still fire — where I reword an option that's used in `detectSignals`, I'll keep the exact string for that option and only reword its siblings.

Then add an "Other — write your own" affordance for every `choice` question:

- Extend `ChoiceInput` in `src/routes/reflect.tsx` only (no schema change): after the option buttons, render an "Other" button. When picked, it swaps into a small inline text field; the typed string becomes the answer value (still a string, so the server, prompt builder, and validators are unaffected).
- Answer type stays `string | number`, `AnswersSchema` unchanged, DB row shape unchanged.
- `canAdvance` treats an "Other" with ≥2 chars as valid.

## 4. Safety net — nothing breaks

I will:

- Not touch: routing, `routeTree.gen.ts`, Supabase schema, RLS, server fns, AI code, auth, `__root.tsx`, wall route, letter route, `ai-gateway.server.ts`.
- Keep every question id + category + type stable so `detectSignals`, the prompt builder, and existing in-flight `sessionStorage` answers still work.
- Keep every choice option string that `detectSignals` matches on ("A loud one", "Approval", "Heartbroken", "Concerned", "Distant", "One-sided", "Missing", "Uncertain") verbatim, only softening surrounding wording.
- After edits: run `tsgo` typecheck, load `/`, `/reflect`, `/wall` via Playwright, screenshot each, and verify no console errors + the wall query returns.
- Report back honestly: what shipped, what I skipped, and any warnings.

## Technical notes

- Living wall marquee: two `@keyframes` (`marquee-left`, `marquee-right`) added to `src/styles.css`, applied to a duplicated list (`[...entries, ...entries]`) inside `overflow-hidden` containers with `mask-image` fades. Pause via `group-hover:[animation-play-state:paused]`.
- Reflect background layer: absolute-positioned `<div>` inside the existing `grain` wrapper, `pointer-events-none`, behind `<main>`; image `object-cover`, `blur-3xl`, `opacity-10`, plus a `bg-gradient-to-b from-background via-background/85 to-background` overlay.
- Choice "Other": local component state (`customValue`, `mode: "options" | "custom"`); when the parent `value` matches one of the preset options, mode is `options`, otherwise `custom`. This survives back-navigation via existing `sessionStorage` hydration.

## Files touched

- `src/routes/index.tsx` — replace `CommunityPreview` body with `LivingWall`; keep heading + CTA.
- `src/routes/reflect.tsx` — add background layer div; extend `ChoiceInput` with "Other".
- `src/lib/questions.ts` — reword prompts/options in place; same ids/types.
- `src/styles.css` — add `@keyframes marquee-left/right` + two utility classes.

## Out of scope this pass

- No changes to letter generation, model chain, DB, or the `/wall` page itself.
- No new images generated.
- No new dependencies.
