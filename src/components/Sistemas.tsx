"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SISTEMAS, type Sistema } from "@/data/sistemas";
import { activos, buscar, duracionTexto, soles, type Servicio } from "@/lib/catalogo";

const ETIQUETA: Record<string, string> = { manicure: "Manicure", pedicure: "Pedicure", manipedi: "", retoque: "Retoque" };

export default function Sistemas({ servicios: todos }: { servicios: Servicio[] }) {
  const servicios = activos(todos);
  const porCodigo = (c: string) => buscar(servicios, c);
  const [abierto, setAbierto] = useState<Sistema | null>(null);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(null);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  return (
    <>
      <div className="tarjetas-5">
        {SISTEMAS.map((s) => {
          const precios = s.codigos.map((c) => porCodigo(c)?.precio).filter((x): x is number => x !== undefined);
          const desde = precios.length ? Math.min(...precios) : 0;
          return (
            <button key={s.id} className="tarjeta-foto" onClick={() => setAbierto(s)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.foto} alt="" loading="lazy" />
              <div className="vidrio">
                <h3>{s.nombre}</h3>
                <p>{s.bajada}</p>
                <div className="mas"><span>{desde ? `Desde ${soles(desde)}` : "Consúltanos"}</span><span>Ver más ↗</span></div>
              </div>
            </button>
          );
        })}
      </div>

      {abierto && (
        <div className="modal-fondo" onClick={() => setAbierto(null)}>
          <div className="modal" role="dialog" aria-modal="true" aria-label={abierto.nombre} onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="foto"><img src={abierto.foto} alt="" /></div>
            <div className="cuerpo">
              <button className="cerrar" aria-label="Cerrar" onClick={() => setAbierto(null)}>×</button>
              <p className="eyebrow">Sistema</p>
              <h3 className="titulo-m" style={{ marginTop: 6 }}>{abierto.nombre}</h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, marginTop: 18 }}>{abierto.descripcion}</p>
              {abierto.nota && <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--tinta-suave)" }}>{abierto.nota}</p>}
              <div className="recomendado"><span className="it" style={{ fontSize: 17 }}>Te lo recomendamos si</span><br />{abierto.recomendado}</div>
              <div className="lista-precios">
                {abierto.codigos.map((c) => {
                  const s = porCodigo(c);
                  if (!s) return null;
                  return (
                    <div key={c} className="fila-precio" style={{ gridTemplateColumns: "1fr auto auto" }}>
                      <span>{ETIQUETA[s.grupo] ? `${ETIQUETA[s.grupo]} · ` : ""}{s.nombre}<span className="inc">{duracionTexto(s.duracion)}</span></span>
                      <span className="pr">{soles(s.precio)}</span>
                      <Link href={`/reservar?s=${c}`} className="btn btn-oscuro btn-chico">Reservar</Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
