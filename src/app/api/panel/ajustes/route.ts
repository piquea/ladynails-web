import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { exigirSesion } from "@/lib/sesion";
import { guardar, supabaseConfigurado } from "@/lib/supabase";
import { AJUSTES_BASE, TAG_AJUSTES, normalizar, obtenerAjustes } from "@/lib/ajustes";

export const dynamic = "force-dynamic";

export async function GET() {
  const no = await exigirSesion(); if (no) return no;
  return NextResponse.json({ ajustes: await obtenerAjustes(), base: AJUSTES_BASE });
}

export async function PUT(req: Request) {
  const no = await exigirSesion(); if (no) return no;
  if (!supabaseConfigurado()) return NextResponse.json({ error: "Supabase no está configurado." }, { status: 503 });
  const datos = normalizar(await req.json().catch(() => ({})));
  try {
    await guardar("ajustes", { id: "sitio", datos, actualizado_en: new Date().toISOString() });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "No se pudo guardar." }, { status: 500 });
  }
  revalidateTag(TAG_AJUSTES);
  revalidatePath("/", "layout");
  return NextResponse.json({ ajustes: datos });
}
