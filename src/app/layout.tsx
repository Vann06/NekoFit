import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { PwaRegister } from "@/shared/pwa/pwa-register";
import { TopMenu } from "@/shared/ui/top-menu/top-menu";

import "./globals.css";

export const metadata: Metadata = {
  title: { default: "NekoFit", template: "%s | NekoFit" },
  description: "Tu espacio personal para alimentación, entrenamiento y progreso.",
  applicationName: "NekoFit",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "NekoFit" },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icons/nekofit-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/nekofit-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#c9e66b",
  colorScheme: "light",
  viewportFit: "cover",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body>
        <PwaRegister />
        <TopMenu />
        <div className="site-content">{children}</div>
      </body>
    </html>
  );
}
