const BASE='/api/minecraft/directory';
export class ApiError extends Error {
  constructor(status,payload){super(payload.error||'Não foi possível concluir a operação.');this.status=status;this.code=payload.code;this.fields=payload.fields;}
}
export function createDirectoryClient({fetcher=fetch,origin='',readToken=()=>{try{return localStorage.getItem('fa_token')||'';}catch{return '';}}}={}) {
  // Cross-origin preview APIs are explicitly allowlisted; the production default
  // remains same-origin. Never infer an API destination from URL parameters.
  if(origin&&!['https://forca-aliada-site-staging.onrender.com','https://forca-aliada-minecraft-beta.onrender.com'].includes(origin))throw new Error('Origem da API não permitida.');
  async function request(path,{method='GET',body,headers={},signal,authenticated=true}={}) {
    const token=authenticated?readToken():'';
    const timeout=AbortSignal.timeout(25000);
    let response;
    try{response=await fetcher(origin+path,{method,signal:signal?AbortSignal.any([signal,timeout]):timeout,credentials:origin?'omit':'same-origin',cache:'no-store',headers:{'Accept':'application/json','X-FA-Client':'minecraft-directory',...(token?{Authorization:`Bearer ${token}`}:{...{}}),...(body instanceof FormData?{}:body!==undefined?{'Content-Type':'application/json'}:{}),...headers},...(body!==undefined?{body:body instanceof FormData?body:JSON.stringify(body)}:{})});}
    catch(error){if(signal?.aborted)throw error;throw new ApiError(503,{code:'NETWORK_UNAVAILABLE',error:'Não foi possível conectar ao serviço. Ele pode estar iniciando; tente novamente em alguns instantes.'});}
    let payload;try{payload=await response.json();}catch{throw new ApiError(response.status,{error:'O serviço não respondeu como esperado. Tente novamente.'});}
    if(!response.ok)throw new ApiError(response.status,payload);
    return payload;
  }
  return {
    me:()=>request('/api/me'),
    capabilities:()=>request(`${BASE}/capabilities`),
    login:body=>request('/api/auth/login',{method:'POST',body}),
    accountStatus:()=>request(BASE+'/account/status'),
    exchangeAccount:body=>request(BASE+'/account/exchange',{method:'POST',body,authenticated:body.link}),
    logout:()=>request('/api/auth/logout',{method:'POST'}),
    mediaAccess:path=>request(path+'/access'),
    removeMedia:id=>request(`${BASE}/media/${id}`,{method:'DELETE'}),
    list:(params={},signal)=>request(`${BASE}/servers?${new URLSearchParams(Object.entries(params).filter(([,v])=>v!==''&&v!==undefined))}`,{signal}),
    own:()=>request(`${BASE}/drafts`),
    draft:id=>request(`${BASE}/drafts/${id}`),
    publicPage:id=>request(`${BASE}/servers/${id}`),
    library:()=>request(`${BASE}/library`),
    changeLibrary:body=>request(`${BASE}/library`,{method:'POST',body}),
    create:key=>request(`${BASE}/drafts`,{method:'POST',headers:{'Idempotency-Key':key}}),
    save:(id,revision,body)=>request(`${BASE}/drafts/${id}`,{method:'PATCH',headers:{'If-Match':String(revision)},body}),
    claim:id=>request(`${BASE}/drafts/${id}/claims`,{method:'POST'}),
    verify:(id,claim)=>request(`${BASE}/drafts/${id}/claims/${claim.id}/check`,{method:'POST',body:{token:claim.token}}),
    submit:(id,revision)=>request(`${BASE}/drafts/${id}/submit`,{method:'POST',headers:{'If-Match':String(revision)}}),
    upload:(file,purpose)=>{const form=new FormData();form.append('purpose',purpose);form.append('file',file);return request(`${BASE}/media`,{method:'POST',body:form});},
    moderation:()=>request(`${BASE}/moderation`),
    reviewPage:id=>request(`${BASE}/moderation/${id}`),
    review:(id,action,note,revision)=>request(`${BASE}/moderation/${id}`,{method:'POST',headers:{'If-Match':String(revision)},body:{action,note}}),
  };
}

// All writes pass through one queue. Revision numbers come exclusively from the
// last successful response; failures stop the queue instead of overwriting edits.
export function createDraftWriter({client,onState=()=>{}}) {
  let record=null,tail=Promise.resolve(),blocked=null,dirty=false,pending=0;
  return {
    use(value){if(pending)throw new Error('Aguarde o salvamento antes de trocar de rascunho.');record=value;blocked=null;dirty=false;tail=Promise.resolve();},
    get record(){return record;},get dirty(){return dirty;},
    save(data){
      dirty=true;pending++;const snapshot=structuredClone(data);onState('saving');
      const task=tail.then(async()=>{
        try{if(blocked)throw blocked;record=await client.save(record.id,record.revision,snapshot);return record;}
        catch(error){blocked=error;dirty=true;onState(error.code==='DRAFT_CONFLICT'?'conflict':'error',error);throw error;}
        finally{pending--;if(!pending&&!blocked){dirty=false;onState('saved');}}
      });
      tail=task.catch(()=>{});return task;
    },
    async flush(){await tail;if(blocked)throw blocked;return record;},
  };
}
