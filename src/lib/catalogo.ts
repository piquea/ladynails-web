import datos from "@/data/servicios.json";
import { ABONO } from "@/config/negocio";

export type Servicio = {
  codigo: string;
  grupo: string;
  nombre: string;
  precio: number;
  duracion: number;
  sub: string;
  incluye?: string[];
};

export const GRUPOS = datos.grupos as { id: string; nombre: string }[];
export const SERVICIOS = datos.servicios as Servicio[];
export const porCodigo = (c: string) => SERVICIOS.find((s) => s.codigo === c);

/** Grupos que por sí solos no son una cita (se agregan a otro servicio) */
export const GRUPOS_EXTRA = ["retiro", "diseno"];

export const soles = (n: number) => `S/ ${n.toFixed(n % 1 ? 2 : 0)}`;

export const duracionTexto = (min: number) => {
  const h = Math.floor(min / 60), m = min % 60;
  return h ? `${h} h${m ? ` ${m} min` : ""}` : `${m} min`;
};

export function calcularReserva(codigos: string[]) {
  const items = codigos.map(porCodigo).filter((s): s is Servicio => !!s);
  const total = items.reduce((a, s) => a + s.precio, 0);
  const duracion = items.reduce((a, s) => a + s.duracion, 0);
  const abono = total <= 0 ? 0 : Math.min(total, Math.max(ABONO.minimo, Math.ceil((total * ABONO.porcentaje) / 100)));
  const tienePrincipal = items.some((s) => !GRUPOS_EXTRA.includes(s.grupo));
  return { items, total, duracion, abono, saldo: total - abono, tienePrincipal };
}
