import { NextResponse } from "next/server";
import { actualizar, insertar, supabaseConfigurado } from "@/lib/supabase";

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
    return NextResponse.json({ codigo, fecha: r.creado_en });
  } catch (e) {
    console.error("reclamacion", e);
    return err("No pudimos registrar tu hoja. Intenta de nuevo o pide el libro físico en el studio.", 500);
  }
}
