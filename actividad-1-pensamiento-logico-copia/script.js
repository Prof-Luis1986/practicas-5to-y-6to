const storagePrefix = "actividad-1-algoritmos:";

const typeDetails = {
  flotantes: "Datos flotantes o decimales: la cantidad de agua varía según la taza o la cantidad de azúcar.",
  enteros: "Datos de números enteros: el tiempo de calentado y la cantidad de bolsas de té utilizadas.",
  texto: "Datos de texto: las instrucciones indican con palabras lo que se debe hacer.",
  booleanos: "Datos booleanos: una preferencia puede ser verdadera o falsa, como elegir agua tibia o caliente.",
  condicionales: "Datos condicionales: se toma una decisión según la preparación que vaya teniendo el té."
};

const textareas = Array.from(document.querySelectorAll("textarea[data-save]"));
const progressBar = document.querySelector("#progress-bar");
const progressLabel = document.querySelector("#progress-label");
const saveStatus = document.querySelector("#save-status");

function updateProgress() {
  const completed = textareas.filter((item) => item.value.trim().length > 20).length;
  const total = textareas.length;
  const percent = Math.round((completed / total) * 100);
  progressBar.style.width = `${percent}%`;
  progressLabel.textContent = `${completed} de ${total} secciones completadas`;
}

function storeValue(event) {
  const textarea = event.currentTarget;
  localStorage.setItem(storagePrefix + textarea.dataset.save, textarea.value);
  saveStatus.textContent = "Cambios guardados automáticamente.";
  updateProgress();
}

textareas.forEach((textarea) => {
  const saved = localStorage.getItem(storagePrefix + textarea.dataset.save);
  if (saved !== null) {
    textarea.value = saved;
  }
  textarea.addEventListener("input", storeValue);
});

document.querySelectorAll(".accordion button").forEach((button) => {
  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    button.nextElementSibling.hidden = expanded;
  });
});

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach((item) => item.classList.remove("active"));
    chip.classList.add("active");
    document.querySelector("#type-detail").textContent = typeDetails[chip.dataset.type];
  });
});

document.querySelector("#simulate-tv").addEventListener("click", () => {
  const output = document.querySelector("#simulation-output");
  const attempts = Math.floor(Math.random() * 3) + 1;
  if (attempts === 1) {
    output.textContent = "Intento 1: la televisión encendió. El algoritmo finaliza.";
    return;
  }
  output.textContent = `Intento 1: no encendió. Se repite la acción. Intento ${attempts}: la televisión encendió.`;
});

document.querySelector("#mark-complete").addEventListener("click", () => {
  localStorage.setItem(storagePrefix + "completed", new Date().toISOString());
  saveStatus.textContent = "Actividad marcada como revisada en este navegador.";
});

document.querySelector("#reset-work").addEventListener("click", () => {
  if (!confirm("¿Restaurar el contenido original de la actividad?")) {
    return;
  }
  Object.keys(localStorage)
    .filter((key) => key.startsWith(storagePrefix))
    .forEach((key) => localStorage.removeItem(key));
  window.location.reload();
});

const menuToggle = document.querySelector(".menu-toggle");
const menu = document.querySelector("#site-menu");

menuToggle.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});

menu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menu.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

updateProgress();
