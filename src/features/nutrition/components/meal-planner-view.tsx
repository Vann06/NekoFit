"use client";

import { useMemo, useState } from "react";

import { mealDefinitions } from "../data/meal-definitions";
import { useNutritionState } from "../hooks/use-nutrition-state";
import { addDays, createEmptyDiaryDay, getLocalDateKey, getWeekStart } from "../repositories/nutrition-repository";
import type { MealKey } from "../types/nutrition";
import { sumMacros } from "../utils/nutrition-calculations";
import styles from "../nutrition.module.css";
import { FoodSearchDialog } from "./nutrition-diary";
import { MealDetailsDialog } from "./meal-details-dialog";
import { NutritionTabs } from "./nutrition-tabs";

function formatWeekDay(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00`);
  return { day: new Intl.DateTimeFormat("es-GT", { weekday: "short" }).format(date).replace(".", ""), date: date.getDate() };
}

export function MealPlannerView() {
  const { state, addFood, removeFood, duplicateDiaryDay } = useNutritionState();
  const [weekStart, setWeekStart] = useState(() => getWeekStart(getLocalDateKey()));
  const [editingSlot, setEditingSlot] = useState<{ date: string; meal: MealKey } | null>(null);
  const [detailSlot, setDetailSlot] = useState<{ date: string; meal: MealKey } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const weekDates = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart]);
  const weekItems = weekDates.flatMap((date) => Object.values((state.diaryDays[date] ?? createEmptyDiaryDay(date)).meals).flat());
  const weekTotals = sumMacros(weekItems);
  const averageCalories = Math.round(weekTotals.calories / 7);
  const averageProtein = Math.round(weekTotals.protein / 7);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }

  return (
    <main className={styles.nutritionPage}>
      <header className={styles.nutritionIntro}>
        <div>
          <p className={styles.eyebrow}>Organiza antes de cocinar</p>
          <h1>Tu semana,<br />comida resuelta</h1>
          <p>Calendario y diario comparten los mismos alimentos. Lo que agregues aquí aparecerá también en Alimentación y en el dashboard de ese día.</p>
        </div>
        <div className={styles.introActions}><NutritionTabs active="planner" /></div>
      </header>

      <section className={styles.plannerSummary} aria-label="Resumen del plan semanal">
        <div><small>Promedio diario</small><strong>{averageCalories} kcal</strong></div>
        <div><small>Proteína diaria</small><strong>{averageProtein} g</strong></div>
        <div><small>Comidas planeadas</small><strong>{weekItems.length}</strong></div>
        <div><small>Meta de energía</small><strong>{state.goals.calories} kcal</strong></div>
      </section>

      <section className={styles.weekPlanner} aria-label="Calendario semanal de comidas">
        <header className={styles.weekHeader}>
          <button type="button" aria-label="Semana anterior" onClick={() => setWeekStart((date) => addDays(date, -7))}>‹</button>
          <div><small>Semana</small><strong>{new Intl.DateTimeFormat("es-GT", { day: "numeric", month: "long" }).format(new Date(`${weekStart}T12:00:00`))} – {new Intl.DateTimeFormat("es-GT", { day: "numeric", month: "long" }).format(new Date(`${weekDates[6]}T12:00:00`))}</strong></div>
          <button type="button" aria-label="Semana siguiente" onClick={() => setWeekStart((date) => addDays(date, 7))}>›</button>
        </header>

        <div className={styles.weekGrid}>
          {weekDates.map((date) => {
            const day = state.diaryDays[date] ?? createEmptyDiaryDay(date);
            const dayItems = Object.values(day.meals).flat();
            const totalCalories = sumMacros(dayItems).calories;
            const formatted = formatWeekDay(date);
            return (
              <article key={date} className={`${styles.dayColumn} ${date === getLocalDateKey() ? styles.todayColumn : ""}`}>
                <header><span>{formatted.day}</span><strong>{formatted.date}</strong><small>{totalCalories} kcal</small></header>
                <div className={styles.planSlots}>
                  {mealDefinitions.map((meal) => {
                    const entries = day.meals[meal.key];
                    const mealCalories = sumMacros(entries).calories;
                    return (
                      <section key={meal.key} className={styles.planSlot}>
                        <div><strong>{meal.shortLabel}</strong><button type="button" aria-label={`Agregar a ${meal.label} del ${date}`} onClick={() => setEditingSlot({ date, meal: meal.key })}>+</button></div>
                        {entries.length === 0 && <p>Sin registrar</p>}
                        {entries.map((entry) => (
                          <div key={entry.id} className={styles.plannedItem} data-kind="food">
                            <span><strong>{entry.food.name}</strong><small>{entry.macros.calories} kcal</small></span>
                          </div>
                        ))}
                        {entries.length > 0 && <button type="button" className={styles.slotSummaryButton} onClick={() => setDetailSlot({ date, meal: meal.key })}>{mealCalories} kcal · Ver detalle</button>}
                      </section>
                    );
                  })}
                </div>
                <button type="button" className={styles.duplicateDayButton} onClick={() => { duplicateDiaryDay(date, addDays(date, 1)); showToast(`Copiamos ${formatted.day} al día siguiente.`); }}>Duplicar →</button>
              </article>
            );
          })}
        </div>
        <p className={styles.plannerHint}>Desliza horizontalmente para ver toda la semana. El scroll se mantiene limpio y sin barra visible.</p>
      </section>

      {editingSlot && <FoodSearchDialog meal={editingSlot.meal} onClose={() => setEditingSlot(null)} onAdd={(food, grams, amount, measureLabel) => { addFood(editingSlot.date, editingSlot.meal, food, grams, amount, measureLabel); setEditingSlot(null); showToast(`${food.name} se agregó al ${editingSlot.date}.`); }} />}
      {detailSlot && <MealDetailsDialog mealLabel={mealDefinitions.find((meal) => meal.key === detailSlot.meal)?.label ?? "Comida"} calorieGoal={state.goals.mealCalories[detailSlot.meal]} entries={(state.diaryDays[detailSlot.date] ?? createEmptyDiaryDay(detailSlot.date)).meals[detailSlot.meal]} onClose={() => setDetailSlot(null)} onRemove={(entryId) => removeFood(detailSlot.date, detailSlot.meal, entryId)} />}
      {toast && <div className={styles.nutritionToast} role="status"><span>✓</span>{toast}</div>}
    </main>
  );
}
