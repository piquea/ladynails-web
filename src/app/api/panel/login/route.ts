import { NextResponse } from "next/server";
import { COOKIE, claveCorrecta, crearToken, panelConfigurado } from "@/lib/sesion";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!panelConfigurado()) return NextResponse.json({ error: "Falta configurar ADMIN_CLAVE en Netlify." }, { status: 503 });
  const { clave } = await req.json().catch(() => ({ clave: "" }));
  if (!claveCorrecta(String(clave ?? ""))) {
    await new Promise((r) => setTimeout(r, 900)); // frena intentos repetidos
    return NextResponse.json({ error: "Clave incorrecta." }, { status: 401 });
  }
  const { token, maxAge } = crearToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
