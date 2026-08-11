import { mealPrepRecipes } from "../data/meal-prep-recipes";
import type { MealPrepRecipe, RecipeGoal, RecipeLoadResult, RecipeMacros } from "../types/recipe";

type SpoonacularNutrient = { name: string; amount: number; unit: string };
type SpoonacularIngredient = { name?: string; original?: string };
type SpoonacularStep = { step: string };
type SpoonacularRecipe = {
  id: number;
  title: string;
  image?: string;
  readyInMinutes?: number;
  servings?: number;
  vegetarian?: boolean;
  summary?: string;
  extendedIngredients?: SpoonacularIngredient[];
  analyzedInstructions?: Array<{ steps?: SpoonacularStep[] }>;
  nutrition?: { nutrients?: SpoonacularNutrient[] };
};

type SpoonacularResponse = { results?: SpoonacularRecipe[] };

const friedTerms = /deep[- ]?fried|fried|frying|fry\b/i;

function getNutrient(nutrients: SpoonacularNutrient[], name: string) {
  return Math.round((nutrients.find((nutrient) => nutrient.name === name)?.amount ?? 0) * 10) / 10;
}

function getMacros(recipe: SpoonacularRecipe): RecipeMacros {
  const nutrients = recipe.nutrition?.nutrients ?? [];
  return {
    calories: getNutrient(nutrients, "Calories"),
    protein: getNutrient(nutrients, "Protein"),
    carbs: getNutrient(nutrients, "Carbohydrates"),
    fat: getNutrient(nutrients, "Fat"),
    fiber: getNutrient(nutrients, "Fiber"),
  };
}

function getGoal(recipe: SpoonacularRecipe, macros: RecipeMacros): RecipeGoal {
  if (recipe.vegetarian) return "Vegetariano";
  if (macros.protein >= 35) return "Alta proteína";
  return "Balanceado";
}

function stripHtml(value?: string) {
  return value?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ?? "Receta sencilla para preparar varias porciones.";
}

function mapRecipe(recipe: SpoonacularRecipe): MealPrepRecipe {
  const macros = getMacros(recipe);
  const steps = recipe.analyzedInstructions?.flatMap((instruction) => instruction.steps?.map(({ step }) => step) ?? []) ?? [];
  return {
    id: String(recipe.id),
    name: recipe.title,
    description: stripHtml(recipe.summary),
    goal: getGoal(recipe, macros),
    prepMinutes: recipe.readyInMinutes ?? 35,
    servings: recipe.servings ?? 4,
    difficulty: (recipe.readyInMinutes ?? 35) <= 25 ? "Muy fácil" : "Fácil",
    macros,
    ingredients: (recipe.extendedIngredients ?? []).map((ingredient) => ({
      name: ingredient.name ?? "Ingrediente",
      amount: ingredient.original ?? ingredient.name ?? "Cantidad al gusto",
    })),
    steps: steps.length > 0 ? steps : ["Sigue las instrucciones completas proporcionadas por Spoonacular."],
    storage: "Divide en recipientes y refrigera. Verifica la conservación según los ingredientes utilizados.",
    source: "Spoonacular",
    imageUrl: recipe.image,
  };
}

function isSimpleMealPrep(recipe: MealPrepRecipe) {
  const searchableText = [recipe.name, recipe.description, ...recipe.steps].join(" ");
  return recipe.prepMinutes <= 40
    && recipe.macros.protein >= 25
    && recipe.macros.fat <= 25
    && !friedTerms.test(searchableText);
}

export async function getMealPrepRecipes(): Promise<RecipeLoadResult> {
  const proxyUrl = process.env.NEXT_PUBLIC_SPOONACULAR_PROXY_URL?.trim();
  if (!proxyUrl) return { recipes: mealPrepRecipes, mode: "curated" };

  try {
    const requestUrl = new URL(proxyUrl);
    requestUrl.searchParams.set("query", "simple meal prep");
    requestUrl.searchParams.set("type", "main course");
    requestUrl.searchParams.set("number", "12");
    requestUrl.searchParams.set("instructionsRequired", "true");
    requestUrl.searchParams.set("addRecipeInformation", "true");
    requestUrl.searchParams.set("addRecipeInstructions", "true");
    requestUrl.searchParams.set("addRecipeNutrition", "true");
    requestUrl.searchParams.set("minProtein", "25");
    requestUrl.searchParams.set("maxFat", "25");
    requestUrl.searchParams.set("maxReadyTime", "40");
    requestUrl.searchParams.set("sort", "protein");
    requestUrl.searchParams.set("sortDirection", "desc");

    const response = await fetch(requestUrl);
    if (!response.ok) throw new Error(`Spoonacular proxy respondió ${response.status}`);
    const data = await response.json() as SpoonacularResponse;
    const recipes = (data.results ?? []).map(mapRecipe).filter(isSimpleMealPrep);
    if (recipes.length < 3) throw new Error("La búsqueda no devolvió suficientes recetas simples.");
    return { recipes, mode: "spoonacular" };
  } catch {
    return { recipes: mealPrepRecipes, mode: "curated" };
  }
}
