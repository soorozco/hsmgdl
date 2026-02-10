
export interface IPerformanceSection {
  category: string;
  questions: string[];
}

export const PERFORMANCE_EVALUATION_SCALE = ["Deficiente", "Regular", "Bueno", "Muy bueno", "Excelente"];

export const PERFORMANCE_EVALUATION_QUESTIONS: IPerformanceSection[] = [
  {
    category: "Comunicación",
    questions: [
      "Comparte información de manera efectiva y asertiva.",
      "Escucha activamente y es receptivo a las opiniones de los demás.",
      "Presta atención en las conversaciones.",
      "Se comunica de manera escrita con claridad.",
      "Expresa sus ideas con claridad y respeto a la otra persona.",
      "Fomenta el diálogo de manera abierta y directa."
    ]
  },
  {
    category: "Trabajo en equipo",
    questions: [
      "Se desempeña como un miembro activo del equipo.",
      "Inspira, motiva y guía al equipo para el logro de las metas.",
      "Comparte su conocimiento, habilidades y experiencia.",
      "Comparte el reconocimiento de logros con el resto del equipo."
    ]
  },
  {
    category: "Resolución de problemas",
    questions: [
      "Recauda información de diferentes fuentes antes de tomar una decisión.",
      "Se enfoca en los asuntos clave para resolver el problema.",
      "Tiene flexibilidad y disposición de cambio ante las situaciones.",
      "Considera las implicaciones antes de llevar a cabo una acción.",
      "Conserva la calma en situaciones complicadas."
    ]
  },
  {
    category: "Mejora continua",
    questions: [
      "Se adapta a trabajar con nuevos procesos y tareas.",
      "No muestra resistencia a las ideas de las demás personas.",
      "Busca activamente nuevas maneras de realizar las actividades.",
      "Se esfuerza por innovar y aportar ideas.",
      "Busca reforzar sus habilidades y trabajar en sus áreas de oportunidad"
    ]
  },
  {
    category: "Organización y administración del tiempo",
    questions: [
        "Es capaz de establecer prioridades en sus tareas laborales.",
        "Completa de manera efectiva en tiempo y forma los proyectos asignados",
        "Utiliza eficientemente los recursos asignados para llevar a cabo sus actividades."
    ]
  },
  {
    category: "Enfoque en el cliente",
    questions: [
        "Establece y mantiene relación a largo plazo con los clientes al ganar su confianza.",
        "Procura la satisfacción del cliente al brindar un servicio de excelencia.",
        "Busca nuevas maneras de brindar valor agregado a los clientes.",
        "Entiende las necesidades del cliente y busca exceder sus expectativas.",
        "Es percibido por el cliente como una persona confiable que representa a la empresa."
    ]
  }
];
