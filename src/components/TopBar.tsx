import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";

export function TopBar() {
  const { user, profile, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-background/70 border-b-2 border-border">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-2xl font-bold">
          <span className="text-3xl">🐱</span>
          <span>Scratch<span className="text-primary">Kids</span></span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3 text-sm font-bold">
          {user ? (
            <>
              <Link to="/learn" className="px-3 py-2 rounded-xl hover:bg-muted">Learn</Link>
              <Link to="/badges" className="px-3 py-2 rounded-xl hover:bg-muted">Badges</Link>
              {profile?.role === "parent" && (
                <Link to="/parent" className="px-3 py-2 rounded-xl hover:bg-muted">Parent</Link>
              )}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-muted">
                <span className="text-xl">{profile?.avatar_emoji ?? "🐱"}</span>
                <span>{profile?.display_name ?? "You"}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="px-3 py-2 rounded-xl hover:bg-destructive/10 text-destructive"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 rounded-2xl hover:bg-muted">Log in</Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded-2xl bg-primary text-primary-foreground chunky-shadow"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
