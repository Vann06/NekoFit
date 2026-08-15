import type { ExerciseCatalogItem } from "../types/workout";

function exercise(
  id: string,
  name: string,
  category: string,
  muscles: string[],
  equipment: string,
): ExerciseCatalogItem {
  return {
    id: `workoutx-${id}`,
    name,
    description: "Observa la demostración y realiza el movimiento con control.",
    category,
    muscles,
    equipment: [equipment],
    imageUrl: `/api/exercises/${id}/media`,
    source: "WorkoutX",
    attribution: "WorkoutX",
  };
}

// Ejercicios verificados contra el catálogo de WorkoutX en español.
export const workoutXStarterExercises: ExerciseCatalogItem[] = [
  exercise("0003", "Bicicleta de aire (air bike)", "Calentamiento", ["Abdominales"], "Peso corporal"),
  exercise("0257", "Estiramiento de rodillas en círculos", "Calentamiento", ["Pantorrillas"], "Peso corporal"),
  exercise("0026", "Sentadilla con barra", "Piernas", ["Cuádriceps"], "Barra"),
  exercise("1409", "Puente de glúteos con barra", "Piernas", ["Glúteos"], "Barra"),
  exercise("0085", "Peso muerto rumano con barra", "Piernas", ["Glúteos"], "Barra"),
  exercise("0276", "Dead bug", "Core", ["Abdominales"], "Peso corporal"),
  exercise("0613", "Estiramiento de cuádriceps tumbado", "Estiramiento", ["Cuádriceps"], "Peso corporal"),
  exercise("0690", "Estiramiento lumbar sentado", "Estiramiento", ["Dorsal ancho"], "Peso corporal"),
  exercise("1167", "Estiramiento dinámico de pecho", "Calentamiento", ["Pectorales"], "Peso corporal"),
  exercise("0180", "Remo bajo sentado en polea", "Espalda", ["Espalda alta"], "Cable"),
  exercise("0289", "Press de banca con mancuernas", "Pecho", ["Pectorales"], "Mancuerna"),
  exercise("0643", "Estiramiento de tríceps por encima de la cabeza", "Estiramiento", ["Tríceps"], "Peso corporal"),
  exercise("0669", "Estiramiento del deltoides posterior", "Estiramiento", ["Deltoides"], "Peso corporal"),
  exercise("0464", "Plancha frontal con giro", "Core", ["Abdominales"], "Peso corporal"),
];

export const legacyWorkoutXExerciseIds: Record<string, string> = {
  "local-cat-cow": "workoutx-0690",
  "local-leg-swings": "workoutx-0257",
  "local-squat": "workoutx-0026",
  "local-hip-thrust": "workoutx-1409",
  "local-rdl": "workoutx-0085",
  "local-row": "workoutx-0180",
  "local-press": "workoutx-0289",
  "local-plank": "workoutx-0464",
  "local-dead-bug": "workoutx-0276",
  "local-child-pose": "workoutx-0690",
  "local-quad-stretch": "workoutx-0613",
};
