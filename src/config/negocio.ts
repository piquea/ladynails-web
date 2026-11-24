// =============================================================
//  VALORES INICIALES DE LADY NAILS STUDIO
//  Todo esto se puede cambiar desde el panel interno (/panel → Contenido).
//  Lo que se guarda en el panel reemplaza a lo de este archivo.
// =============================================================

export const NEGOCIO = {
  nombre: "Lady Nails Studio",
  whatsapp: "51946441428", // con código de país, sin + ni espacios
  whatsappVisible: "946 441 428",
  instagram: "https://www.instagram.com/ladynails.pe/",
  tiktok: "https://www.tiktok.com/@ladynails.pe",
  email: "hola@ladynails.pe",
  direccion: "Av. Caminos del Inca 131, Edificio G, Of. 305 – Santiago de Surco",
  referencia: "Frente a Sodimac de Chacarilla",
  mapa: "https://maps.app.goo.gl/ESKcQhzTEU9gW47G8",
  razonSocial: "BEAUTY CORP PERU S.A.C.",
  ruc: "20615935396",
};

// 0 = domingo … 6 = sábado. null = cerrado. La última cita debe terminar antes del cierre.
export type Horario = Record<string, { abre: string; cierra: string } | null>;
export const HORARIO: Horario = {
  0: { abre: "10:00", cierra: "16:00" },
  1: { abre: "10:00", cierra: "19:00" },
  2: { abre: "10:00", cierra: "19:00" },
  3: { abre: "10:00", cierra: "19:00" },
  4: { abre: "10:00", cierra: "19:00" },
  5: { abre: "10:00", cierra: "19:00" },
  6: { abre: "10:00", cierra: "19:00" },
};

export const AGENDA = {
  manicuristas: 3, // citas que se pueden atender a la vez
  intervaloMin: 30, // cada cuánto se ofrece una hora de inicio
  anticipacionHoras: 3, // no se puede reservar con menos de estas horas
  diasAdelante: 45, // hasta cuántos días adelante se puede reservar
};

// Anticipo fijo (Términos y condiciones 4.1): se descuenta del total.
export const ABONO = { monto: 30 };

export type MetodoPago = { id: string; nombre: string; titulo: string; lineas: string[] };
export const METODOS_PAGO: MetodoPago[] = [
  { id: "yape", nombre: "Yape", titulo: "Yape · BEAUTY CORP PERU S.A.C.", lineas: ["946 441 428"] },
  { id: "bcp", nombre: "BCP", titulo: "BCP · Cuenta recaudación Lady Nails", lineas: ["1937387090069"] },
  { id: "bbva", nombre: "BBVA", titulo: "BBVA · Cuenta recaudación Lady Nails", lineas: ["0011-0138-0200558678"] },
];

export const POLITICAS = [
  "Tu cita queda confirmada cuando validamos tu abono y te lo confirmamos por WhatsApp.",
  "El abono de S/ 30 se descuenta del total de tu servicio; el saldo lo pagas en el studio al terminar.",
  "Para reprogramar, avísanos con al menos 1 día de anticipación y tu abono pasa a la nueva cita.",
  "Si no asistes o cancelas con menos de 1 día de anticipación, el abono no es reembolsable.",
  "Te esperamos hasta 15 minutos después de la hora reservada.",
  "Si quieres cambiar el diseño, avísanos con al menos 3 horas de anticipación.",
];

export const HERO = {
  titulo1: "Perfect nails.",
  titulo2: "Every time.",
  bajada: "Manicure y pedicure en Chacarilla con técnicas que cuidan tu uña natural, estándares claros y un espacio pensado para ti.",
};
