
export interface IQuestionSection {
  section: string;
  instructions: string;
  questions: string[];
}

export const NOM035_QUESTIONS: IQuestionSection[] = [
  {
    section: "Ambiente de trabajo",
    instructions: "Las preguntas siguientes están relacionadas con las condiciones del lugar donde realiza su trabajo.",
    questions: [
      "El espacio donde trabajo me permite realizar mis actividades de manera segura e higiénica.",
      "Mi trabajo me exige hacer mucho esfuerzo físico.",
      "Me preocupa sufrir un accidente en mi trabajo.",
      "Considero que en mi trabajo se aplican las normas de seguridad y salud en el trabajo.",
      "Considero que las actividades que realizo son peligrosas."
    ]
  },
  {
    section: "Factores propios de la actividad",
    instructions: "Las preguntas siguientes están relacionadas con las actividades que realiza en su trabajo y con el equipo que utiliza.",
    questions: [
      "Por la cantidad de trabajo que tengo debo trabajar sin parar.",
      "Tengo que tomar decisiones difíciles en mi trabajo.",
      "En mi trabajo soy responsable de cosas de mucho valor.",
      "Mi trabajo me exige atender varios asuntos al mismo tiempo.",
      "En mi trabajo me exigen hacer las cosas con gran rapidez.",
      "Mi trabajo exige que esté muy concentrado.",
      "Mi trabajo requiere que memorice mucha información.",
      "En mi trabajo tengo que tomar decisiones que afectan la seguridad de otras personas."
    ]
  },
  {
    section: "Organización del tiempo de trabajo",
    instructions: "Las preguntas siguientes están relacionadas con el tiempo destinado a su trabajo y sus responsabilidades familiares.",
    questions: [
      "Por la cantidad de trabajo que tengo debo quedarme tiempo adicional a mi turno.",
      "Por la cantidad de trabajo que tengo debo trabajar fuera del horario establecido.",
      "Debo atender asuntos de trabajo cuando estoy en casa.",
      "Pienso en las preocupaciones del trabajo cuando estoy en casa.",
      "Mi trabajo me deja sin energía para convivir con mi familia y amigos."
    ]
  },
  {
    section: "Liderazgo y relaciones en el trabajo",
    instructions: "Las preguntas siguientes están relacionadas con la relación que tiene con sus jefes y/o compañeros de trabajo.",
    questions: [
      "Mi jefe me ayuda a organizar mi trabajo.",
      "Mi jefe tiene en cuenta mis puntos de vista y opiniones.",
      "Mi jefe me comunica a tiempo la información relacionada con el trabajo.",
      "La orientación que me da mi jefe me ayuda a realizar mejor mi trabajo.",
      "Mi jefe me ayuda a solucionar los problemas que se presentan en el trabajo.",
      "Puedo confiar en mis compañeros de trabajo.",
      "Cuando tenemos que realizar trabajo de equipo los compañeros colaboran.",
      "Mis compañeros de trabajo me ayudan cuando tengo dificultades.",
      "En mi trabajo puedo expresarme sin temor a ser juzgado.",
      "En mi trabajo me tratan de manera injusta.",
      "En mi trabajo no me tratan con respeto.",
      "En mi trabajo siento que me ignoran o me excluyen.",
      "En mi trabajo me agreden de forma verbal (insultos, apodos, groserías, etc.).",
      "En mi trabajo me humillan, desprecian o me hacen menos.",
      "En mi trabajo me amenazan.",
      "En mi trabajo me empujan o golpean.",
      "En mi trabajo me acosan sexualmente.",
      "En mi trabajo me molestan para que renuncie."
    ]
  }
];
