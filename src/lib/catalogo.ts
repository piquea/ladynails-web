import datos from "@/data/servicios.json";

export type Servicio = {
  codigo: string;
  grupo: string;
  nombre: string;
  precio: number;
  precioAntes?: number; // precio de catálogo cuando hay oferta (si existe, el servicio tiene descuento)
  duracion: number;
  sub: string;
  incluye?: string[];
  activo?: boolean;
};

export const GRUPOS = datos.grupos as { id: string; nombre: string }[];
export const SERVICIOS_BASE = datos.servicios as Servicio[];

/** Grupos que por sí solos no son una cita (se agregan a otro servicio) */
export const GRUPOS_EXTRA = ["retiro", "diseno"];

export const activos = (lista: Servicio[]) => lista.filter((s) => s.activo !== false);
export const buscar = (lista: Servicio[], c: string) => lista.find((s) => s.codigo === c);

export const enOferta = (s: Servicio) => !!s.precioAntes && s.precioAntes > s.precio;

export const soles = (n: number) => `S/ ${n.toFixed(n % 1 ? 2 : 0)}`;

export const duracionTexto = (min: number) => {
  const h = Math.floor(min / 60), m = min % 60;
  return h ? `${h} h${m ? ` ${m} min` : ""}` : `${m} min`;
};

export function calcularReserva(codigos: string[], servicios: Servicio[], montoAbono: number) {
  const disponibles = activos(servicios);
  const items = codigos.map((c) => buscar(disponibles, c)).filter((s): s is Servicio => !!s);
  const total = items.reduce((a, s) => a + s.precio, 0);
  const duracion = items.reduce((a, s) => a + s.duracion, 0);
  const abono = Math.max(0, Math.min(total, montoAbono));
  const tienePrincipal = items.some((s) => !GRUPOS_EXTRA.includes(s.grupo));
  const conDescuento = items.some(enOferta);
  return { items, total, duracion, abono, saldo: total - abono, tienePrincipal, conDescuento };
}
