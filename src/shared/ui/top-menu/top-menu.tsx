"use client";

import Link from "next/link";
import { type CSSProperties, useEffect, useState } from "react";

import { FeatureIcon, type FeatureIconName } from "./feature-icon";
import styles from "./top-menu.module.css";

type MenuItem = {
  href: string;
  label: string;
  description: string;
  icon: FeatureIconName;
};

type MenuCardStyle = CSSProperties & {
  "--item-delay": string;
};

const menuItems: MenuItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Tu resumen diario de un vistazo.",
    icon: "dashboard",
  },
  {
    href: "/nutrition",
    label: "Alimentación",
    description: "Comidas, intercambios y macros.",
    icon: "nutrition",
  },
  {
    href: "/meal-planner",
    label: "Calendario",
    description: "Organiza tus comidas de la semana.",
    icon: "calendar",
  },
  {
    href: "/recipes",
    label: "Recetas",
    description: "Guarda y combina tus favoritas.",
    icon: "recipes",
  },
  {
    href: "/workouts",
    label: "Entrenamientos",
    description: "Rutinas, series, pesos e historial.",
    icon: "workouts",
  },
  {
    href: "/progress",
    label: "Progreso",
    description: "Observa tus tendencias corporales.",
    icon: "progress",
  },
  {
    href: "/shopping",
    label: "Compras",
    description: "Tu lista del súper siempre lista.",
    icon: "shopping",
  },
  {
    href: "/wardrobe",
    label: "Armario y outfits",
    description: "Crea combinaciones para cada entrenamiento.",
    icon: "wardrobe",
  },
];

export function TopMenu() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    function closeWithEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeWithEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeWithEscape);
    };
  }, [isOpen]);

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <>
      <div className={styles.headerLayers} aria-hidden="true">
        <span className={styles.headerBands} />
      </div>

      <header className={styles.header}>
        <span className={styles.headerTag}>Bienestar a tu ritmo</span>

        <button
          type="button"
          className={`${styles.menuButton} ${isOpen ? styles.menuButtonOpen : ""}`}
          aria-label={isOpen ? "Cerrar menú" : "Explorar"}
          aria-expanded={isOpen}
          aria-controls="main-feature-menu"
          onClick={() => setIsOpen((currentState) => !currentState)}
        >
          <span className={styles.menuButtonIcon} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>{isOpen ? "Cerrar menú" : "Explorar"}</span>
        </button>

        <Link href="/" className={styles.logo} onClick={closeMenu}>
          nekofit
        </Link>

        <Link href="/dashboard" className={styles.primaryAction} onClick={closeMenu}>
          Abrir app
        </Link>
      </header>

      <button
        type="button"
        className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ""}`}
        aria-label="Cerrar menú"
        tabIndex={isOpen ? 0 : -1}
        onClick={closeMenu}
      />

      <nav
        id="main-feature-menu"
        className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`}
        aria-label="Funcionalidades de NekoFit"
      >
        <div className={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.menuCard}
              style={{ "--item-delay": `${index * 75}ms` } as MenuCardStyle}
              onClick={closeMenu}
            >
              <span className={styles.featureIcon}>
                <FeatureIcon name={item.icon} />
              </span>
              <span className={styles.cardCopy}>
                <span className={styles.cardTitle}>{item.label}</span>
                <span className={styles.cardDescription}>{item.description}</span>
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
