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
