import type { FoodItem, LoggedFood, MacroValues } from "../types/nutrition";

export const emptyMacros = (): MacroValues => ({ calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

export function scaleFoodMacros(food: FoodItem, grams: number): MacroValues {
  const factor = grams / 100;
  return {
    calories: Math.round(food.macrosPer100g.calories * factor),
    protein: Math.round(food.macrosPer100g.protein * factor * 10) / 10,
    carbs: Math.round(food.macrosPer100g.carbs * factor * 10) / 10,
    fat: Math.round(food.macrosPer100g.fat * factor * 10) / 10,
    fiber: Math.round(food.macrosPer100g.fiber * factor * 10) / 10,
  };
}

export function sumMacros(items: LoggedFood[]): MacroValues {
  return items.reduce<MacroValues>((totals, item) => ({
    calories: totals.calories + item.macros.calories,
    protein: Math.round((totals.protein + item.macros.protein) * 10) / 10,
    carbs: Math.round((totals.carbs + item.macros.carbs) * 10) / 10,
    fat: Math.round((totals.fat + item.macros.fat) * 10) / 10,
    fiber: Math.round((totals.fiber + item.macros.fiber) * 10) / 10,
  }), emptyMacros());
}
