import { drawSkinFront, loadCatalogLook, pixelCanvas, presets, recolorCatalogLook } from './studio-looks.js?v=catalog-picks';

export function setupSkinDemo({ toast, motion }) {
  const byId = id => document.getElementById(id);
  const editor = document.querySelector('.real-skin-editor');
  const host = byId('skin-canvas-wrap');
  const canvas = byId('skin-canvas');
  const poster = byId('skin-poster');
  const looks = [...editor.closest('#skins').querySelectorAll('[data-skin-preset]')];
  const catalogCredit = byId('skin-catalog-credit');
  const swatches = [...editor.querySelectorAll('[data-color]')];
  const originalSwatch = editor.querySelector('[data-original-swatch]');
  const front = document.createElement('canvas');
  front.width = 96;
  front.height = 128;

  const history = [];
  const firstLook = 'gabalarca';
  let preset = firstLook;
  let garment = presets[firstLook].coat;
  let brush = '#b86738';
  let original, base, pixels;
  const texture = pixelCanvas(new Uint8ClampedArray(64 * 64 * 4));
  let paint = false;
  let stroke;
  let visible = false;
  let loading = false;
  let lookRequest = 0;
  let viewer, api, turnFrame;

  function remember() {
    history.push({ preset, garment, brush, original, base, pixels: new Uint8ClampedArray(pixels) });
    if (history.length > 20) history.shift();
    byId('skin-undo').disabled = false;
  }

  function syncChoices() {
    const activeColor = paint ? brush : garment;
    const current = looks.find(button => button.dataset.skinPreset === preset);
    for (const button of looks) {
      button.setAttribute('aria-pressed', String(button === current));
    }
    originalSwatch.dataset.color = presets[preset].coat;
    originalSwatch.style.setProperty('--swatch', presets[preset].coat);
    for (const button of swatches) {
      button.setAttribute('aria-pressed', String(button.dataset.color === activeColor));
    }
    catalogCredit.href = current.dataset.catalogUrl;
    catalogCredit.setAttribute('aria-label', `Original no catálogo, publicado por ${current.dataset.author}`);
    poster.alt = `Skin ${presets[preset].name} vista de frente`;
  }

  function refresh() {
    texture.getContext('2d').putImageData(new ImageData(pixels, 64, 64), 0, 0);
    const map = viewer?.playerObject.skin.map;
    if (map?.image) {
      const context = map.image.getContext('2d');
      context.clearRect(0, 0, 64, 64);
      context.drawImage(texture, 0, 0);
      map.needsUpdate = true;
    }
    drawSkinFront(front, pixels, 'classic');
    poster.src = front.toDataURL();
  }

  function useLook(name, source) {
    preset = name;
    garment = presets[name].coat;
    original = base = source;
    pixels = new Uint8ClampedArray(source);
    byId('skin-download').disabled = false;
    for (const swatch of swatches) swatch.disabled = false;
    refresh();
    syncChoices();
  }

  for (const swatch of swatches) swatch.disabled = true;
  byId('skin-download').disabled = true;
  const initial = loadCatalogLook(firstLook).then(source => {
    if (!pixels) useLook(firstLook, source);
  }).catch(() => {
    if (!pixels) byId('skin-hint').textContent = 'Escolha outro visual para testar';
  });

  function syncMode() {
    const ready = host.dataset.ready;
    editor.dataset.mode = paint ? 'paint' : 'dress';
    byId('skin-orbit').setAttribute('aria-pressed', String(!paint));
    byId('skin-paint').setAttribute('aria-pressed', String(paint));
    byId('skin-color-label').textContent = paint ? 'Cor do pincel' : 'Cor da roupa';
    byId('skin-hint').textContent = paint
      ? 'Toque ou clique na skin para pintar'
      : ready === 'false' ? 'Prévia em 2D' : ready === 'true' ? 'Arraste para girar' : 'Preparando o 3D…';
    if (viewer) viewer.controls.enabled = !paint;
    canvas.style.cursor = paint ? 'crosshair' : 'grab';
    canvas.style.touchAction = paint ? 'none' : 'pan-y';
    syncChoices();
  }

  function set3dState(ready) {
    host.dataset.ready = editor.dataset.ready = String(ready);
    for (const id of ['skin-paint', 'skin-left', 'skin-right']) byId(id).disabled = !ready;
    canvas.tabIndex = ready ? 0 : -1;
    if (!ready) paint = false;
    syncMode();
  }

  async function load() {
    if (loading) return;
    loading = true;
    try {
      await initial;
      if (!pixels) {
        loading = false;
        return;
      }
      api = await new Promise((resolve, reject) => {
        if (window.faSkin3d) return resolve(window.faSkin3d);
        const script = document.createElement('script');
        script.src = new URL('vendor/studio.bundle.js', import.meta.url).href;
        script.onload = () => resolve(window.faSkin3d);
        script.onerror = reject;
        document.head.append(script);
      });
      viewer = new api.SkinViewer({
        canvas,
        width: host.clientWidth,
        height: host.clientHeight,
        zoom: .96,
        pixelRatio: Math.min(devicePixelRatio, 2),
      });
      viewer.controls.enableZoom = false;
      viewer.controls.enablePan = false;
      viewer.playerObject.rotation.y = -.32;
      await viewer.loadSkin(texture, { model: 'default' });
      refresh();
      set3dState(true);
      viewer.renderPaused = !visible || document.hidden;
      new ResizeObserver(() => {
        if (!viewer) return;
        viewer.width = host.clientWidth;
        viewer.height = host.clientHeight;
      }).observe(host);
      if (motion.allowed() && visible && !editor.contains(document.activeElement)) {
        const start = performance.now();
        const turn = time => {
          if (!viewer || !motion.allowed() || !visible || paint) return;
          const progress = Math.min(1, (time - start) / 2200);
          viewer.playerObject.rotation.y = -.32 - Math.sin(Math.PI * progress) * .28;
          if (progress < 1) turnFrame = requestAnimationFrame(turn);
        };
        turnFrame = requestAnimationFrame(turn);
      }
    } catch {
      set3dState(false);
    }
  }

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) load();
    if (viewer) viewer.renderPaused = !visible || document.hidden;
  }, { rootMargin: '120px 0px' }).observe(host);
  document.addEventListener('visibilitychange', () => {
    if (viewer) viewer.renderPaused = !visible || document.hidden;
  });

  function selectMode(value) {
    paint = value;
    cancelAnimationFrame(turnFrame);
    syncMode();
  }
  byId('skin-paint').addEventListener('click', () => selectMode(true));
  byId('skin-orbit').addEventListener('click', () => selectMode(false));
  function rotate(amount) {
    cancelAnimationFrame(turnFrame);
    if (viewer) viewer.playerObject.rotation.y += amount;
  }
  byId('skin-left').addEventListener('click', () => rotate(-Math.PI / 4));
  byId('skin-right').addEventListener('click', () => rotate(Math.PI / 4));
  canvas.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    rotate(event.key === 'ArrowLeft' ? -.25 : .25);
  });

  for (const button of looks) button.addEventListener('click', async () => {
    const request = ++lookRequest;
    const selected = button.dataset.skinPreset;
    if (selected === preset && pixels) return;
    let next;
    try {
      next = await loadCatalogLook(selected);
    } catch {
      if (request === lookRequest) toast('Não foi possível abrir esta skin. Tente de novo.');
      return;
    }
    if (request !== lookRequest) return;
    if (pixels) remember();
    useLook(selected, next);
    if (visible) load();
  });

  for (const button of swatches) button.addEventListener('click', () => {
    const color = button.dataset.color;
    if (paint) {
      brush = color;
    } else if (color !== garment) {
      remember();
      garment = color;
      const next = recolorCatalogLook(preset, original, garment);
      for (let i = 0; i < pixels.length; i += 4) {
        // Keep brush marks when changing clothes color.
        if ([0, 1, 2, 3].every(channel => pixels[i + channel] === base[i + channel])) {
          pixels.set(next.subarray(i, i + 4), i);
        }
      }
      base = next;
      refresh();
    }
    syncChoices();
  });

  const parts = ['head', 'body', 'rightArm', 'leftArm', 'rightLeg', 'leftLeg'];
  function paintPixel(event) {
    if (!viewer || !stroke) return;
    const rect = canvas.getBoundingClientRect();
    const ray = new api.Raycaster();
    ray.setFromCamera(new api.Vector2(
      (event.clientX - rect.left) / rect.width * 2 - 1,
      1 - (event.clientY - rect.top) / rect.height * 2,
    ), viewer.camera);
    const layers = parts.flatMap(name => {
      const part = viewer.playerObject.skin[name];
      return [part.outerLayer, part.innerLayer];
    });
    for (const { uv } of ray.intersectObjects(layers, true)) {
      if (!uv) continue;
      const x = Math.min(63, Math.max(0, Math.floor(uv.x * 64)));
      const y = Math.min(63, Math.max(0, Math.floor((1 - uv.y) * 64)));
      const index = (y * 64 + x) * 4;
      if (!pixels[index + 3]) continue;
      if (!stroke.changed) {
        remember();
        stroke.changed = true;
      }
      pixels.set(brush.slice(1).match(/../g).map(hex => parseInt(hex, 16)), index);
      refresh();
      break;
    }
  }

  canvas.addEventListener('pointerdown', event => {
    cancelAnimationFrame(turnFrame);
    if (!paint || event.button !== 0 || stroke) return;
    stroke = { id: event.pointerId, changed: false };
    canvas.setPointerCapture(event.pointerId);
    paintPixel(event);
  });
  canvas.addEventListener('pointermove', event => {
    if (stroke?.id === event.pointerId) paintPixel(event);
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    canvas.addEventListener(type, event => {
      if (stroke?.id === event.pointerId) stroke = null;
    });
  }

  byId('skin-undo').addEventListener('click', () => {
    ++lookRequest;
    const previous = history.pop();
    if (!previous) return;
    ({ preset, garment, brush, original, base, pixels } = previous);
    syncChoices();
    refresh();
    byId('skin-undo').disabled = history.length === 0;
  });
  byId('skin-download').addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = texture.toDataURL('image/png');
    link.download = `forca-aliada-${preset}.png`;
    link.click();
    toast('Skin exportada em PNG.');
  });
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    if (viewer) viewer.renderPaused = true;
    viewer = undefined;
    set3dState(false);
  });
  syncMode();
}
