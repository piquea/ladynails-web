import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { AGENDA, METODOS_PAGO, NEGOCIO } from "@/config/negocio";
import { calcularReserva, duracionTexto, soles } from "@/lib/catalogo";
import { aHora, aMin, ahoraLima, fechaLarga, hora12, horasLibres, sumarDias } from "@/lib/agenda";
import { ocupacionDelDia } from "@/lib/ocupacion";
import { insertar, subirArchivo, supabaseConfigurado, actualizar } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type Datos = {
  servicios: string[];
  fecha: string;
  hora: string;
  cliente: { nombre: string; celular: string; email?: string; primeraVez?: boolean };
  notas?: string;
  pago: string;
  acepto: boolean;
};

const TIPOS = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "application/pdf"];
const err = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(req: Request) {
  let datos: Datos, archivo: File | null;
  try {
    const f = await req.formData();
    datos = JSON.parse(String(f.get("datos")));
    const c = f.get("constancia");
    archivo = c instanceof File && c.size > 0 ? c : null;
  } catch {
    return err("Datos inválidos");
  }

  // ---- Validaciones ----
  const r = calcularReserva(Array.isArray(datos.servicios) ? datos.servicios.slice(0, 8) : []);
  if (!r.items.length || !r.tienePrincipal) return err("Elige al menos un servicio.");
  const nombre = (datos.cliente?.nombre ?? "").trim().slice(0, 80);
  const celular = (datos.cliente?.celular ?? "").replace(/[^\d+]/g, "").slice(0, 15);
  if (nombre.length < 2) return err("Escribe tu nombre.");
  if (celular.replace(/\D/g, "").length < 9) return err("Escribe un celular válido.");
  if (!METODOS_PAGO.some((m) => m.id === datos.pago)) return err("Elige un método de pago.");
  if (!datos.acepto) return err("Debes aceptar las políticas de reserva.");
  if (!archivo) return err("Adjunta la constancia de tu abono.");
  if (archivo.size > 5 * 1024 * 1024) return err("La constancia pesa más de 5 MB. Sube una captura más liviana.");
  if (archivo.type && !TIPOS.includes(archivo.type)) return err("La constancia debe ser una imagen o un PDF.");

  const hoy = ahoraLima().fecha;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datos.fecha) || datos.fecha < hoy || datos.fecha > sumarDias(hoy, AGENDA.diasAdelante))
    return err("Elige una fecha válida.");
  if (!/^\d{2}:\d{2}$/.test(datos.hora)) return err("Elige una hora.");

  const ocupados = await ocupacionDelDia(datos.fecha).catch(() => null);
  if (!ocupados) return err("No pudimos revisar la agenda. Intenta de nuevo.", 500);
  if (!horasLibres(datos.fecha, r.duracion, ocupados).includes(datos.hora))
    return err("Esa hora acaba de ocuparse. Elige otra, por favor.", 409);

  const codigo = `LN-${datos.fecha.slice(2).replace(/-/g, "")}-${randomBytes(2).toString("hex").toUpperCase()}`;
  const horaFin = aHora(aMin(datos.hora) + r.duracion);
  let guardado = false;

  if (supabaseConfigurado()) {
    try {
      const [fila] = (await insertar("reservas", {
        codigo,
        estado: "por_validar",
        cliente_nombre: nombre,
        cliente_celular: celular,
        cliente_email: datos.cliente.email?.trim().slice(0, 120) || null,
        primera_vez: datos.cliente.primeraVez !== false,
        fecha: datos.fecha,
        hora_inicio: datos.hora,
        hora_fin: horaFin,
        duracion_min: r.duracion,
        items: r.items.map((s) => ({ codigo: s.codigo, nombre: s.nombre, grupo: s.grupo, precio: s.precio, duracion: s.duracion })),
        total: r.total,
        abono: r.abono,
        saldo: r.saldo,
        metodo_pago: datos.pago,
        notas: datos.notas?.trim().slice(0, 600) || null,
      })) as { id: number }[];
      guardado = true;
      const ext = archivo.type === "application/pdf" ? "pdf" : (archivo.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
      const ruta = `${datos.fecha}/${codigo}.${ext}`;
      try {
        await subirArchivo("constancias", ruta, await archivo.arrayBuffer(), archivo.type || "application/octet-stream");
        await actualizar(`reservas?id=eq.${fila.id}`, { constancia: ruta });
      } catch (e) {
        console.error("constancia", e);
      }
    } catch (e) {
      console.error("reserva", e);
      return err("No pudimos guardar tu reserva. Escríbenos por WhatsApp y te ayudamos.", 500);
    }
  }

  const grupoNombre: Record<string, string> = { manicure: "Manicure", pedicure: "Pedicure", retoque: "Retoque", retiro: "Retiro", diseno: "Diseño" };
  const texto = [
    `Hola Lady Nails 💅🏻 Acabo de reservar en la web.`,
    ``,
    `*Reserva ${codigo}*`,
    `👤 ${nombre}`,
    `📅 ${fechaLarga(datos.fecha)} · ${hora12(datos.hora)} (${duracionTexto(r.duracion)})`,
    ...r.items.map((s) => `• ${grupoNombre[s.grupo] ? grupoNombre[s.grupo] + " " : ""}${s.nombre} — ${soles(s.precio)}`),
    ``,
    `Total: ${soles(r.total)}`,
    `Abono (${METODOS_PAGO.find((m) => m.id === datos.pago)?.nombre}): ${soles(r.abono)} ✅ constancia adjunta en la web`,
    `Saldo en el studio: ${soles(r.saldo)}`,
  ].join("\n");

  return NextResponse.json({
    codigo,
    guardado,
    resumen: { fecha: datos.fecha, hora: datos.hora, horaFin, total: r.total, abono: r.abono, saldo: r.saldo },
    whatsapp: `https://wa.me/${NEGOCIO.whatsapp}?text=${encodeURIComponent(texto)}`,
  });
}
