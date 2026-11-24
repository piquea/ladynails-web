"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fechaLarga, hora12 } from "@/lib/agenda";
import { soles } from "@/lib/catalogo";

type Estado = { estado: string; pagado: boolean; fecha: string; hora: string; abono: number; saldo: number };

export default function Resultado({ whatsapp, direccion }: { whatsapp: string; direccion: string }) {
  const sp = useSearchParams();
  const codigo = sp.get("codigo") ?? "";
  const pago = sp.get("payment_id") ?? sp.get("collection_id") ?? "";
  const mp = sp.get("mp");
  const [e, setE] = useState<Estado | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let vivo = true, n = 0;
    const revisar = async () => {
      const r = await fetch(`/api/reservas/estado?codigo=${encodeURIComponent(codigo)}${pago ? `&pago=${pago}` : ""}`);
      const j = await r.json();
      if (!vivo) return;
      if (!r.ok) return setError(j.error ?? "No encontramos tu reserva.");
      setE(j);
      // El aviso de Mercado Pago puede tardar unos segundos
      if (!j.pagado && mp !== "rechazado" && ++n < 8) setTimeout(revisar, 3000);
    };
    revisar();
    return () => { vivo = false; };
  }, [codigo, pago, mp]);

  const wa = `https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hola Lady Nails 💅🏻 Tengo una consulta sobre mi reserva ${codigo}.`)}`;
  let titulo = "Revisando tu pago…", texto = "Esto toma unos segundos.";
  if (error) { titulo = "No encontramos tu reserva"; texto = error; }
  else if (e?.pagado) { titulo = "¡Tu cita está confirmada!"; texto = `Recibimos tu pago de ${soles(e.abono)}. Te esperamos el ${fechaLarga(e.fecha).toLowerCase()} a las ${hora12(e.hora)}.${e.saldo > 0 ? ` Saldo a pagar en el studio: ${soles(e.saldo)}.` : ""}`; }
  else if (mp === "rechazado") { titulo = "El pago no se completó"; texto = "No se realizó ningún cobro. Puedes intentar nuevamente o reservar pagando con Yape o transferencia."; }
  else if (e && mp === "pendiente") { titulo = "Tu pago está en proceso"; texto = "Mercado Pago nos avisará cuando se apruebe y te confirmaremos por WhatsApp."; }

  return (
    <div className="reserva-listo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/marca/emblema-vino.png" alt="" width={70} height={59} style={{ margin: "0 auto 18px" }} />
      <p className="eyebrow">Reserva {codigo}</p>
      <h1 className="titulo-l" style={{ margin: "10px 0 16px" }}>{titulo}</h1>
      <p style={{ fontSize: 15, lineHeight: 1.6, maxWidth: 520, margin: "0 auto 26px" }}>{texto}</p>
      {e?.pagado && <p className="chica" style={{ margin: "-12px auto 24px", maxWidth: 420 }}>{direccion}.</p>}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        {mp === "rechazado" ? <Link className="btn btn-oscuro" href="/reservar">Volver a reservar</Link> : <a className="btn btn-oscuro" href={wa} target="_blank" rel="noopener">Escribirnos por WhatsApp</a>}
        <Link className="btn btn-claro" href="/">Volver al inicio</Link>
      </div>
    </div>
  );
}
