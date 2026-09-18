"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function GoogleSignInButton({ nextPath }: { nextPath: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function signIn() {
    const supabase = createClient();
    if (!supabase) {
      setError("Falta configurar Supabase en las variables de entorno.");
      return;
    }

    setPending(true);
    setError("");
    const callback = new URL("/auth/callback", window.location.origin);
    callback.searchParams.set("next", nextPath);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback.toString() },
    });

    if (oauthError) {
      setPending(false);
      setError(oauthError.message);
    }
  }

  return (
    <div>
      <button type="button" onClick={signIn} disabled={pending}>
        <span aria-hidden="true">G</span>
        {pending ? "Abriendo Google…" : "Continuar con Google"}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
