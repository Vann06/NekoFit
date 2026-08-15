import type { LoggedFood } from "../types/nutrition";
import { sumMacros } from "../utils/nutrition-calculations";
import styles from "../nutrition.module.css";

type MealDetailsDialogProps = {
  mealLabel: string;
  calorieGoal: number;
  entries: LoggedFood[];
  onClose: () => void;
  onRemove?: (entryId: string) => void;
};

export function MealDetailsDialog({ mealLabel, calorieGoal, entries, onClose, onRemove }: MealDetailsDialogProps) {
  const totals = sumMacros(entries);
  const macroCalories = totals.protein * 4 + totals.carbs * 4 + totals.fat * 9;
  const proteinShare = macroCalories > 0 ? (totals.protein * 4 / macroCalories) * 100 : 0;
  const carbsShare = macroCalories > 0 ? (totals.carbs * 4 / macroCalories) * 100 : 0;
  const macros = [
    { label: "Proteína", current: totals.protein, tone: "protein" },
    { label: "Carbohidratos", current: totals.carbs, tone: "carbs" },
    { label: "Grasas", current: totals.fat, tone: "fat" },
  ];

  return (
    <div className={styles.dialogBackdrop} role="presentation" onPointerDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className={styles.mealDetailsDialog} role="dialog" aria-modal="true" aria-labelledby="meal-details-title">
        <button type="button" className={styles.closeDialog} aria-label="Cerrar detalle" onClick={onClose}>×</button>
        <p className={styles.dialogEyebrow}>Resumen de la comida</p>
        <h2 id="meal-details-title">{mealLabel}</h2>

        <div className={styles.mealDetailSummary}>
          <div
            className={styles.mealMacroPie}
            data-empty={macroCalories === 0}
            style={{
              "--protein-share": `${proteinShare}%`,
              "--carbs-share": `${proteinShare + carbsShare}%`,
            } as React.CSSProperties}
          >
            <span><strong>{totals.calories}</strong><small>de {calorieGoal} kcal</small></span>
          </div>
          <div className={styles.mealMacroLegend}>
            {macros.map((macro) => (
              <div key={macro.label} data-tone={macro.tone}>
                <i aria-hidden="true" />
                <span>{macro.label}</span>
                <strong>{macro.current} g</strong>
              </div>
            ))}
            <div className={styles.mealFiber}><span>Fibra</span><strong>{totals.fiber} g</strong></div>
          </div>
        </div>

        <section className={styles.mealFoodList} aria-label={`Alimentos de ${mealLabel}`}>
          <h3>Alimentos registrados</h3>
          {entries.length === 0 && <p>Todavía no hay alimentos en esta comida.</p>}
          {entries.map((entry) => (
            <article key={entry.id}>
              <span><strong>{entry.food.name}</strong><small>{entry.amount && entry.measureLabel ? `${entry.amount} ${entry.measureLabel} · ` : ""}{Math.round(entry.grams)} g</small></span>
              <b>{entry.macros.calories} kcal</b>
              {onRemove && <button type="button" aria-label={`Eliminar ${entry.food.name}`} onClick={() => onRemove(entry.id)}>×</button>}
            </article>
          ))}
        </section>
      </section>
    </div>
  );
}
