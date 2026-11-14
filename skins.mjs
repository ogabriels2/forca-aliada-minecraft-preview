import {createCreationsClient} from './creations-client.mjs?v=microsoft-20261113';
import { createShowroom, showroomMarkup } from "./skin-showroom.mjs?v=wardrobe-20261113";
import {
  BASE_SKINS,
  safeSkin,
  findSkins,
  skinTags,
  skinText,
  skinDimensions,
  skinCreditError,
} from "./skin-model.mjs?v=microsoft-20261113";
import { loadSkinViewer, imagePixels, drawSkinFront } from "./skin-viewer.mjs";
import { safePart, CATEGORIES } from "./skin-parts.mjs?v=wardrobe-20261113";
import { overlay } from "./skin-pixels.mjs?v=microsoft-20261113";

// Original library UI backed by the isolated account API. Legacy local drafts are never uploaded automatically.
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
  getUser=()=>null,
  signIn=()=>{},
  manageConnections=()=>{},
  report=()=>{},
  ownDecisions=()=>{},
}) {
  const remote=createCreationsClient(),profileParts=new Map();
  let favoriteVersion=0;
  let remoteRows=[],publicAuthor='',nextOffset=null,collectionError='',collectionLoading=false,loadVersion=0,searchTimer,userKey='';
  const fromServer=value=>({...value,owner:value.owned||String(value.publisher)===String(getUser()?.id)?String(value.publisher):null,base:false});
  const ownEntry=skin=>Boolean(skin?.owner)&&String(skin.owner)===String(getUser()?.id);
  const profileLink=skin=>'#/perfil/'+encodeURIComponent(skin.publisherUsername||getUser()?.username||'')+'/skins';
  async function reload({more=false}={}){
    const version=++loadVersion,identity=String(getUser()?.id||'');collectionLoading=true;collectionError='';showCollectionStatus();
    const values={kind:'skin',q:query,model,offset:more?nextOffset||0:0};
    try{const result=savedOnly&&getUser()?await remote.favorites(values):publicAuthor?await remote.profile(publicAuthor,values):profile?await remote.mine(values):await remote.list(values);
      if(version!==loadVersion||identity!==String(getUser()?.id||''))return;remoteRows=more?[...remoteRows,...result.rows.map(fromServer)]:result.rows.map(fromServer);nextOffset=result.nextOffset;
    }catch(error){if(version===loadVersion){collectionError=error.message;nextOffset=null;}}finally{if(version===loadVersion){collectionLoading=false;results();}}
  }
  function showCollectionStatus(){const note=main.querySelector('.skin-library-note');if(note)note.innerHTML=collectionError?esc(collectionError)+' <button class="text-link" data-skin-action="retry">Tentar novamente</button>':collectionLoading?'Carregando skins da plataforma…':'Suas criações ficam salvas na conta. Só as que você tornar públicas aparecem no perfil e no catálogo.';const more=main.querySelector('[data-skin-more]');if(more){more.hidden=nextOffset===null;more.disabled=collectionLoading;}}
  function scheduleReload(){clearTimeout(searchTimer);searchTimer=setTimeout(()=>void reload(),250);}
  const key = "fa-minecraft-skins-prototype-v1";
  let stored = {};
  try {
    stored = JSON.parse(localStorage.getItem("fa-minecraft-skins-favorites-v2") || localStorage.getItem(key) || "{}") || {};
  } catch {}
  const data = {
    favorites: new Set(
      Array.isArray(stored.favorites)
        ? stored.favorites.slice(0, 50).filter((s) => typeof s === "string" && s.startsWith("base-"))
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
  const all = () => [...new Map([...remoteRows,...BASE_SKINS].map(s=>[s.id,s])).values()];
  const save = () => {
    try {
      localStorage.setItem(
        "fa-minecraft-skins-favorites-v2",
        JSON.stringify({ favorites: [...data.favorites].filter(id=>id.startsWith("base-")) }),
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
    skin.base
        ? "Modelo base da Mojang Studios"
        : skin.creatorMode === "self"
          ? skin.componentCredits?.length ? "Composição · créditos preservados" : "Criação de "+esc(skin.publisherName||"você")
          : skin.creatorMode === "credited" && skin.creatorName
            ? `Criação de ${esc(skin.creatorName)}`
            : "Autoria não informada";
  function thumb(s) {
    return `<canvas class="skin-thumb" width="128" height="160" data-skin-texture="${esc(s.id)}" role="img" aria-label="Vista frontal da skin ${esc(s.name)}"></canvas>`;
  }
  function render(own = false,author='') {
    publicAuthor=author;remoteRows=[];nextOffset=null;collectionError='';
    dispose();
    profile = own;
    if (own && !account()) {
      main.innerHTML = `<section class="container skin-empty"><h1>Suas skins, no seu perfil.</h1><p>Entre para ver as skins salvas na sua conta.</p><button class="button" data-skin-action="demo-login">Entrar na conta ${icon("arrow-right")}</button><a href="#/skins">Explorar skins</a></section>`;
      paintIcons(main);
      return;
    }
    main.innerHTML = `<section class="container skins-heading">${own ? '<a class="text-link" href="#/skins">← Catálogo de skins</a>' : ""}<div><div><h1>${own ? "Suas skins." : publicAuthor ? "Skins de "+esc(publicAuthor) : "Skins para Minecraft."}</h1><p>${own ? "Uma coleção no seu perfil. Pronta para escolher, baixar e compartilhar." : "Encontre uma pronta. Ou crie do seu jeito."}</p></div><div class="skin-heading-actions"><a class="text-link skin-open-editor" href="#/skins/roupas">Roupas</a>${own ? `<button class="button secondary" data-skin-action="import-minecraft">${icon("download")} Importar do Minecraft</button>` : ""}<button class="button secondary" data-skin-action="upload">${icon("upload")} Enviar PNG</button><a class="text-link skin-open-editor" href="#/skins/editor">${icon("brush")} Abrir editor</a></div></div>${own ? '<div class="skin-profile-line">Sua coleção · itens privados só aparecem para você</div>' : ""}</section>${!own && !publicAuthor ? `<section class="container skin-discovery"><div class="skin-discovery-copy"><h2>Experimente um<br>novo visual.</h2><p>Roupas, cabelos e cores. Veja cada mudança no personagem e continue criando no editor.</p><a class="button" href="#/skins/editor" data-showroom-action="edit">Personalizar este visual ${icon("arrow-right")}</a><small>Peças de textura gratuitas · amostras da Força Aliada</small></div>${showroomMarkup(icon)}</section>` : ""}<section class="container skins-catalog" aria-label="Catálogo de skins"><div class="skin-toolbar"><label class="skin-search">${icon("search")}<span class="sr-only">Buscar skins</span><input type="search" id="skin-search" placeholder="Nome, criador ou tag" value="${esc(query)}"></label><label class="select-wrap"><span class="sr-only">Modelo da skin</span><select id="skin-model"><option value="">Todos os modelos</option><option value="classic" ${model === "classic" ? "selected" : ""}>Clássico</option><option value="slim" ${model === "slim" ? "selected" : ""}>Slim</option></select></label><button class="skin-saved button secondary" data-skin-action="saved" aria-pressed="${savedOnly}">${icon("heart")} Salvas</button>${!own ? '<a class="text-link" href="#/minhas-skins">Minhas skins</a>' : ""}</div><p class="skin-count" role="status" aria-live="polite"></p><div class="skin-grid" id="skin-results"></div><button class="button secondary" data-skin-action="more" data-skin-more hidden>Carregar mais skins</button><div class="skin-library-note" role="status"></div></section><section class="container skin-how"><div><h2>Do perfil para o jogo.</h2><p>Escolha uma skin, confira o modelo e veja como usá-la no Minecraft.</p></div><ol><li><strong>Veja por todos os lados.</strong><span>Abra a prévia 3D e gire o personagem.</span></li><li><strong>Escolha como usar.</strong><span>Baixe o PNG ou use a conexão Java quando ela estiver disponível. No Bedrock, confira como importar.</span></li><li><strong>Guarde as favoritas.</strong><span>Sua coleção fica à mão, sem precisar publicar outra cópia.</span></li></ol></section>`;
    results();
    void reload();
    if (!own && !publicAuthor)
      showroom = createShowroom(main.querySelector(".skin-discovery"), {
        dialog,
        edit: editSkin,
        icon,
        paintIcons,
      });
    if (own||publicAuthor) void renderProfileParts();
    if (own) void ownDecisions(main.querySelector(".skins-catalog"));
    paintIcons(main);
  }
  async function renderProfileParts() {
    const anchor=main.querySelector('.skins-heading');let rows=[];
    try{let offset=0;do{const result=publicAuthor?await remote.profile(publicAuthor,{kind:'part',offset}):await remote.mine({kind:'part',offset});rows.push(...result.rows.map(value=>({...value,sourceCredits:value.componentCredits})));offset=result.nextOffset;}while(offset!==null&&rows.length<50);}catch{return;}
    if(!anchor?.isConnected)return;
    profileParts.clear();for(const row of rows)profileParts.set(row.id,row);
    const parts = (Array.isArray(rows) ? rows : [])
      .map(safePart)
      .filter(Boolean)
      .slice(0, 50);
    if(publicAuthor&&!parts.length)return;
    const section = document.createElement("section");
    section.className = "container profile-parts";
    section.innerHTML = `<div><h2>${publicAuthor?"Peças de "+esc(publicAuthor):"Suas peças"}</h2><a class="text-link" href="#/skins/editor?criar=peca">${icon("brush")} Criar uma peça</a></div>${parts.length ? `<div class="profile-parts-grid">${parts.map((p) => `<article class="profile-piece-container"><a href="#/skins/editor?part=${p.id}" class="profile-piece"><canvas width="96" height="128" data-profile-part="${p.id}" role="img" aria-label="Prévia de ${esc(p.name)}"></canvas><strong>${esc(p.name)}</strong><small>${CATEGORIES[p.category]} · ${p.model === "slim" ? "Slim" : "Clássico"}</small>${!publicAuthor ? `<small>${({private:"Só você",unlisted:"Por link",listed:"No catálogo"})[profileParts.get(p.id)?.visibility] || ""}</small>` : ""}<span>Experimentar ${icon("arrow-right")}</span></a>${!publicAuthor?`<div class="profile-piece-actions"><button class="text-link" data-skin-action="edit-part" data-id="${p.id}">${icon("pencil")} Gerenciar</button><button class="text-link danger" data-skin-action="remove-part" data-id="${p.id}" aria-label="Excluir ${esc(p.name)}">Excluir</button></div>`:""}</article>`).join("")}</div>` : "<p>Crie roupas, cabelos ou calçados no editor. As peças publicadas na prévia aparecem aqui.</p>"}`;
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
      profile || publicAuthor || savedOnly ? remoteRows : all(),
      query,
      model,
    ).filter((s) => !savedOnly || !s.base || data.favorites.has(s.id));
    const root = main.querySelector("#skin-results");
    if (!root) return;
    root.innerHTML = list.length
      ? list
          .map(
            (s) =>
              `<article class="skin-card"><button class="skin-card-stage" data-skin-action="open" data-id="${s.id}">${thumb(s)}<span class="skin-view-hint">Ver em 3D ${icon("arrow-right")}</span></button><div class="skin-card-copy"><div><h2><button data-skin-action="open" data-id="${s.id}">${esc(s.name)}</button></h2><button class="favorite" data-skin-action="favorite" data-id="${s.id}" aria-label="${data.favorites.has(s.id) ? "Remover" : "Salvar"} ${esc(s.name)}" aria-pressed="${data.favorites.has(s.id)}">${icon("heart")}</button></div><p>${s.base ? `<a href="https://help.minecraft.net/hc/pt-br/articles/4408894664461" target="_blank" rel="noopener">${esc(s.author)}</a>` : `<a href="${profileLink(s)}">${esc(s.publisherName)}</a>`}</p><span>${modelName(s)}</span>${s.base ? "<small>Modelo base oficial</small>" : `<small>${credit(s)}</small>`}</div></article>`,
          )
          .join("")
      : `<div class="skin-empty"><h2>${profile && !query && !savedOnly ? "Sua coleção começa com uma criação." : "Nenhuma skin encontrada."}</h2><p>${profile ? "Envie um PNG ou salve uma criação do editor na sua conta." : "Tente outro nome, modelo ou limpe os filtros."}</p><button class="button secondary" data-skin-action="${profile ? "upload" : "clear"}">${profile ? "Enviar minha primeira skin" : "Limpar filtros"}</button></div>`;
    const smallCatalog =
      !profile &&
      !publicAuthor &&
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
        `<aside class="skin-onboard"><h2>Tem uma skin sua?</h2><p>Adicione ao seu perfil e deixe outras pessoas encontrarem sua criação. Ou experimente roupas e pinte cada pixel no editor.</p><button class="button secondary" data-skin-action="upload">${icon("upload")} Enviar meu PNG</button><small>Comece guardando só para você; publicar é opcional.</small></aside>`,
      );
    main.querySelector(".skin-count").textContent =
      `${list.length} ${list.length === 1 ? "skin" : "skins"}${profile ? " na sua coleção" : ""}`;
    showCollectionStatus();
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
  function uploadDialog(existing = null, prepared = null, { imported = false } = {}) {
    if (!account()) {
      openDialog(
        `<h2 id="dialog-title">Publique com seu perfil.</h2><p>Entre para guardar sua skin e escolher quem pode vê-la.</p><button class="button" data-skin-action="demo-login">Entrar na conta</button>`,
      );
      return;
    }
    upload = existing
      ? { ...existing }
      : {
          id: "upload-preview",
          creationKey: crypto.randomUUID(),
          visibility: "private",
          creatorMode: "unspecified",
          image: "",
          name: "",
          model: "classic",
          ...prepared,
        };
    openDialog(
      `<h2 id="dialog-title">${existing ? "Editar publicação" : "Salve sua skin."}</h2><p>${imported ? "Confira sua skin e escolha quem pode vê-la. Ela fica privada por padrão." : prepared ? "Dê um nome à sua criação e confira os créditos antes de publicar." : "Envie o arquivo original. Você verá o personagem antes de publicar."}</p><form id="skin-upload-form" novalidate>${prepared ? "" : `<label class="skin-upload-target">${icon("upload")}<strong data-skin-file-label>Escolher PNG da skin</strong><span>64 × 64 ou 64 × 32 px · até 1 MB</span><input type="file" accept="image/png" id="skin-file" aria-label="Enviar arquivo PNG de skin"></label>`}<div class="skin-upload-preview" ${upload.image ? "" : "hidden"}><canvas class="skin-thumb" width="128" height="160" data-skin-texture="${upload.id}" role="img" aria-label="Prévia da skin enviada"></canvas></div><label class="field"><span>${upload.kind==="part"?"Nome da peça":"Nome da skin"}</span><input name="skinName" maxlength="70" value="${esc(upload.name)}" required></label><label class="field"><span>Modelo</span><select name="skinVariant"><option value="classic" ${upload.model === "classic" ? "selected" : ""}>Clássico · braços largos</option><option value="slim" ${upload.model === "slim" ? "selected" : ""}>Slim · braços finos</option></select><small>Escolha o modelo para o qual o arquivo foi criado.</small></label><label class="field"><span>Tags (opcional)</span><input name="skinTags" maxlength="125" placeholder="Ex.: aventureiro, azul, medieval" value="${esc(upload.tags?.join(", ") || "")}"><small>Até 5 tags, separadas por vírgulas.</small></label>${upload.componentCredits?.length ? `<div class="skin-editor-credits"><strong>Créditos preservados</strong><ul>${upload.componentCredits.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></div>` : ""}<label class="field"><span>Quem criou esta skin?</span><select name="skinCreatorMode" aria-label="Quem criou esta skin?" required><option value="" disabled ${!["unspecified", "self", "credited"].includes(upload.creatorMode) ? "selected" : ""}>Escolher autoria</option><option value="unspecified" ${upload.creatorMode==="unspecified"?"selected":""}>Autoria não informada · só para guardar em privado</option><option value="self" ${upload.creatorMode === "self" ? "selected" : ""}>${upload.componentCredits?.length ? "Eu criei esta composição · manter créditos originais" : "Eu criei esta skin"}</option><option value="credited" ${upload.creatorMode === "credited" ? "selected" : ""}>Outra pessoa · tenho permissão para publicar</option></select></label><div class="skin-credit-fields" ${upload.creatorMode === "credited" ? "" : "hidden"}><label class="field"><span>Nome do criador</span><input name="skinCreatorName" maxlength="70" value="${esc(upload.creatorName || "")}" aria-label="Nome do criador"></label><label class="field"><span>Link da origem (opcional)</span><input name="skinSourceUrl" type="url" maxlength="2048" placeholder="https://" value="${esc(upload.sourceUrl || "")}" aria-label="Link da origem (opcional)"><small>O crédito acompanha a publicação e aparece no detalhe.</small></label></div><label class="field"><span>Quem pode ver?</span><select name="skinVisibility"><option value="private" ${upload.visibility==="private"?"selected":""}>Só eu</option><option value="unlisted" ${upload.visibility==="unlisted"?"selected":""}>Público, apenas pelo link</option><option value="listed" ${upload.visibility==="listed"?"selected":""}>Público, no perfil e no catálogo</option></select><small>Importar ou salvar não publica sem sua escolha.</small></label><label class="check-label skin-rights"><input name="skinRights" type="checkbox" ${existing ? "checked" : ""}>Posso guardar esta skin e, se escolher compartilhá-la, tenho permissão para isso.</label><div class="invalid-box" data-skin-error role="alert" hidden></div><p class="field-help">Salvar a criação não troca sua skin no Minecraft.</p><div class="dialog-actions"><button type="button" class="button secondary" data-action="close-dialog">Cancelar</button><button class="button" type="submit">${existing ? "Salvar publicação" : "Salvar na conta"} ${icon("arrow-right")}</button></div></form>`,
      "skin-upload",
    );
    const slimOption = dialog.querySelector('option[value="slim"]');
    if (slimOption) slimOption.disabled = upload.height === 32;
    drawThumbs();
  }
  async function importFromMinecraft() {
    if (!getUser()) { signIn(); return; }
    const identity = getUser().id;
    openDialog(`<h2 id="dialog-title">Importar do Minecraft</h2><p>Copie sua skin atual do Minecraft Java para a sua coleção.</p><div data-minecraft-import aria-live="polite">Buscando suas conexões…</div><div class="dialog-actions"><button type="button" class="button secondary" data-action="close-dialog">Cancelar</button></div>`);
    const content = dialog.querySelector('[data-minecraft-import]');
    try {
      const result = await remote.accounts();
      if (!dialog.open || !content.isConnected || identity !== getUser()?.id) return;
      const accounts = result.configured ? result.rows.filter(row => row.usable !== false) : [];
      content.innerHTML = accounts.length
        ? `<label class="field"><span>Conta Minecraft Java</span><select data-import-account>${accounts.map(row => `<option value="${esc(row.id)}">${esc(row.name)}</option>`).join('')}</select></label><button class="button" data-skin-action="load-minecraft-skin">Ver skin ${icon('arrow-right')}</button><p data-import-error role="alert" hidden></p>`
        : '<p>Você precisa de uma conta Minecraft Java conectada para importar a skin atual.</p><button class="button" data-skin-action="connect-java">Gerenciar conexões Minecraft</button>';
      paintIcons(dialog);
    } catch (error) {
      if (!dialog.open || !content.isConnected || identity !== getUser()?.id) return;
      content.innerHTML = `<p role="alert">${esc(error.message)}</p><button class="button secondary" data-skin-action="import-minecraft">Tentar novamente</button>`;
    }
  }
  async function loadMinecraftSkin(button) {
    if (!getUser() || button.disabled) return;
    const identity = getUser().id;
    const select = dialog.querySelector('[data-import-account]');
    const errorMessage = dialog.querySelector('[data-import-error]');
    if (!select?.value) return;
    button.disabled = select.disabled = true;
    button.textContent = 'Buscando sua skin…';
    errorMessage.hidden = true;
    try {
      const skin = await remote.current(select.value);
      if (!dialog.open || !button.isConnected || identity !== getUser()?.id) return;
      uploadDialog(null, { ...skin, visibility: 'private', creatorMode: 'unspecified' }, { imported: true });
    } catch (error) {
      if (!dialog.open || !button.isConnected || identity !== getUser()?.id) return;
      errorMessage.textContent = error.message;
      errorMessage.hidden = false;
    } finally {
      if (button.isConnected) {
        button.disabled = select.disabled = false;
        button.textContent = 'Ver skin';
      }
    }
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
      const originalPNG = await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('Não foi possível ler o PNG.'));reader.readAsDataURL(file);});
      if(epoch!==uploadEpoch||!dialog.querySelector('#skin-upload-form'))return;upload.image=originalPNG;
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
            : "Salvar na conta";
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
      `<div class="skin-detail"><div class="skin-viewer-stage"><canvas id="skin-viewer" role="img" aria-label="Prévia 3D de ${esc(skin.name)}. Use os botões para girar."></canvas><div class="skin-viewer-status" role="status">Carregando personagem…</div><div class="skin-viewer-controls"><button class="icon-button" data-skin-action="rotate-left" aria-label="Girar personagem para a esquerda">${icon("chevron-right")}</button><button class="icon-button" data-skin-action="motion" aria-label="Animar personagem" aria-pressed="false">${icon("users")}</button><button class="icon-button" data-skin-action="rotate-right" aria-label="Girar personagem para a direita">${icon("chevron-right")}</button></div></div><div class="skin-detail-copy"><h2 id="dialog-title">${esc(skin.name)}</h2><p>${skin.base ? "Modelo base da Mojang Studios" : `Por <a href="${profileLink(skin)}">${esc(skin.publisherName)}</a>`}</p>${!skin.base ? `<p class="skin-credit">${credit(skin)}${skin.sourceUrl ? `<br><a href="${esc(skin.sourceUrl)}" target="_blank" rel="noopener noreferrer ugc">Ver origem ${icon("external-link")}</a>` : ""}</p>` : ""}${skin.componentCredits?.length ? `<details class="skin-component-credits"><summary>Créditos da composição</summary><ul>${skin.componentCredits.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></details>` : ""}<span class="tag">${modelName(skin)}</span><div class="skin-detail-tags">${skin.tags.map((t) => `<span>#${esc(t)}</span>`).join("")}</div><button class="button full" data-skin-action="apply">Usar no Minecraft ${icon("arrow-right")}</button><button class="button secondary full" data-skin-action="customize">${icon("brush")} Personalizar no editor</button><button class="button secondary full" data-skin-action="download">Baixar PNG ${icon("arrow-down")}</button>${!skin.base&&skin.visibility!=="private"?`<button class="text-link" data-skin-action="share">${icon("arrow-right")} Copiar link</button>`:""}<button class="text-link" data-skin-action="favorite" data-id="${skin.id}">${icon("heart")} ${data.favorites.has(skin.id) ? "Remover das salvas" : "Salvar na coleção"}</button>${ownEntry(skin) && account() ? '<div class="skin-manage"><button class="text-link" data-skin-action="edit">Editar publicação</button><button class="text-link danger" data-skin-action="remove">Excluir criação</button></div>' : ""}<small>${skin.base ? "Modelo disponibilizado pela Mojang para personalização. Não é uma criação da Força Aliada." : (skin.visibility==="private"?"Privada · só você pode ver.":skin.visibility==="unlisted"?"Pública apenas pelo link.":"Pública no perfil e no catálogo.")}</small>${!skin.base && skin.visibility !== "private" && !ownEntry(skin) ? '<button class="text-link" data-skin-action="report">Denunciar skin</button>' : ""}</div></div>`,
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
  async function applyFlow(){
    disposeDetail();
    const skin=selected,identity=String(getUser()?.id||'');
    openDialog(`<h2 id="dialog-title">Usar ${esc(skin.name)} no Minecraft</h2><p>Carregando suas contas Java…</p><div data-apply-options role="status"></div>`,'skin-apply');
    try{
      const result=account()?await remote.accounts():{configured:false,rows:[]};
      const target=dialog.querySelector('[data-apply-options]');if(!target||selected!==skin||identity!==String(getUser()?.id||''))return;
      const usable=result.rows.filter(row=>row.usable!==false);
      target.innerHTML=`<section><h3>Minecraft Java</h3>${result.configured&&usable.length&&!skin.base?`<label class="field"><span>Conta que receberá a skin</span><select id="skin-java-account">${usable.map(row=>`<option value="${esc(row.id)}">${esc(row.name)}</option>`).join('')}</select></label><p>${modelName(skin)}. A troca só acontece ao confirmar abaixo.</p><button class="button" data-skin-action="apply-confirm">Confirmar troca nesta conta</button>`:`<p>${!account()?'Entre com sua conta para consultar as conexões Java.':skin.base?'Para aplicar esse modelo, baixe o PNG e use o perfil oficial do Minecraft.':!result.configured?'A conexão Microsoft está em configuração. Você já pode usar o PNG no jogo.':'Conecte uma conta com Minecraft Java para aplicar sua criação.'}</p><a class="text-link" href="https://www.minecraft.net/msaprofile/mygames/editskin" target="_blank" rel="noopener">Abrir o perfil oficial do Minecraft ${icon('external-link')}</a>`}${account()?'<p><button class="text-link" data-skin-action="connect-java">Gerenciar conexões Minecraft</button></p>':'<p><button class="text-link" data-skin-action="demo-login">Entrar na conta</button></p>'}</section><section><h3>Minecraft Bedrock</h3><p>Baixe o PNG e importe nas plataformas compatíveis. A troca Java não altera a skin do Bedrock.</p></section><button class="button secondary full" data-skin-action="download">Baixar PNG ${icon('arrow-down')}</button><div data-skin-error class="invalid-box" role="alert" hidden></div>`;
    }catch(error){const target=dialog.querySelector('[data-apply-options]');if(target)target.textContent=error.message;}
  }
  document.addEventListener("input", (e) => {
    if (e.target.id === "skin-search") {
      query = e.target.value;
      results();scheduleReload();
    }
  });
  document.addEventListener("change", (e) => {
    if (e.target.id === "skin-model") {
      model = e.target.value;
      results();void reload();
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
  document.addEventListener("submit", async (e) => {
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
    if (creditError && !(f.get("skinVisibility")==="private"&&attribution.creatorMode==="unspecified")) {
      formError(creditError);
      return;
    }
    if (!f.get("skinRights")) {
      formError("Confirme que pode guardar a skin e respeitar a visibilidade escolhida.");
      return;
    }
    const entry = safeSkin({
      ...upload,
      ...attribution,
      id: upload.owner ? upload.id : crypto.randomUUID(),
      name: f.get("skinName"),
      model: f.get("skinVariant"),
      tags: skinTags(f.get("skinTags")),
      visibility: f.get("skinVisibility"),
    });
    if (!entry) {
      formError(
        "Não foi possível validar a skin. Tente enviar o PNG novamente.",
      );
      return;
    }
    const identity=String(getUser()?.id||'');uploadBusy=true;const form=e.target,buttons=[...form.querySelectorAll('button,input,select')];buttons.forEach(button=>button.disabled=true);
    try{
      const result=await remote.save({...entry,id:upload.id,revision:upload.revision,creationKey:upload.creationKey,creatorMode:attribution.creatorMode,rightsAccepted:true,category:upload.category||'',type:upload.type||'',visibility:f.get('skinVisibility')},upload.kind||'skin');
      if(identity!==String(getUser()?.id||''))return;
      if(form.isConnected&&dialog.open){closeDialog();location.hash='/minhas-skins';if(profile)render(true);}
      toast(result.kind==='part'?(result.visibility==='private'?'Peça salva só para você.':'Peça publicada com seus créditos.'):(result.visibility==='private'?'Skin salva só para você.':'Skin publicada com seus créditos.'));
    }catch(error){if(form.isConnected)formError(error.message);}finally{uploadBusy=false;buttons.forEach(button=>{if(button.isConnected)button.disabled=false;});}
  });
  document.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-skin-action]");
    if (!b) return;
    const action = b.dataset.skinAction,
      s = all().find((s) => s.id === b.dataset.id);
    if(action==='edit-part'&&profileParts.has(b.dataset.id)){uploadDialog(fromServer(profileParts.get(b.dataset.id)));}
    else if(action==='remove-part'&&profileParts.has(b.dataset.id)){
      selected=fromServer(profileParts.get(b.dataset.id));openDialog(`<h2 id="dialog-title">Excluir ${esc(selected.name)}?</h2><p>A peça será removida da conta e do catálogo.</p><div class="dialog-actions"><button class="button secondary" data-action="close-dialog">Cancelar</button><button class="button" data-skin-action="remove-confirm">Excluir peça</button></div>`);
    }else if (action === "open" && s) detail(s);
    else if (action === "report" && selected) report(selected);
    else if (action === "upload") uploadDialog();
    else if (action === "import-minecraft") await importFromMinecraft();
    else if (action === "load-minecraft-skin") await loadMinecraftSkin(b);
    else if (action === "customize" && selected) editSkin(selected);
    else if (action === "edit" && ownEntry(selected) && account())
      uploadDialog(selected);
    else if (action === "clear") {
      query = "";
      model = "";
      savedOnly = false;
      render(profile,publicAuthor);
    } else if (action === "retry")void reload();
    else if(action === "more")void reload({more:true});
    else if (action === "saved") {
      savedOnly = !savedOnly;
      b.setAttribute("aria-pressed", String(savedOnly));
      void reload();
    } else if (action === "favorite" && (s || selected)) {
      ++favoriteVersion;const target=s||selected,on=!data.favorites.has(target.id);
      try{if(!target.base){if(!account()){signIn();return;}await remote.favorite(target.id,on);}
        on?data.favorites.add(target.id):data.favorites.delete(target.id);save();if(main.querySelector('#skin-results'))results();
        if(dialog.querySelector('.skin-detail')){b.textContent=on?'Remover das salvas':'Salvar na coleção';}
      }catch(error){toast(error.message);}
    } else if(action==='share'&&selected){const url=new URL(location.href);url.hash='/skins/'+selected.id;try{await navigator.clipboard.writeText(url.href);toast('Link da skin copiado.');}catch{openDialog(`<h2 id="dialog-title">Link da skin</h2><p>Selecione e copie o endereço abaixo.</p><div class="address-field"><code>${esc(url.href)}</code></div><button class="button" data-action="close-dialog">Concluir</button>`);}
    } else if (action === "download" && selected) {
      const a = document.createElement("a");
      a.href = selected.image;
      a.download = selected.name.replace(/[^\p{L}\p{N}_-]/gu, "-") + ".png";
      document.body.append(a);
      a.click();
      a.remove();
      toast("PNG preparado para download.");
    } else if(action==='connect-java')manageConnections();
    else if (action === "apply") applyFlow();
    else if(action==='apply-confirm'){
      const entry=selected,identity=String(getUser()?.id||'');if(!entry||!identity)return;
      const value=dialog.querySelector('#skin-java-account')?.value;b.disabled=true;b.textContent='Aplicando…';
      try{const result=await remote.apply(entry,value);if(identity!==String(getUser()?.id||''))return;openDialog(`<h2 id="dialog-title">Skin aplicada.</h2><p>A troca foi confirmada para ${esc(result.account)}. Entre novamente no servidor para atualizar o personagem.</p><button class="button" data-skin-action="back-detail">Voltar à skin</button>`);}
      catch(error){formError(error.message);if(b.isConnected){b.disabled=false;b.textContent='Tentar novamente';}}
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
    } else if (action === "remove" && ownEntry(selected) && account()) {
      disposeDetail();
      openDialog(
        `<h2 id="dialog-title">Excluir ${esc(selected.name)} desta prévia?</h2><p>Ela sairá do perfil e do catálogo da plataforma. O arquivo original no seu computador não será alterado.</p><div class="dialog-actions"><button class="button secondary" data-skin-action="back-detail">Manter skin</button><button class="button" data-skin-action="remove-confirm">Excluir criação</button></div>`,
      );
    } else if (
      action === "remove-confirm" &&
      ownEntry(selected) &&
      account()
    ) {
      b.disabled=true;try{await remote.remove(selected);data.favorites.delete(selected.id);save();closeDialog();render(profile,publicAuthor);toast('Criação removida da conta.');}catch(error){b.disabled=false;toast(error.message);}
    } else if(action==='demo-login'){if(dialog.open)closeDialog();signIn();}
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
    async open(id){try{detail(fromServer(await remote.get(id)));}catch(error){toast(error.message);}},
    accountChanged(){const next=String(getUser()?.id||'');if(next===userKey)return;userKey=next;if(!next){savedOnly=false;data.favorites=new Set([...data.favorites].filter(id=>id.startsWith('base-')));}
      const version=favoriteVersion;if(dialog.querySelector('#skin-upload-form,.skin-detail,[data-minecraft-import]'))closeDialog();remoteRows=[];selected=null;++loadVersion;if(main.querySelector('.skins-heading')||location.hash==='#/minhas-skins')render(profile,publicAuthor);if(next)void remote.favoriteIds().then(result=>{if(userKey!==next||version!==favoriteVersion)return;data.favorites=new Set([...data.favorites].filter(id=>id.startsWith('base-')).concat(result.ids));if(main.querySelector('#skin-results'))results();}).catch(()=>{});},
    publishFromEditor: (skin) => uploadDialog(null, skin),
  };
}
