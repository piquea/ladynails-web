import { NextResponse } from "next/server";
import { exigirSesion } from "@/lib/sesion";
import { borrar, consultar, insertar } from "@/lib/supabase";

export const dynamic = "force-dynamic";
const H = /^\d{2}:\d{2}$/;

export async function GET() {
  const no = await exigirSesion(); if (no) return no;
  const hoy = new Date(Date.now() - 5 * 3600e3).toISOString().slice(0, 10);
  const filas = await consultar(`bloqueos_agenda?select=*&fecha=gte.${hoy}&order=fecha.asc,hora_inicio.asc&limit=200`);
  return NextResponse.json({ bloqueos: filas });
}

// POST { fecha, horaInicio?, horaFin?, cupos, motivo }
export async function POST(req: Request) {
  const no = await exigirSesion(); if (no) return no;
  const d = await req.json().catch(() => ({}));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.fecha ?? "")) return NextResponse.json({ error: "Elige una fecha." }, { status: 400 });
  const todoElDia = !d.horaInicio && !d.horaFin;
  if (!todoElDia && (!H.test(d.horaInicio) || !H.test(d.horaFin) || d.horaInicio >= d.horaFin))
    return NextResponse.json({ error: "Revisa las horas." }, { status: 400 });
  const [b] = await insertar("bloqueos_agenda", {
    fecha: d.fecha,
    hora_inicio: todoElDia ? null : d.horaInicio,
    hora_fin: todoElDia ? null : d.horaFin,
    cupos: Math.max(1, Math.min(20, Number(d.cupos) || 1)),
    motivo: String(d.motivo ?? "").slice(0, 120) || null,
  });
  return NextResponse.json({ bloqueo: b });
}

export async function DELETE(req: Request) {
  const no = await exigirSesion(); if (no) return no;
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  await borrar(`bloqueos_agenda?id=eq.${id}`);
  return NextResponse.json({ ok: true });
}
