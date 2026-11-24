import { Suspense } from "react";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import { BotonWhatsApp } from "@/components/Pie";
import { obtenerAjustes } from "@/lib/ajustes";
import Reservar from "./Reservar";

export const metadata: Metadata = { title: "Reservar cita · Lady Nails Studio" };
export const revalidate = 3600;

export default async function Pagina() {
  const aj = await obtenerAjustes();
  return (
    <>
      <Nav simple />
      <main className="contenedor" style={{ paddingTop: 116, paddingBottom: 110 }}>
        <Suspense>
          <Reservar
            servicios={aj.servicios} horario={aj.horario} agenda={aj.agenda} abono={aj.abono}
            metodosPago={aj.metodosPago} politicas={aj.politicas}
            whatsapp={aj.negocio.whatsapp} direccion={aj.negocio.direccion}
          />
        </Suspense>
      </main>
      <BotonWhatsApp numero={aj.negocio.whatsapp} />
    </>
  );
}
