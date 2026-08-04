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

  const randomBreedFocus = document.querySelector("[data-random-breed-focus]");
  if (randomBreedFocus) {
    const nameElement = randomBreedFocus.querySelector("[data-random-breed-name]");
    const descriptionElement = randomBreedFocus.querySelector("[data-random-breed-description]");
    const factsElement = randomBreedFocus.querySelector("[data-random-breed-facts]");
    const linkElement = randomBreedFocus.querySelector("[data-random-breed-link]");
    const lastFocusKey = "kinnopys-last-focus-breed";

    const storage = (() => {
      try {
        return window.localStorage;
      } catch {
        return null;
      }
    })();

    const hasPhoto = (breed) => typeof breed.image === "string" && breed.image.trim().length > 0;
    const pickBreed = (breeds) => {
      const lastSlug = storage?.getItem(lastFocusKey);
      const candidates = breeds.length > 1 ? breeds.filter((breed) => breed.slug !== lastSlug) : breeds;
      return candidates[Math.floor(Math.random() * candidates.length)];
    };

    const addFact = (number, label, value) => {
      if (!factsElement || !value) return;
      const item = document.createElement("div");
      const numberElement = document.createElement("span");
      const copyElement = document.createElement("span");
      const labelElement = document.createElement("strong");

      numberElement.className = "feature-number";
      numberElement.textContent = String(number);
      labelElement.textContent = label;
      copyElement.append(labelElement, value);
      item.append(numberElement, copyElement);
      factsElement.append(item);
    };

    const renderFocusBreed = (breed) => {
      if (nameElement) nameElement.textContent = breed.nameUk;
      if (descriptionElement) descriptionElement.textContent = breed.description;
      if (linkElement) linkElement.setAttribute("href", `breeds.html#breed-${breed.slug}`);
      if (factsElement) {
        factsElement.innerHTML = "";
        addFact(1, "Походження", breed.origin);
        addFact(2, "Тип / група", breed.type);
        addFact(3, "Використання", breed.use);
      }
      storage?.setItem(lastFocusKey, breed.slug);
    };

    fetch("data/breeds.json")
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((breeds) => {
        if (!Array.isArray(breeds)) return;
        const breedsWithPhotos = breeds.filter(hasPhoto);
        if (breedsWithPhotos.length) renderFocusBreed(pickBreed(breedsWithPhotos));
      })
      .catch((error) => {
        console.error(error);
      });
  }

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
