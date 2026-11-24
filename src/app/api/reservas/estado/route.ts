import { NextResponse } from "next/server";
import { consultar, supabaseConfigurado } from "@/lib/supabase";
import { obtenerPago } from "@/lib/mercadopago";
import { actualizar } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET ?codigo=LN-261126-AB12[&pago=123] → estado de la reserva (sin datos personales)
export async function GET(req: Request) {
  const u = new URL(req.url);
  const codigo = u.searchParams.get("codigo") ?? "";
  if (!/^LN-\d{6}-[A-F0-9]{4}$/.test(codigo) || !supabaseConfigurado()) return NextResponse.json({ error: "Reserva no válida" }, { status: 400 });
  const [r] = (await consultar(`reservas?select=id,estado,fecha,hora_inicio,abono,saldo,pagado_en&codigo=eq.${codigo}`)) as
    { id: number; estado: string; fecha: string; hora_inicio: string; abono: number; saldo: number; pagado_en: string | null }[];
  if (!r) return NextResponse.json({ error: "No encontramos la reserva" }, { status: 404 });
  // Si Mercado Pago devolvió el id del pago y el aviso aún no llegó, lo verificamos aquí mismo
  const idPago = u.searchParams.get("pago") ?? "";
  if (!r.pagado_en && idPago) {
    const p = await obtenerPago(idPago);
    if (p?.status === "approved" && p.external_reference === codigo && Math.abs(Number(p.transaction_amount) - Number(r.abono)) <= 0.01) {
      await actualizar(`reservas?id=eq.${r.id}`, { estado: "confirmada", pagado_en: new Date().toISOString(), mp_pago_id: String(p.id) });
      r.estado = "confirmada"; r.pagado_en = new Date().toISOString();
    }
  }
  return NextResponse.json({ estado: r.estado, pagado: !!r.pagado_en, fecha: r.fecha, hora: r.hora_inicio.slice(0, 5), abono: Number(r.abono), saldo: Number(r.saldo) });
}
