import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { TopBar } from "@/components/TopBar";
import { StarRating } from "@/components/StarRating";
import { getLesson, lessons } from "@/data/curriculum";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated/quiz/$lessonId")({
  head: ({ params }) => {
    const l = getLesson(params.lessonId);
    return { meta: [{ title: l ? `Quiz: ${l.title} — ScratchKids` : "Quiz" }] };
  },
  component: QuizPage,
});

function QuizPage() {
  const { lessonId } = Route.useParams();
  const lesson = getLesson(lessonId);
  if (!lesson) throw notFound();

  const { user } = useAuth();
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const q = lesson.quiz[idx];
  const total = lesson.quiz.length;
  const starsFor = (s: number) =>
    s === total ? 3 : s >= Math.ceil(total * 0.7) ? 2 : s >= Math.ceil(total * 0.4) ? 1 : 0;
  const stars = starsFor(score);

  const playTone = (ok: boolean) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = ok ? 660 : 220;
      o.type = ok ? "triangle" : "sawtooth";
      g.gain.value = 0.08;
      o.connect(g).connect(ctx.destination);
      o.start();
      setTimeout(() => {
        o.stop();
        ctx.close();
      }, ok ? 180 : 250);
    } catch {}
  };

  const finish = async (finalScore: number) => {
    setDone(true);
    if (finalScore === total) confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 } });
    if (!user) return;
    setSaving(true);
    const finalStars = starsFor(finalScore);

    await supabase.from("quiz_attempts").insert({
      user_id: user.id,
      lesson_id: lesson.id,
      score: finalScore,
      total,
    });

    const { data: existing } = await supabase
      .from("lesson_progress")
      .select("stars")
      .eq("user_id", user.id)
      .eq("lesson_id", lesson.id)
      .maybeSingle();

    const bestStars = Math.max(existing?.stars ?? 0, finalStars);

    await supabase.from("lesson_progress").upsert(
      {
        user_id: user.id,
        lesson_id: lesson.id,
        completed: true,
        stars: bestStars,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" },
    );
    setSaving(false);
  };

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const correct = i === q.answer;
    playTone(correct);
    if (correct) setScore((s) => s + 1);
    else setWrong((w) => w + 1);
  };

  const next = () => {
    if (idx + 1 < total) {
      setIdx(idx + 1);
      setPicked(null);
    } else {
      finish(picked === q.answer ? score : score); // score already updated
    }
  };

  const restart = () => {
    setIdx(0);
    setPicked(null);
    setScore(0);
    setWrong(0);
    setDone(false);
  };

  if (done) {
    const nextLesson = lessons.find((l) => l.order === lesson.order + 1);
    return (
      <>
        <TopBar />
        <main className="mx-auto max-w-xl px-4 py-12">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="kid-card p-10 text-center relative overflow-hidden"
          >
            <div className="blob bg-sunshine -top-10 -left-10 w-48 h-48" />
            <div className="blob bg-grape -bottom-10 -right-10 w-48 h-48" />
            <div className="relative">
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 1.2, repeat: 2 }}
                className="text-7xl"
              >
                {stars === 3 ? "🏆" : stars === 2 ? "🌟" : stars === 1 ? "👍" : "💪"}
              </motion.div>
              <h1 className="text-3xl font-bold mt-3 gradient-text">
                {stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep trying!"}
              </h1>
              <p className="text-muted-foreground mt-2">
                You scored <span className="font-bold text-foreground">{score} / {total}</span>
              </p>
              <div className="mt-4 flex justify-center">
                <StarRating value={stars} size={36} />
              </div>
              {stars >= 1 && (
                <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-sunshine/40 font-bold animate-wiggle">
                  {lesson.badge.emoji} Badge unlocked: {lesson.badge.name}
                </div>
              )}
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button
                  onClick={restart}
                  className="h-12 px-5 rounded-2xl border-2 border-border bg-card font-bold"
                >
                  ↻ Try again
                </button>
                {nextLesson ? (
                  <button
                    onClick={() => navigate({ to: "/learn/$lessonId", params: { lessonId: nextLesson.id } })}
                    className="h-12 px-5 rounded-2xl bg-primary text-primary-foreground font-bold chunky-shadow"
                  >
                    Next lesson →
                  </button>
                ) : (
                  <Link to="/learn" className="h-12 inline-flex items-center px-5 rounded-2xl bg-primary text-primary-foreground font-bold chunky-shadow">
                    All lessons
                  </Link>
                )}
              </div>
              {saving && <p className="text-xs text-muted-foreground mt-3">Saving your progress…</p>}
            </div>
          </motion.div>
        </main>
      </>
    );
  }

  const isLast = idx + 1 === total;

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <Link to="/learn/$lessonId" params={{ lessonId: lesson.id }} className="text-sm font-bold text-muted-foreground hover:text-foreground">
            ← Back to lesson
          </Link>
          <div className="flex items-center gap-3 text-sm font-bold">
            <span className="px-2 py-1 rounded-lg bg-mint/40">✓ {score}</span>
            <span className="px-2 py-1 rounded-lg bg-coral/30">✗ {wrong}</span>
            <span>{idx + 1} / {total}</span>
          </div>
        </div>

        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full gradient-primary"
            animate={{ width: `${((idx + (picked !== null ? 1 : 0)) / total) * 100}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="kid-card p-8 mt-6"
          >
            <div className="text-4xl text-center">{lesson.emoji}</div>
            <h2 className="text-xl sm:text-2xl font-bold text-center mt-3">{q.q}</h2>
            <div className="mt-6 grid gap-3">
              {q.choices.map((c, i) => {
                const isPicked = picked === i;
                const isCorrect = q.answer === i;
                const showState = picked !== null;
                const cls = !showState
                  ? "bg-card border-border hover:border-primary hover:-translate-y-0.5"
                  : isCorrect
                    ? "bg-mint/40 border-mint"
                    : isPicked
                      ? "bg-coral/30 border-coral"
                      : "bg-card border-border opacity-50";
                return (
                  <button
                    key={i}
                    onClick={() => choose(i)}
                    disabled={picked !== null}
                    className={`text-left h-14 px-5 rounded-2xl border-2 font-bold transition ${cls}`}
                  >
                    {showState && isCorrect && "✅ "}
                    {showState && isPicked && !isCorrect && "❌ "}
                    {c}
                  </button>
                );
              })}
            </div>

            {picked !== null && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 p-4 rounded-2xl bg-muted/60 text-center"
              >
                <p className="font-bold">
                  {picked === q.answer ? "🎉 Correct!" : "Not quite — keep going!"}
                </p>
                {q.explain && (
                  <p className="text-sm text-muted-foreground mt-1">{q.explain}</p>
                )}
                <button
                  onClick={next}
                  className="mt-4 h-11 px-6 rounded-2xl bg-primary text-primary-foreground font-bold chunky-shadow hover:scale-105 transition"
                >
                  {isLast ? "See my score 🏁" : "Next question →"}
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
}
