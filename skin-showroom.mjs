import { loadSkinViewer, imagePixels, pixelCanvas } from "./skin-viewer.mjs";
import { SAMPLE_PARTS } from "./skin-parts.mjs";
import { overlay } from "./skin-pixels.mjs";

export const LOOKS = [
  {
    name: "Explorador",
    base: "steve",
    color: "#38654b",
    pieces: ["top-explorer", "pants-sand", "shoes-hike"],
  },
  {
    name: "Oceano",
    base: "alex",
    color: "#305e9c",
    pieces: ["hair-rose", "top-ocean", "pants-ink", "shoes-white"],
  },
  {
    name: "Ametista",
    base: "steve",
    color: "#744c88",
    pieces: ["top-plum", "pants-ink", "shoes-white"],
  },
];

// A self-contained try-on. It never reads or writes the user's editor draft.
export function showroomMarkup(icon) {
  return `<div class="skin-showroom" data-showroom>
    <div class="showroom-stage"><canvas id="showroom-viewer" role="img" aria-label="Personagem de exemplo em 3D. Arraste para girar ou use os botões abaixo."></canvas><img class="showroom-fallback" src="./assets/skins/showcase-explorer.png" alt="Exemplo de skin com jaqueta verde" width="144" height="192"><div class="showroom-shadow" aria-hidden="true"></div><span class="showroom-status" role="status">Preparando o personagem…</span></div>
    <div class="showroom-look"><span data-look-name>Explorador</span><span>Peças gratuitas</span></div>
    <div class="showroom-controls"><div class="showroom-swatches" role="group" aria-label="Experimente um visual">${LOOKS.map((look, i) => `<button data-showroom-action="look" data-look="${i}" style="--look:${look.color}" aria-label="Experimentar visual ${look.name}" aria-pressed="${i === 0}">${icon("check")}</button>`).join("")}</div><div class="showroom-camera"><button class="icon-button" data-showroom-action="left" aria-label="Girar exemplo para a esquerda">${icon("arrow-left")}</button><button class="icon-button" data-showroom-action="right" aria-label="Girar exemplo para a direita">${icon("arrow-right")}</button><button class="icon-button" data-showroom-action="motion" aria-label="Pausar movimento do exemplo" aria-pressed="true">${icon("player-pause")}</button></div></div>
  </div>`;
}

export function createShowroom(root, { dialog, edit, icon, paintIcons }) {
  let viewer,
    resize,
    observer,
    api,
    texture,
    selected = 0,
    requestedIndex = 0,
    disposed = false,
    inView = true,
    request = 0;
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  let moving = !media.matches;
  const stage = root.querySelector(".showroom-stage");
  const canvas = root.querySelector("#showroom-viewer");
  const status = root.querySelector(".showroom-status");
  function sync() {
    if (!viewer) return;
    viewer.renderPaused = document.hidden || !inView || dialog.open;
    viewer.animation =
      moving && !media.matches ? new api.IdleAnimation() : null;
    const button = root.querySelector('[data-showroom-action="motion"]');
    button.setAttribute("aria-pressed", String(moving && !media.matches));
    button.setAttribute(
      "aria-label",
      moving && !media.matches
        ? "Pausar movimento do exemplo"
        : "Animar exemplo",
    );
    button.innerHTML = icon(
      moving && !media.matches ? "player-pause" : "player-play",
    );
    paintIcons(button);
  }
  async function select(index) {
    const ticket = ++request,
      look = LOOKS[index];
    const model = look.base === "alex" ? "slim" : "classic";
    let pixels = await imagePixels(`./assets/skins/${look.base}.png`);
    for (const id of look.pieces)
      pixels = overlay(
        pixels,
        SAMPLE_PARTS.find((p) => p.id === id).pixelsFor(model),
      );
    if (disposed || ticket !== request) return;
    texture = pixelCanvas(pixels);
    selected = index;
    if (viewer)
      await viewer.loadSkin(texture, {
        model: model === "slim" ? "slim" : "default",
      });
    if (disposed || ticket !== request) return;
    root.querySelector("[data-look-name]").textContent = look.name;
    root
      .querySelectorAll("[data-look]")
      .forEach((n) =>
        n.setAttribute(
          "aria-pressed",
          String(Number(n.dataset.look) === selected),
        ),
      );
    root.querySelector(".showroom-fallback").src =
      `./assets/skins/showcase-${["explorer", "ocean", "plum"][index]}.png`;
    canvas.setAttribute(
      "aria-label",
      `Visual ${look.name} em 3D. Arraste para girar ou use os botões abaixo.`,
    );
  }
  async function init() {
    try {
      api = await loadSkinViewer();
      if (disposed) return;
      viewer = new api.SkinViewer({
        canvas,
        width: stage.clientWidth,
        height: stage.clientHeight,
        zoom: 0.82,
        pixelRatio: Math.min(devicePixelRatio || 1, 2),
      });
      viewer.controls.enableZoom = false;
      viewer.controls.enablePan = false;
      viewer.playerObject.rotation.y = -0.35;
      viewer.controls.saveState();
      await select(requestedIndex);
      if (disposed) return;
      root.classList.add("showroom-ready");
      status.hidden = true;
      resize = new ResizeObserver(() => {
        if (viewer) {
          viewer.width = stage.clientWidth;
          viewer.height = stage.clientHeight;
        }
      });
      resize.observe(stage);
      observer = new IntersectionObserver(
        ([entry]) => {
          inView = entry.isIntersecting;
          sync();
        },
        { threshold: 0.1 },
      );
      observer.observe(root);
      sync();
    } catch {
      if (!disposed) {
        status.textContent = "Prévia 2D · o editor continua disponível";
        root
          .querySelectorAll(".showroom-camera button")
          .forEach((b) => (b.disabled = true));
      }
    }
  }
  function click(e) {
    const button = e.target.closest("[data-showroom-action]");
    if (!button || !root.contains(button)) return;
    const action = button.dataset.showroomAction;
    if (action === "look") {
      requestedIndex = Number(button.dataset.look);
      select(requestedIndex).catch(() => {
        status.hidden = false;
        status.textContent = "Este visual não carregou. Tente novamente.";
      });
    } else if (action === "left" && viewer)
      viewer.playerObject.rotation.y -= Math.PI / 4;
    else if (action === "right" && viewer)
      viewer.playerObject.rotation.y += Math.PI / 4;
    else if (action === "motion") {
      moving = !moving;
      sync();
    } else if (action === "edit" && texture) {
      e.preventDefault();
      const look = LOOKS[selected];
      edit({
        name: `Visual ${look.name}`,
        image: `./assets/skins/${look.base}.png`,
        model: look.base === "alex" ? "slim" : "classic",
        base: true,
        showroom: true,
        equipped: Object.fromEntries(
          look.pieces.map((id) => [
            SAMPLE_PARTS.find((p) => p.id === id).category,
            id,
          ]),
        ),
      });
    }
  }
  root.addEventListener("click", click);
  document.addEventListener("visibilitychange", sync);
  dialog.addEventListener("toggle", sync);
  media.addEventListener("change", sync);
  init();
  return {
    dispose() {
      disposed = true;
      request++;
      resize?.disconnect();
      observer?.disconnect();
      viewer?.dispose();
      viewer = null;
      root.removeEventListener("click", click);
      document.removeEventListener("visibilitychange", sync);
      dialog.removeEventListener("toggle", sync);
      media.removeEventListener("change", sync);
    },
  };
}
