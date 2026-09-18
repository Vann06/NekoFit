export type WorkoutBlockKey = "warmup" | "main" | "core" | "cooldown";

export type WorkoutCategory =
  | "lower"
  | "upper"
  | "fullBody"
  | "core"
  | "running"
  | "hyrox"
  | "mobility"
  | "recovery"
  | "cardio"
  | "custom";

export type ExerciseCatalogItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  muscles: string[];
  equipment: string[];
  imageUrl?: string;
  videoUrl?: string;
  source: "NekoFit" | "WorkoutX" | "wger";
  attribution?: string;
};

export type WorkoutExercise = {
  id: string;
  exercise: ExerciseCatalogItem;
  sets: number;
  reps: string;
  weightKg: number;
};

export type CardioMachine = "treadmill" | "stairmaster" | "bike" | "elliptical" | "other";

export type CardioConfig = {
  enabled: boolean;
  machine: CardioMachine;
  durationMinutes: number;
  speed: number;
  incline: number;
  level: number;
  notes: string;
};

export type WorkoutPlan = {
  id: string;
  name: string;
  category: WorkoutCategory;
  description: string;
  estimatedMinutes: number;
  coreEnabled: boolean;
  blocks: Record<WorkoutBlockKey, WorkoutExercise[]>;
  cardio: CardioConfig;
  createdAt: string;
  updatedAt: string;
};

export type WorkoutsState = {
  version: 3;
  workouts: WorkoutPlan[];
};

export type WeightUnit = "kg" | "lb";
export type WorkoutSectionType = "warmup" | "workout" | "abs" | "cardio" | "cooldown";
export type WorkoutSessionStatus = "planned" | "in_progress" | "paused" | "completed" | "skipped";
export type ExerciseMediaType = "none" | "image" | "gif" | "video";

export type PlannedWorkoutSet = {
  id: string;
  setNumber: number;
  targetReps: string;
  targetWeight: number | null;
  weightUnit: WeightUnit;
  restSeconds: number;
};

export type WeeklyPlanExercise = {
  id: string;
  name: string;
  instructions: string;
  description: string;
  mediaType: ExerciseMediaType;
  mediaUrl: string;
  position: number;
  sets: PlannedWorkoutSet[];
};

export type WeeklyPlanSection = {
  id: string;
  type: WorkoutSectionType;
  title: string;
  position: number;
  estimatedMinutes: number;
  exercises: WeeklyPlanExercise[];
};

export type WeeklyPlanDay = {
  id: string;
  dayNumber: number;
  name: string;
  focus: string;
  description: string;
  estimatedMinutes: number;
  isRestDay: boolean;
  sections: WeeklyPlanSection[];
};

export type WeeklyWorkoutPlan = {
  id: string;
  legacyId: string | null;
  name: string;
  description: string;
  objective: string;
  isActive: boolean;
  days: WeeklyPlanDay[];
  createdAt: string;
  updatedAt: string;
};

export type WorkoutSetResult = {
  id: string;
  plannedSetId: string | null;
  setNumber: number;
  targetReps: string;
  actualReps: string;
  targetWeight: number | null;
  actualWeight: number | null;
  weightUnit: WeightUnit;
  completed: boolean;
  completedAt: string | null;
};

export type WorkoutSessionExercise = {
  id: string;
  plannedExerciseId: string | null;
  sectionType: WorkoutSectionType;
  name: string;
  instructions: string;
  mediaType: ExerciseMediaType;
  mediaUrl: string;
  position: number;
  completed: boolean;
  completedAt: string | null;
  sets: WorkoutSetResult[];
};

export type WorkoutSession = {
  id: string;
  weeklyPlanId: string | null;
  workoutDayId: string | null;
  name: string;
  focus: string;
  status: WorkoutSessionStatus;
  startedAt: string | null;
  timerStartedAt: string | null;
  endedAt: string | null;
  elapsedSeconds: number;
  pausedSeconds: number;
  updatedAt: string;
  exercises: WorkoutSessionExercise[];
};

export type WeeklyWorkoutsState = {
  version: 4;
  plans: WeeklyWorkoutPlan[];
  activeSession: WorkoutSession | null;
};
