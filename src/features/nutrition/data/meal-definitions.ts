import type { MealKey } from "../types/nutrition";

export const mealDefinitions: Array<{ key: MealKey; label: string; shortLabel: string; time: string }> = [
  { key: "preWorkout", label: "Preentreno", shortLabel: "Pre", time: "Antes de entrenar" },
  { key: "breakfast", label: "Desayuno", shortLabel: "Des", time: "7:00 – 9:00" },
  { key: "postWorkout", label: "Postentreno", shortLabel: "Post", time: "Después de entrenar" },
  { key: "lunch", label: "Almuerzo", shortLabel: "Alm", time: "12:00 – 14:00" },
  { key: "snack", label: "Refacción", shortLabel: "Ref", time: "15:00 – 17:00" },
  { key: "dinner", label: "Cena", shortLabel: "Cena", time: "18:00 – 21:00" },
];
