import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { obtenerAjustes } from "@/lib/ajustes";
import { crearLinkPago, mpConfigurado } from "@/lib/mercadopago";
import { duracionTexto, soles } from "@/lib/catalogo";
import { armar, type Seleccion } from "@/lib/flujo";
import { aHora, aMin, ahoraLima, fechaLarga, hora12, horasLibres, sumarDias } from "@/lib/agenda";
import { ocupacionDelDia } from "@/lib/ocupacion";
import { actualizar, insertar, subirArchivo, supabaseConfigurado } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type Datos = {
  sel: Seleccion;
  fecha: string;
  hora: string;
  cliente: { nombre: string; celular: string; email?: string; primeraVez?: boolean };
  notas?: string;
  pago: string;
  acepto: boolean;
  okDiseno: boolean;
};

const TIPOS = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "application/pdf"];
const err = (error: string, status = 400) => NextResponse.json({ error }, { status });
const archivoDe = (f: FormData, k: string) => { const v = f.get(k); return v instanceof File && v.size > 0 ? v : null; };
const extension = (a: File) => (a.type === "application/pdf" ? "pdf" : (a.type.split("/")[1] || "jpg").replace("jpeg", "jpg"));

export async function POST(req: Request) {
  let datos: Datos, constancia: File | null, fotoManos: File | null, fotoRef: File | null;
  try {
    const f = await req.formData();
    datos = JSON.parse(String(f.get("datos")));
    constancia = archivoDe(f, "constancia");
    fotoManos = archivoDe(f, "foto_manos");
    fotoRef = archivoDe(f, "foto_referencia");
  } catch {
    return err("Datos inválidos");
  }

  // ---- Validaciones ----
  const aj = await obtenerAjustes();
  const { agenda: AGENDA, metodosPago: METODOS_PAGO, negocio: NEGOCIO } = aj;
  const sel: Seleccion = datos.sel && typeof datos.sel === "object" ? datos.sel : {};
  const r = armar(sel, aj.servicios, aj.abono.monto);
  if (!r.paso1 || !r.paso2 || !r.tienePrincipal) return err("Revisa los servicios elegidos.");
  if (!datos.okDiseno) return err("Confirma el tipo de diseño elegido.");
  const nombre = (datos.cliente?.nombre ?? "").trim().slice(0, 80);
  const celular = (datos.cliente?.celular ?? "").replace(/[^\d+]/g, "").slice(0, 15);
  const email = (datos.cliente?.email ?? "").trim().slice(0, 120);
  if (nombre.length < 2) return err("Escribe tu nombre.");
  if (celular.replace(/\D/g, "").length < 9) return err("Escribe un celular válido.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err("Escribe un correo válido.");

  const tarjeta = datos.pago === "tarjeta";
  if (tarjeta) {
    if (!aj.tarjeta.activo || !mpConfigurado() || !supabaseConfigurado()) return err("El pago con tarjeta no está disponible por ahora. Elige otro método.");
    if (r.conDescuento) return err("El pago con tarjeta es solo para servicios a precio de catálogo. Elige Yape o transferencia.");
  } else if (!METODOS_PAGO.some((m) => m.id === datos.pago)) return err("Elige un método de pago.");
  if (!datos.acepto) return err("Debes aceptar los Términos y condiciones.");
  const cobro = tarjeta && aj.tarjeta.cobrar === "total" ? r.total : r.abono;
  if (!tarjeta && !constancia) return err("Adjunta la captura de tu abono.");
  for (const [a, n] of [[constancia, "La constancia"], [fotoManos, "La foto de tus manos"], [fotoRef, "La referencia"]] as const) {
    if (!a) continue;
    if (a.size > 8 * 1024 * 1024) return err(`${n} pesa más de 8 MB. Sube una imagen más liviana.`);
    if (a.type && !TIPOS.includes(a.type)) return err(`${n} debe ser una imagen o un PDF.`);
  }

  const hoy = ahoraLima().fecha;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datos.fecha) || datos.fecha < hoy || datos.fecha > sumarDias(hoy, AGENDA.diasAdelante)) return err("Elige una fecha válida.");
  if (!/^\d{2}:\d{2}$/.test(datos.hora)) return err("Elige una hora.");
  const ocupados = await ocupacionDelDia(datos.fecha, AGENDA.manicuristas).catch(() => null);
  if (!ocupados) return err("No pudimos revisar la agenda. Intenta de nuevo.", 500);
  if (!horasLibres(datos.fecha, r.duracion, ocupados, aj.horario, AGENDA).includes(datos.hora)) return err("Esa hora acaba de ocuparse. Elige otra, por favor.", 409);

  const codigo = `LN-${datos.fecha.slice(2).replace(/-/g, "")}-${randomBytes(2).toString("hex").toUpperCase()}`;
  const horaFin = aHora(aMin(datos.hora) + r.duracion);
  const detalle = {
    situacion: sel.modo === "sistema" ? "con_sistema" : sel.modo === "pedi" ? "solo_pedicure" : "libre",
    sistema: r.sistema?.nombre ?? null,
    hecho_en: sel.modo === "sistema" ? (sel.lugar === "ln" ? "Lady Nails" : "Otro studio") : null,
    accion: sel.modo === "sistema" ? sel.accion : null,
    diseno: r.items.find((i) => i.grupo === "diseno")?.nombre ?? "Clásico",
  };
  let guardado = false;
  let pagar: string | null = null;

  if (supabaseConfigurado()) {
    try {
      const [fila] = (await insertar("reservas", {
        codigo,
        estado: tarjeta ? "pago_pendiente" : "por_validar",
        cliente_nombre: nombre,
        cliente_celular: celular,
        cliente_email: email,
        primera_vez: datos.cliente.primeraVez !== false,
        fecha: datos.fecha,
        hora_inicio: datos.hora,
        hora_fin: horaFin,
        duracion_min: r.duracion,
        items: r.items.map((s) => ({ codigo: s.codigo, nombre: s.nombre, grupo: s.grupo, etiqueta: s.etiqueta, precio: s.precio, duracion: s.duracion })),
        total: r.total,
        abono: cobro,
        saldo: r.total - cobro,
        metodo_pago: datos.pago,
        notas: datos.notas?.trim().slice(0, 600) || null,
        detalle,
      })) as { id: number }[];
      guardado = true;

      // Archivos: constancia, estado de manos y referencia (bucket privado)
      const cambios: Record<string, string> = {};
      for (const [a, col, suf] of [[constancia, "constancia", ""], [fotoManos, "foto_manos", "-manos"], [fotoRef, "foto_referencia", "-referencia"]] as const) {
        if (!a) continue;
        const ruta = `${datos.fecha}/${codigo}${suf}.${extension(a)}`;
        try {
          await subirArchivo("constancias", ruta, await a.arrayBuffer(), a.type || "application/octet-stream");
          cambios[col] = ruta;
        } catch (e) { console.error("archivo", col, e); }
      }
      if (Object.keys(cambios).length) await actualizar(`reservas?id=eq.${fila.id}`, cambios).catch((e) => console.error(e));

      if (tarjeta) {
        const base = process.env.URL || new URL(req.url).origin;
        const pref = await crearLinkPago({
          codigo, monto: cobro, nombre, email,
          titulo: `${cobro === r.total ? "Pago" : "Abono"} reserva Lady Nails ${codigo}`,
          descripcion: `${r.items.map((s) => s.nombre).join(" + ")} · ${datos.fecha} ${datos.hora}`,
        }, base);
        if (!pref) {
          await actualizar(`reservas?id=eq.${fila.id}`, { estado: "anulada" });
          return err("No pudimos abrir Mercado Pago. Intenta de nuevo o elige otro método.", 502);
        }
        await actualizar(`reservas?id=eq.${fila.id}`, { mp_preferencia: pref.id });
        pagar = pref.link;
      }
    } catch (e) {
      console.error("reserva", e);
      return err("No pudimos guardar tu reserva. Escríbenos por WhatsApp y te ayudamos.", 500);
    }
  }

  const texto = [
    `Hola Lady Nails 💅🏻 Acabo de reservar en la web.`,
    ``,
    `*Reserva ${codigo}*`,
    `👤 ${nombre}`,
    `📅 ${fechaLarga(datos.fecha)} · ${hora12(datos.hora)} (${duracionTexto(r.duracion)})`,
    ...(detalle.sistema ? [`💅🏻 Tengo ${detalle.sistema} (${detalle.hecho_en})${fotoManos ? " · foto adjunta en la web" : ""}`] : []),
    ...r.items.map((s) => `• ${s.etiqueta}: ${s.nombre} — ${s.precio ? soles(s.precio) : s.grupo === "retiro" ? "gratis" : "incluido"}`),
    ...(fotoRef ? [`🎨 Referencia de diseño adjunta en la web`] : []),
    ``,
    `Total: ${soles(r.total)}`,
    tarjeta ? `Pago con tarjeta (Mercado Pago): ${soles(cobro)}` : `Abono (${METODOS_PAGO.find((m) => m.id === datos.pago)?.nombre}): ${soles(cobro)} ✅ captura adjunta en la web`,
    `Saldo en el studio: ${soles(r.total - cobro)}`,
  ].join("\n");

  return NextResponse.json({
    codigo,
    guardado,
    pagar,
    resumen: { fecha: datos.fecha, hora: datos.hora, horaFin, total: r.total, abono: cobro, saldo: r.total - cobro },
    whatsapp: `https://wa.me/${NEGOCIO.whatsapp}?text=${encodeURIComponent(texto)}`,
  });
}
