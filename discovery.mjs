import { GAMEPLAY, MODES } from "./model.mjs";

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

const availabilityLabels = { online: "Online", offline: "Offline", unknown: "Sem confirmação" };
const availabilityIcons = { online: "check", offline: "x", unknown: "help-circle" };
const playerNumber = new Intl.NumberFormat("pt-BR");

function editionBadges(server, esc, icon) {
  const splitStatus = new Set(Object.values(server.editionStatus || {})).size > 1;
  return server.editions.map((edition) => {
    const status = server.editionStatus?.[edition];
    const label = availabilityLabels[status];
    return `<span class="server-edition server-edition--${edition === "Bedrock" ? "bedrock" : "java"}"${label ? ` title="${esc(`${edition}: ${label}`)}"` : ""}>
      ${esc(edition)}${label ? `<span class="sr-only">, ${label}</span>` : ""}
      ${splitStatus && label ? `<span class="edition-indicator ${status}">${icon(availabilityIcons[status])}</span>` : ""}
    </span>`;
  }).join("");
}

function cardAvailability(server, edition, esc, icon) {
  if (server.example && server.id !== "minha-pagina")
    return '<span class="card-presence card-presence--sample">Exemplo</span>';

  const status = Object.hasOwn(availabilityLabels, server.status) ? server.status : "unknown";
  const label = availabilityLabels[status];
  const countedEdition = (edition && server.editions.includes(edition) ? [edition] : server.editions)
    .find((key) => Number.isSafeInteger(server.editionPlayers?.[key]?.online));
  const count = server.editionPlayers?.[countedEdition]?.online;
  return `<span class="card-presence card-presence--${status}">
    <span class="card-presence-dot" aria-hidden="true"></span>${label}
    ${status === "online" && count >= 0 ? `<span class="card-player-count" title="${esc(`Jogadores online · ${countedEdition}`)}">${icon("users")} ${playerNumber.format(count)}<span class="sr-only"> jogadores em ${esc(countedEdition)}</span></span>` : ""}
  </span>`;
}

export function serverCard(d, { esc, icon, cover, favorite, serverHref, edition }) {
  const href = serverHref ? serverHref(d) : `#/servidor/${encodeURIComponent(d.id)}`;
  const initial = [...d.name.trim()][0]?.toLocaleUpperCase("pt-BR") || "?";
  return `<article class="server-card server-card--cover" data-id="${esc(d.id)}">
    <div class="card-art art-${esc(d.theme)}">
      <div class="card-picture-link">${cover(d, { card: true })}</div>
      ${cardAvailability(d, edition, esc, icon)}
      <button class="favorite card-favorite" type="button" data-action="favorite" data-id="${esc(d.id)}" aria-pressed="${favorite}" aria-label="${favorite ? "Remover dos favoritos:" : "Favoritar"} ${esc(d.name)}">${icon("heart")}</button>
    </div>
    <div class="card-body">
      <div class="card-heading">
        <span class="card-server-icon" aria-hidden="true"><span>${esc(initial)}</span>${d.avatar ? `<img src="${esc(d.avatar)}" alt="" width="32" height="32" loading="lazy" decoding="async">` : ""}</span>
        <h3><a href="${esc(href)}" title="${esc(d.name)}"><span class="card-label"><span class="card-name">${esc(d.name)}</span>${d.official ? `<span class="card-house-mark" title="Servidor da casa">${icon("shield-check")}<span class="sr-only">Servidor da casa</span></span>` : ""}</span>${icon("arrow-right")}</a></h3>
      </div>
      <div class="card-editions">
        ${editionBadges(d, esc, icon)}
        <span class="card-mode">${esc(d.mode)}</span>
        ${d.access === "whitelist" ? `<span class="card-access" title="Entrada com aprovação">${icon("lock")}<span class="sr-only">Entrada com aprovação</span></span>` : ""}
      </div>
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

export function catalogShelves(servers, card, { esc, icon }) {
  const groups = MODES.map((name) => ({ name, key: "mode", matches: servers.filter((s) => s.mode === name) }));
  for (const name of GAMEPLAY) {
    const matches = servers.filter((s) => s.features?.includes(name));
    // An overlapping topic earns a shelf once it has a meaningful selection.
    if (matches.length >= 2 && matches.filter((s) => !s.example).length >= 2 && !groups.some((group) =>
      group.matches.length === matches.length && group.matches.every((s, i) => s.id === matches[i].id)
    )) groups.push({ name, key: "feature", matches });
  }
  return groups.filter(({ matches }) => matches.length).map(({ name, key, matches }) => {
    const href = `#/?${new URLSearchParams({ [key]: name })}`;
    return `<section class="catalog-shelf" data-shelf="${esc(name)}" data-shelf-size="${Math.min(matches.length, 4)}">
      <div class="shelf-heading">
        <h3><a href="${esc(href)}">${esc(name)} ${icon("arrow-right")}</a></h3>
        <div class="shelf-actions"><a href="${esc(href)}" aria-label="Ver todos em ${esc(name)}">Ver todos</a><button type="button" data-action="scroll-shelf" data-direction="-1" aria-label="Anterior em ${esc(name)}">${icon("arrow-left")}</button><button type="button" data-action="scroll-shelf" data-direction="1" aria-label="Próximo em ${esc(name)}">${icon("arrow-right")}</button></div>
      </div>
      <div class="shelf-track">${matches.slice(0, 9).map(card).join("")}</div>
    </section>`;
  }).join("");
}

export function catalogMarkup(f, { esc, icon, featured, extra, hasRecent }) {
  const browsing = !Object.entries(f).some(([k, v]) => k !== "sort" && v);
  const chip = (action, label, glyph, pressed, value = "") =>
    `<button type="button" class="chip" data-action="${action}" data-value="${value}" aria-pressed="${Boolean(pressed)}">${glyph ? icon(glyph) : ""}<span>${label}</span></button>`;
  return `<section class="catalog-masthead"><div class="catalog-hero container">
    <div class="catalog-stage">
      <div class="catalog-intro">
        <h1>Servidores de <em>Minecraft</em></h1>
        <p>Encontre seu próximo mundo.</p>
        <div class="catalog-search-area"><form class="search-form" id="search-form" role="search">${icon("search")}<label class="sr-only" for="server-search">Buscar servidores</label><input id="server-search" name="q" type="search" placeholder="Nome, IP ou estilo de jogo" value="${esc(f.q || "")}" autocomplete="off" maxlength="160"><button class="button" aria-label="Buscar" type="submit"><span>Buscar</span>${icon("arrow-right")}</button></form></div>
      </div>
      <div class="catalog-stage-art">
        <img src="./shared/images/galeria14.webp" width="1200" height="675" alt="" fetchpriority="high" decoding="async">
        <a class="catalog-stage-caption" href="#/servidor/forca-aliada" aria-label="Conhecer o servidor Força Aliada">${icon("world")} Um mundo da Força Aliada ${icon("arrow-right")}</a>
      </div>
    </div>
  </div></section>
  <section class="catalog-main container" id="catalog-results" aria-label="Catálogo de servidores">
    <div class="catalog-toolbar">
      <div class="catalog-compat" role="group" aria-label="Edição e disponibilidade">
        ${chip("quick-edition", "Java", "device-desktop", f.edition === "Java", "Java")}
        ${chip("quick-edition", "Bedrock", "device-mobile", f.edition === "Bedrock", "Bedrock")}
        ${chip("quick-online", "Online agora", "", f.status === "online")}
        <button class="filter-more" data-action="filters" aria-label="Filtros" aria-expanded="${extra}" aria-controls="extra-filters">${icon("adjustments-horizontal")} <span class="filter-label">Filtros</span><span class="filter-count" hidden></span></button>
      </div>
      <div class="filter-row catalog-tools" id="filters">
        ${chip("favorites", "Favoritos", "heart", f.favorites)}
        ${hasRecent || f.recent ? chip("recent", "Recentes", "clock", f.recent) : ""}
      </div>
      <div class="catalog-modes">
        <div class="quick-modes" role="group" aria-label="Explorar por modo de jogo">
          ${chip("mode", "Todos", "", !f.mode && !f.feature)}
          ${MODES.map((m) => chip("mode", esc(m), "", f.mode === m, esc(m))).join("")}
        </div>
        <details class="gameplay-directory" id="gameplay-directory"><summary><span>Estilos</span> ${icon("chevron-down")}</summary><nav aria-label="Estilos de jogo">${GAMEPLAY.map((name) => `<a class="chip" href="#/?${esc(new URLSearchParams({ ...f, mode: "", feature: name }))}">${esc(name)}</a>`).join("")}</nav></details>
      </div>
    </div>
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
    </div><div class="active-filters" id="active-filters"></div><div class="catalog-section-heading"><h2><span data-catalog-title>Explore por categoria</span><small data-result-count role="status" aria-live="polite" aria-atomic="true"></small></h2><button type="button" class="text-link" data-action="clear-recent" hidden>Limpar histórico</button></div><div class="results-grid" id="results"></div><div class="catalog-more" hidden><button class="button secondary" data-action="more-results">Mostrar mais servidores</button></div><p class="catalog-footnote">${icon("alert-circle")} Os servidores marcados como exemplo não aceitam conexões.</p></section>
  <section class="container discovery" id="discovery" ${browsing ? "" : "hidden"} aria-label="Servidor em destaque editorial"><div class="featured" id="featured">${featured}</div></section>
  <section class="container player-studio"><div class="player-studio-copy"><h2>Biblioteca de skins</h2><p>Baixe uma skin pronta ou pinte a sua no editor 3D.</p><a class="text-link" href="#/skins">Explorar skins e editor ${icon("arrow-right")}</a></div><a class="player-studio-art" href="#/skins/editor" aria-label="Abrir o editor de skins"><img src="./assets/skins/showcase-explorer.png" alt="" width="144" height="192" loading="lazy"><img src="./assets/skins/showcase-ocean.png" alt="" width="174" height="232" loading="lazy"><img src="./assets/skins/showcase-plum.png" alt="" width="144" height="192" loading="lazy"><span>${icon("brush")} Editor de skins</span></a></section>
  <section class="join-platform"><div class="container"><div><h2>Tem um servidor?</h2><p>Monte uma página com o endereço, as regras e as fotos do seu mundo.</p><a class="text-link publisher-manager" href="https://forcaaliada.com/manager">Precisa criar um servidor? Conheça o Manager ${icon("arrow-right")}</a></div><button class="button" data-action="create">Criar página grátis ${icon("arrow-right")}</button></div></section>`;
}
