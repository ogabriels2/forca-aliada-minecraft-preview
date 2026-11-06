import { createShowroom, showroomMarkup } from "./skin-showroom.mjs";
import {
  BASE_SKINS,
  safeSkin,
  findSkins,
  skinTags,
  skinText,
  skinDimensions,
  skinCreditError,
} from "./skin-model.mjs";
import { loadSkinViewer, imagePixels, drawSkinFront } from "./skin-viewer.mjs";
import { safePart, CATEGORIES } from "./skin-parts.mjs";
import { overlay } from "./skin-pixels.mjs";

// Local prototype only: this module never calls the production account or skin API.
export function createSkinLibrary({
  main,
  dialog,
  esc,
  icon,
  openDialog,
  closeDialog,
  toast,
  paintIcons,
  account,
  editSkin,
}) {
  const key = "fa-minecraft-skins-prototype-v1";
  let stored = {};
  try {
    stored = JSON.parse(localStorage.getItem(key) || "{}") || {};
  } catch {}
  const data = {
    own: (Array.isArray(stored.own) ? stored.own : [])
      .slice(0, 20)
      .map(safeSkin)
      .filter(Boolean),
    favorites: new Set(
      Array.isArray(stored.favorites)
        ? stored.favorites.slice(0, 50).filter((s) => typeof s === "string")
        : [],
    ),
  };
  let profile = false,
    query = "",
    model = "",
    savedOnly = false,
    selected = null,
    upload = null,
    uploadBusy = false,
    viewer = null,
    resizeObserver = null,
    viewerEpoch = 0,
    showroom = null;
  const all = () => [...data.own, ...BASE_SKINS];
  const save = () => {
    try {
      localStorage.setItem(
        key,
        JSON.stringify({ own: data.own, favorites: [...data.favorites] }),
      );
      return true;
    } catch {
      toast(
        "Não foi possível guardar. Libere espaço neste navegador antes de sair.",
      );
      return false;
    }
  };
  const formError = (text) => {
    const n = dialog.querySelector("[data-skin-error]");
    if (n) {
      n.hidden = false;
      n.textContent = text;
    }
  };
  function disposeDetail() {
    viewerEpoch++;
    resizeObserver?.disconnect();
    resizeObserver = null;
    if (viewer) {
      viewer.dispose();
      viewer = null;
    }
  }
  function dispose() {
    disposeDetail();
    showroom?.dispose();
    showroom = null;
  }
  const modelName = (skin) =>
    skin.model === "slim" ? "Slim · braços finos" : "Clássico · braços largos";
  const credit = (skin) =>
    skin.componentCredits?.length
      ? "Composição sua · créditos preservados"
      : skin.base
        ? "Modelo base da Mojang Studios"
        : skin.creatorMode === "self"
          ? "Criação sua"
          : skin.creatorMode === "credited" && skin.creatorName
            ? `Criação de ${esc(skin.creatorName)}`
            : "Autoria não informada";
  function thumb(s) {
    return `<canvas class="skin-thumb" width="128" height="160" data-skin-texture="${esc(s.id)}" role="img" aria-label="Vista frontal da skin ${esc(s.name)}"></canvas>`;
  }
  function render(own = false) {
    dispose();
    profile = own;
    if (own && !account()) {
      main.innerHTML = `<section class="container skin-empty"><h1>Suas skins, no seu perfil.</h1><p>Entre na conta de demonstração para testar sua coleção. Nenhuma conta real será acessada.</p><button class="button" data-skin-action="demo-login">Entrar na prévia ${icon("arrow-right")}</button><a href="#/skins">Explorar skins</a></section>`;
      paintIcons(main);
      return;
    }
    main.innerHTML = `<section class="container skins-heading">${own ? '<a class="text-link" href="#/skins">← Catálogo de skins</a>' : ""}<div><div><h1>${own ? "Suas skins." : "Skins para Minecraft."}</h1><p>${own ? "Uma coleção no seu perfil. Pronta para escolher, baixar e compartilhar." : "Encontre uma pronta. Ou crie do seu jeito."}</p></div><div class="skin-heading-actions"><button class="button secondary" data-skin-action="upload">${icon("upload")} Enviar PNG</button><a class="text-link skin-open-editor" href="#/skins/editor">${icon("brush")} Abrir editor</a></div></div>${own ? '<div class="skin-profile-line">Conta de demonstração · seção Skins do perfil Força Aliada</div>' : ""}</section>${!own ? `<section class="container skin-discovery"><div class="skin-discovery-copy"><h2>Experimente um<br>novo visual.</h2><p>Roupas, cabelos e cores. Veja cada mudança no personagem e continue criando no editor.</p><a class="button" href="#/skins/editor" data-showroom-action="edit">Personalizar este visual ${icon("arrow-right")}</a><small>Peças de textura gratuitas · amostras da Força Aliada</small></div>${showroomMarkup(icon)}</section>` : ""}<section class="container skins-catalog" aria-label="Catálogo de skins"><div class="skin-toolbar"><label class="skin-search">${icon("search")}<span class="sr-only">Buscar skins</span><input type="search" id="skin-search" placeholder="Nome, criador ou tag" value="${esc(query)}"></label><label class="select-wrap"><span class="sr-only">Modelo da skin</span><select id="skin-model"><option value="">Todos os modelos</option><option value="classic" ${model === "classic" ? "selected" : ""}>Clássico</option><option value="slim" ${model === "slim" ? "selected" : ""}>Slim</option></select></label><button class="skin-saved button secondary" data-skin-action="saved" aria-pressed="${savedOnly}">${icon("heart")} Salvas</button>${!own ? '<a class="text-link" href="#/perfil/demonstracao/skins">Minhas skins</a>' : ""}</div><p class="skin-count" role="status" aria-live="polite"></p><div class="skin-grid" id="skin-results"></div><div class="skin-library-note">Catálogo de demonstração: os modelos base são da Mojang. Seus envios ficam neste navegador; não são publicados na internet.</div></section><section class="container skin-how"><div><h2>Do perfil para o jogo.</h2><p>Escolha uma skin, confira o modelo e veja como usá-la no Minecraft.</p></div><ol><li><strong>Veja por todos os lados.</strong><span>Abra a prévia 3D e gire o personagem.</span></li><li><strong>Escolha como usar.</strong><span>Baixe o PNG ou teste o fluxo da conta Java vinculada. No Bedrock, confira como importar.</span></li><li><strong>Guarde as favoritas.</strong><span>Sua coleção fica à mão, sem precisar publicar outra cópia.</span></li></ol></section>`;
    results();
    if (!own)
      showroom = createShowroom(main.querySelector(".skin-discovery"), {
        dialog,
        edit: editSkin,
        icon,
        paintIcons,
      });
    if (own) renderProfileParts();
    paintIcons(main);
  }
  async function renderProfileParts() {
    let rows = [];
    try {
      rows = JSON.parse(localStorage.getItem("fa-skin-parts-v1") || "[]");
    } catch {}
    const parts = (Array.isArray(rows) ? rows : [])
      .map(safePart)
      .filter(Boolean)
      .slice(0, 30);
    const section = document.createElement("section");
    section.className = "container profile-parts";
    section.innerHTML = `<div><h2>Suas peças</h2><a class="text-link" href="#/skins/editor">${icon("brush")} Criar uma peça</a></div>${parts.length ? `<div class="profile-parts-grid">${parts.map((p) => `<a href="#/skins/editor?part=${p.id}" class="profile-piece"><canvas width="96" height="128" data-profile-part="${p.id}" role="img" aria-label="Prévia de ${esc(p.name)}"></canvas><strong>${esc(p.name)}</strong><small>${CATEGORIES[p.category]} · ${p.model === "slim" ? "Slim" : "Clássico"}</small><span>Experimentar ${icon("arrow-right")}</span></a>`).join("")}</div>` : "<p>Crie roupas, cabelos ou calçados no editor. As peças publicadas na prévia aparecem aqui.</p>"}`;
    main.querySelector(".skin-how")?.before(section);
    paintIcons(section);
    for (const p of parts) {
      try {
        const base = await imagePixels(
          `./assets/skins/${p.model === "slim" ? "alex" : "steve"}.png`,
        );
        const pixels = await imagePixels(p.image);
        if (!section.isConnected) return;
        const canvas = section.querySelector(`[data-profile-part="${p.id}"]`);
        if (canvas) drawSkinFront(canvas, overlay(base, pixels), p.model);
      } catch {}
    }
  }
  function results() {
    const list = findSkins(
      profile
        ? data.own
        : all().filter((s) => s.base || s.visibility === "listed"),
      query,
      model,
    ).filter((s) => !savedOnly || data.favorites.has(s.id));
    const root = main.querySelector("#skin-results");
    if (!root) return;
    root.innerHTML = list.length
      ? list
          .map(
            (s) =>
              `<article class="skin-card"><button class="skin-card-stage" data-skin-action="open" data-id="${s.id}">${thumb(s)}<span class="skin-view-hint">Ver em 3D ${icon("arrow-right")}</span></button><div class="skin-card-copy"><div><h2><button data-skin-action="open" data-id="${s.id}">${esc(s.name)}</button></h2><button class="favorite" data-skin-action="favorite" data-id="${s.id}" aria-label="${data.favorites.has(s.id) ? "Remover" : "Salvar"} ${esc(s.name)}" aria-pressed="${data.favorites.has(s.id)}">${icon("heart")}</button></div><p>${s.base ? `<a href="https://help.minecraft.net/hc/pt-br/articles/4408894664461" target="_blank" rel="noopener">${esc(s.author)}</a>` : `<a href="#/perfil/demonstracao/skins">Publicada por você</a>`}</p><span>${modelName(s)}</span>${s.base ? "<small>Modelo base oficial</small>" : `<small>${credit(s)}</small>`}</div></article>`,
          )
          .join("")
      : `<div class="skin-empty"><h2>${profile && !query && !savedOnly ? "Sua coleção começa com uma criação." : "Nenhuma skin encontrada."}</h2><p>${profile ? "Envie um PNG de skin para testar a publicação no seu perfil." : "Tente outro nome, modelo ou limpe os filtros."}</p><button class="button secondary" data-skin-action="${profile ? "upload" : "clear"}">${profile ? "Enviar minha primeira skin" : "Limpar filtros"}</button></div>`;
    const smallCatalog =
      !profile &&
      !query &&
      !model &&
      !savedOnly &&
      list.length > 0 &&
      list.length < 3;
    root.classList.toggle("is-small", smallCatalog);
    root.classList.toggle("is-three", list.length === 3);
    if (smallCatalog)
      root.insertAdjacentHTML(
        "beforeend",
        `<aside class="skin-onboard"><h2>Tem uma skin sua?</h2><p>Adicione ao seu perfil e deixe outras pessoas encontrarem sua criação. Ou experimente roupas e pinte cada pixel no editor.</p><button class="button secondary" data-skin-action="upload">${icon("upload")} Enviar meu PNG</button><small>O protótipo guarda o envio só neste navegador.</small></aside>`,
      );
    main.querySelector(".skin-count").textContent =
      `${list.length} ${list.length === 1 ? "skin" : "skins"}${profile ? " no seu perfil" : ""}`;
    paintIcons(root);
    drawThumbs(root);
  }
  function drawThumbs(root = dialog) {
    root.querySelectorAll("[data-skin-texture]").forEach((canvas) => {
      const skin =
        upload?.id === canvas.dataset.skinTexture
          ? upload
          : all().find((s) => s.id === canvas.dataset.skinTexture);
      if (!skin) return;
      const image = new Image();
      image.onload = () => {
        if (!canvas.isConnected) return;
        const c = canvas.getContext("2d");
        c.imageSmoothingEnabled = false;
        c.clearRect(0, 0, 128, 160);
        const slim = skin.model === "slim",
          arm = slim ? 3 : 4;
        const parts = [
          [8, 8, 8, 8, 48, 8, 32, 32],
          [20, 20, 8, 12, 48, 40, 32, 48],
          [44, 20, arm, 12, 48 - arm * 4, 40, arm * 4, 48],
          [
            image.height === 32 ? 44 : 36,
            image.height === 32 ? 20 : 52,
            arm,
            12,
            80,
            40,
            arm * 4,
            48,
          ],
          [4, 20, 4, 12, 48, 88, 16, 48],
          [
            image.height === 32 ? 4 : 20,
            image.height === 32 ? 20 : 52,
            4,
            12,
            64,
            88,
            16,
            48,
          ],
          [40, 8, 8, 8, 48, 8, 32, 32],
        ];
        if (image.height === 64)
          parts.push(
            [20, 36, 8, 12, 48, 40, 32, 48],
            [44, 36, arm, 12, 48 - arm * 4, 40, arm * 4, 48],
            [52, 52, arm, 12, 80, 40, arm * 4, 48],
            [4, 36, 4, 12, 48, 88, 16, 48],
            [4, 52, 4, 12, 64, 88, 16, 48],
          );
        parts.forEach((p) => c.drawImage(image, ...p));
      };
      image.src = skin.image;
    });
  }
  function uploadDialog(existing = null, fromEditor = null) {
    if (!account()) {
      openDialog(
        `<h2 id="dialog-title">Publique com seu perfil.</h2><p>Entre na conta de demonstração para testar o envio. Nenhuma conta real será acessada.</p><button class="button" data-skin-action="demo-login">Entrar na prévia</button>`,
      );
      return;
    }
    upload = existing
      ? { ...existing }
      : {
          id: "upload-preview",
          image: "",
          name: "",
          model: "classic",
          ...fromEditor,
        };
    openDialog(
      `<h2 id="dialog-title">${existing ? "Editar publicação" : "Publique sua skin."}</h2><p>${fromEditor ? "Dê um nome à sua criação e confira os créditos antes de publicar." : "Envie o arquivo original. Você verá o personagem antes de publicar."}</p><form id="skin-upload-form" novalidate>${fromEditor ? "" : `<label class="skin-upload-target">${icon("upload")}<strong data-skin-file-label>Escolher PNG da skin</strong><span>64 × 64 ou 64 × 32 px · até 1 MB</span><input type="file" accept="image/png" id="skin-file" aria-label="Enviar arquivo PNG de skin"></label>`}<div class="skin-upload-preview" ${upload.image ? "" : "hidden"}><canvas class="skin-thumb" width="128" height="160" data-skin-texture="${upload.id}" role="img" aria-label="Prévia da skin enviada"></canvas></div><label class="field"><span>Nome da skin</span><input name="skinName" maxlength="70" value="${esc(upload.name)}" required></label><label class="field"><span>Modelo</span><select name="skinVariant"><option value="classic" ${upload.model === "classic" ? "selected" : ""}>Clássico · braços largos</option><option value="slim" ${upload.model === "slim" ? "selected" : ""}>Slim · braços finos</option></select><small>Escolha o modelo para o qual o arquivo foi criado.</small></label><label class="field"><span>Tags (opcional)</span><input name="skinTags" maxlength="125" placeholder="Ex.: aventureiro, azul, medieval" value="${esc(upload.tags?.join(", ") || "")}"><small>Até 5 tags, separadas por vírgulas.</small></label>${upload.componentCredits?.length ? `<div class="skin-editor-credits"><strong>Créditos preservados</strong><ul>${upload.componentCredits.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></div>` : ""}<label class="field"><span>Quem criou esta skin?</span><select name="skinCreatorMode" aria-label="Quem criou esta skin?" required><option value="" disabled ${!["self", "credited"].includes(upload.creatorMode) ? "selected" : ""}>Escolher autoria</option><option value="self" ${upload.creatorMode === "self" ? "selected" : ""}>${upload.componentCredits?.length ? "Eu criei esta composição · manter créditos originais" : "Eu criei esta skin"}</option><option value="credited" ${upload.creatorMode === "credited" ? "selected" : ""}>Outra pessoa · tenho permissão para publicar</option></select></label><div class="skin-credit-fields" ${upload.creatorMode === "credited" ? "" : "hidden"}><label class="field"><span>Nome do criador</span><input name="skinCreatorName" maxlength="70" value="${esc(upload.creatorName || "")}" aria-label="Nome do criador"></label><label class="field"><span>Link da origem (opcional)</span><input name="skinSourceUrl" type="url" maxlength="2048" placeholder="https://" value="${esc(upload.sourceUrl || "")}" aria-label="Link da origem (opcional)"><small>O crédito acompanha a publicação e aparece no detalhe.</small></label></div><label class="check-label"><input name="skinListed" type="checkbox" ${upload.visibility !== "unlisted" ? "checked" : ""}>Mostrar no catálogo de demonstração</label><label class="check-label skin-rights"><input name="skinRights" type="checkbox" ${existing ? "checked" : ""}>Esta skin é minha ou tenho permissão para publicá-la.</label><div class="invalid-box" data-skin-error role="alert" hidden></div><p class="field-help">Envio local. Sua skin e sua conta do Minecraft não serão alteradas.</p><div class="dialog-actions"><button type="button" class="button secondary" data-action="close-dialog">Cancelar</button><button class="button" type="submit">${existing ? "Salvar publicação" : "Publicar nesta prévia"} ${icon("arrow-right")}</button></div></form>`,
      "skin-upload",
    );
    const slimOption = dialog.querySelector('option[value="slim"]');
    if (slimOption) slimOption.disabled = upload.height === 32;
    drawThumbs();
  }
  let uploadEpoch = 0;
  async function readSkin(file) {
    if (!file) return;
    const epoch = ++uploadEpoch;
    uploadBusy = true;
    const submit = dialog.querySelector('button[type="submit"]');
    if (submit) {
      submit.disabled = true;
      submit.textContent = "Verificando arquivo…";
    }
    try {
      if (file.type !== "image/png" || file.size > 1048576)
        throw Error("Escolha um arquivo PNG de até 1 MB.");
      const bitmap = await createImageBitmap(file);
      if (!skinDimensions(bitmap.width, bitmap.height)) {
        bitmap.close();
        throw Error(
          "A skin precisa ter exatamente 64 × 64 ou 64 × 32 pixels. Não envie uma captura do personagem.",
        );
      }
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      canvas.getContext("2d").drawImage(bitmap, 0, 0);
      bitmap.close();
      if (epoch !== uploadEpoch || !dialog.querySelector("#skin-upload-form"))
        return;
      upload.image = canvas.toDataURL("image/png");
      upload.height = canvas.height;
      dialog.querySelector('option[value="slim"]').disabled =
        canvas.height === 32;
      if (canvas.height === 32) {
        upload.model = "classic";
        dialog.querySelector('[name="skinVariant"]').value = "classic";
      }
      const preview = dialog.querySelector(".skin-upload-preview");
      preview.hidden = false;
      drawThumbs();
      dialog.querySelector("[data-skin-file-label]").textContent =
        "Arquivo pronto · trocar PNG";
      dialog.querySelector("[data-skin-error]").hidden = true;
      if (!dialog.querySelector('[name="skinName"]').value)
        dialog.querySelector('[name="skinName"]').value = skinText(
          file.name.replace(/\.png$/i, ""),
        );
    } catch (e) {
      formError(e.message);
    } finally {
      if (epoch === uploadEpoch) {
        uploadBusy = false;
        if (submit?.isConnected) {
          submit.disabled = false;
          submit.textContent = upload?.owner
            ? "Salvar publicação"
            : "Publicar nesta prévia";
        }
      }
    }
  }
  function loadViewer() {
    return loadSkinViewer();
  }
  function detail(skin) {
    disposeDetail();
    selected = skin;
    openDialog(
      `<div class="skin-detail"><div class="skin-viewer-stage"><canvas id="skin-viewer" role="img" aria-label="Prévia 3D de ${esc(skin.name)}. Use os botões para girar."></canvas><div class="skin-viewer-status" role="status">Carregando personagem…</div><div class="skin-viewer-controls"><button class="icon-button" data-skin-action="rotate-left" aria-label="Girar personagem para a esquerda">${icon("chevron-right")}</button><button class="icon-button" data-skin-action="motion" aria-label="Animar personagem" aria-pressed="false">${icon("users")}</button><button class="icon-button" data-skin-action="rotate-right" aria-label="Girar personagem para a direita">${icon("chevron-right")}</button></div></div><div class="skin-detail-copy"><h2 id="dialog-title">${esc(skin.name)}</h2><p>${skin.base ? "Modelo base da Mojang Studios" : `Publicada por <a href="#/perfil/demonstracao/skins">você</a> · demonstração`}</p>${!skin.base ? `<p class="skin-credit">${credit(skin)}${skin.sourceUrl ? `<br><a href="${esc(skin.sourceUrl)}" target="_blank" rel="noopener noreferrer ugc">Ver origem ${icon("external-link")}</a>` : ""}</p>` : ""}${skin.componentCredits?.length ? `<details class="skin-component-credits"><summary>Créditos da composição</summary><ul>${skin.componentCredits.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></details>` : ""}<span class="tag">${modelName(skin)}</span><div class="skin-detail-tags">${skin.tags.map((t) => `<span>#${esc(t)}</span>`).join("")}</div><button class="button full" data-skin-action="apply">Usar no Minecraft ${icon("arrow-right")}</button><button class="button secondary full" data-skin-action="customize">${icon("brush")} Personalizar no editor</button><button class="button secondary full" data-skin-action="download">Baixar PNG ${icon("arrow-down")}</button><button class="text-link" data-skin-action="favorite" data-id="${skin.id}">${icon("heart")} ${data.favorites.has(skin.id) ? "Remover das salvas" : "Salvar na coleção"}</button>${skin.owner === "demo" && account() ? '<div class="skin-manage"><button class="text-link" data-skin-action="edit">Editar publicação</button><button class="text-link danger" data-skin-action="remove">Excluir da prévia</button></div>' : ""}<small>${skin.base ? "Modelo disponibilizado pela Mojang para personalização. Não é uma criação da Força Aliada." : "Publicação local: não aparece para outras pessoas ou dispositivos."}</small></div></div>`,
      "skin-detail",
    );
    const epoch = viewerEpoch;
    loadViewer()
      .then(async (api) => {
        if (epoch !== viewerEpoch || !dialog.querySelector("#skin-viewer"))
          return;
        const canvas = dialog.querySelector("#skin-viewer"),
          stage = canvas.parentElement;
        try {
          viewer = new api.SkinViewer({
            canvas,
            width: Math.max(220, stage.clientWidth),
            height: matchMedia("(max-width:620px)").matches ? 280 : 360,
            zoom: 0.85,
          });
          viewer.playerObject.rotation.y = 0.35;
          viewer.controls.enableZoom = false;
          viewer.controls.enablePan = false;
          resizeObserver = new ResizeObserver(() => {
            if (epoch !== viewerEpoch || !viewer) return;
            viewer.width = Math.max(220, stage.clientWidth);
            viewer.height = matchMedia("(max-width:620px)").matches ? 280 : 360;
          });
          resizeObserver.observe(stage);
          await viewer.loadSkin(skin.image, {
            model: skin.model === "slim" ? "slim" : "default",
          });
          if (epoch !== viewerEpoch) return;
          dialog.querySelector(".skin-viewer-status").hidden = true;
        } catch {
          if (epoch !== viewerEpoch) return;
          dialog.querySelector(".skin-viewer-status").textContent =
            "Prévia 3D indisponível neste dispositivo. Use o PNG abaixo.";
        }
      })
      .catch((e) => {
        if (epoch === viewerEpoch) {
          const status = dialog.querySelector(".skin-viewer-status");
          if (status) status.textContent = e.message;
        }
      });
  }
  function applyFlow(connected = false) {
    disposeDetail();
    openDialog(
      `<h2 id="dialog-title">Usar ${esc(selected.name)} no Minecraft</h2><div class="skin-apply-preview">${thumb(selected)}<div><strong>${esc(selected.name)}</strong><p>${modelName(selected)}</p></div></div><div class="skin-apply-options"><section><h3>Minecraft Java</h3><p>${connected ? "Conta Java vinculada · jogador de exemplo. Confira a skin e o modelo antes de confirmar." : "A aplicação direta precisa de uma conta Microsoft com Minecraft Java vinculada ao seu perfil Força Aliada."}</p><button class="button" data-skin-action="${connected ? "apply-confirm" : "apply-linked"}">${connected ? "Simular aplicação" : "Testar com conta Java vinculada"} ${icon("arrow-right")}</button></section><section><h3>Minecraft Bedrock</h3><p>Baixe o PNG e importe nas plataformas compatíveis. A troca da conta Java não altera a skin do Bedrock.</p><button class="text-link" data-skin-action="download">Baixar PNG ${icon("arrow-down")}</button><a class="text-link" href="https://help.minecraft.net/hc/pt-br/articles/4408902716557" target="_blank" rel="noopener">Instruções do Minecraft ${icon("external-link")}</a></section></div><p class="field-help">Fluxo demonstrativo: não acessa nem modifica uma conta real.</p>`,
      "skin-apply",
    );
    drawThumbs();
  }
  document.addEventListener("input", (e) => {
    if (e.target.id === "skin-search") {
      query = e.target.value;
      results();
    }
  });
  document.addEventListener("change", (e) => {
    if (e.target.id === "skin-model") {
      model = e.target.value;
      results();
    }
    if (e.target.id === "skin-file") readSkin(e.target.files?.[0]);
    if (e.target.name === "skinCreatorMode" && upload) {
      dialog.querySelector(".skin-credit-fields").hidden =
        e.target.value !== "credited";
    }
    if (e.target.name === "skinVariant" && upload) {
      upload.model = e.target.value;
      drawThumbs();
    }
  });
  document.addEventListener("submit", (e) => {
    if (e.target.id !== "skin-upload-form") return;
    e.preventDefault();
    if (uploadBusy) return;
    const f = new FormData(e.target);
    if (!upload?.image) {
      formError("Envie o PNG da skin antes de publicar.");
      return;
    }
    if (!skinText(f.get("skinName"))) {
      formError("Dê um nome à sua skin.");
      return;
    }
    const attribution = {
      creatorMode: f.get("skinCreatorMode"),
      creatorName: f.get("skinCreatorName"),
      sourceUrl: f.get("skinSourceUrl"),
    };
    const creditError = skinCreditError(attribution);
    if (creditError) {
      formError(creditError);
      return;
    }
    if (!f.get("skinRights")) {
      formError("Confirme que pode publicar esta skin.");
      return;
    }
    if (!upload.owner && data.own.length >= 20) {
      formError(
        "Esta prévia comporta até 20 skins. Exclua um teste antigo para continuar.",
      );
      return;
    }
    const entry = safeSkin({
      ...upload,
      ...attribution,
      id: upload.owner ? upload.id : crypto.randomUUID(),
      name: f.get("skinName"),
      model: f.get("skinVariant"),
      tags: skinTags(f.get("skinTags")),
      visibility: f.get("skinListed") ? "listed" : "unlisted",
    });
    if (!entry) {
      formError(
        "Não foi possível validar a skin. Tente enviar o PNG novamente.",
      );
      return;
    }
    const previousEntries = data.own;
    data.own = data.own.filter((s) => s.id !== entry.id);
    data.own.unshift(entry);
    if (!save()) {
      data.own = previousEntries;
      formError(
        "Não foi possível guardar a publicação. Baixe o PNG ou libere espaço neste navegador e tente novamente.",
      );
      return;
    }
    closeDialog();
    if (location.hash === "#/perfil/demonstracao/skins") render(true);
    else location.hash = "/perfil/demonstracao/skins";
    toast("Skin adicionada ao perfil de demonstração.");
  });
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-skin-action]");
    if (!b) return;
    const action = b.dataset.skinAction,
      s = all().find((s) => s.id === b.dataset.id);
    if (action === "open" && s) detail(s);
    else if (action === "upload") uploadDialog();
    else if (action === "customize" && selected) editSkin(selected);
    else if (action === "edit" && selected?.owner === "demo" && account())
      uploadDialog(selected);
    else if (action === "clear") {
      query = "";
      model = "";
      savedOnly = false;
      render(profile);
    } else if (action === "saved") {
      savedOnly = !savedOnly;
      b.setAttribute("aria-pressed", String(savedOnly));
      results();
    } else if (action === "favorite" && (s || selected)) {
      const target = s || selected;
      data.favorites.has(target.id)
        ? data.favorites.delete(target.id)
        : data.favorites.add(target.id);
      save();
      if (main.querySelector("#skin-results")) results();
      if (dialog.querySelector(".skin-detail")) detail(target);
    } else if (action === "download" && selected) {
      const a = document.createElement("a");
      a.href = selected.image;
      a.download = selected.name.replace(/[^\p{L}\p{N}_-]/gu, "-") + ".png";
      document.body.append(a);
      a.click();
      a.remove();
      toast("PNG preparado para download.");
    } else if (action === "apply") applyFlow();
    else if (action === "apply-linked") applyFlow(true);
    else if (action === "apply-confirm") {
      openDialog(
        `<h2 id="dialog-title">Fluxo de aplicação concluído.</h2><p>Na versão conectada, este seria o retorno da troca no Minecraft Java.</p><div class="notice">Nenhuma skin foi alterada. Esta conta e esta aplicação são demonstrativas.</div><button class="button full" data-skin-action="back-detail">Voltar à skin</button>`,
      );
    } else if (action === "back-detail" && selected) detail(selected);
    else if (action === "rotate-left" && viewer)
      viewer.playerObject.rotation.y -= Math.PI / 4;
    else if (action === "rotate-right" && viewer)
      viewer.playerObject.rotation.y += Math.PI / 4;
    else if (action === "motion" && viewer) {
      const on = !viewer.animation;
      viewer.animation = on ? new window.faSkin3d.WalkingAnimation() : null;
      b.setAttribute("aria-pressed", String(on));
      b.setAttribute(
        "aria-label",
        on ? "Pausar animação" : "Animar personagem",
      );
    } else if (action === "remove" && selected?.owner === "demo" && account()) {
      disposeDetail();
      openDialog(
        `<h2 id="dialog-title">Excluir ${esc(selected.name)} desta prévia?</h2><p>Ela sairá do perfil e do catálogo deste navegador. O arquivo original no seu computador não será alterado.</p><div class="dialog-actions"><button class="button secondary" data-skin-action="back-detail">Manter skin</button><button class="button" data-skin-action="remove-confirm">Excluir da prévia</button></div>`,
      );
    } else if (
      action === "remove-confirm" &&
      selected?.owner === "demo" &&
      account()
    ) {
      data.own = data.own.filter((s) => s.id !== selected.id);
      data.favorites.delete(selected.id);
      save();
      closeDialog();
      render(profile);
      toast("Skin removida da demonstração.");
    } else if (action === "demo-login") {
      document.querySelector('[data-action="login"]')?.click();
      if (dialog.open) closeDialog();
      render(profile);
    }
  });
  dialog.addEventListener("close", () => {
    disposeDetail();
    uploadEpoch++;
    uploadBusy = false;
  });
  document.addEventListener("visibilitychange", () => {
    if (viewer) viewer.renderPaused = document.hidden;
  });
  return {
    render,
    dispose,
    publishFromEditor: (skin) => uploadDialog(null, skin),
  };
}
