"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { cardioMachines, workoutBlockDefinitions, workoutCategories } from "../data/workout-options";
import { useWorkoutsState } from "../hooks/use-workouts-state";
import { searchExercises, type ExerciseFilter } from "../services/workoutx-exercise-service";
import type { ExerciseCatalogItem, WorkoutBlockKey, WorkoutExercise, WorkoutPlan } from "../types/workout";
import styles from "../workouts.module.css";

type Toast = { id: number; message: string; tone: "success" | "info" };

const searchFilters: Array<{ value: ExerciseFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "legs", label: "Pierna" },
  { value: "upper", label: "Superior" },
  { value: "core", label: "Core" },
  { value: "cardio", label: "Cardio" },
];

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
      // WorkoutX entrega URLs de GIF en tiempo de ejecución, por eso no usamos next/image aquí.
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

type ExerciseCardProps = {
  entry: WorkoutExercise;
  index: number;
  total: number;
  editing: boolean;
  onUpdate: (changes: Partial<WorkoutExercise>) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
};

function ExerciseCard({ entry, index, total, editing, onUpdate, onRemove, onMove }: ExerciseCardProps) {
  return (
    <article className={styles.exerciseCard}>
      <div className={styles.visualFrame}>
        <ExerciseVisual exercise={entry.exercise} />
        {editing && (
          <div className={styles.cardActions}>
            <button type="button" disabled={index === 0} onClick={() => onMove(-1)} aria-label={`Subir ${entry.exercise.name}`}>↑</button>
            <button type="button" disabled={index === total - 1} onClick={() => onMove(1)} aria-label={`Bajar ${entry.exercise.name}`}>↓</button>
            <button type="button" onClick={onRemove} aria-label={`Quitar ${entry.exercise.name}`}>×</button>
          </div>
        )}
      </div>
      <div className={styles.exerciseCopy}>
        <h3>{entry.exercise.name}</h3>
      </div>
      <div className={styles.exerciseNumbers}>
        <label><span>Series</span><input type="number" min="1" value={entry.sets} disabled={!editing} onChange={(event) => onUpdate({ sets: Number(event.target.value) })} /></label>
        <b>×</b>
        <label><span>Reps</span><input value={entry.reps} disabled={!editing} onChange={(event) => onUpdate({ reps: event.target.value })} /></label>
        <b>·</b>
        <label><span>Peso</span><span className={styles.weightInput}><input type="number" min="0" step="0.5" value={entry.weightKg} disabled={!editing} onChange={(event) => onUpdate({ weightKg: Number(event.target.value) })} /><i>kg</i></span></label>
      </div>
    </article>
  );
}

type WorkoutColumnProps = {
  workout: WorkoutPlan;
  block: WorkoutBlockKey;
  editing: boolean;
  onOpenCatalog: (block: WorkoutBlockKey) => void;
  onUpdateExercise: (block: WorkoutBlockKey, entryId: string, changes: Partial<WorkoutExercise>) => void;
  onRemoveExercise: (block: WorkoutBlockKey, entryId: string) => void;
  onMoveExercise: (block: WorkoutBlockKey, entryId: string, direction: -1 | 1) => void;
  onToggleCore: (enabled: boolean) => void;
};

function WorkoutColumn({ workout, block, editing, onOpenCatalog, onUpdateExercise, onRemoveExercise, onMoveExercise, onToggleCore }: WorkoutColumnProps) {
  const definition = workoutBlockDefinitions.find((item) => item.key === block);
  if (!definition) return null;
  const isCore = block === "core";
  const enabled = !isCore || workout.coreEnabled;
  const entries = workout.blocks[block];

  return (
    <section className={`${styles.workoutColumn} ${styles[`column${definition.color}`]}`}>
      <header className={styles.columnHeader}>
        <span>{definition.shortLabel}</span>
        <h2>{definition.label}</h2>
        {editing && enabled && <button type="button" onClick={() => onOpenCatalog(block)} aria-label={`Agregar a ${definition.label}`}>+</button>}
      </header>
      {!enabled ? (
        <button type="button" className={styles.enableBlock} disabled={!editing} onClick={() => onToggleCore(true)}>+ Agregar core</button>
      ) : (
        <div className={styles.columnBody}>
          {isCore && editing && <button type="button" className={styles.removeBlock} onClick={() => onToggleCore(false)}>Quitar bloque</button>}
          {entries.length === 0 && <button type="button" className={styles.emptyColumn} disabled={!editing} onClick={() => onOpenCatalog(block)}>+ Agregar ejercicio</button>}
          {entries.map((entry, index) => (
            <ExerciseCard
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
        </div>
      )}
    </section>
  );
}

function CardioColumn({ workout, editing, onUpdate }: { workout: WorkoutPlan; editing: boolean; onUpdate: (changes: Partial<WorkoutPlan["cardio"]>) => void }) {
  const machine = cardioMachines.find((item) => item.value === workout.cardio.machine);
  return (
    <section className={`${styles.workoutColumn} ${styles.columncardio}`}>
      <header className={styles.columnHeader}>
        <span>04</span><h2>Cardio</h2>
        {editing && workout.cardio.enabled && <button type="button" onClick={() => onUpdate({ enabled: false })} aria-label="Quitar cardio">×</button>}
      </header>
      {!workout.cardio.enabled ? (
        <button type="button" className={styles.enableBlock} disabled={!editing} onClick={() => onUpdate({ enabled: true })}>+ Agregar cardio</button>
      ) : (
        <div className={styles.columnBody}><div className={styles.cardioCard}>
          <span className={styles.cardioIcon}>{machine?.icon}</span>
          {editing ? (
            <select value={workout.cardio.machine} onChange={(event) => onUpdate({ machine: event.target.value as WorkoutPlan["cardio"]["machine"] })}>
              {cardioMachines.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          ) : <h3>{machine?.label}</h3>}
          <div className={styles.cardioNumbers}>
            <label><span>Tiempo</span><span><input type="number" min="0" value={workout.cardio.durationMinutes} disabled={!editing} onChange={(event) => onUpdate({ durationMinutes: Number(event.target.value) })} /><i>min</i></span></label>
            {workout.cardio.machine === "treadmill" ? (
              <>
                <label><span>Velocidad</span><span><input type="number" min="0" step="0.1" value={workout.cardio.speed} disabled={!editing} onChange={(event) => onUpdate({ speed: Number(event.target.value) })} /><i>km/h</i></span></label>
                <label><span>Inclinación</span><span><input type="number" min="0" value={workout.cardio.incline} disabled={!editing} onChange={(event) => onUpdate({ incline: Number(event.target.value) })} /><i>%</i></span></label>
              </>
            ) : <label><span>Nivel</span><span><input type="number" min="0" value={workout.cardio.level} disabled={!editing} onChange={(event) => onUpdate({ level: Number(event.target.value) })} /><i>lvl</i></span></label>}
          </div>
          {workout.cardio.notes && <p>{workout.cardio.notes}</p>}
        </div></div>
      )}
    </section>
  );
}

type CatalogDialogProps = {
  block: WorkoutBlockKey;
  onClose: () => void;
  onAdd: (exercise: ExerciseCatalogItem) => void;
};

function CatalogDialog({ block, onClose, onAdd }: CatalogDialogProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ExerciseFilter>("all");
  const [results, setResults] = useState<ExerciseCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState<"WorkoutX" | "respaldo">("respaldo");
  const [configured, setConfigured] = useState(false);
  const blockName = workoutBlockDefinitions.find((item) => item.key === block)?.label;

  useEffect(() => {
    let current = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      searchExercises(query, filter)
        .then((result) => {
          if (!current) return;
          setResults(result.exercises);
          setProvider(result.provider);
          setConfigured(result.workoutXConfigured);
        })
        .finally(() => { if (current) setLoading(false); });
    }, 250);
    return () => { current = false; window.clearTimeout(timer); };
  }, [query, filter]);

  return (
    <div className={styles.dialogBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className={styles.catalogDialog} role="dialog" aria-modal="true" aria-labelledby="catalog-title">
        <header className={styles.dialogHeader}>
          <div><span>{blockName}</span><h2 id="catalog-title">Buscar ejercicio</h2></div>
          <button type="button" onClick={onClose} aria-label="Cerrar buscador">×</button>
        </header>
        <div className={styles.searchArea}>
          <label><span aria-hidden="true">⌕</span><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busca: hip thrust, sentadilla..." /></label>
          <div className={styles.filterRow}>{searchFilters.map((item) => <button type="button" key={item.value} className={filter === item.value ? styles.filterActive : ""} onClick={() => setFilter(item.value)}>{item.label}</button>)}</div>
          <small>{provider === "WorkoutX" ? "GIFs de WorkoutX" : configured ? "WorkoutX no respondió · usando respaldo" : "Vista de respaldo · WorkoutX se conectará con el proxy seguro"}</small>
        </div>
        <div className={styles.exerciseGrid}>
          {loading && <p className={styles.searchStatus}>Buscando movimientos…</p>}
          {!loading && results.length === 0 && <p className={styles.searchStatus}>No encontré coincidencias. Prueba otra palabra.</p>}
          {!loading && results.map((exercise) => (
            <button type="button" className={styles.catalogCard} key={exercise.id} onClick={() => onAdd(exercise)}>
              <div className={styles.catalogVisual}><ExerciseVisual exercise={exercise} /><span>+</span></div>
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

  function toast(message: string, tone: Toast["tone"] = "success") {
    const item = { id: Date.now(), message, tone };
    setToasts((current) => [...current, item]);
    window.setTimeout(() => setToasts((current) => current.filter((entry) => entry.id !== item.id)), 2800);
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
    return <main className={styles.page}><button type="button" className={styles.primaryButton} onClick={handleCreate}>+ Crear mi primera rutina</button></main>;
  }

  const columnProps = {
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
      <section className={styles.hero}>
        <div><p>Workout log / 01</p><h1>Entrenos</h1></div>
        <button type="button" className={styles.heroAdd} onClick={handleCreate}><span>+</span> Nueva rutina</button>
      </section>

      <section className={styles.routineRail} aria-label="Rutinas guardadas">
        {state.workouts.map((workout) => (
          <button type="button" key={workout.id} className={workout.id === selectedWorkout.id ? styles.routineActive : ""} onClick={() => { setSelectedId(workout.id); setEditing(false); }}>
            <span>{workoutCategories.find((item) => item.value === workout.category)?.mark ?? "TU"}</span>
            <strong>{workout.name}</strong>
          </button>
        ))}
      </section>

      <section className={styles.workoutSheet}>
        <header className={styles.sheetHeader}>
          <div>
            {editing ? <input className={styles.titleInput} value={selectedWorkout.name} aria-label="Nombre de la rutina" onChange={(event) => updateWorkout(selectedWorkout.id, { name: event.target.value })} /> : <h2>{selectedWorkout.name}</h2>}
            <div className={styles.workoutMeta}>
              {editing ? <select value={selectedWorkout.category} onChange={(event) => updateWorkout(selectedWorkout.id, { category: event.target.value as WorkoutPlan["category"] })}>{workoutCategories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select> : <span>{categoryLabel(selectedWorkout)}</span>}
              <label><input type="number" min="1" value={selectedWorkout.estimatedMinutes} disabled={!editing} onChange={(event) => updateWorkout(selectedWorkout.id, { estimatedMinutes: Number(event.target.value) })} /> min</label>
            </div>
          </div>
          <div className={styles.sheetActions}>
            <button type="button" onClick={handleDuplicate}>Duplicar</button>
            <button type="button" onClick={() => setDeleteCandidate(selectedWorkout)}>Eliminar</button>
            <button type="button" className={styles.editButton} onClick={() => { setEditing((current) => !current); if (editing) toast("Cambios guardados"); }}>{editing ? "Listo ✓" : "Editar"}</button>
          </div>
        </header>
        <div className={styles.splitBoard}>
          <WorkoutColumn block="warmup" {...columnProps} />
          <WorkoutColumn block="main" {...columnProps} />
          <WorkoutColumn block="core" {...columnProps} />
          <CardioColumn workout={selectedWorkout} editing={editing} onUpdate={(changes) => updateCardio(selectedWorkout.id, changes)} />
          <WorkoutColumn block="cooldown" {...columnProps} />
        </div>
      </section>

      {catalogBlock && createPortal(<CatalogDialog block={catalogBlock} onClose={() => setCatalogBlock(null)} onAdd={(exercise) => { addExercise(selectedWorkout.id, catalogBlock, exercise); setCatalogBlock(null); toast(`${exercise.name} agregado`); }} />, document.body)}
      {deleteCandidate && createPortal(<div className={styles.dialogBackdrop}><section className={styles.confirmDialog} role="alertdialog" aria-modal="true" aria-labelledby="delete-title"><span>!</span><h2 id="delete-title">¿Borrar “{deleteCandidate.name}”?</h2><p>Se eliminará únicamente de este dispositivo.</p><div><button type="button" onClick={() => setDeleteCandidate(null)}>Cancelar</button><button type="button" onClick={confirmDelete}>Sí, borrar</button></div></section></div>, document.body)}
      <div className={styles.toastStack} aria-live="polite">{toasts.map((item) => <div key={item.id} className={item.tone === "success" ? styles.toastSuccess : styles.toastInfo}><span>{item.tone === "success" ? "✓" : "i"}</span>{item.message}</div>)}</div>
    </main>
  );
}
