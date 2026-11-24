import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.URL || "https://ladynails.netlify.app"),
  title: "Lady Nails Studio · Manicure y pedicure en Chacarilla",
  description:
    "Rubber gel, builder gel, polygel, acrílicas y soft gel en Chacarilla, Surco. Reserva tu cita en línea con un abono y paga el resto en el studio.",
  icons: { icon: "/marca/icon-192.png", apple: "/marca/apple-icon.png" },
  openGraph: { title: "Lady Nails Studio", description: "Manicure y pedicure en Chacarilla. Reserva tu cita en línea.", images: ["/fotos/studio.webp"], locale: "es_PE" },
};

export const viewport: Viewport = { themeColor: "#722A2A" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-PE">
      <body>{children}</body>
    </html>
  );
}
