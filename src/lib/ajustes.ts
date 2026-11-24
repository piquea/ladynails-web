import { cache } from "react";
import { ABONO, AGENDA, HERO, HORARIO, METODOS_PAGO, NEGOCIO, POLITICAS, TARJETA, type Horario, type MetodoPago } from "@/config/negocio";
import { SERVICIOS_BASE, type Servicio } from "@/lib/catalogo";
import { consultar, supabaseConfigurado } from "@/lib/supabase";

export type Ajustes = {
  negocio: typeof NEGOCIO;
  hero: typeof HERO;
  horario: Horario;
  agenda: typeof AGENDA;
  abono: typeof ABONO;
  tarjeta: typeof TARJETA;
  metodosPago: MetodoPago[];
  politicas: string[];
  servicios: Servicio[];
};

export const AJUSTES_BASE: Ajustes = {
  negocio: NEGOCIO,
  hero: HERO,
  horario: HORARIO,
  agenda: AGENDA,
  abono: ABONO,
  tarjeta: TARJETA,
  metodosPago: METODOS_PAGO,
  politicas: POLITICAS,
  servicios: SERVICIOS_BASE,
};

export const TAG_AJUSTES = "ajustes";

// ---------- limpieza de lo que llega del panel ----------
const txt = (v: unknown, max = 300, def = "") => (typeof v === "string" ? v.trim().slice(0, max) : def);
const num = (v: unknown, min: number, max: number, def: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def;
};
const hora = (v: unknown, def: string) => (typeof v === "string" && /^\d{2}:\d{2}$/.test(v) ? v : def);
const obj = (v: unknown) => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});

/** Convierte cualquier cosa en un Ajustes válido, usando la base para lo que falte */
export function normalizar(entrada: unknown): Ajustes {
  const e = obj(entrada), B = AJUSTES_BASE;
  const n = obj(e.negocio), h = obj(e.hero), g = obj(e.agenda), a = obj(e.abono), hor = obj(e.horario);
  const negocio = Object.fromEntries(
    Object.entries(B.negocio).map(([k, d]) => [k, txt(n[k], 300, d) || d]),
  ) as typeof NEGOCIO;
  negocio.whatsapp = negocio.whatsapp.replace(/\D/g, "") || B.negocio.whatsapp;

  const horario: Horario = {};
  for (let d = 0; d <= 6; d++) {
    const x = d in hor ? hor[d] : B.horario[d];
    const o = obj(x);
    horario[d] = x === null ? null : { abre: hora(o.abre, B.horario[d]?.abre ?? "10:00"), cierra: hora(o.cierra, B.horario[d]?.cierra ?? "19:00") };
  }

  const metodos = Array.isArray(e.metodosPago) ? e.metodosPago : B.metodosPago;
  const metodosPago = metodos.slice(0, 6).map((m, i) => {
    const o = obj(m);
    const nombre = txt(o.nombre, 40) || `Método ${i + 1}`;
    return {
      id: (txt(o.id, 30) || nombre).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      nombre,
      titulo: txt(o.titulo, 120),
      lineas: (Array.isArray(o.lineas) ? o.lineas : []).map((l) => txt(l, 60)).filter(Boolean).slice(0, 4),
    };
  }).filter((m) => m.lineas.length);

  const politicas = (Array.isArray(e.politicas) ? e.politicas : B.politicas).map((p) => txt(p, 400)).filter(Boolean).slice(0, 15);

  const lista = Array.isArray(e.servicios) ? e.servicios : B.servicios;
  const vistos = new Set<string>();
  const servicios: Servicio[] = lista.slice(0, 200).flatMap((s) => {
    const o = obj(s);
    const codigo = txt(o.codigo, 20).toUpperCase();
    const nombre = txt(o.nombre, 80);
    if (!codigo || !nombre || vistos.has(codigo)) return [];
    vistos.add(codigo);
    const precio = num(o.precio, 0, 5000, 0), antes = num(o.precioAntes, 0, 5000, 0);
    const incluye = Array.isArray(o.incluye) ? o.incluye.map((x) => txt(x, 80)).filter(Boolean) : undefined;
    return [{
      codigo, nombre,
      grupo: txt(o.grupo, 20) || "manicure",
      sub: txt(o.sub, 40),
      precio,
      ...(antes > precio ? { precioAntes: antes } : {}),
      duracion: Math.round(num(o.duracion, 0, 600, 60)),
      activo: o.activo !== false,
      ...(incluye?.length ? { incluye } : {}),
      ...(txt(o.detalle, 400) ? { detalle: txt(o.detalle, 400) } : {}),
    }];
  });

  return {
    negocio,
    hero: { titulo1: txt(h.titulo1, 60) || B.hero.titulo1, titulo2: txt(h.titulo2, 60), bajada: txt(h.bajada, 300) || B.hero.bajada, nota: txt(h.nota, 200) || B.hero.nota },
    horario,
    agenda: {
      manicuristas: Math.round(num(g.manicuristas, 1, 20, B.agenda.manicuristas)),
      intervaloMin: [15, 30, 45, 60].includes(Number(g.intervaloMin)) ? Number(g.intervaloMin) : B.agenda.intervaloMin,
      anticipacionHoras: num(g.anticipacionHoras, 0, 72, B.agenda.anticipacionHoras),
      diasAdelante: Math.round(num(g.diasAdelante, 1, 120, B.agenda.diasAdelante)),
    },
    abono: { monto: num(a.monto, 0, 1000, B.abono.monto) },
    tarjeta: { activo: obj(e.tarjeta).activo !== false, cobrar: obj(e.tarjeta).cobrar === "total" ? "total" : "abono" },
    metodosPago: metodosPago.length ? metodosPago : B.metodosPago,
    politicas: politicas.length ? politicas : B.politicas,
    servicios: servicios.length ? servicios : B.servicios,
  };
}

/** Ajustes vigentes: lo guardado en el panel o, si no hay, los valores iniciales */
export const obtenerAjustes = cache(async (): Promise<Ajustes> => {
  if (!supabaseConfigurado()) return AJUSTES_BASE;
  try {
    const filas = (await consultar("ajustes?id=eq.sitio&select=datos", [TAG_AJUSTES])) as { datos: unknown }[];
    return filas?.[0] ? normalizar(filas[0].datos) : AJUSTES_BASE;
  } catch (e) {
    console.error("ajustes", e);
    return AJUSTES_BASE;
  }
});
