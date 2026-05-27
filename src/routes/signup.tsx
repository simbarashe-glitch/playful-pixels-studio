import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — ScratchKids" }] }),
  component: SignupPage,
});

// Kids use a synthetic email so they only need a username + simple password.
const KID_EMAIL_DOMAIN = "kids.scratchkids.local";
const toKidEmail = (username: string) =>
  `${username.trim().toLowerCase().replace(/[^a-z0-9]/g, "")}@${KID_EMAIL_DOMAIN}`;

function SignupPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<"kid" | "parent">("kid");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user && profile) {
      navigate({ to: profile.role === "parent" ? "/parent" : "/learn" });
    }
  }, [user, profile, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password needs at least 6 characters");
      return;
    }
    setBusy(true);
    const finalEmail = role === "kid" ? toKidEmail(name) : email.trim();
    const { error } = await supabase.auth.signUp({
      email: finalEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/learn`,
        data: { display_name: name, avatar_emoji: "🐱", role },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome! 🎉");
  };

  return (
    <main className="h-[100dvh] overflow-hidden flex items-center justify-center px-4">
      <div className="kid-card p-6 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center">Join ScratchKids 🚀</h1>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setRole("kid")}
            className={`h-11 rounded-2xl border-2 font-bold ${role === "kid" ? "bg-primary text-primary-foreground border-primary chunky-shadow" : "bg-card border-border"}`}
          >
            🧒 Kid
          </button>
          <button
            type="button"
            onClick={() => setRole("parent")}
            className={`h-11 rounded-2xl border-2 font-bold ${role === "parent" ? "bg-primary text-primary-foreground border-primary chunky-shadow" : "bg-card border-border"}`}
          >
            👨‍👧 Parent
          </button>
        </div>

        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <input
            required
            placeholder={role === "kid" ? "Pick a username" : "Your name"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-11 rounded-2xl border-2 border-border bg-card px-4 outline-none focus:border-primary"
          />

          {role === "parent" && (
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 rounded-2xl border-2 border-border bg-card px-4 outline-none focus:border-primary"
            />
          )}

          <input
            type="password"
            required
            minLength={6}
            placeholder={role === "kid" ? "Secret word (6+ letters)" : "Password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-11 rounded-2xl border-2 border-border bg-card px-4 outline-none focus:border-primary"
          />

          <button
            disabled={busy}
            className="w-full h-11 rounded-2xl bg-primary text-primary-foreground font-bold chunky-shadow disabled:opacity-60"
          >
            {busy ? "Creating…" : "Start coding 🎉"}
          </button>
        </form>

        <p className="mt-3 text-center text-sm">
          Already have one?{" "}
          <Link to="/login" className="text-primary font-bold">
            Log in
          </Link>
        </p>
        {role === "kid" && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            You can pick your avatar after signing in ✨
          </p>
        )}
      </div>
    </main>
  );
}
