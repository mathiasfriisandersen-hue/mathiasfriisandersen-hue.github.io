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

const GA_MEASUREMENT_ID = "G-LKCEH8HGQ7";
const ANALYTICS_CONSENT_KEY = "mfa-analytics-consent";
let isGoogleAnalyticsLoaded = false;

const analyticsLabels = {
  da: {
    title: "Må jeg bruge analysecookies?",
    text: "Jeg bruger Google Analytics til at forstå, hvordan hjemmesiden bliver brugt. Analytics indlæses kun, hvis du accepterer. Du kan altid ændre dit valg.",
    accept: "Acceptér analytics",
    reject: "Kun nødvendige",
    settings: "Cookieindstillinger",
  },
  en: {
    title: "May I use analytics cookies?",
    text: "I use Google Analytics to understand how this website is used. Analytics only loads if you accept, and you can change your choice at any time.",
    accept: "Accept analytics",
    reject: "Necessary only",
    settings: "Cookie settings",
  },
};

window.dataLayer = window.dataLayer || [];
window.gtag =
  window.gtag ||
  function gtag() {
    window.dataLayer.push(arguments);
  };

window.gtag("consent", "default", {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
  wait_for_update: 500,
});

function loadGoogleAnalytics() {
  if (isGoogleAnalyticsLoaded) return;

  isGoogleAnalyticsLoaded = true;
  window.gtag("consent", "update", {
    analytics_storage: "granted",
  });
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID);

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.dataset.googleAnalytics = GA_MEASUREMENT_ID;
  document.head.append(script);
}

function removeAnalyticsCookies() {
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

function saveAnalyticsConsent(value) {
  localStorage.setItem(ANALYTICS_CONSENT_KEY, value);
  document.querySelector("[data-cookie-banner]")?.remove();

  if (value === "granted") {
    loadGoogleAnalytics();
  } else {
    window.gtag("consent", "update", { analytics_storage: "denied" });
    removeAnalyticsCookies();
  }

  showCookieSettings();
}

function showCookieSettings() {
  if (document.querySelector("[data-cookie-settings]")) return;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "cookie-settings";
  button.dataset.cookieSettings = "";
  button.textContent = analyticsLabels[currentLanguage].settings;
  button.addEventListener("click", showCookieBanner);
  document.body.append(button);
}

function showCookieBanner() {
  document.querySelector("[data-cookie-settings]")?.remove();
  if (document.querySelector("[data-cookie-banner]")) return;

  const labels = analyticsLabels[currentLanguage];
  const banner = document.createElement("section");
  banner.className = "cookie-banner";
  banner.dataset.cookieBanner = "";
  banner.setAttribute("aria-label", labels.title);
  banner.innerHTML = `
    <div class="cookie-banner__content">
      <div>
        <h2>${labels.title}</h2>
        <p>${labels.text}</p>
      </div>
      <div class="cookie-banner__actions">
        <button class="btn btn-primary" type="button" data-analytics-accept>${labels.accept}</button>
        <button class="btn btn-secondary" type="button" data-analytics-reject>${labels.reject}</button>
      </div>
    </div>
  `;

  banner.querySelector("[data-analytics-accept]").addEventListener("click", () => {
    saveAnalyticsConsent("granted");
  });
  banner.querySelector("[data-analytics-reject]").addEventListener("click", () => {
    saveAnalyticsConsent("denied");
  });
  document.body.append(banner);
}

function initializeAnalyticsConsent() {
  const consent = localStorage.getItem(ANALYTICS_CONSENT_KEY);

  if (consent === "granted") {
    loadGoogleAnalytics();
    showCookieSettings();
  } else if (consent === "denied") {
    showCookieSettings();
  } else {
    showCookieBanner();
  }
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
initializeAnalyticsConsent();
mobileNavQuery.addEventListener("change", closeMenu);
window.addEventListener("scroll", setHeaderState, { passive: true });
window.addEventListener("resize", setResizeMode, { passive: true });
