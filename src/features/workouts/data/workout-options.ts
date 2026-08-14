import type { CardioMachine, ExerciseCatalogItem, WorkoutBlockKey, WorkoutCategory } from "../types/workout";

export const workoutBlockDefinitions: Array<{ key: WorkoutBlockKey; label: string; shortLabel: string; description: string; color: string }> = [
  { key: "warmup", label: "Warm-up", shortLabel: "01", description: "Movilidad y activación", color: "lime" },
  { key: "main", label: "Principal", shortLabel: "02", description: "Fuerza del día", color: "yellow" },
  { key: "core", label: "Abs / core", shortLabel: "03", description: "Bloque opcional", color: "purple" },
  { key: "cooldown", label: "Cooldown", shortLabel: "05", description: "Estiramientos", color: "mint" },
];

export const workoutCategories: Array<{ value: WorkoutCategory; label: string; mark: string }> = [
  { value: "lower", label: "Tren inferior", mark: "PI" },
  { value: "upper", label: "Tren superior", mark: "SU" },
  { value: "fullBody", label: "Full body", mark: "FB" },
  { value: "core", label: "Core", mark: "CO" },
  { value: "running", label: "Running", mark: "RU" },
  { value: "hyrox", label: "Hyrox", mark: "HX" },
  { value: "mobility", label: "Movilidad", mark: "MO" },
  { value: "recovery", label: "Recuperación", mark: "RE" },
  { value: "cardio", label: "Cardio", mark: "CA" },
  { value: "custom", label: "Personalizado", mark: "TU" },
];

export const cardioMachines: Array<{ value: CardioMachine; label: string; icon: string }> = [
  { value: "treadmill", label: "Banda", icon: "↗" },
  { value: "stairmaster", label: "StairMaster", icon: "▟" },
  { value: "bike", label: "Bicicleta", icon: "◉" },
  { value: "elliptical", label: "Elíptica", icon: "∞" },
  { value: "other", label: "Otro", icon: "+" },
];

export const localExerciseCatalog: ExerciseCatalogItem[] = [
  { id: "local-cat-cow", name: "Cat-cow", description: "Moviliza suavemente la columna alternando flexión y extensión.", category: "Movilidad", muscles: ["Core", "Espalda"], equipment: ["Peso corporal"], source: "NekoFit" },
  { id: "local-leg-swings", name: "Balanceos de pierna", description: "Balancea la pierna al frente y atrás con el torso estable.", category: "Calentamiento", muscles: ["Cadera", "Isquiotibiales"], equipment: ["Peso corporal"], source: "NekoFit" },
  { id: "local-squat", name: "Sentadilla con barra", description: "Desciende con el pecho alto y empuja el piso para volver.", category: "Piernas", muscles: ["Cuádriceps", "Glúteos"], equipment: ["Barra"], source: "NekoFit" },
  { id: "local-hip-thrust", name: "Hip thrust", description: "Extiende la cadera y aprieta glúteos sin hiperextender la espalda.", category: "Piernas", muscles: ["Glúteos", "Isquiotibiales"], equipment: ["Barra", "Banco"], source: "NekoFit" },
  { id: "local-rdl", name: "Peso muerto rumano", description: "Lleva la cadera atrás manteniendo la barra cerca del cuerpo.", category: "Piernas", muscles: ["Isquiotibiales", "Glúteos"], equipment: ["Barra"], source: "NekoFit" },
  { id: "local-row", name: "Remo sentado", description: "Lleva los codos atrás sin elevar los hombros.", category: "Espalda", muscles: ["Espalda", "Bíceps"], equipment: ["Polea"], source: "NekoFit" },
  { id: "local-press", name: "Press con mancuernas", description: "Empuja las mancuernas sobre el pecho con control.", category: "Pecho", muscles: ["Pecho", "Tríceps"], equipment: ["Mancuernas"], source: "NekoFit" },
  { id: "local-plank", name: "Plancha", description: "Mantén una línea larga de hombros a talones y respira.", category: "Core", muscles: ["Abdomen"], equipment: ["Peso corporal"], source: "NekoFit" },
  { id: "local-dead-bug", name: "Dead bug", description: "Extiende brazo y pierna contrarios sin despegar la espalda baja.", category: "Core", muscles: ["Abdomen"], equipment: ["Peso corporal"], source: "NekoFit" },
  { id: "local-child-pose", name: "Postura del niño", description: "Lleva la cadera hacia los talones y alarga la espalda.", category: "Estiramiento", muscles: ["Espalda", "Cadera"], equipment: ["Peso corporal"], source: "NekoFit" },
  { id: "local-quad-stretch", name: "Estiramiento de cuádriceps", description: "Acerca el talón al glúteo manteniendo las rodillas juntas.", category: "Estiramiento", muscles: ["Cuádriceps"], equipment: ["Peso corporal"], source: "NekoFit" },
];
