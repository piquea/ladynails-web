import Link from "next/link";
import Nav from "@/components/Nav";
import Pie from "@/components/Pie";
import Sistemas from "@/components/Sistemas";
import Precios from "@/components/Precios";
import { ABONO, NEGOCIO } from "@/config/negocio";
import { porCodigo, soles } from "@/lib/catalogo";

/* eslint-disable @next/next/no-img-element */

const PILARES = [
  { t: "Experiencia femenina", d: "Un espacio pensado por y para mujeres: importa el resultado, y también cómo te sientes durante tu visita." },
  { t: "Calidad en cada detalle", d: "Estándares claros de atención, técnica, higiene, presentación y tiempos en cada servicio." },
  { t: "Manicuristas profesionales", d: "Un equipo especializado que trabaja con una misma forma de hacer las cosas." },
  { t: "La forma Lady Nails", d: "Procesos definidos para que tu servicio se vea igual de bien, te atienda quien te atienda." },
];

const PREGUNTAS = [
  { p: "¿Cómo reservo mi cita?", r: `Elige tus servicios, la fecha y una hora disponible. Paga el abono (${ABONO.porcentaje}% del total) por Yape, Plin o transferencia y sube tu constancia. Te escribimos por WhatsApp para confirmar.` },
  { p: "¿Por qué piden un abono?", r: "Separa la hora de tu manicurista solo para ti. El abono se descuenta de tu servicio y el saldo lo pagas en el studio." },
  { p: "¿Qué sistema me conviene?", r: "Si quieres mantener tu uña natural: Rubber Gel o Builder Gel (más estructura). Si buscas largo: Polygel, Acrílicas o Soft Gel. Toca cada sistema arriba para ver para quién es ideal, o escríbenos y te ayudamos a elegir." },
  { p: "Tengo un trabajo de otro studio, ¿lo pueden retirar?", r: "Sí. Agrega el retiro a tu reserva en la pestaña «Retiro de otro studio» para que separemos el tiempo necesario." },
  { p: "¿Puedo reprogramar mi cita?", r: "Sí, escríbenos por WhatsApp con al menos 24 horas de anticipación y buscamos otra fecha contigo." },
  { p: "¿Dónde están?", r: `${NEGOCIO.direccion}. ${NEGOCIO.referencia}.` },
];

export default function Inicio() {
  const gel = porCodigo("MNC003")!, manipedi = porCodigo("PCK003")!, ext = porCodigo("MNC005")!;
  return (
    <>
      <Nav />

      {/* HERO */}
      <section className="contenedor hero">
        <div className="hero-texto">
          <p className="eyebrow sube">Perfect nails. Every time. · Lady Nails Studio</p>
          <h1 className="titulo-xl sube sube-2">
            Uñas impecables.<br />
            Un momento <span className="it">solo tuyo.</span>
          </h1>
          <div className="fila sube sube-3">
            <Link href="/reservar" className="btn btn-oscuro">Reservar mi cita</Link>
            <a href="#sistemas" className="btn btn-borde">Ver sistemas</a>
          </div>
          <div className="hero-datos sube sube-3">
            <div><b>5 sistemas</b>para cada tipo de uña</div>
            <div><b>Reserva en línea</b>con abono del {ABONO.porcentaje}%</div>
            <div><b>Chacarilla</b>frente a Sodimac</div>
          </div>
        </div>
        <div className="hero-foto sube">
          <img src="/fotos/hero-vino.webp" alt="Clienta mostrando su manicure color vino en Lady Nails Studio" fetchPriority="high" />
          <div className="hero-mini"><img src="/fotos/cateye-rosa.webp" alt="" /></div>
          <p className="hero-nota">
            Manicure y pedicure con técnicas que cuidan tu uña natural, en un espacio cercano y hecho para ti — sin apuro, con estándares claros.
          </p>
        </div>
      </section>

      {/* SISTEMAS */}
      <div className="lamina" id="sistemas">
        <div className="contenedor">
          <div className="cabecera">
            <p className="eyebrow">Cinco técnicas, una misma forma de trabajar.</p>
            <div className="centro">
              <h2 className="titulo-l">Encuentra <span className="suave">tu</span> sistema</h2>
              <p className="sub-l">Cada uña es distinta. <span className="suave">Por eso no hay una sola técnica.</span></p>
            </div>
            <span />
          </div>
          <Sistemas />
        </div>

        {/* EXPERIENCIA */}
        <section className="contenedor seccion" id="experiencia" style={{ paddingTop: 96 }}>
          <div className="panel">
            <div className="panel-cab">
              <div>
                <p className="eyebrow">Más que un salón.</p>
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
              <h2 className="titulo-l">Cuatro <span className="pildora">pilares</span></h2>
              <p className="sub-l" style={{ marginTop: 6 }}>Lo que nos define</p>
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
          <h2 className="titulo-l">Precios</h2>
          <p className="sub-l" style={{ marginTop: 6, marginBottom: 32 }}>Claros desde el inicio.</p>
          <div className="planes">
            <div className="plan plan-1">
              <span className="nom">Manicure gel</span>
              <span className="precio">{soles(gel.precio)}</span>
              <p className="txt">Esmaltado gel con brillo duradero. El clásico de todos los días.</p>
              <Link href="/reservar?s=MNC003" className="btn btn-claro btn-chico">Reservar</Link>
            </div>
            <div className="plan plan-2">
              <span className="sello">Mani + Pedi</span>
              <span className="nom">ManiPedi Gel</span>
              <span className="precio">{soles(manipedi.precio)}</span>
              <p className="txt">Manicure y pedicure con esmaltado gel en una sola visita.</p>
              <Link href="/reservar?s=PCK003" className="btn btn-oscuro btn-chico">Reservar</Link>
            </div>
            <div className="plan plan-3">
              <span className="nom">Extensiones</span>
              <span className="precio">Desde {soles(ext.precio)}</span>
              <p className="txt">Polygel, acrílicas, builder gel y soft gel. El largo y la forma que elijas.</p>
              <a href="#sistemas" className="btn btn-claro btn-chico">Ver sistemas</a>
            </div>
          </div>
          <Precios />
        </section>

        {/* PREGUNTAS */}
        <section className="contenedor seccion" id="preguntas">
          <h2 className="titulo-l">Preguntas</h2>
          <p className="sub-l" style={{ marginTop: 6, marginBottom: 28 }}>Las que más nos hacen.</p>
          <div className="faq">
            {PREGUNTAS.map((q, i) => (
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
        <Pie />
      </div>
    </>
  );
}
