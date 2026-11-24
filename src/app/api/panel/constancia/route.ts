import { NextResponse } from "next/server";
import { exigirSesion } from "@/lib/sesion";
import { consultar, linkTemporal } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET /api/panel/constancia?id=12 → abre la constancia (link válido 5 minutos)
export async function GET(req: Request) {
  const no = await exigirSesion(); if (no) return no;
  const u = new URL(req.url);
  const id = Number(u.searchParams.get("id"));
  const col = { manos: "foto_manos", referencia: "foto_referencia" }[u.searchParams.get("tipo") ?? ""] ?? "constancia";
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  const [r] = (await consultar(`reservas?select=${col}&id=eq.${id}`)) as Record<string, string | null>[];
  if (!r?.[col]) return NextResponse.json({ error: "Esta reserva no tiene ese archivo." }, { status: 404 });
  return NextResponse.redirect(await linkTemporal("constancias", r[col]!));
}
