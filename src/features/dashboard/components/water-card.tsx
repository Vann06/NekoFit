import Link from "next/link";

import styles from "../dashboard.module.css";

type WaterCardProps = {
  current: number;
  goal: number;
  onChange: (value: number) => void;
};

export function WaterCard({ current, goal, onChange }: WaterCardProps) {
  const remaining = Math.max(goal - current, 0);

  return (
    <article className={`${styles.metricCard} ${styles.waterCard}`}>
      <span className={styles.metricLabel}>Agua</span>
      <span className={styles.metricValue}>{current}/{goal} <small>vasos</small></span>
      <span className={styles.waterGlasses} aria-label={`${current} de ${goal} vasos`}>
        {Array.from({ length: goal }, (_, index) => (
          <button
            key={index}
            type="button"
            className={index < current ? styles.glassFilled : undefined}
            aria-label={`Registrar ${index + 1} vasos de agua`}
            onClick={() => onChange(index + 1)}
          />
        ))}
      </span>
      <span className={styles.waterActions}>
        <button type="button" onClick={() => onChange(current - 1)} aria-label="Quitar un vaso">−</button>
        <span>{remaining > 0 ? `${remaining} vasos para tu meta` : "Meta de agua completa"}</span>
        <button type="button" onClick={() => onChange(current + 1)} aria-label="Agregar un vaso">+</button>
      </span>
      <Link href="/nutrition">Ver alimentación →</Link>
    </article>
  );
}
