import {createCreationsClient} from './creations-client.mjs?v=microsoft-20261113';
const key='fa-minecraft-microsoft-pending-v1';
const messages={MICROSOFT_CANCELLED:'A conexão foi cancelada. Suas skins continuam como estavam.',JAVA_REQUIRED:'Essa conta não informou um perfil Java. Para Bedrock, você pode usar o PNG.',MICROSOFT_PROVIDER_ERROR:'A Microsoft ou o Minecraft não concluíram a autorização. Tente novamente.',MICROSOFT_RECONNECT:'A autorização expirou. Conecte novamente.',MICROSOFT_REFRESH_REQUIRED:'A Microsoft não autorizou manter a conexão. Tente novamente.'};
const pending=()=>{try{const value=JSON.parse(sessionStorage.getItem(key)||'null');return value&&Date.now()-value.created<600000?value:null;}catch{return null;}};
const safeReturn=value=>/^#\/(skins(?:\/[a-zA-Z0-9_-]+)?|minhas-skins)(?:\?[^#]*)?$/.test(value||'')&&!value.startsWith('#/skins/conexoes')?value:'#/skins/editor';
export function createMinecraftConnections({main,getUser,signIn,esc,icon,paintIcons,toast,openDialog,closeDialog}){
 const remote=createCreationsClient();let version=0,lastUser='',info=null;
 const active=()=>location.hash.split('?')[0]==='#/skins/conexoes';
 const returnTo=()=>safeReturn(pending()?.returnTo||sessionStorage.getItem('fa-minecraft-connection-return'));
 function error(message){const el=main.querySelector('[data-connection-error]');if(el){el.hidden=false;el.textContent=message;}}
 function shell(body){main.innerHTML=`<section class="container server-section minecraft-connections"><div class="page-controls"><div><a class="text-link" href="${esc(returnTo())}">${icon('arrow-left')} Voltar</a><h1>Conexões do Minecraft</h1><p>Importe sua skin e escolha em qual conta Java aplicar suas criações.</p></div></div>${body}<div class="invalid-box" data-connection-error role="alert" hidden></div><p class="field-help">Conectar não publica sua skin e não altera seu personagem. A troca no jogo exige outra confirmação.</p></section>`;paintIcons();}
 function rememberReturn(){const value=location.hash;if(!value.startsWith('#/skins/conexoes'))sessionStorage.setItem('fa-minecraft-connection-return',safeReturn(value));location.hash='/skins/conexoes';}
 async function render(params=new URLSearchParams(location.hash.split('?')[1]||'')){
  const request=++version,user=getUser();info=null;
  if(!user){shell('<div class="empty"><h2>Entre para conectar sua conta.</h2><p>A conexão fica disponível apenas no seu perfil.</p><button class="button" data-connection-action="login">Entrar</button></div>');return;}
  const identity=String(user.id);shell('<p role="status">Consultando suas conexões…</p>');
  try{
   const result=await remote.accounts();if(request!==version||!active()||String(getUser()?.id)!==identity)return;info=result;
   let review='',needsConfirmation=false,flow=params.get('flow'),local=pending();
   if(flow){
    if(!local||local.id!==flow||String(local.user)!==identity)review='<div class="notice"><strong>Retome a conexão na aba em que começou.</strong><p>Se essa aba foi fechada, inicie uma nova autorização.</p></div>';
    else{
     const status=await remote.microsoftStatus(flow,local.proof);if(request!==version||!active())return;
     if(status.phase==='ready'){needsConfirmation=true;review=`<div class="notice connection-review"><h2>Conectar ${esc(status.profile.name)}?</h2><p>Confirme se este é o personagem que você quer usar com seu perfil.</p><div class="dialog-actions"><button class="button" data-connection-action="confirm">Conectar este personagem ${icon('check')}</button><button class="button secondary" data-connection-action="cancel">Cancelar</button></div></div>`;}
     else if(status.phase==='confirmed'){sessionStorage.removeItem(key);toast('Conta Java conectada.');history.replaceState(null,'','#/skins/conexoes');}
     else if(status.phase==='failed')review=`<div class="notice"><p>${esc(messages[status.errorCode]||'A autorização não foi concluída. Você pode tentar novamente.')}</p><button class="text-link" data-connection-action="cancel">Descartar esta tentativa</button></div>`;
     else review='<p role="status">A autorização está sendo concluída. <button class="text-link" data-connection-action="refresh">Atualizar</button></p>';
    }
   }else if(params.has('expired'))review='<div class="notice">Esta autorização expirou ou já foi usada. Comece uma nova conexão abaixo.</div>';
   if(needsConfirmation){shell(review);return;}
   const allowed=result.connectConfigured&&result.connectAllowed;
   shell(`${review}<div class="module-list">${result.rows.length?result.rows.map(row=>`<div class="connection-row"><span class="connection-character">${icon('user')}<span><strong>${esc(row.name)}</strong><small>Minecraft Java · ${row.usable===false?'Reconexão necessária':'Conectado'}</small></span></span>${row.canDisconnect?`<button class="text-link" data-connection-action="disconnect" data-id="${esc(row.id)}" data-name="${esc(row.name)}">Desconectar</button>`:'<a class="text-link" href="https://forcaaliada.com/account.html" target="_blank" rel="noopener">Gerenciar na conta</a>'}</div>`).join(''):'<div class="connection-row"><span>Nenhuma conta Java conectada ainda.</span></div>'}</div><div class="connection-create">${allowed?`<button class="button" data-connection-action="start">${icon('plus')} Conectar conta Microsoft</button>`:`<div class="notice"><strong>${result.connectConfigured?'Use um acesso individual para conectar seu Minecraft.':'Conexão Microsoft em configuração.'}</strong><p>${result.connectConfigured?'As contas de demonstração são compartilhadas. Por isso, elas não podem guardar suas conexões pessoais.':'Enquanto isso, você pode importar e baixar seu PNG normalmente.'}</p></div>`}<a class="button secondary" href="#/skins/editor">Continuar no editor ${icon('arrow-right')}</a></div>`);
  }catch(problem){if(request===version&&active()){shell('<button class="button secondary" data-connection-action="refresh">Tentar novamente</button>');error(problem.message);}}
 }
 document.addEventListener('click',async event=>{
  const button=event.target.closest('[data-connection-action]');if(!button)return;const action=button.dataset.connectionAction;
  if(action==='login'){signIn();return;}if(action==='refresh'){void render();return;}
  if(action==='disconnect'){
   openDialog(`<h2 id="dialog-title">Desconectar ${esc(button.dataset.name)}?</h2><p>Suas criações salvas e a skin atual no Minecraft continuam como estão. Para importar ou aplicar outra skin, será preciso conectar de novo.</p><button class="button" data-connection-action="confirm-disconnect" data-id="${esc(button.dataset.id)}">Desconectar conta</button><button class="button secondary" data-action="close-dialog">Manter conectada</button><div class="invalid-box" data-disconnect-error role="alert" hidden></div>`);return;
  }
  const identity=String(getUser()?.id||'');if(!identity){signIn();return;}button.disabled=true;
  try{
   if(action==='start'){
    if(!info?.connectConfigured||!info.connectAllowed)return;
    const bytes=crypto.getRandomValues(new Uint8Array(32)),proof=btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
    const started=await remote.microsoftStart(proof);if(identity!==String(getUser()?.id||'')||!active())return;
    const url=new URL(started.url);if(url.origin!=='https://login.microsoftonline.com'||url.pathname!=='/consumers/oauth2/v2.0/authorize')throw Error('O endereço de autorização não foi reconhecido.');
    sessionStorage.setItem(key,JSON.stringify({id:started.id,proof,user:identity,created:Date.now(),returnTo:returnTo()}));location.assign(url.href);return;
   }
   if(action==='confirm-disconnect'){await remote.microsoftDisconnect(button.dataset.id);if(identity!==String(getUser()?.id||''))return;closeDialog();toast('Conta desconectada.');void render();return;}
   const flow=pending();if(!flow||String(flow.user)!==identity)throw Error('Comece uma nova conexão nesta aba.');
   if(action==='confirm'){await remote.microsoftConfirm(flow.id,flow.proof);if(identity!==String(getUser()?.id||''))return;const destination=returnTo();sessionStorage.removeItem(key);toast('Conta Java conectada.');location.hash=destination.slice(1);}
   if(action==='cancel'){await remote.microsoftCancel(flow.id,flow.proof);sessionStorage.removeItem(key);history.replaceState(null,'','#/skins/conexoes');void render();}
  }catch(problem){const target=document.querySelector('[data-disconnect-error]');if(target&&action==='confirm-disconnect'){target.hidden=false;target.textContent=problem.message;}else error(problem.message);}
  finally{if(button.isConnected)button.disabled=false;}
 });
 return {render,open:rememberReturn,dispose(){++version;},accountChanged(){const next=String(getUser()?.id||'');if(lastUser&&lastUser!==next)sessionStorage.removeItem(key);lastUser=next;if(active())void render();}};
}
