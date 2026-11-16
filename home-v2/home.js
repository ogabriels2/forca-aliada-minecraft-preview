(() => {
  'use strict';
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const origin = 'https://forcaaliada.com';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const ease = 'cubic-bezier(.16,1,.3,1)';
  $$('.icon').forEach(icon => icon.setAttribute('aria-hidden', 'true'));
  function enter(element, distance = 14, delay = 0) {
    if (reducedMotion.matches || !element?.animate) return;
    element.getAnimations().forEach(animation => animation.cancel());
    element.animate([{opacity: .35, translate: `0 ${distance}px`}, {opacity: 1, translate: '0 0'}], {duration: 440, easing: ease, delay, fill: 'backwards'});
  }
  const menuButton = $('#menu-toggle');
  const mobileMenu = $('#mobile-nav');
  function closeMenu(restoreFocus = false) {
    mobileMenu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir navegação');
    $('use', menuButton).setAttribute('href', '#menu');
    if (restoreFocus) menuButton.focus();
  }
  menuButton.addEventListener('click', () => {
    if (!mobileMenu.hidden) return closeMenu();
    window.FAAccountMenu?.closeAll();
    mobileMenu.hidden = false;
    menuButton.setAttribute('aria-expanded', 'true');
    menuButton.setAttribute('aria-label', 'Fechar navegação');
    $('use', menuButton).setAttribute('href', '#close');
    enter(mobileMenu, -8);
  });
  mobileMenu.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('click', e => {
    if (!mobileMenu.hidden && !e.target.closest('.site-header')) closeMenu();
  });
  document.addEventListener('focusin', e => {
    if (!mobileMenu.hidden && !e.target.closest('.site-header')) closeMenu();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !mobileMenu.hidden) closeMenu(true);
  });
  matchMedia('(min-width: 981px)').addEventListener('change', e => { if (e.matches) closeMenu(); });

  const routineDetails = {
    backup: 'Escolha quando fazer o backup. O Manager cuida da rotina enquanto o computador está ligado.',
    remote: 'Abra o console no navegador para acompanhar jogadores, arquivos e terminal, mesmo longe do PC que hospeda o mundo.',
    address: 'Compartilhe um endereço público protegido por proxy. Seus amigos entram sem você precisar abrir portas no roteador.'
  };
  $$('[data-routine]').forEach(button => button.addEventListener('click', () => {
    $$('[data-routine]').forEach(other => {
      const active = other === button;
      other.classList.toggle('is-active', active);
      other.setAttribute('aria-pressed', String(active));
      other.lastElementChild.querySelector('use').setAttribute('href', active ? '#check' : '#arrow');
    });
    $('#routine-detail').textContent = routineDetails[button.dataset.routine];
    enter($('#routine-detail'), 5);
  }));
  $('#routine-detail').setAttribute('aria-live', 'polite');
  $('#server-search').addEventListener('submit', e => {
    e.preventDefault();
    const query = $('#server-query').value.trim();
    location.assign(origin + '/minecraft' + (query ? '#/?' + new URLSearchParams({q: query}) : ''));
  });

  const pricing = {monthly: {pro: 29.9, team: 79.9}, annual: {pro: 299 / 12, team: 799 / 12}};
  const amount = n => n.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  $$('[data-billing]').forEach(button => button.addEventListener('click', () => {
    const annual = button.dataset.billing === 'annual';
    $$('[data-billing]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    for (const plan of ['pro', 'team']) {
      $(`[data-price="${plan}"]`).textContent = amount(pricing[button.dataset.billing][plan]);
      $(`[data-price-note="${plan}"]`).textContent = annual ? `R$ ${amount(plan === 'pro' ? 299 : 799)} cobrados por ano. Valor mensal equivalente.` : plan === 'pro' ? 'Cobrança mensal. Cancele quando precisar.' : 'Cobrança mensal.';
      $(`[data-plan-link="${plan}"]`).href = document.body.dataset.persona === 'member' ? origin + '/account?tab=assinatura' : `${origin}/assinatura?checkout=${plan}&interval=${button.dataset.billing}`;
      enter($(`[data-price="${plan}"]`), 3);
    }
  }));

  let toastTimer;
  function notify(message) {
    clearTimeout(toastTimer);
    $('#toast').textContent = message;
    $('#toast').classList.add('visible');
    toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 4500);
  }
  $$('[data-copy]').forEach(button => button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      notify('Endereço copiado. Cole na lista de servidores do Minecraft.');
    } catch {
      const selection = getSelection();
      const range = document.createRange();
      range.selectNodeContents(button.firstElementChild);
      selection.removeAllRanges(); selection.addRange(range);
      notify('Selecione o endereço e copie para usar no Minecraft.');
    }
  }));
  const photoDialog = $('#photo-dialog');
  let photoOpen;
  $$('.photo-open').forEach(button=>button.addEventListener('click', () => {
    photoOpen=button;
    $('#photo-large').src = photoOpen.dataset.image;
    $('#photo-large').alt = photoOpen.dataset.caption;
    $('#photo-caption').textContent = photoOpen.dataset.caption;
    photoDialog.showModal();
    document.body.style.overflow = 'hidden';
    enter(photoDialog, 16);
  }));
  function closePhoto() { document.body.style.overflow = ''; photoDialog.close(); }
  $('.photo-close').addEventListener('click', closePhoto);
  photoDialog.addEventListener('cancel', () => { document.body.style.overflow = ''; });
  photoDialog.addEventListener('click', e => {
    if (e.target !== photoDialog) return;
    const box = photoDialog.getBoundingClientRect();
    if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) closePhoto();
  });
  photoDialog.addEventListener('close', () => {document.body.style.overflow = ''; photoOpen?.focus({preventScroll: true});});
  $$('.faq-list details').forEach(detail => detail.addEventListener('toggle', () => {
    if (detail.open) enter($('p', detail), 6);
  }));

  function prepareAccountLinks() {
    $$('#account a').forEach(link => {
      const original = link.getAttribute('href');
      if (original.startsWith('/login')) link.href = origin + '/login?next=%2Fminecraft';
      else if (original.startsWith('/manager/console')) link.href = 'https://console.forcaaliada.com';
      else if (original.startsWith('/')) link.href = origin + original;
    });
  }
  let headerFrame = 0;
  function positionAccountMenu() {
    if (headerFrame) return;
    headerFrame = requestAnimationFrame(() => {
      document.documentElement.style.setProperty('--fa-account-top', `${$('.site-header').getBoundingClientRect().bottom + 8}px`);
      headerFrame = 0;
    });
  }
  window.addEventListener('resize', positionAccountMenu, {passive: true});
  window.addEventListener('scroll', positionAccountMenu, {passive: true});
  positionAccountMenu();
  document.addEventListener('fa:auth-menu-rendered', prepareAccountLinks);
  function persona(value) {
    const member = value === 'member';
    $('#preview-persona').value = member ? 'member' : 'guest';
    const session = member ? {username: 'Conta exemplo', displayName: 'Conta de demonstração', avatarUrl: new URL('media/avatar-demo.svg', location.href).href} : null;
    window.FAAccountMenu?.mount($('#account'), session, {onLogout: () => persona('guest')});
    window.FAAccountMenu?.setPlan(member ? {name: 'Força Aliada Pro', tone: 'active', status: 'Assinatura ativa'} : {kind: 'free'});
    prepareAccountLinks();
    $$('[data-plan-link]').forEach(link => {
      if (member) {
        link.dataset.originalHref = link.href;
        link.href = origin + '/account?tab=assinatura';
        link.innerHTML = `Gerenciar assinatura <svg class="icon" aria-hidden="true"><use href="#arrow"/></svg>`;
      } else {
        const period = $('[data-billing][aria-pressed=true]').dataset.billing;
        const plan = link.dataset.planLink;
        link.href = `${origin}/assinatura?checkout=${plan}&interval=${period}`;
        link.innerHTML = `Escolher ${plan === 'pro' ? 'Pro' : 'Team'} <svg class="icon" aria-hidden="true"><use href="#arrow"/></svg>`;
      }
    });
    document.body.dataset.persona = member ? 'member' : 'guest';
    document.dispatchEvent(new CustomEvent('home:persona', {detail:{member}}));
  }
  $('#preview-persona').addEventListener('change', e => persona(e.target.value));
  persona('guest');
})();
