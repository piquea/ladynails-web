// Reglas del flujo de reserva (las usa la web y también el servidor para validar)
import { GRUPOS_EXTRA, activos, buscar, enOferta, type Servicio } from "@/lib/catalogo";

export type SistemaActual = { id: string; nombre: string; retoque: string | null; retiro: string; gratisLN: boolean };

/** Sistemas que la clienta puede tener puestos, con su retoque y su retiro */
export const SISTEMAS_ACTUALES: SistemaActual[] = [
  { id: "gel", nombre: "Esmaltado en gel", retoque: null, retiro: "RTR001", gratisLN: true },
  { id: "rubber", nombre: "Rubber Gel", retoque: "RTQ001", retiro: "RTR002", gratisLN: true },
  { id: "polygel", nombre: "PolyGel", retoque: "RTQ002", retiro: "RTR003", gratisLN: false },
  { id: "acrilicas", nombre: "Acrílicas", retoque: "RTQ003", retiro: "RTR004", gratisLN: false },
  { id: "builder", nombre: "Builder Gel", retoque: "RTQ004", retiro: "RTR005", gratisLN: false },
  { id: "esc-acrilicas", nombre: "Esculpidas acrílicas", retoque: "RTQ005", retiro: "RTR004", gratisLN: false },
  { id: "esc-polygel", nombre: "Esculpidas PolyGel", retoque: "RTQ006", retiro: "RTR003", gratisLN: false },
  { id: "esc-builder", nombre: "Esculpidas Builder Gel", retoque: "RTQ007", retiro: "RTR005", gratisLN: false },
];

export type Seleccion = {
  modo?: "libre" | "sistema" | "pedi";
  sistema?: string;
  lugar?: "ln" | "otro";
  accion?: "retoque" | "retiro";
  manicure?: string;
  quierePedi?: boolean;
  pedicure?: string;
  pack?: string;
  diseno?: string;
};

export type Item = Servicio & { etiqueta: string };

export const DISENO_BASE = "DSN001";

/** Arma la reserva: lista de servicios, totales y qué falta en cada paso */
export function armar(sel: Seleccion, todos: Servicio[], montoAbono: number) {
  const S = activos(todos);
  const sis = SISTEMAS_ACTUALES.find((x) => x.id === sel.sistema);
  const items: Item[] = [];
  const add = (c: string | undefined, etiqueta: string, precio?: number) => {
    const s = c ? buscar(S, c) : undefined;
    if (s) items.push({ ...s, etiqueta, ...(precio !== undefined ? { precio, precioAntes: undefined } : {}) });
    return !!s;
  };
  const conPack = !!sel.pack && (sel.modo === "libre" || (sel.modo === "sistema" && sel.accion === "retiro"));

  // Paso 1 · tus manos
  let paso1 = false;
  if (sel.modo === "libre") paso1 = conPack || !!buscar(S, sel.manicure ?? "");
  else if (sel.modo === "pedi") paso1 = true;
  else if (sel.modo === "sistema" && sis && sel.lugar && sel.accion) {
    if (sel.accion === "retoque") paso1 = !!sis.retoque && !!buscar(S, sis.retoque);
    else paso1 = conPack || !!buscar(S, sel.manicure ?? "");
  }

  if (sel.modo === "sistema" && sis) {
    if (sel.accion === "retoque" && sis.retoque) add(sis.retoque, "Retoque");
    if (sel.accion === "retiro") add(sis.retiro, "Retiro", sel.lugar === "ln" && sis.gratisLN ? 0 : undefined);
  }
  if (conPack) add(sel.pack, "Pack Mani + Pedi");
  else {
    if (sel.modo !== "pedi" && !(sel.modo === "sistema" && sel.accion === "retoque")) add(sel.manicure, "Manicure");
    if (sel.modo === "pedi" || sel.quierePedi) add(sel.pedicure, "Pedicure");
  }
  const paso2 = sel.modo === "pedi" ? items.some((i) => i.grupo === "pedicure") : !sel.quierePedi || conPack || items.some((i) => i.grupo === "pedicure");
  add(sel.diseno || DISENO_BASE, "Diseño");

  const total = items.reduce((a, s) => a + s.precio, 0);
  const duracion = items.reduce((a, s) => a + s.duracion, 0);
  const abono = Math.max(0, Math.min(total, montoAbono));
  const tienePrincipal = items.some((s) => !GRUPOS_EXTRA.includes(s.grupo));
  return { items, total, duracion, abono, saldo: total - abono, tienePrincipal, conDescuento: items.some(enOferta), paso1, paso2, sistema: sis, conPack };
}

/** Pack que reemplaza a una manicure + pedicure elegidas (para sugerirlo) */
export function packSugerido(manicure: string | undefined, pedicure: string | undefined, todos: Servicio[]) {
  const S = activos(todos).filter((s) => s.grupo === "manipedi");
  const m = buscar(todos, manicure ?? ""), p = buscar(todos, pedicure ?? "");
  if (!m || !p) return undefined;
  return S.find((k) => k.incluye?.includes(`Manicure ${m.nombre}`) && k.incluye?.includes(`Pedicure ${p.nombre}`));
}
