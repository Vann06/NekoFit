import type { Metadata } from "next";

import { WorkoutsStudio } from "@/features/workouts/components/workouts-studio";

export const metadata: Metadata = {
  title: "Entrenamientos | NekoFit",
  description: "Crea y edita entrenamientos por bloques con ejercicios, fuerza, cardio y cooldown.",
};

export default function WorkoutsPage() {
  return <WorkoutsStudio />;
}
