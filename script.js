const header = document.querySelector("[data-site-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu = document.querySelector("[data-nav-menu]");
const navLinks = [...document.querySelectorAll(".nav-links a")];
const currentPage = document.body.dataset.page;
const mobileNavQuery = window.matchMedia("(max-width: 760px)");
const navToggleLabel = navToggle?.querySelector(".sr-only");

function setHeaderState() {
  header?.classList.toggle("is-scrolled", window.scrollY > 16);
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
    navToggleLabel.textContent = isOpen ? "Luk menu" : "Åbn menu";
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
mobileNavQuery.addEventListener("change", closeMenu);
window.addEventListener("scroll", setHeaderState, { passive: true });
