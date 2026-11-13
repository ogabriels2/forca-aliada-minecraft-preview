import {createDirectoryClient,createDraftWriter} from './directory-client.mjs';

// Persistence adapter for the existing prototype. Rendering stays in app.mjs:
// this module uses its original wizard, page editor, account and dialog styles.
export function connectDirectory(ui){
  const key='fa_directory_beta_token';
  const api=createDirectoryClient({origin:'https://forca-aliada-minecraft-beta.onrender.com',readToken:()=>sessionStorage.getItem(key)||''});
  let me=null,record=null,timer,busy=false,ready=false,status='',error=null,creationKey=null,lastQueued='',pendingSnapshot=null,setupComplete=false,imageStatus='';
  const lockedControls=new Map();
  const failedPages=new Set(),loadingPages=new Set();
  const writer=createDraftWriter({client:api,onState:(value,problem)=>{status=value;error=problem||null;ui.updateSaveStatus();}});
  const state=ui.state;
  const stateNames={draft:'Rascunho',pending:'Em revisão',published:'Publicada',rejected:'Ajustes solicitados',suspended:'Suspensa'};
  function report(e){if(e.status===401){status='error';ui.toast('Sua sessão expirou. Entre novamente para salvar.');}else ui.toast(e.message||'Não foi possível concluir. Tente novamente.');}
  function accept(value,{wizard=false}={}){
    record=value;writer.use(value);lastQueued='';pendingSnapshot=null;error=null;status='saved';
    state.draft=ui.safeDraft(value.draft);state.draft.id='minha-pagina';state.draft.example=false;
    state.publication=value.published?{...ui.safeDraft(value.published),id:'minha-pagina',example:false}:null;
    setupComplete=value.draft.setupComplete===true;
    state.created=true;state.wizard=wizard?{draft:structuredClone(state.draft),step:value.draft.wizardStep||0,maxStep:value.draft.wizardMaxStep??value.draft.wizardStep??0}:null;
    state.account=Boolean(me);ui.updateHeader();ui.updateSaveStatus();
    // Only cache the account currently signed in. Do not import legacy demo
    // pages into another account or send them to the API automatically.
    ui.cacheOnly();
  }
  function payload(){
    const d=state.wizard?.draft||state.draft;
    return {...d,layout:d.layout==='spotlight'?'landscape':d.layout,wizardStep:state.wizard?.step??5,wizardMaxStep:state.wizard?.maxStep??record.draft.wizardMaxStep??5,setupComplete,
      avatar:d.avatar||'',cover:d.cover||'',gallery:d.gallery||[]};
  }
  function schedule(){
    if(!record||!me)return;
    const data=payload(),fingerprint=JSON.stringify(data);
    if(fingerprint===lastQueued)return;
    pendingSnapshot=data;status='saving';ui.updateSaveStatus();clearTimeout(timer);
    timer=setTimeout(()=>void flush().catch(report),900);
  }
  async function flush(){
    clearTimeout(timer);await writer.flush().catch(()=>{});
    if(!pendingSnapshot){if(error)throw error;return record;}
    if(error){
      if(error.code==='DRAFT_CONFLICT')throw error;
      const current=await api.draft(record.id);
      if(current.revision!==record.revision){error=Object.assign(new Error('Esta página mudou em outra aba. Reabra a versão da conta antes de continuar.'),{code:'DRAFT_CONFLICT'});status='conflict';ui.updateSaveStatus();throw error;}
      writer.use(current);error=null;
    }
    const snapshot=pendingSnapshot;pendingSnapshot=null;lastQueued=JSON.stringify(snapshot);
    const oldImages=[record.draft.cover,record.draft.avatar,...(record.draft.gallery||[])].filter(Boolean);
    try{
      record=await writer.save(snapshot);
      const nextImages=new Set([record.draft.cover,record.draft.avatar,...record.draft.gallery]);
      for(const path of new Set(oldImages))if(!nextImages.has(path))void api.removeMedia(path.split('/').at(-1)).catch(()=>{});
      return record;
    }
    catch(e){pendingSnapshot||=snapshot;error=e;throw e;}
  }
  function saveLabel(){
    if(!record)return '';
    if(imageStatus)return imageStatus;
    if(error?.code==='DRAFT_CONFLICT')return 'Outra aba alterou esta página. Reabra a versão salva.';
    if(error)return error.fields?.address?'Confira o endereço para salvar na conta.':error.message;
    if(status==='saving'||pendingSnapshot)return 'Salvando na sua conta…';
    return 'Rascunho salvo na sua conta';
  }
  function login(){
    ui.openDialog(`<h2 id="dialog-title">Entre para criar sua página.</h2><p>Por enquanto, use a conta de teste fornecida. Sua conta do site principal permanece separada neste ambiente.</p><form id="directory-login"><label class="field"><span>Usuário de teste</span><input name="login" autocomplete="username" required></label><label class="field"><span>Senha</span><input name="password" type="password" autocomplete="current-password" required></label><div data-directory-error class="invalid-box" role="alert" hidden></div><button class="button" type="submit">Entrar ${ui.icon('arrow-right')}</button></form>`);
  }
  async function start(){
    if(!ready)return ui.toast('Consultando sua conta. Tente novamente em instantes.');
    if(!me)return login();
    if(busy)return;busy=true;
    try{
      await flush();const {rows}=await api.own();
      if(!rows.length)return await newDraft();
      ui.openDialog(`<h2 id="dialog-title">Suas páginas</h2><p>Continue de onde parou ou crie a página de outro servidor.</p><div class="module-list">${rows.map(row=>`<div><button class="button secondary" data-directory="${row.draft.setupComplete?'open':'resume'}" data-id="${row.id}"><span>${ui.esc(row.draft.name||'Rascunho sem nome')}</span> · ${ui.esc(stateNames[row.state])} ${ui.icon('arrow-right')}</button>${row.draft.setupComplete?`<button class="text-link" data-directory="resume" data-id="${row.id}" aria-label="Reabrir assistente de ${ui.esc(row.draft.name)}">${ui.icon('pencil')} Assistente de criação</button>`:''}</div>`).join('')}</div><div class="dialog-actions"><button class="button" data-directory="new">Criar outra página ${ui.icon('plus')}</button></div>${error?'<button class="text-link" data-directory="reload">Reabrir versão salva na conta</button>':''}`);
    }catch(e){report(e);}finally{busy=false;}
  }
  async function newDraft(){
    creationKey||=crypto.randomUUID();const value=await api.create(creationKey);creationKey=null;
    accept(value,{wizard:true});ui.renderWizard();
  }
  async function finish(data){
    if(data)state.wizard.draft=data;
    if(busy)return;busy=true;lock(true);
    try{
      setupComplete=true;schedule();await flush();const d=structuredClone(state.wizard.draft);d.example=false;
      state.draft=d;state.created=true;state.wizard=null;state.guestPreview=false;state.editing=true;
      ui.cacheOnly();ui.closeDialog();location.hash='/servidor/minha-pagina';ui.renderPage('minha-pagina');
      ui.toast('Página salva na sua conta. Passe sobre os textos para editar.');
    }catch(e){report(e);showError(e);}finally{busy=false;lock(false);}
  }
  let claim=null;
  function verification(){
    ui.openDialog(`<h2 id="dialog-title">${record.state==='pending'?'Página enviada para revisão.':'Sua página está pronta para revisão.'}</h2><p>${record.state==='pending'?'A equipe vai conferir a apresentação antes da publicação.':'Confirme que você administra o servidor para publicar a página.'}</p><div class="notice"><strong>${ui.esc(record.draft.name)}</strong><br>${ui.esc(record.draft.address)} · ${ui.esc(stateNames[record.state])}</div>${record.reviewNote?`<p>${ui.esc(record.reviewNote)}</p>`:''}${record.verified?'<p>Controle do endereço confirmado.</p>':`<p>Adicione o código temporário ao MOTD, a descrição exibida na lista de servidores do Minecraft. Você pode removê-lo depois da confirmação.</p>${claim?`<div class="address-field"><code>${ui.esc(claim.token)}</code><button class="text-link" data-directory="copy-claim">Copiar</button></div><p class="field-help">Válido por 30 minutos.</p><button class="button" data-directory="verify">Verificar código</button><button class="text-link" data-directory="claim">Gerar outro código</button>`:'<button class="button secondary" data-directory="claim">Gerar código de verificação</button>'}`}<div data-directory-error class="invalid-box" role="alert" hidden></div><div class="dialog-actions">${record.verified&&record.state!=='pending'?'<button class="button" data-directory="submit">Enviar para revisão</button>':''}<button class="button secondary" data-action="close-dialog">Continuar editando</button>${record.published?`<a class="text-link" href="#/servidor/${record.id}" data-close-dialog>Abrir página publicada ${ui.icon('arrow-right')}</a>`:''}</div>`);
  }
  async function publish(){
    if(!record||busy)return;busy=true;
    try{schedule();await flush();verification();}catch(e){report(e);}finally{busy=false;}
  }
  function lock(value){
    if(value){document.querySelector('#dialog-content')?.querySelectorAll('button,input,select,textarea').forEach(el=>{if(!lockedControls.has(el))lockedControls.set(el,el.disabled);el.disabled=true;});}
    else{for(const [el,disabled] of lockedControls)if(el.isConnected)el.disabled=disabled;lockedControls.clear();}
  }
  function showError(e){const el=document.querySelector('[data-directory-error]');if(el){el.hidden=false;el.textContent=e.message;}}
  async function moderation(){
    if(!['owner','full'].includes(me?.role))return;
    const {rows}=await api.moderation();
    ui.openDialog(`<h2 id="dialog-title">Páginas para revisar</h2>${rows.length?rows.map(row=>`<section class="server-section"><h3>${ui.esc(row.draft.name)}</h3><p>${ui.esc(row.draft.address)}</p><p>${ui.esc(row.draft.summary)}</p><p>${ui.esc(row.draft.description)}</p><label class="field"><span>Observação para o criador</span><input data-review-note="${row.id}" maxlength="1000"></label><div class="dialog-actions"><button class="button secondary" data-directory="reject" data-id="${row.id}" data-revision="${row.revision}">Solicitar ajustes</button><button class="button" data-directory="approve" data-id="${row.id}" data-revision="${row.revision}">Aprovar</button></div></section>`).join(''):'<p>Nenhuma página aguardando revisão.</p>'}<div data-directory-error class="invalid-box" role="alert" hidden></div>`);
  }
  async function loadPublic(id){
    if(loadingPages.has(id)||failedPages.has(id))return;
    loadingPages.add(id);try{const d=await api.publicPage(id);ui.addPublic(d);}catch(e){failedPages.add(id);if(e.status!==404)report(e);}finally{loadingPages.delete(id);if(location.hash.split('?')[0]==='#/servidor/'+id)ui.renderPage(id);}
  }
  const mediaLinks=new Map();
  async function mediaLink(path){
    const cached=mediaLinks.get(path);
    if(cached&&cached.until>Date.now())return cached.promise;
    const entry={until:Date.now()+45_000,promise:null};
    entry.promise=api.mediaAccess(path).then(result=>result.url).catch(e=>{if(mediaLinks.get(path)===entry)mediaLinks.delete(path);throw e;});
    mediaLinks.set(path,entry);if(mediaLinks.size>200)mediaLinks.delete(mediaLinks.keys().next().value);
    return entry.promise;
  }
  async function hydrateMedia(){
    for(const img of document.querySelectorAll('img[data-directory-media]')){
      const path=img.dataset.directoryMedia;img.removeAttribute('data-directory-media');
      try{const url=await mediaLink(path);if(img.isConnected)img.src=url;}catch{if(img.isConnected)img.alt='Imagem indisponível.';}
    }
  }
  new MutationObserver(()=>void hydrateMedia()).observe(document.body,{subtree:true,childList:true});
  document.addEventListener('submit',async event=>{
    if(event.target.id!=='directory-login')return;event.preventDefault();if(busy)return;
    const data=Object.fromEntries(new FormData(event.target));busy=true;lock(true);
    try{
      const response=await api.login(data);if(!response.token)throw new Error('Este acesso exige uma etapa adicional. Use a conta de teste fornecida.');
      mediaLinks.clear();sessionStorage.setItem(key,response.token);me=await api.me();state.account=true;ui.updateHeader();ui.closeDialog();busy=false;await start();
    }catch(e){showError(new Error(e.status===401?'Usuário ou senha incorretos.':e.message));}finally{busy=false;lock(false);}
  });
  document.addEventListener('click',async event=>{
    const button=event.target.closest('[data-directory]');if(!button||busy)return;
    event.preventDefault();busy=true;lock(true);
    try{
      const action=button.dataset.directory;
      if(action==='new')await newDraft();
      if(action==='resume'){await flush();claim=null;accept(await api.draft(button.dataset.id),{wizard:true});ui.renderWizard();}
      if(action==='open'){await flush();claim=null;accept(await api.draft(button.dataset.id));ui.closeDialog();location.hash='/servidor/minha-pagina';ui.renderPage('minha-pagina');}
      if(action==='pages'){busy=false;await start();}
      if(action==='claim'){claim=await api.claim(record.id);verification();}
      if(action==='copy-claim')await navigator.clipboard.writeText(claim.token);
      if(action==='verify'){record=await api.verify(record.id,claim);writer.use(record);verification();}
      if(action==='submit'){record=await api.submit(record.id,record.revision);writer.use(record);verification();}
      if(action==='moderation')await moderation();
      if(['approve','reject'].includes(action)){await api.review(button.dataset.id,action,document.querySelector(`[data-review-note="${button.dataset.id}"]`).value,Number(button.dataset.revision));await moderation();}
      if(action==='reload'&&confirm('Descartar as alterações não salvas desta tela e reabrir a versão da conta?')){clearTimeout(timer);pendingSnapshot=null;await writer.flush().catch(()=>{});accept(await api.draft(record.id),{wizard:true});ui.renderWizard();}
    }catch(e){showError(e);report(e);}finally{busy=false;lock(false);}
  });
  window.addEventListener('beforeunload',event=>{if(pendingSnapshot||writer.dirty||(record&&state.saving)){event.preventDefault();event.returnValue='';}});
  return {
    get me(){return me;},get hasError(){return Boolean(error);},get record(){return record;},get ready(){return ready;},saveLabel,start,newDraft,finish,publish,login,schedule,
    publicFailed:id=>failedPages.has(id),loadPublic,
    async upload(input){
      const caps=await api.capabilities().catch(()=>({media:false}));
      if(!caps.media){ui.toast('O armazenamento de imagens ainda não foi conectado. Você pode continuar a página e adicionar as fotos depois.');input.value='';return;}
      const d=state.wizard?.draft||state.draft,target=input.dataset.upload,files=[...input.files];
      if(target==='gallery'&&d.gallery.length+files.length>6){ui.toast('A galeria aceita até seis imagens.');input.value='';return;}
      if(files.some(file=>!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>5*1024*1024)){ui.toast('Escolha PNG, JPG ou WebP com até 5 MB.');input.value='';return;}
      ui.setImageBusy(true);lock(true);
      try{
        for(const [index,file] of files.entries()){
          imageStatus=`Enviando imagem ${index+1} de ${files.length}…`;ui.updateSaveStatus();
          const media=await api.upload(file,target);if(target==='gallery')d.gallery.push(media.url);else d[target]=media.url;
          if(target==='gallery'&&!d.modules.includes('gallery'))d.modules.push('gallery');
          // Keep every successful image if a later file fails in this batch.
          ui.cacheOnly();schedule();await flush();
        }
      }catch(e){report(e);}finally{imageStatus='';input.value='';ui.setImageBusy(false);lock(false);ui.refreshMedia(target);ui.updateSaveStatus();}
    },
    async logout(){
      try{await flush();await api.logout();}catch(e){report(e);if(pendingSnapshot)return;}
      mediaLinks.clear();sessionStorage.removeItem(key);me=null;record=null;state.account=false;state.created=false;state.wizard=null;state.publication=null;state.draft=ui.initialDraft();ui.cacheOnly();ui.updateHeader();ui.renderCurrent();
    },
    async init(){
      try{me=await api.me();state.account=true;const {rows}=await api.own();if(rows.length)accept(rows[0]);}
      catch(e){state.account=false;if(e.status!==401)ui.toast('Sua conta está temporariamente indisponível. Você pode continuar explorando.');}
      finally{ready=true;ui.updateHeader();}
      try{const {rows}=await api.list({limit:48});for(const d of rows)ui.addPublic(d);if(rows.length&&['','#/'].includes(location.hash))ui.renderCurrent();}catch{}
      if(location.hash.startsWith('#/servidor/minha-pagina'))ui.renderPage('minha-pagina');
    },
  };
}
