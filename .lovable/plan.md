# Build Recovery Plan

## Goal

Stabilize the entire project before adding anything else: one clean dependency graph, one working route tree, one safe backend path, and a verified user flow from landing → reflection → AI letter → wall.

## Phase 1 — Freeze and audit the failure surface

- Stop reactive one-error-at-a-time fixes.
- Compare all imports against installed packages and real files.
- Treat these as release blockers:
  - missing npm packages or mismatched package versions
  - route files that do not match TanStack route IDs
  - server-only code reachable from the browser bundle
  - generated files edited manually
  - backend policies that expose more data than intended
  - root metadata or font loading that can break SSR/runtime

## Phase 2 — Dependency stabilization

- Lock the AI stack to a compatible set:
  - `ai`
  - `@ai-sdk/openai-compatible`
  - the existing TanStack Start/Vite versions
- Remove unused heavy packages if they were added accidentally.
- Keep `framer-motion` only because it is actively used.
- Make sure every package import in source code exists in `package.json`.
- Avoid `@fontsource` unless the package is installed; current safer approach is Google Fonts via root `head()` links.

## Phase 3 — TanStack Start routing cleanup

- Do not manually edit `src/routeTree.gen.ts`; let TanStack regenerate it.
- Confirm route strings match files exactly:
  - `src/routes/index.tsx` → `/`
  - `src/routes/reflect.tsx` → `/reflect`
  - `src/routes/letter.$sessionId.tsx` → `/letter/$sessionId`
  - `src/routes/wall.tsx` → `/wall`
- Confirm the root shell keeps:
  - `<HeadContent />`
  - `<Outlet />`
  - `<Scripts />`
  - `QueryClientProvider`
- Add/keep route-level error and not-found handling where loaders exist.

## Phase 4 — Server function hardening

- Keep `src/lib/reflection.functions.ts` thin and client-safe at module scope.
- Keep all backend/admin imports inside `.handler()` bodies only.
- Keep `src/lib/ai-gateway.server.ts` server-only and never import it from route components.
- Add graceful fallback errors for:
  - missing Lovable AI key
  - AI generation failure
  - backend insert/read failure
  - moderation failure
- Confirm no protected/auth-only server function is called from a public loader.

## Phase 5 — AI Gateway compatibility fix

- Verify the AI SDK call shape matches the installed SDK version.
- If structured object generation is unstable with the current Google Gemini gateway route, switch to a safer pattern:
  - ask Gemini for strict JSON text
  - parse and validate with Zod server-side
  - fall back to a safe human-written error if validation fails
- Keep Gemini as the provider through the Lovable AI Gateway.
- Never expose keys or AI configuration to the browser.

## Phase 6 — Backend and privacy correction

- The reflection experience is meant to be private-by-link through server functions, not publicly listable.
- Fix backend access so anonymous/browser clients cannot directly read all reflection sessions.
- Keep wall entries publicly readable only when approved.
- Keep wall submission and moderation server-side.
- Ensure every migration that creates a public table has explicit grants and RLS policies.
- Add a corrective migration rather than editing old migrations that may already have run.

## Phase 7 — CSS, fonts, and SSR safety

- Keep all CSS package imports at the top of `src/styles.css`.
- Keep remote fonts in `src/routes/__root.tsx` links, not CSS `@import`.
- Remove negative letter-spacing from global heading utilities if it conflicts with the design rules.
- Confirm all styles use semantic tokens and avoid fragile hardcoded theme colors in components where practical.

## Phase 8 — Performance and UX risk reduction

- Keep the cinematic feel but reduce build/runtime risk:
  - no unnecessary libraries
  - no blocking AI calls before user submission
  - lazy-load non-critical imagery
  - preserve reduced-motion behavior where needed
- Check the main bundle size after stabilization; if still too large, split motion-heavy sections into route-local components rather than adding new packages.

## Phase 9 — Verification gates

- Dependency/import scan: no unresolved imports.
- Type safety: no invalid route links or server/client import boundary violations.
- Build validation: the harness should complete without module-resolution, SSR, or type errors.
- Browser smoke test:
  - home page renders
  - `/reflect` advances through inputs
  - final submit shows a controlled loading/error state if AI/backend is unavailable
  - `/wall` renders without crashing
  - invalid `/letter/:id` shows the not-found state

## Implementation order

1. Fix dependency and import graph first.
2. Fix route/tree and root shell second.
3. Fix server function and AI Gateway compatibility third.
4. Fix backend privacy policy with a corrective migration fourth.
5. Run the smoke flow and address only remaining concrete failures.

## Expected outcome

A stable, publishable baseline where the app builds reliably, the cinematic frontend still works, Gemini-powered reflection remains server-side, and the private reflection data model no longer creates hidden release risk.  
  
IMPORTANT NOTE:  
Reduce the 39 questions, to a maximum of 15 - even if you are doing 15, ensure that you add mcq, or anything and don't make all questions typing answers, because if we look at it from a realistic standpoint, they will not answer that much because humans are lazy.  
  
2nd point is that the images in the home page except the main one in the very top, are small and doesnt show clearly. Fix all these issues, and add them as overlayed images dont do too much, prioritize the minmalism > complexity, etc..ask any questions if necessary