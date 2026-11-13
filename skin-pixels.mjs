// Minecraft's unfolded UV layout, shared by painting, masks and catalogue pieces.
export const SIZE = 64;
export const PART_NAMES = {
  head: "Cabeça",
  body: "Tronco",
  rightArm: "Braço direito",
  leftArm: "Braço esquerdo",
  rightLeg: "Perna direita",
  leftLeg: "Perna esquerda",
};
export const FACE_NAMES = {
  front: "Frente",
  back: "Costas",
  right: "Direita",
  left: "Esquerda",
  top: "Topo",
  bottom: "Base",
};
export function faces(model = "classic", layer = "outer") {
  const arm = model === "slim" ? 3 : 4;
  const origins =
    layer === "base"
      ? {
          head: [0, 0, 8, 8, 8],
          body: [16, 16, 8, 12, 4],
          rightArm: [40, 16, arm, 12, 4],
          leftArm: [32, 48, arm, 12, 4],
          rightLeg: [0, 16, 4, 12, 4],
          leftLeg: [16, 48, 4, 12, 4],
        }
      : {
          head: [32, 0, 8, 8, 8],
          body: [16, 32, 8, 12, 4],
          rightArm: [40, 32, arm, 12, 4],
          leftArm: [48, 48, arm, 12, 4],
          rightLeg: [0, 32, 4, 12, 4],
          leftLeg: [0, 48, 4, 12, 4],
        };
  return Object.fromEntries(
    Object.entries(origins).map(([part, [x, y, w, h, d]]) => [
      part,
      {
        top: [x + d, y, w, d],
        bottom: [x + d + w, y, w, d],
        right: [x, y + d, d, h],
        front: [x + d, y + d, w, h],
        left: [x + d + w, y + d, d, h],
        back: [x + d + w + d, y + d, w, h],
      },
    ]),
  );
}
export const blankPixels = () => new Uint8ClampedArray(SIZE * SIZE * 4);
export function rgba(hex) {
  const value = /^#[0-9a-f]{6}$/i.test(hex) ? hex : "#ffffff";
  return [1, 3, 5].map((n) => parseInt(value.slice(n, n + 2), 16)).concat(255);
}
export function hexColor(pixels, x, y) {
  const i = (y * 64 + x) * 4;
  return (
    "#" +
    [...pixels.slice(i, i + 3)]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  );
}
export function inside(x, y, r) {
  return x >= r[0] && y >= r[1] && x < r[0] + r[2] && y < r[1] + r[3];
}
export function locateFace(x, y, model, layer) {
  for (const [part, ff] of Object.entries(faces(model, layer)))
    for (const [face, rect] of Object.entries(ff))
      if (inside(x, y, rect)) return { part, face, rect };
  return null;
}
export function paintPixel(
  pixels,
  x,
  y,
  color,
  rect,
  size = 1,
  mirror = false,
) {
  const offset = Math.floor((size - 1) / 2);
  for (let dy = 0; dy < size; dy++)
    for (let dx = 0; dx < size; dx++) {
      const px = x + dx - offset,
        py = y + dy - offset;
      if (!inside(px, py, rect)) continue;
      pixels.set(color, (py * 64 + px) * 4);
      if (mirror) {
        const mx = rect[0] + rect[2] - 1 - (px - rect[0]);
        pixels.set(color, (py * 64 + mx) * 4);
      }
    }
}
export function floodFace(pixels, x, y, color, rect) {
  if (!inside(x, y, rect)) return;
  const target = [...pixels.slice((y * 64 + x) * 4, (y * 64 + x) * 4 + 4)];
  if (target.every((v, i) => v === color[i])) return;
  const stack = [[x, y]],
    seen = new Set();
  while (stack.length) {
    const [px, py] = stack.pop(),
      key = py * 64 + px;
    if (seen.has(key) || !inside(px, py, rect)) continue;
    seen.add(key);
    const i = key * 4;
    if (!target.every((v, n) => pixels[i + n] === v)) continue;
    pixels.set(color, i);
    stack.push([px - 1, py], [px + 1, py], [px, py - 1], [px, py + 1]);
  }
}
export function overlay(bottom, top) {
  const out = new Uint8ClampedArray(bottom);
  for (let i = 0; i < out.length; i += 4) {
    const a = top[i + 3] / 255;
    if (!a) continue;
    const b = out[i + 3] / 255,
      alpha = a + b * (1 - a);
    for (let n = 0; n < 3; n++)
      out[i + n] = Math.round(
        (top[i + n] * a + out[i + n] * b * (1 - a)) / alpha,
      );
    out[i + 3] = Math.round(alpha * 255);
  }
  return out;
}
export function pieceMask(category, model = "classic") {
  const mask = new Uint8Array(4096),
    ff = faces(model, "outer");
  const allowed =
    category === "hair"
      ? ["head"]
      : category === "tops"
        ? ["body", "leftArm", "rightArm"]
        : ["leftLeg", "rightLeg"];
  for (const part of allowed)
    for (const [face, r] of Object.entries(ff[part]))
      for (let y = 0; y < r[3]; y++)
        for (let x = 0; x < r[2]; x++) {
          if (category === "hair" && face === "front" && y > 2) continue;
          if (category === "hair" && face === "bottom") continue;
          if (
            category === "bottoms" &&
            face === "bottom"
          )
            continue;
          if (
            category === "shoes" &&
            ((face !== "top" && face !== "bottom" && y < 8) || face === "top")
          )
            continue;
          mask[(r[1] + y) * 64 + r[0] + x] = 1;
        }
  return mask;
}
export function extractPiece(pixels, category, model) {
  const mask = pieceMask(category, model),
    out = blankPixels();
  for (let p = 0; p < 4096; p++)
    if (mask[p]) out.set(pixels.subarray(p * 4, p * 4 + 4), p * 4);
  return out;
}
// Imported outfits often live on the base layer. Move the selected UV region
// onto the clothing overlay, then retain its existing outer details.
export function extractWearable(pixels,category,model,includeBase=false){
  if(!includeBase)return extractPiece(pixels,category,model);
  const out=blankPixels(),base=faces(model,'base'),outer=faces(model,'outer'),mask=pieceMask(category,model);
  for(const [part,ff] of Object.entries(outer))for(const [face,r] of Object.entries(ff)){
    const from=base[part][face];
    for(let y=0;y<r[3];y++)for(let x=0;x<r[2];x++){
      const target=(r[1]+y)*64+r[0]+x;if(!mask[target])continue;
      const source=((from[1]+y)*64+from[0]+x)*4;out.set(pixels.subarray(source,source+4),target*4);
    }
  }
  return extractPiece(overlay(out,pixels),category,model);
}
export function composeSkin(pixels, equipped, parts, model) {
  let out = new Uint8ClampedArray(pixels);
  for (const id of ['hair','tops','bottoms','shoes'].map(category=>equipped?.[category]).filter(Boolean)) {
    const part = parts.find((p) => p.id === id);
    if (part)
      out = overlay(out, part.pixelsFor ? part.pixelsFor(model) : part.pixels);
  }
  return out;
}
export class EditHistory {
  constructor(limit = 50) {
    this.limit = limit;
    this.past = [];
    this.future = [];
  }
  clone(s) {
    return {
      pixels: new Uint8ClampedArray(s.pixels),
      equipped: { ...s.equipped },
      model: s.model,
    };
  }
  equal(a, b) {
    return (
      a.model === b.model &&
      JSON.stringify(a.equipped) === JSON.stringify(b.equipped) &&
      a.pixels.every((v, i) => v === b.pixels[i])
    );
  }
  commit(before, after) {
    if (this.equal(before, after)) return false;
    this.past.push(this.clone(before));
    if (this.past.length > this.limit) this.past.shift();
    this.future = [];
    return true;
  }
  undo(current) {
    if (!this.past.length) return null;
    this.future.push(this.clone(current));
    return this.past.pop();
  }
  redo(current) {
    if (!this.future.length) return null;
    this.past.push(this.clone(current));
    return this.future.pop();
  }
}
