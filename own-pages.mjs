const states={draft:'Rascunho',pending:'Em revisão',published:'Publicada',rejected:'Ajustes solicitados',suspended:'Suspensa'};
const content=value=>JSON.stringify(Object.fromEntries(Object.entries(value||{}).filter(([key])=>!['wizardStep','wizardMaxStep','setupComplete'].includes(key))));

export function ownPagesMarkup(rows,{esc,icon,mediaSource}){
  const active=rows.filter(row=>!row.archivedAt);
  return `<section class="container owned-pages">
    <header class="owned-pages-heading"><div><h1>Minhas páginas</h1><p>Seu servidor, sua apresentação. Continue criando ou cuide do que já publicou.</p></div><button class="button" type="button" data-directory="new">${icon('plus')} Criar página</button></header>
    ${rows.length?`<div class="owned-pages-toolbar"><label class="skin-search">${icon('search')}<span class="sr-only">Buscar minhas páginas</span><input type="search" data-owned-search placeholder="Buscar pelo nome ou endereço"></label>
      <div class="catalog-views" role="group" aria-label="Filtrar minhas páginas">${[['active','Ativas'],['draft','Rascunhos'],['published','Publicadas'],['pending','Em revisão'],['archived','Arquivadas']].map(([key,label])=>`<button class="chip" type="button" data-owned-filter="${key}" aria-pressed="${key==='active'}">${label}</button>`).join('')}</div></div>
      <p data-owned-count role="status">${active.length} ${active.length===1?'página ativa':'páginas ativas'}</p><div class="owned-pages-grid">${rows.map(row=>{
        const d=row.draft,archived=Boolean(row.archivedAt),name=d.name||'Rascunho sem nome';
        const pendingChanges=row.published&&content(d)!==content(row.published)&&row.state!=='pending';
        const target='#/minhas-paginas/'+row.id+(d.setupComplete?'':'?assistente=1');
        return `<article class="owned-page" data-owned-card data-search="${esc(name+' '+(d.address||''))}" data-state="${row.state}" data-archived="${archived}" data-published="${Boolean(row.published)}" ${archived?'hidden':''}>
          <div class="owned-page-cover">${d.cover?`<img ${mediaSource(d.cover,esc)} alt="" width="640" height="240" loading="lazy">`:`<span aria-hidden="true">${icon('world')}</span>`}<span class="owned-page-status" data-status="${archived?'archived':row.state}">${archived?'Arquivada':states[row.state]||'Rascunho'}</span></div>
          <div class="owned-page-body"><h2>${esc(name)}</h2><p class="owned-page-address">${esc(d.address||'Endereço ainda não definido')}</p>
            <p class="owned-page-progress">${archived?'O rascunho está guardado na sua conta.':!d.setupComplete?`Continue na etapa ${(d.wizardStep||0)+1} de 6.`:row.state==='pending'?'A versão enviada está em revisão.':pendingChanges?'Há alterações que ainda não foram publicadas.':row.published?'Disponível para os jogadores.':'Pronta para conferir e publicar.'}</p>
            ${row.reviewNote&&['rejected','suspended'].includes(row.state)?`<p class="owned-page-note"><strong>Orientação da equipe</strong><br>${esc(row.reviewNote)}</p>`:''}
            <div class="owned-page-actions">${archived?`<button type="button" class="button secondary" data-directory="restore-page" data-id="${row.id}" data-revision="${row.revision}">Restaurar rascunho</button>`:`<a class="button" href="${target}">${d.setupComplete?'Editar página':'Continuar criação'} ${icon('arrow-right')}</a>`}
            ${!archived&&row.published?`<a class="text-link" href="#/servidor/${row.id}">Ver publicação ${icon('external-link')}</a><button type="button" class="text-link" data-directory="copy-page" data-id="${row.id}">Copiar link</button>`:''}
            ${row.published?`<a class="text-link" href="#/minhas-paginas/${row.id}/estatisticas">${icon('chart-bar')} Estatísticas</a>`:''}
            ${!archived&&d.setupComplete?`<button class="text-link" type="button" data-directory="publication-page" data-id="${row.id}">${row.state==='pending'?'Acompanhar revisão':row.state==='suspended'?'Ver orientação':row.published?'Gerenciar publicação':'Publicar página'}</button><a class="text-link" href="#/minhas-paginas/${row.id}?assistente=1">Abrir assistente</a>`:''}
            ${!archived&&!row.published&&!['pending','suspended'].includes(row.state)?`<button type="button" class="text-link" data-directory="archive-page" data-id="${row.id}" data-revision="${row.revision}">Arquivar rascunho</button>`:''}
            </div><small>Atualizada em ${esc(new Date(row.updatedAt).toLocaleDateString('pt-BR'))}</small>
          </div></article>`;
      }).join('')}</div><div class="empty" data-owned-empty hidden><h2>Nenhuma página nesta lista.</h2><p>Tente outro nome ou escolha outro filtro.</p></div>`
    :'<div class="empty"><h2>Apresente seu servidor aos jogadores.</h2><p>Comece com nome, endereço e imagens. Cada etapa fica salva na sua conta.</p><button class="button" type="button" data-directory="new">Criar minha primeira página</button></div>'}
  </section>`;
}

export function bindOwnPages(root){
  const search=root.querySelector('[data-owned-search]'),cards=[...root.querySelectorAll('[data-owned-card]')];
  if(!search)return;
  let filter='active';
  const plain=value=>value.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().trim();
  function update(){
    const query=plain(search.value);
    for(const card of cards){
      const archived=card.dataset.archived==='true';
      const matches=filter==='archived'?archived:!archived&&(filter==='active'||filter==='published'&&card.dataset.published==='true'||filter==='draft'&&card.dataset.published!=='true'&&['draft','rejected'].includes(card.dataset.state)||filter===card.dataset.state);
      card.hidden=!matches||!plain(card.dataset.search).includes(query);
    }
    const count=cards.filter(card=>!card.hidden).length;
    root.querySelector('[data-owned-count]').textContent=`${count} ${count===1?'página':'páginas'}`;
    root.querySelector('[data-owned-empty]').hidden=count>0;
    root.querySelectorAll('[data-owned-filter]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.ownedFilter===filter)));
  }
  search.addEventListener('input',update);
  root.addEventListener('click',event=>{
    const button=event.target.closest('[data-owned-filter]');
    if(!button)return;
    filter=button.dataset.ownedFilter;
    update();
  });
}
