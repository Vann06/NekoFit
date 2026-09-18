import type { Metadata } from "next";

import { GoogleSignInButton } from "@/features/auth/components/google-sign-in-button";

import styles from "./login.module.css";

export const metadata: Metadata = {
  title: "Iniciar sesión | NekoFit",
  description: "Accede a tu espacio personal de NekoFit con Google.",
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

const errorMessages: Record<string, string> = {
  configuration: "Configura las variables públicas de Supabase para iniciar sesión.",
  missing_code: "Google no devolvió un código de acceso. Intenta de nuevo.",
  oauth: "No pudimos completar el acceso con Google. Intenta de nuevo.",
  profile: "La sesión inició, pero no pudimos preparar tu perfil.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = params.next?.startsWith("/") && !params.next.startsWith("//") ? params.next : "/dashboard";

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <span className={styles.cat} aria-hidden="true">ฅ^•ﻌ•^ฅ</span>
        <p className={styles.eyebrow}>Tu progreso, siempre contigo</p>
        <h1>Hola de nuevo</h1>
        <p className={styles.copy}>Inicia sesión para sincronizar tus planes, entrenamientos y avances de forma segura.</p>
        {params.error && <p className={styles.error} role="alert">{errorMessages[params.error] ?? "No fue posible iniciar sesión."}</p>}
        <GoogleSignInButton nextPath={nextPath} />
        <small>Solo usamos tu nombre, correo y foto para personalizar NekoFit.</small>
      </section>
    </main>
  );
}
