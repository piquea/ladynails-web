import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Pie, { BotonWhatsApp } from "@/components/Pie";
import Markdown from "@/components/Markdown";
import { TERMINOS } from "@/data/terminos";
import { obtenerAjustes } from "@/lib/ajustes";

export const metadata: Metadata = { title: "Términos y condiciones · Lady Nails Studio" };
export const revalidate = 3600;

export default async function Terminos() {
  const aj = await obtenerAjustes();
  return (
    <>
      <Nav simple />
      <main className="contenedor" style={{ paddingTop: 120, paddingBottom: 80 }}>
        <article className="legal-doc"><Markdown texto={TERMINOS} /></article>
      </main>
      <Pie aj={aj} />
      <BotonWhatsApp numero={aj.negocio.whatsapp} />
    </>
  );
}
