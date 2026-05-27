import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — ScratchKids" }] }),
  component: LoginPage,
});

const KID_EMAIL_DOMAIN = "kids.scratchkids.local";
const toKidEmail = (username: string) =>
  `${username.trim().toLowerCase().replace(/[^a-z0-9]/g, "")}@${KID_EMAIL_DOMAIN}`;

function LoginPage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<"kid" | "parent">("kid");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (user && profile) {
      navigate({ to: profile.role === "parent" ? "/parent" : "/learn", replace: true });
    }
  }, [user, profile, loading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const email = role === "kid" ? toKidEmail(identifier) : identifier.trim();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back!");
  };

  return (
    <main className="h-[100dvh] overflow-hidden flex items-center justify-center px-4">
      <div className="kid-card p-6 w-full max-w-sm">
        <div className="text-4xl text-center mb-1">👋</div>
        <h1 className="text-2xl font-bold text-center">Welcome back!</h1>

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
            type={role === "parent" ? "email" : "text"}
            placeholder={role === "kid" ? "Your username" : "Email"}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full h-11 rounded-2xl border-2 border-border bg-card px-4 outline-none focus:border-primary"
          />
          <input
            type="password"
            required
            placeholder={role === "kid" ? "Secret word" : "Password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-11 rounded-2xl border-2 border-border bg-card px-4 outline-none focus:border-primary"
          />
          <button
            disabled={busy}
            className="w-full h-11 rounded-2xl bg-primary text-primary-foreground font-bold chunky-shadow disabled:opacity-60"
          >
            {busy ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-3 text-center text-sm">
          New here?{" "}
          <Link to="/signup" className="text-primary font-bold">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
