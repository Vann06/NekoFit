import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  ExerciseMediaType,
  PlannedWorkoutSet,
  WeightUnit,
  WeeklyPlanDay,
  WeeklyPlanExercise,
  WeeklyPlanSection,
  WeeklyWorkoutPlan,
  WeeklyWorkoutsState,
  WorkoutPlan,
  WorkoutSectionType,
  WorkoutSession,
  WorkoutSessionExercise,
  WorkoutSetResult,
  WorkoutsState,
} from "../types/workout";

const databaseName = "nekofit-workouts";
const cacheStoreName = "weekly-workouts-state";
const legacyStoreName = "workouts-state";
const cacheStateId = "main-v4";
const legacyStateId = "main";
const migrationKey = "workouts-indexeddb-v3-to-supabase-v1";

const sectionDefinitions: Array<{ type: WorkoutSectionType; title: string }> = [
  { type: "warmup", title: "Calentamiento" },
  { type: "workout", title: "Entrenamiento" },
  { type: "abs", title: "Abdominales" },
  { type: "cardio", title: "Cardio" },
  { type: "cooldown", title: "Enfriamiento" },
];

type Row = Record<string, unknown>;

function uuid() {
  return crypto.randomUUID();
}

function valueAsNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function valueAsNullableNumber(value: unknown) {
  return value === null || value === undefined ? null : valueAsNumber(value);
}

function asRows(value: unknown): Row[] {
  return Array.isArray(value) ? value as Row[] : [];
}

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

function emptySections(): WeeklyPlanSection[] {
  return sectionDefinitions.map((section, index) => ({
    id: uuid(),
    type: section.type,
    title: section.title,
    position: index + 1,
    estimatedMinutes: 0,
    exercises: [],
  }));
}

export function createBlankWeeklyPlan(): WeeklyWorkoutPlan {
  const now = new Date().toISOString();
  return {
    id: uuid(),
    legacyId: null,
    name: "Mi plan semanal",
    description: "Una semana de entrenamiento hecha a tu medida.",
    objective: "Bienestar general",
    isActive: true,
    days: Array.from({ length: 7 }, (_, index) => ({
      id: uuid(),
      dayNumber: index + 1,
      name: `Día ${index + 1}`,
      focus: index === 0 ? "Entrenamiento" : "Descanso o movilidad",
      description: "",
      estimatedMinutes: index === 0 ? 45 : 0,
      isRestDay: index !== 0,
      sections: emptySections(),
    })),
    createdAt: now,
    updatedAt: now,
  };
}

export function createBlankExercise(position: number, unit: WeightUnit): WeeklyPlanExercise {
  return {
    id: uuid(),
    name: "Nuevo ejercicio",
    description: "",
    instructions: "Describe la técnica y las indicaciones importantes.",
    mediaType: "none",
    mediaUrl: "",
    position,
    sets: [createBlankSet(1, unit), createBlankSet(2, unit), createBlankSet(3, unit)],
  };
}

export function createBlankSet(setNumber: number, unit: WeightUnit): PlannedWorkoutSet {
  return { id: uuid(), setNumber, targetReps: "10", targetWeight: null, weightUnit: unit, restSeconds: 60 };
}

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(databaseName, 2);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(legacyStoreName)) database.createObjectStore(legacyStoreName, { keyPath: "id" });
      if (!database.objectStoreNames.contains(cacheStoreName)) database.createObjectStore(cacheStoreName, { keyPath: "id" });
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

async function getLegacyState() {
  const database = await openDatabase();
  const record = await requestResult(database.transaction(legacyStoreName, "readonly").objectStore(legacyStoreName).get(legacyStateId)) as { state?: WorkoutsState } | undefined;
  database.close();
  return record?.state?.version === 3 ? record.state : null;
}

export async function getCachedWeeklyWorkouts() {
  const database = await openDatabase();
  const record = await requestResult(database.transaction(cacheStoreName, "readonly").objectStore(cacheStoreName).get(cacheStateId)) as { state?: WeeklyWorkoutsState } | undefined;
  database.close();
  return record?.state?.version === 4 ? record.state : null;
}

export async function cacheWeeklyWorkouts(state: WeeklyWorkoutsState) {
  const database = await openDatabase();
  await requestResult(database.transaction(cacheStoreName, "readwrite").objectStore(cacheStoreName).put({ id: cacheStateId, state }));
  database.close();
}

function legacyMedia(exercise: WorkoutPlan["blocks"][WorkoutBlockKey][number]["exercise"]): { type: ExerciseMediaType; url: string } {
  if (exercise.videoUrl) return { type: "video", url: exercise.videoUrl };
  if (exercise.imageUrl) return { type: exercise.imageUrl.toLowerCase().includes(".gif") ? "gif" : "image", url: exercise.imageUrl };
  return { type: "none", url: "" };
}

type WorkoutBlockKey = "warmup" | "main" | "core" | "cooldown";

function legacyExercise(entry: WorkoutPlan["blocks"][WorkoutBlockKey][number], position: number, unit: WeightUnit): WeeklyPlanExercise {
  const media = legacyMedia(entry.exercise);
  const weight = unit === "lb" ? Math.round(entry.weightKg * 2.20462 * 10) / 10 : entry.weightKg;
  return {
    id: uuid(),
    name: entry.exercise.name,
    description: entry.exercise.description,
    instructions: entry.exercise.description,
    mediaType: media.type,
    mediaUrl: media.url,
    position,
    sets: Array.from({ length: Math.max(1, entry.sets) }, (_, index) => ({
      id: uuid(),
      setNumber: index + 1,
      targetReps: entry.reps,
      targetWeight: weight || null,
      weightUnit: unit,
      restSeconds: 60,
    })),
  };
}

function convertLegacyState(state: WorkoutsState, unit: WeightUnit): WeeklyWorkoutPlan {
  const plan = createBlankWeeklyPlan();
  plan.name = "Plan importado de este dispositivo";
  plan.description = "Rutinas importadas una sola vez desde la versión local de NekoFit.";
  plan.legacyId = "indexeddb-workouts-v3";
  plan.days = plan.days.map((day, dayIndex) => {
    const legacy = state.workouts[dayIndex];
    if (!legacy) return day;
    const sections = emptySections().map((section) => {
      const block = section.type === "workout" ? "main" : section.type === "abs" ? "core" : section.type;
      if (block === "cardio") {
        if (!legacy.cardio.enabled) return section;
        return {
          ...section,
          estimatedMinutes: legacy.cardio.durationMinutes,
          exercises: [{
            id: uuid(),
            name: `Cardio · ${legacy.cardio.machine}`,
            description: legacy.cardio.notes,
            instructions: legacy.cardio.notes,
            mediaType: "none" as const,
            mediaUrl: "",
            position: 1,
            sets: [{ id: uuid(), setNumber: 1, targetReps: `${legacy.cardio.durationMinutes} min`, targetWeight: null, weightUnit: unit, restSeconds: 0 }],
          }],
        };
      }
      return { ...section, exercises: legacy.blocks[block].map((entry, index) => legacyExercise(entry, index + 1, unit)) };
    });
    return {
      ...day,
      name: legacy.name,
      focus: legacy.category,
      description: legacy.description,
      estimatedMinutes: legacy.estimatedMinutes,
      isRestDay: false,
      sections,
    };
  });
  return plan;
}

async function fetchPlans(client: SupabaseClient, userId: string): Promise<WeeklyWorkoutPlan[]> {
  const [plansResult, daysResult, sectionsResult, exercisesResult, setsResult] = await Promise.all([
    client.from("weekly_workout_plans").select("*").eq("user_id", userId).order("created_at"),
    client.from("workout_days").select("*").eq("user_id", userId).order("day_number"),
    client.from("workout_sections").select("*").eq("user_id", userId).order("position"),
    client.from("workout_exercises").select("*").eq("user_id", userId).order("position"),
    client.from("workout_exercise_sets").select("*").eq("user_id", userId).order("set_number"),
  ]);
  [plansResult, daysResult, sectionsResult, exercisesResult, setsResult].forEach((result) => throwIfError(result.error));

  const sets = asRows(setsResult.data);
  const exercises = asRows(exercisesResult.data);
  const sections = asRows(sectionsResult.data);
  const days = asRows(daysResult.data);

  return asRows(plansResult.data).map((plan) => ({
    id: String(plan.id),
    legacyId: typeof plan.legacy_id === "string" ? plan.legacy_id : null,
    name: String(plan.name),
    description: String(plan.description ?? ""),
    objective: String(plan.objective ?? ""),
    isActive: Boolean(plan.is_active),
    createdAt: String(plan.created_at),
    updatedAt: String(plan.updated_at),
    days: days.filter((day) => day.weekly_plan_id === plan.id).map((day) => ({
      id: String(day.id),
      dayNumber: valueAsNumber(day.day_number),
      name: String(day.day_name),
      focus: String(day.focus ?? ""),
      description: String(day.description ?? ""),
      estimatedMinutes: valueAsNumber(day.estimated_minutes),
      isRestDay: Boolean(day.is_rest_day),
      sections: sections.filter((section) => section.workout_day_id === day.id).map((section) => ({
        id: String(section.id),
        type: String(section.section_type) as WorkoutSectionType,
        title: String(section.title),
        position: valueAsNumber(section.position),
        estimatedMinutes: valueAsNumber(section.estimated_minutes),
        exercises: exercises.filter((exercise) => exercise.workout_section_id === section.id).map((exercise) => ({
          id: String(exercise.id),
          name: String(exercise.name),
          description: String(exercise.description ?? ""),
          instructions: String(exercise.instructions ?? ""),
          mediaType: String(exercise.media_type) as ExerciseMediaType,
          mediaUrl: String(exercise.media_url ?? ""),
          position: valueAsNumber(exercise.position),
          sets: sets.filter((set) => set.workout_exercise_id === exercise.id).map((set) => ({
            id: String(set.id),
            setNumber: valueAsNumber(set.set_number),
            targetReps: String(set.target_reps ?? ""),
            targetWeight: valueAsNullableNumber(set.target_weight),
            weightUnit: (set.weight_unit === "lb" ? "lb" : "kg") as WeightUnit,
            restSeconds: valueAsNumber(set.rest_seconds),
          })),
        })),
      })),
    })),
  }));
}

async function fetchOpenSession(client: SupabaseClient, userId: string): Promise<WorkoutSession | null> {
  const sessionResult = await client.from("workout_sessions").select("*").eq("user_id", userId).in("status", ["in_progress", "paused"]).order("created_at", { ascending: false }).limit(1).maybeSingle();
  throwIfError(sessionResult.error);
  const session = sessionResult.data as Row | null;
  if (!session) return null;

  const [exercisesResult, setsResult] = await Promise.all([
    client.from("workout_session_exercises").select("*").eq("user_id", userId).eq("workout_session_id", session.id).order("position"),
    client.from("workout_set_results").select("*").eq("user_id", userId).order("set_number"),
  ]);
  throwIfError(exercisesResult.error);
  throwIfError(setsResult.error);
  const setRows = asRows(setsResult.data);
  const exercises: WorkoutSessionExercise[] = asRows(exercisesResult.data).map((exercise) => ({
    id: String(exercise.id),
    plannedExerciseId: typeof exercise.planned_exercise_id === "string" ? exercise.planned_exercise_id : null,
    sectionType: String(exercise.section_type) as WorkoutSectionType,
    name: String(exercise.exercise_name),
    instructions: String(exercise.instructions ?? ""),
    mediaType: String(exercise.media_type) as ExerciseMediaType,
    mediaUrl: String(exercise.media_url ?? ""),
    position: valueAsNumber(exercise.position),
    completed: Boolean(exercise.completed),
    completedAt: typeof exercise.completed_at === "string" ? exercise.completed_at : null,
    sets: setRows.filter((set) => set.session_exercise_id === exercise.id).map((set) => ({
      id: String(set.id),
      plannedSetId: typeof set.planned_set_id === "string" ? set.planned_set_id : null,
      setNumber: valueAsNumber(set.set_number),
      targetReps: String(set.target_reps ?? ""),
      actualReps: String(set.actual_reps ?? ""),
      targetWeight: valueAsNullableNumber(set.target_weight),
      actualWeight: valueAsNullableNumber(set.actual_weight),
      weightUnit: (set.weight_unit === "lb" ? "lb" : "kg") as WeightUnit,
      completed: Boolean(set.completed),
      completedAt: typeof set.completed_at === "string" ? set.completed_at : null,
    })),
  }));

  return {
    id: String(session.id),
    weeklyPlanId: typeof session.weekly_plan_id === "string" ? session.weekly_plan_id : null,
    workoutDayId: typeof session.workout_day_id === "string" ? session.workout_day_id : null,
    name: String(session.name),
    focus: String(session.focus ?? ""),
    status: String(session.status) as WorkoutSession["status"],
    startedAt: typeof session.started_at === "string" ? session.started_at : null,
    timerStartedAt: typeof session.timer_started_at === "string" ? session.timer_started_at : null,
    endedAt: typeof session.ended_at === "string" ? session.ended_at : null,
    elapsedSeconds: valueAsNumber(session.elapsed_seconds),
    pausedSeconds: valueAsNumber(session.paused_seconds),
    updatedAt: String(session.updated_at),
    exercises,
  };
}

export async function loadWeeklyWorkouts(client: SupabaseClient, userId: string, unit: WeightUnit): Promise<WeeklyWorkoutsState> {
  let plans = await fetchPlans(client, userId);
  const migrationResult = await client.from("data_migrations").select("migration_key").eq("user_id", userId).eq("migration_key", migrationKey).maybeSingle();
  throwIfError(migrationResult.error);

  if (!migrationResult.data) {
    const legacy = await getLegacyState();
    if (plans.length === 0) {
      const importedPlan = legacy ? convertLegacyState(legacy, unit) : createBlankWeeklyPlan();
      await persistWeeklyPlan(client, userId, importedPlan);
      plans = await fetchPlans(client, userId);
    }
    const marker = await client.from("data_migrations").upsert({
      user_id: userId,
      migration_key: migrationKey,
      details: { imported: Boolean(legacy), imported_workouts: legacy?.workouts.length ?? 0 },
    }, { onConflict: "user_id,migration_key" });
    throwIfError(marker.error);
  }

  const state: WeeklyWorkoutsState = { version: 4, plans, activeSession: await fetchOpenSession(client, userId) };
  await cacheWeeklyWorkouts(state);
  return state;
}

async function deleteMissing(client: SupabaseClient, table: string, userId: string, parentColumn: string, parentId: string, currentIds: string[]) {
  const existing = await client.from(table).select("id").eq("user_id", userId).eq(parentColumn, parentId);
  throwIfError(existing.error);
  const staleIds = asRows(existing.data).map((row) => String(row.id)).filter((id) => !currentIds.includes(id));
  if (staleIds.length === 0) return;
  const deleted = await client.from(table).delete().eq("user_id", userId).in("id", staleIds);
  throwIfError(deleted.error);
}

export async function persistWeeklyPlan(client: SupabaseClient, userId: string, plan: WeeklyWorkoutPlan) {
  const planResult = await client.from("weekly_workout_plans").upsert({
    id: plan.id,
    user_id: userId,
    legacy_id: plan.legacyId,
    name: plan.name,
    description: plan.description,
    objective: plan.objective,
    is_active: plan.isActive,
  }, { onConflict: "id" });
  throwIfError(planResult.error);

  for (const day of plan.days) {
    const dayResult = await client.from("workout_days").upsert({
      id: day.id, user_id: userId, weekly_plan_id: plan.id, day_number: day.dayNumber,
      day_name: day.name, focus: day.focus, description: day.description,
      estimated_minutes: day.estimatedMinutes, is_rest_day: day.isRestDay,
    }, { onConflict: "id" });
    throwIfError(dayResult.error);

    for (const section of day.sections) {
      const sectionResult = await client.from("workout_sections").upsert({
        id: section.id, user_id: userId, workout_day_id: day.id, section_type: section.type,
        title: section.title, position: section.position, estimated_minutes: section.estimatedMinutes,
      }, { onConflict: "id" });
      throwIfError(sectionResult.error);

      for (const exercise of section.exercises) {
        const exerciseResult = await client.from("workout_exercises").upsert({
          id: exercise.id, user_id: userId, workout_section_id: section.id,
          name: exercise.name, description: exercise.description, instructions: exercise.instructions,
          exercise_source: "custom", media_type: exercise.mediaType,
          media_url: exercise.mediaType === "none" ? null : exercise.mediaUrl,
          position: exercise.position,
        }, { onConflict: "id" });
        throwIfError(exerciseResult.error);

        if (exercise.sets.length > 0) {
          const setsResult = await client.from("workout_exercise_sets").upsert(exercise.sets.map((set) => ({
            id: set.id, user_id: userId, workout_exercise_id: exercise.id, set_number: set.setNumber,
            target_reps: set.targetReps, target_weight: set.targetWeight, weight_unit: set.weightUnit,
            rest_seconds: set.restSeconds,
          })), { onConflict: "id" });
          throwIfError(setsResult.error);
        }
        await deleteMissing(client, "workout_exercise_sets", userId, "workout_exercise_id", exercise.id, exercise.sets.map((set) => set.id));
      }
      await deleteMissing(client, "workout_exercises", userId, "workout_section_id", section.id, section.exercises.map((exercise) => exercise.id));
    }
    await deleteMissing(client, "workout_sections", userId, "workout_day_id", day.id, day.sections.map((section) => section.id));
  }
  await deleteMissing(client, "workout_days", userId, "weekly_plan_id", plan.id, plan.days.map((day) => day.id));
}

export async function deleteWeeklyPlan(client: SupabaseClient, userId: string, planId: string) {
  const result = await client.from("weekly_workout_plans").delete().eq("user_id", userId).eq("id", planId);
  throwIfError(result.error);
}

function localDate(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function mondayOfCurrentWeek() {
  const date = new Date();
  const weekday = date.getDay() || 7;
  date.setDate(date.getDate() - weekday + 1);
  return localDate(date);
}

export async function startWorkoutSession(client: SupabaseClient, userId: string, plan: WeeklyWorkoutPlan, day: WeeklyPlanDay): Promise<WorkoutSession> {
  const scheduleResult = await client.from("workout_week_schedules").upsert({
    user_id: userId, weekly_plan_id: plan.id, week_start_date: mondayOfCurrentWeek(), status: "active",
  }, { onConflict: "user_id,week_start_date" }).select("id").single();
  throwIfError(scheduleResult.error);
  if (!scheduleResult.data) throw new Error("No fue posible preparar la semana de entrenamiento.");

  const now = new Date().toISOString();
  const sessionId = uuid();
  const sessionResult = await client.from("workout_sessions").insert({
    id: sessionId, user_id: userId, week_schedule_id: scheduleResult.data.id,
    weekly_plan_id: plan.id, workout_day_id: day.id, scheduled_date: localDate(new Date()),
    name: day.name, focus: day.focus, status: "in_progress", started_at: now,
    timer_started_at: now, elapsed_seconds: 0, paused_seconds: 0,
  });
  throwIfError(sessionResult.error);

  const exercises: WorkoutSessionExercise[] = [];
  for (const section of day.sections) {
    for (const plannedExercise of section.exercises) {
      const exercise: WorkoutSessionExercise = {
        id: uuid(), plannedExerciseId: plannedExercise.id, sectionType: section.type,
        name: plannedExercise.name, instructions: plannedExercise.instructions,
        mediaType: plannedExercise.mediaType, mediaUrl: plannedExercise.mediaUrl,
        position: plannedExercise.position, completed: false, completedAt: null,
        sets: plannedExercise.sets.map((set) => ({
          id: uuid(), plannedSetId: set.id, setNumber: set.setNumber,
          targetReps: set.targetReps, actualReps: "", targetWeight: set.targetWeight,
          actualWeight: null, weightUnit: set.weightUnit, completed: false, completedAt: null,
        })),
      };
      exercises.push(exercise);
      const exerciseResult = await client.from("workout_session_exercises").insert({
        id: exercise.id, user_id: userId, workout_session_id: sessionId,
        planned_exercise_id: plannedExercise.id, section_type: section.type,
        exercise_name: plannedExercise.name, instructions: plannedExercise.instructions,
        media_type: plannedExercise.mediaType, media_url: plannedExercise.mediaType === "none" ? null : plannedExercise.mediaUrl,
        position: plannedExercise.position,
      });
      throwIfError(exerciseResult.error);
      if (exercise.sets.length > 0) {
        const setsResult = await client.from("workout_set_results").insert(exercise.sets.map((set) => ({
          id: set.id, user_id: userId, session_exercise_id: exercise.id,
          planned_set_id: set.plannedSetId, set_number: set.setNumber,
          target_reps: set.targetReps, actual_reps: set.actualReps,
          target_weight: set.targetWeight, actual_weight: set.actualWeight,
          weight_unit: set.weightUnit,
        })));
        throwIfError(setsResult.error);
      }
    }
  }

  return {
    id: sessionId, weeklyPlanId: plan.id, workoutDayId: day.id, name: day.name,
    focus: day.focus, status: "in_progress", startedAt: now, timerStartedAt: now,
    endedAt: null, elapsedSeconds: 0, pausedSeconds: 0, updatedAt: now, exercises,
  };
}

export async function persistSessionTimer(client: SupabaseClient, userId: string, session: WorkoutSession) {
  const result = await client.from("workout_sessions").update({
    status: session.status, timer_started_at: session.timerStartedAt, ended_at: session.endedAt,
    elapsed_seconds: session.elapsedSeconds, paused_seconds: session.pausedSeconds,
  }).eq("user_id", userId).eq("id", session.id);
  throwIfError(result.error);
}

export async function persistSessionExercise(client: SupabaseClient, userId: string, exercise: WorkoutSessionExercise) {
  const result = await client.from("workout_session_exercises").update({
    completed: exercise.completed, completed_at: exercise.completedAt,
  }).eq("user_id", userId).eq("id", exercise.id);
  throwIfError(result.error);
}

export async function persistSetResult(client: SupabaseClient, userId: string, set: WorkoutSetResult) {
  const result = await client.from("workout_set_results").update({
    actual_reps: set.actualReps || null, actual_weight: set.actualWeight,
    weight_unit: set.weightUnit, completed: set.completed, completed_at: set.completedAt,
  }).eq("user_id", userId).eq("id", set.id);
  throwIfError(result.error);
}
