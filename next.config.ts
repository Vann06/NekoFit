import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel ejecutará Next.js como aplicación full-stack.
  // Ya no usamos `output: "export"` porque necesitamos /api/exercises.
};

export default nextConfig;
