// Presentation only. Real server data and illustrative records stay distinct.
const photoCaptions = {
  "galeria10.webp": "Uma galinha gigante no telhado da praça",
  "galeria27.webp": "O coliseu de pedra, visto do canal",
  "galeria19.webp": "Casas modernas ao lado do trigal",
  "galeria14.webp": "A torre do relógio e as plantações",
  "galeria26.webp": "O caminho florido ao lado do coliseu",
};

export function featuredPhotoLabel(src) {
  return photoCaptions[src?.split("/").pop()] || "Vista do mundo da Força Aliada";
}

export function featuredImages(server) {
  const gallery = server.gallery || [];
  const openingPhoto = gallery.find((src) => src.endsWith("/galeria10.webp"));
  return [...new Set([openingPhoto, ...gallery, server.cover].filter(Boolean))].slice(0, 5);
}

function editionBadges(server, esc) {
  const statusLabels = { online: "Online", offline: "Offline", unknown: "Sem confirmação" };
  return server.editions.map((edition) => {
    const status = server.editionStatus?.[edition];
    const label = statusLabels[status];
    return `<span class="server-edition server-edition--${edition === "Bedrock" ? "bedrock" : "java"}">
      <strong>${esc(edition)}</strong>
      ${label ? `<span class="availability ${status}">${label}</span>` : ""}
    </span>`;
  }).join("");
}

export function serverCard(d, { esc, icon, cover, favorite, serverHref }) {
  const href = serverHref ? serverHref(d) : `#/servidor/${d.id}`;
  const access = d.access === "whitelist" ? "Com aprovação" : "Entrada livre";
  const version = /^\d/.test(d.version) ? d.version.split(" · ")[0] : "";
  const initial = [...d.name.trim()][0]?.toLocaleUpperCase("pt-BR") || "?";
  const checkedAt = Number.isFinite(d.statusCheckedAt)
    ? new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(d.statusCheckedAt)
    : "";
  return `<article class="server-card" data-id="${esc(d.id)}">
    <div class="card-art art-${esc(d.theme)}">
      <div class="card-picture-link">${cover(d, { card: true })}</div>
      <button class="favorite card-favorite" data-action="favorite" data-id="${esc(d.id)}" aria-pressed="${favorite}" aria-label="${favorite ? "Remover dos favoritos:" : "Favoritar"} ${esc(d.name)}">${icon("heart")}</button>
      ${d.official ? `<span class="official-label">${icon("shield-check")} Da Força Aliada</span>` : ""}
    </div>
    <div class="card-body">
      <div class="card-heading">
        <span class="card-server-icon" aria-hidden="true">${d.avatar ? `<img src="${esc(d.avatar)}" alt="" width="36" height="36" loading="lazy" decoding="async">` : esc(initial)}</span>
        <h3><a href="${esc(href)}"><span>${esc(d.name)}</span>${icon("arrow-right")}</a></h3>
      </div>
      <div class="card-editions">${editionBadges(d, esc)}</div>
      <div class="card-facts"><span>${access}</span>${version ? `<span>${esc(version)}</span>` : ""}</div>
      <p>${esc(d.summary)}</p>
      ${d.address ? `<div class="card-address ${d.example ? "card-address-example" : ""}">
        <div><code data-copy-source tabindex="-1">${esc(d.address)}</code>
        ${d.editions.includes("Bedrock") && d.port ? `<small>Porta Bedrock: ${esc(d.port)}</small>` : ""}</div>
        ${d.example ? '<small>Exemplo</small>' : `<button type="button" data-action="copy-address" data-value="${esc(d.address)}" aria-label="Copiar endereço de ${esc(d.name)}">${icon("copy")}<span data-copy-label>Copiar</span></button>`}
        <span class="sr-only" data-copy-feedback role="status"></span>
      </div>` : ""}
      <div class="card-bottom"><span>${esc(d.mode)} · ${esc(d.language)}</span>${checkedAt ? `<small class="card-checked" title="Horário local da última consulta de disponibilidade">Consulta às ${checkedAt}</small>` : ""}${d.editionStatus ? "" : `<span class="availability ${esc(d.status)}">${esc(d.statusText)}</span>`}</div>
    </div>
  </article>`;
}

export function featuredServer(d, index, { esc, icon }) {
  const images = featuredImages(d);
  const i = Math.max(0, Math.min(index, images.length - 1));
  return `<div class="featured-art"><img id="feature-image" src="${esc(images[i])}" alt="${esc(featuredPhotoLabel(images[i]))}" width="1200" height="675" loading="lazy" decoding="async"><div class="feature-image-caption"><span data-feature-caption>${esc(featuredPhotoLabel(images[i]))}</span><span data-feature-counter>${i + 1} / ${images.length}</span></div></div>
    <div class="featured-copy"><h2>Força Aliada</h2><p>No survival da Força Aliada, as cidades são ligadas por rotas construídas pelos próprios jogadores.</p><div class="card-tags"><span class="tag">Survival vanilla</span><span class="tag">Java + Bedrock</span></div><a class="button" href="#/servidor/${esc(d.id)}">Conhecer o servidor ${icon("arrow-right")}</a><div class="feature-reel" role="group" aria-label="Imagens do servidor em destaque">${images.map((src, n) => `<button data-action="featured-photo" data-index="${n}" aria-label="Ver foto: ${esc(featuredPhotoLabel(src))}" aria-pressed="${n === i}"><img src="${esc(src)}" alt="" width="120" height="68" loading="lazy"></button>`).join("")}</div><span class="feature-disclosure">Servidor da casa</span></div>`;
}

function filterGroup(name, label, choices, icon) {
  return `<fieldset class="filter-group">
    <legend>${label}</legend>
    ${choices.map(([value, text]) => `<label class="filter-choice">
      <input type="radio" name="${name}" value="${value}">
      <span>${text}</span>${icon("check")}
    </label>`).join("")}
  </fieldset>`;
}

export function catalogMarkup(f, { esc, icon, featured, extra }) {
  const browsing = !Object.entries(f).some(([k, v]) => k !== "sort" && v);
  return `<section class="catalog-masthead"><div class="catalog-hero container"><div class="catalog-intro"><h1>Servidores de Minecraft</h1><p>Encontre onde jogar no Java ou no Bedrock.</p></div><div class="catalog-search-area"><form class="search-form" id="search-form" role="search">${icon("search")}<label class="sr-only" for="server-search">Buscar servidores</label><input id="server-search" name="q" type="search" placeholder="Nome, endereço ou modo" value="${esc(f.q || "")}" autocomplete="off" maxlength="160"><button class="button" aria-label="Buscar" type="submit"><span>Buscar</span>${icon("arrow-right")}</button></form><div class="quick-modes" role="group" aria-label="Explorar por modo de jogo"><button class="chip" data-action="mode" data-value="" aria-pressed="${!f.mode}">Todos</button>${["Survival", "Criativo", "Aventura"].map((m) => `<button class="chip" data-action="mode" data-value="${m}" aria-pressed="${f.mode === m}">${m}</button>`).join("")}<button class="chip" data-action="favorites" aria-label="Favoritos" title="Favoritos" aria-pressed="${Boolean(f.favorites)}">${icon("heart")} <span>Favoritos</span></button></div></div></div></section>
  <section class="catalog-main container" id="catalog-results" aria-label="Catálogo de servidores"><div class="catalog-toolbar"><h2><span data-catalog-title>Servidores</span><small data-result-count role="status" aria-live="polite" aria-atomic="true"></small></h2><div class="filter-row" id="filters">
      <label class="select-wrap catalog-edition"><select name="edition" aria-label="Edição do Minecraft"><option value="">Todas as edições</option><option>Java</option><option>Bedrock</option></select>${icon("chevron-down")}</label>
      <button class="filter-more" data-action="filters" aria-expanded="${extra}" aria-controls="extra-filters">${icon("adjustments-horizontal")} Filtros <span class="filter-count" hidden></span></button>
    </div></div>
    <div class="extra-filters catalog-filter-panel" id="extra-filters" ${extra ? "" : "hidden"}>
      ${filterGroup("edition", "Edição", [["", "Todas"], ["Java", "Java"], ["Bedrock", "Bedrock"]], icon)}
      ${filterGroup("language", "Idioma", [["", "Todos"], ["Português", "Português"], ["English", "Inglês"], ["Español", "Espanhol"]], icon)}
      <fieldset class="filter-group"><legend>Acesso</legend>
        <label class="filter-choice"><input name="access" type="radio" value=""> <span>Qualquer acesso</span>${icon("check")}</label>
        <label class="filter-choice"><input name="access" type="radio" value="open"> <span>Entrada livre</span>${icon("check")}</label>
        <label class="filter-choice"><input name="access" type="radio" value="whitelist"> <span>Com aprovação</span>${icon("check")}</label>
      </fieldset>
      ${filterGroup("status", "Disponibilidade", [["", "Todas"], ["online", "Online"], ["offline", "Offline"], ["unknown", "Sem confirmação"]], icon)}
      ${filterGroup("sort", "Ordenar por", [["", "Relevância"], ["name", "Nome: A a Z"]], icon)}
      <div class="filter-panel-actions">
        <button class="text-link edition-help" data-action="edition-help">Qual edição eu uso?</button>
        <button class="text-link filter-reset" data-action="clear-panel-filters">Limpar filtros</button>
        <button class="button filter-done" data-action="finish-filters"><span data-filter-done>Ver servidores</span></button>
      </div>
    </div><div class="active-filters" id="active-filters"></div><div class="results-grid" id="results"></div><div class="catalog-more" hidden><button class="button secondary" data-action="more-results">Mostrar mais servidores</button></div><p class="catalog-footnote">${icon("alert-circle")} Catálogo de demonstração. Os servidores de exemplo não aceitam conexões.</p></section>
  <section class="container discovery" id="discovery" ${browsing ? "" : "hidden"} aria-label="Servidor em destaque editorial"><div class="featured" id="featured">${featured}</div></section>
  <section class="container player-studio"><div class="player-studio-copy"><h2>Biblioteca de skins</h2><p>Baixe uma skin pronta ou pinte a sua no editor 3D.</p><a class="text-link" href="#/skins">Explorar skins e editor ${icon("arrow-right")}</a></div><a class="player-studio-art" href="#/skins/editor" aria-label="Abrir o editor de skins"><img src="./assets/skins/showcase-explorer.png" alt="" width="144" height="192" loading="lazy"><img src="./assets/skins/showcase-ocean.png" alt="" width="174" height="232" loading="lazy"><img src="./assets/skins/showcase-plum.png" alt="" width="144" height="192" loading="lazy"><span>${icon("brush")} Editor de skins</span></a></section>
  <section class="join-platform"><div class="container"><div><h2>Tem um servidor?</h2><p>Monte uma página com o endereço, as regras e as fotos do seu mundo.</p><a class="text-link publisher-manager" href="https://forcaaliada.com/manager">Precisa criar um servidor? Conheça o Manager ${icon("arrow-right")}</a></div><button class="button" data-action="create">Criar página grátis ${icon("arrow-right")}</button></div></section>`;
}
