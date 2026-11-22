(() => {
 'use strict';
 if(new URLSearchParams(location.search).has('hero'))document.body.classList.add('is-hero');
 const byId=id=>document.getElementById(id);
 document.querySelector('.players-footer')?.setAttribute('role','group');
 document.querySelector('#extensionsUpdateOverview h3')?.setAttribute('aria-level','2');
 const nav=document.createElement('nav');nav.className='demo-mobile-nav';nav.dataset.localDemo='';nav.setAttribute('aria-label','Explorar o Manager');
 for(const [name,id] of [['Visão geral','navServerButton'],['Terminal','navTerminalButton'],['Arquivos','navFileEditorButton'],['Agenda','navScheduleButton']]){
  const original=byId(id)||document.querySelector('.nav-btn[data-tab="'+({navServerButton:'server',navFileEditorButton:'fileeditor',navScheduleButton:'schedule'}[id])+'"]');
  if(!original)continue;
  const b=document.createElement('button');b.type='button';b.textContent=name;b.setAttribute('aria-pressed',String(name==='Visão geral'));
  b.addEventListener('click',()=>{original.click();nav.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});nav.append(b);
 }
 document.querySelector('.app-body').before(nav);
 const dialog=document.createElement('dialog');dialog.className='local-demo-dialog';dialog.dataset.localDemo='';
 dialog.innerHTML='<form><h2 id="local-demo-title"></h2><label id="local-demo-label">Nome<input id="local-demo-value" maxlength="50" required autocomplete="off"></label><p>Esta alteração fica apenas na demonstração.</p><footer><button type="button" data-cancel>Cancelar</button><button type="submit">Salvar</button></footer></form>';
 dialog.setAttribute('aria-labelledby','local-demo-title');document.body.append(dialog);
 let apply,opener;
 function edit(title,label,value,onSave){opener=document.activeElement;apply=onSave;byId('local-demo-title').textContent=title;byId('local-demo-label').firstChild.textContent=label;byId('local-demo-value').value=value;dialog.showModal();byId('local-demo-value').focus();byId('local-demo-value').select();}
 dialog.querySelector('[data-cancel]').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>opener?.focus());
 dialog.querySelector('form').addEventListener('submit',e=>{e.preventDefault();const value=byId('local-demo-value').value.trim();if(!value)return;apply(value);dialog.close();});
 byId('saasOverviewEditServer')?.addEventListener('click',()=>edit('Nome do servidor','Nome',byId('saasOverviewServer').textContent,value=>{byId('saasOverviewServer').textContent=value;byId('saasActiveServerName').textContent=value;}));
 byId('saasOverviewEditMotd')?.addEventListener('click',()=>edit('Descrição do servidor','Descrição',byId('saasOverviewMotd').textContent,value=>byId('saasOverviewMotd').textContent=value));
 // Source export has a notice dialog for desktop-only operations, never a native bridge.
 document.querySelectorAll('a[href^="http"]').forEach(a=>{a.target='_blank';a.rel='noopener';});
})();
