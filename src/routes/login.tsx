import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { TopBar } from "@/components/TopBar";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — ScratchKids" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
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
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back!");
  };

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-md px-4 py-12">
        <div className="kid-card p-8">
          <div className="text-5xl text-center mb-2">👋</div>
          <h1 className="text-3xl font-bold text-center">Welcome back!</h1>
          <p className="text-center text-muted-foreground mt-1">Log in to keep learning.</p>
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full h-12 rounded-2xl border-2 border-border bg-card px-4 outline-none focus:border-primary"
              />
            </label>
            <button
              disabled={busy}
              className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-bold chunky-shadow disabled:opacity-60"
            >
              {busy ? "Logging in..." : "Log in"}
            </button>
          </form>
          <p className="mt-4 text-center text-sm">
            New here?{" "}
            <Link to="/signup" className="text-primary font-bold">
              Create an account
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
