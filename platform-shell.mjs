// Visual prototype only. No Community, Microsoft, or messaging requests are made here.
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon = name => `<i class="icon" aria-hidden="true" style="--icon:url('./vendor/tabler/${name}.svg')"></i>`;
const people = [
  {id:'lara',name:'Lara',skin:'ocean',status:'Online · Força Aliada',kind:'playing',bio:'Survival, construções e projetos em equipe.',edition:'Java'},
  {id:'davi',name:'Davi',skin:'explorer',status:'Online no Community',kind:'online',bio:'Sempre procurando uma ideia para a próxima farm.',edition:'Java e Bedrock'},
  {id:'bia',name:'Bia',skin:'plum',status:'Online · Mundo individual',kind:'solo',bio:'Construindo um mundo, uma casa de cada vez.',edition:'Bedrock'},
  {id:'leo',name:'Léo',skin:'explorer',status:'Atividade privada',kind:'private',bio:'Exploração e aventura.',edition:'Java'},
];
const suggestions = [
  {id:'nina',name:'Nina',skin:'plum',status:'Também gosta de construção',kind:'suggested',bio:'Cidades, jardins e construções em grupo.',edition:'Java'},
  {id:'caio',name:'Caio',skin:'ocean',status:'Também gosta de Survival',kind:'suggested',bio:'Survival para jogar com calma.',edition:'Java e Bedrock'},
];
const avatar = p => `<span class="ps-avatar ps-avatar--${p.skin}"><img src="./assets/skins/showcase-${p.skin}.png" alt="" width="144" height="192"></span>`;
const storageKey = 'fa-minecraft-shell-v1';
let prefs = {};
try { prefs = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch {}
let expanded = typeof prefs.expanded === 'boolean' ? prefs.expanded : innerWidth >= 1680;
let socialPinned = prefs.socialPinned !== false;
let demoState = 'friends', selected = null, view = 'list';
const messages = new Map(), requested = new Set();
const nav = document.createElement('aside');
nav.id = 'platform-navigation'; nav.className = 'ps-nav'; nav.setAttribute('aria-label','Navegação da plataforma');
const social = document.createElement('aside');
social.id = 'platform-social'; social.className = 'ps-social'; social.setAttribute('aria-label','Amigos — demonstração');
const drawer = document.createElement('dialog');
drawer.className = 'ps-drawer'; drawer.id = 'platform-drawer';
document.body.append(nav, social, drawer);
document.body.classList.add('platform-shell');
const header = document.querySelector('.header-inner');
const menuButton = document.createElement('button');
menuButton.className = 'ps-menu-toggle'; menuButton.type = 'button';
menuButton.setAttribute('aria-label','Abrir menu da plataforma'); menuButton.setAttribute('aria-controls',nav.id);
menuButton.innerHTML = icon('menu'); header.prepend(menuButton);
const socialButton = document.createElement('button');
socialButton.type='button'; socialButton.className='ps-social-toggle';
socialButton.setAttribute('aria-controls',social.id); socialButton.setAttribute('aria-label','Abrir Amigos — demonstração');
socialButton.innerHTML = `${icon('users')}<span>Amigos</span>`;
document.querySelector('.header-actions').prepend(socialButton);
function save() { try { localStorage.setItem(storageKey, JSON.stringify({expanded,socialPinned})); } catch {} }
function loggedIn() { return Boolean(document.querySelector('.prototype-account')); }
function navLink(href,label,glyph,active=false) {
  return `<a href="${href}" class="ps-nav-link" title="${label}" aria-label="${label}" ${active?'aria-current="page"':''}>${icon(glyph)}<span>${label}</span></a>`;
}
function renderNav() {
  const hash=location.hash || '#/', query=new URLSearchParams(hash.split('?')[1] || '');
  let saved={}; try { saved=JSON.parse(localStorage.getItem('fa-minecraft-prototype-v1') || '{}'); } catch {}
  const own = loggedIn() && Boolean(saved.created || saved.publication);
  nav.innerHTML=`<div class="ps-panel-heading"><strong>Seu Minecraft</strong><button class="ps-icon-button" data-shell="close-nav" aria-label="Recolher menu">${icon('x')}</button></div>
    <nav aria-label="Explorar e criar">
      ${navLink('#/','Explorar servidores','world',hash.split('?')[0]==='#/'&&!query.has('favorites')&&!query.has('recent'))}
      ${navLink('#/skins','Skins','shirt',hash==='#/skins')}
      <div class="ps-nav-group"><span>Sua atividade</span>
      ${navLink('#/?favorites=true','Favoritos','heart',query.has('favorites'))}
      ${navLink('#/?recent=true','Histórico','clock',query.has('recent'))}</div>
      <div class="ps-nav-group"><span>Suas criações</span>
      ${own ? navLink('#/servidor/minha-pagina','Minha página','layout',hash.startsWith('#/servidor/minha-pagina')) : `<button class="ps-nav-link" data-action="create" title="Criar página">${icon('plus')}<span>Criar página</span></button>`}
      ${navLink('#/perfil/demonstracao/skins','Minhas skins','folder',hash.includes('/perfil/'))}
      ${navLink('#/skins/editor','Editor de skins','brush',hash==='#/skins/editor')}</div>
      <div class="ps-nav-group"><span>Ferramentas</span>
      ${navLink('https://iamcal.github.io/enchant-order/','Encantamentos','book')}
      ${navLink('https://forcaaliada.com/ajuda','Ajuda','help-circle')}</div>
    </nav>
    <div class="ps-products">
      <a class="ps-manager" href="https://forcaaliada.com/manager" title="Força Aliada Manager">${icon('device-desktop')}<span><strong>Manager</strong><small>Crie e cuide do servidor</small></span>${icon('arrow-right')}</a>
      ${navLink('https://forcaaliada.com/community','Community','users')}
      ${navLink('https://forcaaliada.com/assinatura','Assinatura','sparkles')}
    </div>`;
}
function demoControls() {
  return `<details class="ps-demo-controls"><summary>Estados do protótipo</summary><label>Visualizar<select data-demo-state>
    ${[['friends','Com amigos'],['empty','Sem amigos'],['guest','Sem login'],['error','Falha na conexão']].map(([v,l])=>`<option value="${v}" ${demoState===v?'selected':''}>${l}</option>`).join('')}
    </select></label><p>Pessoas e atividades ilustrativas. Nenhuma conta Microsoft é consultada.</p></details>`;
}
function personRow(p) {
  return `<button class="ps-person" data-person="${p.id}" aria-label="Ver perfil demonstrativo de ${p.name}">${avatar(p)}<span><strong>${p.name}</strong><small><span class="ps-status-dot ps-status-dot--${p.kind}" aria-hidden="true"></span>${p.status}</small></span></button>`;
}
function renderSocial() {
  const back = view !== 'list';
  social.innerHTML=`<div class="ps-panel-heading">${back?`<button class="ps-icon-button" data-shell="social-back" aria-label="Voltar aos amigos">${icon('arrow-left')}</button>`:''}<strong>${view==='chat'?'Conversa':view==='profile'?'Perfil':'Amigos'}</strong><button class="ps-icon-button" data-shell="close-social" aria-label="Fechar Amigos">${icon('x')}</button></div><div class="ps-demo-label">${icon('eye')} Demonstração visual</div><div class="ps-social-content"></div>`;
  const content=social.querySelector('.ps-social-content');
  if (!loggedIn() || demoState==='guest') {
    content.innerHTML=`<div class="ps-empty">${icon('users')}<h3>Jogar fica melhor junto.</h3><p>Seus amigos, conversas e servidores em um só lugar.</p><button class="ps-primary" data-shell="demo-login">Experimentar com amigos</button><small>Abre uma demonstração, sem login real.</small></div>${demoControls()}`;return;
  }
  if (demoState==='empty' || demoState==='error') {
    content.innerHTML=`<div class="ps-empty">${icon(demoState==='error'?'alert-circle':'users')}<h3>${demoState==='error'?'Não foi possível carregar.':'Encontre sua turma.'}</h3><p>${demoState==='error'?'Seu catálogo continua disponível. Tente carregar a lista novamente.':'Encontre pessoas para jogar e mantenha a conversa no Community.'}</p><button class="ps-primary" data-shell="demo-retry">${demoState==='error'?'Tentar novamente':'Ver sugestões'}</button></div>${demoControls()}`;return;
  }
  if(view==='profile' && selected) {
    const p=selected;
    content.innerHTML=`<div class="ps-profile">${avatar(p)}<h3>${p.name}</h3><p>${p.bio}</p><span class="ps-edition">${p.edition}</span><small>Perfil ilustrativo</small></div>
    <div class="ps-activity"><strong>${p.status}</strong><p>${p.kind==='playing'?'Um exemplo de presença associada a um servidor.':p.kind==='solo'?'Atividade compartilhada voluntariamente neste exemplo.':p.kind==='private'?'O estado de jogo não é mostrado.':'Presença na comunidade, sem afirmar atividade no jogo.'}</p>${p.kind==='playing'?'<a class="ps-primary" href="#/servidor/forca-aliada">Ver servidor</a>':''}</div>
    <button class="ps-primary" data-shell="chat">${icon('users')} Conversar</button>
    <a class="ps-community-link" href="https://forcaaliada.com/community">Abrir Community ${icon('external-link')}</a>`;return;
  }
  if(view==='chat' && selected) {
    const p=selected;
    content.innerHTML=`<div class="ps-chat-person">${avatar(p)}<strong>${p.name}</strong></div><p class="ps-chat-notice">Conversa de demonstração. Nada será enviado.</p><div class="ps-messages" role="log" aria-label="Conversa de demonstração"><p class="ps-message">Oi! Vamos combinar de jogar?</p>${(messages.get(p.id)||[]).map(m=>`<p class="ps-message ps-message--own">${esc(m)}</p>`).join('')}</div><form class="ps-compose"><label class="sr-only" for="ps-message-input">Mensagem de demonstração</label><input id="ps-message-input" placeholder="Escreva uma mensagem…" maxlength="1000" autocomplete="off" required><button class="ps-icon-button" aria-label="Adicionar mensagem à demonstração">${icon('arrow-up')}</button></form><a class="ps-community-link" href="https://forcaaliada.com/community">Abrir Community ${icon('external-link')}</a>`;
    content.querySelector('.ps-messages').scrollTop=100000;return;
  }
  content.innerHTML=`<div class="ps-friends-list">${people.map(personRow).join('')}</div>
    <div class="ps-list-caption">Sugestões para você</div>
    ${suggestions.map(p=>`<div class="ps-suggestion">${personRow(p)}<button data-request="${p.id}" class="ps-request" aria-label="${requested.has(p.id)?'Solicitação demonstrativa enviada a':'Adicionar'} ${p.name}" ${requested.has(p.id)?'disabled':''}>${icon(requested.has(p.id)?'check':'plus')}</button></div>`).join('')}
    <a class="ps-community-link" href="https://forcaaliada.com/community">Ver no Community ${icon('external-link')}</a>${demoControls()}`;
}
let panel=null;
function closeDrawer() {
  if(!drawer.open)return;
  if(panel)document.body.append(panel);
  panel=null;
  drawer.close();
}
drawer.addEventListener('close',()=>{ if(drawer.open)return;if(panel)document.body.append(panel);panel=null;syncLayout(); });
drawer.addEventListener('click',e=>{if(e.target===drawer)closeDrawer();});
function showDrawer(node) {
  if(drawer.open) { if(panel===node){closeDrawer();return;} closeDrawer(); }
  panel=node; drawer.dataset.panel=node===nav?'navigation':'social';
  drawer.setAttribute('aria-label',node===nav?'Menu da plataforma':'Amigos — demonstração');
  drawer.append(node); drawer.showModal(); syncLayout();
}
function syncLayout() {
  document.body.classList.toggle('ps-nav-expanded',expanded);
  document.body.classList.toggle('ps-social-pinned',socialPinned);
  menuButton.setAttribute('aria-expanded',String(drawer.open&&panel===nav || innerWidth>=1200&&expanded));
  socialButton.setAttribute('aria-expanded',String(drawer.open&&panel===social || innerWidth>=1680&&socialPinned&&!document.body.classList.contains('studio-open')));
}
menuButton.addEventListener('click',()=>{
  if(innerWidth>=1200&&!document.body.classList.contains('studio-open')){expanded=!expanded;save();syncLayout();}
  else showDrawer(nav);
});
socialButton.addEventListener('click',()=>{
  if(innerWidth>=1680&&!document.body.classList.contains('studio-open')){socialPinned=!socialPinned;save();syncLayout();}
  else showDrawer(social);
});
function handleClick(e) {
  const action=e.target.closest('[data-shell]')?.dataset.shell;
  if(action==='close-nav'){expanded=false;save();closeDrawer();syncLayout();menuButton.focus();}
  if(action==='close-social'){socialPinned=false;save();closeDrawer();syncLayout();socialButton.focus();}
  if(action==='social-back'){view='list';selected=null;renderSocial();social.querySelector('[data-person]')?.focus();}
  if(action==='chat'){view='chat';renderSocial();social.querySelector('[data-shell="social-back"]')?.focus();}
  if(action==='demo-login'){document.querySelector('#account-area [data-action="login"]')?.click();demoState='friends';view='list';renderSocial();}
  if(action==='demo-retry'){demoState='friends';view='list';renderSocial();}
  const person=e.target.closest('[data-person]')?.dataset.person;
  if(person){selected=[...people,...suggestions].find(p=>p.id===person);view='profile';renderSocial();social.querySelector('[data-shell="social-back"]')?.focus();}
  const request=e.target.closest('[data-request]')?.dataset.request;
  if(request&&!requested.has(request)){requested.add(request);const button=e.target.closest('[data-request]');button.innerHTML=icon('check');button.setAttribute('aria-label','Solicitação demonstrativa enviada');button.setAttribute('aria-disabled','true');}
  if(e.target.closest('a[href], [data-action="create"]')) {
    closeDrawer();
    if(e.target.closest('[data-action="create"]'))menuButton.focus();
  }
}
nav.addEventListener('click',handleClick); social.addEventListener('click',handleClick);
social.addEventListener('change',e=>{if(e.target.matches('[data-demo-state]')){demoState=e.target.value;view='list';renderSocial();}});
social.addEventListener('submit',e=>{
  if(!e.target.matches('.ps-compose'))return;e.preventDefault();
  const input=e.target.querySelector('input'),message=input.value.trim();if(!message)return;
  messages.set(selected.id,[...(messages.get(selected.id)||[]),message].slice(-40));
  renderSocial();social.querySelector('input')?.focus();
});
window.addEventListener('hashchange',()=>{closeDrawer();renderNav();syncLayout();});
let previousWidth=innerWidth;
function alignPanels() { document.body.style.setProperty('--ps-top',`${Math.max(0,document.querySelector('.site-header').getBoundingClientRect().bottom)}px`); }
window.addEventListener('resize',()=>{if(innerWidth!==previousWidth&&drawer.open)closeDrawer();previousWidth=innerWidth;syncLayout();alignPanels();});
window.addEventListener('scroll',alignPanels,{passive:true});
new MutationObserver(()=>{renderNav();renderSocial();syncLayout();}).observe(document.querySelector('#account-area'),{childList:true});
new MutationObserver(syncLayout).observe(document.body,{attributes:true,attributeFilter:['data-surface']});
renderNav();renderSocial();syncLayout();alignPanels();
