import { localExerciseCatalog } from "../data/workout-options";
import { legacyWorkoutXExerciseIds, workoutXStarterExercises } from "../data/workoutx-starter-exercises";
import type { CardioConfig, WorkoutExercise, WorkoutPlan, WorkoutsState } from "../types/workout";

const databaseName = "nekofit-workouts";
const storeName = "workouts-state";
const stateId = "main";

function catalogExercise(id: string) {
  const exercise = [...workoutXStarterExercises, ...localExerciseCatalog].find((item) => item.id === id);
  if (!exercise) throw new Error(`No existe el ejercicio inicial ${id}`);
  return exercise;
}

function workoutExercise(id: string, exerciseId: string, options: Partial<Omit<WorkoutExercise, "id" | "exercise">> = {}): WorkoutExercise {
  return {
    id,
    exercise: catalogExercise(exerciseId),
    sets: options.sets ?? 3,
    reps: options.reps ?? "10",
    weightKg: options.weightKg ?? 0,
  };
}

function cardio(overrides: Partial<CardioConfig> = {}): CardioConfig {
  return {
    enabled: true,
    machine: "treadmill",
    durationMinutes: 15,
    speed: 5,
    incline: 8,
    level: 0,
    notes: "Ritmo constante y cómodo.",
    ...overrides,
  };
}

function createStarterWorkouts(): WorkoutPlan[] {
  const now = new Date().toISOString();
  return [
    {
      id: "starter-lower",
      name: "Pierna & glúteo",
      category: "lower",
      description: "Fuerza de tren inferior con final corto en StairMaster.",
      estimatedMinutes: 70,
      coreEnabled: true,
      blocks: {
        warmup: [
          workoutExercise("lower-warmup-1", "workoutx-0003", { sets: 1, reps: "5 min" }),
          workoutExercise("lower-warmup-2", "workoutx-0257", { sets: 2, reps: "10/lado" }),
        ],
        main: [
          workoutExercise("lower-main-1", "workoutx-0026", { sets: 4, reps: "8", weightKg: 30 }),
          workoutExercise("lower-main-2", "workoutx-1409", { sets: 4, reps: "10", weightKg: 45 }),
          workoutExercise("lower-main-3", "workoutx-0085", { sets: 3, reps: "10", weightKg: 30 }),
        ],
        core: [workoutExercise("lower-core-1", "workoutx-0276", { sets: 3, reps: "10/lado" })],
        cooldown: [
          workoutExercise("lower-cool-1", "workoutx-0613", { sets: 2, reps: "30 s/lado" }),
          workoutExercise("lower-cool-2", "workoutx-0690", { sets: 1, reps: "60 s" }),
        ],
      },
      cardio: cardio({ machine: "stairmaster", durationMinutes: 12, speed: 0, incline: 0, level: 6, notes: "Sin apoyarte en las barandas." }),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "starter-upper",
      name: "Upper body",
      category: "upper",
      description: "Empujes y jalones para espalda, pecho y brazos.",
      estimatedMinutes: 55,
      coreEnabled: false,
      blocks: {
        warmup: [workoutExercise("upper-warmup-1", "workoutx-1167", { sets: 2, reps: "12" })],
        main: [
          workoutExercise("upper-main-1", "workoutx-0180", { sets: 4, reps: "10", weightKg: 25 }),
          workoutExercise("upper-main-2", "workoutx-0289", { sets: 4, reps: "8", weightKg: 12 }),
        ],
        core: [],
        cooldown: [
          workoutExercise("upper-cool-1", "workoutx-0643", { sets: 2, reps: "30 s/lado" }),
          workoutExercise("upper-cool-2", "workoutx-0669", { sets: 2, reps: "30 s/lado" }),
        ],
      },
      cardio: cardio({ enabled: false, durationMinutes: 0, speed: 0, incline: 0, notes: "" }),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "starter-full",
      name: "Full body express",
      category: "fullBody",
      description: "Una sesión compacta para días con poco tiempo.",
      estimatedMinutes: 40,
      coreEnabled: true,
      blocks: {
        warmup: [workoutExercise("full-warmup-1", "workoutx-0003", { sets: 1, reps: "5 min" })],
        main: [
          workoutExercise("full-main-1", "workoutx-0026", { sets: 3, reps: "10", weightKg: 20 }),
          workoutExercise("full-main-2", "workoutx-0180", { sets: 3, reps: "12", weightKg: 20 }),
          workoutExercise("full-main-3", "workoutx-0289", { sets: 3, reps: "10", weightKg: 10 }),
        ],
        core: [workoutExercise("full-core-1", "workoutx-0464", { sets: 3, reps: "12" })],
        cooldown: [workoutExercise("full-cool-1", "workoutx-0690", { sets: 1, reps: "60 s" })],
      },
      cardio: cardio({ durationMinutes: 8, speed: 5.5, incline: 4, notes: "Caminata ligera para cerrar." }),
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export function createInitialWorkoutsState(): WorkoutsState {
  return { version: 3, workouts: createStarterWorkouts() };
}

export function createBlankWorkout(): WorkoutPlan {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: "Mi nuevo entrenamiento",
    category: "custom",
    description: "Una rutina hecha a tu medida.",
    estimatedMinutes: 45,
    coreEnabled: false,
    blocks: { warmup: [], main: [], core: [], cooldown: [] },
    cardio: cardio({ enabled: false }),
    createdAt: now,
    updatedAt: now,
  };
}

export function cloneWorkout(workout: WorkoutPlan): WorkoutPlan {
  const now = new Date().toISOString();
  const copyEntries = (entries: WorkoutExercise[]) => entries.map((entry) => ({ ...entry, id: crypto.randomUUID() }));
  return {
    ...workout,
    id: crypto.randomUUID(),
    name: `${workout.name} · copia`,
    blocks: {
      warmup: copyEntries(workout.blocks.warmup),
      main: copyEntries(workout.blocks.main),
      core: copyEntries(workout.blocks.core),
      cooldown: copyEntries(workout.blocks.cooldown),
    },
    cardio: { ...workout.cardio },
    createdAt: now,
    updatedAt: now,
  };
}

function migrateState(state: { version?: number; workouts?: WorkoutPlan[] }): WorkoutsState | null {
  if (!Array.isArray(state.workouts)) return null;
  const workouts = state.workouts.map((workout) => ({
    ...workout,
    blocks: {
      warmup: workout.blocks.warmup.map(migrateEntry),
      main: workout.blocks.main.map(migrateEntry),
      core: workout.blocks.core.map(migrateEntry),
      cooldown: workout.blocks.cooldown.map(migrateEntry),
    },
  }));
  return { version: 3, workouts };
}

function migrateEntry(entry: WorkoutExercise): WorkoutExercise {
  const replacementId = legacyWorkoutXExerciseIds[entry.exercise.id];
  const exercise = replacementId ? catalogExercise(replacementId) : entry.exercise;
  return { id: entry.id, exercise, sets: entry.sets, reps: entry.reps, weightKg: entry.weightKg };
}

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(storeName)) request.result.createObjectStore(storeName, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function requestResult<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getWorkoutsState(fallback: WorkoutsState) {
  const database = await openDatabase();
  const record = await requestResult(database.transaction(storeName, "readonly").objectStore(storeName).get(stateId)) as { id: string; state: { version?: number; workouts?: WorkoutPlan[] } } | undefined;
  database.close();
  const migrated = record?.state ? migrateState(record.state) : null;
  if (migrated) {
    if (record?.state.version !== 3) await saveWorkoutsState(migrated);
    return migrated;
  }
  await saveWorkoutsState(fallback);
  return fallback;
}

export async function saveWorkoutsState(state: WorkoutsState) {
  const database = await openDatabase();
  await requestResult(database.transaction(storeName, "readwrite").objectStore(storeName).put({ id: stateId, state }));
  database.close();
}
