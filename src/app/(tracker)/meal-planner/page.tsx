import type { Metadata } from "next";

import { MealPlannerView } from "@/features/nutrition/components/meal-planner-view";

export const metadata: Metadata = {
  title: "Plan semanal de comidas | NekoFit",
  description: "Organiza alimentos y recetas durante la semana sin perder de vista tus objetivos.",
};

export default function MealPlannerPage() {
  return <MealPlannerView />;
}
