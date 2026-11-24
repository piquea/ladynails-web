"use client";

import { useState } from "react";

type Proveedor = { razonSocial: string; ruc: string; direccion: string; nombre: string };
type Listo = { codigo: string; fecha: string; enviado?: boolean };

const VACIO = {
  tipo: "", nombre: "", tipoDocumento: "DNI", numeroDocumento: "", domicilio: "", telefono: "", email: "",
  menorDeEdad: false, apoderado: "", bienTipo: "servicio", bienDescripcion: "", monto: "", detalle: "", pedido: "",
};

const fechaHora = (iso: string) =>
  new Date(iso).toLocaleString("es-PE", { timeZone: "America/Lima", dateStyle: "long", timeStyle: "short" });

export default function Formulario({ proveedor: P }: { proveedor: Proveedor }) {
  const [f, setF] = useState(VACIO);
  const [acepto, setAcepto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [listo, setListo] = useState<Listo | null>(null);
  const set = (k: keyof typeof VACIO) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setEnviando(true);
    try {
      const res = await fetch("/api/reclamaciones", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, acepto }) });
      const j = await res.json();
      if (!res.ok) { setError(j.error || "No pudimos registrar tu hoja."); return; }
      setListo(j);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Se perdió la conexión. Intenta de nuevo.");
    } finally { setEnviando(false); }
  }

  const cabecera = (
    <div className="lr-cab">
      <div>
        <p className="marca-eyebrow">Libro de Reclamaciones virtual</p>
        <h1 className="titulo-m">Hoja de reclamación</h1>
      </div>
      <dl className="lr-prov">
        <div><dt>Proveedor</dt><dd>{P.razonSocial}</dd></div>
        <div><dt>RUC</dt><dd>{P.ruc}</dd></div>
        <div><dt>Nombre comercial</dt><dd>{P.nombre}</dd></div>
        <div><dt>Domicilio</dt><dd>{P.direccion}</dd></div>
      </dl>
    </div>
  );

  if (listo) {
    return (
      <div className="lr">
        {cabecera}
        <div className="lr-ok">
          <p className="eyebrow">Hoja de reclamación N.° {listo.codigo}</p>
          <h2 className="titulo-m" style={{ margin: "8px 0 12px" }}>Registramos tu {f.tipo}</h2>
          <p>Fecha: {fechaHora(listo.fecha)} · Te responderemos al correo <b>{f.email}</b> en un plazo no mayor a <b>15 días hábiles</b>.</p>
          <p>{listo.enviado ? `Te enviamos una copia de esta hoja a ${f.email}.` : ""} Guarda o imprime esta hoja como constancia.</p>
        </div>
        <dl className="lr-resumen">
          <div><dt>Tipo</dt><dd>{f.tipo === "reclamo" ? "Reclamo" : "Queja"}</dd></div>
          <div><dt>Consumidor</dt><dd>{f.nombre}</dd></div>
          <div><dt>Documento</dt><dd>{f.tipoDocumento} {f.numeroDocumento}</dd></div>
          <div><dt>Domicilio</dt><dd>{f.domicilio}</dd></div>
          <div><dt>Teléfono / correo</dt><dd>{f.telefono} · {f.email}</dd></div>
          {f.menorDeEdad && <div><dt>Padre, madre o apoderado</dt><dd>{f.apoderado}</dd></div>}
          <div><dt>Bien contratado</dt><dd>{f.bienTipo === "servicio" ? "Servicio" : "Producto"}: {f.bienDescripcion}{f.monto ? ` · Monto reclamado: S/ ${f.monto}` : ""}</dd></div>
          <div><dt>Detalle</dt><dd>{f.detalle}</dd></div>
          <div><dt>Pedido</dt><dd>{f.pedido}</dd></div>
        </dl>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 24 }} className="no-imprimir">
          <button className="btn btn-oscuro" onClick={() => window.print()}>Imprimir o guardar en PDF</button>
          <a className="btn btn-claro" href="/">Volver al inicio</a>
        </div>
        <Leyenda />
      </div>
    );
  }

  return (
    <form className="lr" onSubmit={enviar}>
      {cabecera}

      <h2 className="lr-sec">1. Identificación del consumidor</h2>
      <div className="campos">
        <label className="ancho">Nombres y apellidos *<input required value={f.nombre} onChange={set("nombre")} autoComplete="name" /></label>
        <label>Tipo de documento *
          <select value={f.tipoDocumento} onChange={set("tipoDocumento")}>
            <option>DNI</option><option value="CE">Carné de extranjería</option><option>Pasaporte</option><option>RUC</option>
          </select>
        </label>
        <label>N.° de documento *<input required value={f.numeroDocumento} onChange={set("numeroDocumento")} /></label>
        <label className="ancho">Domicilio *<input required value={f.domicilio} onChange={set("domicilio")} autoComplete="street-address" /></label>
        <label>Teléfono *<input required value={f.telefono} onChange={set("telefono")} inputMode="tel" autoComplete="tel" /></label>
        <label>Correo electrónico *<input required type="email" value={f.email} onChange={set("email")} autoComplete="email" /></label>
        <label className="acepto ancho" style={{ marginTop: 0 }}>
          <input type="checkbox" checked={f.menorDeEdad} onChange={(e) => setF({ ...f, menorDeEdad: e.target.checked })} />
          <span>Soy menor de edad</span>
        </label>
        {f.menorDeEdad && <label className="ancho">Nombre del padre, madre o apoderado *<input required value={f.apoderado} onChange={set("apoderado")} /></label>}
      </div>

      <h2 className="lr-sec">2. Identificación del bien contratado</h2>
      <div className="campos">
        <div className="ancho pestanas">
          {(["servicio", "producto"] as const).map((x) => (
            <button type="button" key={x} className={`pestana ${f.bienTipo === x ? "activa" : ""}`} onClick={() => setF({ ...f, bienTipo: x })}>{x === "servicio" ? "Servicio" : "Producto"}</button>
          ))}
        </div>
        <label className="ancho">Descripción *<input required value={f.bienDescripcion} onChange={set("bienDescripcion")} placeholder="Ej. Manicure polygel del 20 de noviembre" /></label>
        <label>Monto reclamado (S/)<input value={f.monto} onChange={set("monto")} inputMode="decimal" placeholder="Opcional" /></label>
      </div>

      <h2 className="lr-sec">3. Detalle de la reclamación y pedido del consumidor</h2>
      <div className="lr-tipos">
        {([
          ["reclamo", "Reclamo", "Disconformidad relacionada con los productos o servicios."],
          ["queja", "Queja", "Disconformidad no relacionada con los productos o servicios, o malestar respecto de la atención al público."],
        ] as const).map(([v, t, d]) => (
          <button type="button" key={v} className={`lr-tipo ${f.tipo === v ? "on" : ""}`} onClick={() => setF({ ...f, tipo: v })}>
            <b>{t}</b><span>{d}</span>
          </button>
        ))}
      </div>
      <div className="campos">
        <label className="ancho">Detalle *<textarea required rows={5} value={f.detalle} onChange={set("detalle")} /></label>
        <label className="ancho">Pedido *<textarea required rows={3} value={f.pedido} onChange={set("pedido")} placeholder="¿Qué solicitas?" /></label>
      </div>

      <label className="acepto">
        <input type="checkbox" checked={acepto} onChange={(e) => setAcepto(e.target.checked)} />
        <span>Declaro que los datos consignados son verdaderos y autorizo su uso para atender esta hoja, conforme a los <a href="/terminos" target="_blank" style={{ textDecoration: "underline" }}>Términos y condiciones</a>.</span>
      </label>

      {error && <p className="error">{error}</p>}
      <div className="nav-pasos">
        <a className="btn btn-claro" href="/">Volver</a>
        <button className="btn btn-oscuro" disabled={enviando || !acepto || !f.tipo}>{enviando ? "Enviando…" : "Enviar hoja"}</button>
      </div>
      <Leyenda />
    </form>
  );
}

function Leyenda() {
  return (
    <div className="lr-leyenda">
      <p>La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.</p>
      <p>El proveedor deberá dar respuesta al reclamo o queja en un plazo no mayor a quince (15) días hábiles.</p>
    </div>
  );
}
