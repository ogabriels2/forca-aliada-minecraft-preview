import {connectDirectory} from "./directory-integration.mjs?v=publication-20261113";
let directory=null;
import { previewCatalog } from "./catalog-preview.mjs?v=discovery-shelves";
import {
  serverCard,
  featuredServer,
  featuredImages,
  featuredPhotoLabel,
  catalogMarkup,
  catalogShelves,
} from "./discovery.mjs?v=publication-20261113";
import { createSkinLibrary } from "./skins.mjs";
import { createSkinStudio } from "./skin-studio.mjs";
import { officialPage, bindOfficialStories } from "./official.mjs";
import {
  SERVERS as BASE_SERVERS,
  THEMES,
  MODULES,
  FEATURES,
  MODES,
  initialDraft,
  filterServers,
  catalogEdition,
  catalogFilters,
  serverAvailability,
  readProviderAvailability,
  readProviderIcon,
  slugify,
  validateDraft,
  safeDraft,
  publicationFrom,
  safeLink,
  safeMedia,
  mediaSource,
  eventUTC,
} from "./model.mjs?v=publication-20261113";
if ("scrollRestoration" in history) history.scrollRestoration = "manual";

const main = document.querySelector("#main"),
  dialog = document.querySelector("#dialog");
main.addEventListener("error", (event) => {
  if (event.target.matches?.(".card-server-icon img")) event.target.remove();
}, true);
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
const storageKey = "fa-minecraft-product-v1";
let stored = {};
try {
  stored = JSON.parse(localStorage.getItem(storageKey) || localStorage.getItem("fa-minecraft-prototype-v1") || "{}") || {};
} catch {}
const recentStorageKey = `${storageKey}.recent`;
let recentlyViewed = [];
try {
  const visits = JSON.parse(localStorage.getItem(recentStorageKey) || localStorage.getItem("fa-minecraft-prototype-v1.recent") || "[]");
  if (Array.isArray(visits))
    recentlyViewed = [...new Set(visits.filter((id) => typeof id === "string" && id.length <= 80))].slice(0, 8);
} catch {}
function setRecentServers(ids) {
  recentlyViewed = ids;
  try {
    if (ids.length) localStorage.setItem(recentStorageKey, JSON.stringify(ids));
    else localStorage.removeItem(recentStorageKey);
  } catch {}
}
const state = {
  draft: initialDraft(),
  publication: null,
  created: false,
  wizard: null,
  favorites: new Set(Array.isArray(stored.favorites) ? stored.favorites : []),
  account: false,
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
function persist({remote=true}={}) {
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
  if(remote)directory?.schedule();
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
  if(directory?.record){
    document.querySelectorAll('[data-save-state]').forEach(n=>n.textContent=directory.saveLabel());
    document.querySelectorAll('.directory-save-recovery').forEach(n=>n.remove());
    if(directory.hasError)document.querySelector('[data-save-state]')?.insertAdjacentHTML('afterend','<button class="text-link directory-save-recovery" data-directory="reload">Reabrir versão da conta</button>');
  }
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
  window.FAAccountMenu?.closeAll();
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
const SERVERS = previewCatalog(BASE_SERVERS);

function cover(d, { card = false } = {}) {
  const sampleScene = d.example && ({ redwood: "build", "la-isla": "explore" }[d.id]);
  const scene = sampleScene || (d.mode === "Criativo" ? "build" : d.mode === "Aventura" ? "explore" : "survival");
  return d.cover
    ? `<img ${mediaSource(d.cover, esc)} alt="${esc(d.official ? "Construções do servidor Força Aliada" : d.example ? "Captura de Minecraft usada como capa de demonstração" : `Capa de ${d.name}`)}" ${card ? 'loading="lazy"' : 'fetchpriority="high"'} width="1920" height="1080" style="object-position:50% ${d.coverPosition ?? 50}%">`
    : card
      ? `<span class="illustrated-server illustrated-${scene}"><span class="illustrated-scene"><img src="./shared/images/manager/worlds-illustration.webp" alt="Cena ilustrativa de Minecraft" loading="lazy" width="1976" height="784"></span></span><span class="cover-edition">Ilustração · exemplo</span>`
      : "";
}
const liveServerSamples = new Map();
const pendingServerSamples = new Map();
let availabilityExpiryTimer;

function publicServerAddress(server) {
  if (!server || (server.example && server.id !== "minha-pagina")) return null;
  const parts = String(server.address || "").split(":");
  if (parts.length > 2) return null;
  const [hostValue, javaPortValue] = parts;
  const host = hostValue.toLowerCase();
  const javaPort = javaPortValue ? Number(javaPortValue) : 25565;
  const bedrockPort = Number(server.port || 19132);
  if (host.length > 253 || !host.includes(".")
    || !host.split(".").every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))
    || /(?:^|\.)(?:localhost|local|internal|example|test|invalid)$/.test(host)
    || /(?:^|\.)example\.(?:com|net|org)$/.test(host)
    || !Number.isInteger(javaPort) || javaPort < 1 || javaPort > 65535
    || !Number.isInteger(bedrockPort) || bedrockPort < 1 || bedrockPort > 65535) return null;
  if (/^[0-9.]+$/.test(host)) {
    const octets = host.split(".").map(Number);
    if (octets.length !== 4 || octets.some((octet) => octet > 255)
      || octets[0] === 0 || octets[0] === 10 || octets[0] === 127 || octets[0] >= 224
      || (octets[0] === 169 && octets[1] === 254)
      || (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31)
      || (octets[0] === 192 && octets[1] === 168)
      || (octets[0] === 100 && octets[1] >= 64 && octets[1] <= 127)) return null;
  }
  return { host, javaPort, bedrockPort };
}

function liveServerKey(server) {
  const address = publicServerAddress(server);
  return address ? JSON.stringify([address, server.editions]) : undefined;
}

function withServerAvailability(server, edition) {
  if (server.example && server.id !== "minha-pagina") return server;
  const sample = liveServerSamples.get(liveServerKey(server));
  const now = Date.now();
  const editionStatus = Object.fromEntries(server.editions.map((key) => {
    const current = sample?.editions[key];
    return [key, current?.expiresAt > now ? current.status : "unknown"];
  }));
  // A chosen custom image wins over an automatically imported server icon.
  const customAvatar = server.official ? undefined : server.avatar;
  const editionPlayers = Object.fromEntries(server.editions.flatMap((key) => {
    const current = sample?.editions[key];
    return editionStatus[key] === "online" && current?.players
      ? [[key, current.players]]
      : [];
  }));
  const current = { ...server, avatar: customAvatar || sample?.icon || server.avatar, editionStatus, editionPlayers };
  const status = serverAvailability(current, edition);
  const reachableEdition = current.editions.find((key) => editionStatus[key] === "online");
  const mixed = !edition && current.editions.some((key) => editionStatus[key] !== "online");
  const statusText = status === "online"
    ? mixed ? `Online em ${reachableEdition}` : "Online"
    : status === "offline" ? "Offline na consulta" : "Status não confirmado";
  const currentSamples = server.editions.map((key) => sample?.editions[key]).filter(
    (value) => value?.expiresAt > now && value.checkedAt,
  );
  const statusCheckedAt = currentSamples.length
    ? Math.min(...currentSamples.map((value) => value.checkedAt)) : undefined;
  return { ...current, status, statusText, statusCheckedAt };
}

async function decodedServerIcon(value) {
  const validated = readProviderIcon(value);
  if (!validated || typeof Image === "undefined") return undefined;
  const image = new Image();
  let timeout;
  try {
    image.src = validated;
    await Promise.race([
      image.decode(),
      new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new Error("Icon decoding timed out")), 2_000);
      }),
    ]);
    return image.naturalWidth === 64 && image.naturalHeight === 64 ? validated : undefined;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timeout);
  }
}

let nextStatusLookup=0;
async function queryServerStatus(address, edition) {
  // mcstatus.io allows five requests/second per IP. Space both editions together.
  const wait=Math.max(0,nextStatusLookup-Date.now());
  nextStatusLookup=Math.max(Date.now(),nextStatusLookup)+260;
  if(wait)await new Promise(resolve=>setTimeout(resolve,wait));
  if(document.hidden)return {status:'unknown'};
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const port = edition === "Bedrock" ? address.bedrockPort : address.javaPort;
    const endpoint = `${address.host}:${port}`;
    const response = await fetch(
      `https://api.mcstatus.io/v2/status/${edition.toLowerCase()}/${encodeURIComponent(endpoint)}`,
      { credentials: "omit", cache: "no-store", signal: controller.signal },
    );
    if (!response.ok) return { status: "unknown" };
    const sample = await response.json();
    const status = readProviderAvailability(sample, edition, address.host);
    const online = sample?.players?.online;
    const max = sample?.players?.max;
    const players = status === "online" && Number.isSafeInteger(online) && online >= 0
      ? { online, max: Number.isSafeInteger(max) && max > 0 ? max : undefined }
      : undefined;
    return {
      players,
      status,
      expiresAt: status === "unknown" ? 0 : sample.expires_at,
      checkedAt: status === "unknown" ? undefined : sample.retrieved_at,
      icon: edition === "Java" && status === "online" ? await decodedServerIcon(sample.icon) : undefined,
    };
  } catch {
    return { status: "unknown" };
  } finally {
    clearTimeout(timeout);
  }
}

function refreshLiveAvailabilityUI() {
  updateConnectionAvailability();
  if (state.wizard && dialogMode === "wizard") {
    const draft = state.wizard.draft;
    const avatar = withServerAvailability(draft).avatar;
    const placeholder = !draft.avatar && avatar
      ? dialog.querySelector(".avatar-control .media-placeholder") : null;
    if (placeholder) {
      const image = document.createElement("img");
      image.src = avatar;
      image.alt = "Ícone importado do servidor";
      placeholder.replaceWith(image);
      const caption = dialog.querySelector(".avatar-control .media-upload-caption");
      if (caption) caption.textContent = "Ícone automático · personalizar";
    }
    updateMini();
  }
  if (!document.querySelector("#results")) return;
  const focused = document.activeElement;
  const focusedCard = focused?.closest("#results .server-card");
  const recoveryAction = focused?.dataset.action;
  const chipKey = focused?.closest("#active-filters") ? focused.dataset.key : undefined;
  const clearFocused = focused?.closest("#active-filters") && recoveryAction === "clear-filters";
  updateResults();
  if (focusedCard) {
    const card = [...document.querySelectorAll("#results .server-card")].find(
      (item) => item.dataset.id === focusedCard.dataset.id,
    );
    const button = [...(card?.querySelectorAll("button[data-action]") || [])].find(
      (item) => item.dataset.action === recoveryAction,
    );
    const destination = button || card?.querySelector(".card-heading a")
      || document.querySelector(".filter-more");
    destination?.focus({ preventScroll: true });
  } else if (chipKey || clearFocused) {
    const chip = [...document.querySelectorAll("#active-filters button")].find(
      (item) => chipKey ? item.dataset.key === chipKey : item.dataset.action === recoveryAction,
    );
    (chip || document.querySelector(".filter-more"))?.focus({ preventScroll: true });
  }
}

function scheduleAvailabilityExpiry() {
  clearTimeout(availabilityExpiryTimer);
  const expiries = [...liveServerSamples.values()].flatMap((sample) =>
    Object.values(sample.editions).map((edition) => edition.expiresAt),
  ).filter((expiry) => expiry > Date.now());
  if (expiries.length) availabilityExpiryTimer = setTimeout(() => {
    refreshLiveAvailabilityUI();
    scheduleAvailabilityExpiry();
    void refreshServerStatuses();
  }, Math.max(10, Math.min(...expiries) - Date.now() + 10));
}

function refreshServerSample(server) {
  const key = liveServerKey(server);
  if (!key || !/^https?:$/.test(location.protocol)) return Promise.resolve();
  const previous = liveServerSamples.get(key);
  if (pendingServerSamples.has(key)) return pendingServerSamples.get(key);
  if (previous && Date.now() - previous.requestedAt < 45_000) return Promise.resolve();
  const requestedAt = Date.now();
  const address = publicServerAddress(server);
  const task = (async () => {
    const editions = Object.fromEntries(await Promise.all(server.editions.map(async (edition) =>
      [edition, await queryServerStatus(address, edition)],
    )));
    liveServerSamples.set(key, {
      editions,
      requestedAt,
      icon: editions.Java?.icon || previous?.icon,
    });
    scheduleAvailabilityExpiry();
  })().finally(() => {
    pendingServerSamples.delete(key);
    refreshLiveAvailabilityUI();
  });
  pendingServerSamples.set(key, task);
  if (state.filters.status && document.querySelector("#results")) updateResults();
  return task;
}

async function refreshServerStatuses() {
  if (!/^https?:$/.test(location.protocol) || document.hidden) return;
  refreshLiveAvailabilityUI();
  const servers = document.querySelector("#results")
    ? [...SERVERS, ...(state.publication ? [state.publication] : [])]
    : activeServer ? [activeServer] : [];
  await Promise.all(servers.filter((server) => publicServerAddress(server)).map(refreshServerSample));
}

function availableServers() {
  const servers = SERVERS.map((server) => withServerAvailability(server));
  if(directory){
    const allowed=directory.catalog.ids,saved=state.filters.favorites||state.filters.recent;
    const live=servers.filter(server=>server.directory&&(saved||allowed.has(server.id)));
    const house=live.some(server=>server.address==='forca-aliada.play.forcaaliada.com');
    return [...live,...servers.filter(server=>!server.directory&&!(house&&server.id==='forca-aliada'))];
  }
  return state.publication?.visibility === "listed"
    ? [withServerAvailability(state.publication), ...servers]
    : servers;
}
function serverHref(server, filters = state.filters) {
  const edition = catalogEdition(filters);
  const query = edition && server.editions.includes(edition) ? `?edition=${edition}` : "";
  return `#/servidor/${encodeURIComponent(server.id)}${query}`;
}
function card(d) {
  const edition = catalogEdition(state.filters);
  return serverCard(withServerAvailability(d, edition), {
    esc,
    icon,
    cover,
    edition,
    favorite: state.favorites.has(d.id),
    serverHref,
  });
}
function featured() {
  return featuredServer(SERVERS.find(server=>server.official)||BASE_SERVERS[0], state.featured, { esc, icon });
}
const CATALOG_BATCH = 9;
const panelFilters = ["edition", "status", "mode", "feature", "language", "access", "sort"];
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
    hasRecent: recentlyViewed.length > 0,
  });
  updateResults();
  paintIcons();
}
function filterKey() {
  return JSON.stringify(Object.entries(state.filters).filter(([, value]) => value));
}
function catalogResults(filters) {
  const found = filterServers(availableServers(), filters);
  const matching = filters.status === "online" ? found.filter((server) => !server.example) : found;
  if (filters.favorites) return matching.filter((server) => state.favorites.has(server.id));
  if (filters.recent) {
    const byId = new Map(matching.map((server) => [server.id, server]));
    return recentlyViewed.map((id) => byId.get(id)).filter(Boolean);
  }
  return matching;
}
function closeSearchPreview() {
  const preview = document.querySelector("#server-search-preview");
  if (!preview) return;
  preview.hidden = true;
  document.querySelector("#server-search-status").textContent = "";
}
function updateSearchPreview(input) {
  const query = input.value.trim();
  if (!query) {
    closeSearchPreview();
    return;
  }

  const filters = { ...state.filters, q: query };
  const matches = catalogResults(filters);
  const preview = document.querySelector("#server-search-preview");
  const visible = matches.slice(0, 5);
  preview.innerHTML = visible.length
    ? `<strong class="search-preview-heading">Servidores encontrados</strong>
       <ul class="search-preview-results">${visible.map((server) => `
         <li><a href="${esc(serverHref(server, filters))}">
           <span class="search-preview-icon">${icon("world")}</span>
           <span class="search-preview-copy"><strong>${esc(server.name)}</strong>
             <small>${esc([server.mode, ...server.editions, server.example ? "Exemplo" : server.address].filter(Boolean).join(" · "))}</small>
           </span>
           ${icon("arrow-right")}
         </a></li>`).join("")}</ul>
       <button type="submit" class="search-preview-submit">Ver ${matches.length === 1 ? "1 resultado" : `todos os ${matches.length} resultados`} ${icon("arrow-right")}</button>`
    : '<div class="search-preview-empty"><strong>Nenhum servidor encontrado</strong><small>Tente outro nome ou endereço, ou ajuste os filtros.</small></div>';
  preview.hidden = false;
  paintIcons(preview);
  document.querySelector("#server-search-status").textContent =
    matches.length === 1 ? "1 servidor encontrado." : `${matches.length} servidores encontrados.`;
}
function focusCatalogHeading() {
  const heading = document.querySelector("#catalog-results h2");
  if (!heading) return;
  heading.tabIndex = -1;
  heading.focus();
}
function animateCatalogResults() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelector("#results")?.animate?.(
    [{ opacity: .65, transform: "translateY(6px)" }, { opacity: 1, transform: "translateY(0)" }],
    { duration: 235, easing: "cubic-bezier(.2,.75,.24,1)" },
  );
}
function shelfPositions() {
  return Object.fromEntries([...document.querySelectorAll(".shelf-track")].map(
    (track) => [track.closest("[data-shelf]").dataset.shelf, track.scrollLeft],
  ));
}
function syncShelfControls(track) {
  const shelf = track.closest(".catalog-shelf");
  const previous = shelf.querySelector('[data-direction="-1"]');
  const next = shelf.querySelector('[data-direction="1"]');
  const bounds = track.getBoundingClientRect();
  const first = track.firstElementChild?.getBoundingClientRect();
  const last = track.lastElementChild?.getBoundingClientRect();
  previous.disabled = !first || first.left >= bounds.left - 1;
  next.disabled = !last || last.right <= bounds.right + 1;
}
function restoreShelfPositions(positions = {}) {
  document.querySelectorAll(".shelf-track").forEach((track) => {
    track.scrollLeft = positions[track.closest("[data-shelf]").dataset.shelf] || 0;
    syncShelfControls(track);
  });
}
let shelfDrag;
let dragClick;
main.addEventListener("pointerdown", (event) => {
  const track = event.target.closest(".shelf-track");
  if (!track || event.pointerType !== "mouse" || event.button !== 0
      || event.target.closest("button") || track.scrollWidth <= track.clientWidth) return;
  shelfDrag = { track, id: event.pointerId, x: event.clientX, start: track.scrollLeft, moved: false };
});
main.addEventListener("pointermove", (event) => {
  if (!shelfDrag || event.pointerId !== shelfDrag.id || !event.buttons) return;
  const distance = event.clientX - shelfDrag.x;
  if (!shelfDrag.moved && Math.abs(distance) < 7) return;
  if (!shelfDrag.moved) {
    shelfDrag.moved = true;
    shelfDrag.track.setPointerCapture(event.pointerId);
    shelfDrag.track.classList.add("is-dragging");
  }
  shelfDrag.track.scrollLeft = shelfDrag.start - distance;
});
main.addEventListener("dragstart", (event) => {
  if (event.target.closest(".shelf-track")) event.preventDefault();
});
function endShelfDrag(event) {
  if (!shelfDrag || event.pointerId !== shelfDrag.id) return;
  if (shelfDrag.moved) {
    shelfDrag.track.classList.remove("is-dragging");
    dragClick = shelfDrag.track;
    setTimeout(() => { dragClick = undefined; }, 0);
  }
  shelfDrag = undefined;
}
window.addEventListener("pointerup", endShelfDrag);
window.addEventListener("pointercancel", endShelfDrag);
main.addEventListener("click", (event) => {
  if (dragClick?.contains(event.target)) {
    event.preventDefault();
    event.stopPropagation();
  }
}, true);
main.addEventListener("scroll", (event) => {
  if (event.target.matches?.(".shelf-track")) syncShelfControls(event.target);
}, true);
window.addEventListener("resize", () => document.querySelectorAll(".shelf-track").forEach(syncShelfControls));

function updateResults() {
  const results = document.querySelector("#results");
  if (!results) return;
  const currentKey = filterKey();
  if (currentKey !== catalogFilterKey) catalogLimit = CATALOG_BATCH;
  catalogFilterKey = currentKey;
  directory?.syncCatalog(state.filters);
  const found = catalogResults(state.filters);
  const label = found.length === 1 ? "resultado" : "resultados";
  const savedEmpty = state.filters.favorites && !state.favorites.size;
  const recentEmpty = state.filters.recent && !recentlyViewed.length;
  const checkingAvailability = !found.length && state.filters.status && pendingServerSamples.size > 0;
  const relaxedFilter = !found.length && !savedEmpty && !recentEmpty
    ? ["edition", "language", "mode", "feature", "access", "status"].find((key) => {
        if (!state.filters[key]) return false;
        return catalogResults({ ...state.filters, [key]: "" }).length > 0;
      })
    : undefined;
  const labels = {
    q: "Busca",
    mode: "Modalidade",
    feature: "Estilo de jogo",
    edition: "Edição",
    language: "Idioma",
    sort: "Ordenação",
    status: "Disponibilidade",
    access: state.filters.access === "whitelist" ? "Entrada com aprovação" : "Entrada livre",
  };
  const displayFilter = (key, value) =>
    key === "access"
      ? labels[key]
      : key === "sort" ? ({ name: "Nome de A a Z", online: "Online primeiro", players: "Mais jogadores online" }[value] || value)
      : key === "status" ? ({ online: "Online", offline: "Offline", unknown: "Sem confirmação" }[value] || value)
      : key === "language" ? ({ English: "Inglês", Español: "Espanhol" }[value] || value) : value;
  const browsing = !Object.entries(state.filters).some(([key, value]) => key !== "sort" && value);
  // Search and saved lists are task-focused; secondary discovery stays on the home view.
  document.querySelectorAll(".player-studio, .join-platform").forEach((section) => {
    section.hidden = !browsing;
  });
  const editorial = document.querySelector("#discovery");
  const scrollPositions = shelfPositions();
  editorial?.remove();
  results.classList.toggle("results-shelves", browsing && found.length > 0);
  results.innerHTML = found.length
    ? browsing ? catalogShelves(found, card, { esc, icon, recentlyViewed }) : found.slice(0, catalogLimit).map(card).join("")
    : `<div class="empty">
        ${icon("search")}
        <h3>${checkingAvailability ? "Consultando a disponibilidade…" : savedEmpty ? "Nenhum servidor salvo ainda." : recentEmpty ? "Nenhum servidor visitado ainda." : state.filters.status === "online" && !state.filters.q ? "Nenhum servidor confirmado online." : "Nenhum servidor encontrado."}</h3>
        <p>${checkingAvailability ? "Os resultados aparecerão quando a consulta terminar." : savedEmpty ? "Toque no coração de um servidor para guardá-lo aqui." : recentEmpty ? "Os servidores que você abrir aparecem aqui." : "Remova um filtro ou tente outro nome."}</p>
        <button class="button secondary" data-action="clear-filters">Explorar todos</button>
        ${relaxedFilter ? `<button class="text-link" data-action="remove-filter" data-key="${relaxedFilter}">Remover filtro de ${labels[relaxedFilter].toLocaleLowerCase("pt-BR")}</button>` : ""}
      </div>`;
  if (editorial) {
    editorial.hidden = !browsing || !SERVERS.some((server) => server.official);
    document.querySelector("#catalog-results").after(editorial);
  }
  restoreShelfPositions(scrollPositions);
  const remoteMore=!state.filters.favorites&&!state.filters.recent&&directory?.catalog.nextOffset!==null&&directory?.catalog.nextOffset!==undefined;
  const more=document.querySelector('.catalog-more');more.hidden=!(remoteMore||(!browsing&&found.length>catalogLimit));
  more.querySelector('button').disabled=Boolean(directory?.catalog.loading);
  more.querySelector('button').textContent=directory?.catalog.loading?'Carregando…':remoteMore?'Carregar mais servidores publicados':'Mostrar mais servidores';
  const remoteStatus=document.querySelector('[data-directory-catalog-status]');
  if(remoteStatus){
    remoteStatus.innerHTML=directory?.catalog.error?'Não foi possível atualizar os servidores publicados. <button class="text-link" data-directory="retry-catalog">Tentar novamente</button>':directory?.catalog.loading?'Consultando servidores publicados…':'';
  }
  document.querySelector("[data-catalog-title]").textContent =
    state.filters.favorites ? "Seus favoritos"
      : state.filters.recent ? "Vistos recentemente"
      : state.filters.q ? "Resultados da busca"
      : state.filters.feature || state.filters.mode ? state.filters.feature || state.filters.mode
      : state.filters.edition ? `Servidores para ${state.filters.edition}`
      : "Explore por categoria";
  const count = document.querySelector("[data-result-count]");
  const countText = checkingAvailability ? "Consultando…" : `${found.length} ${label}`;
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
  document.querySelector('[data-action="explore"]')
    ?.setAttribute("aria-pressed", String(!state.filters.favorites && !state.filters.recent));
  document
    .querySelector('[data-action="favorites"]')
    ?.setAttribute("aria-pressed", String(Boolean(state.filters.favorites)));
  const recent = document.querySelector('[data-action="recent"]');
  if (recent) {
    recent.hidden = !recentlyViewed.length && !state.filters.recent;
    recent.setAttribute("aria-pressed", String(Boolean(state.filters.recent)));
  }
  document.querySelector('[data-action="clear-recent"]').hidden = !state.filters.recent || !recentlyViewed.length;
  const advancedCount = panelFilters.filter(
    (key) => state.filters[key],
  ).length;
  const filterCount = document.querySelector(".filter-count");
  filterCount.hidden = advancedCount === 0;
  filterCount.textContent = advancedCount ? String(advancedCount) : "";
  const search = document.querySelector("#server-search");
  if (search && search.value !== (state.filters.q || ""))
    search.value = state.filters.q || "";
  document.querySelectorAll("#extra-filters select").forEach((select) => {
    const value = state.filters[select.name] || "";
    if (select.value !== value) {
      const option = [...select.options].find((item) => item.value === value);
      if (option) option.selected = true;
    }
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
  if(directory)return void directory.start();
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
  if(directory)return void directory.newDraft();
  const d = initialDraft();
  d.name = "";
  d.address = "";
  d.summary = "";
  state.wizard = { draft: d, step: 0 };
  persist();
  renderWizard();
}
function serverIconMaxSize(draft) {
  return draft.plan === "pro" ? 384 : 160;
}

function imageControl(d, target, label) {
  const src = target === "gallery" ? d.gallery?.[0] : target === "avatar" ? withServerAvailability(d).avatar : d[target];
  const importedIcon = target === "avatar" && src && !d.avatar;
  return `<div class="media-control ${target === "avatar" ? "avatar-control" : ""}"><label class="media-dropzone">${src ? `<img ${mediaSource(src, esc)} alt="${label}">` : `<span class="media-placeholder">${icon(target === "avatar" ? "camera" : "photo")}<span>${label}</span></span>`}<span class="media-upload-caption">${icon("upload")} ${importedIcon ? "Ícone automático · personalizar" : src ? "Trocar imagem" : "Escolher imagem"}</span><input type="file" accept="image/png,image/jpeg,image/webp" aria-label="Enviar ${label}" data-upload="${target}" ${target === "gallery" ? "multiple" : ""}></label>${src && !importedIcon ? `<button class="text-link" type="button" data-action="remove-media" data-target="${target}">Remover</button>` : ""}</div>`;
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
    return `<h2 id="dialog-title">Crie a página do seu servidor.</h2><p>Divulgue um servidor que já existe. Comece com nome e endereço; fotos e detalhes vêm nas próximas etapas.</p><div class="source-tabs"><button type="button" data-action="source" data-value="manual" aria-pressed="${d.source === "manual"}">${icon("world")}<span>Já tenho um servidor<small>Informe o endereço de jogo</small></span></button><button type="button" data-action="source" data-value="manager" aria-pressed="${d.source === "manager"}">${icon("device-desktop")}<span>Usar o Manager<small>Experimentar importação</small></span></button></div>${d.source === "manager" ? '<div class="notice">Importação de exemplo. Confira o que ficará público; nenhuma conta do Manager é consultada.</div>' : ""}${field("name", d.name, { required: true, max: 64 })}${field("address", d.address, { required: true, hint: "Sem https://. Exemplo: jogar.seudominio.com." })}<div class="field"><span>Quem pode jogar? Selecione uma ou as duas edições.</span><div class="appearance-choice wizard-editions">${["Java", "Bedrock"].map((v) => `<button type="button" data-action="toggle-edition" data-value="${v}" aria-pressed="${d.editions.includes(v)}">${icon(v === "Java" ? "device-desktop" : "device-mobile")}<span><strong>${v}</strong><small>${v === "Java" ? "Minecraft Java no computador" : "Minecraft Bedrock em dispositivos compatíveis"}</small></span><span class="edition-check" aria-hidden="true">${d.editions.includes(v) ? icon("check") : ""}</span></button>`).join("")}</div></div>${d.editions.includes("Bedrock") ? field("port", d.port, { label: "Porta Bedrock", max: 5 }) : ""}`;
  if (step === 1)
    return `<h2 id="dialog-title">Dê uma identidade ao seu mundo.</h2><p>Escolha um ícone personalizado e uma capa. Os dois são opcionais.</p><div class="wizard-media"><div><h3>Ícone do servidor</h3>${imageControl(d, "avatar", "Ícone do servidor")}<p class="field-help">Imagem preparada com até ${serverIconMaxSize(d)} px nesta prévia.</p><details class="subscriber-detail"><summary title="Recurso para assinantes: ícone em maior resolução"><span class="subscriber-badge">${icon("sparkles")} Pro</span> Ícone em alta resolução</summary><p>Até 384 px na prévia para preservar mais detalhes da sua imagem. O ícone automático e a personalização básica já fazem parte da página gratuita.</p></details></div><div><h3>Capa</h3>${imageControl(d, "cover", "Capa do servidor")}</div></div><details class="optional-setup"><summary>Adicionar imagens à galeria (opcional)</summary>${imageControl(d, "gallery", "Galeria do servidor")}</details><p class="field-help">PNG, JPG ou WebP, até 5 MB por arquivo. As imagens são salvas na sua conta de teste.</p>`;
  if (step === 2)
    return `<h2 id="dialog-title">Como é jogar aqui?</h2><p>Uma boa apresentação ajuda a pessoa a entender se este é o mundo que procura.</p>${field("summary", d.summary, { area: true, max: 180, hint: "Uma frase sobre a experiência, sem precisar de um slogan." })}<details class="optional-setup"><summary>Adicionar uma descrição completa</summary>${field("description", d.description, { area: true, max: 4000, label: "Conte um pouco mais (opcional)" })}</details><div class="field-row">${select("mode", "Modalidade", MODES, d.mode)}${select("language", "Idioma", ["Português", "English", "Español"], d.language)}</div>${field("version", d.version, { label: "Versão compatível (opcional)" })}<h3>O que as pessoas encontram?</h3>${featureChoices(d)}`;
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
    )}</dl>${visibilityChoices(d)}<div class="notice">Seu rascunho fica salvo na conta. Para aparecer no catálogo, confirme o controle do servidor e envie a página para revisão.</div>`;
}
function miniPreview(d) {
  d = withServerAvailability(d);
  return `<div class="wizard-preview-inner" style="${themeStyle(d)}"><div class="mini-cover ${d.cover ? "" : "typographic"}">${d.cover ? `<img ${mediaSource(d.cover, esc)} alt="Prévia da capa">` : ""}</div><div class="mini-content">${d.avatar ? `<img class="mini-avatar" ${mediaSource(d.avatar, esc)} alt="">` : ""}<strong data-mini-name>${esc(d.name || "Seu servidor")}</strong><p data-mini-summary>${esc(d.summary || "A apresentação do seu servidor aparece aqui.")}</p><div class="card-tags">${d.editions.map((v) => `<span class="tag">${v}</span>`).join("")}<span class="tag">${esc(d.mode)}</span></div><span class="mini-address">${icon("copy")}<span data-mini-address>${esc(d.address || "seu-endereco.example")}</span></span></div></div><small>Prévia da sua página</small>`;
}
function renderWizard() {
  const w = state.wizard;
  if (!w) return;
  if (w.step > 0) void refreshServerSample(w.draft);
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
    if(directory)return void directory.finish(d);
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
  if (w.step === 0) void refreshServerSample(w.draft);
  w.step++;
  w.maxStep = Math.max(w.maxStep || 0, w.step);
  persist();
  renderWizard();
}
function layoutChoices(d) {
  return `<div class="appearance-choice">${[
    ["landscape", "Panorâmica"],
    ["compact", "Compacta"],
    ["spotlight", "Destaque"],
  ]
    .map(
      ([v, label]) =>
        `<button type="button" data-action="layout" data-value="${v}" ${v === "spotlight" ? 'title="Recurso para assinantes Força Aliada. Clique para conhecer e experimentar."' : ""} aria-pressed="${d.layout === v}"><span class="layout-sample layout-sample--${v}" aria-hidden="true"><i></i><i></i><i></i></span><span>${label}${v === "spotlight" ? ' <span class="subscriber-badge">' + icon("sparkles") + ' Pro</span>' : ""}</span></button>`,
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
  return `<section class="server-section game-gallery" id="section-gallery"><button class="gallery-stage" data-action="gallery" data-src="${esc(images[index])}" aria-label="Ampliar imagem selecionada"><img ${mediaSource(images[index], esc)} alt="Imagem ${index + 1} do mundo de ${esc(d.name)}" width="960" height="540"></button><div class="gallery-thumbnails" aria-label="Imagens do servidor">${images.map((src, i) => `<button data-action="gallery-select" data-index="${i}" aria-label="Selecionar imagem ${i + 1}" aria-pressed="${i === index}"><img ${mediaSource(src, esc)} alt="" width="160" height="90" loading="lazy"></button>`).join("")}${canEdit() ? `<button class="gallery-manage" data-action="media" data-target="gallery" aria-label="Gerenciar galeria">${icon("plus")}</button>` : ""}</div></section>`;
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
function connectionStatus(server, edition) {
  const status = serverAvailability(server, edition);
  const text = {
    online: "Online",
    offline: "Offline",
    scheduled: "Em breve",
    unknown: "Sem confirmação",
  }[status];
  const players = server.editionPlayers?.[edition];
  const count = players ? (players.max ? `${players.online}/${players.max}` : String(players.online)) : "";
  return { status, text, count };
}

function connectionAddress(server, edition) {
  const bedrock = edition === "Bedrock";
  return {
    address: bedrock ? server.address.split(":")[0] : server.address,
    port: bedrock ? server.port || "19132" : undefined,
  };
}

function hasExampleAddress(server) {
  return server.example
    && (server.id !== "minha-pagina" || /\.example(?::\d+)?$/i.test(server.address));
}

function connectionField(label, value, { example, editable = false }) {
  return `<div class="connection-field" data-connection-field>
    <div class="connection-field-text">
      <span>${label}</span>
      <code data-copy-source tabindex="-1">${esc(value)}</code>
    </div>
    ${editable ? `<button type="button" class="connection-icon-button" data-action="inline-edit" data-key="address" aria-label="Editar endereço">${icon("pencil")}</button>` : ""}
    ${example || !value ? "" : `<button type="button" class="connection-copy" data-action="copy-address" data-value="${esc(value)}" aria-label="Copiar ${label.toLowerCase()}">${icon("copy")}<span aria-hidden="true" data-copy-label>Copiar</span></button>`}
    <span class="connection-copy-feedback" data-copy-feedback role="status"></span>
  </div>`;
}

function connection(d) {
  const edition = d.editions.includes(state.selectedEdition) ? state.selectedEdition : d.editions[0];
  const multiple = d.editions.length > 1;
  const editable = canEdit();
  const example = hasExampleAddress(d);
  const saved = state.favorites.has(d.id);
  const favoriteLabel = saved ? "Remover dos favoritos" : "Guardar nos favoritos";
  return `<aside class="connect-panel play-panel" id="section-connect" data-connection aria-labelledby="connect-heading">
    <div class="connection-heading">
      <div>
        <h2 id="connect-heading">${d.access === "whitelist" ? "Como participar" : "Entre no servidor"}</h2>
        <span class="connection-access">${icon(d.access === "whitelist" ? "lock" : "world")}${d.access === "whitelist" ? "Lista de acesso" : "Entrada livre"}</span>
      </div>
      <button type="button" class="follow-server connection-icon-button" data-action="favorite" data-id="${esc(d.id)}" aria-label="${favoriteLabel}" title="${favoriteLabel}" aria-pressed="${saved}">${icon("heart")}</button>
    </div>
    <div class="connection-content">
      <div class="connection-editions">
      ${multiple ? `<div class="edition-tabs" role="tablist" aria-label="Edição do Minecraft">${d.editions.map((v) => `<button type="button" id="connect-tab-${v}" role="tab" data-action="edition" data-edition="${v}" aria-controls="connect-${v}" aria-selected="${edition === v}" tabindex="${edition === v ? 0 : -1}">${icon(v === "Java" ? "device-desktop" : "device-mobile")}${v}</button>`).join("")}</div>` : ""}
      ${d.editions.map((v) => {
        const { address, port } = connectionAddress(d, v);
        const { status, text, count } = connectionStatus(d, v);
        return `<div class="connection-edition" id="connect-${v}" data-connect-edition="${v}" ${multiple ? `role="tabpanel" aria-labelledby="connect-tab-${v}"` : ""} ${edition === v ? "" : "hidden"}>
          <div class="connection-status-line">
            ${multiple ? "" : `<span class="connection-single-edition">${icon(v === "Java" ? "device-desktop" : "device-mobile")}${v}</span>`}
            <span class="availability ${status}" data-connection-availability>${text}</span>
            <span class="connection-players" data-connection-players ${count ? "" : "hidden"}>${icon("users")}<span class="sr-only">Jogadores conectados: </span><span data-connection-count>${count}</span></span>
            ${d.version && !/^(a informar|consulte a equipe)$/i.test(d.version) ? `<span class="connection-version">${esc(d.version)}</span>` : ""}
          </div>
          <div class="connection-fields ${port ? "with-port" : ""}">
            ${connectionField("Endereço", address, { example, editable })}
            ${port ? connectionField("Porta", port, { example }) : ""}
          </div>
        </div>`;
      }).join("")}
      </div>
      <button type="button" class="button connection-help" data-action="join">${d.access === "whitelist" ? "Pedir acesso" : "Como entrar"} ${icon("arrow-right")}</button>
      ${example ? `<p class="connection-demo-note">${icon("alert-circle")} Exemplo de servidor. O endereço não aceita conexões.</p>` : ""}
    </div>
  </aside>`;
}

function updateConnectionAvailability() {
  if (!activeServer) return;
  const server = withServerAvailability(activeServer);
  document.querySelectorAll("[data-connect-edition]").forEach((panel) => {
    const { status, text, count } = connectionStatus(server, panel.dataset.connectEdition);
    const badge = panel.querySelector("[data-connection-availability]");
    const players = panel.querySelector("[data-connection-players]");
    badge.className = `availability ${status}`;
    badge.textContent = text;
    players.hidden = !count;
    players.querySelector("[data-connection-count]").textContent = count;
  });
}
function ownerBar() {
  return `<div class="owner-bar"><div><strong>${state.guestPreview ? "Visualização como visitante" : "Esta é a sua página"}</strong><span data-save-state>Rascunho salvo neste navegador</span></div><div>${!state.guestPreview ? `<button class="button secondary small" data-action="settings">${icon("settings")} Configurações</button><button class="button secondary small" data-action="guest-preview">${icon("eye")} Ver como visitante</button><button class="button small" data-action="publish">${directory?.publicationAction()||"Enviar para revisão"} ${icon("arrow-right")}</button>` : '<button class="button small" data-action="guest-preview">Voltar à edição</button>'}</div></div>`;
}
function serverDocument(d) {
  const ordered = d.modules;
  const editable = canEdit();
  return `<article class="server-page ${d.font === "system" ? "font-system" : ""} ${d.layout === "compact" ? "compact-layout" : d.layout === "spotlight" && d.plan === "pro" ? "spotlight-layout" : ""}" style="${themeStyle(d)}"><div class="server-hero ${d.cover ? "" : "typographic"}" data-name="${esc(d.name)}">${cover(d)}<div class="hero-shade"></div>${editable ? `<button class="hero-edit button secondary small" data-action="media" data-target="cover">${icon("camera")} Alterar capa</button>` : ""}<div class="server-hero-copy">${d.official ? `<span class="official-label">${icon("shield-check")} Oficial da Força Aliada</span>` : ""}<div class="server-identity">${d.avatar ? `<div class="server-avatar">${`<img ${mediaSource(d.avatar, esc)} alt="Foto de ${esc(d.name)}">`}${editable ? `<button data-action="media" data-target="avatar" aria-label="Alterar foto do servidor">${icon("camera")}</button>` : ""}</div>` : editable ? `<button class="server-avatar avatar-empty" data-action="media" data-target="avatar" aria-label="Adicionar foto do servidor">${icon("camera")}</button>` : ""}<div>${editText(d, "name", d.name, "h1")}${editText(d, "summary", d.summary, "p", "Adicione uma apresentação curta.")}</div></div></div></div><div class="container server-play-band">${connection(d)}</div><div class="server-subnav"><div>${d.modules.includes("about") ? '<button data-action="page-section" data-id="section-about">Visão geral</button>' : ""}${d.modules.includes("gallery") && d.gallery?.length ? '<button data-action="page-section" data-id="section-gallery">Imagens</button>' : ""}${d.modules.includes("news") && d.newsTitle ? '<button data-action="page-section" data-id="section-news">Novidades</button>' : ""}${d.modules.includes("event") && d.eventTitle ? '<button data-action="page-section" data-id="section-event">Encontros</button>' : ""}<button data-action="page-section" data-id="section-connect">Como entrar</button></div>${d.example ? "<span>Servidor de demonstração</span>" : ""}</div><div class="server-layout"><div class="server-main"><div class="server-meta">${[...d.editions, d.mode, d.language].map((v) => `<span class="tag">${esc(v)}</span>`).join("")}</div>${ordered.map((id) => serverSection(id, d)).join("")}${editable ? `<button class="add-section" data-action="settings" data-tab="sections">${icon("plus")} Adicionar ou organizar seções</button>` : ""}</div></div><div class="server-bottom"><span>Uma página <a href="#/">Força Aliada Servidores</a></span><button class="text-link" data-action="create">Crie a sua, grátis ${icon("arrow-right")}</button></div></article>`;
}
function previewReview(server) {
  const key = `fa-minecraft-demo-review:${server.id}`;
  let saved;
  try { saved = localStorage.getItem(key); } catch {}
  const { score, count } = server.demoRating;
  return `<section class="container preview-review" aria-labelledby="preview-review-title">
    <div><h2 id="preview-review-title">Avaliações</h2><p><strong>★ ${score.toFixed(1).replace(".", ",")}</strong> · ${count} avaliações simuladas</p></div>
    <form data-preview-review>
      <label for="preview-score">Sua nota de teste</label>
      <select id="preview-score" name="score" required><option value="">Escolher nota</option>
        ${[5, 4, 3, 2, 1].map((value) => `<option value="${value}" ${Number(saved) === value ? "selected" : ""}>${value} de 5</option>`).join("")}
      </select>
      <button class="button secondary" type="submit">Salvar nota</button>
      <small role="status">${saved ? "Nota salva neste navegador." : "A nota fica neste navegador."}</small>
    </form>
  </section>`;
}

function renderPage(id) {
  if(directory&&/^[a-f0-9-]{36}$/i.test(id)){
    const status=directory.publicState(id);
    if(!status||Date.now()-status.checkedAt>=60_000){void directory.loadPublic(id);main.innerHTML='<section class="container empty" role="status"><p>Carregando página do servidor…</p></section>';return;}
    if(status.status==='loading'){main.innerHTML='<section class="container empty" role="status"><p>Carregando página do servidor…</p></section>';return;}
    if(status.status==='error'){main.innerHTML=`<section class="container empty"><h1>Não foi possível carregar a página.</h1><p>Confira sua conexão e tente novamente.</p><button class="button" data-directory="retry-page" data-id="${id}">Tentar novamente</button><a class="text-link" href="#/">Voltar aos servidores</a></section>`;return;}
  }
  activeServer =
    id === "minha-pagina"
      ? state.account && state.created
        ? state.draft
        : state.publication
      : SERVERS.find((s) => s.id === id);
  if (!activeServer) {
    main.innerHTML = `<section class="container empty"><h1>${id === "minha-pagina" ? "Sua página começa aqui." : "Página não encontrada."}</h1><p>${id === "minha-pagina" ? "Crie sua página em etapas, com nome, imagens e apresentação do seu mundo." : "O link pode estar incorreto ou a página não está mais publicada."}</p><button class="button" data-action="create">Criar página grátis ${icon("arrow-right")}</button></section>`;
    paintIcons();
    return;
  }
  if(/^[a-f0-9-]{36}$/i.test(id))setRecentServers([id,...recentlyViewed.filter(entry=>entry!==id)].slice(0,8));
  document.title=`${activeServer.name} · Servidores de Minecraft · Força Aliada`;
  const displayServer = withServerAvailability(activeServer);
  main.innerHTML =
    activeServer.id === "forca-aliada"
      ? officialPage(displayServer, { icon, connection, gallery: mediaGallery })
      : `<div class="container page-controls"><nav class="page-breadcrumb" aria-label="Caminho"><a href="#/">Servidores</a>${icon("chevron-right")}<span>${esc(activeServer.name)}</span></nav>${!ownPage() ? '<button class="text-link" data-action="create">Criar uma página como esta</button>' : ""}</div>${ownPage() ? ownerBar() : ""}${serverDocument(displayServer)}`;
  if (displayServer.demoRating) main.insertAdjacentHTML("beforeend", previewReview(displayServer));
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
    content = `<h3>Conexão e compatibilidade</h3>${field("address", d.address, { required: true })}<div class="field-row">${field("port", d.port, { label: "Porta Bedrock", max: 5 })}${field("version", d.version)}</div><div class="field-row">${select("mode", "Modalidade", MODES, d.mode)}${select("language", "Idioma", ["Português", "English", "Español"], d.language)}</div>${select("access", "Entrada", ["Aberta", "Com whitelist"], d.access === "whitelist" ? "Com whitelist" : "Aberta")}<h3>Características</h3>${featureChoices(d)}<h3>Links da comunidade</h3>${field("discord", d.discord, { label: "Discord" })}${field("website", d.website, { label: "Site ou outro canal" })}<label class="switch"><input type="checkbox" name="community" ${d.community ? "checked" : ""}><span>Perfil do servidor no Community (demonstração)</span></label><h3>Próximo encontro</h3>${field("eventTitle", d.eventTitle)}${field("eventDate", d.eventDate, { label: "Data e hora do encontro", type: "datetime-local" })}${select("eventZone", "Fuso horário", ["America/Sao_Paulo", "UTC", "Europe/Lisbon"], d.eventZone)}<p class="field-help">O horário aparece com o fuso escolhido. Não é ajustado silenciosamente ao horário do visitante.</p>`;
  else
    content = `${visibilityChoices(d)}<div class="notice">Seu rascunho é separado da última publicação. Enviar para revisão permite publicar a versão salva na sua conta.</div><button class="button" type="button" data-action="publish">${directory?.publicationAction()||"Enviar para revisão"} ${icon("arrow-right")}</button><div class="form-divider"></div><button class="text-link" type="button" data-action="reset">Minhas páginas</button>`;
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
    `<h2 id="dialog-title">${target === "avatar" ? "Ícone do servidor" : target === "cover" ? "Capa da página" : "Galeria do seu mundo"}</h2><p>Escolha imagens do seu servidor. Elas serão preparadas e salvas na sua conta de teste.</p>${imageControl(d, target, target === "avatar" ? "Ícone do servidor" : target === "cover" ? "Capa da página" : "Galeria")}${target === "gallery" && d.gallery.length ? `<div class="media-gallery-manager">${d.gallery.map((src, i) => `<div><img ${mediaSource(src, esc)} alt="Imagem ${i + 1}"><button class="icon-button" data-action="remove-gallery" data-index="${i}" aria-label="Remover imagem ${i + 1}">${icon("x")}</button></div>`).join("")}</div>` : ""}${target === "cover" && d.cover ? `<label class="field"><span>Enquadramento vertical da capa</span><input type="range" name="coverPosition" min="0" max="100" value="${d.coverPosition}"></label>` : ""}<p class="field-help">PNG, JPG ou WebP · até 5 MB cada · galeria com até 6 imagens nesta prévia.</p><div class="invalid-box" data-form-error hidden></div><div class="dialog-actions"><button class="button" data-action="close-dialog">Concluir</button></div>`,
    "media",
  );
}
async function prepareImage(file, target, draft) {
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
  const max = target === "avatar" ? serverIconMaxSize(draft) : target === "cover" ? 1280 : 960;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  const imageWidth = Math.max(1, Math.round(bitmap.width * scale));
  const imageHeight = Math.max(1, Math.round(bitmap.height * scale));
  const squareIcon = target === "avatar";
  canvas.width = squareIcon ? Math.max(imageWidth, imageHeight) : imageWidth;
  canvas.height = squareIcon ? canvas.width : imageHeight;
  canvas.getContext("2d").drawImage(
    bitmap,
    (canvas.width - imageWidth) / 2,
    (canvas.height - imageHeight) / 2,
    imageWidth,
    imageHeight,
  );
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
  if(directory)return await directory.upload(input);
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
    for (const f of files) images.push(await prepareImage(f, target, d));
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
  if(inline){commitInline();if(inline)return;}
  if(directory)return void directory.publish();
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
  const example = hasExampleAddress(d);
  const notice = example
    ? '<div class="notice">Este endereço é demonstrativo e não aceita conexões.</div>'
    : "";
  if (d.access === "whitelist") {
    const contact = safeLink(d.discord) || safeLink(d.website);
    const action = contact && !example
      ? `<a class="button full" href="${esc(contact)}" target="_blank" rel="noopener noreferrer ugc">Falar com a equipe ${icon("external-link")}</a>`
      : '<button class="button secondary full" data-action="close-dialog">Voltar à página</button>';
    openDialog(`<h2 id="dialog-title">Como pedir acesso</h2>
      ${notice}
      <p>O servidor usa uma lista de acesso. Confira as regras e peça à equipe para incluir seu nome de jogador antes de se conectar.</p>
      ${action}`);
    return;
  }

  const bedrock = edition === "Bedrock";
  const { address, port } = connectionAddress(d, edition);
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
    <div class="address-field"><code data-copy-source tabindex="-1">${esc(address)}</code></div>
    ${bedrock ? `<p>Porta Bedrock: <strong>${esc(port)}</strong>.</p>
      <p class="field-help">Em alguns consoles, a opção de adicionar servidores personalizados pode não aparecer.</p>` : ""}
    <p class="field-help" data-copy-feedback role="status"></p>
    ${example
      ? '<button class="button secondary full" data-action="close-dialog">Voltar à página</button>'
      : `<button class="button full" data-action="copy-address" data-value="${esc(address)}">${icon("copy")} <span data-copy-label>Copiar endereço</span></button>`}`);
}
async function copyText(text, trigger) {
  const scope = trigger?.closest(".card-address, [data-connection-field], dialog");
  const feedback = scope?.querySelector("[data-copy-feedback]");
  const isCard = scope?.classList.contains("card-address");
  const isConnection = scope?.hasAttribute("data-connection-field");
  const fieldLabel = scope?.querySelector(".connection-field-text > span")?.textContent;
  try {
    await navigator.clipboard.writeText(text);
    if (feedback?.isConnected) {
      feedback.textContent = fieldLabel === "Porta" ? "Porta copiada." : "Endereço copiado.";
      scope.classList.remove("copy-failed");
      const label = trigger.querySelector("[data-copy-label]");
      if (label) label.textContent = isCard || isConnection ? "Copiado" : "Copiar novamente";
      if (isConnection) {
        trigger.querySelector(".icon").dataset.icon = "check";
        trigger.classList.add("copied");
        paintIcons(trigger);
      }
    } else {
      toast("Endereço copiado.");
    }
  } catch {
    if (feedback?.isConnected) {
      feedback.textContent = isConnection
        ? "A cópia automática falhou. Copie o valor selecionado."
        : "A cópia automática não está disponível. Copie o endereço selecionado.";
      scope.classList.add("copy-failed");
      const label = trigger.querySelector("[data-copy-label]");
      if (label) label.textContent = isCard || isConnection ? "Copiar" : "Copiar endereço";
      if (isConnection) {
        trigger.querySelector(".icon").dataset.icon = "copy";
        trigger.classList.remove("copied");
        paintIcons(trigger);
      }
      const source = scope.querySelector("[data-copy-source]");
      if (source) {
        source.focus();
        const selection = window.getSelection?.();
        if (selection) {
          const range = document.createRange();
          range.selectNodeContents(source);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
      return;
    }
    if (trigger && !trigger.isConnected) {
      toast("Não foi possível copiar o endereço.");
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
  const draft = workingDraft();
  openDialog(
    `<h2 id="dialog-title">Experimente a composição Destaque.</h2><p>Ela amplia a capa e centraliza a apresentação. É um exemplo de personalização avançada incluída na assinatura Força Aliada.</p><div class="subscriber-preview"><span class="subscriber-badge">${icon("sparkles")} Força Aliada Pro</span><div class="subscriber-page-sample"><img src="${esc(draft.cover || "./shared/images/galeria14.webp")}" alt="Exemplo da capa ampliada"><strong>${esc(draft.name || "Seu servidor")}</strong><span>Sua comunidade começa aqui.</span></div><strong>Mais espaço para mostrar seu mundo.</strong><span>Capa ampla · apresentação centralizada · ícone em maior resolução</span></div><p class="field-help">Você pode experimentar estes recursos nesta prévia, sem cobrança. A disponibilidade comercial será definida antes do lançamento.</p><a class="text-link" href="https://forcaaliada.com/assinatura" target="_blank" rel="noopener">Conhecer a assinatura Força Aliada ${icon("external-link")}</a><div class="dialog-actions"><button class="button secondary" data-action="pro-return">Continuar no básico</button><button class="button gold" data-action="try-pro">Experimentar modo Pro ${icon("sparkles")}</button></div>`,
    "premium",
  );
}
let proReturnMode = "";
function updateHeader() {
  const createButton = document.querySelector(".header-create");
  if (createButton)
    createButton.hidden = (location.hash.split("?")[0] || "#/") !== "#/";
  const n = document.querySelector('#account-area');
  if(!n)return;
  // Use the same approved component and CSS as the Manager page.
  let host=n.querySelector('#auth-container');if(!host){host=document.createElement('div');host.id='auth-container';n.replaceChildren(host);}
  const notifications=state.account?`<details class="prototype-notifications"><summary aria-label="Notificações">${icon('bell')}</summary><div class="account-popover notifications-popover"><strong>Notificações</strong><p>${directory?.record?.state==='pending'?'Sua página está em revisão.':'Nenhuma nova notificação.'}</p></div></details>`:'';
  window.FAAccountMenu?.mount(host,directory?.me||null,{prefix:notifications,onLogout:()=>void directory.logout()});
  window.FAAccountMenu?.setPlan({kind:'unavailable'});
  host.onclick=()=>{const top=document.querySelector('.site-header').getBoundingClientRect().bottom+8;host.style.setProperty('--fa-account-top',top+'px');const panel=host.querySelector('.fa-site-user-dropdown');if(panel)panel.style.maxHeight=Math.max(120,innerHeight-top-12)+'px';};
  host.querySelectorAll('a[href^="/"]').forEach(a=>a.href='https://forcaaliada.com'+a.getAttribute('href'));
  host.querySelector('.fa-account-login')?.addEventListener('click',event=>{event.preventDefault();directory.login();});
  const menu=host.querySelector('.fa-site-user-dropdown nav');
  if(menu){
    const pages=document.createElement('button');pages.type='button';pages.className='fa-site-user-item';pages.dataset.directory='pages';
    pages.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 9v12"/></svg><span>Minhas páginas</span>';menu.prepend(pages);
    if(['owner','full'].includes(directory.me?.role)){
      const review=document.createElement('button');review.type='button';review.className='fa-site-user-item';review.dataset.directory='moderation';
      review.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg><span>Revisar páginas</span>';menu.append(review);
    }
  }
  paintIcons(host);
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
  } else if (path === "/revisoes" || path.startsWith("/revisoes/")) {
    void directory?.reviewRoute(path.startsWith("/revisoes/")?path.slice(10):'');
    document.title="Revisão de páginas · Força Aliada";
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
    if (SERVERS.some((server) => server.id === id) || (id === "minha-pagina" && state.publication?.visibility === "listed"))
      setRecentServers([id, ...recentlyViewed.filter((entry) => entry !== id)].slice(0, 8));
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
    restoreShelfPositions(catalogReturn?.shelves);
    const returnLink = catalogReturn?.id
      ? [...document.querySelectorAll("#results .server-card")].find(
          (card) => card.dataset.id === catalogReturn.id
            && (!catalogReturn.shelf || card.closest("[data-shelf]")?.dataset.shelf === catalogReturn.shelf),
        )?.querySelector(".card-heading a")
      : catalogReturn?.featured ? document.querySelector(catalogReturn.stage ? ".catalog-stage-caption" : "#featured a.button")
      : [...document.querySelectorAll(".catalog-shelf")].find(
          (shelf) => shelf.dataset.shelf === catalogReturn?.shelf,
        )?.querySelector(".shelf-heading h3 a");
    if (!returnLink && path === "/" && params.size && !catalogReturn) {
      focusCatalogHeading();
      return;
    }
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
  for (const disclosure of document.querySelectorAll(".prototype-account[open], .prototype-notifications[open], .catalog-help[open], .gameplay-directory[open]")) {
    if (!disclosure.contains(e.target) || e.target.closest(".account-popover a, .account-popover button, .catalog-help-panel a, .catalog-help-panel button")) disclosure.open = false;
  }
  const tools = document.querySelector(".tools-menu");
  if (tools?.open && (!e.target.closest(".tools-menu") || e.target.closest(".tools-popover a, .compact-create-link")))
    tools.open = false;
  const catalogLink = e.target.closest('#results .card-heading a, #results a.card-picture-link, #results .shelf-heading a, #featured a.button, .catalog-stage-caption');
  if (catalogLink && !e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
    history.replaceState({
      catalogReturn: {
        id: catalogLink.closest(".server-card")?.dataset.id,
        featured: Boolean(catalogLink.closest("#featured, .catalog-stage-art")),
        stage: catalogLink.classList.contains("catalog-stage-caption"),
        scroll: window.scrollY,
        shelves: shelfPositions(),
        shelf: catalogLink.closest("[data-shelf]")?.dataset.shelf,
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
  } else if (a === "scroll-shelf") {
    const track = b.closest(".catalog-shelf")?.querySelector(".shelf-track");
    track?.scrollBy({
      left: Number(b.dataset.direction) * track.clientWidth * 0.85,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
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
  } else if (a === "explore") {
    if (!state.filters.favorites && !state.filters.recent) return;
    delete state.filters.favorites;
    delete state.filters.recent;
    updateResults();
    animateCatalogResults();
  } else if (a === "favorites") {
    delete state.filters.recent;
    state.filters.favorites = state.filters.favorites ? "" : true;
    updateResults();
    animateCatalogResults();
  } else if (a === "recent") {
    delete state.filters.favorites;
    state.filters.recent = state.filters.recent ? "" : true;
    updateResults();
    animateCatalogResults();
  } else if (a === "clear-recent") {
    setRecentServers([]);
    updateResults();
    focusCatalogHeading();
  } else if (a === "more-results") {
    const previous = catalogLimit;
    catalogLimit += CATALOG_BATCH;
    if(!state.filters.favorites&&!state.filters.recent&&directory?.catalog.nextOffset!==null)void directory?.morePublic();
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
      const label = saved ? "Remover dos favoritos" : "Guardar nos favoritos";
      b.setAttribute("aria-label", label);
      b.title = label;
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
      for (const button of main.querySelectorAll(".card-favorite")) {
        if (button.dataset.id !== id) continue;
        button.setAttribute("aria-pressed", String(saved));
        if (server) button.setAttribute("aria-label", saved
          ? `Remover dos favoritos: ${server.name}`
          : `Favoritar ${server.name}`);
      }
      if (saved && e.detail && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
        b.querySelector(".icon")?.animate?.([
          { transform: "scale(.84)" },
          { transform: "scale(1.22)", offset: .55 },
          { transform: "scale(1)" },
        ], { duration: 260, easing: "cubic-bezier(.23, 1, .32, 1)" });
      }
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
    panel.querySelectorAll("[data-connect-edition]").forEach((n) => {
      n.hidden = n.dataset.connectEdition !== state.selectedEdition;
    });
  } else if (a === "join") showJoin();
  else if (a === "community") showCommunity();
  else if (a === "page-section") {
    const target = document.getElementById(b.dataset.id);
    if (target) {
      target.scrollIntoView({
        block: "start",
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      });
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }
  } else if (a === "gallery") {
    openDialog(
      `<h2 id="dialog-title">Imagens de ${esc(activeServer.name)}</h2><img ${mediaSource(b.dataset.src, esc)} alt="Imagem ampliada do servidor"><p>${activeServer.official ? "Captura real da Força Aliada." : "Imagem adicionada à página do servidor."}</p>`,
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
    if(directory){void directory.logout();return;}
    state.account = false;
    state.guestPreview = false;
    inline = null;
    updateHeader();
    if (location.hash.includes("/skins")) route({ focus: false });
    else refreshPage();
    toast("Visualização sem conta conectada.");
  } else if (a === "login") {
    if(directory){directory.login();return;}
    state.account = true;
    updateHeader();
    if (location.hash.includes("/skins")) route({ focus: false });
    else refreshPage();
    toast("Conta de demonstração conectada.");
  } else if (a === "reset") {
    if(directory){void directory.start();return;}
    openDialog(
      '<h2 id="dialog-title">Recomeçar esta demonstração?</h2><p>O rascunho e a publicação local serão removidos. Seus favoritos permanecem.</p><div class="dialog-actions"><button class="button secondary" data-action="close-dialog">Manter página</button><button class="button" data-action="confirm-reset">Recomeçar</button></div>',
    );
  } else if (a === "confirm-reset") {
    if(directory){void directory.start();return;}
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
  if (e.target.matches("[data-preview-review]")) {
    e.preventDefault();
    if (!activeServer?.demoRating) return;
    const score = Number(e.target.elements.score.value);
    if (!Number.isInteger(score) || score < 1 || score > 5) return;
    const status = e.target.querySelector('[role="status"]');
    try {
      localStorage.setItem(`fa-minecraft-demo-review:${activeServer.id}`, String(score));
      status.textContent = "Nota salva neste navegador.";
    } catch {
      status.textContent = "Não foi possível salvar a nota neste navegador.";
    }
    return;
  }
  if (e.target.id === "search-form") {
    e.preventDefault();
    closeSearchPreview();
    state.filters.q = e.target.querySelector("#server-search").value.trim();
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
document.addEventListener("compositionend", (e) => {
  if (e.target.id === "server-search") updateSearchPreview(e.target);
});
document.addEventListener("focusin", (e) => {
  if (e.target.id === "server-search" && !e.target.closest("#search-form").contains(e.relatedTarget)) updateSearchPreview(e.target);
});
document.addEventListener("focusout", (e) => {
  const form = e.target.closest("#search-form");
  if (form && e.relatedTarget && !form.contains(e.relatedTarget)) closeSearchPreview();
});
document.addEventListener("pointerdown", (e) => {
  if (!e.target.closest("#search-form")) closeSearchPreview();
});
document.addEventListener("keydown", (e) => {
  const form = e.target.closest("#search-form");
  const preview = form?.querySelector("#server-search-preview:not([hidden])");
  if (!preview || e.isComposing) return;
  const input = form.querySelector("#server-search");
  if (e.key === "Escape") {
    e.preventDefault();
    input.focus();
    closeSearchPreview();
  } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    const items = [input, ...preview.querySelectorAll("a, button")];
    const current = items.indexOf(e.target);
    if (current < 0 || items.length < 2) return;
    e.preventDefault();
    const step = e.key === "ArrowDown" ? 1 : -1;
    items[Math.max(0, Math.min(items.length - 1, current + step))].focus();
  }
});
document.addEventListener("input", (e) => {
  if (e.target.id === "server-search") {
    if (!e.isComposing) updateSearchPreview(e.target);
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
  if (e.target.matches("#extra-filters select")) {
    state.filters[e.target.name] = e.target.value;
    updateResults();
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
    for (const disclosure of document.querySelectorAll(".prototype-account[open], .prototype-notifications[open], .catalog-help[open], .gameplay-directory[open]")) {
      const focused = disclosure.contains(document.activeElement);
      disclosure.open = false;
      if (focused) disclosure.querySelector("summary")?.focus();
    }
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
  void refreshServerStatuses();
});
window.addEventListener("pagehide", persist);
document.addEventListener("visibilitychange", refreshServerStatuses);
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
directory=connectDirectory({
  state,esc,icon,safeDraft,initialDraft,openDialog,closeDialog,toast,renderWizard,renderPage,updateHeader,updateSaveStatus,
  cacheOnly:()=>persist({remote:false}),
  renderCurrent:()=>route({focus:false}),
  setImageBusy:value=>imageBusy=value,
  refreshMedia:target=>{if(dialogMode==='wizard'){renderWizard();if(target==='gallery'){const section=dialog.querySelector('details.optional-setup');if(section)section.open=true;}}else{refreshPage();mediaDialog(target);}},
  savedIds:filters=>filters.favorites?[...state.favorites]:recentlyViewed,
  refreshOwner:()=>{if(ownPage())refreshPage();},
  catalogChanged:()=>{if(document.querySelector("#results")){updateResults();void refreshServerStatuses();}},
  renderSurface:html=>{activeServer=null;main.innerHTML=html;paintIcons();},
  renderReview:(page,id,top,bottom)=>{activeServer={...safeDraft(page),id,example:false,official:false};main.innerHTML=top+serverDocument(withServerAvailability(activeServer))+bottom;paintIcons();void refreshServerStatuses();},
  removePublic:id=>{const index=SERVERS.findIndex(s=>s.id===id&&s.directory);if(index>=0)SERVERS.splice(index,1);},
  addPublic:value=>{const d={...safeDraft(value),id:value.id,example:false,official:false,directory:true};const index=SERVERS.findIndex(s=>s.id===d.id);if(index<0)SERVERS.unshift(d);else SERVERS[index]=d;},
});
void directory.init();
route({ focus: false });
if (/^https?:$/.test(location.protocol)) {
  void refreshServerStatuses();
  window.setInterval(refreshServerStatuses, 60_000);
}
