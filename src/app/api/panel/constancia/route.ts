import { NextResponse } from "next/server";
import { exigirSesion } from "@/lib/sesion";
import { consultar, linkTemporal } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET /api/panel/constancia?id=12 → abre la constancia (link válido 5 minutos)
export async function GET(req: Request) {
  const no = await exigirSesion(); if (no) return no;
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  const [r] = (await consultar(`reservas?select=constancia&id=eq.${id}`)) as { constancia: string | null }[];
  if (!r?.constancia) return NextResponse.json({ error: "Esta reserva no tiene constancia." }, { status: 404 });
  return NextResponse.redirect(await linkTemporal("constancias", r.constancia));
}
