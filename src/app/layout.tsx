import type { Metadata } from "next";
import type { ReactNode } from "react";

import { TopMenu } from "@/shared/ui/top-menu/top-menu";

import "./globals.css";

export const metadata: Metadata = {
  title: "NekoFit",
  description: "Tu espacio personal para alimentación, entrenamiento y progreso.",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <body>
        <TopMenu />
        <div className="site-content">{children}</div>
      </body>
    </html>
  );
}
