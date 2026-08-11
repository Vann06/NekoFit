import type { DashboardSummary } from "../types/dashboard-summary";

export const todaySummary: DashboardSummary = {
  calories: {
    consumed: 1320,
    goal: 1900,
  },
  macros: [
    { label: "Proteína", current: 92, goal: 120, unit: "g", tone: "protein" },
    { label: "Carbohidratos", current: 148, goal: 210, unit: "g", tone: "carbs" },
    { label: "Grasas", current: 44, goal: 60, unit: "g", tone: "fat" },
  ],
  water: {
    current: 5,
    goal: 8,
  },
  steps: {
    current: 6430,
    goal: 8000,
  },
};
