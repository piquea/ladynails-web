"use client";

import { useState } from "react";

export default function Login() {
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true); setError("");
    const res = await fetch("/api/panel/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clave }) });
    if (res.ok) location.reload();
    else { setError((await res.json()).error ?? "No se pudo entrar."); setCargando(false); }
  }

  return (
    <main className="pn-login">
      <form className="pn-caja" onSubmit={entrar}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/marca/emblema-vino.png" alt="" width={56} height={47} />
        <h1>Panel Lady Nails</h1>
        <label>Clave<input type="password" value={clave} onChange={(e) => setClave(e.target.value)} autoFocus autoComplete="current-password" /></label>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-oscuro" disabled={cargando || !clave}>{cargando ? "Entrando…" : "Entrar"}</button>
      </form>
    </main>
  );
}
