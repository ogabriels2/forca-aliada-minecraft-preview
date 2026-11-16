import {SAMPLE_PARTS} from '../../skin-parts.mjs';
import {overlay,blankPixels} from '../../skin-pixels.mjs';
import {writeFileSync} from 'node:fs';
const looks={ocean:['fa-hoodie-ocean','fa-jeans','fa-sneakers'],plum:['fa-sweater-plum','fa-jeans','fa-sneakers'],explorer:['fa-vest-trail','fa-cargo','fa-boots']};
for(const [name,ids] of Object.entries(looks)){
  let pixels=blankPixels();
  for(const id of ids)pixels=overlay(pixels,SAMPLE_PARTS.find(p=>p.id===id).pixelsFor('classic'));
  writeFileSync(new URL(`../.impeccable/review/skin-layer-${name}.rgba`,import.meta.url),pixels);
}
