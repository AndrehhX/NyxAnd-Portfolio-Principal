// Todo el texto del sitio vive aquí. Solo datos reales del CV y de los repositorios públicos.
export const links = {
  github: "https://github.com/AndrehhX",
  email: "andrehcallex@gmail.com",
  cv: "/cv-andreh-callejas.pdf",
} as const;

export const content = {
  brand: "NyxAnd.",
  logoAlt: "Andreh",
  role: "ingeniería en ciencias de la computación",
  year: "2026",
  sections: [
    { id: "proyectos", label: "Proyectos" },
    { id: "experiencia", label: "Experiencia" },
    { id: "sobre-mi", label: "Sobre mí" },
    { id: "contacto", label: "Contacto" },
  ],
  mark: "NyxAnd",
} as const;

export interface Project {
  name: string;
  kind: string;
  summary: string;
  stack: readonly string[];
  code?: string;
  demo?: string;
  status?: string;
}

export const projects: readonly Project[] = [
  {
    name: "Orunei",
    kind: "Plataforma social de anime",
    summary: "Descubre anime, organiza tu AnimeList y comparte una identidad visual, con catálogo en vivo, recomendaciones y perfiles privados.",
    stack: ["React", "Supabase", "AniList"],
    code: "https://github.com/AndrehhX/orunei",
    demo: "https://orunei.fun",
  },
  {
    name: "Kaze",
    kind: "Ecosistema multimedia",
    summary: "Streaming adaptativo HLS para AniList, Watch Parties sincronizadas en tiempo real y app nativa para Android.",
    stack: ["Next.js", "TypeScript", "Supabase", "Kotlin"],
    code: "https://github.com/AndrehhX/Kaze",
    demo: "https://orunei-v2.vercel.app",
  },
  {
    name: "Aevora",
    kind: "Launcher de escritorio",
    summary: "Una sola biblioteca nativa y ligera para Steam, Epic Games y GOG. Estoy reconstruyéndolo desde cero.",
    stack: ["Tauri", "Rust", "React"],
    status: "En desarrollo",
  },
  {
    name: "Mono Motion",
    kind: "Experimento editorial",
    summary: "Tipografía, composición y transiciones interactivas para practicar el control del movimiento en una interfaz.",
    stack: ["React", "TypeScript", "GSAP"],
    code: "https://github.com/AndrehhX/mono-motion",
  },
  {
    name: "Student Organizer",
    kind: "Proyecto académico en grupo",
    summary: "Organiza estudiantes, calificaciones, tareas y promedios desde una base web funcional.",
    stack: ["Java", "HTML y CSS", "JavaScript"],
    code: "https://github.com/AndrehhX/Student-Organizer-Web",
  },
];

export const experience = [
  {
    role: "Asistente de Soporte CRM",
    place: "Universidad del Valle de Guatemala",
    period: "2026, actualidad",
    detail: "Pruebas funcionales en plataformas CRM, reporte de incidencias y apoyo en la integración de instituciones afiliadas.",
  },
  {
    role: "Asistente de Gestión de Datos",
    place: "Departamento de Educación Guatemala Occidente",
    period: "Septiembre a noviembre de 2025",
    detail: "Inventarios tecnológicos, reportes de seguimiento y verificación de facturas, pagos y registros mediante SICOIN.",
  },
  {
    role: "Segundo lugar, Hackathon UVG 2026",
    place: "Universidad del Valle de Guatemala",
    period: "Abril de 2026",
    detail: "Desarrollo de una solución tecnológica en competencia.",
  },
] as const;

export const about = {
  lead: "Soy estudiante de Ingeniería en Ciencias de la Computación en la UVG. Me interesa entender cómo funcionan las herramientas y convertir necesidades concretas en soluciones claras.",
  body: "Me gusta que las cosas se entiendan. Por eso combino lógica, composición visual y pruebas pequeñas antes de dar algo por terminado.",
  skills: ["Python", "TypeScript", "React", "Node.js", "HTML y CSS", "Linux", "Git", "IA y automatización"],
} as const;

export interface Slide {
  stamp: string;
  caption: string;
  image?: string;
  /** Encuadre de la foto dentro de la tarjeta (object-position). */
  focus?: string;
}

// Diapositivas del perfil: fotos propias y hechos reales.
export const slides: readonly Slide[] = [
  { stamp: "Andreh", image: "/media/andreh.jpg", focus: "50% 38%", caption: "Andreh, la persona detrás de NyxAnd." },
  { stamp: "Código", image: "/media/codigo.jpg", focus: "50% 30%", caption: "Programando en C: primero a mano en el cuaderno, después en la laptop con RTX." },
  { stamp: "Circuitos", image: "/media/circuitos.jpg", focus: "50% 45%", caption: "Circuitos lógicos en protoboard, con compuertas 74LS08 y LEDs." },
  { stamp: "UVG", image: "/media/laboratorio.jpg", focus: "50% 55%", caption: "En el laboratorio. Estudio Ingeniería en Ciencias de la Computación en la UVG desde enero de 2026." },
  { stamp: "Hackathon", caption: "Segundo lugar en el Hackathon UVG 2026, en abril." },
  { stamp: "Orunei", image: "/media/orunei.jpg", caption: "Orunei: una plataforma social para descubrir anime y organizar tu AnimeList." },
  { stamp: "Procesos", caption: "Procesos de automatización con IA." },
  { stamp: "Café", image: "/media/cafe.jpg", focus: "50% 60%", caption: "Una pausa con café entre proyectos." },
];

export const highlights = [
  { short: "Py", name: "python" },
  { short: "Ts", name: "typescript" },
  { short: "Re", name: "react" },
  { short: "No", name: "node.js" },
  { short: "Lx", name: "linux" },
  { short: "Git", name: "git" },
] as const;

export const projectImages: Record<string, string> = {
  Orunei: "/media/orunei.jpg",
  Kaze: "/media/kaze.jpg",
};
