import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Pie, { BotonWhatsApp } from "@/components/Pie";
import { obtenerAjustes } from "@/lib/ajustes";
import Formulario from "./Formulario";

export const metadata: Metadata = { title: "Libro de Reclamaciones · Lady Nails Studio" };
export const revalidate = 3600;

export default async function Libro() {
  const aj = await obtenerAjustes();
  const N = aj.negocio;
  return (
    <>
      <Nav simple />
      <main className="contenedor" style={{ paddingTop: 120, paddingBottom: 80 }}>
        <Formulario proveedor={{ razonSocial: N.razonSocial, ruc: N.ruc, direccion: N.direccion, nombre: N.nombre }} />
      </main>
      <Pie aj={aj} />
      <BotonWhatsApp numero={N.whatsapp} />
    </>
  );
}
