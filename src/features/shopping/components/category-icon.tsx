import type { ShoppingCategory } from "../types/shopping-item";

type CategoryIconProps = {
  category: ShoppingCategory;
};

export function CategoryIcon({ category }: CategoryIconProps) {
  const drawings: Record<ShoppingCategory, React.ReactNode> = {
    Frutas: (
      <>
        <path d="M12 8c-5-3-8 1-7 6 1 5 4 7 7 5 3 2 6 0 7-5 1-5-2-9-7-6Z" />
        <path d="M12 8c0-3 2-5 5-5M13 5c-2-2-4-2-6-1" />
      </>
    ),
    Verduras: (
      <>
        <path d="m8 8 9 2-7 11c-3-3-5-7-2-13Z" />
        <path d="M9 8C7 5 7 3 8 2M10 8c1-3 3-5 6-6M11 8c3-2 6-2 9-1" />
      </>
    ),
    Proteínas: (
      <>
        <path d="M15 4c4 1 6 5 4 9-2 4-7 6-10 3s-1-8 2-11c1-1 2-1 4-1Z" />
        <path d="m9 16-3 3M6 19l-2-1M6 19l1 2" />
      </>
    ),
    Cereales: (
      <>
        <path d="M12 21V5M12 9 8 6M12 13 7 10M12 17 7 14M12 9l4-3M12 13l5-3M12 17l5-3" />
      </>
    ),
    Lácteos: (
      <>
        <path d="M8 4h8l2 5v12H6V9Z" />
        <path d="M8 4v5h10M10 13h4" />
      </>
    ),
    Grasas: (
      <path d="M12 3S6 11 6 16a6 6 0 0 0 12 0c0-5-6-13-6-13Z" />
    ),
    Azúcares: (
      <>
        <path d="m4 9 5-3 5 3-5 3Z M4 9v6l5 3 5-3V9M9 12v6" />
        <path d="m13 6 3-2 4 2-4 2ZM16 8v5l4-2V6" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {drawings[category]}
    </svg>
  );
}
