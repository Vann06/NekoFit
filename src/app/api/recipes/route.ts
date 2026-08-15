const spoonacularSearchUrl = "https://api.spoonacular.com/recipes/complexSearch";

export async function GET() {
  const apiKey = process.env.SPOONACULAR_API_KEY?.trim();
  if (!apiKey) {
    return Response.json(
      { message: "Spoonacular todavía no está configurado." },
      { status: 503 },
    );
  }

  const upstreamUrl = new URL(spoonacularSearchUrl);
  upstreamUrl.searchParams.set("type", "main course");
  upstreamUrl.searchParams.set("number", "18");
  upstreamUrl.searchParams.set("instructionsRequired", "true");
  upstreamUrl.searchParams.set("addRecipeInformation", "true");
  upstreamUrl.searchParams.set("addRecipeInstructions", "true");
  upstreamUrl.searchParams.set("addRecipeNutrition", "true");
  upstreamUrl.searchParams.set("minProtein", "25");
  upstreamUrl.searchParams.set("maxFat", "25");
  upstreamUrl.searchParams.set("maxReadyTime", "40");
  upstreamUrl.searchParams.set("minServings", "2");
  upstreamUrl.searchParams.set("sort", "protein");
  upstreamUrl.searchParams.set("sortDirection", "desc");

  try {
    const response = await fetch(upstreamUrl, {
      headers: {
        Accept: "application/json",
        "x-api-key": apiKey,
      },
      next: { revalidate: 60 * 60 },
    });

    if (!response.ok) {
      return Response.json(
        { message: "Spoonacular no pudo responder en este momento." },
        { status: response.status === 401 || response.status === 403 ? 502 : response.status },
      );
    }

    const payload: unknown = await response.json();
    return Response.json(payload);
  } catch {
    return Response.json(
      { message: "No fue posible conectar con Spoonacular." },
      { status: 502 },
    );
  }
}
