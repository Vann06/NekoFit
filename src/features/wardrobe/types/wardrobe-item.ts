export type WardrobeCategory = "Tops" | "Bottoms" | "Zapatos";

export type GarmentImage =
  | { kind: "sprite"; position: string; size?: string }
  | { kind: "upload"; dataUrl: string }
  | { kind: "cloudinary"; publicId: string; originalUrl: string; displayUrl: string };

export type WardrobeItem = {
  id: string;
  name: string;
  category: WardrobeCategory;
  image: GarmentImage;
  createdAt: string;
};

export type Outfit = Record<WardrobeCategory, WardrobeItem | null>;
