import Link from "next/link";
import Nav from "@/components/Nav";
import Pie, { BotonWhatsApp } from "@/components/Pie";
import Sistemas from "@/components/Sistemas";
import Precios from "@/components/Precios";
import { activos, buscar, soles, type Servicio } from "@/lib/catalogo";
import { obtenerAjustes, type Ajustes } from "@/lib/ajustes";

export const revalidate = 3600;

/* eslint-disable @next/next/no-img-element */

const PILARES = [
  { t: "Experiencia femenina", d: "Un espacio pensado por y para mujeres: importa el resultado, y también cómo te sientes durante tu visita." },
  { t: "Calidad en cada detalle", d: "Estándares claros de atención, técnica, higiene, presentación y tiempos en cada servicio." },
  { t: "Manicuristas profesionales", d: "Un equipo especializado que trabaja con una misma forma de hacer las cosas." },
  { t: "La forma Lady Nails", d: "Procesos definidos para que tu servicio se vea igual de bien, te atienda quien te atienda." },
];

const preguntas = (aj: Ajustes) => [
  { p: "¿Cómo reservo mi cita?", r: `Elige tus servicios, la fecha y una hora disponible. Paga el abono de ${soles(aj.abono.monto)} por ${aj.metodosPago.map((m) => m.nombre).join(", ")} y sube tu constancia. Te escribimos por WhatsApp para confirmar.` },
  { p: "¿Por qué piden un abono?", r: "Separa la hora de tu manicurista solo para ti. El abono se descuenta de tu servicio y el saldo lo pagas en el studio al terminar." },
  { p: "¿Qué sistema me conviene?", r: "Si quieres mantener tu uña natural: Rubber Gel o Builder Gel (más estructura). Si buscas largo: Polygel, Acrílicas o Soft Gel. Toca cada sistema arriba para ver para quién es ideal, o escríbenos y te ayudamos a elegir." },
  { p: "Tengo un trabajo de otro studio, ¿lo pueden retirar?", r: "Sí. Agrega el retiro a tu reserva en la pestaña «Retiro de otro studio» para que separemos el tiempo necesario." },
  { p: "¿Puedo reprogramar mi cita?", r: "Sí, escríbenos por WhatsApp con al menos 1 día de anticipación: tu abono pasa a la nueva cita. Si no asistes o cancelas con menos tiempo, el abono no es reembolsable." },
  { p: "¿Emiten boleta o factura?", r: `Sí, somos ${aj.negocio.razonSocial} (RUC ${aj.negocio.ruc}). Emitimos boleta o factura electrónica; si necesitas factura, indícanos tu RUC al momento del pago.` },
  { p: "¿Dónde están?", r: `${aj.negocio.direccion}. ${aj.negocio.referencia}.` },
];

const precio = (lista: Servicio[], c: string) => buscar(activos(lista), c)?.precio;

export default async function Inicio() {
  const aj = await obtenerAjustes();
  const gel = precio(aj.servicios, "MNC003"), manipedi = precio(aj.servicios, "PCK003");
  const ext = Math.min(...["MNC005", "MNC006", "MNC007", "MNC008", "MNC013"].map((c) => precio(aj.servicios, c) ?? 9999));
  return (
    <>
      <Nav />

      {/* HERO */}
      <section className="contenedor hero">
        <div className="hero-texto">
          <h1 className="titulo-hero sube">
            {aj.hero.titulo1}
            {aj.hero.titulo2 && <><br /><span className="it">{aj.hero.titulo2}</span></>}
          </h1>
          <p className="hero-bajada sube sube-2">
            {aj.hero.bajada}
          </p>
          <div className="fila sube sube-3">
            <Link href="/reservar" className="btn btn-oscuro">Reservar mi cita</Link>
            <a href="#sistemas" className="btn btn-borde">Ver sistemas</a>
          </div>
        </div>
        <div className="hero-foto sube">
          <img src="/fotos/portada-hd.webp" alt="Clienta mostrando su manicure color vino en Lady Nails Studio" fetchPriority="high" />
          <img className="hero-emblema" src="/marca/emblema-crema.png" alt="" width={300} height={251} />
          <p className="hero-nota">{aj.hero.nota}</p>
        </div>
      </section>

      {/* FRANJA */}
      <div className="franja" aria-label="Nuestros sistemas">
        {["Rubber Gel", "Builder Gel", "Soft Gel", "PolyGel", "Acrílicas", "Pedicure", "Nail Art"].map((t) => (
          <span key={t}>{t}<img src="/marca/emblema-crema.png" alt="" width={300} height={251} /></span>
        ))}
      </div>

      {/* SISTEMAS */}
      <div className="lamina" id="sistemas">
        <div className="contenedor">
          <div className="cabecera">
            <p className="marca-eyebrow"><img src="/marca/emblema-vino.png" alt="" width={300} height={251} />Sistemas</p>
            <div className="centro">
              <h2 className="titulo-l">Encuentra <span className="suave">tu</span> sistema</h2>
              <p className="sub-l">Cada uña es distinta. <span className="suave">Por eso no hay una sola técnica.</span></p>
            </div>
            <p className="eyebrow der">Cinco técnicas, una misma<br />forma de trabajar.</p>
          </div>
          <Sistemas servicios={aj.servicios} />
        </div>

        {/* EXPERIENCIA */}
        <section className="contenedor seccion" id="experiencia" style={{ paddingTop: 96 }}>
          <div className="panel">
            <div className="panel-cab">
              <div>
                <p className="marca-eyebrow claro"><img src="/marca/emblema-crema.png" alt="" width={300} height={251} />Experiencia</p>
                <h2 className="titulo-l" style={{ marginTop: 8 }}>
                  Lady Nails te <span className="it">recibe</span><br />— y cuida cada detalle.
                </h2>
              </div>
              <p className="chica">Sin prisas. Sin sorpresas. Tu hora está separada solo para ti.</p>
            </div>
            <div className="duo">
              <div className="foto-etiqueta">
                <img src="/fotos/studio.webp" alt="Manicurista de Lady Nails trabajando en su estación" loading="lazy" style={{ objectPosition: "50% 60%" }} />
                <span className="firma">El studio</span>
                <div className="vidrio">
                  <h3>Cada estación, lista para ti</h3>
                  <p>Atención, técnica, higiene y presentación con estándares definidos. Tu manicurista te recibe con todo preparado.</p>
                </div>
              </div>
              <div className="foto-etiqueta">
                <img src="/fotos/chrome-espejo.webp" alt="Manicure rosa con acabado perla" loading="lazy" style={{ objectPosition: "50% 55%" }} />
                <span className="firma">El resultado</span>
                <div className="vidrio">
                  <h3>Un acabado que se nota</h3>
                  <p>Superficie uniforme, forma cuidada y un brillo que dura. Elegimos contigo el sistema según tu uña y tu rutina.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PILARES */}
        <section className="contenedor seccion">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 20, flexWrap: "wrap", marginBottom: 32 }}>
            <div>
              <p className="marca-eyebrow"><img src="/marca/emblema-vino.png" alt="" width={300} height={251} />Lo que nos define</p>
              <h2 className="titulo-l">Cuatro <span className="it">pilares</span></h2>
            </div>
            <p className="chica" style={{ textAlign: "right" }}>Una forma definida de trabajar, en cada cita.</p>
          </div>
          <div className="pilares">
            {PILARES.map((p, i) => (
              <div key={p.t} className={`pilar pilar-${i + 1}`}>
                <span className="num it">0{i + 1}</span>
                <img src={i === 3 ? "/marca/emblema-crema.png" : "/marca/emblema-vino.png"} alt="" width={300} height={251} className="emb" />
                <div><h3>{p.t}</h3><p>{p.d}</p></div>
              </div>
            ))}
          </div>
        </section>

        {/* PRECIOS */}
        <section className="contenedor seccion" id="precios">
          <p className="marca-eyebrow"><img src="/marca/emblema-vino.png" alt="" width={300} height={251} />Precios</p>
          <h2 className="titulo-l">Claros desde <span className="it">el inicio.</span></h2>
          <div style={{ height: 36 }} />
          <div className="planes">
            <div className="plan plan-1">
              <span className="nom">Manicure gel</span>
              <span className="precio">{gel !== undefined ? soles(gel) : "—"}</span>
              <p className="txt">Esmaltado gel con brillo duradero. El clásico de todos los días.</p>
              <Link href="/reservar?s=MNC003" className="btn btn-claro btn-chico">Reservar</Link>
            </div>
            <div className="plan plan-2">
              <span className="sello">Mani + Pedi</span>
              <span className="nom">Pack Glam &amp; Care</span>
              <span className="precio">{manipedi !== undefined ? soles(manipedi) : "—"}</span>
              <p className="txt">Manicure y pedicure con esmaltado gel en una sola visita.</p>
              <Link href="/reservar?s=PCK003" className="btn btn-oscuro btn-chico">Reservar</Link>
            </div>
            <div className="plan plan-3">
              <span className="nom">Extensiones</span>
              <span className="precio">Desde {soles(ext)}</span>
              <p className="txt">Polygel, acrílicas, builder gel y soft gel. El largo y la forma que elijas.</p>
              <a href="#sistemas" className="btn btn-claro btn-chico">Ver sistemas</a>
            </div>
          </div>
          <Precios servicios={aj.servicios} />
        </section>

        {/* PREGUNTAS */}
        <section className="contenedor seccion" id="preguntas">
          <p className="marca-eyebrow"><img src="/marca/emblema-vino.png" alt="" width={300} height={251} />Preguntas</p>
          <h2 className="titulo-l" style={{ marginBottom: 32 }}>Las que más <span className="it">nos hacen.</span></h2>
          <div className="faq">
            {preguntas(aj).map((q, i) => (
              <details key={q.p} open={i === 0}>
                <summary>{q.p}<span className="flecha">↘</span></summary>
                <p className="resp">{q.r}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="contenedor seccion">
          <div className="cta-foto">
            <img src="/fotos/proceso.webp" alt="" loading="lazy" />
            <span className="izq">Tu momento, cada semana.</span>
            <p className="der">Elige tu hora en línea. El resto lo cuidamos nosotras.</p>
          </div>
          <div className="cta-fila">
            <h2 className="titulo-l">Tu próxima cita<br /><span className="suave">empieza</span> aquí.</h2>
            <Link href="/reservar" className="btn btn-oscuro">Reservar cita</Link>
          </div>
        </section>
      </div>
      <Pie aj={aj} />
      <BotonWhatsApp numero={aj.negocio.whatsapp} />
    </>
  );
}
