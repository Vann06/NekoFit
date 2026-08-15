import type { Metadata } from "next";

import { ProgressStudio } from "@/features/progress/components/progress-studio";

export const metadata: Metadata = {
  title: "Progreso corporal | NekoFit",
  description: "Registra peso, grasa, masa muscular, agua corporal y medidas personales.",
};

export default function ProgressPage() {
  return <ProgressStudio />;
}
