import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Series | Catálogo personal",
  description: "Administra tus plataformas, series y valoraciones en un solo lugar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
