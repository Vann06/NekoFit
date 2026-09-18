import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AccountBadge } from "@/features/auth/components/account-badge";
import { createClient } from "@/lib/supabase/server";

type TrackerLayoutProps = {
  children: ReactNode;
};

export default async function TrackerLayout({ children }: TrackerLayoutProps) {
  const supabase = await createClient();
  if (!supabase) redirect("/login?error=configuration");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const name = profile?.full_name ?? user.user_metadata.full_name ?? user.user_metadata.name ?? "Atleta NekoFit";
  const avatarUrl = profile?.avatar_url ?? user.user_metadata.avatar_url ?? user.user_metadata.picture ?? null;

  return (
    <div className="tracker-layout">
      <AccountBadge name={name} email={user.email ?? ""} avatarUrl={avatarUrl} />
      {children}
    </div>
  );
}
