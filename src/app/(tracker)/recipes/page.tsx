import type { Metadata } from "next";

import { RecipeGallery } from "@/features/recipes/components/recipe-gallery";

export const metadata: Metadata = {
  title: "Recetas saludables | NekoFit",
  description: "Explora ideas de recetas variadas para organizar tus próximas comidas.",
};

export default function RecipesPage() {
  return <RecipeGallery />;
}
