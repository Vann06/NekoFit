"use client";

import {
  type CSSProperties,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { defaultGarments } from "../data/default-garments";
import { deleteWardrobeItem, getWardrobeItems, saveWardrobeItem } from "../repositories/wardrobe-repository";
import type { GarmentImage, Outfit, WardrobeCategory, WardrobeItem } from "../types/wardrobe-item";
import { GarmentPicture } from "./garment-picture";
import styles from "../wardrobe.module.css";

const categories: WardrobeCategory[] = ["Tops", "Bottoms", "Zapatos"];
const emptyOutfit: Outfit = { Tops: null, Bottoms: null, Zapatos: null };

type DragState = { item: WardrobeItem; pointerId: number; x: number; y: number; overStage: boolean };

export function WardrobeStudio() {
  const [items, setItems] = useState<WardrobeItem[]>(defaultGarments);
  const [outfit, setOutfit] = useState<Outfit>(emptyOutfit);
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<WardrobeItem | null>(null);
  const [message, setMessage] = useState("Arrastra una prenda al lienzo");
  const [toast, setToast] = useState<string | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getWardrobeItems().then(setItems).catch(() => setToast("No pudimos abrir IndexedDB; usarás el armario de esta sesión."));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  function isOverStage(x: number, y: number) {
    const bounds = stageRef.current?.getBoundingClientRect();
    return Boolean(bounds && x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom);
  }

  function startDragging(event: ReactPointerEvent<HTMLButtonElement>, item: WardrobeItem) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging({ item, pointerId: event.pointerId, x: event.clientX, y: event.clientY, overStage: false });
    setMessage(`Moviendo ${item.name}`);
  }

  function moveDragging(event: ReactPointerEvent<HTMLButtonElement>) {
    setDragging((currentDrag) => currentDrag?.pointerId === event.pointerId
      ? { ...currentDrag, x: event.clientX, y: event.clientY, overStage: isOverStage(event.clientX, event.clientY) }
      : currentDrag);
  }

  function finishDragging(event: ReactPointerEvent<HTMLButtonElement>, item: WardrobeItem) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (isOverStage(event.clientX, event.clientY)) {
      setOutfit((currentOutfit) => ({ ...currentOutfit, [item.category]: item }));
      setMessage(`${item.name} forma parte del look`);
    } else {
      setMessage("Suelta la prenda dentro del lienzo");
    }
    setDragging(null);
  }

  async function createItem(item: WardrobeItem) {
    await saveWardrobeItem(item);
    setItems((currentItems) => [...currentItems, item]);
    setIsEditorOpen(false);
    setToast("Prenda guardada en tu armario ✦");
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const item = pendingDelete;
    await deleteWardrobeItem(item.id);
    setItems((currentItems) => currentItems.filter((currentItem) => currentItem.id !== item.id));
    setOutfit((currentOutfit) => ({
      ...currentOutfit,
      [item.category]: currentOutfit[item.category]?.id === item.id ? null : currentOutfit[item.category],
    }));
    setPendingDelete(null);
    setToast(`${item.name} fue eliminada`);
  }

  return (
    <main className={styles.wardrobePage}>
      <header className={styles.pageIntro}>
        <div>
          <p className={styles.eyebrow}>Armario interactivo</p>
          <h1>Arma tu look</h1>
          <p>Arrastra prendas reales a un lienzo sencillo y combina una pieza de cada sección.</p>
        </div>
        <button type="button" className={styles.addGarmentButton} onClick={() => setIsEditorOpen(true)}>
          <span aria-hidden="true">＋</span>Nueva prenda
        </button>
      </header>

      <section className={styles.gameBoard} aria-label="Creador de looks">
        <aside className={styles.leftCloset} aria-label="Prendas disponibles">
          {categories.map((category) => (
            <GarmentRack
              key={category}
              category={category}
              items={items.filter((item) => item.category === category)}
              onStartDrag={startDragging}
              onMoveDrag={moveDragging}
              onFinishDrag={finishDragging}
              onCancelDrag={() => setDragging(null)}
              onAskDelete={setPendingDelete}
            />
          ))}
        </aside>

        <section className={styles.fittingRoom} aria-label="Lienzo del look">
          <div className={styles.stageMessage} aria-live="polite"><span aria-hidden="true" />{message}</div>
          <div ref={stageRef} className={`${styles.outfitCanvas} ${dragging?.overStage ? styles.outfitCanvasReady : ""}`}>
            <span className={styles.dropMessage}>Suelta aquí</span>
            <p className={styles.canvasTitle}>Tu look de hoy</p>
            {outfit.Tops && <GarmentPicture item={outfit.Tops} className={`${styles.wornItem} ${styles.wornTop}`} />}
            {outfit.Bottoms && <GarmentPicture item={outfit.Bottoms} className={`${styles.wornItem} ${styles.wornBottom}`} />}
            {outfit.Zapatos && <GarmentPicture item={outfit.Zapatos} className={`${styles.wornItem} ${styles.wornShoes}`} />}
            {!Object.values(outfit).some(Boolean) && <p className={styles.emptyCanvas}>Arrastra algo desde la izquierda<br />para comenzar ✦</p>}
          </div>
          <button type="button" className={styles.resetButton} disabled={!Object.values(outfit).some(Boolean)} onClick={() => { setOutfit(emptyOutfit); setMessage("Lienzo limpio, empieza otra vez"); }}>Reset</button>
        </section>
      </section>

      {dragging && (
        <div className={styles.dragGhost} style={{ "--drag-x": `${dragging.x}px`, "--drag-y": `${dragging.y}px` } as CSSProperties} aria-hidden="true">
          <GarmentPicture item={dragging.item} className={styles.draggedPicture} />
        </div>
      )}

      {isEditorOpen && <GarmentEditor onClose={() => setIsEditorOpen(false)} onSave={createItem} />}
      {pendingDelete && (
        <div className={styles.confirmToast} role="alertdialog" aria-label={`Confirmar eliminación de ${pendingDelete.name}`}>
          <div><strong>¿Borrar esta prenda?</strong><small>{pendingDelete.name} desaparecerá del armario.</small></div>
          <button type="button" onClick={() => setPendingDelete(null)}>Cancelar</button>
          <button type="button" onClick={confirmDelete}>Borrar</button>
        </div>
      )}
      {toast && !pendingDelete && <div className={styles.toast} role="status">{toast}</div>}
    </main>
  );
}

function GarmentRack({ category, items, onStartDrag, onMoveDrag, onFinishDrag, onCancelDrag, onAskDelete }: {
  category: WardrobeCategory;
  items: WardrobeItem[];
  onStartDrag: (event: ReactPointerEvent<HTMLButtonElement>, item: WardrobeItem) => void;
  onMoveDrag: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onFinishDrag: (event: ReactPointerEvent<HTMLButtonElement>, item: WardrobeItem) => void;
  onCancelDrag: () => void;
  onAskDelete: (item: WardrobeItem) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeIndex = items.length === 0 ? 0 : Math.min(activeIndex, items.length - 1);
  const activeItem = items[safeIndex];

  return (
    <section className={styles.rack}>
      <header className={styles.rackHeader}>
        <div><h2>{category}</h2><p>{items.length} prendas</p></div>
        <span>{items.length > 0 ? `${safeIndex + 1}/${items.length}` : "0/0"}</span>
      </header>
      <div className={styles.garmentCarousel}>
        <button
          type="button"
          className={styles.carouselArrow}
          aria-label={`Prenda anterior de ${category}`}
          disabled={items.length < 2}
          onClick={() => setActiveIndex((safeIndex - 1 + items.length) % items.length)}
        >
          ‹
        </button>

        {activeItem ? (
          <article
            key={activeItem.id}
            className={styles.garmentItem}
            style={{ "--sticker-angle": `${[-4, 3, -2][safeIndex % 3]}deg` } as CSSProperties}
          >
            <button type="button" className={styles.dragHandle} aria-label={`${activeItem.name}. Arrastrar al lienzo`} onPointerDown={(event) => onStartDrag(event, activeItem)} onPointerMove={onMoveDrag} onPointerUp={(event) => onFinishDrag(event, activeItem)} onPointerCancel={onCancelDrag}>
              <GarmentPicture item={activeItem} />
            </button>
            <button type="button" className={styles.deleteGarment} aria-label={`Eliminar ${activeItem.name}`} onClick={() => onAskDelete(activeItem)}>×</button>
          </article>
        ) : <p className={styles.emptyRack}>Sin prendas todavía</p>}

        <button
          type="button"
          className={styles.carouselArrow}
          aria-label={`Prenda siguiente de ${category}`}
          disabled={items.length < 2}
          onClick={() => setActiveIndex((safeIndex + 1) % items.length)}
        >
          ›
        </button>
      </div>
    </section>
  );
}

function GarmentEditor({ onClose, onSave }: { onClose: () => void; onSave: (item: WardrobeItem) => Promise<void> }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<WardrobeCategory>("Tops");
  const [image, setImage] = useState<GarmentImage | null>(null);
  const [error, setError] = useState("");

  function readImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Selecciona una imagen válida."); return; }
    if (file.size > 2_500_000) { setError("La imagen debe pesar menos de 2.5 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => { setImage({ kind: "upload", dataUrl: String(reader.result) }); setError(""); };
    reader.readAsDataURL(file);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !image) { setError("Agrega un nombre y una fotografía."); return; }
    await onSave({ id: crypto.randomUUID(), name: name.trim(), category, image, createdAt: new Date().toISOString() });
  }

  return (
    <div className={styles.editorBackdrop} role="presentation" onPointerDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className={styles.editorCard} role="dialog" aria-modal="true" aria-labelledby="garment-editor-title">
        <button type="button" className={styles.closeEditor} aria-label="Cerrar editor" onClick={onClose}>×</button>
        <p className={styles.editorEyebrow}>Nueva pieza</p>
        <h2 id="garment-editor-title">Añadir al armario</h2>
        <form onSubmit={submit}>
          <label>Nombre<input value={name} onChange={(event) => setName(event.target.value)} maxLength={40} /></label>
          <label>Categoría<select value={category} onChange={(event) => setCategory(event.target.value as WardrobeCategory)}>{categories.map((option) => <option key={option}>{option}</option>)}</select></label>
          <label className={styles.fileField}>Fotografía<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => readImage(event.target.files?.[0])} /><span>{image ? "Cambiar imagen" : "Elegir imagen"}</span></label>
          {image && <GarmentPicture item={{ id: "preview", name: "Vista previa", category, image, createdAt: "" }} className={styles.editorPreview} />}
          {error && <p className={styles.editorError} role="alert">{error}</p>}
          <button type="submit" className={styles.saveGarmentButton}>Guardar prenda</button>
        </form>
      </section>
    </div>
  );
}
