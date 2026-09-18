import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

function safeNextPath(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = safeNextPath(requestUrl.searchParams.get("next"));
  const supabase = await createClient();

  if (!supabase) {
    return NextResponse.redirect(new URL("/login?error=configuration", requestUrl.origin));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", requestUrl.origin));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/login?error=oauth", requestUrl.origin));
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const fullName = user.user_metadata.full_name ?? user.user_metadata.name ?? null;
    const avatarUrl = user.user_metadata.avatar_url ?? user.user_metadata.picture ?? null;
    const { error: profileError } = await supabase.from("profiles").upsert({ id: user.id, full_name: fullName, avatar_url: avatarUrl }, { onConflict: "id" });
    if (profileError) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL("/login?error=profile", requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
}
