"use client";

import { type FormEvent, useEffect, useState } from "react";

import { defaultGarments } from "../data/default-garments";
import { deleteWardrobeItem, getWardrobeItems, saveWardrobeItem } from "../repositories/wardrobe-repository";
import type { GarmentImage, WardrobeCategory, WardrobeItem } from "../types/wardrobe-item";
import { GarmentPicture } from "./garment-picture";
import styles from "../wardrobe.module.css";

const categories: WardrobeCategory[] = ["Tops", "Bottoms", "Zapatos"];
const initialIndexes: Record<WardrobeCategory, number> = { Tops: 0, Bottoms: 0, Zapatos: 0 };
const categoryLabels: Record<WardrobeCategory, string> = {
  Tops: "Top",
  Bottoms: "Parte inferior",
  Zapatos: "Zapatos",
};

export function WardrobeStudio() {
  const [items, setItems] = useState<WardrobeItem[]>(defaultGarments);
  const [activeIndexes, setActiveIndexes] = useState(initialIndexes);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<WardrobeItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    getWardrobeItems().then(setItems).catch(() => setToast("Usaremos el armario de esta sesión."));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  function itemsByCategory(category: WardrobeCategory) {
    return items.filter((item) => item.category === category);
  }

  function cycle(category: WardrobeCategory, direction: -1 | 1) {
    const categoryItems = itemsByCategory(category);
    if (categoryItems.length < 2) return;
    setActiveIndexes((current) => ({
      ...current,
      [category]: (current[category] + direction + categoryItems.length) % categoryItems.length,
    }));
  }

  async function createItem(item: WardrobeItem) {
    await saveWardrobeItem(item);
    const categoryLength = itemsByCategory(item.category).length;
    setItems((currentItems) => [...currentItems, item]);
    setActiveIndexes((current) => ({ ...current, [item.category]: categoryLength }));
    setIsEditorOpen(false);
    setToast("Prenda añadida al carrusel ✦");
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const item = pendingDelete;
    await deleteWardrobeItem(item.id);
    const remainingInCategory = itemsByCategory(item.category).filter((currentItem) => currentItem.id !== item.id).length;
    setItems((currentItems) => currentItems.filter((currentItem) => currentItem.id !== item.id));
    setActiveIndexes((current) => ({
      ...current,
      [item.category]: Math.min(current[item.category], Math.max(0, remainingInCategory - 1)),
    }));
    setPendingDelete(null);
    setToast(`${item.name} fue eliminada`);
  }

  function resetLook() {
    setActiveIndexes(initialIndexes);
    setToast("Volvimos al primer look");
  }

  return (
    <main className={styles.wardrobePage}>
      <header className={styles.pageIntro}>
        <div>
          <p className={styles.eyebrow}>Closet mix / 01</p>
          <h1>Mi armario</h1>
        </div>
        <button type="button" className={styles.addGarmentButton} onClick={() => setIsEditorOpen(true)}>
          <span aria-hidden="true">＋</span>Nueva prenda
        </button>
      </header>

      <section className={styles.outfitMixer} aria-label="Carrusel para crear outfits">
        <div className={styles.mixerHeading}>
          <span aria-hidden="true">✦</span>
          <h2>Outfit de hoy</h2>
          <span aria-hidden="true">✦</span>
        </div>

        <div className={styles.carouselStack}>
          {categories.map((category) => {
            const categoryItems = itemsByCategory(category);
            const safeIndex = categoryItems.length === 0 ? 0 : Math.min(activeIndexes[category], categoryItems.length - 1);
            return (
              <GarmentCarousel
                key={category}
                category={category}
                items={categoryItems}
                activeIndex={safeIndex}
                onPrevious={() => cycle(category, -1)}
                onNext={() => cycle(category, 1)}
                onDelete={setPendingDelete}
              />
            );
          })}
        </div>

        <footer className={styles.mixerFooter}>
          <p>Usa las flechas hasta encontrar tu combinación.</p>
          <button type="button" className={styles.resetButton} onClick={resetLook}>Reset</button>
        </footer>
      </section>

      {isEditorOpen && <GarmentEditor onClose={() => setIsEditorOpen(false)} onSave={createItem} />}
      {pendingDelete && (
        <div className={styles.confirmToast} role="alertdialog" aria-label={`Confirmar eliminación de ${pendingDelete.name}`}>
          <div><strong>¿Borrar esta prenda?</strong><small>{pendingDelete.name}</small></div>
          <button type="button" onClick={() => setPendingDelete(null)}>Cancelar</button>
          <button type="button" onClick={confirmDelete}>Borrar</button>
        </div>
      )}
      {toast && !pendingDelete && <div className={styles.toast} role="status">{toast}</div>}
    </main>
  );
}

function GarmentCarousel({ category, items, activeIndex, onPrevious, onNext, onDelete }: {
  category: WardrobeCategory;
  items: WardrobeItem[];
  activeIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  onDelete: (item: WardrobeItem) => void;
}) {
  const activeItem = items[activeIndex];

  return (
    <section className={`${styles.carouselSlot} ${styles[`slot${category}`]}`} aria-label={categoryLabels[category]}>
      <header>
        <span>{categoryLabels[category]}</span>
        <small>{items.length > 0 ? `${activeIndex + 1} / ${items.length}` : "0 / 0"}</small>
      </header>
      <div className={styles.carouselControls}>
        <button type="button" className={styles.carouselArrow} aria-label={`${categoryLabels[category]} anterior`} disabled={items.length < 2} onClick={onPrevious}>←</button>
        {activeItem ? (
          <article key={activeItem.id} className={styles.garmentCard}>
            <GarmentPicture item={activeItem} />
            <strong>{activeItem.name}</strong>
            <button type="button" className={styles.deleteGarment} aria-label={`Eliminar ${activeItem.name}`} onClick={() => onDelete(activeItem)}>×</button>
          </article>
        ) : <p className={styles.emptySlot}>Agrega una prenda</p>}
        <button type="button" className={styles.carouselArrow} aria-label={`Siguiente ${categoryLabels[category]}`} disabled={items.length < 2} onClick={onNext}>→</button>
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
          <label>Categoría<select value={category} onChange={(event) => setCategory(event.target.value as WardrobeCategory)}>{categories.map((option) => <option key={option} value={option}>{categoryLabels[option]}</option>)}</select></label>
          <label className={styles.fileField}>Fotografía<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => readImage(event.target.files?.[0])} /><span>{image ? "Cambiar imagen" : "Elegir imagen"}</span></label>
          {image && <GarmentPicture item={{ id: "preview", name: "Vista previa", category, image, createdAt: "" }} className={styles.editorPreview} />}
          {error && <p className={styles.editorError} role="alert">{error}</p>}
          <button type="submit" className={styles.saveGarmentButton}>Guardar prenda</button>
        </form>
      </section>
    </div>
  );
}
