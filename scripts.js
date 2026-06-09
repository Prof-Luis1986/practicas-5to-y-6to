function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function highlightArduinoCode(source) {
  const escaped = escapeHtml(source);
  const tokenPattern =
    /(\/\/.*$|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(^\s*#\s*\w+)|(&lt;[^&\n]+&gt;)|\b(const|int|long|void|unsigned|float|double|char|bool|byte)\b|\b(if|else|return)\b|\b(HIGH|LOW|INPUT|OUTPUT|true|false|Serial)\b|\b([A-Z_]{2,})\b|\b(\d+)\b|\b([A-Za-z_]\w*)(?=\s*\()/gm;

  return escaped.replace(
    tokenPattern,
    (
      match,
      comment,
      string,
      preproc,
      includePath,
      typeWord,
      keywordWord,
      knownConst,
      upperConst,
      numberWord,
      functionWord
    ) => {
      if (comment) return `<span class="token-comment">${match}</span>`;
      if (string) return `<span class="token-string">${match}</span>`;
      if (preproc) return `<span class="token-preproc">${match}</span>`;
      if (includePath) return `<span class="token-include">${match}</span>`;
      if (typeWord) return `<span class="token-type">${match}</span>`;
      if (keywordWord) return `<span class="token-keyword">${match}</span>`;
      if (knownConst || upperConst) return `<span class="token-const">${match}</span>`;
      if (numberWord) return `<span class="token-number">${match}</span>`;
      if (functionWord) return `<span class="token-function">${match}</span>`;
      return match;
    }
  );
}

function setupCodeHighlighting() {
  document.querySelectorAll("pre code").forEach((block) => {
    const raw = block.textContent || "";
    block.innerHTML = highlightArduinoCode(raw);
  });
}

function setupCopyableCodeBlocks() {
  if (document.body.dataset.allowCodeCopy !== "true") return;

  document.querySelectorAll("pre").forEach((pre) => {
    const code = pre.querySelector("code");
    if (!code || pre.parentElement?.classList.contains("code-block")) return;

    const wrapper = document.createElement("div");
    wrapper.className = "code-block";

    const toolbar = document.createElement("div");
    toolbar.className = "code-block__toolbar";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "copy-code-button";
    button.textContent = "Copiar código";

    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(code.textContent || "");
        button.textContent = "Copiado";
        button.classList.add("is-copied");

        window.setTimeout(() => {
          button.textContent = "Copiar código";
          button.classList.remove("is-copied");
        }, 1800);
      } catch (error) {
        console.error("No se pudo copiar el codigo:", error);
        button.textContent = "No se pudo copiar";

        window.setTimeout(() => {
          button.textContent = "Copiar código";
        }, 1800);
      }
    });

    toolbar.appendChild(button);
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(toolbar);
    wrapper.appendChild(pre);
  });
}

function setupProjectSubmissionFields() {
  const worksheetKey = document.body.dataset.worksheetKey;
  const isSpecialProject = document.body.dataset.projectSubmission === "true";

  if (!worksheetKey) return;
  if (document.body.dataset.disableProjectLinks === "true" && !isSpecialProject) return;

  const worksheetMeta = document.querySelector(".worksheet-meta");
  if (!worksheetMeta || document.getElementById("project-link")) return;

  const targetCard = worksheetMeta.closest(".card");
  if (!targetCard) return;

  const fieldsBlock = document.createElement("div");
  fieldsBlock.className = "submission-links";
  fieldsBlock.innerHTML = `
    <h3>Enlaces para entregar el proyecto</h3>
    <p class="worksheet-note submission-links__note">No subas archivos directamente al sitio. Pega el enlace de Tinkercad o un enlace de Drive con acceso para cualquier persona que tenga el enlace. Debes agregar por lo menos uno.</p>
    <div class="worksheet-field">
      <label for="project-link">Enlace del proyecto en Tinkercad (si aplica)</label>
      <input class="worksheet-input" id="project-link" name="project_link" type="url" inputmode="url" placeholder="https://www.tinkercad.com/..." />
    </div>
    <div class="worksheet-field">
      <label for="evidence-link">Enlace de Drive con video, fotografías o documentos (si aplica)</label>
      <input class="worksheet-input" id="evidence-link" name="evidence_link" type="url" inputmode="url" placeholder="https://drive.google.com/..." />
    </div>
    <div class="worksheet-field">
      <label for="project-notes">Descripción de lo que contienen los enlaces</label>
      <textarea class="worksheet-textarea" id="project-notes" name="project_notes" placeholder="Explica qué incluye cada enlace y qué debe revisar el profesor."></textarea>
    </div>
  `;

  const note = targetCard.querySelector(".worksheet-note");
  if (note) {
    note.insertAdjacentElement("beforebegin", fieldsBlock);
    return;
  }

  const buttonRow = targetCard.querySelector(".button-row");
  if (buttonRow) {
    buttonRow.insertAdjacentElement("beforebegin", fieldsBlock);
    return;
  }

  targetCard.appendChild(fieldsBlock);
}

const SPECIAL_PROJECT_QUESTIONS = {
  "proyecto-especial-contenedor": [
    [
      "¿Qué señales de color y sonido observaste en situaciones reales de seguridad y cuáles funcionarían mejor para que un jugador comprenda cada estado sin recibir una explicación?",
      "¿Cómo evitarías que dos estados del contenedor se perciban iguales? Justifica tus decisiones de color, movimiento y sonido."
    ],
    [
      "¿Por qué elegiste esos límites de distancia y qué podría ocurrir si dos rangos se traslaparan o quedara un espacio sin estado?",
      "¿En qué lugar del escape room colocarías el contenedor para que los cuatro rangos puedan experimentarse de forma clara y segura?"
    ],
    [
      "¿Cómo influye la ubicación del sensor en la precisión de las lecturas y qué objetos cercanos podrían provocar mediciones incorrectas?",
      "¿Qué cambiarías en tu boceto si el aro, el buzzer o los cables no cupieran dentro del contenedor?"
    ],
    [
      "¿Qué diferencia encontraste entre la distancia medida con regla y la mostrada por el sensor, y a qué atribuyes esa diferencia?",
      "Si un componente no respondiera en la prueba individual, ¿qué revisarías primero y por qué seguirías ese orden?"
    ],
    [
      "¿Qué efecto de luz y sonido comunica mejor cada estado y qué evidencia de tus pruebas respalda tu elección?",
      "¿Cómo modificarías un efecto que se ve bien por separado, pero resulta confuso al compararlo con los otros estados?"
    ],
    [
      "¿En qué distancias cambió realmente cada estado y cómo se comparan esos resultados con los rangos planeados?",
      "¿Qué ajuste harías si el contenedor cambiara rápidamente entre dos estados cuando un objeto está justo en el límite?"
    ],
    [
      "¿Cuál fue la mejora que produjo el cambio más importante en claridad o estabilidad y cómo lo comprobaste?",
      "¿Cómo demostrarías a otro equipo que el contenedor está listo para funcionar varias veces dentro del escape room?"
    ]
  ],
  "proyecto-especial-cabeza-dinosaurio": [
    [
      "¿Qué características hacen que un parpadeo parezca natural y cuáles harían que pareciera robótico?",
      "¿Cómo usarías tus observaciones para explicar por qué los intervalos entre parpadeos no deben ser siempre iguales?"
    ],
    [
      "¿Qué diferencias debe percibir un jugador entre el parpadeo natural y el modo de alerta?",
      "¿Cómo representarías en tu línea de tiempo un movimiento que comienza normal y después comunica peligro?"
    ],
    [
      "¿Por qué los servos izquierdo y derecho pueden necesitar sentidos o ángulos distintos aunque los ojos hagan la misma acción?",
      "¿Qué parte del mecanismo modificarías si un párpado chocara con la cabeza antes de cerrar por completo?"
    ],
    [
      "¿Cómo determinaste los ángulos seguros de cada ojo y qué evidencia muestra que no están forzando el mecanismo?",
      "¿Qué riesgo existe al copiar exactamente los ángulos de otra maqueta sin calibrarlos en la tuya?"
    ],
    [
      "¿Qué combinación de tiempo de cierre e intervalo produjo el parpadeo más natural y cómo lo decidiste?",
      "¿Cómo cambiaría la expresión de la cabeza si los dos ojos cerraran con una diferencia de tiempo?"
    ],
    [
      "¿Qué elementos del modo de alerta permiten distinguirlo del parpadeo normal sin agregar nuevos componentes?",
      "¿En qué momento de una misión de escape room tendría sentido activar el modo de alerta y qué mensaje comunicaría?"
    ],
    [
      "¿Qué ajuste mejoró más la coordinación de los ojos y cómo comparaste el funcionamiento antes y después?",
      "¿Qué prueba repetida usarías para asegurar que el mecanismo no se atore durante una presentación completa?"
    ]
  ],
  "proyecto-especial-brazo-dinosaurio": [
    [
      "¿Qué hace que una reacción mecánica produzca sorpresa sin poner en riesgo al participante ni dañar el proyecto?",
      "¿Qué regla de seguridad consideras indispensable para este brazo y cómo afecta el diseño físico?"
    ],
    [
      "¿Por qué el rango para volver a preparar el brazo debe ser diferente del rango que lo activa?",
      "¿Qué comportamiento tendría el brazo si una persona permaneciera frente al sensor y cómo evita tu plan activaciones continuas?"
    ],
    [
      "¿Cómo influyen el peso y la longitud del brazo en el esfuerzo que debe realizar el servomotor?",
      "¿Qué cambiarías en la estructura si el servo puede moverse solo, pero no logra mover el brazo construido?"
    ],
    [
      "¿Qué aprendiste al probar por separado el sensor, el servo, el LED y el buzzer que habría sido difícil descubrir con todo conectado?",
      "Si la distancia es correcta pero el brazo no se mueve, ¿qué componentes y conexiones revisarías antes de modificar el código?"
    ],
    [
      "¿Cómo afectan los ángulos, la velocidad y la pausa a la impresión de ataque o advertencia?",
      "¿Qué evidencia usarías para decidir que el movimiento es visible y dramático, pero sigue siendo seguro?"
    ],
    [
      "¿Qué ocurrió en las pruebas cuando el objeto entró, permaneció y salió de la zona de activación?",
      "¿Cómo explicarías la función de la variable que impide que el brazo se active repetidamente?"
    ],
    [
      "¿Qué mejora aumentó más la seguridad o la consistencia del proyecto y cómo mediste su efecto?",
      "¿Dónde colocarías el brazo dentro del escape room para conservar la sorpresa y mantener fuera de alcance la parte móvil?"
    ]
  ],
  "proyecto-especial-huevo-dinosaurio": [
    [
      "¿Qué orden y qué intensidad de movimientos ayudan a contar que algo intenta salir del huevo?",
      "¿Cómo cambiaría la historia que comunica el proyecto si la apertura fuerte ocurriera antes de los empujes pequeños?"
    ],
    [
      "¿Cómo decidiste los ángulos y pausas de tu secuencia y qué emoción buscas producir en el jugador?",
      "¿Qué movimiento eliminarías o modificarías si la secuencia fuera demasiado larga o repetitiva?"
    ],
    [
      "¿Dónde conviene colocar el punto de apoyo para que el servo pueda levantar la tapa con el menor esfuerzo posible?",
      "¿Qué cambiarías en el mecanismo si la tapa abre, pero no vuelve correctamente a la posición cerrada?"
    ],
    [
      "¿Qué diferencias observaste entre un ángulo insuficiente, uno seguro y uno excesivo?",
      "¿Por qué es importante hacer estas pruebas con una pieza ligera antes de instalar la tapa final?"
    ],
    [
      "¿Qué combinación de ángulos y pausas hizo que los empujes parecieran menos repetitivos y más reales?",
      "¿Cómo comprobarías si una vibración proviene del programa, de la fijación del servo o del peso de la tapa?"
    ],
    [
      "¿La secuencia completa comunica con claridad empujes, apertura y cierre? Explica qué evidencia observaste.",
      "¿Qué parte del código cambiarías para aumentar el dramatismo sin modificar el producto final?"
    ],
    [
      "¿Qué problema apareció al repetir varios ciclos y qué mejora evitó que volviera a ocurrir?",
      "¿Cómo prepararías el huevo para que pueda presentarse varias veces en el escape room sin reajustar el mecanismo?"
    ]
  ],
  "proyecto-especial-radar": [
    [
      "¿Por qué conocer solo la distancia no permite ubicar completamente un objeto durante el barrido?",
      "¿Cómo explicarías con tu dibujo la diferencia entre cambiar el ángulo del sensor y acercar un objeto?"
    ],
    [
      "¿Qué información debe revisar el programa después de cada movimiento para decidir si existe una detección o una alerta?",
      "¿Cómo cambiaría la experiencia del escape room si el radar solo avisara que hay un objeto, pero no mostrara el ángulo?"
    ],
    [
      "¿Cómo puede el diseño de la base o la posición de los cables reducir el área que el radar logra explorar?",
      "¿Qué modificación harías si el sensor completa el barrido sin obstáculos, pero los LEDs no son visibles para los jugadores?"
    ],
    [
      "¿Qué diferencias encontraste entre las distancias reales y las medidas y cómo afectan la elección de los límites de alerta?",
      "¿Por qué conviene comprobar el sensor fijo y el servo por separado antes de montar el radar completo?"
    ],
    [
      "¿Qué patrón observas al comparar los pares de ángulo y distancia del monitor serial durante un barrido?",
      "¿Por qué el programa espera después de mover el servo antes de medir y qué sucedería si eliminara esa espera?"
    ],
    [
      "¿Cómo comprobaste que detección y alerta producen respuestas diferentes y comprensibles?",
      "¿Qué ajuste realizarías si un objeto colocado en el límite hace que las señales cambien de forma inestable?"
    ],
    [
      "¿En qué ángulos o distancias fue menos precisa la detección y qué causa posible identificaste?",
      "¿Cómo demostrarías que el radar puede funcionar de manera continua como pista o sistema de seguridad del escape room?"
    ]
  ]
};

const SPECIAL_PROJECT_CODE_STEPS = {
  "proyecto-especial-contenedor": [
    {
      title: "Nombrar los estados antes de controlar componentes",
      instruction: "Comprueba en el monitor serial que el programa puede comunicar un estado con un nombre claro. En la siguiente prueba conservarás la función mostrarEstado.",
      code: `void mostrarEstado(const char* estado) {
  Serial.print("Estado: ");
  Serial.println(estado);
}

void setup() {
  Serial.begin(9600);
  mostrarEstado("REPOSO");
  mostrarEstado("ACTIVIDAD");
  mostrarEstado("ALERTA");
  mostrarEstado("PELIGRO");
}

void loop() {
}`,
      expected: "El monitor serial muestra los cuatro estados, uno por línea."
    },
    {
      title: "Clasificar una distancia sin usar todavía el sensor",
      instruction: "Prueba la lógica de rangos con un valor escrito a mano. Cambia distanciaPrueba por 60, 40, 20 y 8 antes de conectar componentes.",
      code: `void mostrarEstado(int distancia) {
  if (distancia > 50) {
    Serial.println("REPOSO");
  } else if (distancia > 25) {
    Serial.println("ACTIVIDAD");
  } else if (distancia > 10) {
    Serial.println("ALERTA");
  } else {
    Serial.println("PELIGRO");
  }
}

void setup() {
  Serial.begin(9600);
  int distanciaPrueba = 40;
  mostrarEstado(distanciaPrueba);
}

void loop() {
}`,
      expected: "Cada valor de prueba produce exactamente el estado previsto en la tabla de rangos."
    },
    {
      title: "Leer el sensor en una función independiente",
      instruction: "Aísla la medición en medirDistancia. No agregues todavía luces ni sonido: primero confirma que el dato de entrada es confiable.",
      code: `const int TRIG = 9;
const int ECHO = 10;

int medirDistancia() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);

  long duracion = pulseIn(ECHO, HIGH, 30000);
  if (duracion == 0) return 999;
  return duracion / 58;
}

void setup() {
  Serial.begin(9600);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
}

void loop() {
  Serial.println(medirDistancia());
  delay(300);
}`,
      expected: "Las lecturas cambian al mover un objeto y son parecidas a las medidas con una regla."
    },
    {
      title: "Probar luz y sonido con funciones pequeñas",
      instruction: "Comprueba por separado una función de color y una de sonido. Una función debe realizar una sola tarea.",
      code: `#include <Adafruit_NeoPixel.h>

const int PIN_ARO = 6;
const int BUZZER = 5;
Adafruit_NeoPixel aro(12, PIN_ARO, NEO_GRB + NEO_KHZ800);

void colorFijo(int rojo, int verde, int azul) {
  for (int i = 0; i < 12; i++) {
    aro.setPixelColor(i, aro.Color(rojo, verde, azul));
  }
  aro.show();
}

void sonidoPrueba() {
  tone(BUZZER, 600, 200);
}

void setup() {
  aro.begin();
  pinMode(BUZZER, OUTPUT);
  colorFijo(0, 120, 40);
  sonidoPrueba();
}

void loop() {
}`,
      expected: "El aro muestra un color fijo y el buzzer produce un tono corto."
    },
    {
      title: "Separar cada comportamiento en una función",
      instruction: "Construye estados reutilizables. loop solo decide qué función probar; no debe contener todos los detalles de luces y sonidos.",
      code: `void estadoReposo() {
  Serial.println("REPOSO: azul y sonido suave");
}

void estadoActividad() {
  Serial.println("ACTIVIDAD: verde pulsante");
}

void estadoAlerta() {
  Serial.println("ALERTA: naranja en movimiento");
}

void estadoPeligro() {
  Serial.println("PELIGRO: rojo y alarma");
}

void setup() {
  Serial.begin(9600);
}

void loop() {
  estadoReposo();
  delay(1000);
  estadoActividad();
  delay(1000);
  estadoAlerta();
  delay(1000);
  estadoPeligro();
  delay(2000);
}`,
      expected: "Los cuatro estados se ejecutan en orden y cada comportamiento tiene su propia función."
    },
    {
      title: "Integrar medición, decisión y respuesta",
      instruction: "Organiza loop en tres pasos visibles: medir, mostrar y decidir. Sustituye después los mensajes por las funciones de efectos ya probadas.",
      code: `int distancia = 20;

void ejecutarEstado(int valor) {
  if (valor > 50) {
    Serial.println("estadoReposo()");
  } else if (valor > 25) {
    Serial.println("estadoActividad()");
  } else if (valor > 10) {
    Serial.println("estadoAlerta()");
  } else {
    Serial.println("estadoPeligro()");
  }
}

void setup() {
  Serial.begin(9600);
}

void loop() {
  Serial.print("Distancia: ");
  Serial.println(distancia);
  ejecutarEstado(distancia);
  delay(500);
}`,
      expected: "Una sola lectura produce una sola respuesta y loop permanece corto y comprensible."
    },
    {
      title: "Reducir lecturas inestables con un promedio",
      instruction: "Agrega una función de mejora sin mezclarla con los efectos. Reemplaza lecturaSimulada por medirDistancia al integrarla al proyecto.",
      code: `int lecturaSimulada() {
  return random(18, 23);
}

int distanciaPromedio() {
  long suma = 0;
  const int MUESTRAS = 5;

  for (int i = 0; i < MUESTRAS; i++) {
    suma += lecturaSimulada();
    delay(20);
  }
  return suma / MUESTRAS;
}

void setup() {
  Serial.begin(9600);
  randomSeed(analogRead(A0));
}

void loop() {
  Serial.println(distanciaPromedio());
  delay(300);
}`,
      expected: "El valor promedio cambia menos que las lecturas individuales y la mejora queda aislada en una función."
    }
  ],
  "proyecto-especial-cabeza-dinosaurio": [
    {
      title: "Representar la secuencia antes de mover servos",
      instruction: "Usa mensajes para verificar el orden abrir, esperar, cerrar y abrir. Primero valida la historia del movimiento.",
      code: `void abrirOjos() {
  Serial.println("OJOS ABIERTOS");
}

void cerrarOjos() {
  Serial.println("OJOS CERRADOS");
}

void setup() {
  Serial.begin(9600);
}

void loop() {
  abrirOjos();
  delay(1000);
  cerrarOjos();
  delay(180);
}`,
      expected: "El monitor muestra una secuencia clara de apertura y cierre."
    },
    {
      title: "Guardar posiciones y tiempos con nombres",
      instruction: "Evita números sin explicación. Modifica solo las constantes para comparar diferentes ritmos.",
      code: `const int TIEMPO_CERRADO = 180;
const int PAUSA_NORMAL = 3000;
const int PAUSA_ALERTA = 300;

void mostrarPlan() {
  Serial.print("Cierre: ");
  Serial.println(TIEMPO_CERRADO);
  Serial.print("Pausa normal: ");
  Serial.println(PAUSA_NORMAL);
  Serial.print("Pausa alerta: ");
  Serial.println(PAUSA_ALERTA);
}

void setup() {
  Serial.begin(9600);
  mostrarPlan();
}

void loop() {
}`,
      expected: "Los valores importantes tienen nombres y pueden ajustarse en un solo lugar."
    },
    {
      title: "Mover un ojo antes de coordinar los dos",
      instruction: "Comprueba un solo servo. No montes ambos hasta encontrar posiciones seguras de apertura y cierre.",
      code: `#include <Servo.h>

Servo ojoIzq;
const int ABIERTO = 30;
const int CERRADO = 95;

void setup() {
  ojoIzq.attach(9);
}

void loop() {
  ojoIzq.write(ABIERTO);
  delay(1500);
  ojoIzq.write(CERRADO);
  delay(500);
}`,
      expected: "Un ojo abre y cierra sin golpear ni forzar el mecanismo."
    },
    {
      title: "Calibrar dos ojos con constantes independientes",
      instruction: "Cada servo conserva sus propios ángulos. Así una corrección no obliga a cambiar toda la secuencia.",
      code: `#include <Servo.h>

Servo ojoIzq;
Servo ojoDer;
const int IZQ_ABIERTO = 30;
const int IZQ_CERRADO = 95;
const int DER_ABIERTO = 150;
const int DER_CERRADO = 85;

void setup() {
  ojoIzq.attach(9);
  ojoDer.attach(10);
}

void loop() {
  ojoIzq.write(IZQ_ABIERTO);
  ojoDer.write(DER_ABIERTO);
  delay(1000);
  ojoIzq.write(IZQ_CERRADO);
  ojoDer.write(DER_CERRADO);
  delay(500);
}`,
      expected: "Los dos ojos alcanzan posiciones seguras aunque usen ángulos diferentes."
    },
    {
      title: "Crear funciones reutilizables de parpadeo",
      instruction: "Separa abrirOjos, cerrarOjos y parpadeoNatural. loop solo solicita el comportamiento.",
      code: `#include <Servo.h>

Servo izquierdo;
Servo derecho;

void abrirOjos() {
  izquierdo.write(30);
  derecho.write(150);
}

void cerrarOjos() {
  izquierdo.write(95);
  derecho.write(85);
}

void parpadeoNatural() {
  cerrarOjos();
  delay(180);
  abrirOjos();
}

void setup() {
  izquierdo.attach(9);
  derecho.attach(10);
  abrirOjos();
}

void loop() {
  parpadeoNatural();
  delay(3000);
}`,
      expected: "loop es breve y el parpadeo completo se reconoce por el nombre de una función."
    },
    {
      title: "Agregar un comportamiento sin alterar el anterior",
      instruction: "Conserva parpadeoNatural y agrega modoAlerta como una función diferente. No copies toda la lógica dentro de loop.",
      code: `void parpadeoNatural() {
  Serial.println("Cerrar 180 ms y abrir");
}

void parpadeoDesfasado() {
  Serial.println("Izquierdo, derecho, abrir");
}

void modoAlerta() {
  Serial.println("INICIO ALERTA");
  parpadeoDesfasado();
  delay(300);
  parpadeoDesfasado();
}

void setup() {
  Serial.begin(9600);
  parpadeoNatural();
  modoAlerta();
}

void loop() {
}`,
      expected: "Los dos comportamientos pueden ejecutarse por separado y modoAlerta reutiliza otra función."
    },
    {
      title: "Programar intervalos sin detener toda la lógica",
      instruction: "Prueba millis para decidir cuándo parpadear. Esta estructura permite añadir después otros comportamientos sin llenar loop de delays.",
      code: `unsigned long anterior = 0;
unsigned long intervalo = 3000;

void parpadeoNatural() {
  Serial.println("PARPADEO");
}

void setup() {
  Serial.begin(9600);
}

void loop() {
  unsigned long ahora = millis();

  if (ahora - anterior >= intervalo) {
    anterior = ahora;
    parpadeoNatural();
    intervalo = random(3000, 7000);
  }
}`,
      expected: "Los parpadeos aparecen con intervalos variables y loop no contiene una secuencia extensa."
    }
  ],
  "proyecto-especial-brazo-dinosaurio": [
    {
      title: "Definir los estados del brazo",
      instruction: "Antes de conectar componentes, representa reposo, activación y regreso con funciones nombradas.",
      code: `void reposo() {
  Serial.println("BRAZO EN REPOSO");
}

void ataque() {
  Serial.println("BRAZO EN MOVIMIENTO");
}

void regresar() {
  Serial.println("BRAZO REGRESA");
}

void setup() {
  Serial.begin(9600);
  reposo();
  ataque();
  regresar();
}

void loop() {
}`,
      expected: "El monitor muestra las tres responsabilidades en el orden planeado."
    },
    {
      title: "Probar la decisión con distancias simuladas",
      instruction: "Valida el umbral antes del sensor. Cambia distancia por valores menores y mayores a 25.",
      code: `const int DISTANCIA_ACTIVACION = 25;
int distancia = 20;

bool debeActivarse(int valor) {
  return valor > 0 && valor <= DISTANCIA_ACTIVACION;
}

void setup() {
  Serial.begin(9600);
  Serial.println(debeActivarse(distancia)
    ? "ACTIVAR"
    : "ESPERAR");
}

void loop() {
}`,
      expected: "Los valores cercanos activan y los lejanos esperan, sin controlar todavía el brazo."
    },
    {
      title: "Leer distancia como una responsabilidad aislada",
      instruction: "Crea medirDistancia y revisa el monitor serial. No agregues el servo hasta confiar en la entrada.",
      code: `const int TRIG = 9;
const int ECHO = 10;

long medirDistancia() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long tiempo = pulseIn(ECHO, HIGH, 30000);
  if (tiempo == 0) return -1;
  return tiempo / 58;
}

void setup() {
  Serial.begin(9600);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
}

void loop() {
  Serial.println(medirDistancia());
  delay(250);
}`,
      expected: "La función devuelve centímetros o -1 cuando no existe una lectura válida."
    },
    {
      title: "Probar cada salida por separado",
      instruction: "Confirma servo, LED y buzzer con una secuencia corta. Si algo falla, sabrás qué componente revisar.",
      code: `#include <Servo.h>

Servo brazo;
const int LED = 4;
const int BUZZER = 8;

void setup() {
  brazo.attach(6);
  pinMode(LED, OUTPUT);
  pinMode(BUZZER, OUTPUT);

  brazo.write(20);
  digitalWrite(LED, HIGH);
  tone(BUZZER, 900, 200);
  delay(700);
  brazo.write(70);
  digitalWrite(LED, LOW);
}

void loop() {
}`,
      expected: "Los tres componentes responden y el servo usa un recorrido de prueba seguro."
    },
    {
      title: "Encapsular la reacción completa",
      instruction: "Coloca movimiento, luz y sonido dentro de activarBrazo. loop no debe repetir esos detalles.",
      code: `#include <Servo.h>

Servo brazo;

void activarBrazo() {
  digitalWrite(4, HIGH);
  tone(8, 900, 250);
  brazo.write(110);
  delay(500);
  brazo.write(20);
  digitalWrite(4, LOW);
}

void setup() {
  brazo.attach(6);
  pinMode(4, OUTPUT);
  pinMode(8, OUTPUT);
  brazo.write(20);
}

void loop() {
  activarBrazo();
  delay(3000);
}`,
      expected: "Una llamada a activarBrazo realiza la reacción y devuelve el mecanismo al reposo."
    },
    {
      title: "Evitar activaciones repetidas",
      instruction: "Usa una variable de estado. El brazo solo se prepara otra vez cuando la persona se aleja.",
      code: `const int UMBRAL = 25;
bool brazoActivado = false;
int distancia = 20;

void activarBrazo() {
  Serial.println("REACCION");
}

void setup() {
  Serial.begin(9600);
}

void loop() {
  if (distancia <= UMBRAL && !brazoActivado) {
    brazoActivado = true;
    activarBrazo();
  }

  if (distancia > UMBRAL + 10) {
    brazoActivado = false;
  }
}`,
      expected: "Una persona que permanece cerca produce una sola reacción, no una repetición continua."
    },
    {
      title: "Centralizar los ajustes de seguridad",
      instruction: "Agrupa umbral, ángulos y velocidad en constantes. La mejora se realiza cambiando valores, no buscando números por todo el programa.",
      code: `const int DISTANCIA_ACTIVACION = 25;
const int MARGEN_REINICIO = 10;
const int ANGULO_REPOSO = 20;
const int ANGULO_ATAQUE = 110;
const int PASO_ANGULO = 5;
const int ESPERA_MOVIMIENTO = 25;

void mostrarConfiguracion() {
  Serial.println(DISTANCIA_ACTIVACION);
  Serial.println(ANGULO_REPOSO);
  Serial.println(ANGULO_ATAQUE);
  Serial.println(ESPERA_MOVIMIENTO);
}

void setup() {
  Serial.begin(9600);
  mostrarConfiguracion();
}

void loop() {
}`,
      expected: "Todos los valores ajustables tienen nombres y se encuentran juntos al inicio."
    }
  ],
  "proyecto-especial-huevo-dinosaurio": [
    {
      title: "Representar la historia con funciones",
      instruction: "Primero confirma el orden narrativo sin mover el servo. Cada acción tiene un nombre propio.",
      code: `void empujes() {
  Serial.println("EMPUJES PEQUENOS");
}

void abrirHuevo() {
  Serial.println("APERTURA FUERTE");
}

void cerrarHuevo() {
  Serial.println("CIERRE");
}

void setup() {
  Serial.begin(9600);
  empujes();
  abrirHuevo();
  cerrarHuevo();
}

void loop() {
}`,
      expected: "El monitor muestra empujes, apertura y cierre en el orden correcto."
    },
    {
      title: "Nombrar ángulos y tiempos",
      instruction: "Guarda la planeación en constantes. No disperses números sin significado por todo el código.",
      code: `const int CERRADO = 0;
const int EMPUJE_1 = 10;
const int EMPUJE_2 = 15;
const int EMPUJE_3 = 25;
const int APERTURA = 60;
const int PAUSA_CORTA = 250;
const int PAUSA_ABIERTO = 1000;

void setup() {
  Serial.begin(9600);
  Serial.println("Configuracion preparada");
}

void loop() {
}`,
      expected: "Los movimientos y tiempos importantes se pueden ajustar desde una sola sección."
    },
    {
      title: "Confirmar una posición segura del servo",
      instruction: "Conecta solo el servo y llévalo a la posición cerrada. No montes la tapa hasta comprobar esta base.",
      code: `#include <Servo.h>

Servo servoHuevo;
const int PIN_SERVO = 9;
const int CERRADO = 0;

void setup() {
  servoHuevo.attach(PIN_SERVO);
  servoHuevo.write(CERRADO);
}

void loop() {
}`,
      expected: "El servo permanece estable en la posición cerrada sin vibración excesiva."
    },
    {
      title: "Calibrar un ángulo a la vez",
      instruction: "Modifica ANGULO_PRUEBA gradualmente. Esta prueba evita usar una secuencia completa mientras el mecanismo todavía no está calibrado.",
      code: `#include <Servo.h>

Servo servoHuevo;
const int CERRADO = 0;
const int ANGULO_PRUEBA = 20;

void setup() {
  servoHuevo.attach(9);
}

void loop() {
  servoHuevo.write(CERRADO);
  delay(1500);
  servoHuevo.write(ANGULO_PRUEBA);
  delay(1500);
}`,
      expected: "Puedes clasificar el ángulo como insuficiente, seguro o excesivo sin dañar la tapa."
    },
    {
      title: "Crear una función para los empujes",
      instruction: "Agrupa únicamente los movimientos pequeños. La apertura final todavía no forma parte de esta prueba.",
      code: `#include <Servo.h>

Servo huevo;

void realizarEmpujes() {
  huevo.write(10);
  delay(200);
  huevo.write(0);
  delay(200);
  huevo.write(15);
  delay(250);
  huevo.write(0);
  delay(300);
  huevo.write(25);
  delay(300);
  huevo.write(5);
}

void setup() {
  huevo.attach(9);
}

void loop() {
  realizarEmpujes();
  delay(2000);
}`,
      expected: "Una sola función produce varios empujes y el programa principal sigue siendo corto."
    },
    {
      title: "Integrar el ciclo completo con funciones",
      instruction: "Suma apertura y cierre sin desarmar realizarEmpujes. La integración reutiliza lo que ya funcionó.",
      code: `void realizarEmpujes() {
  Serial.println("Tres empujes");
}

void abrirHuevo() {
  Serial.println("Abrir a 60 grados");
  delay(1000);
}

void cerrarHuevo() {
  Serial.println("Cerrar a 0 grados");
}

void cicloHuevo() {
  realizarEmpujes();
  abrirHuevo();
  cerrarHuevo();
}

void setup() {
  Serial.begin(9600);
}

void loop() {
  cicloHuevo();
  delay(2000);
}`,
      expected: "cicloHuevo expresa la secuencia completa reutilizando tres funciones con tareas separadas."
    },
    {
      title: "Probar repetición y registrar ciclos",
      instruction: "Añade un contador para observar cuántos ciclos soporta el mecanismo. No mezcles el registro con las funciones de movimiento.",
      code: `int numeroCiclo = 0;

void cicloHuevo() {
  Serial.println("Empujes, apertura y cierre");
}

void setup() {
  Serial.begin(9600);
}

void loop() {
  numeroCiclo++;
  Serial.print("Ciclo: ");
  Serial.println(numeroCiclo);
  cicloHuevo();
  delay(2000);

  if (numeroCiclo == 5) {
    Serial.println("Prueba terminada");
    while (true) {
    }
  }
}`,
      expected: "El programa ejecuta exactamente cinco ciclos y permite relacionar cualquier falla con un número de ciclo."
    }
  ],
  "proyecto-especial-radar": [
    {
      title: "Relacionar ángulo y distancia",
      instruction: "Representa primero los dos datos fundamentales. No controles componentes hasta comprender qué información produce el radar.",
      code: `void mostrarLectura(int angulo, int distancia) {
  Serial.print("Angulo: ");
  Serial.print(angulo);
  Serial.print(" | Distancia: ");
  Serial.println(distancia);
}

void setup() {
  Serial.begin(9600);
  mostrarLectura(45, 30);
  mostrarLectura(90, 12);
  mostrarLectura(135, 60);
}

void loop() {
}`,
      expected: "Cada línea conserva junta la dirección y la distancia de un objeto."
    },
    {
      title: "Separar la decisión de alerta",
      instruction: "Prueba la clasificación con distancias simuladas antes de usar el sensor.",
      code: `const int DETECCION = 30;
const int ALERTA = 10;

void revisarAlerta(int distancia) {
  if (distancia <= ALERTA) {
    Serial.println("ALERTA");
  } else if (distancia <= DETECCION) {
    Serial.println("DETECTADO");
  } else {
    Serial.println("LIBRE");
  }
}

void setup() {
  Serial.begin(9600);
  revisarAlerta(8);
  revisarAlerta(20);
  revisarAlerta(50);
}

void loop() {
}`,
      expected: "Las tres distancias producen alerta, detección y zona libre."
    },
    {
      title: "Probar el movimiento sin sensor",
      instruction: "Comprueba únicamente el arco del servo. Así los problemas mecánicos no se confunden con problemas de medición.",
      code: `#include <Servo.h>

Servo radar;

void setup() {
  radar.attach(6);
}

void loop() {
  radar.write(15);
  delay(1000);
  radar.write(90);
  delay(1000);
  radar.write(165);
  delay(1000);
}`,
      expected: "El servo alcanza 15, 90 y 165 grados sin que los cables detengan el movimiento."
    },
    {
      title: "Probar el sensor sin movimiento",
      instruction: "Mantén el sensor fijo y encapsula la medición. Compara el resultado con una regla.",
      code: `const int TRIG = 9;
const int ECHO = 10;

long medirDistancia() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long tiempo = pulseIn(ECHO, HIGH, 30000);
  if (tiempo == 0) return -1;
  return tiempo / 58;
}

void setup() {
  Serial.begin(9600);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
}

void loop() {
  Serial.println(medirDistancia());
  delay(300);
}`,
      expected: "El sensor fijo entrega distancias razonables antes de combinarse con el servo."
    },
    {
      title: "Construir un barrido en una función",
      instruction: "Encapsula el recorrido de ida. Después podrás crear el regreso sin duplicar toda la lógica de medición.",
      code: `#include <Servo.h>

Servo radar;

void medirEnAngulo(int angulo) {
  radar.write(angulo);
  delay(120);
  Serial.print("Medir en ");
  Serial.println(angulo);
}

void barridoIda() {
  for (int angulo = 15; angulo <= 165; angulo += 5) {
    medirEnAngulo(angulo);
  }
}

void setup() {
  Serial.begin(9600);
  radar.attach(6);
}

void loop() {
  barridoIda();
}`,
      expected: "La función recorre el arco y cada posición llama a una función de medición."
    },
    {
      title: "Integrar una lectura con sus señales",
      instruction: "revisarAlerta recibe un dato y controla las salidas. No copies las condiciones dentro de cada barrido.",
      code: `const int LED_ROJO = 3;
const int LED_VERDE = 4;
const int BUZZER = 8;

void revisarAlerta(int distancia) {
  bool cerca = distancia > 0 && distancia <= 30;
  digitalWrite(LED_ROJO, cerca);
  digitalWrite(LED_VERDE, !cerca);

  if (distancia > 0 && distancia <= 10) {
    tone(BUZZER, 1800, 100);
  }
}

void setup() {
  pinMode(LED_ROJO, OUTPUT);
  pinMode(LED_VERDE, OUTPUT);
  pinMode(BUZZER, OUTPUT);
}

void loop() {
  revisarAlerta(8);
  delay(1000);
  revisarAlerta(50);
  delay(1000);
}`,
      expected: "La misma función produce señales correctas para un objeto cercano y uno lejano."
    },
    {
      title: "Reutilizar una función para ida y regreso",
      instruction: "Evita dos bloques casi iguales. Una función recibe inicio, fin y paso para recorrer ambas direcciones.",
      code: `void barrer(int inicio, int fin, int paso) {
  for (int angulo = inicio;
       paso > 0 ? angulo <= fin : angulo >= fin;
       angulo += paso) {
    Serial.print("Angulo: ");
    Serial.println(angulo);
  }
}

void setup() {
  Serial.begin(9600);
}

void loop() {
  barrer(15, 165, 5);
  barrer(165, 15, -5);
  delay(1000);
}`,
      expected: "Una sola función realiza ida y regreso sin duplicar el bloque for."
    }
  ]
};

function createObjectiveField(objectiveNumber, suffix, label, placeholder = "") {
  const fieldId = `objective-${objectiveNumber}-delivery-${suffix}`;
  return `
    <div class="worksheet-field">
      <label for="${fieldId}">${label}</label>
      <textarea
        class="worksheet-textarea"
        id="${fieldId}"
        name="${fieldId}"
        data-objective-required
        placeholder="${placeholder}"
      ></textarea>
    </div>
  `;
}

function createObjectiveTable(objectiveNumber, columns, rowLabels) {
  const placeholderForColumn = (column) => {
    const normalizedColumn = column.toLowerCase();
    if (normalizedColumn.includes("planeado")) return "Escribe el valor que esperas obtener.";
    if (normalizedColumn.includes("observado")) return "Escribe exactamente qué ocurrió en la prueba.";
    if (normalizedColumn.includes("ajuste")) return "Explica qué cambiaste después de observar el resultado.";
    if (normalizedColumn.includes("acción")) return "Escribe una sola acción, por ejemplo: mover el servo.";
    if (normalizedColumn.includes("valor")) return "Anota un número, tiempo o explicación concreta.";
    if (normalizedColumn.includes("idea")) return "Escribe una regla o decisión completa.";
    if (normalizedColumn.includes("importante")) return "Explica la razón con una oración.";
    return "Escribe una respuesta concreta.";
  };

  return `
    <div class="objective-delivery-table">
      <table>
        <thead>
          <tr>
            <th scope="col">Elemento</th>
            ${columns.map((column) => `<th scope="col">${column}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${rowLabels.map((rowLabel, rowIndex) => `
            <tr>
              <th scope="row">${rowLabel}</th>
              ${columns.map((column, columnIndex) => {
                const fieldId = `objective-${objectiveNumber}-delivery-r${rowIndex + 1}-c${columnIndex + 1}`;
                return `
                  <td>
                    <label class="sr-only" for="${fieldId}">${rowLabel}: ${column}</label>
                    <textarea
                      class="worksheet-textarea worksheet-textarea--compact"
                      id="${fieldId}"
                      name="${fieldId}"
                      data-objective-required
                      placeholder="${placeholderForColumn(column)}"
                    ></textarea>
                  </td>
                `;
              }).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function createStudentInstructions(card, objectiveNumber, codeStep) {
  const descriptionParagraph = Array.from(card.querySelectorAll("p")).find(
    (paragraph) => paragraph.querySelector("strong")?.textContent.trim() === "Descripción:"
  );
  const deliveryParagraph = Array.from(card.querySelectorAll("p")).find(
    (paragraph) => paragraph.querySelector("strong")?.textContent.trim() === "Entrega:"
  );
  const evaluationParagraph = Array.from(card.querySelectorAll("p")).find(
    (paragraph) => paragraph.querySelector("strong")?.textContent.trim() === "Evaluación:"
  );
  const description = descriptionParagraph?.textContent.replace(/^Descripción:\s*/, "").trim() || "";
  const delivery = deliveryParagraph?.textContent.replace(/^Entrega:\s*/, "").trim() || "";
  const evaluation = evaluationParagraph?.textContent.replace(/^Evaluación:\s*/, "").trim() || "";

  const block = document.createElement("div");
  block.className = "objective-student-guide";
  block.innerHTML = `
    <h3>Instrucciones: realiza este objetivo paso a paso</h3>
    <ol class="objective-student-guide__steps">
      <li><strong>Lee la meta.</strong> En este objetivo vas a trabajar solamente en lo siguiente: ${description}</li>
      <li><strong>Elige cómo vas a trabajar.</strong> Puedes usar un Arduino físico con Arduino IDE o realizar la simulación en Tinkercad Circuits. Si usas Tinkercad, crea un circuito nuevo para esta prueba y guarda el enlace.</li>
      <li><strong>Prepara tu espacio.</strong> Ten abierto este sitio y Arduino IDE o Tinkercad. Usa únicamente los componentes necesarios para esta prueba; todavía no intentes terminar todo el proyecto.</li>
      <li><strong>Realiza la actividad.</strong> Sigue la descripción anterior y anota datos reales. Si debes medir, usa una regla; si debes elegir colores, ángulos o tiempos, escribe los valores exactos.</li>
      <li><strong>Llena el formato de entrega.</strong> Completa todas las celdas y cuadros que aparecen abajo. No escribas solamente “sí”, “no” o “funcionó”. Explica qué hiciste y qué observaste.</li>
      <li><strong>Haz la prueba de código ${objectiveNumber}.</strong> Crea un programa nuevo, copia únicamente el fragmento de este objetivo y ejecútalo antes de agregar más funciones. La meta de esta prueba es: ${codeStep.title.toLowerCase()}.</li>
      <li><strong>Comprueba el resultado.</strong> Compara lo que ocurrió con el apartado “Resultado esperado”. Si no coincide, revisa primero conexiones, pines y mensajes de error. Cambia una sola cosa y vuelve a probar.</li>
      <li><strong>Registra y explica.</strong> Escribe qué funcionó, qué error apareció y qué parte del código conservarás. Después responde las dos preguntas con oraciones completas.</li>
      <li><strong>Revisa antes de terminar.</strong> Debes entregar: ${delivery} Tu trabajo cumple cuando: ${evaluation}</li>
      <li><strong>Marca el objetivo.</strong> Activa “Objetivo ${objectiveNumber} completado” únicamente cuando todos los campos estén llenos y la prueba de código produzca el resultado esperado.</li>
    </ol>
  `;
  return block;
}

function createObjectiveDeliveryForm(card, objectiveNumber) {
  const deliveryParagraph = Array.from(card.querySelectorAll("p")).find(
    (paragraph) => paragraph.querySelector("strong")?.textContent.trim() === "Entrega:"
  );
  const deliveryText = deliveryParagraph?.textContent.replace(/^Entrega:\s*/, "").trim() || "";
  const normalized = deliveryText.toLowerCase();
  let formContent = "";

  if (/secuencia|viñeta|línea de tiempo|diagrama de flujo|lista ordenada/.test(normalized)) {
    formContent += createObjectiveTable(
      objectiveNumber,
      ["Acción o decisión", "Valor, tiempo o explicación"],
      ["Paso 1", "Paso 2", "Paso 3", "Paso 4"]
    );
  } else if (/tabla|registro|prueba|mapa/.test(normalized)) {
    formContent += createObjectiveTable(
      objectiveNumber,
      ["Valor planeado", "Resultado observado", "Ajuste realizado"],
      ["Prueba 1", "Prueba 2", "Prueba 3", "Prueba 4"]
    );
  } else if (/diagrama|boceto|dibujo/.test(normalized)) {
    formContent += createObjectiveField(
      objectiveNumber,
      "diagram-components",
      "Componentes o partes que debe incluir tu dibujo",
      "Ejemplo: sensor, servo, tapa, punto de giro, cables..."
    );
    formContent += createObjectiveField(
      objectiveNumber,
      "diagram-connections",
      "Describe las conexiones, posiciones, medidas o flechas que dibujaste",
      "Explica dónde colocaste cada parte y cómo se relaciona con las demás."
    );
    formContent += createObjectiveField(
      objectiveNumber,
      "diagram-explanation",
      "Explica cómo funciona tu diseño",
      "Describe el recorrido, la entrada, la salida y cualquier regla de seguridad."
    );
  } else if (/lista/.test(normalized)) {
    formContent += createObjectiveTable(
      objectiveNumber,
      ["Idea, regla o ajuste", "Por qué es importante"],
      ["Elemento 1", "Elemento 2", "Elemento 3", "Elemento 4"]
    );
  } else {
    formContent += createObjectiveField(
      objectiveNumber,
      "main",
      "Completa aquí la entrega solicitada",
      deliveryText
    );
    formContent += createObjectiveField(
      objectiveNumber,
      "data",
      "Anota los valores, decisiones o resultados concretos",
      "Incluye ángulos, distancias, tiempos, colores, estados o componentes cuando corresponda."
    );
  }

  if (/video|drive|demostración/.test(normalized)) {
    formContent += createObjectiveField(
      objectiveNumber,
      "evidence-description",
      "Describe qué debe observarse en el video o evidencia de Drive",
      "Indica qué prueba realizaste, qué funcionó y en qué parte del video puede revisarse."
    );
  }

  formContent += createObjectiveField(
    objectiveNumber,
    "conclusion",
    "Conclusión de la entrega",
    "Escribe qué aprendiste, qué decisión tomaste y qué conservarás para el siguiente objetivo."
  );

  const block = document.createElement("div");
  block.className = "objective-delivery-form";
  block.innerHTML = `
    <h3>Formato de entrega del objetivo</h3>
    <p class="objective-delivery-form__instruction"><strong>Debes completar:</strong> ${deliveryText}</p>
    ${formContent}
  `;
  return block;
}

function setupSpecialProjectLearningSequence() {
  const worksheetKey = document.body.dataset.worksheetKey;
  const questionSets = SPECIAL_PROJECT_QUESTIONS[worksheetKey];
  const codeSteps = SPECIAL_PROJECT_CODE_STEPS[worksheetKey];
  if (!questionSets || !codeSteps) return;

  const objectiveCards = Array.from(document.querySelectorAll(".card")).filter((card) =>
    /^Objetivo\s+[1-7]:/.test(card.querySelector("h2")?.textContent.trim() || "")
  );
  if (objectiveCards.length !== questionSets.length) return;

  const identifiedCard = Array.from(document.querySelectorAll(".card")).find(
    (card) => card.querySelector("h2")?.textContent.trim() === "Producto final identificado"
  );

  const progressCard = document.createElement("section");
  progressCard.className = "card learning-progress";
  progressCard.setAttribute("aria-labelledby", "learning-progress-title");
  progressCard.innerHTML = `
    <div class="learning-progress__heading">
      <h2 id="learning-progress-title">Avance del proyecto</h2>
      <strong class="learning-progress__percentage" data-learning-percentage>0%</strong>
    </div>
    <div
      class="learning-progress__track"
      role="progressbar"
      aria-label="Porcentaje de objetivos completados"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow="0"
      data-learning-progress
    >
      <span class="learning-progress__fill" data-learning-progress-fill></span>
    </div>
    <p class="learning-progress__summary" data-learning-summary>0 de 7 objetivos completados.</p>
    <p class="worksheet-note">Trabaja los objetivos en orden. No comiences el objetivo siguiente hasta completar la actividad, el formato de entrega, la prueba de código y las preguntas del objetivo actual.</p>
  `;

  if (identifiedCard) {
    identifiedCard.insertAdjacentElement("afterend", progressCard);
  }

  objectiveCards.forEach((card, index) => {
    const objectiveNumber = index + 1;
    const questions = questionSets[index];
    const codeStep = codeSteps[index];
    card.appendChild(createStudentInstructions(card, objectiveNumber, codeStep));
    card.appendChild(createObjectiveDeliveryForm(card, objectiveNumber));

    const codeTestBlock = document.createElement("div");
    codeTestBlock.className = "objective-code-test";
    codeTestBlock.innerHTML = `
      <h3>Prueba incremental de código</h3>
      <p><strong>Paso ${objectiveNumber}:</strong> ${codeStep.title}</p>
      <ol class="objective-code-test__steps">
        <li>Abre Arduino IDE si trabajarás con un Arduino físico. Si no tienes los componentes o quieres comprobar primero el programa, abre <strong>Tinkercad Circuits</strong> y realiza una simulación.</li>
        <li>En Tinkercad, selecciona <strong>Crear nuevo circuito</strong>, agrega un Arduino Uno y coloca solamente los componentes necesarios para esta prueba.</li>
        <li>Crea un programa nuevo. No pegues todavía el código final del proyecto.</li>
        <li>Copia el fragmento que aparece abajo usando el botón <strong>Copiar código</strong>.</li>
        <li>Selecciona la tarjeta Arduino Uno. Si trabajas con Arduino físico, selecciona también el puerto correcto.</li>
        <li>Presiona <strong>Verificar</strong>. Si aparece un error, lee la primera línea del mensaje y corrígelo antes de continuar.</li>
        <li>Inicia la simulación o carga el programa. Sigue esta indicación específica: ${codeStep.instruction}</li>
        <li>Realiza la prueba por lo menos dos veces. Cambia únicamente el valor que se indique y compara los resultados.</li>
        <li>No agregues el siguiente bloque de código hasta que esta prueba funcione.</li>
      </ol>
      <pre><code></code></pre>
      <p><strong>Resultado esperado:</strong> ${codeStep.expected}</p>
      <div class="worksheet-field objective-tinkercad-link">
        <label for="objective-${objectiveNumber}-tinkercad-link">Enlace de la simulación de Tinkercad de este objetivo (si utilizaste Tinkercad)</label>
        <input
          class="worksheet-input"
          id="objective-${objectiveNumber}-tinkercad-link"
          name="objective-${objectiveNumber}-tinkercad-link"
          type="url"
          inputmode="url"
          placeholder="https://www.tinkercad.com/things/..."
        />
        <small>Copia el enlace desde Tinkercad y verifica que el profesor pueda abrirlo. Si trabajaste únicamente con Arduino físico, puedes dejar este campo vacío.</small>
      </div>
      <div class="worksheet-field">
        <label for="objective-${objectiveNumber}-code-result">¿Qué funcionó, qué error apareció y qué conservarás para el siguiente objetivo?</label>
        <textarea
          class="worksheet-textarea"
          id="objective-${objectiveNumber}-code-result"
          name="objective-${objectiveNumber}-code-result"
          data-objective-required
          placeholder="Ejemplo: El servo llegó a 90 grados. Primero apareció un error porque escribí mal Servo. Corregí el nombre y conservaré la función moverServo()."
        ></textarea>
      </div>
    `;
    codeTestBlock.querySelector("code").textContent = codeStep.code;
    card.appendChild(codeTestBlock);

    const reflectionBlock = document.createElement("div");
    reflectionBlock.className = "objective-reflection";
    reflectionBlock.innerHTML = `
      <h3>Preguntas de investigación y reflexión</h3>
      ${questions
        .map((question, questionIndex) => {
          const fieldId = `objective-${objectiveNumber}-question-${questionIndex + 1}`;
          return `
            <div class="worksheet-field">
              <label for="${fieldId}">${questionIndex + 1}. ${question}</label>
              <textarea
                class="worksheet-textarea"
                id="${fieldId}"
                name="${fieldId}"
                data-objective-required
                placeholder="Responde con 2 a 4 oraciones. Explica tu decisión y menciona un dato, valor o resultado de tu prueba."
              ></textarea>
            </div>
          `;
        })
        .join("")}
      <div class="objective-completion">
        <label>
          <input
            type="checkbox"
            name="objective_${objectiveNumber}_completed"
            data-objective-completed
          />
          Objetivo ${objectiveNumber} completado
        </label>
      </div>
    `;
    card.appendChild(reflectionBlock);
  });

  const finalReflectionHeading = Array.from(document.querySelectorAll(".card h2")).find(
    (heading) => heading.textContent.trim() === "Preguntas de reflexión"
  );
  if (finalReflectionHeading) {
    finalReflectionHeading.textContent = "Reflexión final integradora";
  }

  const progressElement = progressCard.querySelector("[data-learning-progress]");
  const progressFill = progressCard.querySelector("[data-learning-progress-fill]");
  const percentageLabel = progressCard.querySelector("[data-learning-percentage]");
  const summary = progressCard.querySelector("[data-learning-summary]");

  function updateProgress() {
    const completionFields = Array.from(document.querySelectorAll("[data-objective-completed]"));
    const completed = completionFields.filter((field) => field.checked).length;
    const percentage = Math.round((completed / completionFields.length) * 100);

    progressElement.setAttribute("aria-valuenow", String(percentage));
    progressFill.style.width = `${percentage}%`;
    percentageLabel.textContent = `${percentage}%`;
    summary.textContent = `${completed} de ${completionFields.length} objetivos completados.`;

    objectiveCards.forEach((card, index) => {
      card.classList.toggle("objective-card--completed", completionFields[index]?.checked);
    });
  }

  document.addEventListener("input", (event) => {
    if (event.target.matches("[data-objective-completed]")) {
      updateProgress();
    }
  });
  document.addEventListener("worksheet-data-applied", updateProgress);
  document.addEventListener("worksheet-reset", updateProgress);
  window.setTimeout(updateProgress, 0);
}

function setupImageLightbox() {
  const lightbox = document.getElementById("image-lightbox");
  const lightboxImage = document.getElementById("image-lightbox-image");
  const lightboxCaption = document.getElementById("image-lightbox-caption");
  const lightboxClose = document.getElementById("image-lightbox-close");
  const lightboxDialog = lightbox?.querySelector(".image-lightbox__dialog");
  const lightboxFigure = lightbox?.querySelector(".image-lightbox__figure");
  const zoomableImages = document.querySelectorAll("figure img");

  if (
    !lightbox ||
    !lightboxImage ||
    !lightboxCaption ||
    !lightboxClose ||
    !lightboxDialog ||
    !lightboxFigure ||
    !zoomableImages.length
  ) {
    return;
  }

  const toolbar = document.createElement("div");
  toolbar.className = "image-lightbox__toolbar";
  toolbar.innerHTML = `
    <button type="button" class="image-lightbox__tool" data-action="zoom-out" aria-label="Alejar imagen">-</button>
    <button type="button" class="image-lightbox__tool" data-action="zoom-in" aria-label="Acercar imagen">+</button>
    <button type="button" class="image-lightbox__tool" data-action="reset" aria-label="Restablecer zoom">0</button>
    <span class="image-lightbox__status" id="image-lightbox-status">100%</span>
  `;
  lightboxDialog.insertBefore(toolbar, lightboxFigure);

  const viewport = document.createElement("div");
  viewport.className = "image-lightbox__viewport";
  lightboxFigure.insertBefore(viewport, lightboxImage);
  viewport.appendChild(lightboxImage);

  const zoomInButton = toolbar.querySelector('[data-action="zoom-in"]');
  const zoomOutButton = toolbar.querySelector('[data-action="zoom-out"]');
  const resetButton = toolbar.querySelector('[data-action="reset"]');
  const statusLabel = document.getElementById("image-lightbox-status");

  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let lastPointerType = "";

  function updateTransform() {
    lightboxImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    statusLabel.textContent = `${Math.round(scale * 100)}%`;
    viewport.classList.toggle("is-draggable", scale > 1);
  }

  function resetZoom() {
    scale = 1;
    translateX = 0;
    translateY = 0;
    updateTransform();
  }

  function setScale(nextScale) {
    const clampedScale = Math.min(4, Math.max(1, nextScale));

    if (clampedScale === 1) {
      translateX = 0;
      translateY = 0;
    } else if (clampedScale < scale) {
      translateX *= clampedScale / scale;
      translateY *= clampedScale / scale;
    }

    scale = clampedScale;
    updateTransform();
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImage.removeAttribute("src");
    lightboxImage.alt = "";
    lightboxCaption.textContent = "";
    resetZoom();
    document.body.style.overflow = "";
  }

  function openLightbox(image) {
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt || "Imagen ampliada";
    lightboxCaption.textContent =
      image.closest("figure")?.querySelector("figcaption")?.textContent || image.alt || "";
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    resetZoom();
    document.body.style.overflow = "hidden";
  }

  zoomableImages.forEach((image) => {
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", `${image.alt || "Imagen"}: abrir ampliada`);

    image.addEventListener("click", () => openLightbox(image));
    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(image);
      }
    });
  });

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  viewport.addEventListener("dblclick", () => {
    setScale(scale > 1 ? 1 : 2);
  });

  viewport.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      const zoomDelta = event.deltaY < 0 ? 0.25 : -0.25;
      setScale(scale + zoomDelta);
    },
    { passive: false }
  );

  viewport.addEventListener("pointerdown", (event) => {
    if (scale <= 1) return;

    isDragging = true;
    dragStartX = event.clientX - translateX;
    dragStartY = event.clientY - translateY;
    lastPointerType = event.pointerType;
    viewport.classList.add("is-dragging");
    viewport.setPointerCapture(event.pointerId);
  });

  viewport.addEventListener("pointermove", (event) => {
    if (!isDragging || scale <= 1) return;

    translateX = event.clientX - dragStartX;
    translateY = event.clientY - dragStartY;
    updateTransform();
  });

  function stopDragging(event) {
    if (!isDragging) return;
    isDragging = false;
    viewport.classList.remove("is-dragging");

    if (event) {
      viewport.releasePointerCapture(event.pointerId);
    }
  }

  viewport.addEventListener("pointerup", stopDragging);
  viewport.addEventListener("pointercancel", stopDragging);
  viewport.addEventListener("pointerleave", (event) => {
    if (lastPointerType === "mouse") {
      stopDragging(event);
    }
  });

  zoomInButton.addEventListener("click", () => setScale(scale + 0.25));
  zoomOutButton.addEventListener("click", () => setScale(scale - 0.25));
  resetButton.addEventListener("click", resetZoom);
  lightboxClose.addEventListener("click", closeLightbox);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("open")) {
      closeLightbox();
      return;
    }

    if (!lightbox.classList.contains("open")) {
      return;
    }

    if (event.key === "+" || event.key === "=") {
      setScale(scale + 0.25);
      return;
    }

    if (event.key === "-") {
      setScale(scale - 0.25);
      return;
    }

    if (event.key === "0") {
      resetZoom();
    }
  });

  updateTransform();
}

function setupContentProtection() {
  if (document.body.dataset.allowPageCopy === "true") return;

  const allowCodeCopy = document.body.dataset.allowCodeCopy === "true";

  function isEditableField(target) {
    return (
      target instanceof Element &&
      Boolean(target.closest("input, textarea, select, [contenteditable=\"true\"]"))
    );
  }

  [
    "copy",
    "cut",
    "paste",
    "contextmenu",
    "dragstart",
    "selectstart"
  ].forEach((eventName) => {
    document.addEventListener(eventName, (event) => {
      if (isEditableField(event.target)) {
        return;
      }

      if (
        allowCodeCopy &&
        event.target instanceof Element &&
        event.target.closest(".code-block")
      ) {
        return;
      }

      event.preventDefault();
    });
  });

  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    const isModifierPressed = event.ctrlKey || event.metaKey;

    if (!isModifierPressed) return;

    if (
      allowCodeCopy &&
      event.target instanceof Element &&
      event.target.closest(".code-block") &&
      ["a", "c"].includes(key)
    ) {
      return;
    }

    if (["a", "c", "s", "u", "v", "x", "p"].includes(key)) {
      if (isEditableField(event.target) && ["a", "c", "v", "x"].includes(key)) {
        return;
      }

      event.preventDefault();
    }
  });
}

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyA5u_v82cnpT_iKcFEachPBW1Fs5zmCZDY",
  authDomain: "practicasarduino-1f46e.firebaseapp.com",
  projectId: "practicasarduino-1f46e",
  storageBucket: "practicasarduino-1f46e.firebasestorage.app",
  messagingSenderId: "199136697239",
  appId: "1:199136697239:web:72ac87697ef77343e602d2"
};

let firebaseServicesPromise;

function getWorksheetFieldsDefault() {
  return Array.from(document.querySelectorAll(".worksheet-input, .worksheet-textarea, .worksheet-select, input[type=\"checkbox\"]"));
}

function collectWorksheetData(fields) {
  const data = {};

  fields.forEach((field) => {
    if (!field.name) return;
    data[field.name] = field.type === "checkbox" ? field.checked : field.value;
  });

  return data;
}

function getFieldLabel(field) {
  if (!field.id) return field.name || "";
  return document.querySelector(`label[for="${CSS.escape(field.id)}"]`)?.textContent.trim() || field.name || "";
}

function getEmailWebAppUrl(rawUrl) {
  if (!rawUrl) return "";
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
  return `https://script.google.com/macros/s/${rawUrl}/exec`;
}

function createHiddenInput(name, value) {
  const input = document.createElement("input");
  input.type = "hidden";
  input.name = name;
  input.value = value == null ? "" : String(value);
  return input;
}

function appendEmailSubmissionFields(target, payload) {
  const entries = [
    ["payload", JSON.stringify(payload)],
    ["worksheet_key", payload.worksheetKey],
    ["title", payload.title],
    ["student_name", payload.studentName],
    ["group_name", payload.groupName],
    ["delivery_date", payload.deliveryDate],
    ["project_link", payload.projectLink],
    ["evidence_link", payload.evidenceLink],
    ["progress_percentage", payload.progressPercentage],
    ["signed_in_email", payload.signedInEmail],
    ["submitted_at", payload.submittedAt],
    ["page_url", payload.pageUrl]
  ];

  Object.entries(payload.values || {}).forEach(([name, value]) => {
    entries.push([`field_${name}`, value]);
  });

  entries.forEach(([name, value]) => {
    if (target instanceof FormData) {
      target.append(name, value == null ? "" : String(value));
      return;
    }

    target.appendChild(createHiddenInput(name, value));
  });
}

function createNonFallbackSubmissionError(message) {
  const error = new Error(message);
  error.allowHiddenFormFallback = false;
  return error;
}

function createEmailMessagePayload(payload) {
  const submittedAt = new Date(payload.submittedAt);
  const submittedAtText = Number.isNaN(submittedAt.getTime())
    ? payload.submittedAt
    : submittedAt.toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  const rows = (payload.answers || []).map((answer) => {
    const label = answer.label || answer.name;
    const value = typeof answer.value === "boolean"
      ? (answer.value ? "Si" : "No")
      : String(answer.value || "").trim();

    return {
      label,
      value: value || "(sin respuesta)"
    };
  });

  const text = [
    payload.title,
    "",
    `Alumno: ${payload.studentName}`,
    `Grupo: ${payload.groupName || "(sin grupo)"}`,
    `Fecha: ${payload.deliveryDate || "(sin fecha)"}`,
    `Cuenta Google: ${payload.signedInEmail || "(sin correo)"}`,
    `Tinkercad: ${payload.projectLink || "(no incluido)"}`,
    `Drive: ${payload.evidenceLink || "(no incluido)"}`,
    `Avance: ${payload.progressPercentage == null ? "(no aplica)" : `${payload.progressPercentage}%`}`,
    `Enviado: ${submittedAtText}`,
    `Pagina: ${payload.pageUrl || ""}`,
    "",
    "Respuestas:",
    ...rows.map((row) => `${row.label}: ${row.value}`)
  ].join("\n");

  const htmlRows = rows.map((row) => `
    <tr>
      <th style="text-align:left;vertical-align:top;padding:8px;border:1px solid #ddd;background:#f7f7f7;">${escapeHtml(row.label)}</th>
      <td style="vertical-align:top;padding:8px;border:1px solid #ddd;white-space:pre-wrap;">${escapeHtml(row.value)}</td>
    </tr>
  `).join("");

  const html = `
    <h1>${escapeHtml(payload.title)}</h1>
    <p><strong>Alumno:</strong> ${escapeHtml(payload.studentName)}</p>
    <p><strong>Grupo:</strong> ${escapeHtml(payload.groupName || "(sin grupo)")}</p>
    <p><strong>Fecha:</strong> ${escapeHtml(payload.deliveryDate || "(sin fecha)")}</p>
    <p><strong>Cuenta Google:</strong> ${escapeHtml(payload.signedInEmail || "(sin correo)")}</p>
    <p><strong>Tinkercad:</strong> ${escapeHtml(payload.projectLink || "(no incluido)")}</p>
    <p><strong>Drive:</strong> ${escapeHtml(payload.evidenceLink || "(no incluido)")}</p>
    <p><strong>Avance:</strong> ${payload.progressPercentage == null ? "(no aplica)" : `${escapeHtml(String(payload.progressPercentage))}%`}</p>
    <p><strong>Enviado:</strong> ${escapeHtml(submittedAtText || "")}</p>
    <p><strong>Pagina:</strong> ${escapeHtml(payload.pageUrl || "")}</p>
    <h2>Respuestas</h2>
    <table style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif;font-size:14px;">
      ${htmlRows}
    </table>
  `;

  return {
    ...payload,
    to: ["lmartinez@isb.edu.mx"],
    subject: `${payload.title} - ${payload.studentName}`,
    text,
    html
  };
}

async function submitEmailWithFetch(webAppUrl, payload) {
  const emailPayload = createEmailMessagePayload(payload);

  const response = await fetch(webAppUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(emailPayload)
  });

  const text = await response.text();

  if (!response.ok) {
    throw createNonFallbackSubmissionError(`El servidor respondio con ${response.status}.`);
  }

  const trimmedText = text.trim();
  if (!trimmedText) return;

  if (/<title>\s*Error\s*<\/title>|No se encontro la funcion|No se encontró la función|Authorization is required|No tienes permiso/i.test(trimmedText)) {
    throw createNonFallbackSubmissionError("El Apps Script respondio con una pagina de error.");
  }

  try {
    const result = JSON.parse(trimmedText);
    if (result && result.ok === false) {
      throw createNonFallbackSubmissionError(result.message || result.error || "El servidor rechazo el envio.");
    }
  } catch (error) {
    if (error instanceof SyntaxError) return;
    throw error;
  }
}

function submitEmailWithHiddenForm(webAppUrl, payload) {
  return new Promise((resolve) => {
    const iframeName = `email-submit-frame-${Date.now()}`;
    const iframe = document.createElement("iframe");
    iframe.name = iframeName;
    iframe.hidden = true;

    const form = document.createElement("form");
    form.method = "POST";
    form.action = webAppUrl;
    form.target = iframeName;
    form.hidden = true;

    appendEmailSubmissionFields(form, payload);

    iframe.addEventListener("load", () => {
      window.setTimeout(() => {
        iframe.remove();
        form.remove();
      }, 1000);
      resolve();
    }, { once: true });

    document.body.appendChild(iframe);
    document.body.appendChild(form);
    form.submit();
  });
}

function setupWorksheetEmailSubmission() {
  const rawWebAppUrl = document.body.dataset.emailWebappUrl;
  const webAppUrl = getEmailWebAppUrl(rawWebAppUrl);
  const emailButton = document.querySelector('[data-worksheet-action="email"]');
  const loginButton = document.querySelector("[data-email-login]");
  const status = document.querySelector("[data-email-status]");

  if (!webAppUrl || !emailButton) return;

  let isSignedIn = document.body.dataset.googleSignedIn === "true";
  let isSending = false;
  let signedInEmail = "";
  const isProjectSubmission = document.body.dataset.projectSubmission === "true";
  const submissionName = isProjectSubmission ? "proyecto" : "examen";

  function setEmailStatus(message, mode) {
    if (!status) return;
    status.textContent = message;
    status.dataset.mode = mode || "";
  }

  function updateEmailButton() {
    emailButton.disabled = !isSignedIn || isSending;
    if (loginButton) {
      loginButton.hidden = isSignedIn;
      loginButton.disabled = isSending;
    }
  }

  updateEmailButton();

  document.addEventListener("worksheet-auth-change", (event) => {
    isSignedIn = Boolean(event.detail?.signedIn);
    signedInEmail = event.detail?.email || "";
    updateEmailButton();

    if (!isSignedIn) {
      setEmailStatus("Inicia sesión con Google para habilitar el envío.", "");
    } else if (!isSending) {
      setEmailStatus(`Sesión iniciada${signedInEmail ? `: ${signedInEmail}` : ""}.`, "success");
    }
  });

  document.addEventListener("worksheet-auth-error", (event) => {
    const code = event.detail?.code || "";
    const message = code === "auth/unauthorized-domain"
      ? "Este dominio no está autorizado en Firebase. Agrega 127.0.0.1, localhost o el dominio publicado en Authentication > Settings > Authorized domains."
      : "No se pudo iniciar sesión con Google. Revisa la configuración de Firebase Authentication.";

    isSignedIn = false;
    signedInEmail = "";
    updateEmailButton();
    setEmailStatus(message, "error");
  });

  loginButton?.addEventListener("click", () => {
    setEmailStatus("Abriendo inicio de sesión con Google...", "loading");
    document.dispatchEvent(new CustomEvent("worksheet-auth-request"));
  });

  emailButton.addEventListener("click", async () => {
    if (!isSignedIn) {
      setEmailStatus("Inicia sesión con Google antes de enviar.", "error");
      updateEmailButton();
      return;
    }

    const fields = getWorksheetFieldsDefault().filter((field) => field.name);
    const values = collectWorksheetData(fields);
    const studentName = String(values.student_name || "").trim();

    if (!studentName) {
      setEmailStatus(`Escribe el nombre del alumno antes de enviar el ${submissionName}.`, "error");
      document.querySelector("[name=\"student_name\"]")?.focus();
      return;
    }

    if (isProjectSubmission) {
      const projectLink = String(values.project_link || "").trim();
      const evidenceLink = String(values.evidence_link || "").trim();
      const submittedLinks = [projectLink, evidenceLink].filter(Boolean);
      const allowedLinkPattern = /^https:\/\/(?:www\.)?(?:tinkercad\.com|drive\.google\.com|docs\.google\.com)\//i;
      const objectiveTinkercadLinks = Array.from(
        document.querySelectorAll('input[name$="-tinkercad-link"]')
      ).map((field) => field.value.trim()).filter(Boolean);
      const tinkercadLinkPattern = /^https:\/\/(?:www\.)?tinkercad\.com\//i;
      const unansweredObjectiveQuestion = Array.from(
        document.querySelectorAll("[data-objective-required]")
      ).find((field) => !field.value.trim());

      if (unansweredObjectiveQuestion) {
        setEmailStatus("Completa todos los formatos de entrega, pruebas de código y preguntas de los objetivos antes de enviar.", "error");
        unansweredObjectiveQuestion.focus();
        return;
      }

      if (!submittedLinks.length) {
        setEmailStatus("Agrega por lo menos un enlace de Tinkercad o Drive antes de enviar el proyecto.", "error");
        document.getElementById("project-link")?.focus();
        return;
      }

      if (submittedLinks.some((link) => !allowedLinkPattern.test(link))) {
        setEmailStatus("Los enlaces deben pertenecer a Tinkercad, Google Drive o Documentos de Google.", "error");
        return;
      }

      if (objectiveTinkercadLinks.some((link) => !tinkercadLinkPattern.test(link))) {
        setEmailStatus("Los enlaces de simulación de cada objetivo deben pertenecer a Tinkercad.", "error");
        return;
      }

      const incompleteObjective = Array.from(document.querySelectorAll("[data-objective-completed]"))
        .find((field) => !field.checked);
      if (incompleteObjective) {
        setEmailStatus("Completa y marca los siete objetivos antes de enviar el proyecto.", "error");
        incompleteObjective.focus();
        return;
      }
    }

    const answers = fields.map((field) => ({
      name: field.name,
      label: getFieldLabel(field),
      value: field.type === "checkbox" ? field.checked : field.value
    }));
    const objectiveFields = Array.from(document.querySelectorAll("[data-objective-completed]"));
    const progressPercentage = objectiveFields.length
      ? Math.round((objectiveFields.filter((field) => field.checked).length / objectiveFields.length) * 100)
      : null;

    const payload = {
      worksheetKey: document.body.dataset.worksheetKey || "",
      title: document.querySelector("h1")?.textContent.trim() || document.title,
      studentName,
      groupName: values.group_name || "",
      deliveryDate: values.delivery_date || "",
      projectLink: values.project_link || "",
      evidenceLink: values.evidence_link || "",
      progressPercentage,
      signedInEmail,
      submittedAt: new Date().toISOString(),
      pageUrl: window.location.href,
      values,
      answers
    };

    isSending = true;
    updateEmailButton();
    setEmailStatus(`Enviando ${submissionName} por correo...`, "loading");

    try {
      await submitEmailWithFetch(webAppUrl, payload);
      setEmailStatus(`${isProjectSubmission ? "Proyecto" : "Examen"} enviado. Revisa tu correo para confirmar la recepción.`, "success");
    } catch (error) {
      if (error?.allowHiddenFormFallback === false) {
        console.error("El servidor rechazo el envio del examen:", error);
        setEmailStatus(`No se pudo enviar el ${submissionName}. Revisa permisos y despliegue del Apps Script.`, "error");
        return;
      }

      console.warn("No se pudo confirmar el envio con fetch; usando formulario oculto:", error);
      try {
        await submitEmailWithHiddenForm(webAppUrl, payload);
        setEmailStatus(`${isProjectSubmission ? "Proyecto" : "Examen"} enviado. Si no llega la confirmación, revisa la configuración del Apps Script.`, "success");
      } catch (fallbackError) {
        console.error("No se pudo enviar el examen:", fallbackError);
        setEmailStatus(`No se pudo enviar el ${submissionName}. Revisa conexión, permisos del Apps Script y vuelve a intentar.`, "error");
      }
    } finally {
      isSending = false;
      updateEmailButton();
    }
  });
}

function applyWorksheetData(fields, data) {
  fields.forEach((field) => {
    if (!field.name) return;
    if (field.type === "checkbox" && typeof data[field.name] === "boolean") {
      field.checked = data[field.name];
    } else if (typeof data[field.name] === "string") {
      field.value = data[field.name];
    }
  });
}

function isMeaningfulWorksheetData(data) {
  return Object.values(data || {}).some((value) => {
    if (typeof value === "string") return value.trim() !== "";
    if (typeof value === "boolean") return value;
    return false;
  });
}

function readLocalWorksheetState(storageKey) {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);

    if (parsed && typeof parsed === "object" && parsed.values && typeof parsed.values === "object") {
      return {
        values: parsed.values,
        updatedAt: Number(parsed.updatedAt) || 0
      };
    }

    if (parsed && typeof parsed === "object") {
      return {
        values: parsed,
        updatedAt: 0
      };
    }
  } catch {
    localStorage.removeItem(storageKey);
  }

  return null;
}

function writeLocalWorksheetState(storageKey, values, updatedAt = Date.now()) {
  localStorage.setItem(
    storageKey,
    JSON.stringify({
      values,
      updatedAt
    })
  );
}

async function getFirebaseServices() {
  if (!firebaseServicesPromise) {
    firebaseServicesPromise = Promise.all([
      import("https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js"),
      import("https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js")
    ]).then(async ([appModule, authModule, firestoreModule]) => {
      const app = appModule.initializeApp(FIREBASE_CONFIG);
      const auth = authModule.getAuth(app);
      await authModule.setPersistence(auth, authModule.browserLocalPersistence);

      const provider = new authModule.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      return {
        auth,
        db: firestoreModule.getFirestore(app),
        authModule,
        firestoreModule,
        provider
      };
    });
  }

  return firebaseServicesPromise;
}

function createCloudPanel(container) {
  const panel = document.createElement("section");
  panel.className = "card cloud-panel";
  panel.innerHTML = `
    <div class="cloud-panel__header">
      <div>
        <h2>Guardar y continuar después</h2>
        <p class="cloud-panel__status" data-cloud-status>Guardando solo en este dispositivo.</p>
      </div>
      <div class="button-row cloud-panel__actions">
        <button class="action-button" type="button" data-cloud-login>Entrar con Google</button>
        <button class="action-button" type="button" data-cloud-sync hidden>Guardar practica en linea</button>
        <button class="action-button action-button--secondary" type="button" data-cloud-logout hidden>Cerrar sesión</button>
      </div>
    </div>
    <p class="cloud-panel__hint" data-cloud-hint>Inicia sesión con cualquier cuenta de Google para continuar tu práctica desde otro dispositivo.</p>
    <p class="cloud-panel__help">El botón <strong>Guardar practica en linea</strong> envía tus respuestas actuales a tu cuenta para que puedas continuar después en otro equipo.</p>
  `;

  const buttonRow = container.querySelector(".button-row");
  if (buttonRow) {
    buttonRow.insertAdjacentElement("afterend", panel);
  } else {
    container.appendChild(panel);
  }

  return {
    panel,
    status: panel.querySelector("[data-cloud-status]"),
    hint: panel.querySelector("[data-cloud-hint]"),
    loginButton: panel.querySelector("[data-cloud-login]"),
    syncButton: panel.querySelector("[data-cloud-sync]"),
    logoutButton: panel.querySelector("[data-cloud-logout]")
  };
}

function createWorksheetPersistence(options) {
  const {
    worksheetKey,
    getFields = getWorksheetFieldsDefault,
    printButton = document.querySelector('[data-worksheet-action="print"]') || document.getElementById("print-worksheet"),
    resetButton = document.querySelector('[data-worksheet-action="reset"]') || document.getElementById("reset-worksheet"),
    cloudContainer = document.querySelector(".container .card"),
    onDataApplied,
    onReset
  } = options;

  if (!worksheetKey) return null;

  const getFieldsSafe = () => getFields().filter((field) => field && field.name);
  const fields = getFieldsSafe();
  if (!fields.length) return null;

  const cloudUi = cloudContainer ? createCloudPanel(cloudContainer) : null;
  let currentUser = null;
  let firebaseReady = false;
  let remoteReady = false;
  let remoteSaveTimer = null;
  let syncing = false;

  function setCloudMessage(status, hint, mode) {
    if (!cloudUi) return;

    cloudUi.status.textContent = status;
    cloudUi.hint.textContent = hint;
    cloudUi.panel.dataset.mode = mode || "";
  }

  function updateButtons() {
    document.body.dataset.googleSignedIn = currentUser ? "true" : "false";
    document.dispatchEvent(new CustomEvent("worksheet-auth-change", {
      detail: {
        signedIn: Boolean(currentUser),
        email: currentUser?.email || "",
        name: currentUser?.displayName || ""
      }
    }));

    if (!cloudUi) return;

    cloudUi.loginButton.hidden = Boolean(currentUser);
    cloudUi.logoutButton.hidden = !currentUser;
    cloudUi.syncButton.hidden = !currentUser;
    cloudUi.syncButton.disabled = !currentUser || syncing || !remoteReady;
  }

  function saveLocal() {
    const values = collectWorksheetData(getFieldsSafe());
    writeLocalWorksheetState(worksheetKey, values, Date.now());
    return values;
  }

  function applyState(values, updatedAt = Date.now()) {
    applyWorksheetData(getFieldsSafe(), values);
    writeLocalWorksheetState(worksheetKey, values, updatedAt);
    onDataApplied?.(values);
    document.dispatchEvent(new CustomEvent("worksheet-data-applied"));
  }

  async function deleteRemote() {
    if (!currentUser || !firebaseReady) return;

    try {
      const { db, firestoreModule } = await getFirebaseServices();
      const worksheetRef = firestoreModule.doc(db, "users", currentUser.uid, "worksheets", worksheetKey);
      await firestoreModule.deleteDoc(worksheetRef);
    } catch (error) {
      console.error("No se pudo borrar el progreso remoto:", error);
      setCloudMessage(
        "No se pudo borrar el progreso en la nube.",
        "Tu hoja local sí fue reiniciada. Revisa permisos de Firestore si el problema continúa.",
        "error"
      );
    }
  }

  async function pushRemote(force = false) {
    if (!currentUser || !firebaseReady || !remoteReady) return;

    const localState = readLocalWorksheetState(worksheetKey);
    if (!localState) return;

    const values = localState.values || {};
    if (!force && !isMeaningfulWorksheetData(values)) return;

    syncing = true;
    updateButtons();

    try {
      const { db, firestoreModule } = await getFirebaseServices();
      const worksheetRef = firestoreModule.doc(db, "users", currentUser.uid, "worksheets", worksheetKey);

      await firestoreModule.setDoc(
        worksheetRef,
        {
          worksheetKey,
          values,
          updatedAt: localState.updatedAt || Date.now(),
          studentName: values.student_name || "",
          groupName: values.group_name || "",
          userEmail: currentUser.email || "",
          userName: currentUser.displayName || ""
        },
        { merge: true }
      );

      setCloudMessage(
        "Practica guardada en linea con tu cuenta de Google.",
        currentUser.email || "Sesión activa",
        "connected"
      );
    } catch (error) {
      console.error("No se pudo guardar la practica en linea:", error);
      setCloudMessage(
        "No se pudo guardar la practica en linea en este momento.",
        "Tus respuestas siguen guardadas en este dispositivo. Verifica que Firestore esté habilitado y con reglas de acceso.",
        "error"
      );
    } finally {
      syncing = false;
      updateButtons();
    }
  }

  function scheduleRemoteSave() {
    if (!currentUser || !firebaseReady || !remoteReady) return;

    window.clearTimeout(remoteSaveTimer);
    remoteSaveTimer = window.setTimeout(() => {
      pushRemote(false);
    }, 900);
  }

  function handleInput() {
    saveLocal();
    scheduleRemoteSave();
  }

  function bindFieldListeners() {
    getFieldsSafe().forEach((field) => {
      field.removeEventListener("input", handleInput);
      field.addEventListener("input", handleInput);
    });
  }

  async function mergeRemoteWithLocal() {
    if (!currentUser || !firebaseReady) return;

    try {
      const { db, firestoreModule } = await getFirebaseServices();
      const worksheetRef = firestoreModule.doc(db, "users", currentUser.uid, "worksheets", worksheetKey);
      const remoteSnapshot = await firestoreModule.getDoc(worksheetRef);
      const localState = readLocalWorksheetState(worksheetKey);
      const localValues = localState?.values || {};

      remoteReady = true;
      updateButtons();

      if (!remoteSnapshot.exists()) {
        if (isMeaningfulWorksheetData(localValues)) {
          await pushRemote(true);
        } else {
          setCloudMessage(
            "Sesión iniciada. Aún no hay progreso guardado en la nube.",
            currentUser.email || "Cuenta de Google conectada",
            "connected"
          );
        }
        return;
      }

      const remoteData = remoteSnapshot.data() || {};
      const remoteValues = remoteData.values || {};
      const remoteUpdatedAt = Number(remoteData.updatedAt) || 0;
      const localUpdatedAt = Number(localState?.updatedAt) || 0;

      if (remoteUpdatedAt > localUpdatedAt || (!isMeaningfulWorksheetData(localValues) && isMeaningfulWorksheetData(remoteValues))) {
        applyState(remoteValues, remoteUpdatedAt);
      } else if (localUpdatedAt > remoteUpdatedAt && isMeaningfulWorksheetData(localValues)) {
        await pushRemote(true);
      }

      setCloudMessage(
        "Progreso conectado a tu cuenta de Google.",
        currentUser.email || "Sesión activa",
        "connected"
      );
    } catch (error) {
      console.error("No se pudo cargar el progreso remoto:", error);
      remoteReady = false;
      updateButtons();
      setCloudMessage(
        "No fue posible leer tu progreso en la nube.",
        "Tus respuestas locales siguen disponibles. Si Firestore no está configurado, el guardado en linea no funcionará.",
        "error"
      );
    }
  }

  async function startAuth() {
    try {
      const { auth, authModule, provider } = await getFirebaseServices();
      try {
        await authModule.signInWithPopup(auth, provider);
      } catch (popupError) {
        if (popupError?.code === "auth/unauthorized-domain") {
          throw popupError;
        }

        console.warn("No se pudo iniciar sesión con popup, se intentará con redirección:", popupError);
        await authModule.signInWithRedirect(auth, provider);
      }
    } catch (error) {
      console.error("No se pudo iniciar sesión con Google:", error);
      document.dispatchEvent(new CustomEvent("worksheet-auth-error", {
        detail: {
          code: error?.code || "",
          message: error?.message || ""
        }
      }));
      setCloudMessage(
        "No se pudo iniciar sesión con Google.",
        "Revisa que el dominio actual esté autorizado en Firebase Authentication.",
        "error"
      );
    }
  }

  async function signOutRemote() {
    try {
      const { auth, authModule } = await getFirebaseServices();
      await authModule.signOut(auth);
    } catch (error) {
      console.error("No se pudo cerrar la sesión:", error);
      setCloudMessage(
        "No se pudo cerrar la sesión.",
        "Intenta nuevamente.",
        "error"
      );
    }
  }

  function loadLocalOnStart() {
    const localState = readLocalWorksheetState(worksheetKey);
    if (!localState) return;
    applyWorksheetData(getFieldsSafe(), localState.values || {});
    onDataApplied?.(localState.values || {});
    document.dispatchEvent(new CustomEvent("worksheet-data-applied"));
  }

  async function initCloudSync() {
    if (!cloudUi) return;

    setCloudMessage(
      "Guardado local activo.",
      "Inicia sesión con Google para recuperar tu práctica en cualquier dispositivo.",
      "local"
    );
    updateButtons();

    cloudUi.loginButton.addEventListener("click", startAuth);
    cloudUi.logoutButton.addEventListener("click", signOutRemote);
    cloudUi.syncButton.addEventListener("click", () => pushRemote(true));

    try {
      const { auth, authModule } = await getFirebaseServices();
      firebaseReady = true;

      authModule.onAuthStateChanged(auth, async (user) => {
        currentUser = user;
        remoteReady = false;
        updateButtons();

        if (!user) {
          setCloudMessage(
            "Guardando solo en este dispositivo.",
            "Inicia sesión con Google para continuar tu práctica desde cualquier cuenta autorizada.",
            "local"
          );
          return;
        }

        setCloudMessage(
          "Cargando progreso de tu cuenta...",
          user.email || "Cuenta de Google conectada",
          "loading"
        );
        await mergeRemoteWithLocal();
      });
    } catch (error) {
      console.error("No se pudo preparar Firebase:", error);
      setCloudMessage(
        "Firebase no pudo inicializarse.",
        "Tu progreso seguirá guardándose localmente. Verifica conexión, Authentication y Firestore.",
        "error"
      );
    }
  }

  bindFieldListeners();
  loadLocalOnStart();

  document.addEventListener("worksheet-auth-request", startAuth);

  printButton?.addEventListener("click", () => {
    saveLocal();
    window.print();
  });

  resetButton?.addEventListener("click", async () => {
    getFieldsSafe().forEach((field) => {
      if (field.type === "checkbox") {
        field.checked = false;
      } else {
        field.value = "";
      }
    });
    localStorage.removeItem(worksheetKey);
    onReset?.();
    document.dispatchEvent(new CustomEvent("worksheet-reset"));
    await deleteRemote();
    setCloudMessage(
      currentUser
        ? "Hoja reiniciada. El progreso remoto también se eliminó."
        : "Hoja reiniciada en este dispositivo.",
      currentUser
        ? currentUser.email || "Cuenta de Google conectada"
        : "Puedes volver a empezar cuando quieras.",
      currentUser ? "connected" : "local"
    );
  });

  initCloudSync();

  return {
    saveNow: () => {
      saveLocal();
      scheduleRemoteSave();
    },
    resetLocal: () => {
      localStorage.removeItem(worksheetKey);
    }
  };
}

window.createWorksheetPersistence = createWorksheetPersistence;

function setupWorksheetStorage() {
  const worksheetKey = document.body.dataset.worksheetKey;
  if (!worksheetKey) return;

  createWorksheetPersistence({
    worksheetKey
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupSpecialProjectLearningSequence();
  setupCodeHighlighting();
  setupCopyableCodeBlocks();
  setupProjectSubmissionFields();
  setupImageLightbox();
  setupContentProtection();
  setupWorksheetStorage();
  setupWorksheetEmailSubmission();
});
