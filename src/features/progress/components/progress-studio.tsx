"use client";

import { type FormEvent, useMemo, useState } from "react";

import { getLocalDateKey } from "../../nutrition/repositories/nutrition-repository";
import { useProgressEntries } from "../hooks/use-progress-entries";
import type { BodyMeasurements, ProgressEntry } from "../types/progress-entry";
import styles from "../progress.module.css";

type ProgressForm = {
  date: string;
  weightKg: string;
  bodyFatPercentage: string;
  muscleMassKg: string;
  bodyWaterPercentage: string;
  waistCm: string;
  hipsCm: string;
  chestCm: string;
  thighCm: string;
  armCm: string;
};

const emptyForm = (): ProgressForm => ({
  date: getLocalDateKey(),
  weightKg: "",
  bodyFatPercentage: "",
  muscleMassKg: "",
  bodyWaterPercentage: "",
  waistCm: "",
  hipsCm: "",
  chestCm: "",
  thighCm: "",
  armCm: "",
});

const mainFields = [
  { key: "weightKg", label: "Peso", unit: "kg", step: "0.1" },
  { key: "bodyFatPercentage", label: "Grasa corporal", unit: "%", step: "0.1" },
  { key: "muscleMassKg", label: "Masa muscular", unit: "kg", step: "0.1" },
  { key: "bodyWaterPercentage", label: "Agua corporal", unit: "%", step: "0.1" },
] as const;

const measurementFields = [
  { key: "waistCm", label: "Cintura" },
  { key: "hipsCm", label: "Cadera" },
  { key: "chestCm", label: "Pecho" },
  { key: "thighCm", label: "Muslo" },
  { key: "armCm", label: "Brazo" },
] as const;

function optionalNumber(value: string) {
  const parsed = Number(value);
  return value.trim() !== "" && Number.isFinite(parsed) ? parsed : undefined;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-GT", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${date}T12:00:00`));
}

export function ProgressStudio() {
  const { entries, isHydrated, addEntry, removeEntry } = useProgressEntries();
  const [form, setForm] = useState<ProgressForm>(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const latest = entries[0];
  const previous = entries[1];
  const weightChange = useMemo(() => latest?.weightKg != null && previous?.weightKg != null
    ? Math.round((latest.weightKg - previous.weightKg) * 10) / 10
    : null, [latest, previous]);

  function updateField(key: keyof ProgressForm, value: string) {
    setForm((currentForm) => ({ ...currentForm, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const measurements: BodyMeasurements = {
      waistCm: optionalNumber(form.waistCm),
      hipsCm: optionalNumber(form.hipsCm),
      chestCm: optionalNumber(form.chestCm),
      thighCm: optionalNumber(form.thighCm),
      armCm: optionalNumber(form.armCm),
    };
    const entry: ProgressEntry = {
      id: crypto.randomUUID(),
      date: form.date,
      weightKg: optionalNumber(form.weightKg),
      bodyFatPercentage: optionalNumber(form.bodyFatPercentage),
      muscleMassKg: optionalNumber(form.muscleMassKg),
      bodyWaterPercentage: optionalNumber(form.bodyWaterPercentage),
      measurements,
      createdAt: new Date().toISOString(),
    };
    const hasValue = [entry.weightKg, entry.bodyFatPercentage, entry.muscleMassKg, entry.bodyWaterPercentage, ...Object.values(measurements)].some((value) => value != null);
    if (!hasValue) { setMessage("Agrega por lo menos una medición."); return; }
    await addEntry(entry);
    setForm(emptyForm());
    setMessage("Medición guardada para comparar tu tendencia ✦");
    window.setTimeout(() => setMessage(null), 2600);
  }

  return (
    <main className={styles.progressPage}>
      <header className={styles.progressIntro} data-page-title>
        <p>Tu cuerpo cambia poco a poco</p>
        <h1>Progreso</h1>
      </header>

      <section className={styles.progressLayout}>
        <form className={styles.measurementForm} onSubmit={submit}>
          <header><span>01</span><div><small>Registro corporal</small><h2>Nueva medición</h2></div></header>
          <label className={styles.dateField}>Fecha<input type="date" value={form.date} max={getLocalDateKey()} onChange={(event) => updateField("date", event.target.value)} required /></label>

          <div className={styles.mainMeasurements}>
            {mainFields.map((field) => (
              <label key={field.key}><span>{field.label}<small>{field.unit}</small></span><input type="number" inputMode="decimal" min="0" step={field.step} value={form[field.key]} onChange={(event) => updateField(field.key, event.target.value)} placeholder="—" /></label>
            ))}
          </div>

          <details className={styles.extraMeasurements}>
            <summary>Medidas opcionales <span>+</span></summary>
            <div>{measurementFields.map((field) => (
              <label key={field.key}><span>{field.label}<small>cm</small></span><input type="number" inputMode="decimal" min="0" step="0.1" value={form[field.key]} onChange={(event) => updateField(field.key, event.target.value)} placeholder="—" /></label>
            ))}</div>
          </details>

          <button type="submit" className={styles.saveMeasurement}>Guardar medición</button>
        </form>

        <aside className={styles.progressSummary}>
          <span className={styles.summarySticker}>Tendencia, no perfección</span>
          <h2>Tu último registro</h2>
          {latest ? (
            <>
              <time dateTime={latest.date}>{formatDate(latest.date)}</time>
              <div className={styles.latestMetrics}>
                <Metric label="Peso" value={latest.weightKg} unit="kg" />
                <Metric label="Grasa" value={latest.bodyFatPercentage} unit="%" />
                <Metric label="Músculo" value={latest.muscleMassKg} unit="kg" />
                <Metric label="Agua" value={latest.bodyWaterPercentage} unit="%" />
              </div>
              {weightChange != null && <p className={styles.changeNote}>Cambio desde el registro anterior: <strong>{weightChange > 0 ? "+" : ""}{weightChange} kg</strong></p>}
            </>
          ) : <p className={styles.emptySummary}>Tu primera medición aparecerá aquí.</p>}
        </aside>
      </section>

      <section className={styles.historySection} aria-label="Historial de progreso">
        <header><div><small>02</small><h2>Historial</h2></div><span>{entries.length} registros</span></header>
        {!isHydrated ? <p className={styles.emptyHistory}>Cargando tus mediciones…</p> : entries.length === 0 ? <p className={styles.emptyHistory}>Todavía no hay mediciones. Empieza con los datos que tengas hoy.</p> : (
          <div className={styles.historyList}>{entries.map((entry) => (
            <article key={entry.id}>
              <time dateTime={entry.date}>{formatDate(entry.date)}</time>
              <span>{entry.weightKg != null ? `${entry.weightKg} kg` : "Peso —"}</span>
              <span>{entry.bodyFatPercentage != null ? `${entry.bodyFatPercentage}% grasa` : "Grasa —"}</span>
              <span>{entry.muscleMassKg != null ? `${entry.muscleMassKg} kg músculo` : "Músculo —"}</span>
              <button type="button" aria-label={`Eliminar medición del ${formatDate(entry.date)}`} onClick={() => { void removeEntry(entry.id); setMessage("Medición eliminada"); }}>×</button>
            </article>
          ))}</div>
        )}
      </section>

      {message && <div className={styles.progressToast} role="status">{message}</div>}
    </main>
  );
}

function Metric({ label, value, unit }: { label: string; value?: number; unit: string }) {
  return <div><small>{label}</small><strong>{value != null ? value : "—"}<span>{value != null ? unit : ""}</span></strong></div>;
}
