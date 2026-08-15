export type MacroValues = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
};

export type FoodMeasure = {
  id: string;
  label: string;
  grams: number;
};

export type FoodItem = {
  id: string;
  name: string;
  detail: string;
  servingLabel: string;
  servingGrams: number;
  measures?: FoodMeasure[];
  macrosPer100g: MacroValues;
  source: "NekoFit" | "USDA";
};

export type MealKey = "preWorkout" | "breakfast" | "postWorkout" | "lunch" | "snack" | "dinner";

export type LoggedFood = {
  id: string;
  food: FoodItem;
  grams: number;
  amount?: number;
  measureLabel?: string;
  macros: MacroValues;
};

export type DiaryDay = {
  date: string;
  meals: Record<MealKey, LoggedFood[]>;
};

export type NutritionGoals = MacroValues & {
  waterGlasses: number;
  mealCalories: Record<MealKey, number>;
};

export type PlannedItem = {
  id: string;
  title: string;
  subtitle: string;
  calories: number;
  protein: number;
  kind: "food" | "recipe";
};

export type PlannedDay = {
  date: string;
  meals: Record<MealKey, PlannedItem[]>;
};

export type NutritionState = {
  version: 2;
  goals: NutritionGoals;
  diaryDays: Record<string, DiaryDay>;
  planDays: Record<string, PlannedDay>;
  waterByDate: Record<string, number>;
};
