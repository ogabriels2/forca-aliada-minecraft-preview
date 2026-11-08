import { MODES } from "./model.mjs";

const cover = (number) => `./assets/catalog/mundo-${number}.webp`;
const themes = ["forest", "amber", "ocean", "plum"];
const places = [
  "Aurora", "Nascente", "Farol", "Cais", "Montanha", "Horizonte",
  "Arquipélago", "Pomar", "Refúgio", "Colina", "Ponte", "Trilha",
];
const regions = ["do Norte", "do Vale", "da Serra", "da Costa", "do Leste"];
const categories = [
  { features: ["Vanilla", "SMP", "Economia"], summary: "Um mundo persistente para explorar, construir e jogar em grupo." },
  { features: ["Construção em equipe", "Roleplay"], summary: "Projetos de construção em equipe, de pequenas vilas a cidades inteiras." },
  { features: ["Exploração", "Parkour", "Hardcore"], summary: "Rotas de exploração e desafios para descobrir com amigos." },
  { features: ["PvP", "BedWars", "Skyblock"], summary: "Partidas curtas e desafios em equipe." },
  { features: ["Mods", "Roleplay", "Modpacks"], summary: "Progressão, personagens e exploração em grupo." },
];

// Real screenshots from the existing gallery illustrate fictional listings.
export function previewCatalog(baseServers) {
  const originals = baseServers.map((server, index) =>
    server.example ? { ...server, cover: cover(index * 3) } : server,
  );
  const examples = MODES.flatMap((mode, category) => {
    const { features, summary } = categories[category];
    return Array.from({ length: 60 }, (_, index) => {
      const id = `demo-${category + 1}-${index + 1}`;
      const photo = ((index * 5 + category * 7 + 4) % 27) + 1;
      return {
        id,
        name: `${places[index % places.length]} ${regions[Math.floor(index / places.length)]} · ${mode}`,
        mode,
        summary,
        description: "Página de teste do catálogo. As capturas são da galeria da Força Aliada.",
        features: [features[index % features.length]],
        editions: index % 4 === 0 ? ["Java", "Bedrock"] : index % 4 === 1 ? ["Bedrock"] : ["Java"],
        language: index % 11 === 0 ? "Español" : index % 7 === 0 ? "English" : "Português",
        example: true,
        status: "unknown",
        address: `${id}.example`,
        port: "19132",
        version: "Exemplo",
        cover: cover(photo),
        gallery: [cover(photo), cover(((photo + 8) % 27) + 1)],
        theme: themes[(index + category) % themes.length],
        access: index % 5 === 0 ? "whitelist" : "open",
        layout: "landscape",
        modules: ["about", "gallery"],
      };
    });
  });
  return [...originals, ...examples];
}
