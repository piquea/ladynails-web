// Sesión del panel interno: una clave (variable ADMIN_CLAVE en Netlify) y una cookie firmada de 12 horas.
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const COOKIE = "ln_panel";
const DURACION = 12 * 60 * 60; // segundos

const secreto = () => `${process.env.ADMIN_CLAVE ?? ""}|${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""}`;
const firma = (v: string) => createHmac("sha256", secreto()).update(v).digest("base64url");
const iguales = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export const panelConfigurado = () => (process.env.ADMIN_CLAVE ?? "").length >= 8;
export const claveCorrecta = (c: string) => panelConfigurado() && iguales(c, process.env.ADMIN_CLAVE!);

export function crearToken() {
  const exp = String(Math.floor(Date.now() / 1000) + DURACION);
  return { token: `${exp}.${firma(exp)}`, maxAge: DURACION };
}

export async function autenticado() {
  if (!panelConfigurado()) return false;
  const t = (await cookies()).get(COOKIE)?.value ?? "";
  const [exp, f] = t.split(".");
  return !!exp && !!f && Number(exp) > Date.now() / 1000 && iguales(f, firma(exp));
}

/** Para las API del panel: devuelve una respuesta 401 si no hay sesión */
export async function exigirSesion() {
  return (await autenticado()) ? null : NextResponse.json({ error: "Tu sesión terminó. Vuelve a entrar." }, { status: 401 });
}
