import { setupMotion } from './motion.js?v=20261122-footer-motion';
import { setupDemos } from './demos.js?v=20261122-social';
import { setupPresentation } from './presentation.js';
import { setupSkinDemo } from './skin-demo.js?v=20261122-catalog-picks';
(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const origin = 'https://forcaaliada.com';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const saveData = Boolean(navigator.connection?.saveData);
  $$('.icon').forEach(el => el.setAttribute('aria-hidden', 'true'));
  function animate(el) {
    if (reduced.matches || saveData || !el?.animate) return;
    el.getAnimations().forEach(a => a.cancel());
    el.animate([{opacity:.55,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:240,easing:'cubic-bezier(.2,.8,.2,1)'});
  }
  let toastTimer;
  function toast(message) {
    clearTimeout(toastTimer);
    $('#toast').textContent = message;
    $('#toast').classList.add('is-visible');
    toastTimer = setTimeout(() => $('#toast').classList.remove('is-visible'), 4000);
  }
  const mobileMenu = $('.mobile-menu');
  mobileMenu.addEventListener('toggle', () => { if (mobileMenu.open) window.FAAccountMenu?.closeAll(); });
  mobileMenu.addEventListener('click', e => { if (e.target.closest('a')) mobileMenu.open = false; });
  document.addEventListener('click', e => {
    if (!mobileMenu.contains(e.target)) mobileMenu.open = false;
    if (!$('#idiomas').contains(e.target) && !e.target.closest('[href="#idiomas"]')) $('#idiomas').open = false;
  });
  document.addEventListener('focusin', e => {
    if (mobileMenu.open && !$('.site-header').contains(e.target)) mobileMenu.open = false;
  });
  matchMedia('(min-width: 981px)').addEventListener('change', e => {if(e.matches) mobileMenu.open=false;});
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (mobileMenu.open) {mobileMenu.open = false; $('summary',mobileMenu).focus();}
    if ($('#idiomas').open) {$('#idiomas').open=false; $('#idiomas summary').focus();}
  });
  $$('[href="#idiomas"]').forEach(a => a.addEventListener('click', () => {
    $('#idiomas').open = true;
    $('#idiomas summary').focus({preventScroll:true});
  }));

  // The same approved account component; this preview never reads a real session.
  function account(mode) {
    if (!window.FAAccountMenu) return;
    const member = mode === 'member';
    window.FAAccountMenu.mount($('#account'), member ? {username:'Alex · exemplo', displayName:'Alex · conta de exemplo', avatarUrl:new URL('media/avatar-demo.svg',location.href).href} : null, {onLogout:() => {$('#preview-persona').value='guest';account('guest');toast('Você saiu da conta de teste.');}});
    window.FAAccountMenu.setPlan(member ? {name:'Força Aliada Pro',tone:'active',statusLabel:'Assinatura de teste ativa'} : {kind:'free'});
    $$('#account a').forEach(a => {
      const path = new URL(a.href).pathname;
      a.href = path === '/login' ? origin + '/login?next=%2Fminecraft' : path === '/manager/console' ? 'https://console.forcaaliada.com/' : origin + new URL(a.href).pathname + new URL(a.href).search;
    });
  }
  account('guest');
  $('#preview-persona').addEventListener('change', e => {account(e.target.value); $('#account a, #account button')?.focus();});

  document.documentElement.classList.add('enhanced');
  const motion = setupMotion();
  setupDemos({toast, animate, motion});
  setupPresentation({motion,toast});
  setupSkinDemo({toast,motion});
})();
