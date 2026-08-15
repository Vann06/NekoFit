const workoutXExercisesUrl = "https://api.workoutxapp.com/v1/exercises";

function safeLimit(value: string | null) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 18;
  return Math.min(24, Math.max(1, Math.trunc(parsed)));
}

export async function GET(request: Request) {
  const apiKey = process.env.WORKOUTX_API_KEY?.trim();

  if (!apiKey) {
    return Response.json(
      { message: "WorkoutX todavía no está configurado." },
      { status: 503 },
    );
  }

  const incomingUrl = new URL(request.url);
  const upstreamUrl = new URL(workoutXExercisesUrl);
  const query = incomingUrl.searchParams.get("name")?.trim().slice(0, 60);

  if (query && query.length >= 2) upstreamUrl.searchParams.set("name", query);
  upstreamUrl.searchParams.set("lang", "es");
  upstreamUrl.searchParams.set("limit", String(safeLimit(incomingUrl.searchParams.get("limit"))));

  try {
    const response = await fetch(upstreamUrl, {
      headers: {
        Accept: "application/json",
        "X-WorkoutX-Key": apiKey,
      },
      next: { revalidate: 60 * 60 * 12 },
    });

    if (!response.ok) {
      return Response.json(
        { message: "WorkoutX no pudo responder en este momento." },
        { status: response.status === 401 || response.status === 403 ? 502 : response.status },
      );
    }

    const payload: unknown = await response.json();
    const exercises = Array.isArray(payload)
      ? payload
      : payload && typeof payload === "object" && "data" in payload && Array.isArray(payload.data)
        ? payload.data
        : [];

    return Response.json({ data: exercises });
  } catch {
    return Response.json(
      { message: "No fue posible conectar con WorkoutX." },
      { status: 502 },
    );
  }
}
