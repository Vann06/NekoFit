const workoutXBaseUrl = "https://api.workoutxapp.com/v1";

export async function GET(_request: Request, context: RouteContext<"/api/exercises/[id]/media">) {
  const apiKey = process.env.WORKOUTX_API_KEY?.trim();
  const { id } = await context.params;

  if (!apiKey) {
    return Response.json({ message: "WorkoutX todavía no está configurado." }, { status: 503 });
  }

  if (!/^[a-zA-Z0-9_-]{1,40}$/.test(id)) {
    return Response.json({ message: "Identificador de ejercicio inválido." }, { status: 400 });
  }

  try {
    const response = await fetch(`${workoutXBaseUrl}/gifs/${encodeURIComponent(id)}.gif`, {
      headers: { "X-WorkoutX-Key": apiKey },
      next: { revalidate: 60 * 60 * 24 * 7 },
    });

    if (!response.ok || !response.body) {
      return Response.json({ message: "No se encontró la demostración." }, { status: response.status || 502 });
    }

    return new Response(response.body, {
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=604800",
        "Content-Type": response.headers.get("Content-Type") ?? "image/gif",
      },
    });
  } catch {
    return Response.json({ message: "No fue posible cargar la demostración." }, { status: 502 });
  }
}
