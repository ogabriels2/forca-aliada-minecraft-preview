import { SAMPLE_PARTS } from '../skin-parts.mjs?v=wardrobe-20261113';
import { overlay } from '../skin-pixels.mjs?v=creations-20261113';
import { drawSkinFront, pixelCanvas } from '../skin-viewer.mjs';
import { createTexture, presets } from './skin-textures.js?v=studio';

// Use the pieces shipped in the Minecraft catalog, on the home's original bases.
const outfits = {
  orbita: ['fa-jacket-denim', 'fa-jeans', 'fa-sneakers'],
  aurora: ['fa-hair-curls', 'fa-sweater-plum', 'fa-shorts-coast', 'fa-sneakers'],
  trilha: ['fa-shirt-flannel', 'fa-cargo', 'fa-boots'],
};

export { presets, drawSkinFront, pixelCanvas };

function recolorFabric(pixels, original, color) {
  const rgb = hex => hex.slice(1).match(/../g).map(value => parseInt(value, 16));
  const from = rgb(original);
  const to = rgb(color);
  const result = new Uint8ClampedArray(pixels);
  for (let i = 0; i < result.length; i += 4) {
    if (!result[i + 3]) continue;
    const distance = Math.max(...from.map((value, channel) => Math.abs(value - result[i + channel])));
    if (distance > 55) continue;
    for (let channel = 0; channel < 3; channel++) {
      result[i + channel] += to[channel] - from[channel];
    }
  }
  return result;
}

export function dressLook(name, color = presets[name].coat) {
  const base = createTexture(name, color);
  let pixels = base.getContext('2d').getImageData(0, 0, 64, 64).data;
  for (const id of outfits[name]) {
    const part = SAMPLE_PARTS.find(item => item.id === id);
    const layer = part.pixelsFor('classic');
    const adjusted = part.category === 'tops'
      ? recolorFabric(layer, part.color, color)
      : layer;
    pixels = overlay(pixels, adjusted);
  }
  return pixels;
}
