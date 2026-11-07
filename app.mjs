import {
  serverCard,
  featuredServer,
  featuredImages,
  featuredPhotoLabel,
  catalogMarkup,
} from "./discovery.mjs";
import { createSkinLibrary } from "./skins.mjs";
import { createSkinStudio } from "./skin-studio.mjs";
import { officialPage, bindOfficialStories } from "./official.mjs";
import {
  SERVERS,
  THEMES,
  MODULES,
  FEATURES,
  initialDraft,
  filterServers,
  catalogFilters,
  slugify,
  validateDraft,
  safeDraft,
  publicationFrom,
  safeLink,
  safeMedia,
  eventUTC,
} from "./model.mjs";
if ("scrollRestoration" in history) history.scrollRestoration = "manual";

const main = document.querySelector("#main"),
  dialog = document.querySelector("#dialog");
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const icon = (name) =>
  `<i class="icon" data-icon="${name}" aria-hidden="true"></i>`;
const storageKey = "fa-minecraft-prototype-v1";
let stored = {};
try {
  stored = JSON.parse(localStorage.getItem(storageKey) || "{}") || {};
} catch {}
const state = {
  draft: safeDraft(stored.draft),
  publication: stored.publication ? safeDraft(stored.publication) : null,
  created: Boolean(stored.created || stored.publication),
  wizard: stored.wizard
    ? {
        draft: safeDraft(stored.wizard.draft),
        step: Math.max(0, Math.min(5, Number(stored.wizard.step) || 0)),
        maxStep: Math.max(
          0,
          Math.min(5, Number(stored.wizard.maxStep ?? stored.wizard.step) || 0),
        ),
      }
    : null,
  favorites: new Set(Array.isArray(stored.favorites) ? stored.favorites : []),
  account: true,
  editing: false,
  guestPreview: false,
  filters: {},
  extra: false,
  featured: 0,
  settings: "appearance",
  media: null,
  galleryIndex: 0,
  saving: false,
  storageError: false,
};
let activeServer = null,
  toastTimer,
  saveTimer,
  dialogOpener,
  dialogMode = "",
  inline = null,
  imageBusy = false;
const fieldLabels = {
  name: "Nome do servidor",
  summary: "Apresentação curta",
  description: "Sobre o servidor",
  headline: "Título da apresentação",
  rules: "Regras e orientações",
  address: "Endereço do servidor",
  version: "Versão compatível",
  newsTitle: "Título da novidade",
  newsBody: "Texto da novidade",
  eventTitle: "Nome do encontro",
  eventDescription: "Descrição do encontro",
};
function paintIcons(root = document) {
  root.querySelectorAll("[data-icon]").forEach((n) => {
    if (/^[a-z-]+$/.test(n.dataset.icon))
      n.style.setProperty(
        "--icon",
        `url("./vendor/tabler/${n.dataset.icon}.svg")`,
      );
  });
}
function toast(text) {
  clearTimeout(toastTimer);
  const n = document.querySelector("#toast");
  n.textContent = text;
  n.hidden = false;
  toastTimer = setTimeout(() => (n.hidden = true), 3200);
}
function persist() {
  clearTimeout(saveTimer);
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        draft: state.draft,
        publication: state.publication,
        created: state.created,
        wizard: state.wizard,
        favorites: [...state.favorites],
      }),
    );
    state.storageError = false;
  } catch {
    state.storageError = true;
  }
  state.saving = false;
  updateSaveStatus();
  return !state.storageError;
}
function scheduleSave() {
  state.saving = true;
  updateSaveStatus();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(persist, 250);
}
function updateSaveStatus() {
  document
    .querySelectorAll("[data-save-state]")
    .forEach(
      (n) =>
        (n.textContent = state.storageError
          ? "Não foi possível salvar. Libere espaço neste navegador."
          : state.saving
            ? "Salvando…"
            : "Rascunho salvo neste navegador"),
    );
}
function ownPage() {
  return state.account && state.created && activeServer?.id === "minha-pagina";
}
function dirty() {
  return (
    JSON.stringify(safeDraft(state.publication)) !==
    JSON.stringify(safeDraft(state.draft))
  );
}
function openDialog(content, mode = "plain") {
  if (!dialog.open) dialogOpener = document.activeElement;
  dialogMode = mode;
  dialog.className =
    mode === "wizard"
      ? "wizard-dialog"
      : mode === "settings"
        ? "settings-dialog"
        : mode === "lightbox"
          ? "lightbox-dialog"
          : ["skin-detail", "skin-upload", "skin-apply"].includes(mode)
            ? mode
            : "";
  document.querySelector("#dialog-content").innerHTML = content;
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
  paintIcons(dialog);
  const focus =
    dialog.querySelector("#dialog-title") ||
    dialog.querySelector('[data-action="close-dialog"]');
  focus?.setAttribute("tabindex", "-1");
  focus?.focus({ preventScroll: true });
}
function closeDialog() {
  if (imageBusy) {
    toast("Aguarde a imagem terminar de carregar.");
    return;
  }
  dialog.close();
}
dialog.addEventListener("cancel", (e) => {
  if (imageBusy) e.preventDefault();
});
dialog.addEventListener("close", () => {
  persist();
  dialogMode = "";
  dialogOpener?.isConnected && dialogOpener.focus({ preventScroll: true });
});
dialog.addEventListener("click", (e) => {
  if (e.target === dialog && !["wizard", "settings"].includes(dialogMode)) {
    const r = dialog.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      closeDialog();
  }
});
const toolUrl = "https://iamcal.github.io/enchant-order/";
function downloadCalendar() {
  const d = activeServer,
    date = eventUTC(d?.eventDate, d?.eventZone);
  if (!date) {
    toast("Defina uma data e um fuso válidos para o encontro.");
    return;
  }
  const clean = (s) =>
    String(s || "")
      .replace(/\\/g, "\\\\")
      .replace(/\r?\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  const stamp = date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d+Z/, "Z");
  const now = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d+Z/, "Z");
  const text = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Forca Aliada//Prototipo//PT-BR",
    "BEGIN:VEVENT",
    `UID:${slugify(d.name)}-${stamp}@prototype.forcaaliada`,
    `DTSTAMP:${now}`,
    `DTSTART:${stamp}`,
    `SUMMARY:${clean(d.eventTitle)}`,
    `DESCRIPTION:${clean(d.eventDescription)}${d.example ? "\\nEvento de demonstracao." : ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/calendar;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = slugify(d.eventTitle) + ".ics";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("Encontro preparado para sua agenda.");
}
function select(name, label, values, value) {
  return `<label class="field"><span>${label}</span><select name="${name}">${values.map((v) => `<option value="${esc(v)}" ${v === value ? "selected" : ""}>${esc(v)}</option>`).join("")}</select></label>`;
}
function field(
  name,
  value,
  {
    label = fieldLabels[name] || name,
    area = false,
    hint = "",
    required = false,
    type = "text",
    max = 280,
  } = {},
) {
  return `<label class="field"><span>${label}${required ? ' <span aria-hidden="true">*</span>' : ""}</span>${area ? `<textarea name="${name}" maxlength="${max}" rows="3">${esc(value)}</textarea>` : `<input type="${type}" name="${name}" value="${esc(value)}" maxlength="${max}" ${required ? "required" : ""}>`}${hint ? `<small>${hint}</small>` : ""}<span class="field-error" data-error="${name}" hidden></span></label>`;
}
function showErrors(errors, root = dialog) {
  root.querySelectorAll("[data-error]").forEach((n) => (n.hidden = true));
  root
    .querySelectorAll("[aria-invalid]")
    .forEach((n) => n.removeAttribute("aria-invalid"));
  for (const [key, text] of Object.entries(errors)) {
    const n = root.querySelector(`[data-error="${key}"]`);
    if (n) {
      n.hidden = false;
      n.textContent = text;
    }
    root.querySelector(`[name="${key}"]`)?.setAttribute("aria-invalid", "true");
  }
  root.querySelector('[aria-invalid="true"]')?.focus();
}
function themeStyle(d) {
  const t = THEMES[d.theme] || THEMES.forest;
  return `--server-accent:${t.accent};--server-ground:${t.ground};--server-ink:${t.ink}`;
}
function cover(d, { card = false } = {}) {
  return d.cover
    ? `<img src="${esc(d.cover)}" alt="${d.example ? "Imagem escolhida para a página de demonstração" : "Construções do servidor Força Aliada"}" ${card ? 'loading="lazy"' : 'fetchpriority="high"'} width="1920" height="1080" style="object-position:50% ${d.coverPosition || 50}%">`
    : card
      ? `<span class="illustrated-server illustrated-${d.mode === "Criativo" ? "build" : d.mode === "Aventura" ? "explore" : "survival"}"><span class="illustrated-scene"><img src="./shared/images/manager/worlds-illustration.webp" alt="Cena ilustrativa de Minecraft, não é captura deste servidor" loading="lazy" width="1976" height="784"></span></span><span class="cover-edition">Ilustração · exemplo</span>`
      : "";
}
function availableServers() {
  return state.publication?.visibility === "listed"
    ? [...SERVERS, state.publication]
    : SERVERS;
}
function serverHref(server) {
  const edition = state.filters.edition;
  const query = edition && server.editions.includes(edition) ? `?edition=${edition}` : "";
  return `#/servidor/${encodeURIComponent(server.id)}${query}`;
}
function card(d) {
  return serverCard(d, {
    esc,
    icon,
    cover,
    favorite: state.favorites.has(d.id),
    serverHref,
  });
}
function featured() {
  return featuredServer(SERVERS[0], state.featured, { esc, icon });
}
const CATALOG_BATCH = 9;
const panelFilters = ["edition", "language", "online", "access", "sort"];
let catalogLimit = CATALOG_BATCH;
let catalogFilterKey;

function renderCatalog(limit = CATALOG_BATCH) {
  catalogLimit = limit;
  catalogFilterKey = filterKey();
  activeServer = null;
  main.innerHTML = catalogMarkup(state.filters, {
    esc,
    icon,
    featured: featured(),
    extra: state.extra,
  });
  updateResults();
  paintIcons();
}
function filterKey() {
  return JSON.stringify(Object.entries(state.filters).filter(([, value]) => value));
}
function catalogResults(filters) {
  const found = filterServers(availableServers(), filters);
  return filters.favorites
    ? found.filter((server) => state.favorites.has(server.id))
    : found;
}
function focusCatalogHeading() {
  const heading = document.querySelector("#catalog-results h2");
  if (!heading) return;
  heading.tabIndex = -1;
  heading.focus();
}
function updateResults() {
  const results = document.querySelector("#results");
  if (!results) return;
  const currentKey = filterKey();
  if (currentKey !== catalogFilterKey) catalogLimit = CATALOG_BATCH;
  catalogFilterKey = currentKey;
  const found = catalogResults(state.filters);
  const label = found.length === 1 ? "resultado" : "resultados";
  const savedEmpty = state.filters.favorites && !state.favorites.size;
  const relaxedFilter = !found.length && !savedEmpty
    ? ["language", "mode", "access", "online"].find((key) => {
        if (!state.filters[key]) return false;
        return catalogResults({ ...state.filters, [key]: "" }).length > 0;
      })
    : undefined;
  const labels = {
    q: "Busca",
    mode: "Modalidade",
    edition: "Edição",
    language: "Idioma",
    favorites: "Favoritos",
    online: "Online na simulação",
    access: state.filters.access === "whitelist" ? "Entrada com aprovação" : "Entrada livre",
  };
  const displayFilter = (key, value) =>
    ["favorites", "online", "access"].includes(key)
      ? labels[key]
      : key === "language" ? ({ English: "Inglês", Español: "Espanhol" }[value] || value) : value;
  results.innerHTML = found.length
    ? found.slice(0, catalogLimit).map(card).join("")
    : `<div class="empty">
        ${icon("search")}
        <h3>${savedEmpty ? "Nenhum servidor salvo ainda." : "Nenhum servidor encontrado."}</h3>
        <p>${savedEmpty ? "Toque no coração de um servidor para guardá-lo aqui." : "Remova um filtro ou tente outro nome."}</p>
        <button class="button secondary" data-action="clear-filters">Explorar todos</button>
        ${relaxedFilter ? `<button class="text-link" data-action="remove-filter" data-key="${relaxedFilter}">Remover filtro de ${labels[relaxedFilter].toLocaleLowerCase("pt-BR")}</button>` : ""}
      </div>`;
  document.querySelector(".catalog-more").hidden = found.length <= catalogLimit;
  document.querySelector("[data-catalog-title]").textContent =
    state.filters.favorites ? "Seus favoritos"
      : state.filters.q ? "Resultados da busca"
      : state.filters.edition ? `Servidores para ${state.filters.edition}`
      : "Servidores";
  const count = document.querySelector("[data-result-count]");
  const countText = `${found.length} ${label}`;
  if (count.textContent !== countText) count.textContent = countText;
  const filterDone = document.querySelector("[data-filter-done]");
  if (filterDone)
    filterDone.textContent = found.length
      ? `Ver ${found.length} ${found.length === 1 ? "servidor" : "servidores"}`
      : "Ver resultados";
  const active = document.querySelector("#active-filters");
  active.innerHTML = Object.entries(state.filters)
    .filter(([key, value]) => labels[key] && value)
    .map(([key, value]) => {
      const text = esc(displayFilter(key, value));
      return `<button class="active-filter" data-action="remove-filter" data-key="${key}" aria-label="${text}, remover filtro">${text} ${icon("x")}</button>`;
    })
    .join("");
  if (active.childElementCount > 0)
    active.insertAdjacentHTML("beforeend", '<button class="text-link" data-action="clear-filters">Limpar filtros</button>');
  document.querySelector("#discovery").hidden =
    !SERVERS.some((s) => s.official) ||
    Object.entries(state.filters).some(([k, v]) => k !== "sort" && v);
  document
    .querySelectorAll('[data-action="mode"]')
    .forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String((state.filters.mode || "") === button.dataset.value),
      ),
    );
  document
    .querySelector('[data-action="favorites"]')
    ?.setAttribute("aria-pressed", String(Boolean(state.filters.favorites)));
  const advancedCount = panelFilters.filter(
    (key) => state.filters[key],
  ).length;
  const filterCount = document.querySelector(".filter-count");
  filterCount.hidden = advancedCount === 0;
  filterCount.textContent = advancedCount ? String(advancedCount) : "";
  const search = document.querySelector("#server-search");
  if (search && search.value !== (state.filters.q || ""))
    search.value = state.filters.q || "";
  const editionSelect = document.querySelector('#filters select[name="edition"]');
  if (editionSelect) editionSelect.value = state.filters.edition || "";
  document.querySelectorAll('#extra-filters input[type="radio"]').forEach((input) => {
    input.checked = input.value === (state.filters[input.name] || "");
  });
  document
    .querySelectorAll('#extra-filters input[type="checkbox"]')
    .forEach((input) => {
      input.checked = input.name === "access" ? state.filters.access === "open" : Boolean(state.filters[input.name]);
    });
  const params = new URLSearchParams(
    Object.entries(state.filters).filter(([, v]) => v),
  );
  const catalogUrl = `#/${params.size ? "?" + params : ""}`;
  if (location.hash !== catalogUrl) history.replaceState(null, "", catalogUrl);
  paintIcons(main);
}

const stepNames = [
  "Conexão",
  "Identidade",
  "Apresentação",
  "Comunidade",
  "Aparência",
  "Revisão",
];
function startWizard() {
  if (!state.account) {
    state.account = true;
    updateHeader();
    toast("Conta de demonstração conectada. Nenhum login real.");
  }
  if (state.wizard) {
    openDialog(
      `<h2 id="dialog-title">Sua criação está guardada.</h2><p>Continue de onde parou: ${esc(stepNames[state.wizard.step])}. Nada foi publicado.</p><div class="dialog-actions"><button class="button secondary" data-action="wizard-new">Começar outra</button><button class="button" data-action="wizard-resume">Continuar criação ${icon("arrow-right")}</button></div>`,
    );
    return;
  }
  if (state.created) {
    openDialog(
      `<h2 id="dialog-title">Você já tem uma página nesta prévia.</h2><p>Você pode continuar editando ou experimentar uma nova criação. A página atual só será substituída quando concluir o novo fluxo.</p><div class="dialog-actions"><a class="button secondary" href="#/servidor/minha-pagina" data-close-dialog>Ir à minha página</a><button class="button" data-action="wizard-new">Testar nova criação</button></div>`,
    );
    return;
  }
  newWizard();
}
function newWizard() {
  const d = initialDraft();
  d.name = "";
  d.address = "";
  d.summary = "";
  state.wizard = { draft: d, step: 0 };
  persist();
  renderWizard();
}
function imageControl(d, target, label) {
  const src = target === "gallery" ? d.gallery?.[0] : d[target];
  return `<div class="media-control ${target === "avatar" ? "avatar-control" : ""}"><label class="media-dropzone">${src ? `<img src="${esc(src)}" alt="${label}">` : `<span class="media-placeholder">${icon(target === "avatar" ? "camera" : "photo")}<span>${label}</span></span>`}<span class="media-upload-caption">${icon("upload")} ${src ? "Trocar imagem" : "Escolher imagem"}</span><input type="file" accept="image/png,image/jpeg,image/webp" aria-label="Enviar ${label}" data-upload="${target}" ${target === "gallery" ? "multiple" : ""}></label>${src ? `<button class="text-link" type="button" data-action="remove-media" data-target="${target}">Remover</button>` : ""}</div>`;
}
function themeChoices(d) {
  return `<div class="theme-options">${Object.entries(THEMES)
    .map(
      ([id, t]) =>
        `<button type="button" class="theme-option" data-action="theme" data-value="${id}" aria-pressed="${d.theme === id}"><span class="theme-swatch" style="--swatch:${t.accent}"></span>${t.name}${d.theme === id ? icon("check") : ""}</button>`,
    )
    .join("")}</div>`;
}
function featureChoices(d) {
  return `<div class="feature-choices">${FEATURES.map((v) => `<label class="choice-chip"><input type="checkbox" data-feature="${esc(v)}" ${d.features?.includes(v) ? "checked" : ""}><span>${esc(v)}</span></label>`).join("")}</div>`;
}
function wizardBody(d, step) {
  if (step === 0)
    return `<h2 id="dialog-title">Vamos começar pelo seu servidor.</h2><p>Você só precisa de um nome e um endereço de jogo. O restante pode ser personalizado depois.</p><div class="source-tabs"><button type="button" data-action="source" data-value="manual" aria-pressed="${d.source === "manual"}">Informar manualmente</button><button type="button" data-action="source" data-value="manager" aria-pressed="${d.source === "manager"}">Trazer do Manager</button></div>${d.source === "manager" ? '<div class="notice">Importação de exemplo. Confira o que ficará público; nenhuma conta do Manager é consultada.</div>' : ""}${field("name", d.name, { required: true, max: 64 })}${field("address", d.address, { required: true, hint: "Sem https://. Para testar, use meu-servidor.example." })}<div class="field"><span>Edição</span><div class="appearance-choice">${["Java", "Bedrock"].map((v) => `<button type="button" data-action="toggle-edition" data-value="${v}" aria-pressed="${d.editions.includes(v)}">${v}</button>`).join("")}</div></div>${d.editions.includes("Bedrock") ? field("port", d.port, { label: "Porta Bedrock", max: 5 }) : ""}`;
  if (step === 1)
    return `<h2 id="dialog-title">Dê uma identidade ao seu mundo.</h2><p>Escolha uma foto e uma capa. Sem imagens? A página já tem uma composição tipográfica pronta.</p><div class="wizard-media"><div><h3>Foto do servidor</h3>${imageControl(d, "avatar", "Foto do servidor")}</div><div><h3>Capa</h3>${imageControl(d, "cover", "Capa do servidor")}</div></div><details class="optional-setup"><summary>Adicionar imagens à galeria (opcional)</summary>${imageControl(d, "gallery", "Galeria do servidor")}</details><p class="field-help">PNG, JPG ou WebP, até 5 MB por arquivo. As imagens ficam somente neste navegador.</p>`;
  if (step === 2)
    return `<h2 id="dialog-title">Como é jogar aqui?</h2><p>Uma boa apresentação ajuda a pessoa a entender se este é o mundo que procura.</p>${field("summary", d.summary, { area: true, max: 180, hint: "Uma frase sobre a experiência, sem precisar de um slogan." })}${field("description", d.description, { area: true, max: 4000, label: "Conte um pouco mais (opcional)" })}<div class="field-row">${select("mode", "Modalidade", ["Survival", "Criativo", "Aventura"], d.mode)}${select("language", "Idioma", ["Português", "English", "Español"], d.language)}</div>${field("version", d.version, { label: "Versão compatível (opcional)" })}<h3>O que as pessoas encontram?</h3>${featureChoices(d)}`;
  if (step === 3)
    return `<h2 id="dialog-title">Prepare a chegada da comunidade.</h2><p>Regras e canais de contato ajudam as pessoas a começar. Todos estes campos são opcionais.</p>${field("rules", d.rules, { area: true, max: 4000 })}${field("discord", d.discord, { label: "Link do Discord", hint: "Use um endereço https:// completo." })}${field("website", d.website, { label: "Site ou outro canal" })}<label class="switch"><input type="checkbox" name="community" ${d.community ? "checked" : ""}><span>Criar um perfil do servidor no Community</span></label><p class="field-help">Opcional e gratuito. O perfil é simulado nesta prévia.</p><details class="optional-setup"><summary>Adicionar novidade ou encontro (opcional)</summary>${field("newsTitle", d.newsTitle)}${field("newsBody", d.newsBody, { area: true, max: 4000 })}${field("eventTitle", d.eventTitle)}${field("eventDate", d.eventDate, { label: "Data e hora do encontro", type: "datetime-local" })}${select("eventZone", "Fuso horário", ["America/Sao_Paulo", "UTC", "Europe/Lisbon"], d.eventZone)}${field("eventDescription", d.eventDescription, { area: true, max: 4000 })}</details>`;
  if (step === 4)
    return `<h2 id="dialog-title">Uma aparência que combina com vocês.</h2><p>Você pode ajustar tudo depois, direto na página.</p><h3>Paleta</h3>${themeChoices(d)}<h3>Apresentação</h3>${layoutChoices(d)}<h3>Seções</h3><div class="wizard-modules">${MODULES.map((m) => `<label class="switch"><input type="checkbox" data-module="${m.id}" ${d.modules.includes(m.id) ? "checked" : ""}><span>${m.name}</span></label>`).join("")}</div>`;
  return `<h2 id="dialog-title">Tudo pronto para compartilhar?</h2><p>Confira as escolhas. Você pode voltar a qualquer etapa antes de criar a página.</p><dl class="review-list">${[
    ["Nome", d.name, 0],
    ["Conexão", d.address, 0],
    ["Apresentação", d.summary || "Você pode escrever depois", 2],
    ["Identidade", d.cover ? "Com capa própria" : "Capa tipográfica", 1],
    ["Paleta", THEMES[d.theme].name, 4],
  ]
    .map(
      ([label, value, step]) =>
        `<div><dt>${label}</dt><dd>${esc(value)}</dd><button class="text-link" type="button" data-action="wizard-jump" data-step="${step}" aria-label="Alterar ${label}">Alterar</button></div>`,
    )
    .join(
      "",
    )}</dl>${visibilityChoices(d)}<div class="notice">Esta é uma publicação de demonstração, salva neste navegador. Prova de controle, moderação e publicação real não são executadas.</div>`;
}
function miniPreview(d) {
  return `<div class="wizard-preview-inner" style="${themeStyle(d)}"><div class="mini-cover ${d.cover ? "" : "typographic"}">${d.cover ? `<img src="${esc(d.cover)}" alt="Prévia da capa">` : ""}</div><div class="mini-content">${d.avatar ? `<img class="mini-avatar" src="${esc(d.avatar)}" alt="">` : ""}<strong data-mini-name>${esc(d.name || "Seu servidor")}</strong><p data-mini-summary>${esc(d.summary || "A apresentação do seu servidor aparece aqui.")}</p><div class="card-tags">${d.editions.map((v) => `<span class="tag">${v}</span>`).join("")}<span class="tag">${esc(d.mode)}</span></div><span class="mini-address">${icon("copy")}<span data-mini-address>${esc(d.address || "seu-endereco.example")}</span></span></div></div><small>Prévia da sua página</small>`;
}
function renderWizard() {
  const w = state.wizard;
  if (!w) return;
  const oldStep = dialog.dataset.wizardStep;
  dialog.dataset.wizardStep = String(w.step);
  openDialog(
    `<div class="wizard-top"><span>${icon("world")} Criar página</span><span>Etapa ${w.step + 1} de 6</span></div><ol class="wizard-progress" aria-label="Etapas de criação">${stepNames.map((name, i) => `<li ${i === w.step ? 'aria-current="step"' : ""}><button type="button" data-action="wizard-jump" data-step="${i}" ${i > Math.max(w.step, w.maxStep || 0) ? "disabled" : ""} aria-label="Etapa ${i + 1}: ${name}"><span>${i < w.step ? icon("check") : i + 1}</span><b>${name}</b></button></li>`).join("")}</ol><div class="wizard-grid"><form id="wizard-form" class="wizard-form" novalidate>${wizardBody(w.draft, w.step)}<div class="invalid-box" data-form-error hidden></div></form><aside class="wizard-preview" aria-label="Prévia da criação">${miniPreview(w.draft)}</aside></div><div class="wizard-bottom"><span data-save-state>Rascunho salvo neste navegador</span><div>${w.step ? `<button class="button secondary" type="button" data-action="wizard-back">${icon("arrow-left")} Voltar</button>` : ""}${w.step > 0 && w.step < 5 ? '<button class="text-link skip-step" type="button" data-action="wizard-skip">Pular por enquanto</button>' : ""}<button class="button" form="wizard-form" type="submit">${w.step === 5 ? "Criar minha página" : "Continuar"} ${icon("arrow-right")}</button></div></div>`,
    "wizard",
  );
  if (
    oldStep !== undefined &&
    oldStep !== String(w.step) &&
    !matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    dialog.querySelector(".wizard-grid")?.animate?.(
      [
        {
          opacity: 0.6,
          transform: `translateX(${Number(oldStep) > w.step ? -12 : 12}px)`,
        },
        { opacity: 1, transform: "translateX(0)" },
      ],
      { duration: 220, easing: "cubic-bezier(.16,1,.3,1)" },
    );
  }
}
function validateStep(d, step) {
  const errors = validateDraft({
    ...d,
    summary: d.summary || "Apresentação a informar",
  });
  if (step === 0)
    return Object.fromEntries(
      Object.entries(errors).filter(([k]) =>
        ["name", "address", "port", "editions"].includes(k),
      ),
    );
  const links = {};
  if (step === 3)
    for (const k of ["discord", "website"])
      if (d[k] && !safeLink(d[k]))
        links[k] = "Use um endereço https:// válido, sem credenciais.";
  return links;
}
function wizardNext() {
  if (imageBusy) return;
  const w = state.wizard;
  const errors = validateStep(w.draft, w.step);
  if (Object.keys(errors).length) {
    showErrors(errors);
    return;
  }
  if (w.step === 5) {
    const d = safeDraft({
      ...w.draft,
      summary:
        w.draft.summary.trim() || "Conheça este servidor e sua comunidade.",
    });
    const result = publicationFrom(d);
    if (result.errors) {
      w.step = 0;
      renderWizard();
      showErrors(result.errors);
      return;
    }
    state.draft = d;
    state.publication = result.publication;
    state.created = true;
    state.wizard = null;
    state.editing = true;
    state.guestPreview = false;
    persist();
    closeDialog();
    location.hash = "/servidor/minha-pagina";
    renderPage("minha-pagina");
    toast("Página criada nesta prévia. Passe sobre um texto para editar.");
    return;
  }
  w.step++;
  w.maxStep = Math.max(w.maxStep || 0, w.step);
  persist();
  renderWizard();
}
function layoutChoices(d) {
  return `<div class="appearance-choice">${[
    ["landscape", "Panorâmica"],
    ["compact", "Compacta"],
    ["spotlight", "Destaque · Pro"],
  ]
    .map(
      ([v, label]) =>
        `<button type="button" data-action="layout" data-value="${v}" aria-pressed="${d.layout === v}">${label}</button>`,
    )
    .join("")}</div>`;
}
function visibilityChoices(d) {
  return `<fieldset class="visibility-options"><legend>Onde sua página aparece?</legend><label class="radio-choice"><input type="radio" name="visibility" value="unlisted" ${d.visibility === "unlisted" ? "checked" : ""}><span><strong>Apenas por link</strong><small>Fora do catálogo. Quem tiver o link pode ver a página; isso não a torna privada.</small></span></label><label class="radio-choice"><input type="radio" name="visibility" value="listed" ${d.visibility === "listed" ? "checked" : ""}><span><strong>Também no catálogo</strong><small>Outras pessoas podem encontrar seu servidor na busca.</small></span></label></fieldset>`;
}

function canEdit() {
  return ownPage() && !state.guestPreview;
}
function editText(d, key, value, tag = "p", placeholder = "Adicionar texto") {
  const text = value || placeholder;
  if (!canEdit() || d.id !== "minha-pagina")
    return value ? `<${tag}>${esc(value)}</${tag}>` : "";
  return `<div class="inline-editable ${value ? "" : "is-empty"}" data-action="inline-edit" data-key="${key}"><${tag}>${esc(text)}</${tag}><button type="button" class="inline-pencil" aria-label="Editar ${esc(fieldLabels[key] || key)}">${icon("pencil")}</button></div>`;
}
function mediaGallery(d) {
  const images = d.gallery || [];
  if (!images.length)
    return canEdit()
      ? `<section class="server-section"><button class="add-media-block" data-action="media" data-target="gallery">${icon("photo")}<strong>Mostre o seu mundo</strong><span>Adicione imagens à galeria</span></button></section>`
      : "";
  const index = Math.min(state.galleryIndex, images.length - 1);
  return `<section class="server-section game-gallery" id="section-gallery"><button class="gallery-stage" data-action="gallery" data-src="${esc(images[index])}" aria-label="Ampliar imagem selecionada"><img src="${esc(images[index])}" alt="Imagem ${index + 1} do mundo de ${esc(d.name)}" width="960" height="540"></button><div class="gallery-thumbnails" aria-label="Imagens do servidor">${images.map((src, i) => `<button data-action="gallery-select" data-index="${i}" aria-label="Selecionar imagem ${i + 1}" aria-pressed="${i === index}"><img src="${esc(src)}" alt="" width="160" height="90" loading="lazy"></button>`).join("")}${canEdit() ? `<button class="gallery-manage" data-action="media" data-target="gallery" aria-label="Gerenciar galeria">${icon("plus")}</button>` : ""}</div></section>`;
}
function dateLabel(d) {
  if (!d.eventDate) return "";
  try {
    return (
      new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(
        new Date(d.eventDate.slice(0, 10) + "T12:00:00"),
      ) +
      " · " +
      d.eventDate.slice(11, 16) +
      " · " +
      (d.eventZone === "America/Sao_Paulo" ? "Brasília" : d.eventZone)
    );
  } catch {
    return "";
  }
}
function serverSection(id, d) {
  if (id === "gallery") return mediaGallery(d);
  if (id === "about")
    return `<section class="server-section" id="section-about">${editText(d, "headline", d.headline, "h2", "Adicionar um título")}${editText(d, "description", d.description, "p", "Conte como é jogar neste servidor.")}${d.features?.length ? `<div class="feature-tags">${d.features.map((v) => `<span>${icon("check")}${esc(v)}</span>`).join("")}</div>` : ""}</section>`;
  if (id === "rules")
    return d.rules || canEdit()
      ? `<section class="server-section" id="section-rules"><h3>Antes de entrar</h3>${editText(d, "rules", d.rules, "p", "Adicione regras e orientações de entrada.")}${d.access === "whitelist" ? "<p>Este servidor usa whitelist. Você precisa de aprovação da equipe para entrar.</p>" : ""}</section>`
      : "";
  if (id === "community" && d.community)
    return `<section class="server-section" id="section-community"><div class="community-module"><div><h3>A comunidade continua no Community.</h3><p>Acompanhe novidades e converse com quem também faz parte deste mundo.</p></div><button class="button small" data-action="community">Conhecer ${icon("arrow-right")}</button></div></section>`;
  if (id === "news")
    return d.newsTitle || d.newsBody || canEdit()
      ? `<section class="server-section game-news" id="section-news">${editText(d, "newsTitle", d.newsTitle, "h2", "Adicionar uma novidade")}${editText(d, "newsBody", d.newsBody, "p", "Conte o que mudou ou está chegando.")}${d.example && d.newsTitle ? "<small>Publicação de demonstração</small>" : ""}</section>`
      : "";
  if (id === "event")
    return d.eventTitle || canEdit()
      ? `<section class="server-section" id="section-event"><div class="event-module">${icon("calendar-event")}<div>${editText(d, "eventTitle", d.eventTitle, "h2", "Dê um nome ao próximo encontro")}${d.eventDate ? `<p class="event-date">${esc(dateLabel(d))}</p>` : ""}${editText(d, "eventDescription", d.eventDescription, "p", "Uma sessão para jogar juntos, uma inauguração ou um novo projeto.")}<div class="event-actions">${d.eventDate ? `<button class="text-link" data-action="calendar">Guardar na agenda ${icon("arrow-right")}</button>` : ""}${canEdit() ? '<button class="text-link" data-action="settings" data-tab="content">Definir data e horário</button>' : ""}</div></div></div></section>`
      : "";
  if (id === "links") {
    const links = [
      ["Discord", safeLink(d.discord), "brand-discord"],
      ["Site da comunidade", safeLink(d.website), "external-link"],
    ].filter((v) => v[1]);
    return links.length || canEdit()
      ? `<section class="server-section" id="section-links"><h3>Encontre a comunidade</h3><div class="server-links">${links.map(([name, url, glyph]) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer ugc">${icon(glyph)} ${name} ${icon("external-link")}</a>`).join("")}${canEdit() ? '<button class="text-link" data-action="settings" data-tab="content">Editar links da comunidade</button>' : ""}</div></section>`
      : "";
  }
  if (id === "faq")
    return `<section class="server-section"><h3>Dúvidas antes de começar?</h3><details><summary>Preciso usar o Manager para jogar?</summary><p>Não. Você só precisa do Minecraft compatível e seguir as regras de entrada do servidor.</p></details><details><summary>Java e Bedrock entram do mesmo jeito?</summary><p>Escolha a edição no bloco de conexão. No Bedrock, confira também a porta. A compatibilidade é definida pela equipe de cada servidor.</p></details></section>`;
  return "";
}
function connection(d) {
  const edition = d.editions.includes(state.selectedEdition)
    ? state.selectedEdition
    : d.editions[0];
  return `<aside class="connect-panel" id="section-connect" data-connection><h2>${d.access === "whitelist" ? "Como participar" : "Entre no servidor"}</h2><span class="availability ${esc(d.status)}">${esc(d.statusText || "Estado não consultado")}</span><div class="edition-tabs" role="tablist" aria-label="Edição do Minecraft">${d.editions.map((v) => `<button role="tab" data-action="edition" data-edition="${v}" aria-selected="${edition === v}" tabindex="${edition === v ? 0 : -1}">${v}</button>`).join("")}</div><div class="address-field"><code>${esc(d.address)}</code><button data-action="copy-address" data-value="${esc(d.address)}" aria-label="Copiar endereço">${icon("copy")}</button>${canEdit() ? `<button data-action="inline-edit" data-key="address" aria-label="Editar endereço do servidor">${icon("pencil")}</button>` : ""}</div><p data-port class="port-note" ${edition === "Bedrock" ? "" : "hidden"}>Porta Bedrock: <strong>${esc(d.port || "19132")}</strong></p><button class="button full" data-action="join">${d.access === "whitelist" ? "Como pedir acesso" : "Como entrar"} ${icon("arrow-right")}</button><button class="follow-server" data-action="favorite" data-id="${esc(d.id)}" aria-pressed="${state.favorites.has(d.id)}">${icon("heart")} ${state.favorites.has(d.id) ? "Salvo nos favoritos" : "Guardar nos favoritos"}</button><div class="connection-details"><div><span>Modalidade</span><strong>${esc(d.mode)}</strong></div><div><span>Idioma</span><strong>${esc(d.language)}</strong></div><div><span>Versão</span><strong>${esc(d.version)}</strong></div></div><p class="connection-note">${d.example ? "Endereço de exemplo: não aceita conexões." : "Disponibilidade não consultada nesta prévia. Confirme a versão com a equipe."}</p></aside>`;
}
function ownerBar() {
  return `<div class="owner-bar"><div><strong>${state.guestPreview ? "Visualização como visitante" : "Esta é a sua página"}</strong><span data-save-state>Rascunho salvo neste navegador</span></div><div>${!state.guestPreview ? `<button class="button secondary small" data-action="settings">${icon("settings")} Configurações</button><button class="button secondary small" data-action="guest-preview">${icon("eye")} Ver como visitante</button><button class="button small" data-action="publish">Publicar alterações ${icon("arrow-right")}</button>` : '<button class="button small" data-action="guest-preview">Voltar à edição</button>'}</div></div>`;
}
function serverDocument(d) {
  const ordered = d.modules;
  const editable = canEdit();
  return `<article class="server-page ${d.font === "system" ? "font-system" : ""} ${d.layout === "compact" ? "compact-layout" : d.layout === "spotlight" && d.plan === "pro" ? "spotlight-layout" : ""}" style="${themeStyle(d)}"><div class="server-hero ${d.cover ? "" : "typographic"}" data-name="${esc(d.name)}">${cover(d)}<div class="hero-shade"></div>${editable ? `<button class="hero-edit button secondary small" data-action="media" data-target="cover">${icon("camera")} Alterar capa</button>` : ""}<div class="server-hero-copy">${d.official ? `<span class="official-label">${icon("shield-check")} Oficial da Força Aliada</span>` : ""}<div class="server-identity">${d.avatar ? `<div class="server-avatar">${`<img src="${esc(d.avatar)}" alt="Foto de ${esc(d.name)}">`}${editable ? `<button data-action="media" data-target="avatar" aria-label="Alterar foto do servidor">${icon("camera")}</button>` : ""}</div>` : editable ? `<button class="server-avatar avatar-empty" data-action="media" data-target="avatar" aria-label="Adicionar foto do servidor">${icon("camera")}</button>` : ""}<div>${editText(d, "name", d.name, "h1")}${editText(d, "summary", d.summary, "p", "Adicione uma apresentação curta.")}</div></div></div></div><div class="server-subnav"><div>${d.modules.includes("about") ? '<button data-action="page-section" data-id="section-about">Visão geral</button>' : ""}${d.modules.includes("gallery") && d.gallery?.length ? '<button data-action="page-section" data-id="section-gallery">Imagens</button>' : ""}${d.modules.includes("news") && d.newsTitle ? '<button data-action="page-section" data-id="section-news">Novidades</button>' : ""}${d.modules.includes("event") && d.eventTitle ? '<button data-action="page-section" data-id="section-event">Encontros</button>' : ""}<button data-action="page-section" data-id="section-connect">Como entrar</button></div>${d.example ? "<span>Servidor de demonstração</span>" : ""}</div><div class="server-layout"><div class="server-main"><div class="server-meta">${[...d.editions, d.mode, d.language].map((v) => `<span class="tag">${esc(v)}</span>`).join("")}</div>${ordered.map((id) => serverSection(id, d)).join("")}${editable ? `<button class="add-section" data-action="settings" data-tab="sections">${icon("plus")} Adicionar ou organizar seções</button>` : ""}</div>${connection(d)}</div><div class="server-bottom"><span>Uma página <a href="#/">Força Aliada Servidores</a></span><button class="text-link" data-action="create">Crie a sua, grátis ${icon("arrow-right")}</button></div></article>`;
}
function renderPage(id) {
  activeServer =
    id === "minha-pagina"
      ? state.account && !state.guestPreview && state.created
        ? state.draft
        : state.publication
      : SERVERS.find((s) => s.id === id);
  if (!activeServer) {
    main.innerHTML = `<section class="container empty"><h1>${id === "minha-pagina" ? "Sua página começa aqui." : "Página não encontrada."}</h1><p>${id === "minha-pagina" ? "Crie sua página em etapas, com nome, imagens e apresentação do seu mundo." : "Esse servidor não está nesta prévia."}</p><button class="button" data-action="create">Criar página grátis ${icon("arrow-right")}</button></section>`;
    paintIcons();
    return;
  }
  main.innerHTML =
    activeServer.id === "forca-aliada"
      ? officialPage(activeServer, { icon, connection, gallery: mediaGallery })
      : `<div class="container page-controls"><nav class="page-breadcrumb" aria-label="Caminho"><a href="#/">Servidores</a>${icon("chevron-right")}<span>${esc(activeServer.name)}</span></nav>${!ownPage() ? '<button class="text-link" data-action="create">Criar uma página como esta</button>' : ""}</div>${ownPage() ? ownerBar() : ""}${serverDocument(activeServer)}`;
  if (activeServer.id === "forca-aliada") bindOfficialStories(main);
  paintIcons();
  updateSaveStatus();
}
function refreshPage() {
  if (activeServer) renderPage(activeServer.id);
}
function openInline(key) {
  if (!canEdit()) return;
  const allowed = Object.keys(fieldLabels);
  if (!allowed.includes(key)) return;
  if (key === "address") {
    state.settings = "content";
    renderSettings();
    return;
  }
  const wrapper = main.querySelector(`.inline-editable[data-key="${key}"]`);
  if (!wrapper) return;
  if (inline) cancelInline();
  inline = { key, wrapper };
  const area = [
    "description",
    "rules",
    "newsBody",
    "eventDescription",
    "summary",
  ].includes(key);
  wrapper.classList.add("editing");
  wrapper.removeAttribute("data-action");
  wrapper.innerHTML = `<form class="inline-form" id="inline-form">${field(key, state.draft[key], { area, max: key === "name" ? 64 : key === "summary" ? 180 : area ? 4000 : 180 })}<div class="inline-actions"><button class="button small" type="submit">Salvar alteração ${icon("check")}</button><button class="button secondary small" type="button" data-action="inline-cancel">Cancelar</button><small>${area ? "Ctrl+Enter para salvar · Esc para cancelar" : "Enter para salvar · Esc para cancelar"}</small></div></form>`;
  paintIcons(wrapper);
  const input = wrapper.querySelector("input,textarea");
  input.focus({ preventScroll: true });
  input.setSelectionRange?.(0, input.value.length);
}
function cancelInline() {
  if (!inline) return;
  const key = inline.key;
  inline = null;
  refreshPage();
  main
    .querySelector(`.inline-editable[data-key="${key}"] button`)
    ?.focus({ preventScroll: true });
}
function commitInline() {
  if (!inline || !canEdit()) return;
  const { key, wrapper } = inline;
  const value = wrapper.querySelector("[name]").value.trim();
  if ((key === "name" && !value) || (key === "summary" && !value)) {
    showErrors({ [key]: "Preencha este campo antes de salvar." }, wrapper);
    return;
  }
  state.draft[key] = value;
  inline = null;
  persist();
  refreshPage();
  main
    .querySelector(`.inline-editable[data-key="${key}"] button`)
    ?.focus({ preventScroll: true });
  toast("Alteração salva no rascunho. Publique quando terminar.");
}

function workingDraft() {
  return dialogMode === "wizard" ? state.wizard.draft : state.draft;
}
function renderSettings() {
  if (!canEdit()) return;
  const d = state.draft;
  let content = "";
  if (state.settings === "appearance")
    content = `<h3>Paleta da página</h3>${themeChoices(d)}<h3>Composição</h3>${layoutChoices(d)}<h3>Fonte</h3>${select("font", "Tipografia", ["Manrope", "Sistema"], d.font === "system" ? "Sistema" : "Manrope")}<h3>Imagens</h3><div class="settings-media-links"><button class="button secondary" data-action="media" data-target="avatar">${icon("camera")} Foto do servidor</button><button class="button secondary" data-action="media" data-target="cover">${icon("photo")} Capa</button><button class="button secondary" data-action="media" data-target="gallery">${icon("photo")} Galeria</button></div><div class="premium-explainer"><strong>Personalização incluída na assinatura</strong>A composição Destaque é uma opção Pro que você pode experimentar nesta prévia, sem contratação.</div>`;
  else if (state.settings === "sections")
    content = `<p class="field-help">As seções vazias só aparecem para você. Visitantes veem apenas o conteúdo preenchido.</p><div class="module-list">${[
      ...d.modules,
      ...MODULES.map((m) => m.id).filter((id) => !d.modules.includes(id)),
    ]
      .map((id, i) => {
        const m = MODULES.find((v) => v.id === id),
          on = d.modules.includes(id);
        return `<div class="module-row"><label class="switch"><input type="checkbox" data-module="${id}" ${on ? "checked" : ""} aria-label="Mostrar ${m.name}"></label><span>${m.name}</span>${on ? `<button class="icon-button" type="button" data-action="move-module" data-id="${id}" data-direction="-1" ${i === 0 ? "disabled" : ""} aria-label="Mover ${m.name} para cima">${icon("arrow-up")}</button><button class="icon-button" type="button" data-action="move-module" data-id="${id}" data-direction="1" ${i === d.modules.length - 1 ? "disabled" : ""} aria-label="Mover ${m.name} para baixo">${icon("arrow-down")}</button>` : ""}</div>`;
      })
      .join("")}</div>`;
  else if (state.settings === "content")
    content = `<h3>Conexão e compatibilidade</h3>${field("address", d.address, { required: true })}<div class="field-row">${field("port", d.port, { label: "Porta Bedrock", max: 5 })}${field("version", d.version)}</div><div class="field-row">${select("mode", "Modalidade", ["Survival", "Criativo", "Aventura"], d.mode)}${select("language", "Idioma", ["Português", "English", "Español"], d.language)}</div>${select("access", "Entrada", ["Aberta", "Com whitelist"], d.access === "whitelist" ? "Com whitelist" : "Aberta")}<h3>Características</h3>${featureChoices(d)}<h3>Links da comunidade</h3>${field("discord", d.discord, { label: "Discord" })}${field("website", d.website, { label: "Site ou outro canal" })}<label class="switch"><input type="checkbox" name="community" ${d.community ? "checked" : ""}><span>Perfil do servidor no Community (demonstração)</span></label><h3>Próximo encontro</h3>${field("eventTitle", d.eventTitle)}${field("eventDate", d.eventDate, { label: "Data e hora do encontro", type: "datetime-local" })}${select("eventZone", "Fuso horário", ["America/Sao_Paulo", "UTC", "Europe/Lisbon"], d.eventZone)}<p class="field-help">O horário aparece com o fuso escolhido. Não é ajustado silenciosamente ao horário do visitante.</p>`;
  else
    content = `${visibilityChoices(d)}<div class="notice">Seu rascunho é separado da última publicação. Nesta prévia, publicar atualiza apenas os dados deste navegador.</div><button class="button" type="button" data-action="publish">Publicar alterações ${icon("arrow-right")}</button><div class="form-divider"></div><button class="text-link" type="button" data-action="reset">Recomeçar a demonstração</button>`;
  openDialog(
    `<h2 id="dialog-title">Configurações da página</h2><p>Os ajustes rápidos ficam no próprio texto. Aqui você encontra as opções de estrutura e apresentação.</p><div class="settings-tabs" role="tablist" aria-label="Configurações">${[
      ["appearance", "Aparência"],
      ["sections", "Seções"],
      ["content", "Conexão e comunidade"],
      ["publish", "Publicação"],
    ]
      .map(
        ([id, label]) =>
          `<button role="tab" type="button" data-action="settings-tab" data-tab="${id}" id="settings-tab-${id}" aria-controls="settings-form" tabindex="${state.settings === id ? 0 : -1}" aria-selected="${state.settings === id}">${label}</button>`,
      )
      .join(
        "",
      )}</div><form id="settings-form" role="tabpanel" aria-labelledby="settings-tab-${state.settings}" novalidate>${content}<div class="invalid-box" data-form-error hidden></div></form><div class="settings-bottom"><span data-save-state>Rascunho salvo neste navegador</span><button class="button secondary" data-action="close-dialog">Concluir ajustes</button></div>`,
    "settings",
  );
}
function mediaDialog(target) {
  if (!canEdit()) return;
  state.media = target;
  const d = state.draft;
  openDialog(
    `<h2 id="dialog-title">${target === "avatar" ? "Foto do servidor" : target === "cover" ? "Capa da página" : "Galeria do seu mundo"}</h2><p>Escolha imagens do seu servidor. Elas serão preparadas para a prévia e guardadas apenas neste navegador.</p>${imageControl(d, target, target === "avatar" ? "Foto do servidor" : target === "cover" ? "Capa da página" : "Galeria")}${target === "gallery" && d.gallery.length ? `<div class="media-gallery-manager">${d.gallery.map((src, i) => `<div><img src="${esc(src)}" alt="Imagem ${i + 1}"><button class="icon-button" data-action="remove-gallery" data-index="${i}" aria-label="Remover imagem ${i + 1}">${icon("x")}</button></div>`).join("")}</div>` : ""}${target === "cover" && d.cover ? `<label class="field"><span>Enquadramento vertical da capa</span><input type="range" name="coverPosition" min="0" max="100" value="${d.coverPosition}"></label>` : ""}<p class="field-help">PNG, JPG ou WebP · até 5 MB cada · galeria com até 6 imagens nesta prévia.</p><div class="invalid-box" data-form-error hidden></div><div class="dialog-actions"><button class="button" data-action="close-dialog">Concluir</button></div>`,
    "media",
  );
}
async function prepareImage(file, target) {
  if (
    !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
    file.size > 5 * 1024 * 1024
  )
    throw new Error("Escolha PNG, JPG ou WebP com até 5 MB.");
  const bitmap = await createImageBitmap(file);
  if (bitmap.width * bitmap.height > 40000000) {
    bitmap.close();
    throw new Error(
      "A imagem é grande demais. Escolha uma versão com até 40 megapixels.",
    );
  }
  const max = target === "avatar" ? 160 : target === "cover" ? 1280 : 960;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  let quality = 0.8,
    data = canvas.toDataURL("image/webp", quality);
  while (
    data.length > (target === "cover" ? 180000 : 110000) &&
    quality > 0.3
  ) {
    quality -= 0.1;
    data = canvas.toDataURL("image/webp", quality);
  }
  if (!safeMedia(data) || data.length > 250000)
    throw new Error(
      "Não foi possível preparar esta imagem. Tente uma versão menor.",
    );
  return data;
}
async function uploadImages(input) {
  const mode = dialogMode;
  const d = workingDraft();
  const target = input.dataset.upload;
  const files = [...input.files];
  if (!files.length) return;
  if (target === "gallery" && d.gallery.length + files.length > 6) {
    toast("A galeria desta prévia aceita até 6 imagens.");
    return;
  }
  imageBusy = true;
  const controls = [...dialog.querySelectorAll("button,input")],
    disabled = controls.map((n) => n.disabled);
  controls.forEach((n) => (n.disabled = true));
  const error = dialog.querySelector("[data-form-error]");
  try {
    const images = [];
    for (const f of files) images.push(await prepareImage(f, target));
    if (target === "gallery") d.gallery.push(...images);
    else d[target] = images[0];
    if (!d.modules.includes("gallery") && target === "gallery")
      d.modules.push("gallery");
    persist();
    controls.forEach((n, i) => (n.disabled = disabled[i]));
    imageBusy = false;
    if (mode === "wizard") renderWizard();
    else {
      refreshPage();
      mediaDialog(target);
    }
    if (state.storageError)
      toast(
        "Imagem preparada, mas falta espaço para salvar. Remova outras imagens.",
      );
    else toast("Imagem adicionada à prévia.");
  } catch (e) {
    imageBusy = false;
    controls.forEach((n, i) => (n.disabled = disabled[i]));
    if (error) {
      error.textContent = e.message;
      error.hidden = false;
    } else toast(e.message);
  }
}
function publish() {
  if (!canEdit()) return;
  const errors = validateDraft(state.draft);
  for (const key of ["discord", "website"])
    if (state.draft[key] && !safeLink(state.draft[key]))
      errors[key] = "Use um endereço https:// válido.";
  if (Object.keys(errors).length) {
    state.settings = "content";
    renderSettings();
    showErrors(errors);
    return;
  }
  const result = publicationFrom(state.draft);
  state.publication = result.publication;
  persist();
  refreshPage();
  openDialog(
    `<h2 id="dialog-title">Alterações publicadas nesta prévia.</h2><p>${state.draft.visibility === "listed" ? "Sua página aparece no catálogo de demonstração." : "Sua página fica fora do catálogo, disponível neste navegador pelo link."}</p><div class="notice">Esta publicação é local. Ela não cria um site acessível em outro computador.</div><div class="dialog-actions"><button class="button" data-action="close-dialog">Voltar à minha página ${icon("arrow-right")}</button></div>`,
  );
}

function showJoin() {
  const d = activeServer;
  if (!d) return;
  const edition = d.editions.includes(state.selectedEdition)
    ? state.selectedEdition
    : d.editions[0];
  const notice = d.example
    ? '<div class="notice">Este endereço é demonstrativo e não aceita conexões.</div>'
    : "";
  if (d.access === "whitelist") {
    const contact = safeLink(d.discord) || safeLink(d.website);
    const action = contact && !d.example
      ? `<a class="button full" href="${esc(contact)}" target="_blank" rel="noopener noreferrer ugc">Falar com a equipe ${icon("external-link")}</a>`
      : '<button class="button secondary full" data-action="close-dialog">Voltar à página</button>';
    openDialog(`<h2 id="dialog-title">Como pedir acesso</h2>
      ${notice}
      <p>O servidor usa uma lista de acesso. Confira as regras e peça à equipe para incluir seu nome de jogador antes de se conectar.</p>
      ${action}`);
    return;
  }

  const bedrock = edition === "Bedrock";
  const instructions = bedrock
    ? "No celular ou PC, abra Jogar → Servidores → Adicionar servidor."
    : "Acesse Multijogador → Adicionar servidor.";
  const version = d.version && !/^(a informar|consulte a equipe)$/i.test(d.version)
    ? `Versão indicada: ${esc(d.version)}.`
    : "Confirme a versão compatível com a equipe.";
  openDialog(`<h2 id="dialog-title">Como entrar pelo ${edition}</h2>
    ${notice}
    <ol class="instruction-list">
      <li>Abra o Minecraft ${edition}. ${version}</li>
      <li>${instructions}</li>
      <li>Informe o endereço${bedrock ? " e a porta" : ""} abaixo.</li>
    </ol>
    <div class="address-field"><code data-copy-source tabindex="-1">${esc(d.address)}</code></div>
    ${bedrock ? `<p>Porta Bedrock: <strong>${esc(d.port || "19132")}</strong>.</p>
      <p class="field-help">Em alguns consoles, a opção de adicionar servidores personalizados pode não aparecer.</p>` : ""}
    <p class="field-help" data-copy-feedback role="status"></p>
    ${d.example
      ? '<button class="button secondary full" data-action="close-dialog">Voltar à página</button>'
      : `<button class="button full" data-action="copy-address" data-value="${esc(d.address)}">${icon("copy")} <span data-copy-label>Copiar endereço</span></button>`}`);
}
async function copyText(text, trigger) {
  const feedback = trigger?.closest("dialog")?.querySelector("[data-copy-feedback]");
  try {
    await navigator.clipboard.writeText(text);
    if (feedback) {
      feedback.textContent = "Endereço copiado.";
      const label = trigger.querySelector("[data-copy-label]");
      if (label) label.textContent = "Copiar novamente";
    } else {
      toast("Endereço copiado.");
    }
  } catch {
    if (feedback) {
      feedback.textContent = "A cópia automática não está disponível. Selecione e copie o endereço acima.";
      trigger.closest("dialog")?.querySelector("[data-copy-source]")?.focus();
      return;
    }
    openDialog(
      `<h2 id="dialog-title">Copie o endereço</h2><p>A cópia automática não está disponível. Selecione e copie o texto abaixo.</p><div class="address-field"><code tabindex="0">${esc(text)}</code></div><button class="button full" data-action="close-dialog">Concluir</button>`,
    );
  }
}
function showCommunity() {
  if (!activeServer) return;
  openDialog(
    `<h2 id="dialog-title">${esc(activeServer.name)} no Community</h2><p>Perfil demonstrativo do servidor. Pessoas autorizadas publicam novidades pela equipe, sem uma conta fictícia com senha compartilhada.</p><div class="community-feed"><h3>Boas-vindas à comunidade.</h3><p>Novidades e conversas ficam no Community. Endereço, regras e apresentação continuam na página do servidor.</p><small>Publicação de demonstração</small></div><button class="button full" data-action="close-dialog">Voltar à página</button>`,
  );
}
function showPro() {
  openDialog(
    `<h2 id="dialog-title">Experimente a composição Destaque.</h2><p>Ela amplia a capa e centraliza a apresentação. É um exemplo de personalização avançada incluída na assinatura Força Aliada.</p><div class="notice">Este modo não contrata, cobra ou altera uma assinatura. A página básica permanece completa.</div><div class="dialog-actions"><button class="button secondary" data-action="pro-return">Continuar no básico</button><button class="button gold" data-action="try-pro">Experimentar modo Pro ${icon("sparkles")}</button></div>`,
    "premium",
  );
}
let proReturnMode = "";
function updateHeader() {
  const createButton = document.querySelector(".header-create");
  if (createButton)
    createButton.hidden = (location.hash.split("?")[0] || "#/") !== "#/";
  const n = document.querySelector("#account-area");
  if (!n) return;
  n.innerHTML = state.account
    ? `<details class="prototype-account"><summary aria-label="Minha conta">${icon("users")}<span>Minha conta</span>${icon("chevron-down")}</summary><div class="account-popover"><strong>Conta de demonstração</strong><small>Sem conexão com a sua conta real</small>${state.created ? '<a href="#/servidor/minha-pagina">Minha página</a>' : '<button data-action="create">Criar página grátis</button>'}<a href="#/perfil/demonstracao/skins">Minhas skins</a><button data-action="logout">${icon("logout")} Testar sem conta</button></div></details>`
    : `<button class="button secondary small" data-action="login">${icon("users")} Entrar na prévia</button>`;
  paintIcons(n);
}
function updateMini() {
  const preview = dialog.querySelector(".wizard-preview");
  if (preview) {
    preview.innerHTML = miniPreview(state.wizard.draft);
    paintIcons(preview);
  }
}
function route({ focus = true } = {}) {
  inline = null;
  skinLibrary.dispose();
  skinStudio.dispose();
  const [path, query = ""] = (location.hash.slice(1) || "/").split("?");
  const params = new URLSearchParams(query);
  const toolsMenu = document.querySelector(".tools-menu");
  if (toolsMenu) toolsMenu.open = false;
  let catalogReturn;
  document.body.classList.toggle("studio-open", path === "/skins/editor");
  document.body.dataset.surface =
    path === "/"
      ? "discovery"
      : path.startsWith("/skins") || path.startsWith("/perfil/")
        ? "skins"
        : "server";
  if (path === "/") {
    state.filters = catalogFilters(params);
    catalogReturn = history.state?.catalogReturn;
    state.extra = Boolean(catalogReturn?.extra);
    renderCatalog(catalogReturn?.limit);
    document.title = "Servidores de Minecraft · Força Aliada · Protótipo";
  } else if (path === "/skins/editor") {
    activeServer = null;
    skinStudio.render(editorSeed, new URLSearchParams(query).get("part"));
    editorSeed = null;
    document.title = "Editor de skins · Força Aliada · Protótipo";
  } else if (path === "/skins" || path === "/perfil/demonstracao/skins") {
    activeServer = null;
    skinLibrary.render(path.startsWith("/perfil/"));
    document.title = `${path.startsWith("/perfil/") ? "Minhas skins" : "Skins de Minecraft"} · Força Aliada · Protótipo`;
  } else if (path.startsWith("/servidor/")) {
    let id = "";
    try {
      id = decodeURIComponent(path.slice(10));
    } catch {}
    const edition = params.get("edition");
    state.selectedEdition = ["Java", "Bedrock"].includes(edition) ? edition : undefined;
    renderPage(id);
    document.title = `${activeServer?.name || "Servidor"} · Servidores de Minecraft · Prévia`;
  } else if (path === "/editor") {
    if (state.created) {
      history.replaceState(null, "", "#/servidor/minha-pagina");
      renderPage("minha-pagina");
    } else {
      renderCatalog();
      startWizard();
    }
  } else if (path === "/ferramentas") {
    history.replaceState(null, "", "#/");
    renderCatalog();
    openDialog(
      `<h2 id="dialog-title">Ferramentas, sem desvio.</h2><p>Agora você acessa a calculadora diretamente no cabeçalho ou rodapé.</p><a class="button" href="${toolUrl}" target="_blank" rel="noopener noreferrer">Ordem de encantamentos ${icon("external-link")}</a>`,
    );
  } else {
    renderCatalog();
  }
  document.querySelectorAll("[data-nav]").forEach((n) => {
    if (
      (n.dataset.nav === "catalog" &&
        (path === "/" || path.startsWith("/servidor/"))) ||
      (n.dataset.nav === "skins" &&
        (path.startsWith("/skins") || path.startsWith("/perfil/")))
    )
      n.setAttribute("aria-current", "page");
    else n.removeAttribute("aria-current");
  });
  updateHeader();
  paintIcons();
  if (focus) {
    const returnLink = catalogReturn?.id
      ? [...document.querySelectorAll("#results .server-card")].find(
          (card) => card.dataset.id === catalogReturn.id,
        )?.querySelector(".card-heading a")
      : catalogReturn?.featured ? document.querySelector("#featured a.button") : undefined;
    (returnLink || main).focus({ preventScroll: true });
    window.scrollTo({ top: catalogReturn?.scroll || 0, behavior: "instant" });
  }
}
function contextRefresh() {
  if (dialogMode === "wizard") {
    updateMini();
    scheduleSave();
  } else {
    scheduleSave();
    refreshPage();
  }
}
function refreshControls() {
  if (dialogMode === "wizard") renderWizard();
  else if (dialogMode === "settings") renderSettings();
}
function changeOption(fn) {
  fn(workingDraft());
  persist();
  if (dialogMode === "wizard") renderWizard();
  else {
    refreshPage();
    if (dialogMode === "settings") renderSettings();
  }
}
function moduleToggle(id, on, d) {
  if (on && !d.modules.includes(id)) d.modules.push(id);
  if (!on) d.modules = d.modules.filter((v) => v !== id);
  if (id === "community") d.community = on;
}

document.addEventListener("click", (e) => {
  if (e.target.closest("[data-skip-content]")) {
    e.preventDefault();
    main.focus();
    main.scrollIntoView({ block: "start" });
    return;
  }
  const account = document.querySelector(".prototype-account");
  if (account?.open && !e.target.closest(".prototype-account"))
    account.open = false;
  const tools = document.querySelector(".tools-menu");
  if (tools?.open && (!e.target.closest(".tools-menu") || e.target.closest(".compact-catalog-link")))
    tools.open = false;
  const catalogLink = e.target.closest('#results .card-heading a, #featured a.button');
  if (catalogLink && !e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
    history.replaceState({
      catalogReturn: {
        id: catalogLink.closest(".server-card")?.dataset.id,
        featured: Boolean(catalogLink.closest("#featured")),
        scroll: window.scrollY,
        limit: catalogLimit,
        extra: state.extra,
      },
    }, "");
  }
  if (e.target.closest("[data-close-dialog]")) closeDialog();
  const b = e.target.closest("[data-action]");
  if (!b) return;
  const a = b.dataset.action;
  if (a === "close-dialog") closeDialog();
  else if (a === "create") startWizard();
  else if (a === "wizard-new") newWizard();
  else if (a === "wizard-resume") renderWizard();
  else if (a === "wizard-back") {
    state.wizard.step--;
    persist();
    renderWizard();
  } else if (a === "wizard-skip") wizardNext();
  else if (a === "wizard-jump") {
    const w = state.wizard,
      target = Number(b.dataset.step);
    if (target > w.step && Object.keys(validateStep(w.draft, w.step)).length) {
      showErrors(validateStep(w.draft, w.step));
      return;
    }
    w.maxStep = Math.max(w.maxStep || 0, w.step);
    w.step = target;
    persist();
    renderWizard();
  } else if (a === "source") {
    changeOption((d) => {
      d.source = b.dataset.value;
      if (d.source === "manager") {
        d.name = d.name || "Meu mundo no Manager";
        d.address = d.address || "meu-mundo.example";
      }
    });
  } else if (a === "mode" || a === "collection") {
    state.filters.mode =
      (state.filters.mode || "") === b.dataset.value ? "" : b.dataset.value;
    updateResults();
    if (a === "collection")
      document
        .querySelector("#catalog-results")
        .scrollIntoView({ block: "start", behavior: "smooth" });
  } else if (a === "filters") {
    state.extra = !state.extra;
    b.setAttribute("aria-expanded", String(state.extra));
    document.querySelector("#extra-filters").hidden = !state.extra;
  } else if (a === "finish-filters") {
    const trigger = document.querySelector('.filter-more[data-action="filters"]');
    state.extra = false;
    trigger.setAttribute("aria-expanded", "false");
    document.querySelector("#extra-filters").hidden = true;
    trigger.focus();
  } else if (a === "clear-panel-filters") {
    for (const key of panelFilters) delete state.filters[key];
    updateResults();
  } else if (a === "favorites") {
    state.filters.favorites = state.filters.favorites ? "" : true;
    updateResults();
  } else if (a === "more-results") {
    const previous = catalogLimit;
    catalogLimit += CATALOG_BATCH;
    updateResults();
    document.querySelectorAll("#results .card-heading a")[previous]?.focus();
  } else if (a === "clear-filters") {
    state.filters = {};
    updateResults();
    if (b.closest("#catalog-results")) focusCatalogHeading();
    else document.querySelector("#server-search")?.focus();
  } else if (a === "remove-filter") {
    const chips = [...document.querySelectorAll("#active-filters .active-filter")];
    const chipIndex = chips.indexOf(b);
    delete state.filters[b.dataset.key];
    updateResults();
    const remaining = document.querySelectorAll("#active-filters .active-filter");
    if (chipIndex < 0) focusCatalogHeading();
    else (remaining[Math.min(chipIndex, remaining.length - 1)] ||
      document.querySelector('.filter-more[data-action="filters"]'))?.focus();
  } else if (a === "featured-photo") {
    const photos = featuredImages(SERVERS[0]);
    const index = Number(b.dataset.index);
    if (!photos[index]) return;
    state.featured = index;
    const image = document.querySelector("#feature-image");
    image.src = photos[index];
    const photoLabel = featuredPhotoLabel(photos[index]);
    image.alt = photoLabel;
    const caption = document.querySelector("[data-feature-caption]");
    if (caption) caption.textContent = photoLabel;
    document.querySelector("[data-feature-counter]").textContent =
      `${index + 1} / ${photos.length}`;
    document
      .querySelectorAll('[data-action="featured-photo"]')
      .forEach((n) => n.setAttribute("aria-pressed", String(n === b)));
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches && image.animate)
      image.animate([{ opacity: 0.78 }, { opacity: 1 }], {
        duration: 180,
        easing: "ease-out",
      });
  } else if (a === "edition-help") {
    openDialog(
      `<h2 id="dialog-title">Qual Minecraft você usa?</h2><div class="edition-guide"><section><h3>Java Edition</h3><p>No computador, o Launcher mostra “Minecraft: Java Edition”. Use o filtro Java para encontrar servidores compatíveis.</p></section><section><h3>Bedrock Edition</h3><p>É a edição do celular e dos consoles, também chamada “Minecraft for Windows” no PC. A conexão pode pedir endereço e porta. Nos consoles, servidores externos têm limitações.</p></section></div><p class="field-help">O servidor precisa oferecer a edição e a versão que você usa. Ter Java e Bedrock na mesma página só indica que a equipe declarou suporte às duas.</p><button class="button" data-action="close-dialog">Entendi</button>`,
    );
  } else if (a === "favorite") {
    const id = b.dataset.id;
    const saved = !state.favorites.has(id);
    if (saved) state.favorites.add(id);
    else state.favorites.delete(id);
    persist();
    if (activeServer) {
      b.setAttribute("aria-pressed", String(saved));
      b.innerHTML = `${icon("heart")} ${saved ? "Salvo nos favoritos" : "Guardar nos favoritos"}`;
      paintIcons(b);
    } else if (state.filters.favorites) {
      const hearts = [...document.querySelectorAll('#results [data-action="favorite"]')];
      const position = hearts.indexOf(b);
      updateResults();
      const remaining = document.querySelectorAll('#results [data-action="favorite"]');
      const next = remaining[Math.min(position, remaining.length - 1)];
      if (next) next.focus();
      else focusCatalogHeading();
    } else {
      const server = availableServers().find((entry) => entry.id === id);
      b.setAttribute("aria-pressed", String(saved));
      if (server) b.setAttribute("aria-label", saved
        ? `Remover dos favoritos: ${server.name}`
        : `Favoritar ${server.name}`);
    }
    toast(saved ? "Servidor guardado nos favoritos." : "Servidor removido dos favoritos.");
  } else if (a === "copy-address") copyText(b.dataset.value, b);
  else if (a === "edition") {
    state.selectedEdition = b.dataset.edition;
    const panel = b.closest("[data-connection]");
    panel.querySelectorAll('[role="tab"]').forEach((n) => {
      n.setAttribute("aria-selected", String(n === b));
      n.tabIndex = n === b ? 0 : -1;
    });
    panel.querySelector("[data-port]").hidden =
      state.selectedEdition !== "Bedrock";
  } else if (a === "join") showJoin();
  else if (a === "community") showCommunity();
  else if (a === "page-section") {
    const target = document.getElementById(b.dataset.id);
    if (target) {
      target.scrollIntoView({ block: "start", behavior: "smooth" });
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }
  } else if (a === "gallery") {
    openDialog(
      `<h2 id="dialog-title">Imagens de ${esc(activeServer.name)}</h2><img src="${esc(b.dataset.src)}" alt="Imagem ampliada do servidor"><p>${activeServer.official ? "Captura real da Força Aliada." : "Imagem da página de demonstração."}</p>`,
      "lightbox",
    );
  } else if (a === "gallery-select") {
    const images = activeServer?.gallery || [];
    const index = Number(b.dataset.index);
    if (!images[index]) return;
    state.galleryIndex = index;
    const gallery = b.closest(".game-gallery");
    const stage = gallery.querySelector(".gallery-stage");
    stage.dataset.src = images[index];
    const image = stage.querySelector("img");
    image.src = images[index];
    image.alt = `Imagem ${index + 1} do mundo de ${activeServer.name}`;
    gallery
      .querySelectorAll('[data-action="gallery-select"]')
      .forEach((n) => n.setAttribute("aria-pressed", String(n === b)));
    if (e.detail && !matchMedia("(prefers-reduced-motion: reduce)").matches)
      image.animate([{ opacity: 0.55 }, { opacity: 1 }], {
        duration: 200,
        easing: "cubic-bezier(.16,1,.3,1)",
      });
  } else if (a === "inline-edit") {
    if (!inline) openInline(b.dataset.key);
  } else if (a === "inline-cancel") cancelInline();
  else if (a === "settings") {
    state.settings = b.dataset.tab || "appearance";
    renderSettings();
  } else if (a === "settings-tab") {
    state.settings = b.dataset.tab;
    renderSettings();
    dialog
      .querySelector(
        `[data-action="settings-tab"][data-tab="${state.settings}"]`,
      )
      ?.focus({ preventScroll: true });
  } else if (a === "guest-preview") {
    state.guestPreview = !state.guestPreview;
    inline = null;
    refreshPage();
  } else if (a === "media") mediaDialog(b.dataset.target);
  else if (a === "remove-media") {
    const d = workingDraft(),
      target = b.dataset.target;
    if (target === "gallery") d.gallery = [];
    else delete d[target];
    persist();
    if (dialogMode === "wizard") renderWizard();
    else {
      refreshPage();
      mediaDialog(target);
    }
  } else if (a === "remove-gallery") {
    if (!canEdit()) return;
    state.draft.gallery.splice(Number(b.dataset.index), 1);
    persist();
    refreshPage();
    mediaDialog("gallery");
  } else if (a === "theme") changeOption((d) => (d.theme = b.dataset.value));
  else if (a === "layout") {
    if (b.dataset.value === "spotlight" && workingDraft().plan !== "pro") {
      proReturnMode = dialogMode;
      showPro();
    } else changeOption((d) => (d.layout = b.dataset.value));
  } else if (a === "toggle-edition") {
    const d = workingDraft(),
      v = b.dataset.value;
    if (d.editions.includes(v) && d.editions.length === 1) {
      toast("Mantenha pelo menos uma edição.");
      return;
    }
    changeOption(
      (d) =>
        (d.editions = d.editions.includes(v)
          ? d.editions.filter((x) => x !== v)
          : [...d.editions, v]),
    );
  } else if (a === "move-module") {
    if (!canEdit()) return;
    const d = state.draft,
      index = d.modules.indexOf(b.dataset.id),
      target = index + Number(b.dataset.direction);
    if (target >= 0 && target < d.modules.length) {
      [d.modules[index], d.modules[target]] = [
        d.modules[target],
        d.modules[index],
      ];
      persist();
      refreshPage();
      renderSettings();
    }
  } else if (a === "try-pro") {
    const d = proReturnMode === "wizard" ? state.wizard.draft : state.draft;
    d.plan = "pro";
    d.layout = "spotlight";
    persist();
    if (proReturnMode === "wizard") renderWizard();
    else {
      refreshPage();
      renderSettings();
    }
    toast("Composição Destaque aplicada. Nenhuma contratação.");
  } else if (a === "pro-return") {
    if (proReturnMode === "wizard") renderWizard();
    else renderSettings();
  } else if (a === "publish") publish();
  else if (a === "calendar") downloadCalendar();
  else if (a === "logout") {
    state.account = false;
    state.guestPreview = false;
    inline = null;
    updateHeader();
    if (location.hash.includes("/skins")) route({ focus: false });
    else refreshPage();
    toast("Visualização sem conta conectada.");
  } else if (a === "login") {
    state.account = true;
    updateHeader();
    if (location.hash.includes("/skins")) route({ focus: false });
    else refreshPage();
    toast("Conta de demonstração conectada.");
  } else if (a === "reset") {
    openDialog(
      '<h2 id="dialog-title">Recomeçar esta demonstração?</h2><p>O rascunho e a publicação local serão removidos. Seus favoritos permanecem.</p><div class="dialog-actions"><button class="button secondary" data-action="close-dialog">Manter página</button><button class="button" data-action="confirm-reset">Recomeçar</button></div>',
    );
  } else if (a === "confirm-reset") {
    state.draft = initialDraft();
    state.publication = null;
    state.created = false;
    state.wizard = null;
    persist();
    closeDialog();
    location.hash = "/";
    renderCatalog();
    updateHeader();
  }
});
document.addEventListener("submit", (e) => {
  if (e.target.id === "search-form") {
    e.preventDefault();
    state.filters.q = e.target.elements.q.value.trim();
    updateResults();
    focusCatalogHeading();
  } else if (e.target.id === "wizard-form") {
    e.preventDefault();
    wizardNext();
  } else if (e.target.id === "inline-form") {
    e.preventDefault();
    commitInline();
  } else if (e.target.id === "settings-form") e.preventDefault();
});
document.addEventListener("input", (e) => {
  if (e.target.id === "server-search") {
    state.filters.q = e.target.value;
    updateResults();
    return;
  }
  const form = e.target.closest("#wizard-form,#settings-form");
  if (!form) return;
  const key = e.target.name;
  if (
    ![
      "name",
      "address",
      "port",
      "version",
      "summary",
      "description",
      "newsTitle",
      "newsBody",
      "rules",
      "discord",
      "website",
      "eventTitle",
      "eventDate",
      "eventDescription",
      "coverPosition",
    ].includes(key)
  )
    return;
  const d = workingDraft();
  d[key] = key === "coverPosition" ? Number(e.target.value) : e.target.value;
  if (
    ["newsTitle", "newsBody"].includes(key) &&
    e.target.value &&
    !d.modules.includes("news")
  )
    d.modules.push("news");
  if (
    ["eventTitle", "eventDate", "eventDescription"].includes(key) &&
    e.target.value &&
    !d.modules.includes("event")
  )
    d.modules.push("event");
  e.target.removeAttribute("aria-invalid");
  const error = form.querySelector(`[data-error="${key}"]`);
  if (error) error.hidden = true;
  if (dialogMode === "wizard") {
    updateMini();
    scheduleSave();
  } else {
    refreshPage();
    scheduleSave();
  }
});
document.addEventListener("change", (e) => {
  if (e.target.dataset.upload) {
    uploadImages(e.target);
    return;
  }
  if (e.target.closest("#filters,#extra-filters")) {
    const k = e.target.name;
    if (k) {
      state.filters[k] =
        e.target.type === "checkbox"
          ? e.target.checked
            ? k === "access"
              ? "open"
              : true
            : ""
          : e.target.value;
      updateResults();
    }
    return;
  }
  if (e.target.name === "coverPosition" && dialogMode === "media") {
    state.draft.coverPosition = Number(e.target.value);
    persist();
    refreshPage();
    return;
  }
  if (!e.target.closest("#wizard-form,#settings-form")) return;
  const d = workingDraft();
  if (e.target.dataset.module)
    moduleToggle(e.target.dataset.module, e.target.checked, d);
  else if (e.target.dataset.feature) {
    const v = e.target.dataset.feature;
    d.features = e.target.checked
      ? [...new Set([...(d.features || []), v])]
      : (d.features || []).filter((x) => x !== v);
  } else if (e.target.name === "community") {
    d.community = e.target.checked;
    moduleToggle("community", d.community, d);
  } else if (e.target.name === "font")
    d.font = e.target.value === "Sistema" ? "system" : "manrope";
  else if (e.target.name === "access")
    d.access = e.target.value === "Com whitelist" ? "whitelist" : "open";
  else if (
    ["mode", "language", "eventZone", "visibility"].includes(e.target.name)
  )
    d[e.target.name] = e.target.value;
  persist();
  if (dialogMode === "wizard") updateMini();
  else refreshPage();
});
document.addEventListener("keydown", (e) => {
  const edition = e.target.closest('[data-action="edition"]');
  if (
    edition &&
    !e.ctrlKey &&
    !e.metaKey &&
    !e.altKey &&
    ["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)
  ) {
    const tabs = [
      ...edition
        .closest('[role="tablist"]')
        .querySelectorAll('[data-action="edition"]'),
    ];
    const index = tabs.indexOf(edition);
    const next =
      e.key === "Home"
        ? 0
        : e.key === "End"
          ? tabs.length - 1
          : (index + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) %
            tabs.length;
    e.preventDefault();
    tabs[next].click();
    tabs[next].focus();
    return;
  }
  const tab = e.target.closest('[data-action="settings-tab"]');
  if (
    tab &&
    !e.ctrlKey &&
    !e.metaKey &&
    !e.altKey &&
    ["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)
  ) {
    const tabs = [...dialog.querySelectorAll('[data-action="settings-tab"]')],
      index = tabs.indexOf(tab);
    const next =
      e.key === "Home"
        ? 0
        : e.key === "End"
          ? tabs.length - 1
          : (index + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) %
            tabs.length;
    e.preventDefault();
    tabs[next].click();
    return;
  }
  if (e.key === "Escape" && inline) {
    e.preventDefault();
    cancelInline();
    return;
  }
  if (e.key === "Escape") {
    const account = document.querySelector(".prototype-account");
    if (account) account.open = false;
    const tools = document.querySelector(".tools-menu");
    if (tools?.open) {
      const focusInside = tools.contains(document.activeElement);
      tools.open = false;
      if (focusInside) tools.querySelector("summary")?.focus();
    }
  }
  if (inline && e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    commitInline();
  }
});
window.addEventListener("hashchange", () => {
  if (dialog.open) closeDialog();
  route();
});
window.addEventListener("pagehide", persist);
let editorSeed = null;
const skinLibrary = createSkinLibrary({
  main,
  dialog,
  esc,
  icon,
  openDialog,
  closeDialog,
  toast,
  paintIcons,
  account: () => state.account,
  editSkin: (skin) => {
    editorSeed = skin;
    if (dialog.open) closeDialog();
    location.hash = "/skins/editor";
  },
});
const skinStudio = createSkinStudio({
  main,
  dialog,
  esc,
  icon,
  paintIcons,
  toast,
  openDialog,
  closeDialog,
  publishSkin: (skin) => skinLibrary.publishFromEditor(skin),
  account: () => state.account,
});
route({ focus: false });
