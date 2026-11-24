import { aMin, type Ocupado } from "@/lib/agenda";
import { consultar, supabaseConfigurado } from "@/lib/supabase";

/** Citas y bloqueos de un día, en minutos desde medianoche */
export async function ocupacionDelDia(fecha: string, manicuristas: number): Promise<Ocupado[]> {
  if (!supabaseConfigurado()) return [];
  const [reservas, bloqueos] = (await Promise.all([
    consultar(`reservas?select=hora_inicio,hora_fin,estado,creado_en&fecha=eq.${fecha}&estado=neq.anulada`),
    consultar(`bloqueos_agenda?select=hora_inicio,hora_fin,cupos&fecha=eq.${fecha}`),
  ])) as [{ hora_inicio: string; hora_fin: string; estado: string; creado_en: string }[], { hora_inicio: string | null; hora_fin: string | null; cupos: number }[]];
  return [
    // Un pago con tarjeta no terminado separa la hora solo 30 minutos
    ...reservas.filter((r) => r.estado !== "pago_pendiente" || Date.now() - new Date(r.creado_en).getTime() < 30 * 60e3).map((r) => ({ inicio: aMin(r.hora_inicio.slice(0, 5)), fin: aMin(r.hora_fin.slice(0, 5)) })),
    ...bloqueos.map((b) => ({
      inicio: b.hora_inicio ? aMin(b.hora_inicio.slice(0, 5)) : 0,
      fin: b.hora_fin ? aMin(b.hora_fin.slice(0, 5)) : 24 * 60,
      cupos: b.cupos ?? manicuristas,
    })),
  ];
}
