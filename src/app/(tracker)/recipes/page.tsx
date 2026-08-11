import type { Metadata } from "next";

import { RecipeGallery } from "@/features/recipes/components/recipe-gallery";

export const metadata: Metadata = {
  title: "Meal prep y macros | NekoFit",
  description: "Recetas sencillas de meal prep con macros por porción para organizar tu semana.",
};

export default function RecipesPage() {
  return <RecipeGallery />;
}
