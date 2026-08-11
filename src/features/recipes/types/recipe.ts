export type RecipeGoal = "Alta proteína" | "Balanceado" | "Vegetariano" | "Desayuno";

export type RecipeMacros = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
};

export type RecipeIngredient = {
  name: string;
  amount: string;
};

export type IngredientWithNutrition = RecipeIngredient & {
  batchNutrition: RecipeMacros;
};

export type MealPrepRecipe = {
  id: string;
  name: string;
  description: string;
  goal: RecipeGoal;
  prepMinutes: number;
  servings: number;
  difficulty: "Muy fácil" | "Fácil";
  macros: RecipeMacros;
  ingredients: RecipeIngredient[];
  steps: string[];
  storage: string;
  source: "NekoFit" | "Spoonacular";
  imageUrl?: string;
  imagePosition?: string;
};

export type RecipeLoadResult = {
  recipes: MealPrepRecipe[];
  mode: "curated" | "spoonacular";
};
