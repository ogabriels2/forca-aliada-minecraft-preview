import {createDirectoryClient} from './directory-client.mjs?v=reviews-20261113';
import {minecraftEnvironment} from './minecraft-environment.mjs';

export function createServerReviews({main,esc,icon,paintIcons,getUser,signIn,toast,onSummary}){
  const {origin}=minecraftEnvironment(location);
  const api=createDirectoryClient({origin,readToken:()=>origin?sessionStorage.getItem('fa_directory_beta_token')||'':''});
  let generation=0;
  function render(id){
    const request=++generation,identity=getUser()?.id;
    const section=document.createElement('section');
    section.className='container server-section server-reviews';
    section.id='section-reviews';
    section.innerHTML='<h2>Avaliações dos jogadores</h2><p data-reviews-status role="status">Carregando avaliações…</p><div data-reviews-content></div>';
    main.append(section);
    const status=section.querySelector('[data-reviews-status]'),content=section.querySelector('[data-reviews-content]');
    const active=()=>request===generation&&section.isConnected&&getUser()?.id===identity;
    let current,nextOffset=null,busy=false;
    function error(failure){
      status.textContent=failure.message||'Não foi possível carregar as avaliações.';
      const retry=document.createElement('button');
      retry.className='text-link';retry.type='button';retry.textContent='Atualizar avaliações';
      retry.addEventListener('click',()=>void load());
      status.append(' ',retry);
    }
    function rowsMarkup(rows){
      return rows.map(row=>`<article class="server-review">
        <div><strong>${esc(row.author)}</strong><span aria-label="${row.score} de 5 estrelas">${'★'.repeat(row.score)}<span class="review-stars-empty">${'☆'.repeat(5-row.score)}</span></span></div>
        ${row.comment?`<p>${esc(row.comment)}</p>`:""}
        <small>${esc(new Date(row.createdAt).toLocaleDateString('pt-BR'))}${row.revision>1?' · Editada':''}</small>
        ${['full','owner'].includes(getUser()?.role)&&current.canReview?`<button class="text-link" type="button" data-review-remove="${row.id}">Remover avaliação</button>`:""}
      </article>`).join('');
    }
    async function load(more=false){
      if(busy||!active())return;
      busy=true;
      const form=content.querySelector('[data-review-form]');
      const draft=more&&form?{score:form.querySelector('[name="score"]:checked')?.value,comment:form.elements.comment.value}:null;
      section.setAttribute('aria-busy','true');
      try{
        const result=await api.reviews(id,more?nextOffset:0);
        if(!active())return;
        current=more?{...result,rows:[...current.rows,...result.rows]}:result;
        nextOffset=result.nextOffset;
        onSummary(id,result.summary);
        status.textContent=result.summary.count
          ? `${result.summary.score.toLocaleString('pt-BR')} de 5 · ${result.summary.count} ${result.summary.count===1?'avaliação':'avaliações'}`
          : 'Este servidor ainda não recebeu avaliações.';
        content.innerHTML=`
          ${!getUser()?'<button class="button secondary" type="button" data-review-login>Entrar para avaliar</button>':result.canReview?`<form data-review-form>
            <h3>${result.mine?'Sua avaliação':'Conte como foi jogar'}</h3>
            <fieldset class="review-stars"><legend>Sua nota</legend>${[1,2,3,4,5].map(score=>`<label title="${score} de 5"><input type="radio" name="score" value="${score}" ${result.mine?.score===score?'checked':''} required><span aria-hidden="true">★</span><span class="sr-only">${score} de 5 estrelas</span></label>`).join('')}</fieldset>
            <label class="field"><span>Seu comentário (opcional)</span><textarea name="comment" maxlength="800" rows="3" placeholder="O que você gostou? O que poderia melhorar?">${esc(result.mine?.comment||'')}</textarea></label>
            <p class="field-help">Sua nota e seu comentário ficam públicos com seu nome de usuário. Avalie a sua experiência no servidor.</p>
            <div class="dialog-actions"><button class="button" type="submit">${result.mine?'Atualizar avaliação':'Publicar avaliação'}</button>${result.mine?'<button class="text-link" type="button" data-review-delete>Excluir minha avaliação</button>':''}</div>
          </form>`:'<p>Quem administra o servidor não pode avaliá-lo.</p>'}
          <div class="server-review-list">${rowsMarkup(current.rows)}</div>
          ${nextOffset!==null?'<button type="button" class="button secondary" data-reviews-more>Ver mais avaliações</button>':''}`;
        paintIcons(section);
        if(draft){
          const nextForm=content.querySelector('[data-review-form]');
          if(nextForm){
            nextForm.elements.comment.value=draft.comment;
            for(const input of nextForm.querySelectorAll('[name="score"]'))input.checked=input.value===draft.score;
          }
        }
      }catch(failure){if(active())error(failure);}
      finally{busy=false;section.removeAttribute('aria-busy');}
    }
    async function mutate(operation,message){
      if(busy||!active())return;
      busy=true;
      section.querySelectorAll('button,input,textarea').forEach(control=>control.disabled=true);
      let success=false;
      try{await operation();if(active()){toast(message);success=true;}}
      catch(failure){if(active())error(failure);}
      finally{busy=false;section.querySelectorAll('button,input,textarea').forEach(control=>control.disabled=false);}
      if(success)await load();
    }
    section.addEventListener('submit',event=>{
      if(!event.target.matches('[data-review-form]'))return;
      event.preventDefault();
      const values=new FormData(event.target);
      void mutate(()=>api.saveReview(id,{score:Number(values.get('score')),comment:String(values.get('comment')||'')},current.mine?.revision||0),'Avaliação salva.');
    });
    section.addEventListener('click',event=>{
      if(event.target.closest('[data-review-login]'))signIn();
      if(event.target.closest('[data-reviews-more]'))void load(true);
      if(event.target.closest('[data-review-delete]')&&current.mine&&confirm('Excluir sua avaliação deste servidor?'))
        void mutate(()=>api.removeReview(id,'mine',current.mine.revision),'Avaliação excluída.');
      const remove=event.target.closest('[data-review-remove]');
      const row=current?.rows.find(item=>item.id===remove?.dataset.reviewRemove);
      if(row&&confirm('Remover esta avaliação como moderador?'))
        void mutate(()=>api.removeReview(id,row.id,row.revision),'Avaliação removida.');
    });
    void load();
  }
  return {render,dispose(){++generation;}};
}
