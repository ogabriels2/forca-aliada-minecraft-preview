import {createCommunityPanel} from "./community-panel.mjs?v=site-20261114";
const icon = name => `<i class="icon" aria-hidden="true" style="--icon:url('./vendor/tabler/${name}.svg')"></i>`;
const storageKey = 'fa-minecraft-shell-v1';
let prefs = {};
try { prefs = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch {}
let expanded = typeof prefs.expanded === 'boolean' ? prefs.expanded : innerWidth >= 1680;
let socialPinned = prefs.socialPinned !== false;

const nav = document.createElement('aside');
nav.id = 'platform-navigation'; nav.className = 'ps-nav'; nav.setAttribute('aria-label','Navegação da plataforma');
const social = document.createElement('aside');
social.id = 'platform-social'; social.className = 'ps-social'; social.setAttribute('aria-label','Amigos');
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
socialButton.setAttribute('aria-controls',social.id); socialButton.setAttribute('aria-label','Abrir Amigos');
socialButton.innerHTML = `${icon('users')}<span>Amigos</span>`;
document.querySelector('.header-create').after(socialButton);
function save() { try { localStorage.setItem(storageKey, JSON.stringify({expanded,socialPinned})); } catch {} }
function loggedIn() { return Boolean(document.querySelector('.fa-account-menu')); }
function navLink(href,label,glyph,active=false) {
  return `<a href="${href}" class="ps-nav-link" title="${label}" aria-label="${label}" ${active?'aria-current="page"':''}>${icon(glyph)}<span>${label}</span></a>`;
}
function renderNav() {
  const hash=location.hash || '#/', query=new URLSearchParams(hash.split('?')[1] || '');
  nav.innerHTML=`<div class="ps-panel-heading"><strong>Seu Minecraft</strong><button class="ps-icon-button" data-shell="close-nav" aria-label="Recolher menu">${icon('x')}</button></div>
    <nav class="ps-drawer-products" aria-label="Produtos da Força Aliada">${document.querySelector('.ecosystem-nav').innerHTML}</nav>
    <nav aria-label="Explorar e criar">
      ${navLink('#/','Servidores','world',hash.split('?')[0]==='#/'&&!query.has('favorites')&&!query.has('recent'))}
      ${navLink('#/skins','Skins','shirt',hash==='#/skins')}
      <div class="ps-nav-group"><span>Sua biblioteca</span>
      ${navLink('#/?favorites=true','Favoritos','heart',query.has('favorites'))}
      ${navLink('#/?recent=true','Histórico','clock',query.has('recent'))}</div>
      <div class="ps-nav-group"><span>Criar e publicar</span>
      ${loggedIn() ? navLink('#/minhas-paginas','Minhas páginas','layout',hash.startsWith('#/minhas-paginas')||hash.startsWith('#/servidor/minha-pagina')) : `<button class="ps-nav-link" data-action="create" title="Criar página" aria-label="Criar página">${icon('plus')}<span>Criar página</span></button>`}
      ${navLink('#/minhas-skins','Minhas skins','folder',hash==='#/minhas-skins')}</div>
      <div class="ps-nav-group"><span>Ferramentas</span>
      ${navLink('#/skins/editor','Editor de skins','brush',hash==='#/skins/editor')}
      ${navLink('https://iamcal.github.io/enchant-order/','Encantamentos','book')}
      ${navLink('https://forcaaliada.com/ajuda','Ajuda','help-circle')}</div>
    </nav>
`;
}
createCommunityPanel(social,{close(){socialPinned=false;save();closeDrawer();syncLayout();socialButton.focus();}});
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
  drawer.setAttribute('aria-label',node===nav?'Menu da plataforma':'Amigos');
  drawer.append(node); drawer.showModal(); syncLayout();
}
function syncLayout() {
  document.body.classList.toggle('ps-nav-expanded',expanded);
  document.body.classList.toggle('ps-social-pinned',socialPinned);
  menuButton.setAttribute('aria-label', innerWidth >= 1200 && expanded ? 'Recolher menu da plataforma' : 'Abrir menu da plataforma');
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
  if(e.target.closest('a[href], [data-action="create"]')) {
    closeDrawer();
    if(e.target.closest('[data-action="create"]'))menuButton.focus();
  }
}
nav.addEventListener('click',handleClick);
window.addEventListener('hashchange',()=>{closeDrawer();renderNav();syncLayout();});
let previousWidth=innerWidth;
function alignPanels() {
  const top = Math.max(0, document.querySelector('.site-header').getBoundingClientRect().bottom);
  const footer = document.querySelector('#footer').getBoundingClientRect().top;
  document.body.style.setProperty('--ps-top', `${top}px`);
  document.body.style.setProperty('--ps-bottom', `${Math.max(0, innerHeight - footer)}px`);
}
new ResizeObserver(alignPanels).observe(document.querySelector('#main'));
window.addEventListener('resize',()=>{if(innerWidth!==previousWidth&&drawer.open)closeDrawer();previousWidth=innerWidth;syncLayout();alignPanels();});
window.addEventListener('scroll',alignPanels,{passive:true});
new MutationObserver(()=>{renderNav();syncLayout();}).observe(document.querySelector('#account-area'),{childList:true});
document.addEventListener('fa:auth-menu-rendered',()=>{renderNav();syncLayout();});
new MutationObserver(syncLayout).observe(document.body,{attributes:true,attributeFilter:['data-surface']});
renderNav();syncLayout();alignPanels();
