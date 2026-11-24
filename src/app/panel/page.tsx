import type { Metadata } from "next";
import { autenticado, panelConfigurado } from "@/lib/sesion";
import { supabaseConfigurado } from "@/lib/supabase";
import Login from "./Login";
import Panel from "./Panel";

export const metadata: Metadata = { title: "Panel · Lady Nails", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Pagina() {
  if (!panelConfigurado())
    return (
      <main className="pn-login">
        <div className="pn-caja">
          <h1>Panel no activado</h1>
          <p>Agrega la variable <b>ADMIN_CLAVE</b> (mínimo 8 caracteres) en Netlify → Project configuration → Environment variables y vuelve a publicar.</p>
        </div>
      </main>
    );
  if (!(await autenticado())) return <Login />;
  return <Panel supabase={supabaseConfigurado()} />;
}
