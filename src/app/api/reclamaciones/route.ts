import { NextResponse } from "next/server";
import { actualizar, insertar, supabaseConfigurado } from "@/lib/supabase";
import { enviarCorreo } from "@/lib/correo";
import { obtenerAjustes } from "@/lib/ajustes";

export const dynamic = "force-dynamic";

const t = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const err = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(req: Request) {
  let d: Record<string, unknown>;
  try { d = await req.json(); } catch { return err("Datos inválidos"); }

  const fila = {
    tipo: d.tipo === "queja" ? "queja" : d.tipo === "reclamo" ? "reclamo" : "",
    nombre: t(d.nombre, 120),
    tipo_documento: ["DNI", "CE", "Pasaporte", "RUC"].includes(String(d.tipoDocumento)) ? String(d.tipoDocumento) : "",
    numero_documento: t(d.numeroDocumento, 20),
    domicilio: t(d.domicilio, 200),
    telefono: t(d.telefono, 20),
    email: t(d.email, 120),
    menor_de_edad: d.menorDeEdad === true,
    apoderado: d.menorDeEdad === true ? t(d.apoderado, 120) : null,
    bien_tipo: d.bienTipo === "producto" ? "producto" : "servicio",
    bien_descripcion: t(d.bienDescripcion, 400),
    monto: Number(d.monto) > 0 ? Math.min(Number(d.monto), 100000) : null,
    detalle: t(d.detalle, 3000),
    pedido: t(d.pedido, 2000),
  };
  if (!fila.tipo) return err("Elige si es un reclamo o una queja.");
  if (fila.nombre.length < 3) return err("Escribe tu nombre completo.");
  if (!fila.tipo_documento || fila.numero_documento.length < 6) return err("Escribe tu documento de identidad.");
  if (fila.domicilio.length < 5) return err("Escribe tu domicilio.");
  if (fila.telefono.replace(/\D/g, "").length < 7) return err("Escribe un teléfono válido.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fila.email)) return err("Escribe un correo válido: ahí te enviaremos la respuesta.");
  if (fila.menor_de_edad && (fila.apoderado ?? "").length < 3) return err("Escribe el nombre del padre, madre o apoderado.");
  if (fila.bien_descripcion.length < 3) return err("Describe el servicio o producto.");
  if (fila.detalle.length < 10) return err("Cuéntanos el detalle de tu reclamo o queja.");
  if (fila.pedido.length < 3) return err("Indica qué solicitas.");
  if (d.acepto !== true) return err("Debes confirmar que tus datos son verdaderos.");
  if (!supabaseConfigurado()) return err("El libro no está disponible en este momento. Escríbenos por WhatsApp o pide el libro físico en el studio.", 503);

  try {
    const [r] = (await insertar("reclamaciones", fila)) as { id: number; creado_en: string }[];
    const codigo = `${String(r.id).padStart(6, "0")}-${r.creado_en.slice(0, 4)}`;
    await actualizar(`reclamaciones?id=eq.${r.id}`, { codigo });
    // Copia de la hoja al correo de la clienta (obligatorio)
    const N = (await obtenerAjustes()).negocio;
    const fecha = new Date(r.creado_en).toLocaleString("es-PE", { timeZone: "America/Lima", dateStyle: "long", timeStyle: "short" });
    const enviado = await enviarCorreo(fila.email, `Hoja de reclamación N.° ${codigo} – Lady Nails Studio`, [
      ["N.° de hoja", codigo], ["Fecha", fecha],
      ["Proveedor", `${N.razonSocial} · RUC ${N.ruc} · ${N.direccion}`],
      ["Tipo", fila.tipo === "reclamo" ? "Reclamo" : "Queja"],
      ["Consumidor", fila.nombre], ["Documento", `${fila.tipo_documento} ${fila.numero_documento}`],
      ["Domicilio", fila.domicilio], ["Teléfono / correo", `${fila.telefono} · ${fila.email}`],
      ...(fila.menor_de_edad ? [["Padre, madre o apoderado", fila.apoderado ?? ""] as [string, string]] : []),
      ["Bien contratado", `${fila.bien_tipo === "servicio" ? "Servicio" : "Producto"}: ${fila.bien_descripcion}${fila.monto ? ` · Monto reclamado: S/ ${fila.monto}` : ""}`],
      ["Detalle", fila.detalle], ["Pedido", fila.pedido],
    ], `Hola ${fila.nombre}:\nRegistramos tu ${fila.tipo} en nuestro Libro de Reclamaciones virtual. Te responderemos a este correo en un plazo no mayor a 15 días hábiles.\nLa formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.`)
      .catch((e) => { console.error("correo reclamacion", e); return false; });
    if (enviado) await actualizar(`reclamaciones?id=eq.${r.id}`, { correo_enviado_en: new Date().toISOString() }).catch(() => null);
    return NextResponse.json({ codigo, fecha: r.creado_en, enviado });
  } catch (e) {
    console.error("reclamacion", e);
    return err("No pudimos registrar tu hoja. Intenta de nuevo o pide el libro físico en el studio.", 500);
  }
}
