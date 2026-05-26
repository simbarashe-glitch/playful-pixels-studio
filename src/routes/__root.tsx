import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center kid-card p-10">
        <div className="text-7xl mb-4">🤖</div>
        <h1 className="text-5xl font-bold">Oops!</h1>
        <p className="mt-3 text-lg text-muted-foreground">We can't find that page.</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-6 text-base font-bold text-primary-foreground chunky-shadow hover:scale-105 transition"
          >
            Take me home 🏠
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center kid-card p-10">
        <div className="text-6xl mb-4">😵‍💫</div>
        <h1 className="text-2xl font-bold">Something went wonky</h1>
        <p className="mt-2 text-sm text-muted-foreground">Try again — you got this!</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex h-11 items-center rounded-2xl bg-primary px-5 font-bold text-primary-foreground chunky-shadow"
          >
            Try again
          </button>
          <a href="/" className="inline-flex h-11 items-center rounded-2xl border-2 border-border bg-card px-5 font-bold">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ScratchKids — Learn Scratch Coding the Fun Way" },
      { name: "description", content: "A bright, playful learning platform where young coders explore Scratch — sprites, motion, looks, sound, events and more — with illustrated lessons and quizzes." },
      { property: "og:title", content: "ScratchKids" },
      { property: "og:description", content: "Learn Scratch coding with fun, illustrated lessons and quizzes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function CacheInvalidator() {
  const router = useRouter();
  const queryClient = useQueryClient();
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      router.invalidate();
      queryClient.invalidateQueries();
    });
    return () => subscription.unsubscribe();
  }, [router, queryClient]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CacheInvalidator />
        <Outlet />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
