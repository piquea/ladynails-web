import { NextResponse } from "next/server";
import { actualizar, consultar } from "@/lib/supabase";
import { obtenerPago } from "@/lib/mercadopago";

export const dynamic = "force-dynamic";

/**
 * Aviso de Mercado Pago cuando cambia un pago.
 * No confiamos en el contenido del aviso: consultamos el pago con nuestro token y solo
 * confirmamos la reserva si está aprobado y el monto coincide.
 */
async function procesar(req: Request) {
  const u = new URL(req.url);
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch {}
  const tipo = String(u.searchParams.get("type") ?? u.searchParams.get("topic") ?? body.type ?? body.topic ?? "");
  const id = String(u.searchParams.get("data.id") ?? (body.data as { id?: string } | undefined)?.id ?? u.searchParams.get("id") ?? "");
  if (tipo !== "payment" || !id) return;

  const pago = await obtenerPago(id);
  if (!pago || pago.status !== "approved" || !pago.external_reference) return;
  const [r] = (await consultar(`reservas?select=id,estado,abono,pagado_en&codigo=eq.${encodeURIComponent(pago.external_reference)}`)) as
    { id: number; estado: string; abono: number; pagado_en: string | null }[];
  if (!r || r.pagado_en) return;
  if (pago.currency_id !== "PEN" || Math.abs(Number(pago.transaction_amount) - Number(r.abono)) > 0.01) {
    console.error("MP: monto no coincide", pago.id, pago.transaction_amount, r.abono);
    return;
  }
  // Si la reserva se había liberado por tiempo, se reactiva igual: la clienta ya pagó
  await actualizar(`reservas?id=eq.${r.id}`, { estado: "confirmada", pagado_en: new Date().toISOString(), mp_pago_id: String(pago.id) });
}

export async function POST(req: Request) {
  try { await procesar(req); } catch (e) { console.error("webhook MP", e); }
  return NextResponse.json({ ok: true }); // siempre 200 para que Mercado Pago no reintente sin fin
}
export const GET = POST;
