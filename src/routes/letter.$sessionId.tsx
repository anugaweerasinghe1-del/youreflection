import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getSession, submitWallEntry } from "@/lib/reflection.functions";
import { Nav } from "@/components/nav";

const INLINE_KEY = "bwys.letter.inline.v1";

type LetterData = Awaited<ReturnType<typeof getSession>>;

export const Route = createFileRoute("/letter/$sessionId")({
  head: () => ({
    meta: [
      { title: "Your Reflection — Beyond What You See" },
      {
        name: "description",
        content: "A quiet letter, written just for you.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: async ({ params }) => {
    // Inline preview path — data is stashed client-side, load lazily.
    if (params.sessionId === "preview") return null;
    try {
      return await getSession({ data: { id: params.sessionId } });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg === "not_found") throw notFound();
      // temporarily_unavailable or anything else: render a soft error, not a 404.
      return { __error: true } as unknown as LetterData;
    }
  },
  component: LetterPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Not here</p>
        <h1 className="font-display mt-6 text-4xl">This reflection couldn't be found.</h1>
        <Link
          to="/reflect"
          className="mt-10 inline-flex border-b border-foreground/40 pb-1 text-sm uppercase tracking-[0.25em] hover:border-accent hover:text-accent"
        >
          Begin a new one
        </Link>
      </div>
    </div>
  ),
});


function LetterPage() {
  const { letter, insights } = Route.useLoaderData();
  const [tab, setTab] = useState<"letter" | "insights">("letter");

  return (
    <div className="grain min-h-screen bg-background text-foreground">
      <Nav />

      <section className="mx-auto max-w-3xl px-6 pb-24 pt-40 md:px-10 md:pt-56">
        <p
          className="animate-fade-up text-[10px] uppercase tracking-[0.5em] text-accent/70"
        >
          A letter, for you
        </p>
        <h1
          className="font-display animate-fade-up mt-10 text-balance text-[clamp(2.5rem,6vw,5rem)] leading-[1.02] italic"
          style={{ animationDelay: "300ms" }}
        >
          {letter.title}
        </h1>

        <div className="mt-16 flex items-center gap-6 text-[10px] uppercase tracking-[0.35em]">
          {(["letter", "insights"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`border-b pb-2 transition ${
                tab === t ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "letter" ? "The Letter" : "Deeper Insights"}
            </button>
          ))}
        </div>

        <div className="mt-16">
          {tab === "letter" ? <LetterBody letter={letter} /> : <Insights insights={insights} />}
        </div>
      </section>

      <WallInvitation />

      <div className="mx-auto max-w-3xl px-6 pb-32 pt-16 md:px-10">
        <Link
          to="/reflect"
          className="inline-flex items-center gap-4 border-b border-foreground/30 pb-2 text-sm uppercase tracking-[0.25em] text-muted-foreground transition hover:border-foreground hover:text-foreground"
        >
          Begin another reflection
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}

function LetterBody({ letter }: { letter: ReturnType<typeof Route.useLoaderData>["letter"] }) {
  const sections: Array<{ label: string; body: string; italic?: boolean }> = [
    { label: "", body: letter.greeting, italic: true },
    { label: "Reflection", body: letter.reflection },
    { label: "Hidden strengths", body: letter.hiddenStrengths },
    { label: "Thinking patterns", body: letter.thinkingPatterns },
    { label: "A gentler perspective", body: letter.gentlePerspective },
    { label: "A small invitation", body: letter.smallChallenge },
    { label: "A question to carry", body: letter.questionToCarry, italic: true },
    { label: "Closing", body: letter.closing },
  ];
  return (
    <article className="space-y-16">
      {sections.map((s, i) => (
        <div
          key={i}
          className="animate-fade-up"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          {s.label && (
            <p className="mb-6 text-[10px] uppercase tracking-[0.4em] text-accent/60">{s.label}</p>
          )}
          <p
            className={`font-display text-balance text-[clamp(1.25rem,2.2vw,1.75rem)] leading-[1.5] text-foreground/90 ${
              s.italic ? "italic" : ""
            }`}
          >
            {s.body}
          </p>
        </div>
      ))}
    </article>
  );
}

function Insights({ insights }: { insights: ReturnType<typeof Route.useLoaderData>["insights"] }) {
  const cards: Array<{ title: string; kind: "list" | "note"; body: string[] | string }> = [
    { title: "Strengths", kind: "list", body: insights.strengths },
    { title: "Values", kind: "list", body: insights.values },
    { title: "Thought patterns", kind: "list", body: insights.thoughtPatterns },
    { title: "Growth areas", kind: "list", body: insights.growthAreas },
    { title: "Confidence", kind: "note", body: insights.confidenceNote },
    { title: "Self-compassion", kind: "note", body: insights.selfCompassionNote },
    { title: "Comparison", kind: "note", body: insights.comparisonNote },
    { title: "Inner dialogue", kind: "note", body: insights.innerDialogueNote },
  ];
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden border border-border md:grid-cols-2">
      {cards.map((c, i) => (
        <div
          key={c.title}
          className="animate-fade-up bg-surface p-8 md:p-10"
          style={{ animationDelay: `${(i % 4) * 60}ms` }}
        >
          <p className="text-[10px] uppercase tracking-[0.35em] text-accent/70">{c.title}</p>
          {c.kind === "list" ? (
            <ul className="mt-6 space-y-2 text-foreground/85">
              {(c.body as string[]).map((item, j) => (
                <li key={j} className="font-display text-xl leading-snug">
                  — {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 font-display text-xl leading-snug text-foreground/85">
              {c.body as string}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function WallInvitation() {
  const submit = useServerFn(submitWallEntry);
  const [msg, setMsg] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "rejected" | "error">("idle");
  const [note, setNote] = useState<string | null>(null);

  const send = async () => {
    if (msg.trim().length < 4 || state === "sending") return;
    setState("sending");
    setNote(null);
    try {
      const res = await submit({ data: { message: msg } });
      if (res.status === "approved") {
        setState("sent");
        setMsg("");
      } else {
        setState("rejected");
        setNote(res.reason);
      }
    } catch (e) {
      setState("error");
      setNote(e instanceof Error ? e.message : "Something went wrong.");
    }
  };

  return (
    <section className="border-t border-border bg-surface">
      <div className="mx-auto max-w-3xl px-6 py-32 md:px-10 md:py-40">
        <p className="text-[10px] uppercase tracking-[0.5em] text-accent/70">Leave one sentence</p>
        <h2 className="font-display mt-8 text-balance text-[clamp(1.75rem,3.5vw,3rem)] leading-[1.1]">
          If you could tell one struggling person one sentence — anonymously — what would it be?
        </h2>

        {state === "sent" ? (
          <p
            className="font-display mt-12 animate-fade-up text-2xl italic text-foreground/90"
          >
            Thank you. Your sentence has been added to the wall.
          </p>
        ) : (
          <div className="mt-12">
            <textarea
              value={msg}
              maxLength={240}
              rows={2}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="One sentence. No names."
              className="w-full resize-none border-0 border-b border-border bg-transparent pb-4 font-display text-xl leading-relaxed text-foreground placeholder:italic placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none md:text-2xl"
            />
            <div className="mt-6 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                {msg.length} / 240 — reviewed for kindness
              </span>
              <button
                onClick={send}
                disabled={msg.trim().length < 4 || state === "sending"}
                className="inline-flex items-center gap-4 border-b border-foreground/40 pb-2 text-sm uppercase tracking-[0.25em] transition hover:border-accent hover:text-accent disabled:opacity-30"
              >
                {state === "sending" ? "Sending…" : "Leave sentence"} <span>→</span>
              </button>
            </div>
            {(state === "rejected" || state === "error") && note && (
              <p className="mt-6 text-sm text-muted-foreground">
                {state === "rejected"
                  ? "This one wasn't added. It may have contained something we couldn't publish. Try rewriting it with just kindness."
                  : note}
              </p>
            )}
            <div className="mt-10">
              <Link
                to="/wall"
                className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground transition hover:text-foreground"
              >
                Read others → the wall
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
