import type { PlannedItem } from "../types/nutrition";

export const planningOptions: Omit<PlannedItem, "id">[] = [
  { title: "Pollo, arroz y brócoli", subtitle: "Meal prep · 1 porción", calories: 510, protein: 53, kind: "recipe" },
  { title: "Pavo, camote y ejotes", subtitle: "Meal prep · 1 porción", calories: 502, protein: 38, kind: "recipe" },
  { title: "Salmón, quinoa y zucchini", subtitle: "Meal prep · 1 porción", calories: 536, protein: 38, kind: "recipe" },
  { title: "Overnight oats con yogurt", subtitle: "Desayuno · 1 porción", calories: 545, protein: 34, kind: "recipe" },
  { title: "Huevos con avena", subtitle: "Comida rápida", calories: 338, protein: 21, kind: "food" },
  { title: "Yogurt griego y banano", subtitle: "Refacción rápida", calories: 160, protein: 16, kind: "food" },
];
