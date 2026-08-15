import type { Metadata } from "next";

import { WorkoutsStudio } from "@/features/workouts/components/workouts-studio";

export const metadata: Metadata = {
  title: "Entrenamientos | NekoFit",
  description: "Hojea, crea y edita rutinas visuales para seguirlas rápidamente en el gimnasio.",
};

export default function WorkoutsPage() {
  return <WorkoutsStudio />;
}
