import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    // Use cached session (sync-ish, reads from storage) instead of getUser()
    // which hits the network and can race the session restore, causing a
    // login <-> dashboard redirect loop right after sign-in.
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login" });
    }
  },
  component: () => <Outlet />,
});
