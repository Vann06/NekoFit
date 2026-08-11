import Link from "next/link";

import type { MacroSummary } from "../types/dashboard-summary";
import styles from "../dashboard.module.css";

type MacroCardProps = {
  macros: MacroSummary[];
};

export function MacroCard({ macros }: MacroCardProps) {
  return (
    <Link href="/nutrition" className={styles.macroCard}>
      <span className={styles.metricLabel}>Macronutrientes</span>
      <span className={styles.macroList}>
        {macros.map((macro) => {
          const percentage = Math.min((macro.current / macro.goal) * 100, 100);

          return (
            <span className={styles.macroRow} key={macro.label}>
              <span className={styles.macroHeading}>
                <strong>{macro.label}</strong>
                <span>
                  {macro.current}{macro.unit} / {macro.goal}{macro.unit}
                </span>
              </span>
              <span className={styles.macroTrack}>
                <i
                  className={styles[macro.tone]}
                  style={{ width: `${percentage}%` }}
                />
              </span>
            </span>
          );
        })}
      </span>
      <span className={styles.metricDescription}>Resumen completo de tu meta diaria</span>
    </Link>
  );
}
