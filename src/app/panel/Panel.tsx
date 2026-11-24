"use client";

import { useCallback, useEffect, useState } from "react";
import { ahoraLima, fechaLarga, hora12, sumarDias } from "@/lib/agenda";
import { soles } from "@/lib/catalogo";
import Contenido from "./Contenido";

/* eslint-disable @next/next/no-img-element */

type Reserva = {
  id: number; codigo: string; estado: string; cliente_nombre: string; cliente_celular: string; cliente_email: string | null;
  primera_vez: boolean; fecha: string; hora_inicio: string; hora_fin: string; duracion_min: number;
  items: { nombre: string; grupo: string; precio: number }[]; total: number; abono: number; saldo: number;
  metodo_pago: string; constancia: string | null; notas: string | null; creado_en: string;
};
type Bloqueo = { id: number; fecha: string; hora_inicio: string | null; hora_fin: string | null; cupos: number; motivo: string | null };
type Reclamo = {
  id: number; codigo: string; creado_en: string; tipo: string; nombre: string; tipo_documento: string; numero_documento: string;
  domicilio: string; telefono: string; email: string; menor_de_edad: boolean; apoderado: string | null; bien_tipo: string;
  bien_descripcion: string; monto: number | null; detalle: string; pedido: string; estado: string; respuesta: string | null; respondido_en: string | null;
};

const ESTADO: Record<string, { t: string; c: string }> = {
  por_validar: { t: "Por validar abono", c: "amarillo" },
  confirmada: { t: "Confirmada", c: "verde" },
  atendida: { t: "Atendida", c: "gris" },
  anulada: { t: "Anulada", c: "rojo" },
};
const GRUPO: Record<string, string> = { manicure: "Manicure", pedicure: "Pedicure", retoque: "Retoque", retiro: "Retiro", diseno: "Diseño", manipedi: "" };

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  const j = await r.json().catch(() => ({}));
  if (r.status === 401) { location.reload(); throw new Error("Sesión terminada"); }
  if (!r.ok) throw new Error(j.error ?? "Algo salió mal");
  return j as T;
}

/** Días hábiles (lun–vie) transcurridos desde una fecha */
function diasHabiles(desde: string) {
  let n = 0;
  const d = new Date(desde), hoy = new Date();
  d.setHours(0, 0, 0, 0);
  while (d < hoy) { d.setDate(d.getDate() + 1); if (d.getDay() % 6 !== 0 && d <= hoy) n++; }
  return n;
}

export default function Panel({ supabase }: { supabase: boolean }) {
  const [tab, setTab] = useState<"reservas" | "agenda" | "reclamos" | "contenido">("reservas");
  const salir = async () => { await fetch("/api/panel/login", { method: "DELETE" }); location.reload(); };
  return (
    <div className="pn">
      <header className="pn-top">
        <div className="pn-marca"><img src="/marca/emblema-crema.png" alt="" width={300} height={251} /><span>Panel Lady Nails</span></div>
        <nav>
          {([["reservas", "Reservas"], ["agenda", "Bloqueos de agenda"], ["reclamos", "Libro de reclamaciones"], ["contenido", "Contenido de la web"]] as const).map(([id, t]) => (
            <button key={id} className={tab === id ? "on" : ""} onClick={() => setTab(id)}>{t}</button>
          ))}
        </nav>
        <div className="pn-acc"><a href="/" target="_blank">Ver web ↗</a><button onClick={salir}>Salir</button></div>
      </header>
      <main className="pn-main">
        {!supabase && <p className="error">Supabase no está configurado: faltan SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.</p>}
        {tab === "reservas" && <Reservas />}
        {tab === "agenda" && <Bloqueos />}
        {tab === "reclamos" && <Reclamos />}
        {tab === "contenido" && <Contenido />}
      </main>
    </div>
  );
}

// ---------------- RESERVAS ----------------
function Reservas() {
  const hoy = ahoraLima().fecha;
  const [desde, setDesde] = useState(hoy);
  const [hasta, setHasta] = useState(sumarDias(hoy, 7));
  const [lista, setLista] = useState<Reserva[] | null>(null);
  const [filtro, setFiltro] = useState("activas");
  const [error, setError] = useState("");
  const [anulando, setAnulando] = useState<number | null>(null);

  const cargar = useCallback(async () => {
    setError("");
    try { setLista((await api<{ reservas: Reserva[] }>(`/api/panel/reservas?desde=${desde}&hasta=${hasta}`)).reservas); }
    catch (e) { setError((e as Error).message); setLista([]); }
  }, [desde, hasta]);
  useEffect(() => { cargar(); }, [cargar]);

  async function cambiar(r: Reserva, estado: string) {
    try {
      const { reserva } = await api<{ reserva: Reserva }>("/api/panel/reservas", { method: "PATCH", body: JSON.stringify({ id: r.id, estado }) });
      setLista((l) => l?.map((x) => (x.id === r.id ? reserva : x)) ?? null);
      setAnulando(null);
    } catch (e) { setError((e as Error).message); }
  }

  const rango = (d: number) => { setDesde(hoy); setHasta(sumarDias(hoy, d)); };
  const vistas = (lista ?? []).filter((r) => filtro === "todas" || (filtro === "activas" ? r.estado !== "anulada" : r.estado === filtro));
  const porDia = vistas.reduce<Record<string, Reserva[]>>((a, r) => ((a[r.fecha] ??= []).push(r), a), {});
  const cuenta = (e: string) => (lista ?? []).filter((r) => r.estado === e).length;
  const confirmarTexto = (r: Reserva) =>
    `Hola ${r.cliente_nombre.split(" ")[0]} 💅🏻 Validamos tu abono de ${soles(Number(r.abono))}. Tu cita en Lady Nails queda *confirmada* para el ${fechaLarga(r.fecha).toLowerCase()} a las ${hora12(r.hora_inicio.slice(0, 5))}. Reserva ${r.codigo}. ¡Te esperamos!`;

  return (
    <section>
      <div className="pn-barra">
        <div className="pn-chips">
          <button onClick={() => rango(0)}>Hoy</button>
          <button onClick={() => rango(7)}>7 días</button>
          <button onClick={() => rango(30)}>30 días</button>
        </div>
        <label>Desde<input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} /></label>
        <label>Hasta<input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} /></label>
        <label>Ver
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="activas">Activas</option><option value="por_validar">Por validar</option><option value="confirmada">Confirmadas</option>
            <option value="atendida">Atendidas</option><option value="anulada">Anuladas</option><option value="todas">Todas</option>
          </select>
        </label>
        <button className="btn btn-claro btn-chico" onClick={cargar}>Actualizar</button>
      </div>
      <div className="pn-kpis">
        <div><b>{cuenta("por_validar")}</b>Por validar</div>
        <div><b>{cuenta("confirmada")}</b>Confirmadas</div>
        <div><b>{soles((lista ?? []).filter((r) => r.estado !== "anulada").reduce((a, r) => a + Number(r.total), 0))}</b>Total agendado</div>
        <div><b>{soles((lista ?? []).filter((r) => r.estado !== "anulada").reduce((a, r) => a + Number(r.saldo), 0))}</b>Saldo por cobrar</div>
      </div>
      {error && <p className="error">{error}</p>}
      {lista === null && <p className="ayuda">Cargando…</p>}
      {lista && !vistas.length && <p className="ayuda">No hay reservas en estas fechas.</p>}
      {Object.entries(porDia).map(([dia, rs]) => (
        <div key={dia} className="pn-dia">
          <h3>{fechaLarga(dia)}</h3>
          {rs.map((r) => (
            <article key={r.id} className={`pn-res est-${r.estado}`}>
              <div className="pn-hora"><b>{hora12(r.hora_inicio.slice(0, 5))}</b><span>{hora12(r.hora_fin.slice(0, 5))}</span></div>
              <div className="pn-info">
                <p className="pn-nom">{r.cliente_nombre} {r.primera_vez && <span className="tag">1.ª vez</span>} <span className={`est ${ESTADO[r.estado]?.c}`}>{ESTADO[r.estado]?.t ?? r.estado}</span></p>
                <p><a href={`https://wa.me/${r.cliente_celular.replace(/\D/g, "").replace(/^9/, "519")}`} target="_blank" rel="noopener">📱 {r.cliente_celular}</a>{r.cliente_email && <> · {r.cliente_email}</>} · {r.codigo}</p>
                <p>{r.items.map((i) => `${GRUPO[i.grupo] ? GRUPO[i.grupo] + " " : ""}${i.nombre}`).join(" + ")}</p>
                {r.notas && <p className="pn-notas">“{r.notas}”</p>}
              </div>
              <div className="pn-montos">
                <p>Total <b>{soles(Number(r.total))}</b></p>
                <p>Abono ({r.metodo_pago}) <b>{soles(Number(r.abono))}</b></p>
                <p>Saldo <b>{soles(Number(r.saldo))}</b></p>
              </div>
              <div className="pn-btns">
                {r.constancia && <a className="btn btn-claro btn-chico" href={`/api/panel/constancia?id=${r.id}`} target="_blank">Ver constancia</a>}
                {r.estado === "por_validar" && <button className="btn btn-oscuro btn-chico" onClick={() => cambiar(r, "confirmada")}>Confirmar abono</button>}
                {r.estado === "confirmada" && (
                  <>
                    <a className="btn btn-claro btn-chico" target="_blank" rel="noopener" href={`https://wa.me/${r.cliente_celular.replace(/\D/g, "").replace(/^9/, "519")}?text=${encodeURIComponent(confirmarTexto(r))}`}>Avisar por WhatsApp</a>
                    <button className="btn btn-claro btn-chico" onClick={() => cambiar(r, "atendida")}>Marcar atendida</button>
                  </>
                )}
                {r.estado !== "anulada" && r.estado !== "atendida" && (
                  anulando === r.id
                    ? <><button className="btn btn-rojo btn-chico" onClick={() => cambiar(r, "anulada")}>Sí, anular</button><button className="btn btn-claro btn-chico" onClick={() => setAnulando(null)}>No</button></>
                    : <button className="pn-link" onClick={() => setAnulando(r.id)}>Anular</button>
                )}
                {r.estado === "anulada" && <button className="pn-link" onClick={() => cambiar(r, "por_validar")}>Reactivar</button>}
              </div>
            </article>
          ))}
        </div>
      ))}
    </section>
  );
}

// ---------------- BLOQUEOS ----------------
function Bloqueos() {
  const [lista, setLista] = useState<Bloqueo[] | null>(null);
  const [f, setF] = useState({ fecha: ahoraLima().fecha, todoElDia: true, horaInicio: "10:00", horaFin: "13:00", cupos: 3, motivo: "" });
  const [error, setError] = useState("");
  const cargar = useCallback(async () => {
    try { setLista((await api<{ bloqueos: Bloqueo[] }>("/api/panel/bloqueos")).bloqueos); } catch (e) { setError((e as Error).message); setLista([]); }
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  async function agregar(e: React.FormEvent) {
    e.preventDefault(); setError("");
    try {
      await api("/api/panel/bloqueos", { method: "POST", body: JSON.stringify({ ...f, horaInicio: f.todoElDia ? null : f.horaInicio, horaFin: f.todoElDia ? null : f.horaFin }) });
      setF({ ...f, motivo: "" }); cargar();
    } catch (e) { setError((e as Error).message); }
  }
  async function quitar(id: number) { await api(`/api/panel/bloqueos?id=${id}`, { method: "DELETE" }); cargar(); }

  return (
    <section className="pn-cols">
      <form className="pn-card" onSubmit={agregar}>
        <h2>Bloquear agenda</h2>
        <p className="ayuda">La web deja de ofrecer esas horas. Úsalo para feriados, capacitaciones o si falta una manicurista.</p>
        <div className="campos">
          <label>Fecha<input type="date" value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} /></label>
          <label>Manicuristas que no atienden<input type="number" min={1} max={20} value={f.cupos} onChange={(e) => setF({ ...f, cupos: Number(e.target.value) })} /></label>
          <label className="acepto ancho" style={{ marginTop: 0 }}><input type="checkbox" checked={f.todoElDia} onChange={(e) => setF({ ...f, todoElDia: e.target.checked })} /><span>Todo el día</span></label>
          {!f.todoElDia && <>
            <label>Desde<input type="time" value={f.horaInicio} onChange={(e) => setF({ ...f, horaInicio: e.target.value })} /></label>
            <label>Hasta<input type="time" value={f.horaFin} onChange={(e) => setF({ ...f, horaFin: e.target.value })} /></label>
          </>}
          <label className="ancho">Motivo<input value={f.motivo} onChange={(e) => setF({ ...f, motivo: e.target.value })} placeholder="Ej. Feriado, capacitación" /></label>
        </div>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-oscuro" style={{ marginTop: 18 }}>Agregar bloqueo</button>
      </form>
      <div className="pn-card">
        <h2>Próximos bloqueos</h2>
        {lista === null && <p className="ayuda">Cargando…</p>}
        {lista && !lista.length && <p className="ayuda">No hay bloqueos.</p>}
        {lista?.map((b) => (
          <div key={b.id} className="pn-fila">
            <span><b>{fechaLarga(b.fecha)}</b><br />{b.hora_inicio ? `${hora12(b.hora_inicio.slice(0, 5))} – ${hora12(b.hora_fin!.slice(0, 5))}` : "Todo el día"} · {b.cupos} manicurista(s){b.motivo ? ` · ${b.motivo}` : ""}</span>
            <button className="pn-link" onClick={() => quitar(b.id)}>Quitar</button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------- LIBRO DE RECLAMACIONES ----------------
function Reclamos() {
  const [lista, setLista] = useState<Reclamo[] | null>(null);
  const [abierto, setAbierto] = useState<number | null>(null);
  const [resp, setResp] = useState("");
  const [error, setError] = useState("");
  const cargar = useCallback(async () => {
    try { setLista((await api<{ reclamaciones: Reclamo[] }>("/api/panel/reclamaciones")).reclamaciones); } catch (e) { setError((e as Error).message); setLista([]); }
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  async function responder(r: Reclamo) {
    setError("");
    try {
      const { reclamacion } = await api<{ reclamacion: Reclamo }>("/api/panel/reclamaciones", { method: "PATCH", body: JSON.stringify({ id: r.id, respuesta: resp }) });
      setLista((l) => l?.map((x) => (x.id === r.id ? reclamacion : x)) ?? null);
    } catch (e) { setError((e as Error).message); }
  }
  const correo = (r: Reclamo, texto: string) =>
    `mailto:${r.email}?subject=${encodeURIComponent(`Respuesta a su ${r.tipo} N.° ${r.codigo} – Lady Nails Studio`)}&body=${encodeURIComponent(`Estimada(o) ${r.nombre}:\n\n${texto}\n\nAtentamente,\nBEAUTY CORP PERU S.A.C. – Lady Nails Studio`)}`;

  return (
    <section>
      <p className="ayuda" style={{ marginBottom: 18 }}>Plazo legal de respuesta: <b>15 días hábiles</b>. Responde por correo a la clienta y luego marca la hoja como respondida.</p>
      {error && <p className="error">{error}</p>}
      {lista === null && <p className="ayuda">Cargando…</p>}
      {lista && !lista.length && <p className="ayuda">No hay hojas registradas.</p>}
      {lista?.map((r) => {
        const dias = diasHabiles(r.creado_en);
        const pendiente = r.estado !== "respondido";
        return (
          <article key={r.id} className="pn-card pn-rec">
            <button className="pn-rec-cab" onClick={() => { setAbierto(abierto === r.id ? null : r.id); setResp(r.respuesta ?? ""); }}>
              <span><b>N.° {r.codigo}</b> · {r.tipo === "reclamo" ? "Reclamo" : "Queja"} · {r.nombre}</span>
              <span>{new Date(r.creado_en).toLocaleDateString("es-PE")} · {pendiente
                ? <span className={`est ${dias >= 12 ? "rojo" : "amarillo"}`}>Pendiente · día {dias} de 15</span>
                : <span className="est verde">Respondido</span>}</span>
            </button>
            {abierto === r.id && (
              <div className="pn-rec-det">
                <dl className="lr-resumen">
                  <div><dt>Documento</dt><dd>{r.tipo_documento} {r.numero_documento}</dd></div>
                  <div><dt>Contacto</dt><dd>{r.telefono} · {r.email}</dd></div>
                  <div><dt>Domicilio</dt><dd>{r.domicilio}</dd></div>
                  {r.menor_de_edad && <div><dt>Apoderado</dt><dd>{r.apoderado}</dd></div>}
                  <div><dt>Bien contratado</dt><dd>{r.bien_tipo}: {r.bien_descripcion}{r.monto ? ` · S/ ${r.monto}` : ""}</dd></div>
                  <div><dt>Detalle</dt><dd>{r.detalle}</dd></div>
                  <div><dt>Pedido</dt><dd>{r.pedido}</dd></div>
                </dl>
                <label className="pn-label">Respuesta / acciones adoptadas por el proveedor
                  <textarea rows={5} value={resp} onChange={(e) => setResp(e.target.value)} />
                </label>
                <div className="pn-btns" style={{ marginTop: 12 }}>
                  <a className="btn btn-claro btn-chico" href={correo(r, resp)}>Abrir correo con la respuesta</a>
                  <button className="btn btn-oscuro btn-chico" disabled={resp.trim().length < 5} onClick={() => responder(r)}>{pendiente ? "Marcar como respondido" : "Actualizar respuesta"}</button>
                </div>
                {r.respondido_en && <p className="ayuda">Respondido el {new Date(r.respondido_en).toLocaleString("es-PE")}</p>}
              </div>
            )}
          </article>
        );
      })}
    </section>
  );
}
