import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { TopBar } from "@/components/TopBar";
import { StarRating } from "@/components/StarRating";
import { getLesson, lessons } from "@/data/curriculum";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

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
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const q = lesson.quiz[idx];
  const total = lesson.quiz.length;

  const stars = score === total ? 3 : score >= Math.ceil(total * 0.7) ? 2 : score >= Math.ceil(total * 0.4) ? 1 : 0;

  const finish = async (finalScore: number) => {
    setDone(true);
    if (finalScore === total) confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    if (!user) return;
    setSaving(true);
    const finalStars = finalScore === total ? 3 : finalScore >= Math.ceil(total * 0.7) ? 2 : finalScore >= Math.ceil(total * 0.4) ? 1 : 0;

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
    const newScore = correct ? score + 1 : score;
    if (correct) setScore(newScore);
    setTimeout(() => {
      if (idx + 1 < total) {
        setIdx(idx + 1);
        setPicked(null);
      } else {
        finish(newScore);
      }
    }, 1100);
  };

  if (done) {
    const nextLesson = lessons.find((l) => l.order === lesson.order + 1);
    return (
      <>
        <TopBar />
        <main className="mx-auto max-w-xl px-4 py-12">
          <div className="kid-card p-10 text-center">
            <div className="text-7xl">{stars === 3 ? "🏆" : stars === 2 ? "🌟" : stars === 1 ? "👍" : "💪"}</div>
            <h1 className="text-3xl font-bold mt-3">
              {stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep trying!"}
            </h1>
            <p className="text-muted-foreground mt-2">
              You scored {score} / {total}
            </p>
            <div className="mt-4 flex justify-center">
              <StarRating value={stars} size={36} />
            </div>
            {stars >= 1 && (
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-sunshine/40 font-bold">
                {lesson.badge.emoji} Badge unlocked: {lesson.badge.name}
              </div>
            )}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => {
                  setIdx(0);
                  setPicked(null);
                  setScore(0);
                  setDone(false);
                }}
                className="h-12 px-5 rounded-2xl border-2 border-border bg-card font-bold"
              >
                Try again
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
        </main>
      </>
    );
  }

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <Link to="/learn/$lessonId" params={{ lessonId: lesson.id }} className="text-sm font-bold text-muted-foreground hover:text-foreground">
            ← Back to lesson
          </Link>
          <span className="text-sm font-bold">
            {idx + 1} / {total}
          </span>
        </div>

        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${((idx + 1) / total) * 100}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
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
                  ? "bg-card border-border hover:border-primary"
                  : isCorrect
                    ? "bg-mint/40 border-mint"
                    : isPicked
                      ? "bg-coral/30 border-coral"
                      : "bg-card border-border opacity-60";
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
            {picked !== null && q.explain && (
              <p className="mt-4 text-sm text-center text-muted-foreground">{q.explain}</p>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
}
