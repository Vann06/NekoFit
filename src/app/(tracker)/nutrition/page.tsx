import type { Metadata } from "next";

import { NutritionDiary } from "@/features/nutrition/components/nutrition-diary";

export const metadata: Metadata = {
  title: "Diario de alimentación | NekoFit",
  description: "Registra alimentos, porciones, calorías y macros en tu diario personal.",
};

export default function NutritionPage() {
  return <NutritionDiary />;
}
