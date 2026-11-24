"use client";

import Link from "next/link";
import { useState } from "react";

export default function Nav({ simple = false }: { simple?: boolean }) {
  const [abierta, setAbierta] = useState(false);
  const ir = (h: string) => (simple ? `/${h}` : h);
  return (
    <header className={`nav ${abierta ? "nav-abierta" : ""}`}>
      <div className="nav-barra">
        <Link href="/" aria-label="Lady Nails Studio — inicio">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <span className="nav-logo">
            <img src="/marca/emblema-crema.png" alt="" width={300} height={251} className="emb" />
            <img src="/marca/logo-crema.png" alt="Lady Nails" width={900} height={226} />
          </span>
        </Link>
        <nav className="nav-links" onClick={() => setAbierta(false)}>
          <a href={ir("#sistemas")}>Sistemas</a>
          <a href={ir("#experiencia")}>Experiencia</a>
          <a href={ir("#precios")}>Precios</a>
          <a href={ir("#preguntas")}>Preguntas</a>
          <a href={ir("#contacto")}>Contacto</a>
        </nav>
        <button className="nav-menu" aria-label="Menú" onClick={() => setAbierta(!abierta)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            {abierta ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
          </svg>
        </button>
      </div>
      <div className="nav-acciones">
        <Link href="/reservar" className="btn btn-claro">Reservar cita</Link>
      </div>
    </header>
  );
}
