"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Ajustes } from "@/lib/ajustes";
import { GRUPOS, GRUPOS_EXTRA, activos, buscar, calcularReserva, duracionTexto, soles } from "@/lib/catalogo";
import { ahoraLima, diaAbierto, fechaLarga, hora12, sumarDias } from "@/lib/agenda";

const PASOS = ["Servicios", "Fecha y hora", "Tus datos", "Abono"];
type Listo = { codigo: string; whatsapp: string; guardado: boolean };

type Props = Pick<Ajustes, "servicios" | "horario" | "agenda" | "abono" | "metodosPago" | "politicas"> & { whatsapp: string; direccion: string };

export default function Reservar({ servicios: todos, horario, agenda: AGENDA, abono, metodosPago: METODOS_PAGO, politicas: POLITICAS, direccion }: Props) {
  const SERVICIOS = useMemo(() => activos(todos), [todos]);
  const porCodigo = (c: string) => buscar(SERVICIOS, c);
  const sp = useSearchParams();
  const [paso, setPaso] = useState(0);
  const [sel, setSel] = useState<string[]>(() => {
    const s = sp.get("s");
    return s && porCodigo(s) ? [s] : [];
  });
  const [grupo, setGrupo] = useState(() => porCodigo(sp.get("s") ?? "")?.grupo ?? "manicure");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [horas, setHoras] = useState<string[] | null>(null);
  const [cargando, setCargando] = useState(false);
  const [cliente, setCliente] = useState({ nombre: "", celular: "", email: "", primeraVez: true });
  const [notas, setNotas] = useState("");
  const [pago, setPago] = useState(METODOS_PAGO[0]?.id ?? "");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [acepto, setAcepto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [listo, setListo] = useState<Listo | null>(null);
  const [recarga, setRecarga] = useState(0);

  const r = useMemo(() => calcularReserva(sel, todos, abono.monto), [sel, todos, abono.monto]);

  // Se calcula en el navegador (la página se genera una vez y "hoy" cambia cada día)
  const [dias, setDias] = useState<string[]>([]);
  useEffect(() => {
    const hoy = ahoraLima().fecha;
    setDias(Array.from({ length: AGENDA.diasAdelante + 1 }, (_, i) => sumarDias(hoy, i)).filter((d) => diaAbierto(d, horario)));
  }, []);

  // Al cambiar servicios o fecha, la hora elegida puede dejar de servir
  useEffect(() => {
    if (!fecha || !r.duracion) return;
    let vivo = true;
    setCargando(true);
    setHoras(null);
    fetch(`/api/disponibilidad?fecha=${fecha}&duracion=${r.duracion}`)
      .then((x) => x.json())
      .then((j) => {
        if (!vivo) return;
        setHoras(j.horas ?? []);
        setHora((h) => (j.horas ?? []).includes(h) ? h : "");
      })
      .catch(() => vivo && setHoras([]))
      .finally(() => vivo && setCargando(false));
    return () => { vivo = false; };
  }, [fecha, r.duracion, recarga]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [paso, listo]);

  const alternar = (c: string) => {
    const s = porCodigo(c)!;
    setSel((prev) => {
      if (prev.includes(c)) return prev.filter((x) => x !== c);
      // Un solo servicio por grupo (no tiene sentido 2 manicures), salvo extras distintos
      const sinMismoGrupo = prev.filter((x) => porCodigo(x)?.grupo !== s.grupo);
      // ManiPedi ya incluye manicure y pedicure
      if (s.grupo === "manipedi") return [...sinMismoGrupo.filter((x) => !["manicure", "pedicure"].includes(porCodigo(x)!.grupo)), c];
      if (["manicure", "pedicure"].includes(s.grupo)) return [...sinMismoGrupo.filter((x) => porCodigo(x)?.grupo !== "manipedi"), c];
      return [...sinMismoGrupo, c];
    });
  };

  const celularOk = cliente.celular.replace(/\D/g, "").length >= 9;
  const puede = [
    r.tienePrincipal,
    !!fecha && !!hora,
    cliente.nombre.trim().length >= 2 && celularOk,
    acepto && !!archivo,
  ];

  async function confirmar() {
    setError("");
    setEnviando(true);
    try {
      const f = new FormData();
      f.append("datos", JSON.stringify({ servicios: sel, fecha, hora, cliente, notas, pago, acepto }));
      if (archivo) f.append("constancia", archivo);
      const res = await fetch("/api/reservas", { method: "POST", body: f });
      const j = await res.json();
      if (!res.ok) {
        setError(j.error || "No pudimos registrar tu reserva.");
        if (res.status === 409) { setPaso(1); setHora(""); setRecarga((n) => n + 1); }
        return;
      }
      setListo(j);
    } catch {
      setError("Se perdió la conexión. Revisa tu internet e intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  if (listo) {
    return (
      <div className="reserva-listo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/marca/emblema-vino.png" alt="" width={70} height={59} style={{ margin: "0 auto 18px" }} />
        <p className="eyebrow">Reserva {listo.codigo}</p>
        <h1 className="titulo-l" style={{ margin: "10px 0 16px" }}>¡Listo, <span className="it">{cliente.nombre.split(" ")[0]}!</span></h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, maxWidth: 520, margin: "0 auto" }}>
          Recibimos tu reserva para el <b>{fechaLarga(fecha).toLowerCase()}</b> a las <b>{hora12(hora)}</b>. Vamos a validar tu abono de <b>{soles(r.abono)}</b> y te confirmamos por WhatsApp.
        </p>
        <p className="chica" style={{ margin: "14px auto 26px", maxWidth: 420 }}>Saldo a pagar en el studio: {soles(r.saldo)}. {direccion}.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <a className="btn btn-oscuro" href={listo.whatsapp} target="_blank" rel="noopener">Enviar mi reserva por WhatsApp</a>
          <Link className="btn btn-claro" href="/">Volver al inicio</Link>
        </div>
        {!listo.guardado && <p className="chica" style={{ margin: "18px auto 0" }}>Importante: envía tu reserva por WhatsApp para que la registremos.</p>}
      </div>
    );
  }

  return (
    <div className="reserva">
      <div className="reserva-main">
        <ol className="pasos">
          {PASOS.map((p, i) => (
            <li key={p} className={i === paso ? "activo" : i < paso ? "hecho" : ""}>
              <button disabled={i > paso && !puede.slice(0, i).every(Boolean)} onClick={() => setPaso(i)}>
                <span>{i + 1}</span>{p}
              </button>
            </li>
          ))}
        </ol>

        {paso === 0 && (
          <section>
            <h1 className="titulo-m">¿Qué te hacemos <span className="it">hoy?</span></h1>
            <p className="ayuda">Elige un servicio principal. Puedes sumar pedicure, retiro o diseño.</p>
            <div className="pestanas" style={{ marginTop: 22 }}>
              {GRUPOS.map((g) => {
                const n = sel.filter((c) => porCodigo(c)?.grupo === g.id).length;
                return (
                  <button key={g.id} className={`pestana ${grupo === g.id ? "activa" : ""}`} onClick={() => setGrupo(g.id)}>
                    {g.nombre}{n ? " ·  ✓" : ""}
                  </button>
                );
              })}
            </div>
            {GRUPOS_EXTRA.includes(grupo) && <p className="ayuda">Se agrega a tu servicio principal.</p>}
            <div className="opciones">
              {SERVICIOS.filter((s) => s.grupo === grupo).map((s) => {
                const on = sel.includes(s.codigo);
                return (
                  <button key={s.codigo} className={`opcion ${on ? "on" : ""}`} onClick={() => alternar(s.codigo)} aria-pressed={on}>
                    <span className="check">{on ? "✓" : ""}</span>
                    <span className="nom">{s.nombre}{s.incluye && <small>{s.incluye.join(" + ")}</small>}</span>
                    <span className="meta">{duracionTexto(s.duracion)}</span>
                    <span className="pr">{s.precio ? soles(s.precio) : "Incluido"}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {paso === 1 && (
          <section>
            <h1 className="titulo-m">Elige tu <span className="it">momento</span></h1>
            <p className="ayuda">Tu cita dura aprox. {duracionTexto(r.duracion)}. Solo te mostramos horas con una manicurista libre.</p>
            <div className="dias">
              {dias.map((d) => {
                const dt = new Date(`${d}T12:00:00Z`);
                return (
                  <button key={d} className={`dia ${fecha === d ? "on" : ""}`} onClick={() => setFecha(d)}>
                    <small>{dt.toLocaleDateString("es-PE", { weekday: "short", timeZone: "UTC" }).replace(".", "")}</small>
                    <b>{dt.getUTCDate()}</b>
                    <small>{dt.toLocaleDateString("es-PE", { month: "short", timeZone: "UTC" }).replace(".", "")}</small>
                  </button>
                );
              })}
            </div>
            {!fecha && <p className="ayuda">Elige un día para ver las horas disponibles.</p>}
            {fecha && (
              <>
                <p className="eyebrow" style={{ marginTop: 26 }}>{fechaLarga(fecha)}</p>
                {cargando && <p className="ayuda">Revisando la agenda…</p>}
                {horas && !horas.length && <p className="ayuda">Este día ya no tiene horas libres para tu servicio. Prueba con otro día.</p>}
                <div className="horas">
                  {(horas ?? []).map((h) => (
                    <button key={h} className={`hora ${hora === h ? "on" : ""}`} onClick={() => setHora(h)}>{hora12(h)}</button>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {paso === 2 && (
          <section>
            <h1 className="titulo-m">Cuéntanos de <span className="it">ti</span></h1>
            <div className="campos">
              <label>Nombre y apellido *<input value={cliente.nombre} onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })} autoComplete="name" /></label>
              <label>Celular (WhatsApp) *<input value={cliente.celular} onChange={(e) => setCliente({ ...cliente, celular: e.target.value })} inputMode="tel" autoComplete="tel" placeholder="987 654 321" /></label>
              <label className="ancho">Correo (opcional)<input type="email" value={cliente.email} onChange={(e) => setCliente({ ...cliente, email: e.target.value })} autoComplete="email" /></label>
              <div className="ancho">
                <span className="etq">¿Es tu primera vez en Lady Nails?</span>
                <div className="pestanas" style={{ marginTop: 8 }}>
                  <button className={`pestana ${cliente.primeraVez ? "activa" : ""}`} onClick={() => setCliente({ ...cliente, primeraVez: true })}>Sí, es mi primera vez</button>
                  <button className={`pestana ${!cliente.primeraVez ? "activa" : ""}`} onClick={() => setCliente({ ...cliente, primeraVez: false })}>Ya he venido</button>
                </div>
              </div>
              <label className="ancho">Notas para tu manicurista (opcional)<textarea rows={3} value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Forma, largo, color, o si tienes una referencia de diseño" /></label>
            </div>
          </section>
        )}

        {paso === 3 && (
          <section>
            <h1 className="titulo-m">Separa tu hora con un <span className="it">abono</span></h1>
            <p className="ayuda">Paga el abono de {soles(r.abono)} y sube tu constancia. El saldo de {soles(r.saldo)} lo pagas en el studio.</p>
            <div className="pestanas" style={{ marginTop: 20 }}>
              {METODOS_PAGO.map((m) => (
                <button key={m.id} className={`pestana ${pago === m.id ? "activa" : ""}`} onClick={() => setPago(m.id)}>{m.nombre}</button>
              ))}
            </div>
            <div className="datos-pago">
              {METODOS_PAGO.filter((m) => m.id === pago).map((b) => (
                <div key={b.id}>
                  <span className="etq">{b.titulo}</span>
                  {b.lineas.map((l) => (
                    <p key={l}>{l}<button onClick={() => navigator.clipboard?.writeText(l.replace(/\s/g, ""))}>Copiar</button></p>
                  ))}
                </div>
              ))}
            </div>
            <label className={`subir ${archivo ? "on" : ""}`}>
              <input type="file" accept="image/*,application/pdf" onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} hidden />
              <b>{archivo ? `📎 ${archivo.name}` : "Subir constancia de pago *"}</b>
              <span>{archivo ? "Toca para cambiarla" : "Captura de pantalla o PDF, hasta 5 MB"}</span>
            </label>
            <div className="politicas">
              {POLITICAS.map((p) => <p key={p}>{p}</p>)}
            </div>
            <label className="acepto">
              <input type="checkbox" checked={acepto} onChange={(e) => setAcepto(e.target.checked)} />
              <span>Leí y acepto los <a href="/terminos" target="_blank" style={{ textDecoration: "underline" }}>Términos y condiciones</a> y la política de privacidad.</span>
            </label>
          </section>
        )}

        {error && <p className="error">{error}</p>}

        <div className="nav-pasos">
          {paso > 0 ? <button className="btn btn-claro" onClick={() => setPaso(paso - 1)}>Atrás</button> : <Link href="/" className="btn btn-claro">Volver</Link>}
          {paso < 3 ? (
            <button className="btn btn-oscuro" disabled={!puede[paso]} onClick={() => setPaso(paso + 1)}>Continuar</button>
          ) : (
            <button className="btn btn-oscuro" disabled={!puede[3] || enviando} onClick={confirmar}>{enviando ? "Enviando…" : "Confirmar reserva"}</button>
          )}
        </div>
      </div>

      <aside className="resumen">
        <p className="eyebrow">Tu reserva</p>
        {!r.items.length && <p className="ayuda">Aún no eliges servicios.</p>}
        {r.items.map((s) => (
          <div key={s.codigo} className="res-item">
            <span>{GRUPOS.find((g) => g.id === s.grupo)?.nombre} · {s.nombre}<small>{duracionTexto(s.duracion)}</small></span>
            <span>{s.precio ? soles(s.precio) : "—"}</span>
            {paso === 0 && <button aria-label="Quitar" onClick={() => alternar(s.codigo)}>×</button>}
          </div>
        ))}
        {fecha && hora && <p className="res-cuando">{fechaLarga(fecha)}<br />{hora12(hora)} · {duracionTexto(r.duracion)}</p>}
        {r.items.length > 0 && (
          <div className="res-total">
            <p><span>Total</span><span>{soles(r.total)}</span></p>
            <p className="abono"><span>Abono para reservar</span><span>{soles(r.abono)}</span></p>
            <p><span>Saldo en el studio</span><span>{soles(r.saldo)}</span></p>
          </div>
        )}
      </aside>
    </div>
  );
}
