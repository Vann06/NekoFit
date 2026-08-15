import Link from "next/link";

import styles from "../dashboard.module.css";

type CalorieCatCardProps = {
  consumed: number;
  goal: number;
};

const catOutline =
  "M120 181 C74 181 39 166 31 130 C26 109 33 88 52 70 L43 29 Q42 22 49 26 L83 50 C96 43 107 40 120 40 C133 40 144 43 157 50 L191 26 Q198 22 197 30 L188 70 C207 88 214 109 209 130 C201 166 166 181 120 181 Z";

export function CalorieCatCard({ consumed, goal }: CalorieCatCardProps) {
  const percentage = Math.min(Math.round((consumed / goal) * 100), 100);
  const remaining = Math.max(goal - consumed, 0);

  return (
    <Link href="/nutrition" className={styles.calorieCard}>
      <div className={styles.calorieCopy}>
        <p className={styles.cardEyebrow}>Energía de hoy</p>
        <h2>Calorías</h2>
        <p className={styles.calorieNumber}>{goal.toLocaleString("es-GT")} <span>kcal de meta diaria</span></p>
      </div>

      <div className={styles.catProgress}>
        <svg viewBox="0 0 240 200" role="img" aria-label={`${percentage}% de la meta de calorías`}>
          <path className={styles.catTrack} d={catOutline} pathLength="100" />
          <path
            className={styles.catLine}
            d={catOutline}
            pathLength="100"
            strokeDasharray={`${percentage} 100`}
          />
        </svg>
        <span className={styles.catCalories}>
          <strong>{consumed.toLocaleString("es-GT")}</strong>
          <small>kcal consumidas</small>
          <b>{remaining.toLocaleString("es-GT")} restantes</b>
        </span>
      </div>
    </Link>
  );
}
