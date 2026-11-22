import { SAMPLE_PARTS } from '../skin-parts.mjs?v=wardrobe-20261113';
import { faces, overlay } from '../skin-pixels.mjs?v=creations-20261113';
import { drawSkinFront, imagePixels, pixelCanvas } from '../skin-viewer.mjs';
import { createTexture, presets as originalPresets } from './skin-textures.js?v=studio';

// Use the pieces shipped in the Minecraft catalog, on the home's original bases.
const outfits = {
  orbita: ['fa-jacket-denim', 'fa-jeans', 'fa-sneakers'],
  aurora: ['fa-hair-curls', 'fa-sweater-plum', 'fa-shorts-coast', 'fa-sneakers'],
  trilha: ['fa-shirt-flannel', 'fa-cargo', 'fa-boots'],
};

export const presets = {
  ...originalPresets,
  gabalarca: {name: 'Gabalarca', coat: '#ffe600'},
};
export { drawSkinFront, pixelCanvas };

function recolorFabric(pixels, original, color, allowedPixels) {
  const rgb = hex => hex.slice(1).match(/../g).map(value => parseInt(value, 16));
  const from = rgb(original);
  const to = rgb(color);
  const result = new Uint8ClampedArray(pixels);
  for (let i = 0; i < result.length; i += 4) {
    if (!result[i + 3] || (allowedPixels && !allowedPixels.has(i / 4))) continue;
    const distance = Math.max(...from.map((value, channel) => Math.abs(value - result[i + channel])));
    if (distance > 55) continue;
    for (let channel = 0; channel < 3; channel++) {
      result[i + channel] += to[channel] - from[channel];
    }
  }
  return result;
}

let catalogTexture;
export function loadCatalogLook() {
  catalogTexture ||= imagePixels(new URL('media/skin-gabalarca.png', import.meta.url))
    .catch(error => {
      catalogTexture = undefined;
      throw error;
    });
  return catalogTexture;
}

// The catalog skin has its own UV texture. Recolor the yellow fabric on its
// body and arms, leaving the face, legs and emblems intact.
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

export const recolorCatalogLook = (pixels, color) =>
  recolorFabric(pixels, presets.gabalarca.coat, color, shirtPixels);

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
