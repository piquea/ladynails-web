// Mercado Pago (Checkout Pro) — pago con tarjeta de crédito o débito.
// Variable en Netlify: MP_ACCESS_TOKEN = Access Token de PRODUCCIÓN (APP_USR-…) de la cuenta de LADY NAILS. ¡Secreta!
const API = process.env.MP_API_URL || "https://api.mercadopago.com"; // MP_API_URL solo para pruebas
export const mpConfigurado = () => Boolean(process.env.MP_ACCESS_TOKEN);
const cab = () => ({ Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`, "Content-Type": "application/json" });

export type DatosPago = { codigo: string; monto: number; titulo: string; descripcion: string; nombre: string; email?: string | null };

/** Crea la preferencia de pago y devuelve el link de Mercado Pago */
export async function crearLinkPago(p: DatosPago, base: string): Promise<{ id: string; link: string } | null> {
  if (!mpConfigurado() || !(p.monto > 0)) return null;
  const volver = (e: string) => `${base}/reservar/resultado?codigo=${p.codigo}&mp=${e}`;
  const r = await fetch(`${API}/checkout/preferences`, {
    method: "POST",
    headers: { ...cab(), "X-Idempotency-Key": `pref-${p.codigo}` },
    body: JSON.stringify({
      items: [{ id: p.codigo, title: p.titulo, description: p.descripcion, quantity: 1, currency_id: "PEN", unit_price: Math.round(p.monto * 100) / 100 }],
      payer: { name: p.nombre, email: p.email || undefined },
      external_reference: p.codigo,
      back_urls: { success: volver("aprobado"), pending: volver("pendiente"), failure: volver("rechazado") },
      auto_return: "approved",
      notification_url: `${base}/api/mercadopago/webhook`,
      statement_descriptor: "LADY NAILS",
      // El link vence en 30 minutos: la hora queda separada solo ese tiempo
      expires: true,
      expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    }),
  });
  if (!r.ok) {
    console.error("Mercado Pago preferencia", r.status, await r.text());
    return null;
  }
  const j = (await r.json()) as { id: string; init_point: string };
  return { id: j.id, link: j.init_point };
}

export type PagoMP = { id: number; status: string; external_reference: string | null; transaction_amount: number; currency_id: string };

/** Consulta un pago directamente a Mercado Pago (no se confía en lo que llega al aviso) */
export async function obtenerPago(id: string): Promise<PagoMP | null> {
  if (!mpConfigurado() || !/^\d+$/.test(id)) return null;
  const r = await fetch(`${API}/v1/payments/${id}`, { headers: cab(), cache: "no-store" });
  return r.ok ? ((await r.json()) as PagoMP) : null;
}
