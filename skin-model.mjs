import { safeLink } from "./model.mjs";
export const BASE_SKINS = Object.freeze([
  {
    id: "base-steve",
    name: "Steve",
    author: "Mojang Studios",
    model: "classic",
    image: "./assets/skins/steve.png",
    tags: ["Modelo base"],
    base: true,
  },
  {
    id: "base-alex",
    name: "Alex",
    author: "Mojang Studios",
    model: "slim",
    image: "./assets/skins/alex.png",
    tags: ["Modelo base"],
    base: true,
  },
]);
export const skinDimensions = (w, h) => w === 64 && (h === 32 || h === 64);
export const skinText = (value, max = 70) =>
  String(value || "")
    .replace(/[\u0000-\u001f]/g, "")
    .trim()
    .slice(0, max);
export function skinTags(value) {
  return [
    ...new Set(
      String(value || "")
        .split(",")
        .map((v) => skinText(v, 24))
        .filter(Boolean),
    ),
  ].slice(0, 5);
}
export function safeSkin(value) {
  if (
    !value ||
    !/^[a-zA-Z0-9-]{1,70}$/.test(value.id || "") ||
    !/^data:image\/png;base64,[a-zA-Z0-9+/=]+$/.test(value.image || "") ||
    value.image.length > 1400000
  )
    return null;
  return {
    id: value.id,
    name: skinText(value.name) || "Minha skin",
    publisher: "demo",
    publisherName: "Você",
    creatorMode: ["self", "credited"].includes(value.creatorMode)
      ? value.creatorMode
      : "unspecified",
    creatorName:
      value.creatorMode === "credited" ? skinText(value.creatorName) : "",
    sourceUrl:
      value.creatorMode === "credited" ? safeLink(value.sourceUrl) : "",
    model: value.height !== 32 && value.model === "slim" ? "slim" : "classic",
    height: value.height === 32 ? 32 : 64,
    image: value.image,
    tags: skinTags(Array.isArray(value.tags) ? value.tags.join(",") : ""),
    owner: "demo",
    visibility: value.visibility === "unlisted" ? "unlisted" : "listed",
    componentCredits: Array.isArray(value.componentCredits)
      ? [
          ...new Set(
            value.componentCredits.map((v) => skinText(v, 120)).filter(Boolean),
          ),
        ].slice(0, 30)
      : [],
  };
}
export function findSkins(skins, query = "", model = "") {
  const plain = (s) =>
    String(s)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const q = plain(query).trim();
  return skins.filter(
    (s) =>
      (!model || s.model === model) &&
      (!q ||
        plain(
          [s.name, s.author, s.publisherName, s.creatorName, ...s.tags].join(
            " ",
          ),
        ).includes(q)),
  );
}
export function skinCreditError(value) {
  if (!["self", "credited"].includes(value.creatorMode))
    return "Informe quem criou esta skin.";
  if (value.creatorMode === "credited" && !skinText(value.creatorName))
    return "Informe o nome do criador para preservar o crédito.";
  if (
    value.creatorMode === "credited" &&
    String(value.sourceUrl || "").trim() &&
    !safeLink(value.sourceUrl)
  )
    return "A origem precisa ser um link HTTPS válido, sem credenciais.";
  return "";
}
