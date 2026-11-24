// =============================================================
//  CONFIGURACIÓN DE LADY NAILS STUDIO — edita aquí sin tocar el resto del código
//  ⚠️ Lo marcado con COMPLETAR hay que reemplazarlo por el dato real.
// =============================================================

export const NEGOCIO = {
  nombre: "Lady Nails Studio",
  whatsapp: "51900000000", // COMPLETAR: con código de país, sin + ni espacios
  whatsappVisible: "900 000 000", // COMPLETAR
  instagram: "https://www.instagram.com/", // COMPLETAR
  email: "ladynails.adm@gmail.com",
  direccion: "Av. Caminos del Inca 131, Edificio G, Of. 305 – Santiago de Surco",
  referencia: "Frente a Sodimac de Chacarilla",
  mapa: "https://maps.app.goo.gl/ESKcQhzTEU9gW47G8",
};

// ---------- HORARIO DE ATENCIÓN ----------
// 0 = domingo … 6 = sábado. null = cerrado. La última cita debe terminar antes del cierre.
export const HORARIO: Record<number, { abre: string; cierra: string } | null> = {
  0: null, // COMPLETAR si atienden domingos, ej. { abre: "10:00", cierra: "17:00" }
  1: { abre: "09:00", cierra: "20:00" },
  2: { abre: "09:00", cierra: "20:00" },
  3: { abre: "09:00", cierra: "20:00" },
  4: { abre: "09:00", cierra: "20:00" },
  5: { abre: "09:00", cierra: "20:00" },
  6: { abre: "09:00", cierra: "20:00" },
};

export const HORARIO_TEXTO = [
  { dias: "Lunes a sábado", horas: "9:00 a. m. – 8:00 p. m." },
  { dias: "Domingos", horas: "Cerrado" },
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
  { id: "plin", nombre: "Plin" },
  { id: "transferencia", nombre: "Transferencia" },
] as const;

// Cuenta de RECAUDACIÓN (donde pagan las clientas)
export const DATOS_PAGO: Record<string, { titulo: string; lineas: string[] }[]> = {
  yape: [{ titulo: "Yape a nombre de LADY NAILS STUDIO", lineas: ["900 000 000"] }], // COMPLETAR
  plin: [{ titulo: "Plin a nombre de LADY NAILS STUDIO", lineas: ["900 000 000"] }], // COMPLETAR
  transferencia: [
    { titulo: "BCP · cuenta de recaudación", lineas: ["000-0000000-0-00"] }, // COMPLETAR
    { titulo: "CCI", lineas: ["002-000-000000000000-00"] }, // COMPLETAR
  ],
};

export const POLITICAS = [
  "Tu cita queda confirmada cuando validamos tu abono. Te escribiremos por WhatsApp.",
  "El abono se descuenta del total de tu servicio; el saldo lo pagas en el studio.",
  "Si necesitas reprogramar, avísanos por WhatsApp con al menos 24 horas de anticipación.",
  "Te esperamos hasta 15 minutos después de la hora reservada; pasado ese tiempo podríamos reprogramar tu cita.",
];
