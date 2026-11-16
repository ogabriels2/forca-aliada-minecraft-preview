(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const origin = 'https://forcaaliada.com';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = matchMedia('(max-width: 760px)');
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
    window.FAAccountMenu.mount($('#account'), member ? {username:'Alex · exemplo', displayName:'Alex · conta de exemplo', avatarUrl:new URL('media/avatar-demo.svg',location.href).href} : null, {onLogout:() => {$('#preview-persona').value='guest';account('guest');toast('Demonstração em modo visitante.');}});
    window.FAAccountMenu.setPlan(member ? {name:'Força Aliada Pro',tone:'active',statusLabel:'Assinatura ativa — exemplo'} : {kind:'free'});
    $$('#account a').forEach(a => {
      const path = new URL(a.href).pathname;
      a.href = path === '/login' ? origin + '/login?next=%2Fminecraft' : path === '/manager/console' ? 'https://console.forcaaliada.com/' : origin + new URL(a.href).pathname + new URL(a.href).search;
    });
  }
  account('guest');
  $('#preview-persona').addEventListener('change', e => {account(e.target.value); $('#account a, #account button')?.focus();});

  let userPaused = false, heroVisible = true;
  const motion = $('#motion-toggle');
  function syncMotion() {
    const permitted = !reduced.matches && !saveData;
    document.body.classList.toggle('ambient', permitted);
    document.body.classList.toggle('motion-paused', userPaused || !heroVisible || document.hidden || !permitted);
    motion.hidden = !permitted;
    motion.setAttribute('aria-pressed',String(userPaused));
    $('span',motion).textContent = userPaused ? 'Retomar movimento' : 'Pausar movimento';
    motion.setAttribute('aria-label',userPaused ? 'Retomar movimento do cenário' : 'Pausar movimento do cenário');
    $('use',motion).setAttribute('href',userPaused ? '#play' : '#pause');
  }
  motion.addEventListener('click', () => {userPaused=!userPaused;syncMotion();});
  reduced.addEventListener('change',syncMotion);
  document.addEventListener('visibilitychange',syncMotion);
  new IntersectionObserver(entries => {heroVisible=entries[0].isIntersecting;syncMotion();}).observe($('.hero'));
  syncMotion();

  const tabs = $$('[data-step]');
  const panels = $$('.demo-panel');
  let step = 0, manual = false;
  function setStep(index, options = {}) {
    const next = Math.max(0,Math.min(2,index));
    if (options.manual) manual = true;
    tabs.forEach((tab,i) => {tab.setAttribute('aria-selected',String(i===next));tab.tabIndex = i===next ? 0 : -1;});
    panels.forEach((panel,i) => {panel.hidden=i!==next;panel.setAttribute('role','tabpanel');});
    $$('[data-story]').forEach((el,i)=>el.classList.toggle('is-current',i===next));
    if (next === 2) $('#ready-name').textContent = $('#world-name').value.trim() || 'Mundo da turma';
    if (next !== step) animate(panels[next]);
    step = next;
    if (options.focus) {const heading=$('h3',panels[next]);heading.tabIndex=-1;heading.focus();}
  }
  setStep(0);
  tabs.forEach((tab,i) => {
    tab.addEventListener('click', () => setStep(i,{manual:true}));
    tab.addEventListener('keydown', e => {
      const direction={ArrowRight:1,ArrowLeft:-1};
      let next;
      if (e.key in direction) next=(i+direction[e.key]+tabs.length)%tabs.length;
      else if (e.key==='Home') next=0;
      else if (e.key==='End') next=tabs.length-1;
      else return;
      e.preventDefault();setStep(next,{manual:true});tabs[next].focus();
    });
  });
  $$('[data-next]').forEach(button => button.addEventListener('click', () => setStep(Number(button.dataset.next),{manual:true,focus:true})));
  const storyObserver = new IntersectionObserver(entries => {
    if (manual || narrow.matches || reduced.matches || $('#manager-demo').contains(document.activeElement)) return;
    const active = entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if (active) setStep(Number(active.target.dataset.story));
  },{rootMargin:'-28% 0px -40% 0px',threshold:[0,.2,.5]});
  $$('[data-story]').forEach(el=>storyObserver.observe(el));
  $$('[data-world]').forEach(button=>button.addEventListener('click',()=>{
    $$('[data-world]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
    $('#world-hint').textContent = button.dataset.world === 'import' ? 'Na importação real, você seleciona a pasta do servidor. Faça um backup antes.' : 'Na criação real, você escolhe a edição e configura seu mundo.';
    animate($('#world-hint'));
  }));
  $('#copy-demo').addEventListener('click',async()=>{
    try {await navigator.clipboard.writeText('sua-turma.play.forcaaliada.com');toast('Endereço de exemplo copiado. Não é um servidor real.');}
    catch {toast('Não foi possível copiar. O endereço de exemplo está logo acima.');}
  });
  $('#run-backup').addEventListener('click',()=>{
    $('#demo-result').textContent='Backup concluído na demonstração. Nenhum arquivo real foi acessado.';
    animate($('.backup-row'));
  });
  $('#server-search').addEventListener('submit',e=>{
    e.preventDefault();const q=$('#server-query').value.trim();
    location.assign(origin+'/minecraft'+(q?'#/?'+new URLSearchParams({q}):''));
  });
  const skinNames={ocean:'azul',plum:'violeta',explorer:'verde'};
  $$('[data-skin]').forEach(button=>button.addEventListener('click',()=>{
    const name=button.dataset.skin;
    $('#skin-image').src=`media/skin-${name}.png`;
    $('#skin-image').alt=`Skin de exemplo com roupa ${skinNames[name]}`;
    $$('[data-skin]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
    animate($('#skin-image'));
  }));
  $('#chat-demo').addEventListener('click',()=>{
    const reply=$('.chat-reply');reply.hidden=!reply.hidden;
    $('.community-scene').classList.toggle('chat-expanded',!reply.hidden);
    $('#chat-demo').firstChild.textContent=reply.hidden?'Continuar a conversa de exemplo':'Recomeçar a conversa de exemplo';
    if (!reply.hidden) animate(reply);
  });

  const gallery=$('.gallery');
  function galleryEdges() {
    $('#gallery-prev').disabled=gallery.scrollLeft<2;
    $('#gallery-next').disabled=gallery.scrollLeft>=gallery.scrollWidth-gallery.clientWidth-2;
  }
  gallery.addEventListener('scroll',galleryEdges,{passive:true});
  new ResizeObserver(galleryEdges).observe(gallery);
  $('#gallery-prev').addEventListener('click',()=>gallery.scrollBy({left:-gallery.clientWidth*.8,behavior:reduced.matches?'instant':'smooth'}));
  $('#gallery-next').addEventListener('click',()=>gallery.scrollBy({left:gallery.clientWidth*.8,behavior:reduced.matches?'instant':'smooth'}));
  galleryEdges();
  const dialog=$('#lightbox'), photos=$$('.gallery [data-lightbox]');
  let photoIndex=-1, opener;
  function showPhoto(link) {
    $('#lightbox-image').src=link.href;
    $('#lightbox-image').alt=link.dataset.caption;
    $('#lightbox-caption').textContent=link.dataset.caption;
    photoIndex=photos.indexOf(link);
    $('.lightbox-nav').hidden=photoIndex<0;
    $('#photo-position').textContent=`${photoIndex+1} de ${photos.length}`;
    $('#photo-prev').disabled=photoIndex<=0;
    $('#photo-next').disabled=photoIndex>=photos.length-1;
  }
  $$('[data-lightbox]').forEach(link=>link.addEventListener('click',e=>{
    if(!dialog.showModal)return;
    e.preventDefault();opener=link;showPhoto(link);dialog.showModal();
  }));
  function movePhoto(direction){const next=photos[photoIndex+direction];if(next)showPhoto(next);}
  $('#photo-prev').addEventListener('click',()=>movePhoto(-1));
  $('#photo-next').addEventListener('click',()=>movePhoto(1));
  dialog.addEventListener('keydown',e=>{if(photoIndex>=0&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();movePhoto(e.key==='ArrowLeft'?-1:1);}});
  dialog.addEventListener('click',e=>{if(e.target===dialog){const rect=dialog.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));

  const prices={monthly:{pro:29.9,team:79.9},annual:{pro:299,team:799}};
  const money=value=>value.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
  $$('[data-billing]').forEach(button=>button.addEventListener('click',()=>{
    const period=button.dataset.billing;
    $$('[data-billing]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
    for(const plan of ['pro','team']){
      const annual=period==='annual',value=prices[period][plan];
      $(`[data-price="${plan}"]`).textContent=money(annual?value/12:value);
      $(`[data-total="${plan}"]`).textContent=annual?`R$ ${money(value)} cobrados por ano. Valor mensal equivalente.`:`R$ ${money(value)} cobrados por mês.`;
      $(`[data-plan="${plan}"]`).href=`${origin}/assinatura?checkout=${plan}&interval=${period}`;
      animate($(`[data-price="${plan}"]`));
    }
    $('#billing-summary').textContent = period==='annual' ? 'Cobrança anual selecionada. Pro: 299 reais por ano, equivalente a 24 reais e 92 centavos por mês. Team: 799 reais por ano, equivalente a 66 reais e 58 centavos por mês.' : 'Cobrança mensal selecionada. Pro: 29 reais e 90 centavos por mês. Team: 79 reais e 90 centavos por mês.';
  }));
  document.body.classList.add('enhanced');
})();
