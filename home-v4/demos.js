export function setupDemos({toast,animate,motion}) {
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const query=$('#catalog-query'), filters=$$('[name="category"]'), tiles=$$('.catalog-tile'), cat=$('.catalog-window');
  let catPhase=0;
  const results=$('.catalog-results'),grid=$('.catalog-tiles'),empty=$('.catalog-empty');
  // Reserve the full preview height so its automatic filters never move the page.
  let catalogWidth=0,catalogMeasure;
  new ResizeObserver(entries=>{
    const width=entries[0].contentRect.width;if(!width||Math.abs(width-catalogWidth)<1)return;
    catalogWidth=width;cancelAnimationFrame(catalogMeasure);
    catalogMeasure=requestAnimationFrame(()=>{
      const hidden=tiles.map(t=>t.hidden);
      grid.style.minHeight='0';tiles.forEach(t=>t.hidden=false);
      const height=grid.getBoundingClientRect().height;
      tiles.forEach((t,i)=>t.hidden=hidden[i]);grid.style.minHeight=`${Math.ceil(height)}px`;
    });
  }).observe(grid);
  const clean=s=>s.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  function filterCatalog(manual=false){
    const term=clean(query.value.trim()), category=filters.find(x=>x.checked)?.value||'Todos';let count=0;
    tiles.forEach(tile=>{const visible=(!term||clean(tile.dataset.name+' '+tile.dataset.category).includes(term))&&(category==='Todos'||tile.dataset.category===category);tile.hidden=!visible;if(visible)count++;});
    empty.hidden=count>0;results.dataset.empty=String(!count);
    $('#catalog-status').textContent = count ? '' : 'Nenhum servidor encontrado. Tente outro nome ou estilo.';
    if(manual)catalogLoop.setPaused();
  }
  const catalogLoop=motion.register('catalog',cat,()=>{
    catPhase=(catPhase+1)%4;
    if(catPhase===1){query.value='Survival';filters[0].checked=true;}
    if(catPhase===2){query.value='';filters[1].checked=true;}
    if(catPhase===3){const heart=$('.favorite',tiles[0]);heart.setAttribute('aria-pressed','true');heart.setAttribute('aria-label',`Remover ${tiles[0].dataset.name} dos favoritos`);animate(heart);}
    if(catPhase===0){query.value='';filters[0].checked=true;}
    filterCatalog();
  },4800);
  query.addEventListener('input',()=>filterCatalog(true));
  $('#catalog-reset').addEventListener('click',()=>{query.value='';filters[0].checked=true;filterCatalog(true);query.focus({preventScroll:true});});
  $('#catalog-search').addEventListener('submit',e=>{e.preventDefault();filterCatalog(true);});
  filters.forEach(r=>r.addEventListener('change',()=>filterCatalog(true)));
  $$('.favorite').forEach(b=>b.addEventListener('click',()=>{catalogLoop.setPaused();const saved=b.getAttribute('aria-pressed')!=='true',name=b.closest('.catalog-tile').dataset.name;b.setAttribute('aria-pressed',String(saved));b.setAttribute('aria-label',saved?`Remover ${name} dos favoritos`:`Favoritar ${name}`);b.title=b.getAttribute('aria-label');animate(b);toast(saved?'Salvo nos favoritos da prévia.':'Removido dos favoritos da prévia.');}));

  let socialPhase=0;
  const phone=$('.phone'), phoneTabs=$$('[data-phone-tab]');
  const feedScroll = $('.phone-feed-scroll');
  const messages = $('.phone-messages');
  function showPhone(tab,manual=false){$('#phone-feed').hidden=tab!=='feed';$('#phone-chat').hidden=tab!=='chat';phoneTabs.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.phoneTab===tab)));if(manual)socialLoop.setPaused();animate(tab==='feed'?$('#phone-feed'):$('#phone-chat'));}
  const socialLoop=motion.register('community',phone,()=>{socialPhase=(socialPhase+1)%4;if(socialPhase===1){$('.phone-feed-scroll').scrollTo({top:170,behavior:motion.instant()?'instant':'smooth'});}else if(socialPhase===2){showPhone('chat');$('#incoming-message').hidden=true;}else if(socialPhase===3){$('#incoming-message').hidden=false;animate($('#incoming-message'));}else{showPhone('feed');$('.phone-feed-scroll').scrollTop=0;}},5500);
  showPhone('feed');
  phoneTabs.forEach(b=>b.addEventListener('click',()=>{showPhone(b.dataset.phoneTab,true);$('#incoming-message').hidden=false;}));
  feedScroll.addEventListener('wheel',()=>socialLoop.setPaused(),{passive:true});
  phone.addEventListener('pointerdown',()=>socialLoop.setPaused(),{passive:true});
  $('#post-like').addEventListener('click',e=>{socialLoop.setPaused();const b=e.currentTarget,liked=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(liked));b.setAttribute('aria-label',liked?'Descurtir publicação de exemplo':'Curtir publicação de exemplo');animate(b);});
  $('#post-comment').addEventListener('click', () => {
    socialLoop.setPaused();
    const comment = $('#sample-comment');
    comment.hidden = !comment.hidden;
    $('#post-comment').setAttribute('aria-expanded', String(!comment.hidden));
    if (comment.hidden) return;
    const offset = comment.getBoundingClientRect().bottom - feedScroll.getBoundingClientRect().bottom;
    if (offset > 0) feedScroll.scrollBy({top: offset + 8, behavior: motion.instant() ? 'instant' : 'smooth'});
    animate(comment);
  });

  $('#demo-message-form').addEventListener('submit', event => {
    event.preventDefault();
    const field = $('#demo-message');
    const value = field.value.trim();
    if (!value) return;
    socialLoop.setPaused();
    const line = document.createElement('p');
    line.className = 'outgoing';
    line.textContent = value;
    messages.append(line);
    field.value = '';
    while (messages.children.length > 7) $('.outgoing', messages).remove();
    messages.scrollTop = messages.scrollHeight;
    animate(line);
  });
  const prices={pro:{monthly:29.9,annual:299},team:{monthly:79.9,annual:799}};
  const money=n=>n.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
  $$('[data-billing]').forEach(b=>b.addEventListener('click',()=>{
    const interval = b.dataset.billing;
    const annual = interval === 'annual';
    $$('[data-billing]').forEach(button => button.setAttribute('aria-pressed', String(button === b)));
    for (const [name, amounts] of Object.entries(prices)) {
      const price = $(`[data-price="${name}"]`);
      price.textContent = money(annual ? amounts.annual / 12 : amounts.monthly);
      price.nextElementSibling.textContent = annual ? '/mês em média' : '/mês';
      animate(price);
      $(`[data-total="${name}"]`).textContent = annual
        ? `Total de R$ ${money(amounts.annual)} por ano.`
        : 'Cobrança mensal.';
      $(`[data-plan="${name}"]`).href = `https://forcaaliada.com/assinatura?checkout=${name}&interval=${interval}`;
    }
    $('#billing-summary').textContent = annual
      ? 'No anual, o Pro custa R$ 299 por ano e o Team custa R$ 799 por ano.'
      : 'No mensal, o Pro custa R$ 29,90 por mês e o Team custa R$ 79,90 por mês.';
  }));

  const photos=$$('[data-gallery]'),dialog=$('#lightbox');let currentPhoto=0, opener;
  function showPhoto(index){currentPhoto=Math.max(0,Math.min(photos.length-1,index));const a=photos[currentPhoto],img=$('img',a);$('#lightbox-image').src=a.href;$('#lightbox-image').alt=img.alt;$('#lightbox-caption').textContent=img.alt;$('#photo-position').textContent=`${currentPhoto+1} de ${photos.length}`;$('#photo-prev').disabled=currentPhoto===0;$('#photo-next').disabled=currentPhoto===photos.length-1;}
  photos.forEach((a,i)=>a.addEventListener('click',e=>{if(!dialog.showModal)return;e.preventDefault();opener=a;showPhoto(i);dialog.showModal();}));
  $('#photo-prev').addEventListener('click',()=>showPhoto(currentPhoto-1));$('#photo-next').addEventListener('click',()=>showPhoto(currentPhoto+1));
  dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));
  dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close();}});
  dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();showPhoto(currentPhoto-1);}if(e.key==='ArrowRight'){e.preventDefault();showPhoto(currentPhoto+1);}});
}
