"use client";

import { useEffect, useState } from "react";
import type { Ajustes } from "@/lib/ajustes";
import { GRUPOS, type Servicio } from "@/lib/catalogo";

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const ORDEN = [1, 2, 3, 4, 5, 6, 0];
const CONTACTO: [keyof Ajustes["negocio"], string][] = [
  ["whatsapp", "WhatsApp (con 51, sin espacios)"], ["whatsappVisible", "WhatsApp como se muestra"], ["email", "Correo"],
  ["instagram", "Link de Instagram"], ["tiktok", "Link de TikTok"], ["direccion", "Dirección"], ["referencia", "Referencia"],
  ["mapa", "Link de Google Maps"], ["razonSocial", "Razón social"], ["ruc", "RUC"],
];

export default function Contenido() {
  const [aj, setAj] = useState<Ajustes | null>(null);
  const [sec, setSec] = useState("servicios");
  const [grupo, setGrupo] = useState("manicure");
  const [estado, setEstado] = useState<"" | "guardando" | "ok" | string>("");
  const [cambios, setCambios] = useState(false);

  useEffect(() => {
    fetch("/api/panel/ajustes").then((r) => r.json()).then((j) => setAj(j.ajustes)).catch(() => setEstado("No se pudo cargar el contenido."));
  }, []);
  useEffect(() => {
    const f = (e: BeforeUnloadEvent) => { if (cambios) e.preventDefault(); };
    window.addEventListener("beforeunload", f);
    return () => window.removeEventListener("beforeunload", f);
  }, [cambios]);

  if (!aj) return <p className="ayuda">{estado || "Cargando…"}</p>;

  const upd = (p: Partial<Ajustes>) => { setAj({ ...aj, ...p }); setCambios(true); setEstado(""); };
  const updServ = (codigo: string, p: Partial<Servicio>) => upd({ servicios: aj.servicios.map((s) => (s.codigo === codigo ? { ...s, ...p } : s)) });

  async function guardar() {
    setEstado("guardando");
    const r = await fetch("/api/panel/ajustes", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(aj) });
    const j = await r.json().catch(() => ({}));
    if (r.status === 401) return location.reload();
    if (!r.ok) return setEstado(j.error ?? "No se pudo guardar.");
    setAj(j.ajustes); setCambios(false); setEstado("ok");
  }

  function nuevoServicio() {
    let n = 1;
    while (aj!.servicios.some((s) => s.codigo === `WEB${String(n).padStart(3, "0")}`)) n++;
    upd({ servicios: [...aj!.servicios, { codigo: `WEB${String(n).padStart(3, "0")}`, grupo, nombre: "Nuevo servicio", precio: 0, duracion: 60, sub: "", activo: true }] });
  }

  return (
    <section className="pn-cont">
      <aside className="pn-secs">
        {[["servicios", "Servicios y precios"], ["portada", "Textos de portada"], ["horario", "Horario y agenda"], ["pagos", "Abono y métodos de pago"], ["politicas", "Políticas de reserva"], ["contacto", "Contacto y empresa"]].map(([id, t]) => (
          <button key={id} className={sec === id ? "on" : ""} onClick={() => setSec(id)}>{t}</button>
        ))}
        <div className="pn-guardar">
          <button className="btn btn-oscuro" disabled={!cambios || estado === "guardando"} onClick={guardar}>{estado === "guardando" ? "Guardando…" : "Guardar cambios"}</button>
          {estado === "ok" && <p className="ok">✓ Guardado. La web se actualiza en unos segundos.</p>}
          {estado && estado !== "ok" && estado !== "guardando" && <p className="error">{estado}</p>}
          {cambios && <p className="ayuda">Tienes cambios sin guardar.</p>}
        </div>
      </aside>

      <div className="pn-card">
        {sec === "servicios" && <>
          <h2>Servicios y precios</h2>
          <p className="ayuda">Los códigos son los mismos del punto de venta. Desactiva un servicio para ocultarlo en la web sin borrarlo. Para una oferta, pon el precio rebajado en «Precio S/» y el original en «Precio normal»: se muestra tachado y no se puede pagar con tarjeta.</p>
          <div className="pestanas" style={{ marginTop: 16 }}>
            {GRUPOS.map((g) => <button key={g.id} className={`pestana ${grupo === g.id ? "activa" : ""}`} onClick={() => setGrupo(g.id)}>{g.nombre}</button>)}
          </div>
          <div className="pn-tabla">
            <div className="pn-tr pn-th"><span>Código</span><span>Nombre</span><span>Precio S/</span><span title="Llénalo solo si hay oferta">Precio normal</span><span>Minutos</span><span>Activo</span></div>
            {aj.servicios.filter((s) => s.grupo === grupo).map((s) => (
              <div key={s.codigo} className={`pn-tr ${s.activo === false ? "off" : ""}`}>
                <span className="cod">{s.codigo}</span>
                <input value={s.nombre} onChange={(e) => updServ(s.codigo, { nombre: e.target.value })} />
                <input type="number" min={0} step="0.5" value={s.precio} onChange={(e) => updServ(s.codigo, { precio: Number(e.target.value) })} />
                <input type="number" min={0} step="0.5" placeholder="—" value={s.precioAntes ?? ""} onChange={(e) => updServ(s.codigo, { precioAntes: e.target.value ? Number(e.target.value) : undefined })} />
                <input type="number" min={0} step={5} value={s.duracion} onChange={(e) => updServ(s.codigo, { duracion: Number(e.target.value) })} />
                <input type="checkbox" checked={s.activo !== false} onChange={(e) => updServ(s.codigo, { activo: e.target.checked })} />
                <input className="pn-det" placeholder="Qué incluye (se muestra a la clienta)" value={s.detalle ?? ""} onChange={(e) => updServ(s.codigo, { detalle: e.target.value })} />
              </div>
            ))}
          </div>
          <button className="btn btn-claro btn-chico" style={{ marginTop: 14 }} onClick={nuevoServicio}>+ Agregar servicio en {GRUPOS.find((g) => g.id === grupo)?.nombre}</button>
        </>}

        {sec === "portada" && <>
          <h2>Textos de portada</h2>
          <div className="campos">
            <label className="ancho">Título (primera línea)<input value={aj.hero.titulo1} onChange={(e) => upd({ hero: { ...aj.hero, titulo1: e.target.value } })} /></label>
            <label className="ancho">Título en cursiva (segunda línea)<input value={aj.hero.titulo2} onChange={(e) => upd({ hero: { ...aj.hero, titulo2: e.target.value } })} /></label>
            <label className="ancho">Texto debajo del título<textarea rows={3} value={aj.hero.bajada} onChange={(e) => upd({ hero: { ...aj.hero, bajada: e.target.value } })} /></label>
            <label className="ancho">Frase sobre la foto<input value={aj.hero.nota} onChange={(e) => upd({ hero: { ...aj.hero, nota: e.target.value } })} /></label>
          </div>
        </>}

        {sec === "horario" && <>
          <h2>Horario de atención</h2>
          <p className="ayuda">La agenda solo ofrece citas que terminan antes del cierre.</p>
          <div className="pn-tabla">
            {ORDEN.map((d) => {
              const h = aj.horario[d];
              return (
                <div key={d} className="pn-tr pn-tr-hor">
                  <span>{DIAS[d]}</span>
                  <label className="acepto" style={{ margin: 0 }}><input type="checkbox" checked={!!h} onChange={(e) => upd({ horario: { ...aj.horario, [d]: e.target.checked ? { abre: "10:00", cierra: "19:00" } : null } })} /><span>Abierto</span></label>
                  {h ? <>
                    <input type="time" value={h.abre} onChange={(e) => upd({ horario: { ...aj.horario, [d]: { ...h, abre: e.target.value } } })} />
                    <input type="time" value={h.cierra} onChange={(e) => upd({ horario: { ...aj.horario, [d]: { ...h, cierra: e.target.value } } })} />
                  </> : <span className="ayuda" style={{ margin: 0 }}>Cerrado</span>}
                </div>
              );
            })}
          </div>
          <h2 style={{ marginTop: 30 }}>Agenda en línea</h2>
          <div className="campos">
            <label>Citas a la vez (manicuristas)<input type="number" min={1} max={20} value={aj.agenda.manicuristas} onChange={(e) => upd({ agenda: { ...aj.agenda, manicuristas: Number(e.target.value) } })} /></label>
            <label>Horas de inicio cada
              <select value={aj.agenda.intervaloMin} onChange={(e) => upd({ agenda: { ...aj.agenda, intervaloMin: Number(e.target.value) } })}>
                {[15, 30, 45, 60].map((m) => <option key={m} value={m}>{m} minutos</option>)}
              </select>
            </label>
            <label>Anticipación mínima (horas)<input type="number" min={0} max={72} value={aj.agenda.anticipacionHoras} onChange={(e) => upd({ agenda: { ...aj.agenda, anticipacionHoras: Number(e.target.value) } })} /></label>
            <label>Se puede reservar hasta (días adelante)<input type="number" min={1} max={120} value={aj.agenda.diasAdelante} onChange={(e) => upd({ agenda: { ...aj.agenda, diasAdelante: Number(e.target.value) } })} /></label>
          </div>
        </>}

        {sec === "pagos" && <>
          <h2>Abono para reservar</h2>
          <div className="campos">
            <label>Monto del abono (S/)<input type="number" min={0} value={aj.abono.monto} onChange={(e) => upd({ abono: { monto: Number(e.target.value) } })} /></label>
          </div>
          <h2 style={{ marginTop: 30 }}>Tarjeta (Mercado Pago)</h2>
          <p className="ayuda">Solo para servicios a precio de catálogo. Con tarjeta la cita se confirma sola al aprobarse el pago.</p>
          <div className="campos">
            <label className="acepto" style={{ marginTop: 0 }}><input type="checkbox" checked={aj.tarjeta.activo} onChange={(e) => upd({ tarjeta: { ...aj.tarjeta, activo: e.target.checked } })} /><span>Aceptar pagos con tarjeta</span></label>
            <label>Con tarjeta se cobra
              <select value={aj.tarjeta.cobrar} onChange={(e) => upd({ tarjeta: { ...aj.tarjeta, cobrar: e.target.value as "abono" | "total" } })}>
                <option value="abono">Solo el abono</option><option value="total">El total del servicio</option>
              </select>
            </label>
          </div>
          <h2 style={{ marginTop: 30 }}>Yape y transferencias</h2>
          {aj.metodosPago.map((m, i) => {
            const set = (p: Partial<typeof m>) => upd({ metodosPago: aj.metodosPago.map((x, j) => (j === i ? { ...x, ...p } : x)) });
            return (
              <div key={i} className="pn-metodo campos">
                <label>Nombre del botón<input value={m.nombre} onChange={(e) => set({ nombre: e.target.value })} /></label>
                <label>Título<input value={m.titulo} onChange={(e) => set({ titulo: e.target.value })} /></label>
                <label className="ancho">Número(s) de cuenta o celular, uno por línea<textarea rows={2} value={m.lineas.join("\n")} onChange={(e) => set({ lineas: e.target.value.split("\n") })} /></label>
                <button className="pn-link" onClick={() => upd({ metodosPago: aj.metodosPago.filter((_, j) => j !== i) })}>Quitar este método</button>
              </div>
            );
          })}
          <button className="btn btn-claro btn-chico" onClick={() => upd({ metodosPago: [...aj.metodosPago, { id: `metodo-${Date.now()}`, nombre: "Nuevo", titulo: "", lineas: [""] }] })}>+ Agregar método</button>
        </>}

        {sec === "politicas" && <>
          <h2>Políticas de reserva</h2>
          <p className="ayuda">Se muestran en el último paso de la reserva. Una política por línea.</p>
          <textarea className="pn-area" rows={10} value={aj.politicas.join("\n")} onChange={(e) => upd({ politicas: e.target.value.split("\n") })} />
        </>}

        {sec === "contacto" && <>
          <h2>Contacto y empresa</h2>
          <div className="campos">
            {CONTACTO.map(([k, t]) => (
              <label key={k} className={["direccion", "mapa", "instagram", "tiktok"].includes(k) ? "ancho" : ""}>{t}
                <input value={aj.negocio[k]} onChange={(e) => upd({ negocio: { ...aj.negocio, [k]: e.target.value } })} />
              </label>
            ))}
          </div>
        </>}
      </div>
    </section>
  );
}
