import { AGENDA, HORARIO } from "@/config/negocio";

export const aMin = (h: string) => {
  const [a, b] = h.split(":").map(Number);
  return a * 60 + b;
};
export const aHora = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
export const hora12 = (h: string) => {
  const m = aMin(h), hh = Math.floor(m / 60), mm = m % 60;
  return `${((hh + 11) % 12) + 1}:${String(mm).padStart(2, "0")} ${hh < 12 ? "a. m." : "p. m."}`;
};

/** Fecha y minutos actuales en Lima */
export function ahoraLima() {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(new Date())
      .map((x) => [x.type, x.value]),
  );
  return { fecha: `${p.year}-${p.month}-${p.day}`, min: Number(p.hour) * 60 + Number(p.minute) };
}

export const diaSemana = (fecha: string) => new Date(`${fecha}T12:00:00Z`).getUTCDay();

export function sumarDias(fecha: string, n: number) {
  const d = new Date(`${fecha}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export const fechaLarga = (f: string) => {
  const t = new Date(`${f}T12:00:00Z`).toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
  return t.charAt(0).toUpperCase() + t.slice(1);
};

export function diaAbierto(fecha: string) {
  return !!HORARIO[diaSemana(fecha)] && !AGENDA.fechasBloqueadas.includes(fecha);
}

export type Ocupado = { inicio: number; fin: number; cupos?: number };

/**
 * Horas de inicio libres para una cita de `duracion` minutos.
 * Una hora sirve si en todo el rango hay menos citas a la vez que manicuristas.
 */
export function horasLibres(fecha: string, duracion: number, ocupados: Ocupado[]) {
  const h = HORARIO[diaSemana(fecha)];
  if (!h || AGENDA.fechasBloqueadas.includes(fecha)) return [];
  const ahora = ahoraLima();
  if (fecha < ahora.fecha) return [];
  const minimo = fecha === ahora.fecha ? ahora.min + AGENDA.anticipacionHoras * 60 : 0;
  const abre = aMin(h.abre), cierra = aMin(h.cierra), dur = Math.max(duracion, AGENDA.intervaloMin);
  const libres: string[] = [];
  for (let ini = abre; ini + dur <= cierra; ini += AGENDA.intervaloMin) {
    if (ini < minimo) continue;
    let ok = true;
    for (let t = ini; t < ini + dur && ok; t += 15) {
      const usados = ocupados.filter((o) => o.inicio <= t && t < o.fin).reduce((a, o) => a + (o.cupos ?? 1), 0);
      if (usados >= AGENDA.manicuristas) ok = false;
    }
    if (ok) libres.push(aHora(ini));
  }
  return libres;
}
