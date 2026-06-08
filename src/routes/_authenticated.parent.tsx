import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { StarRating } from "@/components/StarRating";
import { lessons, getLesson } from "@/data/curriculum";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/parent")({
  head: () => ({ meta: [{ title: "Parent Dashboard — ScratchKids" }] }),
  component: ParentPage,
});

function ParentPage() {
  const { user, profile } = useAuth();
  const [code, setCode] = useState("");
  const [linking, setLinking] = useState(false);

  const { data: kids = [], refetch: refetchKids } = useQuery({
    queryKey: ["kids", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_emoji, pairing_code")
        .eq("parent_id", user!.id);
      return data ?? [];
    },
  });

  const kidIds = kids.map((k) => k.id);

  const { data: allProgress = [] } = useQuery({
    queryKey: ["kids-progress", kidIds.join(",")],
    enabled: kidIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("lesson_progress")
        .select("user_id, lesson_id, stars, completed, updated_at")
        .in("user_id", kidIds);
      return data ?? [];
    },
  });

  const { data: allAttempts = [] } = useQuery({
    queryKey: ["kids-attempts", kidIds.join(",")],
    enabled: kidIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("quiz_attempts")
        .select("user_id, lesson_id, score, total, attempted_at")
        .in("user_id", kidIds)
        .order("attempted_at", { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

  const linkKid = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinking(true);
    const { data, error } = await supabase
      .from("profiles")
      .update({ parent_id: user!.id })
      .eq("pairing_code", code.trim().toUpperCase())
      .eq("role", "kid")
      .select("id, display_name");
    setLinking(false);
    if (error || !data || data.length === 0) {
      toast.error("Code didn't match any kid. Double-check and try again.");
      return;
    }
    toast.success(`Linked ${data[0].display_name}! 🎉`);
    setCode("");
    refetchKids();
  };

  if (profile && profile.role !== "parent") {
    return (
      <>
        <TopBar />
        <main className="mx-auto max-w-md p-8 text-center">
          <div className="kid-card p-8">
            <div className="text-5xl">🔒</div>
            <h1 className="text-2xl font-bold mt-2">Parents only</h1>
            <p className="text-muted-foreground mt-2">This area is for parent accounts.</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-5xl px-4 py-8 relative">
        <div className="blob bg-grape -top-10 right-10 w-72 h-72" />
        <div className="relative">
          <h1 className="text-4xl font-extrabold gradient-text">Parent Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your child's learning progress.</p>

          <section className="mt-6 kid-card p-6">
            <h2 className="text-xl font-bold">🔗 Link a child</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Ask your child for their pairing code (shown on their lessons page).
            </p>
            <form onSubmit={linkKid} className="mt-4 flex gap-2 flex-wrap">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="ABC123"
                className="h-12 px-4 rounded-2xl border-2 border-border bg-card font-mono uppercase tracking-wider flex-1 min-w-[140px]"
              />
              <button
                disabled={linking || !code}
                className="h-12 px-5 rounded-2xl bg-primary text-primary-foreground font-bold chunky-shadow disabled:opacity-60"
              >
                {linking ? "Linking…" : "Link"}
              </button>
            </form>
          </section>

          <section className="mt-8 space-y-6">
            {kids.length === 0 && (
              <div className="kid-card p-8 text-center text-muted-foreground">
                <div className="text-5xl">👨‍👧</div>
                <p className="mt-2">No kids linked yet. Use the pairing code above to link one.</p>
              </div>
            )}
            {kids.map((kid, k) => {
              const kidProgress = allProgress.filter((p) => p.user_id === kid.id);
              const kidAttempts = allAttempts.filter((a) => a.user_id === kid.id);
              const done = kidProgress.filter((p) => p.completed).length;
              const totalStars = kidProgress.reduce((s, p) => s + p.stars, 0);
              const badges = kidProgress.filter((p) => p.completed && p.stars > 0).length;
              const avgScore = kidAttempts.length
                ? Math.round(
                    (kidAttempts.reduce((s, a) => s + a.score / a.total, 0) / kidAttempts.length) * 100,
                  )
                : 0;
              const last = kidProgress
                .map((p) => p.updated_at)
                .concat(kidAttempts.map((a) => a.attempted_at))
                .sort()
                .reverse()[0];
              return (
                <motion.div
                  key={kid.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: k * 0.05 }}
                  className="kid-card p-6"
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-5xl">{kid.avatar_emoji}</span>
                    <div className="flex-1 min-w-[200px]">
                      <h3 className="text-2xl font-bold">{kid.display_name}</h3>
                      <p className="text-xs text-muted-foreground">
                        Last active: {last ? new Date(last).toLocaleString() : "never"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatBox emoji="📚" label="Lessons" value={`${done}/${lessons.length}`} />
                    <StatBox emoji="⭐" label="Stars" value={`${totalStars}`} />
                    <StatBox emoji="🏆" label="Badges" value={`${badges}`} />
                    <StatBox emoji="🎯" label="Avg quiz" value={`${avgScore}%`} />
                  </div>

                  <div className="mt-5 grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-muted-foreground mb-2">Lesson progress</h4>
                      <div className="space-y-1.5">
                        {lessons.map((l) => {
                          const p = kidProgress.find((x) => x.lesson_id === l.id);
                          return (
                            <div
                              key={l.id}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40"
                            >
                              <span className="flex items-center gap-2 text-sm font-semibold">
                                <span>{l.emoji}</span>
                                <span className="truncate">{l.title}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                {p?.completed && <span className="text-xs text-mint font-bold">✓</span>}
                                <StarRating value={p?.stars ?? 0} size={14} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-muted-foreground mb-2">Recent quiz attempts</h4>
                      {kidAttempts.length === 0 ? (
                        <div className="p-4 rounded-xl bg-muted/40 text-sm text-muted-foreground text-center">
                          No quiz attempts yet.
                        </div>
                      ) : (
                        <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
                          {kidAttempts.slice(0, 12).map((a, i) => {
                            const l = getLesson(a.lesson_id);
                            const pct = (a.score / a.total) * 100;
                            const tone = pct === 100 ? "bg-mint/40" : pct >= 70 ? "bg-sunshine/40" : "bg-coral/30";
                            return (
                              <div key={i} className={`flex items-center justify-between p-2.5 rounded-xl ${tone}`}>
                                <span className="text-sm font-semibold truncate">
                                  {l?.emoji} {l?.title ?? a.lesson_id}
                                </span>
                                <span className="text-xs font-bold whitespace-nowrap">
                                  {a.score}/{a.total} · {new Date(a.attempted_at).toLocaleDateString()}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </section>
        </div>
      </main>
    </>
  );
}

function StatBox({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="rounded-2xl border-2 border-border p-3 bg-card text-center">
      <div className="text-2xl">{emoji}</div>
      <p className="text-[10px] font-bold uppercase text-muted-foreground mt-1">{label}</p>
      <p className="text-lg font-extrabold">{value}</p>
    </div>
  );
}
