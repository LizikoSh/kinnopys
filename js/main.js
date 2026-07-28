(() => {
  "use strict";

  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");

  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        nav.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
      }
    });
  }

  const currentFile = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a").forEach((link) => {
    const href = link.getAttribute("href");
    const isBreedPage = /^breeds(?:-\d+)?\.html$/.test(currentFile) && href === "breeds.html";
    if (href === currentFile || isBreedPage) link.classList.add("is-active");
  });

  const glossaryInput = document.querySelector("#glossary-search");
  const glossaryItems = document.querySelectorAll("[data-glossary]");
  const emptyState = document.querySelector("#glossary-empty");
  if (glossaryInput && glossaryItems.length) {
    glossaryInput.addEventListener("input", () => {
      const query = glossaryInput.value.trim().toLowerCase();
      let count = 0;
      glossaryItems.forEach((item) => {
        const matches = item.textContent.toLowerCase().includes(query);
        item.classList.toggle("card-hidden", !matches);
        if (matches) count += 1;
      });
      if (emptyState) emptyState.style.display = count ? "none" : "block";
    });
  }

  const revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          instance.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealElements.forEach((element) => observer.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  const backToTop = document.querySelector(".back-to-top");
  if (backToTop) {
    const updateBackToTop = () => backToTop.classList.toggle("is-visible", window.scrollY > 600);
    window.addEventListener("scroll", updateBackToTop, { passive: true });
    updateBackToTop();
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
  });
})();