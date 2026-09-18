"use client";

import { useEffect, useMemo, useState } from "react";

import { useWeeklyWorkouts } from "../hooks/use-weekly-workouts";
import { createBlankExercise, createBlankSet } from "../repositories/supabase-workouts-repository";
import type {
  PlannedWorkoutSet,
  WeightUnit,
  WeeklyPlanDay,
  WeeklyPlanExercise,
  WeeklyPlanSection,
  WeeklyWorkoutPlan,
  WorkoutSectionType,
  WorkoutSession,
} from "../types/workout";
import styles from "../weekly-workouts.module.css";

type WeeklyWorkoutsStudioProps = { userId: string; preferredUnit: WeightUnit };
type Screen = "catalog" | "plan" | "day";

const sectionOrder: WorkoutSectionType[] = ["warmup", "workout", "abs", "cardio", "cooldown"];
const sectionLabels: Record<WorkoutSectionType, string> = {
  warmup: "Warm-up",
  workout: "Workout",
  abs: "Abs",
  cardio: "Cardio",
  cooldown: "Cooldown",
};
const sectionIcons: Record<WorkoutSectionType, string> = {
  warmup: "↗",
  workout: "✦",
  abs: "◎",
  cardio: "♥",
  cooldown: "≈",
};

function formatTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

function exerciseSummary(exercise: { sets: { targetReps: string }[] }) {
  if (exercise.sets.length === 0) return "Sin sets";
  const reps = exercise.sets.map((set) => set.targetReps.trim()).filter(Boolean);
  const uniqueReps = [...new Set(reps)];
  return `${exercise.sets.length} ${exercise.sets.length === 1 ? "set" : "sets"} × ${uniqueReps.length === 1 ? uniqueReps[0] : "reps"}`;
}

function Media({ type, url, name }: { type: WeeklyPlanExercise["mediaType"]; url: string; name: string }) {
  if (!url || type === "none") return <div className={styles.mediaFallback} aria-hidden="true">N</div>;
  if (type === "video") return <video className={styles.media} src={url} controls preload="metadata" aria-label={`Video de ${name}`} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={styles.media} src={url} alt={`Demostración de ${name}`} loading="lazy" />;
}

function BackButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return <button type="button" className={styles.backButton} onClick={onClick}><span aria-hidden="true">←</span>{children}</button>;
}

function SyncPill({ status }: { status: "loading" | "synced" | "saving" | "offline" | "error" }) {
  const text = status === "saving" ? "Guardando…" : status === "offline" ? "Sin conexión" : status === "error" ? "Sin sincronizar" : "Sincronizado";
  return <span className={`${styles.syncPill} ${styles[`sync${status}`]}`}>{text}</span>;
}

type ExerciseEditorProps = {
  exercise: WeeklyPlanExercise;
  editing: boolean;
  preferredUnit: WeightUnit;
  onChange: (exercise: WeeklyPlanExercise) => void;
  onRemove: () => void;
};

function ExerciseEditor({ exercise, editing, preferredUnit, onChange, onRemove }: ExerciseEditorProps) {
  const updateSet = (setId: string, changes: Partial<PlannedWorkoutSet>) => onChange({
    ...exercise,
    sets: exercise.sets.map((set) => set.id === setId ? { ...set, ...changes } : set),
  });
  const removeSet = (setId: string) => onChange({
    ...exercise,
    sets: exercise.sets.filter((set) => set.id !== setId).map((set, index) => ({ ...set, setNumber: index + 1 })),
  });

  return (
    <article className={styles.exerciseCard}>
      <div className={styles.exerciseTopline}>
        <div className={styles.exerciseVisual}><Media type={exercise.mediaType} url={exercise.mediaUrl} name={exercise.name} /></div>
        <div className={styles.exerciseHeading}>
          {editing
            ? <input className={styles.exerciseName} value={exercise.name} aria-label="Nombre del ejercicio" onChange={(event) => onChange({ ...exercise, name: event.target.value })} />
            : <h3>{exercise.name}</h3>}
          <strong>{exerciseSummary(exercise)}</strong>
        </div>
      </div>

      {editing
        ? <textarea className={styles.instructions} value={exercise.instructions} aria-label="Instrucciones" placeholder="Instrucciones" onChange={(event) => onChange({ ...exercise, instructions: event.target.value })} />
        : <p className={styles.instructions}>{exercise.instructions || "Agrega instrucciones para completar el movimiento con buena técnica."}</p>}

      {editing && <div className={styles.mediaEditor}>
        <label>Visual<select value={exercise.mediaType} onChange={(event) => onChange({ ...exercise, mediaType: event.target.value as WeeklyPlanExercise["mediaType"], mediaUrl: event.target.value === "none" ? "" : exercise.mediaUrl })}><option value="none">Ninguno</option><option value="image">Imagen</option><option value="gif">GIF</option><option value="video">Video</option></select></label>
        {exercise.mediaType !== "none" && <label>URL<input type="url" value={exercise.mediaUrl} onChange={(event) => onChange({ ...exercise, mediaUrl: event.target.value })} /></label>}
      </div>}

      <div className={styles.setTable}>
        <div className={styles.setTableHead}><span>Set</span><span>Peso</span><span>Unidad</span><span>Reps</span>{editing && <span />}</div>
        {exercise.sets.map((set) => <div className={styles.setRow} key={set.id}>
          <span className={styles.setNumber}>{set.setNumber}</span>
          {editing ? <input type="number" min="0" step="0.5" value={set.targetWeight ?? ""} aria-label={`Peso planificado set ${set.setNumber}`} onChange={(event) => updateSet(set.id, { targetWeight: event.target.value === "" ? null : Number(event.target.value) })} /> : <strong>{set.targetWeight ?? "—"}</strong>}
          {editing ? <select value={set.weightUnit} aria-label={`Unidad set ${set.setNumber}`} onChange={(event) => updateSet(set.id, { weightUnit: event.target.value as WeightUnit })}><option value="kg">kg</option><option value="lb">lb</option></select> : <span>{set.weightUnit}</span>}
          {editing ? <input value={set.targetReps} aria-label={`Repeticiones set ${set.setNumber}`} onChange={(event) => updateSet(set.id, { targetReps: event.target.value })} /> : <strong>{set.targetReps || "—"}</strong>}
          {editing && <button type="button" className={styles.removeSet} onClick={() => removeSet(set.id)} aria-label={`Eliminar set ${set.setNumber}`}>×</button>}
        </div>)}
      </div>

      {editing && <div className={styles.rowActions}>
        <button type="button" onClick={() => onChange({ ...exercise, sets: [...exercise.sets, createBlankSet(exercise.sets.length + 1, preferredUnit)] })}>+ Set</button>
        <button type="button" onClick={onRemove}>Eliminar ejercicio</button>
      </div>}
    </article>
  );
}

function SectionEditor({ section, editing, preferredUnit, onChange }: {
  section: WeeklyPlanSection;
  editing: boolean;
  preferredUnit: WeightUnit;
  onChange: (section: WeeklyPlanSection) => void;
}) {
  const updateExercise = (exerciseId: string, next: WeeklyPlanExercise) => onChange({ ...section, exercises: section.exercises.map((exercise) => exercise.id === exerciseId ? next : exercise) });
  const removeExercise = (exerciseId: string) => onChange({ ...section, exercises: section.exercises.filter((exercise) => exercise.id !== exerciseId).map((exercise, index) => ({ ...exercise, position: index + 1 })) });

  return <section id={`section-${section.type}`} className={`${styles.section} ${styles[section.type]}`}>
    <header className={styles.sectionHeader}>
      <span aria-hidden="true">{sectionIcons[section.type]}</span>
      <div><h2>{sectionLabels[section.type]}</h2><p>{section.exercises.length} ejercicios · {section.estimatedMinutes} min</p></div>
      {editing && <label>Min<input type="number" min="0" value={section.estimatedMinutes} onChange={(event) => onChange({ ...section, estimatedMinutes: Number(event.target.value) })} /></label>}
    </header>
    <div className={styles.exerciseGrid}>{section.exercises.map((exercise) => <ExerciseEditor key={exercise.id} exercise={exercise} editing={editing} preferredUnit={preferredUnit} onChange={(next) => updateExercise(exercise.id, next)} onRemove={() => removeExercise(exercise.id)} />)}</div>
    {editing && <button type="button" className={styles.addExercise} onClick={() => onChange({ ...section, exercises: [...section.exercises, createBlankExercise(section.exercises.length + 1, preferredUnit)] })}>+ Agregar ejercicio</button>}
    {!editing && section.exercises.length === 0 && <p className={styles.emptySection}>Aún no hay ejercicios en esta sección.</p>}
  </section>;
}

function SessionPanel({ session, onPause, onResume, onFinish, onDismiss, onExercise, onSet }: {
  session: WorkoutSession;
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
  onDismiss: () => void;
  onExercise: (id: string, completed: boolean) => void;
  onSet: (exerciseId: string, setId: string, changes: Partial<WorkoutSession["exercises"][number]["sets"][number]>) => void;
}) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (session.status === "completed") return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [session.status]);

  const elapsed = session.elapsedSeconds + (session.status === "in_progress" && session.timerStartedAt ? Math.max(0, Math.floor((now - new Date(session.timerStartedAt).getTime()) / 1000)) : 0);
  const paused = session.pausedSeconds + (session.status === "paused" ? Math.max(0, Math.floor((now - new Date(session.updatedAt).getTime()) / 1000)) : 0);
  const grouped = useMemo(() => {
    const groups: Partial<Record<WorkoutSectionType, WorkoutSession["exercises"]>> = {};
    for (const exercise of session.exercises) groups[exercise.sectionType] = [...(groups[exercise.sectionType] ?? []), exercise];
    return groups;
  }, [session.exercises]);
  const totalSets = session.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
  const completedSets = session.exercises.reduce((total, exercise) => total + exercise.sets.filter((set) => set.completed).length, 0);

  return <main className={styles.sessionPanel}>
    <header className={styles.timerHeader}>
      <div><small>{session.status === "completed" ? "Entrenamiento finalizado" : session.status === "paused" ? "Timer pausado" : "Entrenamiento activo"}</small><h1>{session.name}</h1><p>{session.focus} · {completedSets}/{totalSets} sets</p></div>
      <div className={styles.timer}><strong>{formatTime(elapsed)}</strong><span>Pausa {formatTime(paused)}</span></div>
      <div className={styles.timerActions}>
        {session.status === "in_progress" && <button type="button" onClick={onPause}>Pausar</button>}
        {session.status === "paused" && <button type="button" onClick={onResume}>Continuar</button>}
        {(session.status === "in_progress" || session.status === "paused") && <button type="button" onClick={onFinish}>Finalizar</button>}
        {session.status === "completed" && <button type="button" onClick={onDismiss}>Volver al plan</button>}
      </div>
    </header>

    <nav className={styles.sectionNav} aria-label="Secciones del entrenamiento">{sectionOrder.filter((type) => grouped[type]?.length).map((type) => <a key={type} href={`#session-${type}`}>{sectionLabels[type]}</a>)}</nav>

    {sectionOrder.map((type) => grouped[type]?.length ? <section id={`session-${type}`} key={type} className={`${styles.sessionSection} ${styles[type]}`}>
      <h2>{sectionLabels[type]}</h2>
      {grouped[type]?.map((exercise) => <article key={exercise.id} className={styles.resultCard}>
        <div className={styles.resultTopline}>
          <div className={styles.resultMedia}><Media type={exercise.mediaType} url={exercise.mediaUrl} name={exercise.name} /></div>
          <div><h3>{exercise.name}</h3><strong>{exerciseSummary(exercise)}</strong></div>
          <label className={styles.exerciseCheck}><input type="checkbox" checked={exercise.completed} disabled={session.status === "completed"} onChange={(event) => onExercise(exercise.id, event.target.checked)} /><span aria-hidden="true">✓</span><span className={styles.srOnly}>Ejercicio completo</span></label>
        </div>
        {exercise.instructions && <p className={styles.resultInstructions}>{exercise.instructions}</p>}
        <div className={styles.resultTable}>
          <div className={styles.resultHead}><span>Set</span><span>Peso</span><span>Unidad</span><span>Reps</span><span>✓</span></div>
          {exercise.sets.map((set) => <div className={styles.resultRow} key={set.id}>
            <span className={styles.setNumber}>{set.setNumber}</span>
            <input type="number" min="0" step="0.5" disabled={session.status === "completed"} value={set.actualWeight ?? ""} placeholder={set.targetWeight?.toString() ?? "—"} aria-label={`Peso realizado set ${set.setNumber}`} onChange={(event) => onSet(exercise.id, set.id, { actualWeight: event.target.value === "" ? null : Number(event.target.value) })} />
            <select disabled={session.status === "completed"} value={set.weightUnit} aria-label={`Unidad set ${set.setNumber}`} onChange={(event) => onSet(exercise.id, set.id, { weightUnit: event.target.value as WeightUnit })}><option value="kg">kg</option><option value="lb">lb</option></select>
            <input disabled={session.status === "completed"} value={set.actualReps} placeholder={set.targetReps || "—"} aria-label={`Repeticiones realizadas set ${set.setNumber}`} onChange={(event) => onSet(exercise.id, set.id, { actualReps: event.target.value })} />
            <label className={styles.setCheck}><input type="checkbox" disabled={session.status === "completed"} checked={set.completed} aria-label={`Completar set ${set.setNumber}`} onChange={(event) => onSet(exercise.id, set.id, { completed: event.target.checked, completedAt: event.target.checked ? new Date().toISOString() : null })} /><span aria-hidden="true">✓</span></label>
          </div>)}
        </div>
      </article>)}
    </section> : null)}
    {session.status !== "completed" && <div className={styles.floatingTimer}><span>{session.status === "paused" ? "Pausado" : formatTime(elapsed)}</span><button type="button" onClick={session.status === "paused" ? onResume : onPause}>{session.status === "paused" ? "▶" : "Ⅱ"}</button></div>}
  </main>;
}

export function WeeklyWorkoutsStudio({ userId, preferredUnit }: WeeklyWorkoutsStudioProps) {
  const workouts = useWeeklyWorkouts(userId, preferredUnit);
  const [screen, setScreen] = useState<Screen>("catalog");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedDay, setSelectedDay] = useState(1);
  const [editing, setEditing] = useState(false);
  const plan = workouts.state.plans.find((item) => item.id === selectedPlanId) ?? workouts.state.plans[0];
  const day = plan?.days.find((item) => item.dayNumber === selectedDay) ?? plan?.days[0];

  const openPlan = (id: string) => { setSelectedPlanId(id); setSelectedDay(1); setEditing(false); setScreen("plan"); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const openDay = (dayNumber: number) => { setSelectedDay(dayNumber); setEditing(false); setScreen("day"); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const updatePlan = (changes: Partial<WeeklyWorkoutPlan>) => { if (plan) workouts.updatePlan(plan.id, (current) => ({ ...current, ...changes })); };
  const updateDay = (changes: Partial<WeeklyPlanDay>) => { if (plan && day) workouts.updatePlan(plan.id, (current) => ({ ...current, days: current.days.map((item) => item.id === day.id ? { ...item, ...changes } : item) })); };
  const updateSection = (section: WeeklyPlanSection) => { if (plan && day) workouts.updatePlan(plan.id, (current) => ({ ...current, days: current.days.map((item) => item.id === day.id ? { ...item, sections: item.sections.map((candidate) => candidate.id === section.id ? section : candidate) } : item) })); };

  if (workouts.state.activeSession) return <SessionPanel session={workouts.state.activeSession} onPause={workouts.pauseSession} onResume={workouts.resumeSession} onFinish={workouts.finishSession} onDismiss={workouts.dismissCompletedSession} onExercise={(id, completed) => workouts.updateExerciseResult(id, { completed, completedAt: completed ? new Date().toISOString() : null })} onSet={workouts.updateSetResult} />;
  if (workouts.syncStatus === "loading") return <main className={styles.loading}><span className={styles.loadingCat}>N</span><p>Preparando tus planes…</p></main>;

  return <main className={styles.page}>
    {workouts.error && <p className={styles.syncError} role="status">{workouts.error}</p>}

    {screen === "catalog" && <>
      <header className={styles.hero} data-page-title>
        <div><p>Tu semana, a tu ritmo</p><h1>Planes semanales</h1><span>Elige una semana y entrena día por día.</span></div>
        <div><SyncPill status={workouts.syncStatus} /><button type="button" onClick={() => { const id = workouts.createPlan(); setSelectedPlanId(id); setEditing(true); setScreen("plan"); }}>+ Nueva semana</button></div>
      </header>
      <section className={styles.catalogIntro}><span>7</span><div><strong>Una semana completa</strong><p>Cada plan conserva sus días, secciones y ejercicios. Tus sesiones realizadas quedan guardadas aparte.</p></div></section>
      <section className={styles.weeklyCatalog} aria-label="Catálogo de planes semanales">
        {workouts.state.plans.map((item, index) => {
          const activeDays = item.days.filter((candidate) => !candidate.isRestDay).length;
          const minutes = item.days.reduce((total, candidate) => total + candidate.estimatedMinutes, 0);
          return <article className={styles.weekCard} key={item.id}>
            <button type="button" className={styles.weekCardMain} onClick={() => openPlan(item.id)}>
              <span className={styles.weekCover}><small>PLAN</small>W{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.weekCopy}><small>{item.objective || "Plan semanal"}</small><strong>{item.name}</strong><span>{item.description || "Organiza tu entrenamiento de toda la semana."}</span><em>{activeDays} días activos · {minutes} min</em></span>
              <span className={styles.openArrow} aria-hidden="true">›</span>
            </button>
            <div className={styles.weekActions}><button type="button" onClick={() => { setSelectedPlanId(item.id); setEditing(true); setScreen("plan"); }}>Editar</button><button type="button" onClick={() => { if (window.confirm(`¿Eliminar “${item.name}”? El historial realizado se conserva.`)) void workouts.removePlan(item.id); }}>Eliminar</button></div>
          </article>;
        })}
      </section>
      {workouts.state.plans.length === 0 && <section className={styles.emptyPlans}><h2>Crea tu primera semana</h2><p>Planea hasta siete días con warm-up, workout, abs, cardio y cooldown.</p><button type="button" onClick={() => { const id = workouts.createPlan(); setSelectedPlanId(id); setEditing(true); setScreen("plan"); }}>Crear plan semanal</button></section>}
    </>}

    {screen === "plan" && plan && <>
      <header className={styles.mobileTopbar}><BackButton onClick={() => setScreen("catalog")}>Planes</BackButton><strong>{plan.name}</strong><SyncPill status={workouts.syncStatus} /></header>
      <section className={styles.planIntro}>
        {editing ? <div className={styles.planForm}><label>Nombre<input value={plan.name} onChange={(event) => updatePlan({ name: event.target.value })} /></label><label>Objetivo<input value={plan.objective} onChange={(event) => updatePlan({ objective: event.target.value })} /></label><label>Descripción<textarea value={plan.description} onChange={(event) => updatePlan({ description: event.target.value })} /></label></div> : <><small>{plan.objective || "Programa semanal"}</small><h1>{plan.name}</h1><p>{plan.description || "Tu programa de entrenamiento, organizado día por día."}</p></>}
        <div className={styles.planIntroActions}><button type="button" onClick={() => setEditing((value) => !value)}>{editing ? "Listo ✓" : "Editar semana"}</button></div>
      </section>
      <div className={styles.planWeekSummary}>{plan.days.map((item) => <span key={item.id} className={item.isRestDay ? styles.restDot : ""}>{item.dayNumber}</span>)}</div>
      <section className={styles.dayList} aria-label="Días de la semana">
        {plan.days.map((item) => <button type="button" className={styles.dayCard} key={item.id} onClick={() => openDay(item.dayNumber)}>
          <span className={`${styles.dayCover} ${item.isRestDay ? styles.restCover : ""}`}><small>DÍA</small>{item.dayNumber}</span>
          <span className={styles.dayCopy}><small>Día {item.dayNumber}</small><strong>{item.name}</strong><span>{item.isRestDay ? "Recuperación" : item.focus || "Entrenamiento"}</span><em>{item.isRestDay ? "Descanso" : `${item.estimatedMinutes} minutos`}</em></span>
          <span className={styles.openArrow} aria-hidden="true">›</span>
        </button>)}
      </section>
    </>}

    {screen === "day" && plan && day && <>
      <header className={styles.mobileTopbar}><BackButton onClick={() => setScreen("plan")}>Semana</BackButton><strong>Día {day.dayNumber}</strong><SyncPill status={workouts.syncStatus} /></header>
      <section className={styles.dayHero}>
        <div className={styles.dayHeroCover}><span>D{day.dayNumber}</span></div>
        <div className={styles.dayHeroCopy}>
          {editing ? <><input className={styles.dayName} value={day.name} aria-label="Nombre del día" onChange={(event) => updateDay({ name: event.target.value })} /><input value={day.focus} aria-label="Enfoque del día" placeholder="Enfoque" onChange={(event) => updateDay({ focus: event.target.value })} /><textarea value={day.description} aria-label="Descripción del día" placeholder="Descripción" onChange={(event) => updateDay({ description: event.target.value })} /></> : <><small>Día {day.dayNumber} · {day.focus || "Entrenamiento"}</small><h1>{day.name}</h1><p>{day.description || "Sigue cada sección y registra tus resultados set por set."}</p></>}
        </div>
      </section>
      <section className={styles.dayControls}>
        <div><strong>{day.estimatedMinutes} min</strong><span>Tiempo estimado</span></div>
        {!day.isRestDay && <button type="button" className={styles.startButton} onClick={() => void workouts.startSession(plan, day.id)} disabled={day.sections.every((section) => section.exercises.length === 0)}>▶ Iniciar</button>}
        <button type="button" className={styles.editDayButton} onClick={() => setEditing((value) => !value)}>{editing ? "Listo ✓" : "Editar"}</button>
        {editing && <><label className={styles.restToggle}><input type="checkbox" checked={day.isRestDay} onChange={(event) => updateDay({ isRestDay: event.target.checked })} />Descanso</label><label className={styles.minuteEditor}><input type="number" min="0" value={day.estimatedMinutes} onChange={(event) => updateDay({ estimatedMinutes: Number(event.target.value) })} /> min</label></>}
      </section>
      {!day.isRestDay && <>
        <nav className={styles.sectionNav} aria-label="Secciones del día">{sectionOrder.map((type) => <a key={type} href={`#section-${type}`}>{sectionLabels[type]}</a>)}</nav>
        <p className={styles.workoutNote}>Completa cada set con tu peso y repeticiones reales. La unidad predeterminada es <strong>{preferredUnit}</strong>.</p>
        {[...day.sections].sort((a, b) => a.position - b.position).map((section) => <SectionEditor key={section.id} section={section} editing={editing} preferredUnit={preferredUnit} onChange={updateSection} />)}
      </>}
      {day.isRestDay && <section className={styles.restDay}><span>☾</span><h2>Día de recuperación</h2><p>Recarga energía. Puedes editar el día para convertirlo en entrenamiento.</p></section>}
    </>}
  </main>;
}
