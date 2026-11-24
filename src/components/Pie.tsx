import Link from "next/link";
import type { Ajustes } from "@/lib/ajustes";
import { textoHorario } from "@/lib/agenda";
import { soles } from "@/lib/catalogo";

/* eslint-disable @next/next/no-img-element */

export const IconoIG = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".9" fill="currentColor" /></svg>
);
export const IconoTikTok = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.6c.27 0 .53.04.77.12V9.77a5.73 5.73 0 0 0-.77-.05A5.68 5.68 0 1 0 15.54 15.4V9.01a7.3 7.3 0 0 0 4.27 1.37V7.3s-1.88.09-3.21-1.48Z" /></svg>
);
export const IconoWA = ({ t = 20 }: { t?: number }) => (
  <svg width={t} height={t} viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.85 9.85 0 0 0 12.04 2Zm0 18.150h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.040-.2-.31a8.23 8.23 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.830 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.220.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.180.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" /></svg>
);

export default function Pie({ aj }: { aj: Ajustes }) {
  const N = aj.negocio;
  const wa = `https://wa.me/${N.whatsapp}`;
  return (
    <footer className="pie" id="contacto">
      <div className="contenedor pie-cols">
        <div className="pie-intro">
          <div className="pie-marca">
            <img src="/marca/emblema-crema.png" alt="" width={300} height={251} className="emb" />
            <span className="titulo-pie">¡Hola, somos <span className="it">Lady Nails!</span></span>
          </div>
          <p>Un studio de manicure y pedicure pensado por y para mujeres: técnicas que cuidan tu uña natural, estándares claros y una experiencia cercana.</p>
          <ul>
            <li>Reserva en línea y separa tu hora con un abono de {soles(aj.abono.monto)}.</li>
            <li>Rubber, Builder gel, Soft gel, PolyGel y Acrílicas.</li>
            <li>Nuestros precios incluyen IGV. Emitimos boleta o factura electrónica.</li>
            <li>{N.direccion}. {N.referencia}.</li>
          </ul>
        </div>

        <div>
          <p className="pie-titulo">Canal de atención WhatsApp</p>
          <a className="pie-numero" href={wa} target="_blank" rel="noopener"><IconoWA t={28} />{N.whatsappVisible}</a>
          {textoHorario(aj.horario).map((h) => (
            <div key={h.dias} className="pie-horario"><span>{h.dias}</span><b>{h.horas}</b></div>
          ))}
          <div className="redes">
            <a href={N.instagram} target="_blank" rel="noopener" aria-label="Instagram de Lady Nails"><IconoIG /></a>
            <a href={N.tiktok} target="_blank" rel="noopener" aria-label="TikTok de Lady Nails"><IconoTikTok /></a>
            <a href={wa} target="_blank" rel="noopener" aria-label="WhatsApp de Lady Nails"><IconoWA /></a>
          </div>
        </div>

        <div className="pie-links">
          <a href="/#sistemas">Sistemas</a>
          <a href="/#precios">Precios</a>
          <a href="/#preguntas">Preguntas frecuentes</a>
          <Link href="/reservar">Reservar cita</Link>
          <a href={N.mapa} target="_blank" rel="noopener">Cómo llegar</a>
          <Link href="/terminos">Términos y condiciones</Link>
          <Link href="/libro-de-reclamaciones" className="btn-libro">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 5.5c2.5-1 5.5-1 9 1v13c-3.5-2-6.5-2-9-1v-13Zm18 0c-2.5-1-5.5-1-9 1v13c3.5-2 6.5-2 9-1v-13Z" /><path d="M5.5 9h4M5.5 12h4M14.5 9h4M14.5 12h4" /></svg>
            <span>Libro de<br />Reclamaciones</span>
          </Link>
          <p className="ruc">{N.razonSocial} · RUC {N.ruc}</p>
        </div>
      </div>

      <img className="pie-gigante" src="/marca/logo-crema.png" alt="" width={900} height={226} />

      <div className="contenedor pie-base">
        <span>© {new Date().getFullYear()} {N.razonSocial.replace(/\.$/, "")}. Todos los derechos reservados. Lady Nails Studio.</span>
        <span>Developed by <a href="https://www.instagram.com/motiva.pe" target="_blank" rel="noopener"><b>Motiva.pe</b></a></span>
      </div>
    </footer>
  );
}

export function BotonWhatsApp({ numero }: { numero: string }) {
  return (
    <a className="wa-flotante" href={`https://wa.me/${numero}`} target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp">
      <IconoWA t={30} />
    </a>
  );
}
