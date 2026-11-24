import { NextResponse } from "next/server";
import { exigirSesion } from "@/lib/sesion";
import { actualizar, consultar } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const no = await exigirSesion(); if (no) return no;
  const filas = await consultar("reclamaciones?select=*&order=creado_en.desc&limit=300");
  return NextResponse.json({ reclamaciones: filas });
}

// PATCH { id, respuesta } → la marca como respondida
export async function PATCH(req: Request) {
  const no = await exigirSesion(); if (no) return no;
  const { id, respuesta } = await req.json().catch(() => ({}));
  const txt = String(respuesta ?? "").trim().slice(0, 4000);
  if (!Number.isInteger(id) || txt.length < 5) return NextResponse.json({ error: "Escribe la respuesta." }, { status: 400 });
  const [r] = await actualizar(`reclamaciones?id=eq.${id}`, { respuesta: txt, estado: "respondido", respondido_en: new Date().toISOString() });
  return NextResponse.json({ reclamacion: r });
}
