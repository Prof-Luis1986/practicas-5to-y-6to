import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  getAuth
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import { integratedGuides } from "./guides.js";

const firebaseConfig = {
  apiKey: "AIzaSyAVLJQNZbsfKVir_EWunmPkol1sRDZ8s50",
  authDomain: "prisma-area1.firebaseapp.com",
  projectId: "prisma-area1",
  storageBucket: "prisma-area1.firebasestorage.app",
  messagingSenderId: "365814519775",
  appId: "1:365814519775:web:51710d5aacdd376173d66a"
};

const teacherEmail = "practicas.simon1@gmail.com";
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const units = [
  {
    id: "unidad-0",
    label: "Unidad 0",
    title: "Propedéutico y herramientas base"
  },
  {
    id: "unidad-1",
    label: "Unidad 1",
    title: "Programación y procesamiento de datos"
  },
  {
    id: "unidad-2",
    label: "Unidad 2",
    title: "Simulación, videojuegos e interfaces gráficas"
  },
  {
    id: "unidad-3",
    label: "Unidad 3",
    title: "Automatización, control y Arduino"
  },
  {
    id: "unidad-4",
    label: "Unidad 4",
    title: "Aplicaciones, bitácoras y bases de datos"
  }
];

const activities = [
  {
    id: "actividad-1-pensamiento-logico",
    unitId: "unidad-0",
    number: "U0-A1",
    title: "Pensamiento lógico y algoritmos",
    duration: "50 min",
    output: "Bitácora con respuestas y pseudocódigo",
    description: "Reflexiona sobre qué es un algoritmo, cómo aparece en la vida diaria y cómo expresarlo con pasos ordenados.",
    steps: [
      "Explica con tus palabras qué significa algoritmo.",
      "Relaciona internet y algoritmos con situaciones de tu vida diaria.",
      "Escribe un algoritmo cotidiano en pasos ordenados.",
      "Identifica decisiones, repeticiones y tipos de datos.",
      "Responde las preguntas de reflexión."
    ],
    questions: [
      ["algoritmo", "¿Qué significa para ti un algoritmo?", "Incluye un ejemplo cotidiano con pasos claros."],
      ["internet", "¿Cómo crees que internet y los algoritmos están conectados en tu vida diaria?", "Menciona redes sociales, apps, búsquedas u otra experiencia personal."],
      ["pseudocodigo", "Escribe un pseudocódigo de una acción cotidiana.", "Usa inicio, pasos, condición y final."],
      ["reflexion", "¿Por qué es importante que un algoritmo sea claro?", "Explica qué podría pasar si las instrucciones son confusas."]
    ]
  },
  {
    id: "actividad-2-diagnostico",
    unitId: "unidad-0",
    number: "U0-A2",
    title: "Sesión diagnóstico",
    duration: "50 min",
    output: "Autoevaluación de conocimientos",
    description: "Reconoce tus conocimientos iniciales de programación, lógica, herramientas digitales y organización de trabajo.",
    steps: [
      "Describe qué sabes de programación.",
      "Identifica herramientas digitales que usas para estudiar.",
      "Explica qué temas te gustaría dominar este año.",
      "Define una meta personal para la materia."
    ],
    questions: [
      ["programacion", "¿Qué sabes actualmente sobre programación?", "Puedes mencionar lenguajes, bloques, páginas o proyectos previos."],
      ["herramientas", "¿Qué herramientas digitales usas para estudiar o crear trabajos?", "Incluye apps, sitios web o dispositivos."],
      ["meta", "¿Qué meta personal tienes para esta materia?", "Escribe una meta concreta y alcanzable."],
      ["dificultades", "¿Qué se te dificulta al usar tecnología?", "Esto ayuda a planear apoyos durante el curso."]
    ]
  },
  {
    id: "actividad-3-configuracion-inicial",
    unitId: "unidad-0",
    number: "U0-A3",
    title: "Configuración inicial",
    duration: "60 min",
    output: "Ambiente de trabajo configurado",
    description: "Prepara tus cuentas, carpetas y herramientas para trabajar durante el año.",
    steps: [
      "Confirma que puedes acceder con tu cuenta de Gmail.",
      "Crea una carpeta digital para la materia.",
      "Organiza subcarpetas por bimestre o actividad.",
      "Registra evidencias de tu configuración."
    ],
    questions: [
      ["cuenta", "¿Con qué cuenta de Gmail trabajarás durante el curso?", "No escribas contraseña, solo confirma el correo."],
      ["carpetas", "Describe cómo organizaste tus carpetas de trabajo.", "Incluye nombres de carpetas y ubicación."],
      ["evidencia", "¿Qué evidencia tienes de la configuración?", "Puedes pegar una liga a captura o documento en el campo de evidencia."],
      ["pendientes", "¿Qué quedó pendiente por configurar?", "Si todo está listo, escribe que no hay pendientes."]
    ]
  },
  {
    id: "unidad-1-tipos-datos-python",
    unitId: "unidad-1",
    number: "U1-A1",
    title: "Tipos de datos y variables en Python",
    duration: "60 min",
    output: "Repositorio app002 y evidencia del programa",
    description: "Crea un programa en Python que use int, float, str, bool y list, solicite datos por teclado y documente la importancia de los tipos de datos.",
    steps: [
      "Crea el archivo app002.py.",
      "Declara variables de diferentes tipos de datos.",
      "Solicita al usuario al menos dos datos por teclado.",
      "Muestra valores y tipos con type().",
      "Sube el proyecto a GitHub y registra la evidencia."
    ],
    questions: [
      ["variables", "¿Qué tipos de datos utilizaste y para qué sirve cada uno?", "Incluye ejemplos de int, float, str, bool y list."],
      ["entradas", "¿Qué datos solicitaste al usuario?", "Explica cómo los convertiste o validaste."],
      ["operaciones", "Describe tres operaciones entre variables.", "Puede ser suma, concatenación o modificación de listas."],
      ["github", "Pega la liga del repositorio de GitHub.", "Verifica que el repositorio sea accesible."]
    ]
  },
  {
    id: "unidad-1-calculadoras-areas",
    unitId: "unidad-1",
    number: "U1-A2",
    title: "Calculadora y áreas en Python",
    duration: "60 min",
    output: "Programas de operaciones y áreas",
    description: "Desarrolla programas simples en Python para operaciones matemáticas y cálculo de áreas, usando entrada/salida de datos y funciones.",
    steps: [
      "Crea funciones o archivos para suma, resta, multiplicación y división.",
      "Desarrolla programas para calcular el área de seis figuras geométricas.",
      "Documenta fórmulas, entradas y salidas.",
      "Publica el proyecto y evidencias en tu portafolio."
    ],
    questions: [
      ["operaciones", "¿Qué operaciones matemáticas programaste?", "Describe entradas, proceso y salida."],
      ["figuras", "¿Qué seis figuras geométricas elegiste?", "Incluye las fórmulas utilizadas."],
      ["funciones", "¿Cómo organizaste tu código con funciones?", "Explica si usaste un archivo por operación o un menú."],
      ["evidencias", "Pega la liga a tus evidencias.", "Puede ser GitHub, Google Sites o documento compartido."]
    ]
  },
  {
    id: "unidad-1-perfil-datos",
    unitId: "unidad-1",
    number: "U1-A3",
    title: "Perfil y procesamiento de datos en Python",
    duration: "90 min",
    output: "Programa de perfil de datos y manuales",
    description: "Procesa datos de usuario en Python, presenta resultados claros y documenta el funcionamiento del programa.",
    steps: [
      "Ejecuta y analiza el programa de perfil de datos.",
      "Identifica variables, cálculos, formatos de salida y validaciones.",
      "Genera capturas del programa funcionando.",
      "Elabora manual de usuario y manual técnico."
    ],
    questions: [
      ["datos", "¿Qué datos procesa tu programa?", "Describe las entradas principales."],
      ["procesamiento", "¿Qué cálculos o transformaciones realiza?", "Explica la lógica central."],
      ["manuales", "¿Qué diferencia hay entre el manual de usuario y el manual técnico?", "Indica qué incluiste en cada uno."],
      ["mejora", "¿Qué mejora harías al programa?", "Propón una mejora concreta."]
    ]
  },
  {
    id: "unidad-1-salud-inteligente",
    unitId: "unidad-1",
    number: "U1-A4",
    title: "Proyecto Salud Inteligente",
    duration: "90 min",
    output: "Asistente de salud digital en Python",
    description: "Crea una app de consola que calcule IMC, recomiende horas de sueño, evalúe tiempo de pantalla y registre pausas activas.",
    steps: [
      "Crea salud_inteligente.py.",
      "Ejecuta cada módulo del menú.",
      "Captura IMC, sueño, pantalla, pausas y reporte final.",
      "Responde preguntas de bienestar digital."
    ],
    questions: [
      ["modulos", "¿Qué módulos de la app ejecutaste?", "Incluye IMC, sueño, pantalla, pausas y reporte."],
      ["resultados", "Resume los resultados obtenidos.", "Puedes usar datos reales o simulados."],
      ["habitos", "¿Qué hábitos puedes modificar para mejorar tu bienestar digital?", "Relaciona tus respuestas con los resultados."],
      ["mejoras", "¿Qué mejoras propondrías para la app?", "Piensa en utilidad, diseño o validación de datos."]
    ]
  },
  {
    id: "unidad-1-quiz-historico",
    unitId: "unidad-1",
    number: "U1-Proyecto",
    title: "Proyecto bimestral: Quiz histórico",
    duration: "2 a 3 sesiones",
    output: "Quiz en Python, investigación y presentación",
    description: "Desarrolla un quiz histórico de 20 preguntas con opción múltiple, validación, puntaje y opción de repetir.",
    steps: [
      "Selecciona un tema histórico.",
      "Investiga y redacta 20 preguntas de opción múltiple.",
      "Programa el quiz usando listas o diccionarios, while e if/elif/else.",
      "Calcula puntaje y permite repetir.",
      "Prepara presentación oral y evidencia escrita."
    ],
    questions: [
      ["tema", "¿Qué tema histórico elegiste y por qué?", "Menciona el enfoque de investigación."],
      ["estructura", "¿Cómo organizaste las preguntas en Python?", "Explica listas, diccionarios u otra estructura."],
      ["validacion", "¿Cómo validaste las respuestas del usuario?", "Describe el uso de ciclos, condicionales o try/except."],
      ["evidencia", "Pega la liga o describe tus evidencias.", "Incluye código, ejecución y presentación."]
    ]
  },
  {
    id: "unidad-2-sierpinski",
    unitId: "unidad-2",
    number: "U2-A1",
    title: "Sierpinski animado con turtle",
    duration: "90 min",
    output: "Fractal animado, bitácora y evidencias",
    description: "Investiga fractales y programa el triángulo de Sierpinski con Python turtle, modificando profundidad y colores.",
    steps: [
      "Investiga qué es un fractal y quién fue Wacław Sierpiński.",
      "Transcribe el código base en VS Code.",
      "Ejecuta el fractal con diferentes profundidades.",
      "Modifica colores y registra evidencias visuales.",
      "Explica cómo funciona la recursión."
    ],
    questions: [
      ["fractal", "¿Qué es un fractal?", "Escribe una explicación breve."],
      ["recursion", "¿Cómo funciona la recursión en tu programa?", "Descríbelo con tus palabras."],
      ["profundidades", "¿Qué cambió al usar diferentes profundidades?", "Compara al menos dos ejecuciones."],
      ["evidencias", "Pega la liga a tus capturas o video.", "Incluye código y resultado."]
    ]
  },
  {
    id: "unidad-2-pelota-pygame",
    unitId: "unidad-2",
    number: "U2-A2",
    title: "Pelota en Pygame",
    duration: "3 horas",
    output: "Programa interactivo y documentación",
    description: "Desarrolla un programa interactivo en Pygame aplicando movimiento, colisiones, colores y eventos de teclado.",
    steps: [
      "Crea la ventana del juego con pygame.display.set_mode().",
      "Controla posición, tamaño y colisiones con pygame.Rect().",
      "Implementa movimiento, rebote y eventos de teclado.",
      "Documenta el proceso con manual técnico y manual de usuario."
    ],
    questions: [
      ["pygame", "¿Qué funciones de Pygame usaste?", "Menciona display, Rect, eventos o clock."],
      ["movimiento", "¿Cómo controlaste el movimiento y rebote?", "Explica posición, velocidad y límites."],
      ["interaccion", "¿Qué interacción agregaste con teclado?", "Describe las teclas usadas."],
      ["documentacion", "¿Qué incluiste en tus manuales?", "Diferencia usuario y técnico."]
    ]
  },
  {
    id: "unidad-2-atrapa-manzanas",
    unitId: "unidad-2",
    number: "U2-A3",
    title: "Atrapa Manzanas",
    duration: "90 min",
    output: "Juego con puntaje y eventos",
    description: "Construye un juego simple donde el usuario controla un elemento, atrapa objetos y registra puntaje.",
    steps: [
      "Crea la escena principal del juego.",
      "Programa movimiento del jugador.",
      "Agrega objetos coleccionables.",
      "Implementa puntaje y condición de reinicio o fin."
    ],
    questions: [
      ["objetivo", "¿Cuál es el objetivo del juego?", "Explica cómo gana o avanza el jugador."],
      ["eventos", "¿Qué eventos controla el usuario?", "Describe teclado, mouse o botones."],
      ["puntaje", "¿Cómo se calcula el puntaje?", "Explica la lógica."],
      ["mejora", "¿Qué mejora visual o de dificultad agregaste?", "Describe tu modificación."]
    ]
  },
  {
    id: "unidad-2-vida-submarina",
    unitId: "unidad-2",
    number: "U2-A4",
    title: "Vida Submarina: colisiones y lógica de juego",
    duration: "2 sesiones",
    output: "Juego en App Lab con puntos y sonido",
    description: "Amplía el juego Vida Submarina agregando algas, colisiones, contador de puntos y efectos sonoros.",
    steps: [
      "Revisa la estructura previa del juego.",
      "Agrega objetos coleccionables.",
      "Detecta colisiones entre pez y algas.",
      "Actualiza puntaje y reproduce sonido.",
      "Documenta cambios y prueba el juego."
    ],
    questions: [
      ["colision", "¿Cómo detectaste la colisión?", "Explica la condición usada."],
      ["puntos", "¿Cómo actualizaste el contador de puntos?", "Describe variables y actualización en pantalla."],
      ["sonido", "¿Qué efecto sonoro agregaste y cuándo se reproduce?", "Relaciona evento y respuesta."],
      ["pruebas", "¿Qué pruebas hiciste para validar el juego?", "Menciona errores encontrados y correcciones."]
    ]
  },
  {
    id: "unidad-3-asimov-robotica",
    unitId: "unidad-3",
    number: "U3-A1",
    title: "Robótica, Isaac Asimov e impacto tecnológico",
    duration: "50 min",
    output: "Investigación y reflexión",
    description: "Analiza la relación entre robótica, automatización, ética tecnológica y las ideas de Isaac Asimov.",
    steps: [
      "Investiga conceptos básicos de robótica y automatización.",
      "Revisa aportaciones de Isaac Asimov.",
      "Relaciona automatización con ciencia e industria.",
      "Redacta una reflexión personal."
    ],
    questions: [
      ["robotica", "¿Qué entiendes por robótica?", "Relaciona sensores, actuadores y control."],
      ["asimov", "¿Qué aportó Isaac Asimov a la idea de robótica?", "Explica una ley o idea relevante."],
      ["impacto", "¿Qué impacto tiene la automatización en la industria?", "Incluye beneficios y riesgos."],
      ["etica", "¿Qué responsabilidad ética existe al diseñar tecnología?", "Da un ejemplo."]
    ]
  },
  {
    id: "unidad-3-teclado-musical",
    unitId: "unidad-3",
    number: "U3-A2",
    title: "Teclado musical básico con Arduino",
    duration: "2 sesiones",
    output: "Circuito Tinkercad/físico y practicario",
    description: "Comprende Arduino mediante entradas digitales con pushbuttons y salida sonora con buzzer pasivo.",
    steps: [
      "Analiza componentes: Arduino Uno, pushbuttons, buzzer y protoboard.",
      "Construye el circuito en Tinkercad.",
      "Arma el circuito físico.",
      "Modifica el proyecto agregando tres LEDs.",
      "Documenta preguntas, evidencias y reflexión."
    ],
    questions: [
      ["componentes", "¿Qué componentes usaste y qué función cumple cada uno?", "Incluye Arduino, botones, buzzer y protoboard."],
      ["codigo", "¿Cómo identifica Arduino qué botón fue presionado?", "Explica digitalRead, INPUT_PULLUP o arreglos."],
      ["sonido", "¿Cómo se genera cada nota musical?", "Relaciona frecuencia y tone()."],
      ["reto", "¿Cómo resolviste el reto de los LEDs?", "Describe conexión y lógica."]
    ]
  },
  {
    id: "unidad-3-fabuloso-fred",
    unitId: "unidad-3",
    number: "U3-A3",
    title: "Juego electrónico Fabuloso Fred",
    duration: "2 a 3 sesiones",
    output: "Juego Arduino, evidencias y análisis de código",
    description: "Desarrolla un juego electrónico interactivo aplicando condicionales, ciclos, memoria EEPROM e interacción hardware/software.",
    steps: [
      "Reproduce el circuito en Tinkercad.",
      "Valida entradas y salidas: botones, LEDs, buzzer y LCD.",
      "Arma el circuito físico.",
      "Carga y analiza el código.",
      "Documenta diferencias entre circuito digital y físico."
    ],
    questions: [
      ["objetivo", "¿Cuál es el objetivo del juego Fabuloso Fred?", "Describe la dinámica del jugador."],
      ["control", "¿Qué función cumplen if, switch, for y while en el código?", "Relaciona cada estructura con el juego."],
      ["eeprom", "¿Por qué se usa EEPROM?", "Explica qué dato conserva o gestiona."],
      ["hardware", "¿Cómo se relacionan LEDs, sonido, botones y LCD con el código?", "Describe entradas y salidas."]
    ]
  },
  {
    id: "unidad-3-estacionamiento",
    unitId: "unidad-3",
    number: "U3-A4",
    title: "Estacionamiento inteligente con Arduino",
    duration: "3 a 4 sesiones",
    output: "Sistema automatizado con sensor, semáforo, servo y LCD",
    description: "Diseña un sistema que detecta vehículos, indica disponibilidad, controla una barrera y muestra mensajes en pantalla.",
    steps: [
      "Investiga sensor ultrasónico, servomotor y LCD.",
      "Mide distancia con HC-SR04.",
      "Controla semáforo según disponibilidad.",
      "Integra barrera con servomotor.",
      "Muestra estados en LCD e integra el sistema completo."
    ],
    questions: [
      ["componentes", "¿Qué función cumple cada componente del estacionamiento?", "Sensor, semáforo, servo y LCD."],
      ["distancia", "¿Cómo se usa la distancia para tomar decisiones?", "Explica umbral y condición."],
      ["integracion", "¿Qué problemas encontraste al integrar el sistema completo?", "Menciona ajustes realizados."],
      ["evidencia", "Pega o describe tus evidencias del sistema funcionando.", "Incluye video, fotos o capturas."]
    ]
  },
  {
    id: "unidad-3-ventilador",
    unitId: "unidad-3",
    number: "U3-A5",
    title: "Ventilador con rehilete controlado por potenciómetro",
    duration: "2 sesiones",
    output: "Prototipo de control de velocidad",
    description: "Construye un sistema de control donde la lectura analógica de un potenciómetro modifica la respuesta de un actuador.",
    steps: [
      "Identifica lectura analógica y salida de control.",
      "Conecta potenciómetro y motor o actuador.",
      "Programa el mapeo de valores.",
      "Prueba distintas velocidades.",
      "Registra evidencias y conclusiones."
    ],
    questions: [
      ["analogico", "¿Qué diferencia hay entre entrada analógica y digital?", "Relaciónalo con el potenciómetro."],
      ["map", "¿Cómo transformaste la lectura en velocidad?", "Explica map() o el cálculo usado."],
      ["pruebas", "¿Qué observaste al variar el potenciómetro?", "Describe el comportamiento."],
      ["aplicacion", "¿Dónde se usa un control similar en la industria?", "Da un ejemplo real."]
    ]
  },
  {
    id: "unidad-3-robot-sumo",
    unitId: "unidad-3",
    number: "U3-Proyecto",
    title: "Robot Sumo autónomo",
    duration: "3 sesiones",
    output: "Robot integrado con motores, sensores y lógica de combate",
    description: "Integra estructura, motores, sensores y programación para construir un robot sumo funcional.",
    steps: [
      "Identifica componentes del robot.",
      "Arma estructura y sistema de motores.",
      "Integra sensores.",
      "Programa lógica de búsqueda, ataque y evasión.",
      "Documenta pruebas, fallas y ajustes."
    ],
    questions: [
      ["componentes", "¿Qué componentes forman tu robot sumo?", "Incluye estructura, control, motores y sensores."],
      ["logica", "¿Qué lógica sigue el robot durante el combate?", "Explica decisiones principales."],
      ["pruebas", "¿Qué pruebas realizaste antes de competir?", "Menciona ajustes técnicos."],
      ["mejora", "¿Qué mejorarías del diseño?", "Piensa en estabilidad, sensores o estrategia."]
    ]
  },
  {
    id: "unidad-4-flet-intro",
    unitId: "unidad-4",
    number: "U4-A1",
    title: "Introducción a Flet y diseño de interfaces",
    duration: "60 min",
    output: "App interactiva con botones e imágenes",
    description: "Instala Flet, comprende Page y Controls, crea una interfaz con botones, imágenes y publicación en GitHub.",
    steps: [
      "Instala Flet y verifica la versión.",
      "Crea main.py y carpeta assets.",
      "Programa botones Sí, No y Quizás.",
      "Cambia imagen y texto según interacción.",
      "Publica el proyecto en GitHub."
    ],
    questions: [
      ["flet", "¿Qué es Flet y para qué sirve?", "Explica Page y Controls."],
      ["assets", "¿Para qué sirve la carpeta assets?", "Menciona imágenes usadas."],
      ["interaccion", "¿Cómo cambian imagen y texto al presionar botones?", "Explica page.update()."],
      ["github", "Pega la liga del repositorio.", "Verifica que incluya main.py y assets."]
    ]
  },
  {
    id: "unidad-4-flet-todo",
    unitId: "unidad-4",
    number: "U4-A2",
    title: "Diseño de interfaces y organización visual en Flet",
    duration: "90 min",
    output: "To-Do App con diseño organizado",
    description: "Construye una app tipo lista de tareas usando Containers, Row, Column, iconos y componentes interactivos.",
    steps: [
      "Crea encabezado, entrada de tareas y lista.",
      "Permite agregar, editar, eliminar y marcar tareas.",
      "Usa Containers, Row, Column, IconButton y Checkbox.",
      "Cuida espaciado, alineación y organización visual."
    ],
    questions: [
      ["componentes", "¿Qué componentes de Flet usaste?", "Menciona Containers, Row, Column, IconButton o Checkbox."],
      ["acciones", "¿Qué acciones permite tu To-Do App?", "Agregar, editar, eliminar, marcar completada."],
      ["diseno", "¿Qué decisiones de diseño visual tomaste?", "Explica espaciado, alineación o color."],
      ["reto", "¿Qué reto técnico encontraste?", "Describe cómo lo resolviste."]
    ]
  },
  {
    id: "unidad-4-bitacora-digital",
    unitId: "unidad-4",
    number: "U4-A3",
    title: "Bitácora Digital de Investigación",
    duration: "2 sesiones",
    output: "App Flet para registro de observaciones",
    description: "Desarrolla una aplicación para registrar observaciones de trabajo de campo, validando datos y organizando información científica.",
    steps: [
      "Investiga qué es una bitácora de investigación.",
      "Relaciona la actividad con Cuatro Ciénegas.",
      "Programa campos, listas y botones en Flet.",
      "Valida datos con funciones.",
      "Incluye evidencias del programa funcionando."
    ],
    questions: [
      ["bitacora", "¿Qué es una bitácora de investigación?", "Explica para qué se usa."],
      ["campo", "¿Por qué es importante registrar observaciones de campo?", "Relaciona con evidencia científica."],
      ["flet", "¿Qué controles de Flet usaste?", "TextField, Dropdown, ElevatedButton, Container."],
      ["validacion", "¿Para qué sirve texto_valido() o una función similar?", "Describe el manejo de campos vacíos."]
    ]
  },
  {
    id: "unidad-4-firebase-auth",
    unitId: "unidad-4",
    number: "U4-A4",
    title: "Firebase, Firestore, Google Auth y reglas",
    duration: "2 sesiones",
    output: "App conectada a base de datos en la nube",
    description: "Integra autenticación con Google, Firestore y reglas de seguridad para guardar información de una app web.",
    steps: [
      "Configura proyecto Firebase.",
      "Habilita Google Auth.",
      "Crea colecciones en Firestore.",
      "Aplica reglas de seguridad.",
      "Prueba lectura y escritura desde la app."
    ],
    questions: [
      ["auth", "¿Qué problema resuelve Google Auth?", "Explica identidad del usuario."],
      ["firestore", "¿Qué guardaste en Firestore?", "Describe colección y campos."],
      ["reglas", "¿Por qué son importantes las reglas de seguridad?", "Da un ejemplo de permiso."],
      ["pruebas", "¿Cómo verificaste que la app guardara datos?", "Describe la prueba realizada."]
    ]
  },
  {
    id: "unidad-4-publicacion-web",
    unitId: "unidad-4",
    number: "U4-Proyecto",
    title: "Publicación web e integración de base de datos",
    duration: "2 a 3 sesiones",
    output: "Aplicación web publicada con base de datos",
    description: "Publica una aplicación web funcional que integre autenticación, base de datos y una experiencia documentada para usuarios.",
    steps: [
      "Revisa la funcionalidad completa.",
      "Prueba autenticación y envío de datos.",
      "Publica la app web.",
      "Documenta manual de usuario y manual técnico.",
      "Entrega liga final y evidencias."
    ],
    questions: [
      ["url", "Pega la liga de la aplicación publicada.", "Debe abrir correctamente."],
      ["flujo", "Describe el flujo completo del usuario.", "Login, uso, guardado y salida."],
      ["base", "¿Qué datos se guardan en la base?", "Incluye estructura general."],
      ["manuales", "¿Qué documentación entregaste?", "Manual de usuario, técnico o bitácora."]
    ]
  }
];

let currentUser = null;
let currentActivity = null;

const activityList = document.querySelector("#activity-list");
const unitTabs = document.querySelector("#unit-tabs");
const unitOverview = document.querySelector("#unit-overview");
const emptyState = document.querySelector("#empty-state");
const practiceForm = document.querySelector("#practice-form");
const questionFields = document.querySelector("#question-fields");
const loginButton = document.querySelector("#login-button");
const heroLoginButton = document.querySelector("#hero-login-button");
const logoutButton = document.querySelector("#logout-button");
const sessionTitle = document.querySelector("#session-title");
const sessionDetail = document.querySelector("#session-detail");
const heroSessionDetail = document.querySelector("#hero-session-detail");
const connectionStatus = document.querySelector("#connection-status");
const teacherLink = document.querySelector("#teacher-link");
const teacherPanel = document.querySelector("#panel-profesor");
const submissionFilter = document.querySelector("#submission-filter");
const submissionList = document.querySelector("#submission-list");
const integratedGuidePanel = document.querySelector("#integrated-guide-panel");
const integratedGuide = document.querySelector("#integrated-guide");
const guideToggle = document.querySelector("#guide-toggle");
const gradeTitle = document.querySelector("#grade-title");
const gradeDetail = document.querySelector("#grade-detail");
const gradeBreakdown = document.querySelector("#grade-breakdown");

function draftKey(activityId) {
  const userKey = currentUser?.uid || "anonimo";
  return `area1:draft:${userKey}:${activityId}`;
}

function setStatus(message) {
  connectionStatus.textContent = message;
}

function getPracticeIntro(activity) {
  const unit = getUnit(activity);
  return `Esta práctica pertenece a ${unit.label}: ${unit.title}. Primero revisa el propósito, después consulta los recursos de apoyo, realiza los pasos en orden y finalmente responde las preguntas con tus propias palabras. Si la práctica pide código, circuito, video o manual, prepara esa evidencia antes de enviar.`;
}

function getUnit(activity) {
  return units.find((unit) => unit.id === activity.unitId);
}

function getResources(activity) {
  const resources = [
    {
      title: "Guía de trabajo de Classroom",
      detail: "Consulta el documento o publicación correspondiente en la carpeta del curso antes de responder.",
      url: ""
    },
    {
      title: "Evidencia en portafolio",
      detail: "Cuando la práctica lo solicite, agrega capturas, video corto, repositorio de GitHub o liga a Google Sites.",
      url: ""
    }
  ];

  if (activity.id.includes("vida-submarina")) {
    resources.unshift({
      title: "Video de referencia: Vida Submarina Parte II",
      detail: "El material de Classroom menciona el video para agregar algas, puntos y sonido.",
      url: "https://youtu.be/AsOt-IV3Rec"
    });
  }

  if (activity.title.includes("Pygame")) {
    resources.unshift({
      title: "Código base publicado por el profesor",
      detail: "Usa el código de referencia de Classroom como guía; no lo entregues sin comprender y modificar.",
      url: ""
    });
  }

  if (activity.title.includes("Flet")) {
    resources.unshift({
      title: "Documentación de Flet",
      detail: "Revisa Page, Controls, Container, Row, Column, IconButton y eventos.",
      url: "https://flet.dev/docs/"
    });
  }

  if (activity.title.includes("Firebase")) {
    resources.unshift({
      title: "Consola de Firebase",
      detail: "Configura Authentication, Firestore Database y reglas de seguridad.",
      url: "https://console.firebase.google.com/"
    });
  }

  if (activity.title.includes("Arduino") || activity.title.includes("Fabuloso") || activity.title.includes("Robot") || activity.title.includes("Ventilador")) {
    resources.unshift({
      title: "Simulación previa en Tinkercad",
      detail: "Valida el circuito digital antes de armar el circuito físico.",
      url: "https://www.tinkercad.com/"
    });
  }

  return resources;
}

function getDeliverables(activity) {
  const deliverables = [
    "Respuestas completas y redactadas con tus propias palabras.",
    "Liga o descripción de evidencia en el campo final.",
    "Conclusión breve sobre lo aprendido y dificultades encontradas."
  ];

  if (activity.title.includes("Python") || activity.title.includes("Quiz") || activity.title.includes("Salud")) {
    deliverables.unshift("Archivo o repositorio con el código funcionando.");
    deliverables.unshift("Capturas de ejecución en terminal o ventana del programa.");
  }

  if (activity.title.includes("Pygame") || activity.title.includes("Vida") || activity.title.includes("Sierpinski")) {
    deliverables.unshift("Video corto o capturas mostrando la animación o juego en ejecución.");
  }

  if (activity.title.includes("Arduino") || activity.title.includes("Fabuloso") || activity.title.includes("Estacionamiento") || activity.title.includes("Robot") || activity.title.includes("Ventilador")) {
    deliverables.unshift("Captura de Tinkercad y fotos del circuito físico.");
    deliverables.unshift("Video corto del prototipo funcionando.");
  }

  if (activity.title.includes("Flet") || activity.title.includes("Bitácora")) {
    deliverables.unshift("Captura de la interfaz funcionando.");
    deliverables.unshift("Liga del repositorio de GitHub si se solicitó publicación.");
  }

  return [...new Set(deliverables)];
}

function getRubric(activity) {
  return [
    "Comprensión del propósito y conceptos principales.",
    "Evidencias claras, ordenadas y verificables.",
    "Funcionamiento correcto del programa, circuito o producto final.",
    "Reflexión personal con análisis de problemas y mejoras.",
    "Entrega completa en tiempo y asociada a tu cuenta de Gmail."
  ];
}

function renderResources(resources) {
  return resources.map((resource) => `
    <article class="resource-card">
      <strong>${resource.title}</strong>
      <span>${resource.detail}</span>
      ${resource.url ? `<a href="${resource.url}" target="_blank" rel="noopener">Abrir recurso</a>` : ""}
    </article>
  `).join("");
}

function getIntegratedGuide(activity) {
  return integratedGuides[activity.id] || null;
}

function renderIntegratedGuide(activity) {
  const guide = getIntegratedGuide(activity);
  if (!guide) {
    integratedGuidePanel.hidden = true;
    integratedGuide.hidden = true;
    guideToggle.setAttribute("aria-expanded", "false");
    guideToggle.textContent = "Ver guía de trabajo integrada";
    return;
  }

  integratedGuidePanel.hidden = false;
  integratedGuide.hidden = false;
  guideToggle.setAttribute("aria-expanded", "true");
  guideToggle.textContent = "Ocultar guía de trabajo integrada";
  integratedGuide.innerHTML = `
    <p class="guide-source">Fuente integrada: ${guide.source}</p>
    <div class="guide-text">${escapeHtml(guide.text)}</div>
  `;
}

function countWords(value) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function resetGrade() {
  gradeTitle.textContent = "Puntaje preliminar: sin calcular";
  gradeDetail.textContent = "El sitio revisa respuestas, evidencia, extensión y cumplimiento mínimo antes de enviar.";
  gradeBreakdown.innerHTML = "";
}

function calculateAutoGrade() {
  const payload = collectAnswers();
  const answers = Object.values(payload.answers);
  const totalQuestions = Math.max(answers.length, 1);
  const answered = answers.filter((answer) => countWords(answer) >= 8).length;
  const developed = answers.filter((answer) => countWords(answer) >= 25).length;
  const guide = getIntegratedGuide(currentActivity);
  const combinedText = answers.join(" ").toLowerCase();
  const keywords = [
    "algoritmo", "variable", "dato", "función", "funcion", "condición", "condicion",
    "ciclo", "simulación", "simulacion", "interfaz", "sensor", "firebase", "evidencia",
    "problema", "solución", "solucion", "prueba", "mejora"
  ];
  const keywordHits = keywords.filter((keyword) => combinedText.includes(keyword)).length;
  const hasEvidence = /^https?:\/\/\S+/i.test(payload.evidenceUrl);

  const checks = [
    {
      label: "Respuestas completas",
      earned: Math.round((answered / totalQuestions) * 30),
      max: 30,
      detail: `${answered} de ${totalQuestions} respuestas tienen desarrollo mínimo.`
    },
    {
      label: "Profundidad de análisis",
      earned: Math.round((developed / totalQuestions) * 25),
      max: 25,
      detail: `${developed} de ${totalQuestions} respuestas superan 25 palabras.`
    },
    {
      label: "Evidencia verificable",
      earned: hasEvidence ? 20 : 0,
      max: 20,
      detail: hasEvidence ? "Incluye una liga válida para revisar evidencia." : "Falta una liga http o https de evidencia."
    },
    {
      label: "Uso de conceptos técnicos",
      earned: Math.min(15, keywordHits * 3),
      max: 15,
      detail: `${keywordHits} conceptos clave detectados en las respuestas.`
    },
    {
      label: "Trabajo con guía integrada",
      earned: guide ? 10 : 5,
      max: 10,
      detail: guide ? "Esta práctica tiene guía completa integrada en la página." : "Esta práctica aún no tiene guía textual importada."
    }
  ];

  const score = Math.min(100, checks.reduce((sum, item) => sum + item.earned, 0));
  return {
    score,
    passed: score >= 70,
    status: score >= 70 ? "cumple_minimo" : "requiere_mejora",
    checks,
    calculatedAt: new Date().toISOString()
  };
}

function renderAutoGrade(result) {
  gradeTitle.textContent = `Puntaje preliminar: ${result.score}/100`;
  gradeDetail.textContent = result.passed
    ? "La entrega cumple el mínimo automático. El profesor puede revisar y ajustar la calificación final."
    : "La entrega necesita más desarrollo antes de enviarse como trabajo completo.";
  gradeBreakdown.innerHTML = result.checks.map((item) => `
    <li>
      <strong>${item.label}: ${item.earned}/${item.max}</strong>
      <span>${item.detail}</span>
    </li>
  `).join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function speak(text) {
  if (!("speechSynthesis" in window)) {
    document.querySelector("#form-message").textContent = "Este navegador no tiene lectura en voz alta disponible.";
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-MX";
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

function renderActivities() {
  document.querySelector("#activity-count").textContent = activities.length;
  document.querySelector("#guide-count").textContent = Object.keys(integratedGuides).length;

  unitTabs.innerHTML = units.map((unit) => `
    <button class="unit-tab" type="button" data-target="${unit.id}">
      ${unit.label}
    </button>
  `).join("");

  renderActivityList();
  renderUnitOverview();

  submissionFilter.innerHTML = `<option value="all">Todas las prácticas</option>${activities.map((activity) => `
    <option value="${activity.id}">${activity.number}: ${activity.title}</option>
  `).join("")}`;
}

function renderUnitOverview() {
  unitOverview.innerHTML = units.map((unit) => {
    const unitActivities = activities.filter((activity) => activity.unitId === unit.id);
    const preview = unitActivities.slice(0, 3).map((activity) => `<li>${activity.title}</li>`).join("");
    return `
      <button class="unit-overview-card" type="button" data-unit="${unit.id}">
        <strong>${unit.label}</strong>
        <h3>${unit.title}</h3>
        <span>${unitActivities.length} prácticas y actividades</span>
        <ul>${preview}</ul>
      </button>
    `;
  }).join("");
}

function renderActivityList() {
  activityList.innerHTML = units.map((unit) => {
    const unitActivities = activities.filter((activity) => activity.unitId === unit.id);
    return `
      <section class="unit-group" id="${unit.id}">
        <div class="unit-heading">
          <strong>${unit.label}</strong>
          <span>${unit.title}</span>
        </div>
        ${unitActivities.map((activity) => `
          <button class="activity-card" type="button" data-activity="${activity.id}">
            <strong>${activity.number}: ${activity.title}</strong>
            <span>${activity.output}</span>
          </button>
        `).join("")}
      </section>
    `;
  }).join("");
}

function selectActivity(activityId, shouldScroll = true) {
  currentActivity = activities.find((activity) => activity.id === activityId);
  if (!currentActivity) {
    return;
  }

  document.querySelectorAll(".activity-card").forEach((card) => {
    card.classList.toggle("active", card.dataset.activity === activityId);
  });

  emptyState.hidden = true;
  practiceForm.hidden = false;
  document.querySelector("#practice-kicker").textContent = currentActivity.number;
  document.querySelector("#practice-title").textContent = currentActivity.title;
  document.querySelector("#practice-description").textContent = currentActivity.description;
  document.querySelector("#practice-unit").textContent = `${getUnit(currentActivity).label}: ${getUnit(currentActivity).title}`;
  document.querySelector("#practice-duration").textContent = currentActivity.duration;
  document.querySelector("#practice-output").textContent = currentActivity.output;
  document.querySelector("#practice-status").textContent = "Borrador";
  document.querySelector("#practice-intro").textContent = getPracticeIntro(currentActivity);
  document.querySelector("#resource-list").innerHTML = renderResources(getResources(currentActivity));
  renderIntegratedGuide(currentActivity);
  resetGrade();
  document.querySelector("#practice-steps").innerHTML = currentActivity.steps.map((step) => `<li>${step}</li>`).join("");
  document.querySelector("#deliverable-list").innerHTML = getDeliverables(currentActivity).map((item) => `<li>${item}</li>`).join("");
  document.querySelector("#rubric-list").innerHTML = getRubric(currentActivity).map((item) => `<li>${item}</li>`).join("");

  questionFields.innerHTML = currentActivity.questions.map(([id, label, help]) => `
    <article class="question-card">
      <label for="${id}">${label}</label>
      <p>${help}</p>
      <textarea id="${id}" name="${id}" required></textarea>
    </article>
  `).join("");

  document.querySelector("#evidence-url").value = "";
  loadDraft();
  if (shouldScroll) {
    document.querySelector("#practicas").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function collectAnswers() {
  const answers = {};
  currentActivity.questions.forEach(([id]) => {
    answers[id] = practiceForm.elements[id].value.trim();
  });
  return {
    answers,
    evidenceUrl: practiceForm.elements.evidenceUrl.value.trim()
  };
}

function loadDraft() {
  const raw = localStorage.getItem(draftKey(currentActivity.id));
  if (!raw) {
    return;
  }
  const draft = JSON.parse(raw);
  Object.entries(draft.answers || {}).forEach(([key, value]) => {
    if (practiceForm.elements[key]) {
      practiceForm.elements[key].value = value;
    }
  });
  practiceForm.elements.evidenceUrl.value = draft.evidenceUrl || "";
  document.querySelector("#practice-status").textContent = "Borrador local";
}

function saveDraft() {
  if (!currentActivity) {
    return;
  }
  localStorage.setItem(draftKey(currentActivity.id), JSON.stringify(collectAnswers()));
  document.querySelector("#practice-status").textContent = "Borrador local";
  document.querySelector("#form-message").textContent = "Borrador guardado en este navegador.";
}

function validateSession() {
  if (!currentUser) {
    document.querySelector("#form-message").textContent = "Inicia sesión con Gmail antes de enviar.";
    return false;
  }
  return true;
}

async function submitPractice(event) {
  event.preventDefault();
  if (!currentActivity || !validateSession()) {
    return;
  }

  setStatus("Enviando...");
  const payload = collectAnswers();
  const autoGrade = calculateAutoGrade();
  renderAutoGrade(autoGrade);
  const submissionId = `${currentUser.uid}_${currentActivity.id}`;
  await setDoc(doc(db, "submissions", submissionId), {
    activityId: currentActivity.id,
    unitId: currentActivity.unitId,
    unitTitle: getUnit(currentActivity).title,
    activityNumber: currentActivity.number,
    activityTitle: currentActivity.title,
    studentUid: currentUser.uid,
    studentName: currentUser.displayName || "",
    studentEmail: currentUser.email,
    answers: payload.answers,
    evidenceUrl: payload.evidenceUrl,
    autoGrade,
    autoScore: autoGrade.score,
    autoPassed: autoGrade.passed,
    autoStatus: autoGrade.status,
    status: autoGrade.passed ? "submitted" : "submitted_needs_revision",
    submittedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });

  localStorage.removeItem(draftKey(currentActivity.id));
  document.querySelector("#practice-status").textContent = "Enviada";
  document.querySelector("#form-message").textContent = "Práctica enviada correctamente a Firebase.";
  setStatus("Enviado");
}

async function loadSubmissions() {
  if (!currentUser || currentUser.email !== teacherEmail) {
    return;
  }

  setStatus("Cargando entregas...");
  const selected = submissionFilter.value;
  const base = collection(db, "submissions");
  const q = selected === "all"
    ? query(base, orderBy("submittedAt", "desc"))
    : query(base, where("activityId", "==", selected), orderBy("submittedAt", "desc"));

  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    submissionList.innerHTML = `<article class="submission-card"><p>No hay entregas para este filtro.</p></article>`;
    setStatus("Sin entregas");
    return;
  }

  submissionList.innerHTML = snapshot.docs.map((item) => {
    const data = item.data();
    const answers = Object.entries(data.answers || {}).map(([key, value]) => `
      <dt>${key}</dt>
      <dd>${value || "Sin respuesta"}</dd>
    `).join("");
    const date = data.submittedAt?.toDate ? data.submittedAt.toDate().toLocaleString("es-MX") : "Fecha pendiente";
    return `
      <article class="submission-card">
        <header>
          <div>
            <strong>${data.studentName || "Alumno sin nombre"}</strong>
            <p>${data.studentEmail || ""}</p>
          </div>
          <span class="status-pill">${date}</span>
        </header>
        <p><strong>${data.activityNumber}: ${data.activityTitle}</strong></p>
        <p><strong>Autocalificación:</strong> ${data.autoScore ?? "Sin puntaje"}/100 ${data.autoPassed === false ? "(requiere mejora)" : ""}</p>
        ${data.evidenceUrl ? `<p><a href="${data.evidenceUrl}" target="_blank" rel="noopener">Abrir evidencia</a></p>` : ""}
        <dl>${answers}</dl>
      </article>
    `;
  }).join("");
  setStatus("Entregas cargadas");
}

activityList.addEventListener("click", (event) => {
  const card = event.target.closest(".activity-card");
  if (card) {
    selectActivity(card.dataset.activity);
  }
});

unitTabs.addEventListener("click", (event) => {
  const tab = event.target.closest(".unit-tab");
  if (!tab) {
    return;
  }
  document.querySelector(`#${tab.dataset.target}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
});

unitOverview.addEventListener("click", (event) => {
  const card = event.target.closest(".unit-overview-card");
  if (!card) {
    return;
  }
  const firstActivity = activities.find((activity) => activity.unitId === card.dataset.unit);
  if (firstActivity) {
    selectActivity(firstActivity.id);
  }
});

loginButton.addEventListener("click", async () => {
  setStatus("Abriendo Google...");
  await signInWithPopup(auth, provider);
});

heroLoginButton.addEventListener("click", async () => {
  setStatus("Abriendo Google...");
  await signInWithPopup(auth, provider);
});

logoutButton.addEventListener("click", async () => {
  await signOut(auth);
});

practiceForm.addEventListener("submit", submitPractice);
document.querySelector("#save-draft").addEventListener("click", saveDraft);
document.querySelector("#calculate-grade").addEventListener("click", () => {
  if (!currentActivity) {
    return;
  }
  renderAutoGrade(calculateAutoGrade());
});
document.querySelector("#clear-draft").addEventListener("click", () => {
  if (!currentActivity || !confirm("¿Limpiar las respuestas de esta práctica?")) {
    return;
  }
  localStorage.removeItem(draftKey(currentActivity.id));
  selectActivity(currentActivity.id);
});
document.querySelector("#refresh-submissions").addEventListener("click", loadSubmissions);
submissionFilter.addEventListener("change", loadSubmissions);
document.querySelector("#read-overview").addEventListener("click", () => {
  if (!currentActivity) {
    return;
  }
  const text = [
    currentActivity.title,
    currentActivity.description,
    getPracticeIntro(currentActivity),
    "Instrucciones.",
    ...currentActivity.steps,
    "Entregables.",
    ...getDeliverables(currentActivity)
  ].join(". ");
  speak(text);
});
document.querySelector("#read-integrated-guide").addEventListener("click", () => {
  if (!currentActivity) {
    return;
  }
  const guide = getIntegratedGuide(currentActivity);
  if (!guide) {
    document.querySelector("#form-message").textContent = "Esta práctica aún no tiene guía integrada en texto.";
    return;
  }
  speak(`${currentActivity.title}. Guía de trabajo integrada. ${guide.text}`);
});
document.querySelector("#read-questions").addEventListener("click", () => {
  if (!currentActivity) {
    return;
  }
  speak(currentActivity.questions.map(([, label, help]) => `${label}. ${help}`).join(". "));
});
document.querySelector("#stop-reading").addEventListener("click", () => {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
});
guideToggle.addEventListener("click", () => {
  const expanded = guideToggle.getAttribute("aria-expanded") === "true";
  guideToggle.setAttribute("aria-expanded", String(!expanded));
  integratedGuide.hidden = expanded;
  guideToggle.textContent = expanded ? "Ver guía de trabajo integrada" : "Ocultar guía de trabajo integrada";
});

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  const isTeacher = user?.email === teacherEmail;
  loginButton.hidden = Boolean(user);
  heroLoginButton.hidden = Boolean(user);
  logoutButton.hidden = !user;
  teacherLink.hidden = !isTeacher;
  teacherPanel.hidden = !isTeacher;

  if (user) {
    sessionTitle.textContent = user.displayName || user.email;
    sessionDetail.textContent = user.email;
    heroSessionDetail.textContent = `Sesión activa: ${user.email}`;
    setStatus("Conectado");
    if (currentActivity) {
      loadDraft();
    }
    if (isTeacher) {
      loadSubmissions();
    }
    return;
  }

  sessionTitle.textContent = "Sesión no iniciada";
  sessionDetail.textContent = "Inicia sesión con Gmail para enviar prácticas a Firebase.";
  heroSessionDetail.textContent = "Usa tu cuenta de Gmail. Tus entregas quedarán asociadas a tu correo.";
  setStatus("Listo");
});

renderActivities();
selectActivity(activities[0].id, false);
