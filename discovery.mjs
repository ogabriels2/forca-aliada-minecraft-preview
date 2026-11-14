import { GAMEPLAY, MODES, serverAvailability, mediaSource } from "./model.mjs?v=publication-20261113b";

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
  if (server.example && server.id !== "minha-pagina") return "";
  const measuredStatus = serverAvailability(server, edition);
  const status = Object.hasOwn(availabilityLabels, measuredStatus) ? measuredStatus : "unknown";
  const candidates = edition && server.editions.includes(edition) ? [edition] : server.editions;
  // Java and Bedrock can share players. Display one valid measurement, never their sum.
  const countedEdition = candidates.find((key) =>
    (!server.editionStatus || server.editionStatus[key] === "online")
    && Number.isSafeInteger(server.editionPlayers?.[key]?.online)
    && server.editionPlayers[key].online >= 0);
  const count = status === "online" ? server.editionPlayers?.[countedEdition]?.online : undefined;
  const hasCount = Number.isSafeInteger(count);
  const label = status === "unknown" ? "Status não confirmado" : availabilityLabels[status];
  const description = hasCount
    ? `${label} · ${playerNumber.format(count)} ${count === 1 ? "jogador" : "jogadores"} em ${countedEdition}`
    : label;
  const signal = '<svg class="card-signal" viewBox="0 0 18 18" aria-hidden="true"><rect x="1" y="11" width="3" height="5" rx="1"/><rect x="7" y="7" width="3" height="9" rx="1"/><rect x="13" y="2" width="3" height="14" rx="1"/></svg>';
  return `<span class="card-presence card-presence--${status}" role="img" aria-label="${esc(description)}" title="${esc(description)}">
    <span aria-hidden="true" class="card-status-symbol">${status === "online" ? signal : icon(status === "offline" ? "x" : "help-circle")}</span>
    <span aria-hidden="true">${status === "unknown" ? "Sem status" : label}</span>
    ${hasCount ? `<span class="card-player-count" aria-hidden="true">${icon("users")}${playerNumber.format(count)}</span>` : ""}
  </span>`;
}

function officialMark() {
  return '<span class="card-house-mark" title="Oficial da Força Aliada"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="verified-seal" d="m12 1 2.8 2.4 3.7-.3.8 3.6 3.1 2-1.5 3.3 1.5 3.3-3.1 2-.8 3.6-3.7-.3L12 23l-2.8-2.4-3.7.3-.8-3.6-3.1-2L3.1 12 1.6 8.7l3.1-2 .8-3.6 3.7.3Z"/><path class="verified-check" d="m7.7 12.1 2.7 2.8 5.8-5.8"/></svg><span class="sr-only">Oficial da Força Aliada</span></span>';
}

export function serverCard(d, { esc, icon, cover, favorite, serverHref, edition }) {
  const href = serverHref ? serverHref(d) : `#/servidor/${encodeURIComponent(d.id)}`;
  const initial = [...d.name.trim()][0]?.toLocaleUpperCase("pt-BR") || "?";
  return `<article class="server-card server-card--cover" data-id="${esc(d.id)}">
    <div class="card-art art-${esc(d.theme)}">
      <div class="card-picture-link">${cover(d, { card: true })}</div>
      ${d.example && d.id !== "minha-pagina" ? '<span class="card-sample-label">Exemplo</span>' : ""}
      <button class="favorite card-favorite" type="button" data-action="favorite" data-id="${esc(d.id)}" aria-pressed="${favorite}" aria-label="${favorite ? "Remover dos favoritos:" : "Favoritar"} ${esc(d.name)}">${icon("heart")}</button>
    </div>
    <div class="card-body">
      <div class="card-heading">
        <span class="card-server-icon" aria-hidden="true"><span>${esc(initial)}</span>${d.avatar ? `<img ${mediaSource(d.avatar, esc)} alt="" width="32" height="32" loading="lazy" decoding="async">` : ""}</span>
        <h3><a href="${esc(href)}" title="${esc(d.name)}"><span class="card-label"><span class="card-name">${esc(d.name)}</span>${d.official ? officialMark() : ""}</span>${icon("arrow-right")}</a></h3>
      </div>
      <div class="card-editions">
        <span class="card-compatibility">
          ${editionBadges(d, esc, icon)}
          ${d.access === "whitelist" ? `<span class="card-access" title="Entrada com aprovação">${icon("lock")}<span class="sr-only">Entrada com aprovação</span></span>` : ""}
        </span>
        ${cardAvailability(d, edition, esc, icon)}
        ${d.rating?.count ? `<span class="card-demo-rating" aria-label="${Number(d.rating.score).toFixed(1)} de 5 · ${d.rating.count} avaliações"><span aria-hidden="true">★</span> ${Number(d.rating.score).toLocaleString("pt-BR")} <small>(${d.rating.count})</small></span>` : d.example && d.demoRating ? `<span class="card-demo-rating" aria-label="Nota simulada: ${d.demoRating.score.toFixed(1)} de 5"><span aria-hidden="true">★</span> ${d.demoRating.score.toFixed(1).replace(".", ",")}</span>` : ""}
        <span class="card-mode">${esc(d.mode)}</span>
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

function filterField(name, label, choices, esc) {
  return `<label class="catalog-filter-field">
    <span>${label}</span>
    <select name="${name}">${choices.map(([value, text]) => `<option value="${esc(value)}">${esc(text)}</option>`).join("")}</select>
  </label>`;
}

function communityDiscovery(icon) {
  const posts = [
    { image: "galeria14.webp", title: "Como você ligaria duas cidades?", text: "Estradas, trilhos ou caminhos pelo Nether? Uma conversa sobre transporte entre as construções do mundo.", topic: "Construções e ideias" },
    { image: "galeria19.webp", title: "Uma casa no meio do seu Survival.", text: "Espaço para guardar recursos, cultivar e continuar construindo. Compartilhe as soluções que funcionam no seu mundo.", topic: "Vida no Survival" },
    { image: "galeria26.webp", title: "Qual vai ser a próxima construção?", text: "Uma praça, uma ponte ou um caminho novo? Combine projetos com quem joga junto.", topic: "Projetos em equipe" },
  ];
  return `<section class="community-discovery" aria-label="Conversas do Community">
    <header><div><h3>O que acontece entre uma partida e outra.</h3><p>Construções, ideias e conversas no Community.</p></div><a href="https://forcaaliada.com/community">Abrir Community ${icon("arrow-right")}</a></header>
    <div class="community-posts">${posts.map(post => `<article class="community-post">
      <div class="community-post-author"><img src="./assets/servers/forca-aliada.png" alt="" width="34" height="34"><span><strong>Força Aliada</strong><small>${post.topic}</small></span></div>
      <img class="community-post-image" src="./shared/images/${post.image}" alt="${photoCaptions[post.image]}" loading="lazy" width="640" height="360">
      <details><summary>${post.title}${icon("chevron-down")}</summary><p>${post.text}</p><a href="https://forcaaliada.com/community">Participar no Community ${icon("external-link")}</a></details>
      <a class="community-server-link" href="#/servidor/forca-aliada">${icon("world")} Conhecer este servidor ${icon("arrow-right")}</a>
    </article>`).join("")}</div>
    <small class="integration-preview-note">Prévia da integração · textos ilustrativos com imagens do servidor Força Aliada.</small>
  </section>`;
}
function managerDiscovery(icon) {
  return `<section class="manager-discovery" aria-label="Crie seu servidor com o Manager">
    <div><h3>E se o próximo servidor fosse seu?</h3><p>Crie seu servidor Minecraft no PC com o Manager. Compartilhe um endereço protegido e cuide do mundo com seus amigos.</p><a class="button" href="https://forcaaliada.com/manager">Conhecer o Manager ${icon("arrow-right")}</a><small>Aplicativo incluído na assinatura Força Aliada.</small></div>
    <div class="manager-discovery-path"><div>${icon("device-desktop")}<span><strong>Crie no seu PC</strong><small>Uma interface para preparar o servidor.</small></span></div><div>${icon("world")}<span><strong>Convide seus amigos</strong><small>Um endereço próprio, sem abrir portas.</small></span></div><div>${icon("calendar-event")}<span><strong>Cuide da rotina</strong><small>Backups e reinícios programados.</small></span></div></div>
  </section>`;
}

export function catalogShelves(servers, card, { esc, icon, recentlyViewed = [] }) {
  const byId = new Map(servers.map((server) => [server.id, server]));
  const history = recentlyViewed.map((id) => byId.get(id)).filter(Boolean);
  const published = servers.filter(server=>server.directory);
  const reviewed = published.filter(server=>server.rating?.count>=3).sort((a,b)=>
    Number(b.rating.score)-Number(a.rating.score)||b.rating.count-a.rating.count);
  const rated = servers.filter((server) => server.demoRating);
  const trending = [...rated].sort((a, b) => b.demoTrend - a.demoTrend);
  const topRated = [...rated].sort((a, b) =>
    b.demoRating.score - a.demoRating.score || b.demoRating.count - a.demoRating.count);
  const recommendations = MODES.flatMap((mode) =>
    servers.filter((server) => server.mode === mode).slice(0, 2));

  const groups = [
    { name: "Seu histórico", query: { recent: true }, matches: history },
    { name: "Publicados na Força Aliada", note: "Páginas criadas e revisadas na plataforma", matches: published.length>=3?published:[] },
    { name: "Recomendados para explorar", note: "Uma seleção de estilos para começar", matches: recommendations },
    { name: "Em alta", note: "Popularidade simulada nesta prévia", matches: trending },
    ...MODES.map((name) => ({ name, query: { mode: name }, matches: servers.filter((server) => server.mode === name) })),
    { name: "Mais bem avaliados", note: reviewed.length ? "Notas dos jogadores · pelo menos 3 avaliações" : "Notas simuladas nesta prévia", matches: reviewed.length?reviewed:topRated },
  ];
  for (const name of GAMEPLAY) {
    if (MODES.includes(name)) continue;
    const matches = servers.filter((server) => server.features?.includes(name));
    if (matches.length >= 2) groups.push({ name, query: { feature: name }, matches });
  }
  const shelfLimit = 9;
  return groups.filter(({ matches }) => matches.length).map(({ name, query, note, matches }, index) => {
    const href = query ? `#/?${new URLSearchParams(query)}` : "";
    const title = href ? `<a href="${esc(href)}">${esc(name)} ${icon("arrow-right")}</a>` : esc(name);
    const all = href && matches.length > shelfLimit ? `<a href="${esc(href)}" aria-label="Ver todos em ${esc(name)}">Ver todos</a>` : "";
    return `<section class="catalog-shelf" data-shelf="${esc(name)}" data-shelf-size="${Math.min(matches.length, 4)}">
      <div class="shelf-heading">
        <div><h3>${title}</h3>${note ? `<small class="shelf-note">${esc(note)}</small>` : ""}</div>
        <div class="shelf-actions">${all}</div>
      </div>
      <div class="shelf-viewport">
        <div class="shelf-track">${matches.slice(0, shelfLimit).map(card).join("")}</div>
        <button type="button" disabled data-action="scroll-shelf" data-direction="-1" aria-label="Anterior em ${esc(name)}">${icon("arrow-left")}</button><button type="button" disabled data-action="scroll-shelf" data-direction="1" aria-label="Próximo em ${esc(name)}">${icon("arrow-right")}</button>
      </div>
    </section>${index === 2 ? communityDiscovery(icon) : ""}${index === 6 ? managerDiscovery(icon) : ""}`;
  }).join("");
}

export function catalogMarkup(f, { esc, icon, featured, extra, hasRecent }) {
  const browsing = !Object.entries(f).some(([k, v]) => k !== "sort" && v);
  const view = (action, label, pressed) =>
    `<button type="button" class="chip" data-action="${action}" aria-pressed="${Boolean(pressed)}">${label}</button>`;
  const categories = (items, all) => [["", all], ...items.map((name) => [name, name])];
  return `<section class="catalog-masthead"><div class="catalog-hero container">
    <div class="catalog-stage">
      <div class="catalog-intro">
        <h1>Servidores de <em>Minecraft</em></h1>
        <p>Encontre seu próximo mundo.</p>
        <div class="catalog-search-area">
          <form class="search-form" id="search-form" role="search">
            <div class="catalog-search-field">
              ${icon("search")}
              <label class="sr-only" for="server-search">Buscar servidores</label>
              <input id="server-search" name="q" type="search" placeholder="Nome, IP ou estilo de jogo" value="${esc(f.q || "")}" autocomplete="off" maxlength="160">
            </div>
            <button class="button" aria-label="Buscar" type="submit"><span>Buscar</span>${icon("arrow-right")}</button>
            <div id="server-search-preview" class="search-preview" role="region" aria-label="Prévia da busca" hidden></div>
            <span class="sr-only" id="server-search-status" role="status"></span>
          </form>
        </div>
      </div>
      <div class="catalog-stage-art">
        <img src="./shared/images/galeria14.webp" width="1200" height="675" alt="" fetchpriority="high" decoding="async">
        <a class="catalog-stage-caption" href="#/servidor/forca-aliada" aria-label="Conhecer o servidor Força Aliada">${icon("world")} Um mundo da Força Aliada ${icon("arrow-right")}</a>
      </div>
    </div>
  </div></section>
  <section class="catalog-main container" id="catalog-results" aria-label="Catálogo de servidores">
    <div class="catalog-toolbar">
      <div class="catalog-views" role="group" aria-label="Listas de servidores">
        ${view("explore", "Explorar", !f.favorites && !f.recent)}
        ${view("favorites", "Favoritos", f.favorites)}
        ${view("recent", "Histórico", f.recent)}
      </div>
      <button type="button" class="filter-more" data-action="filters" aria-expanded="${extra}" aria-controls="extra-filters">${icon("adjustments-horizontal")} Filtros <span class="filter-count" hidden></span></button>
    </div>
    <div class="extra-filters catalog-filter-panel" id="extra-filters" ${extra ? "" : "hidden"}>
      ${filterField("edition", "Edição do Minecraft", categories(["Java", "Bedrock"], "Todas"), esc)}
      ${filterField("status", "Disponibilidade", [["", "Qualquer estado"], ["online", "Online agora"], ["offline", "Offline"], ["unknown", "Sem confirmação"]], esc)}
      ${filterField("mode", "Modo de jogo", categories(MODES, "Todos"), esc)}
      ${filterField("feature", "Características", categories(GAMEPLAY, "Todas"), esc)}
      ${filterField("language", "Idioma", [["", "Todos"], ["Português", "Português"], ["English", "Inglês"], ["Español", "Espanhol"]], esc)}
      ${filterField("access", "Entrada", [["", "Qualquer acesso"], ["open", "Entrada livre"], ["whitelist", "Com aprovação"]], esc)}
      ${filterField("sort", "Ordenar por", [["", "Relevância"], ["online", "Online primeiro"], ["players", "Mais jogadores online"], ["name", "Nome de A a Z"]], esc)}
      <div class="filter-panel-actions">
        <button class="text-link edition-help" data-action="edition-help">Qual edição eu uso?</button>
        <button class="text-link filter-reset" data-action="clear-panel-filters">Limpar filtros</button>
        <button class="button filter-done" data-action="finish-filters"><span data-filter-done>Ver servidores</span></button>
      </div>
    </div><div class="active-filters" id="active-filters"></div><div class="catalog-section-heading"><h2><span data-catalog-title>Explore por categoria</span><small data-result-count role="status" aria-live="polite" aria-atomic="true"></small></h2><button type="button" class="text-link" data-action="clear-recent" hidden>Limpar histórico</button></div><p data-directory-catalog-status role="status" aria-live="polite"></p><div class="results-grid" id="results"></div><div class="catalog-more" hidden><button class="button secondary" data-action="more-results">Mostrar mais servidores</button></div><p class="catalog-footnote">${icon("alert-circle")} Os servidores marcados como exemplo não aceitam conexões.</p></section>
  <section class="container discovery" id="discovery" ${browsing ? "" : "hidden"} aria-label="Servidor em destaque editorial"><div class="featured" id="featured">${featured}</div></section>
  <section class="container player-studio"><div class="player-studio-copy"><h2>Biblioteca de skins</h2><p>Baixe uma skin pronta ou pinte a sua no editor 3D.</p><a class="text-link" href="#/skins">Explorar skins e editor ${icon("arrow-right")}</a></div><a class="player-studio-art" href="#/skins/editor" aria-label="Abrir o editor de skins"><img src="./assets/skins/showcase-explorer.png" alt="" width="144" height="192" loading="lazy"><img src="./assets/skins/showcase-ocean.png" alt="" width="174" height="232" loading="lazy"><img src="./assets/skins/showcase-plum.png" alt="" width="144" height="192" loading="lazy"><span>${icon("brush")} Editor de skins</span></a></section>
  <section class="join-platform"><div class="container"><div><h2>Tem um servidor?</h2><p>Monte uma página com o endereço, as regras e as fotos do seu mundo.</p><a class="text-link publisher-manager" href="https://forcaaliada.com/manager">Precisa criar um servidor? Conheça o Manager ${icon("arrow-right")}</a></div><button class="button" data-action="create">Criar página grátis ${icon("arrow-right")}</button></div></section>`;
}
