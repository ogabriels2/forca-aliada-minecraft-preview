import {communityConnection as connection} from './community-connection.mjs?v=community-20261114';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=name=>`<i class="icon" aria-hidden="true" style="--icon:url('./vendor/tabler/${name}.svg')"></i>`;
const external='target="_blank" rel="noopener"';
const communityUrl='https://forcaaliada.com/community';
function siteLink(value){
  try{const url=new URL(value);return url.origin==='https://forcaaliada.com'?url.href:communityUrl;}catch{return communityUrl;}
}

export function createCommunityPanel(root,{close}){
  let query='',searchOpen=false,busy=false,feedback='';
  function row(person,suggested=false){
    const expired=Date.parse(connection.state.data?.expiresAt)<=Date.now();
    const presence=expired?'unknown':person.presence;
    const status=suggested?'Conheça no Community':presence==='online'?'Online':presence==='private'?'Atividade privada':presence==='offline'?'Offline':'Status indisponível';
    return `<a class="ps-person" ${suggested?'data-suggested':''} data-username="${esc(person.username)}" href="${esc(siteLink(person.href))}" ${external} aria-label="Ver perfil de ${esc(person.name)} no Community">
      <span class="ps-avatar ps-avatar--photo"><span aria-hidden="true">${esc([...person.name][0]?.toUpperCase()||'?')}</span>${person.avatar?`<img src="${esc(person.avatar)}" alt="" width="44" height="44" loading="lazy">`:''}</span>
      <span><strong>${esc(person.name)}</strong><small>${!suggested?`<span class="ps-status-dot ps-status-dot--${presence}" aria-hidden="true"></span>`:''}${status}</small></span>${suggested?icon('external-link'):''}</a>`;
  }
  function filter(){
    const normalize=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
    const term=normalize(query.trim());let count=0;
    for(const item of root.querySelectorAll('.ps-person')){item.hidden=!normalize(item.querySelector('strong').textContent+' '+item.dataset.username).includes(term);if(!item.hidden)count++;}
    const empty=root.querySelector('[data-social-search-empty]');if(empty)empty.hidden=!term||count>0;
    const caption=root.querySelector('.ps-list-caption');if(caption)caption.hidden=Boolean(term)&&![...root.querySelectorAll('[data-suggested]')].some(item=>!item.hidden);
  }
  function render(){
    const {phase,data,error,expired}=connection.state;
    const focused=document.activeElement,wasSearching=focused?.matches('.ps-friend-search input')&&root.contains(focused);
    const previouslyOpen=root.querySelector('.ps-connection-options')?.open;
    const activeAction=root.contains(focused)?focused.dataset.social:null;
    root.innerHTML=`<div class="ps-panel-heading"><strong>Amigos</strong>${phase==='connected'?`<button class="ps-icon-button" data-social="search" aria-label="Buscar amigos" aria-expanded="${searchOpen}">${icon('search')}</button>`:''}<button class="ps-icon-button" data-social="close" aria-label="Fechar Amigos">${icon('x')}</button></div><div class="ps-social-content"></div>`;
    const content=root.querySelector('.ps-social-content');
    if(phase==='loading'||phase==='disconnecting')content.innerHTML=`<p class="ps-connection-status" role="status">${phase==='loading'?'Carregando Community…':'Desconectando…'}</p>`;
    else if(phase==='connected'){
      content.innerHTML=`<label class="ps-friend-search" ${searchOpen?'':'hidden'}><span class="sr-only">Buscar amigos e sugestões</span>${icon('search')}<input type="search" placeholder="Buscar pessoas" autocomplete="off" value="${esc(query)}"></label><p data-social-search-empty class="ps-search-empty" hidden role="status">Nenhuma pessoa encontrada.</p>
      <div class="ps-friends-list">${data.friends.length?data.friends.map(p=>row(p)).join(''):'<p class="ps-connection-status">Seus amigos do Community aparecerão aqui.</p>'}</div>
      ${data.suggestions.length?`<div class="ps-list-caption">Sugestões para você</div>${data.suggestions.map(p=>row(p,true)).join('')}`:''}
      <a class="ps-community-link" href="https://forcaaliada.com/community" ${external}>Ver no Community ${icon('external-link')}</a>
      ${data.native?'':`<details class="ps-connection-options" ${previouslyOpen?'open':''}><summary>Conexão com o Community ${icon('chevron-down')}</summary><p>O status online indica atividade recente na Força Aliada.</p><button class="text-link" data-social="disconnect">Desconectar nesta sessão</button></details>`}`;
      filter();
    }else if(phase==='error')content.innerHTML=`<div class="ps-empty">${icon('alert-circle')}<h3>Vamos tentar de novo?</h3><p>${esc(error)}</p><button class="ps-primary" data-social="retry">Tentar novamente</button></div>`;
    else content.innerHTML=`<div class="ps-empty">${icon('users')}<h3>Seus amigos por perto</h3><p>${expired?'A conexão expirou. Conecte novamente para ver seus amigos e alertas.':'Veja seus amigos e notificações enquanto explora os servidores.'}</p>${connection.available===false?`<a class="ps-primary" href="${communityUrl}" ${external}>Abrir Community ${icon('external-link')}</a>`:`<button class="ps-primary" data-social="connect">Conectar Community ${icon('external-link')}</button>`}</div>`;
    if(feedback||error&&phase==='connected')content.insertAdjacentHTML('beforeend',`<p class="ps-connection-status" role="alert">${esc(feedback||error)}</p>`);
    if(wasSearching)root.querySelector('.ps-friend-search input')?.focus({preventScroll:true});
    else if(activeAction)(root.querySelector(`[data-social="${activeAction}"]`)||root.querySelector('[data-social="close"]'))?.focus({preventScroll:true});
  }
  root.addEventListener('error',event=>{if(event.target.matches('.ps-avatar img'))event.target.remove();},true);
  root.addEventListener('input',event=>{if(event.target.matches('.ps-friend-search input')){query=event.target.value;filter();}});
  root.addEventListener('click',async event=>{
    const action=event.target.closest('[data-social]')?.dataset.social;
    if(action==='close')return close();
    if(action==='search'){searchOpen=!searchOpen;if(!searchOpen)query='';render();if(searchOpen)root.querySelector('input')?.focus();return;}
    if(busy||!['connect','retry','disconnect'].includes(action))return;
    const button=event.target.closest('button');busy=true;button.disabled=true;feedback='';
    try{if(action==='connect')await connection.connect();if(action==='retry')await connection.refresh();if(action==='disconnect')await connection.disconnect();}
    catch(error){feedback=error.message;render();}
    finally{busy=false;if(button.isConnected)button.disabled=false;}
  });
  connection.subscribe(render);
  return {render};
}

let notificationRoot=null,notificationError='',reading=false,pagePending=false;
function renderNotifications(){
  if(!notificationRoot?.isConnected)return;
  const {phase,data}=connection.state,rows=data?.notifications||[],unread=Number(data?.unreadCount)||0;
  const opened=notificationRoot.querySelector('details')?.open;
  const position=notificationRoot.querySelector('.community-notification-list')?.scrollTop||0;
  const focus=notificationRoot.contains(document.activeElement)?document.activeElement:null;
  notificationRoot.innerHTML=`<details class="prototype-notifications community-notifications" ${opened?'open':''}>
    <summary aria-label="Notificações${unread?', '+unread+' não lidas':''}">${icon('bell')}${unread?`<span class="community-unread" aria-hidden="true">${unread>99?'99+':unread}</span>`:''}</summary>
    <div class="account-popover notifications-popover"><header><strong>Notificações</strong>${rows.some(row=>!row.read)?`<button class="text-link" data-community-read ${reading?'disabled':''}>${reading?'Atualizando…':'Marcar como lidas'}</button>`:''}</header>
      ${pagePending?`<a class="community-page-review" href="#/minhas-paginas">${icon('clock')} Sua página está em revisão</a>`:''}
      ${phase==='connected'?`<div class="community-notification-list">${rows.length?rows.map(row=>`<a href="${esc(siteLink(row.href))}" data-notification-id="${esc(row.id)}" ${external} class="community-notification ${row.read?'':'is-unread'}"><strong>${esc(row.title)}</strong><span>${esc(row.body||'Confira a atualização na sua conta.')}</span><time datetime="${esc(row.createdAt)}">${esc(new Date(row.createdAt).toLocaleDateString('pt-BR',{day:'numeric',month:'short'}))}</time></a>`).join(''):'<p>Nenhuma notificação por aqui.</p>'}</div>`:phase==='loading'?'<p role="status">Carregando notificações…</p>':`<p>${phase==='error'?'Não foi possível carregar seus alertas.':'Veja os alertas da sua conta no Community.'}</p>${connection.available!==false||phase==='error'?`<button class="text-link" data-community-connect>${phase==='error'?'Tentar novamente':'Conectar Community'}</button>`:''}`}
      ${notificationError?`<p role="alert">${esc(notificationError)}</p>`:''}<a class="ps-community-link" href="https://forcaaliada.com/community" ${external}>Abrir Community ${icon('external-link')}</a>
    </div></details>`;
  const list=notificationRoot.querySelector('.community-notification-list');if(list)list.scrollTop=position;
  if(focus){
    const item=[...notificationRoot.querySelectorAll('[data-notification-id]')].find(link=>link.dataset.notificationId===focus.dataset.notificationId);
    const selector=focus.matches('[data-community-read]')?'[data-community-read]:enabled':focus.matches('[data-community-connect]')?'[data-community-connect]':'summary';
    (item||notificationRoot.querySelector(selector)||notificationRoot.querySelector('summary'))?.focus({preventScroll:true});
  }
}
connection.subscribe(renderNotifications);
export function mountCommunityNotifications(root,{pending=false}={}){notificationRoot=root;pagePending=pending;if(!root)notificationError='';renderNotifications();}
document.addEventListener('click',async event=>{
  if(!event.target.closest('#community-notifications'))return;
  const read=event.target.closest('[data-community-read]'),connect=event.target.closest('[data-community-connect]');
  if(!read&&!connect||reading||connect?.disabled)return;
  notificationError='';
  try{
    if(connect){connect.disabled=true;if(connection.state.phase==='error')await connection.refresh();else await connection.connect();}
    if(read){reading=true;renderNotifications();await connection.markRead(connection.state.data.notifications.filter(row=>!row.read).map(row=>row.id));}
  }catch(error){notificationError=error.message;}
  finally{reading=false;renderNotifications();}
});
