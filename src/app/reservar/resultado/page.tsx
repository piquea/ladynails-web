import { Suspense } from "react";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import { BotonWhatsApp } from "@/components/Pie";
import { obtenerAjustes } from "@/lib/ajustes";
import Resultado from "./Resultado";

export const metadata: Metadata = { title: "Tu reserva · Lady Nails Studio", robots: { index: false } };

export default async function Pagina() {
  const aj = await obtenerAjustes();
  return (
    <>
      <Nav simple />
      <main className="contenedor" style={{ paddingTop: 120, paddingBottom: 90 }}>
        <Suspense><Resultado whatsapp={aj.negocio.whatsapp} direccion={aj.negocio.direccion} /></Suspense>
      </main>
      <BotonWhatsApp numero={aj.negocio.whatsapp} />
    </>
  );
}
