import { CalorieCatCard } from "./calorie-cat-card";
import { MacroCard } from "./macro-card";
import { MetricCard } from "./metric-card";
import { PawIcon } from "./paw-icon";
import { todaySummary } from "../data/today-summary";
import styles from "../dashboard.module.css";

export function DashboardView() {
  const { calories, macros, water, steps } = todaySummary;

  return (
    <main className={styles.dashboard}>
      <header className={styles.dashboardHeader}>
        <div>
          <p className={styles.dashboardEyebrow}>Resumen diario</p>
          <h1>Tu día en equilibrio</h1>
        </div>
        <p>Lo importante de hoy, sin llenar formularios complicados.</p>
      </header>

      <section className={styles.dashboardGrid} aria-label="Métricas de hoy">
        <CalorieCatCard consumed={calories.consumed} goal={calories.goal} />

        <MacroCard macros={macros} />

        <MetricCard
          href="/nutrition"
          label="Agua"
          value={`${water.current}/${water.goal}`}
          unit="vasos"
          description={`${water.goal - water.current} vasos para tu meta`}
          variant="water"
        >
          <span className={styles.waterGlasses}>
            {Array.from({ length: water.goal }, (_, index) => (
              <i key={index} className={index < water.current ? styles.glassFilled : undefined} />
            ))}
          </span>
        </MetricCard>

        <MetricCard
          href="/progress"
          label="Pasos"
          value={steps.current.toLocaleString("es-GT")}
          description={`${steps.current.toLocaleString("es-GT")} de ${steps.goal.toLocaleString("es-GT")} pasos`}
          variant="steps"
        >
          <span className={styles.pawSteps}>
            {Array.from({ length: 5 }, (_, index) => (
              <PawIcon key={index} active={index < Math.ceil((steps.current / steps.goal) * 5)} />
            ))}
          </span>
        </MetricCard>
      </section>
    </main>
  );
}
