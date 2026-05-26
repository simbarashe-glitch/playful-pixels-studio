import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { MascotBubble } from "@/components/MascotBubble";
import { StarRating } from "@/components/StarRating";
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
        .select("lesson_id, completed, stars")
        .eq("user_id", user!.id);
      return data ?? [];
    },
  });

  const byId = new Map(progress.map((p) => [p.lesson_id, p]));
  const done = progress.filter((p) => p.completed).length;

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <MascotBubble emoji={profile?.avatar_emoji ?? "🐱"}>
            Hi {profile?.display_name ?? "friend"}! Pick a lesson and let's learn something cool today. 🌟
          </MascotBubble>
        </div>

        <div className="kid-card p-5 mb-8 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Your progress</p>
            <p className="text-2xl font-bold">
              {done} / {lessons.length} lessons completed
            </p>
          </div>
          <Link to="/badges" className="px-4 py-2 rounded-2xl bg-sunshine font-bold chunky-shadow">
            🏆 My badges
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {lessons.map((l, i) => {
            const p = byId.get(l.id);
            return (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to="/learn/$lessonId"
                  params={{ lessonId: l.id }}
                  className="kid-card p-6 block hover:-translate-y-1 transition"
                >
                  <div className={`inline-flex items-center gap-2 rounded-2xl px-3 py-1 text-xs font-bold ${lessonAccentClass[l.color]}`}>
                    Lesson {l.order}
                  </div>
                  <div className="mt-3 text-5xl">{l.emoji}</div>
                  <h3 className="mt-2 text-2xl font-bold">{l.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{l.tagline}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <StarRating value={p?.stars ?? 0} />
                    <span className="text-sm font-bold text-primary">
                      {p?.completed ? "Done ✓" : "Start →"}
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {profile?.role === "kid" && profile.pairing_code && (
          <div className="mt-10 kid-card p-5 text-center bg-sunshine/20">
            <p className="text-sm text-muted-foreground">Show this code to a parent so they can follow your progress:</p>
            <p className="mt-1 text-2xl font-bold font-mono tracking-widest">{profile.pairing_code}</p>
          </div>
        )}
      </main>
    </>
  );
}

