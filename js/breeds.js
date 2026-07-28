(() => {
  "use strict";

  const PAGE_SIZE = 30;
  const grid = document.querySelector("#breed-grid");
  if (!grid) return;

  const searchInput = document.querySelector("#breed-search");
  const categorySelect = document.querySelector("#breed-category");
  const typeSelect = document.querySelector("#breed-type");
  const originSelect = document.querySelector("#breed-origin");
  const sortSelect = document.querySelector("#breed-sort");
  const ukrainianOnly = document.querySelector("#breed-ukrainian");
  const resetButton = document.querySelector("#breed-reset");
  const countLabel = document.querySelector("#breed-count");
  const pageLabel = document.querySelector("#breed-page-label");
  const emptyState = document.querySelector("#breed-empty");
  const pagination = document.querySelector("#breed-pagination");
  const modal = document.querySelector("#breed-modal");
  const modalPanel = modal?.querySelector(".breed-modal-panel");
  const modalContent = document.querySelector("#breed-modal-content");
  const modalClose = document.querySelector("#breed-modal-close");

  let allBreeds = [];
  let filteredBreeds = [];
  let currentPage = Number(document.body.dataset.catalogPage || 1);
  let lastFocusedElement = null;

  const collator = new Intl.Collator("uk", { sensitivity: "base" });

  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const normalize = (value) => String(value ?? "")
    .toLocaleLowerCase("uk")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const pageFile = (page) => page === 1 ? "breeds.html" : `breeds-${page}.html`;

  const pageFromPath = () => {
    const file = window.location.pathname.split("/").pop() || "breeds.html";
    const match = file.match(/^breeds-(\d+)\.html$/);
    return match ? Number(match[1]) : 1;
  };

  const setUrlForPage = (page, replace = false) => {
    const nextUrl = pageFile(page) + window.location.hash;
    const method = replace ? "replaceState" : "pushState";
    window.history[method]({ page }, "", nextUrl);
  };

  const fillSelect = (select, values, firstLabel) => {
    if (!select) return;
    select.innerHTML = `<option value="all">${escapeHtml(firstLabel)}</option>` +
      values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("");
  };

  const placeholderMarkup = (breed, large = false) => `
    <div class="breed-placeholder${large ? " breed-placeholder-large" : ""}" aria-label="${escapeHtml(breed.imageAlt)}">
      <img src="assets/icons/logo.svg" alt="">
      <span>Фото буде додано</span>
    </div>`;

  const imageMarkup = (breed, large = false) => breed.image
    ? `<img class="${large ? "modal-breed-image" : "breed-card-image"}" src="${escapeHtml(breed.image)}" alt="${escapeHtml(breed.imageAlt)}" loading="${large ? "eager" : "lazy"}">`
    : placeholderMarkup(breed, large);

  const cardMarkup = (breed) => {
    const tags = breed.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
    return `
      <article class="breed-card" data-breed-slug="${escapeHtml(breed.slug)}">
        <button class="breed-card-button" type="button" data-open-breed="${escapeHtml(breed.slug)}" aria-label="Відкрити інформацію про породу ${escapeHtml(breed.nameUk)}">
          <div class="breed-card-media">
            ${imageMarkup(breed)}
            ${breed.image ? '<span class="breed-photo-badge">фото</span>' : ""}
            <span class="breed-card-origin">${escapeHtml(breed.origin)}</span>
          </div>
          <div class="breed-card-body">
            <p class="breed-card-en">${escapeHtml(breed.nameEn)}</p>
            <h2>${escapeHtml(breed.nameUk)}</h2>
            <p class="breed-card-description">${escapeHtml(breed.description)}</p>
            <div class="card-meta">${tags}</div>
            <span class="breed-more">Докладніше <span aria-hidden="true">→</span></span>
          </div>
        </button>
      </article>`;
  };

  const modalMarkup = (breed) => {
    const tags = breed.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
    const photoCredit = breed.image
      ? `<p class="breed-photo-credit">Фото: <a href="${escapeHtml(breed.imageSource)}" target="_blank" rel="noopener noreferrer">${escapeHtml(breed.imageAuthor)}</a> · ${escapeHtml(breed.imageLicense)}</p>`
      : `<p class="breed-photo-credit">Для цієї породи поки використано стилізовану заглушку.</p>`;

    return `
      <div class="breed-modal-layout">
        <div class="breed-modal-media">
          ${imageMarkup(breed, true)}
          ${photoCredit}
        </div>
        <div class="breed-modal-copy">
          <p class="breed-modal-eyebrow">${escapeHtml(breed.nameEn)}</p>
          <h2 id="breed-modal-title">${escapeHtml(breed.nameUk)}</h2>
          <div class="card-meta breed-modal-tags">${tags}</div>
          <p id="breed-modal-description" class="breed-modal-description">${escapeHtml(breed.description)}</p>
          <dl class="breed-facts">
            <div><dt>Походження</dt><dd>${escapeHtml(breed.origin)}</dd></div>
            <div><dt>Категорія</dt><dd>${escapeHtml(breed.category)}</dd></div>
            <div><dt>Тип / група</dt><dd>${escapeHtml(breed.type)}</dd></div>
            <div><dt>Використання</dt><dd>${escapeHtml(breed.use)}</dd></div>
            <div><dt>Типові масті</dt><dd>${escapeHtml(breed.colors)}</dd></div>
            <div><dt>Статус</dt><dd>${escapeHtml(breed.status)}</dd></div>
          </dl>
          <div class="breed-modal-links">
            <a class="button button-primary" href="${escapeHtml(breed.sourceUrl)}" target="_blank" rel="noopener noreferrer">Довідкова стаття</a>
            <a class="button button-secondary" href="${escapeHtml(breed.galleryUrl)}" target="_blank" rel="noopener noreferrer">Галерея фотографій</a>
          </div>
        </div>
      </div>`;
  };

  const openModal = (breed, updateHash = true) => {
    if (!modal || !modalContent) return;
    lastFocusedElement = document.activeElement;
    modalContent.innerHTML = modalMarkup(breed);
    modal.hidden = false;
    document.body.classList.add("modal-open");
    modalClose?.focus();
    if (updateHash) {
      window.history.replaceState(window.history.state, "", `${window.location.pathname}#breed-${breed.slug}`);
    }
  };

  const closeModal = () => {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    if (window.location.hash.startsWith("#breed-")) {
      window.history.replaceState(window.history.state, "", window.location.pathname);
    }
    if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
  };

  // Deliberately only the × button closes the modal.
  modalClose?.addEventListener("click", closeModal);

  modalPanel?.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const focusable = [...modalPanel.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
      .filter((element) => !element.hasAttribute("disabled"));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  const getFiltered = () => {
    const query = normalize(searchInput?.value.trim());
    const category = categorySelect?.value || "all";
    const type = typeSelect?.value || "all";
    const origin = originSelect?.value || "all";
    const onlyUkrainian = Boolean(ukrainianOnly?.checked);

    const result = allBreeds.filter((breed) => {
      const haystack = normalize([
        breed.nameUk, breed.nameEn, breed.origin, breed.type,
        breed.use, breed.colors, breed.description, breed.status
      ].join(" "));
      return (!query || haystack.includes(query))
        && (category === "all" || breed.category === category)
        && (type === "all" || breed.type === type)
        && (origin === "all" || breed.origin === origin)
        && (!onlyUkrainian || breed.isUkrainian);
    });

    const sort = sortSelect?.value || "name-asc";
    result.sort((a, b) => {
      if (sort === "name-desc") return collator.compare(b.nameUk, a.nameUk);
      if (sort === "origin") {
        return collator.compare(a.origin, b.origin) || collator.compare(a.nameUk, b.nameUk);
      }
      return collator.compare(a.nameUk, b.nameUk);
    });
    return result;
  };

  const paginationItems = (page, totalPages) => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
    const values = new Set([1, totalPages, page, page - 1, page + 1, page - 2, page + 2]);
    return [...values].filter((value) => value >= 1 && value <= totalPages).sort((a, b) => a - b);
  };

  const renderPagination = (totalPages) => {
    if (!pagination) return;
    if (totalPages <= 1) {
      pagination.innerHTML = "";
      return;
    }
    const pages = paginationItems(currentPage, totalPages);
    const parts = [];
    parts.push(`<a class="pagination-arrow${currentPage === 1 ? " is-disabled" : ""}" href="${pageFile(Math.max(1, currentPage - 1))}" data-page="${Math.max(1, currentPage - 1)}" aria-label="Попередня сторінка">←</a>`);
    pages.forEach((page, index) => {
      if (index && page - pages[index - 1] > 1) parts.push('<span class="pagination-ellipsis">…</span>');
      parts.push(`<a class="pagination-link${page === currentPage ? " is-active" : ""}" href="${pageFile(page)}" data-page="${page}"${page === currentPage ? ' aria-current="page"' : ""}>${page}</a>`);
    });
    parts.push(`<a class="pagination-arrow${currentPage === totalPages ? " is-disabled" : ""}" href="${pageFile(Math.min(totalPages, currentPage + 1))}" data-page="${Math.min(totalPages, currentPage + 1)}" aria-label="Наступна сторінка">→</a>`);
    pagination.innerHTML = parts.join("");
  };

  const render = ({ updateUrl = false, replaceUrl = false } = {}) => {
    filteredBreeds = getFiltered();
    const totalPages = Math.max(1, Math.ceil(filteredBreeds.length / PAGE_SIZE));
    currentPage = Math.min(Math.max(1, currentPage), totalPages);

    const start = (currentPage - 1) * PAGE_SIZE;
    const pageBreeds = filteredBreeds.slice(start, start + PAGE_SIZE);
    grid.innerHTML = pageBreeds.map(cardMarkup).join("");

    const from = filteredBreeds.length ? start + 1 : 0;
    const to = Math.min(start + PAGE_SIZE, filteredBreeds.length);
    countLabel.textContent = `Знайдено: ${filteredBreeds.length} із ${allBreeds.length}`;
    pageLabel.textContent = filteredBreeds.length ? `Показано ${from}–${to}` : "";
    emptyState.style.display = filteredBreeds.length ? "none" : "block";
    renderPagination(totalPages);

    if (updateUrl) setUrlForPage(currentPage, replaceUrl);
  };

  const resetFilters = () => {
    if (searchInput) searchInput.value = "";
    if (categorySelect) categorySelect.value = "all";
    if (typeSelect) typeSelect.value = "all";
    if (originSelect) originSelect.value = "all";
    if (sortSelect) sortSelect.value = "name-asc";
    if (ukrainianOnly) ukrainianOnly.checked = false;
    currentPage = 1;
    render({ updateUrl: true });
  };

  [searchInput, categorySelect, typeSelect, originSelect, sortSelect, ukrainianOnly].forEach((control) => {
    control?.addEventListener(control === searchInput ? "input" : "change", () => {
      currentPage = 1;
      render({ updateUrl: true });
    });
  });
  resetButton?.addEventListener("click", resetFilters);

  grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-open-breed]");
    if (!button) return;
    const breed = allBreeds.find((item) => item.slug === button.dataset.openBreed);
    if (breed) openModal(breed);
  });

  pagination?.addEventListener("click", (event) => {
    const link = event.target.closest("[data-page]");
    if (!link || link.classList.contains("is-disabled")) return;
    event.preventDefault();
    currentPage = Number(link.dataset.page);
    render({ updateUrl: true });
    document.querySelector(".catalog-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  window.addEventListener("popstate", () => {
    currentPage = pageFromPath();
    render();
  });

  fetch("data/breeds.json")
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => {
      allBreeds = data;
      const types = [...new Set(allBreeds.map((breed) => breed.type).filter(Boolean))].sort(collator.compare);
      const origins = [...new Set(allBreeds.map((breed) => breed.origin).filter(Boolean))].sort(collator.compare);
      fillSelect(typeSelect, types, "Усі типи");
      fillSelect(originSelect, origins, "Усі країни й регіони");
      currentPage = pageFromPath();
      render({ updateUrl: false });

      if (window.location.hash.startsWith("#breed-")) {
        const slug = window.location.hash.replace("#breed-", "");
        const breed = allBreeds.find((item) => item.slug === slug);
        if (breed) openModal(breed, false);
      }
    })
    .catch((error) => {
      console.error(error);
      countLabel.textContent = "Не вдалося завантажити каталог.";
      grid.innerHTML = '<div class="note"><strong>Помилка:</strong> відкрийте сайт через GitHub Pages, Vercel або локальний вебсервер — браузер може блокувати завантаження JSON при відкритті HTML безпосередньо з диска.</div>';
    });
})();