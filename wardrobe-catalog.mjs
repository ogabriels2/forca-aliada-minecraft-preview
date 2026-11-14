import { createCreationsClient } from "./creations-client.mjs?v=microsoft-20261113";
import { CATEGORIES, PART_TYPES, SAMPLE_PARTS, safePart } from "./skin-parts.mjs?v=wardrobe-20261113";
import { drawSkinFront, imagePixels } from "./skin-viewer.mjs";
import { overlay } from "./skin-pixels.mjs?v=microsoft-20261113";

export function renderWardrobeCatalog(main, { esc, icon, paintIcons, report, getUser }) {
  const remote = createCreationsClient();
  main.innerHTML = `<section class="container profile-parts wardrobe-catalog" aria-labelledby="wardrobe-title">
    <a class="text-link" href="#/skins">${icon("arrow-left")} Catálogo de skins</a>
    <div class="wardrobe-heading"><div><h1 id="wardrobe-title">Roupas para skins</h1><p>Experimente cabelos, roupas e calçados no seu personagem.</p></div><a class="button secondary" href="#/skins/editor?criar=peca">${icon("plus")} Criar uma peça</a></div>
    <div class="skin-toolbar">
      <label class="skin-search">${icon("search")}<span class="sr-only">Buscar roupas</span><input type="search" placeholder="Nome ou criador"></label>
      <label class="select-wrap"><span class="sr-only">Categoria</span><select name="category" aria-label="Categoria"><option value="">Todas as categorias</option>${Object.entries(CATEGORIES).map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}</select></label>
      <label class="select-wrap"><span class="sr-only">Tipo</span><select name="type" aria-label="Tipo" disabled><option value="">Todos os tipos</option></select></label>
      <label class="select-wrap"><span class="sr-only">Modelo da skin</span><select name="model" aria-label="Modelo da skin"><option value="">Todos os modelos</option><option value="classic">Clássico</option><option value="slim">Slim</option></select></label>
    </div>
    <p class="skin-count" role="status"></p>
    <div class="profile-parts-grid"></div>
    <button type="button" class="button secondary wardrobe-more" hidden>Carregar mais peças</button>
  </section>`;
  const section = main.querySelector(".wardrobe-catalog");
  const grid = section.querySelector(".profile-parts-grid");
  const status = section.querySelector(".skin-count");
  const more = section.querySelector(".wardrobe-more");
  const search = section.querySelector("input");
  const category = section.querySelector('[name="category"]');
  const type = section.querySelector('[name="type"]');
  const model = section.querySelector('[name="model"]');
  const bases = new Map();
  let nextOffset = null, controller, timer;
  const normalize = value => value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

  async function draw(canvas, part) {
    const variant = part.model === "both" ? (model.value || "classic") : part.model;
    try {
      if (!bases.has(variant)) {
        bases.set(variant, imagePixels(variant === "slim" ? "./assets/skins/alex.png" : "./assets/skins/steve.png"));
      }
      const base = await bases.get(variant);
      const pixels = part.sample ? part.pixelsFor(variant) : await imagePixels(part.image);
      if (canvas.isConnected) drawSkinFront(canvas, overlay(base, pixels), variant);
    } catch {
      if (canvas.isConnected) canvas.setAttribute("aria-label", "Prévia da peça indisponível");
    }
  }

  function append(parts) {
    for (const part of parts) {
      const card = document.createElement("article");
      card.className = "profile-piece-container";
      const variant = { both: "Clássico e Slim", classic: "Clássico", slim: "Slim" }[part.model];
      const detail = PART_TYPES[part.category]?.[part.type] || CATEGORIES[part.category];
      card.innerHTML = `<a class="profile-piece" href="#/skins/editor?part=${encodeURIComponent(part.id)}">
        <canvas width="96" height="128" role="img" aria-label="Prévia de ${esc(part.name)}"></canvas>
        <strong>${esc(part.name)}</strong><small>${esc(detail)} · ${variant}</small>
        <small>${esc(part.creator)}</small><span>Experimentar ${icon("arrow-right")}</span>
      </a>`;
      if (!part.sample && String(part.publisher) !== String(getUser()?.id)) {
        const button = document.createElement("button");
        button.className = "text-link wardrobe-report";
        button.type = "button";
        button.textContent = "Denunciar";
        button.setAttribute("aria-label", "Denunciar " + part.name);
        button.addEventListener("click", () => report(part));
        card.append(button);
      }
      grid.append(card);
      void draw(card.querySelector("canvas"), part);
    }
    paintIcons(grid);
  }

  async function load(appendPage = false) {
    controller?.abort();
    const request = new AbortController();
    controller = request;
    const q = search.value.trim();
    const filters = { kind: "part", q, category: category.value, type: type.value, model: model.value };
    const offset = appendPage ? nextOffset : 0;
    if (!appendPage) {
      nextOffset = null;
      grid.replaceChildren();
      append(SAMPLE_PARTS.filter(part => part.sample &&
        (!filters.category || part.category === filters.category) &&
        (!filters.type || part.type === filters.type) &&
        normalize(`${part.name} ${part.creator}`).includes(normalize(q))));
    }
    more.hidden = true;
    status.textContent = "Buscando peças da comunidade…";
    try {
      const result = await remote.list({ ...filters, offset }, request.signal);
      if (request.signal.aborted || !section.isConnected) return;
      const parts = result.rows.map(row => {
        const part = safePart(row);
        return part && { ...part, type: row.type, revision: row.revision, publisher: row.publisher, creator: row.publisherName || row.publisherUsername || "Comunidade" };
      }).filter(Boolean);
      append(parts);
      nextOffset = result.nextOffset;
      delete more.dataset.retry;
      more.textContent = "Carregar mais peças";
      more.hidden = nextOffset === null;
      status.textContent = grid.childElementCount
        ? `${grid.childElementCount} ${grid.childElementCount === 1 ? "peça exibida" : "peças exibidas"}`
        : "Nenhuma peça encontrada. Tente outro nome ou filtro.";
    } catch {
      if (request.signal.aborted || !section.isConnected) return;
      status.textContent = "Não foi possível buscar as peças da comunidade.";
      more.textContent = "Tentar novamente";
      more.hidden = false;
      more.dataset.retry = appendPage ? "more" : "first";
    }
  }

  function refresh() {
    controller?.abort();
    clearTimeout(timer);
    more.hidden = true;
    timer = setTimeout(() => void load(), 200);
  }
  search.addEventListener("input", refresh);
  section.addEventListener("change", event => {
    if (event.target === category) {
      type.replaceChildren(new Option("Todos os tipos", ""), ...Object.entries(PART_TYPES[category.value] || {}).map(([value, label]) => new Option(label, value)));
      type.disabled = !category.value;
    }
    refresh();
  });
  more.addEventListener("click", () => {
    const appendPage = more.dataset.retry !== "first";
    delete more.dataset.retry;
    void load(appendPage);
  });
  paintIcons(section);
  void load();
  return () => { clearTimeout(timer); controller?.abort(); };
}
