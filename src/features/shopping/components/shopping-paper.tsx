"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";

import { initialShoppingItems } from "../data/initial-shopping-items";
import {
  shoppingCategories,
  type ShoppingCategory,
  type ShoppingItem,
} from "../types/shopping-item";
import { BasketDoodle } from "./basket-doodle";
import { CategoryIcon } from "./category-icon";
import styles from "../shopping.module.css";

type CategoryFilter = "Todas" | ShoppingCategory;
type ToastTone = "success" | "warning" | "info";

type ToastState = {
  id: string;
  tone: ToastTone;
  title: string;
  message: string;
};

export function ShoppingPaper() {
  const [items, setItems] = useState<ShoppingItem[]>(initialShoppingItems);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState<ShoppingCategory>("Verduras");
  const [filter, setFilter] = useState<CategoryFilter>("Todas");
  const [toast, setToast] = useState<ToastState | null>(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const visibleItems = filter === "Todas" ? items : items.filter((item) => item.category === filter);

  useEffect(() => {
    if (!toast) return;

    const timeoutId = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    if (!isCategoryOpen) return;

    function closeCategoryMenu(event: PointerEvent) {
      if (
        categoryDropdownRef.current
        && !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryOpen(false);
      }
    }

    function closeCategoryMenuWithEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsCategoryOpen(false);
    }

    document.addEventListener("pointerdown", closeCategoryMenu);
    window.addEventListener("keydown", closeCategoryMenuWithEscape);

    return () => {
      document.removeEventListener("pointerdown", closeCategoryMenu);
      window.removeEventListener("keydown", closeCategoryMenuWithEscape);
    };
  }, [isCategoryOpen]);

  function showToast(tone: ToastTone, title: string, message: string) {
    setToast({ id: crypto.randomUUID(), tone, title, message });
  }

  function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanName = name.trim();
    if (!cleanName) {
      showToast("warning", "Falta un producto", "Escribe qué necesitas antes de agregarlo.");
      return;
    }

    setItems((currentItems) => [
      ...currentItems,
      {
        id: crypto.randomUUID(),
        name: cleanName,
        quantity: quantity.trim() || "1 unidad",
        category,
        completed: false,
      },
    ]);
    setName("");
    setQuantity("");
    showToast("success", "¡Anotado!", `${cleanName} ya está esperando en tu lista.`);
  }

  function toggleItem(id: string) {
    const selectedItem = items.find((item) => item.id === id);
    if (!selectedItem) return;

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    );
    showToast(
      selectedItem.completed ? "info" : "success",
      selectedItem.completed ? "De vuelta a la lista" : "¡A la canasta!",
      selectedItem.completed
        ? `${selectedItem.name} vuelve a estar pendiente.`
        : `${selectedItem.name} quedó marcado como comprado.`,
    );
  }

  function removeItem(id: string) {
    const selectedItem = items.find((item) => item.id === id);
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
    if (selectedItem) {
      showToast("info", "Producto retirado", `${selectedItem.name} salió de la hoja.`);
    }
  }

  return (
    <>
      <section className={styles.paper} aria-labelledby="shopping-list-title">
      <span className={`${styles.tape} ${styles.tapeLeft}`} aria-hidden="true" />
      <span className={`${styles.tape} ${styles.tapeRight}`} aria-hidden="true" />
      <span className={styles.paperStar} aria-hidden="true">✦</span>

      <header className={styles.paperHeader}>
        <div>
          <p className={styles.paperEyebrow}>Lista de esta semana</p>
          <h2 id="shopping-list-title">Shopping list</h2>
        </div>
        <BasketDoodle />
      </header>

      <form className={styles.addForm} onSubmit={addItem} noValidate>
        <label className={styles.srOnly} htmlFor="product-name">Producto</label>
        <input
          id="product-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="¿Qué hace falta?"
          maxLength={60}
          aria-invalid={!name.trim() && toast?.tone === "warning"}
        />
        <label className={styles.srOnly} htmlFor="product-quantity">Cantidad</label>
        <input
          id="product-quantity"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          placeholder="Cantidad"
          maxLength={24}
        />
        <button type="submit" aria-label="Agregar producto">+</button>
        <fieldset className={styles.categoryPicker}>
          <legend className={styles.srOnly}>Categoría del producto</legend>
          <div className={styles.categoryDropdown} ref={categoryDropdownRef}>
            <button
              type="button"
              className={styles.categoryTrigger}
              aria-label={`Categoría seleccionada: ${category}. Abrir opciones`}
              aria-expanded={isCategoryOpen}
              aria-controls="shopping-category-menu"
              onClick={() => setIsCategoryOpen((currentState) => !currentState)}
            >
              <span>Categoría</span>
              <span className={styles.categoryChevron} aria-hidden="true">
                <svg viewBox="0 0 20 20">
                  <path d="m4 7 6 6 6-6" />
                </svg>
              </span>
            </button>

            {isCategoryOpen && (
              <div
                id="shopping-category-menu"
                className={styles.categoryMenu}
                role="menu"
                aria-label="Opciones de categoría"
              >
                {shoppingCategories.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`${styles.categoryOption} ${category === option ? styles.categoryActive : ""}`}
                    role="menuitemradio"
                    aria-checked={category === option}
                    aria-label={option}
                    onClick={() => {
                      setCategory(option);
                      setIsCategoryOpen(false);
                    }}
                  >
                    <CategoryIcon category={option} />
                    <span className={styles.srOnly}>{option}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </fieldset>
      </form>

      <div className={styles.filterRow} aria-label="Filtrar por categoría">
        {(["Todas", ...shoppingCategories] as CategoryFilter[]).map((option) => (
          <button
            key={option}
            type="button"
            className={filter === option ? styles.filterActive : undefined}
            aria-pressed={filter === option}
            onClick={() => setFilter(option)}
          >
            {option}
          </button>
        ))}
      </div>

      <div className={styles.listArea}>
        <span className={styles.marginLine} aria-hidden="true" />
        {visibleItems.length > 0 ? (
          <ul className={styles.shoppingList}>
            {visibleItems.map((item) => (
              <li key={item.id} className={item.completed ? styles.itemCompleted : undefined}>
                <label>
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleItem(item.id)}
                  />
                  <span className={styles.checkmark} aria-hidden="true">✓</span>
                  <span className={styles.itemCopy}>
                    <strong>{item.name}</strong>
                    <small>{item.quantity}</small>
                  </span>
                </label>
                <button
                  type="button"
                  className={styles.deleteButton}
                  aria-label={`Eliminar ${item.name}`}
                  onClick={() => removeItem(item.id)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyMessage}>Esta sección está lista para algo rico ✦</p>
        )}
      </div>

      </section>

      {toast && (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[`toast${toast.tone}`]}`}
          role={toast.tone === "warning" ? "alert" : "status"}
          aria-live={toast.tone === "warning" ? "assertive" : "polite"}
        >
          <span className={styles.toastIcon} aria-hidden="true">
            {toast.tone === "success" ? "✓" : toast.tone === "warning" ? "!" : "♡"}
          </span>
          <span className={styles.toastCopy}>
            <strong>{toast.title}</strong>
            <small>{toast.message}</small>
          </span>
          <button type="button" aria-label="Cerrar aviso" onClick={() => setToast(null)}>×</button>
          <span className={styles.toastTimer} aria-hidden="true" />
        </div>
      )}
    </>
  );
}
