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
    if (!code || pre.dataset.noCopy === "true" || pre.parentElement?.classList.contains("code-block")) return;

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
    <p class="worksheet-note submission-links__note"><strong>No se pueden subir dibujos ni archivos directamente a este sitio.</strong> Realiza los dibujos, bocetos o diagramas en una hoja o en una aplicación digital. Para entregar evidencia, pega el enlace de Tinkercad o de una carpeta de Drive con acceso para cualquier persona que tenga el enlace. Debes agregar por lo menos uno.</p>
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

function setupSpecialProjectMaterials() {
  if (document.body.dataset.projectSubmission !== "true") return;

  const cards = Array.from(document.querySelectorAll(".card"));
  const materialsCard = cards.find(
    (card) => card.querySelector("h2")?.textContent.trim() === "Materiales"
  );
  const identifiedCard = cards.find(
    (card) => card.querySelector("h2")?.textContent.trim() === "Producto final identificado"
  );
  const physicalMaterials = materialsCard?.querySelector("ul");

  if (!materialsCard || !identifiedCard || !physicalMaterials) return;

  materialsCard.classList.add("project-materials");
  materialsCard.querySelector("h2").textContent = "Materiales para trabajar";

  const introduction = document.createElement("p");
  introduction.className = "project-materials__intro";
  introduction.innerHTML =
    "<strong>Revisa esta lista antes de comenzar.</strong> Puedes desarrollar las pruebas con componentes físicos o mediante simulación digital, según las indicaciones del profesor.";

  const physicalTitle = document.createElement("h3");
  physicalTitle.textContent = "Opción física";

  const digitalBlock = document.createElement("div");
  digitalBlock.className = "project-materials__digital";
  digitalBlock.innerHTML = `
    <h3>Opción digital</h3>
    <ul>
      <li>Computadora o tableta con conexión a internet</li>
      <li>Cuenta de Tinkercad para crear y guardar el circuito, cuando los componentes estén disponibles en el simulador</li>
      <li>Arduino IDE si se programará una tarjeta física</li>
      <li>Google Drive para compartir videos, fotografías, documentos o dibujos digitales mediante un enlace</li>
      <li>Aplicación de dibujo o diagramación, o una hoja y lápiz para realizar bocetos</li>
    </ul>
  `;

  const deliveryRule = document.createElement("aside");
  deliveryRule.className = "project-materials__rule";
  deliveryRule.innerHTML = `
    <strong>Regla para dibujos y archivos:</strong>
    el sitio no permite subirlos directamente. Conserva el dibujo en físico o digital, describe su contenido en el formato del objetivo y, cuando se solicite evidencia, compártelo mediante un enlace de Drive.
  `;

  materialsCard.insertBefore(introduction, physicalMaterials);
  materialsCard.insertBefore(physicalTitle, physicalMaterials);
  physicalMaterials.insertAdjacentElement("afterend", digitalBlock);
  digitalBlock.insertAdjacentElement("afterend", deliveryRule);
  identifiedCard.insertAdjacentElement("afterend", materialsCard);
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
      code: `#include <Adafruit_NeoPixel.h>

const int PIN_ARO = 6;
const int BUZZER = 5;
Adafruit_NeoPixel aro(12, PIN_ARO, NEO_GRB + NEO_KHZ800);

void mostrarColor(int rojo, int verde, int azul) {
  for (int i = 0; i < 12; i++) {
    aro.setPixelColor(i, aro.Color(rojo, verde, azul));
  }
  aro.show();
}

void estadoReposo() {
  mostrarColor(0, 0, 80);
  noTone(BUZZER);
}

void estadoActividad() {
  mostrarColor(0, 100, 0);
  tone(BUZZER, 500, 100);
}

void estadoAlerta() {
  mostrarColor(150, 50, 0);
  tone(BUZZER, 900, 150);
}

void estadoPeligro() {
  mostrarColor(180, 0, 0);
  tone(BUZZER, 1500, 300);
}

void setup() {
  aro.begin();
  aro.clear();
  aro.show();
  pinMode(BUZZER, OUTPUT);
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
      expected: "Los cuatro estados se ejecutan en orden con colores y sonidos diferentes."
    },
    {
      title: "Integrar medición, decisión y respuesta",
      instruction: "Organiza loop en tres pasos visibles: medir, mostrar y ejecutar una de las funciones de efectos ya probadas.",
      code: `#include <Adafruit_NeoPixel.h>

const int PIN_ARO = 6;
const int BUZZER = 5;
const int TRIG = 9;
const int ECHO = 10;
Adafruit_NeoPixel aro(12, PIN_ARO, NEO_GRB + NEO_KHZ800);

int medirDistancia() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);

  long duracion = pulseIn(ECHO, HIGH, 30000);
  if (duracion == 0) return -1;
  return duracion / 58;
}

void mostrarColor(int rojo, int verde, int azul) {
  for (int i = 0; i < 12; i++) {
    aro.setPixelColor(i, aro.Color(rojo, verde, azul));
  }
  aro.show();
}

void ejecutarEstado(int valor) {
  if (valor < 0) {
    Serial.println("SIN LECTURA");
    mostrarColor(0, 0, 0);
    noTone(BUZZER);
  } else if (valor > 50) {
    Serial.println("REPOSO");
    mostrarColor(0, 0, 80);
    noTone(BUZZER);
  } else if (valor > 25) {
    Serial.println("ACTIVIDAD");
    mostrarColor(0, 100, 0);
    tone(BUZZER, 500, 100);
  } else if (valor > 10) {
    Serial.println("ALERTA");
    mostrarColor(150, 50, 0);
    tone(BUZZER, 900, 150);
  } else {
    Serial.println("PELIGRO");
    mostrarColor(180, 0, 0);
    tone(BUZZER, 1500, 300);
  }
}

void setup() {
  Serial.begin(9600);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(BUZZER, OUTPUT);
  aro.begin();
  aro.clear();
  aro.show();
}

void loop() {
  int distancia = medirDistancia();
  Serial.print("Distancia: ");
  Serial.println(distancia);
  ejecutarEstado(distancia);
  delay(500);
}`,
      expected: "Cada lectura selecciona un solo estado y activa el color y sonido correspondientes."
    },
    {
      title: "Reducir lecturas inestables con un promedio",
      instruction: "Agrega una función de mejora sin mezclarla con los efectos. El promedio debe ignorar lecturas inválidas del sensor.",
      code: `const int TRIG = 9;
const int ECHO = 10;

int medirDistancia() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);

  long duracion = pulseIn(ECHO, HIGH, 30000);
  if (duracion == 0) return -1;
  return duracion / 58;
}

int distanciaPromedio() {
  long suma = 0;
  int validas = 0;
  const int MUESTRAS = 5;

  for (int i = 0; i < MUESTRAS; i++) {
    int lectura = medirDistancia();
    if (lectura >= 0) {
      suma += lectura;
      validas++;
    }
    delay(20);
  }

  if (validas == 0) return -1;
  return suma / validas;
}

void setup() {
  Serial.begin(9600);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
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
  abrirOjos();
  delay(2000);
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

void parpadeoDesfasado() {
  izquierdo.write(95);
  delay(100);
  derecho.write(85);
  delay(180);
  abrirOjos();
}

void modoAlerta() {
  parpadeoDesfasado();
  delay(300);
  parpadeoDesfasado();
}

void setup() {
  izquierdo.attach(9);
  derecho.attach(10);
  abrirOjos();
  delay(1000);
  parpadeoNatural();
  delay(1000);
  modoAlerta();
}

void loop() {
}`,
      expected: "Los dos comportamientos pueden ejecutarse por separado y modoAlerta reutiliza otra función."
    },
    {
      title: "Programar intervalos sin detener toda la lógica",
      instruction: "Prueba millis para decidir cuándo parpadear. Esta estructura permite añadir después otros comportamientos sin llenar loop de delays.",
      code: `#include <Servo.h>

Servo izquierdo;
Servo derecho;

unsigned long cambioAnterior = 0;
unsigned long proximoParpadeo = 3000;
bool ojosCerrados = false;

void abrirOjos() {
  izquierdo.write(30);
  derecho.write(150);
  ojosCerrados = false;
}

void cerrarOjos() {
  izquierdo.write(95);
  derecho.write(85);
  ojosCerrados = true;
}

void setup() {
  izquierdo.attach(9);
  derecho.attach(10);
  randomSeed(analogRead(A0));
  abrirOjos();
}

void loop() {
  unsigned long ahora = millis();

  if (!ojosCerrados && ahora >= proximoParpadeo) {
    cerrarOjos();
    cambioAnterior = ahora;
  }

  if (ojosCerrados && ahora - cambioAnterior >= 180) {
    abrirOjos();
    proximoParpadeo = ahora + random(3000, 7000);
  }
}`,
      expected: "Los dos servos parpadean juntos con intervalos variables sin detener el programa con delays largos."
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
      code: `#include <Servo.h>

const int TRIG = 9;
const int ECHO = 10;
const int PIN_SERVO = 6;
const int LED = 4;
const int BUZZER = 8;
const int UMBRAL = 25;
const int MARGEN_REINICIO = 10;

Servo brazo;
bool brazoActivado = false;

void activarBrazo() {
  digitalWrite(LED, HIGH);
  tone(BUZZER, 900, 250);
  brazo.write(110);
  delay(500);
  brazo.write(20);
  digitalWrite(LED, LOW);
}

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
  pinMode(LED, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  brazo.attach(PIN_SERVO);
  brazo.write(20);
}

void loop() {
  long distancia = medirDistancia();
  Serial.println(distancia);

  if (distancia > 0 && distancia <= UMBRAL && !brazoActivado) {
    brazoActivado = true;
    activarBrazo();
  }

  if (distancia > UMBRAL + MARGEN_REINICIO) {
    brazoActivado = false;
  }

  delay(100);
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
      code: `#include <Servo.h>

Servo huevo;
const int CERRADO = 0;
const int APERTURA = 60;

void realizarEmpujes() {
  huevo.write(10);
  delay(200);
  huevo.write(CERRADO);
  delay(200);
  huevo.write(15);
  delay(250);
  huevo.write(CERRADO);
  delay(300);
  huevo.write(25);
  delay(300);
}

void abrirHuevo() {
  huevo.write(APERTURA);
  delay(1000);
}

void cerrarHuevo() {
  huevo.write(CERRADO);
  delay(500);
}

void cicloHuevo() {
  realizarEmpujes();
  abrirHuevo();
  cerrarHuevo();
}

void setup() {
  huevo.attach(9);
  huevo.write(CERRADO);
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
      code: `#include <Servo.h>

Servo huevo;
int numeroCiclo = 0;

void cicloHuevo() {
  huevo.write(15);
  delay(250);
  huevo.write(0);
  delay(250);
  huevo.write(25);
  delay(300);
  huevo.write(60);
  delay(1000);
  huevo.write(0);
  delay(500);
}

void setup() {
  Serial.begin(9600);
  huevo.attach(9);
  huevo.write(0);
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
  if (distancia <= 0) {
    Serial.println("LECTURA INVALIDA");
  } else if (distancia <= ALERTA) {
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
const int TRIG = 9;
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

void medirEnAngulo(int angulo) {
  radar.write(angulo);
  delay(120);
  long distancia = medirDistancia();
  Serial.print("Angulo: ");
  Serial.print(angulo);
  Serial.print(" | Distancia: ");
  Serial.println(distancia);
}

void barridoIda() {
  for (int angulo = 15; angulo <= 165; angulo += 5) {
    medirEnAngulo(angulo);
  }
}

void setup() {
  Serial.begin(9600);
  radar.attach(6);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
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
  bool valida = distancia > 0;
  bool cerca = valida && distancia <= 30;
  digitalWrite(LED_ROJO, cerca ? HIGH : LOW);
  digitalWrite(LED_VERDE, valida && !cerca ? HIGH : LOW);

  if (valida && distancia <= 10) {
    tone(BUZZER, 1800, 100);
  } else {
    noTone(BUZZER);
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
      instruction: "Evita dos bloques casi iguales. Una función recibe inicio, fin y paso, mide la distancia y actualiza las señales durante ambas direcciones.",
      code: `#include <Servo.h>

Servo radar;
const int TRIG = 9;
const int ECHO = 10;
const int LED_ROJO = 3;
const int LED_VERDE = 4;
const int BUZZER = 8;

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

void actualizarSenales(long distancia) {
  bool valida = distancia > 0;
  bool detectado = valida && distancia <= 30;

  digitalWrite(LED_ROJO, detectado ? HIGH : LOW);
  digitalWrite(LED_VERDE, valida && !detectado ? HIGH : LOW);

  if (valida && distancia <= 10) {
    tone(BUZZER, 1800, 100);
  } else {
    noTone(BUZZER);
  }
}

void medirEnAngulo(int angulo) {
  radar.write(angulo);
  delay(120);
  long distancia = medirDistancia();
  Serial.print("Angulo: ");
  Serial.print(angulo);
  Serial.print(" | Distancia: ");
  Serial.println(distancia);
  actualizarSenales(distancia);
}

void barrer(int inicio, int fin, int paso) {
  for (int angulo = inicio;
       paso > 0 ? angulo <= fin : angulo >= fin;
       angulo += paso) {
    medirEnAngulo(angulo);
  }
}

void setup() {
  Serial.begin(9600);
  radar.attach(6);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(LED_ROJO, OUTPUT);
  pinMode(LED_VERDE, OUTPUT);
  pinMode(BUZZER, OUTPUT);
}

void loop() {
  barrer(15, 165, 5);
  barrer(165, 15, -5);
  delay(1000);
}`,
      expected: "Una sola función realiza ida y regreso, registra cada lectura y mantiene activas las señales de detección."
    }
  ]
};

const SPECIAL_PROJECT_OBJECTIVE_REQUIREMENTS = {
  "proyecto-especial-contenedor": [
    ["1 Arduino Uno", "1 cable USB"],
    ["1 Arduino Uno", "1 cable USB"],
    ["1 Arduino Uno", "1 sensor ultrasónico HC-SR04", "1 aro NeoPixel de 12 LEDs", "1 buzzer pasivo", "1 protoboard", "Cables Dupont", "1 cable USB"],
    ["1 Arduino Uno", "1 sensor ultrasónico HC-SR04", "1 aro NeoPixel de 12 LEDs", "1 buzzer pasivo", "1 protoboard", "Cables Dupont", "1 cable USB"],
    ["1 Arduino Uno", "1 aro NeoPixel de 12 LEDs", "1 buzzer pasivo", "1 protoboard", "Cables Dupont", "1 cable USB"],
    ["1 Arduino Uno", "1 sensor ultrasónico HC-SR04", "1 aro NeoPixel de 12 LEDs", "1 buzzer pasivo", "1 protoboard", "Cables Dupont", "1 cable USB"],
    ["1 Arduino Uno", "1 sensor ultrasónico HC-SR04", "1 aro NeoPixel de 12 LEDs", "1 buzzer pasivo", "1 protoboard", "Cables Dupont", "1 cable USB", "Fuente externa de 5 V si el aro se usa con brillo alto"]
  ],
  "proyecto-especial-cabeza-dinosaurio": [
    ["1 Arduino Uno", "1 cable USB"],
    ["1 Arduino Uno", "1 cable USB"],
    ["1 Arduino Uno", "2 servomotores SG90 o similares (se prueba uno a la vez)", "1 protoboard", "Cables Dupont", "1 cable USB", "Mecanismo de párpados u ojos"],
    ["1 Arduino Uno", "2 servomotores SG90 o similares", "1 protoboard", "Cables Dupont", "1 cable USB", "Mecanismo de párpados u ojos", "Fuente externa regulada de 5 V para los servos"],
    ["1 Arduino Uno", "2 servomotores SG90 o similares", "Mecanismo de párpados u ojos", "1 protoboard", "Cables Dupont", "1 cable USB", "Fuente externa regulada de 5 V para los servos"],
    ["1 Arduino Uno", "2 servomotores SG90 o similares", "Mecanismo de párpados u ojos", "1 protoboard", "Cables Dupont", "1 cable USB", "Fuente externa regulada de 5 V para los servos"],
    ["1 Arduino Uno", "2 servomotores SG90 o similares", "Mecanismo de párpados u ojos", "1 protoboard", "Cables Dupont", "1 cable USB", "Fuente externa regulada de 5 V para los servos"]
  ],
  "proyecto-especial-brazo-dinosaurio": [
    ["1 Arduino Uno", "1 cable USB"],
    ["1 Arduino Uno", "1 cable USB"],
    ["1 Arduino Uno", "1 sensor ultrasónico HC-SR04", "1 servomotor SG90, MG90S o similar", "1 LED rojo", "1 resistencia de 220 ohms", "1 buzzer pasivo", "1 protoboard", "Cables Dupont", "1 cable USB", "Estructura mecánica ligera del brazo"],
    ["1 Arduino Uno", "1 sensor ultrasónico HC-SR04", "1 servomotor SG90, MG90S o similar", "1 LED rojo", "1 resistencia de 220 ohms", "1 buzzer pasivo", "1 protoboard", "Cables Dupont", "1 cable USB"],
    ["1 Arduino Uno", "1 servomotor SG90, MG90S o similar", "1 LED rojo", "1 resistencia de 220 ohms", "1 buzzer pasivo", "Estructura mecánica ligera del brazo", "1 protoboard", "Cables Dupont", "1 cable USB"],
    ["1 Arduino Uno", "1 sensor ultrasónico HC-SR04", "1 servomotor SG90, MG90S o similar", "1 LED rojo", "1 resistencia de 220 ohms", "1 buzzer pasivo", "1 protoboard", "Cables Dupont", "1 cable USB", "Estructura mecánica ligera del brazo"],
    ["1 Arduino Uno", "1 sensor ultrasónico HC-SR04", "1 servomotor SG90, MG90S o similar", "1 LED rojo", "1 resistencia de 220 ohms", "1 buzzer pasivo", "1 protoboard", "Cables Dupont", "1 cable USB", "Estructura mecánica ligera del brazo", "Fuente externa regulada de 5 V si el servo lo requiere"]
  ],
  "proyecto-especial-huevo-dinosaurio": [
    ["1 Arduino Uno", "1 cable USB"],
    ["1 Arduino Uno", "1 cable USB"],
    ["1 Arduino Uno", "1 servomotor SG90, MG90S o similar", "1 protoboard", "Cables Dupont", "1 cable USB", "Huevo o estructura mecánica con tapa móvil"],
    ["1 Arduino Uno", "1 servomotor SG90, MG90S o similar", "1 protoboard", "Cables Dupont", "1 cable USB", "Pieza ligera de prueba"],
    ["1 Arduino Uno", "1 servomotor SG90, MG90S o similar", "1 protoboard", "Cables Dupont", "1 cable USB", "Tapa móvil ligera"],
    ["1 Arduino Uno", "1 servomotor SG90, MG90S o similar", "Huevo con tapa móvil", "1 protoboard", "Cables Dupont", "1 cable USB"],
    ["1 Arduino Uno", "1 servomotor SG90, MG90S o similar", "Huevo con tapa móvil", "1 protoboard", "Cables Dupont", "1 cable USB", "Fuente externa regulada de 5 V si el servo lo requiere"]
  ],
  "proyecto-especial-radar": [
    ["1 Arduino Uno", "1 cable USB"],
    ["1 Arduino Uno", "1 cable USB"],
    ["1 Arduino Uno", "1 sensor ultrasónico HC-SR04", "1 servomotor SG90 o similar", "1 LED rojo", "1 LED verde", "2 resistencias de 220 ohms", "1 buzzer pasivo", "1 protoboard", "Cables Dupont", "1 cable USB", "Base móvil del radar"],
    ["1 Arduino Uno", "1 sensor ultrasónico HC-SR04", "1 servomotor SG90 o similar", "1 protoboard", "Cables Dupont", "1 cable USB"],
    ["1 Arduino Uno", "1 sensor ultrasónico HC-SR04", "1 servomotor SG90 o similar", "Base móvil del radar", "1 protoboard", "Cables Dupont", "1 cable USB"],
    ["1 Arduino Uno", "1 sensor ultrasónico HC-SR04", "1 servomotor SG90 o similar", "1 LED rojo", "1 LED verde", "2 resistencias de 220 ohms", "1 buzzer pasivo", "1 protoboard", "Cables Dupont", "1 cable USB", "Base móvil del radar"],
    ["1 Arduino Uno", "1 sensor ultrasónico HC-SR04", "1 servomotor SG90 o similar", "1 LED rojo", "1 LED verde", "2 resistencias de 220 ohms", "1 buzzer pasivo", "1 protoboard", "Cables Dupont", "1 cable USB", "Base móvil del radar", "Fuente externa regulada de 5 V si el servo lo requiere"]
  ]
};

const SPECIAL_PROJECT_PEDAGOGY = {
  "proyecto-especial-contenedor": {
    order: 1,
    title: "Contenedor",
    learn: "Aprenderás a convertir una distancia en una señal fácil de entender mediante colores, movimientos de luz y sonidos.",
    build: "Construirás un contenedor interactivo con cuatro estados: reposo, actividad, alerta y peligro.",
    future: "En el Escape Room servirá como una alarma que reacciona cuando el jugador se acerca a una zona protegida.",
    importance: "Esta parte comunica al jugador si está lejos, acercándose o entrando en peligro. Sin ella, el contenedor no reaccionaría y no daría pistas sobre lo que sucede.",
    codeReaction: "la distancia medida cambie el color del aro y el sonido del buzzer",
    role: "sistema de alarma y proximidad",
    context: {
      paragraphs: [
        "En muchos videojuegos y películas, una zona protegida cambia de color o produce sonidos cuando alguien se acerca. Esas señales permiten saber si todo está tranquilo o si existe peligro, incluso antes de ver directamente el problema.",
        "El contenedor del Escape Room funcionará de forma parecida. Un sensor ultrasónico será como una regla invisible: enviará una señal, esperará su regreso y calculará qué tan cerca está el jugador. Después, las luces y los sonidos comunicarán reposo, actividad, alerta o peligro.",
        "Esta pieza será útil para proteger una pista, advertir que un objeto no debe tocarse todavía o indicar que el jugador entró en una zona importante de la misión."
      ],
      choice: {
        question: "Según la lectura, ¿con qué se compara el sensor ultrasónico?",
        options: ["Con una regla invisible", "Con una pantalla", "Con una cerradura"],
        answer: "Con una regla invisible"
      },
      trueFalse: "Las luces y los sonidos permiten comunicar un estado sin explicar todo con palabras.",
      fill: "Completa: el contenedor podrá comunicar reposo, actividad, alerta o ______.",
      open: "¿En qué parte de tu Escape Room colocarías el contenedor y qué debería comunicar al jugador?"
    },
    deliverables: [
      "La hoja completa con los siete objetivos marcados.",
      "El enlace de Tinkercad del circuito y código, si utilizaste simulador.",
      "Un enlace de Drive con un video donde se observen los cuatro estados.",
      "Una explicación de qué distancia activa reposo, actividad, alerta y peligro.",
      "Las tablas de pruebas, problemas encontrados y mejoras realizadas."
    ],
    checks: {
      choice: {
        question: "¿Qué componente le informa al programa qué tan cerca está el jugador?",
        options: ["El sensor ultrasónico", "El aro NeoPixel", "El buzzer"],
        answer: "El sensor ultrasónico"
      },
      trueFalse: "El aro NeoPixel y el buzzer ayudan a que el jugador comprenda el nivel de peligro.",
      fill: "Completa: primero el sensor mide la ______ y después el programa selecciona un estado.",
      match: [
        ["Sensor ultrasónico", "Mide la distancia"],
        ["Aro NeoPixel y buzzer", "Comunican el nivel de peligro"]
      ]
    }
  },
  "proyecto-especial-cabeza-dinosaurio": {
    order: 2,
    title: "Cabeza dinosaurio",
    learn: "Aprenderás a controlar dos servomotores y a usar tiempos distintos para crear movimientos que parezcan naturales.",
    build: "Construirás ojos o párpados que parpadean y cambian a un modo de alerta.",
    future: "En el Escape Room hará que el dinosaurio parezca vivo y reaccione durante la aventura.",
    importance: "El movimiento de los ojos crea suspenso y ayuda a contar que el dinosaurio despertó o detectó algo. Sin esta parte, la cabeza permanecería inmóvil y perdería gran parte de su efecto.",
    codeReaction: "los dos ojos se abran, se cierren y cambien al modo de alerta",
    role: "animación de la criatura",
    context: {
      paragraphs: [
        "Los personajes de películas, videojuegos y parques temáticos parecen vivos cuando realizan movimientos pequeños y creíbles. Un parpadeo, una mirada o una pausa pueden comunicar calma, sorpresa o peligro sin utilizar palabras.",
        "La cabeza de dinosaurio usará dos servomotores para mover sus ojos o párpados. Los ángulos indicarán hasta dónde se moverá cada pieza y las pausas decidirán el ritmo. Si todas las pausas fueran idénticas, el movimiento parecería una máquina repetitiva.",
        "Dentro del Escape Room, los ojos podrán despertar cuando avance la historia o cambiar a un modo de alerta cuando el jugador active una pista."
      ],
      choice: {
        question: "¿Qué ayuda a que un parpadeo parezca más natural?",
        options: ["Variar algunas pausas", "Mover un solo cable", "Usar siempre el mismo ángulo para todo"],
        answer: "Variar algunas pausas"
      },
      trueFalse: "Los ángulos indican posiciones y las pausas ayudan a controlar el ritmo.",
      fill: "Completa: los movimientos pequeños pueden comunicar emociones sin utilizar ______.",
      open: "¿En qué momento de la aventura deberían cambiar los ojos al modo de alerta?"
    },
    deliverables: [
      "La hoja completa con los siete objetivos marcados.",
      "Una tabla con los ángulos seguros de cada ojo.",
      "El enlace de Tinkercad, si la prueba se realizó en simulador.",
      "Un enlace de Drive con un video del parpadeo natural y del modo de alerta.",
      "El boceto del mecanismo y una lista de los ajustes finales."
    ],
    checks: {
      choice: {
        question: "¿Por qué se prueban los servos uno por uno antes de mover los dos ojos?",
        options: ["Para encontrar ángulos seguros", "Para cambiar el color de los ojos", "Para medir distancias"],
        answer: "Para encontrar ángulos seguros"
      },
      trueFalse: "Un parpadeo natural siempre debe repetirse con exactamente la misma pausa.",
      fill: "Completa: los valores de apertura y cierre deben ajustarse al ______ construido.",
      match: [
        ["Servomotores", "Mueven los ojos o párpados"],
        ["Ángulos y pausas", "Definen la posición y el ritmo"]
      ]
    }
  },
  "proyecto-especial-brazo-dinosaurio": {
    order: 3,
    title: "Brazo dinosaurio",
    learn: "Aprenderás a usar un sensor para activar una reacción mecánica de manera controlada y segura.",
    build: "Construirás un brazo que se mueve, enciende una luz y produce un sonido cuando alguien se acerca.",
    future: "En el Escape Room funcionará como una sorpresa o advertencia que se activa por proximidad.",
    importance: "Esta parte convierte la presencia del jugador en una reacción visible. Sin el sensor y la secuencia de reinicio, el brazo tendría que activarse manualmente o podría moverse sin control.",
    codeReaction: "el brazo reaccione una sola vez cuando alguien se acerque y vuelva a prepararse al alejarse",
    role: "reacción mecánica de sorpresa",
    context: {
      paragraphs: [
        "Las puertas automáticas, las barreras de estacionamiento y algunas figuras de parques temáticos reaccionan cuando detectan que una persona se acerca. Primero reciben información de un sensor y después realizan un movimiento.",
        "El brazo de dinosaurio seguirá esa misma idea: permanecerá quieto, detectará cercanía y realizará una reacción con movimiento, luz y sonido. También necesitará una regla de reinicio para no repetir la acción sin control mientras alguien permanece frente al sensor.",
        "En el Escape Room, el brazo puede sorprender al jugador o advertirle que llegó a una zona especial. El movimiento debe verse claramente, pero siempre mantenerse fuera de su alcance."
      ],
      choice: {
        question: "¿Por qué el brazo necesita una regla de reinicio?",
        options: ["Para evitar activaciones continuas", "Para cambiar el tamaño del Arduino", "Para apagar la computadora"],
        answer: "Para evitar activaciones continuas"
      },
      trueFalse: "Una reacción sorprendente también debe respetar límites de seguridad.",
      fill: "Completa: primero el sensor detecta cercanía y después el brazo realiza un ______.",
      open: "¿Cómo lograrías que el brazo sorprenda al jugador sin ponerlo en riesgo?"
    },
    deliverables: [
      "La hoja completa con los siete objetivos marcados.",
      "El boceto del brazo y tres reglas de seguridad.",
      "El enlace de Tinkercad, si utilizaste simulador.",
      "Un enlace de Drive con tres activaciones completas del brazo.",
      "Las distancias, ángulos, tiempos y mejoras finales registrados."
    ],
    checks: {
      choice: {
        question: "¿Qué debe ocurrir para que el brazo quede listo después de activarse?",
        options: ["El jugador debe alejarse", "El LED debe cambiar de color", "El Arduino debe desconectarse"],
        answer: "El jugador debe alejarse"
      },
      trueFalse: "La zona de movimiento debe quedar fuera del alcance de los jugadores.",
      fill: "Completa: el sensor detecta la cercanía y el ______ mueve el brazo.",
      match: [
        ["Sensor ultrasónico", "Detecta que alguien se acercó"],
        ["Servomotor", "Mueve el brazo"]
      ]
    }
  },
  "proyecto-especial-huevo-dinosaurio": {
    order: 4,
    title: "Huevo dinosaurio",
    learn: "Aprenderás a contar una pequeña historia usando posiciones, movimientos y pausas de un servomotor.",
    build: "Construirás una secuencia de empujes, apertura y cierre para simular que algo intenta salir del huevo.",
    future: "En el Escape Room será un efecto animado que aumentará el misterio de la aventura.",
    importance: "El orden y la intensidad de los movimientos permiten que el jugador entienda la eclosión. Sin una secuencia planeada, la tapa solo se movería sin contar una historia clara.",
    codeReaction: "el huevo realice empujes pequeños, una apertura fuerte y un cierre en el orden correcto",
    role: "secuencia animada de eclosión",
    context: {
      paragraphs: [
        "Una animación cuenta una historia al ordenar movimientos y pausas. En un videojuego, un cofre puede temblar antes de abrirse; en una película, un huevo puede moverse varias veces antes de romperse. El orden permite anticipar que algo importante está por ocurrir.",
        "El huevo de dinosaurio utilizará un servomotor para crear esa historia. Hará empujes pequeños, una apertura más amplia, una pausa y un cierre. Los ángulos definirán las posiciones y los tiempos decidirán si la escena se siente lenta, rápida o emocionante.",
        "Dentro del Escape Room, la eclosión puede revelar una pista, marcar el inicio de una nueva etapa o aumentar el misterio de la aventura."
      ],
      choice: {
        question: "¿Qué permite que los movimientos del huevo cuenten una historia?",
        options: ["Su orden y sus pausas", "El color del cable USB", "El nombre del archivo"],
        answer: "Su orden y sus pausas"
      },
      trueFalse: "La apertura principal debe distinguirse de los empujes pequeños.",
      fill: "Completa: los ángulos controlan posiciones y los tiempos controlan el ______.",
      open: "¿Qué pista podría revelar el huevo cuando termine de abrirse?"
    },
    deliverables: [
      "La hoja completa con los siete objetivos marcados.",
      "Las viñetas, la tabla de movimientos y el boceto del mecanismo.",
      "El enlace de Tinkercad, si utilizaste simulador.",
      "Un enlace de Drive con un video del ciclo completo.",
      "El registro de cinco ciclos, problemas y correcciones."
    ],
    checks: {
      choice: {
        question: "¿Qué movimiento debe comunicar el momento principal de la eclosión?",
        options: ["La apertura amplia", "El regreso a cero", "Una pausa sin movimiento"],
        answer: "La apertura amplia"
      },
      trueFalse: "Conviene probar primero con una pieza ligera antes de colocar la tapa final.",
      fill: "Completa: los ángulos indican posiciones y los ______ indican cuánto espera el programa.",
      match: [
        ["Ángulo", "Indica una posición del mecanismo"],
        ["Pausa", "Controla el ritmo de la historia"]
      ]
    }
  },
  "proyecto-especial-radar": {
    order: 5,
    title: "Radar",
    learn: "Aprenderás a combinar dirección y distancia para localizar objetos en diferentes partes de un área.",
    build: "Construirás un radar que barre de un lado a otro y produce alertas visuales y sonoras.",
    future: "En el Escape Room funcionará como detector, sistema de seguridad o pista para localizar un objeto.",
    importance: "El radar permite saber no solo si hay algo cerca, sino también en qué dirección se encuentra. Sin el barrido, el sensor observaría únicamente un punto fijo.",
    codeReaction: "el sensor recorra varios ángulos, mida distancias y active alertas",
    role: "detector y pista de localización",
    context: {
      paragraphs: [
        "En algunos videojuegos aparece un mapa que indica en qué dirección se encuentra un objeto. Los murciélagos también pueden calcular distancias mediante sonidos que rebotan. Un radar combina ideas parecidas para explorar un área y localizar objetos.",
        "Nuestro radar moverá un sensor ultrasónico con un servomotor. El ángulo indicará hacia dónde está mirando y la distancia mostrará qué tan lejos se encuentra el objeto. Con un solo dato no sería posible ubicarlo correctamente.",
        "En el Escape Room, el radar puede funcionar como sistema de seguridad, detector de una pieza escondida o pista que ayude al jugador a buscar en la dirección correcta."
      ],
      choice: {
        question: "¿Qué información indica hacia dónde está mirando el radar?",
        options: ["El ángulo", "El color del LED", "El volumen del buzzer"],
        answer: "El ángulo"
      },
      trueFalse: "Para localizar mejor un objeto se necesitan dirección y distancia.",
      fill: "Completa: el servomotor cambia la dirección y el sensor mide la ______.",
      open: "¿Qué objeto o pista podría buscar el jugador con ayuda del radar?"
    },
    deliverables: [
      "La hoja completa con los siete objetivos marcados.",
      "El dibujo de ángulos, el diagrama de flujo y el boceto de la base.",
      "El enlace de Tinkercad, si utilizaste simulador.",
      "Un enlace de Drive con el video del barrido y el monitor serial.",
      "El mapa de pruebas con ángulos, distancias y una mejora aplicada."
    ],
    checks: {
      choice: {
        question: "¿Qué dos datos necesita el radar para ubicar mejor un objeto?",
        options: ["Ángulo y distancia", "Color y sonido", "Tiempo y temperatura"],
        answer: "Ángulo y distancia"
      },
      trueFalse: "El sensor debe medir inmediatamente, antes de que el servo llegue a la nueva posición.",
      fill: "Completa: el servo cambia la dirección y el sensor mide la ______.",
      match: [
        ["Servomotor", "Cambia el ángulo del sensor"],
        ["Sensor ultrasónico", "Mide la distancia al objeto"]
      ]
    }
  }
};

const SPECIAL_PROJECT_PHASE_GUIDE = [
  {
    title: "Investigar",
    purpose: "Primero observarás ejemplos y descubrirás qué comportamiento debe imitar el proyecto.",
    contribution: "Esta investigación te ayuda a decidir cómo debe verse o sentirse el efecto."
  },
  {
    title: "Planear",
    purpose: "Ordenarás las acciones antes de conectar o programar.",
    contribution: "El plan será el mapa que seguirás para no construir al azar."
  },
  {
    title: "Diseñar",
    purpose: "Dibujarás componentes, conexiones y partes móviles.",
    contribution: "El diseño muestra dónde irá cada pieza dentro del Escape Room."
  },
  {
    title: "Probar por partes",
    purpose: "Comprobarás cada componente por separado.",
    contribution: "Así podrás encontrar errores pequeños antes de unir todo el sistema."
  },
  {
    title: "Construir el comportamiento",
    purpose: "Crearás la acción principal con movimientos, luces o sonidos.",
    contribution: "Aquí aparece por primera vez el efecto que verá el jugador."
  },
  {
    title: "Integrar",
    purpose: "Unirás entrada, decisión y respuesta en un solo sistema.",
    contribution: "La pieza comenzará a reaccionar automáticamente como parte del Escape Room."
  },
  {
    title: "Mejorar",
    purpose: "Repetirás pruebas y corregirás seguridad, claridad y estabilidad.",
    contribution: "La pieza quedará lista para usarse varias veces durante la presentación."
  }
];

function createObjectiveRequirements(requirements) {
  const block = document.createElement("div");
  block.className = "objective-requirements";
  block.innerHTML = `
    <h3>Antes de comenzar: materiales para este objetivo</h3>
    <p>Prepara los materiales de la modalidad con la que trabajarás.</p>
    <div class="objective-requirements__options">
      <div>
        <h4>Trabajo físico</h4>
        <ul>
          ${requirements.map((requirement) => `<li>${requirement}</li>`).join("")}
        </ul>
      </div>
      <div>
        <h4>Trabajo digital</h4>
        <ul>
          <li>Computadora o tableta con conexión a internet</li>
          <li>Tinkercad Circuits, cuando la prueba pueda simularse</li>
          <li>Arduino IDE, si se programará una tarjeta física</li>
          <li>Hoja y lápiz o aplicación de dibujo para bocetos y diagramas</li>
          <li>Google Drive para compartir evidencias mediante un enlace</li>
        </ul>
      </div>
    </div>
  `;
  return block;
}

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
      <li><strong>Prepara tu espacio.</strong> Reúne los componentes indicados al inicio de este objetivo. Ten abierto este sitio y Arduino IDE o Tinkercad; todavía no intentes terminar todo el proyecto.</li>
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
      "Componentes o partes que incluye tu dibujo físico o digital",
      "Ejemplo: sensor, servo, tapa, punto de giro, cables..."
    );
    formContent += createObjectiveField(
      objectiveNumber,
      "diagram-connections",
      "Describe las conexiones, posiciones, medidas o flechas de tu dibujo",
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
    ${/diagrama|boceto|dibujo|viñeta|mapa/.test(normalized) ? `
      <p class="worksheet-note">
        Realiza el dibujo en una hoja o aplicación digital. No se sube directamente al sitio:
        descríbelo en este formato y usa el enlace de Drive de la parte superior si debes mostrarlo al profesor.
      </p>
    ` : ""}
    ${formContent}
  `;
  return block;
}

function createSpecialProjectOverview(project) {
  const percentage = project.order * 20;
  const completedBlocks = "█".repeat(project.order * 2);
  const pendingBlocks = "░".repeat(10 - project.order * 2);
  const projectRoute = Object.values(SPECIAL_PROJECT_PEDAGOGY).sort((a, b) => a.order - b.order);
  const previousProjects = projectRoute.filter((item) => item.order < project.order);
  const futureProjects = projectRoute.filter((item) => item.order > project.order);
  const previousSummary = previousProjects.length
    ? `Ya construiste ${previousProjects.map((item) => `<strong>${item.title}</strong> (${item.role})`).join(", ")}.`
    : "Esta es la primera pieza física del Escape Room. Ya existe el plan general de la aventura y ahora comenzarás a construir sus mecanismos interactivos.";
  const block = document.createElement("section");
  block.className = "card escape-mission-overview";
  block.innerHTML = `
    <div class="escape-project-progress">
      <div>
        <span class="escape-project-progress__eyebrow">Proyecto Escape Room</span>
        <strong>${completedBlocks}${pendingBlocks} ${percentage}% del recorrido</strong>
      </div>
      <span class="escape-project-progress__badge">Misión ${project.order} de 5</span>
    </div>
    <p class="escape-project-progress__explanation">
      Esta práctica construye el <strong>${project.role}</strong>. Al terminarla, habrás completado una parte importante del Escape Room final.
    </p>

    <nav class="escape-project-route" aria-label="Ruta de construcción del Escape Room">
      <h2>Ruta del proyecto Escape Room</h2>
      <ol>
        ${projectRoute.map((item) => {
          const state = item.order < project.order ? "completed" : item.order === project.order ? "current" : "pending";
          const icon = state === "completed" ? "✓" : state === "current" ? "▶" : "○";
          const status = state === "completed" ? "Construido" : state === "current" ? "Estamos aquí" : "Próximamente";
          return `
            <li class="escape-project-route__item escape-project-route__item--${state}">
              <span aria-hidden="true">${icon}</span>
              <div>
                <strong>${item.title}</strong>
                <small>${status}: ${item.role}</small>
              </div>
            </li>
          `;
        }).join("")}
      </ol>
    </nav>

    <div class="project-connection-grid">
      <article class="project-connection-card">
        <h2>¿Qué construimos anteriormente?</h2>
        <p>${previousSummary}</p>
        ${futureProjects.length ? `<p>Estas piezas seguirán funcionando y la nueva se agregará junto a ellas.</p>` : `<p>Con la práctica de hoy unirás la última pieza planeada de esta ruta.</p>`}
      </article>
      <article class="project-connection-card">
        <h2>¿Qué agregaremos hoy?</h2>
        <p>${project.build}</p>
        <p>${project.learn}</p>
      </article>
      <article class="project-connection-card">
        <h2>¿Cómo se conecta con nuestro Escape Room?</h2>
        <p>${project.future}</p>
        <p>Esta pieza se integra con las demás para que el jugador encuentre señales, reacciones y efectos durante una sola aventura.</p>
      </article>
    </div>

    <div class="before-after-project">
      <h2>Antes y después</h2>
      <div class="before-after-project__grid">
        <div>
          <h3>Antes de esta práctica</h3>
          <ul>
            ${previousProjects.length
              ? previousProjects.map((item) => `<li>${item.title}: ${item.role}</li>`).join("")
              : "<li>Plan general del Escape Room.</li><li>Espacios y misión de la aventura definidos.</li>"}
          </ul>
        </div>
        <div>
          <h3>Después de esta práctica</h3>
          <ul>
            ${previousProjects.map((item) => `<li>${item.title}: ${item.role}</li>`).join("")}
            <li><strong>${project.title}: ${project.role}</strong></li>
          </ul>
        </div>
      </div>
    </div>

    <div class="mission-explanation-grid">
      <article class="mission-explanation mission-explanation--goal">
        <h2>¿Qué vamos a lograr hoy?</h2>
        <p><strong>Aprenderás:</strong> ${project.learn}</p>
        <p><strong>Construirás:</strong> ${project.build}</p>
        <p><strong>Servirá más adelante:</strong> ${project.future}</p>
      </article>
      <article class="mission-explanation mission-explanation--importance">
        <h2>¿Por qué es importante?</h2>
        <p>${project.importance}</p>
      </article>
    </div>
  `;
  return block;
}

function createMissionContext(project) {
  const contentId = `mission-context-content-${project.order}`;
  const radioName = `mission_context_${project.order}_choice`;
  const readingText = project.context.paragraphs.join(" ");
  const block = document.createElement("section");
  block.className = "card mission-context";
  block.innerHTML = `
    <div class="mission-context__header">
      <div>
        <span class="mission-context__eyebrow">Lee antes de construir</span>
        <h2>Contexto de la misión</h2>
      </div>
      <button
        class="action-button mission-context__read"
        type="button"
        aria-controls="${contentId}"
      >🔊 Leer contexto de la misión</button>
    </div>

    <div class="mission-context__content" id="${contentId}">
      <div class="mission-context__reading">
        ${project.context.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("")}
      </div>

      <div class="mission-context__questions">
        <h3>Comprensión de la lectura</h3>
        <p>Responde utilizando solamente la información de la lectura y tus propias ideas.</p>

        <fieldset class="understanding-question">
          <legend>1. ${project.context.choice.question}</legend>
          ${project.context.choice.options.map((option) => `
            <label>
              <input type="radio" name="${radioName}" value="${option}" />
              ${option}
            </label>
          `).join("")}
        </fieldset>

        <div class="worksheet-field">
          <label for="mission-context-${project.order}-true-false">2. Verdadero o falso: ${project.context.trueFalse}</label>
          <select class="worksheet-select" id="mission-context-${project.order}-true-false" name="mission_context_${project.order}_true_false">
            <option value="">Selecciona una respuesta</option>
            <option value="verdadero">Verdadero</option>
            <option value="falso">Falso</option>
          </select>
        </div>

        <div class="worksheet-field">
          <label for="mission-context-${project.order}-fill">3. ${project.context.fill}</label>
          <input class="worksheet-input" id="mission-context-${project.order}-fill" name="mission_context_${project.order}_fill" type="text" />
        </div>

        <div class="worksheet-field">
          <label for="mission-context-${project.order}-open">4. ${project.context.open}</label>
          <textarea class="worksheet-textarea" id="mission-context-${project.order}-open" name="mission_context_${project.order}_open" placeholder="Explica tu idea en 2 o 3 oraciones."></textarea>
        </div>
      </div>
    </div>
  `;

  const button = block.querySelector(".mission-context__read");
  const speech = window.speechSynthesis;
  let utterance = null;

  if (!speech || typeof SpeechSynthesisUtterance === "undefined") {
    button.disabled = true;
    button.textContent = "Audio no disponible";
    return block;
  }

  const resetButton = () => {
    utterance = null;
    button.textContent = "🔊 Leer contexto de la misión";
    button.setAttribute("aria-pressed", "false");
  };

  button.setAttribute("aria-pressed", "false");
  button.addEventListener("click", () => {
    if (utterance) {
      speech.cancel();
      resetButton();
      return;
    }

    speech.cancel();
    utterance = new SpeechSynthesisUtterance(readingText);
    utterance.lang = "es-MX";
    utterance.rate = 0.9;

    const spanishVoice = speech.getVoices().find((voice) =>
      voice.lang.toLowerCase().startsWith("es")
    );
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }

    utterance.addEventListener("end", resetButton, { once: true });
    utterance.addEventListener("error", resetButton, { once: true });
    button.textContent = "⏹ Detener lectura";
    button.setAttribute("aria-pressed", "true");
    speech.speak(utterance);
  });

  return block;
}

function createObjectiveMission(objectiveNumber, project) {
  const phase = SPECIAL_PROJECT_PHASE_GUIDE[objectiveNumber - 1];
  const block = document.createElement("div");
  block.className = "objective-mission";
  block.innerHTML = `
    <span class="objective-mission__number">Misión ${objectiveNumber} de 7</span>
    <div>
      <h3>En palabras sencillas: ${phase.title}</h3>
      <p><strong>Lo que harás:</strong> ${phase.purpose}</p>
      <p><strong>Cómo ayuda al proyecto final:</strong> ${phase.contribution}</p>
    </div>
  `;
  return block;
}

function createBeforeProgramming(objectiveNumber, project, isFinalCode = false) {
  const suffix = isFinalCode ? "final" : `objective-${objectiveNumber}`;
  const block = document.createElement("div");
  block.className = "before-programming";
  block.innerHTML = `
    <h3>Antes de programar</h3>
    <p>No copies el código todavía. Primero imagina lo que debe ocurrir y responde con tus propias palabras.</p>
    <div class="worksheet-field">
      <label for="${suffix}-prediction-1">1. ¿Qué crees que hará esta parte del programa?</label>
      <textarea class="worksheet-textarea worksheet-textarea--compact" id="${suffix}-prediction-1" name="${suffix}-prediction-1" placeholder="Describe la acción que esperas observar."></textarea>
    </div>
    <div class="worksheet-field">
      <label for="${suffix}-prediction-2">2. ¿Qué información recibe el programa y qué respuesta debe producir?</label>
      <textarea class="worksheet-textarea worksheet-textarea--compact" id="${suffix}-prediction-2" name="${suffix}-prediction-2" placeholder="Ejemplo: recibe una distancia y responde con una luz."></textarea>
    </div>
    <div class="worksheet-field">
      <label for="${suffix}-prediction-3">3. ¿Cómo debería reaccionar el juego cuando ${project.codeReaction}?</label>
      <textarea class="worksheet-textarea worksheet-textarea--compact" id="${suffix}-prediction-3" name="${suffix}-prediction-3" placeholder="Explica qué debe notar el jugador del Escape Room."></textarea>
    </div>
    <div class="worksheet-field">
      <label for="${suffix}-prediction-4">4. ¿Qué pasaría dentro del Escape Room si esta función no existiera o dejara de funcionar?</label>
      <textarea class="worksheet-textarea worksheet-textarea--compact" id="${suffix}-prediction-4" name="${suffix}-prediction-4" placeholder="Describe qué dejaría de observar o hacer el jugador."></textarea>
    </div>
  `;
  return block;
}

function createNewCodeGuide(objectiveNumber, codeStep, previousCodeStep, project) {
  const previousLines = new Set(
    (previousCodeStep?.code || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
  );
  const newLines = codeStep.code
    .split("\n")
    .filter((line) => line.trim() && !previousLines.has(line.trim()));

  const block = document.createElement("div");
  block.className = "new-code-guide";

  const heading = document.createElement("h3");
  heading.textContent = "Lo nuevo que aprenderás hoy";
  block.appendChild(heading);

  const previous = document.createElement("p");
  previous.innerHTML = objectiveNumber === 1
    ? "<strong>Antes:</strong> todavía no había un programa de prueba para esta pieza."
    : `<strong>Código que ya conoces:</strong> la prueba anterior agregó “${previousCodeStep.title}”. No necesitas olvidarla; hoy construirás sobre esa idea.`;
  block.appendChild(previous);

  const today = document.createElement("p");
  today.innerHTML = `<strong>Lo nuevo de hoy:</strong> ${codeStep.title}. Estas instrucciones agregan una capacidad visible: ${project.codeReaction}.`;
  block.appendChild(today);

  const warning = document.createElement("p");
  warning.className = "worksheet-note";
  warning.textContent = "Estas líneas sirven para comparar el crecimiento del programa. No las copies solas: utiliza el bloque completo que aparece después.";
  block.appendChild(warning);

  const details = document.createElement("details");
  details.className = "new-code-guide__details";
  const summary = document.createElement("summary");
  summary.textContent = `Ver ${newLines.length} líneas nuevas o diferentes`;
  details.appendChild(summary);

  const pre = document.createElement("pre");
  pre.dataset.noCopy = "true";
  const code = document.createElement("code");
  code.textContent = newLines.join("\n");
  pre.appendChild(code);
  details.appendChild(pre);
  block.appendChild(details);

  return block;
}

function createUnderstandingCheck(project) {
  const block = document.createElement("section");
  block.className = "card understanding-check";
  const optionName = `understanding_${project.order}_choice`;
  block.innerHTML = `
    <h2>Comprueba que entendiste</h2>
    <p>Responde sin copiar el código. Esta actividad te ayuda a comprobar si puedes explicar la misión.</p>

    <fieldset class="understanding-question">
      <legend>1. ${project.checks.choice.question}</legend>
      ${project.checks.choice.options.map((option) => `
        <label>
          <input type="radio" name="${optionName}" value="${option}" />
          ${option}
        </label>
      `).join("")}
    </fieldset>

    <div class="worksheet-field">
      <label for="understanding-${project.order}-true-false">2. Verdadero o falso: ${project.checks.trueFalse}</label>
      <select class="worksheet-select" id="understanding-${project.order}-true-false" name="understanding_${project.order}_true_false">
        <option value="">Selecciona una respuesta</option>
        <option value="verdadero">Verdadero</option>
        <option value="falso">Falso</option>
      </select>
    </div>

    <div class="worksheet-field">
      <label for="understanding-${project.order}-fill">3. ${project.checks.fill}</label>
      <input class="worksheet-input" id="understanding-${project.order}-fill" name="understanding_${project.order}_fill" type="text" />
    </div>

    <div class="understanding-match">
      <h3>4. Relaciona cada elemento con su función</h3>
      ${project.checks.match.map(([concept, answer], index) => `
        <div class="worksheet-field">
          <label for="understanding-${project.order}-match-${index + 1}">${concept}</label>
          <select class="worksheet-select" id="understanding-${project.order}-match-${index + 1}" name="understanding_${project.order}_match_${index + 1}">
            <option value="">Elige una función</option>
            ${project.checks.match.map(([, option]) => `<option value="${option}">${option}</option>`).join("")}
          </select>
        </div>
      `).join("")}
    </div>

    <div class="worksheet-field">
      <label for="understanding-${project.order}-explain">5. Explica con tus propias palabras cómo esta práctica ayuda al Escape Room final.</label>
      <textarea class="worksheet-textarea" id="understanding-${project.order}-explain" name="understanding_${project.order}_explain" placeholder="Menciona qué hará la pieza y qué observará el jugador."></textarea>
    </div>

    <div class="worksheet-field">
      <label for="understanding-${project.order}-situation">6. Situación de aplicación: durante la presentación, el ${project.role} no reacciona. ¿Qué notaría el jugador y qué revisarías primero?</label>
      <textarea class="worksheet-textarea" id="understanding-${project.order}-situation" name="understanding_${project.order}_situation" placeholder="Explica el efecto en la aventura y escribe una revisión concreta."></textarea>
    </div>
  `;
  return block;
}

function createDeliveryChecklist(project) {
  const block = document.createElement("section");
  block.className = "card final-delivery-guide";
  block.innerHTML = `
    <h2>¿Qué debo entregar?</h2>
    <p>Antes de enviar, revisa uno por uno estos elementos. El profesor comprobará que las evidencias abran, que el mecanismo funcione y que puedas explicar lo que hiciste.</p>
    <ul class="final-delivery-guide__list">
      ${project.deliverables.map((item) => `<li>${item}</li>`).join("")}
    </ul>
    <div class="final-delivery-guide__review">
      <h3>El profesor revisará</h3>
      <ul>
        <li>Que los enlaces permitan ver el contenido sin solicitar acceso.</li>
        <li>Que las capturas o videos muestren la prueba completa y no solamente el resultado final.</li>
        <li>Que registres valores reales, errores encontrados y correcciones.</li>
        <li>Que puedas explicar cómo esta pieza se conecta con el Escape Room.</li>
      </ul>
    </div>
  `;
  return block;
}

function setupSpecialProjectLearningSequence() {
  const worksheetKey = document.body.dataset.worksheetKey;
  const questionSets = SPECIAL_PROJECT_QUESTIONS[worksheetKey];
  const codeSteps = SPECIAL_PROJECT_CODE_STEPS[worksheetKey];
  const objectiveRequirements = SPECIAL_PROJECT_OBJECTIVE_REQUIREMENTS[worksheetKey];
  const project = SPECIAL_PROJECT_PEDAGOGY[worksheetKey];
  if (!questionSets || !codeSteps || !objectiveRequirements || !project) return;

  const objectiveCards = Array.from(document.querySelectorAll(".card")).filter((card) =>
    /^Objetivo\s+[1-7]:/.test(card.querySelector("h2")?.textContent.trim() || "")
  );
  if (
    objectiveCards.length !== questionSets.length ||
    objectiveCards.length !== codeSteps.length ||
    objectiveCards.length !== objectiveRequirements.length
  ) return;

  const identifiedCard = Array.from(document.querySelectorAll(".card")).find(
    (card) => card.querySelector("h2")?.textContent.trim() === "Producto final identificado"
  );
  const guideCard = Array.from(document.querySelectorAll(".card")).find(
    (card) => card.querySelector("h2")?.textContent.trim() === "Guía de trabajo"
  );

  if (guideCard) {
    const overview = createSpecialProjectOverview(project);
    guideCard.insertAdjacentElement("afterend", overview);
    overview.insertAdjacentElement("afterend", createMissionContext(project));
  }

  const progressCard = document.createElement("section");
  progressCard.className = "card learning-progress";
  progressCard.setAttribute("aria-labelledby", "learning-progress-title");
  progressCard.innerHTML = `
    <div class="learning-progress__heading">
      <h2 id="learning-progress-title">Avance dentro de esta práctica</h2>
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
    const previousCodeStep = codeSteps[index - 1];
    const firstDescription = Array.from(card.querySelectorAll("p")).find(
      (paragraph) => paragraph.querySelector("strong")?.textContent.trim() === "Descripción:"
    );
    const mission = createObjectiveMission(objectiveNumber, project);
    if (firstDescription) {
      firstDescription.insertAdjacentElement("beforebegin", mission);
    } else {
      card.querySelector("h2")?.insertAdjacentElement("afterend", mission);
    }
    card.appendChild(createObjectiveRequirements(objectiveRequirements[index]));
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
      <div data-before-programming></div>
      <div data-new-code-guide></div>
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
    codeTestBlock.querySelector("[data-new-code-guide]").replaceWith(
      createNewCodeGuide(objectiveNumber, codeStep, previousCodeStep, project)
    );
    codeTestBlock.querySelector("[data-before-programming]").replaceWith(
      createBeforeProgramming(objectiveNumber, project)
    );
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

  const sendCard = Array.from(document.querySelectorAll(".card")).find(
    (card) => card.querySelector("h2")?.textContent.trim() === "Enviar proyecto"
  );
  if (sendCard) {
    sendCard.insertAdjacentElement("beforebegin", createDeliveryChecklist(project));
    sendCard.previousElementSibling.insertAdjacentElement("beforebegin", createUnderstandingCheck(project));
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

function explainCodeLine(line) {
  const trimmed = line.trim();
  const withoutComment = trimmed.replace(/\/\/.*$/, "").trim();

  if (!trimmed) return "Esta línea separa visualmente las partes del programa para que sea más fácil leerlo.";
  if (trimmed.startsWith("//")) return `Es un comentario para humanos: ${trimmed.replace(/^\/\/+\s*/, "")}. Arduino no ejecuta esta línea.`;
  if (/^#include\s*</.test(trimmed)) return "Carga una biblioteca: una caja de herramientas con instrucciones ya preparadas para controlar un componente.";
  if (/^#define\s+/.test(trimmed)) return "Crea un nombre fijo para un pin o una cantidad. Así el programa usa una palabra clara en lugar de repetir un número.";
  if (/^(const\s+)?(int|long|float|unsigned long|bool|char)\s+/.test(trimmed)) {
    if (trimmed.includes("=")) return "Crea una variable o dato con nombre y le asigna un valor inicial que el programa usará después.";
    return "Reserva un espacio con nombre para guardar un dato que el programa necesitará.";
  }
  if (/^Servo\s+\w+/.test(trimmed)) return "Crea un objeto para controlar un servomotor, como si le pusiera un nombre propio.";
  if (/^Adafruit_NeoPixel\s+\w+/.test(trimmed)) return "Prepara el control del aro de luces e indica cuántos LEDs tiene, qué pin usa y cómo recibe los colores.";
  if (/^void setup\s*\(/.test(trimmed)) return "Inicia setup: esta parte se ejecuta una sola vez cuando Arduino se enciende o reinicia.";
  if (/^void loop\s*\(/.test(trimmed)) return "Inicia loop: todo lo que esté dentro se repetirá una y otra vez mientras Arduino esté encendido.";
  if (/^(void|int|long|bool)\s+\w+\s*\([^;]*\)\s*\{?$/.test(trimmed)) {
    const functionName = trimmed.match(/^(?:void|int|long|bool)\s+(\w+)/)?.[1] || "esta función";
    return `Crea la función ${functionName}: un grupo de instrucciones con una tarea específica que puede utilizarse varias veces.`;
  }
  if (/^if\s*\(/.test(trimmed)) return "Hace una pregunta. Las instrucciones de este bloque solo se ejecutan cuando la condición es verdadera.";
  if (/^}\s*else if\s*\(/.test(trimmed) || /^else if\s*\(/.test(trimmed)) return "Si la condición anterior no se cumplió, prueba una condición diferente.";
  if (/^}\s*else\s*\{?$/.test(trimmed) || /^else\s*\{?$/.test(trimmed)) return "Si ninguna condición anterior se cumplió, ejecuta esta última opción.";
  if (/^for\s*\(/.test(trimmed)) return "Inicia una repetición controlada. Cambia un contador paso a paso hasta completar todos los movimientos o elementos.";
  if (/^while\s*\(/.test(trimmed)) return "Repite las instrucciones mientras la condición continúe siendo verdadera.";
  if (/^switch\s*\(/.test(trimmed)) return "Compara un valor con varias opciones para elegir cuál grupo de instrucciones ejecutar.";
  if (/^case\s+/.test(trimmed)) return "Marca una de las opciones posibles dentro de una selección.";
  if (/^break;/.test(trimmed)) return "Termina esta opción para evitar que el programa continúe con la siguiente.";
  if (/^return\b/.test(trimmed)) return "Termina la función y devuelve el resultado calculado a la parte del programa que lo solicitó.";
  if (/^Serial\.begin/.test(trimmed)) return "Abre la comunicación con el monitor serial para poder observar mensajes y mediciones en la computadora.";
  if (/^Serial\.(print|println)/.test(trimmed)) return "Muestra un texto o valor en el monitor serial. Sirve para observar qué está pensando o midiendo el programa.";
  if (/pinMode\s*\(/.test(trimmed)) return "Indica si ese pin enviará una señal de salida o recibirá información de entrada.";
  if (/digitalWrite\s*\(/.test(trimmed)) return "Enciende o apaga una señal digital en el pin indicado.";
  if (/digitalRead\s*\(/.test(trimmed)) return "Lee si un pin digital se encuentra encendido o apagado.";
  if (/analogWrite\s*\(/.test(trimmed)) return "Envía una señal regulada para controlar intensidad o velocidad.";
  if (/pulseIn\s*\(/.test(trimmed)) return "Mide cuánto dura el eco del sensor. Ese tiempo permitirá calcular la distancia.";
  if (/delayMicroseconds\s*\(/.test(trimmed)) return "Hace una pausa extremadamente corta, medida en microsegundos, para formar la señal del sensor.";
  if (/delay\s*\(/.test(trimmed)) return "Detiene el programa durante el tiempo indicado en milisegundos. Mil milisegundos equivalen a un segundo.";
  if (/millis\s*\(/.test(trimmed)) return "Consulta cuántos milisegundos han pasado desde que Arduino comenzó a funcionar, sin reiniciar el reloj.";
  if (/tone\s*\(/.test(trimmed)) return "Pide al buzzer producir un sonido con la frecuencia y, cuando aparece, la duración indicadas.";
  if (/noTone\s*\(/.test(trimmed)) return "Detiene el sonido del buzzer.";
  if (/\.attach\s*\(/.test(trimmed)) return "Conecta el nombre del servo con el pin donde está conectado físicamente.";
  if (/\.write\s*\(/.test(trimmed)) return "Ordena al servomotor moverse hacia el ángulo indicado.";
  if (/\.begin\s*\(/.test(trimmed)) return "Inicia el componente para que quede preparado antes de utilizarlo.";
  if (/\.setBrightness\s*\(/.test(trimmed)) return "Ajusta el brillo del aro de LEDs.";
  if (/\.setPixelColor\s*\(/.test(trimmed)) return "Asigna un color a uno de los LEDs del aro.";
  if (/\.Color\s*\(/.test(trimmed)) return "Combina cantidades de rojo, verde y azul para formar un color.";
  if (/\.show\s*\(/.test(trimmed)) return "Envía al aro los cambios de color preparados para que aparezcan en los LEDs.";
  if (/\.clear\s*\(/.test(trimmed)) return "Borra los colores guardados del aro antes de preparar un nuevo efecto.";
  if (/randomSeed\s*\(/.test(trimmed)) return "Prepara números aleatorios para que los tiempos o movimientos no se repitan siempre igual.";
  if (/random\s*\(/.test(trimmed)) return "Elige un número al azar dentro del rango indicado.";
  if (/^(true|false);?$/.test(withoutComment)) return "Representa una respuesta lógica: verdadero funciona como encendido y falso como apagado.";
  if (/=\s*(true|false)\s*;/.test(withoutComment)) return "Guarda un estado lógico que funciona como interruptor: verdadero es activado y falso es desactivado.";
  if (/^[A-Za-z_]\w*\s*(\+\+|--|\+=|-=)/.test(withoutComment)) return "Actualiza un contador o valor para avanzar al siguiente paso de una repetición.";
  if (/^[A-Za-z_]\w*\s*=/.test(withoutComment)) return "Guarda un nuevo valor en la variable indicada.";
  if (/^\w+\s*\([^;]*\);$/.test(withoutComment)) return "Llama a una función para ejecutar ahora la tarea que lleva ese nombre.";
  if (trimmed === "{") return "Abre un bloque de instrucciones que pertenecen a la función, condición o repetición anterior.";
  if (trimmed === "}" || trimmed === "};") return "Cierra el bloque de instrucciones que comenzó antes.";
  if (/^}\s*while\s*\(/.test(trimmed)) return "Cierra el bloque y decide si debe repetirse otra vez según la condición.";
  if (/[{}]/.test(trimmed)) return "Esta línea abre o cierra un grupo de instrucciones que deben mantenerse juntas.";
  if (/^[A-Za-z_]\w*\s*;?$/.test(withoutComment)) return "Usa el dato, estado o instrucción que tiene ese nombre.";
  return "Ejecuta esta instrucción usando los valores escritos. Observa su nombre y los datos entre paréntesis para identificar su tarea.";
}

function createCodeLineGuide(codeText, label, project) {
  const details = document.createElement("details");
  details.className = "code-line-guide";

  const summary = document.createElement("summary");
  summary.textContent = `Entendiendo el código: explicación línea por línea de ${label}`;
  details.appendChild(summary);

  const introduction = document.createElement("p");
  introduction.className = "code-line-guide__intro";
  introduction.textContent = `Abre esta guía mientras lees el código. No necesitas memorizarlo: busca qué tarea realiza cada línea y cómo ayuda a que ${project.codeReaction}.`;
  details.appendChild(introduction);

  const list = document.createElement("ol");
  list.className = "code-line-guide__list";

  codeText.split("\n").forEach((line, index) => {
    if (!line.trim()) return;
    const item = document.createElement("li");
    item.value = index + 1;

    const code = document.createElement("code");
    code.textContent = line.trim();

    const explanation = document.createElement("span");
    explanation.textContent = explainCodeLine(line);

    item.append(code, explanation);
    list.appendChild(item);
  });

  details.appendChild(list);
  return details;
}

function setupSpecialProjectCodeGuides() {
  const worksheetKey = document.body.dataset.worksheetKey;
  const project = SPECIAL_PROJECT_PEDAGOGY[worksheetKey];
  if (!project) return;

  const completeCodeHeading = Array.from(document.querySelectorAll(".card h2")).find(
    (heading) => heading.textContent.trim() === "Código completo"
  );
  const completeCodePre = completeCodeHeading?.closest(".card")?.querySelector("pre");
  if (completeCodePre && !completeCodePre.previousElementSibling?.classList.contains("before-programming")) {
    completeCodePre.insertAdjacentElement("beforebegin", createBeforeProgramming(0, project, true));
  }

  document.querySelectorAll(".objective-code-test pre, .card > pre").forEach((pre, index) => {
    if (pre.nextElementSibling?.classList.contains("code-line-guide")) return;
    const cardTitle = pre.closest(".card")?.querySelector("h2")?.textContent.trim();
    const stepTitle = pre.closest(".objective-code-test")?.querySelector("p strong")?.parentElement?.textContent.trim();
    const label = stepTitle || cardTitle || `bloque ${index + 1}`;
    const codeText = pre.querySelector("code")?.textContent || "";
    pre.insertAdjacentElement("afterend", createCodeLineGuide(codeText, label, project));
  });
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

const WORKSHEET_EMAIL_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbw8XwulnlKUE1jy8JHRmPSHhB8TNS9_p5X9hORVkZEG4UDg_qpnHZYThKLzBz-5uhU88w/exec";

let firebaseServicesPromise;

function isPracticeWorksheetPage() {
  const worksheetKey = document.body.dataset.worksheetKey || "";
  const pageName = window.location.pathname.split("/").pop() || "";
  const title = document.querySelector("h1")?.textContent.trim() || document.title;

  return worksheetKey.startsWith("practica-")
    || /^practica(?:-|_).*\.html$/i.test(pageName)
    || /^práctica\b/i.test(title);
}

function setupPracticeEmailSubmissionUi() {
  if (!isPracticeWorksheetPage()) return;

  document.body.dataset.submissionType = "practica";
  if (!document.body.dataset.emailWebappUrl) {
    document.body.dataset.emailWebappUrl = WORKSHEET_EMAIL_WEBAPP_URL;
  }

  if (document.querySelector('[data-worksheet-action="email"]')) return;

  const card = document.createElement("section");
  card.className = "card worksheet-submit-card";
  card.innerHTML = `
    <h2>Enviar práctica</h2>
    <p>Cuando termines, revisa tus respuestas e inicia sesión con Google para enviar la práctica al profesor.</p>
    <div class="button-row">
      <button class="action-button action-button--secondary" data-email-login type="button">Entrar con Google</button>
      <button class="action-button" data-worksheet-action="email" type="button" disabled>Enviar práctica</button>
    </div>
    <p class="email-submit-status" data-email-status aria-live="polite">Inicia sesión con Google para habilitar el envío.</p>
  `;

  const container = document.querySelector(".page-shell .container");
  if (!container) return;

  const printOnlyCard = container.querySelector(".card.print-only");
  if (printOnlyCard) {
    printOnlyCard.insertAdjacentElement("beforebegin", card);
  } else {
    container.appendChild(card);
  }
}

function getWorksheetFieldsDefault() {
  return Array.from(document.querySelectorAll(".worksheet-input, .worksheet-textarea, .worksheet-select, input[type=\"checkbox\"], input[type=\"radio\"]"));
}

function collectWorksheetData(fields) {
  const data = {};

  fields.forEach((field) => {
    if (!field.name) return;
    if (field.type === "radio") {
      if (field.checked) data[field.name] = field.value;
      return;
    }
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

function createGoogleAccountBadge() {
  const badge = document.createElement("div");
  badge.className = "google-account-badge";
  badge.hidden = true;
  badge.innerHTML = `
    <img class="google-account-badge__avatar" data-google-account-avatar alt="" referrerpolicy="no-referrer" />
    <span class="google-account-badge__fallback" data-google-account-fallback aria-hidden="true">G</span>
    <span class="google-account-badge__details">
      <strong data-google-account-name>Cuenta de Google</strong>
      <span data-google-account-email></span>
    </span>
  `;
  return badge;
}

function updateGoogleAccountBadge(badge, account) {
  if (!badge) return;

  const signedIn = Boolean(account?.signedIn);
  const name = String(account?.name || "").trim();
  const email = String(account?.email || "").trim();
  const photoURL = String(account?.photoURL || "").trim();
  const avatar = badge.querySelector("[data-google-account-avatar]");
  const fallback = badge.querySelector("[data-google-account-fallback]");
  const nameElement = badge.querySelector("[data-google-account-name]");
  const emailElement = badge.querySelector("[data-google-account-email]");

  badge.hidden = !signedIn;
  if (!signedIn) {
    avatar?.removeAttribute("src");
    return;
  }

  if (nameElement) nameElement.textContent = name || "Cuenta de Google";
  if (emailElement) emailElement.textContent = email;
  if (fallback) {
    fallback.textContent = (name || email || "G").charAt(0).toUpperCase();
    fallback.hidden = Boolean(photoURL);
  }

  if (avatar) {
    avatar.hidden = !photoURL;
    if (photoURL) {
      avatar.src = photoURL;
      avatar.alt = name ? `Foto de perfil de ${name}` : "Foto de perfil de Google";
      avatar.onerror = () => {
        avatar.hidden = true;
        if (fallback) fallback.hidden = false;
      };
    } else {
      avatar.removeAttribute("src");
    }
  }
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
    ["submission_type", payload.submissionType],
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
    `Tipo de entrega: ${payload.submissionType || "hoja de trabajo"}`,
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
    <p><strong>Tipo de entrega:</strong> ${escapeHtml(payload.submissionType || "hoja de trabajo")}</p>
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

  const submissionCard = emailButton.closest(".card");
  let accountBadge = submissionCard?.querySelector(".google-account-badge");
  if (!accountBadge && submissionCard) {
    accountBadge = createGoogleAccountBadge();
    const buttonRow = emailButton.closest(".button-row");
    if (buttonRow) {
      buttonRow.insertAdjacentElement("beforebegin", accountBadge);
    } else {
      submissionCard.insertBefore(accountBadge, emailButton);
    }
  }

  let isSignedIn = document.body.dataset.googleSignedIn === "true";
  let isSending = false;
  let signedInEmail = "";
  let signedInName = "";
  let signedInPhotoURL = "";
  const isProjectSubmission = document.body.dataset.projectSubmission === "true";
  const submissionType = document.body.dataset.submissionType || (isProjectSubmission ? "proyecto" : "examen");
  const submissionName = submissionType === "practica"
    ? "práctica"
    : (isProjectSubmission ? "proyecto" : "examen");
  const submissionLabel = submissionType === "practica"
    ? "Práctica"
    : (isProjectSubmission ? "Proyecto" : "Examen");
  const submissionReference = submissionType === "practica"
    ? "la práctica"
    : `el ${submissionName}`;
  const submissionSentMessage = submissionType === "practica"
    ? "Práctica enviada"
    : `${submissionLabel} enviado`;

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
    signedInName = event.detail?.name || "";
    signedInPhotoURL = event.detail?.photoURL || "";
    updateGoogleAccountBadge(accountBadge, {
      signedIn: isSignedIn,
      email: signedInEmail,
      name: signedInName,
      photoURL: signedInPhotoURL
    });
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
    signedInName = "";
    signedInPhotoURL = "";
    updateGoogleAccountBadge(accountBadge, { signedIn: false });
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
      setEmailStatus(`Escribe el nombre del alumno antes de enviar ${submissionReference}.`, "error");
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

    const answers = fields
      .filter((field) => field.type !== "radio" || field.checked)
      .map((field) => ({
      name: field.name,
      label: getFieldLabel(field),
      value: field.type === "checkbox" ? field.checked : field.value
      }));
    const objectiveFields = Array.from(document.querySelectorAll("[data-objective-completed]"));
    const progressPercentage = objectiveFields.length
      ? Math.round((objectiveFields.filter((field) => field.checked).length / objectiveFields.length) * 100)
      : null;

    const payload = {
      submissionType,
      worksheetKey: document.body.dataset.worksheetKey
        || window.location.pathname.split("/").pop()?.replace(/\.html$/i, "")
        || "",
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
      setEmailStatus(`${submissionSentMessage}. Revisa tu correo para confirmar la recepción.`, "success");
    } catch (error) {
      if (error?.allowHiddenFormFallback === false) {
        console.error(`El servidor rechazó el envío de ${submissionReference}:`, error);
        setEmailStatus(`No se pudo enviar ${submissionReference}. Revisa permisos y despliegue del Apps Script.`, "error");
        return;
      }

      console.warn("No se pudo confirmar el envio con fetch; usando formulario oculto:", error);
      try {
        await submitEmailWithHiddenForm(webAppUrl, payload);
        setEmailStatus(`${submissionSentMessage}. Si no llega la confirmación, revisa la configuración del Apps Script.`, "success");
      } catch (fallbackError) {
        console.error(`No se pudo enviar ${submissionReference}:`, fallbackError);
        setEmailStatus(`No se pudo enviar ${submissionReference}. Revisa conexión, permisos del Apps Script y vuelve a intentar.`, "error");
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
    } else if (field.type === "radio" && typeof data[field.name] === "string") {
      field.checked = field.value === data[field.name];
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
        <div data-cloud-account></div>
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

  const accountSlot = panel.querySelector("[data-cloud-account]");
  const accountBadge = createGoogleAccountBadge();
  accountSlot?.replaceWith(accountBadge);

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
    accountBadge,
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
        name: currentUser?.displayName || "",
        photoURL: currentUser?.photoURL || ""
      }
    }));

    if (!cloudUi) return;

    updateGoogleAccountBadge(cloudUi.accountBadge, {
      signedIn: Boolean(currentUser),
      email: currentUser?.email || "",
      name: currentUser?.displayName || "",
      photoURL: currentUser?.photoURL || ""
    });
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
      if (field.type === "checkbox" || field.type === "radio") {
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
  setupSpecialProjectMaterials();
  setupSpecialProjectCodeGuides();
  setupCodeHighlighting();
  setupCopyableCodeBlocks();
  setupProjectSubmissionFields();
  setupImageLightbox();
  setupContentProtection();
  setupPracticeEmailSubmissionUi();
  setupWorksheetStorage();
  setupWorksheetEmailSubmission();
});
