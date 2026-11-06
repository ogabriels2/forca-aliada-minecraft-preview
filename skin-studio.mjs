import {
  faces,
  PART_NAMES,
  FACE_NAMES,
  rgba,
  hexColor,
  paintPixel,
  floodFace,
  locateFace,
  composeSkin,
  EditHistory,
  extractPiece,
  overlay,
} from "./skin-pixels.mjs";
import { SAMPLE_PARTS, CATEGORIES, safePart } from "./skin-parts.mjs";
import { loadSkinViewer, pixelCanvas, imagePixels } from "./skin-viewer.mjs";

// Isolated local application. No account, marketplace or Minecraft API is called.
export function createSkinStudio({
  main,
  dialog,
  esc,
  icon,
  paintIcons,
  toast,
  openDialog,
  closeDialog,
  publishSkin,
  account,
}) {
  const KEY = "fa-skin-studio-v1",
    PART_KEY = "fa-skin-parts-v1";
  let live = false,
    epoch = 0,
    viewer = null,
    api = null,
    resize = null,
    raf = 0,
    saveTimer = 0,
    stroke = null,
    dirty = false,
    storedAtLoad = null,
    pendingSeed = null,
    sourceCredits = [],
    loaded = false;
  let state = {
      pixels: new Uint8ClampedArray(16384),
      model: "classic",
      equipped: {},
    },
    history = new EditHistory();
  let mode = "dress",
    category = "tops",
    tool = "brush",
    color = "#38654b",
    size = 1,
    mirror = false,
    part = "head",
    face = "front",
    layer = "outer",
    walking = false,
    query = "",
    ownOnly = false,
    showGrid = true;
  let ownParts = [],
    allParts = [...SAMPLE_PARTS],
    selection = { x: 0, y: 0 };
  const snapshot = () => history.clone(state);
  const rendered = () =>
    composeSkin(state.pixels, state.equipped, allParts, state.model);
  const rectangle = () => faces(state.model, layer)[part][face];
  const active = () => live && Boolean(main.querySelector(".skin-studio"));
  const action = (name, label, ico, extra = "") =>
    `<button type="button" class="studio-icon" data-studio-action="${name}" aria-label="${label}" title="${label}" ${extra}>${icon(ico)}</button>`;
  function setStatus(text) {
    const n = main.querySelector("[data-studio-status]");
    if (n) n.textContent = text;
  }
  function saveNow() {
    if (!loaded || !dirty) return;
    try {
      if (localStorage.getItem(KEY) !== storedAtLoad) {
        setStatus("Alterado em outra aba. Baixe este PNG e reabra o editor.");
        return;
      }
      const nextDraft = JSON.stringify({
        image: pixelCanvas(state.pixels).toDataURL("image/png"),
        model: state.model,
        equipped: state.equipped,
        sourceCredits,
      });
      localStorage.setItem(KEY, nextDraft);
      storedAtLoad = nextDraft;
      dirty = false;
      updateDownload();
      setStatus("Rascunho salvo neste navegador");
    } catch {
      dirty = true;
      setStatus("Não foi possível salvar o rascunho");
      toast("Sem espaço para guardar o rascunho. Baixe o PNG antes de sair.");
    }
  }
  function changed(before) {
    if (!history.commit(before, state)) return;
    dirty = true;
    updateDownload();
    clearTimeout(saveTimer);
    setStatus("Salvando rascunho…");
    saveTimer = setTimeout(saveNow, 450);
    refresh();
  }
  async function hydrateParts() {
    let rows = [];
    try {
      rows = JSON.parse(localStorage.getItem(PART_KEY) || "[]");
    } catch {}
    ownParts = [];
    for (const row of (Array.isArray(rows) ? rows : []).slice(0, 30)) {
      const p = safePart(row);
      if (!p) continue;
      try {
        p.pixels = new Uint8ClampedArray(await imagePixels(p.image));
        p.pixels = extractPiece(p.pixels, p.category, p.model);
        ownParts.push(p);
      } catch {}
    }
    allParts = [...SAMPLE_PARTS, ...ownParts];
  }
  async function render(seed = null, partId = null) {
    dispose();
    live = true;
    const version = epoch;
    loaded = false;
    history = new EditHistory();
    walking = false;
    main.innerHTML = `<section class="skin-studio" aria-label="Editor de skins"><header class="studio-heading"><div><a href="#/skins" class="studio-back" aria-label="Voltar ao catálogo de skins">${icon("arrow-left")}</a><h1>Editor de skins</h1></div><div class="studio-output"><a class="button secondary" data-studio-action="download" aria-label="Baixar PNG" download="minha-skin-classic.png" aria-disabled="true">${icon("download")}<span>Baixar PNG</span></a><button class="button" data-studio-action="publish" disabled>Publicar skin ${icon("arrow-right")}</button></div></header><div class="studio-bar"><div class="studio-modes" role="group" aria-label="Modo do editor"><button data-studio-action="mode" data-mode="dress" aria-pressed="${mode === "dress"}">${icon("shirt")} Vestir</button><button data-studio-action="mode" data-mode="paint" aria-pressed="${mode === "paint"}">${icon("brush")} Pintar</button></div><span data-studio-status role="status">Carregando seu personagem…</span><div class="studio-history">${action("undo", "Desfazer (Ctrl Z)", "arrow-back-up", "disabled")}${action("redo", "Refazer (Ctrl Shift Z)", "arrow-forward-up", "disabled")}</div></div><div class="studio-workspace"><section class="studio-preview" aria-label="Personagem em 3D"><div class="studio-preview-top"><label>Modelo <select id="studio-model" aria-label="Modelo do personagem"><option value="classic">Clássico</option><option value="slim">Slim</option></select></label><button class="studio-text" data-studio-action="base">Trocar base</button></div><div class="studio-canvas-wrap"><canvas id="studio-viewer" aria-label="Personagem 3D. No modo Vestir, arraste para girar. No modo Pintar, clique no personagem para pintar." role="img"></canvas><div class="studio-loading" role="status">Preparando a prévia 3D…</div><div class="studio-floor" aria-hidden="true"></div></div><div class="studio-camera"><div>${action("rotate-left", "Girar para a esquerda", "arrow-left")}${action("front", "Ver de frente", "eye")}${action("rotate-right", "Girar para a direita", "arrow-right")}</div><span data-stage-help>Arraste para girar</span><div>${action("zoom-out", "Diminuir zoom", "zoom-out")}${action("zoom-in", "Aumentar zoom", "zoom-in")}${action("walk", "Animar personagem", "player-play", 'aria-pressed="false"')}</div></div></section><aside class="studio-panel" id="studio-panel"></aside></div><footer class="studio-footer"><span>${icon("lock")} Arquivos e rascunhos ficam só neste navegador.</span><span>Peças de textura gratuitas · PNG 64 × 64</span></footer></section>`;
    paintIcons(main);
    try {
      await hydrateParts();
      if (version !== epoch) return;
      let saved = null;
      try {
        storedAtLoad = localStorage.getItem(KEY);
        saved = JSON.parse(storedAtLoad || "null");
      } catch {}
      const requestedPart = allParts.find((p) => p.id === partId);
      pendingSeed = seed && saved ? seed : null;
      let source = (pendingSeed ? saved : seed) ||
        saved || {
          image: "./assets/skins/steve.png",
          model: "classic",
          base: true,
        };
      let pixels;
      try {
        pixels = await imagePixels(source.image);
      } catch {
        source = {
          image: "./assets/skins/steve.png",
          model: "classic",
          base: true,
        };
        pixels = await imagePixels(source.image);
        toast(
          "O rascunho não abriu. Uma base limpa foi carregada para continuar.",
        );
      }
      if (version !== epoch) return;
      state = {
        pixels: new Uint8ClampedArray(pixels),
        model: source.model === "slim" ? "slim" : "classic",
        equipped:
          seed && !pendingSeed && !source.showroom
            ? {}
            : Object.fromEntries(
                Object.entries(source.equipped || {}).filter(
                  ([k, id]) =>
                    CATEGORIES[k] &&
                    allParts.some(
                      (p) =>
                        p.id === id &&
                        p.category === k &&
                        (p.model === "both" || p.model === source.model),
                    ),
                ),
              ),
      };
      if (requestedPart) {
        const before = snapshot();
        if (requestedPart.model !== "both") state.model = requestedPart.model;
        state.equipped[requestedPart.category] = requestedPart.id;
        state.equipped = Object.fromEntries(
          Object.entries(state.equipped).filter(([, id]) =>
            allParts.some(
              (p) =>
                p.id === id && (p.model === "both" || p.model === state.model),
            ),
          ),
        );
        history.commit(before, state);
        category = requestedPart.category;
        mode = "dress";
      }
      sourceCredits =
        source === seed
          ? source.base
            ? ["Modelo base: Mojang Studios"]
            : [
                source.creatorMode === "credited"
                  ? `Skin base: ${source.creatorName}`
                  : "Skin base enviada pelo usuário",
                ...(source.componentCredits || []),
              ]
          : Array.isArray(source.sourceCredits)
            ? source.sourceCredits
                .map((c) => String(c).slice(0, 120))
                .slice(0, 30)
            : ["Modelo base: Mojang Studios"];
      loaded = true;
      renderPanel();
      refresh();
      dirty = Boolean((seed && !pendingSeed) || requestedPart || !saved);
      updateDownload();
      setStatus("Rascunho salvo neste navegador");
      if (dirty) saveNow();
      if (pendingSeed) {
        openDialog(
          `<h2 id="dialog-title">Continuar seu rascunho ou abrir ${esc(pendingSeed.name || "outra skin")}?</h2><p>Seu rascunho está guardado neste navegador. Abrir esta skin substitui o personagem atual; você poderá desfazer enquanto estiver no editor.</p><p class="field-help">Para guardar as duas versões, baixe o PNG do rascunho antes de trocar.</p><div class="dialog-actions"><button class="button secondary" data-studio-action="confirm-seed">Abrir ${esc(pendingSeed.name || "nova skin")}</button><button class="button" data-studio-action="keep-draft">Continuar rascunho</button></div>`,
        );
      }
      api = await loadSkinViewer();
      if (version !== epoch) return;
      const canvas = main.querySelector("#studio-viewer"),
        wrap = canvas.parentElement;
      viewer = new api.SkinViewer({
        canvas,
        width: wrap.clientWidth,
        height: wrap.clientHeight,
        zoom: 0.85,
        pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      });
      viewer.playerObject.rotation.y = 0.3;
      viewer.controls.enableZoom = false;
      viewer.controls.enablePan = false;
      viewer.controls.enabled = mode === "dress";
      viewer.controls.saveState();
      viewer.loadSkin(pixelCanvas(rendered()), {
        model: state.model === "slim" ? "slim" : "default",
      });
      main.querySelector(".studio-loading").hidden = true;
      resize = new ResizeObserver(() => {
        if (!viewer) return;
        viewer.width = wrap.clientWidth;
        viewer.height = wrap.clientHeight;
      });
      resize.observe(wrap);
      bindPaint(canvas, "3d");
      refreshControls();
    } catch (e) {
      if (version !== epoch) return;
      const n = main.querySelector(".studio-loading");
      if (n)
        n.textContent =
          e.message ||
          "Não foi possível carregar a skin. Tente abrir o editor novamente.";
      setStatus(
        loaded
          ? "Use a face 2D para continuar"
          : "Não foi possível carregar o rascunho",
      );
    }
  }
  function compatibleParts() {
    const q = query
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    return allParts.filter(
      (p) =>
        p.category === category &&
        (p.model === "both" || p.model === state.model) &&
        (!ownOnly || p.own) &&
        (!q ||
          `${p.name} ${p.creator}`
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .includes(q)),
    );
  }
  function renderPanel() {
    if (!active() || !loaded) return;
    const root = main.querySelector("#studio-panel");
    if (mode === "dress") {
      root.innerHTML = `<div class="studio-panel-title"><h2>Guarda-roupa</h2><p>Clique em uma peça para vestir ou remover.</p></div><div class="part-categories" role="group" aria-label="Tipo de peça">${Object.entries(
        CATEGORIES,
      )
        .map(
          ([id, name]) =>
            `<button data-studio-action="category" data-category="${id}" aria-pressed="${category === id}">${name}</button>`,
        )
        .join(
          "",
        )}</div><div class="part-search">${icon("search")}<label class="sr-only" for="part-search">Buscar peças</label><input type="search" id="part-search" placeholder="Buscar peças" value="${esc(query)}">${action("own-parts", "Mostrar só minhas peças", "users", `aria-pressed="${ownOnly}"`)}</div><div class="part-grid" id="part-grid"></div><div class="equipped-parts"><h3>No personagem</h3><div data-equipped></div></div><p class="part-note">Amostras originais da Força Aliada. São texturas de skin, sem acessórios 3D separados. Tudo gratuito.</p>`;
      renderParts();
    } else {
      root.innerHTML = `<div class="studio-panel-title"><h2>Pintar a skin</h2><p>Pinte no personagem ou nesta face ampliada.</p></div><div class="paint-tools" role="group" aria-label="Ferramenta">${[
        ["brush", "Pincel (B)", "brush"],
        ["eraser", "Borracha (E)", "eraser"],
        ["fill", "Preencher face (F)", "bucket"],
        ["picker", "Capturar cor (I)", "color-picker"],
        ["rotate", "Girar sem pintar (R)", "hand-stop"],
      ]
        .map(([id, label, ico]) =>
          action(
            "tool",
            label,
            ico,
            `data-tool="${id}" aria-pressed="${tool === id}"`,
          ),
        )
        .join(
          "",
        )}</div><div class="paint-color-row"><label class="color-control"><span class="sr-only">Cor do pincel</span><input id="paint-color" type="color" value="${color}"></label><label class="hex-control"><span class="sr-only">Cor hexadecimal</span><input id="paint-hex" value="${color}" maxlength="7" spellcheck="false" aria-label="Cor hexadecimal"></label><label class="brush-size">Pincel <select id="paint-size" aria-label="Tamanho do pincel">${[1, 2, 3, 4].map((n) => `<option ${size === n ? "selected" : ""}>${n}</option>`).join("")}</select>px</label></div><div class="paint-palette" role="group" aria-label="Paleta de cores">${["#252d31", "#f1e8d1", "#38654b", "#719d57", "#305e9c", "#d66b9b", "#aa4b3f", "#cfa05b"].map((c) => `<button style="--color:${c}" data-studio-action="color" data-color="${c}" aria-label="Usar cor ${c}" aria-pressed="${color === c}"></button>`).join("")}</div><div class="paint-selects"><label>Parte<select id="paint-part">${Object.entries(
        PART_NAMES,
      )
        .map(
          ([id, n]) =>
            `<option value="${id}" ${part === id ? "selected" : ""}>${n}</option>`,
        )
        .join(
          "",
        )}</select></label><label>Camada<select id="paint-layer"><option value="outer" ${layer === "outer" ? "selected" : ""}>Sobreposição</option><option value="base" ${layer === "base" ? "selected" : ""}>Base</option></select></label></div><div class="paint-faces" role="group" aria-label="Face do personagem">${Object.entries(
        FACE_NAMES,
      )
        .map(
          ([id, n]) =>
            `<button data-studio-action="face" data-face="${id}" aria-pressed="${face === id}">${n}</button>`,
        )
        .join(
          "",
        )}</div><div class="paint-face-wrap"><canvas id="paint-face" width="256" height="256" tabindex="0" role="application" aria-label="Pintura: ${PART_NAMES[part]}, face ${FACE_NAMES[face]}. Setas movem o cursor; espaço pinta; B pincel, E borracha, F preencher e I capturar cor."></canvas></div><div class="paint-options"><label><input id="paint-mirror" type="checkbox" ${mirror ? "checked" : ""}>Espelhar nesta face</label><button class="studio-text" data-studio-action="grid" aria-pressed="${showGrid}">Grade</button></div><p class="paint-help">${layer === "outer" ? "A sobreposição fica por cima da base. A borracha revela a camada de baixo." : "Você está alterando a textura base do personagem."} Setas e espaço também pintam a face.</p><button class="studio-text publish-piece" data-studio-action="publish-piece">${icon("plus")} Publicar uma peça desta criação</button>`;
      const canvas = root.querySelector("#paint-face");
      bindPaint(canvas, "face");
      canvas.addEventListener("keydown", paintKeys);
      drawFace();
    }
    paintIcons(root);
    refreshControls();
  }
  function renderParts() {
    const grid = main.querySelector("#part-grid");
    if (!grid) return;
    const list = compatibleParts();
    grid.innerHTML = list.length
      ? list
          .map(
            (p) =>
              `<button class="part-card" data-studio-action="equip" data-id="${p.id}" aria-label="${state.equipped[category] === p.id ? "Remover" : "Experimentar"} ${esc(p.name)}" aria-pressed="${state.equipped[category] === p.id}"><span class="part-art"><canvas data-part-thumb="${p.id}" width="96" height="128" role="img" aria-label="Prévia de ${esc(p.name)}"></canvas><span class="part-check">${icon("check")}</span></span><strong>${esc(p.name)}</strong><small>${p.own ? "Sua criação" : "Grátis"}</small></button>`,
          )
          .join("")
      : `<div class="parts-empty"><p>${ownOnly ? "Suas peças aparecerão aqui." : "Nenhuma peça com esse nome."}</p><button class="studio-text" data-studio-action="${ownOnly ? "paint-mode" : "clear-search"}">${ownOnly ? "Criar minha primeira peça" : "Limpar busca"}</button></div>`;
    grid.querySelectorAll("[data-part-thumb]").forEach((canvas) => {
      const p = allParts.find((p) => p.id === canvas.dataset.partThumb);
      if (p)
        drawFront(
          canvas,
          composeSkin(
            state.pixels,
            { [p.category]: p.id },
            allParts,
            state.model,
          ),
          state.model,
        );
    });
    const equipped = main.querySelector("[data-equipped]");
    if (equipped) {
      equipped.innerHTML = Object.entries(state.equipped).length
        ? Object.entries(state.equipped)
            .map(([cat, id]) => {
              const p = allParts.find((p) => p.id === id);
              return p
                ? `<button data-studio-action="unequip" data-category="${cat}" title="Remover ${esc(p.name)}">${esc(p.name)} ${icon("x")}</button>`
                : "";
            })
            .join("")
        : "<span>Nenhuma peça adicionada</span>";
    }
    paintIcons(grid);
    paintIcons(equipped || grid);
  }
  function drawFront(canvas, pixels, model) {
    const c = canvas.getContext("2d"),
      tex = pixelCanvas(pixels),
      a = model === "slim" ? 3 : 4;
    c.clearRect(0, 0, 96, 128);
    c.imageSmoothingEnabled = false;
    const rows = [
      [8, 8, 8, 8, 32, 0, 32, 32],
      [20, 20, 8, 12, 32, 32, 32, 48],
      [44, 20, a, 12, 32 - a * 4, 32, a * 4, 48],
      [36, 52, a, 12, 64, 32, a * 4, 48],
      [4, 20, 4, 12, 32, 80, 16, 48],
      [20, 52, 4, 12, 48, 80, 16, 48],
      [40, 8, 8, 8, 32, 0, 32, 32],
      [20, 36, 8, 12, 32, 32, 32, 48],
      [44, 36, a, 12, 32 - a * 4, 32, a * 4, 48],
      [52, 52, a, 12, 64, 32, a * 4, 48],
      [4, 36, 4, 12, 32, 80, 16, 48],
      [4, 52, 4, 12, 48, 80, 16, 48],
    ];
    for (const r of rows) c.drawImage(tex, ...r);
  }
  function refresh() {
    if (!active() || !loaded) return;
    if (!raf)
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (!active()) return;
        const pixels = rendered();
        if (viewer) {
          const map = viewer.playerObject.skin.map;
          if (map?.image) {
            const c = map.image,
              ctx = c.getContext("2d");
            ctx.clearRect(0, 0, 64, 64);
            ctx.putImageData(new ImageData(pixels, 64, 64), 0, 0);
            map.needsUpdate = true;
          }
          viewer.playerObject.skin.modelType =
            state.model === "slim" ? "slim" : "default";
        }
        drawFace();
      });
    renderParts();
    refreshControls();
  }
  function refreshControls() {
    if (!active()) return;
    main
      .querySelectorAll('[data-studio-action="undo"]')
      .forEach((n) => (n.disabled = !history.past.length));
    main
      .querySelectorAll('[data-studio-action="redo"]')
      .forEach((n) => (n.disabled = !history.future.length));
    main
      .querySelectorAll(
        '[data-studio-action="download"],[data-studio-action="publish"]',
      )
      .forEach((n) => (n.disabled = !loaded));
    main
      .querySelectorAll("[data-mode]")
      .forEach((n) =>
        n.setAttribute("aria-pressed", String(n.dataset.mode === mode)),
      );
    const select = main.querySelector("#studio-model");
    if (select) select.value = state.model;
    const canRotate = mode === "dress" || tool === "rotate";
    if (viewer) {
      viewer.controls.enabled = canRotate;
      viewer.canvas.style.cursor = canRotate ? "grab" : "crosshair";
    }
    const h = main.querySelector("[data-stage-help]");
    if (h)
      h.textContent = canRotate
        ? "Arraste para girar"
        : "Clique no personagem para pintar";
    const walk = main.querySelector('[data-studio-action="walk"]');
    if (walk) {
      walk.disabled = mode === "paint";
      walk.setAttribute("aria-pressed", String(walking));
      walk.setAttribute(
        "aria-label",
        walking ? "Pausar personagem" : "Animar personagem",
      );
      walk.innerHTML = icon(walking ? "player-pause" : "player-play");
      paintIcons(walk);
    }
    main.querySelector(".skin-studio")?.setAttribute("data-mode", mode);
  }
  function drawFace() {
    const canvas = main.querySelector("#paint-face");
    if (!canvas || !loaded) return;
    const rect = rectangle(),
      [x, y, w, h] = rect,
      c = canvas.getContext("2d"),
      scale = Math.floor(240 / Math.max(w, h)),
      ox = Math.floor((256 - w * scale) / 2),
      oy = Math.floor((256 - h * scale) / 2);
    c.clearRect(0, 0, 256, 256);
    c.fillStyle = "#e5e8e6";
    c.fillRect(0, 0, 256, 256);
    for (let yy = 0; yy < h; yy++)
      for (let xx = 0; xx < w; xx++) {
        c.fillStyle = (xx + yy) % 2 ? "#d0d7d2" : "#eef1ee";
        c.fillRect(ox + xx * scale, oy + yy * scale, scale, scale);
      }
    c.imageSmoothingEnabled = false;
    const pixels = rendered(),
      texture = pixelCanvas(pixels);
    if (layer === "outer") {
      const r = faces(state.model, "base")[part][face];
      c.drawImage(texture, ...r, ox, oy, w * scale, h * scale);
    }
    c.drawImage(texture, x, y, w, h, ox, oy, w * scale, h * scale);
    if (showGrid) {
      c.strokeStyle = "#11111125";
      c.lineWidth = 1;
      for (let xx = 0; xx <= w; xx++) {
        c.beginPath();
        c.moveTo(ox + xx * scale + 0.5, oy);
        c.lineTo(ox + xx * scale + 0.5, oy + h * scale);
        c.stroke();
      }
      for (let yy = 0; yy <= h; yy++) {
        c.beginPath();
        c.moveTo(ox, oy + yy * scale + 0.5);
        c.lineTo(ox + w * scale, oy + yy * scale + 0.5);
        c.stroke();
      }
    }
    if (document.activeElement === canvas) {
      c.strokeStyle = "#193cdd";
      c.lineWidth = 2;
      c.strokeRect(
        ox + selection.x * scale + 1,
        oy + selection.y * scale + 1,
        scale - 2,
        scale - 2,
      );
    }
    canvas.dataset.mapping = JSON.stringify({ x, y, w, h, scale, ox, oy });
  }
  function hitAt(event, kind) {
    const canvas = event.currentTarget,
      r = canvas.getBoundingClientRect();
    if (kind === "face") {
      const m = JSON.parse(canvas.dataset.mapping || "null");
      if (!m) return null;
      const xx = Math.floor(
          (((event.clientX - r.left) * 256) / r.width - m.ox) / m.scale,
        ),
        yy = Math.floor(
          (((event.clientY - r.top) * 256) / r.height - m.oy) / m.scale,
        );
      return xx >= 0 && yy >= 0 && xx < m.w && yy < m.h
        ? { x: m.x + xx, y: m.y + yy, part, face, rect: rectangle() }
        : null;
    }
    if (!viewer || !api) return null;
    const ray = new api.Raycaster();
    ray.setFromCamera(
      new api.Vector2(
        ((event.clientX - r.left) / r.width) * 2 - 1,
        (-(event.clientY - r.top) / r.height) * 2 + 1,
      ),
      viewer.camera,
    );
    const objects = Object.values(PART_NAMES).length
      ? Object.keys(PART_NAMES).map(
          (k) =>
            viewer.playerObject.skin[k][
              layer === "outer" ? "outerLayer" : "innerLayer"
            ],
        )
      : [];
    const h = ray.intersectObjects(objects, true)[0];
    if (!h?.uv) return null;
    const x = Math.min(63, Math.max(0, Math.floor(h.uv.x * 64))),
      y = Math.min(63, Math.max(0, Math.floor((1 - h.uv.y) * 64)));
    const found = locateFace(x, y, state.model, layer);
    return found ? { ...found, x, y } : null;
  }
  function paintHit(hit) {
    if (!hit) return;
    if (tool === "picker") {
      const pixels = rendered();
      let x = hit.x,
        y = hit.y;
      if (layer === "outer" && !pixels[(y * 64 + x) * 4 + 3]) {
        const r = faces(state.model, "base")[hit.part][hit.face];
        x = r[0] + hit.x - hit.rect[0];
        y = r[1] + hit.y - hit.rect[1];
      }
      color = hexColor(pixels, x, y);
      syncColor();
      return;
    }
    const cat =
      hit.part === "head"
        ? "hair"
        : ["body", "leftArm", "rightArm"].includes(hit.part)
          ? "tops"
          : hit.face === "bottom" || hit.y - hit.rect[1] >= 9
            ? "shoes"
            : "bottoms";
    const equipped = allParts.find((p) => p.id === state.equipped[cat]);
    if (layer === "outer" && equipped) {
      state.pixels = overlay(
        state.pixels,
        equipped.pixelsFor ? equipped.pixelsFor(state.model) : equipped.pixels,
      );
      sourceCredits = [
        ...new Set([
          ...sourceCredits,
          `${equipped.name} — ${equipped.creator}`,
          ...(equipped.sourceCredits || []),
        ]),
      ];
      delete state.equipped[cat];
    }
    if (tool === "fill")
      floodFace(state.pixels, hit.x, hit.y, rgba(color), hit.rect);
    else
      paintPixel(
        state.pixels,
        hit.x,
        hit.y,
        tool === "eraser" ? [0, 0, 0, 0] : rgba(color),
        hit.rect,
        size,
        mirror,
      );
    if (part !== hit.part || face !== hit.face) {
      part = hit.part;
      face = hit.face;
      renderPanel();
    }
    refresh();
  }
  function bindPaint(canvas, kind) {
    const finish = () => {
      if (!stroke) return;
      const before = stroke;
      stroke = null;
      changed(before);
    };
    canvas.addEventListener("pointerdown", (e) => {
      if (mode !== "paint" || tool === "rotate" || e.button > 0 || !loaded)
        return;
      const hit = hitAt(e, kind);
      if (!hit) return;
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);
      stroke = snapshot();
      paintHit(hit);
    });
    canvas.addEventListener("pointermove", (e) => {
      if (stroke) paintHit(hitAt(e, kind));
    });
    canvas.addEventListener("pointerup", finish);
    canvas.addEventListener("pointercancel", finish);
    canvas.addEventListener("lostpointercapture", finish);
    canvas.addEventListener("focus", drawFace);
    canvas.addEventListener("blur", drawFace);
  }
  function paintKeys(e) {
    const r = rectangle();
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
      e.preventDefault();
      selection.x = Math.max(
        0,
        Math.min(
          r[2] - 1,
          selection.x +
            (e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : 0),
        ),
      );
      selection.y = Math.max(
        0,
        Math.min(
          r[3] - 1,
          selection.y +
            (e.key === "ArrowUp" ? -1 : e.key === "ArrowDown" ? 1 : 0),
        ),
      );
      drawFace();
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      const before = snapshot();
      paintHit({
        x: r[0] + selection.x,
        y: r[1] + selection.y,
        part,
        face,
        rect: r,
      });
      changed(before);
    }
  }
  function syncColor() {
    const picker = main.querySelector("#paint-color"),
      hex = main.querySelector("#paint-hex");
    if (picker) picker.value = color;
    if (hex) hex.value = color;
    main
      .querySelectorAll("[data-color]")
      .forEach((n) =>
        n.setAttribute("aria-pressed", String(n.dataset.color === color)),
      );
  }
  function changeMode(value) {
    mode = value;
    walking = false;
    if (viewer) viewer.animation = null;
    renderPanel();
    refreshControls();
  }
  function selectTool(next) {
    tool = next;
    main
      .querySelectorAll("[data-tool]")
      .forEach((n) =>
        n.setAttribute("aria-pressed", String(n.dataset.tool === tool)),
      );
    refreshControls();
  }
  function animateEquip() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    main
      .querySelector("#studio-viewer")
      ?.animate([{ transform: "scale(.98)" }, { transform: "scale(1)" }], {
        duration: 180,
        easing: "cubic-bezier(.16,1,.3,1)",
      });
  }
  function baseDialog() {
    openDialog(
      `<h2 id="dialog-title">Escolha uma base.</h2><p>Isso substitui o personagem atual e remove as peças. Você pode desfazer.</p><div class="studio-base-choices"><button class="button secondary" data-studio-action="choose-base" data-base="steve">Steve · Clássico</button><button class="button secondary" data-studio-action="choose-base" data-base="alex">Alex · Slim</button></div><label class="studio-import">${icon("upload")} Importar minha skin<input type="file" id="studio-import" accept="image/png"><small>PNG de skin · 64 × 64 ou 64 × 32 · até 1 MB</small></label><p class="field-help">Ao importar, mantenha o crédito do criador original. Skins legadas são convertidas para o layout 64 × 64.</p><div data-studio-error class="invalid-box" role="alert" hidden></div><button class="studio-text" data-action="close-dialog">Continuar editando</button>`,
    );
  }
  async function replaceBase(src, model, credits, equipped = {}) {
    const version = epoch;
    try {
      const pixels = await imagePixels(src);
      if (!active() || version !== epoch) return;
      const before = snapshot();
      state = {
        pixels: new Uint8ClampedArray(pixels),
        model,
        equipped: Object.fromEntries(
          Object.entries(equipped).filter(
            ([category, id]) =>
              CATEGORIES[category] &&
              allParts.some(
                (p) =>
                  p.id === id &&
                  p.category === category &&
                  (p.model === "both" || p.model === model),
              ),
          ),
        ),
      };
      sourceCredits = [...new Set([...sourceCredits, ...credits])];
      changed(before);
      closeDialog();
      renderPanel();
    } catch {
      toast("Não foi possível abrir esta skin. Seu rascunho continua intacto.");
    }
  }
  function publishPieceDialog() {
    if (!account()) {
      toast("Entre na conta de demonstração para publicar uma peça.");
      return;
    }
    openDialog(
      `<h2 id="dialog-title">Publique uma peça sua.</h2><p>Somente a sobreposição da categoria escolhida será exportada. A skin base não vai junto.</p><form id="studio-piece-form"><label class="field"><span>Nome da peça</span><input name="pieceName" maxlength="60" required placeholder="Ex.: minha jaqueta azul"></label><label class="field"><span>Categoria</span><select name="pieceCategory">${Object.entries(
        CATEGORIES,
      )
        .map(([k, v]) => `<option value="${k}">${v}</option>`)
        .join(
          "",
        )}</select></label><p class="field-help">Compatível com o modelo ${state.model === "slim" ? "Slim" : "Clássico"}. Partes fora dessa categoria não serão incluídas.</p><label class="check-label"><input type="checkbox" name="pieceRights" required>Criei esta peça ou tenho permissão para compartilhá-la.</label><div class="invalid-box" data-studio-error role="alert" hidden></div><div class="dialog-actions"><button class="button secondary" type="button" data-action="close-dialog">Cancelar</button><button class="button" type="submit">Publicar na prévia ${icon("arrow-right")}</button></div></form>`,
    );
  }
  function updateDownload() {
    const a = main.querySelector('[data-studio-action="download"]');
    if (!a || !loaded) return;
    a.href = pixelCanvas(rendered()).toDataURL("image/png");
    a.download = "minha-skin-" + state.model + ".png";
    a.removeAttribute("aria-disabled");
  }

  document.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-studio-action]");
    if (!b || !active()) return;
    const a = b.dataset.studioAction;
    if (a === "mode") changeMode(b.dataset.mode);
    else if (a === "paint-mode") changeMode("paint");
    else if (a === "category") {
      category = b.dataset.category;
      query = "";
      renderPanel();
    } else if (a === "own-parts") {
      ownOnly = !ownOnly;
      renderPanel();
    } else if (a === "clear-search") {
      query = "";
      renderPanel();
    } else if (a === "equip") {
      const p = allParts.find((p) => p.id === b.dataset.id);
      if (!p) return;
      const before = snapshot();
      if (state.equipped[p.category] === p.id)
        delete state.equipped[p.category];
      else state.equipped[p.category] = p.id;
      changed(before);
      animateEquip();
    } else if (a === "unequip") {
      const before = snapshot();
      delete state.equipped[b.dataset.category];
      changed(before);
    } else if (a === "undo" || a === "redo") {
      const previous = history[a](state);
      if (previous) {
        state = previous;
        dirty = true;
        saveNow();
        renderPanel();
        refresh();
      }
    } else if (a === "tool") {
      selectTool(b.dataset.tool);
    } else if (a === "color") {
      color = b.dataset.color;
      syncColor();
    } else if (a === "face") {
      face = b.dataset.face;
      selection = { x: 0, y: 0 };
      renderPanel();
    } else if (a === "grid") {
      showGrid = !showGrid;
      b.setAttribute("aria-pressed", String(showGrid));
      drawFace();
    } else if (a === "keep-draft") {
      pendingSeed = null;
      closeDialog();
    } else if (a === "confirm-seed" && pendingSeed) {
      const seed = pendingSeed;
      pendingSeed = null;
      await replaceBase(
        seed.image,
        seed.model === "slim" ? "slim" : "classic",
        seed.base
          ? ["Modelo base: Mojang Studios"]
          : [
              ...(seed.componentCredits || []),
              seed.creatorMode === "credited"
                ? `Skin base: ${seed.creatorName}`
                : "Skin base enviada pelo usuário",
            ],
        seed.showroom ? seed.equipped : {},
      );
    } else if (a === "base") baseDialog();
    else if (a === "choose-base")
      await replaceBase(
        `./assets/skins/${b.dataset.base}.png`,
        b.dataset.base === "alex" ? "slim" : "classic",
        ["Modelo base: Mojang Studios"],
      );
    else if (a === "download") {
      if (!loaded) e.preventDefault();
      else toast("PNG 64 × 64 preparado para download.");
    } else if (a === "publish-piece") publishPieceDialog();
    else if (a === "publish") {
      const components = [
        ...new Set([
          ...sourceCredits,
          ...Object.values(state.equipped)
            .flatMap((id) => {
              const p = allParts.find((p) => p.id === id);
              return p
                ? [`${p.name} — ${p.creator}`, ...(p.sourceCredits || [])]
                : [];
            })
            .filter(Boolean),
        ]),
      ];
      publishSkin({
        image: pixelCanvas(rendered()).toDataURL("image/png"),
        height: 64,
        model: state.model,
        name: "Minha criação",
        componentCredits: components,
        creatorMode: "self",
        creatorName: "",
      });
    } else if (viewer) {
      if (a === "rotate-left" || a === "rotate-right") {
        viewer.playerObject.rotation.y +=
          ((a === "rotate-left" ? -1 : 1) * Math.PI) / 4;
      } else if (a === "front") {
        viewer.controls.reset();
        viewer.playerObject.rotation.y = 0;
      } else if (a === "zoom-in")
        viewer.zoom = Math.min(1.15, viewer.zoom + 0.1);
      else if (a === "zoom-out") viewer.zoom = Math.max(0.5, viewer.zoom - 0.1);
      else if (a === "walk" && mode === "dress") {
        walking = !walking;
        viewer.animation = walking ? new api.WalkingAnimation() : null;
        refreshControls();
      }
    }
  });
  document.addEventListener("input", (e) => {
    if (!active()) return;
    if (e.target.id === "part-search") {
      query = e.target.value;
      renderParts();
    } else if (e.target.id === "paint-color") {
      color = e.target.value;
      syncColor();
    } else if (
      e.target.id === "paint-hex" &&
      /^#[0-9a-f]{6}$/i.test(e.target.value)
    ) {
      color = e.target.value;
      syncColor();
    }
  });
  document.addEventListener("change", async (e) => {
    if (!active()) return;
    const id = e.target.id;
    if (id === "paint-part" || id === "paint-layer") {
      if (id === "paint-part") part = e.target.value;
      else layer = e.target.value;
      selection = { x: 0, y: 0 };
      renderPanel();
    } else if (id === "paint-size") size = Number(e.target.value);
    else if (id === "paint-mirror") mirror = e.target.checked;
    else if (id === "studio-model") {
      const before = snapshot();
      state.model = e.target.value;
      state.equipped = Object.fromEntries(
        Object.entries(state.equipped).filter(([, id]) =>
          allParts.some(
            (p) =>
              p.id === id && (p.model === "both" || p.model === state.model),
          ),
        ),
      );
      changed(before);
      renderPanel();
      toast("Modelo alterado. Confira braços e peças; você pode desfazer.");
    } else if (id === "studio-import") {
      const file = e.target.files?.[0];
      if (!file) return;
      const error = dialog.querySelector("[data-studio-error]");
      try {
        if (file.type !== "image/png" || file.size > 1048576)
          throw Error("Escolha um PNG de até 1 MB.");
        const bitmap = await createImageBitmap(file);
        const valid = bitmap.width === 64 && [32, 64].includes(bitmap.height);
        const height = bitmap.height;
        bitmap.close();
        if (!valid)
          throw Error("Use o arquivo de skin de 64 × 64 ou 64 × 32 pixels.");
        const url = URL.createObjectURL(file);
        try {
          await replaceBase(url, height === 32 ? "classic" : state.model, [
            "Skin importada · preserve o crédito do criador original",
          ]);
        } finally {
          URL.revokeObjectURL(url);
        }
      } catch (err) {
        if (error) {
          error.hidden = false;
          error.textContent = err.message;
        }
      }
    }
  });
  document.addEventListener("submit", (e) => {
    if (e.target.id !== "studio-piece-form" || !active()) return;
    e.preventDefault();
    const f = new FormData(e.target),
      cat = f.get("pieceCategory"),
      name = String(f.get("pieceName") || "").trim(),
      err = dialog.querySelector("[data-studio-error]");
    const fail = (text) => {
      err.hidden = false;
      err.textContent = text;
    };
    if (!name) return fail("Dê um nome à peça.");
    if (!f.get("pieceRights"))
      return fail("Confirme que tem permissão para compartilhar.");
    if (ownParts.length >= 30)
      return fail(
        "Esta prévia guarda até 30 peças. Baixe suas criações para preservá-las.",
      );
    const pixels = extractPiece(rendered(), cat, state.model);
    if (!pixels.some((v, i) => i % 4 === 3 && v > 0))
      return fail(
        "Não há pixels nesta categoria. Pinte a sobreposição ou experimente uma peça primeiro.",
      );
    const credits = [
      ...new Set([
        ...sourceCredits,
        ...Object.values(state.equipped)
          .flatMap((id) => {
            const p = allParts.find((p) => p.id === id);
            return p ? [p.creator, ...(p.sourceCredits || [])] : [];
          })
          .filter(Boolean),
      ]),
    ];
    const entry = safePart({
      id: crypto.randomUUID(),
      name,
      category: cat,
      model: state.model,
      image: pixelCanvas(pixels).toDataURL("image/png"),
      sourceCredits: credits,
    });
    const rows = [entry, ...ownParts.map(({ pixels, ...p }) => p)];
    try {
      localStorage.setItem(PART_KEY, JSON.stringify(rows));
      entry.pixels = pixels;
      ownParts.unshift(entry);
      allParts = [...SAMPLE_PARTS, ...ownParts];
      category = cat;
      ownOnly = true;
      query = "";
      closeDialog();
      changeMode("dress");
      toast("Peça publicada no catálogo deste navegador.");
    } catch {
      fail(
        "Sem espaço neste navegador. Baixe o PNG para não perder sua criação.",
      );
    }
  });
  document.addEventListener("keydown", (e) => {
    if (
      !active() ||
      dialog.open ||
      /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)
    )
      return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      main
        .querySelector(`[data-studio-action="${e.shiftKey ? "redo" : "undo"}"]`)
        ?.click();
    } else if (mode === "paint" && !e.ctrlKey && !e.metaKey) {
      const shortcuts = {
          b: "brush",
          e: "eraser",
          f: "fill",
          i: "picker",
          r: "rotate",
        },
        t = shortcuts[e.key.toLowerCase()];
      if (t) {
        e.preventDefault();
        selectTool(t);
      }
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (viewer) viewer.renderPaused = document.hidden;
    if (document.hidden) saveNow();
  });
  window.addEventListener("pagehide", saveNow);
  function dispose() {
    if (live && loaded && dirty) saveNow();
    live = false;
    loaded = false;
    epoch++;
    stroke = null;
    clearTimeout(saveTimer);
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    resize?.disconnect();
    resize = null;
    viewer?.dispose();
    viewer = null;
  }
  return { render, dispose };
}
