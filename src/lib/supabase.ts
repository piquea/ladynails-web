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

type Opc = { prefer?: string; tags?: string[] };

async function sb(path: string, method: string, body?: unknown, opc: Opc = {}) {
  if (!URL || !KEY) throw new Error("Supabase no está configurado");
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: cab({ "Content-Type": "application/json", Prefer: opc.prefer ?? "return=representation" }),
    ...(opc.tags ? { next: { tags: opc.tags, revalidate: 3600 } } : { cache: "no-store" as const }),
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  const t = await res.text();
  return t ? JSON.parse(t) : null;
}

export const consultar = (q: string, tags?: string[]) => sb(q, "GET", undefined, { tags });
export const insertar = (tabla: string, filas: object) => sb(tabla, "POST", filas);
export const actualizar = (q: string, cambios: object) => sb(q, "PATCH", cambios);
export const borrar = (q: string) => sb(q, "DELETE");
export const guardar = (tabla: string, fila: object) =>
  sb(`${tabla}?on_conflict=id`, "POST", fila, { prefer: "resolution=merge-duplicates,return=representation" });

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

/** Link temporal (5 min) para ver un archivo privado */
export async function linkTemporal(bucket: string, ruta: string) {
  if (!URL || !KEY) throw new Error("Supabase no está configurado");
  const res = await fetch(`${URL}/storage/v1/object/sign/${bucket}/${ruta}`, {
    method: "POST",
    headers: cab({ "Content-Type": "application/json" }),
    body: JSON.stringify({ expiresIn: 300 }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Storage ${res.status}: ${await res.text()}`);
  const j = await res.json();
  return `${URL}/storage/v1${j.signedURL}`;
}
