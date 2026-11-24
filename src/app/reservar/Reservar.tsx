"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Ajustes } from "@/lib/ajustes";
import { activos, buscar, duracionTexto, enOferta, soles, type Servicio } from "@/lib/catalogo";
import { ahoraLima, diaAbierto, fechaLarga, hora12, sumarDias } from "@/lib/agenda";
import { DISENO_BASE, SISTEMAS_ACTUALES, armar, packSugerido, type Seleccion } from "@/lib/flujo";

/* eslint-disable @next/next/no-img-element */

const PASOS = ["Tus manos", "Pedicure", "Diseño", "Fecha y hora", "Tus datos", "Abono"];
type Listo = { codigo: string; whatsapp: string; guardado: boolean };
type Props = Pick<Ajustes, "servicios" | "horario" | "agenda" | "abono" | "metodosPago" | "politicas"> & {
  whatsapp: string; direccion: string; tarjeta: { disponible: boolean; cobrar: "abono" | "total" };
};
const SUBS = [["Tradicionales", "Tradicionales"], ["Gel", "Gel"], ["Extensiones", "Sistemas y extensiones"]] as const;

/** Selección inicial cuando llegan desde un botón "Reservar" de la web (?s=CÓDIGO) */
function desdeCodigo(c: string | null, S: Servicio[]): Seleccion {
  const s = c ? buscar(S, c) : undefined;
  if (!s) return { diseno: DISENO_BASE };
  if (s.grupo === "manicure") return { modo: "libre", manicure: c!, diseno: DISENO_BASE };
  if (s.grupo === "manipedi") return { modo: "libre", pack: c!, quierePedi: true, diseno: DISENO_BASE };
  if (s.grupo === "pedicure") return { modo: "pedi", pedicure: c!, diseno: DISENO_BASE };
  if (s.grupo === "retoque") return { modo: "sistema", sistema: SISTEMAS_ACTUALES.find((x) => x.retoque === c)?.id, accion: "retoque", diseno: DISENO_BASE };
  if (s.grupo === "retiro") return { modo: "sistema", sistema: SISTEMAS_ACTUALES.find((x) => x.retiro === c)?.id, accion: "retiro", diseno: DISENO_BASE };
  if (s.grupo === "diseno") return { diseno: c! };
  return { diseno: DISENO_BASE };
}

function Opcion({ s, on, onClick, extra }: { s: Servicio; on: boolean; onClick: () => void; extra?: string }) {
  return (
    <button className={`opcion ${on ? "on" : ""}`} onClick={onClick} aria-pressed={on}>
      <span className="check">{on ? "✓" : ""}</span>
      <span className="nom">{s.nombre}{(s.detalle || extra) && <small>{extra ?? s.detalle}</small>}</span>
      <span className="meta">{duracionTexto(s.duracion)}</span>
      <span className="pr">{enOferta(s) && <s className="antes">{soles(s.precioAntes!)}</s>}{s.precio ? soles(s.precio) : "Incluido"}</span>
    </button>
  );
}

function SubirFoto({ archivo, setArchivo, titulo, texto, icono = "📸" }: { archivo: File | null; setArchivo: (f: File | null) => void; titulo: string; texto: string; icono?: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!archivo || !archivo.type.startsWith("image/")) { setUrl(null); return; }
    const u = URL.createObjectURL(archivo); setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [archivo]);
  return (
    <label className={`subir2 ${archivo ? "on" : ""}`}>
      <input type="file" accept="image/*,application/pdf" hidden onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} />
      {url ? <img src={url} alt="" className="subir2-prev" /> : <span className="subir2-ico">{archivo ? "📄" : icono}</span>}
      <span className="subir2-txt"><b>{archivo ? archivo.name : titulo}</b><small>{archivo ? "Listo ✓ · toca para cambiarla" : texto}</small></span>
      <span className="subir2-btn">{archivo ? "Cambiar" : "Elegir archivo"}</span>
    </label>
  );
}

export default function Reservar({ servicios: todos, horario, agenda: AGENDA, abono, metodosPago: METODOS_PAGO, politicas: POLITICAS, direccion, tarjeta }: Props) {
  const S = useMemo(() => activos(todos), [todos]);
  const sp = useSearchParams();
  const [paso, setPaso] = useState(0);
  const [sel, setSelState] = useState<Seleccion>(() => desdeCodigo(sp.get("s"), S));
  const set = (p: Partial<Seleccion>) => setSelState((x) => ({ ...x, ...p }));
  const [fotoManos, setFotoManos] = useState<File | null>(null);
  const [fotoRef, setFotoRef] = useState<File | null>(null);
  const [okDiseno, setOkDiseno] = useState(false);
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

  const r = useMemo(() => armar(sel, todos, abono.monto), [sel, todos, abono.monto]);
  const cobroTarjeta = tarjeta.cobrar === "total" ? r.total : r.abono;
  useEffect(() => { if (r.conDescuento && pago === "tarjeta") setPago(METODOS_PAGO[0]?.id ?? ""); }, [r.conDescuento, pago, METODOS_PAGO]);

  const [dias, setDias] = useState<string[]>([]);
  useEffect(() => {
    const hoy = ahoraLima().fecha;
    setDias(Array.from({ length: AGENDA.diasAdelante + 1 }, (_, i) => sumarDias(hoy, i)).filter((d) => diaAbierto(d, horario)));
  }, [AGENDA.diasAdelante, horario]);

  useEffect(() => {
    if (!fecha || !r.duracion) return;
    let vivo = true;
    setCargando(true); setHoras(null);
    fetch(`/api/disponibilidad?fecha=${fecha}&duracion=${r.duracion}`)
      .then((x) => x.json())
      .then((j) => { if (!vivo) return; setHoras(j.horas ?? []); setHora((h) => ((j.horas ?? []).includes(h) ? h : "")); })
      .catch(() => vivo && setHoras([]))
      .finally(() => vivo && setCargando(false));
    return () => { vivo = false; };
  }, [fecha, r.duracion, recarga]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [paso, listo]);

  const sis = r.sistema;
  const necesitaManicure = sel.modo === "libre" || (sel.modo === "sistema" && sel.accion === "retiro");
  const packs = S.filter((s) => s.grupo === "manipedi");
  const sugerido = !r.conPack && sel.quierePedi ? packSugerido(sel.manicure, sel.pedicure, todos) : undefined;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.email.trim());
  const puede = [
    r.paso1,
    r.paso2,
    okDiseno,
    !!fecha && !!hora,
    cliente.nombre.trim().length >= 2 && cliente.celular.replace(/\D/g, "").length >= 9 && emailOk,
    acepto && (pago === "tarjeta" || !!archivo),
  ];

  async function confirmar() {
    setError(""); setEnviando(true);
    try {
      const f = new FormData();
      f.append("datos", JSON.stringify({ sel, fecha, hora, cliente, notas, pago, acepto, okDiseno }));
      if (archivo) f.append("constancia", archivo);
      if (fotoManos) f.append("foto_manos", fotoManos);
      if (fotoRef) f.append("foto_referencia", fotoRef);
      const res = await fetch("/api/reservas", { method: "POST", body: f });
      const j = await res.json();
      if (!res.ok) {
        setError(j.error || "No pudimos registrar tu reserva.");
        if (res.status === 409) { setPaso(3); setHora(""); setRecarga((n) => n + 1); }
        return;
      }
      if (j.pagar) { location.href = j.pagar; return; }
      setListo(j);
    } catch {
      setError("Se perdió la conexión. Revisa tu internet e intenta de nuevo.");
    } finally { setEnviando(false); }
  }

  if (listo) {
    return (
      <div className="reserva-listo">
        <img src="/marca/emblema-vino.png" alt="" width={70} height={59} style={{ margin: "0 auto 18px" }} />
        <p className="eyebrow">Reserva {listo.codigo}</p>
        <h1 className="titulo-l" style={{ margin: "10px 0 16px" }}>¡Listo, <span className="it">{cliente.nombre.split(" ")[0]}!</span></h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, maxWidth: 540, margin: "0 auto" }}>
          Recibimos tu solicitud para el <b>{fechaLarga(fecha).toLowerCase()}</b> a las <b>{hora12(hora)}</b>. Validaremos tu abono de <b>{soles(r.abono)}</b> y te enviaremos la <b>confirmación de tu servicio por WhatsApp</b>.
        </p>
        <p className="chica" style={{ margin: "14px auto 26px", maxWidth: 440 }}>Saldo a pagar en el studio: {soles(r.saldo)}. {direccion}.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <a className="btn btn-oscuro" href={listo.whatsapp} target="_blank" rel="noopener">Enviar mi reserva por WhatsApp</a>
          <Link className="btn btn-claro" href="/">Volver al inicio</Link>
        </div>
        {!listo.guardado && <p className="chica" style={{ margin: "18px auto 0" }}>Importante: envía tu reserva por WhatsApp para que la registremos.</p>}
      </div>
    );
  }

  const listaManicure = (
    <div style={{ marginTop: 26 }}>
      <h2 className="paso-sub">Elige tu servicio de manicure</h2>
      {sel.modo === "sistema" && <p className="ayuda" style={{ marginTop: 0 }}>Se suma al retiro de tu {sis?.nombre}.</p>}
      {SUBS.map(([sub, titulo]) => {
        const lista = S.filter((s) => s.grupo === "manicure" && s.sub === sub);
        if (!lista.length) return null;
        return (
          <div key={sub}>
            <p className="grupo-tit">{titulo}</p>
            <div className="opciones">
              {lista.map((s) => <Opcion key={s.codigo} s={s} on={!r.conPack && sel.manicure === s.codigo} onClick={() => set({ manicure: s.codigo, pack: undefined })} />)}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="reserva">
      <div className="reserva-main">
        <ol className="pasos">
          {PASOS.map((p, i) => (
            <li key={p} className={i === paso ? "activo" : i < paso ? "hecho" : ""}>
              <button disabled={i > paso && !puede.slice(0, i).every(Boolean)} onClick={() => setPaso(i)}>
                <span>{String(i + 1).padStart(2, "0")}</span>{p}
              </button>
            </li>
          ))}
        </ol>

        {/* 01 · TUS MANOS */}
        {paso === 0 && (
          <section>
            <h1 className="titulo-m">¿Cómo están tus <span className="it">uñas hoy?</span></h1>
            <p className="ayuda">Así sabemos si tu cita es un servicio nuevo o un retoque de tu sistema.</p>
            <div className="tarjetas-opc">
              {([
                ["libre", "Libres de sistema", "Uñas naturales o solo con esmalte tradicional."],
                ["sistema", "Tengo un sistema puesto", "Gel, Rubber, PolyGel, Acrílicas o Builder Gel."],
                ["pedi", "Solo quiero pedicure", "Sin servicio de manos."],
              ] as const).map(([v, t, d]) => (
                <button key={v} className={`lr-tipo ${sel.modo === v ? "on" : ""}`} onClick={() => set({ modo: v, ...(v === "pedi" ? { quierePedi: true, pack: undefined } : {}) })}>
                  <b>{t}</b><span>{d}</span>
                </button>
              ))}
            </div>

            {sel.modo === "sistema" && (
              <div className="bloque">
                <h2 className="paso-sub">¿Qué sistema tienes?</h2>
                <div className="pestanas">
                  {SISTEMAS_ACTUALES.map((x) => (
                    <button key={x.id} className={`pestana ${sel.sistema === x.id ? "activa" : ""}`}
                      onClick={() => set({ sistema: x.id, ...(x.retoque ? {} : { accion: "retiro" }) })}>{x.nombre}</button>
                  ))}
                </div>
                {sis && <>
                  <h2 className="paso-sub">¿Dónde te lo hiciste?</h2>
                  <div className="pestanas">
                    <button className={`pestana ${sel.lugar === "ln" ? "activa" : ""}`} onClick={() => set({ lugar: "ln" })}>En Lady Nails</button>
                    <button className={`pestana ${sel.lugar === "otro" ? "activa" : ""}`} onClick={() => set({ lugar: "otro" })}>En otro studio</button>
                  </div>
                  <h2 className="paso-sub">¿Qué quieres hacer?</h2>
                  <div className="tarjetas-opc dos">
                    {sis.retoque ? (
                      <button className={`lr-tipo ${sel.accion === "retoque" ? "on" : ""}`} onClick={() => set({ accion: "retoque", manicure: undefined, pack: undefined })}>
                        <b>Retoque de mi {sis.nombre}</b>
                        <span>Mi sistema está en buen estado: hacemos el mantenimiento y renovamos el color. {soles(buscar(S, sis.retoque)?.precio ?? 0)}</span>
                      </button>
                    ) : (
                      <div className="nota-suave">El esmaltado en gel no tiene retoque: se retira y se aplica un servicio nuevo.</div>
                    )}
                    <button className={`lr-tipo ${sel.accion === "retiro" ? "on" : ""}`} onClick={() => set({ accion: "retiro" })}>
                      <b>Retirarlo y hacerme un servicio nuevo</b>
                      <span>Retiro de {sis.nombre}: {sel.lugar === "ln" && sis.gratisLN ? "gratis por ser de Lady Nails" : soles(buscar(S, sis.retiro)?.precio ?? 0)} + el servicio que elijas.</span>
                    </button>
                  </div>
                  <h2 className="paso-sub">Foto de tus manos <span className="opc">(opcional)</span></h2>
                  <SubirFoto archivo={fotoManos} setArchivo={setFotoManos} titulo="Sube una foto de cómo están tus uñas" texto="Nos ayuda a preparar tu cita" icono="✋" />
                  <p className="aviso">⚠️ Una especialista evaluará el estado de tu sistema al enviarte la confirmación del servicio por WhatsApp. Si no está en condiciones para retoque, podría requerir retiro y el monto se ajustaría.</p>
                </>}
              </div>
            )}

            {necesitaManicure && (sel.modo === "libre" || (sis && sel.lugar)) && listaManicure}
          </section>
        )}

        {/* 02 · PEDICURE */}
        {paso === 1 && (
          <section>
            <h1 className="titulo-m">¿Sumamos <span className="it">pedicure?</span></h1>
            {sel.modo !== "pedi" && (
              <div className="pestanas" style={{ marginTop: 20 }}>
                <button className={`pestana ${!sel.quierePedi ? "activa" : ""}`} onClick={() => set({ quierePedi: false, pedicure: undefined, pack: undefined })}>Solo manos</button>
                <button className={`pestana ${sel.quierePedi ? "activa" : ""}`} onClick={() => set({ quierePedi: true })}>Sí, agregar pedicure</button>
              </div>
            )}
            {(sel.modo === "pedi" || sel.quierePedi) && <>
              {necesitaManicure && packs.length > 0 && (
                <div className="bloque">
                  <h2 className="paso-sub">Packs Mani + Pedi ✨</h2>
                  <p className="ayuda" style={{ marginTop: 0 }}>Manos y pies en una sola visita, a precio especial. Reemplazan a tu manicure.</p>
                  <div className="opciones">
                    {packs.map((s) => <Opcion key={s.codigo} s={s} on={sel.pack === s.codigo}
                      onClick={() => set(sel.pack === s.codigo ? { pack: undefined } : { pack: s.codigo, pedicure: undefined })}
                      extra={`${s.detalle ?? ""}${s.precioAntes ? ` Ahorras ${soles(s.precioAntes - s.precio)}.` : ""}`} />)}
                  </div>
                </div>
              )}
              {!r.conPack && (
                <div className="bloque">
                  <h2 className="paso-sub">{necesitaManicure ? "O elige solo el pedicure" : "Elige tu pedicure"}</h2>
                  <div className="opciones">
                    {S.filter((s) => s.grupo === "pedicure").map((s) => <Opcion key={s.codigo} s={s} on={sel.pedicure === s.codigo} onClick={() => set({ pedicure: s.codigo })} />)}
                  </div>
                </div>
              )}
              {sugerido && (
                <div className="sugerencia">
                  <span>💡 Con el <b>{sugerido.nombre}</b> pagas {soles(sugerido.precio)} en lugar de {soles(sugerido.precioAntes ?? 0)}.</span>
                  <button className="btn btn-oscuro btn-chico" onClick={() => set({ pack: sugerido.codigo, pedicure: undefined })}>Cambiar a pack</button>
                </div>
              )}
              {r.conPack && <p className="ayuda">Los packs son una promoción: se pagan con Yape o transferencia.</p>}
            </>}
          </section>
        )}

        {/* 03 · DISEÑO */}
        {paso === 2 && (
          <section>
            <h1 className="titulo-m">¿Qué <span className="it">diseño</span> quieres?</h1>
            <p className="ayuda">Elige el tipo según las indicaciones. Si tienes una referencia, adjúntala.</p>
            <div className="tarjetas-opc">
              {S.filter((s) => s.grupo === "diseno").map((s) => (
                <button key={s.codigo} className={`lr-tipo ${(sel.diseno ?? DISENO_BASE) === s.codigo ? "on" : ""}`} onClick={() => set({ diseno: s.codigo })}>
                  <b>{s.nombre} <em className="precio-dis">{s.precio ? `+ ${soles(s.precio)}` : "Incluido"}</em></b>
                  <span>{s.detalle}</span>
                </button>
              ))}
            </div>
            <h2 className="paso-sub">Tu referencia <span className="opc">(opcional)</span></h2>
            <SubirFoto archivo={fotoRef} setArchivo={setFotoRef} titulo="Adjunta la foto del diseño que te gusta" texto="Captura de Instagram, Pinterest o una foto" icono="🎨" />
            <label className="acepto">
              <input type="checkbox" checked={okDiseno} onChange={(e) => setOkDiseno(e.target.checked)} />
              <span>Elegí mi tipo de diseño según las indicaciones. Si mi referencia corresponde a otro tipo, el diseño y su precio podrían ajustarse en la confirmación final por WhatsApp.</span>
            </label>
          </section>
        )}

        {/* 04 · FECHA Y HORA */}
        {paso === 3 && (
          <section>
            <h1 className="titulo-m">Elige tu <span className="it">momento</span></h1>
            <p className="ayuda">Tu cita dura aprox. {duracionTexto(r.duracion)}. Solo te mostramos horas con una especialista disponible.</p>
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
            {fecha && <>
              <p className="eyebrow" style={{ marginTop: 26 }}>{fechaLarga(fecha)}</p>
              {cargando && <p className="ayuda">Revisando la agenda…</p>}
              {horas && !horas.length && <p className="ayuda">Este día ya no tiene horas libres para tu servicio. Prueba con otro día.</p>}
              <div className="horas">
                {(horas ?? []).map((h) => <button key={h} className={`hora ${hora === h ? "on" : ""}`} onClick={() => setHora(h)}>{hora12(h)}</button>)}
              </div>
            </>}
          </section>
        )}

        {/* 05 · TUS DATOS */}
        {paso === 4 && (
          <section>
            <h1 className="titulo-m">Cuéntanos de <span className="it">ti</span></h1>
            <div className="campos">
              <label>Nombre y apellido *<input value={cliente.nombre} onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })} autoComplete="name" /></label>
              <label>Celular (WhatsApp) *<input value={cliente.celular} onChange={(e) => setCliente({ ...cliente, celular: e.target.value })} inputMode="tel" autoComplete="tel" placeholder="987 654 321" /></label>
              <label className="ancho">Correo electrónico *<input type="email" value={cliente.email} onChange={(e) => setCliente({ ...cliente, email: e.target.value })} autoComplete="email" placeholder="tucorreo@gmail.com" /></label>
              <div className="ancho">
                <span className="etq">¿Es tu primera vez en Lady Nails?</span>
                <div className="pestanas" style={{ marginTop: 8 }}>
                  <button className={`pestana ${cliente.primeraVez ? "activa" : ""}`} onClick={() => setCliente({ ...cliente, primeraVez: true })}>Sí, es mi primera vez</button>
                  <button className={`pestana ${!cliente.primeraVez ? "activa" : ""}`} onClick={() => setCliente({ ...cliente, primeraVez: false })}>Ya he venido</button>
                </div>
              </div>
              <label className="ancho">Notas para tu especialista (opcional)<textarea rows={3} value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Forma, largo, color o cualquier detalle que debamos saber" /></label>
            </div>
          </section>
        )}

        {/* 06 · ABONO */}
        {paso === 5 && (
          <section>
            <h1 className="titulo-m">Separa tu cita con un <span className="it">abono</span></h1>
            <p className="ayuda">{pago === "tarjeta"
              ? `Pagas ${soles(cobroTarjeta)} con tarjeta en Mercado Pago y tu cita queda separada al instante.${r.total - cobroTarjeta > 0 ? ` El saldo de ${soles(r.total - cobroTarjeta)} lo pagas en el studio.` : ""}`
              : `Yapea o transfiere ${soles(r.abono)} y sube la captura. El saldo de ${soles(r.saldo)} lo pagas en el studio al terminar.`}</p>
            <div className="pestanas" style={{ marginTop: 20 }}>
              {METODOS_PAGO.map((m) => <button key={m.id} className={`pestana ${pago === m.id ? "activa" : ""}`} onClick={() => setPago(m.id)}>{m.nombre}</button>)}
              {tarjeta.disponible && (
                <button className={`pestana ${pago === "tarjeta" ? "activa" : ""}`} disabled={r.conDescuento} onClick={() => setPago("tarjeta")}
                  style={r.conDescuento ? { opacity: .45, cursor: "not-allowed" } : undefined}>💳 Tarjeta</button>
              )}
            </div>
            {tarjeta.disponible && r.conDescuento && <p className="ayuda" style={{ marginTop: 8 }}>El pago con tarjeta es solo para servicios a precio de catálogo (sin descuento ni packs).</p>}
            {pago === "tarjeta" ? (
              <div className="datos-pago"><div>
                <span className="etq">Tarjeta de crédito o débito · Mercado Pago</span>
                <p style={{ fontSize: 15 }}>Al confirmar te llevamos a Mercado Pago para pagar {soles(cobroTarjeta)} de forma segura. La hora queda separada por 30 minutos.</p>
              </div></div>
            ) : <>
              <div className="datos-pago">
                {METODOS_PAGO.filter((m) => m.id === pago).map((b) => (
                  <div key={b.id}>
                    <span className="etq">{b.titulo}</span>
                    {b.lineas.map((l) => <p key={l}>{l}<button onClick={() => navigator.clipboard?.writeText(l.replace(/\s/g, ""))}>Copiar</button></p>)}
                  </div>
                ))}
              </div>
              <SubirFoto archivo={archivo} setArchivo={setArchivo} titulo="Sube la captura de tu pago" texto="Captura de pantalla o PDF, hasta 5 MB" icono="🧾" />
            </>}
            <div className="antes-cita">
              <p className="antes-tit">Antes de tu cita</p>
              {POLITICAS.map((p) => <p key={p}>{p}</p>)}
              {sel.modo === "sistema" && <p>Como tienes sistema, una especialista revisará el estado de tus uñas y te confirmará por WhatsApp si requiere retiro.</p>}
              {(sel.diseno ?? DISENO_BASE) !== DISENO_BASE && <p>El diseño final se confirma por WhatsApp según tu referencia.</p>}
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
          {paso < 5
            ? <button className="btn btn-oscuro" disabled={!puede[paso]} onClick={() => setPaso(paso + 1)}>Continuar</button>
            : <button className="btn btn-oscuro" disabled={!puede[5] || enviando} onClick={confirmar}>{enviando ? "Enviando…" : pago === "tarjeta" ? `Pagar ${soles(cobroTarjeta)} con tarjeta` : "Enviar mi reserva"}</button>}
        </div>
      </div>

      <aside className="resumen">
        <p className="eyebrow">Tu cita</p>
        {!r.tienePrincipal && <p className="ayuda">Aún no eliges servicios.</p>}
        {r.tienePrincipal && r.items.map((s) => (
          <div key={s.codigo} className="res-item">
            <span>{s.etiqueta} · {s.nombre}<small>{duracionTexto(s.duracion)}</small></span>
            <span>{enOferta(s) && <s className="antes">{soles(s.precioAntes!)}</s>}{s.precio ? soles(s.precio) : s.grupo === "retiro" ? "Gratis" : "Incluido"}</span>
          </div>
        ))}
        {fecha && hora && <p className="res-cuando">{fechaLarga(fecha)}<br />{hora12(hora)} · {duracionTexto(r.duracion)}</p>}
        {r.tienePrincipal && (
          <div className="res-total">
            <p><span>Total</span><span>{soles(r.total)}</span></p>
            <p className="abono"><span>{pago === "tarjeta" && cobroTarjeta === r.total ? "Pago con tarjeta" : "Abono para separar"}</span><span>{soles(pago === "tarjeta" ? cobroTarjeta : r.abono)}</span></p>
            <p><span>Saldo en el studio</span><span>{soles(pago === "tarjeta" ? r.total - cobroTarjeta : r.saldo)}</span></p>
          </div>
        )}
      </aside>
    </div>
  );
}
