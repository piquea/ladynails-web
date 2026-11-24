// Conexión a Supabase desde el servidor (usa la clave secreta). Igual que en la web de Piquea.
// Variables de entorno (Netlify → Project configuration → Environment variables):
//   SUPABASE_URL                → https://xxxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY   → clave secreta (sb_secret_…). ¡Nunca en el navegador!
const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseConfigurado = () => Boolean(URL && KEY);

const cab = (extra?: Record<string, string>): Record<string, string> => ({
  apikey: KEY!,
  ...(KEY!.startsWith("eyJ") ? { Authorization: `Bearer ${KEY}` } : {}),
  ...(extra || {}),
});

async function sb(path: string, method: string, body?: unknown) {
  if (!URL || !KEY) throw new Error("Supabase no está configurado");
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: cab({ "Content-Type": "application/json", Prefer: "return=representation" }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  const t = await res.text();
  return t ? JSON.parse(t) : null;
}

export const consultar = (q: string) => sb(q, "GET");
export const insertar = (tabla: string, filas: object) => sb(tabla, "POST", filas);
export const actualizar = (q: string, cambios: object) => sb(q, "PATCH", cambios);

/** Sube un archivo a un bucket privado */
export async function subirArchivo(bucket: string, ruta: string, datos: ArrayBuffer, tipo: string) {
  if (!URL || !KEY) throw new Error("Supabase no está configurado");
  const res = await fetch(`${URL}/storage/v1/object/${bucket}/${ruta}`, {
    method: "POST",
    headers: cab({ "Content-Type": tipo, "x-upsert": "true" }),
    body: datos,
  });
  if (!res.ok) throw new Error(`Storage ${res.status}: ${await res.text()}`);
}
