import type { WardrobeItem } from "../types/wardrobe-item";

const createdAt = "2026-08-10T00:00:00.000Z";

export const defaultGarments: WardrobeItem[] = [
  { id: "cream-knit", name: "Top tejido crema", category: "Tops", image: { kind: "sprite", position: "0% 0%" }, createdAt },
  { id: "sage-cardigan", name: "Cardigan salvia", category: "Tops", image: { kind: "sprite", position: "50% 0%" }, createdAt },
  { id: "lilac-tank", name: "Top deportivo lila", category: "Tops", image: { kind: "sprite", position: "100% 0%" }, createdAt },
  { id: "blue-jeans", name: "Jeans clásicos", category: "Bottoms", image: { kind: "sprite", position: "0% 54%" }, createdAt },
  { id: "yellow-shorts", name: "Short amarillo", category: "Bottoms", image: { kind: "sprite", position: "50% 54%" }, createdAt },
  { id: "terracotta-skirt", name: "Falda terracota", category: "Bottoms", image: { kind: "sprite", position: "100% 54%" }, createdAt },
  { id: "cream-sneakers", name: "Tenis crema", category: "Zapatos", image: { kind: "sprite", position: "3% 100%", size: "340%" }, createdAt },
  { id: "brown-boots", name: "Botines café", category: "Zapatos", image: { kind: "sprite", position: "50% 100%", size: "340%" }, createdAt },
  { id: "sage-runners", name: "Tenis salvia", category: "Zapatos", image: { kind: "sprite", position: "96% 100%", size: "340%" }, createdAt },
];
