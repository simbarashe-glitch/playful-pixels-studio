import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { StarRating } from "@/components/StarRating";
import { ProgressRing } from "@/components/ProgressRing";
import { lessons, lessonAccentClass } from "@/data/curriculum";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated/learn")({
  head: () => ({ meta: [{ title: "Lessons — ScratchKids" }] }),
  component: LearnPage,
});

function LearnPage() {
  const { user, profile } = useAuth();

  const { data: progress = [] } = useQuery({
    queryKey: ["progress", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed, stars, updated_at")
        .eq("user_id", user!.id);
      return data ?? [];
    },
  });

  const { data: attempts = [] } = useQuery({
    queryKey: ["attempts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("quiz_attempts")
        .select("lesson_id, score, total, attempted_at")
        .eq("user_id", user!.id)
        .order("attempted_at", { ascending: false });
      return data ?? [];
    },
  });

  const byId = new Map(progress.map((p) => [p.lesson_id, p]));
  const done = progress.filter((p) => p.completed).length;
  const totalStars = progress.reduce((s, p) => s + (p.stars ?? 0), 0);
  const maxStars = lessons.length * 3;
  const overall = lessons.length ? done / lessons.length : 0;

  // best quiz score per lesson
  const bestByLesson = new Map<string, { score: number; total: number }>();
  for (const a of attempts) {
    const prev = bestByLesson.get(a.lesson_id);
    if (!prev || a.score / a.total > prev.score / prev.total) {
      bestByLesson.set(a.lesson_id, { score: a.score, total: a.total });
    }
  }

  // streak = consecutive days with activity
  const streak = computeStreak(progress.map((p) => p.updated_at).concat(attempts.map((a) => a.attempted_at)));

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-6xl px-4 py-8 relative">
        <div className="blob bg-sky -top-10 -left-10 w-72 h-72" />
        <div className="blob bg-grape top-20 right-0 w-80 h-80" style={{ animationDelay: "3s" }} />

        <div className="relative">
          {/* Hero card */}
          <section className="kid-card p-6 sm:p-8 overflow-hidden relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl"
                >
                  {profile?.avatar_emoji ?? "🐱"}
                </motion.div>
                <div>
                  <p className="text-sm font-bold text-muted-foreground">Hi there,</p>
                  <h1 className="text-3xl sm:text-4xl font-extrabold gradient-text">
                    {profile?.display_name ?? "friend"}!
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Let's learn something cool today 🚀
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                <StatPill emoji="🎯" label="Lessons" value={`${done}/${lessons.length}`} tone="sky" />
                <StatPill emoji="⭐" label="Stars" value={`${totalStars}/${maxStars}`} tone="sunshine" />
                <StatPill emoji="🔥" label="Streak" value={`${streak} day${streak === 1 ? "" : "s"}`} tone="coral" />
                <Link
                  to="/badges"
                  className="px-4 py-3 rounded-2xl bg-sunshine font-bold chunky-shadow hover:scale-105 transition text-sm"
                >
                  🏆 Badges
                </Link>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground mb-2">
                <span>Overall progress</span>
                <span>{Math.round(overall * 100)}%</span>
              </div>
              <div className="h-4 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full gradient-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${overall * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          </section>

          <h2 className="text-2xl font-bold mt-10 mb-4">📚 Your lessons</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {lessons.map((l, i) => {
              const p = byId.get(l.id);
              const best = bestByLesson.get(l.id);
              const lessonProgress = p?.completed ? 1 : 0;
              return (
                <motion.div
                  key={l.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    to="/learn/$lessonId"
                    params={{ lessonId: l.id }}
                    className="kid-card p-6 block hover:-translate-y-1 transition relative overflow-hidden group"
                  >
                    <div className="flex items-start justify-between">
                      <div className={`inline-flex items-center gap-2 rounded-2xl px-3 py-1 text-xs font-bold ${lessonAccentClass[l.color]}`}>
                        Lesson {l.order}
                      </div>
                      <ProgressRing value={lessonProgress} size={44} stroke={5}>
                        {p?.completed ? "✓" : `${Math.round(lessonProgress * 100)}%`}
                      </ProgressRing>
                    </div>
                    <div className="mt-3 text-5xl group-hover:animate-wiggle">{l.emoji}</div>
                    <h3 className="mt-2 text-xl font-bold">{l.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{l.tagline}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <StarRating value={p?.stars ?? 0} />
                      {best && (
                        <span className="text-xs font-bold text-muted-foreground">
                          Best: {best.score}/{best.total}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 text-sm font-bold text-primary">
                      {p?.completed ? "Review →" : "Start lesson →"}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {profile?.role === "kid" && profile.pairing_code && (
            <div className="mt-10 kid-card p-5 text-center bg-sunshine/20">
              <p className="text-sm text-muted-foreground">Share this code with a grown-up so they can follow your progress:</p>
              <p className="mt-1 text-2xl font-bold font-mono tracking-widest">{profile.pairing_code}</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function StatPill({ emoji, label, value, tone }: { emoji: string; label: string; value: string; tone: "sky" | "sunshine" | "coral" | "mint" }) {
  const toneClass = {
    sky: "bg-sky/20",
    sunshine: "bg-sunshine/30",
    coral: "bg-coral/20",
    mint: "bg-mint/30",
  }[tone];
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-2xl border-2 border-border ${toneClass}`}>
      <span className="text-2xl">{emoji}</span>
      <div className="leading-tight">
        <p className="text-[10px] font-bold text-muted-foreground uppercase">{label}</p>
        <p className="text-sm font-extrabold">{value}</p>
      </div>
    </div>
  );
}

function computeStreak(dates: (string | null | undefined)[]): number {
  const days = new Set<string>();
  for (const d of dates) {
    if (!d) continue;
    days.add(new Date(d).toISOString().slice(0, 10));
  }
  if (days.size === 0) return 0;
  let streak = 0;
  const cursor = new Date();
  // allow today OR yesterday as start
  const today = cursor.toISOString().slice(0, 10);
  if (!days.has(today)) cursor.setDate(cursor.getDate() - 1);
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
