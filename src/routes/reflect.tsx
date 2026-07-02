import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { QUESTIONS, type Question } from "@/lib/questions";
import { generateLetter } from "@/lib/reflection.functions";

export const Route = createFileRoute("/reflect")({
  head: () => ({
    meta: [
      { title: "Reflect — Beyond What You See" },
      {
        name: "description",
        content:
          "A quiet series of prompts. Answer them at your own pace. Nothing is shared, nothing is saved beyond your reflection.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReflectPage,
});

type AnswerValue = string | number;
type Answers = Record<string, AnswerValue>;

const STORAGE_KEY = "bwys.answers.v1";

function ReflectPage() {
  const navigate = useNavigate();
  const generate = useServerFn(generateLetter);

  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hydrate from sessionStorage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { i?: number; answers?: Answers };
        if (parsed.answers) setAnswers(parsed.answers);
        if (typeof parsed.i === "number") setI(Math.min(parsed.i, QUESTIONS.length - 1));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ i, answers }));
    } catch {}
  }, [i, answers]);

  const q = QUESTIONS[i];
  const total = QUESTIONS.length;
  const value = answers[q.id];

  const canAdvance =
    q.type === "text"
      ? typeof value === "string" && value.trim().length >= 2
      : q.type === "choice"
        ? typeof value === "string"
        : typeof value === "number";

  const setValue = useCallback(
    (v: AnswerValue) => setAnswers((a) => ({ ...a, [q.id]: v })),
    [q.id],
  );

  const next = useCallback(async () => {
    if (!canAdvance || submitting) return;
    if (i < total - 1) {
      setI((n) => n + 1);
      return;
    }
    // Submit
    setSubmitting(true);
    setError(null);
    try {
      const res = await generate({ data: { answers } });
      sessionStorage.removeItem(STORAGE_KEY);
      navigate({ to: "/letter/$sessionId", params: { sessionId: res.sessionId } });
    } catch (e) {
      console.error(e);
      setError(
        e instanceof Error ? e.message : "Something didn't work. Please try again.",
      );
      setSubmitting(false);
    }
  }, [answers, canAdvance, generate, i, navigate, submitting, total]);

  const back = useCallback(() => {
    if (i > 0) setI((n) => n - 1);
  }, [i]);

  return (
    <div className="grain relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      <TopBar current={i} total={total} onExit={() => navigate({ to: "/" })} />

      <main className="relative flex flex-1 items-center justify-center px-6 py-32 md:px-10">
        <AnimatePresence mode="wait">
          {submitting ? (
            <Composing key="composing" />
          ) : (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-3xl"
            >
              <p className="text-[10px] uppercase tracking-[0.4em] text-accent/70">
                {q.category}
              </p>
              <h1 className="font-display mt-8 text-balance text-[clamp(1.75rem,4.5vw,3.75rem)] leading-[1.1]">
                {q.prompt}
              </h1>

              <div className="mt-16">
                <Input q={q} value={value} onChange={setValue} onEnter={next} />
              </div>

              {error && (
                <p className="mt-8 text-sm text-destructive">{error}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {!submitting && (
        <BottomBar
          onBack={back}
          onNext={next}
          canBack={i > 0}
          canAdvance={canAdvance}
          isLast={i === total - 1}
        />
      )}
    </div>
  );
}

/* ---------- Inputs ---------- */

function Input({
  q,
  value,
  onChange,
  onEnter,
}: {
  q: Question;
  value: AnswerValue | undefined;
  onChange: (v: AnswerValue) => void;
  onEnter: () => void;
}) {
  if (q.type === "text") {
    return <TextInput placeholder={q.placeholder} value={(value as string) || ""} onChange={onChange} onEnter={onEnter} />;
  }
  if (q.type === "choice") {
    return <ChoiceInput options={q.options} value={value as string | undefined} onChange={onChange} />;
  }
  return (
    <ScaleInput
      value={(value as number | undefined) ?? Math.round((q.min + q.max) / 2)}
      set={value !== undefined}
      min={q.min}
      max={q.max}
      minLabel={q.minLabel}
      maxLabel={q.maxLabel}
      onChange={onChange}
    />
  );
}

function TextInput({
  value,
  onChange,
  onEnter,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onEnter: () => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? "Write freely."}
      rows={3}
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          onEnter();
        }
      }}
      className="w-full resize-none border-0 border-b border-border bg-transparent pb-4 font-display text-2xl leading-relaxed text-foreground placeholder:italic placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none md:text-3xl"
    />
  );
}

function ChoiceInput({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((o) => {
        const active = value === o;
        return (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`group flex items-center justify-between border-b border-border px-1 py-5 text-left transition ${
              active ? "border-accent" : "hover:border-foreground/40"
            }`}
          >
            <span
              className={`font-display text-2xl md:text-3xl transition ${
                active ? "text-foreground" : "text-foreground/70 group-hover:text-foreground"
              }`}
            >
              {o}
            </span>
            <span
              className={`h-2 w-2 rounded-full transition ${
                active ? "bg-accent" : "bg-border group-hover:bg-foreground/40"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

function ScaleInput({
  value,
  set,
  min,
  max,
  minLabel,
  maxLabel,
  onChange,
}: {
  value: number;
  set: boolean;
  min: number;
  max: number;
  minLabel?: string;
  maxLabel?: string;
  onChange: (v: number) => void;
}) {
  const steps = useMemo(() => {
    const out: number[] = [];
    for (let n = min; n <= max; n++) out.push(n);
    return out;
  }, [min, max]);

  return (
    <div>
      <div className="flex items-baseline gap-4">
        <span className="font-display text-7xl text-foreground md:text-8xl">
          {set ? value : "—"}
        </span>
        <span className="text-sm text-muted-foreground">/ {max}</span>
      </div>
      <div className="mt-10 flex items-center gap-2">
        {steps.map((n) => {
          const active = set && n <= value;
          const cur = set && n === value;
          return (
            <button
              key={n}
              onClick={() => onChange(n)}
              aria-label={`${n}`}
              className={`h-8 flex-1 border-b transition ${
                cur
                  ? "border-accent"
                  : active
                    ? "border-foreground/60"
                    : "border-border hover:border-foreground/40"
              }`}
            />
          );
        })}
      </div>
      <div className="mt-4 flex justify-between text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        <span>{minLabel ?? "Less"}</span>
        <span>{maxLabel ?? "More"}</span>
      </div>
    </div>
  );
}

/* ---------- Chrome ---------- */

function TopBar({
  current,
  total,
  onExit,
}: {
  current: number;
  total: number;
  onExit: () => void;
}) {
  return (
    <header className="fixed left-0 right-0 top-0 z-20 bg-gradient-to-b from-background to-transparent pb-10 pt-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-10">
        <button
          onClick={onExit}
          className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground transition hover:text-foreground"
        >
          ← Leave
        </button>
        <div className="flex items-center gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`h-[3px] w-[3px] rounded-full transition ${
                i < current
                  ? "bg-foreground/50"
                  : i === current
                    ? "bg-accent"
                    : "bg-border"
              }`}
            />
          ))}
        </div>
        <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
          {String(current + 1).padStart(2, "0")} / {total}
        </span>
      </div>
    </header>
  );
}

function BottomBar({
  onBack,
  onNext,
  canBack,
  canAdvance,
  isLast,
}: {
  onBack: () => void;
  onNext: () => void;
  canBack: boolean;
  canAdvance: boolean;
  isLast: boolean;
}) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-background to-transparent pb-8 pt-14">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-10">
        <button
          disabled={!canBack}
          onClick={onBack}
          className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground transition hover:text-foreground disabled:opacity-30"
        >
          ← Back
        </button>
        <button
          disabled={!canAdvance}
          onClick={onNext}
          className={`group inline-flex items-center gap-4 border-b pb-2 text-sm uppercase tracking-[0.25em] transition ${
            canAdvance
              ? "border-foreground/50 text-foreground hover:border-accent hover:text-accent"
              : "border-border text-muted-foreground/40"
          }`}
        >
          {isLast ? "Write my reflection" : "Continue"}
          <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
        </button>
      </div>
    </footer>
  );
}

function Composing() {
  const [line, setLine] = useState(0);
  const lines = [
    "Listening.",
    "Noticing patterns.",
    "Choosing the right words.",
    "Writing something honest.",
  ];
  useEffect(() => {
    const id = setInterval(() => setLine((n) => (n + 1) % lines.length), 2400);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl text-center"
    >
      <motion.div
        aria-hidden
        className="mx-auto h-[1px] w-24 origin-center bg-foreground/60"
        animate={{ scaleX: [0.4, 1, 0.4], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <AnimatePresence mode="wait">
        <motion.p
          key={line}
          initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
          transition={{ duration: 0.9 }}
          className="font-display mt-14 text-3xl italic text-foreground/85 md:text-4xl"
        >
          {lines[line]}
        </motion.p>
      </AnimatePresence>
      <p className="mt-10 text-xs uppercase tracking-[0.35em] text-muted-foreground">
        This can take up to a minute.
      </p>
    </motion.div>
  );
}
