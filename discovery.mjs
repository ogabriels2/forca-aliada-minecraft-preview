// Presentation only. Real server data and illustrative records stay distinct.
export function featuredImages(server) {
  return [
    ...new Set([server.cover, ...(server.gallery || [])].filter(Boolean)),
  ].slice(0, 5);
}

export function serverCard(d, { esc, icon, cover, favorite }) {
  return `<article class="server-card">
    <div class="card-art art-${esc(d.theme)}"><a class="card-picture-link" href="#/servidor/${esc(d.id)}" aria-label="Conhecer ${esc(d.name)}">${cover(d, { card: true })}</a><button class="favorite card-favorite" data-action="favorite" data-id="${esc(d.id)}" aria-pressed="${favorite}" aria-label="${favorite ? "Remover dos favoritos:" : "Favoritar"} ${esc(d.name)}">${icon("heart")}</button>${d.official ? `<span class="official-label">${icon("shield-check")} Da Força Aliada</span>` : ""}</div>
    <div class="card-body"><div class="card-heading"><h3><a href="#/servidor/${esc(d.id)}">${esc(d.name)}</a></h3>${icon("arrow-right")}</div><p>${esc(d.summary)}</p><div class="card-facts"><span>${esc(d.mode)}</span><span>${esc(d.editions.join(" + "))}</span><span>${esc(d.language)}</span></div><div class="card-bottom"><span class="availability ${esc(d.status)}">${esc(d.statusText)}</span>${d.example && d.cover ? '<span class="sample-record">Demonstração</span>' : ""}</div></div>
  </article>`;
}

export function featuredServer(d, index, { esc, icon }) {
  const images = featuredImages(d);
  const i = Math.max(0, Math.min(index, images.length - 1));
  return `<div class="featured-art"><img id="feature-image" src="${esc(images[i])}" alt="Imagem ${i + 1} do mundo da Força Aliada" width="1200" height="675" loading="lazy" decoding="async"><div class="feature-image-caption"><span>Dentro do nosso servidor</span><span data-feature-counter>${i + 1} / ${images.length}</span></div></div>
    <div class="featured-copy"><h2>Força Aliada</h2><p>No survival da Força Aliada, as cidades são ligadas por rotas construídas pelos próprios jogadores.</p><div class="card-tags"><span class="tag">Survival vanilla</span><span class="tag">Java + Bedrock</span></div><a class="button" href="#/servidor/${esc(d.id)}">Conhecer o servidor ${icon("arrow-right")}</a><div class="feature-reel" role="group" aria-label="Imagens do servidor em destaque">${images.map((src, n) => `<button data-action="featured-photo" data-index="${n}" aria-label="Ver imagem ${n + 1} do destaque" aria-pressed="${n === i}"><img src="${esc(src)}" alt="" width="120" height="68" loading="lazy"></button>`).join("")}</div><span class="feature-disclosure">Servidor da casa</span></div>`;
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
  return `<section class="catalog-masthead"><div class="catalog-hero container"><div class="catalog-intro"><h1>Servidores de Minecraft</h1><p>Encontre onde jogar no Java ou no Bedrock.</p></div><div class="catalog-search-area"><form class="search-form" id="search-form" role="search">${icon("search")}<label class="sr-only" for="server-search">Buscar servidores</label><input id="server-search" name="q" type="search" placeholder="Nome ou modo de jogo" value="${esc(f.q || "")}" autocomplete="off"><button class="button" aria-label="Buscar" type="submit"><span>Buscar</span>${icon("arrow-right")}</button></form><div class="quick-modes" role="group" aria-label="Explorar por modo de jogo"><button class="chip" data-action="mode" data-value="" aria-pressed="${!f.mode}">Todos</button>${["Survival", "Criativo", "Aventura"].map((m) => `<button class="chip" data-action="mode" data-value="${m}" aria-pressed="${f.mode === m}">${m}</button>`).join("")}<button class="chip" data-action="favorites" aria-label="Favoritos" title="Favoritos" aria-pressed="${Boolean(f.favorites)}">${icon("heart")} <span>Favoritos</span></button></div></div></div></section>
  <section class="catalog-main container" id="catalog-results" aria-label="Catálogo de servidores"><div class="catalog-toolbar"><h2><span data-catalog-title>Servidores</span><small data-result-count role="status" aria-live="polite" aria-atomic="true"></small></h2><div class="filter-row" id="filters"><button class="filter-more" data-action="filters" aria-expanded="${extra}" aria-controls="extra-filters">${icon("adjustments-horizontal")} Filtros <span class="filter-count" hidden></span></button>
    </div></div>
    <div class="extra-filters catalog-filter-panel" id="extra-filters" ${extra ? "" : "hidden"}>
      ${filterGroup("edition", "Edição", [["", "Todas"], ["Java", "Java"], ["Bedrock", "Bedrock"]], icon)}
      ${filterGroup("language", "Idioma", [["", "Todos"], ["Português", "Português"], ["English", "Inglês"], ["Español", "Espanhol"]], icon)}
      <fieldset class="filter-group"><legend>Acesso</legend>
        <label class="filter-choice"><input name="access" type="checkbox"> <span>Entrada livre</span>${icon("check")}</label>
        <label class="filter-choice"><input name="online" type="checkbox"> <span>Online na simulação</span>${icon("check")}</label>
      </fieldset>
      ${filterGroup("sort", "Ordenar por", [["", "Relevância"], ["name", "Nome: A a Z"]], icon)}
      <button class="text-link edition-help" data-action="edition-help">Qual edição eu uso?</button>
    </div><div class="active-filters" id="active-filters"></div><div class="results-grid" id="results"></div><div class="catalog-more" hidden><button class="button secondary" data-action="more-results">Mostrar mais servidores</button></div><p class="catalog-footnote">${icon("alert-circle")} Catálogo de demonstração. Os servidores de exemplo não aceitam conexões.</p></section>
  <section class="container discovery" id="discovery" ${browsing ? "" : "hidden"} aria-label="Servidor em destaque editorial"><div class="featured" id="featured">${featured}</div></section>
  <section class="container player-studio"><div class="player-studio-copy"><h2>Biblioteca de skins</h2><p>Baixe uma skin pronta ou pinte a sua no editor 3D.</p><a class="text-link" href="#/skins">Explorar skins e editor ${icon("arrow-right")}</a></div><a class="player-studio-art" href="#/skins/editor" aria-label="Abrir o editor de skins"><img src="./assets/skins/showcase-explorer.png" alt="" width="144" height="192" loading="lazy"><img src="./assets/skins/showcase-ocean.png" alt="" width="174" height="232" loading="lazy"><img src="./assets/skins/showcase-plum.png" alt="" width="144" height="192" loading="lazy"><span>${icon("brush")} Editor de skins</span></a></section>
  <section class="join-platform"><div class="container"><div><h2>Tem um servidor?</h2><p>Publique uma página grátis com o endereço, as regras e as fotos do seu mundo.</p></div><button class="button" data-action="create">Criar página grátis ${icon("arrow-right")}</button></div></section>`;
}
