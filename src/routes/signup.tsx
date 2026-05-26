import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { TopBar } from "@/components/TopBar";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — ScratchKids" }] }),
  component: SignupPage,
});

const AVATARS = ["🐱", "🦄", "🐼", "🦊", "🐸", "🦁", "🐧", "🐙", "🤖", "👾", "🦖", "🐯"];

function SignupPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("🐱");
  const [role, setRole] = useState<"kid" | "parent">("kid");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user && profile) {
      navigate({ to: profile.role === "parent" ? "/parent" : "/learn" });
    }
  }, [user, profile, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/learn`,
        data: { display_name: name, avatar_emoji: avatar, role },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created! Check your email if confirmation is required.");
  };

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-md px-4 py-12">
        <div className="kid-card p-8">
          <div className="text-5xl text-center mb-2">{avatar}</div>
          <h1 className="text-3xl font-bold text-center">Create your account</h1>
          <p className="text-center text-muted-foreground mt-1">It's time to start coding!</p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("kid")}
                className={`h-14 rounded-2xl border-2 font-bold text-lg ${role === "kid" ? "bg-primary text-primary-foreground border-primary chunky-shadow" : "bg-card border-border"}`}
              >
                🧒 I'm a Kid
              </button>
              <button
                type="button"
                onClick={() => setRole("parent")}
                className={`h-14 rounded-2xl border-2 font-bold text-lg ${role === "parent" ? "bg-primary text-primary-foreground border-primary chunky-shadow" : "bg-card border-border"}`}
              >
                👨‍👧 Parent
              </button>
            </div>

            <label className="block">
              <span className="text-sm font-bold">Your name</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full h-12 rounded-2xl border-2 border-border bg-card px-4 outline-none focus:border-primary"
              />
            </label>

            {role === "kid" && (
              <div>
                <span className="text-sm font-bold">Pick an avatar</span>
                <div className="mt-2 grid grid-cols-6 gap-2">
                  {AVATARS.map((a) => (
                    <button
                      type="button"
                      key={a}
                      onClick={() => setAvatar(a)}
                      className={`h-12 text-2xl rounded-xl border-2 ${avatar === a ? "border-primary bg-primary/10" : "border-border bg-card"}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <label className="block">
              <span className="text-sm font-bold">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full h-12 rounded-2xl border-2 border-border bg-card px-4 outline-none focus:border-primary"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold">Password</span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full h-12 rounded-2xl border-2 border-border bg-card px-4 outline-none focus:border-primary"
              />
            </label>

            <button
              disabled={busy}
              className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-bold chunky-shadow disabled:opacity-60"
            >
              {busy ? "Creating..." : "Create my account 🎉"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm">
            Already have one?{" "}
            <Link to="/login" className="text-primary font-bold">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
