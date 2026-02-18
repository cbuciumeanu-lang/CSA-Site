const menuBtn = document.getElementById("menuBtn");
const mainNav = document.getElementById("mainNav");
const leadForm = document.getElementById("leadForm");
const formMessage = document.getElementById("formMessage");
const revealItems = document.querySelectorAll(".reveal");
const libraryLoginForm = document.getElementById("libraryLoginForm");
const libraryAuthMessage = document.getElementById("libraryAuthMessage");
const libraryList = document.getElementById("libraryList");
const libraryStateText = document.getElementById("libraryStateText");
const libraryLogoutBtn = document.getElementById("libraryLogoutBtn");
const introOverlay = document.getElementById("introOverlay");
const introEnterBtn = document.getElementById("introEnterBtn");

const LIBRARY_MANIFEST_PATH = "assets/biblioteca/manifest.json";
const LIBRARY_SESSION_KEY = "inte-library-auth";
const LIBRARY_DEMO_USER = "inte-demo";
const LIBRARY_DEMO_PASS = "inte2026";
const LIBRARY_DEMO_USERS = new Set(["inte-demo", "intedemo", "inte", "admin"]);
const LIBRARY_FALLBACK_DOCS = [
  {
    title: "Harvard Business Review USA - March April 2026",
    file: "assets/biblioteca/Harvard Business Review USA March April 2026 Harvard Business Review USA.pdf",
  },
];

document.documentElement.classList.add("has-js");

const introHandlers = {
  wheel: null,
  touchMove: null,
  keyDown: null,
};

function clearIntroHandlers() {
  if (introHandlers.wheel) {
    window.removeEventListener("wheel", introHandlers.wheel);
  }
  if (introHandlers.touchMove) {
    window.removeEventListener("touchmove", introHandlers.touchMove);
  }
  if (introHandlers.keyDown) {
    window.removeEventListener("keydown", introHandlers.keyDown);
  }
}

function dismissIntro() {
  if (!introOverlay || !document.body.classList.contains("intro-active")) {
    return;
  }

  document.body.classList.remove("intro-active");
  introOverlay.classList.add("is-exiting");
  introOverlay.setAttribute("aria-hidden", "true");
  clearIntroHandlers();

  if (introEnterBtn) {
    introEnterBtn.removeEventListener("click", dismissIntro);
  }

  window.setTimeout(() => {
    introOverlay.remove();
  }, 560);
}

if (introOverlay) {
  document.body.classList.add("intro-active");
  introOverlay.setAttribute("aria-hidden", "false");

  introHandlers.wheel = () => dismissIntro();
  introHandlers.touchMove = () => dismissIntro();
  introHandlers.keyDown = (event) => {
    if (event.key === "Enter" || event.key === " " || event.key === "Spacebar" || event.key === "PageDown") {
      dismissIntro();
    }
  };

  window.addEventListener("wheel", introHandlers.wheel, { passive: true });
  window.addEventListener("touchmove", introHandlers.touchMove, { passive: true });
  window.addEventListener("keydown", introHandlers.keyDown);

  if (introEnterBtn) {
    introEnterBtn.addEventListener("click", dismissIntro);
  }
}

if (menuBtn && mainNav) {
  menuBtn.addEventListener("click", () => {
    mainNav.classList.toggle("open");
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
    });
  });
}

if (leadForm && formMessage) {
  leadForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(leadForm);
    const nume = String(data.get("nume") || "").trim();
    const email = String(data.get("email") || "").trim();
    const telefon = String(data.get("telefon") || "").trim();

    if (!nume || !email || !telefon) {
      formMessage.textContent = "Completează câmpurile obligatorii pentru a continua.";
      return;
    }

    formMessage.textContent = "Cererea a fost înregistrată (demo MVP). Te vom contacta în scurt timp.";
    leadForm.reset();
  });
}

function setLibraryAuthMessage(message, tone = "info") {
  if (!libraryAuthMessage) {
    return;
  }

  libraryAuthMessage.textContent = message;
  libraryAuthMessage.style.color = tone === "error" ? "#8a1c1c" : "var(--brand)";
}

function renderLibraryDocuments(documents) {
  if (!libraryList || !libraryStateText) {
    return;
  }

  libraryList.innerHTML = "";

  if (!documents.length) {
    libraryList.hidden = true;
    libraryStateText.textContent =
      "Nu există documente în bibliotecă momentan. Adaugă PDF-uri și actualizează manifestul.";
    return;
  }

  documents.forEach((item) => {
    const title = String(item.title || "").trim();
    const file = String(item.file || "").trim();
    if (!title || !file) {
      return;
    }

    const li = document.createElement("li");
    const link = document.createElement("a");
    const meta = document.createElement("small");

    link.href = file;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = title;

    meta.textContent = file;

    li.appendChild(link);
    li.appendChild(meta);
    libraryList.appendChild(li);
  });

  if (!libraryList.children.length) {
    libraryList.hidden = true;
    libraryStateText.textContent = "Manifestul există, dar nu conține intrări valide.";
    return;
  }

  libraryStateText.textContent = "Documente disponibile pentru contul autentificat:";
  libraryList.hidden = false;
}

async function loadLibraryDocuments() {
  if (!libraryStateText) {
    return;
  }

  libraryStateText.textContent = "Se încarcă documentele...";

  try {
    const response = await fetch(LIBRARY_MANIFEST_PATH, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    const docs = Array.isArray(payload) ? payload : payload.documents;
    renderLibraryDocuments(Array.isArray(docs) ? docs : []);
  } catch (error) {
    if (LIBRARY_FALLBACK_DOCS.length) {
      renderLibraryDocuments(LIBRARY_FALLBACK_DOCS);
      libraryStateText.textContent =
        "Documente disponibile (mod local demo). Pentru listă din manifest, rulează site-ul prin server local.";
      return;
    }

    if (libraryList) {
      libraryList.hidden = true;
      libraryList.innerHTML = "";
    }

    const localHint =
      window.location.protocol === "file:"
        ? " Rulează site-ul printr-un server local (de exemplu: python3 -m http.server)."
        : "";
    libraryStateText.textContent =
      "Manifestul bibliotecii nu a putut fi citit. Verifică fișierul assets/biblioteca/manifest.json." +
      localHint;
  }
}

function getLibrarySession() {
  try {
    return localStorage.getItem(LIBRARY_SESSION_KEY) === "1";
  } catch (error) {
    return false;
  }
}

function setLibrarySession(isAuthenticated) {
  try {
    if (isAuthenticated) {
      localStorage.setItem(LIBRARY_SESSION_KEY, "1");
      return;
    }

    localStorage.removeItem(LIBRARY_SESSION_KEY);
  } catch (error) {
    // noop: localStorage poate fi blocat în unele contexte
  }
}

function normalizeLibraryUser(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .trim();
}

function isValidLibraryCredentials(username, password) {
  const normalizedUser = normalizeLibraryUser(username);
  const normalizedPass = String(password || "").trim();
  return LIBRARY_DEMO_USERS.has(normalizedUser) && normalizedPass === LIBRARY_DEMO_PASS;
}

function applyLibraryUiState(isAuthenticated) {
  if (!libraryLoginForm || !libraryLogoutBtn || !libraryList || !libraryStateText) {
    return;
  }

  const userField = document.getElementById("libraryUser");
  const passField = document.getElementById("libraryPass");

  if (userField) {
    userField.disabled = false;
  }
  if (passField) {
    passField.disabled = false;
  }

  libraryLogoutBtn.hidden = !isAuthenticated;

  if (isAuthenticated) {
    setLibraryAuthMessage("Ești autentificat. Biblioteca este disponibilă.");
    void loadLibraryDocuments();
    return;
  }

  libraryList.hidden = true;
  libraryList.innerHTML = "";
  libraryStateText.textContent = "Autentifică-te pentru a vedea documentele disponibile.";
}

if (libraryLoginForm) {
  applyLibraryUiState(getLibrarySession());

  libraryLoginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(libraryLoginForm);
    const username = String(data.get("libraryUser") || "").trim();
    const password = String(data.get("libraryPass") || "").trim();

    if (!username || !password) {
      setLibraryAuthMessage("Completează utilizatorul și parola.", "error");
      return;
    }

    if (!isValidLibraryCredentials(username, password)) {
      setLibrarySession(false);
      applyLibraryUiState(false);
      setLibraryAuthMessage(
        `Utilizator sau parolă incorecte. Demo: utilizator ${LIBRARY_DEMO_USER}, parolă ${LIBRARY_DEMO_PASS}.`,
        "error"
      );
      return;
    }

    setLibrarySession(true);
    applyLibraryUiState(true);
    setLibraryAuthMessage("Autentificare reușită. Biblioteca este disponibilă.");
    libraryLoginForm.reset();
  });
}

if (libraryLogoutBtn) {
  libraryLogoutBtn.addEventListener("click", () => {
    setLibrarySession(false);
    applyLibraryUiState(false);
    setLibraryAuthMessage("Te-ai deconectat din biblioteca virtuală.");
  });
}

if ("IntersectionObserver" in window) {
  const isMobileReveal = window.matchMedia("(max-width: 740px)").matches;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: isMobileReveal ? 0.01 : 0.16,
      rootMargin: isMobileReveal ? "0px 0px 18% 0px" : "0px",
    }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

function setupMobileProgramAccordion() {
  const isMobile = window.matchMedia("(max-width: 740px)").matches;
  if (!isMobile) {
    return;
  }

  const getMobileHeadingText = (heading) => {
    const mobileVariant = heading.querySelector(":scope > .mobile-only");
    if (mobileVariant) {
      return String(mobileVariant.textContent || "").trim();
    }

    return String(heading.textContent || "").trim();
  };

  const candidates = document.querySelectorAll("#program-complet .card");
  const accordionCards = [];

  candidates.forEach((card) => {
    if (card.classList.contains("program-accordion")) {
      return;
    }

    const heading = card.querySelector(":scope > h3");
    if (!heading) {
      return;
    }

    const contentElements = Array.from(card.children).filter((child) => child !== heading);
    if (!contentElements.length) {
      return;
    }

    const titleText = getMobileHeadingText(heading);
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "program-accordion-trigger";
    trigger.textContent = titleText;
    trigger.setAttribute("aria-expanded", "false");

    heading.textContent = "";
    heading.appendChild(trigger);

    const contentWrap = document.createElement("div");
    contentWrap.className = "program-accordion-content";
    contentElements.forEach((el) => contentWrap.appendChild(el));

    card.insertBefore(contentWrap, heading.nextSibling);
    card.classList.add("program-accordion");
    accordionCards.push(card);

    trigger.addEventListener("click", () => {
      const wasOpen = card.classList.contains("is-open");

      accordionCards.forEach((item) => {
        item.classList.remove("is-open");
        const itemTrigger = item.querySelector(":scope > h3 > .program-accordion-trigger");
        if (itemTrigger) {
          itemTrigger.setAttribute("aria-expanded", "false");
        }
      });

      if (!wasOpen) {
        card.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });
}

setupMobileProgramAccordion();

function setupMobileSectionAccordions() {
  const isMobile = window.matchMedia("(max-width: 740px)").matches;
  if (!isMobile) {
    return;
  }

  const createTrigger = (className, label) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    button.setAttribute("aria-expanded", "false");
    return button;
  };

  const lecturersSection = document.getElementById("lectori");
  if (lecturersSection && !lecturersSection.classList.contains("mobile-section-collapsible")) {
    const sectionTitle = lecturersSection.querySelector(":scope > .section-head > h2");
    const sectionContent = Array.from(lecturersSection.children).filter(
      (child) => !child.classList.contains("section-head")
    );

    if (sectionTitle && sectionContent.length) {
      const trigger = createTrigger("mobile-section-trigger", String(sectionTitle.textContent || "").trim());
      sectionTitle.textContent = "";
      sectionTitle.appendChild(trigger);

      const contentWrap = document.createElement("div");
      contentWrap.className = "mobile-section-content";
      sectionContent.forEach((node) => contentWrap.appendChild(node));
      lecturersSection.appendChild(contentWrap);
      lecturersSection.classList.add("mobile-section-collapsible");

      trigger.addEventListener("click", () => {
        const isOpen = lecturersSection.classList.toggle("is-open");
        trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    }
  }

  const enrollmentPanels = document.querySelectorAll("#inscriere .panel");
  enrollmentPanels.forEach((panel) => {
    if (panel.classList.contains("mobile-panel-collapsible")) {
      return;
    }

    const heading = panel.querySelector(":scope > h2");
    if (!heading) {
      return;
    }

    const panelContent = Array.from(panel.children).filter((child) => child !== heading);
    if (!panelContent.length) {
      return;
    }

    const trigger = createTrigger("mobile-panel-trigger", String(heading.textContent || "").trim());
    heading.textContent = "";
    heading.appendChild(trigger);

    const contentWrap = document.createElement("div");
    contentWrap.className = "mobile-panel-content";
    panelContent.forEach((node) => contentWrap.appendChild(node));
    panel.appendChild(contentWrap);
    panel.classList.add("mobile-panel-collapsible");

    trigger.addEventListener("click", () => {
      const isOpen = panel.classList.toggle("is-open");
      trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  });

  const infoPanel = document.querySelector("#inscriere .info-panel");
  if (infoPanel && !infoPanel.classList.contains("mobile-docs-ready")) {
    const docsHeading = infoPanel.querySelector("h3");
    const docsList = infoPanel.querySelector("ul");

    if (docsHeading && docsList) {
      const docsTrigger = createTrigger("mobile-docs-trigger", String(docsHeading.textContent || "").trim());
      docsHeading.textContent = "";
      docsHeading.appendChild(docsTrigger);

      const docsWrap = document.createElement("div");
      docsWrap.className = "mobile-docs-content";
      docsList.parentNode.insertBefore(docsWrap, docsList);
      docsWrap.appendChild(docsList);

      infoPanel.classList.add("mobile-docs-ready", "mobile-docs-collapsible");

      docsTrigger.addEventListener("click", () => {
        const isOpen = infoPanel.classList.toggle("docs-open");
        docsTrigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    }
  }
}

setupMobileSectionAccordions();

const yearTarget = document.getElementById("year");
if (yearTarget) {
  yearTarget.textContent = String(new Date().getFullYear());
}
