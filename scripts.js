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

  if (!worksheetKey) return;
  if (document.body.dataset.disableProjectLinks === "true") return;

  const worksheetMeta = document.querySelector(".worksheet-meta");
  if (!worksheetMeta || document.getElementById("project-link")) return;

  const targetCard = worksheetMeta.closest(".card");
  if (!targetCard) return;

  const fieldsBlock = document.createElement("div");
  fieldsBlock.className = "submission-links";
  fieldsBlock.innerHTML = `
    <h3>Entrega digital del proyecto</h3>
    <p class="worksheet-note submission-links__note">Pega aqui el enlace de tu simulacion o proyecto y, si lo tienes, un enlace externo con evidencias como capturas o video.</p>
    <div class="worksheet-field">
      <label for="project-link">Enlace del proyecto en Tinkercad</label>
      <input class="worksheet-input" id="project-link" name="project_link" type="url" inputmode="url" placeholder="https://www.tinkercad.com/..." />
    </div>
    <div class="worksheet-field">
      <label for="evidence-link">Enlace de evidencias (opcional)</label>
      <input class="worksheet-input" id="evidence-link" name="evidence_link" type="url" inputmode="url" placeholder="https://drive.google.com/... o enlace similar" />
    </div>
    <div class="worksheet-field">
      <label for="project-notes">Descripcion breve del proyecto o de la evidencia</label>
      <textarea class="worksheet-textarea" id="project-notes" name="project_notes" placeholder="Explica que hiciste, que modificaste o que incluye tu evidencia."></textarea>
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
  const allowCodeCopy = document.body.dataset.allowCodeCopy === "true";

  [
    "copy",
    "cut",
    "paste",
    "contextmenu",
    "dragstart",
    "selectstart"
  ].forEach((eventName) => {
    document.addEventListener(eventName, (event) => {
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
  return Array.from(document.querySelectorAll(".worksheet-input, .worksheet-textarea, input[type=\"checkbox\"]"));
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

function setupWorksheetEmailSubmission() {
  const rawWebAppUrl = document.body.dataset.emailWebappUrl;
  const webAppUrl = getEmailWebAppUrl(rawWebAppUrl);
  const emailButton = document.querySelector('[data-worksheet-action="email"]');
  const status = document.querySelector("[data-email-status]");

  if (!webAppUrl || !emailButton) return;

  let isSignedIn = document.body.dataset.googleSignedIn === "true";
  let isSending = false;
  let signedInEmail = "";

  function setEmailStatus(message, mode) {
    if (!status) return;
    status.textContent = message;
    status.dataset.mode = mode || "";
  }

  function updateEmailButton() {
    emailButton.disabled = !isSignedIn || isSending;
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

  emailButton.addEventListener("click", () => {
    if (!isSignedIn) {
      setEmailStatus("Inicia sesión con Google antes de enviar.", "error");
      updateEmailButton();
      return;
    }

    const fields = getWorksheetFieldsDefault().filter((field) => field.name);
    const values = collectWorksheetData(fields);
    const studentName = String(values.student_name || "").trim();

    if (!studentName) {
      setEmailStatus("Escribe el nombre del alumno antes de enviar el examen.", "error");
      document.querySelector("[name=\"student_name\"]")?.focus();
      return;
    }

    const answers = fields.map((field) => ({
      name: field.name,
      label: getFieldLabel(field),
      value: field.type === "checkbox" ? field.checked : field.value
    }));

    const payload = {
      worksheetKey: document.body.dataset.worksheetKey || "",
      title: document.querySelector("h1")?.textContent.trim() || document.title,
      studentName,
      groupName: values.group_name || "",
      deliveryDate: values.delivery_date || "",
      projectLink: values.project_link || "",
      signedInEmail,
      submittedAt: new Date().toISOString(),
      pageUrl: window.location.href,
      values,
      answers
    };

    const iframeName = `email-submit-frame-${Date.now()}`;
    const iframe = document.createElement("iframe");
    iframe.name = iframeName;
    iframe.hidden = true;

    const form = document.createElement("form");
    form.method = "POST";
    form.action = webAppUrl;
    form.target = iframeName;
    form.hidden = true;

    form.appendChild(createHiddenInput("payload", JSON.stringify(payload)));
    form.appendChild(createHiddenInput("worksheet_key", payload.worksheetKey));
    form.appendChild(createHiddenInput("title", payload.title));
    form.appendChild(createHiddenInput("student_name", payload.studentName));
    form.appendChild(createHiddenInput("group_name", payload.groupName));
    form.appendChild(createHiddenInput("delivery_date", payload.deliveryDate));
    form.appendChild(createHiddenInput("project_link", payload.projectLink));
    form.appendChild(createHiddenInput("signed_in_email", payload.signedInEmail));
    form.appendChild(createHiddenInput("submitted_at", payload.submittedAt));
    form.appendChild(createHiddenInput("page_url", payload.pageUrl));

    Object.entries(values).forEach(([name, value]) => {
      form.appendChild(createHiddenInput(`field_${name}`, value));
    });

    iframe.addEventListener("load", () => {
      isSending = false;
      updateEmailButton();
      setEmailStatus("Examen enviado. Revisa tu correo para confirmar la recepción.", "success");
      window.setTimeout(() => {
        iframe.remove();
        form.remove();
      }, 1000);
    });

    document.body.appendChild(iframe);
    document.body.appendChild(form);

    isSending = true;
    updateEmailButton();
    setEmailStatus("Enviando examen por correo...", "loading");
    form.submit();
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

function showSaveAlert(message) {
  window.alert(message);
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
      showSaveAlert("Tu progreso se guardo en linea correctamente.");
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
      await authModule.signInWithRedirect(auth, provider);
    } catch (error) {
      console.error("No se pudo iniciar sesión con Google:", error);
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

  printButton?.addEventListener("click", () => {
    saveLocal();
    window.print();
  });

  resetButton?.addEventListener("click", async () => {
    getFieldsSafe().forEach((field) => {
      field.value = "";
    });
    localStorage.removeItem(worksheetKey);
    onReset?.();
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
  setupCodeHighlighting();
  setupCopyableCodeBlocks();
  setupProjectSubmissionFields();
  setupImageLightbox();
  setupContentProtection();
  setupWorksheetStorage();
  setupWorksheetEmailSubmission();
});
