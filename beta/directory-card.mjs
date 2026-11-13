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
        <span class="card-server-icon" aria-hidden="true"><span>${esc(initial)}</span>${d.avatar ? `<img src="${esc(d.avatar)}" alt="" width="32" height="32" loading="lazy" decoding="async">` : ""}</span>
        <h3><a href="${esc(href)}" title="${esc(d.name)}"><span class="card-label"><span class="card-name">${esc(d.name)}</span>${d.official ? '' : ""}</span>${icon("arrow-right")}</a></h3>
      </div>
      <div class="card-editions">
        <span class="card-compatibility">
          ${d.editions.map(e=>`<span class="server-edition">${esc(e)}</span>`).join('')}
          ${d.access === "whitelist" ? `<span class="card-access" title="Entrada com aprovação">${icon("lock")}<span class="sr-only">Entrada com aprovação</span></span>` : ""}
        </span>
        ${'<span class="card-presence card-presence--unknown" title="O status ainda não foi consultado">Status não consultado</span>'}
        ${d.demoRating ? `<span class="card-demo-rating" aria-label="Nota simulada: ${d.demoRating.score.toFixed(1)} de 5"><span aria-hidden="true">★</span> ${d.demoRating.score.toFixed(1).replace(".", ",")}</span>` : ""}
        <span class="card-mode">${esc(d.mode)}</span>
      </div>
    </div>
  </article>`;
}
