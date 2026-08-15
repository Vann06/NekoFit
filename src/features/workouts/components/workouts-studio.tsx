"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { cardioMachines, workoutBlockDefinitions, workoutCategories } from "../data/workout-options";
import { useWorkoutsState } from "../hooks/use-workouts-state";
import { searchExercises } from "../services/workoutx-exercise-service";
import type { ExerciseCatalogItem, WorkoutBlockKey, WorkoutExercise, WorkoutPlan } from "../types/workout";
import styles from "../workouts.module.css";

type Toast = { id: number; message: string; tone: "success" | "info" };

function categoryLabel(workout: WorkoutPlan) {
  return workoutCategories.find((category) => category.value === workout.category)?.label ?? "Personalizado";
}

function ExerciseVisual({ exercise }: { exercise: ExerciseCatalogItem }) {
  if (exercise.videoUrl) {
    return (
      <video className={styles.exerciseMedia} muted loop playsInline autoPlay poster={exercise.imageUrl} aria-label={`Demostración de ${exercise.name}`}>
        <source src={exercise.videoUrl} />
      </video>
    );
  }

  if (exercise.imageUrl) {
    return (
      // WorkoutX entrega URLs dinámicas de GIF; por eso aquí usamos un img convencional.
      // eslint-disable-next-line @next/next/no-img-element
      <img className={styles.exerciseMedia} src={exercise.imageUrl} alt={`Demostración de ${exercise.name}`} loading="lazy" />
    );
  }

  return (
    <div className={styles.exerciseFallback} aria-hidden="true">
      <svg viewBox="0 0 160 160" role="presentation">
        <path d="M51 38c-9 8-15 22-15 38 0 30 19 48 44 48s44-18 44-48c0-16-6-30-15-38" />
        <circle cx="80" cy="32" r="15" />
        <path d="M47 69h66M58 124l-10 22M102 124l10 22M28 68v20M20 73v10M132 68v20M140 73v10" />
      </svg>
    </div>
  );
}

type ExerciseGuideCardProps = {
  entry: WorkoutExercise;
  index: number;
  total: number;
  editing: boolean;
  onUpdate: (changes: Partial<WorkoutExercise>) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
};

function ExerciseGuideCard({ entry, index, total, editing, onUpdate, onRemove, onMove }: ExerciseGuideCardProps) {
  return (
    <article className={styles.exerciseCard}>
      <div className={styles.visualFrame}>
        <ExerciseVisual exercise={entry.exercise} />
        {editing && (
          <div className={styles.cardActions}>
            <button type="button" disabled={index === 0} onClick={() => onMove(-1)} aria-label={`Mover ${entry.exercise.name} hacia atrás`}>‹</button>
            <button type="button" disabled={index === total - 1} onClick={() => onMove(1)} aria-label={`Mover ${entry.exercise.name} hacia adelante`}>›</button>
            <button type="button" onClick={onRemove} aria-label={`Quitar ${entry.exercise.name}`}>×</button>
          </div>
        )}
      </div>

      <div className={styles.exerciseDetails}>
        <h3>{entry.exercise.name}</h3>
        {!editing ? (
          <p>{entry.sets} series × {entry.reps}{entry.weightKg > 0 ? ` · ${entry.weightKg} kg` : ""}</p>
        ) : (
          <div className={styles.exerciseInputs}>
            <label>Series<input type="number" min="1" value={entry.sets} onChange={(event) => onUpdate({ sets: Number(event.target.value) })} /></label>
            <label>Reps<input value={entry.reps} onChange={(event) => onUpdate({ reps: event.target.value })} /></label>
            <label>Peso<input type="number" min="0" step="0.5" value={entry.weightKg} onChange={(event) => onUpdate({ weightKg: Number(event.target.value) })} /></label>
          </div>
        )}
      </div>
    </article>
  );
}

type GuideBlockProps = {
  workout: WorkoutPlan;
  block: WorkoutBlockKey;
  editing: boolean;
  onOpenCatalog: (block: WorkoutBlockKey) => void;
  onUpdateExercise: (block: WorkoutBlockKey, entryId: string, changes: Partial<WorkoutExercise>) => void;
  onRemoveExercise: (block: WorkoutBlockKey, entryId: string) => void;
  onMoveExercise: (block: WorkoutBlockKey, entryId: string, direction: -1 | 1) => void;
  onToggleCore: (enabled: boolean) => void;
};

function GuideBlock({ workout, block, editing, onOpenCatalog, onUpdateExercise, onRemoveExercise, onMoveExercise, onToggleCore }: GuideBlockProps) {
  const definition = workoutBlockDefinitions.find((item) => item.key === block);
  if (!definition) return null;

  const isCore = block === "core";
  const enabled = !isCore || workout.coreEnabled;
  const entries = workout.blocks[block];

  if (!enabled && !editing) return null;

  return (
    <section className={`${styles.guideBlock} ${styles[`block${definition.color}`]}`}>
      <header className={styles.blockHeader}>
        <span>{definition.shortLabel}</span>
        <div><h2>{definition.label}</h2><p>{definition.description}</p></div>
        {editing && enabled && <button type="button" onClick={() => onOpenCatalog(block)} aria-label={`Agregar ejercicio a ${definition.label}`}>＋</button>}
      </header>

      {!enabled ? (
        <button type="button" className={styles.emptyBlock} onClick={() => onToggleCore(true)}>＋ Agregar core</button>
      ) : (
        <>
          {isCore && editing && <button type="button" className={styles.removeBlock} onClick={() => onToggleCore(false)}>Quitar bloque de core</button>}
          <div className={styles.exerciseRow}>
            {entries.map((entry, index) => (
              <ExerciseGuideCard
                key={entry.id}
                entry={entry}
                index={index}
                total={entries.length}
                editing={editing}
                onUpdate={(changes) => onUpdateExercise(block, entry.id, changes)}
                onRemove={() => onRemoveExercise(block, entry.id)}
                onMove={(direction) => onMoveExercise(block, entry.id, direction)}
              />
            ))}
            {entries.length === 0 && <button type="button" className={styles.emptyBlock} disabled={!editing} onClick={() => onOpenCatalog(block)}>{editing ? "＋ Agregar ejercicio" : "Sin ejercicios"}</button>}
          </div>
        </>
      )}
    </section>
  );
}

function CardioGuide({ workout, editing, onUpdate }: { workout: WorkoutPlan; editing: boolean; onUpdate: (changes: Partial<WorkoutPlan["cardio"]>) => void }) {
  const machine = cardioMachines.find((item) => item.value === workout.cardio.machine);
  if (!workout.cardio.enabled && !editing) return null;

  return (
    <section className={`${styles.guideBlock} ${styles.blockcardio}`}>
      <header className={styles.blockHeader}>
        <span>04</span>
        <div><h2>Cardio</h2><p>Final opcional</p></div>
        {editing && workout.cardio.enabled && <button type="button" onClick={() => onUpdate({ enabled: false })} aria-label="Quitar cardio">×</button>}
      </header>

      {!workout.cardio.enabled ? (
        <button type="button" className={styles.emptyBlock} onClick={() => onUpdate({ enabled: true })}>＋ Agregar cardio</button>
      ) : (
        <article className={styles.cardioCard}>
          <span className={styles.cardioIcon}>{machine?.icon}</span>
          <div>
            {editing ? (
              <select value={workout.cardio.machine} onChange={(event) => onUpdate({ machine: event.target.value as WorkoutPlan["cardio"]["machine"] })}>
                {cardioMachines.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            ) : <h3>{machine?.label}</h3>}
            {!editing && <p>{workout.cardio.durationMinutes} min{workout.cardio.machine === "treadmill" ? ` · ${workout.cardio.speed} km/h · ${workout.cardio.incline}%` : ` · nivel ${workout.cardio.level}`}</p>}
          </div>
          {editing && (
            <div className={styles.cardioInputs}>
              <label>Min<input type="number" min="0" value={workout.cardio.durationMinutes} onChange={(event) => onUpdate({ durationMinutes: Number(event.target.value) })} /></label>
              {workout.cardio.machine === "treadmill" ? (
                <>
                  <label>Km/h<input type="number" min="0" step="0.1" value={workout.cardio.speed} onChange={(event) => onUpdate({ speed: Number(event.target.value) })} /></label>
                  <label>Incl.%<input type="number" min="0" value={workout.cardio.incline} onChange={(event) => onUpdate({ incline: Number(event.target.value) })} /></label>
                </>
              ) : <label>Nivel<input type="number" min="0" value={workout.cardio.level} onChange={(event) => onUpdate({ level: Number(event.target.value) })} /></label>}
            </div>
          )}
        </article>
      )}
    </section>
  );
}

function CatalogDialog({ block, onClose, onAdd }: { block: WorkoutBlockKey; onClose: () => void; onAdd: (exercise: ExerciseCatalogItem) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ExerciseCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const blockName = workoutBlockDefinitions.find((item) => item.key === block)?.label;

  useEffect(() => {
    let current = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      searchExercises(query)
        .then((result) => { if (current) setResults(result.exercises); })
        .finally(() => { if (current) setLoading(false); });
    }, 300);

    return () => { current = false; window.clearTimeout(timer); };
  }, [query]);

  return (
    <div className={styles.dialogBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className={styles.catalogDialog} role="dialog" aria-modal="true" aria-labelledby="catalog-title">
        <header className={styles.dialogHeader}>
          <div><span>{blockName}</span><h2 id="catalog-title">Diccionario visual</h2></div>
          <button type="button" onClick={onClose} aria-label="Cerrar diccionario">×</button>
        </header>
        <label className={styles.searchBox}>
          <span aria-hidden="true">⌕</span>
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busca un ejercicio..." />
        </label>
        <div className={styles.exerciseGrid}>
          {loading && <p className={styles.searchStatus}>Buscando movimientos…</p>}
          {!loading && results.length === 0 && <p className={styles.searchStatus}>No encontré coincidencias.</p>}
          {!loading && results.map((exercise) => (
            <button type="button" className={styles.catalogCard} key={exercise.id} onClick={() => onAdd(exercise)}>
              <ExerciseVisual exercise={exercise} />
              <strong>{exercise.name}</strong>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export function WorkoutsStudio() {
  const { state, createWorkout, updateWorkout, duplicateWorkout, deleteWorkout, addExercise, updateExercise, removeExercise, moveExercise, updateCardio } = useWorkoutsState();
  const [selectedId, setSelectedId] = useState("starter-lower");
  const [editing, setEditing] = useState(false);
  const [catalogBlock, setCatalogBlock] = useState<WorkoutBlockKey | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<WorkoutPlan | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const selectedWorkout = state.workouts.find((workout) => workout.id === selectedId) ?? state.workouts[0];
  const selectedIndex = selectedWorkout ? state.workouts.findIndex((workout) => workout.id === selectedWorkout.id) : 0;

  function toast(message: string, tone: Toast["tone"] = "success") {
    const item = { id: Date.now(), message, tone };
    setToasts((current) => [...current, item]);
    window.setTimeout(() => setToasts((current) => current.filter((entry) => entry.id !== item.id)), 2800);
  }

  function browse(direction: -1 | 1) {
    if (state.workouts.length < 2) return;
    const nextIndex = (selectedIndex + direction + state.workouts.length) % state.workouts.length;
    setSelectedId(state.workouts[nextIndex].id);
    setEditing(false);
  }

  function handleCreate() {
    const id = createWorkout();
    setSelectedId(id);
    setEditing(true);
    toast("Nueva rutina lista para editar", "info");
  }

  function handleDuplicate() {
    if (!selectedWorkout) return;
    const id = duplicateWorkout(selectedWorkout.id);
    setSelectedId(id);
    setEditing(true);
    toast("Rutina duplicada");
  }

  function confirmDelete() {
    if (!deleteCandidate) return;
    const remaining = state.workouts.filter((workout) => workout.id !== deleteCandidate.id);
    deleteWorkout(deleteCandidate.id);
    setSelectedId(remaining[0]?.id ?? "");
    setDeleteCandidate(null);
    setEditing(false);
    toast("Rutina eliminada", "info");
  }

  if (!selectedWorkout) {
    return <main className={styles.page}><button type="button" className={styles.primaryButton} onClick={handleCreate}>＋ Crear mi primera rutina</button></main>;
  }

  const blockProps = {
    workout: selectedWorkout,
    editing,
    onOpenCatalog: setCatalogBlock,
    onUpdateExercise: (block: WorkoutBlockKey, id: string, changes: Partial<WorkoutExercise>) => updateExercise(selectedWorkout.id, block, id, changes),
    onRemoveExercise: (block: WorkoutBlockKey, id: string) => removeExercise(selectedWorkout.id, block, id),
    onMoveExercise: (block: WorkoutBlockKey, id: string, direction: -1 | 1) => moveExercise(selectedWorkout.id, block, id, direction),
    onToggleCore: (enabled: boolean) => updateWorkout(selectedWorkout.id, { coreEnabled: enabled }),
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero} data-page-title>
        <div><p>Guía rápida / 01</p><h1>Entrenos</h1></div>
        <button type="button" className={styles.heroAdd} onClick={handleCreate}><span>＋</span><b>Nueva rutina</b></button>
      </section>

      <nav className={styles.routinePager} aria-label="Hojear rutinas">
        <button type="button" onClick={() => browse(-1)} disabled={state.workouts.length < 2} aria-label="Rutina anterior">‹</button>
        <div>
          <small>{String(selectedIndex + 1).padStart(2, "0")} / {String(state.workouts.length).padStart(2, "0")}</small>
          {editing ? <input value={selectedWorkout.name} aria-label="Nombre de la rutina" onChange={(event) => updateWorkout(selectedWorkout.id, { name: event.target.value })} /> : <h2>{selectedWorkout.name}</h2>}
          <p>{categoryLabel(selectedWorkout)} · {selectedWorkout.estimatedMinutes} min</p>
        </div>
        <button type="button" onClick={() => browse(1)} disabled={state.workouts.length < 2} aria-label="Rutina siguiente">›</button>
      </nav>

      <div className={styles.pagerDots} aria-hidden="true">
        {state.workouts.map((workout) => <span key={workout.id} className={workout.id === selectedWorkout.id ? styles.activeDot : ""} />)}
      </div>

      <section className={styles.workoutGuide} aria-label={`Guía de ${selectedWorkout.name}`}>
        <header className={styles.guideTools}>
          <p>{editing ? "Modo edición: ajusta tu guía" : "Desliza y sigue el orden"}</p>
          <div>
            <button type="button" onClick={handleDuplicate}>Duplicar</button>
            <button type="button" onClick={() => setDeleteCandidate(selectedWorkout)}>Eliminar</button>
            <button type="button" className={styles.editButton} onClick={() => { setEditing((current) => !current); if (editing) toast("Cambios guardados"); }}>{editing ? "Listo ✓" : "Editar rutina"}</button>
          </div>
        </header>

        {editing && (
          <div className={styles.quickSettings}>
            <label>Tipo<select value={selectedWorkout.category} onChange={(event) => updateWorkout(selectedWorkout.id, { category: event.target.value as WorkoutPlan["category"] })}>{workoutCategories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
            <label>Duración<input type="number" min="1" value={selectedWorkout.estimatedMinutes} onChange={(event) => updateWorkout(selectedWorkout.id, { estimatedMinutes: Number(event.target.value) })} /><span>min</span></label>
          </div>
        )}

        <GuideBlock block="warmup" {...blockProps} />
        <GuideBlock block="main" {...blockProps} />
        <GuideBlock block="core" {...blockProps} />
        <CardioGuide workout={selectedWorkout} editing={editing} onUpdate={(changes) => updateCardio(selectedWorkout.id, changes)} />
        <GuideBlock block="cooldown" {...blockProps} />
      </section>

      {catalogBlock && createPortal(<CatalogDialog block={catalogBlock} onClose={() => setCatalogBlock(null)} onAdd={(exercise) => { addExercise(selectedWorkout.id, catalogBlock, exercise); setCatalogBlock(null); toast(`${exercise.name} agregado`); }} />, document.body)}
      {deleteCandidate && createPortal(<div className={styles.dialogBackdrop}><section className={styles.confirmDialog} role="alertdialog" aria-modal="true" aria-labelledby="delete-title"><span>!</span><h2 id="delete-title">¿Borrar “{deleteCandidate.name}”?</h2><p>Se eliminará únicamente de este dispositivo.</p><div><button type="button" onClick={() => setDeleteCandidate(null)}>Cancelar</button><button type="button" onClick={confirmDelete}>Sí, borrar</button></div></section></div>, document.body)}
      <div className={styles.toastStack} aria-live="polite">{toasts.map((item) => <div key={item.id} className={item.tone === "success" ? styles.toastSuccess : styles.toastInfo}><span>{item.tone === "success" ? "✓" : "i"}</span>{item.message}</div>)}</div>
    </main>
  );
}
