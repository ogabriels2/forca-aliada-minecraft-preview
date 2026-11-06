import {
  blankPixels,
  pieceMask,
  faces,
  rgba,
  extractPiece,
} from "./skin-pixels.mjs";
export const CATEGORIES = {
  hair: "Cabelos",
  tops: "Roupas",
  bottoms: "Calças",
  shoes: "Calçados",
};
const designs = [
  ["hair-castanho", "Castanho curto", "hair", "#5b3828", "#825539"],
  ["hair-black", "Cabelo escuro", "hair", "#252329", "#48424d"],
  ["hair-rose", "Rosa pixel", "hair", "#d66b9b", "#f39ec1"],
  ["hair-blond", "Loiro dourado", "hair", "#b98739", "#e4be68"],
  ["top-explorer", "Jaqueta explorador", "tops", "#38654b", "#b9d6a1"],
  ["top-ocean", "Moletom oceano", "tops", "#305e9c", "#83c7d6"],
  ["top-plum", "Moletom ameixa", "tops", "#744c88", "#d7b4dc"],
  ["top-red", "Jaqueta terracota", "tops", "#aa4b3f", "#efb28d"],
  ["pants-ink", "Jeans escuro", "bottoms", "#343d58", "#6b7896"],
  ["pants-sand", "Calça areia", "bottoms", "#9d845e", "#d5c09a"],
  ["shoes-white", "Tênis claros", "shoes", "#ece8dc", "#777f87"],
  ["shoes-hike", "Botas de trilha", "shoes", "#674b39", "#b89765"],
];
function designPixels(category, base, detail, model) {
  const mask = pieceMask(category, model),
    out = blankPixels(),
    c = rgba(base),
    d = rgba(detail),
    f = faces(model, "outer");
  for (const [part, ff] of Object.entries(f))
    for (const [face, r] of Object.entries(ff)) {
      for (let y = 0; y < r[3]; y++)
        for (let x = 0; x < r[2]; x++) {
          const p = (r[1] + y) * 64 + r[0] + x;
          if (!mask[p]) continue;
          const edge = x === 0 || x === r[2] - 1,
            shade = c.map((v, i) =>
              i === 3
                ? v
                : Math.max(
                    0,
                    Math.min(
                      255,
                      v +
                        (face === "top"
                          ? 10
                          : face === "right" || face === "back"
                            ? -12
                            : 0) +
                        (edge ? -7 : 0),
                    ),
                  ),
            );
          out.set(shade, p * 4);
          if (category === "hair" && x % 3 === 0)
            out.set(
              c.map((v, i) => (i === 3 ? v : Math.max(0, v - 12))),
              p * 4,
            );
        }
    }
  const rect = (x, y, w, h, col) => {
    for (let py = y; py < y + h; py++)
      for (let px = x; px < x + w; px++) {
        const p = py * 64 + px;
        if (mask[p]) out.set(col, p * 4);
      }
  };
  if (category === "tops") {
    const [x, y, w, h] = f.body.front;
    rect(x + w / 2 - 1, y, 2, h, d);
    rect(x + 1, y + 6, 2, 2, d);
    rect(x + w - 3, y + 6, 2, 2, d);
    rect(x + 2, y, 4, 2, [0, 0, 0, 0]);
    for (const part of ["leftArm", "rightArm"]) {
      const r = f[part].front;
      rect(r[0], r[1] + 10, r[2], 2, d);
    }
  }
  if (category === "bottoms")
    for (const part of ["leftLeg", "rightLeg"]) {
      const r = f[part].front;
      rect(r[0], r[1], r[2], 1, d);
      rect(r[0] + 1, r[1] + 1, 2, 2, d);
    }
  if (category === "shoes")
    for (const part of ["leftLeg", "rightLeg"]) {
      const r = f[part].front;
      rect(r[0], r[1] + 11, r[2], 1, d);
    }
  return out;
}
export const SAMPLE_PARTS = designs.map(
  ([id, name, category, color, detail]) => ({
    id,
    name,
    category,
    color,
    creator: "Força Aliada · amostra",
    model: "both",
    sample: true,
    pixelsFor: (model) => designPixels(category, color, detail, model),
  }),
);
export function safePart(value) {
  if (
    !value ||
    !/^[a-zA-Z0-9-]{1,70}$/.test(value.id || "") ||
    !CATEGORIES[value.category] ||
    !["classic", "slim"].includes(value.model) ||
    !/^data:image\/png;base64,[a-zA-Z0-9+/=]+$/.test(value.image || "") ||
    value.image.length > 100000
  )
    return null;
  return {
    id: value.id,
    name: String(value.name || "Minha peça")
      .trim()
      .slice(0, 60),
    category: value.category,
    model: value.model,
    image: value.image,
    creator: "Você",
    own: true,
    sourceCredits: Array.isArray(value.sourceCredits)
      ? value.sourceCredits.map((x) => String(x).slice(0, 100)).slice(0, 20)
      : [],
  };
}
export const maskedPart = extractPiece;
