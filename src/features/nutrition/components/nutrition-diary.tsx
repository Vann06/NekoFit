"use client";

import { useEffect, useMemo, useState } from "react";

import { commonFoods } from "../data/food-catalog";
import { mealDefinitions } from "../data/meal-definitions";
import { useNutritionState } from "../hooks/use-nutrition-state";
import { addDays, createEmptyDiaryDay, getLocalDateKey } from "../repositories/nutrition-repository";
import { searchFoods } from "../services/usda-food-service";
import type { FoodItem, MacroValues, MealKey, NutritionGoals } from "../types/nutrition";
import { emptyMacros, sumMacros } from "../utils/nutrition-calculations";
import styles from "../nutrition.module.css";
import { NutritionTabs } from "./nutrition-tabs";

const macroCards: Array<{ key: keyof Omit<MacroValues, "calories">; label: string; tone: string }> = [
  { key: "protein", label: "Proteína", tone: "protein" },
  { key: "carbs", label: "Carbohidratos", tone: "carbs" },
  { key: "fat", label: "Grasas", tone: "fat" },
  { key: "fiber", label: "Fibra", tone: "fiber" },
];

function formatSelectedDate(dateKey: string) {
  return new Intl.DateTimeFormat("es-GT", { weekday: "long", day: "numeric", month: "long" }).format(new Date(`${dateKey}T12:00:00`));
}

export function NutritionDiary() {
  const { state, isHydrated, addFood, removeFood, updateGoals } = useNutritionState();
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateKey());
  const [addingToMeal, setAddingToMeal] = useState<MealKey | null>(null);
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const day = state.diaryDays[selectedDate] ?? createEmptyDiaryDay(selectedDate);
  const dayTotals = useMemo(() => sumMacros(Object.values(day.meals).flat()), [day.meals]);
  const remainingCalories = Math.max(state.goals.calories - dayTotals.calories, 0);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }

  return (
    <main className={styles.nutritionPage}>
      <header className={styles.nutritionIntro}>
        <div>
          <p className={styles.eyebrow}>Tu diario de alimentación</p>
          <h1>Comer bien,<br />sin adivinar</h1>
          <p>Registra lo que realmente comiste y compara en segundos tus calorías, macros y fibra con tus objetivos.</p>
        </div>
        <div className={styles.introActions}>
          <NutritionTabs active="diary" />
          <button type="button" className={styles.settingsButton} onClick={() => setIsEditingGoals(true)}><span>⚙</span> Objetivos</button>
        </div>
      </header>

      <section className={styles.dayNavigation} aria-label="Cambiar día">
        <button type="button" aria-label="Día anterior" onClick={() => setSelectedDate((date) => addDays(date, -1))}>‹</button>
        <div><small>{selectedDate === getLocalDateKey() ? "Hoy" : "Diario"}</small><strong>{formatSelectedDate(selectedDate)}</strong></div>
        <button type="button" aria-label="Día siguiente" onClick={() => setSelectedDate((date) => addDays(date, 1))}>›</button>
      </section>

      <section className={styles.dailySummary} aria-label="Resumen nutricional del día">
        <div className={styles.calorieSummary}>
          <div className={styles.calorieRing} style={{ "--calorie-progress": `${Math.min(dayTotals.calories / state.goals.calories, 1) * 360}deg` } as React.CSSProperties}>
            <span><strong>{Math.round(dayTotals.calories)}</strong><small>de {state.goals.calories} kcal</small></span>
          </div>
          <div><small>Te quedan</small><strong>{Math.round(remainingCalories)} kcal</strong><p>{remainingCalories > 0 ? "Todavía hay espacio en tu plan." : "Llegaste a tu objetivo del día."}</p></div>
        </div>
        <div className={styles.dailyMacros}>
          {macroCards.map((macro) => {
            const current = dayTotals[macro.key];
            const goal = state.goals[macro.key];
            return (
              <div key={macro.key} className={styles.dailyMacro} data-tone={macro.tone}>
                <span>{macro.label}<b>{current} / {goal} g</b></span>
                <i><b style={{ width: `${Math.min(current / goal, 1) * 100}%` }} /></i>
              </div>
            );
          })}
        </div>
      </section>

      <div className={styles.diaryHeading}>
        <div><p className={styles.sectionEyebrow}>Registro rápido</p><h2>Comidas de hoy</h2></div>
        <span className={styles.savedStatus}><i />{isHydrated ? "Guardado en este dispositivo" : "Abriendo tu diario..."}</span>
      </div>

      <section className={styles.mealList} aria-label="Comidas registradas">
        {mealDefinitions.map((meal, index) => {
          const entries = day.meals[meal.key];
          const totals = entries.length > 0 ? sumMacros(entries) : emptyMacros();
          return (
            <article key={meal.key} className={styles.mealCard}>
              <header className={styles.mealHeader}>
                <span className={styles.mealNumber}>{String(index + 1).padStart(2, "0")}</span>
                <div><h3>{meal.label}</h3><p>{meal.time} · meta {state.goals.mealCalories[meal.key]} kcal</p></div>
                <strong>{totals.calories} kcal</strong>
              </header>
              <div className={styles.foodEntries}>
                {entries.length === 0 && <p className={styles.emptyMeal}>Nada registrado todavía. Agrégalo cuando lo comas.</p>}
                {entries.map((entry) => (
                  <div key={entry.id} className={styles.foodEntry}>
                    <span className={styles.foodDot} aria-hidden="true" />
                    <div><strong>{entry.food.name}</strong><small>{entry.grams} g · {entry.food.source}</small></div>
                    <span className={styles.entryMacros}>{entry.macros.calories} kcal <b>{entry.macros.protein} g P</b></span>
                    <button type="button" aria-label={`Eliminar ${entry.food.name}`} onClick={() => { removeFood(selectedDate, meal.key, entry.id); showToast(`${entry.food.name} se eliminó del diario.`); }}>×</button>
                  </div>
                ))}
              </div>
              <footer className={styles.mealFooter}>
                <span>P {totals.protein} g · C {totals.carbs} g · G {totals.fat} g</span>
                <button type="button" onClick={() => setAddingToMeal(meal.key)}>+ Agregar alimento</button>
              </footer>
            </article>
          );
        })}
      </section>

      <p className={styles.dataCredit}>Alimentos generales: colección inicial de NekoFit + búsqueda de USDA FoodData Central.</p>
      {addingToMeal && <FoodSearchDialog meal={addingToMeal} onClose={() => setAddingToMeal(null)} onAdd={(food, grams) => { addFood(selectedDate, addingToMeal, food, grams); setAddingToMeal(null); showToast(`${food.name} se agregó al diario.`); }} />}
      {isEditingGoals && <GoalsDialog goals={state.goals} onClose={() => setIsEditingGoals(false)} onSave={(goals) => { updateGoals(goals); setIsEditingGoals(false); showToast("Tus objetivos fueron actualizados."); }} />}
      {toast && <div className={styles.nutritionToast} role="status"><span>✓</span>{toast}</div>}
    </main>
  );
}

function FoodSearchDialog({ meal, onClose, onAdd }: { meal: MealKey; onClose: () => void; onAdd: (food: FoodItem, grams: number) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodItem[]>(commonFoods.slice(0, 8));
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [grams, setGrams] = useState(100);
  const [isSearching, setIsSearching] = useState(false);
  const mealName = mealDefinitions.find((definition) => definition.key === meal)?.label ?? "comida";

  useEffect(() => {
    let isCurrent = true;
    const timeout = window.setTimeout(() => {
      setIsSearching(true);
      searchFoods(query).then((foods) => { if (isCurrent) setResults(foods); }).finally(() => { if (isCurrent) setIsSearching(false); });
    }, 280);
    return () => { isCurrent = false; window.clearTimeout(timeout); };
  }, [query]);

  return (
    <div className={styles.dialogBackdrop} role="presentation" onPointerDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className={styles.foodDialog} role="dialog" aria-modal="true" aria-labelledby="food-search-title">
        <button type="button" className={styles.closeDialog} aria-label="Cerrar búsqueda" onClick={onClose}>×</button>
        <p className={styles.dialogEyebrow}>Agregar a {mealName}</p>
        <h2 id="food-search-title">¿Qué comiste?</h2>
        <label className={styles.foodSearchInput}><span className={styles.visuallyHidden}>Buscar alimento</span><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Escribe huevo, pollo, arroz..." /><b>{isSearching ? "···" : "⌕"}</b></label>
        <div className={styles.foodResults}>
          {results.map((food) => (
            <button key={food.id} type="button" className={selectedFood?.id === food.id ? styles.selectedFood : ""} onClick={() => { setSelectedFood(food); setGrams(food.servingGrams); }}>
              <span><strong>{food.name}</strong><small>{food.detail}</small></span>
              <span><b>{food.macrosPer100g.calories}</b> kcal<small>por 100 g</small></span>
              <i>{food.source}</i>
            </button>
          ))}
        </div>
        <footer className={styles.foodDialogFooter}>
          <label><span>Cantidad</span><input type="number" min="1" max="2000" value={grams} onChange={(event) => setGrams(Number(event.target.value))} /><b>g</b></label>
          <button type="button" disabled={!selectedFood || grams <= 0} onClick={() => { if (selectedFood) onAdd(selectedFood, grams); }}>Agregar al diario</button>
        </footer>
        <p className={styles.apiNote}>La búsqueda usa DEMO_KEY de USDA durante el aprendizaje. La clave personal se conectará después mediante un proxy seguro.</p>
      </section>
    </div>
  );
}

function GoalsDialog({ goals, onClose, onSave }: { goals: NutritionGoals; onClose: () => void; onSave: (goals: NutritionGoals) => void }) {
  const [draft, setDraft] = useState(goals);
  const labels = { calories: "Calorías", protein: "Proteína", carbs: "Carbohidratos", fat: "Grasas", fiber: "Fibra" };
  function updateMacro(key: keyof typeof labels, value: number) { setDraft((current) => ({ ...current, [key]: value })); }
  function updateMeal(key: MealKey, value: number) { setDraft((current) => ({ ...current, mealCalories: { ...current.mealCalories, [key]: value } })); }
  return (
    <div className={styles.dialogBackdrop} role="presentation" onPointerDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className={styles.goalsDialog} role="dialog" aria-modal="true" aria-labelledby="goals-title">
        <button type="button" className={styles.closeDialog} aria-label="Cerrar objetivos" onClick={onClose}>×</button>
        <p className={styles.dialogEyebrow}>Configuración personal</p>
        <h2 id="goals-title">Tus objetivos</h2>
        <div className={styles.goalFields}>
          {(Object.keys(labels) as Array<keyof typeof labels>).map((key) => <label key={key}><span>{labels[key]}</span><input type="number" min="0" value={draft[key]} onChange={(event) => updateMacro(key, Number(event.target.value))} /><b>{key === "calories" ? "kcal" : "g"}</b></label>)}
        </div>
        <h3>Calorías por tiempo</h3>
        <div className={styles.mealGoalFields}>{mealDefinitions.map((meal) => <label key={meal.key}><span>{meal.label}</span><input type="number" min="0" value={draft.mealCalories[meal.key]} onChange={(event) => updateMeal(meal.key, Number(event.target.value))} /></label>)}</div>
        <button type="button" className={styles.saveGoalsButton} onClick={() => onSave(draft)}>Guardar objetivos</button>
      </section>
    </div>
  );
}
