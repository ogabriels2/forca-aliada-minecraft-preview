import {gsap} from 'gsap';
import {campaigns,defaultCampaign} from '../hero-campaigns.js';

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const hero=$('.cinema'),host=$('#world-stage'),motion=$('#motion-toggle'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
let world=null,paused=reduce.matches,visible=true,campaignId=defaultCampaign,shotId='central',loadTask=null,storyIndex=0,exploring=false,readingStory=false;
const arrow='<svg class="icon" aria-hidden="true"><use href="#arrow"/></svg>';
const sceneNames={central:'Cidade central',monumentos:'Praças e monumentos',avenidas:'A outra cidade',ruas:'Pelas ruas'};
const poster=$('.cinema-poster'),mobilePoster=$('#cinema-poster-mobile');
function setPoster(id){poster.src=`media/world/poster-${id}-wide.webp`;mobilePoster.srcset=`media/world/poster-${id}-mobile.webp`;}
const timers=new Set();
function sleep(ms){return new Promise(resolve=>{const id=setTimeout(()=>{timers.delete(id);resolve();},ms);timers.add(id);});}

function campaign(id) {
  campaignId=Object.hasOwn(campaigns,id)?id:defaultCampaign;
  const c=campaigns[campaignId],member=document.body.dataset.persona==='member';
  const title=$('#hero-title');title.replaceChildren(document.createTextNode(c.title[0]),document.createElement('br'));
  const accent=document.createElement('span');accent.textContent=c.title[1];title.append(accent);
  $('#campaign-description').textContent=c.description;
  const memberDestination=campaignId==='manager'?['Abrir console','https://console.forcaaliada.com']:campaignId==='community'?['Abrir Community','https://forcaaliada.com/community']:['Explorar Minecraft','https://forcaaliada.com/minecraft'];
  const primary=$('#hero-primary');primary.href=member?memberDestination[1]:c.primary.href;primary.innerHTML=(member?memberDestination[0]:c.primary.label)+' '+arrow;
  $('#hero-secondary').href=c.secondary.href;$('#hero-secondary').innerHTML=c.secondary.label+' '+arrow;
  if(member&&campaignId==='aliada'){$('#hero-secondary').href='https://forcaaliada.com/community';$('#hero-secondary').innerHTML='Abrir Community '+arrow;}
  $('#closing-primary').href=member?'https://forcaaliada.com/minecraft':'https://forcaaliada.com/signup?next=%2Fminecraft';
  $('#closing-primary').innerHTML=(member?'Abrir a plataforma':'Criar conta grátis')+' '+arrow;
  $('.hero-note').textContent=member?'Conta de demonstração. Explore os produtos ou abra seu console.':c.note;
  $('#campaign-select').value=campaignId;hero.dataset.campaign=campaignId;
}
$('#campaign-select').addEventListener('change',async e=>{
  campaign(e.target.value);
  if(!paused&&!reduce.matches)gsap.fromTo('.cinema-copy',{y:12,opacity:.4},{y:0,opacity:1,duration:.55,ease:'power3.out',overwrite:true});
  await changeView(campaigns[campaignId].scene==='central'?'central':'avenidas');
});
document.addEventListener('home:persona',()=>campaign(campaignId));
campaign(new URLSearchParams(location.search).get('campaign')||defaultCampaign);
shotId=campaigns[campaignId].scene==='central'?'central':'avenidas';
setPoster(shotId);
$$('[data-shot]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.shot===shotId)));

function story(index,animate=true) {
  storyIndex=index;
  $$('[data-story]').forEach((el,i)=>{el.hidden=i!==index;});
  $$('[data-story-step]').forEach((el,i)=>el.setAttribute('aria-pressed',String(i===index)));
  if(animate&&!paused&&!reduce.matches)gsap.fromTo(`[data-story="${index}"]`,{opacity:.3,y:7},{opacity:1,y:0,duration:.35,ease:'power3.out',overwrite:true});
}
const sequence=gsap.timeline({repeat:-1,paused:true});
for(let i=0;i<3;i++) {
  sequence.call(()=>story(i),[],i*7);
  sequence.fromTo(`[data-story-step="${i}"] i`,{scaleX:0},{scaleX:1,duration:6.4,ease:'none',immediateRender:false},i*7);
  sequence.set(`[data-story-step="${i}"] i`,{scaleX:0},(i+1)*7);
}
const signal=gsap.timeline({repeat:-1,paused:true,repeatDelay:3});
signal.fromTo('.mini-wardrobe img',{y:0},{y:-4,stagger:.2,duration:.8,yoyo:true,repeat:1,ease:'sine.inOut'});
$$('[data-story-step]').forEach((button,i)=>button.addEventListener('click',()=>{sequence.seek(i*7,false);story(i,!reduce.matches);if(paused)sequence.pause();}));

function syncMotion() {
  const run=!paused&&visible&&!document.hidden&&!exploring&&!readingStory;
  sequence.paused(!run);signal.paused(!run);
  world?.play(!paused);world?.visible(visible&&!document.hidden&&hero.dataset.sceneState==='ready');
  motion.setAttribute('aria-pressed',String(paused));motion.setAttribute('aria-label',paused?'Reproduzir animações':'Pausar animações');
  motion.querySelector('use').setAttribute('href',paused?'#play':'#pause');
  hero.dataset.motion=paused?'paused':'playing';
}
function setPaused(value){paused=value;syncMotion();}
$('.scene-story').addEventListener('pointerenter',()=>{readingStory=true;syncMotion();});
$('.scene-story').addEventListener('pointerleave',()=>{readingStory=$('.scene-story').contains(document.activeElement);syncMotion();});
$('.scene-story').addEventListener('focusin',()=>{readingStory=true;syncMotion();});
$('.scene-story').addEventListener('focusout',e=>{readingStory=$('.scene-story').contains(e.relatedTarget);syncMotion();});
motion.addEventListener('click',()=>setPaused(!paused));
reduce.addEventListener('change',()=>{setPaused(reduce.matches);if(reduce.matches)gsap.killTweensOf('.cinema-copy');});
document.addEventListener('visibilitychange',syncMotion);
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;syncMotion();},{threshold:.05}).observe(hero);

function sceneState(state,shot) {
  if(state==='ready'){hero.dataset.sceneState='ready';$('#scene-status').textContent=exploring?`${sceneNames[shot.id]} · Cena 3D`:'Cenário do nosso servidor';syncMotion();}
  else if(state==='loading'){$('#scene-status').textContent='Preparando a vista…';}
  else{hero.dataset.sceneState='fallback';$('#scene-status').textContent='Vista do mundo Força Aliada';}
}
async function initWorld() {
  if(loadTask)return loadTask;
  if(navigator.connection?.saveData||!('DecompressionStream' in window)){sceneState('fallback');return null;}
  loadTask=(async()=>{
    try {
      const {createWorld}=await import('./world.js');
      world=await createWorld(host,sceneState);world.play(!paused);world.visible(visible);
      await world.setShot(shotId);return world;
    }catch(error){sceneState('fallback');host.replaceChildren();world?.destroy();world=null;return null;}
  })();return loadTask;
}
let selectionRequest=0;
async function changeView(id) {
  if(!Object.hasOwn(sceneNames,id))return;
  const request=++selectionRequest;shotId=id;setPoster(id);
  $$('[data-shot]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.shot===id)));
  const ready=await initWorld();
  if(request!==selectionRequest)return;
  if(!ready){$('#scene-status').textContent=`${sceneNames[id]} · Vista estática`;return;}
  // Fade through the background, never flash a loading screen over the CTA.
  const canvas=host.querySelector('canvas');
  if(!reduce.matches){gsap.to(canvas,{opacity:.25,duration:.25,ease:'power1.out'});await sleep(250);}
  if(request!==selectionRequest)return;
  try{await ready.setShot(id);}catch(error){sceneState('fallback');$('#scene-status').textContent=`${sceneNames[id]} · Vista estática. O 3D não carregou.`;}
  gsap.to(canvas,{opacity:1,duration:reduce.matches?0:.8,ease:'power2.out',overwrite:true});syncMotion();
}
$$('[data-shot]').forEach(button=>button.addEventListener('click',()=>changeView(button.dataset.shot)));
function explore(value) {
  exploring=value;hero.classList.toggle('is-exploring',value);
  world?.explore(value);
  $('.scene-selector').hidden=!value;
  $('#scene-status').textContent=value?`${sceneNames[shotId]} · ${hero.dataset.sceneState==='ready'?'Cena 3D':'Vista estática'}`:'Cenário do nosso servidor';
  $('.cinema-copy').inert=value;$('.scene-story').inert=value;
  $('#scene-explore').setAttribute('aria-pressed',String(value));$('#scene-explore span').textContent=value?'Voltar à página':'Explorar cenário';syncMotion();
}
$('#scene-explore').addEventListener('click',()=>explore(!exploring));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&exploring){explore(false);$('#scene-explore').focus();}});
syncMotion();
// Navigation is visible and usable before the optional 3D module is loaded.
if('requestIdleCallback' in window)requestIdleCallback(()=>initWorld(),{timeout:1200});else setTimeout(initWorld,350);
window.FAHero={setCampaign:campaign,setView:changeView,pause:()=>setPaused(true),play:()=>setPaused(false),getState:()=>({campaign:campaignId,shot:shotId,paused,visible,exploring,story:storyIndex,scene:hero.dataset.sceneState,...world?.stats()}),seek:seconds=>{sequence.seek(seconds,false);syncMotion();}};

// The skin example is interactive, not another autoplaying scene.
const skinHost=$('#skin-preview');
$$('[data-skin]').forEach(button=>button.addEventListener('click',()=>{
  $('#skin-fallback').src=`media/skin-${button.dataset.skin}.png?v=wardrobe-2`;
  $$('[data-skin]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
}));
const skinObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){skinObserver.disconnect();import('./skin.js').then(m=>m.initSkin(skinHost)).catch(()=>{});}},{rootMargin:'250px'});
skinObserver.observe(skinHost);
