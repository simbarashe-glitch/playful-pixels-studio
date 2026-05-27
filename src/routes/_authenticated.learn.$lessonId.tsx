import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { TopBar } from "@/components/TopBar";
import { MascotBubble } from "@/components/MascotBubble";
import { BlockCard } from "@/components/BlockCard";
import { SpriteStage } from "@/components/SpriteStage";
import { getLesson, lessonAccentClass, lessons } from "@/data/curriculum";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated/learn/$lessonId")({
  head: ({ params }) => {
    const l = getLesson(params.lessonId);
    return { meta: [{ title: l ? `${l.title} — ScratchKids` : "Lesson — ScratchKids" }] };
  },
  component: LessonPage,
  notFoundComponent: () => (
    <>
      <TopBar />
      <main className="mx-auto max-w-2xl p-10 text-center">
        <div className="text-6xl">🤷</div>
        <h1 className="text-3xl font-bold mt-3">Lesson not found</h1>
        <Link to="/learn" className="inline-block mt-6 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold chunky-shadow">
          Back to lessons
        </Link>
      </main>
    </>
  ),
});

// Costume sets per lesson — used by the interactive stage
const COSTUMES: Record<string, string[]> = {
  intro: ["🐱", "🐶"],
  sprites: ["🐱", "🦄", "🐼", "🦊", "🐸"],
  motion: ["🐱"],
  looks: ["🐱", "😺", "😻", "🙀"],
  sound: ["🐱"],
  events: ["🐱"],
  control: ["🐱"],
  sensing: ["🐱"],
  "operators-variables": ["🐱"],
};

// Fallback blocks for lessons that don't declare any, so the stage is always playable
const FALLBACK_BLOCKS: Record<string, BlocksFallback> = {
  intro: [
    { label: "move 10 steps", description: "Slide forward", color: "motion" },
    { label: "say Hello! for 2 secs", description: "Speech bubble", color: "looks" },
    { label: "when 🚩 clicked", description: "Run a demo", color: "events" },
  ],
};
type BlocksFallback = { label: string; description: string; color: import("@/data/curriculum").BlockCard["color"] }[];

function LessonPage() {
  const { lessonId } = Route.useParams();
  const lesson = getLesson(lessonId);
  if (!lesson) throw notFound();

  const { user } = useAuth();
  const qc = useQueryClient();
  const [savingDone, setSavingDone] = useState(false);

  const { data: progress } = useQuery({
    queryKey: ["lesson-progress", user?.id, lesson.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("lesson_progress")
        .select("completed, stars")
        .eq("user_id", user!.id)
        .eq("lesson_id", lesson.id)
        .maybeSingle();
      return data;
    },
  });

  const next = lessons.find((l) => l.order === lesson.order + 1);
  const playBlocks = lesson.blocks?.length ? lesson.blocks : FALLBACK_BLOCKS[lesson.id] ?? [];

  const markLearned = async () => {
    if (!user) return;
    setSavingDone(true);
    const { error } = await supabase.from("lesson_progress").upsert(
      {
        user_id: user.id,
        lesson_id: lesson.id,
        completed: true,
        completed_at: new Date().toISOString(),
        stars: Math.max(progress?.stars ?? 0, 1),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" },
    );
    setSavingDone(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Great job! Lesson marked as learned 🎉");
    qc.invalidateQueries({ queryKey: ["lesson-progress"] });
    qc.invalidateQueries({ queryKey: ["progress"] });
  };

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Link to="/learn" className="text-sm font-bold text-muted-foreground hover:text-foreground">
          ← All lessons
        </Link>

        <header className="mt-4 kid-card p-8 text-center">
          <div className={`inline-flex items-center gap-2 rounded-2xl px-3 py-1 text-xs font-bold ${lessonAccentClass[lesson.color]}`}>
            Lesson {lesson.order}
          </div>
          <div className="text-7xl mt-3">{lesson.emoji}</div>
          <h1 className="text-4xl font-extrabold mt-2">{lesson.title}</h1>
          <p className="text-lg text-muted-foreground mt-2">{lesson.tagline}</p>
          {progress?.completed && (
            <p className="mt-3 inline-block px-3 py-1 rounded-xl bg-mint font-bold text-sm">
              ✓ You've learned this!
            </p>
          )}
        </header>

        {playBlocks.length > 0 && (
          <section className="mt-8">
            <SpriteStage blocks={playBlocks} costumes={COSTUMES[lesson.id] ?? ["🐱"]} />
          </section>
        )}

        <section className="mt-8 space-y-5">
          {lesson.concepts.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 ? 20 : -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <MascotBubble emoji={c.emoji} tone={i % 4 === 0 ? "primary" : i % 4 === 1 ? "mint" : i % 4 === 2 ? "sunshine" : "coral"}>
                <span className="block font-bold text-lg mb-1">{c.title}</span>
                <span className="font-normal">{c.body}</span>
              </MascotBubble>
            </motion.div>
          ))}
        </section>

        {lesson.blocks && lesson.blocks.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-bold mb-4">🧩 Blocks you'll meet</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {lesson.blocks.map((b, i) => (
                <BlockCard key={i} block={b} />
              ))}
            </div>
          </section>
        )}

        <section className="mt-10 kid-card p-6 text-center bg-sunshine/30">
          <div className="text-4xl">💡</div>
          <h3 className="text-xl font-bold mt-2">Ready to show what you know?</h3>
          <p className="text-sm mt-1 text-muted-foreground">
            Mark this lesson as learned, then try the quiz to earn stars!
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={markLearned}
              disabled={savingDone}
              className="h-12 inline-flex items-center rounded-2xl bg-mint px-5 font-bold chunky-shadow hover:scale-105 transition disabled:opacity-60"
            >
              {progress?.completed ? "✓ Learned" : savingDone ? "Saving…" : "✓ Mark as learned"}
            </button>
            <Link
              to="/quiz/$lessonId"
              params={{ lessonId: lesson.id }}
              className="h-12 inline-flex items-center rounded-2xl bg-primary px-6 font-bold text-primary-foreground chunky-shadow hover:scale-105 transition"
            >
              Take the quiz →
            </Link>
          </div>
        </section>

        {next && (
          <div className="mt-8 text-center">
            <Link
              to="/learn/$lessonId"
              params={{ lessonId: next.id }}
              className="text-sm font-bold text-muted-foreground hover:text-foreground"
            >
              Next lesson: {next.emoji} {next.title} →
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
