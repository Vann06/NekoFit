"use client";

import { useMemo, useState } from "react";

import { mealDefinitions } from "../data/meal-definitions";
import { planningOptions } from "../data/planning-options";
import { useNutritionState } from "../hooks/use-nutrition-state";
import { addDays, createEmptyPlannedDay, getLocalDateKey, getWeekStart } from "../repositories/nutrition-repository";
import type { MealKey, PlannedItem } from "../types/nutrition";
import styles from "../nutrition.module.css";
import { NutritionTabs } from "./nutrition-tabs";

function formatWeekDay(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00`);
  return { day: new Intl.DateTimeFormat("es-GT", { weekday: "short" }).format(date).replace(".", ""), date: date.getDate() };
}

export function MealPlannerView() {
  const { state, addPlannedItem, removePlannedItem, duplicatePlannedDay } = useNutritionState();
  const [weekStart, setWeekStart] = useState(() => getWeekStart(getLocalDateKey()));
  const [editingSlot, setEditingSlot] = useState<{ date: string; meal: MealKey } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const weekDates = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart]);
  const weekItems = weekDates.flatMap((date) => Object.values((state.planDays[date] ?? createEmptyPlannedDay(date)).meals).flat());
  const averageCalories = Math.round(weekItems.reduce((total, item) => total + item.calories, 0) / 7);
  const averageProtein = Math.round(weekItems.reduce((total, item) => total + item.protein, 0) / 7);

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
          <p>Planea alimentos y recetas sin convertir el calendario en una obligación. Después podrás pasar lo planeado a tu diario.</p>
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
            const day = state.planDays[date] ?? createEmptyPlannedDay(date);
            const dayItems = Object.values(day.meals).flat();
            const totalCalories = dayItems.reduce((total, item) => total + item.calories, 0);
            const formatted = formatWeekDay(date);
            return (
              <article key={date} className={`${styles.dayColumn} ${date === getLocalDateKey() ? styles.todayColumn : ""}`}>
                <header><span>{formatted.day}</span><strong>{formatted.date}</strong><small>{totalCalories} kcal</small></header>
                <div className={styles.planSlots}>
                  {mealDefinitions.map((meal) => (
                    <section key={meal.key} className={styles.planSlot}>
                      <div><strong>{meal.shortLabel}</strong><button type="button" aria-label={`Agregar a ${meal.label} del ${date}`} onClick={() => setEditingSlot({ date, meal: meal.key })}>+</button></div>
                      {day.meals[meal.key].length === 0 && <p>Sin planear</p>}
                      {day.meals[meal.key].map((item) => (
                        <div key={item.id} className={styles.plannedItem} data-kind={item.kind}>
                          <span><strong>{item.title}</strong><small>{item.calories} kcal · {item.protein} g P</small></span>
                          <button type="button" aria-label={`Quitar ${item.title}`} onClick={() => removePlannedItem(date, meal.key, item.id)}>×</button>
                        </div>
                      ))}
                    </section>
                  ))}
                </div>
                <button type="button" className={styles.duplicateDayButton} onClick={() => { duplicatePlannedDay(date, addDays(date, 1)); showToast(`Copiamos ${formatted.day} al día siguiente.`); }}>Duplicar →</button>
              </article>
            );
          })}
        </div>
        <p className={styles.plannerHint}>Desliza horizontalmente para ver toda la semana. El scroll se mantiene limpio y sin barra visible.</p>
      </section>

      {editingSlot && <PlanItemDialog onClose={() => setEditingSlot(null)} onAdd={(item) => { addPlannedItem(editingSlot.date, editingSlot.meal, item); setEditingSlot(null); showToast(`${item.title} se agregó al plan.`); }} />}
      {toast && <div className={styles.nutritionToast} role="status"><span>✓</span>{toast}</div>}
    </main>
  );
}

function PlanItemDialog({ onClose, onAdd }: { onClose: () => void; onAdd: (item: Omit<PlannedItem, "id">) => void }) {
  return (
    <div className={styles.dialogBackdrop} role="presentation" onPointerDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className={styles.planDialog} role="dialog" aria-modal="true" aria-labelledby="plan-item-title">
        <button type="button" className={styles.closeDialog} aria-label="Cerrar opciones" onClick={onClose}>×</button>
        <p className={styles.dialogEyebrow}>Planifica en segundos</p>
        <h2 id="plan-item-title">Elige una comida</h2>
        <div className={styles.planOptions}>
          {planningOptions.map((item) => (
            <button key={item.title} type="button" onClick={() => onAdd(item)}>
              <span aria-hidden="true">{item.kind === "recipe" ? "R" : "A"}</span>
              <div><strong>{item.title}</strong><small>{item.subtitle}</small></div>
              <b>{item.calories} kcal</b>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
