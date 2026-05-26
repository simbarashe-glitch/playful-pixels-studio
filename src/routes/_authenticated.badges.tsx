import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { lessons } from "@/data/curriculum";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated/badges")({
  head: () => ({ meta: [{ title: "My Badges — ScratchKids" }] }),
  component: BadgesPage,
});

function BadgesPage() {
  const { user } = useAuth();
  const { data: progress = [] } = useQuery({
    queryKey: ["progress", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("lesson_progress")
        .select("lesson_id, stars, completed")
        .eq("user_id", user!.id);
      return data ?? [];
    },
  });

  const earned = new Set(progress.filter((p) => p.completed && p.stars > 0).map((p) => p.lesson_id));

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-4xl font-extrabold text-center">🏆 Trophy Room</h1>
        <p className="text-center text-muted-foreground mt-2">
          You've unlocked {earned.size} of {lessons.length} badges!
        </p>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {lessons.map((l, i) => {
            const got = earned.has(l.id);
            return (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className={`kid-card p-6 text-center ${got ? "" : "opacity-50 grayscale"}`}
              >
                <div className="text-6xl">{l.badge.emoji}</div>
                <p className="mt-3 font-bold">{l.badge.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{l.title}</p>
                {!got && (
                  <Link
                    to="/learn/$lessonId"
                    params={{ lessonId: l.id }}
                    className="mt-3 inline-block text-xs font-bold text-primary"
                  >
                    Unlock →
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      </main>
    </>
  );
}
