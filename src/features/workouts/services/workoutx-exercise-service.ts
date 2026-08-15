import type { ExerciseCatalogItem } from "../types/workout";
import { workoutXStarterExercises } from "../data/workoutx-starter-exercises";

export type ExerciseSearchResult = {
  exercises: ExerciseCatalogItem[];
  provider: "WorkoutX" | "respaldo";
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

function mapWorkoutXExercise(exercise: WorkoutXExercise): ExerciseCatalogItem {
  return {
    id: `workoutx-${exercise.id}`,
    name: exercise.name,
    description: exercise.instructions?.join(" ") || "Observa la demostración y ejecuta el movimiento con control.",
    category: exercise.bodyPart || "Ejercicio",
    muscles: [exercise.target, ...(exercise.secondaryMuscles ?? [])].filter((muscle): muscle is string => Boolean(muscle)),
    equipment: exercise.equipment ? [exercise.equipment] : [],
    imageUrl: `/api/exercises/${encodeURIComponent(exercise.id)}/media`,
    source: "WorkoutX",
    attribution: "WorkoutX",
  };
}

function unwrapWorkoutXResponse(value: unknown): WorkoutXExercise[] {
  if (Array.isArray(value)) return value as WorkoutXExercise[];
  if (value && typeof value === "object" && "data" in value && Array.isArray(value.data)) return value.data as WorkoutXExercise[];
  return [];
}

export async function searchExercises(query: string): Promise<ExerciseSearchResult> {
  try {
    const url = new URL("/api/exercises", window.location.origin);
    const normalizedQuery = query.trim();
    if (normalizedQuery.length >= 2) url.searchParams.set("name", normalizedQuery);
    url.searchParams.set("limit", "18");

    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`WorkoutX respondió ${response.status}`);
    const exercises = unwrapWorkoutXResponse(await response.json()).map(mapWorkoutXExercise);
    return { exercises, provider: "WorkoutX" };
  } catch {
    // Sin clave o sin conexión, el catálogo local mantiene utilizable la pantalla.
  }

  const normalizedQuery = query.trim().toLocaleLowerCase("es");
  const verifiedWorkoutXExercises = workoutXStarterExercises.filter((exercise) => {
    if (!normalizedQuery) return true;

    return [exercise.name, exercise.category, ...exercise.muscles, ...exercise.equipment]
      .join(" ")
      .toLocaleLowerCase("es")
      .includes(normalizedQuery);
  });

  return {
    exercises: verifiedWorkoutXExercises,
    provider: "respaldo",
  };
}
