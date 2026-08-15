import Link from "next/link";

import type { MacroSummary } from "../types/dashboard-summary";
import styles from "../dashboard.module.css";

type MacroCardProps = {
  macros: MacroSummary[];
};

export function MacroCard({ macros }: MacroCardProps) {
  const macroCalories = macros.reduce((total, macro) => total + macro.current * (macro.tone === "fat" ? 9 : 4), 0);
  const proteinShare = macroCalories > 0 ? ((macros.find((macro) => macro.tone === "protein")?.current ?? 0) * 4 / macroCalories) * 100 : 33.33;
  const carbsShare = macroCalories > 0 ? ((macros.find((macro) => macro.tone === "carbs")?.current ?? 0) * 4 / macroCalories) * 100 : 33.33;

  return (
    <Link href="/nutrition" className={styles.macroCard}>
      <span className={styles.metricLabel}>Macronutrientes</span>
      <span className={styles.dashboardMacroLayout}>
        <span
          className={styles.dashboardMacroPie}
          style={{
            "--protein-share": `${proteinShare}%`,
            "--carbs-share": `${proteinShare + carbsShare}%`,
          } as React.CSSProperties}
          aria-hidden="true"
        />
        <span className={styles.macroList}>
        {macros.map((macro) => {
          const percentage = Math.min((macro.current / macro.goal) * 100, 100);

          return (
            <span className={styles.macroRow} key={macro.label}>
              <span className={styles.macroHeading}>
                <strong>{macro.label}</strong>
                <span>{macro.current}{macro.unit} / {macro.goal}{macro.unit} · {Math.round(percentage)}%</span>
              </span>
              <span className={styles.macroTrack}><i className={styles[macro.tone]} style={{ width: `${percentage}%` }} /></span>
            </span>
          );
        })}
        </span>
      </span>
    </Link>
  );
}
