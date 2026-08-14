import type { ExerciseCatalogItem } from "../types/workout";
import { filterExerciseCatalog, getExerciseCatalog } from "./wger-exercise-service";

export type ExerciseFilter = "all" | "legs" | "upper" | "core" | "cardio";

export type ExerciseSearchResult = {
  exercises: ExerciseCatalogItem[];
  provider: "WorkoutX" | "respaldo";
  workoutXConfigured: boolean;
};

type WorkoutXExercise = {
  id: string;
  name: string;
  bodyPart?: string;
  target?: string;
  equipment?: string;
  gifUrl?: string;
  instructions?: string[];
  secondaryMuscles?: string[];
};

const filterTerms: Record<ExerciseFilter, string[]> = {
  all: [],
  legs: ["leg", "pierna", "glute", "quad", "hamstring", "calf", "cadera"],
  upper: ["chest", "back", "shoulder", "arm", "bicep", "tricep", "pecho", "espalda", "hombro"],
  core: ["waist", "abs", "core", "abdomen"],
  cardio: ["cardio", "correr", "running", "walk", "caminar"],
};

function matchesFilter(exercise: ExerciseCatalogItem, filter: ExerciseFilter) {
  if (filter === "all") return true;
  const text = [exercise.category, ...exercise.muscles, ...exercise.equipment].join(" ").toLocaleLowerCase("es");
  return filterTerms[filter].some((term) => text.includes(term));
}

function mapWorkoutXExercise(exercise: WorkoutXExercise): ExerciseCatalogItem {
  return {
    id: `workoutx-${exercise.id}`,
    name: exercise.name,
    description: exercise.instructions?.join(" ") || "Observa la demostración y ejecuta el movimiento con control.",
    category: exercise.bodyPart || "Ejercicio",
    muscles: [exercise.target, ...(exercise.secondaryMuscles ?? [])].filter((muscle): muscle is string => Boolean(muscle)),
    equipment: exercise.equipment ? [exercise.equipment] : [],
    imageUrl: exercise.gifUrl,
    source: "WorkoutX",
    attribution: "WorkoutX",
  };
}

function unwrapWorkoutXResponse(value: unknown): WorkoutXExercise[] {
  if (Array.isArray(value)) return value as WorkoutXExercise[];
  if (value && typeof value === "object" && "data" in value && Array.isArray(value.data)) return value.data as WorkoutXExercise[];
  return [];
}

export async function searchExercises(query: string, filter: ExerciseFilter): Promise<ExerciseSearchResult> {
  const proxyUrl = process.env.NEXT_PUBLIC_WORKOUTX_PROXY_URL?.trim();

  if (proxyUrl) {
    try {
      const url = new URL(proxyUrl);
      const normalizedQuery = query.trim();
      if (normalizedQuery.length >= 2) url.searchParams.set("name", normalizedQuery);
      const bodyPart = filter === "legs" || filter === "core" || filter === "cardio" ? filter : null;
      // El plan gratuito no combina filtros; cuando hay texto priorizamos el nombre.
      if (normalizedQuery.length < 2 && bodyPart) url.searchParams.set("bodyPart", bodyPart);
      url.searchParams.set("lang", "es");
      url.searchParams.set("limit", "10");

      const response = await fetch(url, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`WorkoutX respondió ${response.status}`);
      const exercises = unwrapWorkoutXResponse(await response.json()).map(mapWorkoutXExercise).filter((exercise) => matchesFilter(exercise, filter));
      return { exercises, provider: "WorkoutX", workoutXConfigured: true };
    } catch {
      // Si el proxy no está disponible, la biblioteca local mantiene utilizable la pantalla.
    }
  }

  const catalog = await getExerciseCatalog();
  const byText = filterExerciseCatalog(catalog, query, "Todos");
  const matching = byText.filter((exercise) => matchesFilter(exercise, filter));
  const visualFirst = [...matching].sort((left, right) => Number(Boolean(right.imageUrl || right.videoUrl)) - Number(Boolean(left.imageUrl || left.videoUrl)));
  return {
    exercises: visualFirst.slice(0, 30),
    provider: "respaldo",
    workoutXConfigured: Boolean(proxyUrl),
  };
}
