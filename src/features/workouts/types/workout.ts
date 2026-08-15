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
