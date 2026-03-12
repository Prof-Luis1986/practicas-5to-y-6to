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
  [
    "copy",
    "cut",
    "paste",
    "contextmenu",
    "dragstart",
    "selectstart"
  ].forEach((eventName) => {
    document.addEventListener(eventName, (event) => event.preventDefault());
  });

  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    const isModifierPressed = event.ctrlKey || event.metaKey;

    if (!isModifierPressed) return;

    if (["a", "c", "s", "u", "v", "x", "p"].includes(key)) {
      event.preventDefault();
    }
  });
}

function setupWorksheetStorage() {
  const worksheetKey = document.body.dataset.worksheetKey;
  if (!worksheetKey) return;

  const worksheetFields = Array.from(document.querySelectorAll(".worksheet-input, .worksheet-textarea"));
  const printButton = document.querySelector('[data-worksheet-action="print"]');
  const resetButton = document.querySelector('[data-worksheet-action="reset"]');

  if (!worksheetFields.length) return;

  function saveWorksheet() {
    const data = {};
    worksheetFields.forEach((field) => {
      data[field.name] = field.value;
    });
    localStorage.setItem(worksheetKey, JSON.stringify(data));
  }

  function loadWorksheet() {
    const raw = localStorage.getItem(worksheetKey);
    if (!raw) return;

    try {
      const data = JSON.parse(raw);
      worksheetFields.forEach((field) => {
        if (typeof data[field.name] === "string") {
          field.value = data[field.name];
        }
      });
    } catch {
      localStorage.removeItem(worksheetKey);
    }
  }

  worksheetFields.forEach((field) => {
    field.addEventListener("input", saveWorksheet);
  });

  printButton?.addEventListener("click", () => {
    saveWorksheet();
    window.print();
  });

  resetButton?.addEventListener("click", () => {
    worksheetFields.forEach((field) => {
      field.value = "";
    });
    localStorage.removeItem(worksheetKey);
  });

  loadWorksheet();
}

document.addEventListener("DOMContentLoaded", () => {
  setupCodeHighlighting();
  setupImageLightbox();
  setupContentProtection();
  setupWorksheetStorage();
});
