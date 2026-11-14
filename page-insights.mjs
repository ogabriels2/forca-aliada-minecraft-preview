export function createPageInsights({api,main,esc,icon,paintIcons,getUser,signIn}){
  let generation=0;
  async function render(id){
    const request=++generation,identity=getUser()?.id;
    const section=document.createElement('section');
    section.className='container page-insights';
    section.innerHTML='<a class="text-link" href="#/minhas-paginas">← Minhas páginas</a><h1>Estatísticas da página</h1><p data-insights-status role="status">Carregando…</p><div data-insights-content></div>';
    main.replaceChildren(section);
    const active=()=>section.isConnected&&request===generation&&getUser()?.id===identity;
    const status=section.querySelector('[data-insights-status]'),content=section.querySelector('[data-insights-content]');
    try{
      const data=await api.insights(id);
      if(!active())return;
      section.querySelector('h1').textContent=data.name||'Estatísticas da página';
      status.textContent='Últimos 30 dias · atividade na plataforma';
      const totals=data.days.reduce((sum,day)=>({views:sum.views+day.views,java:sum.java+day.javaCopies,bedrock:sum.bedrock+day.bedrockCopies}),{views:0,java:0,bedrock:0});
      const metric=(label,value,detail='')=>`<article class="insight-metric"><span>${label}</span><strong>${value.toLocaleString('pt-BR')}</strong>${detail?`<small>${detail}</small>`:''}</article>`;
      const largest=Math.max(1,...data.days.map(day=>day.views));
      const date=day=>day.slice(8,10)+'/'+day.slice(5,7);
      content.innerHTML=`<div class="page-controls"><div><p>Veja quantas vezes sua página foi aberta e seu endereço foi copiado.</p></div><button class="button secondary" type="button" data-insights-export>${icon('download')} Baixar CSV</button></div>
        <div class="insight-metrics">${metric('Visitas à página',totals.views)}${metric('Cópias do endereço',totals.java+totals.bedrock,`Java · ${totals.java} &nbsp; Bedrock · ${totals.bedrock}`)}${metric('Favoritos atuais',data.favorites)}${metric('Nota dos jogadores',data.rating.count?data.rating.score:0,data.rating.count?`${data.rating.count} avaliações · de 5 estrelas`:'Sem avaliações ainda')}</div>
        <section class="insight-chart-section"><h2>Visitas por dia</h2>${totals.views?'':'<p>As primeiras visitas aparecerão aqui quando jogadores abrirem sua página.</p>'}
          <div class="insight-chart" role="img" aria-label="${totals.views} visitas nos últimos 30 dias. A tabela abaixo contém os dados de cada dia.">${data.days.map(day=>`<span title="${date(day.day)} · ${day.views} visitas" style="--bar:${day.views/largest*100}%"><i></i></span>`).join('')}</div>
          <div class="insight-chart-dates"><span>${date(data.days[0].day)}</span><span>${date(data.days.at(-1).day)}</span></div>
          <details><summary>Ver dados por dia</summary><div class="insight-table-wrap"><table><thead><tr><th>Data (UTC)</th><th>Visitas</th><th>Cópias Java</th><th>Cópias Bedrock</th></tr></thead><tbody>${[...data.days].reverse().map(day=>`<tr><td>${date(day.day)}</td><td>${day.views}</td><td>${day.javaCopies}</td><td>${day.bedrockCopies}</td></tr>`).join('')}</tbody></table></div></details>
        </section><p class="field-help">Uma visita por página a cada 30 minutos na mesma aba. Acessos do responsável conectado ficam fora da contagem. Copiar um endereço indica interesse em jogar.</p>`;
      if(!data.rating.count)content.querySelector('.insight-metric:last-child strong').textContent='—';
      content.querySelector('[data-insights-export]').addEventListener('click',()=>{
        const csv='Data UTC,Visitas,Copias Java,Copias Bedrock\r\n'+data.days.map(day=>[day.day,day.views,day.javaCopies,day.bedrockCopies].join(',')).join('\r\n');
        const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));
        const link=document.createElement('a');link.href=url;link.download='estatisticas-'+id+'.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      });
      paintIcons(section);
    }catch(error){
      if(!active())return;
      status.textContent=error.status===401?'Entre para ver as estatísticas dos seus servidores.':error.message;
      const button=document.createElement('button');button.className='button secondary';button.type='button';button.textContent=error.status===401?'Entrar na conta':'Tentar novamente';
      button.addEventListener('click',error.status===401?signIn:()=>void render(id));
      content.append(button);
    }
  }
  return {render,dispose(){++generation;}};
}
