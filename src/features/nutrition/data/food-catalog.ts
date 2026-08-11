import type { FoodItem } from "../types/nutrition";

export const commonFoods: FoodItem[] = [
  { id: "egg-whole", name: "Huevo entero", detail: "Cocido o preparado sin aceite", servingLabel: "1 huevo", servingGrams: 50, source: "NekoFit", macrosPer100g: { calories: 143, protein: 12.6, carbs: 0.7, fat: 9.5, fiber: 0 } },
  { id: "egg-white", name: "Claras de huevo", detail: "Claras cocidas", servingLabel: "3 claras", servingGrams: 100, source: "NekoFit", macrosPer100g: { calories: 52, protein: 10.9, carbs: 0.7, fat: 0.2, fiber: 0 } },
  { id: "chicken-breast", name: "Pechuga de pollo", detail: "Cocida, sin piel", servingLabel: "1 porción", servingGrams: 120, source: "NekoFit", macrosPer100g: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 } },
  { id: "salmon", name: "Salmón", detail: "Horneado o a la plancha", servingLabel: "1 filete", servingGrams: 140, source: "NekoFit", macrosPer100g: { calories: 206, protein: 22, carbs: 0, fat: 12, fiber: 0 } },
  { id: "oats", name: "Avena", detail: "Hojuelas secas", servingLabel: "½ taza", servingGrams: 50, source: "NekoFit", macrosPer100g: { calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 10.6 } },
  { id: "greek-yogurt", name: "Yogurt griego natural", detail: "Sin azúcar añadida", servingLabel: "¾ taza", servingGrams: 150, source: "NekoFit", macrosPer100g: { calories: 59, protein: 10.3, carbs: 3.6, fat: 0.4, fiber: 0 } },
  { id: "banana", name: "Banano", detail: "Crudo", servingLabel: "1 pequeño", servingGrams: 80, source: "NekoFit", macrosPer100g: { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6 } },
  { id: "brown-rice", name: "Arroz integral", detail: "Cocido", servingLabel: "¾ taza", servingGrams: 160, source: "NekoFit", macrosPer100g: { calories: 123, protein: 2.7, carbs: 25.6, fat: 1, fiber: 1.6 } },
  { id: "broccoli", name: "Brócoli", detail: "Cocido al vapor", servingLabel: "1 taza", servingGrams: 150, source: "NekoFit", macrosPer100g: { calories: 35, protein: 2.4, carbs: 7.2, fat: 0.4, fiber: 3.3 } },
  { id: "avocado", name: "Aguacate", detail: "Crudo", servingLabel: "½ pequeño", servingGrams: 70, source: "NekoFit", macrosPer100g: { calories: 160, protein: 2, carbs: 8.5, fat: 14.7, fiber: 6.7 } },
  { id: "olive-oil", name: "Aceite de oliva", detail: "Para cocinar o aderezar", servingLabel: "1 cucharada", servingGrams: 12, source: "NekoFit", macrosPer100g: { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 } },
  { id: "sweet-potato", name: "Camote", detail: "Horneado", servingLabel: "1 mediano", servingGrams: 180, source: "NekoFit", macrosPer100g: { calories: 90, protein: 2, carbs: 20.7, fat: 0.2, fiber: 3.3 } },
];

export const foodSearchTranslations: Record<string, string> = {
  huevo: "egg",
  huevos: "eggs",
  pollo: "chicken breast",
  arroz: "rice cooked",
  avena: "oats",
  banano: "banana",
  platano: "banana",
  brócoli: "broccoli",
  brocoli: "broccoli",
  aguacate: "avocado",
  salmón: "salmon cooked",
  salmon: "salmon cooked",
  yogur: "greek yogurt",
  yogurt: "greek yogurt",
  camote: "sweet potato",
};
