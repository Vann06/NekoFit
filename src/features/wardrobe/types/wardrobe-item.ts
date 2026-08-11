export type WardrobeCategory = "Tops" | "Bottoms" | "Zapatos";

export type GarmentImage =
  | { kind: "sprite"; position: string; size?: string }
  | { kind: "upload"; dataUrl: string };

export type WardrobeItem = {
  id: string;
  name: string;
  category: WardrobeCategory;
  image: GarmentImage;
  createdAt: string;
};

export type Outfit = Record<WardrobeCategory, WardrobeItem | null>;
