/* One account disclosure for public Força Aliada headers. No account data is fetched here. */
(() => {
  'use strict';
  if (window.FAAccountMenu) return;
  const assetRoot = new URL('../', document.currentScript?.src || new URL('/assets/js/fa-account-menu.js', location.origin));
  const css = document.createElement('link');
  css.rel = 'stylesheet'; css.href = new URL('css/fa-account-menu.css?v=20261106e',assetRoot).href;
  document.head.append(css);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const paths = {
    user:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    card:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 10h18M7 15h3"/>',
    console:'<rect x="3" y="4" width="18" height="14" rx="2"/><path d="m7 8 3 3-3 3M13 14h4M8 22h8M12 18v4"/>',
    community:'<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6A8.4 8.4 0 0 1 12.5 3h.5a8.5 8.5 0 0 1 8 8v.5Z"/>',
    staff:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 9v12"/>',
    exit:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    arrow:'<path d="m6 9 6 6 6-6"/>',
    login:'<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>'
  };
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
  const locale = () => document.documentElement.lang.startsWith('es') ? 'es' : document.documentElement.lang.startsWith('en') ? 'en' : 'pt';
  const labels = {
    pt:{account:'Minha conta',billing:'Plano e cobrança',console:'Console do Manager',community:'Community',staff:'Painel da staff',out:'Sair da conta',plan:'Seu plano',active:'Assinatura ativa',login:'Entrar',menu:'Abrir menu da conta',fallback:'Minha conta'},
    en:{account:'My account',billing:'Plan and billing',console:'Manager console',community:'Community',staff:'Staff dashboard',out:'Sign out',plan:'Your plan',active:'Active subscription',login:'Sign in',menu:'Open account menu',fallback:'My account'},
    es:{account:'Mi cuenta',billing:'Plan y facturación',console:'Consola de Manager',community:'Community',staff:'Panel del equipo',out:'Cerrar sesión',plan:'Tu plan',active:'Suscripción activa',login:'Iniciar sesión',menu:'Abrir menú de cuenta',fallback:'Mi cuenta'}
  };
  function imageURL(value) {
    if (!value || typeof value !== 'string') return '';
    try { const u = new URL(value, location.origin); return u.protocol === 'https:' || (u.origin === location.origin && u.protocol === location.protocol) ? u.href : ''; } catch { return ''; }
  }
  function avatars(session) {
    const name = session.minecraftName || session.minecraft_name;
    const skin = name ? `https://minotar.net/helm/${encodeURIComponent(name)}/100.png` : '';
    return [...new Set([session.avatarUrl || session.avatar_url, session.photoUrl || session.photo_url, skin, new URL('images/app-icons/icon-192.png',assetRoot).href].map(imageURL).filter(Boolean))];
  }
  function normalize(me) {
    return {...me, minecraftName:me.minecraft_name || me.minecraftName, avatarUrl:me.avatar_url || me.avatarUrl || '', photoUrl:me.photo_url || me.photoUrl || '', displayName:me.display_name || me.displayName || ''};
  }
  let planState = null;
  function setPlan(model) {
    planState = model;
    const lang = locale();
    const words = {
      pt:{loading:'Consultando assinatura…',unknown:'Plano e cobrança',retry:'Consultar minha assinatura',free:'Conta gratuita',plans:'Conhecer planos',active:'Assinatura ativa'},
      en:{loading:'Checking subscription…',unknown:'Plan and billing',retry:'View my subscription',free:'Free account',plans:'Explore plans',active:'Active subscription'},
      es:{loading:'Consultando suscripción…',unknown:'Plan y facturación',retry:'Ver mi suscripción',free:'Cuenta gratuita',plans:'Ver planes',active:'Suscripción activa'}
    }[lang];
    const statuses = {
      'assinatura ativa':['Active subscription','Suscripción activa'], 'benefício concedido':['Access granted','Acceso concedido'],
      'pagamento pendente':['Payment pending','Pago pendiente'], 'assinatura pausada':['Subscription paused','Suscripción pausada'],
      'encerramento em confirmação':['Cancellation pending','Cancelación pendiente'], 'encerramento programado':['Cancellation scheduled','Cancelación programada']
    };
    const member = Boolean(model && !model.kind && ['active','ending'].includes(model.tone));
    for (const menu of document.querySelectorAll('.fa-account-menu')) {
      menu.dataset.membership = member ? 'active' : 'none';
      menu.dataset.tier = /\bTeam\b/i.test(model?.name || '') ? 'team' : 'pro';
      const toggle = menu.querySelector('.fa-site-user-toggle');
      toggle.title = member ? String(model.name) : '';
    }
    for (const row of document.querySelectorAll('[data-fa-account-plan]')) {
      const free = model?.kind === 'free', unknown = !model || model.kind === 'unavailable';
      row.hidden = free || unknown; row.dataset.tone = model?.tone || 'neutral';
      row.dataset.tier = /\bTeam\b/i.test(model?.name || '') ? 'team' : 'pro';
      const fullName = String(model?.name || '').replace(/Manager (Pro|Team)/g,'Força Aliada $1');
      const name = row.querySelector('[data-fa-plan-indicator-name]');
      const status = row.querySelector('[data-fa-plan-indicator-status]');
      name.textContent = fullName.match(/\b(Pro|Team)\b/i)?.[0] || fullName;
      const raw = model?.statusLabel || '';
      const description = lang==='pt' ? raw : statuses[raw.toLowerCase()]?.[lang==='en'?0:1] || words.retry;
      status.textContent = description.charAt(0).toUpperCase() + description.slice(1);
      row.setAttribute('aria-label',fullName+'. '+status.textContent);row.title = row.getAttribute('aria-label');
      const item = row.closest('.fa-account-menu').querySelector('[data-fa-account-billing]');
      item.querySelector('[data-account-billing-label]').textContent = member ? {pt:'Gerenciar assinatura',en:'Manage subscription',es:'Gestionar suscripción'}[lang] : {pt:'Assinatura e cobrança',en:'Subscription and billing',es:'Suscripción y facturación'}[lang];
      item.href = free ? ({pt:'/assinatura',en:'/en/plans',es:'/es/planes'}[lang]) : '/account?tab=assinatura' + (model?.organizationId ? '&organization='+encodeURIComponent(model.organizationId) : '');
      const note = item.querySelector('[data-account-billing-status]');
      note.hidden = member || !model;
      note.textContent = free ? words.free : unknown ? words.retry : status.textContent;
    }
  }
  const instances = new Map();
  function mount(container, session, options = {}) {
    if (!container) return;
    instances.get(container)?.destroy();
    instances.delete(container);
    const t = labels[locale()];
    container.dataset.faAccount = '';
    const prefix = options.prefix || '';
    const login = '/login?next=' + encodeURIComponent(location.pathname + location.search + location.hash);
    if (!session) {
      container.innerHTML = prefix + `<a class="fa-site-login fa-account-login" aria-label="${t.login}" href="${login}">${icon('login')}<span>${t.login}</span></a>`;
      document.dispatchEvent(new CustomEvent('fa:auth-menu-rendered')); return;
    }
    session = normalize(session);
    const username = esc(session.username || session.displayName || t.fallback);
    const name = esc(session.displayName || session.username || t.fallback);
    const email = esc(session.email || '');
    const src = esc(avatars(session)[0]);
    const item = (href,key,glyph,extra='') => `<a class="fa-site-user-item" href="${href}" ${extra}>${icon(glyph)}<span>${t[key]}</span></a>`;
    container.innerHTML = prefix + `<div class="fa-site-user-menu fa-account-menu">
      <button class="fa-site-user-toggle" type="button" id="fa-site-user-toggle" aria-label="${t.menu}: ${username}" aria-expanded="false" aria-controls="fa-site-user-dropdown"><img src="${src}" alt="" width="30" height="30"><span>${username}</span>${icon('arrow')}</button>
      <div class="fa-site-user-dropdown" id="fa-site-user-dropdown" aria-label="${t.account}" aria-hidden="true" inert>
        <div class="fa-site-user-head"><img src="${src}" alt="" width="44" height="44"><span><span class="fa-account-identity-line"><strong>${name}</strong><span class="fa-account-member-badge" data-fa-account-plan hidden><strong data-fa-plan-indicator-name></strong><small class="fa-account-sr" data-fa-plan-indicator-status></small></span></span><small>${email || username}</small></span></div>
        <nav aria-label="${t.account}">${item('/account','account','user')}<a class="fa-site-user-item" href="/account?tab=assinatura" data-fa-account-billing>${icon('card')}<span><span data-account-billing-label>${t.billing}</span><small data-account-billing-status hidden></small></span></a>${item('/manager/console','console','console','data-fa-account-manager')}${item('/community','community','community')}${['observer','full','owner'].includes(session.role)?item('/dashboard','staff','staff'):''}</nav>
        <div class="fa-site-user-divider"></div><button class="fa-site-user-item is-danger" type="button" data-fa-account-logout>${icon('exit')}<span>${t.out}</span></button>
      </div></div>`;
    const toggle = container.querySelector('#fa-site-user-toggle');
    const panel = container.querySelector('#fa-site-user-dropdown');
    const abort = new AbortController(); const signal = abort.signal;
    function setOpen(open, focus = false) {
      if (open) { for (const [el, instance] of instances) if (el !== container) instance.close(); document.querySelectorAll('.fa-language[open],.mp-product-menu[open]').forEach(e=>e.open=false); }
      toggle.setAttribute('aria-expanded', String(open)); panel.setAttribute('aria-hidden', String(!open)); panel.inert = !open; panel.classList.toggle('is-open', open);
      if (focus) (open ? panel.querySelector('a') : toggle)?.focus({preventScroll:true});
    }
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'), {signal});
    toggle.addEventListener('keydown', e => {if (e.key === 'ArrowDown') {e.preventDefault(); setOpen(true,true);}}, {signal});
    container.querySelector('[data-fa-account-logout]').addEventListener('click', () => options.onLogout?.(), {signal});
    document.addEventListener('click', e => {if (!container.querySelector('.fa-account-menu').contains(e.target)) setOpen(false);}, {signal});
    document.addEventListener('keydown', e => {if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {e.preventDefault();setOpen(false,true);}}, {signal});
    container.addEventListener('focusout', (e) => {if (e.relatedTarget instanceof Node && !container.contains(e.relatedTarget)) setOpen(false);}, {signal});
    for (const img of container.querySelectorAll('.fa-account-menu img')) {
      const candidates = avatars(session); let index=0;
      img.addEventListener('error', () => {if (++index < candidates.length) img.src=candidates[index];else {img.hidden=true;img.parentElement.classList.add('avatar-unavailable');}}, {signal});
    }
    setPlan(planState);
    instances.set(container,{close:()=>setOpen(false),destroy:()=>abort.abort()});
    document.dispatchEvent(new CustomEvent('fa:auth-menu-rendered'));
  }
  window.FAAccountMenu = Object.freeze({mount,normalize,avatars,setPlan,closeAll:()=>instances.forEach(i=>i.close())});
})();
