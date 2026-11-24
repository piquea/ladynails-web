import { NextResponse } from "next/server";
import { exigirSesion } from "@/lib/sesion";
import { actualizar, consultar } from "@/lib/supabase";

export const dynamic = "force-dynamic";
const F = /^\d{4}-\d{2}-\d{2}$/;
const ESTADOS = ["por_validar", "confirmada", "atendida", "anulada"];

// GET /api/panel/reservas?desde=2026-11-24&hasta=2026-11-30
export async function GET(req: Request) {
  const no = await exigirSesion(); if (no) return no;
  const u = new URL(req.url);
  const desde = u.searchParams.get("desde") ?? "", hasta = u.searchParams.get("hasta") ?? "";
  if (!F.test(desde) || !F.test(hasta)) return NextResponse.json({ error: "Fechas inválidas" }, { status: 400 });
  try {
    const filas = await consultar(`reservas?select=*&fecha=gte.${desde}&fecha=lte.${hasta}&order=fecha.asc,hora_inicio.asc&limit=500`);
    return NextResponse.json({ reservas: filas });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "No se pudo leer la base de datos." }, { status: 500 });
  }
}

// PATCH { id, estado }
export async function PATCH(req: Request) {
  const no = await exigirSesion(); if (no) return no;
  const { id, estado } = await req.json().catch(() => ({}));
  if (!Number.isInteger(id) || !ESTADOS.includes(estado)) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  try {
    const [r] = await actualizar(`reservas?id=eq.${id}`, { estado });
    return NextResponse.json({ reserva: r });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "No se pudo guardar." }, { status: 500 });
  }
}
