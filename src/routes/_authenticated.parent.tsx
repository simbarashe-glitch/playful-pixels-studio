import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { StarRating } from "@/components/StarRating";
import { lessons } from "@/data/curriculum";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

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

  const { data: allProgress = [] } = useQuery({
    queryKey: ["kids-progress", kids.map((k) => k.id).join(",")],
    enabled: kids.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("lesson_progress")
        .select("user_id, lesson_id, stars, completed");
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
            <p className="text-muted-foreground mt-2">
              This area is for parent accounts.
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-3xl font-extrabold">Parent Dashboard</h1>
        <p className="text-muted-foreground mt-1">Track your child's learning progress.</p>

        <section className="mt-6 kid-card p-6">
          <h2 className="text-xl font-bold">Link a child</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Ask your child for their pairing code (shown on their lessons page footer or shared with you).
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
              Link
            </button>
          </form>
        </section>

        <section className="mt-8 space-y-6">
          {kids.length === 0 && (
            <div className="kid-card p-6 text-center text-muted-foreground">
              No kids linked yet. Use the pairing code above to link one.
            </div>
          )}
          {kids.map((kid) => {
            const kidProgress = allProgress.filter((p) => p.user_id === kid.id);
            const done = kidProgress.filter((p) => p.completed).length;
            const totalStars = kidProgress.reduce((s, p) => s + p.stars, 0);
            return (
              <div key={kid.id} className="kid-card p-6">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{kid.avatar_emoji}</span>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{kid.display_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {done} / {lessons.length} lessons • {totalStars} stars
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid sm:grid-cols-2 gap-2">
                  {lessons.map((l) => {
                    const p = kidProgress.find((x) => x.lesson_id === l.id);
                    return (
                      <div
                        key={l.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                      >
                        <span className="flex items-center gap-2 text-sm font-semibold">
                          <span>{l.emoji}</span>
                          {l.title}
                        </span>
                        <StarRating value={p?.stars ?? 0} size={16} />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </>
  );
}
