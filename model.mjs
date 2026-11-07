export const THEMES = Object.freeze({
  ocean: {
    name: "Oceano",
    accent: "#244b72",
    ground: "#edf3f8",
    ink: "#132238",
  },
  forest: {
    name: "Floresta",
    accent: "#286446",
    ground: "#eef5ef",
    ink: "#173225",
  },
  plum: {
    name: "Ametista",
    accent: "#68529b",
    ground: "#f3f0f8",
    ink: "#2b2240",
  },
  amber: {
    name: "Âmbar",
    accent: "#875a25",
    ground: "#faf3e8",
    ink: "#382a1c",
  },
});
export const MODULES = Object.freeze([
  {
    id: "about",
    name: "Sobre o servidor",
    hint: "Apresente a experiência de quem joga.",
  },
  { id: "gallery", name: "Galeria", hint: "Mostre o mundo com imagens reais." },
  {
    id: "rules",
    name: "Regras e entrada",
    hint: "O que a pessoa precisa saber para participar.",
  },
  {
    id: "community",
    name: "Community",
    hint: "Novidades e conversas da comunidade.",
  },
  {
    id: "faq",
    name: "Perguntas frequentes",
    hint: "Respostas rápidas antes de entrar.",
  },
  {
    id: "news",
    name: "Novidades",
    hint: "Um aviso ou uma atualização para quem acompanha.",
  },
  {
    id: "event",
    name: "Próximo encontro",
    hint: "Uma sessão com data, horário e fuso definidos.",
  },
  {
    id: "links",
    name: "Links da comunidade",
    hint: "Discord, site e outros canais que você escolher.",
  },
]);
export const MODES = Object.freeze(["Survival", "Criativo", "Aventura", "Minigames", "RPG"]);
export const GAMEPLAY = Object.freeze([
  "Minigames", "Mods", "PvP", "BedWars", "RPG", "Skyblock", "Hardcore",
  "Parkour", "Roleplay", "Economia", "Exploração", "Construção em equipe",
  "Vanilla", "SMP", "Factions", "Modpacks",
]);
export const FEATURES = Object.freeze([
  ...GAMEPLAY,
  "Para jogar com amigos",
]);
export const SERVERS = Object.freeze([
  {
    id: "forca-aliada",
    features: ["Construção em equipe", "Exploração", "Vanilla"],
    name: "Força Aliada",
    summary:
      "Survival vanilla, grandes farms, cidades e caminhos que conectam tudo.",
    description:
      "Um mundo survival vanilla com farms bem planejadas, construções e cidades feitas pela comunidade. A infraestrutura de transportes conecta projetos e lugares, sem sistemas de proteção de terrenos adicionados por plugins.",
    editions: ["Java", "Bedrock"],
    mode: "Survival",
    language: "Português",
    status: "unknown",
    statusText: "Estado não consultado",
    avatar: "./assets/servers/forca-aliada.png",
    cover: "./shared/images/hero.webp",
    theme: "ocean",
    official: true,
    example: false,
    address: "fa.ogabriels.com",
    port: "19132",
    version: "Consulte a equipe",
    gallery: [
      "./shared/images/galeria27.webp",
      "./shared/images/galeria19.webp",
      "./shared/images/galeria10.webp",
      "./shared/images/galeria14.webp",
      "./shared/images/galeria26.webp",
    ],
    rules:
      "Respeite outros jogadores e suas construções. Confira as orientações completas com a equipe antes de entrar. As regras finais e a compatibilidade serão confirmadas antes do lançamento.",
    community: true,
    modules: ["gallery", "about", "rules", "community", "faq"],
    layout: "landscape",
    headline: "Um mundo que ganha forma com quem joga.",
    access: "open",
  },
  {
    id: "vale-do-ipe",
    features: ["Construção em equipe"],
    name: "Vale do Ipê",
    summary:
      "Survival sem pressa, construções em conjunto e uma comunidade pequena.",
    description:
      "Uma proposta de servidor para quem gosta de começar uma vila com amigos, explorar e construir no próprio ritmo.",
    editions: ["Java", "Bedrock"],
    mode: "Survival",
    language: "Português",
    status: "online",
    statusText: "Online · exemplo",
    theme: "amber",
    example: true,
    address: "vale-do-ipe.example",
    version: "1.21.x · exemplo",
    gallery: [],
    rules:
      "Combine antes de alterar construções de outras pessoas. Respeite os espaços compartilhados.",
    community: true,
    modules: ["about", "rules", "community", "faq"],
    layout: "landscape",
    headline: "Um lugar para começar de novo. Juntos.",
    access: "open",
  },
  {
    id: "atelie",
    features: ["Construção em equipe"],
    name: "Ateliê",
    summary: "Um espaço criativo para testar ideias e construir em equipe.",
    description:
      "Um exemplo de comunidade dedicada à construção. Cada projeto é uma oportunidade para experimentar materiais, escalas e novas ideias.",
    editions: ["Java"],
    mode: "Criativo",
    language: "Português",
    status: "online",
    statusText: "Online · exemplo",
    theme: "plum",
    example: true,
    address: "atelie.example",
    version: "1.21.x · exemplo",
    gallery: [],
    rules:
      "Peça acesso à equipe. Dê crédito a quem constrói e cuide dos projetos compartilhados.",
    community: false,
    modules: ["about", "rules", "faq"],
    layout: "landscape",
    headline: "Ideias grandes. Espaço para construir.",
    access: "whitelist",
  },
  {
    id: "horizonte",
    features: ["Exploração"],
    name: "Horizonte",
    summary: "Exploração, trilhas e novas aventuras para quem joga no Bedrock.",
    description:
      "Um exemplo para testar como o catálogo ajuda jogadores de Bedrock a encontrar experiências compatíveis.",
    editions: ["Bedrock"],
    mode: "Aventura",
    language: "Português",
    status: "scheduled",
    statusText: "Abre às 19h · exemplo",
    theme: "ocean",
    example: true,
    address: "horizonte.example",
    port: "19132",
    version: "1.21.x · exemplo",
    gallery: [],
    rules: "Siga as orientações do grupo e consulte os horários das sessões.",
    community: false,
    modules: ["about", "rules", "faq"],
    layout: "landscape",
    headline: "Sempre existe um próximo caminho.",
    access: "open",
  },
  {
    id: "redwood",
    features: ["Construção em equipe"],
    name: "Redwood",
    summary: "A small survival world for friends who enjoy building together.",
    description:
      "An example server that demonstrates language filtering without translating owner-created content automatically.",
    editions: ["Java"],
    mode: "Survival",
    language: "English",
    status: "offline",
    statusText: "Offline · exemplo",
    theme: "forest",
    example: true,
    address: "redwood.example",
    version: "1.21.x · example",
    gallery: [],
    rules: "Respect other players and ask before changing shared builds.",
    community: false,
    modules: ["about", "rules"],
    layout: "landscape",
    headline: "Make something worth coming back to.",
    access: "open",
  },
  {
    id: "la-isla",
    features: ["Construção em equipe"],
    name: "La Isla",
    summary: "Una comunidad creativa para construir y compartir proyectos.",
    description:
      "Un servidor de ejemplo para probar la búsqueda por idioma y modalidad.",
    editions: ["Java", "Bedrock"],
    mode: "Criativo",
    language: "Español",
    status: "online",
    statusText: "Online · exemplo",
    theme: "amber",
    example: true,
    address: "la-isla.example",
    port: "19132",
    version: "1.21.x · ejemplo",
    gallery: [],
    rules: "Respeta a los demás y cuida los proyectos de la comunidad.",
    community: false,
    modules: ["about", "rules"],
    layout: "landscape",
    headline: "Un mundo para construir en compañía.",
    access: "whitelist",
  },
]);
export function initialDraft() {
  return {
    id: "minha-pagina",
    name: "Meu servidor",
    summary: "Um novo mundo para compartilhar com os amigos.",
    description: "",
    editions: ["Java", "Bedrock"],
    mode: "Survival",
    language: "Português",
    status: "unknown",
    statusText: "Estado não consultado",
    theme: "forest",
    example: true,
    address: "meu-servidor.example",
    port: "19132",
    version: "A informar",
    gallery: [],
    rules: "",
    community: false,
    modules: ["gallery", "about", "rules", "links"],
    layout: "landscape",
    headline: "Um mundo para construir juntos.",
    access: "open",
    visibility: "unlisted",
    plan: "basic",
    font: "manrope",
    source: "manual",
    features: [],
    discord: "",
    website: "",
    newsTitle: "",
    newsBody: "",
    eventTitle: "",
    eventDate: "",
    eventZone: "America/Sao_Paulo",
    eventDescription: "",
    coverPosition: 50,
  };
}
export function safeLink(value) {
  try {
    const url = new URL(String(value || ""));
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.hostname === "localhost"
    )
      return "";
    return url.href.slice(0, 500);
  } catch {
    return "";
  }
}
export function safeMedia(value) {
  return typeof value === "string" &&
    (/^\/shared\/images\/(?:hero\.webp|galeria(?:10|19|27)\.webp|fa-icon-dark\.png)$/.test(
      value,
    ) ||
      (/^data:image\/(?:webp|jpeg|png);base64,[a-zA-Z0-9+/=]+$/.test(value) &&
        value.length < 650000))
    ? value
    : undefined;
}
export function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}
export function catalogFilters(params) {
  const options = {
    edition: ["Java", "Bedrock"],
    mode: MODES,
    feature: GAMEPLAY,
    language: ["Português", "English", "Español"],
    access: ["open", "whitelist"],
    status: ["online", "offline", "unknown"],
    sort: ["name"],
  };
  const filters = {};
  const query = params.get("q")?.trim().slice(0, 160);
  if (query) filters.q = query;
  for (const [key, values] of Object.entries(options)) {
    const value = params.get(key);
    if (values.includes(value)) filters[key] = value;
  }
  if (["true", "1"].includes(params.get("favorites"))) filters.favorites = true;
  else if (["true", "1"].includes(params.get("recent"))) filters.recent = true;
  if (!filters.status && ["true", "1"].includes(params.get("online"))) filters.status = "online";
  return filters;
}

const availabilityOrder = { online: 0, unknown: 1, scheduled: 2, offline: 3 };

export function serverAvailability(server, edition) {
  if (!server.editionStatus) return server.status || "unknown";
  if (edition && server.editions.includes(edition))
    return server.editionStatus[edition] || "unknown";
  const states = server.editions.map((key) => server.editionStatus[key]);
  if (states.includes("online")) return "online";
  return states.every((status) => status === "offline") ? "offline" : "unknown";
}

export function readProviderAvailability(data, edition, host, now = Date.now()) {
  if (!data || data.host !== host || typeof data.online !== "boolean"
    || !Number.isFinite(data.retrieved_at) || !Number.isFinite(data.expires_at)
    || data.retrieved_at > now + 30_000 || data.retrieved_at < now - 120_000
    || data.expires_at < now || data.expires_at <= data.retrieved_at
    || data.eula_blocked === true) return "unknown";
  if (!data.online) return "offline";
  // The main site's monitor treats a zero-capacity Java proxy response as unreliable.
  if (edition === "Java" && !(Number.isFinite(data.players?.max) && data.players.max > 0))
    return "unknown";
  return "online";
}

export function readProviderIcon(value) {
  const prefix = "data:image/png;base64,";
  if (typeof value !== "string" || !value.startsWith(prefix) || value.length > 65_536)
    return undefined;
  const encoded = value.slice(prefix.length);
  if (encoded.length < 44 || encoded.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded))
    return undefined;
  const header = atob(encoded.slice(0, 44));
  // Check the PNG signature and the length, name and dimensions of the IHDR chunk.
  const expected = [137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 64, 0, 0, 0, 64];
  return expected.every((byte, index) => header.charCodeAt(index) === byte)
    ? value
    : undefined;
}

export function catalogEdition(filters = {}, terms = normalize(filters.q).trim().split(/\s+/)) {
  const queryEditions = ["Java", "Bedrock"].filter((edition) => terms.includes(edition.toLowerCase()));
  return filters.edition || (queryEditions.length === 1 ? queryEditions[0] : "");
}

export function filterServers(servers, filters = {}) {
  const query = normalize(filters.q).trim().replace(/\s+/g, " ");
  const terms = query ? query.split(" ") : [];
  const statusTerms = { online: "online", "on-line": "online", offline: "offline", "off-line": "offline" };
  const edition = catalogEdition(filters, terms);
  const statusFilter = filters.status || (filters.online ? "online" : "");
  const ranked = [];

  for (const server of servers) {
    const availability = serverAvailability(server, edition);
    if ((edition && !server.editions.includes(edition))
      || (filters.mode && server.mode !== filters.mode)
      || (filters.feature && server.mode !== filters.feature && !server.features?.includes(filters.feature))
      || (filters.language && server.language !== filters.language)
      || (statusFilter && availability !== statusFilter)
      || (filters.access && server.access !== filters.access)) continue;

    const name = normalize(server.name);
    const searchable = normalize([
      server.name, server.mode, ...server.editions, server.language,
      { English: "Inglês", Español: "Espanhol" }[server.language],
      server.address, server.version, server.summary, ...(server.features || []),
    ].join(" "));
    if (!terms.every((term) => Object.hasOwn(statusTerms, term)
      ? availability === statusTerms[term]
      : searchable.includes(term))) continue;

    let relevance = terms.filter((term) => name.includes(term)).length;
    if (query && name === query) relevance += terms.length + 2;
    else if (query && name.startsWith(query)) relevance += terms.length + 1;
    ranked.push({ server, relevance, availability });
  }

  return ranked
    .sort((a, b) =>
      filters.sort === "name"
        ? a.server.name.localeCompare(b.server.name, "pt-BR")
        : b.relevance - a.relevance
          || Number(Boolean(a.server.example)) - Number(Boolean(b.server.example))
          || availabilityOrder[a.availability] - availabilityOrder[b.availability],
    )
    .map(({ server }) => server);
}
export function slugify(value) {
  return (
    normalize(value)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "meu-servidor"
  );
}
export function validateDraft(draft) {
  const errors = {};
  if (!draft.name?.trim() || draft.name.trim().length > 64)
    errors.name = "Use um nome entre 1 e 64 caracteres.";
  if (!draft.summary?.trim() || draft.summary.trim().length > 180)
    errors.summary = "Escreva uma apresentação com até 180 caracteres.";
  if (
    !draft.editions?.length ||
    draft.editions.some((v) => !["Java", "Bedrock"].includes(v))
  )
    errors.editions = "Escolha Java, Bedrock ou os dois.";
  if (
    !/^(?=.{1,253}$)[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?(?::\d{1,5})?$/i.test(
      draft.address || "",
    )
  )
    errors.address = "Informe um endereço de jogo, sem https:// ou espaços.";
  if (
    draft.editions?.includes("Bedrock") &&
    (!/^\d+$/.test(String(draft.port)) ||
      Number(draft.port) < 1 ||
      Number(draft.port) > 65535)
  )
    errors.port = "Use uma porta entre 1 e 65535.";
  return errors;
}
export function safeDraft(value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return initialDraft();
  const base = initialDraft();
  for (const field of [
    "name",
    "summary",
    "description",
    "address",
    "port",
    "version",
    "rules",
    "headline",
    "newsTitle",
    "newsBody",
    "eventTitle",
    "eventDate",
    "eventDescription",
  ])
    if (typeof value[field] === "string")
      base[field] = value[field].slice(
        0,
        ["description", "rules", "newsBody", "eventDescription"].includes(field)
          ? 4000
          : 280,
      );
  for (const [field, allowed] of Object.entries({
    theme: Object.keys(THEMES),
    plan: ["basic", "pro"],
    font: ["manrope", "system"],
    visibility: ["unlisted", "listed"],
    layout: ["landscape", "compact", "spotlight"],
    source: ["manual", "manager"],
  }))
    if (allowed.includes(value[field])) base[field] = value[field];
  if (Array.isArray(value.editions)) {
    const editions = [
      ...new Set(value.editions.filter((v) => ["Java", "Bedrock"].includes(v))),
    ];
    if (editions.length) base.editions = editions;
  }
  if (Array.isArray(value.modules))
    base.modules = [
      ...new Set(value.modules.filter((v) => MODULES.some((m) => m.id === v))),
    ];
  base.community = value.community === true;
  base.cover = safeMedia(value.cover);
  base.avatar = safeMedia(value.avatar);
  base.gallery = Array.isArray(value.gallery)
    ? value.gallery.map(safeMedia).filter(Boolean).slice(0, 6)
    : [];
  base.features = Array.isArray(value.features)
    ? [...new Set(value.features.filter((v) => FEATURES.includes(v)))]
    : [];
  base.discord = safeLink(value.discord);
  base.website = safeLink(value.website);
  if (["America/Sao_Paulo", "UTC", "Europe/Lisbon"].includes(value.eventZone))
    base.eventZone = value.eventZone;
  base.coverPosition = Math.max(
    0,
    Math.min(100, Number(value.coverPosition) || 50),
  );
  if (["open", "whitelist"].includes(value.access)) base.access = value.access;
  if (base.layout === "spotlight" && base.plan !== "pro")
    base.layout = "landscape";
  if (MODES.includes(value.mode))
    base.mode = value.mode;
  if (["Português", "English", "Español"].includes(value.language))
    base.language = value.language;
  return base;
}
export function publicationFrom(draft) {
  const errors = validateDraft(draft);
  if (Object.keys(errors).length) return { errors };
  const clean = safeDraft(draft);
  return {
    publication: {
      ...clean,
      id: "minha-pagina",
      name: clean.name.trim(),
      publishedAt: new Date().toISOString(),
      example: true,
      status: "unknown",
      statusText: "Prévia local · estado não consultado",
    },
  };
}
export function eventUTC(date, zone = "America/Sao_Paulo") {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(date || "")) return null;
  const parts = date.match(/\d+/g).map(Number),
    target = Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4]);
  if (!Number.isFinite(target)) return null;
  const normalized = new Date(target);
  if (
    normalized.getUTCFullYear() !== parts[0] ||
    normalized.getUTCMonth() !== parts[1] - 1 ||
    normalized.getUTCDate() !== parts[2] ||
    parts[3] > 23 ||
    parts[4] > 59
  )
    return null;
  let guess = target;
  try {
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
    for (let i = 0; i < 3; i++) {
      const p = Object.fromEntries(
        fmt
          .formatToParts(new Date(guess))
          .filter((p) => p.type !== "literal")
          .map((p) => [p.type, Number(p.value)]),
      );
      const seen = Date.UTC(
        p.year,
        p.month - 1,
        p.day,
        p.hour,
        p.minute,
        p.second,
      );
      guess += target - seen;
    }
    const final = Object.fromEntries(
      fmt
        .formatToParts(new Date(guess))
        .filter((p) => p.type !== "literal")
        .map((p) => [p.type, Number(p.value)]),
    );
    if (
      Date.UTC(
        final.year,
        final.month - 1,
        final.day,
        final.hour,
        final.minute,
      ) !== target
    )
      return null;
    return new Date(guess);
  } catch {
    return null;
  }
}
