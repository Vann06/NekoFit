import Link from "next/link";

import styles from "../nutrition.module.css";

export function NutritionTabs({ active }: { active: "diary" | "planner" }) {
  return (
    <nav className={styles.nutritionTabs} aria-label="Vistas de alimentación">
      <Link href="/nutrition/" className={active === "diary" ? styles.activeTab : ""} aria-current={active === "diary" ? "page" : undefined}>Diario</Link>
      <Link href="/meal-planner/" className={active === "planner" ? styles.activeTab : ""} aria-current={active === "planner" ? "page" : undefined}>Plan semanal</Link>
    </nav>
  );
}
