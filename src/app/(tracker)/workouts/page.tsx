import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { WeeklyWorkoutsStudio } from "@/features/workouts/components/weekly-workouts-studio";
import type { WeightUnit } from "@/features/workouts/types/workout";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Entrenamientos | NekoFit",
  description: "Hojea, crea y edita rutinas visuales para seguirlas rápidamente en el gimnasio.",
};

export default async function WorkoutsPage() {
  const supabase = await createClient();
  if (!supabase) redirect("/login?error=configuration");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("preferred_weight_unit")
    .eq("id", user.id)
    .maybeSingle();

  const preferredUnit: WeightUnit = profile?.preferred_weight_unit === "lb" ? "lb" : "kg";
  return <WeeklyWorkoutsStudio userId={user.id} preferredUnit={preferredUnit} />;
}
