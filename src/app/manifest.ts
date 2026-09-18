import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/dashboard",
    name: "NekoFit · Bienestar a tu ritmo",
    short_name: "NekoFit",
    description: "Planes semanales, entrenamientos, alimentación y progreso en un solo lugar.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#fff8e8",
    theme_color: "#c9e66b",
    categories: ["fitness", "health", "lifestyle"],
    icons: [
      { src: "/icons/nekofit-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/nekofit-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/nekofit-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Entrenamientos", short_name: "Workouts", url: "/workouts", icons: [{ src: "/icons/nekofit-192.png", sizes: "192x192" }] },
      { name: "Dashboard", short_name: "Inicio", url: "/dashboard", icons: [{ src: "/icons/nekofit-192.png", sizes: "192x192" }] },
    ],
  };
}
