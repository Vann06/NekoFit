"use client";

import { CalorieCatCard } from "./calorie-cat-card";
import { MacroCard } from "./macro-card";
import { MetricCard } from "./metric-card";
import { PawIcon } from "./paw-icon";
import { WaterCard } from "./water-card";
import { todaySummary } from "../data/today-summary";
import { useNutritionState } from "../../nutrition/hooks/use-nutrition-state";
import { createEmptyDiaryDay, getLocalDateKey } from "../../nutrition/repositories/nutrition-repository";
import { sumMacros } from "../../nutrition/utils/nutrition-calculations";
import styles from "../dashboard.module.css";

export function DashboardView() {
  const { state, updateWater } = useNutritionState();
  const today = getLocalDateKey();
  const diary = state.diaryDays[today] ?? createEmptyDiaryDay(today);
  const totals = sumMacros(Object.values(diary.meals).flat());
  const calories = { consumed: totals.calories, goal: state.goals.calories };
  const macros = [
    { label: "Proteína", current: totals.protein, goal: state.goals.protein, unit: "g" as const, tone: "protein" as const },
    { label: "Carbohidratos", current: totals.carbs, goal: state.goals.carbs, unit: "g" as const, tone: "carbs" as const },
    { label: "Grasas", current: totals.fat, goal: state.goals.fat, unit: "g" as const, tone: "fat" as const },
  ];
  const water = { current: state.waterByDate[today] ?? 0, goal: state.goals.waterGlasses };
  const { steps } = todaySummary;

  return (
    <main className={styles.dashboard}>
      <header className={styles.dashboardHeader} data-page-title>
        <div>
          <p className={styles.dashboardEyebrow}>Resumen diario</p>
          <h1>Tu día en equilibrio</h1>
        </div>
      </header>

      <section className={styles.dashboardGrid} aria-label="Métricas de hoy">
        <CalorieCatCard consumed={calories.consumed} goal={calories.goal} />

        <MacroCard macros={macros} />

        <WaterCard current={water.current} goal={water.goal} onChange={(nextValue) => updateWater(today, nextValue)} />

        <MetricCard
          href="/progress"
          label="Pasos"
          value={steps.current.toLocaleString("es-GT")}
          description={`${steps.current.toLocaleString("es-GT")} de ${steps.goal.toLocaleString("es-GT")} pasos`}
          variant="steps"
        >
          <span className={styles.pawSteps}>
            {Array.from({ length: 5 }, (_, index) => (
              <PawIcon key={index} active={index < Math.ceil((steps.current / steps.goal) * 5)} />
            ))}
          </span>
        </MetricCard>
      </section>
    </main>
  );
}
