const header = document.querySelector("[data-site-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu = document.querySelector("[data-nav-menu]");
const navLinks = [...document.querySelectorAll(".nav-links a")];
const currentPage = document.body.dataset.page;
const currentLanguage = document.documentElement.lang === "en" ? "en" : "da";
const mobileNavQuery = window.matchMedia("(max-width: 760px)");
const navToggleLabel = navToggle?.querySelector(".sr-only");
let resizeTimer;
let isResizeMode = false;
const menuLabels = {
  da: {
    open: "Åbn menu",
    close: "Luk menu",
  },
  en: {
    open: "Open menu",
    close: "Close menu",
  },
};

function clearLegacyAnalyticsData() {
  try {
    localStorage.removeItem("mfa-analytics-consent");
  } catch {
    // Storage may be unavailable in privacy-focused browser modes.
  }

  const hostname = window.location.hostname;
  const rootDomain = hostname.split(".").slice(-2).join(".");

  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0].trim();
    if (name === "_ga" || name.startsWith("_ga_")) {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
      document.cookie = `${name}=; Max-Age=0; path=/; domain=.${rootDomain}; SameSite=Lax`;
    }
  });
}

function setHeaderState() {
  header?.classList.toggle("is-scrolled", window.scrollY > 16);
}

function setResizeMode() {
  if (!isResizeMode) {
    document.documentElement.classList.add("is-resizing");
    isResizeMode = true;
  }

  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => {
    document.documentElement.classList.remove("is-resizing");
    isResizeMode = false;
  }, 320);
}

function closeMenu() {
  document.body.classList.remove("nav-open");
  navMenu?.classList.remove("is-open");
  navToggle?.setAttribute("aria-expanded", "false");
  updateMenuA11y();
}

function updateMenuA11y() {
  const isMobile = mobileNavQuery.matches;
  const isOpen = navToggle?.getAttribute("aria-expanded") === "true";

  navMenu?.setAttribute("aria-hidden", String(isMobile && !isOpen));
  navLinks.forEach((link) => {
    if (isMobile && !isOpen) {
      link.setAttribute("tabindex", "-1");
    } else {
      link.removeAttribute("tabindex");
    }
  });

  if (navToggleLabel) {
    navToggleLabel.textContent = isOpen ? menuLabels[currentLanguage].close : menuLabels[currentLanguage].open;
  }
}

navLinks.forEach((link) => {
  if (link.dataset.pageLink === currentPage) {
    link.classList.add("is-active");
    link.setAttribute("aria-current", "page");
  }

  link.addEventListener("click", closeMenu);
});

navToggle?.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  document.body.classList.toggle("nav-open", !isOpen);
  navMenu?.classList.toggle("is-open", !isOpen);
  navToggle.setAttribute("aria-expanded", String(!isOpen));
  updateMenuA11y();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 },
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

setHeaderState();
updateMenuA11y();
clearLegacyAnalyticsData();
mobileNavQuery.addEventListener("change", closeMenu);
window.addEventListener("scroll", setHeaderState, { passive: true });
window.addEventListener("resize", setResizeMode, { passive: true });
