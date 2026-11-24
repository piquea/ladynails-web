import { NextResponse } from "next/server";
import { horasLibres } from "@/lib/agenda";
import { ocupacionDelDia } from "@/lib/ocupacion";

export const dynamic = "force-dynamic";

// GET /api/disponibilidad?fecha=2026-11-28&duracion=90
export async function GET(req: Request) {
  const u = new URL(req.url);
  const fecha = u.searchParams.get("fecha") ?? "";
  const duracion = Number(u.searchParams.get("duracion"));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !(duracion > 0 && duracion <= 600))
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  try {
    const horas = horasLibres(fecha, duracion, await ocupacionDelDia(fecha));
    return NextResponse.json({ horas });
  } catch (e) {
    console.error("disponibilidad", e);
    return NextResponse.json({ error: "No pudimos revisar la agenda. Intenta de nuevo." }, { status: 500 });
  }
}
