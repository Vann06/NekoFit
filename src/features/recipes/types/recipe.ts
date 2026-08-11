export type RecipeCollection = "Vegetariana" | "Pescado" | "Proteína";

export type RecipeSummary = {
  id: string;
  name: string;
  imageUrl: string;
  collection: RecipeCollection;
};

export type RecipeIngredient = {
  name: string;
  measure: string;
};

export type RecipeDetail = RecipeSummary & {
  area: string;
  apiCategory: string;
  instructions: string;
  ingredients: RecipeIngredient[];
  sourceUrl?: string;
  videoUrl?: string;
};
