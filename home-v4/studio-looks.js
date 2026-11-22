import { faces } from '../skin-pixels.mjs?v=creations-20261113';
import { drawSkinFront, imagePixels, pixelCanvas } from '../skin-viewer.mjs';

export { drawSkinFront, pixelCanvas };

export const presets = {
  gabalarca: {
    name: 'Gabalarca', coat: '#ffe600',
    fabric: (r, g, b) => r > 200 && g > 170 && b < 70,
  },
  'pato-detetive': {
    name: 'Pato detetive', coat: '#9a8165',
    fabric: (r, g, b) => r > g + 12 && g > b + 12,
  },
  seguidor: {
    name: 'Seguidor', coat: '#174a32',
    fabric: (r, g, b) => g > r + 8 && g > b + 8,
  },
};

const textures = new Map();
export function loadCatalogLook(name) {
  if (!textures.has(name)) {
    const image = new URL(`media/skin-${name}.png`, import.meta.url);
    textures.set(name, imagePixels(image).catch(error => {
      textures.delete(name);
      throw error;
    }));
  }
  return textures.get(name);
}

// Restrict recoloring to the coat on both layers of the torso and arms.
const shirtPixels = new Set();
for (const layer of ['base', 'outer']) {
  const layout = faces('classic', layer);
  for (const part of [layout.body, layout.leftArm, layout.rightArm]) {
    for (const [x, y, width, height] of Object.values(part)) {
      for (let row = y; row < y + height; row++) {
        for (let col = x; col < x + width; col++) shirtPixels.add(row * 64 + col);
      }
    }
  }
}

function rgb(hex) {
  return hex.slice(1).match(/../g).map(value => parseInt(value, 16));
}

export function recolorCatalogLook(name, pixels, color) {
  const { coat, fabric } = presets[name];
  if (color === coat) return pixels;
  const target = rgb(color);
  const original = rgb(coat);
  const result = new Uint8ClampedArray(pixels);
  for (const point of shirtPixels) {
    const offset = point * 4;
    if (!pixels[offset + 3] || !fabric(pixels[offset], pixels[offset + 1], pixels[offset + 2])) continue;
    for (let channel = 0; channel < 3; channel++) {
      result[offset + channel] += target[channel] - original[channel];
    }
  }
  return result;
}
