import {createDirectoryClient,createDraftWriter} from './directory-client.mjs?v=reviews-20261113';
import {createPublicCatalog} from './directory-catalog.mjs';
import {createForcaAliadaLogin} from './forca-aliada-login.mjs?v=account-20261113';

// Persistence adapter for the existing prototype. Rendering stays in app.mjs:
// this module uses its original wizard, page editor, account and dialog styles.
export function connectDirectory(ui){
  const key='fa_directory_beta_token';
  const api=createDirectoryClient({origin:'https://forca-aliada-minecraft-beta.onrender.com',readToken:()=>sessionStorage.getItem(key)||''});
  const centralLogin=createForcaAliadaLogin({api});
  let centralEnabled=false,linkAvailable=false;
  let accountStatusVersion=0,accountStatusLoaded=false,accountStatusRequest;
  async function refreshAccountStatus(){
    const version=++accountStatusVersion;
    accountStatusRequest=api.accountStatus().then(status=>{
      if(version===accountStatusVersion){
        centralEnabled=status.enabled===true;
        linkAvailable=status.canLink===true;
        ui.updateHeader();
      }
    }).catch(()=>{}).finally(()=>{if(version===accountStatusVersion)accountStatusLoaded=true;});
    return accountStatusRequest;
  }
  let me=null,record=null,timer,busy=false,ready=false,status='',error=null,creationKey=null,lastQueued='',pendingSnapshot=null,setupComplete=false,imageStatus='';
  const lockedControls=new Map();
  const publicPages=new Map(),loadingPages=new Set();
  let reviewRequest=0,reviewing=null,continueAfterLogin=false;const reviewNotes=new Map();
  function remember(value){ui.addPublic(value);publicPages.set(value.id,{status:'ready',checkedAt:Date.now()});}
  const catalog=createPublicCatalog({client:api,remember,onChange:()=>ui.catalogChanged()});
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
  function login({continueCreation=false}={}){
    continueAfterLogin=continueCreation;
    if(!accountStatusLoaded){
      ui.openDialog('<h2 id="dialog-title">Entrar na prévia</h2><p data-account-login-loading role="status">Consultando as opções de acesso…</p><button class="text-link" type="button" data-directory="test-login">Usar um acesso de teste</button>');
      void (accountStatusRequest||refreshAccountStatus()).then(()=>{
        if(document.querySelector('#dialog[open] [data-account-login-loading]'))login({continueCreation});
      });
      return;
    }
    if(centralEnabled){
      ui.openDialog(`<h2 id="dialog-title">Entre com sua conta Força Aliada</h2><p>Use o mesmo acesso do Manager e do Community para continuar.</p><div class="dialog-actions"><button class="button" type="button" data-directory="central-login">Continuar com Força Aliada ${ui.icon('arrow-right')}</button></div><div data-directory-error class="invalid-box" role="alert" hidden></div><button class="text-link" type="button" data-directory="test-login">Usar um acesso de teste</button>`);
      return;
    }
    testLogin();
  }
  function testLogin(){
    ui.openDialog(`<h2 id="dialog-title">${continueAfterLogin?'Entre para criar sua página.':'Entre na sua conta de teste.'}</h2><p>Use o acesso fornecido para esta prévia.</p><form id="directory-login"><label class="field"><span>Usuário de teste</span><input name="login" autocomplete="username" required></label><label class="field"><span>Senha</span><input name="password" type="password" autocomplete="current-password" required></label><div data-directory-error class="invalid-box" role="alert" hidden></div><button class="button" type="submit">Entrar ${ui.icon('arrow-right')}</button></form>`);
  }
  async function start(){
    if(!ready)return ui.toast('Consultando sua conta. Tente novamente em instantes.');
    if(!me)return login({continueCreation:true});
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
  function changedSincePublication(){
    if(!record?.published)return true;
    const content=value=>{const {wizardStep,wizardMaxStep,setupComplete,...rest}=value;return rest;};
    return JSON.stringify(content(record.draft))!==JSON.stringify(content(record.published));
  }
  function publicationAction(){return record?.state==='pending'?'Acompanhar revisão':record?.state==='suspended'?'Página suspensa':record?.published&&!changedSincePublication()?'Ver publicação':'Enviar para revisão';}
  function verification(){
    const pending=record.state==='pending',suspended=record.state==='suspended',changed=changedSincePublication();
    const canSubmit=!pending&&!suspended&&changed;
    const title=suspended?'Página suspensa.':pending?'Página enviada para revisão.':record.published&&!changed?'Sua página está publicada.':record.state==='rejected'?'Sua página precisa de ajustes.':'Publique a página do seu servidor.';
    const intro=suspended?'Confira a orientação da equipe antes de continuar.':pending?'A equipe vai conferir esta versão. A publicação anterior continua disponível, se houver.':record.published&&!changed?'Compartilhe o link ou continue editando. As próximas alterações só ficam públicas depois de uma nova revisão.':'Confirme o controle do endereço e envie a apresentação para revisão.';
    ui.openDialog(`<h2 id="dialog-title">${title}</h2><p>${intro}</p><div class="notice"><strong>${ui.esc(record.draft.name)}</strong><br>${ui.esc(record.draft.address)} · ${ui.esc(stateNames[record.state])}</div>${record.reviewNote?`<p><strong>Orientação da equipe</strong><br>${ui.esc(record.reviewNote)}</p>`:''}${canSubmit?(record.verified?'<p>Controle do endereço confirmado.</p>':`<p>Adicione o código temporário ao MOTD, a descrição exibida na lista de servidores do Minecraft. Você pode removê-lo depois da confirmação. A consulta pode levar cerca de um minuto para refletir a mudança.</p>${claim?`<div class="address-field"><code>${ui.esc(claim.token)}</code><button class="text-link" data-directory="copy-claim">Copiar</button></div><p class="field-help">Válido até ${new Date(claim.expiresAt).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}.</p><button class="button" data-directory="verify">Verificar código</button><button class="text-link" data-directory="claim">Gerar outro código</button>`:'<button class="button secondary" data-directory="claim">Gerar código de verificação</button>'}`):''}<div data-directory-error class="invalid-box" role="alert" hidden></div><div class="dialog-actions">${record.verified&&canSubmit?'<button class="button" data-directory="submit">Enviar para revisão</button>':''}<button class="button secondary" data-action="close-dialog">Continuar editando</button>${record.published?`<a class="button" href="#/servidor/${record.id}" data-close-dialog>Abrir página publicada ${ui.icon('arrow-right')}</a><button class="text-link" data-directory="share">Copiar link</button>`:''}</div>`);
  }
  async function publish(){
    if(!record||busy)return;busy=true;
    try{
      schedule();await flush();const current=await api.draft(record.id);
      if(current.revision!==record.revision)throw Object.assign(new Error('Esta página mudou em outra aba. Reabra a versão salva.'),{code:'DRAFT_CONFLICT'});
      record=current;writer.use(current);state.publication=current.published?{...ui.safeDraft(current.published),id:'minha-pagina',example:false}:null;
      ui.refreshOwner();verification();
    }catch(e){report(e);}finally{busy=false;}
  }
  function lock(value){
    if(value){(document.querySelector('.directory-review-decision')||document.querySelector('#dialog-content'))?.querySelectorAll('button,input,select,textarea').forEach(el=>{if(!lockedControls.has(el))lockedControls.set(el,el.disabled);el.disabled=true;});}
    else{for(const [el,disabled] of lockedControls)if(el.isConnected)el.disabled=disabled;lockedControls.clear();}
  }
  function showError(e){const el=document.querySelector('[data-directory-error]');if(el){el.hidden=false;el.textContent=e.message;}}
  function reviewError(error){
    ui.renderSurface(`<section class="container empty"><h1>${error.status===403?'Área da equipe':'Não foi possível abrir a revisão'}</h1><p>${ui.esc(error.message)}</p><a class="button secondary" href="#/">Voltar aos servidores</a>${[401,403].includes(error.status)?(!me?'<button class="button" data-directory="login">Entrar</button>':''):'<button class="button" data-directory="retry-review">Tentar novamente</button>'}</section>`);
  }
  async function reviewRoute(id=''){
    const request=++reviewRequest;reviewing=null;
    if(id&&!/^[a-f0-9-]{36}$/i.test(id))return reviewError(Object.assign(new Error('Página de revisão não encontrada.'),{status:404}));
    ui.renderSurface('<section class="container empty" role="status"><p>Carregando revisão…</p></section>');
    if(!ready)return;
    if(!['owner','full'].includes(me?.role))return reviewError(Object.assign(new Error('Entre com uma conta da equipe para revisar páginas.'),{status:me?403:401}));
    const expected=id?'#/revisoes/'+id:'#/revisoes';
    try{
      if(!id){
        const {rows}=await api.moderation();if(request!==reviewRequest||location.hash!==expected)return;
        ui.renderSurface(`<section class="container server-section directory-review-queue"><div class="page-controls"><div><h1>Páginas para revisar</h1><p>Confira a página completa e suas imagens antes de decidir.</p><a class="text-link" href="#/revisoes/criacoes">Denúncias de skins e roupas</a></div><button class="text-link" data-directory="retry-review">${ui.icon('refresh')} Atualizar</button></div>${rows.length?`<div class="module-list">${rows.map(row=>`<a class="button secondary" href="#/revisoes/${row.id}"><span>${ui.esc(row.name)}<small>${ui.esc(row.address)} · Versão ${row.revision}</small></span>${ui.icon('arrow-right')}</a>`).join('')}</div>`:'<div class="empty"><h2>Tudo em dia.</h2><p>Nenhuma página aguardando revisão.</p><a class="text-link" href="#/">Explorar servidores</a></div>'}</section>`);return;
      }
      const result=await api.reviewPage(id);if(request!==reviewRequest||location.hash!==expected)return;reviewing=result;
      const note=reviewNotes.get(`${id}:${result.revision}`)||'';
      const top=`<div class="owner-bar"><div><strong>Revisão da página · Versão ${result.revision}</strong><span>Esta é a apresentação exata enviada pelo criador.</span></div><a class="button secondary small" href="#/revisoes">${ui.icon('arrow-left')} Voltar à fila</a></div>`;
      const bottom=`<section class="container server-section directory-review-decision"><h2>Decisão da revisão</h2>${result.canReview?'':'<p class="notice">Outra pessoa da equipe precisa revisar sua página.</p>'}<label class="field"><span>Orientação para o criador</span><textarea id="directory-review-note" maxlength="1000" rows="3" ${result.canReview?'':'disabled'} placeholder="Obrigatória ao solicitar ajustes; opcional ao aprovar.">${ui.esc(note)}</textarea></label><div data-directory-error class="invalid-box" role="alert" hidden></div><div class="dialog-actions"><button class="button secondary" data-directory="reject" ${result.canReview?'':'disabled'}>Solicitar ajustes</button><button class="button" data-directory="approve" ${result.canReview?'':'disabled'}>Aprovar e publicar ${ui.icon('check')}</button></div></section>`;
      ui.renderReview(result.page,result.id,top,bottom);
    }catch(error){if(request===reviewRequest&&location.hash===expected)reviewError(error);}
  }
  async function loadPublic(id,{force=false}={}){
    if(loadingPages.has(id))return;
    const known=publicPages.get(id);if(!force&&known&&Date.now()-known.checkedAt<60_000)return;
    loadingPages.add(id);publicPages.set(id,{status:'loading',checkedAt:Date.now()});
    try{remember(await api.publicPage(id));}
    catch(error){publicPages.set(id,{status:error.status===404?'missing':'error',checkedAt:Date.now(),error});if(error.status===404)ui.removePublic(id);}
    finally{loadingPages.delete(id);if(location.hash.split('?')[0]==='#/servidor/'+id)ui.renderPage(id);else if(state.filters.favorites||state.filters.recent||ui.savedIds({recent:true}).includes(id))ui.catalogChanged();}
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
      const path=img.dataset.directoryMedia;img.dataset.directoryLoading='true';img.removeAttribute('data-directory-media');
      img.addEventListener('load',()=>{img.removeAttribute('data-directory-loading');},{once:true});
      img.addEventListener('error',()=>{img.removeAttribute('data-directory-loading');img.alt='Imagem indisponível.';},{once:true});
      try{const url=await mediaLink(path);if(img.isConnected)img.src=url;}catch{if(img.isConnected)img.alt='Imagem indisponível.';}
    }
  }
  new MutationObserver(()=>void hydrateMedia()).observe(document.body,{subtree:true,childList:true});
  document.addEventListener('submit',async event=>{
    if(event.target.id!=='directory-login')return;event.preventDefault();if(busy)return;
    const data=Object.fromEntries(new FormData(event.target));busy=true;lock(true);
    try{
      const response=await api.login(data);if(!response.token)throw new Error('Este acesso exige uma etapa adicional. Use a conta de teste fornecida.');
      mediaLinks.clear();sessionStorage.setItem(key,response.token);me=await api.me();state.account=true;const {rows}=await api.own();if(rows.length)accept(rows[0]);ui.updateHeader();ui.accountChanged();ui.closeDialog();busy=false;if(continueAfterLogin)await start();else ui.renderCurrent();continueAfterLogin=false;
      void refreshAccountStatus();
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
      if(action==='copy-claim'){await navigator.clipboard.writeText(claim.token);ui.toast('Código copiado.');}
      if(action==='share'){const link=new URL(location.href);link.hash='/servidor/'+record.id;await navigator.clipboard.writeText(link.href);ui.toast('Link da página copiado.');}
      if(action==='verify'){record=await api.verify(record.id,claim);writer.use(record);verification();}
      if(action==='submit'){record=await api.submit(record.id,record.revision);writer.use(record);verification();}
      if(action==='moderation')location.hash='/revisoes';
      if(action==='login'){busy=false;login();}
      if(action==='test-login')testLogin();
      if(action==='central-login'&&centralEnabled)await centralLogin.start({createPage:continueAfterLogin});
      if(action==='link-account'&&linkAvailable){
        await flush();
        ui.openDialog(`<h2 id="dialog-title">Vincular sua conta Força Aliada</h2><p>Você poderá entrar com sua conta Força Aliada e continuar usando as skins e páginas deste acesso de teste.</p><div class="dialog-actions"><button type="button" class="button" data-directory="confirm-link-account">Continuar para Força Aliada ${ui.icon('arrow-right')}</button><button type="button" class="button secondary" data-action="close-dialog">Cancelar</button></div><div data-directory-error class="invalid-box" role="alert" hidden></div>`);
      }
      if(action==='confirm-link-account'&&linkAvailable&&me)await centralLogin.start({linkUserId:me.id});
      if(action==='retry-review')await reviewRoute(location.hash.startsWith('#/revisoes/')?location.hash.slice(11):'');
      if(action==='retry-page')await loadPublic(button.dataset.id,{force:true});
      if(action==='retry-catalog')await catalog.retry();
      if(['approve','reject'].includes(action)&&reviewing){
        const note=document.querySelector('#directory-review-note').value.trim();
        if(action==='reject'&&!note)throw new Error('Explique os ajustes necessários para o criador.');
        const result=await api.review(reviewing.id,action,note,reviewing.revision);
        reviewNotes.delete(`${reviewing.id}:${reviewing.revision}`);reviewing=null;
        if(action==='approve')remember({...result.published,id:result.id,slug:result.slug});
        void catalog.sync(state.filters,{immediate:true,force:true});
        ui.toast(action==='approve'?'Página aprovada e publicada.':'Orientações enviadas ao criador.');location.hash='/revisoes';
      }
      if(action==='reload'&&confirm('Descartar as alterações não salvas desta tela e reabrir a versão da conta?')){clearTimeout(timer);pendingSnapshot=null;await writer.flush().catch(()=>{});accept(await api.draft(record.id),{wizard:true});ui.renderWizard();}
    }catch(e){showError(e);report(e);}finally{busy=false;lock(false);}
  });
  document.addEventListener('input',event=>{if(event.target.id==='directory-review-note'&&reviewing)reviewNotes.set(`${reviewing.id}:${reviewing.revision}`,event.target.value);});
  window.addEventListener('beforeunload',event=>{if(pendingSnapshot||writer.dirty||(record&&state.saving)){event.preventDefault();event.returnValue='';}});
  return {
    get me(){return me;},get canLinkAccount(){return Boolean(me&&linkAvailable);},get hasError(){return Boolean(error);},get record(){return record;},get ready(){return ready;},publicationAction,saveLabel,start,newDraft,finish,publish,login,schedule,
    publicState:id=>publicPages.get(id),loadPublic,reviewRoute,
    library:api.library,changeLibrary:api.changeLibrary,
    get catalog(){return catalog.state;},syncCatalog:filters=>{catalog.sync(filters);if(filters.favorites||filters.recent)for(const id of ui.savedIds(filters).filter(id=>/^[a-f0-9-]{36}$/i.test(id)))void loadPublic(id);},morePublic:()=>catalog.more(),
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
      mediaLinks.clear();sessionStorage.removeItem(key);me=null;record=null;state.account=false;state.created=false;state.wizard=null;state.publication=null;state.draft=ui.initialDraft();ui.cacheOnly();ui.updateHeader();ui.accountChanged();ui.renderCurrent();
      linkAvailable=false;void refreshAccountStatus();
    },
    async init(){
      const completed=await centralLogin.complete(location.hash,()=>api.me());
      if(completed?.token)sessionStorage.setItem(key,completed.token);
      try{
        if(sessionStorage.getItem(key)){
          me=await api.me();
          state.account=true;
          try{
            const {rows}=await api.own();
            if(rows.length)accept(rows[0]);
          }catch(e){report(e);}
        }else{
          state.account=false;
        }
      }
      catch(e){me=null;state.account=false;if(e.status===401)sessionStorage.removeItem(key);else ui.toast('Sua conta está temporariamente indisponível. Você pode continuar explorando.');}
      finally{ready=true;ui.updateHeader();ui.accountChanged();}
      if(completed){
        ui.renderCurrent();
        if(completed.error)ui.toast(completed.error);
        else if(completed.token&&me){ui.toast('Você entrou com sua conta Força Aliada.');if(completed.createPage)void start();}
      }
      void refreshAccountStatus();
      void catalog.sync(state.filters,{immediate:true});
      if(location.hash.startsWith('#/revisoes'))ui.renderCurrent();
      if(location.hash.startsWith('#/servidor/minha-pagina'))ui.renderPage('minha-pagina');
    },
  };
}
