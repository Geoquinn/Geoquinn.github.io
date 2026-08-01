const navToggle = document.querySelector(".nav-toggle");
const primaryNav = document.querySelector(".primary-nav");
const year = document.querySelector("#current-year");

if (year) year.textContent = new Date().getFullYear();

function closeNavigation() {
  if (!navToggle || !primaryNav) return;
  navToggle.setAttribute("aria-expanded", "false"); 
  primaryNav.classList.remove("is-open");
}

if (navToggle && primaryNav) {
  navToggle.addEventListener("click", () => {
    const nextOpen = navToggle.getAttribute("aria-expanded") !== "true";
    navToggle.setAttribute("aria-expanded", String(nextOpen));
    primaryNav.classList.toggle("is-open", nextOpen);
  });

  primaryNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNavigation));
  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) closeNavigation();
  });
}

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver(
    (entries, revealObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.1 },
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

document.querySelectorAll(".accordion-list").forEach((group) => {
  const details = [...group.querySelectorAll("details")];
  details.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      details.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });
});
