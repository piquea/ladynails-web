"use client";

import Link from "next/link";
import { useState } from "react";
import { GRUPOS, activos, duracionTexto, soles, type Servicio } from "@/lib/catalogo";

export default function Precios({ servicios }: { servicios: Servicio[] }) {
  const [grupo, setGrupo] = useState("manicure");
  const lista = activos(servicios).filter((s) => s.grupo === grupo);
  return (
    <div>
      <div className="pestanas" role="tablist">
        {GRUPOS.map((g) => (
          <button key={g.id} role="tab" aria-selected={grupo === g.id} className={`pestana ${grupo === g.id ? "activa" : ""}`} onClick={() => setGrupo(g.id)}>
            {g.nombre}
          </button>
        ))}
      </div>
      <div className="lista-precios">
        {lista.map((s) => (
          <div key={s.codigo} className="fila-precio">
            <span>
              {s.nombre}
              {s.incluye && <span className="inc">{s.incluye.join(" + ")}</span>}
            </span>
            <span className="dur">{duracionTexto(s.duracion)}</span>
            <span className="pr">{s.precio ? soles(s.precio) : "Incluido"}</span>
            <Link className="mas-btn" href={`/reservar?s=${s.codigo}`} aria-label={`Reservar ${s.nombre}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M7 17L17 7M8 7h9v9" /></svg>
            </Link>
          </div>
        ))}
      </div>
      {grupo === "retiro" && <p className="chica" style={{ maxWidth: 560, marginTop: 14 }}>Si tu trabajo anterior lo hicimos en Lady Nails, el retiro del esmaltado gel y del rubber gel no tiene costo.</p>}
      {grupo === "diseno" && <p className="chica" style={{ maxWidth: 560, marginTop: 14 }}>El diseño se agrega a tu manicure o pedicure. Si tienes una referencia, adjúntala por WhatsApp al confirmar tu cita.</p>}
    </div>
  );
}
