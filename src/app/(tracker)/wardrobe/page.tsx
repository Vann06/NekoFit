import type { Metadata } from "next";

import { WardrobeStudio } from "@/features/wardrobe/components/wardrobe-studio";

export const metadata: Metadata = {
  title: "Armario y outfits | NekoFit",
  description: "Organiza tus prendas y crea outfits interactivos con Michi.",
};

export default function WardrobePage() {
  return <WardrobeStudio />;
}
