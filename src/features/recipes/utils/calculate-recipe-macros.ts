import type { IngredientWithNutrition, RecipeMacros } from "../types/recipe";

const macroKeys: Array<keyof RecipeMacros> = ["calories", "protein", "carbs", "fat", "fiber"];

export function calculateRecipeMacros(ingredients: IngredientWithNutrition[], servings: number) {
  const batchTotals = ingredients.reduce<RecipeMacros>((totals, ingredient) => {
    macroKeys.forEach((macro) => {
      totals[macro] += ingredient.batchNutrition[macro];
    });
    return totals;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

  return macroKeys.reduce<RecipeMacros>((perServing, macro) => {
    perServing[macro] = Math.round((batchTotals[macro] / servings) * 10) / 10;
    return perServing;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
}
