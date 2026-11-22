export function setupDemos({toast,animate,motion}) {
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const screens=$$('.manager-screen'),tabs=$$('[data-demo-step]');
  const stage=$('#manager-demo'), frame=$('.manager-frame'), cursor=$('.demo-cursor');
  let step=0, managerLoop;
  $('.demo-tabs').setAttribute('role','tablist');
  tabs.forEach((t,i)=>{t.setAttribute('role','tab');t.id=`manager-tab-${i}`;t.setAttribute('aria-controls',screens[i].id);screens[i].setAttribute('role','tabpanel');screens[i].setAttribute('aria-labelledby',t.id);screens[i].tabIndex=0;});
  function showStep(next,manual=false) {
    step=next;
    screens.forEach((s,i)=>s.hidden=i!==step);
    tabs.forEach((t,i)=>{t.setAttribute('aria-selected',String(i===step));t.tabIndex=i===step?0:-1;});
    $$('[data-native-nav]').forEach(n=>n.classList.toggle('active',Number(n.dataset.nativeNav)===step));
    if(manual)managerLoop?.setPaused();
    animate(screens[step]);
    if(!manual && motion.allowed()) {
      cursor.style.display='block';
      const positions=[['translate(0,0)','translate(110px,-45px)'],['translate(60px,-40px)','translate(170px,-40px)'],['translate(-150px,30px)','translate(30px,30px)'],['translate(10px,0)','translate(80px,-105px)']];
      cursor.getAnimations().forEach(a=>a.cancel());
      cursor.animate([{transform:positions[step][0],opacity:0},{transform:positions[step][1],opacity:1,offset:.55},{transform:positions[step][1],opacity:0}],{duration:2000,easing:'cubic-bezier(.2,.8,.2,1)'}).finished.catch(()=>{}).then(()=>cursor.style.display='none');
      $('.click-ring',cursor).animate([{opacity:0,transform:'scale(.7)'},{opacity:.8,transform:'scale(1.8)'},{opacity:0,transform:'scale(2.4)'}],{duration:650,delay:1000,transformOrigin:'7px 7px'});
    }
  }
  tabs.forEach((t,i)=>{
    t.addEventListener('click',e=>{e.preventDefault();showStep(i,true);});
    t.addEventListener('keydown',e=>{let n=i;if(e.key==='ArrowRight')n=(i+1)%4;else if(e.key==='ArrowLeft')n=(i+3)%4;else if(e.key==='Home')n=0;else if(e.key==='End')n=3;else return;e.preventDefault();showStep(n,true);tabs[n].focus();});
  });
  managerLoop=motion.register('manager',stage,()=>showStep((step+1)%4),5400);
  showStep(0,true);managerLoop.setPaused(false);
  $('#demo-create-next').addEventListener('click',()=>{showStep(1,true);screens[1].focus({preventScroll:true});});
  $('#manager-restart').addEventListener('click',()=>{showStep(0,true);managerLoop.setPaused(false);});
  $$('.edition-options input').forEach(r=>r.addEventListener('change',()=>{
    managerLoop.setPaused();
    const java=r.value==='Java', summary=$('#demo-edition-summary');
    $('.engine-row').hidden=!java;summary.hidden=java;
    summary.textContent=r.value==='Bedrock'
      ?'Instalaremos a versão estável do servidor oficial Bedrock. Não precisa de Java nem de plugins de integração.'
      :'Paper, Geyser e Floodgate serão preparados automaticamente. As duas edições usam as regras do Java. Consoles têm restrições para adicionar servidores.';
    toast(`${r.value} selecionado na demonstração. Nenhum servidor será criado.`);
  }));
  $('.native-copy').addEventListener('click',async()=>{managerLoop.setPaused();try{await navigator.clipboard.writeText('vale-demo.play.forcaaliada.com');toast('Endereço de exemplo copiado. Ele não aceita conexões.');}catch{toast('Endereço de exemplo: vale-demo.play.forcaaliada.com');}});
  let entered=false;
  new IntersectionObserver(es=>{if(entered||!es[0].isIntersecting)return;entered=true;if(!motion.instant())frame.animate([{transform:'rotateY(-5deg) rotateX(3deg) scale(.97)'},{transform:'rotateY(0) rotateX(0) scale(1)'}],{duration:950,easing:'cubic-bezier(.2,.8,.2,1)'});},{threshold:.2}).observe(frame);
  let heroPhase=0;
  motion.register('hero',$('.hero'),()=>{heroPhase=(heroPhase+1)%3;const status=$('[data-hero-status]');status.textContent=['Online','Iniciando…','Online'][heroPhase];animate($('.hero-native .native-state'));},6000);
  const hero=$('.hero-product'), tilt=$('.hero-native');
  if(matchMedia('(hover:hover) and (pointer:fine)').matches) {
    hero.addEventListener('pointermove',e=>{if(!motion.allowed())return;const b=hero.getBoundingClientRect(),x=(e.clientX-b.left)/b.width-.5,y=(e.clientY-b.top)/b.height-.5;tilt.style.transform=`rotateY(${x*6-3}deg) rotateX(${-y*3}deg) rotateZ(1deg)`;});
    hero.addEventListener('pointerleave',()=>{tilt.style.transform='';});
  }

  const query=$('#catalog-query'), filters=$$('[name="category"]'), tiles=$$('.catalog-tile'), cat=$('.catalog-window');
  let catPhase=0;
  const clean=s=>s.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  function filterCatalog(manual=false){
    const term=clean(query.value.trim()), category=filters.find(x=>x.checked)?.value||'Todos';let count=0;
    tiles.forEach(tile=>{const visible=(!term||clean(tile.dataset.name+' '+tile.dataset.category).includes(term))&&(category==='Todos'||tile.dataset.category===category);tile.hidden=!visible;if(visible)count++;});
    $('#catalog-status').textContent=count?'': 'Nenhum exemplo encontrado. Tente Survival, Criativo ou limpe a busca.';
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
  $('#catalog-search').addEventListener('submit',e=>{e.preventDefault();filterCatalog(true);});
  filters.forEach(r=>r.addEventListener('change',()=>filterCatalog(true)));
  $$('.favorite').forEach(b=>b.addEventListener('click',()=>{catalogLoop.setPaused();const saved=b.getAttribute('aria-pressed')!=='true',name=b.closest('.catalog-tile').dataset.name;b.setAttribute('aria-pressed',String(saved));b.setAttribute('aria-label',saved?`Remover ${name} dos favoritos`:`Favoritar ${name}`);b.title=b.getAttribute('aria-label');animate(b);toast(saved?'Adicionado aos favoritos desta demonstração.':'Removido dos favoritos desta demonstração.');}));

  let rotation=-22;
  const figure=$('.voxel-scene .voxel');
  function rotate(amount){rotation+=amount;const scale=matchMedia('(max-width:380px)').matches?.76:matchMedia('(max-width:760px)').matches?.87:1;figure.style.transform=`scale(${scale}) rotateX(-6deg) rotateY(${rotation}deg)`;}
  $('#skin-left').addEventListener('click',()=>rotate(-45));$('#skin-right').addEventListener('click',()=>rotate(45));
  $$('[data-color]').forEach(b=>b.addEventListener('click',()=>{figure.style.setProperty('--coat',b.dataset.color);figure.style.setProperty('--coat-dark',b.dataset.color);$$('[data-color]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));rotate(15);toast(`${b.getAttribute('aria-label')} na demonstração.`);}));

  let phoneTab='feed', socialPhase=0;
  const phone=$('.phone'), phoneTabs=$$('[data-phone-tab]');
  function showPhone(tab,manual=false){phoneTab=tab;$('#phone-feed').hidden=tab!=='feed';$('#phone-chat').hidden=tab!=='chat';phoneTabs.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.phoneTab===tab)));if(manual)socialLoop.setPaused();animate(tab==='feed'?$('#phone-feed'):$('#phone-chat'));}
  const socialLoop=motion.register('community',phone,()=>{socialPhase=(socialPhase+1)%4;if(socialPhase===1){$('.phone-feed-scroll').scrollTo({top:170,behavior:motion.instant()?'instant':'smooth'});}else if(socialPhase===2){showPhone('chat');$('#incoming-message').hidden=true;}else if(socialPhase===3){$('#incoming-message').hidden=false;animate($('#incoming-message'));}else{showPhone('feed');$('.phone-feed-scroll').scrollTop=0;}},5500);
  showPhone('feed');
  phoneTabs.forEach(b=>b.addEventListener('click',()=>{showPhone(b.dataset.phoneTab,true);$('#incoming-message').hidden=false;}));
  $('.phone-feed-scroll').addEventListener('wheel',()=>socialLoop.setPaused(),{passive:true});
  $('.phone-feed-scroll').addEventListener('touchstart',()=>socialLoop.setPaused(),{passive:true});
  $('#post-like').addEventListener('click',e=>{socialLoop.setPaused();const b=e.currentTarget,liked=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(liked));b.setAttribute('aria-label',liked?'Descurtir publicação demonstrativa':'Curtir publicação demonstrativa');animate(b);});
  $('#post-comment').addEventListener('click',()=>{socialLoop.setPaused();const comment=$('#sample-comment');comment.hidden=!comment.hidden;if(!comment.hidden){animate(comment);comment.scrollIntoView({block:'nearest',behavior:motion.instant()?'instant':'smooth'});}$('#post-comment').setAttribute('aria-expanded',String(!comment.hidden));});

  const prices={pro:{monthly:29.9,annual:299},team:{monthly:79.9,annual:799}};
  const money=n=>n.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
  $$('[data-billing]').forEach(b=>b.addEventListener('click',()=>{
    const annual=b.dataset.billing==='annual';$$('[data-billing]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
    for(const [name,p]of Object.entries(prices)){const price=$(`[data-price="${name}"]`);price.textContent=money(annual?p.annual/12:p.monthly);animate(price);$(`[data-total="${name}"]`).textContent=annual?`R$ ${money(p.annual)} cobrados por ano. Equivalente mensal.`:`R$ ${money(p.monthly)} cobrados por mês.`;$(`[data-plan="${name}"]`).href=`https://forcaaliada.com/assinatura?checkout=${name}&interval=${annual?'annual':'monthly'}`;}
    $('#billing-summary').textContent=annual?'Anual: Pro R$ 299; Team R$ 799. Valores mensais exibidos são equivalentes.':'Mensal: Pro R$ 29,90; Team R$ 79,90.';
  }));

  const photos=$$('[data-gallery]'),dialog=$('#lightbox');let currentPhoto=0, opener;
  function showPhoto(index){currentPhoto=Math.max(0,Math.min(photos.length-1,index));const a=photos[currentPhoto],img=$('img',a);$('#lightbox-image').src=a.href;$('#lightbox-image').alt=img.alt;$('#lightbox-caption').textContent=img.alt;$('#photo-position').textContent=`${currentPhoto+1} de ${photos.length}`;$('#photo-prev').disabled=currentPhoto===0;$('#photo-next').disabled=currentPhoto===photos.length-1;}
  photos.forEach((a,i)=>a.addEventListener('click',e=>{if(!dialog.showModal)return;e.preventDefault();opener=a;showPhoto(i);dialog.showModal();}));
  $('#photo-prev').addEventListener('click',()=>showPhoto(currentPhoto-1));$('#photo-next').addEventListener('click',()=>showPhoto(currentPhoto+1));
  dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));
  dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close();}});
  dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();showPhoto(currentPhoto-1);}if(e.key==='ArrowRight'){e.preventDefault();showPhoto(currentPhoto+1);}});
}
