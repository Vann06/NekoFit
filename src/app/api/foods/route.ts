const usdaFoodSearchUrl = "https://api.nal.usda.gov/fdc/v1/foods/search";
const starterSearches = [
  { query: "rice cakes plain", matches: ["rice cake"], excludes: [] },
  { query: "oats raw", matches: ["oat"], excludes: ["milk", "cereal"] },
  { query: "chicken breast cooked", matches: ["chicken breast"], excludes: ["breaded", "fried"] },
  { query: "egg whole cooked", matches: ["egg"], excludes: ["fried", "duck"] },
  { query: "rice cooked", matches: ["rice"], excludes: ["noodle", "milk", "pudding"] },
  { query: "berries raw", matches: ["berry", "berries", "strawberry", "blueberry", "raspberry"], excludes: ["pie", "cake", "jam"] },
  { query: "broccoli raw", matches: ["broccoli"], excludes: ["casserole", "cheese"] },
];

type UsdaFoodResult = {
  fdcId?: number;
  dataType?: string;
  description?: string;
};

const dataTypePriority: Record<string, number> = {
  Foundation: 0,
  "Survey (FNDDS)": 1,
  "SR Legacy": 2,
  Branded: 3,
};

function safeLimit(value: string | null) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 16;
  return Math.min(24, Math.max(1, Math.trunc(parsed)));
}

async function searchUsda(apiKey: string, query: string, limit: number) {
  const upstreamUrl = new URL(usdaFoodSearchUrl);
  upstreamUrl.searchParams.set("api_key", apiKey);
  upstreamUrl.searchParams.set("query", query);
  upstreamUrl.searchParams.set("pageSize", String(limit));
  upstreamUrl.searchParams.set("dataType", "Foundation,SR Legacy,Survey (FNDDS),Branded");

  const response = await fetch(upstreamUrl, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 * 60 * 24 * 7 },
  });

  if (!response.ok) throw new Error(`USDA respondió ${response.status}`);
  return await response.json() as { foods?: UsdaFoodResult[] };
}

export async function GET(request: Request) {
  const apiKey = process.env.USDA_API_KEY?.trim();
  if (!apiKey) {
    return Response.json(
      { message: "USDA FoodData Central todavía no está configurado." },
      { status: 503 },
    );
  }

  const incomingUrl = new URL(request.url);
  const query = incomingUrl.searchParams.get("query")?.trim().slice(0, 80);
  const limit = safeLimit(incomingUrl.searchParams.get("limit"));

  try {
    if (query && query.length >= 2) {
      return Response.json(await searchUsda(apiKey, query, limit));
    }

    const responses = await Promise.allSettled(starterSearches.map(({ query: starterQuery }) => searchUsda(apiKey, starterQuery, 8)));
    const foods = responses
      .flatMap((response, index) => {
        if (response.status !== "fulfilled") return [];

        const { matches, excludes } = starterSearches[index];
        return (response.value.foods ?? [])
          .filter((food) => {
            const description = food.description?.toLowerCase() ?? "";
            return matches.some((term) => description.includes(term)) && !excludes.some((term) => description.includes(term));
          })
          .sort((foodA, foodB) => (dataTypePriority[foodA.dataType ?? ""] ?? 4) - (dataTypePriority[foodB.dataType ?? ""] ?? 4))
          .slice(0, 3);
      })
      .filter((food, index, allFoods) => food.fdcId && allFoods.findIndex((candidate) => candidate.fdcId === food.fdcId) === index)
      .slice(0, limit);
    if (foods.length === 0) throw new Error("USDA no devolvió alimentos iniciales.");
    return Response.json({ foods });
  } catch {
    return Response.json(
      { message: "No fue posible conectar con USDA FoodData Central." },
      { status: 502 },
    );
  }
}
