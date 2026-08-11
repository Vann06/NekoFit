export type MacroSummary = {
  label: string;
  current: number;
  goal: number;
  unit: "g";
  tone: "protein" | "carbs" | "fat";
};

export type DashboardSummary = {
  calories: {
    consumed: number;
    goal: number;
  };
  macros: MacroSummary[];
  water: {
    current: number;
    goal: number;
  };
  steps: {
    current: number;
    goal: number;
  };
};
