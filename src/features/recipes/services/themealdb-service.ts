import type { RecipeCollection, RecipeDetail, RecipeSummary } from "../types/recipe";

const apiBaseUrl = "https://www.themealdb.com/api/json/v1/1";

type ApiMealSummary = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
};

type ApiMealDetail = ApiMealSummary & Record<string, string | null>;

type ApiResponse<T> = {
  meals: T[] | null;
};

const feeds: Array<{ url: string; collection: RecipeCollection; keywords: string[] }> = [
  {
    url: `${apiBaseUrl}/filter.php?c=Vegetarian`,
    collection: "Vegetariana",
    keywords: ["quinoa", "lentil", "tofu", "salad", "shakshuka", "beans", "soup"],
  },
  {
    url: `${apiBaseUrl}/filter.php?c=Seafood`,
    collection: "Pescado",
    keywords: ["salmon", "tuna", "fish", "prawn", "sea bass", "cod"],
  },
  {
    url: `${apiBaseUrl}/filter.php?i=chicken_breast`,
    collection: "Proteína",
    keywords: ["grill", "salad", "chicken", "roast", "baked"],
  },
];

async function fetchApi<T>(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`TheMealDB respondió ${response.status}`);
  return response.json() as Promise<ApiResponse<T>>;
}

function prioritizeMeals(meals: ApiMealSummary[], keywords: string[]) {
  return [...meals]
    .sort((firstMeal, secondMeal) => {
      const firstPreferred = keywords.some((keyword) => firstMeal.strMeal.toLowerCase().includes(keyword));
      const secondPreferred = keywords.some((keyword) => secondMeal.strMeal.toLowerCase().includes(keyword));
      return Number(secondPreferred) - Number(firstPreferred);
    })
    .slice(0, 4);
}

export async function getHealthyRecipeIdeas() {
  const collections = await Promise.all(feeds.map(async (feed) => {
    const data = await fetchApi<ApiMealSummary>(feed.url);
    return prioritizeMeals(data.meals ?? [], feed.keywords).map<RecipeSummary>((meal) => ({
      id: meal.idMeal,
      name: meal.strMeal,
      imageUrl: meal.strMealThumb,
      collection: feed.collection,
    }));
  }));

  return collections.flat();
}

export async function getRecipeDetail(recipe: RecipeSummary) {
  const data = await fetchApi<ApiMealDetail>(`${apiBaseUrl}/lookup.php?i=${encodeURIComponent(recipe.id)}`);
  const meal = data.meals?.[0];
  if (!meal) throw new Error("No encontramos el detalle de esta receta.");

  const ingredients = Array.from({ length: 20 }, (_, itemIndex) => itemIndex + 1)
    .map((ingredientIndex) => ({
      name: meal[`strIngredient${ingredientIndex}`]?.trim() ?? "",
      measure: meal[`strMeasure${ingredientIndex}`]?.trim() ?? "",
    }))
    .filter((ingredient) => ingredient.name.length > 0);

  return {
    ...recipe,
    area: meal.strArea ?? "Internacional",
    apiCategory: meal.strCategory ?? recipe.collection,
    instructions: meal.strInstructions ?? "La API no incluyó instrucciones para esta receta.",
    ingredients,
    sourceUrl: meal.strSource || undefined,
    videoUrl: meal.strYoutube || undefined,
  } satisfies RecipeDetail;
}
