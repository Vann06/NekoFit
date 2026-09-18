import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseConfig } from "./config";

const protectedPrefixes = [
  "/dashboard",
  "/nutrition",
  "/meal-planner",
  "/recipes",
  "/workouts",
  "/progress",
  "/shopping",
  "/wardrobe",
];

function isProtectedPath(pathname: string) {
  return protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function updateSession(request: NextRequest) {
  const config = getSupabaseConfig();
  const pathname = request.nextUrl.pathname;

  if (!config) {
    if (!isProtectedPath(pathname)) return NextResponse.next({ request });
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "?error=configuration";
    return NextResponse.redirect(loginUrl);
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Debe ser la primera operación de auth: valida y refresca el JWT si hace falta.
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims?.sub);

  if (!isAuthenticated && isProtectedPath(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && pathname === "/login") {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}
