import {gsap} from 'gsap';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const theater=$('.product-theater'), tabs=$$('.product-tabs [role=tab]'), panels=$$('.product-panel');
let active=0, paused=motion.matches, visible=true;
const button=$('#motion-toggle');
const backup=gsap.timeline({paused:true,repeat:-1,repeatDelay:4});
backup.call(()=>{
  $('#operation-title').textContent='Cuidando do seu mundo';
  $('#operation-copy').textContent='Backup automático em andamento';
}).set('.operation-check',{opacity:0,scale:.8}).set('.operation-progress',{scaleX:.08,backgroundColor:'#3262d9'})
  .to('.operation-progress',{scaleX:1,duration:3.1,ease:'power1.inOut'})
  .call(()=>{
    $('#operation-title').textContent='Tudo salvo. Pode jogar.';
    $('#operation-copy').textContent='Seu mundo com uma cópia de segurança';
  }).to('.operation-check',{opacity:1,scale:1,duration:.25,ease:'back.out(1.5)'},'<')
  .to('.operation-progress',{backgroundColor:'#26874b',duration:.25},'<');
function syncMotion(){
  button.hidden=motion.matches||active!==0;
  button.setAttribute('aria-pressed',String(paused));
  button.setAttribute('aria-label',paused?'Reproduzir demonstração':'Pausar demonstração');
  button.querySelector('use').setAttribute('href',paused?'#play':'#pause');
  const run=!paused&&!motion.matches&&visible&&!document.hidden&&active===0;
  backup.paused(!run);
}
button.addEventListener('click',()=>{paused=!paused;syncMotion()});
document.addEventListener('visibilitychange',syncMotion);
motion.addEventListener('change',()=>{
  paused=motion.matches;
  if(motion.matches){
    gsap.killTweensOf(panels);
    panels.forEach((panel,i)=>{panel.hidden=i!==active});
    gsap.set(panels,{clearProps:'opacity,transform'});
    backup.progress(1).pause();
  }
  syncMotion();
});
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;syncMotion()},{threshold:.15}).observe(theater);

// Direction-aware sibling transitions, informed by Cult UI's open source tabs.
// See THIRD-PARTY.md. Translation, semantics and interruption behavior are adapted.
function selectProduct(index){
  if(index===active)return;
  const previous=active,direction=index>previous?1:-1;active=index;
  gsap.killTweensOf(panels);
  panels.forEach((panel,i)=>{
    panel.hidden=i!==index&&i!==previous;
    panel.inert=i!==index;
    panel.setAttribute('aria-hidden',String(i!==index));
    if(i!==index&&i!==previous)gsap.set(panel,{clearProps:'opacity,transform'});
  });
  tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1});
  theater.dataset.product=tabs[index].dataset.product;
  if(motion.matches){panels[previous].hidden=true;gsap.set(panels,{clearProps:'opacity,transform'})}
  else{
    gsap.to(panels[previous],{x:-24*direction,opacity:0,duration:.2,ease:'power2.out',onComplete:()=>{if(active!==previous)panels[previous].hidden=true}});
    gsap.fromTo(panels[index],{x:24*direction,opacity:0},{x:0,opacity:1,duration:.32,ease:'power3.out',clearProps:'transform,opacity'});
    if(index===2)gsap.fromTo('.hero-chat span',{y:8,opacity:0},{y:0,opacity:1,duration:.35,stagger:.12,delay:.15,overwrite:true,clearProps:'transform,opacity'});
  }
  syncMotion();
}
tabs.forEach((tab,i)=>{
  tab.addEventListener('click',()=>selectProduct(i));
  tab.addEventListener('keydown',e=>{
    let next;
    if(e.key==='ArrowRight')next=(i+1)%tabs.length;
    if(e.key==='ArrowLeft')next=(i-1+tabs.length)%tabs.length;
    if(e.key==='Home')next=0;
    if(e.key==='End')next=tabs.length-1;
    if(next!==undefined){e.preventDefault();selectProduct(next);tabs[next].focus()}
  });
});
panels.forEach((panel,i)=>{panel.tabIndex=0;panel.inert=i!==0;panel.setAttribute('aria-hidden',String(i!==0))});
if(motion.matches){backup.progress(1);backup.pause()}
syncMotion();
// Entrance starts with CSS at first paint; never fade the LCP image after JS loads.

let step=0, kind='survival';
const content=$('#creation-content'), initial=content.innerHTML;
const icon=name=>`<svg class="icon" aria-hidden="true"><use href="#${name}"/></svg>`;
const titles=['O que vocês vão criar?','Um endereço para a turma.','Pronto para a próxima partida.'];
const eyebrows=['Dê o primeiro passo','Convide seus amigos','Cuide do mundo que vocês criaram'];
function renderStep(direction){
  $('.creation-number').textContent=step+1;
  $('#creation-title').textContent=titles[step];
  $('#creation-eyebrow').textContent=eyebrows[step];
  $('#creation-step-text').textContent=`${step+1} de 3`;
  $('#demo-back').disabled=step===0;
  $('#demo-next').innerHTML=`${step===2?'Experimentar de novo':'Continuar'} ${icon(step===2?'rotate':'arrow')}`;
  if(step===0){content.innerHTML=initial;content.querySelectorAll('[data-kind]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.kind===kind)))}
  if(step===1)content.innerHTML=`<div class="demo-address">${icon('world')}<span><b>sua-turma.play.forcaaliada.com</b><small>Exemplo de endereço público do Manager</small></span></div><p>${kind==='import'?'O mundo que você já tem, com um novo jeito de receber os amigos.':'Seu novo mundo fica acessível por um endereço fácil de compartilhar.'} Sem abrir portas no roteador.</p>`;
  if(step===2)content.innerHTML=`<div class="demo-ready">${icon('shield')}<span><b>Jogue. A rotina fica organizada.</b><small>Backups, console e arquivos no mesmo lugar.</small></span></div><p>Esta é uma demonstração. Para criar um servidor de verdade, abra o Manager no seu PC Windows.</p>`;
  if(!motion.matches){gsap.fromTo(content,{opacity:.25,x:12*direction},{opacity:1,x:0,duration:.25,ease:'power3.out',overwrite:true,clearProps:'opacity,transform'})}
}
content.addEventListener('click',e=>{
  const choice=e.target.closest('[data-kind]');if(!choice)return;
  kind=choice.dataset.kind;
  content.querySelectorAll('[data-kind]').forEach(b=>b.setAttribute('aria-pressed',String(b===choice)));
});
$('#demo-next').addEventListener('click',()=>{step=(step+1)%3;renderStep(1)});
$('#demo-back').addEventListener('click',()=>{step=Math.max(0,step-1);renderStep(-1)});
$('#creation-title').setAttribute('aria-live','polite');

const skin=$('#skin-preview');
let skinLoading=false;
const skinObserver=new IntersectionObserver(async entries=>{
  if(!entries.some(e=>e.isIntersecting)||skinLoading)return;
  skinLoading=true;skinObserver.disconnect();
  try{const {initSkin}=await import('./skin.js');initSkin(skin)}catch{
    skin.dataset.ready='false';$('#skin-turn').hidden=true;
    $$('[data-skin]').forEach(choice=>choice.addEventListener('click',()=>{
      const name=choice.dataset.skin;
      $('#skin-fallback').src=`media/skin-${name}.png?v=wardrobe-2`;
      $('#skin-fallback').alt=`Personagem de exemplo com visual ${name==='ocean'?'azul':name==='plum'?'roxo':'verde'}`;
      $$('[data-skin]').forEach(item=>item.setAttribute('aria-pressed',String(item===choice)));
    }));
  }
},{rootMargin:'200px'});
skinObserver.observe(skin);

function updateEntry(member){
  for(const id of ['hero-primary','closing-primary']){
    const link=$(`#${id}`);
    link.href=member?'https://forcaaliada.com/minecraft':'https://forcaaliada.com/signup?next=%2Fminecraft';
    link.innerHTML=`${member?'Entrar na plataforma':'Criar conta grátis'} ${icon('arrow')}`;
  }
}
document.addEventListener('home:persona',e=>updateEntry(e.detail.member));
updateEntry(document.body.dataset.persona==='member');
