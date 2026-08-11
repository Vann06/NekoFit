import type { ShoppingItem } from "../types/shopping-item";

export const initialShoppingItems: ShoppingItem[] = [
  { id: "eggs", name: "Huevos", quantity: "12 unidades", category: "Proteínas", completed: true },
  { id: "oats", name: "Avena en hojuelas", quantity: "1 bolsa", category: "Cereales", completed: true },
  { id: "spinach", name: "Espinaca", quantity: "2 manojos", category: "Verduras", completed: false },
  { id: "yogurt", name: "Yogur griego", quantity: "4 unidades", category: "Lácteos", completed: false },
  { id: "bananas", name: "Bananas", quantity: "6 unidades", category: "Frutas", completed: false },
  { id: "olive-oil", name: "Aceite de oliva", quantity: "1 botella", category: "Grasas", completed: false },
];
