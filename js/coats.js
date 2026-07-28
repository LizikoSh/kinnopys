(() => {
  "use strict";

  const container = document.querySelector("#coat-sections");
  if (!container) return;

  const searchInput = document.querySelector("#coat-search");
  const countLabel = document.querySelector("#coat-count");
  const jumpNav = document.querySelector("#coat-jump-nav");
  const emptyState = document.querySelector("#coat-empty");
  let allCoats = [];

  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const normalize = (value) => String(value ?? "").toLocaleLowerCase("uk");

  const groupDefinitions = [
    { id: "base", title: "Базові масті та відтінки", groups: ["Базова", "Базова / відтінок"] },
    { id: "cream", title: "Кремові освітлення", groups: ["Кремове освітлення", "Подвійне кремове"] },
    { id: "dun", title: "Саврасі масті й примітивні ознаки", groups: ["Dun-освітлення", "Примітивна відмітина"] },
    { id: "dilutions", title: "Шампанські та інші освітлення", groups: ["Champagne", "Silver dilution", "Pearl", "Mushroom dilution"] },
    { id: "gray", title: "Сірі та білі масті", groups: ["Прогресивне посивіння", "Сіра / стадія", "Біла"] },
    { id: "roan", title: "Чалі масті", groups: ["Чала", "Чала / патерн"] },
    { id: "pinto", title: "Рябі патерни", groups: ["Ряба", "Ряба / білі відмітини", "Комбінована ряба"] },
    { id: "leopard", title: "Леопардовий комплекс", groups: ["Леопардовий комплекс"] },
    { id: "modifiers", title: "Модифікатори й рідкісні патерни", groups: ["Модифікатор", "Модифікована", "Рідкісний патерн"] },
  ];

  const swatches = {
    "Ворона": "linear-gradient(145deg,#33363b,#050608)",
    "Невигоряюча ворона": "linear-gradient(145deg,#202225,#000)",
    "Вигоріла ворона": "linear-gradient(145deg,#4b352d,#171719)",
    "Гніда": "linear-gradient(145deg,#a55f34 0 58%,#151618 59% 100%)",
    "Темно-гніда": "linear-gradient(145deg,#532f25 0 62%,#101113 63% 100%)",
    "Каракова": "radial-gradient(circle at 25% 70%,#8b4e31 0 14%,transparent 15%),linear-gradient(145deg,#201b1a,#050506)",
    "Руда": "linear-gradient(145deg,#e39a55,#7c2f1c)",
    "Світло-руда (сорел)": "linear-gradient(145deg,#f0a45b,#b95427)",
    "Темно-руда": "linear-gradient(145deg,#6a2a20,#2d1717)",
    "Руда з освітленою гривою": "linear-gradient(120deg,#b95f2e 0 68%,#f1dfbd 69%)",
    "Солова": "linear-gradient(135deg,#e7bd58 0 68%,#f6ead0 69%)",
    "Булана": "linear-gradient(135deg,#d5a84c 0 68%,#1a1b1d 69%)",
    "Димчасто-ворона": "linear-gradient(145deg,#51473f,#16171a)",
    "Кремелло": "linear-gradient(145deg,#fff8e9,#ead9bd)",
    "Перліно": "linear-gradient(135deg,#f4ead7 0 70%,#c9aa8d 71%)",
    "Димчастий крем": "linear-gradient(145deg,#e5d9c8,#b9aa9d)",
    "Савраса (класичний dun)": "linear-gradient(90deg,#c7a76a 0 70%,#24282a 70% 76%,#c7a76a 76% 82%,#24282a 82%)",
    "Каура": "linear-gradient(90deg,#d18a52 0 70%,#81391f 70% 76%,#d18a52 76%)",
    "Мишаста": "linear-gradient(90deg,#858681 0 70%,#222427 70% 78%,#858681 78%)",
    "Сіра": "linear-gradient(145deg,#f3f3f0,#777d84)",
    "Темно-сіра (сталева)": "linear-gradient(145deg,#a7abb0,#34383d)",
    "Сіра в яблуках": "radial-gradient(circle,#e5e5e2 0 22%,#777b80 23% 48%,#b8bbbe 49%)",
    "Сіра в гречку": "radial-gradient(circle at 20% 30%,#8f4935 0 2%,transparent 3%),radial-gradient(circle at 70% 65%,#6f4237 0 2%,transparent 3%),#eeeae2",
    "Рожево-сіра": "linear-gradient(145deg,#ead7d2,#96736f)",
    "Домінантно-біла": "linear-gradient(145deg,#fff,#ecebe7)",
    "Чала гніда": "repeating-linear-gradient(120deg,#8f5034 0 8px,#e4ddd7 8px 11px)",
    "Чала руда": "repeating-linear-gradient(120deg,#b7643c 0 8px,#eadbd3 8px 11px)",
    "Чала ворона": "repeating-linear-gradient(120deg,#25282c 0 8px,#d8dadd 8px 11px)",
    "Тобіано": "radial-gradient(circle at 22% 32%,#fff 0 22%,transparent 23%),radial-gradient(circle at 76% 68%,#fff 0 28%,transparent 29%),#68412f",
    "Фрейм-оверо": "radial-gradient(ellipse at 48% 55%,#fff 0 34%,transparent 35%),#7a3e2b",
    "Сплешед-вайт": "linear-gradient(165deg,#6f4737 0 44%,#fff 45%)",
    "Сабіно": "repeating-radial-gradient(circle at 20% 80%,#fff 0 10px,#9d593e 12px 27px)",
    "Товеро": "radial-gradient(circle at 35% 45%,#5f3b2e 0 16%,transparent 17%),radial-gradient(circle at 78% 22%,#5f3b2e 0 11%,transparent 12%),#fff",
    "Леопардова": "radial-gradient(circle,#5b3326 0 9%,transparent 10%),#f1eee8",
    "Чепрачна": "linear-gradient(110deg,#6f3c29 0 50%,#eeeae1 51%),radial-gradient(circle at 78% 50%,#5c3225 0 6%,transparent 7%)",
    "Снігова шапка": "linear-gradient(110deg,#71402e 0 50%,#f2efe7 51%)",
    "Малоплямиста леопардова": "radial-gradient(circle at 18% 22%,#46312c 0 3%,transparent 4%),radial-gradient(circle at 82% 72%,#46312c 0 3%,transparent 4%),#f3f1ec",
    "Лакова чала": "radial-gradient(circle at 25% 35%,#684134 0 15%,transparent 16%),radial-gradient(circle at 70% 65%,#684134 0 13%,transparent 14%),#c9b5a8",
    "Сніжинка": "radial-gradient(circle,#fff 0 6%,transparent 7%),#57382f",
    "Пангара": "linear-gradient(145deg,#9e6947 0 65%,#dfc39f 66%)",
    "Сажиста": "linear-gradient(180deg,#38312d,#a66a43)",
    "Бриндл": "repeating-linear-gradient(100deg,#784733 0 12px,#342824 12px 18px,#a56a46 18px 30px)",
    "Химера / мозаїчна": "conic-gradient(#b86a3c,#eee6d8,#26272b,#b86a3c)",
  };

  const swatchFor = (coat) => {
    if (swatches[coat.nameUk]) return swatches[coat.nameUk];
    if (coat.group === "Champagne") return "linear-gradient(145deg,#e2bd78,#8e6845)";
    if (coat.group === "Silver dilution") return "linear-gradient(145deg,#4d362e 0 64%,#d9d7ce 65%)";
    if (coat.group === "Pearl") return "linear-gradient(145deg,#f0c7a1,#eadfd3)";
    if (coat.group === "Mushroom dilution") return "linear-gradient(145deg,#aa9a87,#655b52)";
    if (coat.group === "Примітивна відмітина") return "linear-gradient(90deg,#b99b68 0 43%,#292a2c 44% 53%,#b99b68 54%)";
    if (coat.group.includes("Ряба")) return "radial-gradient(circle at 35% 35%,#fff 0 24%,transparent 25%),#7d4934";
    if (coat.group === "Леопардовий комплекс") return "radial-gradient(circle,#5b3326 0 8%,transparent 9%),#eeeae2";
    return "linear-gradient(145deg,#c99b73,#5a4032)";
  };

  const cardMarkup = (coat) => `
    <article class="coat-reference-card" id="coat-${escapeHtml(coat.slug)}">
      <div class="coat-reference-swatch" style="--swatch:${swatchFor(coat)}" role="img" aria-label="Умовний зразок: ${escapeHtml(coat.appearance)}"></div>
      <div class="coat-reference-body">
        <p class="coat-reference-en">${escapeHtml(coat.nameEn)}</p>
        <h3>${escapeHtml(coat.nameUk)}</h3>
        <p>${escapeHtml(coat.description)}</p>
        <dl class="coat-details">
          <div><dt>Генетика</dt><dd>${escapeHtml(coat.genetics)}</dd></div>
          <div><dt>Вигляд</dt><dd>${escapeHtml(coat.appearance)}</dd></div>
          <div><dt>Приклади</dt><dd>${escapeHtml(coat.examples)}</dd></div>
        </dl>
        <div class="coat-card-links">
          <a href="${escapeHtml(coat.sourceUrl)}" target="_blank" rel="noopener noreferrer">Довідка</a>
          <a href="${escapeHtml(coat.galleryUrl)}" target="_blank" rel="noopener noreferrer">Фото</a>
        </div>
      </div>
    </article>`;

  const render = () => {
    const query = normalize(searchInput?.value.trim());
    let shown = 0;
    let visibleGroups = 0;

    const sections = groupDefinitions.map((definition) => {
      const items = allCoats.filter((coat) => {
        if (!definition.groups.includes(coat.group)) return false;
        const haystack = normalize([coat.nameUk, coat.nameEn, coat.group, coat.genetics, coat.description, coat.appearance, coat.examples].join(" "));
        return !query || haystack.includes(query);
      });
      if (!items.length) return "";
      shown += items.length;
      visibleGroups += 1;
      return `
        <section class="coat-group-section" id="${definition.id}">
          <div class="coat-group-heading">
            <p class="eyebrow">${items.length} позицій</p>
            <h2>${escapeHtml(definition.title)}</h2>
          </div>
          <div class="coat-reference-grid">${items.map(cardMarkup).join("")}</div>
        </section>`;
    }).join("");

    container.innerHTML = sections;
    countLabel.textContent = `Показано: ${shown} із ${allCoats.length}`;
    emptyState.style.display = shown ? "none" : "block";

    jumpNav.innerHTML = groupDefinitions
      .filter((definition) => !query || document.querySelector(`#${definition.id}`))
      .map((definition) => `<a href="#${definition.id}">${escapeHtml(definition.title)}</a>`)
      .join("");
    jumpNav.style.display = visibleGroups ? "flex" : "none";
  };

  searchInput?.addEventListener("input", render);

  fetch("data/coats.json")
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => {
      allCoats = data;
      render();
    })
    .catch((error) => {
      console.error(error);
      countLabel.textContent = "Не вдалося завантажити дані.";
      container.innerHTML = '<div class="note"><strong>Помилка:</strong> відкрийте сайт через GitHub Pages, Vercel або локальний вебсервер.</div>';
    });
})();