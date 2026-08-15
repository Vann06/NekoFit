"use client";

import { useEffect, useMemo, useState } from "react";

import { commonFoods } from "../data/food-catalog";
import { mealDefinitions } from "../data/meal-definitions";
import { useNutritionState } from "../hooks/use-nutrition-state";
import { addDays, createEmptyDiaryDay, getLocalDateKey } from "../repositories/nutrition-repository";
import { searchFoods } from "../services/usda-food-service";
import type { FoodItem, FoodMeasure, MealKey, NutritionGoals } from "../types/nutrition";
import { emptyMacros, sumMacros } from "../utils/nutrition-calculations";
import styles from "../nutrition.module.css";
import { MealDetailsDialog } from "./meal-details-dialog";
import { NutritionTabs } from "./nutrition-tabs";

const macroCards: Array<{ key: "protein" | "carbs" | "fat"; label: string; tone: string }> = [
  { key: "protein", label: "Proteína", tone: "protein" },
  { key: "carbs", label: "Carbohidratos", tone: "carbs" },
  { key: "fat", label: "Grasas", tone: "fat" },
];

function getFoodMeasures(food: FoodItem): FoodMeasure[] {
  const measures: FoodMeasure[] = [
    { id: "default-serving", label: food.servingLabel, grams: food.servingGrams },
    { id: "grams", label: "gramos", grams: 1 },
    { id: "ounces", label: "onza (oz)", grams: 28.3495 },
    ...(food.measures ?? []),
  ];

  return measures.filter((measure, index, allMeasures) => (
    measure.grams > 0
    && allMeasures.findIndex((candidate) => candidate.label === measure.label && Math.abs(candidate.grams - measure.grams) < 0.01) === index
  ));
}

function formatSelectedDate(dateKey: string) {
  return new Intl.DateTimeFormat("es-GT", { weekday: "long", day: "numeric", month: "long" }).format(new Date(`${dateKey}T12:00:00`));
}

export function NutritionDiary() {
  const { state, isHydrated, addFood, removeFood, updateGoals } = useNutritionState();
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateKey());
  const [addingToMeal, setAddingToMeal] = useState<MealKey | null>(null);
  const [detailMeal, setDetailMeal] = useState<MealKey | null>(null);
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const day = state.diaryDays[selectedDate] ?? createEmptyDiaryDay(selectedDate);
  const dayTotals = useMemo(() => sumMacros(Object.values(day.meals).flat()), [day.meals]);
  const remainingCalories = Math.max(state.goals.calories - dayTotals.calories, 0);
  const macroCalories = dayTotals.protein * 4 + dayTotals.carbs * 4 + dayTotals.fat * 9;
  const proteinShare = macroCalories > 0 ? (dayTotals.protein * 4 / macroCalories) * 100 : 33.33;
  const carbsShare = macroCalories > 0 ? (dayTotals.carbs * 4 / macroCalories) * 100 : 33.33;

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }

  return (
    <main className={styles.nutritionPage}>
      <header className={styles.nutritionIntro} data-page-title>
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
          <div
            className={styles.macroPie}
            style={{
              "--protein-share": `${proteinShare}%`,
              "--carbs-share": `${proteinShare + carbsShare}%`,
            } as React.CSSProperties}
            aria-label="Distribución de macronutrientes consumidos"
          >
            <span><strong>{Math.round(dayTotals.calories)}</strong><small>kcal</small></span>
          </div>
          <div className={styles.macroLegend}>
            {macroCards.map((macro) => {
              const current = dayTotals[macro.key];
              const goal = state.goals[macro.key];
              const percentage = goal > 0 ? Math.min(Math.round((current / goal) * 100), 100) : 0;
              return (
                <div key={macro.key} className={styles.macroLegendItem} data-tone={macro.tone}>
                  <i aria-hidden="true" />
                  <span><strong>{macro.label}</strong><small>{current} de {goal} g</small></span>
                  <b>{percentage}%</b>
                </div>
              );
            })}
            <div className={styles.fiberSummary}>
              <span>Fibra</span><strong>{dayTotals.fiber} de {state.goals.fiber} g</strong>
            </div>
          </div>
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
              <button type="button" className={styles.mealOverview} onClick={() => setDetailMeal(meal.key)}>
                <span>{entries.length === 0 ? "Nada registrado todavía" : `${entries.length} ${entries.length === 1 ? "alimento registrado" : "alimentos registrados"}`}</span>
                <strong>{totals.calories} kcal</strong>
                <b>Ver detalle ›</b>
              </button>
              <footer className={styles.mealFooter}>
                <span>{totals.calories} kcal en esta comida</span>
                <button type="button" className={styles.addFoodButton} aria-label={`Agregar alimento a ${meal.label}`} title="Agregar alimento" onClick={() => setAddingToMeal(meal.key)}>+</button>
              </footer>
            </article>
          );
        })}
      </section>

      <p className={styles.dataCredit}>Alimentos generales: colección inicial de NekoFit + búsqueda de USDA FoodData Central.</p>
      {addingToMeal && <FoodSearchDialog meal={addingToMeal} onClose={() => setAddingToMeal(null)} onAdd={(food, grams, amount, measureLabel) => { addFood(selectedDate, addingToMeal, food, grams, amount, measureLabel); setAddingToMeal(null); showToast(`${food.name} se agregó al diario.`); }} />}
      {detailMeal && <MealDetailsDialog mealLabel={mealDefinitions.find((meal) => meal.key === detailMeal)?.label ?? "Comida"} calorieGoal={state.goals.mealCalories[detailMeal]} entries={day.meals[detailMeal]} onClose={() => setDetailMeal(null)} onRemove={(entryId) => { removeFood(selectedDate, detailMeal, entryId); showToast("El alimento se eliminó del diario."); }} />}
      {isEditingGoals && <GoalsDialog goals={state.goals} onClose={() => setIsEditingGoals(false)} onSave={(goals) => { updateGoals(goals); setIsEditingGoals(false); showToast("Tus objetivos fueron actualizados."); }} />}
      {toast && <div className={styles.nutritionToast} role="status"><span>✓</span>{toast}</div>}
    </main>
  );
}

export function FoodSearchDialog({ meal, onClose, onAdd }: { meal: MealKey; onClose: () => void; onAdd: (food: FoodItem, grams: number, amount: number, measureLabel: string) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodItem[]>(commonFoods.slice(0, 8));
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [amount, setAmount] = useState(1);
  const [measureId, setMeasureId] = useState("default-serving");
  const [isSearching, setIsSearching] = useState(false);
  const mealName = mealDefinitions.find((definition) => definition.key === meal)?.label ?? "comida";
  const measures = selectedFood ? getFoodMeasures(selectedFood) : [];
  const selectedMeasure = measures.find((measure) => measure.id === measureId) ?? measures[0];
  const grams = selectedMeasure ? Math.round(amount * selectedMeasure.grams * 10) / 10 : 0;

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
            <button key={food.id} type="button" className={selectedFood?.id === food.id ? styles.selectedFood : ""} onClick={() => { setSelectedFood(food); setAmount(1); setMeasureId("default-serving"); }}>
              <span><strong>{food.name}</strong><small>{food.detail}</small></span>
              <span><b>{food.macrosPer100g.calories}</b> kcal<small>por 100 g</small></span>
              <i>{food.source}</i>
            </button>
          ))}
        </div>
        <footer className={styles.foodDialogFooter}>
          <div className={styles.quantityControls}>
            <label><span>Cantidad</span><input type="number" min="0.1" max="2000" step="0.1" value={amount} onChange={(event) => setAmount(Number(event.target.value))} /></label>
            <label><span>Medida</span><select value={measureId} onChange={(event) => setMeasureId(event.target.value)} disabled={!selectedFood}>{measures.map((measure) => <option key={`${measure.id}-${measure.label}`} value={measure.id}>{measure.label}</option>)}</select></label>
            {selectedFood && <small>= {grams} g</small>}
          </div>
          <button type="button" disabled={!selectedFood || grams <= 0} onClick={() => { if (selectedFood && selectedMeasure) onAdd(selectedFood, grams, amount, selectedMeasure.label); }}>Agregar al diario</button>
        </footer>
        <p className={styles.apiNote}>USDA aporta alimentos, macros y medidas disponibles. NekoFit convierte automáticamente tazas, porciones y onzas a gramos.</p>
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
        <label className={styles.waterGoalField}><span>Meta de agua</span><input type="number" min="1" max="30" value={draft.waterGlasses} onChange={(event) => setDraft((current) => ({ ...current, waterGlasses: Number(event.target.value) }))} /><b>vasos</b></label>
        <h3>Calorías por tiempo</h3>
        <div className={styles.mealGoalFields}>{mealDefinitions.map((meal) => <label key={meal.key}><span>{meal.label}</span><input type="number" min="0" value={draft.mealCalories[meal.key]} onChange={(event) => updateMeal(meal.key, Number(event.target.value))} /></label>)}</div>
        <button type="button" className={styles.saveGoalsButton} onClick={() => onSave(draft)}>Guardar objetivos</button>
      </section>
    </div>
  );
}
