export const shoppingCategories = [
  "Frutas",
  "Verduras",
  "Proteínas",
  "Cereales",
  "Lácteos",
  "Grasas",
  "Azúcares",
] as const;

export type ShoppingCategory = (typeof shoppingCategories)[number];

export type ShoppingItem = {
  id: string;
  name: string;
  quantity: string;
  category: ShoppingCategory;
  completed: boolean;
};
