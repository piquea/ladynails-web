import Link from "next/link";
import { HORARIO_TEXTO, NEGOCIO } from "@/config/negocio";

export default function Pie() {
  return (
    <div className="contenedor" id="studio">
      <footer className="pie">
        <div className="pie-cols">
          <div>
            <h4>Servicios</h4>
            <a href="/#sistemas">Sistemas</a>
            <a href="/#precios">Precios</a>
            <Link href="/reservar">Reservar cita</Link>
          </div>
          <div>
            <h4>Studio</h4>
            <p>{NEGOCIO.direccion}</p>
            <p>{NEGOCIO.referencia}</p>
            <a href={NEGOCIO.mapa} target="_blank" rel="noopener">Ver en Google Maps ↗</a>
          </div>
          <div>
            <h4>Horario</h4>
            {HORARIO_TEXTO.map((h) => (
              <p key={h.dias}>{h.dias}<br />{h.horas}</p>
            ))}
          </div>
          <div>
            <h4>Contacto</h4>
            <a href={`https://wa.me/${NEGOCIO.whatsapp}`} target="_blank" rel="noopener">WhatsApp {NEGOCIO.whatsappVisible}</a>
            <a href={`mailto:${NEGOCIO.email}`}>{NEGOCIO.email}</a>
          </div>
          <div>
            <h4>Síguenos</h4>
            <a href={NEGOCIO.instagram} target="_blank" rel="noopener" aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" /></svg>
            </a>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="pie-gigante" src="/marca/logo-crema.png" alt="" width={900} height={226} />
      </footer>
      <p className="legal">© {new Date().getFullYear()} Lady Nails Studio · Chacarilla, Lima</p>
    </div>
  );
}
