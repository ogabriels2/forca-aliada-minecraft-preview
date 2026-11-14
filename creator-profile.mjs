import {createCreationsClient} from './creations-client.mjs?v=profiles-20261113';
import {imagePixels,drawSkinFront} from './skin-viewer.mjs';
import {overlay} from './skin-pixels.mjs?v=microsoft-20261113';
import {CATEGORIES} from './skin-parts.mjs?v=wardrobe-20261113';

const labels={servers:'Servidores',skins:'Skins',parts:'Roupas'};
export function createCreatorProfile({api,main,esc,icon,paintIcons,card,refreshStatuses}){
  const creations=createCreationsClient();
  let generation=0,section=null,servers=[];
  const active=()=>Boolean(section?.isConnected);
  function refreshServers(){
    const grid=section?.querySelector('[data-profile-servers]');
    if(!grid)return;
    const focused=document.activeElement;
    const focusedCard=focused?.closest('[data-profile-servers] .server-card');
    const focusId=focusedCard?.dataset.id,action=focused?.dataset.action;
    grid.innerHTML=servers.map(card).join('');
    paintIcons(grid);
    if(focusId){
      const card=[...grid.querySelectorAll('.server-card')].find(row=>row.dataset.id===focusId);
      const target=[...(card?.querySelectorAll('button[data-action]')||[])].find(button=>button.dataset.action===action)||card?.querySelector('.card-heading a');
      target?.focus({preventScroll:true});
    }
  }
  async function render(name){
    const request=++generation,collections=new Map();
    let type='servers',loading=false;
    section=document.createElement('section');
    section.className='container creator-profile';
    section.innerHTML='<p role="status">Carregando perfil…</p>';
    main.replaceChildren(section);
    const root=section,isCurrent=()=>root.isConnected&&request===generation;
    try{
      const profile=await api.profile(name);
      if(!isCurrent())return;
      const initials=(profile.displayName||profile.username).slice(0,1).toLocaleUpperCase('pt-BR');
      root.innerHTML=`<header class="creator-profile-header">
        <span class="creator-profile-avatar"><span aria-hidden="true">${esc(initials)}</span>${profile.avatar?`<img src="${esc(profile.avatar)}" width="96" height="96" alt="">`:''}</span>
        <div><h1>${esc(profile.displayName)}</h1>${profile.displayName!==profile.username?`<p>@${esc(profile.username)}</p>`:''}<span>Criações na Força Aliada</span></div>
        <button class="button secondary" type="button" data-profile-share>${icon('share')} Compartilhar perfil</button>
      </header><p data-profile-feedback role="status"></p>
      ${profile.own?'<p class="creator-profile-own">Este é seu perfil público. <a class="text-link" href="#/minhas-paginas">Minhas páginas</a> · <a class="text-link" href="#/minhas-skins">Minhas skins</a></p>':''}
      <nav class="catalog-views creator-profile-tabs" aria-label="Publicações do criador">${Object.entries(labels).map(([key,label])=>`<button class="chip" type="button" data-profile-tab="${key}" aria-pressed="false">${label} <span>${profile.counts[key]}</span></button>`).join('')}</nav>
      <div data-profile-content></div>`;
      root.querySelector('.creator-profile-avatar img')?.addEventListener('error',event=>event.target.remove(),{once:true});
      const content=root.querySelector('[data-profile-content]');
      type=Object.keys(labels).find(key=>profile.counts[key]>0)||'servers';
      async function drawPreviews(rows){
        for(const item of rows){
          try{
            let pixels=await imagePixels(item.image);
            if(type==='parts'){
              const base=await imagePixels(item.model==='slim'?'./assets/skins/alex.png':'./assets/skins/steve.png');
              pixels=overlay(base,pixels);
            }
            if(!isCurrent())return;
            const canvas=content.querySelector(`canvas[data-profile-preview="${item.id}"]`);
            if(canvas)drawSkinFront(canvas,pixels,item.model);
          }catch{}
        }
      }
      function show(collection){
        if(type!=='servers'||!collection.rows.length)servers=[];
        root.querySelectorAll('[data-profile-tab]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.profileTab===type)));
        if(!collection.rows.length){
          content.innerHTML=`<div class="empty"><h2>${type==='servers'?'Nenhum servidor público.':type==='skins'?'Nenhuma skin pública.':'Nenhuma roupa pública.'}</h2>${profile.own?'<p>Suas publicações aparecerão aqui quando você escolher compartilhá-las no catálogo.</p>':''}</div>`;
          return;
        }
        if(type==='servers'){
          servers=collection.rows.map(row=>({...row,directory:true}));
          for(const server of servers)api.rememberPublic(server);
          content.innerHTML='<div class="creator-servers" data-profile-servers></div>';
          refreshServers();void refreshStatuses();
        }else{
          servers=[];
          content.innerHTML=`<div class="profile-parts-grid">${collection.rows.map(row=>`<article><a class="profile-piece" href="${type==='skins'?'#/skins/'+row.id:'#/skins/editor?part='+row.id}">
            <canvas data-profile-preview="${row.id}" width="96" height="128" role="img" aria-label="Prévia de ${esc(row.name)}"></canvas>
            <strong>${esc(row.name)}</strong><small>${type==='parts'?esc(CATEGORIES[row.category]||'Roupa')+' · ':''}${row.model==='slim'?'Slim':'Clássico'}</small>
            <span>${type==='skins'?'Ver skin':'Experimentar'} ${icon('arrow-right')}</span>
          </a></article>`).join('')}</div>`;
          void drawPreviews(collection.rows);
        }
        if(collection.nextOffset!==null){
          const more=document.createElement('button');more.type='button';more.className='button secondary creator-profile-more';more.dataset.profileMore='';more.textContent='Carregar mais';
          content.append(more);
        }
        paintIcons(content);
      }
      async function load(more=false){
        if(loading)return;
        const selected=type;
        const prior=collections.get(type);
        if(!more&&prior){show(prior);return;}
        if(!profile.counts[type]){show({rows:[],nextOffset:null});return;}
        loading=true;
        content.setAttribute('aria-busy','true');
        if(!more)content.innerHTML='<p role="status">Carregando publicações…</p>';
        const button=content.querySelector('[data-profile-more]');
        if(button){button.disabled=true;button.textContent='Carregando…';}
        try{
          const result=type==='servers'
            ?await api.profileServers(profile.username,more?prior.nextOffset:0)
            :await creations.profile(profile.username,{kind:type==='skins'?'skin':'part',limit:12,offset:more?prior.nextOffset:0});
          if(!isCurrent()||selected!==type)return;
          const collection={rows:more?[...prior.rows,...result.rows]:result.rows,nextOffset:result.nextOffset};
          collections.set(type,collection);
          show(collection);
        }catch(error){
          if(!isCurrent()||selected!==type)return;
          if(more&&prior)show(prior);
          else content.replaceChildren();
          const message=document.createElement('p');message.setAttribute('role','alert');message.textContent=error.message;
          const retry=document.createElement('button');retry.className='text-link';retry.type='button';retry.textContent='Tentar novamente';
          retry.addEventListener('click',()=>{message.remove();retry.remove();void load(more);});
          content.append(message,retry);
        }finally{loading=false;content.removeAttribute('aria-busy');}
      }
      root.addEventListener('click',event=>{
        const tab=event.target.closest('[data-profile-tab]');
        if(tab&&!loading){type=tab.dataset.profileTab;void load();}
        if(event.target.closest('[data-profile-more]'))void load(true);
      });
      root.querySelector('[data-profile-share]').addEventListener('click',async()=>{
        const link=new URL(location.href);link.search='';link.hash='/perfil/'+encodeURIComponent(profile.username);
        const feedback=root.querySelector('[data-profile-feedback]');
        try{await navigator.clipboard.writeText(link.href);if(isCurrent())feedback.textContent='Link do perfil copiado.';}
        catch{
          if(!isCurrent())return;
          feedback.textContent='Copie o link do perfil';
          const input=document.createElement('input');input.readOnly=true;input.value=link.href;input.setAttribute('aria-label','Link do perfil');feedback.append(input);input.focus();input.select();
        }
      });
      await load();
      paintIcons(root);
      document.title=`${profile.displayName} · Criador · Força Aliada`;
    }catch(error){
      if(!isCurrent())return;
      root.innerHTML=`<div class="empty"><h1>Perfil indisponível</h1><p>${esc(error.message)}</p><a class="button secondary" href="#/">Explorar servidores</a></div>`;
    }
  }
  return {render,refreshServers,active,servers:()=>active()?servers:[],dispose(){++generation;section=null;servers=[];}};
}
