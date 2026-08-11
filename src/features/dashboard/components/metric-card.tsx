import Link from "next/link";
import type { ReactNode } from "react";

import styles from "../dashboard.module.css";

type MetricCardProps = {
  href: string;
  label: string;
  value: string;
  unit?: string;
  description: string;
  children: ReactNode;
  variant?: "water" | "steps";
};

export function MetricCard({
  href,
  label,
  value,
  unit,
  description,
  children,
  variant,
}: MetricCardProps) {
  const variantClass = variant === "water" ? styles.waterCard : variant === "steps" ? styles.stepsCard : "";

  return (
    <Link href={href} className={`${styles.metricCard} ${variantClass}`}>
      <span className={styles.metricLabel}>{label}</span>
      <span className={styles.metricValue}>
        {value} {unit && <small>{unit}</small>}
      </span>
      <span className={styles.metricVisual} aria-hidden="true">
        {children}
      </span>
      <span className={styles.metricDescription}>{description}</span>
    </Link>
  );
}
