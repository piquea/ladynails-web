// =============================================================
//  CONFIGURACIÓN DE LADY NAILS STUDIO — edita aquí sin tocar el resto del código
// =============================================================

export const NEGOCIO = {
  nombre: "Lady Nails Studio",
  whatsapp: "51946441428", // con código de país, sin + ni espacios
  whatsappVisible: "946 441 428",
  instagram: "https://www.instagram.com/ladynails.pe/",
  lema: "Perfect nails. Every time.",
  email: "ladynails.adm@gmail.com",
  direccion: "Av. Caminos del Inca 131, Edificio G, Of. 305 – Santiago de Surco",
  referencia: "Frente a Sodimac de Chacarilla",
  mapa: "https://maps.app.goo.gl/ESKcQhzTEU9gW47G8",
  razonSocial: "BEAUTY CORP PERU S.A.C.",
  ruc: "20615935396",
};

// ---------- HORARIO DE ATENCIÓN ----------
// 0 = domingo … 6 = sábado. null = cerrado. La última cita debe terminar antes del cierre.
export const HORARIO: Record<number, { abre: string; cierra: string } | null> = {
  0: { abre: "10:00", cierra: "16:00" }, // domingo
  1: { abre: "10:00", cierra: "19:00" },
  2: { abre: "10:00", cierra: "19:00" },
  3: { abre: "10:00", cierra: "19:00" },
  4: { abre: "10:00", cierra: "19:00" },
  5: { abre: "10:00", cierra: "19:00" },
  6: { abre: "10:00", cierra: "19:00" }, // sábado
};

export const HORARIO_TEXTO = [
  { dias: "Lunes a sábado", horas: "10:00 a. m. – 7:00 p. m." },
  { dias: "Domingos", horas: "10:00 a. m. – 4:00 p. m." },
];

export const AGENDA = {
  manicuristas: 3, // citas que se pueden atender a la vez
  intervaloMin: 30, // cada cuánto se ofrece una hora de inicio
  anticipacionHoras: 3, // no se puede reservar con menos de estas horas
  diasAdelante: 45, // hasta cuántos días adelante se puede reservar
  fechasBloqueadas: ["2026-12-25", "2027-01-01"] as string[], // AAAA-MM-DD
};

// ---------- ABONO ----------
// La clienta paga este porcentaje al reservar y el resto en el studio.
export const ABONO = { porcentaje: 50, minimo: 30 };

export const METODOS_PAGO = [
  { id: "yape", nombre: "Yape" },
  { id: "bcp", nombre: "BCP" },
  { id: "bbva", nombre: "BBVA" },
] as const;

// Cuenta de RECAUDACIÓN (donde pagan las clientas)
export const DATOS_PAGO: Record<string, { titulo: string; lineas: string[] }[]> = {
  yape: [{ titulo: "Yape · BEAUTY CORP PERU S.A.C.", lineas: ["946 441 428"] }],
  bcp: [{ titulo: "BCP · Cuenta recaudación Lady Nails", lineas: ["1937387090069"] }],
  bbva: [{ titulo: "BBVA · Cuenta recaudación Lady Nails", lineas: ["0011-0138-0200558678"] }],
};

export const POLITICAS = [
  "Tu cita queda confirmada cuando validamos tu abono. Te escribiremos por WhatsApp.",
  "El abono se descuenta del total de tu servicio; el saldo lo pagas en el studio.",
  "Si necesitas reprogramar, avísanos por WhatsApp con al menos 24 horas de anticipación.",
  "Te esperamos hasta 15 minutos después de la hora reservada; pasado ese tiempo podríamos reprogramar tu cita.",
];
