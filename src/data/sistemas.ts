// Los sistemas que explicamos en la web. "codigos" = servicios del Excel que pertenecen a cada sistema.
export type Sistema = {
  id: string;
  nombre: string;
  bajada: string;
  foto: string;
  descripcion: string;
  recomendado: string;
  nota?: string;
  codigos: string[];
};

export const SISTEMAS: Sistema[] = [
  {
    id: "rubber-gel",
    nombre: "Rubber Gel",
    bajada: "Tu uña natural, con un refuerzo flexible.",
    foto: "/fotos/cateye-rosa.webp",
    descripcion:
      "¿Quieres mantener tus uñas naturales, pero darles mayor resistencia? Aplicamos una base flexible que refuerza tus uñas naturales, ayuda a prevenir quiebres y nos permite conseguir una superficie uniforme y un acabado prolijo.",
    recomendado: "Quieres conservar el largo de tus uñas naturales y darles un refuerzo adicional para que luzcan bonitas y cuidadas.",
    codigos: ["MNC004", "PDC004", "PCK004", "RTQ001"],
  },
  {
    id: "builder-gel",
    nombre: "Builder Gel",
    bajada: "Natural, pero con estructura.",
    foto: "/fotos/vino-2.webp",
    descripcion:
      "Si buscas unas uñas naturales, pero con mayor estructura, el Builder Gel es una excelente opción. Trabajamos con un gel constructor que nos permite nivelar, reforzar y dar cuerpo a tus uñas, consiguiendo una manicura uniforme, resistente y elegante.",
    recomendado: "Quieres mantener tus uñas naturales, pero necesitas una estructura más firme y definida.",
    codigos: ["MNC008", "MNC009", "MNC012", "RTQ004", "RTQ007"],
  },
  {
    id: "polygel",
    nombre: "Polygel",
    bajada: "Extensiones ligeras, con la forma que elijas.",
    foto: "/fotos/libro.webp",
    descripcion:
      "¿Te gustaría lucir uñas más largas y con una forma personalizada? El Polygel combina las propiedades del acrílico y el gel, permitiéndonos construir extensiones con una estructura resistente y ligera. Podemos trabajar el largo y la forma que más te gusten.",
    recomendado: "Buscas extensiones con buena resistencia, estructura y mayor libertad para personalizar tu manicura.",
    codigos: ["MNC005", "MNC006", "MNC011", "RTQ002", "RTQ006"],
  },
  {
    id: "acrilicas",
    nombre: "Uñas Acrílicas",
    bajada: "Largo, firmeza y diseños elaborados.",
    foto: "/fotos/diseno-estrellas.webp",
    descripcion:
      "Si te encantan las uñas largas y con diseños personalizados, las acrílicas son para ti. Creamos tus extensiones mediante la combinación de polvo acrílico y líquido monómero, construyendo una estructura firme y resistente que nos permite trabajar diferentes largos, formas y estilos.",
    recomendado: "Buscas extensiones resistentes, con mayor longitud y la posibilidad de lucir diseños más elaborados.",
    codigos: ["MNC007", "MNC010", "RTQ003", "RTQ005"],
  },
  {
    id: "soft-gel",
    nombre: "Soft Gel",
    bajada: "Alargamiento express.",
    foto: "/fotos/cafe-libro.webp",
    descripcion:
      "¿Buscas alargar tus uñas de manera rápida y práctica? El Soft Gel utiliza tips completos de gel, que se adhieren directamente sobre tu uña natural. A diferencia de otros sistemas, no necesitamos construir una estructura adicional encima del tip, por lo que es una alternativa más rápida de aplicación.",
    nota: "Es un sistema de alargamiento más ligero en cuanto a estructura y con menor resistencia y duración frente a otras técnicas.",
    recomendado: "Buscas un alargamiento express para lucir uñas bonitas en poco tiempo.",
    codigos: ["MNC013"],
  },
];
