import { commonFoods, foodSearchTranslations } from "../data/food-catalog";
import type { FoodItem, MacroValues } from "../types/nutrition";

type UsdaNutrient = { nutrientName?: string; value?: number; unitName?: string };
type UsdaFood = { fdcId: number; description: string; dataType?: string; foodNutrients?: UsdaNutrient[] };
type UsdaSearchResponse = { foods?: UsdaFood[] };
type CachedSearch = { expiresAt: number; foods: FoodItem[] };

const cachePrefix = "nekofit-usda-cache-v2:";
const cacheDuration = 7 * 24 * 60 * 60 * 1000;

function normalizeSearch(query: string) {
  const normalized = query.trim().toLocaleLowerCase("es");
  return foodSearchTranslations[normalized] ?? normalized;
}

function getNutrient(nutrients: UsdaNutrient[], names: string[]) {
  const nutrient = nutrients.find((item) => names.some((name) => item.nutrientName?.toLowerCase() === name));
  return nutrient?.value ?? 0;
}

function getCalories(nutrients: UsdaNutrient[]) {
  const energyNutrients = nutrients.filter((item) => item.nutrientName?.toLowerCase() === "energy");
  const kilocalories = energyNutrients.find((item) => item.unitName?.toLowerCase() === "kcal");
  if (kilocalories?.value != null) return kilocalories.value;

  const kilojoules = energyNutrients.find((item) => item.unitName?.toLowerCase() === "kj");
  return kilojoules?.value != null ? kilojoules.value / 4.184 : 0;
}

function mapUsdaFood(food: UsdaFood): FoodItem | null {
  const nutrients = food.foodNutrients ?? [];
  const macros: MacroValues = {
    calories: Math.round(getCalories(nutrients)),
    protein: Math.round(getNutrient(nutrients, ["protein"]) * 10) / 10,
    carbs: Math.round(getNutrient(nutrients, ["carbohydrate, by difference"]) * 10) / 10,
    fat: Math.round(getNutrient(nutrients, ["total lipid (fat)"]) * 10) / 10,
    fiber: Math.round(getNutrient(nutrients, ["fiber, total dietary"]) * 10) / 10,
  };
  if (macros.calories <= 0 && macros.protein <= 0 && macros.carbs <= 0 && macros.fat <= 0) return null;

  const readableName = food.description.toLocaleLowerCase("es").replace(/(^|\s)\p{L}/gu, (letter) => letter.toLocaleUpperCase("es"));
  return {
    id: `usda-${food.fdcId}`,
    name: readableName,
    detail: `${food.dataType ?? "FoodData Central"} · valores por 100 g`,
    servingLabel: "100 g",
    servingGrams: 100,
    macrosPer100g: macros,
    source: "USDA",
  };
}

function getCachedSearch(query: string) {
  try {
    const cached = window.localStorage.getItem(`${cachePrefix}${query}`);
    if (!cached) return null;
    const parsed = JSON.parse(cached) as CachedSearch;
    return parsed.expiresAt > Date.now() ? parsed.foods : null;
  } catch {
    return null;
  }
}

function cacheSearch(query: string, foods: FoodItem[]) {
  try {
    window.localStorage.setItem(`${cachePrefix}${query}`, JSON.stringify({ expiresAt: Date.now() + cacheDuration, foods } satisfies CachedSearch));
  } catch {
    // La búsqueda sigue funcionando aunque el navegador no permita guardar caché.
  }
}

export async function searchFoods(query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase("es");
  const localMatches = commonFoods.filter((food) => `${food.name} ${food.detail}`.toLocaleLowerCase("es").includes(normalizedQuery));
  if (normalizedQuery.length < 2) return localMatches.length > 0 ? localMatches : commonFoods.slice(0, 8);

  const apiQuery = normalizeSearch(query);
  const cachedFoods = getCachedSearch(apiQuery);
  if (cachedFoods) return [...localMatches, ...cachedFoods].filter((food, index, foods) => foods.findIndex((item) => item.id === food.id) === index).slice(0, 10);

  try {
    const configuredProxy = process.env.NEXT_PUBLIC_USDA_PROXY_URL?.trim();
    const requestUrl = new URL(configuredProxy || "https://api.nal.usda.gov/fdc/v1/foods/search");
    if (!configuredProxy) requestUrl.searchParams.set("api_key", "DEMO_KEY");
    requestUrl.searchParams.set("query", apiQuery);
    requestUrl.searchParams.set("pageSize", "8");
    requestUrl.searchParams.set("dataType", "Foundation,SR Legacy,Survey (FNDDS)");

    const response = await fetch(requestUrl);
    if (!response.ok) throw new Error(`USDA respondió ${response.status}`);
    const data = await response.json() as UsdaSearchResponse;
    const remoteFoods = (data.foods ?? []).map(mapUsdaFood).filter((food): food is FoodItem => food !== null);
    cacheSearch(apiQuery, remoteFoods);
    return [...localMatches, ...remoteFoods].filter((food, index, foods) => foods.findIndex((item) => item.id === food.id) === index).slice(0, 10);
  } catch {
    return localMatches.length > 0 ? localMatches : commonFoods.slice(0, 8);
  }
}
